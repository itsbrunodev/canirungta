interface MatchHighlightProps {
	text: string;
	// What the visitor typed; each word found in the text is emphasised.
	query: string;
}

// Shows why a suggestion matched. Plain spans, so screen readers read the name unbroken.
export function MatchHighlight({ text, query }: MatchHighlightProps) {
	const words = query
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		// Longest first: regex alternation takes the first hit, and "5" would cut "56" short.
		.sort((a, b) => b.length - a.length)
		.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
	if (words.length === 0) return <>{text}</>;

	// A capture group keeps the matched parts in the split result, at odd indexes.
	const parts = text.split(new RegExp(`(${words.join("|")})`, "gi"));
	return (
		<>
			{parts.map((part, index) =>
				index % 2 === 1 ? (
					<span class="font-semibold text-accent">{part}</span>
				) : (
					part
				),
			)}
		</>
	);
}
