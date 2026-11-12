import { MEMORY_TOLERANCE } from "@/constants/gta/tolerances";

import { checkCpu, checkGpuModel } from "@/lib/gta/check-hardware";
import { checkPerformance } from "@/lib/gta/check-performance";
import {
	describeDisk,
	describeRam,
	SOFTWARE_RENDERER_NOTE,
} from "@/lib/gta/describe-hardware";
import { formatGb, formatGbValue } from "@/lib/gta/format-gb";
import type {
	CheckRow,
	GtaRequirement,
	GtaVersion,
	Verdict,
	VersionReport,
} from "@/lib/gta/types";
import { bestGpu } from "@/lib/gta/usable-gpu";
import type { VramRange } from "@/lib/hardware/lookup-vram";
import { diskId } from "@/lib/machine/disk-id";
import type { MachineSpecs } from "@/lib/machine/types";

const GIB = 1024 ** 3;
const DECIMAL_GB = 1e9;
const DEVICE_MEMORY_CAP_GB = 8;

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
		performance: checkPerformance(version, specs),
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
		status: actualGb >= min * MEMORY_TOLERANCE ? "pass" : "fail",
		actual: formatGbValue(actualGb),
		required: formatGb(min),
		note: describeRam(specs),
	};
}

function checkVram(req: GtaRequirement, specs: MachineSpecs): CheckRow {
	const min = req.vramGb;
	if (min === null) return unknownRow("VRAM", "No published minimum");

	const best = bestGpu(specs);
	if (!best || best.bytes === null) {
		return unknownRow(
			"VRAM",
			specs.details.softwareRenderer
				? SOFTWARE_RENDERER_NOTE
				: "Not reported on this platform",
			min,
		);
	}

	const actualGb = best.bytes / GIB;
	if (best.estimate) return checkEstimatedVram(min, actualGb, best.estimate);
	return {
		label: "VRAM",
		status: actualGb >= min * MEMORY_TOLERANCE ? "pass" : "fail",
		actual: formatGbValue(actualGb),
		required: formatGb(min),
		note: best.shared ? "Shares system RAM" : null,
	};
}

// VRAM looked up from the GPU model. A range that straddles the minimum cannot be decided.
function checkEstimatedVram(
	min: number,
	lowGb: number,
	range: VramRange,
): CheckRow {
	const varies = range.maxGb > range.minGb;
	const base = {
		label: "VRAM",
		required: formatGb(min),
		note: varies
			? `Varies by model (${formatGb(range.minGb)} to ${formatGb(range.maxGb)}), estimated from GPU name`
			: "Estimated from GPU name",
	};
	const actual = varies
		? `${formatGbValue(range.minGb)} to ${formatGb(range.maxGb)}`
		: formatGbValue(lowGb);
	if (range.minGb >= min * MEMORY_TOLERANCE)
		return { ...base, status: "pass", actual };
	if (range.maxGb < min * MEMORY_TOLERANCE)
		return { ...base, status: "fail", actual };
	return { ...base, status: "unknown", actual };
}

function checkDisk(req: GtaRequirement, specs: MachineSpecs): CheckRow {
	const min = req.diskGb;
	if (min === null) return unknownRow("Disk", "No published minimum");
	if (specs.disks.length === 0)
		return unknownRow("Disk", "Browser cannot read free disk space", min);

	// The game can be installed on any drive: the visitor's pick decides, else the roomiest.
	const picked = specs.disks.find((d) => diskId(d) === specs.installDiskId);
	const roomiest =
		picked ??
		specs.disks.reduce((best, disk) =>
			disk.freeBytes > best.freeBytes ? disk : best,
		);
	const freeGb = roomiest.freeBytes / DECIMAL_GB;
	return {
		label: "Disk",
		// No tolerance: unlike RAM, free space is not under-reported.
		status: freeGb >= min ? "pass" : "fail",
		actual: `${formatGbValue(freeGb)} free`,
		required: formatGb(min),
		note: describeDisk(
			roomiest,
			specs.disks,
			min * DECIMAL_GB,
			picked !== undefined,
		),
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
		required: formatGb(required),
		note,
	};
}
