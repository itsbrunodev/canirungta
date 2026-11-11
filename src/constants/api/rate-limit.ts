// Per client IP, shared by /mcp and /api/check. Generous for an agent, tight for a flood.
export const RATE_LIMIT_MAX = 60;
export const RATE_LIMIT_WINDOW_MS = 60_000;
// Drop expired entries once the table grows past this, so it cannot grow without bound.
export const RATE_LIMIT_MAX_CLIENTS = 5000;

// A check call is tiny; anything bigger is not a legitimate request.
export const MCP_MAX_BODY_BYTES = 32 * 1024;
export const MCP_MAX_BATCH = 10;
