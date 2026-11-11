// Old releases need well under 1 GB, which reads better in MB.
export function formatGb(value: number | null): string | null {
	if (value === null) return null;
	return value < 1 ? `${Math.round(value * 1024)} MB` : `${value} GB`;
}
