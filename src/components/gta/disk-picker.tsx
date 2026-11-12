import { Select } from "@/components/ui/select";

import { formatGbValue } from "@/lib/gta/format-gb";
import { diskId } from "@/lib/machine/disk-id";
import type { DiskSpec } from "@/lib/machine/types";

interface DiskPickerProps {
	disks: DiskSpec[];
	// null = automatic (roomiest drive).
	value: string | null;
	onChange: (id: string | null) => void;
}

const AUTO = "auto";

export function DiskPicker({ disks, value, onChange }: DiskPickerProps) {
	const selected = disks.some((d) => diskId(d) === value) ? value : AUTO;

	return (
		<Select
			label="Install drive"
			value={selected ?? AUTO}
			onChange={(next) => onChange(next === AUTO ? null : next)}
			options={[
				{ value: AUTO, label: "Automatic (roomiest)" },
				...disks.map((disk) => ({
					value: diskId(disk),
					label: describe(disk),
				})),
			]}
		/>
	);
}

// Raw serials (e.g. "FA40977E40973FF5") say nothing to a visitor, so they are dropped.
function describe(disk: DiskSpec): string {
	const name =
		disk.label && !/^[0-9a-f]{8,}$/i.test(disk.label) ? disk.label : "Drive";
	const kind = disk.kind ? ` ${disk.kind.toUpperCase()}` : "";
	return `${name}${kind}, ${formatGbValue(disk.freeBytes / 1e9)} free`;
}
