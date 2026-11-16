import type { FaqItem, GamePage } from "@/constants/gta/game-pages";
import { SITE_NAME } from "@/constants/site";

import type { GtaVersion } from "@/lib/gta/types";

interface GameStructuredDataInput {
	siteUrl: string;
	game: GamePage;
	versions: GtaVersion[];
	faq: FaqItem[];
	imageUrl: string;
}

// WebPage + Breadcrumb + VideoGame + FAQPage in one graph; the FAQ text matches what the page shows.
export function buildGameStructuredData({
	siteUrl,
	game,
	versions,
	faq,
	imageUrl,
}: GameStructuredDataInput) {
	const pageUrl = `${siteUrl}${game.slug}`;
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebPage",
				"@id": `${pageUrl}#webpage`,
				url: pageUrl,
				name: game.title,
				description: game.description,
				inLanguage: "en",
				isPartOf: { "@id": `${siteUrl}#website` },
				breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
				about: { "@id": `${pageUrl}#game` },
				primaryImageOfPage: imageUrl,
			},
			{
				"@type": "BreadcrumbList",
				"@id": `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ "@type": "ListItem", position: 1, name: SITE_NAME, item: siteUrl },
					{
						"@type": "ListItem",
						position: 2,
						name: `Can I run ${game.shortName}?`,
						item: pageUrl,
					},
				],
			},
			{
				"@type": "VideoGame",
				"@id": `${pageUrl}#game`,
				name: versions[0]?.title ?? game.shortName,
				alternateName: game.shortName,
				gamePlatform: "PC",
				image: imageUrl,
				publisher: { "@type": "Organization", name: "Rockstar Games" },
			},
			{
				"@type": "FAQPage",
				"@id": `${pageUrl}#faq`,
				mainEntity: faq.map((item) => ({
					"@type": "Question",
					name: item.question,
					acceptedAnswer: { "@type": "Answer", text: item.answer },
				})),
			},
		],
	};
}
