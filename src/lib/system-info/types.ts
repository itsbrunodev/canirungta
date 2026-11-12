export interface OsInfo {
	platform: string | null;
	platformVersion: string | null;
	architecture: string | null;
	bitness: string | null;
	// Chromium client hints only; undefined elsewhere.
	wow64: boolean | null;
	mobile: boolean | null;
	touchPoints: number;
	userAgent: string;
}

export interface CpuInfo {
	logicalCores: number | null;
}

export interface MemoryInfo {
	// GB, rounded and capped at 8 by browsers. Chromium only.
	deviceMemoryGb: number | null;
}

// One GPU the browser could see: a WebGL context per power preference, or a WebGPU adapter.
export interface GpuAdapterInfo {
	source: "webgl" | "webgpu";
	vendor: string | null;
	renderer: string | null;
	// WebGPU only, e.g. "ampere", "rdna-3", "gen-12lp".
	architecture: string | null;
	powerPreference: "high-performance" | "low-power" | "default";
}

export interface GpuInfo {
	webglVersion: 1 | 2 | null;
	vendor: string | null;
	renderer: string | null;
	maxTextureSize: number | null;
	// Distinct adapters across power preferences: dual-GPU laptops show both.
	adapters: GpuAdapterInfo[];
}

export interface DisplayInfo {
	width: number;
	height: number;
	devicePixelRatio: number;
}

export interface SystemInfo {
	collectedAt: string;
	os: OsInfo;
	cpu: CpuInfo;
	memory: MemoryInfo;
	gpu: GpuInfo;
	display: DisplayInfo;
}

export interface UaHighEntropyValues {
	architecture?: string;
	bitness?: string;
	platformVersion?: string;
	wow64?: boolean;
	model?: string;
}

export interface NavigatorUaData {
	platform: string;
	mobile?: boolean;
	getHighEntropyValues(hints: string[]): Promise<UaHighEntropyValues>;
}

// Non-standard or not yet in lib.dom; browsers without them leave these undefined.
export interface NavigatorExtras {
	deviceMemory?: number;
	userAgentData?: NavigatorUaData;
}
