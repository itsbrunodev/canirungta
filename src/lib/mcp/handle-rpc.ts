import { CHECK_TOOL, runCheckTool } from "@/lib/mcp/check-tool";
import {
	REQUIREMENTS_TOOL,
	runRequirementsTool,
} from "@/lib/mcp/requirements-tool";
import { rpcError as error } from "@/lib/mcp/rpc-error";

// Newest first. Tools-only and stateless, so every revision behaves the same here.
const PROTOCOL_VERSIONS = [
	"2025-11-25",
	"2025-06-18",
	"2025-03-26",
	"2024-11-05",
];

type ToolRunner = (args: Record<string, unknown>) => object;

const RUNNERS: Record<string, ToolRunner> = {
	[CHECK_TOOL.name]: runCheckTool,
	[REQUIREMENTS_TOOL.name]: runRequirementsTool,
};

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
				protocolVersion: negotiate(params?.protocolVersion),
				capabilities: { tools: {} },
				serverInfo: {
					name: "canirungta",
					title: "Can I Run GTA?",
					version: "1.1.0",
				},
				instructions:
					"Use check_gta_compatibility to test a PC's specs against PC GTA releases; pass every spec the user gave and ask for missing ones instead of guessing. Use list_gta_requirements for the raw published requirements. GTA VI has no official PC specs: its figures are third-party projections, so say so.",
			});
		case "ping":
			return ok(id, {});
		case "tools/list":
			return ok(id, { tools: [CHECK_TOOL, REQUIREMENTS_TOOL] });
		case "tools/call": {
			const run = RUNNERS[String(params?.name)];
			if (!run) return error(id, -32602, "Unknown tool");
			return ok(id, run(asRecord(params?.arguments)));
		}
		default:
			return error(id, -32601, "Method not found");
	}
}

// Echo the client's revision when we speak it; otherwise offer our newest.
function negotiate(requested: unknown): string {
	return typeof requested === "string" && PROTOCOL_VERSIONS.includes(requested)
		? requested
		: (PROTOCOL_VERSIONS[0] as string);
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
