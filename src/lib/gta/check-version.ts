import { checkCpu, checkGpuModel } from "@/lib/gta/check-hardware";
import type {
	CheckRow,
	GtaRequirement,
	GtaVersion,
	Verdict,
	VersionReport,
} from "@/lib/gta/types";
import type { MachineSpecs } from "@/lib/machine/types";

const GIB = 1024 ** 3;
const DECIMAL_GB = 1e9;
// Reported RAM/VRAM sit below nominal (reserved memory, GiB vs GB), so allow 10% slack before failing.
const TOLERANCE = 0.9;
const DEVICE_MEMORY_CAP_GB = 8;
// Apple GPUs can address roughly two thirds of unified memory (Metal's recommended working set).
const UNIFIED_GPU_SHARE = 0.66;
// Windows and Linux iGPUs cap shared memory at about half of RAM.
const INTEGRATED_GPU_SHARE = 0.5;

export function checkGtaVersion(
	version: GtaVersion,
	specs: MachineSpecs,
): VersionReport {
	const checks = checksFor(version, version.minimum, specs);
	const recChecks = checksFor(version, recommendedOf(version), specs);
	return {
		version,
		verdict: verdictFrom(checks, recChecks, specs),
		checks,
	};
}

function checksFor(
	version: GtaVersion,
	req: GtaRequirement,
	specs: MachineSpecs,
): CheckRow[] {
	return [
		checkCpu(req, version.minimum, specs),
		checkGpuModel(req, version.minimum, specs),
		checkRam(req, specs),
		checkVram(req, specs),
		checkDisk(req, specs),
		checkOs(version, specs),
	].filter((row): row is CheckRow => row !== null);
}

function recommendedOf(version: GtaVersion): GtaRequirement {
	const { minimum, recommended } = version;
	return {
		cpu: recommended?.cpu ?? minimum.cpu,
		gpu: recommended?.gpu ?? minimum.gpu,
		ramGb: recommended?.ramGb ?? minimum.ramGb,
		vramGb: recommended?.vramGb ?? minimum.vramGb,
		diskGb: recommended?.diskGb ?? minimum.diskGb,
	};
}

function checkRam(req: GtaRequirement, specs: MachineSpecs): CheckRow {
	const min = req.ramGb;
	if (min === null) return unknownRow("RAM", "No published minimum");
	if (specs.ramBytes === null)
		return unknownRow("RAM", "Not reported on this platform", min);

	const actualGb = specs.ramBytes / GIB;
	if (specs.ramIsCapped && min > DEVICE_MEMORY_CAP_GB) {
		return unknownRow(
			"RAM",
			"Browser reports 8 GB or more; run the system probe for an exact figure",
			min,
		);
	}
	return {
		label: "RAM",
		status: actualGb >= min * TOLERANCE ? "pass" : "fail",
		actual: `${actualGb.toFixed(1)} GB`,
		required: `${min} GB`,
		note: null,
	};
}

function checkVram(req: GtaRequirement, specs: MachineSpecs): CheckRow {
	const min = req.vramGb;
	if (min === null) return unknownRow("VRAM", "No published minimum");

	const best = bestGpu(specs);
	if (!best || best.bytes === null)
		return unknownRow("VRAM", "Not reported on this platform", min);

	const actualGb = best.bytes / GIB;
	return {
		label: "VRAM",
		status: actualGb >= min * TOLERANCE ? "pass" : "fail",
		actual: `${actualGb.toFixed(1)} GB`,
		required: `${min} GB`,
		note: best.shared ? "Shares system RAM" : null,
	};
}

function checkDisk(req: GtaRequirement, specs: MachineSpecs): CheckRow {
	const min = req.diskGb;
	if (min === null) return unknownRow("Disk", "No published minimum");
	if (specs.disks.length === 0)
		return unknownRow("Disk", "Browser cannot read free disk space", min);

	// The game can be installed on any drive, so the roomiest one decides.
	const freeBytes = Math.max(...specs.disks.map((disk) => disk.freeBytes));
	const freeGb = freeBytes / DECIMAL_GB;
	return {
		label: "Disk",
		// No tolerance: unlike RAM, free space is not under-reported.
		status: freeGb >= min ? "pass" : "fail",
		actual: `${freeGb.toFixed(0)} GB free`,
		required: `${min} GB`,
		note:
			specs.disks.length > 1 ? `Best of ${specs.disks.length} drives` : null,
	};
}

function checkOs(version: GtaVersion, specs: MachineSpecs): CheckRow {
	if (specs.osFamily === "windows") return checkWindows(version, specs);
	if (specs.osFamily === "mobile") {
		return {
			label: "OS",
			status: "fail",
			actual: specs.osName,
			required: "Windows",
			note: "GTA has no phone, tablet or Chromebook version here",
		};
	}
	return {
		label: "OS",
		status: "unknown",
		actual: specs.osName,
		required: "Windows",
		note: translationNote(specs),
	};
}

function checkWindows(version: GtaVersion, specs: MachineSpecs): CheckRow {
	const { minWindowsMajor, requires64Bit } = version.os;
	const row: CheckRow = {
		label: "OS",
		status: "pass",
		actual: specs.osName ?? "Windows",
		required: null,
		note: null,
	};

	if (requires64Bit && specs.is64Bit === false) {
		return { ...row, status: "fail", required: "64-bit Windows" };
	}
	if (minWindowsMajor !== null) {
		const required = `Windows ${minWindowsMajor} or newer`;
		if (specs.windowsMajor === null) {
			return {
				...row,
				status: "unknown",
				required,
				note: "Version not detected",
			};
		}
		if (specs.windowsMajor < minWindowsMajor) {
			return { ...row, status: "fail", required };
		}
	}
	return row;
}

// Non-Windows desktops run GTA through Proton/Wine; Vulkan is what Proton needs.
function translationNote(specs: MachineSpecs): string {
	if (specs.osFamily === "linux" && specs.vulkan === true) {
		return "Vulkan works, so Proton should run it (not tested)";
	}
	if (specs.osFamily === "linux" && specs.vulkan === false) {
		return "Vulkan is not working, which Proton needs";
	}
	return "Linux/macOS would need Proton or Wine (not checked)";
}

interface UsableGpu {
	name: string | null;
	// Memory the GPU can use; null when unknown.
	bytes: number | null;
	shared: boolean;
}

// Best GPU, since iGPUs and dGPUs can both be present. Shared-memory GPUs count what they can borrow from RAM.
function bestGpu(specs: MachineSpecs): UsableGpu | null {
	const usable = specs.gpus.map((gpu): UsableGpu => {
		const shareOfRam = specs.unifiedMemory
			? UNIFIED_GPU_SHARE
			: gpu.integrated
				? INTEGRATED_GPU_SHARE
				: null;
		if (shareOfRam === null || specs.ramBytes === null) {
			return { name: gpu.name, bytes: gpu.vramBytes, shared: false };
		}
		return {
			name: gpu.name,
			bytes: Math.max(gpu.vramBytes ?? 0, specs.ramBytes * shareOfRam),
			shared: true,
		};
	});
	const known = usable.filter((gpu) => gpu.bytes !== null);
	if (known.length === 0) return usable[0] ?? null;
	return known.reduce((best, gpu) =>
		(gpu.bytes ?? 0) > (best.bytes ?? 0) ? gpu : best,
	);
}

function verdictFrom(
	checks: CheckRow[],
	recChecks: CheckRow[],
	specs: MachineSpecs,
): Verdict {
	if (specs.osFamily === "mobile") return "unsupported";
	if (checks.some((check) => check.status === "fail")) return "cannot";
	if (specs.osFamily !== "windows") return "needs-windows";
	if (checks.some((check) => check.status === "unknown")) return "unknown";
	// Below recommended on a known spec; unknown recommended figures don't demote.
	if (recChecks.some((check) => check.status === "fail")) return "runs";
	return "runs-well";
}

function unknownRow(
	label: string,
	note: string,
	required: number | null = null,
): CheckRow {
	return {
		label,
		status: "unknown",
		actual: null,
		required: required === null ? null : `${required} GB`,
		note,
	};
}
