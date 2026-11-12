import { CountUp } from "@/components/gta/count-up";

import { FPS_RATING_STYLES } from "@/constants/gta/fps-rating-styles";

import type { FpsEstimate } from "@/lib/gta/performance-types";

interface FpsHeadlineProps {
	estimate: FpsEstimate;
	resolutionLabel: string;
	// CPU unknown: the figure is what the GPU can render at most.
	ceiling: boolean;
	// Entrance offset in ms, shared with the count-up.
	delay?: number;
}

export function FpsHeadline({
	estimate,
	resolutionLabel,
	ceiling,
	delay = 0,
}: FpsHeadlineProps) {
	const { fps, low, high, rating } = estimate;
	if (fps === null || rating === null) return null;
	const style = FPS_RATING_STYLES[rating];
	const capped = estimate.limitedBy === "engine";
	const hasRange = low !== null && high !== null && low < high;

	return (
		// Announced on change, so switching resolution reads the new figure.
		<div
			style={{ "--delay": `${delay}ms` }}
			class="flex animate-rise flex-col gap-1.5"
			aria-live="polite"
		>
			<p class="flex items-baseline gap-2">
				{ceiling && !capped && (
					<span class="font-medium text-muted-foreground text-sm">up to</span>
				)}
				<span
					class={`font-semibold text-4xl tabular-nums leading-none tracking-tight sm:text-5xl ${style.textClassName}`}
				>
					<CountUp value={String(fps)} delay={delay} />
				</span>
				<span class="font-medium text-muted-foreground text-sm">FPS</span>
			</p>
			<p class="text-foreground text-sm">
				{capped ? "Engine cap" : style.label} at {resolutionLabel} on{" "}
				{estimate.label} settings
				{hasRange && (
					<span class="text-muted-foreground">
						, likely {low} to {high}
					</span>
				)}
			</p>
		</div>
	);
}
