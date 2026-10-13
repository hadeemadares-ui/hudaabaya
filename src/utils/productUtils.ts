/**
 * Product Utilities for Huda Abaya Dubai
 * Includes natural alphanumeric sorting for product catalog codes (e.g. A001 -> A002 -> A003 ... -> A019)
 */

export const sortProductsNatural = <T extends { title?: string; id?: string }>(
  a: T,
  b: T
): number => {
  const titleA = (a.title || a.id || '').trim();
  const titleB = (b.title || b.id || '').trim();

  // Pattern for alphanumeric code prefixes like "A001", "A-01", "A 001", "HD-01", etc.
  const codeRegex = /^[a-zA-Z]+\s*[-_]?\s*\d+/i;
  const matchA = codeRegex.test(titleA);
  const matchB = codeRegex.test(titleB);

  // If one item starts with a product code prefix and the other doesn't, code-prefixed item comes first
  if (matchA && !matchB) return -1;
  if (!matchA && matchB) return 1;

  // Natural collation with numeric sorting (e.g., A001 < A002 < A004 < A013 < A019)
  return (
    titleA.localeCompare(titleB, 'th-TH-u-kn-true', { numeric: true, sensitivity: 'base' }) ||
    titleA.localeCompare(titleB)
  );
};
