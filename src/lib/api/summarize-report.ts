import type { VersionReport } from "@/lib/gta/types";

// One plain sentence per version, so an agent can relay the verdict without decoding the check rows.
export function summarizeReport({ verdict, checks }: VersionReport): string {
	const failed = labels(checks, "fail");
	const unknown = labels(checks, "unknown");

	switch (verdict) {
		case "runs-well":
			return "Meets the recommended specs.";
		case "runs":
			return "Meets the minimum specs, but not the recommended ones.";
		case "cannot":
			return `Below the minimum specs: ${failed} failed.`;
		case "unsupported":
			return "No version for phones, tablets or Chromebooks.";
		case "needs-windows":
			return unknown === "OS"
				? "Hardware meets the minimum, but the game is Windows-only; Linux/macOS needs Proton or Wine (not tested)."
				: `No check failed, but the game is Windows-only (Proton or Wine needed) and these are unknown: ${unknown}.`;
		default:
			return `No verdict: ${unknown} unknown. Supply the missing specs.`;
	}
}

function labels(checks: VersionReport["checks"], status: string): string {
	return checks
		.filter((check) => check.status === status)
		.map((check) => check.label)
		.join(", ");
}
