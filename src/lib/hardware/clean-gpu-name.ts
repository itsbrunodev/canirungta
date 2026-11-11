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

// WebGL renderers on Chromium look like "ANGLE (NVIDIA Corporation, NVIDIA GeForce GTX 1650 SUPER/PCIe/SSE2, OpenGL ES 3.2)".
// Keep just the model: the middle field, without vendor words, "(R)", hex ids or the "/PCIe/..." tail.
export function cleanWebglRenderer(renderer: string | null): string | null {
	if (!renderer) return renderer;
	const angle = /^ANGLE \((.*)\)$/.exec(renderer.trim());
	if (!angle?.[1]) return renderer.trim();
	const fields = angle[1].split(", ");
	const model = (fields[1] ?? fields[0] ?? "")
		.split("/")[0]
		?.replace(/\s*\(0x[0-9a-f]+\)/i, "")
		.replace(/\s+Direct3D.*$/i, "")
		.replace(/\((?:r|tm)\)/gi, "")
		.replace(/^(?:nvidia|amd|intel)\s+(?:corporation\s+)?/i, "")
		.trim();
	return model || renderer.trim();
}
