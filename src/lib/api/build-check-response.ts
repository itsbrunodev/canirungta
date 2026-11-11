import { GTA_VERSIONS } from "@/constants/gta/versions";

import type { ParsedCheckQuery } from "@/lib/api/parse-check-query";
import { checkGtaVersion } from "@/lib/gta/check-version";
import { scoreCpu } from "@/lib/hardware/score-cpu";
import { scoreGpu } from "@/lib/hardware/score-gpu";

export function buildCheckResponse({ query, specs, errors }: ParsedCheckQuery) {
	const warnings: string[] = [];
	if (query.cpu && scoreCpu(query.cpu) === null) {
		warnings.push(`CPU "${query.cpu}" not recognised; CPU checks are unknown`);
	}
	if (query.gpu && scoreGpu(query.gpu) === null) {
		warnings.push(`GPU "${query.gpu}" not recognised; GPU checks are unknown`);
	}

	const results = GTA_VERSIONS.map((version) => {
		const report = checkGtaVersion(version, specs);
		return {
			id: version.id,
			title: version.title,
			edition: version.edition,
			verdict: report.verdict,
			confidence: version.confidence,
			sourceUrl: version.sourceUrl,
			checks: report.checks,
		};
	});

	return { input: query, errors, warnings, results };
}
