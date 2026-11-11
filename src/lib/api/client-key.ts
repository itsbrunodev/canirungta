import type { APIContext } from "astro";

// Rate-limit key. clientAddress throws where the adapter cannot tell; those requests share one bucket.
export function clientKey(context: APIContext): string {
	try {
		return context.clientAddress || "unknown";
	} catch {
		return "unknown";
	}
}
