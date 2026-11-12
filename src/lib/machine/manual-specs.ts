import { MANUAL_SPECS_STORAGE_KEY } from "@/constants/storage-keys";

import { parseOsName } from "@/lib/machine/parse-os-name";
import type { GpuSpec, MachineSpecs } from "@/lib/machine/types";

const GIB = 1024 ** 3;
const DECIMAL_GB = 1e9;

// Whatever the visitor typed; every field is optional and only fills or overrides detection.
export interface ManualSpecs {
	// Free text such as "Windows 11"; only used when parse-os-name understands it.
	os: string | null;
	cpuModel: string | null;
	gpuName: string | null;
	ramGb: number | null;
	vramGb: number | null;
	diskFreeGb: number | null;
}

export const EMPTY_MANUAL_SPECS: ManualSpecs = {
	os: null,
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
	const cpuChanged =
		manual.cpuModel !== null &&
		manual.cpuModel.trim().toLowerCase() !==
			(specs.cpuModel ?? "").trim().toLowerCase();
	return {
		...specs,
		...manualOs(specs, manual),
		cpuModel: manual.cpuModel ?? specs.cpuModel,
		logicalCores: cpuChanged ? null : specs.logicalCores,
		ramBytes: manual.ramGb === null ? specs.ramBytes : manual.ramGb * GIB,
		// A typed figure is exact, so the browser's 8 GB cap no longer applies.
		ramIsCapped: manual.ramGb === null ? specs.ramIsCapped : false,
		gpus: manualGpus(specs.gpus, manual),
		details: {
			...specs.details,
			// Core counts and clocks belong to the detected CPU, not the typed one.
			physicalCores: cpuChanged ? null : specs.details.physicalCores,
			maxClockMhz: cpuChanged ? null : specs.details.maxClockMhz,
			// A typed GPU replaces whatever the browser could not see.
			softwareRenderer:
				manual.gpuName === null && specs.details.softwareRenderer,
		},
		disks:
			manual.diskFreeGb === null
				? specs.disks
				: [
						{
							freeBytes: manual.diskFreeGb * DECIMAL_GB,
							kind: null,
							label: null,
							totalBytes: null,
						},
					],
	};
}

function manualOs(
	specs: MachineSpecs,
	manual: ManualSpecs,
): Partial<MachineSpecs> {
	const parsed = manual.os === null ? null : parseOsName(manual.os);
	if (manual.os === null || !parsed) return {};
	return {
		osFamily: parsed.family,
		osName: manual.os,
		// "Windows" alone keeps a detected version, but only if detection also saw Windows.
		windowsMajor:
			parsed.family !== "windows"
				? null
				: (parsed.windowsMajor ??
					(specs.osFamily === "windows" ? specs.windowsMajor : null)),
		// Vulkan was tested for the detected OS only.
		vulkan: parsed.family === specs.osFamily ? specs.vulkan : null,
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
		// The detected driver describes the old card, not the typed one.
		driver: manual.gpuName === null ? (first?.driver ?? null) : null,
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
		os: text(root.os),
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
