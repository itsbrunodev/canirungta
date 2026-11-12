import type { DiskSpec } from "@/lib/machine/types";

// Stable across probe runs (free space changes, label and size do not).
export function diskId(disk: DiskSpec): string {
	return `${disk.label ?? ""}|${Math.round((disk.totalBytes ?? 0) / 1e9)}`;
}
