// Cloudflare Pages Function for Dedicated Product Image Storage (/api/images)
// Stores each image independently in Cloudflare KV with immutable Edge CDN caching,
// eliminating the 5MB localStorage limit and 25MB sync bundle limit forever.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestGet(context: any) {
  try {
    const env = context.env;
    const url = new URL(context.request.url);
    const id = (url.searchParams.get('id') || '').trim();

    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return new Response('Invalid image id', { status: 400, headers: corsHeaders });
    }

    if (!env?.HUDA_KV) {
      return new Response('Storage not configured', { status: 503, headers: corsHeaders });
    }

    const { value, metadata } = await env.HUDA_KV.getWithMetadata(`img_${id}`, { type: 'arrayBuffer' });
    if (!value) {
      return new Response('Image not found', { status: 404, headers: corsHeaders });
    }

    const contentType = (metadata as any)?.contentType || 'image/jpeg';

    return new Response(value, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    return new Response(err?.message || 'Error loading image', { status: 500, headers: corsHeaders });
  }
}

export async function onRequestPost(context: any) {
  try {
    const env = context.env;
    if (!env?.HUDA_KV) {
      return new Response(JSON.stringify({ success: false, message: 'HUDA_KV not bound' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await context.request.json();
    const dataUrl = typeof body?.dataUrl === 'string' ? body.dataUrl.trim() : '';
    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid image dataUrl' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentType = match[1];
    const base64Data = match[2];
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const rawId =
      typeof body?.id === 'string' && /^[a-zA-Z0-9_-]+$/.test(body.id)
        ? body.id
        : `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await env.HUDA_KV.put(`img_${rawId}`, bytes.buffer, {
      metadata: {
        contentType,
        size: bytes.byteLength,
        createdAt: Date.now(),
      },
    });

    const publicUrl = `/api/images?id=${rawId}`;
    return new Response(
      JSON.stringify({
        success: true,
        id: rawId,
        url: publicUrl,
        size: bytes.byteLength,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, message: err?.message || 'Upload failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
