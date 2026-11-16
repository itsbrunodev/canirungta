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

// Budget, older and integrated GPUs: where older games' FPS actually varies. Names as browsers report them.
export const ENTRY_REFERENCE_GPUS: ReferenceGpu[] = [
	{ name: "NVIDIA GeForce RTX 3060", vramGb: 12 },
	{ name: "NVIDIA GeForce GTX 1660 SUPER", vramGb: 6 },
	{ name: "NVIDIA GeForce GTX 1650", vramGb: 4 },
	{ name: "NVIDIA GeForce GTX 1050 Ti", vramGb: 4 },
	{ name: "NVIDIA GeForce GTX 750 Ti", vramGb: 2 },
	{ name: "AMD Radeon RX 6600", vramGb: 8 },
	{ name: "AMD Radeon RX 580", vramGb: 8 },
	{ name: "AMD Radeon RX 6500 XT", vramGb: 4 },
	{ name: "Intel Arc A380", vramGb: 6 },
	{ name: "AMD Radeon 780M Graphics", vramGb: 4 },
	{ name: "Intel Iris Xe Graphics", vramGb: 2 },
	{ name: "AMD Radeon Vega 8 Graphics", vramGb: 2 },
	{ name: "Intel UHD Graphics 770", vramGb: 1 },
	{ name: "Intel UHD Graphics 620", vramGb: 1 },
];
