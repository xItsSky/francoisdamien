export function parseKeywords(raw: string): string[] {
  return raw
    .split(',')
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 0);
}
