/** Canonical email form used for storage and lookup: trimmed and lower-cased. */
export function normalizeEmail(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}
