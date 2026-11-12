import { INSTALL_DISK_STORAGE_KEY } from "@/constants/storage-keys";

// Storage can throw (private mode, blocked site data); the choice then lasts for this visit only.
export function loadInstallDisk(): string | null {
	try {
		return localStorage.getItem(INSTALL_DISK_STORAGE_KEY);
	} catch {
		return null;
	}
}

export function saveInstallDisk(id: string | null): void {
	try {
		if (id === null) localStorage.removeItem(INSTALL_DISK_STORAGE_KEY);
		else localStorage.setItem(INSTALL_DISK_STORAGE_KEY, id);
	} catch {
		// Nothing to do: the choice still applies for this visit.
	}
}
