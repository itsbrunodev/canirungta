import {
	BLEND_SHARPNESS,
	BOTTLENECK_MARGIN,
	MEMORY_BOTTLENECK_FACTOR,
	PLAYABLE_FPS,
	RAM_BELOW_MINIMUM_FACTOR,
	RAM_BELOW_RECOMMENDED_FACTOR,
	SMOOTH_FPS,
	VRAM_FLOOR_FACTOR,
	VRAM_PIXEL_EXPONENT,
	VRAM_SHORTFALL_EXPONENT,
} from "@/constants/gta/performance-model";
import { MEMORY_TOLERANCE } from "@/constants/gta/tolerances";

import { formatGbValue } from "@/lib/gta/format-gb";
import type {
	Bottleneck,
	FpsEstimate,
	FpsRating,
	PerformanceProfile,
	PresetProfile,
} from "@/lib/gta/performance-types";

export interface FpsInputs {
	gpuScore: number;
	// null = unknown: the estimate is then the GPU's ceiling.
	cpuScore: number | null;
	rayTracing: boolean;
	vramGb: number | null;
	ramGb: number | null;
	minRamGb: number | null;
	recommendedRamGb: number | null;
	// Translation-layer cost (Proton); 1 on Windows.
	platformFactor: number;
	// Half-width of the range, as a share of the estimate.
	uncertainty: number;
}

export function estimateFps(
	profile: PerformanceProfile,
	preset: PresetProfile,
	pixelRatio: number,
	inputs: FpsInputs,
): FpsEstimate {
	const base = { presetId: preset.id, label: preset.label };
	if (preset.needsRayTracing && !inputs.rayTracing) {
		return {
			...base,
			fps: null,
			low: null,
			high: null,
			rating: null,
			limitedBy: null,
			note: "Needs a ray-tracing GPU (RTX, RX 6000 or newer)",
		};
	}

	const gpuFps =
		(preset.gpuFps * (inputs.gpuScore / 100)) /
		pixelRatio ** profile.pixelExponent;
	const cpuFps =
		inputs.cpuScore === null
			? null
			: profile.cpuFps *
				preset.cpuFactor *
				cpuGain(inputs.cpuScore / 100, profile.cpuExponent);
	const vram = vramPenalty(preset, pixelRatio, inputs.vramGb);
	const ram = ramPenalty(profile, preset, inputs);

	const uncapped =
		blend(gpuFps, cpuFps) * vram.factor * ram.factor * inputs.platformFactor;
	const cap = profile.fpsCap ?? Number.POSITIVE_INFINITY;
	const capped = uncapped >= cap;
	const fps = Math.min(uncapped, cap);

	return {
		...base,
		fps: roundFps(fps, cap),
		low: roundFps(uncapped * (1 - inputs.uncertainty), cap),
		high: roundFps(uncapped * (1 + inputs.uncertainty), cap),
		rating: rate(fps, capped),
		limitedBy: bottleneck(gpuFps, cpuFps, vram.factor, ram.factor, capped),
		note: vram.note ?? ram.note,
	};
}

// Slower than the anchor loses frames one for one; faster gains taper, since game threads saturate.
function cpuGain(ratio: number, exponent: number): number {
	return ratio < 1 ? ratio : ratio ** exponent;
}

// Smooth minimum of the two limits.
function blend(gpuFps: number, cpuFps: number | null): number {
	if (cpuFps === null) return gpuFps;
	return (
		(gpuFps ** -BLEND_SHARPNESS + cpuFps ** -BLEND_SHARPNESS) **
		(-1 / BLEND_SHARPNESS)
	);
}

interface Penalty {
	factor: number;
	note: string | null;
}

function vramPenalty(
	preset: PresetProfile,
	pixelRatio: number,
	vramGb: number | null,
): Penalty {
	if (vramGb === null) return { factor: 1, note: null };
	const needGb = preset.vramGb * pixelRatio ** VRAM_PIXEL_EXPONENT;
	const share = vramGb / (needGb * MEMORY_TOLERANCE);
	if (share >= 1) return { factor: 1, note: null };
	return {
		factor: Math.max(VRAM_FLOOR_FACTOR, share ** VRAM_SHORTFALL_EXPONENT),
		note: `Wants about ${formatGbValue(Math.ceil(needGb * 2) / 2)} of VRAM`,
	};
}

function ramPenalty(
	profile: PerformanceProfile,
	preset: PresetProfile,
	{ ramGb, minRamGb, recommendedRamGb }: FpsInputs,
): Penalty {
	if (ramGb === null) return { factor: 1, note: null };
	if (minRamGb !== null && ramGb < minRamGb * MEMORY_TOLERANCE) {
		return {
			factor: RAM_BELOW_MINIMUM_FACTOR,
			note: `Below the ${formatGbValue(minRamGb)} RAM minimum, expect heavy stutter`,
		};
	}
	const lowest = profile.presets[0]?.id === preset.id;
	if (
		!lowest &&
		recommendedRamGb !== null &&
		ramGb < recommendedRamGb * MEMORY_TOLERANCE
	) {
		return { factor: RAM_BELOW_RECOMMENDED_FACTOR, note: null };
	}
	return { factor: 1, note: null };
}

function bottleneck(
	gpuFps: number,
	cpuFps: number | null,
	vramFactor: number,
	ramFactor: number,
	capped: boolean,
): Bottleneck | null {
	if (capped) return "engine";
	if (ramFactor < MEMORY_BOTTLENECK_FACTOR) return "ram";
	if (vramFactor < MEMORY_BOTTLENECK_FACTOR) return "vram";
	if (cpuFps === null) return "gpu";
	if (gpuFps < cpuFps * BOTTLENECK_MARGIN) return "gpu";
	if (cpuFps < gpuFps * BOTTLENECK_MARGIN) return "cpu";
	// Evenly matched: neither part is worth singling out.
	return null;
}

// The engine cap is the best the game offers, so reaching it counts as smooth.
function rate(fps: number, capped: boolean): FpsRating {
	if (capped || fps >= SMOOTH_FPS) return "smooth";
	return fps >= PLAYABLE_FPS ? "playable" : "choppy";
}

// Past 100 FPS single frames are noise. The cap itself is exact, so it is never rounded past.
function roundFps(fps: number, cap: number): number {
	if (fps >= cap) return cap;
	const rounded = fps >= 100 ? Math.round(fps / 5) * 5 : Math.round(fps);
	return Math.min(rounded, cap);
}
