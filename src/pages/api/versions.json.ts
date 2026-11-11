import { GTA_VERSIONS } from "@/constants/gta/versions";

export function GET() {
	return new Response(JSON.stringify(GTA_VERSIONS, null, 2), {
		headers: { "Content-Type": "application/json" },
	});
}
