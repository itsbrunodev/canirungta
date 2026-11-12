import type { ComponentChildren } from "preact";
import { useEffect, useId, useRef, useState } from "preact/hooks";

import { HelpIcon } from "@/icons/help";

interface InfoPopoverProps {
	// Accessible name of the trigger, e.g. "About these FPS estimates".
	label: string;
	children: ComponentChildren;
}

// Click-to-open note. A hover tooltip would not work on touch or hold this much text.
export function InfoPopover({ label, children }: InfoPopoverProps) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLSpanElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const panelId = useId();

	useEffect(() => {
		if (!open) return;
		function onPointerDown(event: PointerEvent) {
			if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
		}
		function onKeyDown(event: KeyboardEvent) {
			if (event.key !== "Escape") return;
			setOpen(false);
			buttonRef.current?.focus();
		}
		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [open]);

	return (
		<span
			ref={rootRef}
			// Not positioned on purpose: the panel aligns to the nearest positioned ancestor (the
			// heading row), so it starts at the card edge and fits a phone screen.
			class="inline-flex"
			// Tabbing past the panel closes it.
			onFocusOut={(event) => {
				const next = event.relatedTarget as Node | null;
				if (next && !rootRef.current?.contains(next)) setOpen(false);
			}}
		>
			<button
				ref={buttonRef}
				type="button"
				aria-label={label}
				aria-expanded={open}
				aria-controls={panelId}
				onClick={() => setOpen(!open)}
				// Ghost icon reads as part of the heading; padding + negative margin keep a touch-sized hit area.
				class="-m-1 grid cursor-pointer place-items-center rounded-full p-1 text-muted-foreground transition-colors hover:bg-ink/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-0 aria-expanded:bg-ink/10 aria-expanded:text-foreground"
			>
				<HelpIcon class="size-5" stroke-width="2.5" />
			</button>
			{/* Always mounted so it can animate out; inert content is hidden from everyone while closed. */}
			<div
				id={panelId}
				role="note"
				data-open={open}
				class="invisible absolute top-full left-0 z-20 mt-3 w-72 max-w-[calc(100vw-4rem)] origin-top-left translate-y-1 scale-95 rounded-xl border border-border bg-surface p-4 opacity-0 shadow-black/30 shadow-xl transition-[opacity,transform,visibility] duration-150 ease-out data-[open=true]:visible data-[open=true]:translate-y-0 data-[open=true]:scale-100 data-[open=true]:opacity-100"
			>
				{children}
			</div>
		</span>
	);
}
