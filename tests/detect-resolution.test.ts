import { describe, expect, it } from "vitest";

import { snapResolution } from "@/lib/gta/detect-resolution";

function display(width: number, height: number, devicePixelRatio = 1) {
	return { width, height, devicePixelRatio };
}

describe("snapResolution", () => {
	it("maps common monitors to their preset", () => {
		expect(snapResolution(display(1920, 1080))).toBe("1080p");
		expect(snapResolution(display(2560, 1440))).toBe("1440p");
		expect(snapResolution(display(3840, 2160))).toBe("4k");
		expect(snapResolution(display(1366, 768))).toBe("720p");
	});

	it("uses device pixels, not css pixels", () => {
		expect(snapResolution(display(1920, 1080, 2))).toBe("4k");
		expect(snapResolution(display(1440, 900, 2))).toBe("1440p");
	});

	it("snaps ultrawide by pixel count", () => {
		expect(snapResolution(display(3440, 1440))).toBe("1440p");
	});

	it("returns null for unusable sizes", () => {
		expect(snapResolution(display(0, 0))).toBeNull();
	});
});
