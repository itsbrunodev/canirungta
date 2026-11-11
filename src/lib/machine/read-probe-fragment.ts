import { expandCompactProbe } from "@/lib/machine/expand-compact-probe";

// Links from before the compact format.
const LEGACY_PREFIX = "#system=";

// Returns the probe as a schema 1/2 object, or null when the hash is absent or malformed.
// New links are just "#" + URL-safe base64 of the v3 array, as short as the data allows.
export function readProbeFromHash(hash: string): unknown | null {
	if (hash.length < 2) return null;

	try {
		if (hash.startsWith(LEGACY_PREFIX)) {
			return JSON.parse(decodeBase64Utf8(hash.slice(LEGACY_PREFIX.length)));
		}
		return expandCompactProbe(JSON.parse(decodeBase64Utf8(hash.slice(1))));
	} catch {
		return null;
	}
}

// Probe output is UTF-8, which atob() alone would mangle.
function decodeBase64Utf8(encoded: string): string {
	const standard = encoded.replace(/-/g, "+").replace(/_/g, "/");
	const binary = atob(standard.padEnd(Math.ceil(standard.length / 4) * 4, "="));
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}
