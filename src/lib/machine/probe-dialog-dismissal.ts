import { PROBE_DIALOG_DISMISSED_KEY } from "@/constants/storage-keys";

// Storage can throw (private windows, blocked site data): fail open for reads, silent for writes.
export function wasProbeDialogDismissed(): boolean {
	try {
		return sessionStorage.getItem(PROBE_DIALOG_DISMISSED_KEY) === "1";
	} catch {
		return false;
	}
}

export function rememberProbeDialogDismissed(): void {
	try {
		sessionStorage.setItem(PROBE_DIALOG_DISMISSED_KEY, "1");
	} catch {
		// Nothing to do: dialog may show again on reload.
	}
}
