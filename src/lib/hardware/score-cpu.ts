// Approximate relative gaming speed, Core i7-4770 = 100. Only has to order CPUs well enough to
// compare against the ones Rockstar names; unknown families return null ("unknown", not "fail").
import { scoreBudgetIntel } from "@/lib/hardware/score-cpu-budget";

// Core i7 desktop score per generation; i3/i5/i9 scale from it.
const INTEL_GEN: Record<number, number> = {
	1: 55,
	2: 75,
	3: 85,
	4: 100,
	5: 105,
	6: 115,
	7: 125,
	8: 170,
	9: 190,
	10: 210,
	11: 240,
	12: 330,
	13: 420,
	14: 440,
};
const INTEL_LATEST_GEN = 14;
const INTEL_ULTRA = 450;
const INTEL_TIER: Record<string, number> = {
	"3": 0.65,
	"5": 0.85,
	"7": 1,
	"9": 1.15,
};

// Ryzen 7 per generation (first digit of the model number).
const RYZEN_GEN: Record<number, number> = {
	1: 95,
	2: 110,
	3: 150,
	4: 160,
	5: 220,
	6: 230,
	7: 300,
	8: 300,
	9: 360,
};
const RYZEN_LATEST_GEN = 9;
const RYZEN_TIER: Record<string, number> = {
	"3": 0.65,
	"5": 0.85,
	"7": 1,
	"9": 1.2,
};

const FX_BY_LEADING_DIGIT: Record<string, number> = {
	4: 55,
	6: 70,
	8: 90,
	9: 105,
};

export function scoreCpu(name: string): number | null {
	const text = name.toLowerCase().replace(/\((?:tm|r)\)/g, "");
	return (
		scoreIntelCore(text) ??
		scoreRyzen(text) ??
		scoreBudgetIntel(text) ??
		scoreLegacy(text)
	);
}

// U/Y/G-series are low-power laptop chips, far slower than the desktop part of their generation.
export function suffixFactor(suffix: string): number {
	if (suffix.startsWith("x3d")) return 1.25;
	if (/^hx/.test(suffix)) return 1;
	if (/^y/.test(suffix)) return 0.4;
	if (/^(u|g\d)/.test(suffix)) return 0.6;
	if (/^(p|h|t|qm|m)/.test(suffix)) return 0.85;
	if (/^k/.test(suffix)) return 1.05;
	return 1;
}

function scoreIntelCore(text: string): number | null {
	const ultra = /\bcore\s*ultra\s*([3579])\b/.exec(text);
	if (ultra?.[1]) {
		const tier = INTEL_TIER[ultra[1]];
		const low = /\d{3}(u|v)\b/.test(text) ? 0.6 : 1;
		return tier === undefined ? null : INTEL_ULTRA * tier * low;
	}

	const core = /\bi([3579])[- ]?(\d{3,5})([a-z]{0,3}\d?)\b/.exec(text);
	if (!core?.[1] || !core[2]) return null;
	const [, tierKey, digits, suffix = ""] = core;
	const tier = INTEL_TIER[tierKey ?? ""];
	// 1165G7 / 1260P are gen 11 / 12 (4 digits starting with 1); 4770 is gen 4; 12700 is gen 12;
	// 920 is gen 1. No desktop gen-1 part has 4 digits, so a leading "1" means 10th gen or later.
	const gen =
		digits.length === 5 || (digits.length === 4 && digits.startsWith("1"))
			? Number(digits.slice(0, 2))
			: digits.length === 4
				? Number(digits[0])
				: 1;
	const base = INTEL_GEN[Math.min(gen, INTEL_LATEST_GEN)];
	if (tier === undefined || base === undefined) return null;
	return base * tier * suffixFactor(suffix);
}

function scoreRyzen(text: string): number | null {
	const ai = /\bryzen\s*ai\s*[579]\b/.exec(text);
	if (ai) return 320;

	const ryzen =
		/\bryzen\s*(?:threadripper\s*)?([3579])\s*(?:pro\s*)?(\d{4})(x3d|[a-z]{0,2})/.exec(
			text,
		);
	if (!ryzen?.[1] || !ryzen[2]) return null;
	const tier = RYZEN_TIER[ryzen[1]];
	const base = RYZEN_GEN[Math.min(Number(ryzen[2][0]), RYZEN_LATEST_GEN)];
	if (tier === undefined || base === undefined) return null;
	const suffix = ryzen[3] ?? "";
	// G = APU (smaller cache), E = low-power.
	const apu = /^(g|e)/.test(suffix) ? 0.85 : 1;
	return base * tier * apu * suffixFactor(suffix);
}

function scoreLegacy(text: string): number | null {
	const fx = /\bfx-?\s*(\d)\d{3}\b/.exec(text);
	if (fx?.[1]) return FX_BY_LEADING_DIGIT[fx[1]] ?? null;
	if (/\bcore\s*2\s*quad\b/.test(text)) return 40;
	if (/\bcore\s*2\s*duo\b/.test(text)) return 28;
	if (/\bphenom\s*ii\b/.test(text)) return 55;
	if (/\bphenom\b/.test(text)) return 40;
	if (/\bathlon.*\bx2\b/.test(text)) return 20;
	if (/\bathlon.*\bx4\b/.test(text)) return 45;
	return null;
}
