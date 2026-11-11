import { cleanWebglRenderer } from "@/lib/hardware/clean-gpu-name";
import type { MachineSpecs, OsFamily } from "@/lib/machine/types";
import type { SystemInfo } from "@/lib/system-info/types";

const GIB = 1024 ** 3;
// Browsers cap deviceMemory at 8 GB; a value of 8 means "8 or more".
const DEVICE_MEMORY_CAP_GB = 8;

// Fallback when the probe link is missing: no disk or VRAM figures are available.
export function specsFromBrowser(info: SystemInfo): MachineSpecs {
	const deviceMemoryGb = info.memory.deviceMemoryGb;

	return {
		source: "browser",
		osFamily: osFamilyFrom(info.os.platform, info.os.userAgent),
		osName: info.os.platform,
		windowsMajor: windowsMajorFrom(info),
		is64Bit: null,
		ramBytes: deviceMemoryGb === null ? null : deviceMemoryGb * GIB,
		ramIsCapped:
			deviceMemoryGb !== null && deviceMemoryGb >= DEVICE_MEMORY_CAP_GB,
		unifiedMemory: false,
		disks: [],
		logicalCores: info.cpu.logicalCores,
		cpuModel: null,
		gpus:
			info.gpu.renderer === null
				? []
				: [
						{
							name: cleanWebglRenderer(info.gpu.renderer),
							vramBytes: null,
							integrated: false,
						},
					],
		vulkan: null,
	};
}

// Android and ChromeOS UAs contain "Linux", iOS contains "Mac OS X": test them first.
function osFamilyFrom(platform: string | null, userAgent: string): OsFamily {
	const text = `${platform ?? ""} ${userAgent}`;
	if (/Android|iPhone|iPad|iPod|CrOS|Chrome OS/i.test(text)) return "mobile";
	if (/Windows/i.test(text)) return "windows";
	if (/Mac/i.test(text)) return "darwin";
	if (/BSD/i.test(text)) return "bsd";
	if (/Linux|X11/i.test(text)) return "linux";
	return "unknown";
}

// Chromium client hints: platformVersion "13.0.0" or higher means Windows 11 (still major 10).
// Without hints the UA says "Windows NT 10.0" for both, so only older versions are detectable.
function windowsMajorFrom(info: SystemInfo): number | null {
	if (!/Windows/i.test(`${info.os.platform ?? ""} ${info.os.userAgent}`)) {
		return null;
	}
	const hinted = Number.parseInt(info.os.platformVersion ?? "", 10);
	if (Number.isFinite(hinted)) return hinted >= 1 ? 10 : null;
	const nt = /Windows NT (\d+)\./.exec(info.os.userAgent);
	return nt ? Number.parseInt(nt[1] ?? "", 10) : null;
}
