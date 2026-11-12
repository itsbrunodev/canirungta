// Rough class of a desktop/laptop CPU by logical thread count. Browsers expose nothing else, so this
// is only a hint for the CPU row, never a pass/fail input.
export const CPU_THREAD_TIERS = [
	{ maxThreads: 4, label: "entry-level" },
	{ maxThreads: 8, label: "budget to older mainstream" },
	{ maxThreads: 12, label: "mainstream mid-range" },
	{ maxThreads: 16, label: "upper mid-range to high-end" },
	{ maxThreads: Number.POSITIVE_INFINITY, label: "high-end or workstation" },
] as const;
