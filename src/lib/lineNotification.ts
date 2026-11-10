import { Order, StoreSettings, EventSchedule } from '../types';
import { getBaseApiUrl } from './cloudStorage';

/**
 * Format message for New Order
 */
export function formatNewOrderMessage(order: Order): string {
  const shortId = order.id ? order.id.slice(-6).toUpperCase() : 'NEW';
  const paymentMethodLabel = 
    order.paymentMethod === 'promptpay' ? 'พร้อมเพย์ QR' :
    order.paymentMethod === 'bank_transfer' ? 'โอนเงินธนาคาร' :
    order.paymentMethod === 'cod' ? 'เก็บเงินปลายทาง (COD)' :
    order.paymentMethod === 'credit_card' ? 'บัตรเครดิต' :
    order.paymentMethod === 'truemoney' ? 'TrueMoney Wallet' : 'โอนเงิน';

  const itemsList = (order.items || [])
    .map((item, idx) => `  ${idx + 1}. ${item.productTitle} [${item.variantName}] x${item.quantity} = ฿${(item.price * item.quantity).toLocaleString()}`)
    .join('\n');

  return `🛍️ [HUDA ABAYA] มีคำสั่งซื้อใหม่เข้ามา!
━━━━━━━━━━━━━━━
📋 เลขที่ออเดอร์: #${shortId}
👤 ลูกค้า: ${order.customerName || 'ลูกค้าหน้าร้าน'}
📞 เบอร์โทร: ${order.customerPhone || '-'}
📍 ที่อยู่จัดส่ง: ${order.customerAddress || '-'} ${order.subDistrict || ''} ${order.district || ''} ${order.province || ''} ${order.postalCode || ''}
━━━━━━━━━━━━━━━
📦 รายการสินค้า (${order.items?.length || 0} รายการ):
${itemsList}
━━━━━━━━━━━━━━━
💰 ยอดชำระสุทธิ: ฿${order.netAmount?.toLocaleString() || 0}
💳 วิธีชำระเงิน: ${paymentMethodLabel}
⏳ สถานะ: ${order.paymentStatus === 'slip_uploaded' ? 'แนบสลิปแล้ว (รอตรวจ)' : 'รอชำระเงิน'}
━━━━━━━━━━━━━━━
🔗 เข้าตรวจออเดอร์หลังบ้าน: https://hudaabaya.pages.dev/?admin=true`;
}

/**
 * Format message for Slip Upload
 */
export function formatSlipUploadMessage(order: Order): string {
  const shortId = order.id ? order.id.slice(-6).toUpperCase() : '';
  const now = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });

  return `🧾 [HUDA ABAYA] ลูกค้าแนบสลิปโอนเงินแล้ว!
━━━━━━━━━━━━━━━
📋 เลขที่ออเดอร์: #${shortId}
👤 ลูกค้า: ${order.customerName}
📞 เบอร์โทร: ${order.customerPhone}
💵 ยอดโอน: ฿${order.netAmount?.toLocaleString()}
⏰ เวลาแจ้งโอน: ${now} น.
━━━━━━━━━━━━━━━
👉 กรุณาเปิดระบบหลังบ้านเพื่อตรวจสลิปและกดอนุมัติ:
https://hudaabaya.pages.dev/?admin=true`;
}

/**
 * Format message for Low Stock
 */
export function formatLowStockMessage(productTitle: string, variantName: string, remainingStock: number): string {
  return `⚠️ [HUDA ABAYA] แจ้งเตือนสินค้าสต๊อกต่ำ!
━━━━━━━━━━━━━━━
🏷️ สินค้า: ${productTitle}
📏 ไซส์/ขนาด: ${variantName}
📦 สต๊อกคงเหลือ: ${remainingStock} ชิ้น (ใกล้หมด)
━━━━━━━━━━━━━━━
กรุณาเติมสต๊อกหรือปรับปรุงในระบบ:
https://hudaabaya.pages.dev/?admin=true`;
}

/**
 * Format message for Event / Booth Schedule (ตารางออกบูธ/ตลาดนัด)
 */
export function formatEventScheduleMessage(
  schedule: EventSchedule,
  action: 'created' | 'updated' | 'reminder' = 'created'
): string {
  const statusLabel =
    schedule.status === 'ACTIVE' ? '🟢 กำลังขาย (Active)' :
    schedule.status === 'UPCOMING' ? '🟡 เตรียมออกงาน (Upcoming)' : '⚪ สิ้นสุดงานแล้ว (Completed)';

  const actionHeader =
    action === 'created' ? '🎪 [HUDA ABAYA] มีตารางออกบูธ/ตลาดนัดใหม่!' :
    action === 'updated' ? '📝 [HUDA ABAYA] อัปเดตตารางออกบูธ/ตลาดนัด!' :
    '⏰ [HUDA ABAYA] แจ้งเตือนตารางออกบูธวันนี้!';

  return `${actionHeader}
━━━━━━━━━━━━━━━
📌 งาน: ${schedule.title}
🏷️ สถานะ: ${statusLabel}
🏢 สาขา/ทีม: ${schedule.branchName || 'HUDA ABAYA Pop-up'}${schedule.boothNumber ? ` (บูธ: ${schedule.boothNumber})` : ''}
📍 สถานที่: ${schedule.location || '-'}
📅 วันที่: ${schedule.startDate === schedule.endDate ? schedule.startDate : `${schedule.startDate} ถึง ${schedule.endDate}`}
⏰ เวลาทำการ: ${schedule.operatingHours || '-'}
👤 ผู้รับผิดชอบ: ${schedule.assignedStaff || 'เจ้าของร้าน (Admin)'}
━━━━━━━━━━━━━━━
📦 สินค้าที่ต้องเตรียม:
${schedule.productsToPrepare || '-'}
━━━━━━━━━━━━━━━
💰 เป้าหมายยอดขาย: ฿${(schedule.salesTarget || 0).toLocaleString()}
💵 ค่าเช่าพื้นที่: ฿${(schedule.rentalFee || 0).toLocaleString()}${schedule.depositAmount ? ` (มัดจำแล้ว ฿${schedule.depositAmount.toLocaleString()})` : ''}
${schedule.travelExpense ? `🚗 ค่าเดินทาง/ค่าน้ำมัน: ฿${schedule.travelExpense.toLocaleString()}\n` : ''}${((schedule.rentalFee || 0) > 0 || (schedule.travelExpense || 0) > 0) ? `🏷️ รวมต้นทุนคงที่: ฿${((schedule.rentalFee || 0) + (schedule.travelExpense || 0)).toLocaleString()}\n` : ''}${schedule.organizerContact ? `👤 ติดต่อผู้จัดงาน: ${schedule.organizerContact}\n` : ''}${schedule.organizerLine ? `💬 LINE ผู้จัดงาน: ${schedule.organizerLine}\n` : ''}📞 เบอร์ร้าน/พร้อมเพย์: ${schedule.phonePromptPay || '-'}
${schedule.googleMapsUrl ? `🗺️ แผนที่ Google Maps: ${schedule.googleMapsUrl}\n` : ''}${schedule.note ? `📝 หมายเหตุ: ${schedule.note}\n` : ''}━━━━━━━━━━━━━━━
🔗 ดูตารางงานทั้งหมด: https://hudaabaya.pages.dev/?admin=true`;
}

/**
 * Send notification to LINE
 */
export async function sendLineNotification(
  message: string,
  settings: StoreSettings
): Promise<{ success: boolean; error?: string }> {
  const hasSettings = settings.lineNotifyEnabled || settings.lineWebhookUrl || settings.lineNotifyToken || settings.lineChannelId;
  if (!hasSettings) {
    return { success: false, error: 'ยังไม่ได้เปิดใช้งานการแจ้งเตือน LINE' };
  }

  const base = getBaseApiUrl();

  try {
    const res = await fetch(`${base}/api/line-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        webhookUrl: settings.lineWebhookUrl,
        token: settings.lineNotifyToken || 'T7zjWvPiXBVw8gI5BqSaofwCbvKLIU92hOtUsg9/XNn7dUSjPFlRhgmv6IYXQ6vGCdGtlw+Fm/4wv7PnCbIVHnigM+j9mT4V6UqbSwOJRqKxWTYTYAD/id0JGKr+hEdCoAG2Aw4KZ5FRmloIsvmWf49PbdgDzCFqoOLOYbqAITQ=',
        userId: settings.lineUserId,
        channelId: settings.lineChannelId || '2011949895',
        channelSecret: settings.lineChannelSecret || '45811e9faeabea629c67ebcbb52d8236',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: data.success !== false, error: data.error };
    }

    const errData = await res.json().catch(() => null);
    const serverErr = errData?.error || `ส่งข้อความไม่สำเร็จ (HTTP ${res.status})`;

    // Direct Webhook Fallback (e.g. Google Apps Script)
    if (settings.lineWebhookUrl) {
      try {
        await fetch(settings.lineWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
          mode: 'no-cors',
        });
        return { success: true };
      } catch (e) {}
    }

    return { success: false, error: serverErr };
  } catch (err: any) {
    // If running in browser and direct webhook is provided, try no-cors POST
    if (settings.lineWebhookUrl) {
      try {
        await fetch(settings.lineWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
          mode: 'no-cors',
        });
        return { success: true };
      } catch (e) {}
    }

    console.warn('LINE notification warning:', err);
    return { success: false, error: err?.message || 'การส่งข้อมูลขัดข้อง' };
  }
}
