import {
	CHECK_PARAMS,
	CHECK_SUMMARY,
	SPEC_PARAM_NAMES,
} from "@/constants/api/check-params";

import { buildCheckResponse } from "@/lib/api/build-check-response";
import { hasSpecParams, parseCheckQuery } from "@/lib/api/parse-check-query";
import { toolResult, toSearchParams } from "@/lib/mcp/tool-result";

export const CHECK_TOOL = {
	name: "check_gta_compatibility",
	title: "Check GTA compatibility",
	description: `${CHECK_SUMMARY} Provide at least one of ${SPEC_PARAM_NAMES.join(", ")}; ask the user for missing ones rather than guessing. Each result has a verdict, a one-line summary and per-component checks; resultsUrl opens the same check for the user.`,
	inputSchema: {
		type: "object",
		properties: Object.fromEntries(
			CHECK_PARAMS.map(({ name, type, description, enum: values }) => [
				name,
				{ type, description, ...(values && { enum: values }) },
			]),
		),
	},
	annotations: { readOnlyHint: true, openWorldHint: false },
};

export function runCheckTool(args: Record<string, unknown>) {
	const params = toSearchParams(args);
	if (!hasSpecParams(params)) {
		return toolResult(
			{ error: `Pass at least one of: ${SPEC_PARAM_NAMES.join(", ")}.` },
			true,
		);
	}
	return toolResult(buildCheckResponse(parseCheckQuery(params)));
}
