import type { DisplayInfo } from "@/lib/system-info/types";

export function getDisplayInfo(): DisplayInfo {
	return {
		width: screen.width,
		height: screen.height,
		devicePixelRatio: window.devicePixelRatio,
	};
}
