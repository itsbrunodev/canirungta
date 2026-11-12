// Hardware ray tracing: GeForce RTX, Radeon RX 6000 and newer, Intel Arc, Apple M-series.
const RAY_TRACING_PATTERN =
	/\brtx\b|\brx\s*[6-9]\d{3}|\barc\b|\bradeon\s*[6-9]\d0m\b|\bapple\s*m[3-9]/i;

export function supportsRayTracing(name: string): boolean {
	return RAY_TRACING_PATTERN.test(name);
}
