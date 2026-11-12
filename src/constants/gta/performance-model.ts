import type { ResolutionId } from "@/lib/gta/performance-types";

export interface ResolutionDefinition {
	id: ResolutionId;
	label: string;
	// Pixels relative to 1080p.
	pixelRatio: number;
}

export const RESOLUTIONS: ResolutionDefinition[] = [
	{ id: "720p", label: "720p", pixelRatio: 0.444 },
	{ id: "1080p", label: "1080p", pixelRatio: 1 },
	{ id: "1440p", label: "1440p", pixelRatio: 1.778 },
	{ id: "4k", label: "4K", pixelRatio: 4 },
];

// Just under 60/30 so an estimate of 58 is not called "playable" over rounding noise.
export const SMOOTH_FPS = 57;
export const PLAYABLE_FPS = 28;

// GPU and CPU limits blend instead of a hard min: a balanced pair lands ~16% under either limit.
export const BLEND_SHARPNESS = 4;
// A part counts as the bottleneck only when it is clearly the slower one.
export const BOTTLENECK_MARGIN = 0.9;

// VRAM use grows slowly with resolution (render targets, not textures).
export const VRAM_PIXEL_EXPONENT = 0.3;
// Running out of VRAM swaps textures over PCIe: FPS falls faster than the shortfall, down to this floor.
export const VRAM_SHORTFALL_EXPONENT = 1.5;
export const VRAM_FLOOR_FACTOR = 0.35;

// Below the minimum RAM the game pages to disk; between minimum and recommended it only stutters more.
export const RAM_BELOW_MINIMUM_FACTOR = 0.6;
export const RAM_BELOW_RECOMMENDED_FACTOR = 0.93;

// A penalty this deep makes memory, not speed, the thing to fix.
export const MEMORY_BOTTLENECK_FACTOR = 0.85;

// Half-width of the reported range.
export const UNCERTAINTY = {
	benchmarks: 0.15,
	projected: 0.3,
	// Added when a score comes from published specs instead of the tuned tables.
	approximateHardware: 0.1,
} as const;

// Proton costs a little on DirectX 11/12 titles.
export const PROTON_FACTOR = 0.93;
