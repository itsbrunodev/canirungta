import { lookupVram, type VramRange } from "@/lib/hardware/lookup-vram";
import type { MachineSpecs } from "@/lib/machine/types";

const GIB = 1024 ** 3;
// Apple GPUs can address roughly two thirds of unified memory (Metal's recommended working set).
const UNIFIED_GPU_SHARE = 0.66;
// Windows and Linux iGPUs cap shared memory at about half of RAM.
const INTEGRATED_GPU_SHARE = 0.5;

export interface UsableGpu {
	name: string | null;
	// Set when the figure comes from the GPU name rather than a measurement.
	estimate?: VramRange;
	// Memory the GPU can use; null when unknown.
	bytes: number | null;
	shared: boolean;
}

// Best GPU, since iGPUs and dGPUs can both be present. Shared-memory GPUs count what they can borrow from RAM.
export function bestGpu(specs: MachineSpecs): UsableGpu | null {
	const usable = specs.gpus.map((gpu): UsableGpu => {
		const shareOfRam = specs.unifiedMemory
			? UNIFIED_GPU_SHARE
			: gpu.integrated
				? INTEGRATED_GPU_SHARE
				: null;
		if (shareOfRam === null || specs.ramBytes === null) {
			const estimate =
				gpu.vramBytes === null && !gpu.integrated && gpu.name
					? lookupVram(gpu.name)
					: null;
			if (estimate) {
				return {
					name: gpu.name,
					bytes: estimate.minGb * GIB,
					estimate,
					shared: false,
				};
			}
			return { name: gpu.name, bytes: gpu.vramBytes, shared: false };
		}
		return {
			name: gpu.name,
			bytes: Math.max(gpu.vramBytes ?? 0, specs.ramBytes * shareOfRam),
			shared: true,
		};
	});
	const known = usable.filter((gpu) => gpu.bytes !== null);
	if (known.length === 0) return usable[0] ?? null;
	return known.reduce((best, gpu) =>
		(gpu.bytes ?? 0) > (best.bytes ?? 0) ? gpu : best,
	);
}
