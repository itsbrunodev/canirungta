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
	// Display-driver version as the OS reports it (NVIDIA: marketing form like "551.23"); null = unknown.
	driver: string | null;
	// Shares system RAM, so the dedicated figure understates what games can use.
	integrated: boolean;
}

export type DiskKind = "ssd" | "hdd";

export interface DiskSpec {
	freeBytes: number;
	// null = unknown (network/virtual volume, or the OS would not say).
	kind: DiskKind | null;
	// Short name to tell drives apart: "C:" on Windows, the mount's last folder elsewhere. Never a full path.
	label: string | null;
	totalBytes: number | null;
}

// Extra facts that only inform notes; none of them changes a verdict.
export interface MachineDetails {
	physicalCores: number | null;
	maxClockMhz: number | null;
	ramSpeedMhz: number | null;
	// "DDR4", "DDR5", "LPDDR5"...
	ramType: string | null;
	// Browser only: hardware acceleration is off, so the real GPU is hidden.
	softwareRenderer: boolean;
}

export const EMPTY_DETAILS: MachineDetails = {
	physicalCores: null,
	maxClockMhz: null,
	ramSpeedMhz: null,
	ramType: null,
	softwareRenderer: false,
};

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
	// Drive the visitor chose for the install (see diskId); absent = the roomiest decides.
	installDiskId?: string | null;
	logicalCores: number | null;
	// Probe only; browsers do not expose the CPU model.
	cpuModel: string | null;
	gpus: GpuSpec[];
	// null = not tested (no vulkaninfo, or not Linux).
	vulkan: boolean | null;
	details: MachineDetails;
}
