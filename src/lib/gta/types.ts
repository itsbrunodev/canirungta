export type Verdict =
	| "runs-well"
	| "runs"
	| "unknown"
	| "cannot"
	| "needs-windows"
	| "unsupported";

export type CheckStatus = "pass" | "fail" | "unknown";

// "approximate" = figures from third-party sites that disagree with each other.
// "unannounced" = no published requirements yet.
export type Confidence = "official" | "approximate" | "unannounced";

export interface GtaRequirement {
	ramGb: number | null;
	vramGb: number | null;
	diskGb: number | null;
	// Hardware names as the publisher lists them (any one qualifies); null = none published, so no CPU/GPU row is shown.
	cpu: string[] | null;
	gpu: string[] | null;
}

export interface GtaOsRequirement {
	// Windows major version (10 = Windows 10 and 11); null = no published floor we rely on.
	minWindowsMajor: number | null;
	requires64Bit: boolean;
}

export interface GtaVersion {
	id: string;
	title: string;
	edition: string;
	confidence: Confidence;
	sourceUrl: string;
	minimum: GtaRequirement;
	// Publisher's recommended tier; a null field (or null tier) falls back to the minimum, so meeting the minimum counts as recommended.
	recommended: GtaRequirement | null;
	os: GtaOsRequirement;
}

export interface CheckRow {
	label: string;
	status: CheckStatus;
	// Headline figure for the tile, e.g. "16 GB"; null when unknown.
	actual: string | null;
	// Published minimum, e.g. "8 GB"; null for OS or when none exists.
	required: string | null;
	// Extra context (GPU name, why unknown).
	note: string | null;
}

export interface VersionReport {
	version: GtaVersion;
	verdict: Verdict;
	// Rows against the minimum spec.
	checks: CheckRow[];
}

// Plain serializable image data, safe to pass from an .astro page into a client island.
export interface CoverImage {
	src: string;
	width: number;
	height: number;
	alt?: string;
}
