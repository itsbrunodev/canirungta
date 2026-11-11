import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

import type { CoverImage } from "@/lib/gta/types";

import gta3Cover from "@/assets/cover/gta-3.webp";
import gta3DefinitiveCover from "@/assets/cover/gta-3-definitive-edition.webp";
import gta4Cover from "@/assets/cover/gta-4.webp";
import gta4CompleteCover from "@/assets/cover/gta-4-complete-edition.webp";
import gta5Cover from "@/assets/cover/gta-5.webp";
import gta5EnhancedCover from "@/assets/cover/gta-5-enhanced.webp";
import gta6Cover from "@/assets/cover/gta-6.webp";
import gtaSaCover from "@/assets/cover/gta-sa.webp";
import gtaSaDefinitiveCover from "@/assets/cover/gta-sa-definitive-edition.webp";
import gtaVcCover from "@/assets/cover/gta-vc.webp";
import gtaVcDefinitiveCover from "@/assets/cover/gta-vc-definitive-edition.webp";

const COVER_SOURCES: Record<string, ImageMetadata> = {
	"gta-vi": gta6Cover,
	"gta-v-enhanced": gta5EnhancedCover,
	"gta-v-2015": gta5Cover,
	"gta-iv-complete": gta4CompleteCover,
	"gta-iv-original": gta4Cover,
	"gta-sa-definitive": gtaSaDefinitiveCover,
	"gta-sa-original": gtaSaCover,
	"gta-vc-definitive": gtaVcDefinitiveCover,
	"gta-vc-original": gtaVcCover,
	"gta-iii-definitive": gta3DefinitiveCover,
	"gta-iii-original": gta3Cover,
};

// Thumbnails render at 224px tall (h-56); 448px is the 2x size for high-DPI screens.
const COVER_HEIGHT = 448;

// Call from an .astro frontmatter. Resized and converted to webp at build time.
export async function getGtaCovers(): Promise<Record<string, CoverImage>> {
	const entries = await Promise.all(
		Object.entries(COVER_SOURCES).map(async ([id, src]) => {
			const image = await getImage({
				src,
				height: COVER_HEIGHT,
				format: "webp",
			});

			const cover: CoverImage = {
				src: image.src,
				width: Number(image.attributes.width),
				height: Number(image.attributes.height),
			};
			return [id, cover] as const;
		}),
	);
	return Object.fromEntries(entries);
}
