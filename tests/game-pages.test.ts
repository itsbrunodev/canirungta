import { describe, expect, it } from "vitest";

import { MODERN_REFERENCE_GPUS } from "@/constants/gta/fps-reference-hardware";
import { GAME_PAGES } from "@/constants/gta/game-pages";
import { GTA_VERSIONS } from "@/constants/gta/versions";

import { buildFpsTable } from "@/lib/seo/build-fps-table";

describe("game pages", () => {
	it("point at real versions with unique slugs", () => {
		const slugs = GAME_PAGES.map((g) => g.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
		for (const game of GAME_PAGES) {
			for (const id of game.versionIds) {
				expect(
					GTA_VERSIONS.some((v) => v.id === id),
					id,
				).toBe(true);
			}
			expect(game.title.length).toBeLessThanOrEqual(65);
			expect(game.description.length).toBeLessThanOrEqual(160);
		}
	});

	it("estimates every reference GPU for GTA 6", () => {
		const table = buildFpsTable("gta-vi", MODERN_REFERENCE_GPUS);
		expect(table?.rows.length).toBe(MODERN_REFERENCE_GPUS.length);
		const fps = (i: number) => table?.rows[i]?.cells[0]?.fps ?? 0;
		expect(fps(0)).toBeGreaterThan(fps(4));
		expect(fps(4)).toBeGreaterThan(fps(10));
	});
});
