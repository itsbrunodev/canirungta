import type { FpsRating } from "@/lib/gta/performance-types";

interface FpsRatingStyle {
	label: string;
	// Full class names so Tailwind can see them.
	textClassName: string;
	barClassName: string;
}

export const FPS_RATING_STYLES: Record<FpsRating, FpsRatingStyle> = {
	smooth: {
		label: "Smooth",
		textClassName: "text-pass",
		barClassName: "bg-pass",
	},
	playable: {
		label: "Playable",
		textClassName: "text-warning",
		barClassName: "bg-warning",
	},
	choppy: {
		label: "Choppy",
		textClassName: "text-fail",
		barClassName: "bg-fail",
	},
};

// Bars share one scale per game so switching resolution shows the real drop.
export const FPS_BAR_MIN_SCALE = 120;
export const FPS_TARGET = 60;
