import {
	CHECK_PARAMS,
	CHECK_SUMMARY,
	SPEC_PARAM_NAMES,
} from "@/constants/api/check-params";

import { buildCheckResponse } from "@/lib/api/build-check-response";
import { hasSpecParams, parseCheckQuery } from "@/lib/api/parse-check-query";
import type { ManualSpecs } from "@/lib/machine/manual-specs";
import { manualSpecsFromCheckQuery } from "@/lib/machine/manual-specs-from-query";
import { toSearchParams } from "@/lib/mcp/tool-result";

// WebMCP (navigator.modelContext) is experimental and absent in most browsers, so it is typed here.
interface ModelContext {
	registerTool: (tool: object) => void;
}

// Lets an in-browser AI agent enter specs directly instead of driving the form.
// The page shows the same specs, so the user sees what the agent checked.
export function registerCheckTool(onSpecs: (specs: ManualSpecs) => void) {
	const modelContext = (navigator as { modelContext?: ModelContext })
		.modelContext;
	if (typeof modelContext?.registerTool !== "function") return;

	try {
		modelContext.registerTool({
			name: "check_gta_compatibility",
			description: `${CHECK_SUMMARY} Provide at least one of ${SPEC_PARAM_NAMES.join(", ")}. Also fills the page with these specs.`,
			inputSchema: {
				type: "object",
				properties: Object.fromEntries(
					CHECK_PARAMS.map(({ name, type, description, enum: values }) => [
						name,
						{ type, description, ...(values && { enum: values }) },
					]),
				),
			},
			execute(args: Record<string, unknown>) {
				const params = toSearchParams(args ?? {});
				if (!hasSpecParams(params)) {
					return text({
						error: `Pass at least one of: ${SPEC_PARAM_NAMES.join(", ")}.`,
					});
				}
				const parsed = parseCheckQuery(params);
				onSpecs(manualSpecsFromCheckQuery(parsed.query));
				return text(buildCheckResponse(parsed));
			},
		});
	} catch {
		// Draft API: a changed signature or duplicate registration must not break the page.
	}
}

function text(payload: object) {
	return { content: [{ type: "text", text: JSON.stringify(payload) }] };
}
