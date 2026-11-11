import { describe, expect, it } from "vitest";

import { estimateCpuScore } from "@/lib/hardware/estimate-cpu";
import { estimateGpuScore } from "@/lib/hardware/estimate-gpu";
import { scoreGpu } from "@/lib/hardware/score-gpu";

function known(value: number | null | undefined, name: string): number {
	if (value === null || value === undefined)
		throw new Error(`no score: ${name}`);
	return value;
}

describe("estimateGpuScore", () => {
	it("tracks the hand-tuned table for common cards", () => {
		// Spec-based numbers are rough, so compare within a wide band rather than exactly.
		for (const name of [
			"GeForce RTX 4070",
			"GeForce RTX 5080",
			"GeForce RTX 3070 Ti",
			"Radeon RX 7800 XT",
			"Radeon RX 6700 XT",
			"Radeon RX 9070 XT",
			"Radeon RX 5700 XT",
			"GeForce GTX 1060 6GB",
			"GeForce GTX 970",
		]) {
			const ratio =
				known(estimateGpuScore(name)?.score, name) /
				known(scoreGpu(name), name);
			expect(ratio, name).toBeGreaterThan(0.6);
			expect(ratio, name).toBeLessThan(1.6);
		}
	});

	it("applies the NVIDIA shader-count correction from RTX 30 on", () => {
		// Without the factor, RTX 4070 reads about 2x its table score (667 vs 336).
		expect(
			known(estimateGpuScore("GeForce RTX 4070")?.score, "4070"),
		).toBeLessThan(500);
	});

	it("scores laptop variants below the desktop card", () => {
		const laptop = known(
			estimateGpuScore("GeForce RTX 4070 Laptop GPU")?.score,
			"laptop",
		);
		const desktop = known(
			estimateGpuScore("GeForce RTX 4070")?.score,
			"desktop",
		);
		expect(laptop).toBeLessThan(desktop);
	});

	it("returns null for unknown hardware", () => {
		expect(estimateGpuScore("Some Future Vendor X1")).toBeNull();
	});

	it("does not score HBM cards from bus width", () => {
		// Vega's 2048-bit HBM bus once read as 8x the table score.
		expect(estimateGpuScore("Radeon RX Vega 64")).toBeNull();
	});

	it("keeps flagship cards near the table", () => {
		for (const name of ["GeForce RTX 4090", "GeForce RTX 5090"]) {
			const ratio =
				known(estimateGpuScore(name)?.score, name) /
				known(scoreGpu(name), name);
			expect(ratio, name).toBeLessThan(1.8);
		}
	});
});

describe("estimateCpuScore", () => {
	it("matches both dataset spellings and probe strings", () => {
		expect(
			estimateCpuScore("Intel(R) Core(TM) i5-10400F CPU @ 2.90GHz"),
		).not.toBeNull();
		expect(estimateCpuScore("Core i5 10400F")).not.toBeNull();
		expect(
			estimateCpuScore("AMD Ryzen 5 3600 6-Core Processor"),
		).not.toBeNull();
	});

	it("ranks newer clocks and thread counts higher", () => {
		const modern = known(estimateCpuScore("Core i9-14900K"), "i9-14900K");
		const old = known(estimateCpuScore("Core i7-4770"), "i7-4770");
		expect(modern).toBeGreaterThan(old);
	});

	it("uses the per-architecture factor, so newer parts beat older ones at the same clock", () => {
		const zen5 = known(estimateCpuScore("Ryzen 9 9950X3D"), "9950X3D");
		const zen2 = known(estimateCpuScore("Ryzen 5 3600"), "3600");
		expect(zen5).toBeGreaterThan(zen2);
	});

	it("credits the X3D cache bonus", () => {
		const x3d = known(estimateCpuScore("Ryzen 7 7800X3D"), "7800X3D");
		const plain = known(estimateCpuScore("Ryzen 7 7700X"), "7700X");
		expect(x3d).toBeGreaterThan(plain);
	});

	it("returns null for unknown hardware and unlisted architectures", () => {
		expect(estimateCpuScore("Apple M2")).toBeNull();
		expect(estimateCpuScore("Intel Pentium G4560")).toBeNull();
	});
});
