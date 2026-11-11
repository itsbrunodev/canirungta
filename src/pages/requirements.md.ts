import { buildRequirementsMarkdown } from "@/lib/gta/requirements-markdown";

export function GET() {
	return new Response(buildRequirementsMarkdown(), {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
}
