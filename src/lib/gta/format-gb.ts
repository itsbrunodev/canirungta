// Whole numbers drop the decimal; old releases need well under 1 GB, which reads better in MB.
export function formatGb(value: number | null): string | null {
	if (value === null) return null;
	return formatGbValue(value);
}

export function formatGbValue(value: number): string {
	if (value < 1) return `${Math.round(value * 1024)} MB`;
	const rounded = Math.round(value * 10) / 10;
	return Number.isInteger(rounded)
		? `${rounded} GB`
		: `${rounded.toFixed(1)} GB`;
}
