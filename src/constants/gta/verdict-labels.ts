import type { Verdict } from "@/lib/gta/types";

interface VerdictLabel {
	text: string;
	className: string;
}

export const VERDICT_LABELS: Record<Verdict, VerdictLabel> = {
	"runs-well": {
		text: "Yes, your PC meets the recommended requirements.",
		className: "text-pass",
	},
	runs: {
		text: "Yes, but only the minimum requirements; expect lower settings.",
		className: "text-pass",
	},
	cannot: {
		// Fallback; the badge names the failed checks when it can.
		text: "No, your PC is below the minimum requirements.",
		className: "text-fail",
	},
	"needs-windows": {
		text: "Maybe, but needs Windows or Proton.",
		className: "text-accent",
	},
	unsupported: {
		text: "No, GTA has no version for this device. Open this page on a PC.",
		className: "text-fail",
	},
	unknown: {
		text: "Maybe, but can't verify.",
		className: "text-muted-foreground",
	},
};
