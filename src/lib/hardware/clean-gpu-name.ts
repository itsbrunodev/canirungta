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
// Firefox and Safari return the model directly ("Mesa Intel(R) UHD Graphics 620 (CFL GT2)", "Apple GPU").
export function cleanWebglRenderer(renderer: string | null): string | null {
	if (!renderer) return renderer;
	const angle = /^ANGLE \((.*)\)$/.exec(renderer.trim());
	if (!angle?.[1]) return tidyModel(renderer) || renderer.trim();
	// Mesa drivers put commas inside the model, e.g. "AMD Radeon RX 6700 XT (radeonsi, navi22, LLVM 15)".
	const fields = angle[1].split(", ");
	const model = tidyModel(fields[1] ?? fields[0] ?? "");
	return model || renderer.trim();
}

function tidyModel(text: string): string {
	return (
		text
			.split("/")[0]
			?.replace(/^.*\bRenderer:\s*/i, "")
			.replace(/^Mesa\s+/i, "")
			.replace(/\s*\((?:0x[0-9a-f]+|[A-Z]{2,4}\s?GT\d)\)/i, "")
			.replace(
				/\s*\((?:radeonsi|iris|crocus|zink|llvmpipe|nouveau|anv|radv|nvk)\b.*$/i,
				"",
			)
			.replace(/\s+Direct3D.*$/i, "")
			.replace(/\((?:r|tm)\)/gi, "")
			.replace(/^(?:nvidia|amd|intel)\s+(?:corporation\s+)?/i, "")
			.trim() ?? ""
	);
}
