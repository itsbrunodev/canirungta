import type { FaqItem } from "@/lib/seo/game-page-types";

interface TrilogyGame {
	shortName: string;
	// Original PC release year.
	year: number;
	// The original's frame limiter.
	fpsCap: number;
}

// GTA III, Vice City and San Andreas share an engine, a remaster and the same modern-PC issues.
export function buildTrilogyFaq({
	shortName,
	year,
	fpsCap,
}: TrilogyGame): FaqItem[] {
	return [
		{
			question: `What is the difference between ${shortName} Definitive Edition and the original?`,
			answer: `The Definitive Edition (2021) is an Unreal Engine 4 remaster with new lighting, higher-resolution textures and modern controls, and it needs a far stronger PC. The original ${year} PC version runs on almost any computer today.`,
		},
		{
			question: `Can I run ${shortName} on a laptop or integrated graphics?`,
			answer:
				"The original runs on practically any laptop from the last 15 years, integrated graphics included. The Definitive Edition asks for a GeForce GTX 760 or Radeon R9 280 class GPU, so older integrated graphics struggle with it. The FPS table below includes common integrated chips.",
		},
		{
			question: `Why is the original ${shortName} locked at ${fpsCap} FPS?`,
			answer: `The game's frame limiter holds it at ${fpsCap} FPS on any hardware. Turning the limiter off lets it run faster, but the physics and timing were built around that cap, so some missions and animations break.`,
		},
		{
			question: `Does ${shortName} run on Windows 10 and 11?`,
			answer:
				"Yes. The Definitive Edition supports Windows 10 and 11 natively. The original also runs, but stretches the picture on widescreen monitors and has some bugs on modern systems; community fixes such as SilentPatch and a widescreen fix solve most of them.",
		},
	];
}
