import { RESOLUTIONS } from "@/constants/gta/performance-model";

import type { ResolutionId } from "@/lib/gta/performance-types";
import type { DisplayInfo } from "@/lib/system-info/types";

const BASE_PIXELS = 1920 * 1080;

// Nearest preset by pixel count (geometric), so ultrawide 3440x1440 still lands on 1440p.
export function snapResolution(display: DisplayInfo): ResolutionId | null {
	const pixels = display.width * display.height * display.devicePixelRatio ** 2;
	if (!Number.isFinite(pixels) || pixels <= 0) return null;
	const ratio = pixels / BASE_PIXELS;

	let best: ResolutionId | null = null;
	let bestDistance = Number.POSITIVE_INFINITY;
	for (const resolution of RESOLUTIONS) {
		const distance = Math.abs(Math.log(ratio / resolution.pixelRatio));
		if (distance < bestDistance) {
			bestDistance = distance;
			best = resolution.id;
		}
	}
	return best;
}

// Monitor size is only a default: the screen may not be the one the game runs on, and zoom skews the ratio.
export function detectResolution(display: DisplayInfo): ResolutionId | null {
	// Phones and tablets report a panel, not a gaming display.
	if (window.matchMedia("(pointer: coarse)").matches) return null;
	return snapResolution(display);
}
