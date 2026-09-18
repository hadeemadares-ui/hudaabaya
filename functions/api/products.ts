// Cloudflare Pages Function for /api/products
let globalProducts: any[] = [];
let globalDeletedIds: string[] = [];

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
      data: globalProducts,
      deletedIds: globalDeletedIds,
      serverTimeUTC: new Date().toISOString(),
    }),
    { headers: corsHeaders }
  );
}

export async function onRequestPost(context: any) {
  try {
    const body = await context.request.json();
    const { action, product, products, productId, deletedIds } = body;

    if (action === 'sync_all_products' && Array.isArray(products)) {
      globalProducts = products;
      if (Array.isArray(deletedIds)) {
        globalDeletedIds = Array.from(new Set([...globalDeletedIds, ...deletedIds]));
      }
    } else if ((action === 'add_product' || action === 'update_product') && product) {
      globalProducts = [product, ...globalProducts.filter((p: any) => p.id !== product.id)];
      globalDeletedIds = globalDeletedIds.filter((id) => id !== product.id);
    } else if (action === 'delete_product' && productId) {
      globalProducts = globalProducts.filter((p: any) => p.id !== productId);
      if (!globalDeletedIds.includes(productId)) {
        globalDeletedIds.push(productId);
      }
    } else if (action === 'clear_all_products') {
      globalProducts = [];
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: globalProducts,
        deletedIds: globalDeletedIds,
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
