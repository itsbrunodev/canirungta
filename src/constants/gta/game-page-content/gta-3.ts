import { ENTRY_REFERENCE_GPUS } from "@/constants/gta/fps-reference-hardware";

import { buildTrilogyFaq } from "@/lib/seo/build-trilogy-faq";
import type { GamePage } from "@/lib/seo/game-page-types";

export const GTA_3_PAGE: GamePage = {
	slug: "gta-3",
	shortName: "GTA 3",
	versionIds: ["gta-iii-definitive", "gta-iii-original"],
	title: "Can I Run GTA 3 on PC? System Requirements & FPS Checker",
	description:
		"GTA 3 PC requirements for the Definitive Edition and the original 2002 release. Check your CPU, GPU, RAM and VRAM and see estimated FPS.",
	h1: "Can I run GTA 3 on PC?",
	intro:
		"Check your PC against the GTA 3 Definitive Edition and original PC requirements, with estimated FPS for your graphics card at 1080p, 1440p and 4K.",
	keywords: [
		"can I run GTA 3",
		"can my PC run GTA 3",
		"GTA 3 PC requirements",
		"GTA 3 system requirements",
		"GTA 3 minimum requirements",
		"GTA 3 Definitive Edition requirements",
		"GTA 3 FPS",
		"GTA 3 low end PC",
		"GTA 3 Windows 11",
		"GTA III PC requirements",
	],
	referenceGpus: ENTRY_REFERENCE_GPUS,
	faq: buildTrilogyFaq({ shortName: "GTA 3", year: 2002, fpsCap: 30 }),
};
