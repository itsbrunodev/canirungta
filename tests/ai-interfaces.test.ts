import { describe, expect, it } from "vitest";

import { VERSION_IDS } from "@/constants/api/check-params";

import { buildCheckResponse } from "@/lib/api/build-check-response";
import { hasSpecParams, parseCheckQuery } from "@/lib/api/parse-check-query";
import { buildRequirementsMarkdown } from "@/lib/gta/requirements-markdown";
import { scoreCpu } from "@/lib/hardware/score-cpu";
import { scoreGpu } from "@/lib/hardware/score-gpu";
import { suggestCpus, suggestGpus } from "@/lib/hardware/suggest-hardware";
import { manualSpecsFromQuery } from "@/lib/machine/manual-specs-from-query";

function check(query: string) {
	return buildCheckResponse(parseCheckQuery(new URLSearchParams(query)));
}

describe("check API extras", () => {
	it("filters by version and reports unknown ids", () => {
		const out = check("ram=16&version=gta-vi,GTA-V-Enhanced,nope");
		expect(out.results.map((r) => r.id)).toEqual(["gta-vi", "gta-v-enhanced"]);
		expect(out.errors.some((e) => e.includes('"nope"'))).toBe(true);
	});

	it("returns every version when the filter has no valid id", () => {
		expect(check("ram=16&version=nope").results.length).toBe(
			VERSION_IDS.length,
		);
	});

	it("summarises each verdict in a sentence", () => {
		const out = check("ram=2&version=gta-v-enhanced");
		expect(out.results[0]?.summary).toContain("RAM");
		const blank = check("ram=64&windows=10&version=gta-v-enhanced");
		expect(blank.results[0]?.summary).toContain("No verdict");
	});

	it("links to the page with the same specs", () => {
		const { resultsUrl } = check("cpu=Ryzen 5 5600&ram=16&os=linux");
		const url = new URL(resultsUrl);
		expect(url.searchParams.get("cpu")).toBe("Ryzen 5 5600");
		expect(url.searchParams.get("ram")).toBe("16");
		expect(url.searchParams.has("os")).toBe(false);
	});

	it("does not count os, windows or version as specs", () => {
		expect(hasSpecParams(new URLSearchParams("os=linux&windows=10"))).toBe(
			false,
		);
		expect(hasSpecParams(new URLSearchParams("version=gta-vi&ram="))).toBe(
			false,
		);
		expect(hasSpecParams(new URLSearchParams("disk=50"))).toBe(true);
	});

	it("flags vram without a gpu", () => {
		expect(check("vram=8").errors[0]).toContain("vram");
	});
});

describe("hardware suggestions", () => {
	it("suggests recognised names for typos", () => {
		expect(suggestGpus("RTX 306")[0]).toBe("GeForce RTX 3060");
		expect(suggestGpus("Radoen RX 6600")).toContain("Radeon RX 6600");
		expect(suggestCpus("Rizen 5 3600")[0]).toBe("Ryzen 5 3600");
		expect(suggestCpus("12400F")[0]).toBe("Core i5 12400F");
	});

	it("only suggests names that then get a verdict", () => {
		for (const name of suggestGpus("GTX 106")) {
			expect(scoreGpu(name)).not.toBeNull();
		}
		for (const name of suggestCpus("i5 1240")) {
			expect(scoreCpu(name)).not.toBeNull();
		}
	});

	it("suggests nothing for junk", () => {
		expect(suggestGpus("Banana 9000")).toEqual([]);
		expect(suggestCpus("zz")).toEqual([]);
	});

	it("puts suggestions in the check response", () => {
		const out = check("gpu=RTX 306&cpu=Ryzen 5 5600");
		expect(out.suggestions.gpu).toContain("GeForce RTX 3060");
		expect(out.suggestions.cpu).toEqual([]);
		expect(out.warnings[0]).toContain("Did you mean");
	});
});

describe("manualSpecsFromQuery", () => {
	it("reads specs from a page URL", () => {
		expect(manualSpecsFromQuery("?cpu=Core i7-9700K&ram=16&disk=abc")).toEqual({
			cpuModel: "Core i7-9700K",
			gpuName: null,
			ramGb: 16,
			vramGb: null,
			diskFreeGb: null,
		});
	});

	it("returns null without specs", () => {
		expect(manualSpecsFromQuery("")).toBeNull();
		expect(manualSpecsFromQuery("?utm_source=x")).toBeNull();
	});
});

describe("buildRequirementsMarkdown", () => {
	it("covers every version", () => {
		const markdown = buildRequirementsMarkdown();
		for (const id of VERSION_IDS) expect(markdown).toContain(`\`${id}\``);
		expect(markdown).toContain("| RAM | 8 GB | 16 GB |");
		expect(markdown).not.toContain("null");
	});
});
