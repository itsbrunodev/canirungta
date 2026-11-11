// lspci names look like "NVIDIA Corporation TU116 [GeForce GTX 1650 SUPER] (rev a1)" or
// "Advanced Micro Devices, Inc. [AMD/ATI] Navi 22 [Radeon RX 6700 XT]". The marketing name is the
// last bracket; names without one (Windows, macOS, WebGL) pass through untouched.
export function cleanGpuName(name: string | null): string | null {
	if (!name) return name;
	const withoutRevision = name.replace(/\s*\(rev [0-9a-f]+\)\s*$/i, "");
	const brackets = [...withoutRevision.matchAll(/\[([^\]]+)\]/g)]
		.map((match) => match[1]?.trim() ?? "")
		.filter((text) => text && text !== "AMD/ATI");
	return brackets.at(-1) ?? withoutRevision.trim();
}
