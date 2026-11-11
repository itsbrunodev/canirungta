import { MOBILE_FACTOR } from "@/constants/hardware/reference-specs";

// Same scale as score-gpu-nvidia.ts (GTX 1060 = 100).

// RX 5000+ by generation, keyed by the model number's hundreds ("6650" -> 650).
const RX_MODERN: Record<number, Record<number, number>> = {
	5: { 500: 100, 600: 150, 700: 190 },
	6: {
		400: 80,
		500: 95,
		600: 180,
		650: 195,
		700: 240,
		750: 265,
		800: 330,
		900: 400,
	},
	7: { 600: 210, 700: 290, 800: 340, 900: 420 },
	// RX 9060 / 9070 name the class in the third digit.
	// 9070 sits near the 7900 XT tier, not the 7800 XT one (9070 XT = 410 * 1.15).
	9: { 600: 250, 700: 410 },
};
const RX_LATEST_GEN = 9;

// RX 400/500 (Polaris) by the middle digit of "x70".
const POLARIS: Record<number, number> = {
	4: 40,
	5: 50,
	6: 70,
	7: 90,
	8: 100,
	9: 110,
};

const R9_SCORES: Record<number, number> = {
	260: 40,
	270: 50,
	280: 60,
	285: 68,
	290: 90,
	370: 50,
	380: 72,
	390: 100,
};

// Radeon HD: base at the "x8xx" tier per generation, scaled by the hundreds digit.
const HD_BASE: Record<number, number> = {
	2: 10,
	3: 18,
	4: 30,
	5: 42,
	6: 40,
	7: 45,
};
const HD_TIER: Record<number, number> = {
	2: 0.2,
	3: 0.3,
	4: 0.4,
	5: 0.5,
	6: 0.6,
	7: 0.62,
	8: 1,
	9: 1.3,
};

export function scoreAmd(text: string): number | null {
	const rx = /\brx\s*(\d{3,4})\s*(xtx|xt|gre|m|s)?\b/.exec(text);
	if (rx?.[1]) {
		const score = rxScore(rx[1], rx[2]);
		// "RX 6600M" / "RX 6800S" are laptop parts with no "laptop" in the name.
		return score !== null && (rx[2] === "m" || rx[2] === "s")
			? score * MOBILE_FACTOR
			: score;
	}

	const r9 = /\br9\s*(?:fury\b|(\d{3}))\s*(x)?/.exec(text);
	if (r9) {
		if (!r9[1]) return 110;
		const score = R9_SCORES[Number(r9[1])];
		return score === undefined ? null : score * (r9[2] ? 1.08 : 1);
	}

	const vega = /\brx\s*vega\s*(56|64)\b/.exec(text);
	if (vega) return vega[1] === "56" ? 120 : 135;

	const hd = /\bhd\s*(\d)(\d)\d{2}\b/.exec(text);
	if (hd?.[1] && hd[2]) {
		const base = HD_BASE[Number(hd[1])];
		const tier = HD_TIER[Number(hd[2])];
		return base === undefined || tier === undefined ? null : base * tier;
	}
	if (/\bradeon\s*x1[89]\d0/.test(text)) return 12;
	if (/\bradeon\s*x\d{3,4}\b/.test(text)) return 7;
	return null;
}

function rxScore(digits: string, suffix: string | undefined): number | null {
	if (digits.length === 3) {
		const score = POLARIS[Number(digits[1])];
		return score === undefined ? null : score;
	}

	const gen = Math.min(Number(digits[0]), RX_LATEST_GEN);
	const table = RX_MODERN[gen];
	if (!table) return null;
	// 9060 / 9070 carry the class in the third digit; older cards in the second.
	const key =
		gen === 9
			? Number(digits[2]) * 100
			: Number(digits[1]) * 100 + (Number(digits[2]) >= 5 ? 50 : 0);
	const score = table[key] ?? lowerKey(table, key);
	if (score === null) return null;
	if (suffix === "xtx") return score * 1.3;
	if (suffix === "xt") return score * 1.15;
	if (suffix === "gre") return score * 1.05;
	return score;
}

// Unlisted class (e.g. a future 6x50): use the closest listed one below it.
function lowerKey(table: Record<number, number>, key: number): number | null {
	const keys = Object.keys(table)
		.map(Number)
		.filter((k) => k <= key)
		.sort((a, b) => b - a);
	const best = keys[0];
	return best === undefined ? null : (table[best] ?? null);
}
