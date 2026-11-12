import { useEffect, useId, useRef, useState } from "preact/hooks";

import { CheckIcon } from "@/icons/check";
import { ChevronDownIcon } from "@/icons/chevron-down";

export interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps {
	label: string;
	options: SelectOption[];
	value: string;
	onChange: (value: string) => void;
}

const TYPEAHEAD_RESET_MS = 600;

// Select-only combobox (ARIA APG): focus stays on the button, the highlighted
// option is exposed through aria-activedescendant.
export function Select({ label, options, value, onChange }: SelectProps) {
	const id = useId();
	const labelId = `${id}-label`;
	const listId = `${id}-list`;

	const optionPrefix = `${id}-option-`;
	const optionId = (index: number) => `${optionPrefix}${index}`;

	const rootRef = useRef<HTMLDivElement>(null);
	const typed = useRef({ text: "", timer: 0 });
	const [open, setOpen] = useState(false);
	const selectedIndex = Math.max(
		0,
		options.findIndex((o) => o.value === value),
	);
	const [active, setActive] = useState(selectedIndex);
	const selected = options[selectedIndex];

	useEffect(() => {
		if (!open) return;
		function onPointerDown(event: PointerEvent) {
			if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
		}
		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, [open]);

	// Keeps the highlighted option in view in long lists.
	useEffect(() => {
		if (open)
			document
				.getElementById(`${optionPrefix}${active}`)
				?.scrollIntoView({ block: "nearest" });
	}, [open, active, optionPrefix]);

	function openList() {
		setActive(selectedIndex);
		setOpen(true);
	}

	function choose(index: number) {
		const option = options[index];
		if (option) onChange(option.value);
		setOpen(false);
	}

	function typeahead(char: string) {
		const state = typed.current;
		window.clearTimeout(state.timer);
		state.text += char.toLowerCase();
		state.timer = window.setTimeout(() => {
			state.text = "";
		}, TYPEAHEAD_RESET_MS);
		// Repeating one letter cycles through options starting with it.
		const cycling = [...state.text].every((c) => c === state.text[0]);
		const needle = cycling ? state.text[0] : state.text;
		const from = open ? active : selectedIndex;
		for (let step = cycling ? 1 : 0; step <= options.length; step++) {
			const index = (from + step) % options.length;
			if (options[index]?.label.toLowerCase().startsWith(needle ?? "")) {
				if (open) setActive(index);
				else onChange(options[index].value);
				return;
			}
		}
	}

	function onKeyDown(event: KeyboardEvent) {
		const last = options.length - 1;
		switch (event.key) {
			case "ArrowDown":
			case "ArrowUp": {
				event.preventDefault();
				if (!open) return openList();
				if (event.altKey) return choose(active);
				const step = event.key === "ArrowDown" ? 1 : -1;
				setActive(Math.min(last, Math.max(0, active + step)));
				return;
			}
			case "Home":
			case "End":
				event.preventDefault();
				if (!open) openList();
				setActive(event.key === "Home" ? 0 : last);
				return;
			case "PageDown":
			case "PageUp":
				if (!open) return;
				event.preventDefault();
				setActive(
					Math.min(
						last,
						Math.max(0, active + (event.key === "PageDown" ? 10 : -10)),
					),
				);
				return;
			case "Enter":
			case " ":
				event.preventDefault();
				if (open) choose(active);
				else openList();
				return;
			case "Escape":
				// Closes only the list, not the menu around it.
				if (!open) return;
				event.preventDefault();
				event.stopPropagation();
				setOpen(false);
				return;
			case "Tab":
				// Commits the highlighted option, then focus moves on.
				if (open) choose(active);
				return;
			default:
				if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
					event.preventDefault();
					typeahead(event.key);
				}
		}
	}

	return (
		<div ref={rootRef} class="relative flex flex-col gap-2">
			<span id={labelId} class="font-medium text-foreground text-sm">
				{label}
			</span>
			<button
				type="button"
				role="combobox"
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listId}
				aria-labelledby={`${labelId} ${id}-value`}
				aria-activedescendant={open ? optionId(active) : undefined}
				onClick={() => (open ? setOpen(false) : openList())}
				onKeyDown={onKeyDown}
				onBlur={() => setOpen(false)}
				class="flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg bg-ink/5 px-3 text-left text-foreground text-sm ring-1 ring-ink/10 ring-inset transition-colors hover:bg-ink/8 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 aria-expanded:bg-ink/8"
			>
				<span id={`${id}-value`} class="truncate">
					{selected?.label}
				</span>
				<ChevronDownIcon
					class={`size-4 shrink-0 text-muted-foreground transition-transform duration-150 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
				/>
			</button>
			<div
				id={listId}
				role="listbox"
				aria-labelledby={labelId}
				// Keeps focus on the button, so a click is not lost to a blur.
				onMouseDown={(event) => event.preventDefault()}
				class={`absolute inset-x-0 top-full z-30 mt-1.5 max-h-56 origin-top overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-black/30 shadow-xl transition-[opacity,transform,visibility] duration-150 ease-out motion-reduce:transition-none ${
					open
						? "visible opacity-100"
						: "pointer-events-none invisible -translate-y-1 scale-[0.98] opacity-0"
				}`}
			>
				{options.map((option, index) => (
					// biome-ignore lint/a11y/useFocusableInteractive: focus stays on the button; aria-activedescendant points here
					// biome-ignore lint/a11y/useKeyWithClickEvents: keys are handled on the button
					<div
						key={option.value}
						id={optionId(index)}
						role="option"
						aria-selected={index === selectedIndex}
						onPointerMove={() => setActive(index)}
						onClick={() => choose(index)}
						class={`flex min-h-9 cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm ${
							index === active
								? "bg-ink/10 text-foreground"
								: "text-muted-foreground"
						}`}
					>
						<span class="min-w-0">{option.label}</span>
						{index === selectedIndex && (
							<CheckIcon class="size-4 shrink-0 text-accent" />
						)}
					</div>
				))}
			</div>
		</div>
	);
}
