import { CPU_MICROARCH_IPC } from "@/constants/hardware/cpu-microarchitectures";
import { I7_4770_REFERENCE } from "@/constants/hardware/reference-specs";

import { normalizeName } from "@/lib/hardware/normalize-name";
import { suffixFactor } from "@/lib/hardware/score-cpu";

import cpuEstimates from "@/data/hardware/cpu-estimates.json";

export interface CpuEstimateRecord {
	name: string;
	microarchitecture: string | null;
	threads: number | null;
	boost_ghz: number | null;
}

const MODEL_TOKEN =
	/\b(i[3579][\s-]\d{4,5}[a-z]{0,3}\d?|ryzen\s*(?:threadripper\s*)?[3579]\s*(?:pro\s*)?\d{4}[a-z0-9]*|core\s*ultra\s*[3579]\s*\d{3}[a-z]*)\b/;

// Model token ("i7-4770", "ryzen53600") -> first dataset record with that model. Built once.
const INDEX = buildIndex(cpuEstimates);

// Clock x per-clock factor x a thread term. Threads past 8 are not counted: games rarely use them.
export function estimateCpuScore(name: string): number | null {
	const key = modelKey(name);
	if (!key) return null;
	const record = INDEX.get(key);
	if (!record || record.boost_ghz === null || record.threads === null) {
		return null;
	}
	const ipc = record.microarchitecture
		? CPU_MICROARCH_IPC[record.microarchitecture]
		: undefined;
	if (ipc === undefined) return null;
	const threadFactor =
		Math.min(record.threads, I7_4770_REFERENCE.threads) /
		I7_4770_REFERENCE.threads;
	return (
		100 *
		(record.boost_ghz / I7_4770_REFERENCE.boostGhz) *
		ipc *
		Math.sqrt(threadFactor) *
		suffixFactor(modelSuffix(record.name))
	);
}

function modelKey(name: string): string | null {
	const match = MODEL_TOKEN.exec(normalizeName(name));
	return match?.[1] ? match[1].replace(/[\s-]/g, "") : null;
}

// Letters after the model number ("k", "u", "x3d"): low-power and cache-heavy parts differ a lot
// from the plain desktop chip at the same clock.
function modelSuffix(name: string): string {
	const match = MODEL_TOKEN.exec(normalizeName(name));
	return /\d{3,5}([a-z][a-z0-9]*)$/.exec(match?.[1] ?? "")?.[1] ?? "";
}

function buildIndex(
	records: CpuEstimateRecord[],
): Map<string, CpuEstimateRecord> {
	const index = new Map<string, CpuEstimateRecord>();
	for (const record of records) {
		const key = modelKey(record.name);
		if (!key || record.boost_ghz === null || record.threads === null) continue;
		if (!index.has(key)) index.set(key, record);
	}
	return index;
}
