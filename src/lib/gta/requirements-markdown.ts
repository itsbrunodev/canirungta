import { GTA_VERSIONS } from "@/constants/gta/versions";
import { SITE_URL } from "@/constants/site";

import type { GtaRequirement, GtaVersion } from "@/lib/gta/types";

const CONFIDENCE_NOTES: Record<GtaVersion["confidence"], string> = {
	official: "official (published by Rockstar)",
	approximate: "approximate (third-party figures, not confirmed by Rockstar)",
	unannounced: "unannounced (no published requirements)",
};

// The whole dataset as Markdown, for crawlers and agents that cannot run the page's JavaScript.
export function buildRequirementsMarkdown(): string {
	return [
		"# PC system requirements for every Grand Theft Auto release",
		"",
		`Data behind ${SITE_URL}. "not published" means no figure exists, not zero. Where several CPUs or GPUs are listed, any one qualifies.`,
		"",
		`To test a specific PC, call ${SITE_URL}/api/check (docs: ${SITE_URL}/llms.txt). JSON version of this page: ${SITE_URL}/api/versions.json`,
		"",
		...GTA_VERSIONS.flatMap(versionSection),
	].join("\n");
}

function versionSection(version: GtaVersion): string[] {
	const { minimum, recommended, os } = version;
	const windows =
		os.minWindowsMajor === null
			? "Windows"
			: `Windows ${os.minWindowsMajor} or newer`;
	return [
		`## ${version.title} (${version.edition})`,
		"",
		`- id: \`${version.id}\``,
		`- Confidence: ${CONFIDENCE_NOTES[version.confidence]}`,
		`- Source: ${version.sourceUrl}`,
		`- OS: ${windows}${os.requires64Bit ? ", 64-bit" : ""}`,
		"",
		"| Component | Minimum | Recommended |",
		"| --- | --- | --- |",
		row("CPU", minimum, recommended, (req) => req.cpu?.join(" or ") ?? null),
		row("GPU", minimum, recommended, (req) => req.gpu?.join(" or ") ?? null),
		row("RAM", minimum, recommended, (req) => gb(req.ramGb)),
		row("VRAM", minimum, recommended, (req) => gb(req.vramGb)),
		row("Disk", minimum, recommended, (req) => gb(req.diskGb)),
		"",
	];
}

function row(
	label: string,
	minimum: GtaRequirement,
	recommended: GtaRequirement | null,
	read: (req: GtaRequirement) => string | null,
): string {
	const min = read(minimum) ?? "not published";
	// A missing recommended figure falls back to the minimum, as the checker does.
	const rec = (recommended && read(recommended)) ?? "same as minimum";
	return `| ${label} | ${min} | ${rec} |`;
}

// Old releases need well under 1 GB, which reads better in MB.
function gb(value: number | null): string | null {
	if (value === null) return null;
	return value < 1 ? `${Math.round(value * 1024)} MB` : `${value} GB`;
}
