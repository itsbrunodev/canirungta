import { VERSION_IDS, VERSION_PARAM } from "@/constants/api/check-params";
import { GTA_VERSIONS } from "@/constants/gta/versions";

import { toolResult } from "@/lib/mcp/tool-result";

export const REQUIREMENTS_TOOL = {
	name: "list_gta_requirements",
	title: "List GTA system requirements",
	description:
		"Published minimum and recommended PC specs for each Grand Theft Auto release, with source URL and confidence (official, approximate, unannounced). A null figure means none was published.",
	inputSchema: {
		type: "object",
		properties: {
			version: {
				type: VERSION_PARAM.type,
				description: VERSION_PARAM.description,
			},
		},
	},
	annotations: { readOnlyHint: true, openWorldHint: false },
};

export function runRequirementsTool(args: Record<string, unknown>) {
	const wanted =
		typeof args.version === "string"
			? args.version
					.split(",")
					.map((id) => id.trim().toLowerCase())
					.filter(Boolean)
			: [];
	const unknown = wanted.filter((id) => !VERSION_IDS.includes(id));
	if (unknown.length > 0) {
		return toolResult(
			{
				error: `Unknown version: ${unknown.join(", ").slice(0, 200)}. Valid ids: ${VERSION_IDS.join(", ")}`,
			},
			true,
		);
	}
	const versions = GTA_VERSIONS.filter(
		(version) => wanted.length === 0 || wanted.includes(version.id),
	);
	return toolResult({ versions });
}
