export type ResolutionId = "720p" | "1080p" | "1440p" | "4k";

// smooth = 60 FPS class, playable = 30 FPS class, choppy = below that.
export type FpsRating = "smooth" | "playable" | "choppy";

export type Bottleneck = "gpu" | "cpu" | "vram" | "ram" | "engine";

// "projected" = the game has no PC release, so the figures extrapolate from projected specs.
export type PerformanceBasis = "benchmarks" | "projected";

export interface PresetProfile {
	id: string;
	label: string;
	// Average FPS a GTX 1060-class card (GPU score 100) renders at 1080p with no CPU limit.
	gpuFps: number;
	// VRAM the preset uses at 1080p.
	vramGb: number;
	// Share of the profile's CPU frame rate left at this preset (denser traffic, longer draw distance).
	cpuFactor: number;
	needsRayTracing?: boolean;
}

export interface PerformanceProfile {
	basis: PerformanceBasis;
	// Lowest to highest quality.
	presets: PresetProfile[];
	// Average FPS a Core i7-4770-class CPU (CPU score 100) can feed with no GPU limit.
	cpuFps: number;
	// How much of a CPU score gain above 100 turns into frames; old engines lean on one thread.
	cpuExponent: number;
	// How fast FPS falls as pixel count grows.
	pixelExponent: number;
	// Frame limiter or engine ceiling; null = none.
	fpsCap: number | null;
	// Scores to assume when hardware is unknown: games so old that any working PC runs them.
	floor?: { gpu: number; cpu: number };
	note: string | null;
}

export interface FpsEstimate {
	presetId: string;
	label: string;
	// Average FPS; null when the preset cannot be used on this hardware.
	fps: number | null;
	// Plausible range around `fps`.
	low: number | null;
	high: number | null;
	rating: FpsRating | null;
	limitedBy: Bottleneck | null;
	note: string | null;
}

export interface ResolutionEstimate {
	id: ResolutionId;
	label: string;
	presets: FpsEstimate[];
}

export interface BestSetting {
	resolution: ResolutionId;
	resolutionLabel: string;
	estimate: FpsEstimate;
}

export interface PerformanceReport {
	// "unknown" = no GPU to estimate from; resolutions is empty.
	status: "estimated" | "unknown";
	basis: PerformanceBasis;
	summary: string;
	// Highest-quality setting that stays smooth (or, failing that, playable).
	best: BestSetting | null;
	resolutions: ResolutionEstimate[];
	fpsCap: number | null;
	// CPU unknown: figures are what the GPU can render, a ceiling rather than an estimate.
	cpuAssumed: boolean;
	// CPU or GPU speed came from published specs rather than the tuned tables.
	approximate: boolean;
	notes: string[];
}
