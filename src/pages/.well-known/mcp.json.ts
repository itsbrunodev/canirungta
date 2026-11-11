// Discovery stub so agents can find the MCP endpoint from the domain alone.
export function GET() {
	return new Response(
		JSON.stringify({
			name: "canirungta",
			description: "Check PC specs against every PC GTA release.",
			transport: "streamable-http",
			url: "https://canirungta.com/mcp",
			openapi: "https://canirungta.com/openapi.json",
			llms: "https://canirungta.com/llms.txt",
		}),
		{ headers: { "Content-Type": "application/json" } },
	);
}
