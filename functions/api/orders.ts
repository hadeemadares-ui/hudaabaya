// Cloudflare Pages Function for /api/orders
let globalOrders: any[] = [];

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

export async function onRequestGet() {
  return new Response(
    JSON.stringify({
      success: true,
      orders: globalOrders,
      serverTimeUTC: new Date().toISOString(),
    }),
    { headers: corsHeaders }
  );
}

export async function onRequestPost(context: any) {
  try {
    const body = await context.request.json();
    const { action, orderId, orderStatus, paymentStatus } = body;

    if (body.id && body.items) {
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
