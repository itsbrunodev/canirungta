// @ts-check
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const VIRTUAL_ID = "virtual:script-hashes";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

// Published name -> source file. Hashes cover the exact bytes the site serves.
const SCRIPTS = { sh: "public/sh", ps: "public/ps" };

function sourcePath(relative) {
	return fileURLToPath(new URL(`../${relative}`, import.meta.url));
}

function sha256(path) {
	return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function sumsFile() {
	const lines = Object.entries(SCRIPTS).map(
		([name, relative]) => `${sha256(sourcePath(relative))}  ${name}`,
	);
	return `${lines.join("\n")}\n`;
}

// Computes SHA-256 of the probe scripts at build/dev time so the UI can never show a stale
// hash, and emits SHA256SUMS next to them for `sha256sum -c`.
export function scriptHashes() {
	return {
		name: "script-hashes",
		resolveId(id) {
			return id === VIRTUAL_ID ? RESOLVED_ID : null;
		},
		load(id) {
			if (id !== RESOLVED_ID) return null;
			const hashes = {};
			for (const [name, relative] of Object.entries(SCRIPTS)) {
				const path = sourcePath(relative);
				this.addWatchFile(path);
				hashes[name] = sha256(path);
			}
			return `export const SCRIPT_HASHES = ${JSON.stringify(hashes)};`;
		},
		// Dev server doesn't run generateBundle, so serve the file ourselves.
		configureServer(server) {
			server.middlewares.use("/SHA256SUMS", (_req, res) => {
				res.setHeader("Content-Type", "text/plain; charset=utf-8");
				res.end(sumsFile());
			});
		},
		generateBundle() {
			this.emitFile({
				type: "asset",
				fileName: "SHA256SUMS",
				source: sumsFile(),
			});
		},
	};
}
