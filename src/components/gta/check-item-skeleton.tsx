// Mirrors CheckItem's box model so the swap to real data doesn't shift the layout.
export function CheckItemSkeleton() {
	return (
		// Pulse the content, not the <li>, so the dividers stay still while loading.
		<li
			class="border-ink/10 border-b last:border-b-0 md:nth-last-[2]:border-b-0 md:odd:border-r"
			aria-hidden="true"
		>
			<div class="flex animate-pulse flex-col gap-4 p-4 sm:p-5">
				<div class="flex items-center justify-between gap-2">
					<span class="flex items-center gap-2.5">
						<span class="size-8 shrink-0 rounded-lg bg-ink/10" />
						<span class="h-3 w-12 rounded bg-ink/10" />
					</span>
					<span class="size-7 shrink-0 rounded-full bg-ink/10" />
				</div>
				<div class="flex flex-col gap-1">
					<span class="block h-6 w-28 rounded bg-ink/10 sm:h-[1.875rem]" />
					<span class="flex h-5 items-center sm:h-4">
						<span class="h-3 w-24 rounded bg-ink/10" />
					</span>
				</div>
			</div>
		</li>
	);
}
