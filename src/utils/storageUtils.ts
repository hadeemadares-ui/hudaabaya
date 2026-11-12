/**
 * Safe LocalStorage Utilities for HUDA ABAYA DUBAI
 * Prevents QuotaExceededError and DOMException crashes across mobile and desktop browsers
 */

export function safeSetLocalStorage(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    console.warn(`[safeSetLocalStorage] Storage quota warning for "${key}":`, err?.message);
    try {
      // Free up non-critical cache and temporary outbox
      localStorage.removeItem('huda_sync_outbox');
      localStorage.removeItem('huda_deleted_product_ids');
      localStorage.removeItem('huda_deleted_ids');
      localStorage.removeItem('huda_deleted_order_ids');
      localStorage.setItem(key, value);
      return true;
    } catch (retryErr) {
      console.warn(`[safeSetLocalStorage] Critical storage limit reached, skipping key "${key}"`);
      return false;
    }
  }
}

export function safeGetLocalStorage(key: string, defaultValue: string = ''): string {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : defaultValue;
  } catch (err) {
    return defaultValue;
  }
}
