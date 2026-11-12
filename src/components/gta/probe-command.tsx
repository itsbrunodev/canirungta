import { useEffect, useState } from "preact/hooks";

import { CopyButton } from "@/components/gta/copy-button";
import { HighlightedCommand } from "@/components/gta/highlighted-command";
import { OpenInBrowserToggle } from "@/components/gta/open-in-browser-toggle";
import { ScriptTrust } from "@/components/gta/script-trust";
import { SegmentedControl } from "@/components/ui/segmented-control";

import {
	getProbeCommand,
	type ProbePlatform,
} from "@/constants/probe-commands";

interface PlatformTab {
	id: ProbePlatform;
	label: string;
	prompt: string;
	source: string;
}

const TABS: PlatformTab[] = [
	{ id: "windows", label: "Windows", prompt: ">", source: "/ps" },
	{ id: "unix", label: "Linux, macOS, WSL", prompt: "$", source: "/sh" },
];

// OS tabs + copyable probe command; shared by the inline panel and the dialog.
export function ProbeCommand() {
	const [platform, setPlatform] = useState<ProbePlatform>("windows");
	const [openInBrowser, setOpenInBrowser] = useState(true);

	// Start on the visitor's own OS; server render and first paint use windows (first tab).
	useEffect(() => {
		if (!/windows/i.test(navigator.userAgent)) setPlatform("unix");
	}, []);

	const active = TABS.find((tab) => tab.id === platform) ?? TABS[0];
	const command = getProbeCommand(platform, openInBrowser);

	return (
		<div class="flex flex-col gap-3">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<SegmentedControl
					kind="tabs"
					label="Operating system"
					value={platform}
					onChange={setPlatform}
					options={TABS.map((tab) => ({ id: tab.id, label: tab.label }))}
				/>
				<p class="text-muted-foreground text-sm sm:text-xs">
					Reads hardware only, then opens this page with the data.{" "}
					<a
						href={active.source}
						target="_blank"
						rel="noopener noreferrer"
						class="text-foreground underline decoration-ink/30 underline-offset-2 hover:decoration-foreground"
					>
						View source
					</a>
				</p>
			</div>
			<div class="glass flex items-center gap-2 rounded-xl py-1.5 pr-1.5 pl-3 sm:gap-3 sm:rounded-2xl sm:py-2 sm:pr-2 sm:pl-4">
				<span class="select-none font-mono text-accent text-sm">
					{active.prompt}
				</span>
				<code class="min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-1.5 font-mono text-foreground text-sm [scrollbar-width:none]">
					<HighlightedCommand command={command} />
				</code>
				<CopyButton text={command} />
			</div>
			<OpenInBrowserToggle
				checked={openInBrowser}
				onChange={setOpenInBrowser}
			/>
			<ScriptTrust platform={platform} />
		</div>
	);
}
