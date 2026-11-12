import { MOBILE_PATTERN } from "@/constants/hardware/reference-specs";

import { findRecord } from "@/lib/hardware/estimate-gpu";
import { normalizeName } from "@/lib/hardware/normalize-name";

export interface VramRange {
	minGb: number;
	maxGb: number;
}

// Dedicated-card VRAM from the model name, as a range because partners ship several sizes of one chipset.
// Laptop parts are skipped: they carry less memory than the desktop card sharing their name.
export function lookupVram(name: string): VramRange | null {
	if (MOBILE_PATTERN.test(name.toLowerCase())) return null;
	const record = findRecord(normalizeName(name));
	if (!record?.vram_min_gb || !record.vram_max_gb) return null;
	return { minGb: record.vram_min_gb, maxGb: record.vram_max_gb };
}
