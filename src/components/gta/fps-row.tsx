import { FPS_RATING_STYLES } from "@/constants/gta/fps-rating-styles";

import { BOTTLENECK_LABELS } from "@/lib/gta/describe-performance";
import type { FpsEstimate } from "@/lib/gta/performance-types";

interface FpsRowProps {
	estimate: FpsEstimate;
	// FPS at the right edge of the bar.
	scale: number;
	// The preset the headline shows; set in bold.
	picked: boolean;
	// Entrance offset in ms; rows rise and their bars fill one after another.
	delay?: number;
}

export function FpsRow({ estimate, scale, picked, delay = 0 }: FpsRowProps) {
	const { fps, rating } = estimate;
	const style = rating ? FPS_RATING_STYLES[rating] : null;
	const detail =
		estimate.note ??
		(estimate.limitedBy ? BOTTLENECK_LABELS[estimate.limitedBy] : null);

	return (
		<li
			style={{ "--delay": `${delay}ms` }}
			class="grid animate-rise grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[9.5rem_minmax(0,1fr)_3rem]"
		>
			<span class="flex min-w-0 flex-col">
				<span
					class={`truncate text-sm ${picked ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}
				>
					{estimate.label}
				</span>
				{detail && (
					<span class="text-muted-foreground text-xs first-letter:uppercase">
						{detail}
					</span>
				)}
			</span>
			<span
				class={`text-right font-semibold text-base tabular-nums sm:order-last ${style?.textClassName ?? "text-muted-foreground"}`}
			>
				{fps ?? "N/A"}
				{style && <span class="sr-only"> FPS, {style.label}</span>}
			</span>
			<span
				class="col-span-full h-2 overflow-hidden rounded-full bg-ink/10 sm:col-span-1"
				aria-hidden="true"
			>
				<span
					class={`block h-full animate-bar rounded-full transition-[width] duration-500 ease-out ${style?.barClassName ?? ""}`}
					style={{ width: `${Math.min((fps ?? 0) / scale, 1) * 100}%` }}
				/>
			</span>
		</li>
	);
}
