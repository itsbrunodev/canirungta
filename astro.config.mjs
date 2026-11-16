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
	// One URL form per page (/gta-6, not /gta-6/): canonical, sitemap and links must agree.
	trailingSlash: "never",
	// Static pages by default; only /api/check runs on the server.
	adapter: vercel(),
	integrations: [preact(), sitemap()],
	// One ~47KB stylesheet blocks first paint; inlining removes that request and the CSS -> font chain.
	build: { inlineStylesheets: "always" },
	// The toolbar injects its own links and markup, which skews Lighthouse/axe runs against `astro dev`.
	devToolbar: { enabled: false },

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
