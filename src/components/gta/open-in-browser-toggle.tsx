import { CheckIcon } from "@/icons/check";

interface OpenInBrowserToggleProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
}

// Native checkbox stays in the DOM (peer) for keyboard and screen readers; the box is drawn on top.
export function OpenInBrowserToggle({
	checked,
	onChange,
}: OpenInBrowserToggleProps) {
	return (
		<label class="glass flex h-10 w-fit cursor-pointer items-center gap-2 rounded-full pr-3.5 pl-2.5 font-medium text-muted-foreground text-sm transition-colors hover:border-accent/40 hover:text-foreground has-checked:text-foreground has-focus-visible:outline-2 has-focus-visible:outline-accent sm:h-8 sm:text-xs">
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onChange(event.currentTarget.checked)}
				class="peer sr-only"
			/>
			<span class="grid size-4 place-items-center rounded-full bg-ink/8 text-canvas ring-1 ring-ink/10 ring-inset transition-colors peer-checked:bg-accent peer-checked:ring-accent">
				<CheckIcon
					stroke-width="3"
					class={`size-3 transition-opacity ${checked ? "opacity-100" : "opacity-0"}`}
				/>
			</span>
			Open results in browser
		</label>
	);
}
