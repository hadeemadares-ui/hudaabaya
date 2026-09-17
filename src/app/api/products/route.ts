import { NextResponse } from 'next/server';
import { Product } from '../../../types';
import { INITIAL_PRODUCTS } from '../../../data/mockProducts';

const CLOUD_DELETED_ID = 'ff808181a09d98f701a0adba989222db';
const CLOUD_PRODUCTS_ID = 'ff808181a09d98f701a0adba991822dc';

let globalProductsStoreMap = new Map<string, Product>();
let globalDeletedProductIds = new Set<string>();

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

async function syncWithCloudStore() {
  try {
    const [delRes, prodRes] = await Promise.all([
      fetch(`https://api.restful-api.dev/objects/${CLOUD_DELETED_ID}`, { cache: 'no-store' }),
      fetch(`https://api.restful-api.dev/objects/${CLOUD_PRODUCTS_ID}`, { cache: 'no-store' })
    ]);
    if (delRes.ok) {
      const delData = await delRes.json();
      if (Array.isArray(delData?.data?.ids)) {
        delData.data.ids.forEach((id: string) => globalDeletedProductIds.add(id));
      }
    }
    if (prodRes.ok) {
      const prodData = await prodRes.json();
      if (Array.isArray(prodData?.data?.products)) {
        prodData.data.products.forEach((p: Product) => {
          if (!globalDeletedProductIds.has(p.id)) {
            globalProductsStoreMap.set(p.id, p);
          }
        });
      }
    }
  } catch (e) {}
}

async function saveCloudDeletedIds() {
  try {
    await fetch(`https://api.restful-api.dev/objects/${CLOUD_DELETED_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'huda_deleted_products_registry_v1',
        data: { ids: Array.from(globalDeletedProductIds) }
      })
    });
  } catch (e) {}
}

async function saveCloudProducts() {
  try {
    const active = Array.from(globalProductsStoreMap.values()).filter((p) => !globalDeletedProductIds.has(p.id));
    await fetch(`https://api.restful-api.dev/objects/${CLOUD_PRODUCTS_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'huda_active_products_registry_v1',
        data: { products: active }
      })
    });
  } catch (e) {}
}

export async function GET(request: Request) {
  await syncWithCloudStore();
  const finalProducts = Array.from(globalProductsStoreMap.values()).filter((p) => !globalDeletedProductIds.has(p.id));

  return NextResponse.json({
    success: true,
    source: 'cloud_registry',
    data: finalProducts,
    deletedIdsCount: globalDeletedProductIds.size,
    serverTimeUTC: new Date().toISOString(),
  }, { headers: noCacheHeaders });
}

export async function POST(request: Request) {
  try {
    await syncWithCloudStore();
    const body = await request.json();
    const { action, product, productId, products, replace_all } = body;
    const nowUtc = new Date().toISOString();
    const nowTs = Date.now();

    if (action === 'delete_product' && productId) {
      globalDeletedProductIds.add(productId);
      globalProductsStoreMap.delete(productId);
      await Promise.all([saveCloudDeletedIds(), saveCloudProducts()]);
    } else if (action === 'sync_all_products' && Array.isArray(products)) {
      if (replace_all) {
        globalProductsStoreMap.clear();
      }
      products.forEach((p: Product) => {
        if (globalDeletedProductIds.has(p.id)) return;
        globalProductsStoreMap.set(p.id, p);
      });
      await saveCloudProducts();
    } else if ((action === 'add_product' || action === 'update_product') && product) {
      globalDeletedProductIds.delete(product.id);
      globalProductsStoreMap.set(product.id, { ...product, updatedAt: nowTs });
      await Promise.all([saveCloudDeletedIds(), saveCloudProducts()]);
    } else if (action === 'clear_all_products') {
      globalProductsStoreMap.forEach((_, id) => globalDeletedProductIds.add(id));
      INITIAL_PRODUCTS.forEach((p) => globalDeletedProductIds.add(p.id));
      globalProductsStoreMap.clear();
      await Promise.all([saveCloudDeletedIds(), saveCloudProducts()]);
    }

    const filtered = Array.from(globalProductsStoreMap.values()).filter((p) => !globalDeletedProductIds.has(p.id));
    return NextResponse.json({ success: true, data: filtered, serverTimeUTC: nowUtc }, { headers: noCacheHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: noCacheHeaders });
  }
}
