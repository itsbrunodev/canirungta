import { ENTRY_REFERENCE_GPUS } from "@/constants/gta/fps-reference-hardware";

import type { GamePage } from "@/lib/seo/game-page-types";

export const GTA_5_PAGE: GamePage = {
	slug: "gta-5",
	shortName: "GTA 5",
	versionIds: ["gta-v-enhanced", "gta-v-2015"],
	title: "Can I Run GTA 5 on PC? System Requirements & FPS Checker",
	description:
		"GTA 5 PC requirements for Enhanced and the original 2015 version. Check your CPU, GPU, RAM and VRAM and see estimated FPS for your graphics card.",
	h1: "Can I run GTA 5 on PC?",
	intro:
		"Check your PC against the official GTA 5 Enhanced requirements and the original 2015 release, with estimated FPS for your graphics card at 1080p, 1440p and 4K.",
	keywords: [
		"can I run GTA 5",
		"can my PC run GTA 5",
		"GTA 5 PC requirements",
		"GTA 5 system requirements",
		"GTA 5 minimum requirements",
		"GTA 5 recommended requirements",
		"GTA 5 Enhanced requirements",
		"GTA V PC requirements",
		"GTA 5 FPS",
		"GTA 5 low end PC",
		"GTA 5 integrated graphics",
		"GTA 5 Legacy vs Enhanced",
	],
	referenceGpus: ENTRY_REFERENCE_GPUS,
	faq: [
		{
			question: "What is the difference between GTA 5 Enhanced and Legacy?",
			answer:
				"GTA V Enhanced, released on PC in March 2025, is the upgraded version with optional ray tracing, DLSS and FSR upscaling and faster loading from SSDs. It runs on DirectX 12 only. The original 2015 release is now called GTA V Legacy and still runs on older hardware. PC owners get both at no extra cost.",
		},
		{
			question: "Do I need a ray tracing GPU for GTA 5 Enhanced?",
			answer:
				"No. Ray tracing is optional, and the minimum spec is a GeForce GTX 1630 or Radeon RX 6400. Ray-traced shadows, reflections and lighting need a card that supports it, such as a GeForce RTX, Radeon RX 6000 series or newer, or Intel Arc.",
		},
		{
			question: "Can I run GTA 5 on integrated graphics?",
			answer:
				"Usually, on low settings. The 2015 version runs on recent integrated graphics such as Intel Iris Xe or AMD Radeon 780M at 1080p. Enhanced asks for a dedicated card with 4 GB of VRAM, so older integrated GPUs fall below its minimum. The FPS table below includes common integrated chips.",
		},
		{
			question: "Does GTA 5 run on Windows 11, Linux or Steam Deck?",
			answer:
				"Both versions run on 64-bit Windows 10 and 11. Story mode works on Linux and Steam Deck through Proton, but GTA Online's BattlEye anti-cheat blocks online play outside Windows.",
		},
	],
};
