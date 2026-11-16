// Shared look for the server-rendered data tables, matching the checker's glass tiles.
export const TABLE_CARD_CLASS =
	"glass overflow-hidden rounded-xl shadow-(--shadow-card) sm:rounded-2xl";
export const TABLE_HEAD_CELL_CLASS =
	"px-3 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider sm:px-5";
export const TABLE_ROW_CLASS =
	"border-ink/10 border-t transition-colors duration-200 hover:bg-ink/3";
export const TABLE_CELL_CLASS = "px-3 py-3 sm:px-5";
// Same pill as the "Source" chip under each checker row.
export const CHIP_CLASS =
	"glass inline-flex h-10 items-center gap-2 rounded-full px-3 font-medium text-foreground text-sm transition-colors sm:h-8 sm:text-xs";
export const CHIP_LINK_CLASS = `${CHIP_CLASS} hover:border-accent/40 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2`;
