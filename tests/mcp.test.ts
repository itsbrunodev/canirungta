import { describe, expect, it } from "vitest";

import { handleRpc } from "@/lib/mcp/handle-rpc";

interface Reply {
	result: {
		isError: boolean;
		protocolVersion: string;
		structuredContent: { versions: { id: string }[] };
		capabilities: { tools: object };
		serverInfo: { name: string };
		tools: { name: string }[];
		content: { text: string }[];
	};
	error: { code: number };
}

function call(method: string, params?: Record<string, unknown>) {
	return handleRpc({ jsonrpc: "2.0", id: 1, method, params }) as Reply;
}

describe("handleRpc", () => {
	it("initializes with tools capability", () => {
		const reply = call("initialize");
		expect(reply.result.capabilities.tools).toBeDefined();
		expect(reply.result.serverInfo.name).toBe("canirungta");
	});

	it("returns null for notifications", () => {
		expect(
			handleRpc({ jsonrpc: "2.0", method: "notifications/initialized" }),
		).toBeNull();
	});

	it("lists the check tool", () => {
		const tools = call("tools/list").result.tools;
		expect(tools.map((t) => t.name)).toEqual([
			"check_gta_compatibility",
			"list_gta_requirements",
		]);
	});

	it("echoes a supported protocol version, else offers the newest", () => {
		const old = call("initialize", { protocolVersion: "2025-03-26" });
		expect(old.result.protocolVersion).toBe("2025-03-26");
		const odd = call("initialize", { protocolVersion: "1999-01-01" });
		expect(odd.result.protocolVersion).toBe("2025-11-25");
	});

	it("lists requirements, optionally for one version", () => {
		const all = call("tools/call", { name: "list_gta_requirements" });
		expect(all.result.structuredContent.versions.length).toBeGreaterThan(1);
		const one = call("tools/call", {
			name: "list_gta_requirements",
			arguments: { version: "gta-vi" },
		});
		expect(one.result.structuredContent.versions.map((v) => v.id)).toEqual([
			"gta-vi",
		]);
		const bad = call("tools/call", {
			name: "list_gta_requirements",
			arguments: { version: "nope" },
		});
		expect(bad.result.isError).toBe(true);
	});

	it("runs a check and returns JSON text", () => {
		const reply = call("tools/call", {
			name: "check_gta_compatibility",
			arguments: { gpu: "RTX 3060", ram: 16 },
		});
		expect(reply.result.isError).toBe(false);
		const payload = JSON.parse(reply.result.content[0].text);
		expect(payload.input.ramGb).toBe(16);
		expect(payload.results.length).toBeGreaterThan(0);
	});

	it("flags an empty check as a tool error", () => {
		const reply = call("tools/call", {
			name: "check_gta_compatibility",
			arguments: {},
		});
		expect(reply.result.isError).toBe(true);
	});

	it("rejects unknown tools, methods and malformed bodies", () => {
		expect(call("tools/call", { name: "nope" }).error.code).toBe(-32602);
		expect(call("nope").error.code).toBe(-32601);
		expect((handleRpc("junk") as Reply).error.code).toBe(-32600);
	});
});
