import { Order, StoreSettings } from '../types';

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
 * Send notification to LINE
 */
export async function sendLineNotification(
  message: string,
  settings: StoreSettings
): Promise<{ success: boolean; error?: string }> {
  const hasSettings = settings.lineNotifyEnabled || settings.lineWebhookUrl || settings.lineNotifyToken;
  if (!hasSettings) {
    return { success: false, error: 'ยังไม่ได้เปิดใช้งานการแจ้งเตือน LINE' };
  }

  try {
    const res = await fetch('/api/line-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        webhookUrl: settings.lineWebhookUrl,
        token: settings.lineNotifyToken,
        userId: settings.lineUserId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: data.success !== false, error: data.error };
    }

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

    return { success: false, error: `ส่งข้อความไม่สำเร็จ (HTTP ${res.status})` };
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
