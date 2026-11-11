import {
	RATE_LIMIT_MAX,
	RATE_LIMIT_MAX_CLIENTS,
	RATE_LIMIT_WINDOW_MS,
} from "@/constants/api/rate-limit";

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	// Seconds until the client's window resets.
	resetSeconds: number;
}

interface Window {
	count: number;
	resetAt: number;
}

// In-memory fixed window. Each serverless instance counts on its own, so this only blunts a burst
// against one instance; a hard cross-instance limit belongs in the platform firewall.
const windows = new Map<string, Window>();

export function takeRateLimit(
	client: string,
	now: number = Date.now(),
): RateLimitResult {
	let current = windows.get(client);
	if (!current || current.resetAt <= now) {
		if (windows.size >= RATE_LIMIT_MAX_CLIENTS) prune(now);
		current = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
		windows.set(client, current);
	}
	current.count += 1;
	return {
		allowed: current.count <= RATE_LIMIT_MAX,
		remaining: Math.max(0, RATE_LIMIT_MAX - current.count),
		resetSeconds: Math.ceil((current.resetAt - now) / 1000),
	};
}

// IETF draft names plus the older X- ones many clients still read.
export function rateLimitHeaders(
	result: RateLimitResult,
): Record<string, string> {
	const headers: Record<string, string> = {
		"RateLimit-Limit": String(RATE_LIMIT_MAX),
		"RateLimit-Remaining": String(result.remaining),
		"RateLimit-Reset": String(result.resetSeconds),
		"X-RateLimit-Limit": String(RATE_LIMIT_MAX),
		"X-RateLimit-Remaining": String(result.remaining),
		"X-RateLimit-Reset": String(result.resetSeconds),
	};
	if (!result.allowed) headers["Retry-After"] = String(result.resetSeconds);
	return headers;
}

function prune(now: number) {
	for (const [client, window] of windows) {
		if (window.resetAt <= now) windows.delete(client);
	}
	// Still full of live windows: a flood from many addresses. Start over rather than grow.
	if (windows.size >= RATE_LIMIT_MAX_CLIENTS) windows.clear();
}
