import { SITE_URL } from "@/constants/site";

import type { CheckQuery } from "@/lib/api/parse-check-query";

// Link to the human page pre-filled with the same specs, for agents to hand to their user.
export function buildResultsUrl(query: CheckQuery): string {
	const params = new URLSearchParams();
	if (query.cpu) params.set("cpu", query.cpu);
	if (query.gpu) params.set("gpu", query.gpu);
	if (query.ramGb !== null) params.set("ram", String(query.ramGb));
	if (query.vramGb !== null) params.set("vram", String(query.vramGb));
	if (query.diskFreeGb !== null) params.set("disk", String(query.diskFreeGb));
	return `${SITE_URL}/?${params}`;
}
