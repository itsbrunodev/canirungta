// Intel Arc plus integrated graphics. Same scale as score-gpu-nvidia.ts (GTX 1060 = 100).
const ARC: Record<string, number> = {
	a380: 75,
	a580: 190,
	a750: 230,
	a770: 250,
	b570: 260,
	b580: 290,
};

export function scoreOtherGpu(text: string): number | null {
	const arc = /\barc\s*(?:pro\s*)?([ab]\d{3})\b/.exec(text);
	if (arc?.[1]) return ARC[arc[1]] ?? null;
	if (/\barc\s*1[34]0[vt]\b/.test(text)) return 85;
	if (/\barc.*graphics\b/.test(text)) return 55;

	if (/\biris\s*xe\b/.test(text)) return 45;
	if (/\buhd graphics\s*7\d{2}\b/.test(text)) return 32;
	if (/\buhd\b/.test(text)) return 22;
	if (/\biris\b/.test(text)) return 30;
	if (/\bhd graphics\b/.test(text)) return 10;

	if (/\b8[89]0m\b/.test(text)) return 110;
	if (/\b7[4-8]0m\b/.test(text)) return 85;
	if (/\b6[68]0m\b/.test(text)) return 70;
	const vega = /\bvega\s*(\d+)\b/.exec(text);
	if (vega?.[1]) return Math.min(45, 10 + Number(vega[1]) * 3);
	if (/\bradeon\s*graphics\b/.test(text)) return 35;
	return null;
}
