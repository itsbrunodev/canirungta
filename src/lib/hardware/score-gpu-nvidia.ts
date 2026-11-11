// Approximate relative speed, GTX 1060 = 100. Not benchmark-exact: it only has to order
// hardware well enough to compare against the GPUs Rockstar names.

// Score of the xx60 card per generation (first digits of the model number).
const GEN_BASE: Record<number, number> = {
	4: 18,
	5: 22,
	6: 35,
	7: 40,
	9: 65,
	10: 100,
	16: 120,
	20: 150,
	30: 190,
	40: 240,
	50: 300,
};
const LATEST_GEN = 50;

// Multiplier by the last two digits of the model number.
const CLASS_FACTOR: Record<number, number> = {
	10: 0.25,
	20: 0.3,
	30: 0.45,
	40: 0.55,
	50: 0.65,
	60: 1,
	70: 1.4,
	80: 1.8,
	90: 2.4,
};

// Pre-GTX naming: GeForce 7900, 8600, 9800 GT.
const LEGACY_BASE: Record<number, number> = { 7: 6, 8: 7, 9: 10 };
const LEGACY_CLASS: Record<number, number> = {
	3: 0.4,
	4: 0.5,
	5: 0.7,
	6: 1,
	7: 1.2,
	8: 1.6,
	9: 1.8,
};

export function scoreNvidia(text: string): number | null {
	const modern = /\b(gtx|rtx|gt)\s*(\d{3,4})\s*(ti\s*super|ti|super)?/.exec(
		text,
	);
	const legacy = /\bgeforce\s+(?:gt[sx]?\s+)?([789]\d{3})\b/.exec(text);

	if (modern?.[2]) {
		const digits = modern[2];
		const score = modernScore(digits, modern[1] === "gt", modern[1] === "rtx");
		if (score === null) return null;
		if (modern[3]?.startsWith("ti")) {
			return score * (modern[3].includes("super") ? 1.25 : 1.15);
		}
		if (modern[3] === "super") return score * 1.1;
		return score;
	}
	if (legacy?.[1]) return legacyScore(legacy[1]);
	if (/\bmx\s*\d{3}\b/.test(text)) return 30;
	return null;
}

// RTX cards never use the pre-GTX naming, so a 4-digit RTX number is never a legacy card.
function modernScore(
	digits: string,
	isGt: boolean,
	isRtx: boolean,
): number | null {
	if (!isRtx && digits.length === 4 && /^[789]/.test(digits))
		return legacyScore(digits);

	const gen = Number(digits.length === 4 ? digits.slice(0, 2) : digits[0]);
	const tier = Number(digits.slice(-2));
	const base = GEN_BASE[gen > LATEST_GEN ? LATEST_GEN : gen];
	const factor = CLASS_FACTOR[tier];
	if (base === undefined || factor === undefined) return null;
	// Plain "GT" cards are the cut-down line of their generation.
	return base * factor * (isGt ? 0.7 : 1);
}

function legacyScore(digits: string): number | null {
	const base = LEGACY_BASE[Number(digits[0])];
	const factor = LEGACY_CLASS[Number(digits[1])];
	return base === undefined || factor === undefined ? null : base * factor;
}
