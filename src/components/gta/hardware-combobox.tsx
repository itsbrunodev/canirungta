import { useMemo, useRef, useState } from "preact/hooks";

import { MatchHighlight } from "@/components/gta/match-highlight";

import { MANUAL_INPUT_CLASS } from "@/constants/gta/manual-input-class";

import { CheckIcon } from "@/icons/check";

interface HardwareComboboxProps {
	id: string;
	name: string;
	// Accessible name of the suggestion list.
	listLabel: string;
	value: string;
	onChange: (text: string) => void;
	search: (text: string) => string[];
	// True when the checker can score this name, shown as a tick in the field.
	isRecognised: (text: string) => boolean;
}

// Text field with model suggestions (ARIA 1.2 combobox, list autocomplete). Free text stays
// allowed: suggestions only help the visitor land on a name the checker knows.
export function HardwareCombobox({
	id,
	name,
	listLabel,
	value,
	onChange,
	search,
	isRecognised,
}: HardwareComboboxProps) {
	const [open, setOpen] = useState(false);
	// Highlighted option; -1 = none, so Enter still submits the form.
	const [active, setActive] = useState(-1);

	const found = useMemo(() => search(value), [search, value]);
	// A list holding only what is already typed offers nothing.
	const options =
		found.length === 1 && found[0]?.toLowerCase() === value.trim().toLowerCase()
			? []
			: found;
	const expanded = open && options.length > 0;
	// The last list stays rendered while the panel fades out.
	const shown = useRef(options);
	if (expanded) shown.current = options;

	const recognised = value.trim() !== "" && isRecognised(value);
	const listId = `${id}-list`;

	function select(option: string) {
		onChange(option);
		setOpen(false);
		setActive(-1);
	}

	function move(step: number) {
		if (options.length === 0) return;
		setOpen(true);
		const from = expanded ? active : step > 0 ? -1 : 0;
		setActive((from + step + options.length) % options.length);
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			move(event.key === "ArrowDown" ? 1 : -1);
		} else if (event.key === "Enter" && expanded && options[active]) {
			// Picks the option instead of submitting the form.
			event.preventDefault();
			select(options[active]);
		} else if (event.key === "Escape" && expanded) {
			event.preventDefault();
			setOpen(false);
			setActive(-1);
		}
	}

	return (
		<div class="relative">
			<input
				class={`${MANUAL_INPUT_CLASS} pr-9`}
				id={id}
				name={name}
				value={value}
				maxLength={120}
				role="combobox"
				aria-autocomplete="list"
				aria-expanded={expanded}
				aria-controls={listId}
				aria-activedescendant={
					expanded && active >= 0 ? `${id}-option-${active}` : undefined
				}
				aria-describedby={`${id}-hint ${id}-status`}
				autocomplete="off"
				autocapitalize="off"
				spellcheck={false}
				onInput={(event) => {
					onChange(event.currentTarget.value);
					setOpen(true);
					setActive(-1);
				}}
				onKeyDown={onKeyDown}
				onBlur={() => setOpen(false)}
			/>
			{recognised && (
				<CheckIcon class="pointer-events-none absolute top-1/2 right-3 -mt-2 size-4 animate-[pop_300ms_cubic-bezier(0.34,1.56,0.64,1)_both] text-pass" />
			)}
			<span id={`${id}-status`} class="sr-only">
				{recognised ? "Model recognised." : ""}
			</span>
			{/* Announces the list to screen readers, which do not see it appear. */}
			<span class="sr-only" role="status">
				{expanded
					? `${options.length} ${options.length === 1 ? "suggestion" : "suggestions"}. Use the up and down arrow keys to choose.`
					: ""}
			</span>
			<div
				id={listId}
				role="listbox"
				aria-label={listLabel}
				class={`absolute inset-x-0 top-full z-20 mt-1.5 origin-top rounded-xl border border-border bg-surface p-1 shadow-black/30 shadow-xl transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none ${
					expanded
						? "visible opacity-100"
						: "pointer-events-none invisible -translate-y-1 scale-[0.98] opacity-0"
				}`}
			>
				{/* One highlight that slides between options; rows are a fixed 2.5rem tall. */}
				<div
					aria-hidden="true"
					class={`pointer-events-none absolute inset-x-1 top-1 h-10 rounded-lg bg-ink/10 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none ${
						active >= 0 ? "opacity-100" : "opacity-0"
					}`}
					style={{ transform: `translateY(${Math.max(active, 0) * 2.5}rem)` }}
				/>
				{shown.current.map((option, index) => (
					// biome-ignore lint/a11y/useFocusableInteractive: focus stays on the input; aria-activedescendant points here
					// biome-ignore lint/a11y/useKeyWithClickEvents: keys are handled on the input
					<div
						key={option}
						id={`${id}-option-${index}`}
						role="option"
						aria-selected={index === active}
						class={`relative flex h-10 cursor-pointer items-center truncate rounded-lg px-3 text-sm transition-colors ${
							index === active ? "text-foreground" : "text-muted-foreground"
						}`}
						// Keeps focus in the input, so the click is not lost to a blur.
						onMouseDown={(event) => event.preventDefault()}
						onPointerMove={() => setActive(index)}
						onClick={() => select(option)}
					>
						<span class="truncate">
							<MatchHighlight text={option} query={value} />
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
