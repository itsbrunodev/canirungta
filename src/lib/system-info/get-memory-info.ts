import type { MemoryInfo, NavigatorExtras } from "@/lib/system-info/types";

// Capped at 8 GB by the spec to limit fingerprinting, so high-RAM machines report 8.
export function getMemoryInfo(): MemoryInfo {
	const deviceMemory = (navigator as Navigator & NavigatorExtras).deviceMemory;
	return { deviceMemoryGb: deviceMemory ?? null };
}
