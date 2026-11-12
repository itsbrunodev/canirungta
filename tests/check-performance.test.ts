import { describe, expect, it } from "vitest";

import { PERFORMANCE_PROFILES } from "@/constants/gta/performance-profiles";
import { GTA_VERSIONS } from "@/constants/gta/versions";

import { checkPerformance } from "@/lib/gta/check-performance";
import type { ResolutionId } from "@/lib/gta/performance-types";
import { specsFromProbe } from "@/lib/machine/specs-from-probe";
import type { MachineSpecs } from "@/lib/machine/types";

const GIB = 1024 ** 3;

function version(id: string) {
	const found = GTA_VERSIONS.find((v) => v.id === id);
	if (!found) throw new Error(`missing version ${id}`);
	return found;
}

function machine(
	cpu: string,
	gpu: string,
	ramGb: number,
	vramGb: number,
): MachineSpecs {
	const specs = specsFromProbe({
		schemaVersion: 2,
		os: { family: "windows", name: "Windows 11", version: "10.0.22631" },
		cpu: { logicalCores: 8, model: cpu },
		memory: { totalBytes: ramGb * GIB },
		gpus: [{ name: gpu, vramBytes: vramGb * GIB }],
		disks: [{ freeBytes: 500e9 }],
	});
	if (!specs) throw new Error("probe rejected");
	return specs;
}

function fpsAt(
	id: string,
	specs: MachineSpecs,
	resolution: ResolutionId,
	preset: string,
) {
	const report = checkPerformance(version(id), specs);
	const found = report.resolutions
		.find((r) => r.id === resolution)
		?.presets.find((p) => p.presetId === preset);
	if (!found) throw new Error(`no ${resolution} ${preset}`);
	return found;
}

const MID = machine("AMD Ryzen 5 3600", "NVIDIA GeForce RTX 3060", 16, 12);
const HIGH_END = machine(
	"Intel(R) Core(TM) i9-14900K",
	"NVIDIA GeForce RTX 4090",
	64,
	24,
);
const ANCHOR = machine("Intel Core i7-4770", "NVIDIA GeForce GTX 1060", 16, 6);

describe("checkPerformance", () => {
	it("has a profile for every version", () => {
		for (const { id } of GTA_VERSIONS) {
			expect(PERFORMANCE_PROFILES[id], id).toBeDefined();
		}
	});

	it("matches known benchmarks for the anchor PC", () => {
		// GTX 1060 + i7-4770, GTA V 1080p Very High: 70 to 85 FPS in published runs.
		const { fps } = fpsAt("gta-v-2015", ANCHOR, "1080p", "high");
		expect(fps).toBeGreaterThanOrEqual(70);
		expect(fps).toBeLessThanOrEqual(85);
	});

	it("puts the recommended GPU near 60 FPS with ray tracing at 1080p", () => {
		const { fps } = fpsAt("gta-v-enhanced", MID, "1080p", "ultra");
		expect(fps).toBeGreaterThanOrEqual(55);
		expect(fps).toBeLessThanOrEqual(70);
	});

	it("drops as resolution and settings rise", () => {
		const report = checkPerformance(version("gta-v-enhanced"), MID);
		const flat = report.resolutions.map((r) =>
			r.presets.map((p) => p.fps ?? 0),
		);
		for (const [index, row] of flat.entries()) {
			expect(row).toEqual([...row].sort((a, b) => b - a));
			const next = flat[index + 1];
			if (next) expect(next[1]).toBeLessThanOrEqual(row[1] ?? 0);
		}
	});

	it("names the slower part as the bottleneck", () => {
		const cpuBound = machine(
			"Intel Core i5-2400",
			"NVIDIA GeForce RTX 4090",
			32,
			24,
		);
		expect(fpsAt("gta-v-2015", cpuBound, "1080p", "high").limitedBy).toBe(
			"cpu",
		);
		const gpuBound = machine(
			"Intel Core i9-14900K",
			"NVIDIA GeForce GTX 1050 Ti",
			32,
			4,
		);
		expect(fpsAt("gta-v-2015", gpuBound, "1080p", "high").limitedBy).toBe(
			"gpu",
		);
	});

	it("penalises a VRAM shortfall and says how much is needed", () => {
		const starved = machine(
			"Intel Core i9-14900K",
			"NVIDIA GeForce RTX 4090",
			64,
			4,
		);
		const full = fpsAt("gta-v-enhanced", HIGH_END, "4k", "ultra");
		const short = fpsAt("gta-v-enhanced", starved, "4k", "ultra");
		expect(short.fps).toBeLessThan((full.fps ?? 0) * 0.6);
		expect(short.limitedBy).toBe("vram");
		expect(short.note).toContain("VRAM");
	});

	it("marks ray tracing unavailable on a GPU without it", () => {
		const preset = fpsAt("gta-v-enhanced", ANCHOR, "1080p", "ultra");
		expect(preset.fps).toBeNull();
		expect(preset.note).toContain("ray-tracing");
	});

	it("never exceeds the engine cap", () => {
		const report = checkPerformance(version("gta-v-2015"), HIGH_END);
		for (const resolution of report.resolutions) {
			for (const preset of resolution.presets) {
				expect(preset.fps).toBeLessThanOrEqual(188);
				expect(preset.high).toBeLessThanOrEqual(188);
			}
		}
		expect(fpsAt("gta-v-2015", HIGH_END, "1080p", "low").limitedBy).toBe(
			"engine",
		);
	});

	it("holds the frame limiter on the 2001-2004 games even with no hardware known", () => {
		const blank = machine("", "", 8, 0);
		blank.cpuModel = null;
		blank.gpus = [];
		const report = checkPerformance(version("gta-sa-original"), blank);
		expect(report.status).toBe("estimated");
		expect(report.best?.estimate.fps).toBe(25);
		expect(report.best?.resolution).toBe("4k");
	});

	it("reports a GPU ceiling when the CPU is unknown", () => {
		const specs = machine("", "NVIDIA GeForce RTX 3060", 16, 12);
		specs.cpuModel = null;
		const report = checkPerformance(version("gta-v-enhanced"), specs);
		expect(report.cpuAssumed).toBe(true);
		expect(report.summary).toContain("Up to");
	});

	it("cannot estimate without a GPU", () => {
		const specs = machine("AMD Ryzen 5 3600", "", 16, 0);
		specs.gpus = [];
		const report = checkPerformance(version("gta-v-enhanced"), specs);
		expect(report.status).toBe("unknown");
		expect(report.best).toBeNull();
	});

	it("picks the highest quality that stays smooth", () => {
		const report = checkPerformance(version("gta-v-enhanced"), HIGH_END);
		expect(report.best?.resolution).toBe("4k");
		expect(report.best?.estimate.presetId).toBe("ultra");
		const weak = checkPerformance(version("gta-v-enhanced"), ANCHOR);
		expect(weak.best?.resolution).toBe("1080p");
	});

	it("widens the range for the unreleased game", () => {
		const vi = fpsAt("gta-vi", MID, "1080p", "low");
		const v = fpsAt("gta-v-enhanced", MID, "1080p", "low");
		const spread = (e: typeof vi) =>
			((e.high ?? 0) - (e.low ?? 0)) / (e.fps ?? 1);
		expect(spread(vi)).toBeGreaterThan(spread(v));
		expect(checkPerformance(version("gta-vi"), MID).basis).toBe("projected");
	});

	it("shares system RAM with a typed-in integrated GPU", () => {
		const laptop = machine(
			"Intel Core i5-1135G7",
			"Intel Iris Xe Graphics",
			16,
			0,
		);
		expect(fpsAt("gta-v-2015", laptop, "720p", "low").limitedBy).not.toBe(
			"vram",
		);
	});
});
