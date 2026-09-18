import { Product, Order, StoreSettings } from '../types';

function sanitizeImages(images: string[]): string[] {
  if (!Array.isArray(images)) return [];
  return images.map((img) => {
    if (!img || typeof img !== 'string') {
      return 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop';
    }
    // Allow uploaded base64 image data URLs (up to 1MB)
    if (img.startsWith('data:image/')) {
      if (img.length > 1000000) {
        return 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop';
      }
      return img;
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
    const res = await fetch(`/api/products?_t=${Date.now()}`, { cache: 'no-store' });
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
    const clean = sanitizeProducts(products);
    const res = await fetch('/api/products', {
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
    const res = await fetch(`/api/products?_t=${Date.now()}`, { cache: 'no-store' });
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
    const res = await fetch('/api/products', {
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
    const res = await fetch(`/api/orders?_t=${Date.now()}`, { cache: 'no-store' });
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
    const res = await fetch('/api/orders', {
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
    const res = await fetch(`/api/settings?_t=${Date.now()}`, { cache: 'no-store' });
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
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
