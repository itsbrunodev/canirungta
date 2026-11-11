import { CountUp } from "@/components/gta/count-up";

import { CHECK_STATUS_STYLES } from "@/constants/gta/check-status-styles";

import type { CheckRow } from "@/lib/gta/types";

interface CheckItemProps {
	check: CheckRow;
	// Stagger offset in ms; also times the number count-up and the status pop.
	delay?: number;
}

// "16 GB" -> big number + small unit; text like "Windows 11" stays whole.
function splitFigure(actual: string): { value: string; unit: string } {
	const match = /^(\d+(?:\.\d+)?)\s+(.+)$/.exec(actual);
	return match
		? { value: match[1], unit: match[2] }
		: { value: actual, unit: "" };
}

export function CheckItem({ check, delay = 0 }: CheckItemProps) {
	const style = CHECK_STATUS_STYLES[check.status];
	const figure = check.actual ? splitFigure(check.actual) : null;
	// Hardware names ("AMD Ryzen 5 5600X 6-Core Processor") are far longer than a figure: smaller and wrapping.
	const isName =
		figure !== null && figure.unit === "" && figure.value.length > 14;

	return (
		// Borders live on the static <li>; only the inner content animates so dividers don't fade or slide in.
		<li
			class={`border-ink/10 border-b last:border-b-0 md:nth-last-[2]:border-b-0 md:odd:border-r ${style.tileClassName}`}
		>
			<div
				style={{ "--delay": `${delay}ms` }}
				class="flex animate-rise flex-col gap-4 p-4 sm:p-5"
			>
				<div class="flex items-center justify-between gap-2">
					<span class={`font-medium text-sm ${style.mutedClassName}`}>
						{check.label}
					</span>
					<span
						class={`grid size-7 shrink-0 animate-pop place-items-center rounded-full ring-1 ring-current/25 ring-inset ${style.badgeClassName}`}
					>
						<style.Icon class={style.iconClassName} stroke-width="2.5" />
						<span class="sr-only">{style.srLabel}</span>
					</span>
				</div>
				<div class="flex min-w-0 flex-col gap-1">
					<span
						class={`flex min-w-0 items-baseline gap-1.5 leading-none ${style.valueClassName}`}
					>
						<span
							title={check.actual ?? "Unknown"}
							class={
								isName
									? "line-clamp-2 font-semibold text-lg leading-tight tracking-tight sm:text-xl"
									: "truncate font-semibold text-2xl tracking-tight sm:text-3xl"
							}
						>
							{figure ? (
								<CountUp value={figure.value} delay={delay} />
							) : (
								"Unknown"
							)}
						</span>
						{figure?.unit && (
							<span
								class={`shrink-0 font-medium text-sm ${style.mutedClassName}`}
							>
								{figure.unit}
							</span>
						)}
					</span>
					{check.required && (
						<span class={`text-sm sm:text-xs ${style.mutedClassName}`}>
							Minimum{" "}
							<span class={style.requiredClassName}>{check.required}</span>
						</span>
					)}
				</div>
				{check.note && (
					<p class={`text-sm leading-snug sm:text-xs ${style.mutedClassName}`}>
						{check.note}
					</p>
				)}
			</div>
		</li>
	);
}
