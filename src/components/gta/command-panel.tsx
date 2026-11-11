import { ManualSpecsForm } from "@/components/gta/manual-specs-form";
import { ProbeCommand } from "@/components/gta/probe-command";

import type { ManualSpecs } from "@/lib/machine/manual-specs";

import { CpuIcon } from "@/icons/cpu";

interface CommandPanelProps {
	manual: ManualSpecs;
	onManualSubmit: (specs: ManualSpecs) => void;
}

export function CommandPanel({ manual, onManualSubmit }: CommandPanelProps) {
	return (
		<details class="group details-smooth">
			<summary class="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-center sm:justify-between [&::-webkit-details-marker]:hidden">
				<div class="flex items-start gap-3 sm:items-center">
					<CpuIcon class="mt-0.5 size-4 shrink-0 text-primary sm:mt-0" />
					<p class="text-base text-muted-foreground leading-relaxed sm:text-sm">
						<span class="font-medium text-foreground">Want exact results?</span>{" "}
						Browsers only report approximate hardware. Run a quick check on your
						machine for real figures.
					</p>
				</div>
				<span class="glass inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full px-3 font-medium text-foreground text-sm transition-colors hover:border-accent/40 hover:text-accent group-focus-visible:outline-2 sm:h-8">
					<span class="group-open:hidden">Get exact results</span>
					<span class="hidden group-open:inline">Hide</span>
				</span>
			</summary>
			<div class="flex flex-col gap-6 pt-4 pb-1">
				<ProbeCommand />
				<div class="flex flex-col gap-1 border-ink/10 border-t pt-5">
					<h2 class="font-semibold text-base text-foreground sm:text-lg">
						Or enter your specs by hand
					</h2>
					<ManualSpecsForm value={manual} onSubmit={onManualSubmit} />
				</div>
			</div>
		</details>
	);
}
