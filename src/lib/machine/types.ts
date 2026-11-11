// "mobile" = Android, iOS, ChromeOS: GTA has no desktop build there.
export type OsFamily =
	| "windows"
	| "linux"
	| "darwin"
	| "bsd"
	| "mobile"
	| "unknown";

export interface GpuSpec {
	name: string | null;
	vramBytes: number | null;
	// Shares system RAM, so the dedicated figure understates what games can use.
	integrated: boolean;
}

export interface DiskSpec {
	freeBytes: number;
}

// Shared shape for the probe script and the browser fallback.
export interface MachineSpecs {
	source: "probe" | "browser";
	osFamily: OsFamily;
	osName: string | null;
	// Windows only: major version (10, 11 reports as 10) and bitness, for edition requirements.
	windowsMajor: number | null;
	is64Bit: boolean | null;
	ramBytes: number | null;
	// Browsers cap reported RAM at 8 GB, so the real value may be higher.
	ramIsCapped: boolean;
	// Apple Silicon: the GPU draws from system RAM, so VRAM is not a separate figure.
	unifiedMemory: boolean;
	// Every local volume the probe saw; empty when unknown.
	disks: DiskSpec[];
	logicalCores: number | null;
	// Probe only; browsers do not expose the CPU model.
	cpuModel: string | null;
	gpus: GpuSpec[];
	// null = not tested (no vulkaninfo, or not Linux).
	vulkan: boolean | null;
}
