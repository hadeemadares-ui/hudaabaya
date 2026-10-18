import { Product, Order, StoreSettings, RealtimeSyncPayload } from '../types';

export function getBaseApiUrl(): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // In Capacitor or standalone mobile wrappers, origin is capacitor:// or file:// or empty or localhost without standard Next dev port
    if (
      origin.startsWith('capacitor://') ||
      origin.startsWith('file://') ||
      (origin.includes('localhost') && window.location.port !== '3000') ||
      Boolean((window as any).Capacitor?.isNativePlatform?.())
    ) {
      return 'https://hudaabaya.pages.dev';
    }
  }
  return '';
}

function sanitizeImages(images: string[]): string[] {
  if (!Array.isArray(images) || images.length === 0) {
    return ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop'];
  }
  return images.map((img) => {
    if (!img || typeof img !== 'string') {
      return 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop';
    }
    // Always preserve user uploaded images 100%
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
    const base = getBaseApiUrl();
    const res = await fetch(`${base}/api/products?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (data?.success && Array.isArray(data?.data)) {
      return data.data;
    }
    return [];
  } catch (e) {
    return [];
  }
}

export async function saveCloudProducts(products: Product[]): Promise<boolean> {
  try {
    const base = getBaseApiUrl();
    const clean = sanitizeProducts(products);
    const res = await fetch(`${base}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync_all_products',
        products: clean
      })
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function fetchCloudDeletedIds(): Promise<string[]> {
  try {
    const base = getBaseApiUrl();
    const res = await fetch(`${base}/api/products?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (data?.success && Array.isArray(data?.deletedIds)) {
      return data.deletedIds;
    }
    return [];
  } catch (e) {
    return [];
  }
}

export async function saveCloudDeletedIds(ids: string[]): Promise<boolean> {
  try {
    const base = getBaseApiUrl();
    const res = await fetch(`${base}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync_deleted_ids',
        deletedIds: ids
      })
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function fetchCloudOrders(): Promise<Order[]> {
  try {
    const base = getBaseApiUrl();
    const res = await fetch(`${base}/api/orders?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (data?.success && Array.isArray(data?.orders)) {
      return data.orders;
    }
    return [];
  } catch (e) {
    return [];
  }
}

export async function saveCloudOrders(orders: Order[]): Promise<boolean> {
  try {
    const base = getBaseApiUrl();
    const res = await fetch(`${base}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync_all_orders',
        orders
      })
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function fetchCloudSettings(): Promise<Partial<StoreSettings> | null> {
  try {
    const base = getBaseApiUrl();
    const res = await fetch(`${base}/api/settings?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.success && data?.data) {
      return data.data;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function saveCloudSettings(settings: Partial<StoreSettings>): Promise<boolean> {
  try {
    const base = getBaseApiUrl();
    const res = await fetch(`${base}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// Master Real-Time Multi-Device Sync API
export async function fetchRealtimeSync(clientVersion: number = 0): Promise<RealtimeSyncPayload | null> {
  try {
    const base = getBaseApiUrl();
    const res = await fetch(`${base}/api/sync?v=${clientVersion}&_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.success) {
      if (Array.isArray(data.products)) {
        data.products = sanitizeProducts(data.products);
      }
      return data;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function pushRealtimeSync(payload: Partial<RealtimeSyncPayload>): Promise<number | null> {
  try {
    const base = getBaseApiUrl();
    const cleanPayload = { ...payload };
    if (Array.isArray(cleanPayload.products)) {
      cleanPayload.products = sanitizeProducts(cleanPayload.products);
    }
    const res = await fetch(`${base}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanPayload),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.success && typeof data.version === 'number') {
      return data.version;
    }
    return null;
  } catch (e) {
    return null;
  }
}
