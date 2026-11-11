import { MANUAL_SPECS_STORAGE_KEY } from "@/constants/storage-keys";

import type { GpuSpec, MachineSpecs } from "@/lib/machine/types";

const GIB = 1024 ** 3;
const DECIMAL_GB = 1e9;

// Whatever the visitor typed; every field is optional and only fills or overrides detection.
export interface ManualSpecs {
	cpuModel: string | null;
	gpuName: string | null;
	ramGb: number | null;
	vramGb: number | null;
	diskFreeGb: number | null;
}

export const EMPTY_MANUAL_SPECS: ManualSpecs = {
	cpuModel: null,
	gpuName: null,
	ramGb: null,
	vramGb: null,
	diskFreeGb: null,
};

export function hasManualSpecs(manual: ManualSpecs): boolean {
	return Object.values(manual).some((value) => value !== null);
}

// Typed values win over detected ones: the visitor knows their machine better than a browser does.
export function applyManualSpecs(
	specs: MachineSpecs,
	manual: ManualSpecs,
): MachineSpecs {
	return {
		...specs,
		cpuModel: manual.cpuModel ?? specs.cpuModel,
		ramBytes: manual.ramGb === null ? specs.ramBytes : manual.ramGb * GIB,
		// A typed figure is exact, so the browser's 8 GB cap no longer applies.
		ramIsCapped: manual.ramGb === null ? specs.ramIsCapped : false,
		gpus: manualGpus(specs.gpus, manual),
		disks:
			manual.diskFreeGb === null
				? specs.disks
				: [{ freeBytes: manual.diskFreeGb * DECIMAL_GB }],
	};
}

function manualGpus(detected: GpuSpec[], manual: ManualSpecs): GpuSpec[] {
	if (manual.gpuName === null && manual.vramGb === null) return detected;
	const first = detected[0];
	const typed: GpuSpec = {
		name: manual.gpuName ?? first?.name ?? null,
		vramBytes:
			manual.vramGb === null ? (first?.vramBytes ?? null) : manual.vramGb * GIB,
		// A typed discrete GPU is not an iGPU; detection's guess only stands when nothing was typed.
		integrated: manual.gpuName === null ? (first?.integrated ?? false) : false,
	};
	return [typed, ...detected.slice(1)];
}

export function saveManualSpecs(manual: ManualSpecs): void {
	try {
		if (hasManualSpecs(manual)) {
			localStorage.setItem(MANUAL_SPECS_STORAGE_KEY, JSON.stringify(manual));
		} else {
			localStorage.removeItem(MANUAL_SPECS_STORAGE_KEY);
		}
	} catch {
		// Private window or blocked storage: the entry just lasts for this visit.
	}
}

export function loadManualSpecs(): ManualSpecs {
	try {
		const raw = localStorage.getItem(MANUAL_SPECS_STORAGE_KEY);
		return raw ? parseManualSpecs(JSON.parse(raw)) : EMPTY_MANUAL_SPECS;
	} catch {
		return EMPTY_MANUAL_SPECS;
	}
}

// Stored data is untrusted like any input: type-check each field.
function parseManualSpecs(raw: unknown): ManualSpecs {
	const root =
		typeof raw === "object" && raw !== null
			? (raw as Record<string, unknown>)
			: {};
	return {
		cpuModel: text(root.cpuModel),
		gpuName: text(root.gpuName),
		ramGb: positive(root.ramGb),
		vramGb: positive(root.vramGb),
		diskFreeGb: positive(root.diskFreeGb),
	};
}

function text(value: unknown): string | null {
	return typeof value === "string" && value.trim()
		? value.trim().slice(0, 120)
		: null;
}

function positive(value: unknown): number | null {
	return typeof value === "number" && Number.isFinite(value) && value > 0
		? value
		: null;
}
