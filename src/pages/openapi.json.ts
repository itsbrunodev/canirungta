import {
	CHECK_PARAMS,
	CHECK_SUMMARY,
	PERFORMANCE_SUMMARY,
	VERSION_IDS,
} from "@/constants/api/check-params";
import { SITE_URL } from "@/constants/site";

const REQUIREMENT_SCHEMA = {
	type: "object",
	description: "null = no published figure",
	properties: {
		ramGb: { type: ["number", "null"] },
		vramGb: { type: ["number", "null"] },
		diskGb: { type: ["number", "null"] },
		cpu: {
			type: ["array", "null"],
			items: { type: "string" },
			description: "Any one qualifies",
		},
		gpu: {
			type: ["array", "null"],
			items: { type: "string" },
			description: "Any one qualifies",
		},
	},
};

const FPS_ESTIMATE_SCHEMA = {
	type: "object",
	properties: {
		presetId: { type: "string" },
		label: { type: "string", description: "Settings preset, e.g. Very High" },
		fps: {
			type: ["number", "null"],
			description: "Estimated average FPS; null when the preset is unavailable",
		},
		low: { type: ["number", "null"], description: "Low end of the range" },
		high: { type: ["number", "null"], description: "High end of the range" },
		rating: {
			type: ["string", "null"],
			enum: ["smooth", "playable", "choppy", null],
			description: "smooth = 60 FPS class, playable = 30 FPS class",
		},
		limitedBy: {
			type: ["string", "null"],
			enum: ["gpu", "cpu", "vram", "ram", "engine", null],
		},
		note: { type: ["string", "null"] },
	},
};

const PERFORMANCE_SCHEMA = {
	type: "object",
	description:
		"Estimated average FPS at native resolution, from a model fitted to benchmarks. An estimate, not a measurement",
	properties: {
		status: {
			type: "string",
			enum: ["estimated", "unknown"],
			description: "unknown = no GPU supplied, so nothing to estimate from",
		},
		basis: {
			type: "string",
			enum: ["benchmarks", "projected"],
			description: "projected = game has no PC release yet; far less certain",
		},
		summary: { type: "string" },
		best: {
			type: ["object", "null"],
			description:
				"Highest-quality setting that stays smooth (or playable if none is)",
			properties: {
				resolution: { type: "string", enum: ["720p", "1080p", "1440p", "4k"] },
				resolutionLabel: { type: "string" },
				estimate: FPS_ESTIMATE_SCHEMA,
			},
		},
		resolutions: {
			type: "array",
			items: {
				type: "object",
				properties: {
					id: { type: "string", enum: ["720p", "1080p", "1440p", "4k"] },
					label: { type: "string" },
					presets: {
						type: "array",
						description: "Lowest to highest quality",
						items: FPS_ESTIMATE_SCHEMA,
					},
				},
			},
		},
		fpsCap: {
			type: ["number", "null"],
			description: "Frame limiter or engine ceiling",
		},
		cpuAssumed: {
			type: "boolean",
			description: "No CPU supplied: figures are the GPU's ceiling",
		},
		approximate: {
			type: "boolean",
			description: "A part's speed came from published specs; wider range",
		},
		notes: { type: "array", items: { type: "string" } },
	},
};

const spec = {
	openapi: "3.1.0",
	info: {
		title: "Can I run GTA? API",
		version: "1.3.0",
		description: CHECK_SUMMARY,
	},
	servers: [{ url: SITE_URL }],
	paths: {
		"/api/check": {
			get: {
				operationId: "checkGtaCompatibility",
				summary: "Check specs against every PC GTA version",
				description: `Pass at least one of cpu, gpu, ram, vram, disk. ${PERFORMANCE_SUMMARY}`,
				parameters: CHECK_PARAMS.map((param) => ({
					name: param.name,
					in: "query",
					description: param.description,
					example: param.example,
					schema: {
						type: param.type,
						...(param.enum && { enum: param.enum }),
					},
				})),
				responses: {
					"200": {
						description: "One result per GTA version",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/CheckResponse" },
							},
						},
					},
					"400": { description: "No specs supplied" },
				},
			},
		},
		"/api/versions.json": {
			get: {
				operationId: "listGtaRequirements",
				summary: "Published minimum and recommended specs per GTA version",
				responses: {
					"200": {
						description: "Array of versions",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: { $ref: "#/components/schemas/GtaVersion" },
								},
							},
						},
					},
				},
			},
		},
	},
	components: {
		schemas: {
			GtaVersion: {
				type: "object",
				properties: {
					id: { type: "string", enum: VERSION_IDS },
					title: { type: "string" },
					edition: { type: "string" },
					confidence: {
						type: "string",
						enum: ["official", "approximate", "unannounced"],
					},
					sourceUrl: { type: "string" },
					minimum: REQUIREMENT_SCHEMA,
					recommended: {
						oneOf: [REQUIREMENT_SCHEMA, { type: "null" }],
						description: "Missing fields fall back to the minimum",
					},
					os: {
						type: "object",
						properties: {
							minWindowsMajor: { type: ["number", "null"] },
							requires64Bit: { type: "boolean" },
						},
					},
				},
			},
			CheckResponse: {
				type: "object",
				properties: {
					input: { type: "object" },
					errors: { type: "array", items: { type: "string" } },
					warnings: { type: "array", items: { type: "string" } },
					suggestions: {
						type: "object",
						description:
							"Closest recognised names for an unrecognised cpu or gpu; retry with one of them",
						properties: {
							cpu: { type: "array", items: { type: "string" } },
							gpu: { type: "array", items: { type: "string" } },
						},
					},
					resultsUrl: {
						type: "string",
						description: "Web page showing this check; share it with the user",
					},
					results: {
						type: "array",
						items: {
							type: "object",
							properties: {
								id: { type: "string", enum: VERSION_IDS },
								title: { type: "string" },
								edition: { type: "string" },
								summary: {
									type: "string",
									description: "One-sentence explanation of the verdict",
								},
								verdict: {
									type: "string",
									enum: [
										"runs-well",
										"runs",
										"cannot",
										"unknown",
										"needs-windows",
										"unsupported",
									],
								},
								confidence: {
									type: "string",
									enum: ["official", "approximate", "unannounced"],
								},
								sourceUrl: { type: "string" },
								performance: PERFORMANCE_SCHEMA,
								checks: {
									type: "array",
									items: {
										type: "object",
										properties: {
											label: { type: "string" },
											status: {
												type: "string",
												enum: ["pass", "fail", "unknown"],
											},
											actual: { type: ["string", "null"] },
											required: { type: ["string", "null"] },
											note: { type: ["string", "null"] },
										},
									},
								},
							},
						},
					},
				},
			},
		},
	},
};

export function GET() {
	return new Response(JSON.stringify(spec, null, 2), {
		headers: { "Content-Type": "application/json" },
	});
}
