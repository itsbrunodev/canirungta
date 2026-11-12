// Roughly the PerformanceCard's box, so real data swaps in without a big jump.
export function PerformanceSkeleton() {
	return (
		<div
			class="glass col-span-full rounded-xl p-4 shadow-(--shadow-card) sm:rounded-2xl sm:p-5"
			aria-hidden="true"
		>
			<div class="flex animate-pulse flex-col gap-5">
				<div class="flex items-center justify-between gap-4">
					<span class="h-3 w-24 rounded bg-ink/10" />
					<span class="h-9 w-48 rounded-full bg-ink/10 sm:h-7" />
				</div>
				<div class="flex flex-col gap-2">
					<span class="h-9 w-32 rounded bg-ink/10 sm:h-12" />
					<span class="h-3 w-40 rounded bg-ink/10" />
				</div>
				<div class="flex flex-col gap-4">
					<span class="h-2 rounded-full bg-ink/10" />
					<span class="h-2 rounded-full bg-ink/10" />
					<span class="h-2 rounded-full bg-ink/10" />
				</div>
			</div>
		</div>
	);
}
