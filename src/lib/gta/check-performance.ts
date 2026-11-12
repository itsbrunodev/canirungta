import {
	PROTON_FACTOR,
	RESOLUTIONS,
	UNCERTAINTY,
} from "@/constants/gta/performance-model";
import { PERFORMANCE_PROFILES } from "@/constants/gta/performance-profiles";

import {
	NO_GPU_SUMMARY,
	performanceNotes,
	summarizePerformance,
} from "@/lib/gta/describe-performance";
import { estimateFps, type FpsInputs } from "@/lib/gta/estimate-fps";
import { readPerformanceHardware } from "@/lib/gta/performance-hardware";
import type {
	PerformanceReport,
	ResolutionEstimate,
} from "@/lib/gta/performance-types";
import { pickBestSetting } from "@/lib/gta/pick-setting";
import type { GtaVersion } from "@/lib/gta/types";
import type { MachineSpecs } from "@/lib/machine/types";

// Estimated average FPS per resolution and preset. A model fitted to benchmarks, not a
// measurement: scenes, drivers and background load move real numbers around.
export function checkPerformance(
	version: GtaVersion,
	specs: MachineSpecs,
): PerformanceReport {
	const profile = PERFORMANCE_PROFILES[version.id];
	const hardware = readPerformanceHardware(specs);
	const gpuScore = hardware.gpu?.score ?? profile?.floor?.gpu ?? null;
	if (!profile || gpuScore === null) {
		return {
			status: "unknown",
			basis: profile?.basis ?? "benchmarks",
			summary: NO_GPU_SUMMARY,
			best: null,
			resolutions: [],
			fpsCap: profile?.fpsCap ?? null,
			cpuAssumed: false,
			approximate: false,
			notes: [],
		};
	}

	const cpuScore = hardware.cpu?.score ?? profile.floor?.cpu ?? null;
	const approximate =
		(hardware.gpu?.approximate ?? false) ||
		(hardware.cpu?.approximate ?? false);
	const inputs: FpsInputs = {
		gpuScore,
		cpuScore,
		rayTracing: hardware.gpu?.rayTracing ?? false,
		vramGb: hardware.vramGb,
		ramGb: hardware.ramGb,
		minRamGb: version.minimum.ramGb,
		recommendedRamGb: version.recommended?.ramGb ?? null,
		platformFactor: specs.osFamily === "linux" ? PROTON_FACTOR : 1,
		uncertainty:
			UNCERTAINTY[profile.basis] +
			(approximate ? UNCERTAINTY.approximateHardware : 0),
	};

	const resolutions: ResolutionEstimate[] = RESOLUTIONS.map((resolution) => ({
		id: resolution.id,
		label: resolution.label,
		presets: profile.presets.map((preset) =>
			estimateFps(profile, preset, resolution.pixelRatio, inputs),
		),
	}));
	const best = pickBestSetting(resolutions);
	const cpuAssumed = cpuScore === null;

	return {
		status: "estimated",
		basis: profile.basis,
		summary: summarizePerformance(best, cpuAssumed),
		best,
		resolutions,
		fpsCap: profile.fpsCap,
		cpuAssumed,
		approximate,
		notes: performanceNotes(profile, specs, {
			cpuAssumed,
			approximate,
			floorAssumed: hardware.gpu === null,
		}),
	};
}
