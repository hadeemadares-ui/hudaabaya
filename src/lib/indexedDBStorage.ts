// High-Performance Native IndexedDB Storage for HUDA ABAYA DUBAI
// Provides multi-gigabyte client storage for offline catalogs, high-resolution product photos, and offline queue.

const DB_NAME = 'huda_smartstore_idb';
const DB_VERSION = 1;
const STORE_PRODUCTS = 'products';
const STORE_KEYVAL = 'keyval';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_KEYVAL)) {
        db.createObjectStore(STORE_KEYVAL, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProductsToIDB(products: any[]): Promise<boolean> {
  if (typeof window === 'undefined' || !Array.isArray(products) || products.length === 0) return false;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_PRODUCTS, STORE_KEYVAL], 'readwrite');
      const prodStore = tx.objectStore(STORE_PRODUCTS);
      const kvStore = tx.objectStore(STORE_KEYVAL);

      // Save full products array in keyval for instant retrieval
      kvStore.put({ key: 'all_products', val: products, updatedAt: Date.now() });

      // Also index individual products
      products.forEach((p) => {
        if (p && p.id) {
          prodStore.put(p);
        }
      });

      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('saveProductsToIDB notice:', err);
    return false;
  }
}

export async function getProductsFromIDB(): Promise<any[] | null> {
  if (typeof window === 'undefined') return null;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_KEYVAL, 'readonly');
      const kvStore = tx.objectStore(STORE_KEYVAL);
      const req = kvStore.get('all_products');
      req.onsuccess = () => {
        db.close();
        if (req.result && Array.isArray(req.result.val) && req.result.val.length > 0) {
          resolve(req.result.val);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch (err) {
    return null;
  }
}

export async function saveSingleProductIDB(product: any): Promise<boolean> {
  if (typeof window === 'undefined' || !product?.id) return false;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
      const store = tx.objectStore(STORE_PRODUCTS);
      store.put(product);
      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        resolve(false);
      };
    });
  } catch {
    return false;
  }
}
