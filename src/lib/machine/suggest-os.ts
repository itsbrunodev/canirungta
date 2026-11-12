import { OS_OPTIONS } from "@/constants/machine/os-options";

// A short fixed list: no typed text lists everything (like a select), then it narrows by word.
export function suggestOs(text: string): string[] {
	const words = text.toLowerCase().split(/\s+/).filter(Boolean);
	return OS_OPTIONS.map((option) => option.label).filter((label) => {
		const lower = label.toLowerCase();
		return words.every((word) => lower.includes(word));
	});
}
