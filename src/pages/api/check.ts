import type { APIContext } from "astro";

import { buildCheckResponse } from "@/lib/api/build-check-response";
import { parseCheckQuery } from "@/lib/api/parse-check-query";

export const prerender = false;

// Open to any origin: read-only, no credentials, meant for AI agents and scripts.
const HEADERS = {
	"Content-Type": "application/json",
	"Access-Control-Allow-Origin": "*",
	"Cache-Control": "public, max-age=3600",
};

export function GET({ url }: APIContext) {
	const parsed = parseCheckQuery(url.searchParams);
	const hasSpecs = [...url.searchParams.keys()].some((key) => key !== "os");
	if (!hasSpecs) {
		return new Response(
			JSON.stringify({
				error:
					"Pass at least one of: cpu, gpu, ram, vram, disk. See /llms.txt.",
			}),
			{ status: 400, headers: HEADERS },
		);
	}
	return new Response(JSON.stringify(buildCheckResponse(parsed), null, 2), {
		headers: HEADERS,
	});
}
