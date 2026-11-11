import { PROBE_STORAGE_KEY } from "@/constants/storage-keys";

export interface StoredProbe {
	savedAt: string;
	probe: unknown;
}

// localStorage throws in private windows or with blocked site data, so every access is guarded.
export function saveProbe(probe: unknown): string | null {
	const savedAt = new Date().toISOString();
	try {
		const stored: StoredProbe = { savedAt, probe };
		localStorage.setItem(PROBE_STORAGE_KEY, JSON.stringify(stored));
		return savedAt;
	} catch {
		return null;
	}
}

export function loadProbe(): StoredProbe | null {
	try {
		const raw = localStorage.getItem(PROBE_STORAGE_KEY);
		if (!raw) return null;
		const parsed: unknown = JSON.parse(raw);
		if (
			typeof parsed === "object" &&
			parsed !== null &&
			"savedAt" in parsed &&
			typeof parsed.savedAt === "string" &&
			"probe" in parsed
		) {
			return { savedAt: parsed.savedAt, probe: parsed.probe };
		}
		return null;
	} catch {
		return null;
	}
}
