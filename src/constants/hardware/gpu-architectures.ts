// Fitted against the hand-tuned table (src/lib/hardware/score-gpu*.ts), GTX 1060 (Pascal) = 1.
// Raw shaders x clock over-credits newer and wider cards, so these correct per generation.
// First matching pattern wins; unlisted chipsets use 1.
export interface GpuArchitectureFactor {
	pattern: RegExp;
	factor: number;
}

export const GPU_ARCHITECTURE_FACTORS: GpuArchitectureFactor[] = [
	{ pattern: /\bRTX\s*50\d0/i, factor: 1.49 },
	{ pattern: /\bRTX\s*30\d0/i, factor: 1.32 },
	{ pattern: /\bRTX\s*40\d0/i, factor: 1.15 },
	{ pattern: /\b(RTX\s*20\d0|GTX\s*16\d0)/i, factor: 1.17 },
	{ pattern: /\bArc\s*(Pro\s*)?B\d/i, factor: 0.9 },
	{ pattern: /\bArc\b/i, factor: 0.82 },
	{ pattern: /\bRX\s*9\d{3}/i, factor: 1.21 },
	{ pattern: /\bRX\s*7\d{3}/i, factor: 1.1 },
	{ pattern: /\bRX\s*6\d{3}/i, factor: 1.06 },
	{ pattern: /\bRX\s*5\d00/i, factor: 1.1 },
	{ pattern: /\bRX\s*[45]\d0\b/i, factor: 0.78 },
];

// Sub-linear: doubling shaders x clock buys less than double the frame rate.
export const GPU_SCALING_EXPONENT = 0.85;

// Past this width the bus is HBM (stacked memory), which says nothing about speed.
export const MAX_GDDR_BUS_BITS = 512;
