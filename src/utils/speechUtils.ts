/**
 * Utility to parse spoken Thai and English numbers into numeric values.
 * Handles both direct digits ("1250", "650.5") and Thai verbal numerals ("หกร้อยห้าสิบ", "หนึ่งพันสองร้อย", "ยี่สิบ").
 */
export function parseThaiNumberSpeech(rawText: string): number | null {
  if (!rawText || typeof rawText !== 'string') return null;

  // Normalize text: replace Thai digits ๐-๙ with Arabic 0-9
  let text = rawText
    .replace(/๐/g, '0')
    .replace(/๑/g, '1')
    .replace(/๒/g, '2')
    .replace(/๓/g, '3')
    .replace(/๔/g, '4')
    .replace(/๕/g, '5')
    .replace(/๖/g, '6')
    .replace(/๗/g, '7')
    .replace(/๘/g, '8')
    .replace(/๙/g, '9');

  // Clean filler words
  text = text.replace(/(บาท|ชิ้น|อัน|ตัว|กล่อง|ขวด|ซอง|รายการ|ราคา|ต้นทุน|สต๊อก|จำนวน|ประมาณ|เอา|ขอ|ใส่|พิมพ์|เอาเป็น|ครับ|ค่ะ|คะ|\s+)/g, '');

  // 1. Check for direct digits in text (e.g. "1250", "650")
  const directMatch = text.match(/\d+(\.\d+)?/);
  if (directMatch) {
    const parsed = parseFloat(directMatch[0]);
    if (!isNaN(parsed)) return parsed;
  }

  // 2. Map Thai number words to values
  const thaiDigitMap: Record<string, number> = {
    'ศูนย์': 0,
    'หนึ่ง': 1,
    'เอ็ด': 1,
    'สอง': 2,
    'ยี่': 2,
    'สาม': 3,
    'สี่': 4,
    'ห้า': 5,
    'หก': 6,
    'เจ็ด': 7,
    'แปด': 8,
    'เก้า': 9,
  };

  const thaiUnitMap: Record<string, number> = {
    'ล้าน': 1000000,
    'แสน': 100000,
    'หมื่น': 10000,
    'พัน': 1000,
    'ร้อย': 100,
    'สิบ': 10,
  };

  let total = 0;
  let currentVal = 0;
  let hasMatch = false;

  let i = 0;
  while (i < text.length) {
    let matchedUnit = false;
    let matchedDigit = false;

    // Check multipliers (ล้าน, แสน, หมื่น, พัน, ร้อย, สิบ)
    for (const [unitStr, unitMultiplier] of Object.entries(thaiUnitMap)) {
      if (text.startsWith(unitStr, i)) {
        matchedUnit = true;
        hasMatch = true;
        if (currentVal === 0) currentVal = 1; // e.g. "สิบ" -> 10, "ร้อย" -> 100
        total += currentVal * unitMultiplier;
        currentVal = 0;
        i += unitStr.length;
        break;
      }
    }

    if (matchedUnit) continue;

    // Check digit words
    for (const [digitStr, digitVal] of Object.entries(thaiDigitMap)) {
      if (text.startsWith(digitStr, i)) {
        matchedDigit = true;
        hasMatch = true;
        currentVal = digitVal;
        i += digitStr.length;
        break;
      }
    }

    if (!matchedDigit) {
      i++; // Skip unmatched character
    }
  }

  total += currentVal;
  return hasMatch ? total : null;
}

/**
 * Check if Web Speech API is supported in the current browser environment.
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}
