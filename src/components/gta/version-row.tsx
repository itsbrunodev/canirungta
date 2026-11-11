import { CheckItem } from "@/components/gta/check-item";
import { CheckItemSkeleton } from "@/components/gta/check-item-skeleton";
import { VerdictSkeleton } from "@/components/gta/verdict-skeleton";
import { VerdictText } from "@/components/gta/verdict-text";

import type {
	Confidence,
	CoverImage,
	GtaVersion,
	VersionReport,
} from "@/lib/gta/types";
import { openExactResults } from "@/lib/machine/open-exact-results";

import { ExternalLinkIcon } from "@/icons/external-link";

// RAM, VRAM, disk and OS always show; CPU and GPU rows only exist when the publisher names hardware.
const BASE_CHECK_COUNT = 4;

const CONFIDENCE_LABELS: Record<Confidence, string> = {
	official: "Official minimum",
	approximate: "Community estimate",
	unannounced: "Not yet announced",
};

interface VersionRowProps {
	version: GtaVersion;
	// null while the machine is being read; the static parts still render.
	report: VersionReport | null;
	// Position in the list; drives the entrance stagger and which cover loads eagerly.
	index: number;
	// From getGtaCovers() in index.astro; absent if the version has no cover.
	cover?: CoverImage;
	// Detection left gaps: point the visitor at the exact-results panel.
	offerExactResults?: boolean;
}

export function VersionRow({
	version,
	report,
	cover,
	index,
	offerExactResults = false,
}: VersionRowProps) {
	// Rows past the first few start together so the last doesn't wait seconds.
	const rowDelay = Math.min(index, 3) * 120;
	const confidenceLabel = CONFIDENCE_LABELS[version.confidence];
	const checkCount =
		BASE_CHECK_COUNT +
		(version.minimum.cpu ? 1 : 0) +
		(version.minimum.gpu ? 1 : 0);

	return (
		<li
			id={version.id}
			class="grid scroll-mt-8 grid-cols-[6rem_minmax(0,1fr)] gap-x-4 gap-y-6 py-8 first:pt-0 last:pb-0 sm:flex sm:gap-8 sm:py-10 md:py-14"
		>
			{cover && (
				// Natural (vertical) aspect ratio, never cropped; height follows width.
				<div class="relative w-24 shrink-0 self-start sm:sticky sm:top-8 sm:w-40 md:w-48 lg:w-64">
					{/* Blurred copy behind the cover acts as ambient glow. */}
					<img
						class="absolute inset-0 h-full w-full scale-95 select-none rounded-xl opacity-50 blur-2xl sm:rounded-2xl"
						src={cover.src}
						alt=""
						aria-hidden="true"
						loading="lazy"
						decoding="async"
						draggable={false}
					/>
					<div class="relative overflow-hidden rounded-xl shadow-2xl shadow-black/20 sm:rounded-2xl">
						<img
							class="block h-auto w-full"
							src={cover.src}
							width={cover.width}
							height={cover.height}
							alt={`${version.title} ${version.edition} cover`}
							// First cover is the likely LCP element: load it early.
							loading={index === 0 ? "eager" : "lazy"}
							fetchpriority={index === 0 ? "high" : undefined}
							decoding="async"
							draggable={false}
						/>
						<div
							class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-ink/10 ring-inset sm:rounded-2xl"
							aria-hidden="true"
						/>
					</div>
				</div>
			)}
			<div class="contents sm:flex sm:min-w-0 sm:flex-1 sm:flex-col sm:gap-6">
				<div class="flex min-w-0 flex-col gap-3">
					<div class="flex flex-col gap-1">
						<h2 class="font-semibold text-foreground text-xl leading-tight tracking-tight sm:text-3xl">
							{version.title}
						</h2>
						<p class="font-medium text-base text-muted-foreground">
							{version.edition}
						</p>
					</div>
					{report ? (
						<VerdictText verdict={report.verdict} checks={report.checks} />
					) : (
						<VerdictSkeleton />
					)}
					{offerExactResults && report?.verdict === "unknown" && (
						<button
							type="button"
							onClick={openExactResults}
							class="cursor-pointer self-start text-accent text-sm underline decoration-accent/40 underline-offset-2 hover:decoration-accent focus-visible:outline-2 focus-visible:outline-accent sm:text-xs"
						>
							Get exact results or enter your specs
						</button>
					)}
				</div>
				<ul class="glass col-span-full grid overflow-hidden rounded-xl shadow-(--shadow-card) sm:rounded-2xl md:grid-cols-2">
					{report
						? report.checks.map((check, checkIndex) => (
								<CheckItem
									key={check.label}
									check={check}
									delay={rowDelay + checkIndex * 70}
								/>
							))
						: Array.from({ length: checkCount }, (_, index) => (
								<CheckItemSkeleton key={index} />
							))}
				</ul>
				<div class="col-span-full mt-auto flex flex-wrap items-center gap-2 text-sm sm:text-xs">
					<span class="glass inline-flex h-10 items-center rounded-full px-3 font-medium text-foreground sm:h-8">
						{confidenceLabel}
					</span>
					<a
						class="glass inline-flex h-10 items-center gap-2 rounded-full px-3 font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 sm:h-8"
						href={version.sourceUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						Source
						<ExternalLinkIcon class="size-3.5 shrink-0" />
					</a>
				</div>
			</div>
		</li>
	);
}
