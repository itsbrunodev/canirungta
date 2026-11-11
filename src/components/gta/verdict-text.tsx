import { VERDICT_LABELS } from "@/constants/gta/verdict-labels";

import type { CheckRow, Verdict } from "@/lib/gta/types";

interface VerdictTextProps {
	verdict: Verdict;
	checks: CheckRow[];
}

const FAILED_NAMES: Record<string, string> = {
	RAM: "RAM",
	VRAM: "VRAM",
	Disk: "disk space",
};

const listFormat = new Intl.ListFormat("en", {
	style: "long",
	type: "conjunction",
});

export function VerdictText({ verdict, checks }: VerdictTextProps) {
	const label = VERDICT_LABELS[verdict];
	const text = verdict === "cannot" ? describeFailure(checks) : label.text;

	return (
		<p
			class={`animate-rise font-medium text-base leading-snug sm:text-xl sm:leading-tight ${label.className}`}
		>
			{text}
		</p>
	);
}

function describeFailure(checks: CheckRow[]): string {
	const failed = checks
		.filter((check) => check.status === "fail")
		.map((check) => FAILED_NAMES[check.label] ?? check.label);

	if (failed.length === 0) return VERDICT_LABELS.cannot.text;

	return `No, your PC falls short on ${listFormat.format(failed)}.`;
}
