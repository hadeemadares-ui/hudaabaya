// Cloudflare Pages Function for /api/line-notify
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const DEFAULT_CHANNEL_ID = '2011949895';
const DEFAULT_CHANNEL_SECRET = '45811e9faeabea629c67ebcbb52d8236';
const DEFAULT_LINE_TOKEN = 'T7zjWvPiXBVw8gI5BqSaofwCbvKLIU92hOtUsg9/XNn7dUSjPFlRhgmv6IYXQ6vGCdGtlw+Fm/4wv7PnCbIVHnigM+j9mT4V6UqbSwOJRqKxWTYTYAD/id0JGKr+hEdCoAG2Aw4KZ5FRmloIsvmWf49PbdgDzCFqoOLOYbqAITQ=';

// In-memory cache for dynamically refreshed tokens
let cachedOAuthToken: string | null = null;
let cachedTokenExpiry = 0;

async function getValidAccessToken(channelId?: string, channelSecret?: string): Promise<string | null> {
  const now = Date.now();
  if (cachedOAuthToken && now < cachedTokenExpiry) {
    return cachedOAuthToken;
  }

  const cId = (channelId || DEFAULT_CHANNEL_ID).trim();
  const cSecret = (channelSecret || DEFAULT_CHANNEL_SECRET).trim();

  try {
    const res = await fetch('https://api.line.me/v2/oauth/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: cId,
        client_secret: cSecret,
      }),
    });

    if (res.ok) {
      const data: any = await res.json();
      if (data.access_token) {
        cachedOAuthToken = data.access_token;
        // Refresh 5 minutes before actual expiry (expires_in is in seconds, e.g. 2592000 for 30 days)
        cachedTokenExpiry = now + ((data.expires_in || 2592000) - 300) * 1000;
        return cachedOAuthToken;
      }
    }
  } catch (err: any) {
    console.warn('Auto-refresh token failed:', err?.message);
  }

  return DEFAULT_LINE_TOKEN;
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestPost(context: any) {
  try {
    const body = await context.request.json();
    let { message, webhookUrl, token, userId, channelId, channelSecret } = body;

    if (!message) {
      return new Response(
        JSON.stringify({ success: false, error: 'กรุณาระบุข้อความแจ้งเตือน (Message is required)' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!token || token.trim().length < 20) {
      token = await getValidAccessToken(channelId, channelSecret);
    }

    let sent = false;
    let lastError = '';

    // Helper to send message via LINE Messaging API
    async function trySendLineMessage(activeToken: string): Promise<boolean> {
      // 1. If userId / groupId is provided, try push
      if (userId && userId.trim()) {
        try {
          const pushRes = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${activeToken.trim()}`,
            },
            body: JSON.stringify({
              to: userId.trim(),
              messages: [{ type: 'text', text: message }],
            }),
          });

          if (pushRes.ok) {
            return true;
          } else {
            const pushErr = await pushRes.text();
            lastError = `LINE Push ${pushRes.status}: ${pushErr}`;
            if (pushRes.status === 401) return false;
          }
        } catch (err: any) {
          lastError = `LINE Push error: ${err.message}`;
        }
      }

      // 2. Broadcast to all friends/followers of the bot
      try {
        const bRes = await fetch('https://api.line.me/v2/bot/message/broadcast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken.trim()}`,
          },
          body: JSON.stringify({
            messages: [{ type: 'text', text: message }],
          }),
        });

        if (bRes.ok) {
          return true;
        } else {
          const bErr = await bRes.text();
          lastError = `LINE Broadcast ${bRes.status}: ${bErr}`;
          return false;
        }
      } catch (err: any) {
        lastError = `LINE Broadcast error: ${err.message}`;
        return false;
      }
    }

    // Attempt 1: Using provided or cached token
    if (token) {
      sent = await trySendLineMessage(token);

      // If token expired (401), automatically re-authenticate with Channel ID & Secret and retry once!
      if (!sent && (lastError.includes('401') || lastError.includes('Authentication failed'))) {
        cachedOAuthToken = null; // Invalidate cache
        const freshToken = await getValidAccessToken(channelId, channelSecret);
        if (freshToken && freshToken !== token) {
          token = freshToken;
          sent = await trySendLineMessage(token);
        }
      }
    }

    // 3. Fallback: Send via Webhook URL (e.g. Google Apps Script / Make.com / n8n / Discord)
    if (!sent && webhookUrl && webhookUrl.trim().startsWith('http')) {
      try {
        const res = await fetch(webhookUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            text: message,
            timestamp: new Date().toISOString(),
          }),
        });
        const resText = await res.text();
        if (res.ok && !resText.includes('Exception:') && !resText.includes('Authentication failed') && !resText.includes('ต้องมีสิทธิ์เข้าถึง')) {
          sent = true;
        } else if (resText.includes('Authentication failed') || resText.includes('401')) {
          lastError = 'LINE 401: Access Token ใน Google Apps Script ไม่ถูกต้อง หรือยังไม่ได้ใส่ Token จริง';
        } else if (resText.includes('ต้องมีสิทธิ์เข้าถึง')) {
          lastError = 'Google Apps Script ติดสิทธิ์: กรุณาตั้งค่า Who has access เป็น Anyone (ทุกคน)';
        } else if (resText.includes('Exception:')) {
          lastError = `Google Apps Script ผิดพลาด: ${resText.slice(resText.indexOf('Exception:'), resText.indexOf('Exception:') + 150)}`;
        } else if (res.ok) {
          sent = true;
        } else {
          lastError = `Webhook HTTP ${res.status}`;
        }
      } catch (err: any) {
        lastError = `Webhook error: ${err.message}`;
      }
    }

    if (sent) {
      return new Response(
        JSON.stringify({ success: true, message: 'ส่งข้อความแจ้งเตือน LINE สำเร็จแล้ว' }),
        { headers: corsHeaders }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: lastError || 'ส่งข้อความไม่สำเร็จ กรุณาตรวจสอบการตั้งค่า LINE' }),
        { status: 400, headers: corsHeaders }
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
