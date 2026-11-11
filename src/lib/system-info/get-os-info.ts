import type { NavigatorExtras, OsInfo } from "@/lib/system-info/types";

export async function getOsInfo(): Promise<OsInfo> {
	const userAgent = navigator.userAgent;
	const uaData = (navigator as Navigator & NavigatorExtras).userAgentData;

	// userAgentData is Chromium-only; navigator.platform is the fallback.
	if (!uaData) {
		return {
			platform: navigator.platform || null,
			platformVersion: null,
			architecture: null,
			bitness: null,
			userAgent,
		};
	}

	// High-entropy hints are gated behind a promise and may reject.
	const hints = await uaData
		.getHighEntropyValues(["architecture", "bitness", "platformVersion"])
		.catch(() => ({}));

	return {
		platform: uaData.platform || null,
		platformVersion: hints.platformVersion ?? null,
		architecture: hints.architecture ?? null,
		bitness: hints.bitness ?? null,
		userAgent,
	};
}
