import { useEffect, useRef, useState } from "preact/hooks";

import { CheckIcon } from "@/icons/check";
import { CopyIcon } from "@/icons/copy";

interface CopyButtonProps {
	text: string;
	label?: string;
}

const RESET_MS = 2000;

export function CopyButton({ text, label = "Copy command" }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);
	const timer = useRef<number>(0);

	useEffect(() => () => window.clearTimeout(timer.current), []);

	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			// Clipboard blocked (insecure context or denied): nothing useful to do.
			return;
		}
		setCopied(true);
		window.clearTimeout(timer.current);
		timer.current = window.setTimeout(() => setCopied(false), RESET_MS);
	}

	return (
		<button
			type="button"
			onClick={copy}
			// 7px = panel radius 16 - 1px border - 8px padding (concentric corners).
			class="glass grid size-10 shrink-0 cursor-pointer place-items-center rounded-[5px] text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 sm:size-9 sm:rounded-[7px]"
			aria-label={copied ? "Copied" : label}
		>
			{copied ? (
				<CheckIcon class="size-4 text-pass" stroke-width="2.5" />
			) : (
				<CopyIcon class="size-4" />
			)}
			<span class="sr-only" aria-live="polite">
				{copied ? "Copied to clipboard" : ""}
			</span>
		</button>
	);
}
