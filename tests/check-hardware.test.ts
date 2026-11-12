import { describe, expect, it } from "vitest";

import { checkCpu, checkGpuModel } from "@/lib/gta/check-hardware";
import type { GtaRequirement } from "@/lib/gta/types";
import { EMPTY_DETAILS, type MachineSpecs } from "@/lib/machine/types";

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
		details: EMPTY_DETAILS,
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
					{
						name: "GeForce RTX 3060",
						vramBytes: null,
						integrated: false,
						driver: null,
					},
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
					{
						name: "Intel Arc Pro B60",
						vramBytes: null,
						integrated: false,
						driver: null,
					},
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
						driver: null,
					},
					{
						name: "Intel Arc Pro B60",
						vramBytes: null,
						integrated: false,
						driver: null,
					},
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

describe("browser-only CPU estimate", () => {
	it("hints at a class from the thread count but stays unknown", () => {
		const row = checkCpu(
			REQ,
			REQ,
			specs({ source: "browser", logicalCores: 12 }),
		);
		expect(row?.status).toBe("unknown");
		expect(row?.note).toContain("12 threads, probably mainstream mid-range");
	});

	it("gives no hint for a probe without a CPU model", () => {
		const row = checkCpu(
			REQ,
			REQ,
			specs({ source: "probe", logicalCores: 12 }),
		);
		expect(row?.note).toBe("Run the system probe to read your CPU model");
	});
});

describe("versions that name no hardware", () => {
	const NONE: GtaRequirement = { ...REQ, cpu: null, gpu: null };

	it("shows the detected CPU and GPU as a neutral pass", () => {
		const detected = specs({
			cpuModel: "AMD Ryzen 5 5600X",
			gpus: [
				{
					name: "GeForce GTX 1650 SUPER",
					vramBytes: null,
					integrated: false,
					driver: "551.23",
				},
			],
		});
		const cpu = checkCpu(NONE, NONE, detected);
		expect(cpu?.status).toBe("pass");
		expect(cpu?.actual).toBe("AMD Ryzen 5 5600X");
		expect(cpu?.required).toBeNull();
		const gpu = checkGpuModel(NONE, NONE, detected);
		expect(gpu?.note).toContain("Driver 551.23");
	});

	it("shows the thread count and class for a browser-only CPU", () => {
		const row = checkCpu(
			NONE,
			NONE,
			specs({ source: "browser", logicalCores: 12 }),
		);
		expect(row?.actual).toBe("12 threads");
		expect(row?.note).toContain("probably mainstream mid-range");
	});

	it("shows nothing when nothing was detected", () => {
		const blank = specs({ logicalCores: null });
		expect(checkCpu(NONE, NONE, blank)).toBeNull();
		expect(checkGpuModel(NONE, NONE, blank)).toBeNull();
	});
});
