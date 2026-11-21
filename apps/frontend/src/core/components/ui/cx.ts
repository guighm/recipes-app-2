/**
 * Joins classname parts, discarding the empty ones.
 * Replaces the components' `[base, ..., className].join(' ')` pattern.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}