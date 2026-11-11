import type { APIContext } from "astro";

import { handleRpc } from "@/lib/mcp/handle-rpc";

export const prerender = false;

const CORS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers":
		"Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version",
};

export function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS });
}

// Stateless server: no SSE stream or sessions, so GET is not offered.
export function GET() {
	return new Response("Use POST (MCP streamable HTTP)", {
		status: 405,
		headers: { ...CORS, Allow: "POST, OPTIONS" },
	});
}

export async function POST({ request }: APIContext) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({
			jsonrpc: "2.0",
			id: null,
			error: { code: -32700, message: "Parse error" },
		});
	}
	const messages = Array.isArray(body) ? body : [body];
	const replies = messages.map(handleRpc).filter((reply) => reply !== null);
	if (replies.length === 0)
		return new Response(null, { status: 202, headers: CORS });
	return json(Array.isArray(body) ? replies : replies[0]);
}

function json(payload: unknown) {
	return new Response(JSON.stringify(payload), {
		headers: { ...CORS, "Content-Type": "application/json" },
	});
}
