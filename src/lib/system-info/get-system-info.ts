import { getCpuInfo } from "@/lib/system-info/get-cpu-info";
import { getDisplayInfo } from "@/lib/system-info/get-display-info";
import { getGpuInfo } from "@/lib/system-info/get-gpu-info";
import { getMemoryInfo } from "@/lib/system-info/get-memory-info";
import { getOsInfo } from "@/lib/system-info/get-os-info";
import type { SystemInfo } from "@/lib/system-info/types";

// Browser-only: the page's own machine is the only one we can inspect.
// Disk space and exact CPU/RAM/VRAM are not exposed to the web, so those fields are approximations or absent.
export async function getSystemInfo(): Promise<SystemInfo> {
	if (typeof window === "undefined" || typeof navigator === "undefined") {
		throw new Error("getSystemInfo() must run in the browser");
	}

	return {
		collectedAt: new Date().toISOString(),
		os: await getOsInfo(),
		cpu: getCpuInfo(),
		memory: getMemoryInfo(),
		gpu: getGpuInfo(),
		display: getDisplayInfo(),
	};
}
