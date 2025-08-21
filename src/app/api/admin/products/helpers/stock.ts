export function computeIsSoldOut(sizes: unknown): boolean {
  if (!Array.isArray(sizes)) return true;
  return sizes.every((s: any) => (s?.stock ?? 0) <= 0);
}
