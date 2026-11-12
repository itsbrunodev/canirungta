import { describe, expect, it } from "vitest";

import { specsFromBrowser } from "@/lib/machine/specs-from-browser";
import type { GpuAdapterInfo, SystemInfo } from "@/lib/system-info/types";

function webgl(
	renderer: string,
	powerPreference: GpuAdapterInfo["powerPreference"] = "default",
): GpuAdapterInfo {
	return {
		source: "webgl",
		vendor: null,
		renderer,
		architecture: null,
		powerPreference,
	};
}

function info(overrides: {
	os?: Partial<SystemInfo["os"]>;
	adapters?: GpuAdapterInfo[];
}): SystemInfo {
	return {
		collectedAt: "2026-01-01T00:00:00.000Z",
		os: {
			platform: "Windows",
			platformVersion: "15.0.0",
			architecture: "x86",
			bitness: "64",
			wow64: false,
			mobile: false,
			touchPoints: 0,
			userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
			...overrides.os,
		},
		cpu: { logicalCores: 12 },
		memory: { deviceMemoryGb: 8 },
		gpu: {
			webglVersion: 2,
			vendor: null,
			renderer: null,
			maxTextureSize: 16384,
			adapters: overrides.adapters ?? [],
		},
		display: { width: 1920, height: 1080, devicePixelRatio: 1 },
	};
}

const RTX =
	"ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)";
const UHD =
	"ANGLE (Intel, Intel(R) UHD Graphics 630 (0x00003E92) Direct3D11 vs_5_0 ps_5_0, D3D11)";

describe("specsFromBrowser", () => {
	it("tells Windows 11 from 10 through client hints", () => {
		const specs = specsFromBrowser(info({}));
		expect(specs.osName).toBe("Windows 11");
		expect(specs.windowsMajor).toBe(10);
		expect(specs.is64Bit).toBe(true);

		const win10 = specsFromBrowser(info({ os: { platformVersion: "10.0.0" } }));
		expect(win10.osName).toBe("Windows 10");
	});

	it("treats platformVersion 0.x as an old Windows", () => {
		const specs = specsFromBrowser(info({ os: { platformVersion: "0.3.0" } }));
		expect(specs.windowsMajor).toBe(6);
	});

	it("lists both GPUs of a dual-GPU laptop and marks the iGPU", () => {
		const specs = specsFromBrowser(
			info({
				adapters: [
					webgl(UHD),
					webgl(RTX, "high-performance"),
					webgl(UHD, "low-power"),
				],
			}),
		);
		expect(specs.gpus.map((g) => g.name)).toEqual([
			"UHD Graphics 630",
			"GeForce RTX 3060",
		]);
		expect(specs.gpus.map((g) => g.integrated)).toEqual([true, false]);
	});

	it("flags a software renderer instead of reporting a GPU", () => {
		const specs = specsFromBrowser(
			info({
				adapters: [
					webgl(
						"ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device), SwiftShader driver)",
					),
				],
			}),
		);
		expect(specs.gpus).toEqual([]);
		expect(specs.details.softwareRenderer).toBe(true);
	});

	it("reads Apple Silicon: unified memory and the chip as CPU", () => {
		const specs = specsFromBrowser(
			info({
				os: {
					platform: "macOS",
					architecture: "arm",
					userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
				},
				adapters: [
					webgl(
						"ANGLE (Apple, ANGLE Metal Renderer: Apple M2 Pro, Unspecified Version)",
					),
				],
			}),
		);
		expect(specs.osFamily).toBe("darwin");
		expect(specs.unifiedMemory).toBe(true);
		expect(specs.cpuModel).toBe("Apple M2 Pro");
	});

	it("does not mistake an iPad posing as a Mac for a desktop", () => {
		const specs = specsFromBrowser(
			info({
				os: {
					platform: "MacIntel",
					touchPoints: 5,
					userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
				},
			}),
		);
		expect(specs.osFamily).toBe("mobile");
	});

	it("trusts a deviceMemory above the old 8 GB cap", () => {
		const base = info({});
		const high = specsFromBrowser({
			...base,
			memory: { deviceMemoryGb: 32 },
		});
		expect(high.ramIsCapped).toBe(false);
		const capped = specsFromBrowser({
			...base,
			memory: { deviceMemoryGb: 8 },
		});
		expect(capped.ramIsCapped).toBe(true);
	});
});
