import { GTA_VERSIONS } from "@/constants/gta/versions";

import { gamePageUrl } from "@/lib/seo/game-page-url";

export function GET() {
	const versions = GTA_VERSIONS.map((version) => ({
		...version,
		pageUrl: gamePageUrl(version.id),
	}));
	return new Response(JSON.stringify(versions, null, 2), {
		headers: { "Content-Type": "application/json" },
	});
}
