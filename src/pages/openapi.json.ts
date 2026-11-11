import {
	CHECK_PARAMS,
	CHECK_SUMMARY,
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

const spec = {
	openapi: "3.1.0",
	info: {
		title: "Can I Run GTA? API",
		version: "1.1.0",
		description: CHECK_SUMMARY,
	},
	servers: [{ url: SITE_URL }],
	paths: {
		"/api/check": {
			get: {
				operationId: "checkGtaCompatibility",
				summary: "Check specs against every PC GTA version",
				description: "Pass at least one of cpu, gpu, ram, vram, disk.",
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
