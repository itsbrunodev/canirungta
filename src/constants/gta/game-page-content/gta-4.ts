import { ENTRY_REFERENCE_GPUS } from "@/constants/gta/fps-reference-hardware";

import type { GamePage } from "@/lib/seo/game-page-types";

export const GTA_4_PAGE: GamePage = {
	slug: "gta-4",
	shortName: "GTA 4",
	versionIds: ["gta-iv-complete", "gta-iv-original"],
	title: "Can I Run GTA 4 on PC? System Requirements & FPS Checker",
	description:
		"GTA 4 PC requirements for the Complete Edition and the original 2008 release. Check your CPU, GPU, RAM and VRAM and see estimated FPS.",
	h1: "Can I run GTA 4 on PC?",
	intro:
		"Check your PC against the GTA 4 Complete Edition and original PC requirements, with estimated FPS for your graphics card at 1080p, 1440p and 4K.",
	keywords: [
		"can I run GTA 4",
		"can my PC run GTA 4",
		"GTA 4 PC requirements",
		"GTA 4 system requirements",
		"GTA 4 minimum requirements",
		"GTA 4 Complete Edition requirements",
		"GTA IV PC requirements",
		"GTA 4 FPS",
		"GTA 4 low end PC",
		"GTA 4 Windows 11",
		"GTA 4 stutter fix",
	],
	referenceGpus: ENTRY_REFERENCE_GPUS,
	faq: [
		{
			question: "What is GTA 4 Complete Edition?",
			answer:
				"Released on PC in March 2020, it bundles GTA IV with both Episodes from Liberty City, The Lost and Damned and The Ballad of Gay Tony, and drops Games for Windows Live. It replaced the original release in stores. Online multiplayer was removed along with GFWL.",
		},
		{
			question: "Why does GTA 4 run badly on a fast PC?",
			answer:
				"The PC port leans heavily on the CPU and an old DirectX 9 renderer, so even strong hardware can stutter. The community FusionFix mod fixes many bugs and frame pacing problems, and DXVK, which runs DirectX 9 through Vulkan, often smooths performance further.",
		},
		{
			question: "Should I cap GTA 4 at 60 FPS?",
			answer:
				"Many players do. Above 60 FPS some cutscenes and physics misbehave in this engine. FusionFix includes a frame limiter for exactly this.",
		},
		{
			question: "Does GTA 4 work on Windows 10 and 11?",
			answer:
				"Yes. The Complete Edition runs on Windows 10 and 11 without Games for Windows Live. The original 2008 release depends on GFWL, which no longer works reliably, so the Complete Edition is the practical choice today.",
		},
	],
};
