import type { APIContext } from "astro";

import { SPEC_PARAM_NAMES } from "@/constants/api/check-params";

import { buildCheckResponse } from "@/lib/api/build-check-response";
import { hasSpecParams, parseCheckQuery } from "@/lib/api/parse-check-query";

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

export function GET({ url }: APIContext) {
	if (!hasSpecParams(url.searchParams)) {
		return new Response(
			JSON.stringify({
				error: `Pass at least one of: ${SPEC_PARAM_NAMES.join(", ")}.`,
				example: "/api/check?cpu=Ryzen%205%205600&gpu=RTX%203060&ram=16",
				docs: "/llms.txt",
			}),
			{ status: 400, headers: HEADERS },
		);
	}
	const body = buildCheckResponse(parseCheckQuery(url.searchParams));
	return new Response(JSON.stringify(body, null, 2), { headers: HEADERS });
}
