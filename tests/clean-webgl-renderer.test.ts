import { describe, expect, it } from "vitest";

import { cleanWebglRenderer } from "@/lib/hardware/clean-gpu-name";
import { scoreGpu } from "@/lib/hardware/score-gpu";

describe("cleanWebglRenderer", () => {
	it("keeps only the model from an ANGLE renderer", () => {
		expect(
			cleanWebglRenderer(
				"ANGLE (NVIDIA Corporation, NVIDIA GeForce GTX 1650 SUPER/PCIe/SSE2, OpenGL ES 3.2)",
			),
		).toBe("GeForce GTX 1650 SUPER");
	});

	it("strips hex ids and the Direct3D suffix on Intel", () => {
		expect(
			cleanWebglRenderer(
				"ANGLE (Intel, Intel(R) UHD Graphics 620 (0x00005917) Direct3D11 vs_5_0 ps_5_0, D3D11)",
			),
		).toBe("UHD Graphics 620");
	});

	it("passes non-ANGLE names through", () => {
		expect(cleanWebglRenderer("Apple M1")).toBe("Apple M1");
		expect(cleanWebglRenderer(null)).toBeNull();
	});

	it("still scores the cleaned name", () => {
		const cleaned = cleanWebglRenderer(
			"ANGLE (NVIDIA Corporation, NVIDIA GeForce GTX 1650 SUPER/PCIe/SSE2, OpenGL ES 3.2)",
		);
		expect(scoreGpu(cleaned ?? "")).toBe(
			scoreGpu("NVIDIA GeForce GTX 1650 SUPER"),
		);
	});
});

describe("cleanWebglRenderer extra shapes", () => {
	it("reads the chip from a Metal renderer", () => {
		expect(
			cleanWebglRenderer(
				"ANGLE (Apple, ANGLE Metal Renderer: Apple M2 Pro, Unspecified Version)",
			),
		).toBe("Apple M2 Pro");
	});

	it("drops Mesa driver details inside the model field", () => {
		expect(
			cleanWebglRenderer(
				"ANGLE (AMD, AMD Radeon RX 6700 XT (radeonsi, navi22, LLVM 15.0.7, DRM 3.49), OpenGL 4.6)",
			),
		).toBe("Radeon RX 6700 XT");
	});

	it("cleans raw Firefox strings", () => {
		expect(cleanWebglRenderer("Mesa Intel(R) UHD Graphics 620 (CFL GT2)")).toBe(
			"UHD Graphics 620",
		);
		expect(cleanWebglRenderer("NVIDIA GeForce RTX 3060/PCIe/SSE2")).toBe(
			"GeForce RTX 3060",
		);
	});
});
