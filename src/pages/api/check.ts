import type { APIContext } from "astro";

import { SPEC_PARAM_NAMES } from "@/constants/api/check-params";

import { buildCheckResponse } from "@/lib/api/build-check-response";
import { clientKey } from "@/lib/api/client-key";
import { hasSpecParams, parseCheckQuery } from "@/lib/api/parse-check-query";
import { rateLimitHeaders, takeRateLimit } from "@/lib/api/rate-limit";

export const prerender = false;

// Open to any origin: read-only, no credentials, meant for AI agents and scripts.
const HEADERS = {
	"Content-Type": "application/json",
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Cache-Control": "public, max-age=3600",
};

export function OPTIONS() {
	return new Response(null, { status: 204, headers: HEADERS });
}

export function GET(context: APIContext) {
	const { url } = context;
	const limit = takeRateLimit(clientKey(context));
	const limitHeaders = rateLimitHeaders(limit);
	if (!limit.allowed) {
		return new Response(
			JSON.stringify({ error: "Rate limit exceeded. Retry later." }),
			// Not cacheable: the next caller must not be served someone else's 429.
			{
				status: 429,
				headers: { ...HEADERS, ...limitHeaders, "Cache-Control": "no-store" },
			},
		);
	}
	if (!hasSpecParams(url.searchParams)) {
		return new Response(
			JSON.stringify({
				error: `Pass at least one of: ${SPEC_PARAM_NAMES.join(", ")}.`,
				example: "/api/check?cpu=Ryzen%205%205600&gpu=RTX%203060&ram=16",
				docs: "/llms.txt",
			}),
			{ status: 400, headers: { ...HEADERS, ...limitHeaders } },
		);
	}
	const body = buildCheckResponse(parseCheckQuery(url.searchParams));
	// No limit headers here: the response is cached and shared, so per-client counts would mislead.
	return new Response(JSON.stringify(body, null, 2), { headers: HEADERS });
}
