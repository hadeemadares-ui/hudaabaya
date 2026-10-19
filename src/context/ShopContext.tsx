'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, ProductVariant, CartItem, Order, CategoryType, Coupon, StoreSettings, CurrencyType, StockMovement, SupplierSettlement, EventSchedule, CustomOptions, RealtimeSyncPayload } from '../types';
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
  saveCloudSettings,
  fetchRealtimeSync,
  pushRealtimeSync,
} from '../lib/cloudStorage';
import {
  sendLineNotification,
  formatNewOrderMessage,
  formatSlipUploadMessage,
  formatLowStockMessage,
} from '../lib/lineNotification';
import { sortProductsNatural } from '../utils/productUtils';

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
  googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1WA1_fnTBdXe-ykTBNr1yOt3815uy-0hguA3n1kYDzkg/edit?gid=0#gid=0',
  googleSheetLastSync: '',
  lineNotifyEnabled: true,
  lineChannelId: '2011949895',
  lineChannelSecret: '45811e9faeabea629c67ebcbb52d8236',
  lineNotifyToken: 'F5oQJACUmI8/SB64i2W+SPKwCnUVTCIfA5fAbdiW3KqjiaVa7rZ3ikE2rjoeROJ6CdGtlw+Fm/4wv7PnCbIVHnigM+j9mT4V6UqbSwOJRqLFQAWPLqwDHFqzrqTIbcVUI4QXjau+CL7JsfCxxSHuFo9PbdgDzCFqoOLOYbqAITQ=',
  lineNotifyOnNewOrder: true,
  lineNotifyOnSlipUpload: true,
  lineNotifyOnLowStock: true,
  lineNotifyOnDailySummary: true,
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
  deleteStockMovement: (movementId: string, revertStock?: boolean) => boolean;
  createSupplierSettlement: (data: { supplierName: string; periodStart: string; periodEnd: string; movementIds: string[]; paymentRef?: string; note?: string; slipImageUrl?: string }) => SupplierSettlement;
  setIsCartOpen: (open: boolean) => void;
  setIsOrderTrackingOpen: (open: boolean) => void;
  setIsAdminMode: (admin: boolean) => void;
  setIsAdminAuthenticated: (auth: boolean) => void;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  verifyAdminPasscode: (passcode: string) => boolean;
  logoutAdmin: () => void;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => void;
  syncStoreSettings: () => Promise<void>;
  syncOrders: () => Promise<void>;
  syncProducts: () => Promise<void>;
  syncFromGoogleSheet: (url?: string) => Promise<{ success: boolean; count: number; error?: string; message?: string }>;
  testLineNotification: (customMsg?: string) => Promise<{ success: boolean; error?: string }>;
  clearBrowserCacheAndReload: () => Promise<void>;
  eventSchedules: EventSchedule[];
  eventBranches: string[];
  setEventSchedules: React.Dispatch<React.SetStateAction<EventSchedule[]>>;
  setEventBranches: React.Dispatch<React.SetStateAction<string[]>>;
  addEventSchedule: (schedule: EventSchedule) => void;
  updateEventSchedule: (schedule: EventSchedule) => void;
  deleteEventSchedule: (scheduleId: string) => void;
  addEventBranch: (branchName: string) => void;
  deleteEventBranch: (branchName: string) => void;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncTime: number;
  forceRealtimeSync: () => Promise<void>;
  customOptions: CustomOptions;
  saveCustomOption: (type: keyof CustomOptions, value: any) => void;
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
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
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

  // Event Market & Branches State (Realtime multi-device sync)
  const [eventBranches, setEventBranches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_event_branches');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return [
      'HUDA ABAYA - สาขาใหญ่ หนองจอก',
      'HUDA ABAYA - บูธ/ตลาดนัดคลอง16',
    ];
  });

  const [eventSchedules, setEventSchedules] = useState<EventSchedule[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_event_schedules');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
    }
    return [
      {
        id: 'EVENT-KLONG16-001',
        title: 'ออกบูธตลาดนัดคลอง 16 (HUDA ABAYA Pop-up)',
        branchName: 'HUDA ABAYA - บูธ/ตลาดนัดคลอง16',
        location: 'ตลาดนัดคลอง 16',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        operatingHours: '10:00 - 22:00 น.',
        productsToPrepare: 'ชุดอาบายะห์ดูไบ • คัฟทาน • น้ำหอมดูไบ & Oud',
        phonePromptPay: '083-427-4687',
        status: 'ACTIVE',
        salesTarget: 30000,
        actualSales: 0,
        assignedStaff: 'เจ้าของร้าน (Admin)',
        rentalFee: 1500,
        depositAmount: 500,
        googleMapsUrl: 'https://maps.google.com/?q=ตลาดนัดคลอง16',
        note: 'คำนวณเตรียมสต๊อกอาบายะห์ 100 ชุด และน้ำหอมดูไบ EDP 50 ขวด',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  // Real-Time Multi-Device Sync Indicators & Refs
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [customOptions, setCustomOptions] = useState<CustomOptions>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSuppliers = localStorage.getItem('huda_custom_suppliers');
        const savedNotes = localStorage.getItem('huda_custom_stock_in_notes');
        const savedCategories = localStorage.getItem('huda_custom_category_list_v1');
        const savedFabrics = localStorage.getItem('huda_category_fabric_map_v3');
        const savedSizes = localStorage.getItem('huda_category_size_map_v1');
        const savedColors = localStorage.getItem('huda_category_color_map_v1');
        const savedDesc = localStorage.getItem('huda_custom_description_options_v1');
        return {
          suppliers: savedSuppliers ? JSON.parse(savedSuppliers) : [],
          stockInNotes: savedNotes ? JSON.parse(savedNotes) : [],
          categories: savedCategories ? JSON.parse(savedCategories) : [],
          fabrics: savedFabrics ? JSON.parse(savedFabrics) : {},
          sizes: savedSizes ? JSON.parse(savedSizes) : {},
          colors: savedColors ? JSON.parse(savedColors) : {},
          descriptions: savedDesc ? JSON.parse(savedDesc) : [],
        };
      } catch (e) {}
    }
    return {};
  });

  const syncVersionRef = useRef<number>(0);
  const isSyncingRef = useRef<boolean>(false);
  const syncChannelRef = useRef<BroadcastChannel | null>(null);
  const pushTimeoutRef = useRef<any>(null);
  const pendingPushPayloadRef = useRef<Partial<RealtimeSyncPayload>>({});

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

  const triggerBackgroundPush = (payload: Partial<RealtimeSyncPayload>) => {
    pendingPushPayloadRef.current = {
      ...pendingPushPayloadRef.current,
      ...payload,
    };
    if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
    pushTimeoutRef.current = setTimeout(async () => {
      const toSend = { ...pendingPushPayloadRef.current };
      pendingPushPayloadRef.current = {};
      try {
        const newVer = await pushRealtimeSync(toSend);
        if (newVer) {
          syncVersionRef.current = newVer;
          setLastSyncTime(Date.now());
          setSyncStatus('synced');
          try {
            syncChannelRef.current?.postMessage({ type: 'SYNC_NOW' });
          } catch (e) {}
        }
      } catch (e) {
        console.warn('Realtime push notice:', e);
      }
    }, 150);
  };

  async function forceRealtimeSync() {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setSyncStatus('syncing');

    try {
      const data = await fetchRealtimeSync(syncVersionRef.current);
      if (data?.success) {
        setSyncStatus('synced');
        setLastSyncTime(Date.now());

        if (data.upToDate) {
          isSyncingRef.current = false;
          return;
        }

        if (typeof data.version === 'number' && data.version > 0) {
          syncVersionRef.current = data.version;
        }

        // Merge Products with Conflict Resolution (protect local stock changes)
        if (Array.isArray(data.products) && data.products.length > 0) {
          const cloudProducts = data.products;
          const cloudDeleted = Array.isArray(data.deletedIds) ? new Set(data.deletedIds) : new Set<string>();

          setProducts((currentLocalProds) => {
            const localMap = new Map<string, Product>();
            currentLocalProds.forEach((p) => localMap.set(p.id, p));

            const mergedList: Product[] = [];
            const processedIds = new Set<string>();

            cloudProducts.forEach((cloudProd: Product) => {
              if (cloudDeleted.has(cloudProd.id)) return;
              processedIds.add(cloudProd.id);

              const localProd = localMap.get(cloudProd.id);
              if (!localProd) {
                mergedList.push(cloudProd);
              } else {
                const localUpdated = Number(localProd.updatedAt) || 0;
                const cloudUpdated = Number(cloudProd.updatedAt) || 0;

                const mergedVariants = (cloudProd.variants || []).map((cv) => {
                  const lv = localProd.variants?.find((v) => v.id === cv.id);
                  if (!lv) return cv;
                  const lvTime = Number(lv.updatedAt) || localUpdated;
                  const cvTime = Number(cv.updatedAt) || cloudUpdated;

                  // If local variant was updated more recently or has higher stock from recent stock-in, protect it!
                  if (lvTime > cvTime || lv.stockQuantity > cv.stockQuantity) {
                    return lv;
                  }
                  return cv;
                });

                if (localProd.variants) {
                  localProd.variants.forEach((lv) => {
                    if (!mergedVariants.some((v) => v.id === lv.id)) {
                      mergedVariants.push(lv);
                    }
                  });
                }

                mergedList.push({
                  ...(localUpdated > cloudUpdated ? localProd : cloudProd),
                  variants: mergedVariants,
                });
              }
            });

            currentLocalProds.forEach((localProd) => {
              if (!processedIds.has(localProd.id) && !cloudDeleted.has(localProd.id)) {
                mergedList.push(localProd);
              }
            });

            const finalSorted = mergedList.sort(sortProductsNatural);
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('huda_products', JSON.stringify(finalSorted));
              } catch (e) {}
            }
            return finalSorted;
          });
        }

        if (Array.isArray(data.deletedIds)) {
          setDeletedProductIds(new Set(data.deletedIds));
          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_deleted_product_ids', JSON.stringify(data.deletedIds));
          }
        }

        // Merge Orders
        if (Array.isArray(data.orders)) {
          const cloudDeletedOrders = Array.isArray(data.deletedOrderIds) ? new Set(data.deletedOrderIds) : new Set<string>();
          const validOrders = data.orders.filter((o: Order) => !cloudDeletedOrders.has(o.id));
          setOrders(validOrders);
          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_orders', JSON.stringify(validOrders));
          }
        }

        if (Array.isArray(data.deletedOrderIds)) {
          setDeletedOrderIds(new Set(data.deletedOrderIds));
          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_deleted_order_ids', JSON.stringify(data.deletedOrderIds));
          }
        }

        // Merge Stock Movements (smart merge preserving un-synced local records)
        if (Array.isArray(data.stockMovements) && data.stockMovements.length > 0) {
          setStockMovements((prev) => {
            const movMap = new Map<string, StockMovement>();
            (data.stockMovements || []).forEach((m: StockMovement) => movMap.set(m.id, m));
            prev.forEach((m) => {
              if (!movMap.has(m.id)) {
                movMap.set(m.id, m);
              }
            });
            const merged = Array.from(movMap.values()).sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            if (typeof window !== 'undefined') {
              localStorage.setItem('huda_stock_movements', JSON.stringify(merged));
            }
            return merged;
          });
        } else if (stockMovements.length > 0) {
          triggerBackgroundPush({ stockMovements });
        }

        // Merge Supplier Settlements (smart merge preserving un-synced local records)
        if (Array.isArray(data.supplierSettlements) && data.supplierSettlements.length > 0) {
          setSupplierSettlements((prev) => {
            const setMap = new Map<string, SupplierSettlement>();
            (data.supplierSettlements || []).forEach((s: SupplierSettlement) => setMap.set(s.id, s));
            prev.forEach((s) => {
              if (!setMap.has(s.id)) {
                setMap.set(s.id, s);
              }
            });
            const merged = Array.from(setMap.values()).sort(
              (a, b) => new Date(b.settledAt || 0).getTime() - new Date(a.settledAt || 0).getTime()
            );
            if (typeof window !== 'undefined') {
              localStorage.setItem('huda_supplier_settlements', JSON.stringify(merged));
            }
            return merged;
          });
        } else if (supplierSettlements.length > 0) {
          triggerBackgroundPush({ supplierSettlements });
        }

        // Merge Event Schedules
        if (Array.isArray(data.eventSchedules) && data.eventSchedules.length > 0) {
          setEventSchedules(data.eventSchedules);
          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_event_schedules', JSON.stringify(data.eventSchedules));
          }
        } else if (eventSchedules.length > 0) {
          triggerBackgroundPush({ eventSchedules, eventBranches });
        }

        // Merge Event Branches
        if (Array.isArray(data.eventBranches) && data.eventBranches.length > 0) {
          setEventBranches(data.eventBranches);
          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_event_branches', JSON.stringify(data.eventBranches));
          }
        }

        // Merge Settings
        if (data.settings && typeof data.settings === 'object') {
          setStoreSettings((prev) => {
            const updated = { ...DEFAULT_SETTINGS, ...prev, ...data.settings };
            if (typeof window !== 'undefined') {
              localStorage.setItem('huda_store_settings', JSON.stringify(updated));
            }
            return updated;
          });
        }

        // Merge Custom Options
        if (data.customOptions && typeof data.customOptions === 'object') {
          setCustomOptions((prev) => {
            const updated: CustomOptions = {
              suppliers: data.customOptions?.suppliers || prev.suppliers || [],
              stockInNotes: data.customOptions?.stockInNotes || prev.stockInNotes || [],
              categories: data.customOptions?.categories || prev.categories || [],
              fabrics: data.customOptions?.fabrics || prev.fabrics || {},
              sizes: data.customOptions?.sizes || prev.sizes || {},
              colors: data.customOptions?.colors || prev.colors || {},
              descriptions: data.customOptions?.descriptions || prev.descriptions || [],
            };
            if (typeof window !== 'undefined') {
              if (updated.suppliers) localStorage.setItem('huda_custom_suppliers', JSON.stringify(updated.suppliers));
              if (updated.stockInNotes) localStorage.setItem('huda_custom_stock_in_notes', JSON.stringify(updated.stockInNotes));
              if (updated.categories) localStorage.setItem('huda_custom_category_list_v1', JSON.stringify(updated.categories));
              if (updated.fabrics) localStorage.setItem('huda_category_fabric_map_v3', JSON.stringify(updated.fabrics));
              if (updated.sizes) localStorage.setItem('huda_category_size_map_v1', JSON.stringify(updated.sizes));
              if (updated.colors) localStorage.setItem('huda_category_color_map_v1', JSON.stringify(updated.colors));
              if (updated.descriptions) localStorage.setItem('huda_custom_description_options_v1', JSON.stringify(updated.descriptions));
            }
            return updated;
          });
        }
      } else {
        // Fallback to legacy individual sync endpoints if /api/sync is not available yet
        await Promise.allSettled([syncProducts(), syncOrders(), syncStoreSettings()]);
        setSyncStatus('synced');
      }
    } catch (e) {
      setSyncStatus('error');
    } finally {
      isSyncingRef.current = false;
    }
  }

  const addEventSchedule = (schedule: EventSchedule) => {
    soundFx.playSuccess();
    setEventSchedules((prev) => {
      const updated = [schedule, ...prev.filter((s) => s.id !== schedule.id)];
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_event_schedules', JSON.stringify(updated));
      }
      triggerBackgroundPush({ eventSchedules: updated });
      return updated;
    });
  };

  const updateEventSchedule = (schedule: EventSchedule) => {
    soundFx.playSuccess();
    setEventSchedules((prev) => {
      const updated = prev.map((s) => (s.id === schedule.id ? schedule : s));
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_event_schedules', JSON.stringify(updated));
      }
      triggerBackgroundPush({ eventSchedules: updated });
      return updated;
    });
  };

  const deleteEventSchedule = (scheduleId: string) => {
    soundFx.playDelete();
    setEventSchedules((prev) => {
      const updated = prev.filter((s) => s.id !== scheduleId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_event_schedules', JSON.stringify(updated));
      }
      triggerBackgroundPush({ eventSchedules: updated });
      return updated;
    });
  };

  const addEventBranch = (branchName: string) => {
    soundFx.playSuccess();
    const clean = branchName.trim();
    if (!clean) return;
    setEventBranches((prev) => {
      if (prev.includes(clean)) return prev;
      const updated = [...prev, clean];
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_event_branches', JSON.stringify(updated));
      }
      triggerBackgroundPush({ eventBranches: updated });
      return updated;
    });
  };

  const deleteEventBranch = (branchName: string) => {
    soundFx.playDelete();
    setEventBranches((prev) => {
      const updated = prev.filter((b) => b !== branchName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_event_branches', JSON.stringify(updated));
      }
      triggerBackgroundPush({ eventBranches: updated });
      return updated;
    });
  };

  const handleSetEventSchedules: React.Dispatch<React.SetStateAction<EventSchedule[]>> = (valueOrUpdater) => {
    setEventSchedules((prev) => {
      const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_event_schedules', JSON.stringify(next));
      }
      triggerBackgroundPush({ eventSchedules: next });
      return next;
    });
  };

  const handleSetEventBranches: React.Dispatch<React.SetStateAction<string[]>> = (valueOrUpdater) => {
    setEventBranches((prev) => {
      const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_event_branches', JSON.stringify(next));
      }
      triggerBackgroundPush({ eventBranches: next });
      return next;
    });
  };

  const saveCustomOption = (type: keyof CustomOptions, value: any) => {
    setCustomOptions((prev) => {
      const updated = { ...prev, [type]: value };
      if (typeof window !== 'undefined') {
        const storageKeys: Record<keyof CustomOptions, string> = {
          suppliers: 'huda_custom_suppliers',
          stockInNotes: 'huda_custom_stock_in_notes',
          categories: 'huda_custom_category_list_v1',
          fabrics: 'huda_category_fabric_map_v3',
          sizes: 'huda_category_size_map_v1',
          colors: 'huda_category_color_map_v1',
          descriptions: 'huda_custom_description_options_v1',
        };
        const key = storageKeys[type];
        if (key) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }
      triggerBackgroundPush({ customOptions: updated });
      return updated;
    });
  };

  // Initial load & URL admin parameter check with Product & Logo Memory Fallback
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlPass = params.get('passcode') || params.get('pin') || params.get('pass');
        const validPass = storeSettings.adminPasscode || '1077';
        const isUrlAuth = urlPass === validPass || urlPass === '1077';

        // Ensure stale admin auth is cleared so entering backoffice strictly requires passcode every time
        localStorage.removeItem('huda_admin_authenticated');
        sessionStorage.removeItem('huda_admin_authenticated');

        if (isUrlAuth) {
          setIsAdminAuthenticated(true);
          setIsAdminMode(true);
        } else {
          setIsAdminAuthenticated(false);
          setIsAdminMode(false);
        }

        const isAdminQuery = params.get('admin') === 'true' || params.get('mode') === 'admin' || params.get('backoffice') === 'true';
        const isReportQuery = params.get('tab') === 'reports' || params.get('report') === 'true' || params.get('analytics') === 'true' || params.get('sales') === 'true';
        
        if (!isUrlAuth && (isAdminQuery || isReportQuery)) {
          setIsAdminLoginModalOpen(true);
        }

        // Restore and auto-upgrade saved products to full 78 master catalog with pristine CDN images
        const CURRENT_CATALOG_VERSION = 'v_78_stock_sync_v5';
        const savedProds = localStorage.getItem('huda_products');
        const catalogVer = localStorage.getItem('huda_catalog_version');

        const masterMap = new Map<string, Product>();
        INITIAL_PRODUCTS.forEach((p) => masterMap.set(p.id, p));

        if (savedProds && catalogVer === CURRENT_CATALOG_VERSION) {
          try {
            const parsedProds = JSON.parse(savedProds);
            if (Array.isArray(parsedProds) && parsedProds.length > 0) {
              // Sanitize: ensure no product uses old base64 or broken image
              const sanitized = parsedProds.map((p: Product) => {
                const master = masterMap.get(p.id);
                const isBadImage = !p.images || !p.images[0] || p.images[0].startsWith('data:image') || p.images[0].length > 500;
                if (isBadImage && master) {
                  return { ...p, images: master.images };
                }
                return p;
              });
              setProducts(sanitized.sort(sortProductsNatural));
            } else {
              setProducts(INITIAL_PRODUCTS);
              try {
                localStorage.setItem('huda_products', JSON.stringify(INITIAL_PRODUCTS));
                localStorage.setItem('huda_catalog_version', CURRENT_CATALOG_VERSION);
              } catch (e) {}
            }
          } catch (e) {
            setProducts(INITIAL_PRODUCTS);
            try {
              localStorage.setItem('huda_products', JSON.stringify(INITIAL_PRODUCTS));
              localStorage.setItem('huda_catalog_version', CURRENT_CATALOG_VERSION);
            } catch (e) {}
          }
        } else {
          // Fresh device or upgrade from older base64 cache:
          // Preserve custom user products and customizations, but enforce clean CDN images!
          const mergedMap = new Map<string, Product>();
          INITIAL_PRODUCTS.forEach((p) => mergedMap.set(p.id, p));
          if (savedProds) {
            try {
              const oldProds = JSON.parse(savedProds);
              if (Array.isArray(oldProds)) {
                oldProds.forEach((p: Product) => {
                  const master = masterMap.get(p.id);
                  if (master) {
                    const mergedVariants = master.variants.map((mv) => {
                      const ov = (p.variants || []).find((v: ProductVariant) => v.id === mv.id);
                      if (!ov) return mv;
                      const ovStock = typeof ov.stockQuantity === 'number' && !isNaN(ov.stockQuantity) ? ov.stockQuantity : 0;
                      const mvStock = typeof mv.stockQuantity === 'number' && !isNaN(mv.stockQuantity) ? mv.stockQuantity : 0;
                      return {
                        ...mv,
                        price: typeof ov.price === 'number' && ov.price > 0 ? ov.price : mv.price,
                        costPrice: typeof ov.costPrice === 'number' && ov.costPrice > 0 ? ov.costPrice : mv.costPrice,
                        stockQuantity: Math.max(ovStock, mvStock),
                        updatedAt: Math.max(Number(ov.updatedAt) || 0, Number(mv.updatedAt) || 0),
                      };
                    });
                    mergedMap.set(p.id, {
                      ...master,
                      costPrice: typeof p.costPrice === 'number' ? p.costPrice : master.costPrice,
                      variants: mergedVariants,
                      images: master.images, // ALWAYS enforce pristine, uncorrupted CDN image files
                    });
                  } else {
                    // Custom user-added product
                    mergedMap.set(p.id, p);
                  }
                });
              }
            } catch (e) {}
          }
          const finalMerged = Array.from(mergedMap.values()).sort(sortProductsNatural);
          setProducts(finalMerged);
          try {
            localStorage.setItem('huda_products', JSON.stringify(finalMerged));
            localStorage.setItem('huda_catalog_version', CURRENT_CATALOG_VERSION);
          } catch (e) {}
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

      // Multi-device and cross-tab realtime sync initialization
      try {
        if ('BroadcastChannel' in window) {
          syncChannelRef.current = new BroadcastChannel('huda_realtime_sync_channel');
          syncChannelRef.current.onmessage = (event) => {
            if (event.data?.type === 'SYNC_NOW') {
              forceRealtimeSync();
            }
          };
        }
      } catch (e) {}

      // Initial immediate fetch
      forceRealtimeSync();

      // Continuous 2.5s polling loop for instant cross-device updates (Mobile, Tablet, Desktop)
      const syncInterval = setInterval(() => {
        forceRealtimeSync();
      }, 2500);

      const handleVisibilityChange = () => {
        if (!document.hidden) forceRealtimeSync();
      };
      const handleWindowFocus = () => forceRealtimeSync();
      const handleOnline = () => forceRealtimeSync();

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleWindowFocus);
      window.addEventListener('online', handleOnline);

      return () => {
        clearInterval(syncInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleWindowFocus);
        window.removeEventListener('online', handleOnline);
        try { syncChannelRef.current?.close(); } catch (e) {}
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
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setIsAdminMode(false);
    setIsAdminLoginModalOpen(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('huda_admin_authenticated');
      localStorage.removeItem('huda_admin_authenticated');
    }
  };

  useEffect(() => {
    localStorage.setItem('huda_cart', JSON.stringify(cart));
  }, [cart]);

  async function syncProducts() {
    try {
      const [cloudProds, cloudDeletedArr] = await Promise.all([
        fetchCloudProducts(),
        fetchCloudDeletedIds(),
      ]);

      const deletedSet = new Set<string>(cloudDeletedArr || []);

      setProducts((prev) => {
        let cleanCloudProds = (cloudProds || []).filter((p) => !deletedSet.has(p.id));

        if (cleanCloudProds.length > 0) {
          cleanCloudProds.sort(sortProductsNatural);
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
          const fallbackProds = candidate.filter((p) => !deletedSet.has(p.id)).sort(sortProductsNatural);

          if (fallbackProds.length > 0) {
            saveCloudProducts(fallbackProds);
            if (typeof window !== 'undefined') {
              localStorage.setItem('huda_products', JSON.stringify(fallbackProds));
            }
            return fallbackProds;
          }

          return prev.length > 0 ? prev : [];

          return [];
        }
      });
    } catch (e) {
      console.warn('Sync products notice:', e);
    }
  };

  const syncFromGoogleSheet = async (sheetUrl?: string): Promise<{ success: boolean; count: number; error?: string; message?: string }> => {
    const targetUrl = (sheetUrl || storeSettings.googleSheetUrl || 'https://docs.google.com/spreadsheets/d/1WA1_fnTBdXe-ykTBNr1yOt3815uy-0hguA3n1kYDzkg/edit?gid=0#gid=0').trim();
    if (!targetUrl) {
      return { success: false, count: 0, error: 'กรุณาระบุลิงก์ Google Sheets' };
    }

    try {
      // 1. Convert any Google Sheet URL to direct CSV export URL
      let csvUrl = targetUrl;
      const sheetIdMatch = targetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (sheetIdMatch && sheetIdMatch[1]) {
        const sheetId = sheetIdMatch[1];
        const gidMatch = targetUrl.match(/[?&#]gid=([0-9]+)/);
        const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
        csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
      }

      // 2. Fetch CSV text with fallback
      let csvText = '';
      try {
        const res = await fetch(csvUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        csvText = await res.text();
      } catch (err1) {
        if (sheetIdMatch && sheetIdMatch[1]) {
          try {
            const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetIdMatch[1]}/gviz/tq?tqx=out:csv`;
            const resGviz = await fetch(gvizUrl);
            if (resGviz.ok) {
              csvText = await resGviz.text();
            }
          } catch (e) {}
        }
        if (!csvText) {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(csvUrl)}`;
          const resProxy = await fetch(proxyUrl);
          if (!resProxy.ok) throw new Error(`ไม่สามารถเข้าถึง Google Sheets ได้ (${err1})`);
          csvText = await resProxy.text();
        }
      }

      if (!csvText || csvText.trim().length === 0) {
        return { success: false, count: 0, error: 'ไม่พบข้อมูลในตาราง Google Sheets หรือไฟล์ว่างเปล่า' };
      }

      // 3. RFC4180 CSV parser
      const parseCSV = (t: string): string[][] => {
        const lines: string[][] = [];
        let row: string[] = [''];
        let inQuotes = false;
        for (let i = 0; i < t.length; i++) {
          const c = t[i];
          const next = t[i + 1];
          if (c === '"') {
            if (inQuotes && next === '"') {
              row[row.length - 1] += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (c === ',' && !inQuotes) {
            row.push('');
          } else if ((c === '\r' || c === '\n') && !inQuotes) {
            if (c === '\r' && next === '\n') i++;
            lines.push(row);
            row = [''];
          } else {
            row[row.length - 1] += c;
          }
        }
        if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
          lines.push(row);
        }
        return lines;
      };

      const rows = parseCSV(csvText);
      if (rows.length < 2) {
        return { success: false, count: 0, error: 'Google Sheet มีเฉพาะหัวตาราง ยังไม่มีแถวข้อมูลสินค้า' };
      }

      const header = rows[0].map((h) => h.trim().toLowerCase());
      const findCol = (keys: string[]) => header.findIndex((h) => keys.some((k) => h === k || h.includes(k)));

      const idCol = findCol(['id', 'code', 'productid', 'รหัส', 'sku']);
      const titleCol = findCol(['title', 'name', 'productname', 'ชื่อ', 'ชื่อสินค้า']);
      const catCol = findCol(['category', 'cat', 'หมวด', 'หมวดหมู่']);
      const descCol = findCol(['description', 'desc', 'รายละเอียด']);
      const fabricCol = findCol(['fabric', 'เนื้อผ้า', 'ผ้า']);
      const imageCol = findCol(['image', 'images', 'img', 'รูป', 'รูปภาพ']);
      const sizeCol = findCol(['sizename', 'size', 'variant', 'ไซส์', 'ขนาด', 'ตัวเลือก']);
      const priceCol = findCol(['price', 'ราคา', 'ราคาขาย']);
      const stockCol = findCol(['stock', 'qty', 'quantity', 'สต๊อก', 'คงเหลือ']);
      const costCol = findCol(['costprice', 'cost', 'ทุน', 'ต้นทุน']);
      const colorCol = findCol(['color', 'สี']);

      const productMap = new Map<string, Product>();

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0 || row.every((c) => c.trim() === '')) continue;

        const rawId = (idCol >= 0 ? row[idCol] : '')?.trim();
        const rawTitle = (titleCol >= 0 ? row[titleCol] : '')?.trim();
        if (!rawId && !rawTitle) continue;

        const id = rawId || `prod-${r}`;
        const title = rawTitle || `สินค้า ${id}`;

        let rawCat = (catCol >= 0 ? row[catCol] : '')?.trim().toLowerCase();
        let cat: CategoryType = 'abaya';
        if (['abaya', 'kaftan', 'perfume', 'incense', 'combo', 'other'].includes(rawCat)) {
          cat = rawCat as CategoryType;
        } else if (rawCat.includes('อาบายะห์')) cat = 'abaya';
        else if (rawCat.includes('คัฟทาน')) cat = 'kaftan';
        else if (rawCat.includes('น้ำหอม') || rawCat.includes('oud') || rawCat.includes('perfume')) cat = 'perfume';
        else if (rawCat.includes('เครื่องหอม') || rawCat.includes('bukhoor')) cat = 'incense';
        else if (rawCat.includes('เซ็ต') || rawCat.includes('combo')) cat = 'combo';
        else cat = 'other';

        const desc = (descCol >= 0 ? row[descCol] : '')?.trim() || '';
        const fabric = (fabricCol >= 0 ? row[fabricCol] : '')?.trim() || (cat === 'perfume' ? 'Dubai Oud Pure Oil' : 'Nida Silk Dubai');
        const imgUrl = (imageCol >= 0 ? row[imageCol] : '')?.trim();

        const sizeName = (sizeCol >= 0 ? row[sizeCol] : '')?.trim() || 'มาตรฐาน (Standard)';
        const priceNum = (priceCol >= 0 ? parseFloat(row[priceCol].replace(/[^0-9.]/g, '')) : 0) || 0;
        const stockNum = (stockCol >= 0 ? parseInt(row[stockCol].replace(/[^0-9-]/g, ''), 10) : 0) || 0;
        const costNum = (costCol >= 0 && row[costCol]?.trim() ? parseFloat(row[costCol].replace(/[^0-9.]/g, '')) : Math.round(priceNum * 0.5));
        const colorVal = (colorCol >= 0 ? row[colorCol] : '')?.trim();

        if (!productMap.has(id)) {
          const existing = products.find((p) => p.id === id);
          productMap.set(id, {
            id,
            title,
            category: cat,
            description: desc || existing?.description || '',
            fabric: fabric || existing?.fabric || '',
            images: imgUrl
              ? [imgUrl, ...(existing?.images?.filter((im) => im !== imgUrl) || [])]
              : (existing?.images && existing.images.length > 0 ? existing.images : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop']),
            variants: [],
            arabicTitle: existing?.arabicTitle,
            origin: existing?.origin || 'Dubai, UAE',
            has3DView: existing?.has3DView ?? (cat === 'perfume' || cat === 'abaya'),
            hasARFit: existing?.hasARFit ?? (cat === 'abaya'),
            fragranceNotes: existing?.fragranceNotes,
            colors: existing?.colors,
            rating: existing?.rating ?? 5,
            reviewsCount: existing?.reviewsCount ?? 1,
            updatedAt: Date.now(),
          });
        }

        const prod = productMap.get(id)!;
        if (imgUrl && !prod.images.includes(imgUrl)) {
          prod.images.push(imgUrl);
        }

        const variantIndex = prod.variants.length + 1;
        const variantId = `${id}-var-${variantIndex}`;

        prod.variants.push({
          id: variantId,
          name: sizeName,
          sku: `${id.toUpperCase()}-${variantIndex}`,
          price: priceNum,
          costPrice: costNum,
          stockQuantity: Math.max(0, stockNum),
          color: colorVal || (cat === 'perfume' ? 'กลิ่นดูไบออริจินัล' : 'สีดำ (Black)'),
          updatedAt: Date.now(),
        });
      }

      const syncedProducts = Array.from(productMap.values());
      if (syncedProducts.length === 0) {
        return { success: false, count: 0, error: 'ไม่พบรายการสินค้าที่ถูกต้องใน Google Sheet' };
      }

      const syncedIds = new Set(syncedProducts.map((p) => p.id));
      const nonSyncedExisting = products.filter((p) => !syncedIds.has(p.id));
      const mergedList = [...syncedProducts, ...nonSyncedExisting].sort(sortProductsNatural);

      setProducts(mergedList);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(mergedList));
      }
      saveCloudProducts(mergedList);

      const nowTh = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Bangkok' });
      const syncTimeStr = `${new Date().toLocaleDateString('th-TH')} เวลา ${nowTh} น.`;

      const updatedSettings: StoreSettings = {
        ...storeSettings,
        googleSheetUrl: targetUrl,
        googleSheetLastSync: syncTimeStr,
      };
      setStoreSettings(updatedSettings);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_store_settings', JSON.stringify(updatedSettings));
      }
      saveCloudSettings(updatedSettings);
      triggerBackgroundPush({ products: mergedList, settings: updatedSettings });

      soundFx.playSuccess();

      const totalVariants = syncedProducts.reduce((sum, p) => sum + p.variants.length, 0);
      return {
        success: true,
        count: syncedProducts.length,
        message: `ซิงก์สำเร็จ! ดึงสินค้า ${syncedProducts.length} รายการ (${totalVariants} ตัวเลือกไซส์/สต๊อก) จาก Google Sheet เข้าสู่คลังและหน้าร้านเรียบร้อยแล้ว`,
      };
    } catch (error: any) {
      console.error('Google Sheet Sync Error:', error);
      return {
        success: false,
        count: 0,
        error: error?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets',
      };
    }
  };

  async function syncOrders() {
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
  }

  async function syncStoreSettings() {
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
      triggerBackgroundPush({ settings: updated });
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

    let updatedProductsList: Product[] = [];
    setProducts((prevProducts) => {
      updatedProductsList = prevProducts.map((prod) => {
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

    let updatedOrdersList: Order[] = [];
    setOrders((prev) => {
      updatedOrdersList = [newOrder, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_orders', JSON.stringify(updatedOrdersList));
      }
      saveCloudOrders(updatedOrdersList);
      return updatedOrdersList;
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

    let updatedMovementsList: StockMovement[] = [];
    setStockMovements((prev) => {
      updatedMovementsList = [...newStockOutMovements, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_stock_movements', JSON.stringify(updatedMovementsList));
      }
      return updatedMovementsList;
    });

    triggerBackgroundPush({
      products: updatedProductsList,
      orders: updatedOrdersList,
      stockMovements: updatedMovementsList,
    });

    clearCart();

    // Auto-dispatch LINE Notification for New Order
    if (storeSettings.lineNotifyOnNewOrder !== false) {
      try {
        sendLineNotification(formatNewOrderMessage(newOrder), storeSettings).catch(() => {});
      } catch (e) {}
    }

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
    soundFx.playSuccess();
    const now = Date.now();
    let productTitle = 'สินค้า';
    let variantName = 'ไซส์/รายการ';
    let calculatedNewStock = 0;

    // 1. Atomically and immediately update products state & local storage
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === data.productId) {
          productTitle = p.title;
          const updatedVariants = p.variants.map((v) => {
            if (v.id === data.variantId) {
              variantName = v.name;
              const currentStock = (typeof v.stockQuantity === 'number' && !isNaN(v.stockQuantity)) ? v.stockQuantity : 0;
              calculatedNewStock = Math.max(0, currentStock + data.quantity);
              const updatedCost = data.costPrice > 0 ? data.costPrice : v.costPrice;
              return {
                ...v,
                stockQuantity: calculatedNewStock,
                costPrice: updatedCost,
                updatedAt: now,
              };
            }
            return v;
          });
          return { ...p, variants: updatedVariants, updatedAt: now };
        }
        return p;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(updated));
        window.dispatchEvent(
          new CustomEvent('huda_stock_in_completed', {
            detail: {
              productId: data.productId,
              variantId: data.variantId,
              quantity: data.quantity,
              newStock: calculatedNewStock,
            },
          })
        );
      }
      saveCloudProducts(updated);
      triggerBackgroundPush({ products: updated });
      return updated;
    });

    // 2. Record Stock Movement Log
    const newMovement: StockMovement = {
      id: `MOV-IN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'IN',
      productId: data.productId,
      productTitle: productTitle,
      variantId: data.variantId,
      variantName: variantName,
      quantity: data.quantity,
      costPrice: data.costPrice,
      totalCost: data.costPrice * data.quantity,
      supplierName: data.supplierName || 'โรงงานอาบายะห์ดูไบ',
      note: data.note || 'บันทึกรับสินค้าเข้าสต๊อก (Stock In)',
      performedBy: 'ผู้ดูแลระบบหลังบ้าน',
      createdAt: new Date().toISOString(),
      isSettled: true,
    };

    setStockMovements((prev) => {
      const updated = [newMovement, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_stock_movements', JSON.stringify(updated));
      }
      triggerBackgroundPush({ stockMovements: updated });
      return updated;
    });
  };

  const deleteStockMovement = (movementId: string, revertStock: boolean = true): boolean => {
    soundFx.playDelete();
    const targetMovement = stockMovements.find((m) => m.id === movementId);

    let updatedProductsOnDelete: Product[] | null = null;
    // If it was a Stock IN movement and revertStock is true, reduce stock back
    if (targetMovement && targetMovement.type === 'IN' && revertStock && targetMovement.productId && targetMovement.variantId) {
      setProducts((prev) => {
        const now = Date.now();
        const updated = prev.map((p) => {
          if (p.id === targetMovement.productId) {
            const updatedVariants = p.variants.map((v) => {
              if (v.id === targetMovement.variantId) {
                const currentStock = (typeof v.stockQuantity === 'number' && !isNaN(v.stockQuantity)) ? v.stockQuantity : 0;
                const newStock = Math.max(0, currentStock - targetMovement.quantity);
                return { ...v, stockQuantity: newStock, updatedAt: now };
              }
              return v;
            });
            return { ...p, variants: updatedVariants, updatedAt: now };
          }
          return p;
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('huda_products', JSON.stringify(updated));
        }
        saveCloudProducts(updated);
        updatedProductsOnDelete = updated;
        return updated;
      });
    }

    let updatedMovementsOnDelete: StockMovement[] = [];
    setStockMovements((prev) => {
      updatedMovementsOnDelete = prev.filter((m) => m.id !== movementId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_stock_movements', JSON.stringify(updatedMovementsOnDelete));
      }
      return updatedMovementsOnDelete;
    });

    triggerBackgroundPush({
      ...(updatedProductsOnDelete ? { products: updatedProductsOnDelete } : {}),
      stockMovements: updatedMovementsOnDelete,
    });

    return true;
  };

  const createSupplierSettlement = (data: {
    supplierName: string;
    periodStart: string;
    periodEnd: string;
    movementIds: string[];
    paymentRef?: string;
    note?: string;
    slipImageUrl?: string;
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
      slipImageUrl: data.slipImageUrl || undefined,
    };

    let updatedMovementsOnSettle: StockMovement[] = [];
    setStockMovements((prev) => {
      updatedMovementsOnSettle = prev.map((m) =>
        data.movementIds.includes(m.id) ? { ...m, isSettled: true, settlementId } : m
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_stock_movements', JSON.stringify(updatedMovementsOnSettle));
      }
      return updatedMovementsOnSettle;
    });

    let updatedSettlementsList: SupplierSettlement[] = [];
    setSupplierSettlements((prev) => {
      updatedSettlementsList = [newSettlement, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_supplier_settlements', JSON.stringify(updatedSettlementsList));
      }
      return updatedSettlementsList;
    });

    triggerBackgroundPush({
      stockMovements: updatedMovementsOnSettle,
      supplierSettlements: updatedSettlementsList,
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
      triggerBackgroundPush({ orders: updated });
      return updated;
    });
  };

  const updateOrderPaymentStatus = (orderId: string, paymentStatus: Order['paymentStatus']) => {
    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, paymentStatus };
          if (paymentStatus === 'slip_uploaded' && storeSettings.lineNotifyOnSlipUpload !== false) {
            try {
              sendLineNotification(formatSlipUploadMessage(updatedOrder), storeSettings).catch(() => {});
            } catch (e) {}
          }
          return updatedOrder;
        }
        return order;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_orders', JSON.stringify(updated));
      }
      saveCloudOrders(updated);
      triggerBackgroundPush({ orders: updated });
      return updated;
    });
  };

  const deleteOrder = (orderId: string) => {
    let updatedSetArr: string[] = [];
    setDeletedOrderIds((prevSet) => {
      const updatedSet = new Set(Array.from(prevSet)).add(orderId);
      updatedSetArr = Array.from(updatedSet);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_deleted_order_ids', JSON.stringify(updatedSetArr));
      }
      return updatedSet;
    });

    let updatedOrdersList: Order[] = [];
    setOrders((prev) => {
      updatedOrdersList = prev.filter((o) => o.id !== orderId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_orders', JSON.stringify(updatedOrdersList));
      }
      saveCloudOrders(updatedOrdersList);
      return updatedOrdersList;
    });

    // Sync Stock Movements for Unsettled Sales Breakdown
    let updatedMovementsList: StockMovement[] = [];
    setStockMovements((prevMovements) => {
      updatedMovementsList = prevMovements.filter((m) => m.referenceOrderNo !== orderId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_stock_movements', JSON.stringify(updatedMovementsList));
      }
      return updatedMovementsList;
    });

    triggerBackgroundPush({
      orders: updatedOrdersList,
      deletedOrderIds: updatedSetArr,
      stockMovements: updatedMovementsList,
    });
  };

  const clearSampleOrders = async () => {
    setOrders((prev) => {
      const remaining = prev.filter((o) => !o.isSample);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_orders', JSON.stringify(remaining));
      }
      saveCloudOrders(remaining);
      triggerBackgroundPush({ orders: remaining });
      return remaining;
    });
  };

  const clearAllOrders = async () => {
    setOrders([]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('huda_orders', JSON.stringify([]));
    }
    saveCloudOrders([]);
    triggerBackgroundPush({ orders: [] });
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
    triggerBackgroundPush({ products: [], deletedIds: deletedArr });
  };

  const addProduct = (newProduct: Product) => {
    soundFx.playSuccess();
    const timestamped = { ...newProduct, updatedAt: Date.now() };

    setProducts((prev) => {
      const updated = [timestamped, ...prev.filter((p) => p.id !== timestamped.id)].sort(sortProductsNatural);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(updated));
      }
      saveCloudProducts(updated);
      triggerBackgroundPush({ products: updated });
      return updated;
    });
  };

  const updateProduct = (updatedProduct: Product) => {
    soundFx.playSuccess();
    const timestamped = { ...updatedProduct, updatedAt: Date.now() };

    let updatedProductsList: Product[] = [];
    setProducts((prev) => {
      updatedProductsList = prev.map((p) => (p.id === timestamped.id ? timestamped : p)).sort(sortProductsNatural);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(updatedProductsList));
      }
      saveCloudProducts(updatedProductsList);
      return updatedProductsList;
    });

    // Update corresponding stock movements to keep Unsettled Sales Breakdown in sync
    let updatedMovementsList: StockMovement[] = [];
    setStockMovements((prevMovements) => {
      updatedMovementsList = prevMovements.map((m) => {
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
        localStorage.setItem('huda_stock_movements', JSON.stringify(updatedMovementsList));
      }
      return updatedMovementsList;
    });

    triggerBackgroundPush({
      products: updatedProductsList,
      stockMovements: updatedMovementsList,
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
      triggerBackgroundPush({ products: updated });
      return updated;
    });
  };

  const deleteProduct = (productId: string) => {
    soundFx.playDelete();
    let updatedDeletedList: string[] = [];
    setDeletedProductIds((prev) => {
      const updated = new Set(Array.from(prev)).add(productId);
      updatedDeletedList = Array.from(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_deleted_ids', JSON.stringify(updatedDeletedList));
      }
      return updated;
    });

    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(updated));
      }
      saveCloudProducts(updated);
      saveCloudDeletedIds(updatedDeletedList);
      triggerBackgroundPush({ products: updated, deletedIds: updatedDeletedList });
      return updated;
    });
  };

  const testLineNotification = async (customMsg?: string): Promise<{ success: boolean; error?: string }> => {
    const msg = customMsg || `🔔 [HUDA ABAYA DUBAI]\n━━━━━━━━━━━━━━━\nทดสอบเชื่อมต่อระบบแจ้งเตือน LINE สำเร็จ 100%!\n\nระบบพร้อมส่งการแจ้งเตือน:\n✅ ออเดอร์ใหม่จากลูกค้า\n✅ ลูกค้าแนบสลิปโอนเงิน\n✅ สินค้าสต๊อกใกล้หมด\n✅ สรุปยอดขายประจำวัน\n━━━━━━━━━━━━━━━\n⏰ เวลาทดสอบ: ${new Date().toLocaleTimeString('th-TH')} น.`;
    return sendLineNotification(msg, storeSettings);
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
        deleteStockMovement,
        createSupplierSettlement,
        setIsCartOpen,
        setIsOrderTrackingOpen,
        setIsAdminMode,
        setIsAdminAuthenticated,
        setIsAdminLoginModalOpen,
        verifyAdminPasscode,
        logoutAdmin,
        updateStoreSettings,
        syncStoreSettings,
        syncOrders,
        syncProducts,
        syncFromGoogleSheet,
        testLineNotification,
        clearBrowserCacheAndReload,
        eventSchedules,
        eventBranches,
        setEventSchedules: handleSetEventSchedules,
        setEventBranches: handleSetEventBranches,
        addEventSchedule,
        updateEventSchedule,
        deleteEventSchedule,
        addEventBranch,
        deleteEventBranch,
        syncStatus,
        lastSyncTime,
        forceRealtimeSync,
        customOptions,
        saveCustomOption,
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
