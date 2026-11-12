import type { NavigatorExtras, OsInfo } from "@/lib/system-info/types";

export async function getOsInfo(): Promise<OsInfo> {
	const userAgent = navigator.userAgent;
	const uaData = (navigator as Navigator & NavigatorExtras).userAgentData;
	const touchPoints = navigator.maxTouchPoints || 0;

	// userAgentData is Chromium-only; navigator.platform is the fallback.
	if (!uaData) {
		return {
			platform: navigator.platform || null,
			platformVersion: null,
			architecture: null,
			bitness: null,
			wow64: null,
			mobile: null,
			touchPoints,
			userAgent,
		};
	}

	// High-entropy hints are gated behind a promise and may reject.
	const hints = await uaData
		.getHighEntropyValues([
			"architecture",
			"bitness",
			"platformVersion",
			"wow64",
		])
		.catch(
			() => ({}) as Awaited<ReturnType<typeof uaData.getHighEntropyValues>>,
		);

	return {
		platform: uaData.platform || null,
		platformVersion: hints.platformVersion ?? null,
		architecture: hints.architecture ?? null,
		bitness: hints.bitness ?? null,
		wow64: typeof hints.wow64 === "boolean" ? hints.wow64 : null,
		mobile: typeof uaData.mobile === "boolean" ? uaData.mobile : null,
		touchPoints,
		userAgent,
	};
}
