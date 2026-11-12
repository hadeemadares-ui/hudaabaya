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

// List of products that actually have static jpg files on disk (/images/products/[id].jpg)
const KNOWN_STATIC_IMAGE_PRODUCT_IDS = new Set([
  'huda-prod-1789990258574-997',
  'huda-prod-1790238827664-70',
  'huda-prod-1790254417677-0',
  'huda-prod-1790258958294-396',
  'huda-prod-1790259577088-489',
  'huda-prod-1790260182724-135',
  'huda-prod-1790290610957-496',
  'huda-prod-1790290856433-370',
  'huda-prod-1790291092441-691',
  'huda-prod-1790291372438-846',
  'huda-prod-1791004081562-29',
  'huda-prod-1791004718219-910',
  'huda-prod-1791004940194-528',
  'huda-prod-1791005341354-846',
  'huda-prod-1791007571083-191',
  'huda-prod-1791009321948-999',
  'huda-prod-1791009371134-31',
  'huda-prod-1791009446706-759',
  'huda-prod-1791009719738-672',
  'huda-prod-1791010205398-905',
  'huda-prod-1791011240968-250',
  'huda-prod-1791011277045-726',
  'huda-prod-1791011344410-950',
  'huda-prod-1791011400024-765',
  'huda-prod-1791011457320-220',
  'huda-prod-1791011503393-566',
  'huda-prod-1791011594237-608',
  'huda-prod-1791011630134-655',
  'huda-prod-1791011656065-663',
  'huda-prod-1791011688199-1',
  'huda-prod-1791011719490-285',
  'huda-prod-1791011775710-310',
  'huda-prod-1791011808104-657',
  'huda-prod-1791011840649-470',
  'huda-prod-1791011892803-761',
  'huda-prod-1791011923101-349',
  'huda-prod-1791011946022-273',
  'huda-prod-1791011998828-428',
  'huda-prod-1791012042383-966',
  'huda-prod-1792325361278-2262',
  'huda-prod-1792325365976-5046',
  'huda-prod-1792325366241-6544',
  'huda-prod-1792325366517-2006',
  'huda-prod-1792325366781-1065',
  'huda-prod-1792325366906-6881',
  'huda-prod-1792325367505-7107',
  'huda-prod-1792477541861-652',
  'huda-prod-1792478168634-404',
  'huda-prod-1792479042809-523',
  'huda-prod-1792479378949-361',
  'huda-prod-1792479967301-584',
  'huda-prod-1792480741787-567',
  'huda-prod-1792481439482-975',
  'huda-prod-1792481550265-79',
  'huda-prod-1792481674530-161',
  'huda-prod-1792482523926-967',
  'huda-prod-1792482658647-537',
  'huda-prod-1792482714344-684',
  'huda-prod-1793105433655-138',
]);

async function saveProductsToKV(env: any, prods: any[], delIds: any[]) {
  memoryProducts = prods;
  memoryDeletedIds = delIds;
  const now = Date.now();

  if (env?.HUDA_KV) {
    try {
      // 1. Fetch current sync bundle from KV to preserve orders/settings, but update products & deletedIds
      let existingBundle: any = { version: now, orders: [], stockMovements: [] };
      try {
        const rawBundle = await env.HUDA_KV.get('huda_sync_bundle');
        if (rawBundle) {
          existingBundle = JSON.parse(rawBundle);
        }
      } catch (e) {}

      existingBundle.products = prods;
      existingBundle.deletedIds = delIds;
      existingBundle.version = now;

      await Promise.all([
        env.HUDA_KV.put('huda_products', JSON.stringify(prods)),
        env.HUDA_KV.put('huda_deleted_ids', JSON.stringify(delIds)),
        env.HUDA_KV.put('huda_sync_bundle', JSON.stringify(existingBundle)),
        env.HUDA_KV.put('huda_sync_version', now.toString()),
      ]);
    } catch (e) {}
  }

  // Dual-save to D1 sync_store bundle so /api/sync and /api/products stay in sync
  if (env?.DB) {
    try {
      const row: any = await env.DB.prepare(
        "SELECT val FROM sync_store WHERE key = ?"
      ).bind('huda_sync_bundle').first();
      let bundle: any = row?.val ? JSON.parse(row.val) : { version: now, orders: [], stockMovements: [] };
      bundle.products = prods;
      bundle.deletedIds = delIds;
      bundle.version = now;

      let serialized = JSON.stringify(bundle);
      // Only compress into D1 if statement exceeds 850KB, but keep KV completely pristine with full images
      if (serialized.length >= 850000) {
        bundle.products = prods.map((p: any) => {
          // Do NOT touch products modified recently
          if (p.updatedAt && p.updatedAt > 1794000000000) return p;
          if (!KNOWN_STATIC_IMAGE_PRODUCT_IDS.has(p.id)) return p;
          return {
            ...p,
            images: Array.isArray(p.images) ? p.images.map((img: string) => (typeof img === 'string' && img.startsWith('data:image/') && img.length > 500) ? ('/images/products/' + p.id + '.jpg') : img) : []
          };
        });
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
