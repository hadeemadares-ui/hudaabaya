import { NextResponse } from 'next/server';
import { Product } from '../../../types';
import { INITIAL_PRODUCTS } from '../../../data/mockProducts';


let globalProductsStoreMap = new Map<string, Product>();
let globalDeletedProductIds = new Set<string>();

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(request: Request) {
  const finalProducts = Array.from(globalProductsStoreMap.values()).filter((p) => !globalDeletedProductIds.has(p.id));

  return NextResponse.json({
    success: true,
    source: 'global_store',
    data: finalProducts,
    serverTimeUTC: new Date().toISOString(),
  }, { headers: noCacheHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, product, productId, products, replace_all } = body;
    const nowUtc = new Date().toISOString();
    const nowTs = Date.now();

    if (action === 'delete_product' && productId) {
      globalDeletedProductIds.add(productId);
      globalProductsStoreMap.delete(productId);
    } else if (action === 'sync_all_products' && Array.isArray(products)) {
      if (replace_all) {
        globalProductsStoreMap.clear();
      }
      products.forEach((p: Product) => {
        if (globalDeletedProductIds.has(p.id)) return;
        const existing = globalProductsStoreMap.get(p.id);
        const pUpdatedAtNum = typeof p.updatedAt === 'number' ? p.updatedAt : nowTs;
        const existingUpdatedAtNum = typeof existing?.updatedAt === 'number' ? existing.updatedAt : 0;
        
        const versioned: Product = {
          ...p,
          version: (existing?.version || 1) + 1,
          updatedAt: pUpdatedAtNum >= existingUpdatedAtNum ? pUpdatedAtNum : existingUpdatedAtNum,
        };

        if (!existing || pUpdatedAtNum >= existingUpdatedAtNum) {
          globalProductsStoreMap.set(p.id, versioned);
        }
      });
    } else if ((action === 'add_product' || action === 'update_product') && product) {
      globalDeletedProductIds.delete(product.id);
      const existing = globalProductsStoreMap.get(product.id);
      const versioned: Product = {
        ...product,
        version: (existing?.version || 1) + 1,
        updatedAt: nowTs,
      };
      globalProductsStoreMap.set(product.id, versioned);
    } else if (action === 'clear_all_products') {
      globalProductsStoreMap.forEach((_, id) => globalDeletedProductIds.add(id));
      INITIAL_PRODUCTS.forEach((p) => globalDeletedProductIds.add(p.id));
      globalProductsStoreMap.clear();
    }

    const filtered = Array.from(globalProductsStoreMap.values()).filter((p) => !globalDeletedProductIds.has(p.id));
    return NextResponse.json({ success: true, data: filtered, serverTimeUTC: nowUtc }, { headers: noCacheHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: noCacheHeaders });
  }
}
