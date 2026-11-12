import { OS_ALIASES } from "@/constants/machine/os-options";

import type { OsFamily } from "@/lib/machine/types";

export interface ParsedOs {
	family: OsFamily;
	// Windows only; null when the text names no version.
	windowsMajor: number | null;
}

// Free text to an OS the checker understands; null when it is not one we know.
export function parseOsName(text: string): ParsedOs | null {
	if (/\bwin(dows)?\b/i.test(text) || /\bwin\s?\d/i.test(text)) {
		return { family: "windows", windowsMajor: windowsMajor(text) };
	}
	const alias = OS_ALIASES.find(({ pattern }) => pattern.test(text));
	return alias ? { family: alias.family, windowsMajor: null } : null;
}

function windowsMajor(text: string): number | null {
	// 11 reports as major 10, like the probe does.
	if (/\b(11|10)\b/.test(text)) return 10;
	if (/\b8(\.1)?\b/.test(text)) return 8;
	if (/\b7\b/.test(text)) return 7;
	return null;
}
