import { NextResponse } from 'next/server';

const DEFAULT_CHANNEL_ID = '2011949895';
const DEFAULT_CHANNEL_SECRET = '45811e9faeabea629c67ebcbb52d8236';
const DEFAULT_LINE_TOKEN =
  'T7zjWvPiXBVw8gI5BqSaofwCbvKLIU92hOtUsg9/XNn7dUSjPFlRhgmv6IYXQ6vGCdGtlw+Fm/4wv7PnCbIVHnigM+j9mT4V6UqbSwOJRqKxWTYTYAD/id0JGKr+hEdCoAG2Aw4KZ5FRmloIsvmWf49PbdgDzCFqoOLOYbqAITQ=';

async function fetchOAuthToken(channelId?: string, channelSecret?: string): Promise<string> {
  try {
    const res = await fetch('https://api.line.me/v2/oauth/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: (channelId || DEFAULT_CHANNEL_ID).trim(),
        client_secret: (channelSecret || DEFAULT_CHANNEL_SECRET).trim(),
      }),
    });
    if (res.ok) {
      const data: any = await res.json();
      if (data.access_token) return data.access_token;
    }
  } catch (_) {}
  return DEFAULT_LINE_TOKEN;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { message, webhookUrl, token, userId, channelId, channelSecret } = body;

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    if (!token || token.trim().length < 20) {
      token = await fetchOAuthToken(channelId, channelSecret);
    }

    let sent = false;
    let lastError = '';

    async function sendPushOrBroadcast(activeToken: string): Promise<boolean> {
      if (userId && userId.trim()) {
        try {
          const pushRes = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${activeToken.trim()}`,
            },
            body: JSON.stringify({
              to: userId.trim(),
              messages: [{ type: 'text', text: message }],
            }),
          });
          if (pushRes.ok) return true;
          const pErr = await pushRes.text();
          lastError = `LINE Push ${pushRes.status}: ${pErr}`;
          if (pushRes.status === 401) return false;
        } catch (e: any) {
          lastError = `LINE Push error: ${e.message}`;
        }
      }

      try {
        const bRes = await fetch('https://api.line.me/v2/bot/message/broadcast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeToken.trim()}`,
          },
          body: JSON.stringify({
            messages: [{ type: 'text', text: message }],
          }),
        });
        if (bRes.ok) return true;
        const bErr = await bRes.text();
        lastError = `LINE Broadcast ${bRes.status}: ${bErr}`;
        return false;
      } catch (e: any) {
        lastError = `LINE Broadcast error: ${e.message}`;
        return false;
      }
    }

    if (token) {
      sent = await sendPushOrBroadcast(token);
      if (!sent && (lastError.includes('401') || lastError.includes('Authentication failed'))) {
        const freshToken = await fetchOAuthToken(channelId, channelSecret);
        if (freshToken && freshToken !== token) {
          sent = await sendPushOrBroadcast(freshToken);
        }
      }
    }

    // Fallback to Webhook
    if (!sent && webhookUrl && webhookUrl.trim().startsWith('http')) {
      try {
        const wRes = await fetch(webhookUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, timestamp: new Date().toISOString() }),
        });
        if (wRes.ok) sent = true;
      } catch (e: any) {
        lastError = `Webhook error: ${e.message}`;
      }
    }

    if (sent) {
      return NextResponse.json({ success: true, message: 'ส่งข้อความแจ้งเตือน LINE สำเร็จ' });
    }

    return NextResponse.json({ success: false, error: lastError || 'ส่งแจ้งเตือนไม่สำเร็จ' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
