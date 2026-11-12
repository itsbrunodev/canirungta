const MIB = 1024 * 1024;

const FAMILIES: Record<string, string> = {
	w: "windows",
	l: "linux",
	d: "darwin",
	b: "bsd",
};

const DISK_KINDS: Record<string, string> = { s: "ssd", h: "hdd" };

// Link formats are positional arrays (see public/sh) to keep URLs short. Expanding them to the
// schema object keeps saved probes and specsFromProbe on a single shape.
export function expandCompactProbe(raw: unknown): unknown | null {
	if (Array.isArray(raw) && raw[0] === 4) return expandV4(raw);
	if (!Array.isArray(raw) || raw[0] !== 3) return null;
	const [
		,
		family,
		name,
		winMajor,
		is64,
		ramMib,
		unified,
		cores,
		gpus,
		disks,
		vulkan,
		cpuModel,
	] = raw;

	return {
		schemaVersion: 2,
		os: {
			family: FAMILIES[String(family)] ?? "unknown",
			name,
			version: typeof winMajor === "number" ? `${winMajor}.0` : null,
			arch: is64 === 1 ? "64-bit" : is64 === 0 ? "32-bit" : null,
		},
		cpu: { logicalCores: cores, model: cpuModel },
		memory: { totalBytes: mibToBytes(ramMib), unified: unified === 1 },
		gpus: asArray(gpus).map((gpu) => {
			const [gpuName, vramMib, integrated] = asArray(gpu);
			return {
				name: gpuName,
				vramBytes: mibToBytes(vramMib),
				integrated: integrated === 1,
			};
		}),
		disks: asArray(disks).map((free) => ({ freeBytes: mibToBytes(free) })),
		vulkan,
	};
}

function asArray(value: unknown): unknown[] {
	return Array.isArray(value) ? value : [];
}

function mibToBytes(value: unknown): number | null {
	return typeof value === "number" ? value * MIB : null;
}

// v4: [4, family, OS name, Windows major, 64-bit flag, RAM MiB, unified, logical cores,
// [[gpu name, VRAM MiB, integrated, driver]], [[free MiB, "s"|"h"|null, total MiB, label]], vulkan, CPU model,
// physical cores, max MHz, RAM MHz, RAM type].
function expandV4(raw: unknown[]): unknown {
	const [
		,
		family,
		name,
		winMajor,
		is64,
		ramMib,
		unified,
		cores,
		gpus,
		disks,
		vulkan,
		cpuModel,
		physicalCores,
		maxClockMhz,
		ramSpeedMhz,
		ramType,
	] = raw;

	return {
		schemaVersion: 3,
		os: {
			family: FAMILIES[String(family)] ?? "unknown",
			name,
			version: typeof winMajor === "number" ? `${winMajor}.0` : null,
			arch: is64 === 1 ? "64-bit" : is64 === 0 ? "32-bit" : null,
		},
		cpu: { logicalCores: cores, model: cpuModel, physicalCores, maxClockMhz },
		memory: {
			totalBytes: mibToBytes(ramMib),
			unified: unified === 1,
			speedMhz: ramSpeedMhz,
			type: ramType,
		},
		gpus: asArray(gpus).map((gpu) => {
			const [gpuName, vramMib, integrated, driver] = asArray(gpu);
			return {
				name: gpuName,
				vramBytes: mibToBytes(vramMib),
				integrated: integrated === 1,
				driver,
			};
		}),
		disks: asArray(disks).map((disk) => {
			const [free, kind, total, label] = asArray(disk);
			return {
				freeBytes: mibToBytes(free),
				kind: DISK_KINDS[String(kind)] ?? null,
				totalBytes: mibToBytes(total),
				label: typeof label === "string" ? label : null,
			};
		}),
		vulkan,
	};
}
