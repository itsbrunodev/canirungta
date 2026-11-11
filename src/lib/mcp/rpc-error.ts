// JSON-RPC error envelope, also used for HTTP-level failures so MCP clients can always parse the body.
export function rpcError(
	id: string | number | null,
	code: number,
	message: string,
) {
	return { jsonrpc: "2.0", id, error: { code, message } };
}
