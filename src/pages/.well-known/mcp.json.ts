import { SITE_URL } from "@/constants/site";

// Discovery stub so agents can find the MCP endpoint from the domain alone.
export function GET() {
	return new Response(
		JSON.stringify({
			name: "canirungta",
			description:
				"Check PC specs against every PC GTA release, with estimated FPS per resolution and preset.",
			transport: "streamable-http",
			url: `${SITE_URL}/mcp`,
			tools: ["check_gta_compatibility", "list_gta_requirements"],
			openapi: `${SITE_URL}/openapi.json`,
			llms: `${SITE_URL}/llms.txt`,
			requirements: `${SITE_URL}/requirements.md`,
		}),
		{ headers: { "Content-Type": "application/json" } },
	);
}
