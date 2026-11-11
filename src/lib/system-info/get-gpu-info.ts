import type { GpuInfo } from "@/lib/system-info/types";

const EMPTY_GPU_INFO: GpuInfo = {
	webglVersion: null,
	vendor: null,
	renderer: null,
	maxTextureSize: null,
};

// No VRAM figure is exposed to the web; max texture size is the closest proxy.
export function getGpuInfo(): GpuInfo {
	const canvas = document.createElement("canvas");
	const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
	if (!gl) return { ...EMPTY_GPU_INFO };

	// Without the debug extension browsers return generic "WebKit"/"Mozilla" strings.
	const debug = gl.getExtension("WEBGL_debug_renderer_info");
	const vendor = debug
		? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL)
		: gl.getParameter(gl.VENDOR);
	const renderer = debug
		? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
		: gl.getParameter(gl.RENDERER);

	const info: GpuInfo = {
		webglVersion: gl instanceof WebGL2RenderingContext ? 2 : 1,
		vendor: typeof vendor === "string" ? vendor : null,
		renderer: typeof renderer === "string" ? renderer : null,
		maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE) ?? null,
	};

	// Release the context so probing does not count against the browser's context limit.
	gl.getExtension("WEBGL_lose_context")?.loseContext();

	return info;
}
