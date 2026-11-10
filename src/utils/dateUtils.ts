/**
 * Utility functions for Thai date and time formatting with day of the week (วันจันทร์, วันอังคาร, etc.)
 */

export const THAI_DAY_NAMES = [
  'วันอาทิตย์',
  'วันจันทร์',
  'วันอังคาร',
  'วันพุธ',
  'วันพฤหัสบดี',
  'วันศุกร์',
  'วันเสาร์',
] as const;

export const THAI_DAY_NAMES_NO_PREFIX = [
  'อาทิตย์',
  'จันทร์',
  'อังคาร',
  'พุธ',
  'พฤหัสบดี',
  'ศุกร์',
  'เสาร์',
] as const;

export const THAI_DAY_NAMES_SHORT = [
  'อา.',
  'จ.',
  'อ.',
  'พ.',
  'พฤ.',
  'ศ.',
  'ส.',
] as const;

export const THAI_MONTH_NAMES_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
] as const;

export const THAI_MONTH_NAMES_FULL = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
] as const;

/**
 * Safely parse any date value (ISO string, YYYY-MM-DD, timestamp number, Date object)
 * Handles YYYY-MM-DD strings without timezone shifting.
 */
export function parseDateSafe(val?: string | number | Date | null): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    // YYYY-MM-DD format: treat as local noon to avoid timezone shift
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      return new Date(y, m - 1, d, 12, 0, 0);
    }
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Returns Thai day of week (e.g. "วันจันทร์", "วันอังคาร")
 */
export function getThaiDayName(val?: string | number | Date | null, prefix = true): string {
  const d = parseDateSafe(val);
  if (!d) return '';
  return prefix ? THAI_DAY_NAMES[d.getDay()] : THAI_DAY_NAMES_NO_PREFIX[d.getDay()];
}

/**
 * Formats a date with Thai day of week:
 * - includeTime = false: "วันจันทร์ 2 พ.ย. 2569"
 * - includeTime = true:  "วันจันทร์ 2 พ.ย. 2569 (08:30 น.)"
 */
export function formatThaiDateWithDay(
  val?: string | number | Date | null,
  includeTime = false,
  shortMonth = true
): string {
  const d = parseDateSafe(val);
  if (!d) return '-';

  const dayName = THAI_DAY_NAMES[d.getDay()];
  const dateNum = d.getDate();
  const monthList = shortMonth ? THAI_MONTH_NAMES_SHORT : THAI_MONTH_NAMES_FULL;
  const monthName = monthList[d.getMonth()];
  const yearTh = d.getFullYear() > 2500 ? d.getFullYear() : d.getFullYear() + 543;

  if (includeTime) {
    const timeStr = d.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${dayName} ${dateNum} ${monthName} ${yearTh} (${timeStr} น.)`;
  }
  return `${dayName} ${dateNum} ${monthName} ${yearTh}`;
}

/**
 * Format date only with day name: "วันจันทร์ 2 พ.ย. 2569"
 */
export function formatThaiDateOnly(val?: string | number | Date | null): string {
  return formatThaiDateWithDay(val, false, true);
}

/**
 * Format date and time with day name: "วันจันทร์ 2 พ.ย. 2569 (08:30 น.)"
 */
export function formatThaiDateTime(val?: string | number | Date | null): string {
  return formatThaiDateWithDay(val, true, true);
}

/**
 * Format numeric date with day name: "วันจันทร์ 02/11/2569"
 */
export function formatThaiDMYWithDay(
  val?: string | number | Date | null,
  includeTime = false
): string {
  const d = parseDateSafe(val);
  if (!d) return '-';

  const dayName = THAI_DAY_NAMES[d.getDay()];
  const dateNum = String(d.getDate()).padStart(2, '0');
  const monthNum = String(d.getMonth() + 1).padStart(2, '0');
  const yearTh = d.getFullYear() > 2500 ? d.getFullYear() : d.getFullYear() + 543;

  if (includeTime) {
    const timeStr = d.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${dayName} ${dateNum}/${monthNum}/${yearTh} ${timeStr} น.`;
  }
  return `${dayName} ${dateNum}/${monthNum}/${yearTh}`;
}
