// Fixed test PC for the per-game FPS tables, so rows differ only by GPU.
export const FPS_TABLE_CPU = "AMD Ryzen 5 5600";
export const FPS_TABLE_RAM_GB = 16;

export interface ReferenceGpu {
	// As the checker's GPU tables spell it.
	name: string;
	vramGb: number;
}

// Mainstream-to-enthusiast cards people actually search for, newest first per brand.
export const MODERN_REFERENCE_GPUS: ReferenceGpu[] = [
	{ name: "NVIDIA GeForce RTX 4090", vramGb: 24 },
	{ name: "NVIDIA GeForce RTX 4080", vramGb: 16 },
	{ name: "NVIDIA GeForce RTX 4070 Ti", vramGb: 12 },
	{ name: "NVIDIA GeForce RTX 4070", vramGb: 12 },
	{ name: "NVIDIA GeForce RTX 4060", vramGb: 8 },
	{ name: "NVIDIA GeForce RTX 3080", vramGb: 10 },
	{ name: "NVIDIA GeForce RTX 3070", vramGb: 8 },
	{ name: "NVIDIA GeForce RTX 3060", vramGb: 12 },
	{ name: "NVIDIA GeForce RTX 2060 SUPER", vramGb: 8 },
	{ name: "NVIDIA GeForce GTX 1660 SUPER", vramGb: 6 },
	{ name: "NVIDIA GeForce GTX 1060", vramGb: 6 },
	{ name: "AMD Radeon RX 7900 XTX", vramGb: 24 },
	{ name: "AMD Radeon RX 7800 XT", vramGb: 16 },
	{ name: "AMD Radeon RX 7600", vramGb: 8 },
	{ name: "AMD Radeon RX 6700 XT", vramGb: 12 },
	{ name: "AMD Radeon RX 6600", vramGb: 8 },
	{ name: "AMD Radeon RX 5700 XT", vramGb: 8 },
	{ name: "Intel Arc B580", vramGb: 12 },
];
