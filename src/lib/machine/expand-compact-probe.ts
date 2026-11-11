const MIB = 1024 * 1024;

const FAMILIES: Record<string, string> = {
	w: "windows",
	l: "linux",
	d: "darwin",
	b: "bsd",
};

// Link format v3 is a positional array (see public/sh) to keep URLs short. Expanding it to the
// schema 2 object keeps saved probes and specsFromProbe on a single shape.
export function expandCompactProbe(raw: unknown): unknown | null {
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
