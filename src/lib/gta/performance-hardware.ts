import { bestGpu } from "@/lib/gta/usable-gpu";
import { estimateCpuScore } from "@/lib/hardware/estimate-cpu";
import { estimateGpuScore } from "@/lib/hardware/estimate-gpu";
import { isIntegratedGpu } from "@/lib/hardware/gpu-kind";
import { scoreCpu } from "@/lib/hardware/score-cpu";
import { scoreGpu } from "@/lib/hardware/score-gpu";
import { supportsRayTracing } from "@/lib/hardware/supports-ray-tracing";
import type { GpuSpec, MachineSpecs } from "@/lib/machine/types";

const GIB = 1024 ** 3;

interface ScoredPart {
	score: number;
	// From published specs, not the tuned table: wider error bars.
	approximate: boolean;
}

export interface PerformanceHardware {
	gpu: (ScoredPart & { rayTracing: boolean }) | null;
	cpu: ScoredPart | null;
	// Memory of the GPU the game would use; null when unknown.
	vramGb: number | null;
	// null when unknown or when the browser only says "8 GB or more".
	ramGb: number | null;
}

export function readPerformanceHardware(
	specs: MachineSpecs,
): PerformanceHardware {
	const fastest = fastestGpu(specs.gpus);
	// A typed-in or API-supplied iGPU carries no "integrated" flag, so the name decides too.
	const chosen = fastest && {
		...fastest.spec,
		integrated: fastest.spec.integrated || isIntegratedGpu(fastest.spec.name),
	};
	const vramBytes = chosen
		? (bestGpu({ ...specs, gpus: [chosen] })?.bytes ?? null)
		: null;
	return {
		gpu: fastest && {
			score: fastest.score,
			approximate: fastest.approximate,
			rayTracing: supportsRayTracing(fastest.spec.name ?? ""),
		},
		cpu: specs.cpuModel ? scoreCpuModel(specs.cpuModel) : null,
		vramGb: vramBytes === null ? null : vramBytes / GIB,
		ramGb:
			specs.ramBytes === null || specs.ramIsCapped
				? null
				: specs.ramBytes / GIB,
	};
}

// Integrated and dedicated GPUs can coexist; the game runs on the fastest one.
function fastestGpu(gpus: GpuSpec[]): (ScoredPart & { spec: GpuSpec }) | null {
	let best: (ScoredPart & { spec: GpuSpec }) | null = null;
	for (const spec of gpus) {
		if (!spec.name) continue;
		const tabled = scoreGpu(spec.name);
		const score = tabled ?? estimateGpuScore(spec.name)?.score ?? null;
		if (score !== null && (!best || score > best.score)) {
			best = { spec, score, approximate: tabled === null };
		}
	}
	return best;
}

function scoreCpuModel(model: string): ScoredPart | null {
	const tabled = scoreCpu(model);
	if (tabled !== null) return { score: tabled, approximate: false };
	const estimate = estimateCpuScore(model);
	return estimate === null ? null : { score: estimate, approximate: true };
}
