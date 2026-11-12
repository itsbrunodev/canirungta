import { SCORE_TOLERANCE } from "@/constants/gta/tolerances";
import { ESTIMATED_NOTE } from "@/constants/hardware/reference-specs";

import {
	describeCpu,
	describeGpu,
	estimateCpuTier,
	SOFTWARE_RENDERER_NOTE,
} from "@/lib/gta/describe-hardware";
import type { CheckRow, GtaRequirement } from "@/lib/gta/types";
import { estimateCpuScore } from "@/lib/hardware/estimate-cpu";
import { estimateGpuScore } from "@/lib/hardware/estimate-gpu";
import { scoreCpu } from "@/lib/hardware/score-cpu";
import { scoreGpu } from "@/lib/hardware/score-gpu";
import type { GpuSpec, MachineSpecs } from "@/lib/machine/types";

// CPU/GPU rows only exist when the publisher names hardware; otherwise there is nothing to compare.
// `floor` is the minimum tier: a recommended spec can name an older part (GTA IV: 7900 min, 8600
// recommended), but can never demand less than the minimum.
export function checkCpu(
	req: GtaRequirement,
	floor: GtaRequirement,
	specs: MachineSpecs,
): CheckRow | null {
	const needed = atLeast(
		threshold(req.cpu, scoreCpu),
		threshold(floor.cpu, scoreCpu),
	);
	if (needed === null || !req.cpu) return infoCpu(specs);
	const required = req.cpu.join(" or ");

	if (!specs.cpuModel) {
		const tier = specs.source === "browser" ? estimateCpuTier(specs) : null;
		return unknown(
			"CPU",
			required,
			tier
				? `${tier}. Run the system probe to read your CPU model`
				: "Run the system probe to read your CPU model",
		);
	}
	const tabled = scoreCpu(specs.cpuModel);
	if (tabled !== null) {
		return {
			label: "CPU",
			status: tabled >= needed * SCORE_TOLERANCE ? "pass" : "fail",
			actual: specs.cpuModel,
			required,
			note: describeCpu(specs),
		};
	}
	// Spec estimate is too coarse for a verdict yet (it runs well below the table on newer chips), so show it as info only.
	const estimate = estimateCpuScore(specs.cpuModel);
	if (estimate === null) {
		return unknown("CPU", required, "CPU model not recognised", specs.cpuModel);
	}
	return unknown(
		"CPU",
		required,
		`${ESTIMATED_NOTE} (score ~${Math.round(estimate)}), not checked`,
		specs.cpuModel,
	);
}

export function checkGpuModel(
	req: GtaRequirement,
	floor: GtaRequirement,
	specs: MachineSpecs,
): CheckRow | null {
	const needed = atLeast(
		threshold(req.gpu, scoreGpu),
		threshold(floor.gpu, scoreGpu),
	);
	if (needed === null || !req.gpu) return infoGpu(specs);
	const required = req.gpu.join(" or ");

	// Integrated and dedicated GPUs can coexist; the fastest one is what the game would use.
	let best: { name: string; score: number; gpu: GpuSpec } | null = null;
	let bestEstimate: { name: string; score: number } | null = null;
	for (const gpu of specs.gpus) {
		if (!gpu.name) continue;
		const tabled = scoreGpu(gpu.name);
		if (tabled !== null) {
			if (!best || tabled > best.score)
				best = { name: gpu.name, score: tabled, gpu };
			continue;
		}
		const estimate = estimateGpuScore(gpu.name)?.score ?? null;
		if (estimate !== null && (!bestEstimate || estimate > bestEstimate.score)) {
			bestEstimate = { name: gpu.name, score: estimate };
		}
	}
	// An estimated card that beats every recognised one could be the one the game uses, so no verdict from the rest.
	if (best && (!bestEstimate || best.score >= bestEstimate.score)) {
		return {
			label: "GPU",
			status: best.score >= needed * SCORE_TOLERANCE ? "pass" : "fail",
			actual: best.name,
			required,
			note: describeGpu(best.gpu),
		};
	}
	// Spec estimates are shown as info only until they are calibrated against benchmark data.
	if (bestEstimate) {
		return unknown(
			"GPU",
			required,
			`${ESTIMATED_NOTE} (score ~${Math.round(bestEstimate.score)}), not checked`,
			bestEstimate.name,
		);
	}
	const name = specs.gpus[0]?.name ?? null;
	const note = name
		? "GPU model not recognised"
		: specs.details.softwareRenderer
			? SOFTWARE_RENDERER_NOTE
			: "GPU not reported";
	return unknown("GPU", required, note, name);
}

// No scorable hardware published (the 2001-2003 games name only clock speeds): nothing to pass or
// fail, so show what was detected as a neutral pass instead of hiding the row.
function infoCpu(specs: MachineSpecs): CheckRow | null {
	const detail = describeCpu(specs);
	if (specs.cpuModel) {
		return info("CPU", specs.cpuModel, detail);
	}
	if (specs.logicalCores === null) return null;
	const tier = specs.source === "browser" ? estimateCpuTier(specs) : null;
	return info(
		"CPU",
		`${specs.logicalCores} threads`,
		tier?.replace(/^\d+ threads, /, "") ?? null,
	);
}

function infoGpu(specs: MachineSpecs): CheckRow | null {
	const gpu = specs.gpus.find((candidate) => candidate.name);
	if (!gpu?.name) return null;
	return info("GPU", gpu.name, describeGpu(gpu));
}

function info(label: string, actual: string, detail: string | null): CheckRow {
	const note = "No hardware requirement published";
	return {
		label,
		status: "pass",
		actual,
		required: null,
		note: detail ? `${detail}. ${note}` : note,
	};
}

export function atLeast(
	value: number | null,
	floor: number | null,
): number | null {
	if (value === null || floor === null) return value;
	return Math.max(value, floor);
}

// Any listed alternative qualifies, so the weakest one sets the bar.
export function threshold(
	names: string[] | null,
	score: (name: string) => number | null,
): number | null {
	const scores = (names ?? [])
		.map(score)
		.filter((value): value is number => value !== null);
	return scores.length === 0 ? null : Math.min(...scores);
}

function unknown(
	label: string,
	required: string,
	note: string,
	actual: string | null = null,
): CheckRow {
	return { label, status: "unknown", actual, required, note };
}
