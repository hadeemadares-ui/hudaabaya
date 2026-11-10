// Cloudflare Pages Function for /api/line-webhook
// Handles incoming Webhook events from LINE Messaging API
// Auto-detects Group ID when invited to a group or when requested in group chat

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Line-Signature',
};

const DEFAULT_CHANNEL_ID = '2011949895';
const DEFAULT_CHANNEL_SECRET = '45811e9faeabea629c67ebcbb52d8236';
const DEFAULT_LINE_TOKEN =
  'T7zjWvPiXBVw8gI5BqSaofwCbvKLIU92hOtUsg9/XNn7dUSjPFlRhgmv6IYXQ6vGCdGtlw+Fm/4wv7PnCbIVHnigM+j9mT4V6UqbSwOJRqKxWTYTYAD/id0JGKr+hEdCoAG2Aw4KZ5FRmloIsvmWf49PbdgDzCFqoOLOYbqAITQ=';

async function getReplyToken(): Promise<string> {
  try {
    const res = await fetch('https://api.line.me/v2/oauth/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: DEFAULT_CHANNEL_ID,
        client_secret: DEFAULT_CHANNEL_SECRET,
      }),
    });
    if (res.ok) {
      const data: any = await res.json();
      if (data.access_token) return data.access_token;
    }
  } catch (_) {}
  return DEFAULT_LINE_TOKEN;
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestGet() {
  return new Response(
    JSON.stringify({
      status: 'active',
      service: 'HUDA ABAYA LINE Webhook Endpoint',
      usage: 'Set this URL in LINE Developers Console as Webhook URL: https://hudaabaya.pages.dev/api/line-webhook',
    }),
    { status: 200, headers: corsHeaders }
  );
}

export async function onRequestPost(context: any) {
  try {
    const body = await context.request.json().catch(() => null);
    if (!body || !Array.isArray(body.events)) {
      return new Response(JSON.stringify({ success: true, message: 'No events' }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    const token = await getReplyToken();

    for (const event of body.events) {
      const replyToken = event.replyToken;
      const source = event.source || {};
      const groupId = source.groupId || source.roomId;
      const userId = source.userId;

      // 1. Event: Bot joins a group or room
      if (event.type === 'join' || event.type === 'memberJoined') {
        if (replyToken && groupId) {
          const text = `🎉 ยินดีต้อนรับสู่ระบบแจ้งเตือน HUDA ABAYA!\n\n📌 รหัสกลุ่ม (Group ID) ของกลุ่มนี้คือ:\n${groupId}\n\n👉 วิธีใช้งาน:\nคัดลอกรหัส Group ID ด้านบนไปวางในระบบหลังบ้าน:\nเมนู "ตั้งค่าร้านค้า" ➔ ช่อง "Target User ID หรือ Group ID"\n\nเมื่อมีออเดอร์ใหม่ สลิปโอนเงิน หรือแจ้งเตือนออกบูธ ระบบจะส่งข้อความเข้ากลุ่มนี้ทันทีครับ 🛍️`;
          await replyLineMessage(replyToken, text, token);
        }
      }

      // 2. Event: Message in group/room asking for group ID
      if (event.type === 'message' && event.message?.type === 'text') {
        const userText = (event.message.text || '').trim().toLowerCase();
        const triggers = ['groupid', 'group id', 'id', 'รหัสกลุ่ม', 'ขอไอดี', 'เช็คไอดี', 'ขอรหัสกลุ่ม', 'group'];

        if (triggers.includes(userText)) {
          if (groupId) {
            const text = `📌 รหัสกลุ่ม (Group ID) ของกลุ่มนี้คือ:\n${groupId}\n\n👉 คัดลอกรหัสนี้ไปใส่ในหน้า "ตั้งค่าร้านค้า" ➔ ช่อง "Target User ID หรือ Group ID" ได้เลยครับ!`;
            await replyLineMessage(replyToken, text, token);
          } else if (userId) {
            const text = `👤 รหัสผู้ใช้ (User ID) ส่วนตัวของคุณคือ:\n${userId}\n\n👉 คัดลอกรหัสนี้ไปใส่ในหน้า "ตั้งค่าร้านค้า" ➔ ช่อง "Target User ID หรือ Group ID" เพื่อรับแจ้งเตือนส่วนตัวได้ครับ`;
            await replyLineMessage(replyToken, text, token);
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Webhook error' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function replyLineMessage(replyToken: string, text: string, token: string) {
  try {
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.trim()}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [{ type: 'text', text }],
      }),
    });
  } catch (_) {}
}
