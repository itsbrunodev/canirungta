import { describe, expect, it } from "vitest";

import { MODERN_REFERENCE_GPUS } from "@/constants/gta/fps-reference-hardware";
import { GAME_PAGES } from "@/constants/gta/game-pages";
import { GTA_VERSIONS } from "@/constants/gta/versions";

import { buildFpsTable } from "@/lib/seo/build-fps-table";
import { buildGameEditions } from "@/lib/seo/build-game-editions";
import { buildGameFaq } from "@/lib/seo/build-game-faq";

function page(slug: string) {
	const found = GAME_PAGES.find((g) => g.slug === slug);
	if (!found) throw new Error(`missing page ${slug}`);
	return found;
}

describe("game pages", () => {
	it("have unique slugs and fit search snippet limits", () => {
		const slugs = GAME_PAGES.map((g) => g.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
		for (const game of GAME_PAGES) {
			expect(game.title.length, game.slug).toBeLessThanOrEqual(65);
			expect(game.description.length, game.slug).toBeLessThanOrEqual(160);
			expect(game.h1, game.slug).toContain(game.shortName);
		}
	});

	it("cover every GTA version exactly once", () => {
		const ids = GAME_PAGES.flatMap((g) => g.versionIds);
		expect(new Set(ids).size).toBe(ids.length);
		expect([...ids].sort()).toEqual(GTA_VERSIONS.map((v) => v.id).sort());
	});

	it("estimate every reference GPU for every edition", () => {
		for (const game of GAME_PAGES) {
			for (const { version, fps } of buildGameEditions(game)) {
				expect(fps?.rows.length, version.id).toBe(game.referenceGpus.length);
			}
		}
	});

	it("keep a highlighted notice phrase inside its text", () => {
		for (const game of GAME_PAGES) {
			if (game.notice?.highlight) {
				expect(game.notice.text, game.slug).toContain(game.notice.highlight);
			}
		}
	});

	it("rank faster GPUs higher in the GTA 6 table", () => {
		const table = buildFpsTable("gta-vi", MODERN_REFERENCE_GPUS);
		const fps = (i: number) => table?.rows[i]?.cells[0]?.fps ?? 0;
		expect(fps(0)).toBeGreaterThan(fps(4));
		expect(fps(4)).toBeGreaterThan(fps(10));
	});

	it("marks frame-locked originals and leaves remasters unlocked", () => {
		const [definitive, original] = buildGameEditions(page("gta-san-andreas"));
		expect(definitive?.fps?.lockedFps).toBeNull();
		expect(original?.fps?.lockedFps).toBe(25);
		expect(
			buildFpsTable("gta-v-2015", MODERN_REFERENCE_GPUS)?.lockedFps,
		).toBeNull();
	});

	it("answers spec questions for every edition on the page", () => {
		const game = page("gta-vice-city");
		const faq = buildGameFaq(game, buildGameEditions(game));
		const minimum = faq.find((item) => item.question.includes("minimum"));
		expect(minimum?.answer).toContain("Definitive Edition");
		expect(minimum?.answer).toContain("Original PC");
		const fps = faq.find((item) => item.question.startsWith("What FPS"));
		expect(fps?.answer).toContain("frame-locked at 30 FPS");
	});
});
