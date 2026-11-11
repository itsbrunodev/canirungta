import { THEME_STORAGE_KEY } from "@/constants/storage-keys";

export type Theme = "dark" | "light";

// Must match the colors in global.css (--color-canvas).
const THEME_COLORS: Record<Theme, string> = {
	dark: "#060607",
	light: "#f6f7f9",
};

export function getTheme(): Theme {
	return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function applyTheme(theme: Theme, persist: boolean) {
	const root = document.documentElement;
	root.dataset.theme = theme;
	const meta = document.querySelector('meta[name="theme-color"]');
	meta?.setAttribute("content", THEME_COLORS[theme]);
	if (!persist) return;
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		// Storage blocked: theme still applies for this visit.
	}
}
