import type { CpuInfo } from "@/lib/system-info/types";

// Browsers expose only the logical core count: no model, clock speed or architecture.
export function getCpuInfo(): CpuInfo {
	return { logicalCores: navigator.hardwareConcurrency || null };
}
