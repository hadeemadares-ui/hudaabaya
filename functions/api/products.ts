// Cloudflare Pages Function for /api/products
let memoryProducts: any[] = [];
let memoryDeletedIds: string[] = [];

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

async function getProductsFromKVOrMemory(env: any) {
  if (env?.HUDA_KV) {
    try {
      const rawProds = await env.HUDA_KV.get('huda_products');
      const rawDeleted = await env.HUDA_KV.get('huda_deleted_ids');
      const prods = rawProds ? JSON.parse(rawProds) : memoryProducts;
      const delIds = rawDeleted ? JSON.parse(rawDeleted) : memoryDeletedIds;
      memoryProducts = prods;
      memoryDeletedIds = delIds;
      return { prods, delIds };
    } catch (e) {}
  }
  return { prods: memoryProducts, delIds: memoryDeletedIds };
}

async function saveProductsToKV(env: any, prods: any[], delIds: any[]) {
  memoryProducts = prods;
  memoryDeletedIds = delIds;
  if (env?.HUDA_KV) {
    try {
      await Promise.all([
        env.HUDA_KV.put('huda_products', JSON.stringify(prods)),
        env.HUDA_KV.put('huda_deleted_ids', JSON.stringify(delIds))
      ]);
    } catch (e) {}
  }
}

export async function onRequestGet(context: any) {
  const { prods, delIds } = await getProductsFromKVOrMemory(context.env);
  return new Response(
    JSON.stringify({
      success: true,
      data: prods,
      deletedIds: delIds,
      serverTimeUTC: new Date().toISOString(),
    }),
    { headers: corsHeaders }
  );
}

export async function onRequestPost(context: any) {
  try {
    const { prods: currentProds, delIds: currentDeletedIds } = await getProductsFromKVOrMemory(context.env);
    let globalProducts = [...currentProds];
    let globalDeletedIds = [...currentDeletedIds];

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

    await saveProductsToKV(context.env, globalProducts, globalDeletedIds);

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
