import { GTA_VERSIONS } from "@/constants/gta/versions";
import { SITE_KEYWORDS } from "@/constants/seo/keywords";

interface StructuredDataInput {
	siteUrl: string;
	description: string;
	imageUrl?: string;
}

const SITE_NAME = "Can I run GTA?";

// One @graph: Google reads WebSite + WebApplication; ids let the nodes reference each other.
export function buildStructuredData({
	siteUrl,
	description,
	imageUrl,
}: StructuredDataInput) {
	const websiteId = `${siteUrl}#website`;
	const appId = `${siteUrl}#webapp`;

	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebSite",
				"@id": websiteId,
				url: siteUrl,
				name: SITE_NAME,
				description,
				inLanguage: "en",
			},
			{
				"@type": "WebApplication",
				"@id": appId,
				url: siteUrl,
				name: SITE_NAME,
				description,
				inLanguage: "en",
				keywords: SITE_KEYWORDS.join(", "),
				isPartOf: { "@id": websiteId },
				applicationCategory: "UtilitiesApplication",
				// Runs in the browser, so no OS requirement beyond a modern browser.
				operatingSystem: "Web browser",
				browserRequirements: "Requires JavaScript",
				isAccessibleForFree: true,
				offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
				featureList: [
					"Checks RAM, video memory, disk space and operating system",
					"Compares your PC to published minimum requirements",
					"Runs in your browser; optional system probe for exact figures",
				],
				about: GTA_VERSIONS.map((v) => ({
					"@type": "VideoGame",
					name: `${v.title} (${v.edition})`,
					gamePlatform: "PC",
				})),
				...(imageUrl && { image: imageUrl }),
			},
		],
	};
}
