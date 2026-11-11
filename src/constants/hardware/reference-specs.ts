// Published specs of the scoring anchors (GTX 1060 = 100, Core i7-4770 = 100).
// Estimates scale against these, so they must match the anchor cards' real specs.
export const GTX_1060_REFERENCE = {
	shaders: 1280,
	boostMhz: 1708,
	busBits: 192,
} as const;

export const I7_4770_REFERENCE = {
	threads: 8,
	boostGhz: 3.9,
} as const;

// Laptop parts run at lower power than the desktop card sharing their name.
export const MOBILE_FACTOR = 0.8;
export const MOBILE_PATTERN = /laptop|mobile|max-q|notebook/;

export const ESTIMATED_NOTE = "Estimated from published specs";
