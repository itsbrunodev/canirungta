// Dev runs locally, so the probe must report back to localhost, not production.
export const PROBE_ORIGIN = import.meta.env.DEV
	? "http://localhost:4321"
	: "https://canirungta.com";

export type ProbePlatform = "unix" | "windows";

// Unchecked "open in browser" sets CANIRUNGTA_NO_OPEN: the script then only prints the result link.
export function getProbeCommand(
	platform: ProbePlatform,
	openInBrowser: boolean,
): string {
	if (platform === "unix") {
		const env = [
			import.meta.env.DEV ? `CANIRUNGTA_ORIGIN=${PROBE_ORIGIN}` : "",
			openInBrowser ? "" : "CANIRUNGTA_NO_OPEN=1",
		].filter(Boolean);
		return `curl -fsSL ${PROBE_ORIGIN}/sh | ${env.map((e) => `${e} `).join("")}sh`;
	}

	const env = [
		import.meta.env.DEV ? `$env:CANIRUNGTA_ORIGIN='${PROBE_ORIGIN}'; ` : "",
		openInBrowser ? "" : "$env:CANIRUNGTA_NO_OPEN=1; ",
	].join("");
	return `${env}irm ${PROBE_ORIGIN}/ps | iex`;
}

// Hashes the served script without running it; compare the output with the published SHA-256.
export function getHashCommand(platform: ProbePlatform): string {
	if (platform === "unix") {
		return `curl -fsSL ${PROBE_ORIGIN}/sh | sha256sum`;
	}
	return `$f = New-TemporaryFile; iwr ${PROBE_ORIGIN}/ps -OutFile $f; (Get-FileHash $f).Hash.ToLower()`;
}

export function getVirusTotalUrl(sha256: string): string {
	return `https://www.virustotal.com/gui/file/${sha256}`;
}
