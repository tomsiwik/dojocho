/** Turn a display name into the canonical handle used by the dojo. */
export function normalizeHandle(input: string): string {
  return input.trim().toLocaleLowerCase().replace(/\s+/g, '-')
}
