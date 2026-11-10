import { StoreSettings, SlipVerificationData } from '../types';

/**
 * Standard Bank Code Mapping according to Bank of Thailand / ITMX
 */
export const THAI_BANKS: Record<string, string> = {
  '002': 'ธนาคารกรุงเทพ (BBL)',
  '004': 'ธนาคารกสิกรไทย (K PLUS / KBANK)',
  '006': 'ธนาคารกรุงไทย (Krungthai NEXT)',
  '011': 'ทีเอ็มบีธนชาต (ttb touch)',
  '014': 'ธนาคารไทยพาณิชย์ (SCB EASY)',
  '025': 'ธนาคารกรุงศรีอยุธยา (KMA)',
  '030': 'ธนาคารออมสิน (MyMo)',
  '034': 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)',
  '067': 'ธนาคารทิสโก้ (TISCO)',
  '069': 'ธนาคารเกียรตินาคินภัทร (KKP)',
  '073': 'ธนาคารแลนด์ แอนด์ เฮ้าส์ (LH Bank)',
};

/**
 * Parses Bank of Thailand / ITMX BScanC PromptPay e-Slip QR String
 * Example format: 00460006000001010301402250142991234567895102TH
 */
export function parseBScanCPayload(payload: string): {
  isBScanC: boolean;
  bankCode?: string;
  bankName?: string;
  transRef?: string;
} {
  if (!payload || typeof payload !== 'string') {
    return { isBScanC: false };
  }

  const clean = payload.trim();
  // Standard BScanC QR starts with 00460006000001 or 004
  if (clean.includes('00460006000001') || clean.startsWith('0046') || clean.length > 25) {
    // Attempt tag parsing (Tag 01 = Bank, Tag 02 = TransRef)
    const bankMatch = clean.match(/0103(\d{3})/);
    const bankCode = bankMatch ? bankMatch[1] : undefined;
    const bankName = bankCode ? THAI_BANKS[bankCode] || `ธนาคารรหัส ${bankCode}` : 'ธนาคารในประเทศไทย';

    // TransRef is usually tag 02
    const refMatch = clean.match(/02\d{2}([A-Za-z0-9]+)/);
    const transRef = refMatch ? refMatch[1] : `REF-${Date.now().toString().slice(-8)}`;

    return {
      isBScanC: true,
      bankCode,
      bankName,
      transRef,
    };
  }

  return { isBScanC: false };
}

/**
 * Verify Slip via Server API or Intelligent Demo Simulation
 */
export async function verifySlipData({
  payload,
  imageBase64,
  expectedAmount,
  settings,
}: {
  payload?: string;
  imageBase64?: string;
  expectedAmount: number;
  settings?: StoreSettings;
}): Promise<SlipVerificationData> {
  const isDemoMode = settings?.slipVerifyDemoMode ?? (!settings?.slipVerifyApiKey);
  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // 1. REAL API MODE (via /api/verify-slip using EasySlip API)
  if (!isDemoMode && settings?.slipVerifyApiKey) {
    try {
      const res = await fetch('/api/verify-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload,
          imageBase64,
          apiKey: settings.slipVerifyApiKey,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        return {
          success: false,
          message: json.message || 'ไม่สามารถตรวจสอบสลิปได้ หรือข้อมูลไม่ถูกต้อง',
          rawPayload: payload,
        };
      }

      const slipData = json.data;
      const actualAmount = Number(slipData.amount?.amount ?? slipData.amount ?? 0);

      // Verify Amount
      if (expectedAmount > 0 && Math.abs(actualAmount - expectedAmount) > 0.05) {
        return {
          success: false,
          message: `⚠️ ยอดเงินไม่ตรงกัน! สลิปโอน ฿${actualAmount.toLocaleString()} แต่ยอดที่ต้องชำระคือ ฿${expectedAmount.toLocaleString()}`,
          amount: actualAmount,
          transRef: slipData.transRef,
          senderName: slipData.sender?.account?.name?.th || slipData.sender?.name,
          senderBank: slipData.sender?.bank?.name || slipData.senderBank,
          date: slipData.date || dateStr,
          rawPayload: payload,
        };
      }

      return {
        success: true,
        message: '✅ ตรวจสอบสลิปถูกต้อง 100%! เงินเข้าบัญชีร้านเรียบร้อยแล้ว',
        transRef: slipData.transRef || `REF-${Date.now()}`,
        amount: actualAmount,
        date: slipData.date || dateStr,
        senderName: slipData.sender?.account?.name?.th || slipData.sender?.name || 'ลูกค้าโอนผ่านแอป',
        senderBank: slipData.sender?.bank?.name || slipData.senderBank || 'ธนาคารในประเทศไทย',
        receiverName: slipData.receiver?.account?.name?.th || settings.storeName || 'HUDA ABAYA',
        receiverAccount: slipData.receiver?.account?.proxy?.value || settings.promptPayNumber || settings.bankAccountNo,
        rawPayload: payload,
      };
    } catch (err: any) {
      console.error('Slip API fetch error:', err);
      // Fallback message
      return {
        success: false,
        message: `เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ตรวจสลิป: ${err?.message || 'เครือข่ายขัดข้อง'}`,
        rawPayload: payload,
      };
    }
  }

  // 2. DEMO / INTELLIGENT SIMULATION MODE
  // Parses payload from Mini QR or simulated scan
  const parsed = parseBScanCPayload(payload || '');
  const bankTitle = parsed.bankName || 'ธนาคารกสิกรไทย (K PLUS)';
  const mockRef = parsed.transRef || `014299${Date.now().toString().slice(-8)}`;

  return {
    success: true,
    isDemo: true,
    message: '✨ สลิปถูกต้อง! (โหมดทดสอบตรวจสลิปอัจฉริยะ - จำลองการตรวจจากฐานข้อมูลธนาคาร)',
    transRef: mockRef,
    amount: expectedAmount,
    date: dateStr,
    senderName: 'ลูกค้าโอนเงินผ่านโมบายแบงก์กิ้ง (Verified)',
    senderBank: bankTitle,
    receiverName: settings?.bankAccountName || settings?.storeName || 'HUDA ABAYA DUBAI',
    receiverAccount: settings?.promptPayNumber || settings?.bankAccountNo || '083-427-4687',
    receiverBank: settings?.bankName || 'ธนาคารผู้รับเงินของร้าน',
    rawPayload: payload,
  };
}
