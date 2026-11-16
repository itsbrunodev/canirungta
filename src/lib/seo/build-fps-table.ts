import {
	FPS_TABLE_CPU,
	FPS_TABLE_RAM_GB,
	type ReferenceGpu,
} from "@/constants/gta/fps-reference-hardware";
import { PERFORMANCE_PROFILES } from "@/constants/gta/performance-profiles";
import { GTA_VERSIONS } from "@/constants/gta/versions";

import { checkPerformance } from "@/lib/gta/check-performance";
import type {
	FpsEstimate,
	PerformanceBasis,
	ResolutionId,
} from "@/lib/gta/performance-types";
import { EMPTY_DETAILS, type MachineSpecs } from "@/lib/machine/types";

const GIB = 1024 ** 3;
const TABLE_RESOLUTIONS: ResolutionId[] = ["1080p", "1440p", "4k"];

export interface FpsTableRow {
	gpu: string;
	// One estimate per column resolution; null = not estimable (needs ray tracing, etc.).
	cells: (FpsEstimate | null)[];
}

export interface FpsTable {
	presetLabel: string;
	resolutions: { id: ResolutionId; label: string }[];
	rows: FpsTableRow[];
	cpu: string;
	ramGb: number;
	basis: PerformanceBasis;
	// Every cell sits on the frame limiter, so a per-GPU table says nothing: show the cap instead.
	lockedFps: number | null;
}

function machine(gpu: ReferenceGpu): MachineSpecs {
	return {
		source: "probe",
		osFamily: "windows",
		osName: "Windows 11",
		windowsMajor: 10,
		is64Bit: true,
		ramBytes: FPS_TABLE_RAM_GB * GIB,
		ramIsCapped: false,
		unifiedMemory: false,
		disks: [],
		logicalCores: 12,
		cpuModel: FPS_TABLE_CPU,
		gpus: [
			{
				name: gpu.name,
				vramBytes: gpu.vramGb * GIB,
				driver: null,
				integrated: false,
			},
		],
		vulkan: null,
		details: EMPTY_DETAILS,
	};
}

// Estimates for a fixed PC with only the GPU swapped. The shown preset is the second-lowest
// (the "High" tier) so the table stays comparable and never needs ray tracing.
export function buildFpsTable(
	versionId: string,
	gpus: ReferenceGpu[],
): FpsTable | null {
	const version = GTA_VERSIONS.find((v) => v.id === versionId);
	if (!version) return null;

	const rows: FpsTableRow[] = [];
	let presetLabel = "";
	let resolutions: FpsTable["resolutions"] = [];

	for (const gpu of gpus) {
		const report = checkPerformance(version, machine(gpu));
		if (report.status !== "estimated") continue;
		const picked = TABLE_RESOLUTIONS.map((id) =>
			report.resolutions.find((r) => r.id === id),
		);
		resolutions = picked.flatMap((r) =>
			r ? [{ id: r.id, label: r.label }] : [],
		);
		const presetIndex = Math.min(1, (picked[0]?.presets.length ?? 1) - 1);
		presetLabel = picked[0]?.presets[presetIndex]?.label ?? presetLabel;
		rows.push({
			gpu: gpu.name.replace(/^(NVIDIA|AMD|Intel) /, ""),
			cells: picked.map((r) => r?.presets[presetIndex] ?? null),
		});
	}

	if (rows.length === 0) return null;
	const profile = PERFORMANCE_PROFILES[versionId];
	const cap = profile?.fpsCap ?? null;
	const locked =
		cap !== null &&
		rows.every((row) => row.cells.every((cell) => cell?.fps === cap));
	return {
		presetLabel,
		resolutions,
		rows,
		cpu: FPS_TABLE_CPU.replace(/^AMD /, ""),
		ramGb: FPS_TABLE_RAM_GB,
		basis: profile?.basis ?? "benchmarks",
		lockedFps: locked ? cap : null,
	};
}
