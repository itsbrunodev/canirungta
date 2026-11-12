import { describe, expect, it } from "vitest";

import { GTA_VERSIONS } from "@/constants/gta/versions";

import { checkGtaVersion } from "@/lib/gta/check-version";
import { specsFromProbe } from "@/lib/machine/specs-from-probe";

const GIB = 1024 ** 3;
const ENHANCED = GTA_VERSIONS.find((v) => v.id === "gta-v-enhanced");

function vramRow(gpu: string, extra: Record<string, unknown> = {}) {
	const specs = specsFromProbe({
		schemaVersion: 2,
		os: { family: "windows", name: "Windows 11", version: "10.0.22631" },
		memory: { totalBytes: 16 * GIB },
		gpus: [{ name: gpu, ...extra }],
	});
	if (!specs || !ENHANCED) throw new Error("setup failed");
	return checkGtaVersion(ENHANCED, specs).checks.find(
		(c) => c.label === "VRAM",
	);
}

describe("VRAM estimated from the GPU name", () => {
	it("passes on a single-size card", () => {
		const row = vramRow("NVIDIA GeForce GTX 1650 SUPER");
		expect(row?.status).toBe("pass");
		expect(row?.note).toContain("Estimated");
	});

	it("keeps a measured figure over the lookup", () => {
		const row = vramRow("NVIDIA GeForce GTX 1650 SUPER", {
			vramBytes: 2 * GIB,
		});
		expect(row?.status).toBe("fail");
		expect(row?.note).toBeNull();
	});

	it("does not guess for laptop parts", () => {
		expect(vramRow("NVIDIA GeForce RTX 3060 Laptop GPU")?.status).toBe(
			"unknown",
		);
	});
});
