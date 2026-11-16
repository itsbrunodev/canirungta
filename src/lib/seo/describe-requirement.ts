import { formatGb } from "@/lib/gta/format-gb";
import type { GtaRequirement, GtaVersion } from "@/lib/gta/types";

export const NOT_PUBLISHED = "Not published";

export interface RequirementRow {
	label: string;
	value: string;
}

// Same rows for the on-page table and the FAQ answers, so the two can never disagree.
export function describeRequirement(
	req: GtaRequirement,
	version: GtaVersion,
): RequirementRow[] {
	const { os } = version;
	const windows =
		os.minWindowsMajor === null ? "Windows" : `Windows ${os.minWindowsMajor}+`;
	return [
		{ label: "CPU", value: req.cpu?.join(" or ") ?? NOT_PUBLISHED },
		{ label: "GPU", value: req.gpu?.join(" or ") ?? NOT_PUBLISHED },
		{ label: "RAM", value: formatGb(req.ramGb) ?? NOT_PUBLISHED },
		{ label: "VRAM", value: formatGb(req.vramGb) ?? NOT_PUBLISHED },
		{ label: "Storage", value: formatGb(req.diskGb) ?? NOT_PUBLISHED },
		{
			label: "OS",
			value: `${windows}${os.requires64Bit ? ", 64-bit" : ""}`,
		},
	];
}

// Recommended tier falls back to the minimum field by field, like the checker does.
export function recommendedOf(version: GtaVersion): GtaRequirement {
	const { minimum, recommended } = version;
	return {
		cpu: recommended?.cpu ?? minimum.cpu,
		gpu: recommended?.gpu ?? minimum.gpu,
		ramGb: recommended?.ramGb ?? minimum.ramGb,
		vramGb: recommended?.vramGb ?? minimum.vramGb,
		diskGb: recommended?.diskGb ?? minimum.diskGb,
	};
}
