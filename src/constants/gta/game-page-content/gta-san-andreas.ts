import { ENTRY_REFERENCE_GPUS } from "@/constants/gta/fps-reference-hardware";

import { buildTrilogyFaq } from "@/lib/seo/build-trilogy-faq";
import type { GamePage } from "@/lib/seo/game-page-types";

export const GTA_SAN_ANDREAS_PAGE: GamePage = {
	slug: "gta-san-andreas",
	shortName: "GTA San Andreas",
	versionIds: ["gta-sa-definitive", "gta-sa-original"],
	title: "Can I Run GTA San Andreas on PC? Requirements & FPS Checker",
	description:
		"GTA San Andreas PC requirements for the Definitive Edition and the original 2005 release. Check your CPU, GPU, RAM and VRAM and see estimated FPS.",
	h1: "Can I run GTA San Andreas on PC?",
	intro:
		"Check your PC against the GTA San Andreas Definitive Edition and original PC requirements, with estimated FPS for your graphics card at 1080p, 1440p and 4K.",
	keywords: [
		"can I run GTA San Andreas",
		"can my PC run GTA San Andreas",
		"GTA San Andreas PC requirements",
		"GTA San Andreas system requirements",
		"GTA San Andreas minimum requirements",
		"GTA San Andreas Definitive Edition requirements",
		"GTA San Andreas FPS",
		"GTA San Andreas low end PC",
		"GTA San Andreas Windows 11",
		"GTA SA PC requirements",
	],
	referenceGpus: ENTRY_REFERENCE_GPUS,
	faq: buildTrilogyFaq({
		shortName: "GTA San Andreas",
		year: 2005,
		fpsCap: 25,
	}),
};
