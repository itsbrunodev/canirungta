import { describe, expect, it } from "vitest";

import {
	RATE_LIMIT_MAX,
	RATE_LIMIT_WINDOW_MS,
} from "@/constants/api/rate-limit";

import { rateLimitHeaders, takeRateLimit } from "@/lib/api/rate-limit";

describe("takeRateLimit", () => {
	it("allows up to the limit, then blocks until the window resets", () => {
		const now = 1_000_000;
		for (let i = 0; i < RATE_LIMIT_MAX; i++) {
			expect(takeRateLimit("a", now).allowed).toBe(true);
		}
		const blocked = takeRateLimit("a", now + 1);
		expect(blocked.allowed).toBe(false);
		expect(blocked.remaining).toBe(0);
		expect(rateLimitHeaders(blocked)["Retry-After"]).toBeDefined();

		expect(takeRateLimit("a", now + RATE_LIMIT_WINDOW_MS).allowed).toBe(true);
	});

	it("counts clients separately", () => {
		const now = 2_000_000;
		for (let i = 0; i <= RATE_LIMIT_MAX; i++) takeRateLimit("b", now);
		const other = takeRateLimit("c", now);
		expect(other.allowed).toBe(true);
		expect(other.remaining).toBe(RATE_LIMIT_MAX - 1);
		expect(rateLimitHeaders(other)["Retry-After"]).toBeUndefined();
	});
});
