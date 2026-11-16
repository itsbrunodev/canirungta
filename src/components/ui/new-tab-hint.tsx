// Screen readers otherwise give no warning that a link leaves the current tab.
export function NewTabHint() {
	return <span class="sr-only"> (opens in new tab)</span>;
}
