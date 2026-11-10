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
  // 1. Try KV
  if (env?.HUDA_KV) {
    try {
      const rawProds = await env.HUDA_KV.get('huda_products');
      const rawDeleted = await env.HUDA_KV.get('huda_deleted_ids');
      if (rawProds) {
        const prods = JSON.parse(rawProds);
        const delIds = rawDeleted ? JSON.parse(rawDeleted) : [];
        if (Array.isArray(prods) && prods.length > 0) {
          memoryProducts = prods;
          memoryDeletedIds = delIds;
          return { prods, delIds };
        }
      }
    } catch (e) {}
  }

  // 2. Try D1 sync_store bundle (dual persistent fallback)
  if (env?.DB) {
    try {
      const row: any = await env.DB.prepare(
        "SELECT val FROM sync_store WHERE key = ?"
      ).bind('huda_sync_bundle').first();
      if (row?.val) {
        const parsed = JSON.parse(row.val);
        if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
          memoryProducts = parsed.products;
          memoryDeletedIds = Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [];
          return { prods: memoryProducts, delIds: memoryDeletedIds };
        }
      }
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
        env.HUDA_KV.put('huda_deleted_ids', JSON.stringify(delIds)),
        env.HUDA_KV.put('huda_sync_version', Date.now().toString())
      ]);
    } catch (e) {}
  }

  // Dual-save to D1 sync_store bundle so /api/sync and /api/products stay in sync
  if (env?.DB) {
    try {
      const row: any = await env.DB.prepare(
        "SELECT val FROM sync_store WHERE key = ?"
      ).bind('huda_sync_bundle').first();
      let bundle: any = row?.val ? JSON.parse(row.val) : { version: Date.now(), orders: [], stockMovements: [] };
      bundle.products = prods;
      bundle.deletedIds = delIds;
      bundle.version = Date.now();

      let serialized = JSON.stringify(bundle);
      if (serialized.length >= 850000) {
        bundle.products = prods.map((p: any) => ({
          ...p,
          images: Array.isArray(p.images) ? p.images.map((img: string) => (typeof img === 'string' && img.startsWith('data:image/') && img.length > 500) ? ('/images/products/' + p.id + '.jpg') : img) : []
        }));
        serialized = JSON.stringify(bundle);
      }

      await env.DB.prepare(
        "INSERT INTO sync_store (key, val, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET val=excluded.val, updated_at=excluded.updated_at"
      ).bind('huda_sync_bundle', serialized, bundle.version).run();
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
      if (products.length > 0 || currentProds.length === 0) {
        globalProducts = products;
      }
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
