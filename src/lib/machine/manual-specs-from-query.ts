import {
	type CheckQuery,
	hasSpecParams,
	parseCheckQuery,
} from "@/lib/api/parse-check-query";
import type { ManualSpecs } from "@/lib/machine/manual-specs";

// Reads /?cpu=..&gpu=..&ram=..&vram=..&disk=.. (same names as /api/check), so a link can carry specs.
// null when the URL names no specs.
export function manualSpecsFromQuery(search: string): ManualSpecs | null {
	const params = new URLSearchParams(search);
	if (!hasSpecParams(params)) return null;
	return manualSpecsFromCheckQuery(parseCheckQuery(params).query);
}

export function manualSpecsFromCheckQuery(query: CheckQuery): ManualSpecs {
	return {
		// The query always carries an os (defaulting to windows), so it cannot tell a choice from a default.
		os: null,
		cpuModel: query.cpu,
		gpuName: query.gpu,
		ramGb: query.ramGb,
		vramGb: query.vramGb,
		diskFreeGb: query.diskFreeGb,
	};
}
