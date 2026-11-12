import { describe, expect, it } from "vitest";

import { GTA_VERSIONS } from "@/constants/gta/versions";

import { checkGtaVersion } from "@/lib/gta/check-version";
import { diskId } from "@/lib/machine/disk-id";
import {
	applyManualSpecs,
	EMPTY_MANUAL_SPECS,
} from "@/lib/machine/manual-specs";
import { readProbeFromHash } from "@/lib/machine/read-probe-fragment";
import { specsFromProbe } from "@/lib/machine/specs-from-probe";
import type { MachineSpecs } from "@/lib/machine/types";

const GIB = 1024 ** 3;
const ENHANCED = GTA_VERSIONS.find((v) => v.id === "gta-v-enhanced");

function probe(overrides: Record<string, unknown> = {}): MachineSpecs {
	const specs = specsFromProbe({
		schemaVersion: 2,
		os: {
			family: "windows",
			name: "Windows 11",
			version: "10.0.22631",
			arch: "64-bit",
		},
		cpu: { logicalCores: 8, model: "Intel(R) Core(TM) i7-12700K" },
		memory: { totalBytes: 16 * GIB },
		gpus: [{ name: "NVIDIA GeForce RTX 3070", vramBytes: 8 * GIB }],
		disks: [{ freeBytes: 200e9 }],
		...overrides,
	});
	if (!specs) throw new Error("probe rejected");
	return specs;
}

function run(specs: MachineSpecs) {
	if (!ENHANCED) throw new Error("missing version");
	return checkGtaVersion(ENHANCED, specs);
}

function statusOf(specs: MachineSpecs, label: string) {
	return run(specs).checks.find((c) => c.label === label)?.status;
}

describe("specsFromProbe", () => {
	it("rejects unknown schema versions", () => {
		expect(specsFromProbe({ schemaVersion: 99 })).toBeNull();
	});

	it("accepts schema 1 and falls back to the single disk figure", () => {
		const specs = specsFromProbe({
			schemaVersion: 1,
			os: { family: "linux" },
			disk: { freeBytes: 5e10 },
		});
		expect(specs?.disks).toEqual([
			{ freeBytes: 5e10, kind: null, label: null, totalBytes: null },
		]);
	});

	it("treats Windows 11 as major 10 and reads bitness", () => {
		const specs = probe();
		expect(specs.windowsMajor).toBe(10);
		expect(specs.is64Bit).toBe(true);
	});
});

describe("checkGtaVersion", () => {
	it("runs well on a PC that meets the recommended spec", () => {
		expect(run(probe()).verdict).toBe("runs-well");
	});

	it("only runs when above minimum but below recommended", () => {
		const specs = probe({
			memory: { totalBytes: 8 * GIB },
			gpus: [{ name: "NVIDIA GeForce GTX 1650", vramBytes: 4 * GIB }],
			cpu: {
				logicalCores: 4,
				model: "Intel(R) Core(TM) i7-4770 CPU @ 3.40GHz",
			},
		});
		expect(run(specs).verdict).toBe("runs");
	});

	it("counts the minimum as recommended when no tier is published", () => {
		const iv = GTA_VERSIONS.find((v) => v.id === "gta-iv-complete");
		if (!iv) throw new Error("missing version");
		expect(checkGtaVersion(iv, probe()).verdict).toBe("runs-well");
	});

	it("uses the roomiest drive", () => {
		const specs = probe({ disks: [{ freeBytes: 10e9 }, { freeBytes: 200e9 }] });
		expect(statusOf(specs, "Disk")).toBe("pass");
	});

	it("applies no tolerance to disk", () => {
		expect(statusOf(probe({ disks: [{ freeBytes: 100e9 }] }), "Disk")).toBe(
			"fail",
		);
	});

	it("fails 32-bit and pre-10 Windows", () => {
		const old = probe({
			os: { family: "windows", name: "Win 7", version: "6.1", arch: "32-bit" },
		});
		expect(statusOf(old, "OS")).toBe("fail");
		expect(run(old).verdict).toBe("cannot");
	});

	it("counts shared memory for integrated GPUs", () => {
		const specs = probe({
			gpus: [{ name: "Intel UHD", vramBytes: null, integrated: true }],
		});
		expect(statusOf(specs, "VRAM")).toBe("pass");
	});

	it("keeps a small iGPU from beating a discrete card", () => {
		const specs = probe({
			memory: { totalBytes: 8 * GIB },
			gpus: [
				{ name: "iGPU", vramBytes: null, integrated: true },
				{ name: "dGPU", vramBytes: 6 * GIB },
			],
		});
		expect(run(specs).checks.find((c) => c.label === "VRAM")?.actual).toBe(
			"6 GB",
		);
	});

	it("uses unified memory on Apple Silicon", () => {
		const specs = probe({
			os: { family: "darwin", name: "macOS" },
			memory: { totalBytes: 16 * GIB, unified: true },
			gpus: [{ name: "Apple M2" }],
		});
		expect(statusOf(specs, "VRAM")).toBe("pass");
		expect(run(specs).verdict).toBe("needs-windows");
	});

	it("reports a missing figure as unknown, never pass", () => {
		const specs = probe({ gpus: [{ name: "GPU" }] });
		expect(statusOf(specs, "VRAM")).toBe("unknown");
	});

	it("flags mobile devices as unsupported", () => {
		const specs: MachineSpecs = { ...probe(), osFamily: "mobile" };
		expect(run(specs).verdict).toBe("unsupported");
	});
});

describe("readProbeFromHash", () => {
	it("decodes the compact link format", () => {
		const payload = [
			3,
			"l",
			"Ubuntu",
			null,
			null,
			32011,
			0,
			12,
			[["GPU", 4096, 0]],
			[31807],
			null,
		];
		const hash = `#${btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
		const specs = specsFromProbe(readProbeFromHash(hash));
		expect(specs?.osFamily).toBe("linux");
		expect(specs?.ramBytes).toBe(32011 * 1024 * 1024);
		expect(specs?.gpus[0]?.vramBytes).toBe(4096 * 1024 * 1024);
		expect(specs?.disks).toEqual([
			{
				freeBytes: 31807 * 1024 * 1024,
				kind: null,
				label: null,
				totalBytes: null,
			},
		]);
	});

	it("decodes the v4 link with CPU, RAM, disk and GPU detail", () => {
		const payload = [
			4,
			"w",
			"Windows 11 Pro",
			10,
			1,
			16384,
			0,
			16,
			[["GeForce RTX 3070", 8192, 0, "551.23"]],
			[
				[204800, "s"],
				[51200, "h"],
			],
			null,
			"AMD Ryzen 7 5800X",
			8,
			4700,
			3200,
			"DDR4",
		];
		const hash = `#${btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
		const specs = specsFromProbe(readProbeFromHash(hash));
		expect(specs?.details.physicalCores).toBe(8);
		expect(specs?.details.maxClockMhz).toBe(4700);
		expect(specs?.details.ramType).toBe("DDR4");
		expect(specs?.details.ramSpeedMhz).toBe(3200);
		expect(specs?.gpus[0]?.driver).toBe("551.23");
		expect(specs?.disks.map((d) => d.kind)).toEqual(["ssd", "hdd"]);
	});

	it("uses the install drive the visitor picked", () => {
		const specs = probe({
			schemaVersion: 3,
			disks: [
				{ freeBytes: 300e9, kind: "hdd", label: "D:", totalBytes: 1e12 },
				{ freeBytes: 10e9, kind: "ssd", label: "C:", totalBytes: 5e11 },
			],
		});
		const picked = { ...specs, installDiskId: diskId(specs.disks[1]) };
		expect(run(specs).checks.find((c) => c.label === "Disk")?.status).toBe(
			"pass",
		);
		const disk = run(picked).checks.find((c) => c.label === "Disk");
		expect(disk?.status).toBe("fail");
		expect(disk?.note).toContain("C:");
	});

	it("notes an HDD as the roomiest drive", () => {
		const specs = probe({
			schemaVersion: 3,
			disks: [
				{ freeBytes: 300e9, kind: "hdd" },
				{ freeBytes: 200e9, kind: "ssd" },
			],
		});
		const disk = run(specs).checks.find((c) => c.label === "Disk");
		expect(disk?.status).toBe("pass");
		expect(disk?.note).toContain("install on your SSD");
	});

	it("still decodes legacy #system= links", () => {
		const hash = `#system=${btoa(JSON.stringify({ schemaVersion: 2, os: { family: "linux" } }))}`;
		expect(specsFromProbe(readProbeFromHash(hash))?.osFamily).toBe("linux");
	});

	it("returns null for unrelated hashes", () => {
		expect(readProbeFromHash("#about")).toBeNull();
		expect(readProbeFromHash("")).toBeNull();
	});
});

describe("probe link with CPU model", () => {
	// Real output of public/sh on Linux: Ryzen 5 5600X + GTX 1650 SUPER.
	const hash =
		"#WzMsImwiLCJVYnVudHUgMjQuMDQuNSBMVFMiLG51bGwsbnVsbCwzMjAxMSwwLDEyLFtbIk5WSURJQSBDb3Jwb3JhdGlvbiBUVTExNiBbR2VGb3JjZSBHVFggMTY1MCBTVVBFUl0iLDQwOTYsMF1dLFszMjAxNiwzMjAxNl0sbnVsbCwiQU1EIFJ5emVuIDUgNTYwMFggNi1Db3JlIFByb2Nlc3NvciJd";

	it("carries the CPU model through the compact format", () => {
		const specs = specsFromProbe(readProbeFromHash(hash));
		expect(specs?.cpuModel).toBe("AMD Ryzen 5 5600X 6-Core Processor");
	});

	it("still reads links from before the CPU model existed", () => {
		const old = btoa(
			JSON.stringify([3, "w", "Windows 10", 10, 1, 16384, 0, 8, [], [], null]),
		);
		expect(specsFromProbe(readProbeFromHash(`#${old}`))?.cpuModel).toBeNull();
	});

	it("scores the CPU and GPU rows from the link", () => {
		const specs = specsFromProbe(readProbeFromHash(hash));
		if (!specs) throw new Error("probe rejected");
		const rows = run(specs).checks;
		expect(rows.find((c) => c.label === "CPU")?.status).toBe("pass");
		expect(rows.find((c) => c.label === "GPU")?.status).toBe("pass");
	});

	it("reports an unknown CPU when no model was sent", () => {
		expect(statusOf(probe({ cpu: { logicalCores: 8 } }), "CPU")).toBe(
			"unknown",
		);
	});

	it("fails a CPU below the minimum", () => {
		const slow = probe({
			cpu: { logicalCores: 2, model: "Intel(R) Core(TM) 2 Duo CPU E8400" },
		});
		expect(statusOf(slow, "CPU")).toBe("fail");
	});
});

describe("applyManualSpecs", () => {
	const browserOnly = specsFromProbe({
		schemaVersion: 2,
		os: {
			family: "windows",
			name: "Windows",
			version: "10.0.1",
			arch: "64-bit",
		},
		memory: { totalBytes: 8 * GIB },
		gpus: [
			{ name: "Intel(R) UHD Graphics 620", vramBytes: null, integrated: true },
		],
	});

	it("fills gaps and overrides detected values", () => {
		if (!browserOnly) throw new Error("probe rejected");
		const typed = applyManualSpecs(browserOnly, {
			...EMPTY_MANUAL_SPECS,
			cpuModel: "Ryzen 5 3600",
			gpuName: "GeForce RTX 3060",
			vramGb: 12,
			ramGb: 32,
			diskFreeGb: 300,
		});
		expect(typed.cpuModel).toBe("Ryzen 5 3600");
		expect(typed.ramBytes).toBe(32 * GIB);
		expect(typed.gpus[0]).toMatchObject({
			name: "GeForce RTX 3060",
			integrated: false,
		});
		expect(run(typed).verdict).toBe("runs-well");
	});

	it("changes nothing when empty", () => {
		if (!browserOnly) throw new Error("probe rejected");
		expect(applyManualSpecs(browserOnly, EMPTY_MANUAL_SPECS)).toEqual(
			browserOnly,
		);
	});
});
