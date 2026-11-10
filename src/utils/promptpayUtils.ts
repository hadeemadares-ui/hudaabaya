/**
 * PromptPay EMVCo QR Code Payload Generator
 * Complies with Bank of Thailand (BOT) Standard and EMVCo Specifications.
 */

/**
 * Formats a single EMVCo TLV (Tag-Length-Value) element
 */
export function formatEMV(tag: string, value: string): string {
  const len = String(value.length).padStart(2, '0');
  return `${tag}${len}${value}`;
}

/**
 * Calculates standard EMVCo CRC-16/CCITT-FALSE checksum
 */
export function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generates official EMVCo PromptPay Payload string compatible with all Thai Banking Apps
 * @param target Mobile number (e.g. "0812345678", "081-234-5678") or National ID / Tax ID (13 digits)
 * @param amount Optional payment amount in THB
 */
export function generatePromptPayPayload(target: string, amount?: number): string {
  const cleanTarget = (target || '').replace(/[^0-9]/g, '');
  if (!cleanTarget) return '';

  let targetSubtag = '';
  if (cleanTarget.length >= 13) {
    // 13-digit National ID or Tax ID (Subtag 02)
    targetSubtag = formatEMV('02', cleanTarget.slice(0, 13));
  } else {
    // Mobile Phone Number: converts 08x-xxx-xxxx to 00668xxxxxxxx (Subtag 01)
    const phone = cleanTarget.replace(/^0/, '');
    const formattedPhone = ('0066' + phone).slice(-13).padStart(13, '0');
    targetSubtag = formatEMV('01', formattedPhone);
  }

  // Tag 29: Merchant Account Information (PromptPay)
  const tag29Value = formatEMV('00', 'A000000677010111') + targetSubtag;

  // Tag 00: Payload Format Indicator (01)
  // Tag 01: Point of Initiation Method (12 = Dynamic with Amount, 11 = Static without Amount)
  const isDynamic = typeof amount === 'number' && amount > 0;

  // Build payload strictly in ascending Tag order per EMVCo specifications:
  let payload = '';
  payload += formatEMV('00', '01');
  payload += formatEMV('01', isDynamic ? '12' : '11');
  payload += formatEMV('29', tag29Value);
  payload += formatEMV('53', '764'); // Currency Code: THB (764)

  if (isDynamic && amount !== undefined) {
    payload += formatEMV('54', Number(amount).toFixed(2)); // Transaction Amount
  }

  payload += formatEMV('58', 'TH'); // Country Code: TH
  payload += '6304'; // CRC Tag + Length

  const checksum = crc16(payload);
  return payload + checksum;
}
