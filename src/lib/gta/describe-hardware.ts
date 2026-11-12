import { CPU_THREAD_TIERS } from "@/constants/hardware/cpu-tiers";

import type { DiskSpec, GpuSpec, MachineSpecs } from "@/lib/machine/types";

// Short context strings for the check rows. None of them affects a verdict.

export function describeCpu(specs: MachineSpecs): string | null {
	const { physicalCores, maxClockMhz } = specs.details;
	const parts: string[] = [];
	if (physicalCores !== null && specs.logicalCores !== null) {
		parts.push(`${physicalCores} cores / ${specs.logicalCores} threads`);
	} else if (specs.logicalCores !== null) {
		parts.push(`${specs.logicalCores} threads`);
	}
	if (maxClockMhz !== null)
		parts.push(`up to ${(maxClockMhz / 1000).toFixed(1)} GHz`);
	return parts.length > 0 ? parts.join(", ") : null;
}

// Browser-only fallback: no model is readable, so guess a class from the thread count.
export function estimateCpuTier(specs: MachineSpecs): string | null {
	const threads = specs.logicalCores;
	if (threads === null || threads < 1) return null;
	const tier = CPU_THREAD_TIERS.find((t) => threads <= t.maxThreads);
	return tier ? `${threads} threads, probably ${tier.label}` : null;
}

export function describeRam(specs: MachineSpecs): string | null {
	const { ramType, ramSpeedMhz } = specs.details;
	const parts = [ramType, ramSpeedMhz === null ? null : `${ramSpeedMhz} MHz`];
	const text = parts.filter(Boolean).join(" ");
	return text || null;
}

export function describeGpu(gpu: GpuSpec | undefined): string | null {
	return gpu?.driver ? `Driver ${gpu.driver}` : null;
}

export const SOFTWARE_RENDERER_NOTE =
	"Browser is using software rendering (hardware acceleration is off), so the GPU is hidden";

// SSD matters for streaming open-world games; say so when the roomiest drive is a hard disk.
export function describeDisk(
	chosen: DiskSpec,
	all: DiskSpec[],
	minBytes: number,
	picked = false,
): string | null {
	const notes: string[] = [];
	if (picked)
		notes.push(
			chosen.label
				? `Install drive ${chosen.label}`
				: "Install drive you picked",
		);
	else if (all.length > 1) notes.push(`Best of ${all.length} drives`);
	if (chosen.kind === "hdd") {
		const ssd = all.find((d) => d.kind === "ssd" && d.freeBytes >= minBytes);
		notes.push(
			ssd
				? picked
					? "This drive is an HDD; an SSD is faster"
					: "Roomiest drive is an HDD; install on your SSD"
				: "HDD: an SSD is strongly recommended",
		);
	} else if (chosen.kind === "ssd") {
		notes.push("SSD");
	}
	return notes.length > 0 ? notes.join(", ") : null;
}
