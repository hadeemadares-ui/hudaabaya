import { Product, Order, StoreSettings } from '../types';

const CLOUD_PRODUCTS_ID = 'ff808181a09d98f701a0aeaaf80c25e7';
const CLOUD_DELETED_ID = 'ff808181a09d98f701a0aeaaf89025e8';
const CLOUD_ORDERS_ID = 'ff808181a09d98f701a0aeaaf8ef25e9';
const CLOUD_SETTINGS_ID = 'ff808181a09d98f701a0aeaaf95525ea';

const BASE_URL = 'https://api.restful-api.dev/objects';

function sanitizeImages(images: string[]): string[] {
  if (!Array.isArray(images)) return [];
  return images.map((img) => {
    if (typeof img === 'string' && img.length > 50000) {
      return 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop';
    }
    return img;
  });
}

function sanitizeProducts(products: Product[]): Product[] {
  if (!Array.isArray(products)) return [];
  return products.map((p) => ({
    ...p,
    images: sanitizeImages(p.images),
  }));
}

export async function fetchCloudProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${BASE_URL}/${CLOUD_PRODUCTS_ID}?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data?.data?.products)) {
      return data.data.products;
    }
    return [];
  } catch (e) {
    console.warn('fetchCloudProducts notice:', e);
    return [];
  }
}

export async function saveCloudProducts(products: Product[]): Promise<boolean> {
  try {
    const clean = sanitizeProducts(products);
    const res = await fetch(`${BASE_URL}/${CLOUD_PRODUCTS_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'huda_products_v3',
        data: { products: clean }
      })
    });
    return res.ok;
  } catch (e) {
    console.warn('saveCloudProducts notice:', e);
    return false;
  }
}

export async function fetchCloudDeletedIds(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/${CLOUD_DELETED_ID}?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data?.data?.ids)) {
      return data.data.ids;
    }
    return [];
  } catch (e) {
    console.warn('fetchCloudDeletedIds notice:', e);
    return [];
  }
}

export async function saveCloudDeletedIds(ids: string[]): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/${CLOUD_DELETED_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'huda_deleted_ids_v3',
        data: { ids }
      })
    });
    return res.ok;
  } catch (e) {
    console.warn('saveCloudDeletedIds notice:', e);
    return false;
  }
}

export async function fetchCloudOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${BASE_URL}/${CLOUD_ORDERS_ID}?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data?.data?.orders)) {
      return data.data.orders;
    }
    return [];
  } catch (e) {
    console.warn('fetchCloudOrders notice:', e);
    return [];
  }
}

export async function saveCloudOrders(orders: Order[]): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/${CLOUD_ORDERS_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'huda_orders_v3',
        data: { orders }
      })
    });
    return res.ok;
  } catch (e) {
    console.warn('saveCloudOrders notice:', e);
    return false;
  }
}

export async function fetchCloudSettings(): Promise<Partial<StoreSettings> | null> {
  try {
    const res = await fetch(`${BASE_URL}/${CLOUD_SETTINGS_ID}?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.data?.settings) {
      return data.data.settings;
    }
    return null;
  } catch (e) {
    console.warn('fetchCloudSettings notice:', e);
    return null;
  }
}

export async function saveCloudSettings(settings: Partial<StoreSettings>): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/${CLOUD_SETTINGS_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'huda_settings_v3',
        data: { settings }
      })
    });
    return res.ok;
  } catch (e) {
    console.warn('saveCloudSettings notice:', e);
    return false;
  }
}
