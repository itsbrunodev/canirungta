import { GTA_VERSIONS } from "@/constants/gta/versions";

import { buildResultsUrl } from "@/lib/api/build-results-url";
import type { ParsedCheckQuery } from "@/lib/api/parse-check-query";
import { summarizeReport } from "@/lib/api/summarize-report";
import { checkGtaVersion } from "@/lib/gta/check-version";
import { scoreCpu } from "@/lib/hardware/score-cpu";
import { scoreGpu } from "@/lib/hardware/score-gpu";
import { suggestCpus, suggestGpus } from "@/lib/hardware/suggest-hardware";

export function buildCheckResponse({ query, specs, errors }: ParsedCheckQuery) {
	const warnings: string[] = [];
	// Closest names the checker does recognise, for retrying an unrecognised one.
	const suggestions: { cpu: string[]; gpu: string[] } = { cpu: [], gpu: [] };
	if (query.cpu && scoreCpu(query.cpu) === null) {
		suggestions.cpu = suggestCpus(query.cpu);
		warnings.push(
			unrecognised("CPU", query.cpu, suggestions.cpu, "Core i5-12400F"),
		);
	}
	if (query.gpu && scoreGpu(query.gpu) === null) {
		suggestions.gpu = suggestGpus(query.gpu);
		warnings.push(
			unrecognised("GPU", query.gpu, suggestions.gpu, "GeForce RTX 3060"),
		);
	}

	const results = GTA_VERSIONS.filter(
		(version) => !query.versions || query.versions.includes(version.id),
	).map((version) => {
		const report = checkGtaVersion(version, specs);
		return {
			id: version.id,
			title: version.title,
			edition: version.edition,
			verdict: report.verdict,
			summary: summarizeReport(report),
			confidence: version.confidence,
			sourceUrl: version.sourceUrl,
			checks: report.checks,
		};
	});

	return {
		input: query,
		errors,
		warnings,
		suggestions,
		resultsUrl: buildResultsUrl(query),
		results,
	};
}

function unrecognised(
	part: string,
	name: string,
	suggestions: string[],
	example: string,
): string {
	const hint =
		suggestions.length > 0
			? `Did you mean: ${suggestions.map((s) => `"${s}"`).join(", ")}?`
			: `Retry with the exact marketing name, e.g. "${example}".`;
	return `${part} "${name}" not recognised; ${part} checks are unknown. ${hint}`;
}
