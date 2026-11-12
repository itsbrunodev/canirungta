import type {
	PerformanceProfile,
	PresetProfile,
} from "@/lib/gta/performance-types";

// Calibrated against published benchmark runs (GTX 1060 6 GB and Core i7-4770 as the 100-point
// anchors), then sanity-checked against each game's minimum and recommended hardware.

function preset(
	id: string,
	label: string,
	gpuFps: number,
	vramGb: number,
	cpuFactor: number,
): PresetProfile {
	return { id, label, gpuFps, vramGb, cpuFactor };
}

// Unreal Engine 4 remasters share an engine; `load` is how heavy the map is next to GTA III's.
function definitive(load: number): PerformanceProfile {
	return {
		basis: "benchmarks",
		presets: [
			preset("low", "Low", 135 / load, 2, 1.1),
			preset("high", "High", 75 / load, 3.5, 1),
			preset("ultra", "Ultra", 52 / load, 5, 0.92),
		],
		cpuFps: 95 / load,
		cpuExponent: 0.6,
		pixelExponent: 0.75,
		fpsCap: null,
		note: "Expect traversal stutter whatever the hardware: it is an engine trait.",
	};
}

// RenderWare originals: any working PC outruns the built-in frame limiter.
function classic(fpsCap: number, gpuFps: number): PerformanceProfile {
	return {
		basis: "benchmarks",
		presets: [preset("max", "Max", gpuFps, 0.0625, 1)],
		cpuFps: 400,
		cpuExponent: 0.5,
		pixelExponent: 0.75,
		fpsCap,
		floor: { gpu: 8, cpu: 20 },
		note: `The frame limiter holds the game at ${fpsCap} FPS; turning it off breaks physics and timing.`,
	};
}

const GTA_IV: PerformanceProfile = {
	basis: "benchmarks",
	presets: [
		preset("low", "Low", 220, 0.25, 1.15),
		preset("high", "High", 140, 0.75, 1),
		preset("max", "Max", 100, 1.5, 0.9),
	],
	// The port leans on one or two threads, so fast modern CPUs gain little.
	cpuFps: 75,
	cpuExponent: 0.5,
	pixelExponent: 0.7,
	fpsCap: null,
	note: "CPU-bound port: above 60 FPS some cutscenes and physics misbehave, so many players cap it there.",
};

export const PERFORMANCE_PROFILES: Record<string, PerformanceProfile> = {
	// No PC release: extrapolated from the projected specs (RTX 2060 SUPER for 1080p low at 30+,
	// RTX 4070 for 1440p high at 40+).
	"gta-vi": {
		basis: "projected",
		presets: [
			preset("low", "Low", 24, 6.5, 1.1),
			preset("high", "High", 19, 9, 1),
			{
				...preset("ultra", "Ultra + ray tracing", 12, 12, 0.9),
				needsRayTracing: true,
			},
		],
		cpuFps: 38,
		cpuExponent: 0.7,
		pixelExponent: 0.75,
		fpsCap: null,
		note: "Not released on PC: projected from community spec estimates, so treat it as a rough guide.",
	},
	"gta-v-enhanced": {
		basis: "benchmarks",
		presets: [
			preset("low", "Normal", 135, 2.5, 1.12),
			preset("high", "Very High", 75, 4, 1),
			{
				...preset("ultra", "Ray Tracing Ultra", 33, 7, 0.9),
				needsRayTracing: true,
			},
		],
		cpuFps: 95,
		cpuExponent: 0.7,
		pixelExponent: 0.75,
		fpsCap: null,
		note: "Native rendering; DLSS or FSR adds roughly 30 to 50% at 1440p and 4K.",
	},
	"gta-v-2015": {
		basis: "benchmarks",
		presets: [
			preset("low", "Normal", 150, 1, 1.15),
			preset("high", "Very High", 90, 2.5, 1),
			preset("ultra", "Max + 4x MSAA", 55, 4, 0.88),
		],
		cpuFps: 100,
		cpuExponent: 0.7,
		pixelExponent: 0.75,
		// The engine starts stuttering near 188 FPS however fast the PC is.
		fpsCap: 188,
		note: null,
	},
	"gta-iv-complete": GTA_IV,
	"gta-iv-original": GTA_IV,
	"gta-sa-definitive": definitive(1.12),
	"gta-sa-original": classic(25, 1500),
	"gta-vc-definitive": definitive(1.04),
	"gta-vc-original": classic(30, 2500),
	"gta-iii-definitive": definitive(1),
	"gta-iii-original": classic(30, 3000),
};
