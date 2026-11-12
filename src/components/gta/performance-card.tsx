import { FpsHeadline } from "@/components/gta/fps-headline";
import { FpsRow } from "@/components/gta/fps-row";
import { InfoPopover } from "@/components/gta/info-popover";
import { ResolutionPicker } from "@/components/gta/resolution-picker";

import {
	FPS_BAR_MIN_SCALE,
	FPS_TARGET,
} from "@/constants/gta/fps-rating-styles";

import type {
	PerformanceReport,
	ResolutionId,
} from "@/lib/gta/performance-types";
import { pickPreset } from "@/lib/gta/pick-setting";
import { openExactResults } from "@/lib/machine/open-exact-results";

interface PerformanceCardProps {
	report: PerformanceReport;
	title: string;
	// The visitor's pick, else the monitor's resolution; null follows this game's best setting.
	resolution: ResolutionId | null;
	onResolutionChange: (resolution: ResolutionId) => void;
	// A minimum check failed, so the game may not start at all.
	belowMinimum: boolean;
	delay?: number;
}

// Same step as the spec tiles below.
const STAGGER_MS = 70;
const CARD_CLASS =
	// Above the tiles below it, so the info popover is not painted over.
	"glass relative z-10 col-span-full rounded-xl shadow-(--shadow-card) sm:rounded-2xl";
const LINK_CLASS =
	"cursor-pointer self-start text-accent text-sm underline decoration-accent/40 underline-offset-2 hover:decoration-accent focus-visible:outline-2 focus-visible:outline-accent sm:text-xs";

export function PerformanceCard({
	report,
	title,
	resolution,
	onResolutionChange,
	belowMinimum,
	delay = 0,
}: PerformanceCardProps) {
	if (report.status === "unknown") {
		return (
			<section class={CARD_CLASS} aria-label={`Estimated FPS for ${title}`}>
				<div class="flex flex-col gap-2 p-4 sm:p-5">
					<h3 class="font-medium text-muted-foreground text-sm">
						Estimated FPS
					</h3>
					<p class="text-foreground text-sm">
						Your graphics card could not be read, so there is nothing to
						estimate from yet.
					</p>
					<button type="button" onClick={openExactResults} class={LINK_CLASS}>
						Add your GPU to see FPS
					</button>
				</div>
			</section>
		);
	}

	const activeId = resolution ?? report.best?.resolution ?? "1080p";
	const active =
		report.resolutions.find((r) => r.id === activeId) ?? report.resolutions[0];
	if (!active) return null;
	const picked = pickPreset(active.presets);
	const fastest = Math.max(
		...report.resolutions.flatMap((r) => r.presets.map((p) => p.fps ?? 0)),
	);
	const scale = report.fpsCap ?? Math.max(FPS_BAR_MIN_SCALE, fastest);

	return (
		<section class={CARD_CLASS} aria-label={`Estimated FPS for ${title}`}>
			<div class="flex flex-col gap-5 p-4 sm:p-5">
				{/* z-10: the open popover must paint over the rows animating in below. */}
				<div
					style={{ "--delay": `${delay}ms` }}
					class="relative z-10 flex animate-rise flex-wrap items-center justify-between gap-x-4 gap-y-3"
				>
					<div class="flex items-center gap-3">
						<h3 class="font-medium text-muted-foreground text-sm">
							{report.basis === "projected" ? "Projected FPS" : "Estimated FPS"}
						</h3>
						<InfoPopover label={`About the FPS estimate for ${title}`}>
							<div class="flex flex-col gap-2.5 text-foreground/90 text-sm leading-snug">
								{belowMinimum && (
									<p>
										Your PC is below the minimum specs, so the game may not
										launch at all.
									</p>
								)}
								{scale > FPS_TARGET && (
									<p>
										Average FPS, defaulting to your monitor's resolution without
										upscaling. {FPS_TARGET}+ is smooth, 30+ is playable.
									</p>
								)}
								{report.notes.map((note) => (
									<p key={note}>{note}</p>
								))}
							</div>
						</InfoPopover>
					</div>
					<ResolutionPicker
						value={active.id}
						onChange={onResolutionChange}
						label={`Resolution for ${title}`}
					/>
				</div>
				{picked && (
					<FpsHeadline
						estimate={picked}
						resolutionLabel={active.label}
						ceiling={report.cpuAssumed}
						delay={delay + STAGGER_MS}
					/>
				)}
				{report.cpuAssumed && (
					<button type="button" onClick={openExactResults} class={LINK_CLASS}>
						Add your CPU for an exact estimate
					</button>
				)}
			</div>
			{/* Bottom half: the same resolution, broken down by the game's own graphics presets. */}
			<div class="flex flex-col gap-4 border-ink/10 border-t p-4 sm:p-5">
				<div
					style={{ "--delay": `${delay + STAGGER_MS * 2}ms` }}
					class="flex animate-rise flex-col gap-0.5"
				>
					<h4 class="font-medium text-foreground text-sm">
						By graphics settings
					</h4>
					<p class="text-muted-foreground text-sm sm:text-xs">
						{active.presets.length > 1
							? `The game's quality presets at ${active.label}, lowest to highest. Higher looks better and runs slower.`
							: `The game has no presets worth lowering: this is everything turned up at ${active.label}.`}
					</p>
				</div>
				<ul class="flex flex-col gap-3.5">
					{active.presets.map((estimate, index) => (
						<FpsRow
							key={estimate.presetId}
							estimate={estimate}
							scale={scale}
							delay={delay + STAGGER_MS * (index + 3)}
							picked={
								active.presets.length > 1 &&
								estimate.presetId === picked?.presetId
							}
						/>
					))}
				</ul>
			</div>
		</section>
	);
}
