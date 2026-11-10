// Cloudflare Pages Function for /api/verify-slip
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestPost(context: any) {
  try {
    const body = await context.request.json();
    const { payload, imageBase64, apiKey } = body;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'กรุณาระบุ EasySlip API Key ในการตั้งค่าร้านค้า' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!payload && !imageBase64) {
      return new Response(
        JSON.stringify({ success: false, message: 'กรุณาระบุข้อมูล QR โค้ด หรือรูปภาพสลิปที่ต้องการตรวจสอบ' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Call EasySlip v1 Verification API
    const requestPayload: any = {};
    if (payload) {
      requestPayload.payload = payload;
    } else if (imageBase64) {
      // Strip data:image/...;base64, prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      requestPayload.image = cleanBase64;
    }

    const easySlipRes = await fetch('https://developer.easyslip.com/api/v1/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify(requestPayload),
    });

    const data: any = await easySlipRes.json();

    if (!easySlipRes.ok || data.status !== 200) {
      return new Response(
        JSON.stringify({
          success: false,
          message: data.message || `การตรวจสอบสลิปไม่สำเร็จ (รหัสสถานะ: ${easySlipRes.status})`,
          error: data,
        }),
        {
          status: easySlipRes.status >= 400 && easySlipRes.status < 500 ? 200 : easySlipRes.status,
          headers: corsHeaders,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'ตรวจสอบสลิปสำเร็จ',
        data: data.data,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error?.message || 'เซิร์ฟเวอร์เกิดข้อผิดพลาดในการตรวจสอบสลิป',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
