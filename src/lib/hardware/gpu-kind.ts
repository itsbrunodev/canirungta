// Shared-memory GPUs. Names may be raw ("Intel(R) UHD Graphics 620") or already cleaned ("UHD Graphics 620").
// Radeon 780M / 890M have no "RX"; discrete laptop cards (RX 6600M) do, so they stay out.
const INTEGRATED_PATTERN =
	/\b(?:UHD|HD|Iris(?:\(R\))?(?:\s(?:Xe|Plus|Pro))?|Xe|Arc(?:\(TM\))?)\s+Graphics|\bIris\b|Radeon(?:\(TM\))?\s+Graphics|Radeon(?:\(TM\))?\s+\d{3,4}[MS]\b|Vega\s+\d+\s+Graphics|Adreno|Qualcomm|Mali|^Apple\b/i;

export function isIntegratedGpu(name: string | null): boolean {
	return name !== null && INTEGRATED_PATTERN.test(name);
}

// Apple Silicon: chip names like "Apple M2 Pro" (Safari only says "Apple GPU").
export function isAppleSiliconGpu(name: string | null): boolean {
	return name !== null && /^Apple\b/i.test(name);
}

// Chip name usable as the CPU model ("Apple M2 Pro"); null for plain "Apple GPU".
export function appleChipName(name: string | null): string | null {
	const match = name
		? /^Apple\s+(M\d+(?:\s(?:Pro|Max|Ultra))?)/i.exec(name)
		: null;
	return match?.[1] ? `Apple ${match[1]}` : null;
}

// Renderers a browser falls back to when hardware acceleration is off or blocklisted.
const SOFTWARE_PATTERN =
	/SwiftShader|llvmpipe|softpipe|lavapipe|Software Rasterizer|Microsoft Basic Render|Mesa.*(?:software|swrast)|Mesa OffScreen/i;

export function isSoftwareRenderer(renderer: string | null): boolean {
	return renderer !== null && SOFTWARE_PATTERN.test(renderer);
}
