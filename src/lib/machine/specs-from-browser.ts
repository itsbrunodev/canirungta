import { cleanWebglRenderer } from "@/lib/hardware/clean-gpu-name";
import {
	appleChipName,
	isAppleSiliconGpu,
	isIntegratedGpu,
	isSoftwareRenderer,
} from "@/lib/hardware/gpu-kind";
import {
	EMPTY_DETAILS,
	type GpuSpec,
	type MachineSpecs,
	type OsFamily,
} from "@/lib/machine/types";
import type { GpuAdapterInfo, SystemInfo } from "@/lib/system-info/types";

const GIB = 1024 ** 3;
// Older browsers cap deviceMemory at 8 GB; a value of 8 means "8 or more".
const DEVICE_MEMORY_CAP_GB = 8;
// Chromium platformVersion: 13+ is Windows 11, 1-12 is Windows 10, 0.x is Windows 7/8.
const WINDOWS_11_PLATFORM_VERSION = 13;

// Fallback when the probe link is missing: no disk or VRAM figures are available.
export function specsFromBrowser(info: SystemInfo): MachineSpecs {
	const deviceMemoryGb = info.memory.deviceMemoryGb;
	const osFamily = osFamilyFrom(info);
	const { gpus, softwareRenderer } = gpusFrom(info.gpu.adapters);
	const appleSilicon =
		osFamily === "darwin" &&
		(info.os.architecture === "arm" ||
			gpus.some((g) => isAppleSiliconGpu(g.name)));

	return {
		source: "browser",
		osFamily,
		osName: osNameFrom(info, osFamily),
		windowsMajor: windowsMajorFrom(info),
		is64Bit: osFamily === "windows" ? is64BitFrom(info) : null,
		ramBytes: deviceMemoryGb === null ? null : deviceMemoryGb * GIB,
		// Only exactly 8 is ambiguous; newer Chromium reports higher values (16, 32) as real readings.
		ramIsCapped: deviceMemoryGb === DEVICE_MEMORY_CAP_GB,
		unifiedMemory: appleSilicon,
		disks: [],
		logicalCores: info.cpu.logicalCores,
		// Apple chips name both CPU and GPU, so the WebGL renderer reveals the CPU model.
		cpuModel: appleChipName(
			gpus.find((g) => appleChipName(g.name))?.name ?? null,
		),
		gpus,
		vulkan: null,
		details: { ...EMPTY_DETAILS, softwareRenderer },
	};
}

// WebGL names the model; WebGPU fills in when WebGL is masked and adds GPUs WebGL did not expose.
function gpusFrom(adapters: GpuAdapterInfo[]): {
	gpus: GpuSpec[];
	softwareRenderer: boolean;
} {
	const hardware = adapters.filter(
		(adapter) => !isSoftwareRenderer(adapter.renderer),
	);
	const softwareRenderer = adapters.length > 0 && hardware.length === 0;

	const names: string[] = [];
	const add = (name: string | null) => {
		if (!name || isMasked(name)) return;
		const key = squash(name);
		if (names.some((known) => known.includes(key) || key.includes(known)))
			return;
		names.push(key);
		found.push(name);
	};
	const found: string[] = [];

	for (const adapter of hardware.filter((a) => a.source === "webgl")) {
		add(cleanWebglRenderer(adapter.renderer));
	}
	for (const adapter of hardware.filter((a) => a.source === "webgpu")) {
		add(cleanWebglRenderer(adapter.renderer));
	}

	return {
		gpus: found.map((name) => ({
			name,
			vramBytes: null,
			integrated: isIntegratedGpu(name),
			driver: null,
		})),
		softwareRenderer,
	};
}

// Generic strings browsers return when the real renderer is hidden.
function isMasked(name: string): boolean {
	return /^(?:generic|mozilla|webkit|google)\b/i.test(name.trim());
}

function squash(name: string): string {
	return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Android and ChromeOS UAs contain "Linux", iOS contains "Mac OS X": test them first.
function osFamilyFrom(info: SystemInfo): OsFamily {
	const { platform, userAgent, mobile, touchPoints } = info.os;
	const text = `${platform ?? ""} ${userAgent}`;
	if (mobile === true) return "mobile";
	if (/Android|iPhone|iPad|iPod|CrOS|Chrome OS/i.test(text)) return "mobile";
	// iPadOS Safari presents as a Mac, but real Macs have no touchscreen.
	if (/Mac/i.test(text) && touchPoints > 1) return "mobile";
	if (/Windows/i.test(text)) return "windows";
	if (/Mac/i.test(text)) return "darwin";
	if (/BSD/i.test(text)) return "bsd";
	if (/Linux|X11/i.test(text)) return "linux";
	return "unknown";
}

function platformMajor(info: SystemInfo): number | null {
	const major = Number.parseInt(info.os.platformVersion ?? "", 10);
	return Number.isFinite(major) ? major : null;
}

// Windows 11 still reports NT 10.0 in the UA; only client hints tell them apart.
function osNameFrom(info: SystemInfo, family: OsFamily): string | null {
	if (family !== "windows") return info.os.platform;
	const hinted = platformMajor(info);
	if (hinted === null) return info.os.platform ?? "Windows";
	if (hinted >= WINDOWS_11_PLATFORM_VERSION) return "Windows 11";
	if (hinted >= 1) return "Windows 10";
	return "Windows 8 or older";
}

// Without hints the UA says "Windows NT 10.0" for 10 and 11 alike, so only older versions are detectable.
function windowsMajorFrom(info: SystemInfo): number | null {
	if (!/Windows/i.test(`${info.os.platform ?? ""} ${info.os.userAgent}`)) {
		return null;
	}
	const hinted = platformMajor(info);
	if (hinted !== null) return hinted >= 1 ? 10 : 6;
	const nt = /Windows NT (\d+)\./.exec(info.os.userAgent);
	return nt ? Number.parseInt(nt[1] ?? "", 10) : null;
}

// The OS bitness, not the browser's: a 32-bit browser on 64-bit Windows says WOW64.
// Absence of a marker proves nothing (reduced UAs), so only positive evidence counts.
function is64BitFrom(info: SystemInfo): boolean | null {
	if (info.os.bitness === "64" || info.os.wow64 === true) return true;
	if (/Win64|x64|WOW64|ARM64|aarch64/i.test(info.os.userAgent)) return true;
	if (info.os.bitness === "32" && info.os.wow64 === false) return false;
	return null;
}
