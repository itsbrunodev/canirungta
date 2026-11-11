import { cleanGpuName } from "@/lib/hardware/clean-gpu-name";
import type {
	DiskSpec,
	GpuSpec,
	MachineSpecs,
	OsFamily,
} from "@/lib/machine/types";

// Input is untrusted (it comes from the URL), so every field is type-checked.
// Schema 1 (no per-disk list, no unified flag) is still accepted for saved probes.
export function specsFromProbe(raw: unknown): MachineSpecs | null {
	const root = asRecord(raw);
	if (root.schemaVersion !== 1 && root.schemaVersion !== 2) return null;

	const os = asRecord(root.os);
	const cpu = asRecord(root.cpu);
	const memory = asRecord(root.memory);
	const disk = asRecord(root.disk);
	const gpus = Array.isArray(root.gpus) ? root.gpus : [];
	const osFamily = asOsFamily(os.family);

	return {
		source: "probe",
		osFamily,
		osName: asString(os.name),
		windowsMajor:
			osFamily === "windows" ? majorVersion(asString(os.version)) : null,
		is64Bit: osFamily === "windows" ? is64Bit(asString(os.arch)) : null,
		ramBytes: asNumber(memory.totalBytes),
		ramIsCapped: false,
		unifiedMemory: memory.unified === true,
		disks: disksFrom(root.disks, disk),
		logicalCores: asNumber(cpu.logicalCores),
		cpuModel: asString(cpu.model),
		gpus: gpus.map(toGpuSpec),
		vulkan: typeof root.vulkan === "boolean" ? root.vulkan : null,
	};
}

function disksFrom(rawList: unknown, legacy: Record<string, unknown>) {
	const fromList = Array.isArray(rawList)
		? rawList.map(toDiskSpec).filter((d): d is DiskSpec => d !== null)
		: [];
	if (fromList.length > 0) return fromList;

	// Fall back to the single $HOME-volume figure.
	const free = asNumber(legacy.freeBytes);
	return free === null ? [] : [{ freeBytes: free }];
}

function toDiskSpec(raw: unknown): DiskSpec | null {
	const freeBytes = asNumber(asRecord(raw).freeBytes);
	return freeBytes === null ? null : { freeBytes };
}

function toGpuSpec(raw: unknown): GpuSpec {
	const gpu = asRecord(raw);
	return {
		name: cleanGpuName(asString(gpu.name)),
		vramBytes: asNumber(gpu.vramBytes),
		integrated: gpu.integrated === true,
	};
}

// Windows reports "10.0.22631": Windows 11 is still major 10.
function majorVersion(version: string | null): number | null {
	const major = Number.parseInt(version?.split(".")[0] ?? "", 10);
	return Number.isFinite(major) ? major : null;
}

// "64-bit", "ARM 64-bit Processor", "32-bit"; a locale may translate the suffix, so match the digits.
function is64Bit(arch: string | null): boolean | null {
	if (!arch) return null;
	if (/64/.test(arch)) return true;
	if (/32/.test(arch)) return false;
	return null;
}

function asRecord(value: unknown): Record<string, unknown> {
	return typeof value === "object" && value !== null
		? (value as Record<string, unknown>)
		: {};
}

function asNumber(value: unknown): number | null {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asString(value: unknown): string | null {
	return typeof value === "string" && value.length > 0 ? value : null;
}

function asOsFamily(value: unknown): OsFamily {
	return value === "windows" ||
		value === "linux" ||
		value === "darwin" ||
		value === "bsd"
		? value
		: "unknown";
}
