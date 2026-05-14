/**
 * Shared constants for times table ranges
 */

/** Maximum times table number (e.g., 20 for tables up to 20×) */
export const MAX_TABLE = 20;

/** Default maximum multiplier used in most games */
export const DEFAULT_MULTIPLIER_MAX = 12;

/** Extended multiplier options for advanced practice */
export const MULTIPLIER_OPTIONS = [12, 20, 50, 100] as const;

/** All table numbers from 2 to MAX_TABLE */
export const ALL_TABLES = Array.from(
  { length: MAX_TABLE - 1 },
  (_, i) => i + 2,
);

/** All table numbers from 1 to MAX_TABLE */
export const ALL_TABLES_WITH_ONE = Array.from(
  { length: MAX_TABLE },
  (_, i) => i + 1,
);
