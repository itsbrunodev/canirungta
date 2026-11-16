export interface FaqItem {
	question: string;
	answer: string;
}

// One dedicated, indexable page per game. Editions of a game share a page so they do not compete in search.
export interface GamePage {
	slug: string;
	// What searchers type: "GTA 6".
	shortName: string;
	// First id is the primary edition used for FPS tables and the structured data.
	versionIds: string[];
	title: string;
	description: string;
	h1: string;
	intro: string;
	// Shown above the checker when figures are not official.
	notice?: string;
	keywords: string[];
	// Game-specific questions; generic spec/FPS questions are generated from the data.
	faq: FaqItem[];
}

export const GAME_PAGES: GamePage[] = [
	{
		slug: "gta-6",
		shortName: "GTA 6",
		versionIds: ["gta-vi"],
		title: "Can I Run GTA 6 on PC? System Requirements & FPS Checker",
		description:
			"GTA 6 PC requirements are unofficial estimates until Rockstar announces a PC version. Check your CPU, GPU, RAM and VRAM and see estimated FPS.",
		h1: "Can I run GTA 6 on PC?",
		intro:
			"Check your PC against the projected GTA 6 requirements and see estimated FPS for your graphics card at 1080p, 1440p and 4K.",
		notice:
			"Grand Theft Auto VI has not been announced for PC. Rockstar has published no PC requirements, so every figure on this page is a community projection and an estimate, not an official number. It will be replaced as soon as official specs exist.",
		keywords: [
			"can I run GTA 6",
			"can my PC run GTA 6",
			"GTA 6 PC requirements",
			"GTA 6 system requirements",
			"GTA 6 minimum requirements",
			"GTA 6 recommended requirements",
			"GTA 6 PC specs",
			"GTA VI PC requirements",
			"GTA 6 FPS",
			"GTA 6 PC release",
			"GTA 6 PC",
			"GTA 6 GPU requirements",
		],
		faq: [
			{
				question: "Is GTA 6 coming to PC?",
				answer:
					"Rockstar has not announced a PC version of Grand Theft Auto VI. It is a console game for now, so there are no official PC system requirements. This page uses community projections and will be updated when Rockstar publishes real specs.",
			},
			{
				question: "Are these GTA 6 PC requirements official?",
				answer:
					"No. They are unofficial projections built from the console version's performance targets and comparable open-world games. Treat them as a planning guide, not a guarantee.",
			},
			{
				question: "Will my PC run GTA 6 when it comes out?",
				answer:
					"Run the checker above. It compares your GPU, RAM, VRAM and storage with the projected requirements and estimates FPS for your graphics card. Because the specs are projected, a pass today is an indication only.",
			},
		],
	},
];

export function findGamePage(slug: string): GamePage | undefined {
	return GAME_PAGES.find((page) => page.slug === slug);
}
