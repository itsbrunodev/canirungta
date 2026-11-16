import type { FaqItem, GamePage } from "@/constants/gta/game-pages";

import type { GtaVersion } from "@/lib/gta/types";
import type { FpsTable } from "@/lib/seo/build-fps-table";
import {
	describeRequirement,
	recommendedOf,
} from "@/lib/seo/describe-requirement";

const CONFIDENCE_WORDS: Record<GtaVersion["confidence"], string> = {
	official: "Rockstar's published",
	approximate: "estimated",
	unannounced: "unannounced",
};

// Spec and FPS answers come from the same data as the page tables; per-game answers are hand-written in the config.
export function buildGameFaq(
	game: GamePage,
	version: GtaVersion,
	fps: FpsTable | null,
): FaqItem[] {
	const name = game.shortName;
	const words = CONFIDENCE_WORDS[version.confidence];
	const min = describeRequirement(version.minimum, version);
	const rec = describeRequirement(recommendedOf(version), version);
	const line = (rows: typeof min) =>
		rows.map((row) => `${row.label}: ${row.value}`).join("; ");

	const items: FaqItem[] = [
		...game.faq,
		{
			question: `What are the ${name} minimum PC requirements?`,
			answer: `The ${words} minimum requirements for ${name} are ${line(min)}.`,
		},
		{
			question: `What are the ${name} recommended PC requirements?`,
			answer: `The ${words} recommended requirements for ${name} are ${line(rec)}.`,
		},
		{
			question: `How much storage does ${name} need?`,
			answer: `Plan for ${min.find((r) => r.label === "Storage")?.value ?? "an unpublished amount"} of free space on the drive you install to. An SSD is recommended for streaming the open world.`,
		},
		{
			question: `How does this ${name} checker detect my GPU?`,
			answer:
				"It reads your graphics card in the browser through WebGL, plus WebGPU where available, and your memory and screen size. Nothing is uploaded. Browsers cannot see your CPU model or exact VRAM, so you can type them in or run the optional system probe for exact results.",
		},
	];

	if (fps && fps.rows.length > 0) {
		const sample = [fps.rows[3], fps.rows[7], fps.rows[10]]
			.filter((row) => row?.cells[0]?.fps != null)
			.map((row) => `${row?.gpu} about ${row?.cells[0]?.fps} FPS`);
		if (sample.length > 0) {
			items.splice(game.faq.length + 2, 0, {
				question: `What FPS will I get in ${name}?`,
				answer: `Estimated average FPS at 1080p on ${fps.presetLabel} settings with a ${fps.cpu} and ${fps.ramGb} GB RAM: ${sample.join(", ")}. See the full table for 1440p and 4K.`,
			});
		}
	}
	return items;
}
