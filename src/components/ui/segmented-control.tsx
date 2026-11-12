import type { ComponentChildren } from "preact";

export interface SegmentedOption<T extends string> {
	id: T;
	label: ComponentChildren;
}

interface SegmentedControlProps<T extends string> {
	options: SegmentedOption<T>[];
	value: T;
	onChange: (id: T) => void;
	// "tabs" swaps panel-style tab semantics for toggle-button semantics.
	kind?: "tabs" | "buttons";
	label?: string;
	labelledBy?: string;
	buttonClass?: string;
}

// One shared look for every pill switcher (tabs, resolution, theme).
export function SegmentedControl<T extends string>({
	options,
	value,
	onChange,
	kind = "buttons",
	label,
	labelledBy,
	buttonClass = "",
}: SegmentedControlProps<T>) {
	const isTabs = kind === "tabs";
	return (
		<div
			{...(isTabs ? { role: "tablist" } : { role: "group" })}
			{...{ "aria-label": label, "aria-labelledby": labelledBy }}
			class="inline-flex max-w-full rounded-full bg-ink/5 p-0.5 ring-1 ring-ink/10 ring-inset"
		>
			{options.map((option) => {
				const active = option.id === value;
				return (
					<button
						key={option.id}
						type="button"
						{...(isTabs
							? { role: "tab", "aria-selected": active }
							: { "aria-pressed": active })}
						onClick={() => onChange(option.id)}
						class={`flex h-9 min-w-12 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 font-medium text-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 sm:h-7 sm:min-w-11 sm:px-2.5 sm:text-xs ${buttonClass} ${
							active
								? "bg-foreground text-canvas"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
