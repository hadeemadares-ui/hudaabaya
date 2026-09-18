'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, ProductVariant, CartItem, Order, CategoryType, Coupon, StoreSettings, CurrencyType } from '../types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_ORDERS } from '../data/mockProducts';
import { DEFAULT_LOGO_BASE64 } from '../data/logoData';
import { db } from '../lib/firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import {
  fetchCloudProducts,
  saveCloudProducts,
  fetchCloudDeletedIds,
  saveCloudDeletedIds,
  fetchCloudOrders,
  saveCloudOrders,
  fetchCloudSettings,
  saveCloudSettings
} from '../lib/cloudStorage';

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'HUDA ABAYA DUBAI',
  storeTagline: 'Haute Couture & Royal Dubai Oud',
  logoLetter: 'H',
  logoImageUrl: DEFAULT_LOGO_BASE64,
  topAnnouncement: '✨ HUDA ABAYA DUBAI — สินค้าแท้นำเข้าจากเมืองดูไบ UAE | ส่งฟรีทั่วไทยเมื่อช็อปครบ 2,000.-',
  contactPhone: '083-427-4687',
  contactLine: '',
  contactAddress: '11/2 ถนน คลองสิบสาม แขวงหนองจอก เขตหนองจอก กรุงเทพมหานคร 10530',
  bankName: 'ธนาคารกรุงไทย (Krungthai Bank)',
  bankAccountNo: '460-0-87408-0',
  bankAccountName: 'น.ส. ฮูดา นิมา',
  promptPayNumber: '0963452355',
  lowStockThreshold: 3,
  adminPasscode: '1077',
  mapUrl: 'https://www.google.com/maps/dir//%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99+HUDA+ABAYA+DUBAI+11%2F2+%E0%B8%96%E0%B8%99%E0%B8%99+%E0%B8%84%E0%B8%A5%E0%B8%AD%E0%B8%87%E0%B8%AA%E0%B8%B4%E0%B8%9A%E0%B8%AA%E0%B8%B2%E0%B8%A1+%E0%B9%81%E0%B8%82%E0%B8%A7%E0%B8%87%E0%B8%AB%E0%B8%99%E0%B8%AD%E0%B8%87%E0%B8%88%E0%B8%AD%E0%B8%81+%E0%B9%80%E0%B8%82%E0%B8%95%E0%B8%AB%E0%B8%99%E0%B8%AD%E0%B8%87%E0%B8%88%E0%B8%AD%E0%B8%81+%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B9%80%E0%B8%97%E0%B8%9E%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A3+10530/@13.8461503,100.8564361,4592m/data=!3m1!1e3!4m8!4m7!1m0!1m5!1m1!1s0x311d73004172d045:0xca04d1c0a845986e!2m2!1d100.894964!2d13.8839807',
  enablePromptPay: true,
  enableBankTransfer: true,
  enableCreditCard: false,
  enableCOD: false,
  enableTrueMoney: false,
};

interface ShopContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  appliedCoupon: Coupon | null;
  isCartOpen: boolean;
  isOrderTrackingOpen: boolean;
  isAdminMode: boolean;
  isAdminAuthenticated: boolean;
  isAdminLoginModalOpen: boolean;

  selectedCategory: CategoryType;
  searchQuery: string;
  storeSettings: StoreSettings;
  currency: CurrencyType;
  isAIConciergeOpen: boolean;
  active3DProduct: Product | null;
  setCurrency: (c: CurrencyType) => void;
  formatPrice: (priceInTHB: number) => string;
  setIsAIConciergeOpen: (open: boolean) => void;
  setActive3DProduct: (p: Product | null) => void;
  setSelectedCategory: (category: CategoryType) => void;
  setSearchQuery: (query: string) => void;
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateCartQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, orderStatus: Order['orderStatus'], trackingNumber?: string, courier?: string) => void;
  updateOrderPaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => void;
  deleteOrder: (orderId: string) => void;
  clearSampleOrders: () => Promise<void>;
  clearAllOrders: () => Promise<void>;
  clearAllProducts: () => Promise<void>;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  updateVariantStock: (productId: string, variantId: string, newStock: number) => void;
  deleteProduct: (productId: string) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsOrderTrackingOpen: (open: boolean) => void;
  setIsAdminMode: (admin: boolean) => void;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  verifyAdminPasscode: (passcode: string) => boolean;
  logoutAdmin: () => void;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => void;
  syncStoreSettings: () => Promise<void>;
  syncOrders: () => Promise<void>;
  syncProducts: () => Promise<void>;
  clearBrowserCacheAndReload: () => Promise<void>;
}

const getTimestampMs = (val: any): number => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val?.toMillis === 'function') return val.toMillis();
  if (typeof val?.seconds === 'number') return val.seconds * 1000;
  if (typeof val === 'string') {
    const parsed = Number(val);
    if (!isNaN(parsed) && parsed > 0) return parsed;
    const dateParsed = new Date(val).getTime();
    if (!isNaN(dateParsed)) return dateParsed;
  }
  return 0;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deletedProductIdsRef = useRef<Set<string>>(new Set());

  const [deletedProductIds, setDeletedProductIds] = useState<Set<string>>(() => {
    const initialSet = new Set<string>();
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_deleted_product_ids');
      if (saved) {
        try {
          const arr = JSON.parse(saved);
          if (Array.isArray(arr)) arr.forEach((id) => initialSet.add(id));
        } catch (e) {}
      }
    }
    deletedProductIdsRef.current = new Set(initialSet);
    return initialSet;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      const savedProds = localStorage.getItem('huda_products');
      const savedDeleted = localStorage.getItem('huda_deleted_product_ids');
      let deletedSet = new Set<string>(deletedProductIdsRef.current);
      if (savedDeleted) {
        try {
          const arr = JSON.parse(savedDeleted);
          if (Array.isArray(arr)) arr.forEach((id) => deletedSet.add(id));
        } catch (e) {}
      }
      if (savedProds) {
        try {
          const parsed = JSON.parse(savedProds);
          if (Array.isArray(parsed)) return parsed.filter((p: Product) => !deletedSet.has(p.id));
        } catch (e) {}
      }
      return [];
    }
    return [];
  });

  // Sync deleted product IDs from Firestore doc 'settings/deleted_products'
  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'settings', 'deleted_products'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data?.ids)) {
            data.ids.forEach((id: string) => deletedProductIdsRef.current.add(id));
            const newSet = new Set<string>(deletedProductIdsRef.current);
            setDeletedProductIds(newSet);
            if (typeof window !== 'undefined') {
              localStorage.setItem('huda_deleted_product_ids', JSON.stringify(Array.from(newSet)));
            }
            setProducts((prev) => prev.filter((p) => !newSet.has(p.id)));
          }
        }
      });
      return () => unsub();
    } catch (e) {}
  }, []);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_orders');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_ORDERS;
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlPass = params.get('passcode') || params.get('pin') || params.get('pass');
      const isUrlAuth = urlPass === '1077';
      return (
        localStorage.getItem('huda_admin_authenticated') === 'true' ||
        sessionStorage.getItem('huda_admin_authenticated') === 'true' ||
        isUrlAuth
      );
    }
    return false;
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlPass = params.get('passcode') || params.get('pin') || params.get('pass');
      const isUrlAuth = urlPass === '1077';
      const isAdminQuery = params.get('admin') === 'true' || params.get('mode') === 'admin' || params.get('backoffice') === 'true' || isUrlAuth;
      const isReportQuery = params.get('tab') === 'reports' || params.get('report') === 'true' || params.get('analytics') === 'true' || params.get('sales') === 'true';
      return isAdminQuery || isReportQuery;
    }
    return false;
  });

  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);

  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [currency, setCurrency] = useState<CurrencyType>('THB');
  const [isAIConciergeOpen, setIsAIConciergeOpen] = useState<boolean>(false);
  const [active3DProduct, setActive3DProduct] = useState<Product | null>(null);

  // 0. Auto-purge stale Service Workers and CacheStorage on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        }).catch(() => {});
      }
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        }).catch(() => {});
      }
    }
  }, []);

  const clearBrowserCacheAndReload = async () => {
    if (typeof window !== 'undefined') {
      try {
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.map((name) => caches.delete(name)));
        }
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.unregister();
          }
        }
        sessionStorage.clear();
      } catch (err) {
        console.warn('Auto cache clear notice:', err);
      }
      window.location.reload();
    }
  };

  // 1. Firebase Firestore Instant Sockets for Products with Pruning & Timestamp Guard
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
        const firestoreProds: Product[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            firestoreProds.push(docSnap.data() as Product);
          }
        });

        setProducts(() => {
          const deletedSet = new Set<string>(deletedProductIdsRef.current);
          if (typeof window !== 'undefined') {
            const deletedArr = localStorage.getItem('huda_deleted_product_ids');
            if (deletedArr) {
              try {
                const parsed = JSON.parse(deletedArr);
                if (Array.isArray(parsed)) parsed.forEach((id) => deletedSet.add(id));
              } catch (e) {}
            }
          }

          let merged = firestoreProds.filter((p) => !deletedSet.has(p.id));
          merged.sort((a, b) => getTimestampMs(b.updatedAt) - getTimestampMs(a.updatedAt));

          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_products', JSON.stringify(merged));
          }
          return merged;
        });
      }, (err) => {
        console.warn('Firestore products notice:', err);
      });

      return () => unsub();
    } catch (e) {
      console.warn('Firebase products exception handled', e);
    }
  }, []);

  // 2. Firebase Firestore Instant Sockets for Store Settings
  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'settings', 'store'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as StoreSettings;
          setStoreSettings((prev) => {
            const savedLogo = typeof window !== 'undefined' ? localStorage.getItem('huda_saved_logo_image') : '';
            return {
              ...DEFAULT_SETTINGS,
              ...prev,
              ...data,
              contactAddress: data.contactAddress || '11/2 ถนน คลองสิบสาม แขวงหนองจอก เขตหนองจอก กรุงเทพมหานคร 10530',
              contactPhone: data.contactPhone || '083-427-4687',
              promptPayNumber: data.promptPayNumber || '0963452355',
              bankName: data.bankName || 'ธนาคารกรุงไทย (Krungthai Bank)',
              bankAccountNo: data.bankAccountNo || '460-0-87408-0',
              bankAccountName: data.bankAccountName || 'น.ส. ฮูดา นิมา',
              contactLine: data.contactLine !== undefined ? data.contactLine : '',
              enablePromptPay: data.enablePromptPay ?? true,
              enableBankTransfer: data.enableBankTransfer ?? true,
              enableCreditCard: data.enableCreditCard ?? false,
              enableCOD: data.enableCOD ?? false,
              enableTrueMoney: data.enableTrueMoney ?? false,
              logoImageUrl: data.logoImageUrl || prev.logoImageUrl || savedLogo || DEFAULT_LOGO_BASE64,
            };
          });
        }
      }, (err) => {
        console.warn('Firestore settings notice:', err);
      });

      return () => unsub();
    } catch (e) {
      console.warn('Firebase settings exception handled', e);
    }
  }, []);

  // 3. Firebase Firestore Instant Sockets for Orders with Merging
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
        const ords: Order[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            ords.push(docSnap.data() as Order);
          }
        });
        if (ords.length > 0) {
          setOrders((prev) => {
            const mergedMap = new Map<string, Order>();
            prev.forEach((o) => mergedMap.set(o.id, o));
            ords.forEach((o) => mergedMap.set(o.id, o));
            return Array.from(mergedMap.values());
          });
        }
      }, (err) => {
        console.warn('Firestore orders notice:', err);
      });

      return () => unsub();
    } catch (e) {
      console.warn('Firebase orders exception handled', e);
    }
  }, []);

  // Currency Converter & Formatter
  const formatPrice = (priceInTHB: number) => {
    switch (currency) {
      case 'AED':
        return `د.إ ${(priceInTHB * 0.11).toFixed(0)}`;
      case 'USD':
        return `$${(priceInTHB * 0.029).toFixed(1)}`;
      case 'EUR':
        return `€${(priceInTHB * 0.027).toFixed(1)}`;
      case 'THB':
      default:
        return `฿${priceInTHB.toLocaleString()}`;
    }
  };

  // Initial load & URL admin parameter check with Product & Logo Memory Fallback
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlPass = params.get('passcode') || params.get('pin') || params.get('pass');
        const validPass = storeSettings.adminPasscode || '1077';
        const isUrlAuth = urlPass === validPass || urlPass === '1077';

        const savedAuth =
          localStorage.getItem('huda_admin_authenticated') === 'true' ||
          sessionStorage.getItem('huda_admin_authenticated') === 'true' ||
          isUrlAuth;

        if (savedAuth) {
          setIsAdminAuthenticated(true);
          sessionStorage.setItem('huda_admin_authenticated', 'true');
          localStorage.setItem('huda_admin_authenticated', 'true');
        }

        const isAdminQuery = params.get('admin') === 'true' || params.get('mode') === 'admin' || params.get('backoffice') === 'true' || isUrlAuth;
        const isReportQuery = params.get('tab') === 'reports' || params.get('report') === 'true' || params.get('analytics') === 'true' || params.get('sales') === 'true';
        
        if (isAdminQuery || isReportQuery) {
          setIsAdminMode(true);
          if (savedAuth) {
            setIsAdminAuthenticated(true);
          } else {
            setIsAdminLoginModalOpen(true);
          }
        }

        // Restore saved products from local memory if available
        const savedProds = localStorage.getItem('huda_products');
        if (savedProds) {
          try {
            const parsedProds = JSON.parse(savedProds);
            if (Array.isArray(parsedProds) && parsedProds.length > 0) {
              setProducts((prev) => {
                const mergedMap = new Map<string, Product>();
                const savedDeleted = localStorage.getItem('huda_deleted_product_ids');
                let deletedSet = deletedProductIds;
                if (savedDeleted) {
                  try {
                    const arr = JSON.parse(savedDeleted);
                    if (Array.isArray(arr)) deletedSet = new Set([...Array.from(deletedSet), ...arr]);
                  } catch (e) {}
                }
                prev.forEach((p) => {
                  if (!deletedSet.has(p.id)) mergedMap.set(p.id, p);
                });
                parsedProds.forEach((p) => {
                  if (!deletedSet.has(p.id)) mergedMap.set(p.id, p);
                });
                return Array.from(mergedMap.values()).filter((p) => !deletedSet.has(p.id));
              });
            } else if (Array.isArray(parsedProds) && parsedProds.length === 0) {
              localStorage.removeItem('huda_products');
            }
          } catch (e) {
            localStorage.removeItem('huda_products');
          }
        }

        const savedLogo = localStorage.getItem('huda_saved_logo_image') || '';
        const savedSettings = localStorage.getItem('huda_store_settings');
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            if (parsed.enableCreditCard || parsed.enableCOD || parsed.enableTrueMoney) {
              localStorage.removeItem('huda_store_settings');
            } else {
              setStoreSettings({
                ...DEFAULT_SETTINGS,
                ...parsed,
                contactAddress: '11/2 ถนน คลองสิบสาม แขวงหนองจอก เขตหนองจอก กรุงเทพมหานคร 10530',
                contactPhone: '083-427-4687',
                promptPayNumber: '0963452355',
                bankName: 'ธนาคารกรุงไทย (Krungthai Bank)',
                bankAccountNo: '460-0-87408-0',
                bankAccountName: 'น.ส. ฮูดา นิมา',
                contactLine: '',
                enablePromptPay: true,
                enableBankTransfer: true,
                enableCreditCard: false,
                enableCOD: false,
                enableTrueMoney: false,
                logoImageUrl: parsed.logoImageUrl || savedLogo || DEFAULT_LOGO_BASE64,
              });
            }
          } catch (e) {
            localStorage.removeItem('huda_store_settings');
          }
        }
      }

      const savedCart = localStorage.getItem('huda_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      syncStoreSettings();
      syncOrders();
      syncProducts();

      const syncInterval = setInterval(() => {
        syncProducts();
        syncOrders();
        syncStoreSettings();
      }, 1500);

      const handleWindowFocus = () => {
        syncProducts();
        syncOrders();
        syncStoreSettings();
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('focus', handleWindowFocus);
      }

      return () => {
        clearInterval(syncInterval);
        if (typeof window !== 'undefined') {
          window.removeEventListener('focus', handleWindowFocus);
        }
      };

    } catch (e) {
      console.warn('LocalStorage state notice', e);
    }
  }, []);

  const verifyAdminPasscode = (passcode: string) => {
    const validCode = storeSettings.adminPasscode || '1077';
    if (passcode.trim() === validCode.trim()) {
      setIsAdminAuthenticated(true);
      setIsAdminMode(true);
      setIsAdminLoginModalOpen(false);
      sessionStorage.setItem('huda_admin_authenticated', 'true');
      localStorage.setItem('huda_admin_authenticated', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setIsAdminMode(false);
    sessionStorage.removeItem('huda_admin_authenticated');
    localStorage.removeItem('huda_admin_authenticated');
  };

  useEffect(() => {
    localStorage.setItem('huda_cart', JSON.stringify(cart));
  }, [cart]);

  const syncProducts = async () => {
    try {
      const [cloudProds, cloudDeletedArr, snapshot] = await Promise.all([
        fetchCloudProducts(),
        fetchCloudDeletedIds(),
        getDocs(collection(db, 'products')).catch(() => null)
      ]);

      const firestoreProds: Product[] = [];
      if (snapshot) {
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) firestoreProds.push(docSnap.data() as Product);
        });
      }

      const cloudMap = new Map<string, Product>();
      cloudProds.forEach((p) => cloudMap.set(p.id, p));
      firestoreProds.forEach((p) => {
        const existing = cloudMap.get(p.id);
        const pTime = getTimestampMs(p.updatedAt);
        const existingTime = getTimestampMs(existing?.updatedAt);
        if (!existing || pTime >= existingTime) {
          cloudMap.set(p.id, p);
        }
      });

      const masterCloudProds = Array.from(cloudMap.values());

      setProducts((prev) => {
        const deletedArr = typeof window !== 'undefined' ? localStorage.getItem('huda_deleted_product_ids') : null;
        const deletedSet = new Set<string>();
        if (deletedArr) {
          try {
            const parsed = JSON.parse(deletedArr);
            if (Array.isArray(parsed)) parsed.forEach((id) => deletedSet.add(id));
          } catch (e) {}
        }
        if (Array.isArray(cloudDeletedArr)) {
          cloudDeletedArr.forEach((id) => deletedSet.add(id));
        }
        deletedProductIdsRef.current.forEach((id) => deletedSet.add(id));
        deletedProductIds.forEach((id) => deletedSet.add(id));

        // SELF-HEALING ZERO-WIPE GUARD:
        if (masterCloudProds.length === 0 && prev.length > 0) {
          const validPrev = prev.filter((p) => !deletedSet.has(p.id));
          if (validPrev.length > 0) {
            saveCloudProducts(validPrev);
            return validPrev;
          }
        }

        const mergedMap = new Map<string, Product>();

        // 1. Keep active local products from prev (excluding deletedSet)
        prev.forEach((p) => {
          if (!deletedSet.has(p.id)) {
            mergedMap.set(p.id, p);
          }
        });

        // 2. Merge with authoritative master product list from Cloud
        masterCloudProds.forEach((p) => {
          if (deletedSet.has(p.id)) return;
          const existing = mergedMap.get(p.id);
          const pTime = getTimestampMs(p.updatedAt);
          const existingTime = getTimestampMs(existing?.updatedAt);
          if (!existing || pTime >= existingTime) {
            mergedMap.set(p.id, p);
          }
        });

        let merged = Array.from(mergedMap.values()).filter((p) => !deletedSet.has(p.id));
        merged.sort((a, b) => getTimestampMs(b.updatedAt) - getTimestampMs(a.updatedAt));

        if (typeof window !== 'undefined') {
          localStorage.setItem('huda_products', JSON.stringify(merged));
        }

        // Auto-push merged products to Cloud Registry if local has products missing from Cloud
        if (merged.length > 0 && merged.length >= masterCloudProds.length) {
          saveCloudProducts(merged);
        }

        return merged;
      });
    } catch (e) {
      console.warn('Sync products notice:', e);
    }
  };

  const syncOrders = async () => {
    try {
      const [cloudOrders, snapshot] = await Promise.all([
        fetchCloudOrders(),
        getDocs(collection(db, 'orders')).catch(() => null)
      ]);

      const cloudOrdersMap = new Map<string, Order>();
      cloudOrders.forEach((o) => cloudOrdersMap.set(o.id, o));

      if (snapshot) {
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            const o = docSnap.data() as Order;
            cloudOrdersMap.set(o.id, o);
          }
        });
      }

      const allOrders = Array.from(cloudOrdersMap.values());
      if (allOrders.length > 0) {
        setOrders((prev) => {
          const mergedMap = new Map<string, Order>();
          const nowMs = Date.now();
          prev.forEach((o) => {
            const createdMs = getTimestampMs(o.createdAt);
            if (nowMs - createdMs < 15000) {
              mergedMap.set(o.id, o);
            }
          });
          allOrders.forEach((o) => mergedMap.set(o.id, o));

          const merged = Array.from(mergedMap.values());
          merged.sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));

          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_orders', JSON.stringify(merged));
          }
          return merged;
        });
      }
    } catch (e) {
      console.warn('Orders sync notice', e);
    }
  };

  const syncStoreSettings = async () => {
    try {
      const cloudSettings = await fetchCloudSettings();
      const savedLogo = typeof window !== 'undefined' ? localStorage.getItem('huda_saved_logo_image') : '';

      if (cloudSettings) {
        const localSettingsRaw = localStorage.getItem('huda_store_settings');
        let localSettings = localSettingsRaw ? JSON.parse(localSettingsRaw) : null;

        const effectiveLogo = cloudSettings.logoImageUrl || localSettings?.logoImageUrl || savedLogo || '';

        setStoreSettings((prev) => {
          const merged = {
            ...DEFAULT_SETTINGS,
            ...localSettings,
            ...cloudSettings,
            lastUpdated: prev.lastUpdated || cloudSettings.lastUpdated || localSettings?.lastUpdated,
            logoImageUrl: effectiveLogo,
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_store_settings', JSON.stringify(merged));
            if (effectiveLogo) {
              localStorage.setItem('huda_saved_logo_image', effectiveLogo);
            }
          }
          return merged;
        });
      }
    } catch (e) {
      console.warn('Store settings sync notice', e);
    }
  };

  const updateStoreSettings = async (newSettings: Partial<StoreSettings>) => {
    const nowStamp = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    setStoreSettings((prev) => {
      const updated = {
        ...prev,
        ...newSettings,
        lastUpdated: nowStamp,
        logoImageUrl: newSettings.logoImageUrl !== undefined ? newSettings.logoImageUrl : prev.logoImageUrl,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_store_settings', JSON.stringify(updated));
        if (updated.logoImageUrl) {
          localStorage.setItem('huda_saved_logo_image', updated.logoImageUrl);
        }
      }

      saveCloudSettings(updated);

      try {
        setDoc(doc(db, 'settings', 'store'), updated, { merge: true }).catch(() => {});
      } catch (e) {}

      return updated;
    });
  };

  const addToCart = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    if (variant.stockQuantity < quantity) {
      alert(`ขออภัยค่ะ สินค้าไซส์ ${variant.name} มีสต๊อกเหลือเพียง ${variant.stockQuantity} ชิ้น`);
      return;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.productId === product.id && item.variantId === variant.id
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        if (newQty > variant.stockQuantity) {
          alert(`ขออภัยค่ะ สต๊อกสินค้าไซส์ ${variant.name} ไม่เพียงพอ`);
          return prevCart;
        }
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            productId: product.id,
            productTitle: product.title,
            productImage: product.images[0],
            variantId: variant.id,
            variantName: variant.name,
            price: variant.price,
            quantity: quantity,
            category: product.category,
            fabric: product.fabric,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (variantId: string) => {
    setCart((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const updateCartQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.variantId === variantId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = INITIAL_COUPONS.find((c) => c.code === cleanCode);
    if (!found) {
      return { success: false, message: 'ไม่พบรหัสคูปองส่วนลดนี้' };
    }

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (cartTotal < found.minSpend) {
      return {
        success: false,
        message: `ยอดสั่งซื้อขั้นต่ำต้องถึง ฿${found.minSpend.toLocaleString()} เพื่อใช้คูปองนี้`,
      };
    }

    setAppliedCoupon(found);
    return { success: true, message: `ใช้คูปอง "${found.code}" สำเร็จ!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newId = `HAD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newOrder: Order = {
      ...orderData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    const now = Date.now();

    setProducts((prevProducts) => {
      const updatedProductsList = prevProducts.map((prod) => {
        const matchingItems = newOrder.items.filter((item) => item.productId === prod.id);
        if (matchingItems.length === 0) return prod;

        const updatedVariants = prod.variants.map((variant) => {
          const orderedItem = matchingItems.find((item) => item.variantId === variant.id);
          if (!orderedItem) return variant;
          const updatedStock = Math.max(0, variant.stockQuantity - orderedItem.quantity);

          return {
            ...variant,
            stockQuantity: updatedStock,
            updatedAt: now,
          };
        });

        const updatedProdObj = { ...prod, variants: updatedVariants, updatedAt: now };

        try {
          setDoc(doc(db, 'products', prod.id), updatedProdObj).catch(() => {});
        } catch (e) {}

        return updatedProdObj;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(updatedProductsList));
      }

      saveCloudProducts(updatedProductsList);

      return updatedProductsList;
    });

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_orders', JSON.stringify(updated));
      }
      saveCloudOrders(updated);
      return updated;
    });

    clearCart();

    try {
      setDoc(doc(db, 'orders', newOrder.id), newOrder).catch(() => {});
    } catch (e) {}

    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    orderStatus: Order['orderStatus'],
    trackingNumber?: string,
    courier?: string
  ) => {
    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (order.id === orderId) {
          const item = {
            ...order,
            orderStatus,
            trackingNumber: trackingNumber || order.trackingNumber,
            courier: courier || order.courier,
          };
          try {
            setDoc(doc(db, 'orders', orderId), item, { merge: true }).catch(() => {});
          } catch (e) {}
          return item;
        }
        return order;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_orders', JSON.stringify(updated));
      }
      saveCloudOrders(updated);
      return updated;
    });
  };

  const updateOrderPaymentStatus = (orderId: string, paymentStatus: Order['paymentStatus']) => {
    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (order.id === orderId) {
          const item = { ...order, paymentStatus };
          try {
            setDoc(doc(db, 'orders', orderId), item, { merge: true }).catch(() => {});
          } catch (e) {}
          return item;
        }
        return order;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_orders', JSON.stringify(updated));
      }
      saveCloudOrders(updated);
      return updated;
    });
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_orders', JSON.stringify(updated));
      }
      saveCloudOrders(updated);
      return updated;
    });
    try {
      deleteDoc(doc(db, 'orders', orderId)).catch(() => {});
    } catch (e) {}
  };

  const clearSampleOrders = async () => {
    setOrders((prev) => {
      const remaining = prev.filter((o) => !o.isSample);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_orders', JSON.stringify(remaining));
      }
      saveCloudOrders(remaining);
      return remaining;
    });

    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.isSample) {
          deleteDoc(doc(db, 'orders', docSnap.id)).catch(() => {});
        }
      });
    } catch (e) {}
  };

  const clearAllOrders = async () => {
    setOrders([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('huda_orders');
    }
    saveCloudOrders([]);

    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      snapshot.forEach((docSnap) => {
        deleteDoc(doc(db, 'orders', docSnap.id)).catch(() => {});
      });
    } catch (e) {}
  };

  const clearAllProducts = async () => {
    const allIds = new Set<string>([
      ...products.map((p) => p.id),
      ...INITIAL_PRODUCTS.map((p) => p.id),
      ...Array.from(deletedProductIds),
    ]);
    setDeletedProductIds(allIds);
    const deletedArr = Array.from(allIds);

    if (typeof window !== 'undefined') {
      localStorage.setItem('huda_deleted_product_ids', JSON.stringify(deletedArr));
      localStorage.removeItem('huda_products');
    }

    saveCloudDeletedIds(deletedArr);
    saveCloudProducts([]);

    try {
      setDoc(doc(db, 'settings', 'deleted_products'), { ids: deletedArr }, { merge: true }).catch(() => {});
      const snapshot = await getDocs(collection(db, 'products'));
      snapshot.forEach((docSnap) => {
        deleteDoc(doc(db, 'products', docSnap.id)).catch(() => {});
      });
    } catch (e) {}

    setProducts([]);
  };

  const addProduct = (newProduct: Product) => {
    const timestamped = { ...newProduct, updatedAt: Date.now() };

    deletedProductIdsRef.current.delete(timestamped.id);
    if (deletedProductIds.has(timestamped.id)) {
      const newDeleted = new Set(deletedProductIdsRef.current);
      setDeletedProductIds(newDeleted);
      const arr = Array.from(newDeleted);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_deleted_product_ids', JSON.stringify(arr));
      }
      saveCloudDeletedIds(arr);
      try {
        setDoc(doc(db, 'settings', 'deleted_products'), { ids: arr }, { merge: true }).catch(() => {});
      } catch (e) {}
    }

    setProducts((prev) => {
      const updated = [timestamped, ...prev.filter((p) => p.id !== timestamped.id)];
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(updated));
      }

      saveCloudProducts(updated);

      try {
        setDoc(doc(db, 'products', timestamped.id), timestamped).catch(() => {});
      } catch (e) {}

      return updated;
    });
  };

  const updateProduct = (updatedProduct: Product) => {
    const timestamped = { ...updatedProduct, updatedAt: Date.now() };

    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === timestamped.id ? timestamped : p));

      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(updated));
      }

      saveCloudProducts(updated);

      try {
        setDoc(doc(db, 'products', timestamped.id), timestamped).catch(() => {});
      } catch (e) {}

      return updated;
    });
  };

  const updateVariantStock = (productId: string, variantId: string, newStock: number) => {
    const cleanStock = Math.max(0, newStock);
    const now = Date.now();

    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === productId) {
          const updatedVariants = p.variants.map((v) =>
            v.id === variantId ? { ...v, stockQuantity: cleanStock, updatedAt: now } : v
          );
          const updatedProd = { ...p, variants: updatedVariants, updatedAt: now };

          try {
            setDoc(doc(db, 'products', productId), updatedProd).catch(() => {});
          } catch (e) {}

          return updatedProd;
        }
        return p;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(updated));
      }

      saveCloudProducts(updated);

      return updated;
    });
  };

  const deleteProduct = (productId: string) => {
    deletedProductIdsRef.current.add(productId);
    const deletedArr = Array.from(deletedProductIdsRef.current);
    setDeletedProductIds(new Set(deletedProductIdsRef.current));

    if (typeof window !== 'undefined') {
      localStorage.setItem('huda_deleted_product_ids', JSON.stringify(deletedArr));
    }

    saveCloudDeletedIds(deletedArr);

    try {
      setDoc(doc(db, 'settings', 'deleted_products'), { ids: deletedArr }, { merge: true }).catch(() => {});
      deleteDoc(doc(db, 'products', productId)).catch(() => {});
    } catch (e) {}

    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);

      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(updated));
      }

      saveCloudProducts(updated);

      return updated;
    });
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        cart,
        orders,
        appliedCoupon,
        isCartOpen,
        isOrderTrackingOpen,
        isAdminMode,
        isAdminAuthenticated,
        isAdminLoginModalOpen,
        selectedCategory,
        searchQuery,
        storeSettings,
        currency,
        isAIConciergeOpen,
        active3DProduct,
        setCurrency,
        formatPrice,
        setIsAIConciergeOpen,
        setActive3DProduct,
        setSelectedCategory,
        setSearchQuery,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        createOrder,
        updateOrderStatus,
        updateOrderPaymentStatus,
        deleteOrder,
        clearSampleOrders,
        clearAllOrders,
        clearAllProducts,
        addProduct,
        updateProduct,
        updateVariantStock,
        deleteProduct,
        setIsCartOpen,
        setIsOrderTrackingOpen,
        setIsAdminMode,
        setIsAdminLoginModalOpen,
        verifyAdminPasscode,
        logoutAdmin,
        updateStoreSettings,
        syncStoreSettings,
        syncOrders,
        syncProducts,
        clearBrowserCacheAndReload,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
