import { useEffect, useId, useState } from "preact/hooks";

import { SegmentedControl } from "@/components/ui/segmented-control";

import { applyTheme, getTheme, type Theme } from "@/lib/theme/theme";

import { MoonIcon } from "@/icons/moon";
import { SunIcon } from "@/icons/sun";

const THEMES: { id: Theme; label: string; Icon: typeof SunIcon }[] = [
	{ id: "light", label: "Light", Icon: SunIcon },
	{ id: "dark", label: "Dark", Icon: MoonIcon },
];

export function ThemePicker() {
	const labelId = useId();
	// The inline head script sets data-theme before hydration, so read it after mount.
	const [theme, setTheme] = useState<Theme>("dark");
	useEffect(() => setTheme(getTheme()), []);

	function pick(next: Theme) {
		applyTheme(next, true);
		setTheme(next);
	}

	return (
		<div class="flex items-center justify-between gap-3">
			<span id={labelId} class="font-medium text-foreground text-sm">
				Theme
			</span>
			<SegmentedControl
				labelledBy={labelId}
				value={theme}
				onChange={pick}
				options={THEMES.map(({ id, label, Icon }) => ({
					id,
					label: (
						<>
							<Icon class="size-3.5" />
							{label}
						</>
					),
				}))}
			/>
		</div>
	);
}
