import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

import {
	COVER_BLUR_WIDTH,
	COVER_FALLBACK_WIDTH,
	COVER_SIZES,
	COVER_WIDTHS,
} from "@/constants/gta/cover-sizes";

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

// Call from an .astro frontmatter. Resized and converted to webp at build time.
export async function getGtaCovers(): Promise<Record<string, CoverImage>> {
	const entries = await Promise.all(
		Object.entries(COVER_SOURCES).map(async ([id, src]) => {
			const [fallback, sized, blur] = await Promise.all([
				getImage({
					src,
					width: COVER_FALLBACK_WIDTH,
					format: "webp",
					quality: 80,
				}),
				getImage({ src, widths: COVER_WIDTHS, format: "webp", quality: 80 }),
				getImage({ src, width: COVER_BLUR_WIDTH, format: "webp", quality: 50 }),
			]);

			// Every width keeps the source aspect ratio, so one ratio serves the whole set.
			const cover: CoverImage = {
				src: fallback.src,
				srcSet: sized.srcSet.attribute,
				sizes: COVER_SIZES,
				blurSrc: blur.src,
				width: COVER_FALLBACK_WIDTH,
				height: Math.round((COVER_FALLBACK_WIDTH * src.height) / src.width),
			};
			return [id, cover] as const;
		}),
	);
	return Object.fromEntries(entries);
}
