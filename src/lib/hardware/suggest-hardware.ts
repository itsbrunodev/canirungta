import { scoreCpu } from "@/lib/hardware/score-cpu";
import { scoreGpu } from "@/lib/hardware/score-gpu";

import cpuEstimates from "@/data/hardware/cpu-estimates.json";
import gpuEstimates from "@/data/hardware/gpu-estimates.json";

const MAX_SUGGESTIONS = 3;
// Share of the typed name that may differ before a candidate stops being a plausible typo.
const MAX_EDIT_SHARE = 0.34;
const MIN_QUERY_LENGTH = 2;
const MIN_SUBSTRING_LENGTH = 3;

interface Candidate {
	name: string;
	key: string;
	score: number;
}

type Scorer = (name: string) => number | null;

// Built on first use: only an unrecognised name ever needs them.
let cpuCandidates: Candidate[] | null = null;
let gpuCandidates: Candidate[] | null = null;

// Closest recognised CPU names, best first: "did you mean" for the API, autocomplete for the form.
// Empty when nothing is close.
export function suggestCpus(name: string, limit = MAX_SUGGESTIONS): string[] {
	cpuCandidates ??= candidates(
		(cpuEstimates as { name: string }[]).map((record) =>
			cleanCpuName(record.name),
		),
		scoreCpu,
	);
	return closest(name, cpuCandidates, limit);
}

export function suggestGpus(name: string, limit = MAX_SUGGESTIONS): string[] {
	gpuCandidates ??= candidates(
		(gpuEstimates as { chipset: string }[]).map((record) =>
			cleanGpuChipset(record.chipset),
		),
		scoreGpu,
	);
	return closest(name, gpuCandidates, limit);
}

// Only names the scorer accepts, so following a suggestion always yields a verdict.
function candidates(names: string[], score: Scorer): Candidate[] {
	const byKey = new Map<string, Candidate>();
	for (const name of names) {
		const key = compactKey(name);
		const value = key && !byKey.has(key) ? score(name) : null;
		if (value !== null) byKey.set(key, { name, key, score: value });
	}
	return [...byKey.values()];
}

// Dataset names carry retail detail: "Intel Core i5 9400T (OEM/Tray)", "... 3.7 GHz 4-Core LGA1151".
function cleanCpuName(name: string): string {
	return name
		.replace(/\s*\(.*?\)/g, "")
		.replace(/\s+\d+(\.\d+)?\s*GHz.*$/i, "")
		.replace(/^(AMD|Intel)\s+/i, "")
		.trim();
}

// Memory variants ("RTX 3060 12 GB", "RTX 3060 Ti GDDR6X") are one model to the scorer.
function cleanGpuChipset(name: string): string {
	return name
		.replace(/\s+\d+\s*GB\b/i, "")
		.replace(/\s+GDDR\d+X?\b/i, "")
		.trim();
}

// Brand words and punctuation carry no model information and are often left out or mistyped.
function compactKey(name: string): string {
	return name
		.toLowerCase()
		.replace(/\((?:tm|r)\)/g, "")
		.replace(/\b(nvidia|amd|intel|ati|geforce|radeon|core)\b/g, "")
		.replace(/[^a-z0-9]/g, "");
}

function closest(name: string, pool: Candidate[], limit: number): string[] {
	const key = compactKey(name);
	if (key.length < MIN_QUERY_LENGTH) return [];
	const maxEdits = Math.max(1, Math.floor(key.length * MAX_EDIT_SHARE));

	return (
		pool
			.map((candidate) => ({
				...candidate,
				distance: distanceTo(key, candidate.key),
				extra: Math.abs(candidate.key.length - key.length),
			}))
			.filter((match) => match.distance <= maxEdits)
			// Ties go to the faster part, which is usually the newer one.
			.sort(
				(a, b) =>
					a.distance - b.distance || a.extra - b.extra || b.score - a.score,
			)
			.slice(0, limit)
			.map((match) => match.name)
	);
}

// A partial name ("3060") inside a candidate, or a candidate inside a noisy name
// ("Radoen RX 6600 gaming"), ranks as a near-exact match.
function distanceTo(key: string, candidate: string): number {
	const contained =
		candidate.includes(key) ||
		(candidate.length > MIN_SUBSTRING_LENGTH && key.includes(candidate));
	return contained ? 0.5 : editDistance(key, candidate);
}

// Levenshtein distance, two rows at a time.
function editDistance(a: string, b: string): number {
	let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
	for (let i = 1; i <= a.length; i++) {
		const current = [i];
		for (let j = 1; j <= b.length; j++) {
			const substitution = a[i - 1] === b[j - 1] ? 0 : 1;
			current[j] = Math.min(
				(previous[j] ?? 0) + 1,
				(current[j - 1] ?? 0) + 1,
				(previous[j - 1] ?? 0) + substitution,
			);
		}
		previous = current;
	}
	return previous[b.length] ?? 0;
}
