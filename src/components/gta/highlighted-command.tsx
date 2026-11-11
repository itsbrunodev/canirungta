import type { ComponentChild } from "preact";

// Token colors: program, flags, URL, pipe/separators, env assignments.
function tokenClass(token: string): string {
	if (/^https?:\/\//.test(token)) return "text-tok-url";
	if (token.startsWith("-")) return "text-tok-flag";
	if (token === "|" || token === ";") return "text-muted-foreground";
	if (token.includes("=")) return "text-tok-env";
	return "text-foreground";
}

// First token after start or a pipe is the program name.
export function HighlightedCommand({ command }: { command: string }) {
	let expectProgram = true;
	const nodes: ComponentChild[] = [];

	for (const token of command.split(" ")) {
		const isProgram = expectProgram && !token.includes("=") && token !== "|";
		expectProgram = token === "|" || (expectProgram && token.includes("="));
		const color = isProgram ? "text-tok-program" : tokenClass(token);
		nodes.push(<span class={color}>{token}</span>, " ");
	}

	return <>{nodes}</>;
}
