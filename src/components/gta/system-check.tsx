import { useEffect, useState } from "preact/hooks";

import { CommandPanel } from "@/components/gta/command-panel";
import { ProbeDialog } from "@/components/gta/probe-dialog";
import { VersionRow } from "@/components/gta/version-row";

import { GTA_VERSIONS } from "@/constants/gta/versions";

import { checkGtaVersion } from "@/lib/gta/check-version";
import type { CoverImage } from "@/lib/gta/types";
import {
	applyManualSpecs,
	EMPTY_MANUAL_SPECS,
	loadManualSpecs,
	type ManualSpecs,
	saveManualSpecs,
} from "@/lib/machine/manual-specs";
import { manualSpecsFromQuery } from "@/lib/machine/manual-specs-from-query";
import { loadProbe, saveProbe } from "@/lib/machine/probe-storage";
import { readProbeFromHash } from "@/lib/machine/read-probe-fragment";
import { specsFromBrowser } from "@/lib/machine/specs-from-browser";
import { specsFromProbe } from "@/lib/machine/specs-from-probe";
import type { MachineSpecs } from "@/lib/machine/types";
import { getSystemInfo } from "@/lib/system-info/get-system-info";
import { registerCheckTool } from "@/lib/webmcp/register-check-tool";

interface SystemCheckProps {
	// Keyed by version id; built by getGtaCovers() in index.astro.
	covers: Record<string, CoverImage>;
}

interface LoadedSpecs {
	specs: MachineSpecs;
	// Set when the data came from a saved probe, so the UI can show its age.
	savedAt: string | null;
}

export function SystemCheck({ covers }: SystemCheckProps) {
	const [loaded, setLoaded] = useState<LoadedSpecs | null>(null);
	const [manual, setManual] = useState<ManualSpecs>(EMPTY_MANUAL_SPECS);

	useEffect(() => {
		let cancelled = false;
		void loadSpecs().then((result) => {
			if (!cancelled) setLoaded(result);
		});
		// Specs in the URL (a shared or AI-built link) win for this visit, without replacing saved ones.
		setManual(
			manualSpecsFromQuery(window.location.search) ?? loadManualSpecs(),
		);
		registerCheckTool((next) => {
			setManual(next);
			saveManualSpecs(next);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	function submitManual(next: ManualSpecs) {
		setManual(next);
		saveManualSpecs(next);
		// Typed values replace any from the link, so drop them from the address bar.
		if (window.location.search) {
			history.replaceState(null, "", window.location.pathname);
		}
	}

	const specs = loaded ? applyManualSpecs(loaded.specs, manual) : null;
	const reports = specs
		? GTA_VERSIONS.map((version) => checkGtaVersion(version, specs))
		: null;
	// Detection gaps can be closed by the probe or by typing; point at both when a verdict is unsure.
	const offerExactResults =
		loaded?.specs.source === "browser" &&
		(reports?.some((report) => report.verdict === "unknown") ?? false);

	return (
		<div class="flex flex-col gap-12 sm:gap-16">
			<section id="exact-results" class="scroll-mt-8">
				<CommandPanel manual={manual} onManualSubmit={submitManual} />
			</section>
			<ul id="versions" class="flex scroll-mt-8 flex-col" aria-busy={!reports}>
				{GTA_VERSIONS.map((version, index) => (
					<VersionRow
						key={version.id}
						version={version}
						index={index}
						report={reports?.[index] ?? null}
						cover={covers[version.id]}
						offerExactResults={offerExactResults}
					/>
				))}
			</ul>
			{loaded?.specs.source === "browser" && <ProbeDialog />}
		</div>
	);
}

// Priority: fresh link > saved probe > browser-only data.
async function loadSpecs(): Promise<LoadedSpecs> {
	const fromHash = readProbeFromHash(window.location.hash);
	const fromLink = specsFromProbe(fromHash);
	if (fromLink) {
		// Remove the data from the address bar once read, so it stays out of history.
		history.replaceState(null, "", window.location.pathname);
		return { specs: fromLink, savedAt: saveProbe(fromHash) };
	}

	const stored = loadProbe();
	const fromStorage = stored ? specsFromProbe(stored.probe) : null;
	if (stored && fromStorage) {
		return { specs: fromStorage, savedAt: stored.savedAt };
	}

	return { specs: specsFromBrowser(await getSystemInfo()), savedAt: null };
}
