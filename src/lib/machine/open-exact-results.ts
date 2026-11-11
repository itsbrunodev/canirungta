// Opens the probe/manual panel and scrolls to it; used by the "unknown" prompts.
export function openExactResults(): void {
	const section = document.getElementById("exact-results");
	if (!section) return;
	const details = section.querySelector("details");
	if (details) details.open = true;
	section.scrollIntoView({ behavior: "smooth", block: "start" });
}
