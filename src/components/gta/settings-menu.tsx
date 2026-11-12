import { useEffect, useId, useRef, useState } from "preact/hooks";

import { DiskPicker } from "@/components/gta/disk-picker";
import { ThemePicker } from "@/components/gta/theme-picker";

import type { DiskSpec } from "@/lib/machine/types";

import { CogIcon } from "@/icons/cog";

interface SettingsMenuProps {
	disks: DiskSpec[];
	installDisk: string | null;
	onInstallDiskChange: (id: string | null) => void;
	// Null when no probe is saved.
	savedAt: string | null;
	onClearProbe: () => void;
}

// Top-right cog: settings that tune the verdicts but are not part of reading them.
export function SettingsMenu({
	disks,
	installDisk,
	onInstallDiskChange,
	savedAt,
	onClearProbe,
}: SettingsMenuProps) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
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
		<div
			ref={rootRef}
			class="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-20 sm:top-4 sm:right-6"
			onFocusOut={(event) => {
				const next = event.relatedTarget as Node | null;
				if (next && !rootRef.current?.contains(next)) setOpen(false);
			}}
		>
			<button
				ref={buttonRef}
				type="button"
				aria-label="Settings"
				aria-expanded={open}
				aria-controls={panelId}
				onClick={() => setOpen(!open)}
				class="grid size-8 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-ink/8 hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 aria-expanded:bg-ink/10 aria-expanded:text-foreground"
			>
				<CogIcon class="size-4" />
			</button>
			{/* Always mounted so it can animate out; hidden from everyone while closed. */}
			<div
				id={panelId}
				data-open={open}
				class="invisible absolute top-full right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] origin-top-right translate-y-1 scale-95 rounded-xl border border-border bg-surface opacity-0 shadow-black/30 shadow-xl transition-[opacity,transform,visibility] duration-150 ease-out data-[open=true]:visible data-[open=true]:translate-y-0 data-[open=true]:scale-100 data-[open=true]:opacity-100"
			>
				<div class="px-4 py-3">
					<ThemePicker />
				</div>
				{disks.length > 1 && (
					<div class="border-border border-t px-4 py-3">
						<DiskPicker
							disks={disks}
							value={installDisk}
							onChange={onInstallDiskChange}
						/>
					</div>
				)}
				{savedAt && (
					<button
						type="button"
						onClick={() => {
							onClearProbe();
							setOpen(false);
						}}
						class="h-11 w-full cursor-pointer rounded-b-xl border-border border-t px-4 text-left text-foreground text-sm transition-colors hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2"
					>
						Forget saved probe
					</button>
				)}
			</div>
		</div>
	);
}
