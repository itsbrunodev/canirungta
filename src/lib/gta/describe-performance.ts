import type {
	BestSetting,
	Bottleneck,
	PerformanceProfile,
} from "@/lib/gta/performance-types";
import type { MachineSpecs } from "@/lib/machine/types";

export const BOTTLENECK_LABELS: Record<Bottleneck, string> = {
	gpu: "GPU-limited",
	cpu: "CPU-limited",
	vram: "short on VRAM",
	ram: "short on RAM",
	engine: "engine cap",
};

export const NO_GPU_SUMMARY = "Add a GPU model to estimate FPS.";

// One sentence an agent or screen reader can relay as is.
export function summarizePerformance(
	best: BestSetting | null,
	cpuAssumed: boolean,
): string {
	const fps = best?.estimate.fps;
	if (!best || fps === null || fps === undefined) return NO_GPU_SUMMARY;
	const { estimate } = best;
	const where = `${best.resolutionLabel} on ${estimate.label} settings`;
	if (estimate.limitedBy === "engine") {
		return `Holds the ${fps} FPS engine cap at ${where}.`;
	}
	const range =
		estimate.low !== null &&
		estimate.high !== null &&
		estimate.low < estimate.high
			? ` (${estimate.low} to ${estimate.high})`
			: "";
	if (cpuAssumed) {
		return `Up to about ${fps} FPS${range} at ${where} if the CPU keeps up.`;
	}
	const limit = estimate.limitedBy
		? `, ${BOTTLENECK_LABELS[estimate.limitedBy]}`
		: "";
	return `About ${fps} FPS${range} at ${where}${limit}.`;
}

export interface NoteFlags {
	cpuAssumed: boolean;
	approximate: boolean;
	// Hardware unknown but the game is old enough to run on anything.
	floorAssumed: boolean;
}

export function performanceNotes(
	profile: PerformanceProfile,
	specs: MachineSpecs,
	flags: NoteFlags,
): string[] {
	const notes: string[] = [];
	if (profile.note) notes.push(profile.note);
	if (flags.floorAssumed) {
		notes.push("Any PC from the last 15 years reaches the cap.");
	} else if (flags.cpuAssumed) {
		notes.push(
			"CPU not detected: these are what the GPU can render, so a slow CPU would land lower.",
		);
	}
	if (flags.approximate) {
		notes.push(
			"Speed estimated from the part's published specs, so the range is wider.",
		);
	}
	if (specs.osFamily === "linux") {
		notes.push("Includes a small Proton overhead.");
	} else if (specs.osFamily === "darwin" || specs.osFamily === "bsd") {
		notes.push(
			"Figures are for Windows; a translation layer on this OS will run slower.",
		);
	}
	return notes;
}
