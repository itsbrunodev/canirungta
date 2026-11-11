import { CHECK_PARAMS, CHECK_SUMMARY } from "@/constants/api/check-params";

const SITE = "https://canirungta.com";

const spec = {
	openapi: "3.1.0",
	info: {
		title: "Can I Run GTA? API",
		version: "1.0.0",
		description: CHECK_SUMMARY,
	},
	servers: [{ url: SITE }],
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
				responses: { "200": { description: "Array of versions" } },
			},
		},
	},
	components: {
		schemas: {
			CheckResponse: {
				type: "object",
				properties: {
					input: { type: "object" },
					errors: { type: "array", items: { type: "string" } },
					warnings: { type: "array", items: { type: "string" } },
					results: {
						type: "array",
						items: {
							type: "object",
							properties: {
								id: { type: "string" },
								title: { type: "string" },
								edition: { type: "string" },
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
