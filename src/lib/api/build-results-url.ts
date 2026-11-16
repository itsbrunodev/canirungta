import { SITE_URL } from "@/constants/site";

import type { CheckQuery } from "@/lib/api/parse-check-query";
import { sharedGamePage } from "@/lib/seo/game-page-url";

// Link to the human page pre-filled with the same specs, for agents to hand to their user.
// A check limited to one game's editions opens that game's page instead of the homepage.
export function buildResultsUrl(query: CheckQuery): string {
	const params = new URLSearchParams();
	if (query.cpu) params.set("cpu", query.cpu);
	if (query.gpu) params.set("gpu", query.gpu);
	if (query.ramGb !== null) params.set("ram", String(query.ramGb));
	if (query.vramGb !== null) params.set("vram", String(query.vramGb));
	if (query.diskFreeGb !== null) params.set("disk", String(query.diskFreeGb));
	const page = sharedGamePage(query.versions);
	return `${SITE_URL}/${page?.slug ?? ""}?${params}`;
}
