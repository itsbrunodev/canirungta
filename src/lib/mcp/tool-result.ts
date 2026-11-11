// Text for older clients, structuredContent for ones that read typed results.
export function toolResult(payload: object, isError = false) {
	return {
		content: [{ type: "text", text: JSON.stringify(payload) }],
		structuredContent: payload,
		isError,
	};
}

// MCP arguments arrive as JSON; the check parser takes query-string form.
export function toSearchParams(args: Record<string, unknown>): URLSearchParams {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(args)) {
		if (typeof value === "string" || typeof value === "number") {
			params.set(key, String(value));
		}
	}
	return params;
}
