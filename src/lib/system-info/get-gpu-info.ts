import type { GpuAdapterInfo, GpuInfo } from "@/lib/system-info/types";

type PowerPreference = GpuAdapterInfo["powerPreference"];

const EMPTY_GPU_INFO: GpuInfo = {
	webglVersion: null,
	vendor: null,
	renderer: null,
	maxTextureSize: null,
	adapters: [],
};

// No VRAM figure is exposed to the web; max texture size is the closest proxy.
// Asking for both power preferences lets dual-GPU laptops reveal the iGPU and the dGPU.
export async function getGpuInfo(): Promise<GpuInfo> {
	const preferences: PowerPreference[] = [
		"default",
		"high-performance",
		"low-power",
	];
	const contexts = preferences.map(readWebgl);
	const primary = contexts[0] ?? null;
	if (!primary) return { ...EMPTY_GPU_INFO, adapters: await readWebGpu() };

	const adapters = dedupe([
		...contexts.filter((c): c is WebglRead => c !== null).map((c) => c.adapter),
		...(await readWebGpu()),
	]);

	return {
		webglVersion: primary.version,
		vendor: primary.adapter.vendor,
		renderer: primary.adapter.renderer,
		maxTextureSize: primary.maxTextureSize,
		adapters,
	};
}

interface WebglRead {
	version: 1 | 2;
	maxTextureSize: number | null;
	adapter: GpuAdapterInfo;
}

function readWebgl(powerPreference: PowerPreference): WebglRead | null {
	const canvas = document.createElement("canvas");
	const options: WebGLContextAttributes =
		powerPreference === "default" ? {} : { powerPreference };
	const gl =
		canvas.getContext("webgl2", options) ?? canvas.getContext("webgl", options);
	if (!gl) return null;

	// Without the debug extension browsers return generic "WebKit"/"Mozilla" strings.
	const debug = gl.getExtension("WEBGL_debug_renderer_info");
	const vendor = gl.getParameter(debug?.UNMASKED_VENDOR_WEBGL ?? gl.VENDOR);
	const renderer = gl.getParameter(
		debug?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER,
	);

	const read: WebglRead = {
		version: gl instanceof WebGL2RenderingContext ? 2 : 1,
		maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE) ?? null,
		adapter: {
			source: "webgl",
			vendor: typeof vendor === "string" ? vendor : null,
			renderer: typeof renderer === "string" ? renderer : null,
			architecture: null,
			powerPreference,
		},
	};

	// Release the context so probing does not count against the browser's context limit.
	gl.getExtension("WEBGL_lose_context")?.loseContext();
	return read;
}

// WebGPU names the architecture even when WebGL hides the model (Firefox, Safari).
async function readWebGpu(): Promise<GpuAdapterInfo[]> {
	const gpu = navigator.gpu;
	if (!gpu) return [];

	const found: GpuAdapterInfo[] = [];
	for (const powerPreference of ["high-performance", "low-power"] as const) {
		try {
			const adapter = await gpu.requestAdapter({ powerPreference });
			if (!adapter?.info || isFallback(adapter)) continue;
			const { vendor, architecture, description, device } = adapter.info;
			found.push({
				source: "webgpu",
				vendor: vendor || null,
				renderer: description || device || null,
				architecture: architecture || null,
				powerPreference,
			});
		} catch {
			// Adapter request can reject on blocklisted drivers.
		}
	}
	return found;
}

// Same renderer reported under several preferences is one GPU.
function dedupe(adapters: GpuAdapterInfo[]): GpuAdapterInfo[] {
	const seen = new Set<string>();
	return adapters.filter((adapter) => {
		const key = `${adapter.source}|${adapter.renderer ?? ""}|${adapter.architecture ?? ""}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

// Fallback adapters are software renderers. The flag moved from the adapter to its info object.
function isFallback(adapter: GPUAdapter): boolean {
	type Flagged = { isFallbackAdapter?: boolean };
	return (
		(adapter as Flagged).isFallbackAdapter === true ||
		(adapter.info as Flagged).isFallbackAdapter === true
	);
}
