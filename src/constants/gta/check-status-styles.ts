import type { JSX } from "preact";

import type { CheckStatus } from "@/lib/gta/types";

import { CheckIcon } from "@/icons/check";
import { HelpIcon } from "@/icons/help";
import type { IconProps } from "@/icons/icon-props";
import { XMarkIcon } from "@/icons/x-mark";

interface CheckStatusStyle {
	Icon: (props: IconProps) => JSX.Element;
	srLabel: string;
	// The bare question mark is narrow and has no circle around it, so it needs to be bigger to match the weight of the check/cross.
	iconClassName: string;
	// Full class names so Tailwind can see them.
	badgeClassName: string;
	// Colors the headline figure.
	valueClassName: string;
	// Secondary text (unit, minimum, note); tinted on fail so grey doesn't clash with the red wash.
	mutedClassName: string;
	// The minimum figure; matches the headline on pass/fail.
	requiredClassName: string;
	// Faint wash over the whole tile; empty when neutral.
	tileClassName: string;
}

export const CHECK_STATUS_STYLES: Record<CheckStatus, CheckStatusStyle> = {
	pass: {
		Icon: CheckIcon,
		srLabel: "Pass",
		iconClassName: "size-3.5",
		badgeClassName: "bg-pass/15 text-pass",
		valueClassName: "text-foreground",
		mutedClassName: "text-muted-foreground",
		requiredClassName: "text-foreground/80",
		tileClassName: "",
	},
	fail: {
		Icon: XMarkIcon,
		srLabel: "Fail",
		iconClassName: "size-3.5",
		badgeClassName: "bg-fail/15 text-fail",
		valueClassName: "text-foreground",
		mutedClassName: "text-muted-foreground",
		requiredClassName: "text-foreground/80",
		tileClassName: "",
	},
	unknown: {
		Icon: HelpIcon,
		srLabel: "Unknown",
		iconClassName: "size-5",
		badgeClassName: "bg-muted-foreground/15 text-muted-foreground",
		valueClassName: "text-foreground",
		mutedClassName: "text-muted-foreground",
		requiredClassName: "text-foreground/80",
		tileClassName: "",
	},
};
