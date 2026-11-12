import { describe, expect, it } from "vitest";

import { buildCheckResponse } from "@/lib/api/build-check-response";
import { parseCheckQuery } from "@/lib/api/parse-check-query";

function check(query: string) {
	return buildCheckResponse(parseCheckQuery(new URLSearchParams(query)));
}

describe("check API", () => {
	it("passes a strong PC on GTA V Enhanced", () => {
		const out = check(
			"cpu=Ryzen 7 5800X&gpu=RTX 4070&ram=32&vram=12&disk=500&windows=10",
		);
		const v = out.results.find((r) => r.id === "gta-v-enhanced");
		expect(v?.verdict).toBe("runs-well");
		expect(out.errors).toEqual([]);
	});

	it("fails low RAM", () => {
		const out = check("ram=2&os=windows");
		const v = out.results.find((r) => r.id === "gta-v-enhanced");
		expect(v?.verdict).toBe("cannot");
	});

	it("reports bad numbers and unknown os", () => {
		const { errors } = check("ram=abc&os=beos");
		expect(errors.length).toBe(2);
	});

	it("warns on unrecognised hardware", () => {
		const { warnings } = check("gpu=Banana 9000");
		expect(warnings[0]).toContain("not recognised");
	});

	it("never passes omitted specs", () => {
		const out = check("os=windows&ram=64");
		for (const r of out.results) {
			expect(r.checks.some((c) => c.status === "unknown")).toBe(true);
		}
	});

	it("includes the FPS estimate", () => {
		const out = check(
			"cpu=Ryzen 7 5800X&gpu=RTX 4070&ram=32&vram=12&disk=500&windows=10",
		);
		const perf = out.results.find(
			(r) => r.id === "gta-v-enhanced",
		)?.performance;
		expect(perf?.status).toBe("estimated");
		expect(perf?.best?.estimate.fps).toBeGreaterThanOrEqual(57);
		expect(perf?.resolutions.map((r) => r.id)).toEqual([
			"720p",
			"1080p",
			"1440p",
			"4k",
		]);
		expect(perf?.summary).toContain("FPS");
	});
});
