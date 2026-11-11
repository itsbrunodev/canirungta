declare module "virtual:script-hashes" {
	// Lowercase hex SHA-256 of each probe script as served from /sh and /ps.
	export const SCRIPT_HASHES: { sh: string; ps: string };
}
