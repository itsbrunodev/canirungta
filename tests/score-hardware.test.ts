import { describe, expect, it } from "vitest";

import { GTA_VERSIONS } from "@/constants/gta/versions";

import { cleanGpuName } from "@/lib/hardware/clean-gpu-name";
import { scoreCpu } from "@/lib/hardware/score-cpu";
import { scoreGpu } from "@/lib/hardware/score-gpu";

function cpu(name: string): number {
	const score = scoreCpu(name);
	if (score === null) throw new Error(`unscored CPU: ${name}`);
	return score;
}

function gpu(name: string): number {
	const score = scoreGpu(name);
	if (score === null) throw new Error(`unscored GPU: ${name}`);
	return score;
}

describe("hardware names in the version table", () => {
	it("scores every CPU and GPU Rockstar names", () => {
		for (const version of GTA_VERSIONS) {
			for (const req of [version.minimum, version.recommended]) {
				for (const name of req?.cpu ?? []) cpu(name);
				for (const name of req?.gpu ?? []) gpu(name);
			}
		}
	});
});

describe("scoreGpu", () => {
	it("orders generations and classes sensibly", () => {
		expect(gpu("GeForce GTX 1630")).toBeLessThan(gpu("GeForce GTX 970"));
		expect(gpu("GeForce GTX 970")).toBeLessThan(gpu("GeForce RTX 3060"));
		expect(gpu("GeForce RTX 3060")).toBeLessThan(gpu("GeForce RTX 4070"));
		expect(gpu("Radeon RX 6400")).toBeLessThan(gpu("Radeon RX 6600 XT"));
		expect(gpu("GeForce GTX 760")).toBeLessThan(gpu("Radeon RX 570"));
	});

	it("reads WebGL renderer strings", () => {
		const angle =
			"ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)";
		expect(gpu(angle)).toBe(gpu("GeForce RTX 3060"));
	});

	it("scores unreleased generations like the newest known one", () => {
		expect(gpu("GeForce RTX 6070")).toBe(gpu("GeForce RTX 5070"));
		expect(gpu("Radeon RX 9070 XT")).toBeGreaterThan(gpu("Radeon RX 6600"));
	});

	it("ranks the RX 9070 XT above the 7800 XT and below the RTX 5080", () => {
		expect(gpu("Radeon RX 9070 XT")).toBeGreaterThan(gpu("Radeon RX 7800 XT"));
		expect(gpu("Radeon RX 9070 XT")).toBeLessThan(gpu("GeForce RTX 5080"));
	});

	it("keeps XT/XTX and Ti/SUPER variants above their base cards", () => {
		expect(gpu("Radeon RX 7900 XTX")).toBeGreaterThan(gpu("Radeon RX 7900 XT"));
		expect(gpu("GeForce RTX 4070 Ti")).toBeGreaterThan(gpu("GeForce RTX 4070"));
		expect(gpu("GeForce RTX 4080 SUPER")).toBeGreaterThan(
			gpu("GeForce RTX 4070 Ti"),
		);
	});

	it("rates integrated graphics below a discrete minimum", () => {
		expect(gpu("Intel(R) UHD Graphics 620")).toBeLessThan(
			gpu("GeForce GTX 760"),
		);
	});

	it("returns null for unknown hardware", () => {
		expect(scoreGpu("Some Future Vendor X1")).toBeNull();
		expect(scoreGpu("NVIDIA GeForce RTX 9999")).toBeNull();
	});
});

describe("scoreCpu", () => {
	it("orders generations and classes sensibly", () => {
		expect(cpu("Core 2 Quad Q6600")).toBeLessThan(cpu("Core i7-4770"));
		expect(cpu("Core i7-4770")).toBeLessThan(cpu("Core i5-9600K"));
		expect(cpu("Ryzen 5 3600")).toBeLessThan(cpu("Ryzen 5 5600X"));
		expect(cpu("Core i3-8100")).toBeLessThan(cpu("Core i5-8400"));
		expect(cpu("Ryzen 5 3600")).toBeLessThan(cpu("Ryzen 7 5800X"));
		expect(cpu("Ryzen 7 5800X")).toBeLessThan(cpu("Ryzen 7 7800X3D"));
	});

	it("scores budget Intel parts below the mainstream minimums", () => {
		expect(cpu("Intel Pentium G4560")).toBeLessThan(cpu("Core i7-4770"));
		expect(cpu("Intel Pentium G4560")).toBeGreaterThan(
			cpu("Core 2 Quad Q6600"),
		);
		expect(cpu("Intel Celeron G3900")).toBeLessThan(cpu("Intel Pentium G4560"));
		expect(cpu("Intel Pentium Gold G5400")).toBeGreaterThan(
			cpu("Intel Pentium G4560"),
		);
		expect(cpu("Intel Pentium Silver N5000")).toBeLessThan(
			cpu("Intel Pentium G4560"),
		);
	});

	it("reads vendor strings", () => {
		expect(cpu("Intel(R) Core(TM) i7-4770 CPU @ 3.40GHz")).toBe(
			cpu("Core i7-4770"),
		);
		expect(cpu("AMD Ryzen 5 3600 6-Core Processor")).toBe(cpu("Ryzen 5 3600"));
	});

	it("treats low-power laptop chips as slower than desktop ones", () => {
		expect(cpu("Core i7-1165G7")).toBeLessThan(cpu("Core i7-11700K"));
		expect(cpu("Core i7-8550U")).toBeLessThan(cpu("Core i7-8700K"));
	});

	it("scores unreleased generations like the newest known one", () => {
		expect(cpu("Core i7-16700K")).toBe(cpu("Core i7-14700K"));
	});

	it("returns null for unknown hardware", () => {
		expect(scoreCpu("Apple M2")).toBeNull();
		expect(scoreCpu("Intel Pentium")).not.toBeNull();
	});
});

describe("scoring regressions", () => {
	it("reads 4-digit 12th/13th-gen Intel mobile parts by generation", () => {
		expect(cpu("Intel(R) Core(TM) i7-1260P")).toBeGreaterThan(
			cpu("Intel(R) Core(TM) i7-8700"),
		);
		expect(cpu("Intel(R) Core(TM) i5-1235U")).toBeGreaterThan(
			cpu("Intel(R) Core(TM) i5-4590"),
		);
	});

	it("does not penalise HX laptop chips like low-power ones", () => {
		expect(cpu("Intel Core i9-13980HX")).toBeGreaterThan(
			cpu("Intel Core i9-13900H"),
		);
	});

	it("scores Ti Super above Ti and plain cards", () => {
		expect(gpu("GeForce RTX 4070 Ti Super")).toBeGreaterThan(
			gpu("GeForce RTX 4070 Ti"),
		);
		expect(gpu("GeForce RTX 4070 Ti")).toBeGreaterThan(gpu("GeForce RTX 4070"));
	});

	it("applies the laptop factor to AMD M/S suffixes", () => {
		expect(gpu("AMD Radeon RX 6600M")).toBeLessThan(gpu("AMD Radeon RX 6600"));
	});
});

describe("cleanGpuName", () => {
	it("extracts the marketing name from lspci strings", () => {
		expect(
			cleanGpuName("NVIDIA Corporation TU116 [GeForce GTX 1650 SUPER]"),
		).toBe("GeForce GTX 1650 SUPER");
		expect(
			cleanGpuName(
				"Advanced Micro Devices, Inc. [AMD/ATI] Navi 22 [Radeon RX 6700 XT] (rev c1)",
			),
		).toBe("Radeon RX 6700 XT");
	});

	it("leaves other names alone", () => {
		expect(cleanGpuName("NVIDIA GeForce RTX 4070")).toBe(
			"NVIDIA GeForce RTX 4070",
		);
		expect(cleanGpuName(null)).toBeNull();
	});
});
