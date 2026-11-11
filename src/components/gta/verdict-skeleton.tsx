// Same line height as VerdictBadge (text-lg leading-tight = 1.40625rem).
export function VerdictSkeleton() {
	return (
		<div class="flex h-[1.40625rem] items-center" aria-hidden="true">
			<div class="h-4 w-72 max-w-full animate-pulse rounded bg-ink/10" />
		</div>
	);
}
