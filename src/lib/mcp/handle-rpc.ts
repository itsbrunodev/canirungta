import { CHECK_TOOL, runCheckTool } from "@/lib/mcp/check-tool";

const PROTOCOL_VERSION = "2025-06-18";

interface RpcRequest {
	jsonrpc: "2.0";
	id?: string | number;
	method: string;
	params?: Record<string, unknown>;
}

// Minimal stateless MCP (streamable HTTP, JSON replies): enough for tools/list and tools/call.
// Returns null for notifications, which take no response.
export function handleRpc(body: unknown): object | null {
	if (!isRequest(body)) {
		return error(null, -32600, "Invalid request");
	}
	const { id, method, params } = body;
	if (id === undefined) return null;

	switch (method) {
		case "initialize":
			return ok(id, {
				protocolVersion: PROTOCOL_VERSION,
				capabilities: { tools: {} },
				serverInfo: { name: "canirungta", version: "1.0.0" },
				instructions:
					"Use check_gta_compatibility to test a PC's specs against every PC GTA release.",
			});
		case "ping":
			return ok(id, {});
		case "tools/list":
			return ok(id, { tools: [CHECK_TOOL] });
		case "tools/call":
			if (params?.name !== CHECK_TOOL.name) {
				return error(id, -32602, "Unknown tool");
			}
			return ok(id, runCheckTool(asRecord(params.arguments)));
		default:
			return error(id, -32601, "Method not found");
	}
}

function isRequest(body: unknown): body is RpcRequest {
	return (
		typeof body === "object" &&
		body !== null &&
		(body as RpcRequest).jsonrpc === "2.0" &&
		typeof (body as RpcRequest).method === "string"
	);
}

function asRecord(value: unknown): Record<string, unknown> {
	return typeof value === "object" && value !== null
		? (value as Record<string, unknown>)
		: {};
}

function ok(id: string | number, result: object) {
	return { jsonrpc: "2.0", id, result };
}

function error(id: string | number | null, code: number, message: string) {
	return { jsonrpc: "2.0", id, error: { code, message } };
}
