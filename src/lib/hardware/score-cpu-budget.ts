// Budget Intel parts (Pentium, Celeron). Flat tiers: no per-generation table, since these are
// mostly dual-core and only need to rank below the mainstream parts Rockstar names.
const PENTIUM_GOLD = 75;
const PENTIUM = 60;
const CELERON = 45;
// N- and J-series (and Silver) are low-power mobile/embedded chips.
const LOW_POWER_FACTOR = 0.5;

export function scoreBudgetIntel(text: string): number | null {
	const base = /\bpentium\s*gold\b/.test(text)
		? PENTIUM_GOLD
		: /\bpentium\b/.test(text)
			? PENTIUM
			: /\bceleron\b/.test(text)
				? CELERON
				: null;
	if (base === null) return null;
	const lowPower = /\b[nj]\d{4}\b|silver/.test(text);
	return lowPower ? base * LOW_POWER_FACTOR : base;
}
