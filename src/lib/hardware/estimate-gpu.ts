import {
	GPU_ARCHITECTURE_FACTORS,
	GPU_SCALING_EXPONENT,
	MAX_GDDR_BUS_BITS,
} from "@/constants/hardware/gpu-architectures";
import {
	GTX_1060_REFERENCE,
	MOBILE_FACTOR,
	MOBILE_PATTERN,
} from "@/constants/hardware/reference-specs";

import { normalizeName } from "@/lib/hardware/normalize-name";

import gpuEstimates from "@/data/hardware/gpu-estimates.json";

export interface GpuEstimateRecord {
	chipset: string;
	shaders: number | null;
	boost_mhz: number | null;
	bus_bits: number | null;
	memory_clock_mhz: number | null;
}

export interface GpuEstimate {
	score: number;
	// "shaders": shader count x clock. "bus": clock x bus width only, lower confidence.
	basis: "shaders" | "bus";
}

// Normalised once: findRecord runs per probed GPU and the dataset has hundreds of rows.
const RECORDS = (gpuEstimates as GpuEstimateRecord[]).map((record) => ({
	record,
	chipset: normalizeName(record.chipset),
}));

// Longest chipset name found in the product name wins, so "RTX 3060 Ti" beats "RTX 3060".
export function estimateGpuScore(name: string): GpuEstimate | null {
	const record = findRecord(normalizeName(name));
	if (!record) return null;
	const estimate = scoreRecord(record);
	if (!estimate) return null;
	return MOBILE_PATTERN.test(name.toLowerCase())
		? { ...estimate, score: estimate.score * MOBILE_FACTOR }
		: estimate;
}

function findRecord(normalized: string): GpuEstimateRecord | null {
	let best: (typeof RECORDS)[number] | null = null;
	for (const entry of RECORDS) {
		if (
			normalized.includes(entry.chipset) &&
			(!best || entry.chipset.length > best.chipset.length)
		) {
			best = entry;
		}
	}
	return best?.record ?? null;
}

function architectureFactor(chipset: string): number {
	return (
		GPU_ARCHITECTURE_FACTORS.find(({ pattern }) => pattern.test(chipset))
			?.factor ?? 1
	);
}

// NVIDIA counts each FP32 lane twice from RTX 30 (Ampere) on, so halve those shader counts.
function shaderCountFactor(chipset: string): number {
	return /\bRTX\s*[3-9]\d{3}\b/i.test(chipset) ? 0.5 : 1;
}

function scoreRecord(record: GpuEstimateRecord): GpuEstimate | null {
	const { boost_mhz: boost, shaders, bus_bits: bus } = record;
	if (boost === null) return null;
	if (shaders !== null) {
		const effective = shaders * shaderCountFactor(record.chipset);
		const ratio =
			(effective * boost) /
			(GTX_1060_REFERENCE.shaders * GTX_1060_REFERENCE.boostMhz);
		return {
			score:
				100 *
				ratio ** GPU_SCALING_EXPONENT *
				architectureFactor(record.chipset),
			basis: "shaders",
		};
	}
	if (bus !== null && bus <= MAX_GDDR_BUS_BITS) {
		return {
			score:
				100 *
				(boost / GTX_1060_REFERENCE.boostMhz) *
				(bus / GTX_1060_REFERENCE.busBits),
			basis: "bus",
		};
	}
	return null;
}
