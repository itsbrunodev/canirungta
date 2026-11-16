import type { GtaVersion } from "@/lib/gta/types";
import {
	describeRequirement,
	recommendedOf,
} from "@/lib/seo/describe-requirement";
import type { FaqItem, GameEdition, GamePage } from "@/lib/seo/game-page-types";

const CONFIDENCE_WORDS: Record<GtaVersion["confidence"], string> = {
	official: "Rockstar's published",
	approximate: "estimated",
	unannounced: "unannounced",
};

// Below this the game is small enough that drive speed does not matter.
const SSD_TIP_MIN_GB = 40;

// Spec and FPS answers come from the same data as the page tables; per-game answers are hand-written in the content files.
export function buildGameFaq(
	game: GamePage,
	editions: GameEdition[],
): FaqItem[] {
	const name = game.shortName;
	const fps = describeFps(editions);
	return [
		...game.faq,
		{
			question: `What are the ${name} minimum PC requirements?`,
			answer: describeTier(name, editions, "minimum"),
		},
		{
			question: `What are the ${name} recommended PC requirements?`,
			answer: describeTier(name, editions, "recommended"),
		},
		...(fps
			? [{ question: `What FPS will I get in ${name}?`, answer: fps }]
			: []),
		{
			question: `How much storage does ${name} need?`,
			answer: describeStorage(editions),
		},
		{
			question: `How does this ${name} checker detect my GPU?`,
			answer:
				"It reads your graphics card in the browser through WebGL, plus WebGPU where available, and your memory and screen size. Nothing is uploaded. Browsers cannot see your CPU model or exact VRAM, so you can type them in or run the optional system probe for exact results.",
		},
	];
}

// "The Enhanced edition", or just the game name when the page has one edition.
function subject(name: string, version: GtaVersion, single: boolean): string {
	return single ? name : `the ${name} ${version.edition}`;
}

function describeTier(
	name: string,
	editions: GameEdition[],
	tier: "minimum" | "recommended",
): string {
	const single = editions.length === 1;
	return editions
		.map(({ version }) => {
			const req = tier === "minimum" ? version.minimum : recommendedOf(version);
			const rows = describeRequirement(req, version)
				.map((row) => `${row.label}: ${row.value}`)
				.join("; ");
			return `The ${CONFIDENCE_WORDS[version.confidence]} ${tier} requirements for ${subject(name, version, single)} are ${rows}.`;
		})
		.join(" ");
}

function describeStorage(editions: GameEdition[]): string {
	const sizes = editions.map(({ version }) => {
		const size =
			describeRequirement(version.minimum, version).find(
				(row) => row.label === "Storage",
			)?.value ?? "an unpublished amount";
		return editions.length === 1 ? size : `${size} for the ${version.edition}`;
	});
	const needsSsd = editions.some(
		({ version }) => (version.minimum.diskGb ?? 0) >= SSD_TIP_MIN_GB,
	);
	return `Plan for ${sizes.join(" and ")} of free space on the drive you install to.${needsSsd ? " An SSD is recommended for streaming the open world." : ""}`;
}

// Three sample GPUs from each unlocked table, or the frame cap when every GPU hits it.
function describeFps(editions: GameEdition[]): string | null {
	const single = editions.length === 1;
	const parts = editions.flatMap(({ version, fps }) => {
		if (!fps) return [];
		const label = single ? "" : ` (${version.edition})`;
		if (fps.lockedFps !== null) {
			return [
				`The ${version.edition} is frame-locked at ${fps.lockedFps} FPS, so any modern PC runs it at exactly that.`,
			];
		}
		const step = Math.max(1, Math.floor(fps.rows.length / 3));
		const sample = [0, step, step * 2]
			.map((i) => fps.rows[i])
			.filter((row) => row?.cells[0]?.fps != null)
			.map((row) => `${row?.gpu} about ${row?.cells[0]?.fps} FPS`);
		if (sample.length === 0) return [];
		return [
			`Estimated average FPS at 1080p on ${fps.presetLabel} settings${label} with a ${fps.cpu} and ${fps.ramGb} GB RAM: ${sample.join(", ")}.`,
		];
	});
	if (parts.length === 0) return null;
	const hasTable = editions.some(({ fps }) => fps && fps.lockedFps === null);
	return `${parts.join(" ")}${hasTable ? " See the full table for 1440p and 4K." : ""}`;
}
