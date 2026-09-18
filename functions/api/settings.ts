// Cloudflare Pages Function for /api/settings
let memorySettings: any = null;

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

async function getSettingsFromKV(env: any) {
  if (env?.HUDA_KV) {
    try {
      const raw = await env.HUDA_KV.get('huda_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          memorySettings = parsed;
          return parsed;
        }
      }
    } catch (e) {}
  }
  return memorySettings;
}

async function saveSettingsToKV(env: any, settings: any) {
  memorySettings = settings;
  if (env?.HUDA_KV) {
    try {
      await env.HUDA_KV.put('huda_settings', JSON.stringify(settings));
    } catch (e) {}
  }
}

export async function onRequestGet(context: any) {
  const data = await getSettingsFromKV(context.env);
  return new Response(
    JSON.stringify({
      success: true,
      data,
      serverTimeUTC: new Date().toISOString(),
    }),
    { headers: corsHeaders }
  );
}

export async function onRequestPost(context: any) {
  try {
    const current = await getSettingsFromKV(context.env);
    const body = await context.request.json();
    const updated = { ...current, ...body };

    await saveSettingsToKV(context.env, updated);

    return new Response(
      JSON.stringify({
        success: true,
        data: updated,
        serverTimeUTC: new Date().toISOString(),
      }),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 400, headers: corsHeaders }
    );
  }
}
