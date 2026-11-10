import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payload, imageBase64, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุ EasySlip API Key ในการตั้งค่าร้านค้า' },
        { status: 400 }
      );
    }

    if (!payload && !imageBase64) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุข้อมูล QR โค้ด หรือรูปภาพสลิปที่ต้องการตรวจสอบ' },
        { status: 400 }
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

    const data = await easySlipRes.json();

    if (!easySlipRes.ok || data.status !== 200) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || `การตรวจสอบสลิปไม่สำเร็จ (รหัสสถานะ: ${easySlipRes.status})`,
          error: data,
        },
        { status: easySlipRes.status >= 400 && easySlipRes.status < 500 ? 200 : easySlipRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ตรวจสอบสลิปสำเร็จ',
      data: data.data,
    });
  } catch (error: any) {
    console.error('API verify-slip error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'เซิร์ฟเวอร์เกิดข้อผิดพลาดในการตรวจสอบสลิป' },
      { status: 500 }
    );
  }
}
