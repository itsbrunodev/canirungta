import type { OsFamily } from "@/lib/machine/types";

interface OsOption {
	label: string;
	family: OsFamily;
	// Windows 11 reports as major 10, like the probe does; null for every other OS.
	windowsMajor: number | null;
}

// Shown as suggestions; the visitor can still type any name, see parse-os-name.
export const OS_OPTIONS: OsOption[] = [
	{ label: "Windows 11", family: "windows", windowsMajor: 10 },
	{ label: "Windows 10", family: "windows", windowsMajor: 10 },
	{ label: "Windows 8.1", family: "windows", windowsMajor: 8 },
	{ label: "Windows 7", family: "windows", windowsMajor: 7 },
	{ label: "Linux", family: "linux", windowsMajor: null },
	{ label: "SteamOS", family: "linux", windowsMajor: null },
	{ label: "macOS", family: "darwin", windowsMajor: null },
	{ label: "Android", family: "mobile", windowsMajor: null },
	{ label: "iOS", family: "mobile", windowsMajor: null },
];

// Typed names that are not an exact option label, matched as words.
export const OS_ALIASES: { pattern: RegExp; family: OsFamily }[] = [
	{ pattern: /\b(mac|macos|os\s?x|darwin|osx)\b/i, family: "darwin" },
	{
		pattern: /\b(android|ios|ipados|iphone|ipad|chromeos)\b/i,
		family: "mobile",
	},
	{ pattern: /\b(freebsd|openbsd|netbsd|bsd)\b/i, family: "bsd" },
	{
		pattern:
			/\b(linux|ubuntu|debian|fedora|arch|mint|manjaro|steamos|bazzite|pop|opensuse|nixos|kali|endeavouros)\b/i,
		family: "linux",
	},
];
