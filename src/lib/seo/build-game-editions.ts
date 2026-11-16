import { GTA_VERSIONS } from "@/constants/gta/versions";

import { buildFpsTable } from "@/lib/seo/build-fps-table";
import type { GameEdition, GamePage } from "@/lib/seo/game-page-types";

// Resolves a page's editions in the page's own order (newest first), with their FPS tables.
export function buildGameEditions(game: GamePage): GameEdition[] {
	return game.versionIds.map((id) => {
		const version = GTA_VERSIONS.find((v) => v.id === id);
		if (!version) throw new Error(`${game.slug}: unknown version id "${id}"`);
		return { version, fps: buildFpsTable(id, game.referenceGpus) };
	});
}
