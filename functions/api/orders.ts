// Cloudflare Pages Function for /api/orders
let memoryOrders: any[] = [];

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

async function getOrdersFromKV(env: any) {
  if (env?.HUDA_KV) {
    try {
      const raw = await env.HUDA_KV.get('huda_orders');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryOrders = parsed;
          return parsed;
        }
      }
    } catch (e) {}
  }
  return memoryOrders;
}

async function saveOrdersToKV(env: any, orders: any[]) {
  memoryOrders = orders;
  if (env?.HUDA_KV) {
    try {
      await env.HUDA_KV.put('huda_orders', JSON.stringify(orders));
    } catch (e) {}
  }
}

export async function onRequestGet(context: any) {
  const orders = await getOrdersFromKV(context.env);
  return new Response(
    JSON.stringify({
      success: true,
      orders,
      serverTimeUTC: new Date().toISOString(),
    }),
    { headers: corsHeaders }
  );
}

export async function onRequestPost(context: any) {
  try {
    let globalOrders = await getOrdersFromKV(context.env);
    const body = await context.request.json();
    const { action, orderId, orderStatus, paymentStatus, orders } = body;

    if (action === 'sync_all_orders' && Array.isArray(orders)) {
      globalOrders = orders;
    } else if (body.id && body.items) {
      // New Order creation
      globalOrders = [body, ...globalOrders.filter((o: any) => o.id !== body.id)];
    } else if (action === 'update_status' && orderId) {
      globalOrders = globalOrders.map((o: any) =>
        o.id === orderId ? { ...o, orderStatus, trackingNumber: body.trackingNumber || o.trackingNumber, courier: body.courier || o.courier } : o
      );
    } else if (action === 'update_payment' && orderId) {
      globalOrders = globalOrders.map((o: any) => (o.id === orderId ? { ...o, paymentStatus } : o));
    } else if (action === 'delete_order' && orderId) {
      globalOrders = globalOrders.filter((o: any) => o.id !== orderId);
    } else if (action === 'clear_sample_orders') {
      globalOrders = globalOrders.filter((o: any) => !o.isSample);
    } else if (action === 'clear_all_orders') {
      globalOrders = [];
    }

    await saveOrdersToKV(context.env, globalOrders);

    return new Response(
      JSON.stringify({
        success: true,
        orders: globalOrders,
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
