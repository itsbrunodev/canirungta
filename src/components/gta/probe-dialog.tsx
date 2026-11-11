import { useEffect, useRef } from "preact/hooks";

import { ProbeCommand } from "@/components/gta/probe-command";

import { PROBE_DIALOG_DELAY_MS } from "@/constants/probe-dialog";

import {
	rememberProbeDialogDismissed,
	wasProbeDialogDismissed,
} from "@/lib/machine/probe-dialog-dismissal";

import { XMarkIcon } from "@/icons/x-mark";

const GAPS = [
	"RAM is capped at 8 GB",
	"Video memory is hidden",
	"Free disk space is unknown",
];

const STEPS = [
	"Copy the command below",
	"Paste it in a terminal and press Enter",
	"This page reopens with your exact results",
];

// Pops up shortly after load while only approximate browser data is available.
export function ProbeDialog() {
	const dialog = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (wasProbeDialogDismissed()) return;
		const timer = window.setTimeout(() => {
			const el = dialog.current;
			if (el && !el.open) el.showModal();
		}, PROBE_DIALOG_DELAY_MS);
		return () => window.clearTimeout(timer);
	}, []);

	// Click on the backdrop lands on the dialog element itself, not its content.
	// Native listener: Esc and the buttons already cover keyboard users.
	useEffect(() => {
		const el = dialog.current;
		if (!el) return;
		function onBackdropClick(event: MouseEvent) {
			if (event.target === el) el?.close();
		}
		el.addEventListener("click", onBackdropClick);
		return () => el.removeEventListener("click", onBackdropClick);
	}, []);

	function close() {
		dialog.current?.close();
	}

	return (
		<dialog
			ref={dialog}
			class="probe-dialog"
			aria-labelledby="probe-dialog-title"
			onClose={rememberProbeDialogDismissed}
		>
			<div class="glass relative flex flex-col gap-6 rounded-2xl bg-surface/90 p-5 sm:rounded-3xl sm:p-8 min-[420px]:p-6">
				<button
					type="button"
					onClick={close}
					aria-label="Close"
					class="absolute top-3 right-3 grid size-10 cursor-pointer place-items-center rounded-full border border-transparent text-muted-foreground transition-colors hover:bg-ink/8 hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary active:bg-ink/12 sm:top-4 sm:right-4 sm:size-8"
				>
					<XMarkIcon class="size-4" />
				</button>

				<div class="probe-rise flex flex-col gap-3" style="--i: 0">
					<h2
						id="probe-dialog-title"
						class="pr-10 font-bold text-2xl tracking-tight"
					>
						These results are a guess
					</h2>
					<p class="text-balance text-muted-foreground leading-relaxed">
						Browsers only share a rough picture of your PC, so a verdict can be
						wrong. A 10 second check on your machine gives exact figures.
					</p>
				</div>

				<ul class="probe-rise flex flex-wrap gap-2" style="--i: 1">
					{GAPS.map((gap) => (
						<li
							key={gap}
							class="glass inline-flex h-8 items-center rounded-full px-3 font-medium text-foreground text-sm sm:text-xs"
						>
							{gap}
						</li>
					))}
				</ul>

				<ol class="flex flex-col gap-2.5">
					{STEPS.map((step, index) => (
						<li
							key={step}
							class="probe-rise flex items-center gap-3 text-base sm:text-sm"
							style={`--i: ${index + 2}`}
						>
							<span class="grid size-7 shrink-0 place-items-center rounded-full bg-ink/8 font-medium text-foreground text-sm sm:size-6 sm:text-xs">
								{index + 1}
							</span>
							{step}
						</li>
					))}
				</ol>

				<div class="probe-rise" style="--i: 5">
					<ProbeCommand />
				</div>

				<button
					type="button"
					onClick={close}
					class="probe-rise cursor-pointer self-center text-base text-muted-foreground transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary sm:text-sm-colors"
					style="--i: 6"
				>
					Keep approximate results
				</button>
			</div>
		</dialog>
	);
}
