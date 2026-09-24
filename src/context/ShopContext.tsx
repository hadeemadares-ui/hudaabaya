'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, ProductVariant, CartItem, Order, CategoryType, Coupon, StoreSettings, CurrencyType, StockMovement, SupplierSettlement } from '../types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_ORDERS } from '../data/mockProducts';
import { DEFAULT_LOGO_BASE64 } from '../data/logoData';
import { soundFx } from '../lib/soundEffects';
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
  topAnnouncement: 'HUDA ABAYA DUBAI — สินค้าแท้นำเข้าจากเมืองดูไบ UAE | ส่งฟรีทั่วไทยเมื่อช็อปครบ 2,000.-',
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
  stockMovements: StockMovement[];
  supplierSettlements: SupplierSettlement[];
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
  isSoundMuted: boolean;
  toggleSound: () => boolean;
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
  recordStockIn: (data: { productId: string; variantId: string; quantity: number; costPrice: number; supplierName: string; note?: string }) => void;
  createSupplierSettlement: (data: { supplierName: string; periodStart: string; periodEnd: string; movementIds: string[]; paymentRef?: string; note?: string }) => SupplierSettlement;
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
  const [deletedProductIds, setDeletedProductIds] = useState<Set<string>>(new Set());
  const [deletedOrderIds, setDeletedOrderIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_deleted_order_ids');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return new Set(parsed);
        } catch (e) {}
      }
    }
    return new Set<string>();
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_stock_movements');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [];
  });
  const [supplierSettlements, setSupplierSettlements] = useState<SupplierSettlement[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_supplier_settlements');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [];
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [currency, setCurrency] = useState<CurrencyType>('THB');
  const [isAIConciergeOpen, setIsAIConciergeOpen] = useState<boolean>(false);
  const [active3DProduct, setActive3DProduct] = useState<Product | null>(null);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => soundFx.getIsMuted());

  const toggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsSoundMuted(muted);
    return muted;
  };

  // Global Sound Effects Listener for UI Clicks & Typing Keypresses
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'button, input, select, option, textarea, a, [role="button"], .cursor-pointer'
      );
      if (interactive) {
        soundFx.playClick();
      }
    };

    const handleGlobalKeydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isTypingField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      const isModifierKey = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key);

      if (isTypingField && !isModifierKey) {
        if (e.key === 'Backspace' || e.key === 'Delete') {
          soundFx.playDelete();
        } else {
          soundFx.playKeypress();
        }
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    document.addEventListener('keydown', handleGlobalKeydown, true);

    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      document.removeEventListener('keydown', handleGlobalKeydown, true);
    };
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
      const [cloudProds, cloudDeletedArr] = await Promise.all([
        fetchCloudProducts(),
        fetchCloudDeletedIds(),
      ]);

      const deletedSet = new Set<string>(cloudDeletedArr || []);

      setProducts((prev) => {
        let cleanCloudProds = (cloudProds || []).filter((p) => !deletedSet.has(p.id));

        if (cleanCloudProds.length > 0) {
          cleanCloudProds.sort((a, b) => getTimestampMs(b.updatedAt) - getTimestampMs(a.updatedAt));
          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_products', JSON.stringify(cleanCloudProds));
          }
          return cleanCloudProds;
        } else {
          // Cloud worker memory was reset (e.g. after deployment)
          // Fall back to local storage cache or prev state or INITIAL_PRODUCTS
          let localBackup: Product[] = [];
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('huda_products');
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) localBackup = parsed;
              } catch (e) {}
            }
          }

          const candidate = localBackup.length > 0 ? localBackup : prev;
          const fallbackProds = candidate.filter((p) => !deletedSet.has(p.id));

          if (fallbackProds.length > 0) {
            saveCloudProducts(fallbackProds);
            if (typeof window !== 'undefined') {
              localStorage.setItem('huda_products', JSON.stringify(fallbackProds));
            }
            return fallbackProds;
          }

          if (deletedSet.size === 0) {
            saveCloudProducts(INITIAL_PRODUCTS);
            if (typeof window !== 'undefined') {
              localStorage.setItem('huda_products', JSON.stringify(INITIAL_PRODUCTS));
            }
            return INITIAL_PRODUCTS;
          }

          return [];
        }
      });
    } catch (e) {
      console.warn('Sync products notice:', e);
    }
  };

  const syncOrders = async () => {
    try {
      let currentDeletedSet = deletedOrderIds;
      if (typeof window !== 'undefined') {
        const savedDeleted = localStorage.getItem('huda_deleted_order_ids');
        if (savedDeleted) {
          try {
            const arr = JSON.parse(savedDeleted);
            if (Array.isArray(arr)) currentDeletedSet = new Set([...Array.from(currentDeletedSet), ...arr]);
          } catch (e) {}
        }
      }

      const cloudOrders = await fetchCloudOrders();
      if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
        const cleanOrders = cloudOrders.filter((o) => !currentDeletedSet.has(o.id));
        setOrders(cleanOrders);
        if (typeof window !== 'undefined') {
          localStorage.setItem('huda_orders', JSON.stringify(cleanOrders));
        }
      } else {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('huda_orders');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const cleanOrders = parsed.filter((o: Order) => !currentDeletedSet.has(o.id));
                setOrders(cleanOrders);
                saveCloudOrders(cleanOrders);
              }
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      console.warn('Orders sync notice', e);
    }
  };

  const syncStoreSettings = async () => {
    try {
      const cloudSettings = await fetchCloudSettings();
      if (cloudSettings && Object.keys(cloudSettings).length > 0) {
        setStoreSettings((prev) => {
          const updated = {
            ...DEFAULT_SETTINGS,
            ...prev,
            ...cloudSettings,
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_store_settings', JSON.stringify(updated));
          }
          return updated;
        });
      } else {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('huda_store_settings');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed && typeof parsed === 'object') {
                const updated = { ...DEFAULT_SETTINGS, ...parsed };
                setStoreSettings(updated);
                saveCloudSettings(updated);
              }
            } catch (e) {}
          }
        }
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
      }
      saveCloudSettings(updated);
      return updated;
    });
  };

  const addToCart = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    if (variant.stockQuantity < quantity) {
      alert(`ขออภัยค่ะ สินค้าไซส์ ${variant.name} มีสต๊อกเหลือเพียง ${variant.stockQuantity} ชิ้น`);
      return;
    }

    soundFx.playSuccess();

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
    soundFx.playDelete();
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

        return { ...prod, variants: updatedVariants, updatedAt: now };
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

    // Auto-record Stock OUT movement for sold items to enable Supplier Settlement
    const newStockOutMovements: StockMovement[] = newOrder.items.map((item, idx) => {
      const prod = products.find((p) => p.id === item.productId);
      const variant = prod?.variants.find((v) => v.id === item.variantId);
      const itemCost = item.costPrice ?? variant?.costPrice ?? Math.round(item.price * 0.5);
      const supplier = prod?.category === 'perfume' || prod?.fabric?.includes('Oud')
        ? 'ซัพพลายเออร์น้ำหอมดูไบ'
        : 'โรงงานอาบายะห์ดูไบ';

      return {
        id: `MOV-OUT-${now}-${idx}-${Math.floor(Math.random() * 1000)}`,
        type: 'OUT',
        productId: item.productId,
        productTitle: item.productTitle,
        variantId: item.variantId,
        variantName: item.variantName,
        quantity: item.quantity,
        costPrice: itemCost,
        totalCost: itemCost * item.quantity,
        supplierName: supplier,
        referenceOrderNo: newId,
        note: `ขายสินค้าออนไลน์/POS (Order #${newId})`,
        performedBy: 'ระบบขายหน้าร้าน / POS',
        createdAt: new Date().toISOString(),
        isSettled: false,
      };
    });

    setStockMovements((prev) => {
      const updated = [...newStockOutMovements, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_stock_movements', JSON.stringify(updated));
      }
      return updated;
    });

    clearCart();
    return newOrder;
  };

  const recordStockIn = (data: {
    productId: string;
    variantId: string;
    quantity: number;
    costPrice: number;
    supplierName: string;
    note?: string;
  }) => {
    const prod = products.find((p) => p.id === data.productId);
    const variant = prod?.variants.find((v) => v.id === data.variantId);

    const newMovement: StockMovement = {
      id: `MOV-IN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'IN',
      productId: data.productId,
      productTitle: prod?.title || 'สินค้า',
      variantId: data.variantId,
      variantName: variant?.name || 'ไซส์/รายการ',
      quantity: data.quantity,
      costPrice: data.costPrice,
      totalCost: data.costPrice * data.quantity,
      supplierName: data.supplierName || 'โรงงานอาบายะห์ดูไบ',
      note: data.note || 'บันทึกรับสินค้าเข้าสต๊อก (Stock In)',
      performedBy: 'ผู้ดูแลระบบหลังบ้าน',
      createdAt: new Date().toISOString(),
      isSettled: true,
    };

    if (data.productId && data.variantId) {
      updateVariantStock(
        data.productId,
        data.variantId,
        (variant?.stockQuantity || 0) + data.quantity
      );
    }

    setStockMovements((prev) => {
      const updated = [newMovement, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_stock_movements', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const createSupplierSettlement = (data: {
    supplierName: string;
    periodStart: string;
    periodEnd: string;
    movementIds: string[];
    paymentRef?: string;
    note?: string;
  }): SupplierSettlement => {
    const targetMovements = stockMovements.filter((m) => data.movementIds.includes(m.id));
    const totalCostAmount = targetMovements.reduce((sum, m) => sum + m.totalCost, 0);
    const totalItemsCount = targetMovements.reduce((sum, m) => sum + m.quantity, 0);

    const settlementId = `SETTLE-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newSettlement: SupplierSettlement = {
      id: settlementId,
      supplierName: data.supplierName,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      totalItemsCount,
      totalCostAmount,
      status: 'SETTLED',
      settledAt: new Date().toISOString(),
      paymentRef: data.paymentRef || 'โอนเงินบัญชีซัพพลายเออร์',
      note: data.note || 'เคลียร์ยอดต้นทุนประจำรอบขายสำเร็จ',
      movementIds: data.movementIds,
    };

    setStockMovements((prev) => {
      const updated = prev.map((m) =>
        data.movementIds.includes(m.id) ? { ...m, isSettled: true, settlementId } : m
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_stock_movements', JSON.stringify(updated));
      }
      return updated;
    });

    setSupplierSettlements((prev) => {
      const updated = [newSettlement, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_supplier_settlements', JSON.stringify(updated));
      }
      return updated;
    });

    return newSettlement;
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
          return {
            ...order,
            orderStatus,
            trackingNumber: trackingNumber || order.trackingNumber,
            courier: courier || order.courier,
          };
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
          return { ...order, paymentStatus };
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
    setDeletedOrderIds((prevSet) => {
      const updatedSet = new Set(Array.from(prevSet)).add(orderId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_deleted_order_ids', JSON.stringify(Array.from(updatedSet)));
      }
      return updatedSet;
    });

    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_orders', JSON.stringify(updated));
      }
      saveCloudOrders(updated);
      return updated;
    });

    // Sync Stock Movements for Unsettled Sales Breakdown
    setStockMovements((prevMovements) => {
      const updatedMovements = prevMovements.filter((m) => m.referenceOrderNo !== orderId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_stock_movements', JSON.stringify(updatedMovements));
      }
      return updatedMovements;
    });
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
  };

  const clearAllOrders = async () => {
    setOrders([]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('huda_orders', JSON.stringify([]));
    }
    saveCloudOrders([]);
  };

  const clearAllProducts = async () => {
    setProducts([]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('huda_products', JSON.stringify([]));
    }
    const allIds = products.map((p) => p.id);
    const deletedArr = Array.from(new Set([...Array.from(deletedProductIds), ...allIds]));
    saveCloudDeletedIds(deletedArr);
    saveCloudProducts([]);
  };

  const addProduct = (newProduct: Product) => {
    soundFx.playSuccess();
    const timestamped = { ...newProduct, updatedAt: Date.now() };

    setProducts((prev) => {
      const updated = [timestamped, ...prev.filter((p) => p.id !== timestamped.id)];
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(updated));
      }
      saveCloudProducts(updated);
      return updated;
    });
  };

  const updateProduct = (updatedProduct: Product) => {
    soundFx.playSuccess();
    const timestamped = { ...updatedProduct, updatedAt: Date.now() };

    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === timestamped.id ? timestamped : p));
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(updated));
      }
      saveCloudProducts(updated);
      return updated;
    });

    // Update corresponding stock movements to keep Unsettled Sales Breakdown in sync
    setStockMovements((prevMovements) => {
      const updatedMovements = prevMovements.map((m) => {
        if (m.productId === updatedProduct.id || m.productTitle === updatedProduct.title) {
          const matchedVariant = updatedProduct.variants.find(
            (v) => v.id === m.variantId || v.name === m.variantName
          );
          const newCost = matchedVariant?.costPrice !== undefined && matchedVariant.costPrice > 0
            ? matchedVariant.costPrice
            : m.costPrice;
          return {
            ...m,
            productTitle: updatedProduct.title,
            variantName: matchedVariant?.name || m.variantName,
            costPrice: newCost,
            totalCost: newCost * m.quantity,
          };
        }
        return m;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_stock_movements', JSON.stringify(updatedMovements));
      }
      return updatedMovements;
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
          return { ...p, variants: updatedVariants, updatedAt: now };
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
    soundFx.playDelete();
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
        stockMovements,
        supplierSettlements,
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
        isSoundMuted,
        toggleSound,
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
        recordStockIn,
        createSupplierSettlement,
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
