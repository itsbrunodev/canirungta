export interface OsInfo {
	platform: string | null;
	platformVersion: string | null;
	architecture: string | null;
	bitness: string | null;
	userAgent: string;
}

export interface CpuInfo {
	logicalCores: number | null;
}

export interface MemoryInfo {
	// GB, rounded and capped at 8 by browsers. Chromium only.
	deviceMemoryGb: number | null;
}

export interface GpuInfo {
	webglVersion: 1 | 2 | null;
	vendor: string | null;
	renderer: string | null;
	maxTextureSize: number | null;
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
}

export interface NavigatorUaData {
	platform: string;
	getHighEntropyValues(hints: string[]): Promise<UaHighEntropyValues>;
}

// Non-standard or not yet in lib.dom; browsers without them leave these undefined.
export interface NavigatorExtras {
	deviceMemory?: number;
	userAgentData?: NavigatorUaData;
}
