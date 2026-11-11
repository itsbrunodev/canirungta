// Lowercases a probe or product name and drops trademark marks and vendor words, so it can be matched against dataset names.
export function normalizeName(text: string): string {
	return text
		.toLowerCase()
		.replace(/\((?:tm|r)\)/g, "")
		.replace(/\b(nvidia|amd|intel|ati)\b/g, "")
		.replace(/\s+/g, " ")
		.trim();
}
