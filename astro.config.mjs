// @ts-check

import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

import { scriptHashes } from "./vite-plugins/script-hashes.mjs";

// https://astro.build/config
export default defineConfig({
	// Used for canonical and Open Graph URLs; Astro.site is undefined without it.
	site: "https://canirungta.com",
	// Static pages by default; only /api/check runs on the server.
	adapter: vercel(),
	integrations: [preact(), sitemap()],

	// Fonts are downloaded at build time and self-hosted; no runtime CDN request.
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Geist",
			cssVariable: "--font-geist-sans",
			weights: ["100 900"],
			styles: ["normal"],
			subsets: ["latin"],
			display: "swap",
		},
		{
			provider: fontProviders.google(),
			name: "Geist Mono",
			cssVariable: "--font-geist-mono",
			weights: ["100 900"],
			styles: ["normal"],
			subsets: ["latin"],
			display: "swap",
		},
	],

	vite: {
		plugins: [tailwindcss(), scriptHashes()],
	},
});
