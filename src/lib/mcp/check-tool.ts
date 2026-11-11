import { CHECK_PARAMS, CHECK_SUMMARY } from "@/constants/api/check-params";

import { buildCheckResponse } from "@/lib/api/build-check-response";
import { parseCheckQuery } from "@/lib/api/parse-check-query";

export const CHECK_TOOL = {
	name: "check_gta_compatibility",
	description: `${CHECK_SUMMARY} Provide at least one of cpu, gpu, ram, vram, disk.`,
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
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(args)) {
		if (typeof value === "string" || typeof value === "number") {
			params.set(key, String(value));
		}
	}
	const hasSpecs = [...params.keys()].some((key) => key !== "os");
	if (!hasSpecs) {
		return toolResult({ error: "Pass at least one spec." }, true);
	}
	return toolResult(buildCheckResponse(parseCheckQuery(params)), false);
}

function toolResult(payload: unknown, isError: boolean) {
	return {
		content: [{ type: "text", text: JSON.stringify(payload) }],
		isError,
	};
}
