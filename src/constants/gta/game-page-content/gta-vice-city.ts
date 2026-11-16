import { ENTRY_REFERENCE_GPUS } from "@/constants/gta/fps-reference-hardware";

import { buildTrilogyFaq } from "@/lib/seo/build-trilogy-faq";
import type { GamePage } from "@/lib/seo/game-page-types";

export const GTA_VICE_CITY_PAGE: GamePage = {
	slug: "gta-vice-city",
	shortName: "GTA Vice City",
	versionIds: ["gta-vc-definitive", "gta-vc-original"],
	title: "Can I Run GTA Vice City on PC? Requirements & FPS Checker",
	description:
		"GTA Vice City PC requirements for the Definitive Edition and the original 2003 release. Check your CPU, GPU, RAM and VRAM and see estimated FPS.",
	h1: "Can I run GTA Vice City on PC?",
	intro:
		"Check your PC against the GTA Vice City Definitive Edition and original PC requirements, with estimated FPS for your graphics card at 1080p, 1440p and 4K.",
	keywords: [
		"can I run GTA Vice City",
		"can my PC run GTA Vice City",
		"GTA Vice City PC requirements",
		"GTA Vice City system requirements",
		"GTA Vice City minimum requirements",
		"GTA Vice City Definitive Edition requirements",
		"GTA Vice City FPS",
		"GTA Vice City low end PC",
		"GTA Vice City Windows 11",
		"GTA VC PC requirements",
	],
	referenceGpus: ENTRY_REFERENCE_GPUS,
	faq: buildTrilogyFaq({ shortName: "GTA Vice City", year: 2003, fpsCap: 30 }),
};
