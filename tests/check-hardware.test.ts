import { describe, expect, it } from "vitest";

import { checkCpu, checkGpuModel } from "@/lib/gta/check-hardware";
import type { GtaRequirement } from "@/lib/gta/types";
import type { MachineSpecs } from "@/lib/machine/types";

const REQ: GtaRequirement = {
	ramGb: 16,
	vramGb: 6,
	diskGb: 150,
	cpu: ["Core i7-4770"],
	gpu: ["GeForce GTX 1060"],
};

function specs(overrides: Partial<MachineSpecs>): MachineSpecs {
	return {
		source: "probe",
		osFamily: "windows",
		osName: "Windows",
		windowsMajor: 10,
		is64Bit: true,
		ramBytes: 16 * 1024 ** 3,
		ramIsCapped: false,
		unifiedMemory: false,
		disks: [],
		logicalCores: 8,
		cpuModel: null,
		gpus: [],
		vulkan: null,
		...overrides,
	};
}

describe("checkGpuModel", () => {
	it("gives a verdict from a recognised card", () => {
		const row = checkGpuModel(
			REQ,
			REQ,
			specs({
				gpus: [
					{ name: "GeForce RTX 3060", vramBytes: null, integrated: false },
				],
			}),
		);
		expect(row?.status).toBe("pass");
		expect(row?.note).toBeNull();
	});

	it("shows an estimated-only card as info, not a verdict", () => {
		const row = checkGpuModel(
			REQ,
			REQ,
			specs({
				gpus: [
					{ name: "Intel Arc Pro B60", vramBytes: null, integrated: false },
				],
			}),
		);
		expect(row?.status).toBe("unknown");
		expect(row?.note).toContain("Estimated from published specs");
	});

	it("does not decide from a recognised iGPU when an estimated dGPU may be faster", () => {
		const row = checkGpuModel(
			REQ,
			REQ,
			specs({
				gpus: [
					{
						name: "Intel(R) UHD Graphics 630",
						vramBytes: null,
						integrated: true,
					},
					{ name: "Intel Arc Pro B60", vramBytes: null, integrated: false },
				],
			}),
		);
		expect(row?.status).toBe("unknown");
	});
});

describe("checkCpu", () => {
	it("gives a verdict from a recognised CPU", () => {
		const row = checkCpu(
			REQ,
			REQ,
			specs({ cpuModel: "Intel(R) Core(TM) i7-4770 CPU @ 3.40GHz" }),
		);
		expect(row?.status).toBe("pass");
	});
});
