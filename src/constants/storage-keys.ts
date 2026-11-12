export const PROBE_STORAGE_KEY = "canirungta:probe";

// sessionStorage: dialog stays closed for the rest of the visit once dismissed.
export const PROBE_DIALOG_DISMISSED_KEY = "canirungta:probe-dialog-dismissed";

// localStorage: explicit light/dark choice; absent means dark.
export const THEME_STORAGE_KEY = "canirungta:theme";

// localStorage: specs the visitor typed in for what detection could not read.
export const MANUAL_SPECS_STORAGE_KEY = "canirungta:manual-specs";

// localStorage: drive the visitor picked to install on; absent means the roomiest.
export const INSTALL_DISK_STORAGE_KEY = "canirungta:install-disk";

// localStorage: resolution the visitor picked for the FPS estimates; absent means each game's best.
export const RESOLUTION_STORAGE_KEY = "canirungta:resolution";
