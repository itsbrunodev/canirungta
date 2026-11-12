import { SegmentedControl } from "@/components/ui/segmented-control";

import { RESOLUTIONS } from "@/constants/gta/performance-model";

import type { ResolutionId } from "@/lib/gta/performance-types";

interface ResolutionPickerProps {
	value: ResolutionId;
	onChange: (resolution: ResolutionId) => void;
	// Names the game, so screen readers can tell the pickers apart.
	label: string;
}

export function ResolutionPicker({
	value,
	onChange,
	label,
}: ResolutionPickerProps) {
	return (
		<SegmentedControl
			label={label}
			value={value}
			onChange={onChange}
			buttonClass="tabular-nums"
			options={RESOLUTIONS.map((r) => ({ id: r.id, label: r.label }))}
		/>
	);
}
