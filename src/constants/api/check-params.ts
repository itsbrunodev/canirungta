import { GTA_VERSIONS } from "@/constants/gta/versions";

// Single source for the check inputs, shared by the OpenAPI spec, the MCP tool and the in-page WebMCP tool.
export interface CheckParam {
	name: string;
	type: "string" | "number";
	description: string;
	example: string | number;
	enum?: string[];
}

export const VERSION_IDS = GTA_VERSIONS.map((version) => version.id);

// The hardware inputs; a check needs at least one of them.
export const SPEC_PARAM_NAMES = ["cpu", "gpu", "ram", "vram", "disk"];

export const VERSION_PARAM: CheckParam = {
	name: "version",
	type: "string",
	description: `Limit results to these version ids, comma-separated; default all. Ids: ${VERSION_IDS.join(", ")}`,
	example: "gta-v-enhanced",
};

export const CHECK_PARAMS: CheckParam[] = [
	{
		name: "cpu",
		type: "string",
		description:
			"CPU marketing name, e.g. 'Ryzen 5 5600' or 'Core i7-9700K'. Needed for a CPU verdict.",
		example: "Ryzen 5 5600",
	},
	{
		name: "gpu",
		type: "string",
		description:
			"GPU marketing name, e.g. 'RTX 3060' or 'Radeon RX 6600'. Needed for a GPU verdict.",
		example: "RTX 3060",
	},
	{
		name: "ram",
		type: "number",
		description: "System RAM in GB",
		example: 16,
	},
	{
		name: "vram",
		type: "number",
		description: "GPU memory in GB; only used together with gpu",
		example: 12,
	},
	{
		name: "disk",
		type: "number",
		description: "Free disk space in GB",
		example: 200,
	},
	{
		name: "os",
		type: "string",
		description: "Operating system; defaults to windows",
		example: "windows",
		enum: ["windows", "linux", "macos", "mobile"],
	},
	{
		name: "windows",
		type: "number",
		description:
			"Windows major version; pass 10 for Windows 10 and 11. Omitted = OS check unknown on newer games.",
		example: 10,
	},
	VERSION_PARAM,
];

// Appended to tool/endpoint descriptions so every interface tells agents how to present FPS figures.
export const PERFORMANCE_SUMMARY =
	'Each result also has a "performance" estimate: average FPS per resolution (720p/1080p/1440p/4K) and settings preset, with a range, the bottleneck and the best smooth setting. It is modelled from benchmarks, so present it as an estimate (a projection for the unreleased GTA VI), never a measurement.';

export const CHECK_SUMMARY =
	"Check a PC's specs against the requirements of every PC Grand Theft Auto release. Omitted specs come back as unknown, never as a pass.";
