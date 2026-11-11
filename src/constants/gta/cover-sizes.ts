// Rendered cover width: 96px (mobile) up to 256px (lg). Widths cover 1x and 2x for each breakpoint.
export const COVER_WIDTHS = [192, 384, 512];

// Used as the <img src> fallback for browsers without srcset support.
export const COVER_FALLBACK_WIDTH = 384;

export const COVER_SIZES =
	"(min-width: 1024px) 256px, (min-width: 768px) 192px, (min-width: 640px) 160px, 96px";

// Blurred glow behind each cover; blur hides detail, so a tiny image is enough.
export const COVER_BLUR_WIDTH = 32;
