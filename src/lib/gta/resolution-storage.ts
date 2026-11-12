import { RESOLUTIONS } from "@/constants/gta/performance-model";
import { RESOLUTION_STORAGE_KEY } from "@/constants/storage-keys";

import type { ResolutionId } from "@/lib/gta/performance-types";

// Storage can throw (private mode, blocked site data); the picker then just forgets its choice.
export function loadResolution(): ResolutionId | null {
	try {
		const stored = localStorage.getItem(RESOLUTION_STORAGE_KEY);
		return RESOLUTIONS.find((r) => r.id === stored)?.id ?? null;
	} catch {
		return null;
	}
}

export function saveResolution(resolution: ResolutionId): void {
	try {
		localStorage.setItem(RESOLUTION_STORAGE_KEY, resolution);
	} catch {
		// Nothing to do: the choice still applies for this visit.
	}
}
