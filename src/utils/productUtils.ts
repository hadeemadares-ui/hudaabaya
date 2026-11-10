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

/**
 * Extract product model code from title (e.g. "A005" from "A005 ฟาราช่า", "A001" from "A001ดำเพชรเงิน")
 */
export function extractProductModelCode(title: string, fallbackId: string = ''): string {
  if (!title) return fallbackId.replace('huda-prod-', '').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase() || 'A005';
  
  // Clean invisible unicode and Arabic diacritics at start
  const cleanTitle = title
    .replace(/^[\u0600-\u06FF\s\u200B-\u200D\uFEFF]+/g, '')
    .trim();

  // 1. Check if title starts with alphanumeric code (e.g. "A001", "A005", "HD-01", "K012", "001")
  // For "A001ดำเพชรเงิน", [A-Za-z0-9_-] extracts "A001" because Thai letters stop the ASCII match
  const startMatch = cleanTitle.match(/^([A-Za-z0-9_-]{2,10})/);
  if (startMatch && startMatch[1] && /[0-9]/.test(startMatch[1])) {
    return startMatch[1].toUpperCase();
  }

  // 2. Search for any model code pattern anywhere in title (e.g. "A005", "A-005", "K012", "001", "HD01")
  const anyModelMatch = cleanTitle.match(/\b([A-Za-z]{1,4}[-_]?\d{1,5}[A-Za-z]?|\d{3,5})\b/);
  if (anyModelMatch && anyModelMatch[1]) {
    return anyModelMatch[1].toUpperCase();
  }

  // 3. Check first word if it has valid ascii letters
  const words = cleanTitle.split(/\s+/);
  const firstWordClean = words[0]?.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
  if (firstWordClean && firstWordClean.length >= 2) {
    return firstWordClean;
  }

  // 4. Fallback to product ID short code
  const fallbackClean = fallbackId.replace('huda-prod-', '').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  return fallbackClean || 'A001';
}

/**
 * Generate standard HUDA Lot Number / SKU: HUDA-[MODEL]-[RUN]-[YEAR] (e.g. HUDA-A001-2-69)
 */
export function generateStandardHudaLot(title: string, fallbackId: string = '', lot: string = '1-69'): string {
  const cleanLotInput = (lot || '1-69').trim();
  if (cleanLotInput.toUpperCase().startsWith('HUDA-')) {
    return cleanLotInput.toUpperCase();
  }
  const rawModelCode = extractProductModelCode(title, fallbackId);
  const cleanModel = rawModelCode.toUpperCase().replace(/^HUDA[-_]?/, '');
  
  // Strip model prefix if already in lot (e.g. "A001-2-69" -> "2-69")
  let cleanLot = cleanLotInput.replace(/[^a-zA-Z0-9_-]/g, '');
  if (cleanLot.toUpperCase().startsWith(`${cleanModel}-`)) {
    cleanLot = cleanLot.slice(cleanModel.length + 1);
  }
  cleanLot = cleanLot || '1-69';
  return `HUDA-${cleanModel}-${cleanLot}`;
}

/**
 * Natural sort for product variants by size and volume
 * Handles:
 * - Abaya & Clothing lengths/numbers: Size 50 < Size 52 < Size 54 < Size 56 < Size 58 < Size 60
 * - Standard letter sizes: XXS < XS < S < M < L < XL < 2XL < 3XL < Free Size
 * - Perfume volumes: 3 ml < 5 ml < 10 ml < 50 ml < 100 ml
 */
export function sortVariantsBySize<T extends { name?: string }>(a: T, b: T): number {
  const nameA = (a.name || '').trim();
  const nameB = (b.name || '').trim();

  // 1. Check letter size hierarchy (XXS -> 5XL, Free Size)
  const letterMap: Record<string, number> = {
    'XXS': 1, '2XS': 1,
    'XS': 2,
    'S': 3,
    'M': 4,
    'L': 5,
    'XL': 6,
    '2XL': 7, 'XXL': 7,
    '3XL': 8, 'XXXL': 8,
    '4XL': 9, 'XXXXL': 9,
    '5XL': 10,
    'FREE': 90, 'FREESIZE': 90, 'FREE SIZE': 90, 'ONE SIZE': 90, 'ONESIZE': 90,
  };

  const getLetterWeight = (name: string): number | null => {
    const clean = name.trim().toUpperCase();
    for (const [key, weight] of Object.entries(letterMap)) {
      const regex = new RegExp(`\\b(?:SIZE\\s*)?${key}\\b`, 'i');
      if (regex.test(clean)) return weight;
    }
    return null;
  };

  const weightA = getLetterWeight(nameA);
  const weightB = getLetterWeight(nameB);

  if (weightA !== null && weightB !== null) {
    if (weightA !== weightB) return weightA - weightB;
  }

  // 2. Extract numeric volume for perfume (e.g. 5 ml, 10 ml, 100 ml)
  const getMl = (name: string): number | null => {
    const match = name.match(/(\d+(?:\.\d+)?)\s*(?:ml|มล|cc)/i);
    return match ? parseFloat(match[1]) : null;
  };

  const mlA = getMl(nameA);
  const mlB = getMl(nameB);

  if (mlA !== null && mlB !== null) {
    if (mlA !== mlB) return mlA - mlB;
  }

  // 3. Extract primary size number (e.g. "Size 50", "Size 52", "54", "ไซส์ 56")
  const getSizeNum = (name: string): number | null => {
    // Check explicit "Size 52" or "ไซส์ 52"
    const matchSize = name.match(/(?:size|ไซส์|ขนาด)\s*(\d{2,3})/i);
    if (matchSize) return parseInt(matchSize[1], 10);

    // Check standalone 2-3 digit number (e.g. "52", "54")
    const matchFirstNum = name.match(/\b(\d{2,3})\b/);
    if (matchFirstNum) return parseInt(matchFirstNum[1], 10);

    return null;
  };

  const numA = getSizeNum(nameA);
  const numB = getSizeNum(nameB);

  if (numA !== null && numB !== null) {
    if (numA !== numB) return numA - numB;
  }

  // If one has numeric size and other doesn't, numeric size comes first
  if (numA !== null && numB === null) return -1;
  if (numA === null && numB !== null) return 1;

  // 4. Fallback to Natural Thai/English locale collation (e.g. 50 < 52 < 54)
  return (
    nameA.localeCompare(nameB, 'th-TH-u-kn-true', { numeric: true, sensitivity: 'base' }) ||
    nameA.localeCompare(nameB)
  );
}

/**
 * Strip bottle prefixes such as "ขวด", "ขวดลูกกลิ้ง", "ขวดสเปรย์", "ขวดเทสเตอร์", "ขวดแก้วคริสตัล", "ขวด/กระปุก"
 * Ensures clean size display (e.g. "ลูกกลิ้ง 5 ml", "สเปรย์ 100 ml", "เทสเตอร์ 3 ml", "กระปุก 50g")
 */
export function stripBottlePrefix(name: string): string {
  if (!name || typeof name !== 'string') return '';
  return name
    .replace(/^ขวด\/กระปุก\s*/, 'กระปุก ')
    .replace(/ขวดลูกกลิ้ง/g, 'ลูกกลิ้ง')
    .replace(/ขวดสเปรย์/g, 'สเปรย์')
    .replace(/ขวดเทสเตอร์/g, 'เทสเตอร์')
    .replace(/ขวดแก้วคริสตัล/g, 'แก้วคริสตัล')
    .replace(/^ขวด\s*/, '')
    .trim();
}

