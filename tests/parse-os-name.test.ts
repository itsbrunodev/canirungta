import { describe, expect, it } from "vitest";

import { parseOsName } from "@/lib/machine/parse-os-name";
import { suggestOs } from "@/lib/machine/suggest-os";

describe("parseOsName", () => {
	it("reads Windows versions, 11 as major 10", () => {
		expect(parseOsName("Windows 11")).toEqual({
			family: "windows",
			windowsMajor: 10,
		});
		expect(parseOsName("win 10")).toEqual({
			family: "windows",
			windowsMajor: 10,
		});
		expect(parseOsName("Windows 8.1")).toEqual({
			family: "windows",
			windowsMajor: 8,
		});
		expect(parseOsName("Windows 7")).toEqual({
			family: "windows",
			windowsMajor: 7,
		});
		expect(parseOsName("Windows")).toEqual({
			family: "windows",
			windowsMajor: null,
		});
	});

	it("reads other families", () => {
		expect(parseOsName("Ubuntu 24.04")?.family).toBe("linux");
		expect(parseOsName("SteamOS")?.family).toBe("linux");
		expect(parseOsName("macOS Sonoma")?.family).toBe("darwin");
		expect(parseOsName("Android")?.family).toBe("mobile");
	});

	it("rejects unknown text", () => {
		expect(parseOsName("toaster")).toBeNull();
	});
});

describe("suggestOs", () => {
	it("lists everything when empty, narrows by word", () => {
		expect(suggestOs("").length).toBeGreaterThan(5);
		expect(suggestOs("windows 11")).toEqual(["Windows 11"]);
	});
});
