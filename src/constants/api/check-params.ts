// Single source for the check inputs, shared by the OpenAPI spec and the MCP tool schema.
export interface CheckParam {
	name: string;
	type: "string" | "number";
	description: string;
	example: string | number;
	enum?: string[];
}

export const CHECK_PARAMS: CheckParam[] = [
	{
		name: "cpu",
		type: "string",
		description: "CPU model, e.g. 'Ryzen 5 5600'",
		example: "Ryzen 5 5600",
	},
	{
		name: "gpu",
		type: "string",
		description: "GPU model, e.g. 'RTX 3060'",
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
		description: "GPU memory in GB",
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
		description: "Windows major version; 10 also covers Windows 11",
		example: 10,
	},
];

export const CHECK_SUMMARY =
	"Check a PC's specs against the requirements of every PC Grand Theft Auto release. Omitted specs come back as unknown, never as a pass.";
