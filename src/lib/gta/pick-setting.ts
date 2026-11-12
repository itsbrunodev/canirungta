import { RESOLUTIONS } from "@/constants/gta/performance-model";

import type {
	BestSetting,
	FpsEstimate,
	FpsRating,
	ResolutionEstimate,
	ResolutionId,
} from "@/lib/gta/performance-types";

// Best preset at one resolution: the highest quality that is smooth, else the highest that is
// playable, else the fastest one. Presets arrive lowest quality first.
export function pickPreset(presets: FpsEstimate[]): FpsEstimate | null {
	const usable = presets.filter((preset) => preset.fps !== null);
	return (
		usable.findLast((preset) => preset.rating === "smooth") ??
		usable.findLast((preset) => preset.rating === "playable") ??
		usable[0] ??
		null
	);
}

// Resolution is worth more than the lowest preset: 1440p High beats 4K Low.
const SMOOTH_ORDER: ResolutionId[] = ["4k", "1440p", "1080p"];
const FALLBACK_ORDER: ResolutionId[] = ["1080p", "720p"];

export function pickBestSetting(
	resolutions: ResolutionEstimate[],
): BestSetting | null {
	for (const id of SMOOTH_ORDER) {
		const found = find(resolutions, id, "smooth", true);
		if (found) return found;
	}
	for (const rating of ["smooth", "playable"] as const) {
		for (const id of FALLBACK_ORDER) {
			const found = find(resolutions, id, rating, false);
			if (found) return found;
		}
	}
	// Nothing playable: report the fastest setting there is.
	const lowest = resolutions.find((r) => r.id === RESOLUTIONS[0]?.id);
	const estimate = lowest?.presets.find((preset) => preset.fps !== null);
	return lowest && estimate ? setting(lowest, estimate) : null;
}

function find(
	resolutions: ResolutionEstimate[],
	id: ResolutionId,
	rating: FpsRating,
	skipLowest: boolean,
): BestSetting | null {
	const resolution = resolutions.find((r) => r.id === id);
	if (!resolution) return null;
	// A game with one preset has no "lowest" to skip.
	const from = skipLowest && resolution.presets.length > 1 ? 1 : 0;
	const estimate = resolution.presets
		.slice(from)
		.findLast((preset) => preset.rating === rating);
	return estimate ? setting(resolution, estimate) : null;
}

function setting(
	resolution: ResolutionEstimate,
	estimate: FpsEstimate,
): BestSetting {
	return {
		resolution: resolution.id,
		resolutionLabel: resolution.label,
		estimate,
	};
}
