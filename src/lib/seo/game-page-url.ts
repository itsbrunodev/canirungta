import { GAME_PAGES } from "@/constants/gta/game-pages";
import { SITE_URL } from "@/constants/site";

import type { GamePage } from "@/lib/seo/game-page-types";

// Version id -> the dedicated page that covers it; every version has one (tested).
const PAGE_BY_VERSION = new Map(
	GAME_PAGES.flatMap((page) => page.versionIds.map((id) => [id, page])),
);

export function gamePageFor(versionId: string): GamePage | undefined {
	return PAGE_BY_VERSION.get(versionId);
}

export function gamePageUrl(versionId: string): string | null {
	const page = gamePageFor(versionId);
	return page ? `${SITE_URL}/${page.slug}` : null;
}

// The one page covering every given version, or null when they span games (or none given).
export function sharedGamePage(versionIds: string[] | null): GamePage | null {
	if (!versionIds || versionIds.length === 0) return null;
	const pages = new Set(versionIds.map((id) => gamePageFor(id)));
	const [only] = pages;
	return pages.size === 1 && only ? only : null;
}
