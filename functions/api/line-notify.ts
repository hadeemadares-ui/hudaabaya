// Cloudflare Pages Function for /api/line-notify
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestPost(context: any) {
  try {
    const body = await context.request.json();
    const { message, webhookUrl, token, userId } = body;

    if (!message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Message is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    let sent = false;
    let lastError = '';

    // 1. Send via Webhook URL (e.g. Google Apps Script / Make.com / n8n / Discord)
    if (webhookUrl && webhookUrl.trim().startsWith('http')) {
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

    // 2. Send via LINE Messaging API (Push to user or Broadcast to all shop followers)
    if (token && !sent) {
      if (userId) {
        try {
          const pushRes = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token.trim()}`,
            },
            body: JSON.stringify({
              to: userId.trim(),
              messages: [
                {
                  type: 'text',
                  text: message,
                },
              ],
            }),
          });

          if (pushRes.ok) {
            sent = true;
          } else {
            const pushErr = await pushRes.text();
            lastError = `LINE Push ${pushRes.status}: ${pushErr}`;
          }
        } catch (err: any) {
          lastError = `LINE Push error: ${err.message}`;
        }
      }

      // If push didn't happen or failed, broadcast to all friends of the bot
      if (!sent) {
        try {
          const bRes = await fetch('https://api.line.me/v2/bot/message/broadcast', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token.trim()}`,
            },
            body: JSON.stringify({
              messages: [
                {
                  type: 'text',
                  text: message,
                },
              ],
            }),
          });

          if (bRes.ok) {
            sent = true;
          } else {
            const bErr = await bRes.text();
            lastError = `LINE Broadcast ${bRes.status}: ${bErr}`;
          }
        } catch (err: any) {
          lastError = `LINE Broadcast error: ${err.message}`;
        }
      }
    }

    // 3. Send via LINE Notify Token (if token without userId)
    if (token && !userId && !sent) {
      try {
        const notifyRes = await fetch('https://notify-api.line.me/api/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token.trim()}`,
          },
          body: new URLSearchParams({ message }),
        });

        if (notifyRes.ok) {
          sent = true;
        } else {
          const notifyErr = await notifyRes.text();
          lastError = `LINE Notify ${notifyRes.status}: ${notifyErr}`;
        }
      } catch (err: any) {
        lastError = `LINE Notify error: ${err.message}`;
      }
    }

    if (sent) {
      return new Response(
        JSON.stringify({ success: true, message: 'LINE notification sent successfully' }),
        { headers: corsHeaders }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: lastError || 'Could not send notification. Please check settings.' }),
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
