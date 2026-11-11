import type { MachineSpecs, OsFamily } from "@/lib/machine/types";

const GIB = 1024 ** 3;
const DECIMAL_GB = 1e9;
const MAX_TEXT = 120;

const OS_BY_NAME: Record<string, OsFamily> = {
	windows: "windows",
	linux: "linux",
	macos: "darwin",
	mobile: "mobile",
};

export interface CheckQuery {
	cpu: string | null;
	gpu: string | null;
	ramGb: number | null;
	vramGb: number | null;
	diskFreeGb: number | null;
	os: string;
	windowsMajor: number | null;
}

export interface ParsedCheckQuery {
	query: CheckQuery;
	specs: MachineSpecs;
	// Human-readable problems with the input; the check still runs on whatever was valid.
	errors: string[];
}

export function parseCheckQuery(params: URLSearchParams): ParsedCheckQuery {
	const errors: string[] = [];
	const osName = (params.get("os") ?? "windows").trim().toLowerCase();
	const osFamily = OS_BY_NAME[osName];
	if (!osFamily) errors.push(`os must be one of: ${Object.keys(OS_BY_NAME)}`);

	const query: CheckQuery = {
		cpu: text(params.get("cpu")),
		gpu: text(params.get("gpu")),
		ramGb: number(params, "ram", errors),
		vramGb: number(params, "vram", errors),
		diskFreeGb: number(params, "disk", errors),
		os: osFamily ? osName : "windows",
		windowsMajor: number(params, "windows", errors),
	};

	const specs: MachineSpecs = {
		source: "probe",
		osFamily: osFamily ?? "windows",
		osName: query.os,
		windowsMajor: query.windowsMajor,
		is64Bit: null,
		ramBytes: query.ramGb === null ? null : query.ramGb * GIB,
		ramIsCapped: false,
		unifiedMemory: false,
		disks:
			query.diskFreeGb === null
				? []
				: [{ freeBytes: query.diskFreeGb * DECIMAL_GB }],
		logicalCores: null,
		cpuModel: query.cpu,
		gpus: query.gpu
			? [
					{
						name: query.gpu,
						vramBytes: query.vramGb === null ? null : query.vramGb * GIB,
						integrated: false,
					},
				]
			: [],
		vulkan: null,
	};
	return { query, specs, errors };
}

function text(value: string | null): string | null {
	const trimmed = value?.trim().slice(0, MAX_TEXT);
	return trimmed || null;
}

function number(
	params: URLSearchParams,
	key: string,
	errors: string[],
): number | null {
	const raw = params.get(key);
	if (raw === null || raw.trim() === "") return null;
	const value = Number(raw);
	if (!Number.isFinite(value) || value <= 0) {
		errors.push(`${key} must be a positive number`);
		return null;
	}
	return value;
}
