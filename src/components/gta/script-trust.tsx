import { SCRIPT_HASHES } from "virtual:script-hashes";

import { CopyButton } from "@/components/gta/copy-button";

import {
	getHashCommand,
	getVirusTotalUrl,
	type ProbePlatform,
} from "@/constants/probe-commands";

import { ChevronDownIcon } from "@/icons/chevron-down";
import { ExternalLinkIcon } from "@/icons/external-link";
import { ShieldIcon } from "@/icons/shield";

interface ScriptTrustProps {
	platform: ProbePlatform;
}

const LINK_CLASS =
	"inline-flex items-center gap-1 text-foreground underline decoration-ink/30 underline-offset-2 hover:decoration-foreground";

// Lets a visitor verify the script they are about to run matches what the site publishes.
export function ScriptTrust({ platform }: ScriptTrustProps) {
	const hash = SCRIPT_HASHES[platform === "unix" ? "sh" : "ps"];
	const hashCommand = getHashCommand(platform);

	return (
		<details class="group/trust details-smooth">
			<summary class="glass flex h-10 w-fit max-w-full cursor-pointer list-none items-center gap-2 rounded-full pr-2.5 pl-2.5 font-medium text-foreground text-sm transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent sm:h-8 sm:text-xs [&::-webkit-details-marker]:hidden">
				<ShieldIcon class="size-4 text-accent" />
				Is this safe? Verify the script
				<ChevronDownIcon class="size-4 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-open/trust:rotate-180 motion-reduce:transition-none" />
			</summary>

			<div class="flex flex-col gap-3 pt-3">
				<div class="glass flex items-center gap-2 rounded-xl py-1.5 pr-1.5 pl-3 sm:gap-3 sm:rounded-2xl sm:py-2 sm:pr-2 sm:pl-4">
					<div class="flex min-w-0 flex-1 flex-col gap-0.5">
						<span class="font-medium text-foreground text-sm sm:text-xs">
							SHA-256
						</span>
						<code class="break-all font-mono text-muted-foreground text-sm sm:text-xs">
							{hash}
						</code>
					</div>
					<CopyButton text={hash} label="Copy hash" />
				</div>

				<div class="glass flex items-center gap-2 rounded-xl py-1.5 pr-1.5 pl-3 sm:gap-3 sm:rounded-2xl sm:py-2 sm:pr-2 sm:pl-4">
					<div class="flex min-w-0 flex-1 flex-col gap-0.5">
						<span class="font-medium text-foreground text-sm sm:text-xs">
							Hash it without running it, then compare
						</span>
						<code class="overflow-x-auto whitespace-nowrap font-mono text-muted-foreground text-sm [scrollbar-width:none] sm:text-xs">
							{hashCommand}
						</code>
					</div>
					<CopyButton text={hashCommand} label="Copy hash command" />
				</div>

				<p class="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm sm:text-xs">
					<a
						href={getVirusTotalUrl(hash)}
						target="_blank"
						rel="noopener noreferrer"
						class={LINK_CLASS}
					>
						VirusTotal report
						<ExternalLinkIcon class="size-3" />
					</a>
					<a href="/SHA256SUMS" class={LINK_CLASS}>
						SHA256SUMS
					</a>
					<span>Read-only: installs and writes nothing.</span>
				</p>
			</div>
		</details>
	);
}
