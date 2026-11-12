import { useLayoutEffect, useRef } from "preact/hooks";

interface CountUpProps {
	// Display string; only plain numbers ("16.0") animate, anything else renders as-is.
	value: string;
	delay?: number;
}

const DURATION_MS = 900;

// easeOutExpo: fast start, long settle.
function ease(t: number): number {
	return t === 1 ? 1 : 1 - 2 ** (-10 * t);
}

export function CountUp({ value, delay = 0 }: CountUpProps) {
	const ref = useRef<HTMLSpanElement>(null);
	// Last figure shown: a changed value counts on from it instead of restarting at zero.
	const shownRef = useRef<number | null>(null);

	// Layout effect so the 0 is in place before first paint (no flash of the final value).
	useLayoutEffect(() => {
		const el = ref.current;
		const target = Number(value);
		if (
			!el ||
			Number.isNaN(target) ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			return;
		}

		const decimals = value.split(".")[1]?.length ?? 0;
		const from = shownRef.current ?? 0;
		// Only the entrance waits for its tile; later changes answer the click at once.
		const wait = shownRef.current === null ? delay : 0;
		shownRef.current = target;
		el.textContent = from.toFixed(decimals);

		let frame = 0;
		let startedAt: number | null = null;
		function step(now: number) {
			startedAt ??= now;
			const elapsed = now - startedAt - wait;
			const progress = Math.min(Math.max(elapsed / DURATION_MS, 0), 1);
			// Written straight to the DOM: no re-render per frame.
			if (el) {
				el.textContent = (from + (target - from) * ease(progress)).toFixed(
					decimals,
				);
			}
			if (progress < 1) frame = requestAnimationFrame(step);
		}
		frame = requestAnimationFrame(step);
		return () => cancelAnimationFrame(frame);
	}, [value, delay]);

	return (
		<>
			<span class="sr-only">{value}</span>
			<span ref={ref} aria-hidden="true">
				{value}
			</span>
		</>
	);
}
