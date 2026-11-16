import type { ReferenceGpu } from "@/constants/gta/fps-reference-hardware";

import type { GtaVersion } from "@/lib/gta/types";
import type { FpsTable } from "@/lib/seo/build-fps-table";

export interface FaqItem {
	question: string;
	answer: string;
}

export interface GameNotice {
	text: string;
	// Phrase inside `text` tinted amber so the caveat is not skimmed past.
	highlight?: string;
}

// One dedicated, indexable page per game. Editions of a game share a page so they do not compete in search.
export interface GamePage {
	slug: string;
	// What searchers type: "GTA 6".
	shortName: string;
	// Newest edition first: it leads the checker, tables and structured data.
	versionIds: string[];
	// <title>; kept to 65 characters (tested).
	title: string;
	// Meta description; kept to 160 characters (tested).
	description: string;
	h1: string;
	intro: string;
	// One muted line under the intro when figures are not official.
	notice?: GameNotice;
	keywords: string[];
	// GPUs for the FPS table: pick the tier this game's players actually own.
	referenceGpus: ReferenceGpu[];
	// Game-specific questions; generic spec/FPS questions are generated from the data.
	faq: FaqItem[];
}

// One edition as a game page renders it: its data plus its FPS table (null when nothing is estimable).
export interface GameEdition {
	version: GtaVersion;
	fps: FpsTable | null;
}
