import type { APIContext } from "astro";

import { MCP_MAX_BATCH, MCP_MAX_BODY_BYTES } from "@/constants/api/rate-limit";

import { clientKey } from "@/lib/api/client-key";
import { rateLimitHeaders, takeRateLimit } from "@/lib/api/rate-limit";
import { handleRpc } from "@/lib/mcp/handle-rpc";
import { rpcError } from "@/lib/mcp/rpc-error";

export const prerender = false;

const ALLOW = "POST, OPTIONS";

const CORS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": ALLOW,
	"Access-Control-Allow-Headers":
		"Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version",
	"Access-Control-Expose-Headers":
		"RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, Retry-After",
};

export function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS });
}

// Stateless server: no SSE stream (GET) and no sessions to end (DELETE). The spec asks for 405
// here; the JSON-RPC body tells a probing client it did reach an MCP server.
export function ALL() {
	return json(
		rpcError(
			null,
			-32000,
			"Method not allowed. This is a stateless MCP server (streamable HTTP): POST JSON-RPC messages to this URL.",
		),
		405,
		{ Allow: ALLOW },
	);
}

export async function POST(context: APIContext) {
	const limit = takeRateLimit(clientKey(context));
	const limitHeaders = rateLimitHeaders(limit);
	if (!limit.allowed) {
		return json(
			rpcError(null, -32000, "Rate limit exceeded. Retry later."),
			429,
			limitHeaders,
		);
	}

	const text = await context.request.text();
	if (text.length > MCP_MAX_BODY_BYTES) {
		return json(rpcError(null, -32600, "Request too large"), 413, limitHeaders);
	}
	let body: unknown;
	try {
		body = JSON.parse(text);
	} catch {
		return json(rpcError(null, -32700, "Parse error"), 400, limitHeaders);
	}
	const messages = Array.isArray(body) ? body : [body];
	if (messages.length > MCP_MAX_BATCH) {
		return json(
			rpcError(null, -32600, `Batch too large (max ${MCP_MAX_BATCH})`),
			400,
			limitHeaders,
		);
	}

	const replies = messages.map(handleRpc).filter((reply) => reply !== null);
	if (replies.length === 0) {
		return new Response(null, {
			status: 202,
			headers: { ...CORS, ...limitHeaders },
		});
	}
	return json(Array.isArray(body) ? replies : replies[0], 200, limitHeaders);
}

function json(payload: unknown, status = 200, extra: HeadersInit = {}) {
	return new Response(JSON.stringify(payload), {
		status,
		headers: { ...CORS, "Content-Type": "application/json", ...extra },
	});
}
