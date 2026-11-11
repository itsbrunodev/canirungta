import {
	MOBILE_FACTOR,
	MOBILE_PATTERN,
} from "@/constants/hardware/reference-specs";

import { scoreAmd } from "@/lib/hardware/score-gpu-amd";
import { scoreNvidia } from "@/lib/hardware/score-gpu-nvidia";
import { scoreOtherGpu } from "@/lib/hardware/score-gpu-other";

// Relative GPU speed (GTX 1060 = 100) from a free-form name, or null when the model is not
// recognised. Newer generations of a known family are scored by the newest rule on purpose, so
// new hardware needs no table update; an unknown family reads as "unknown", never "fail".
export function scoreGpu(name: string): number | null {
	const text = name.toLowerCase().replace(/\((?:tm|r)\)/g, "");
	const score = scoreNvidia(text) ?? scoreAmd(text) ?? scoreOtherGpu(text);
	if (score === null) return null;
	return MOBILE_PATTERN.test(text) ? score * MOBILE_FACTOR : score;
}
