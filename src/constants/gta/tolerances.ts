// Scores are approximate, so allow a margin before failing (same idea as the RAM tolerance).
export const SCORE_TOLERANCE = 0.85;

// Reported RAM/VRAM sit below nominal (reserved memory, GiB vs GB), so allow 10% slack before failing.
export const MEMORY_TOLERANCE = 0.9;
