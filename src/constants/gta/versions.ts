import type { GtaVersion } from "@/lib/gta/types";

// Minimum PC specs and OS floor. null = no published figure, so that check is reported as unknown, never passed.
export const GTA_VERSIONS: GtaVersion[] = [
	{
		id: "gta-vi",
		title: "Grand Theft Auto VI",
		edition: "PC (not announced)",
		confidence: "approximate",
		sourceUrl:
			"https://www.reddit.com/r/GTA/comments/1w2h0xj/gta_vi_pc_requirements_based_on_a_few_educated/",
		// Console-only so far. Rockstar has published no PC specs; these are community projections from the linked Reddit post. One CPU and one GPU per brand.
		minimum: {
			ramGb: 16,
			vramGb: 8,
			diskGb: 150,
			cpu: ["Ryzen 5 3600", "Core i5-10400"],
			gpu: ["GeForce RTX 2060 SUPER", "Radeon RX 5700 XT"],
		},
		// 1440p / 40+ FPS / medium-high tier from the same Reddit post. One CPU and one GPU per brand.
		recommended: {
			ramGb: 16,
			vramGb: 12,
			diskGb: 150,
			cpu: ["Ryzen 7 5800X", "Core i5-12400F"],
			gpu: ["GeForce RTX 4070", "Radeon RX 7700 XT"],
		},
		os: { minWindowsMajor: 10, requires64Bit: true },
	},
	{
		id: "gta-v-enhanced",
		title: "Grand Theft Auto V",
		edition: "Enhanced",
		confidence: "official",
		sourceUrl:
			"https://support.rockstargames.com/en-US/articles/lMQXeP2Z1mN3g9oZiBZFR/grand-theft-auto-v-pc-system-requirements",
		minimum: {
			ramGb: 8,
			vramGb: 4,
			diskGb: 105,
			cpu: ["Core i7-4770", "FX-9590"],
			gpu: ["GeForce GTX 1630", "Radeon RX 6400"],
		},
		recommended: {
			ramGb: 16,
			vramGb: 8,
			diskGb: 105,
			cpu: ["Core i5-9600K", "Ryzen 5 3600"],
			gpu: ["GeForce RTX 3060", "Radeon RX 6600 XT"],
		},
		os: { minWindowsMajor: 10, requires64Bit: true },
	},
	{
		id: "gta-v-2015",
		title: "Grand Theft Auto V",
		edition: "Original PC",
		confidence: "approximate",
		sourceUrl:
			"https://www.gtabase.com/articles/grand-theft-auto-v/news/grand-theft-auto-v-pc-system-requirements",
		minimum: {
			ramGb: 4,
			vramGb: 1,
			diskGb: 125,
			cpu: ["Core 2 Quad Q6600", "Phenom 9850"],
			gpu: ["GeForce 9800 GT", "Radeon HD 4870"],
		},
		recommended: {
			ramGb: 8,
			vramGb: 2,
			diskGb: 125,
			cpu: ["Core i5-3470", "FX-8350"],
			gpu: ["GeForce GTX 660", "Radeon HD 7870"],
		},
		os: { minWindowsMajor: null, requires64Bit: true },
	},
	{
		id: "gta-iv-complete",
		title: "Grand Theft Auto IV",
		edition: "Complete Edition",
		confidence: "official",
		sourceUrl:
			"https://support.rockstargames.com/en-US/articles/7BOteXZsOSvgaEsyzz743i/grand-theft-auto-iv-pc-system-requirements",
		minimum: {
			ramGb: 2,
			vramGb: 0.5,
			diskGb: 22,
			cpu: ["Core 2 Quad Q6600", "Phenom 9850"],
			gpu: ["GeForce 8600", "Radeon HD 3870"],
		},
		recommended: null,
		os: { minWindowsMajor: null, requires64Bit: false },
	},
	{
		id: "gta-iv-original",
		title: "Grand Theft Auto IV",
		edition: "Original PC",
		confidence: "approximate",
		sourceUrl:
			"https://www.gtabase.com/articles/grand-theft-auto-iv-pc-system-requirements-complete-edition",
		minimum: {
			ramGb: 1.5,
			vramGb: 0.25,
			diskGb: 16,
			cpu: ["Core 2 Duo", "Athlon 64 X2"],
			gpu: ["GeForce 7900", "Radeon X1900"],
		},
		recommended: {
			ramGb: 2,
			vramGb: 0.5,
			diskGb: 18,
			cpu: ["Core 2 Quad", "Phenom X3"],
			gpu: ["GeForce 8600", "Radeon HD 3870"],
		},
		os: { minWindowsMajor: null, requires64Bit: false },
	},
	{
		id: "gta-sa-definitive",
		title: "Grand Theft Auto: San Andreas",
		edition: "Definitive Edition",
		confidence: "official",
		sourceUrl:
			"https://support.rockstargames.com/articles/6b6NA1j6nX9oZFxjIQo882/grand-theft-auto-san-andreas-the-definitive-edition-pc-system-requirements",
		minimum: {
			ramGb: 8,
			vramGb: 2,
			diskGb: 45,
			cpu: ["Core i5-6600K", "FX-6300"],
			gpu: ["GeForce GTX 760", "Radeon R9 280"],
		},
		recommended: {
			ramGb: 16,
			vramGb: 4,
			diskGb: 45,
			cpu: ["Core i7-2700K", "Ryzen 5 2600"],
			gpu: ["GeForce GTX 970", "Radeon RX 570"],
		},
		os: { minWindowsMajor: 10, requires64Bit: true },
	},
	{
		id: "gta-sa-original",
		title: "Grand Theft Auto: San Andreas",
		edition: "Original PC",
		confidence: "official",
		sourceUrl:
			"https://support.rockstargames.com/articles/5Tp0lg9AU5dQZO3M9Tp9vr/grand-theft-auto-san-andreas-pc-system-requirements",
		minimum: { ramGb: 0.25, vramGb: 0.0625, diskGb: 4.7, cpu: null, gpu: null },
		recommended: null,
		os: { minWindowsMajor: null, requires64Bit: false },
	},
	{
		id: "gta-vc-definitive",
		title: "Grand Theft Auto: Vice City",
		edition: "Definitive Edition",
		confidence: "approximate",
		sourceUrl:
			"https://support.rockstargames.com/articles/Ij7IsvDmJwBdtuevLObML/grand-theft-auto-vice-city-the-definitive-edition-pc-system-requirements",
		minimum: {
			ramGb: 8,
			vramGb: 2,
			diskGb: 45,
			cpu: ["Core i5-6600K", "FX-6300"],
			gpu: ["GeForce GTX 760", "Radeon R9 280"],
		},
		recommended: {
			ramGb: 16,
			vramGb: 4,
			diskGb: 45,
			cpu: ["Core i7-2700K", "Ryzen 5 2600"],
			gpu: ["GeForce GTX 970", "Radeon RX 570"],
		},
		os: { minWindowsMajor: 10, requires64Bit: true },
	},
	{
		id: "gta-vc-original",
		title: "Grand Theft Auto: Vice City",
		edition: "Original PC",
		confidence: "approximate",
		sourceUrl:
			"https://www.gtabase.com/articles/gta-vice-city-pc-system-requirements-original-definitive-edition",
		minimum: {
			ramGb: 0.125,
			vramGb: 0.03125,
			diskGb: 0.915,
			// Listed only as "800 MHz Pentium III / Athlon" and "GeForce-class card": no model to score.
			cpu: null,
			gpu: null,
		},
		// Pentium 4 / Athlon XP and a GeForce 3 / Radeon 8500 class card with 64 MB; no scorable models.
		recommended: {
			ramGb: 0.25,
			vramGb: 0.0625,
			diskGb: 1.55,
			cpu: null,
			gpu: null,
		},
		os: { minWindowsMajor: null, requires64Bit: false },
	},
	{
		id: "gta-iii-definitive",
		title: "Grand Theft Auto III",
		edition: "Definitive Edition",
		confidence: "approximate",
		sourceUrl:
			"https://support.rockstargames.com/articles/6xQSycET7v6xoNOvmRUjX1/grand-theft-auto-iii-the-definitive-edition-pc-system-requirements",
		minimum: {
			ramGb: 8,
			vramGb: 2,
			diskGb: 45,
			cpu: ["Core i5-6600K", "FX-6300"],
			gpu: ["GeForce GTX 760", "Radeon R9 280"],
		},
		recommended: {
			ramGb: 16,
			vramGb: 4,
			diskGb: 45,
			cpu: ["Core i7-2700K", "Ryzen 5 2600"],
			gpu: ["GeForce GTX 970", "Radeon RX 570"],
		},
		os: { minWindowsMajor: 10, requires64Bit: true },
	},
	{
		id: "gta-iii-original",
		title: "Grand Theft Auto III",
		edition: "Original PC",
		confidence: "approximate",
		sourceUrl:
			"https://www.gtabase.com/articles/gta-iii-pc-system-requirements-original-definitive-edition",
		minimum: {
			ramGb: 0.09375,
			vramGb: 0.015625,
			diskGb: 0.7,
			// "450 MHz Pentium III / Athlon" and a "16 MB Direct3D card": no model to score.
			cpu: null,
			gpu: null,
		},
		recommended: {
			ramGb: 0.125,
			vramGb: 0.03125,
			diskGb: 0.7,
			cpu: null,
			gpu: null,
		},
		os: { minWindowsMajor: null, requires64Bit: false },
	},
];
