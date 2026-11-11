import { describe, expect, it } from "vitest";

import { formatGb } from "@/lib/gta/format-gb";

describe("formatGb", () => {
	it("drops the decimal on whole numbers", () => {
		expect(formatGb(32)).toBe("32 GB");
		expect(formatGb(32.0)).toBe("32 GB");
		expect(formatGb(31.96)).toBe("32 GB");
	});

	it("keeps one decimal when not whole", () => {
		expect(formatGb(6.5)).toBe("6.5 GB");
		expect(formatGb(7.94)).toBe("7.9 GB");
	});

	it("shows MB under 1 GB", () => {
		expect(formatGb(0.5)).toBe("512 MB");
	});

	it("passes null through", () => {
		expect(formatGb(null)).toBeNull();
	});
});
