'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, ProductVariant, CartItem, Order, CategoryType, Coupon, StoreSettings, CurrencyType, StockMovement, SupplierSettlement, SupplierReturnItem, SupplierReturnVoucher, EventSchedule, CustomOptions, RealtimeSyncPayload, TrashedStockMovement, BoothStockTransfer, BoothTransferItem, BoothReplenishmentLog, StaffUser, StaffPermissions, DEFAULT_STAFF_PERMISSIONS, OWNER_PERMISSIONS } from '../types';
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
  formatEventScheduleMessage,
} from '../lib/lineNotification';
import { sortProductsNatural, stripBottlePrefix } from '../utils/productUtils';
import { isMatchingLot } from '../utils/qrUtils';

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'HUDA ABAYA DUBAI',
  storeTagline: 'Haute Couture & Royal Dubai Oud',
  logoLetter: 'H',
  logoImageUrl: DEFAULT_LOGO_BASE64,
  topAnnouncement: 'HUDA ABAYA DUBAI — สินค้าแท้นำเข้าจากเมืองดูไบ UAE | ส่งฟรีทั่วไทยเมื่อช็อปครบ 2,000.-',
  showHeroBanner: true,
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
  lineNotifyToken: 'T7zjWvPiXBVw8gI5BqSaofwCbvKLIU92hOtUsg9/XNn7dUSjPFlRhgmv6IYXQ6vGCdGtlw+Fm/4wv7PnCbIVHnigM+j9mT4V6UqbSwOJRqKxWTYTYAD/id0JGKr+hEdCoAG2Aw4KZ5FRmloIsvmWf49PbdgDzCFqoOLOYbqAITQ=',
  lineNotifyOnNewOrder: true,
  lineNotifyOnSlipUpload: true,
  lineNotifyOnLowStock: true,
  lineNotifyOnDailySummary: true,
  lineNotifyOnEventSchedule: true,
};

interface ShopContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  stockMovements: StockMovement[];
  supplierSettlements: SupplierSettlement[];
  supplierReturnVouchers: SupplierReturnVoucher[];
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
  cancelAndRestockOrder: (
    orderId: string,
    options?: {
      reason?: string;
      refundPayment?: boolean;
      performedBy?: string;
    }
  ) => Promise<{ success: boolean; message: string }>;
  deleteOrder: (orderId: string, revertStock?: boolean) => void;
  deleteOrders: (orderIds: string[], revertStock?: boolean) => void;
  clearSampleOrders: () => Promise<void>;
  clearAllOrders: () => Promise<void>;
  clearAllProducts: () => Promise<void>;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  updateVariantStock: (productId: string, variantId: string, newStock: number) => void;
  deleteProduct: (productId: string) => void;
  recordStockIn: (data: { productId: string; variantId: string; quantity: number; costPrice: number; supplierName: string; note?: string; lotNumber?: string }) => void;
  recordStockInBatch: (items: Array<{ productId: string; variantId: string; quantity: number; costPrice: number; supplierName: string; note?: string; lotNumber?: string }>) => void;
  deleteStockMovement: (movementId: string, revertStock?: boolean) => boolean;
  trashedStockMovements: TrashedStockMovement[];
  restoreStockMovement: (movementId: string) => boolean;
  permanentlyDeleteStockMovement: (movementId: string) => void;
  clearTrashedStockMovements: () => void;
  createSupplierSettlement: (data: { supplierName: string; periodStart: string; periodEnd: string; movementIds: string[]; paymentRef?: string; note?: string; slipImageUrl?: string }) => SupplierSettlement;
  cancelSupplierSettlement: (settlementId: string) => boolean;
  createSupplierReturn: (data: Omit<SupplierReturnVoucher, 'id' | 'createdAt'>) => SupplierReturnVoucher;
  deleteSupplierReturn: (voucherId: string, revertStock?: boolean) => boolean;
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
  testLineNotification: (customMsg?: string, settingsOverride?: StoreSettings) => Promise<{ success: boolean; error?: string }>;
  notifyEventScheduleToLine: (schedule: EventSchedule, action?: 'created' | 'updated' | 'reminder') => Promise<{ success: boolean; error?: string }>;
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
  boothTransfers: BoothStockTransfer[];
  setBoothTransfers: React.Dispatch<React.SetStateAction<BoothStockTransfer[]>>;
  createBoothTransfer: (transfer: BoothStockTransfer) => void;
  updateBoothTransfer: (transfer: BoothStockTransfer) => void;
  deleteBoothTransfer: (transferId: string) => void;
  replenishBoothTransfer: (
    transferId: string,
    additionalItems: Array<{
      productId: string;
      variantId: string;
      productTitle: string;
      variantName: string;
      sku: string;
      price: number;
      costPrice?: number;
      image?: string;
      quantity: number;
    }>,
    staffName?: string,
    note?: string
  ) => void;
  reconcileAndReturnBoothTransfer: (transferId: string, actualItems: BoothTransferItem[], note?: string) => void;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncTime: number;
  forceRealtimeSync: (forceAll?: boolean, isManual?: boolean) => Promise<void>;
  customOptions: CustomOptions;
  saveCustomOption: (type: keyof CustomOptions, value: any) => void;
  staffUsers: StaffUser[];
  currentStaff: StaffUser | null;
  addStaffUser: (user: StaffUser) => void;
  updateStaffUser: (user: StaffUser) => void;
  deleteStaffUser: (userId: string) => void;
  setCurrentStaff: React.Dispatch<React.SetStateAction<StaffUser | null>>;
  refundOrderItems: (params: {
    orderId: string;
    refundItems: Array<{
      productId: string;
      variantId: string;
      quantity: number;
      price: number;
      productTitle: string;
      variantName: string;
    }>;
    refundAmount: number;
    refundMethod: 'cash' | 'transfer';
    reason: string;
    performedBy: string;
    approvedBy?: string;
  }) => Promise<{ success: boolean; message: string; updatedOrder?: Order }>;
  exchangeOrderItem: (params: {
    orderId: string;
    boothTransferId?: string | null;
    returnItem: {
      productId: string;
      variantId: string;
      quantity: number;
      price: number;
      productTitle: string;
      variantName: string;
    };
    newItem: {
      productId: string;
      variantId: string;
      quantity: number;
      price: number;
      productTitle: string;
      variantName: string;
    };
    priceDifference: number;
    paymentMethodForDiff?: 'cash' | 'promptpay' | 'none';
    performedBy: string;
    approvedBy?: string;
    reason?: string;
  }) => Promise<{ success: boolean; message: string; updatedOrder?: Order }>;
  verifySupervisorPin: (pin: string) => { valid: boolean; approverName?: string };
  syncStaffUsersToCloud: () => Promise<{ success: boolean; count: number }>;
  syncBoothTransfersToCloud: () => Promise<{ success: boolean; count: number }>;
}

const DEFAULT_STAFF_USERS: StaffUser[] = [
  {
    id: 'STF-OWNER',
    name: 'เจ้าของร้าน (Admin)',
    pin: '1077',
    role: 'OWNER',
    phone: '083-427-4687',
    active: true,
    isActive: true,
    permissions: OWNER_PERMISSIONS,
    createdAt: new Date().toISOString(),
  },
];

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

function normalizeEventScheduleStatus(schedule: EventSchedule): EventSchedule {
  let sStart = schedule.startDate || '';
  let sEnd = schedule.endDate || schedule.startDate || '';
  if (sStart) {
    const parts = sStart.split('-');
    if (parts.length === 3 && parseInt(parts[0], 10) > 2400) {
      sStart = `${parseInt(parts[0], 10) - 543}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }
  if (sEnd) {
    const parts = sEnd.split('-');
    if (parts.length === 3 && parseInt(parts[0], 10) > 2400) {
      sEnd = `${parseInt(parts[0], 10) - 543}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }
  const normalized: EventSchedule = {
    ...schedule,
    startDate: sStart || schedule.startDate,
    endDate: sEnd || sStart || schedule.endDate,
  };
  if (schedule.status === 'TRANSFERRED' || schedule.status === 'CANCELLED') return normalized;
  const today = new Date().toISOString().slice(0, 10);
  if (sEnd && sEnd < today) {
    return { ...normalized, status: 'COMPLETED' };
  }
  if (sStart && sStart > today) {
    return { ...normalized, status: 'UPCOMING' };
  }
  if (schedule.status === 'COMPLETED') {
    return normalized;
  }
  return { ...normalized, status: 'ACTIVE' };
}

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
  const [deletedEventScheduleIds, setDeletedEventScheduleIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_deleted_event_ids');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return new Set(parsed);
        } catch (e) {}
      }
    }
    return new Set<string>();
  });
  const [deletedStockMovementIds, setDeletedStockMovementIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_deleted_stock_movement_ids');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return new Set(parsed);
        } catch (e) {}
      }
    }
    return new Set<string>();
  });
  const [trashedStockMovements, setTrashedStockMovements] = useState<TrashedStockMovement[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_trashed_stock_movements');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
    }
    return [];
  });
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      const savedProds = localStorage.getItem('huda_products');
      if (savedProds) {
        try {
          const parsed = JSON.parse(savedProds);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitized = parsed.map((p: Product) => ({
              ...p,
              variants: Array.isArray(p.variants)
                ? p.variants.map((v) => ({
                    ...v,
                    name: stripBottlePrefix(v.name),
                  }))
                : [],
            }));
            return sanitized.sort(sortProductsNatural);
          }
        } catch (e) {}
      }
    }
    return INITIAL_PRODUCTS;
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_orders');
      const savedDeleted = localStorage.getItem('huda_deleted_order_ids');
      const deletedSet = new Set<string>();
      if (savedDeleted) {
        try {
          const parsed = JSON.parse(savedDeleted);
          if (Array.isArray(parsed)) parsed.forEach((id: string) => deletedSet.add(id));
        } catch (e) {}
      }
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter((o: Order) => !deletedSet.has(o.id));
          }
        } catch (e) {}
      }
    }
    return INITIAL_ORDERS;
  });
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_stock_movements');
      const savedDeleted = localStorage.getItem('huda_deleted_stock_movement_ids');
      const deletedSet = new Set<string>();
      if (savedDeleted) {
        try {
          const parsed = JSON.parse(savedDeleted);
          if (Array.isArray(parsed)) parsed.forEach((id: string) => deletedSet.add(id));
        } catch (e) {}
      }
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter((m: StockMovement) => !deletedSet.has(m.id));
          }
        } catch (e) {}
      }
    }
    return [];
  });
  const [supplierReturnVouchers, setSupplierReturnVouchers] = useState<SupplierReturnVoucher[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_supplier_returns');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
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
          if (Array.isArray(parsed)) return parsed.map(normalizeEventScheduleStatus);
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

  const [boothTransfers, setBoothTransfers] = useState<BoothStockTransfer[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_booth_transfers');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
    }
    return [];
  });

  // Real-Time Multi-Device Sync Indicators & Refs
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [customOptions, setCustomOptions] = useState<CustomOptions>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSuppliers = localStorage.getItem('huda_custom_suppliers');
        const savedNotes = localStorage.getItem('huda_custom_stock_in_notes');
        const savedLots = localStorage.getItem('huda_custom_lot_numbers');
        const savedCategories = localStorage.getItem('huda_custom_category_list_v1');
        const savedFabrics = localStorage.getItem('huda_category_fabric_map_v3');
        const savedSizes = localStorage.getItem('huda_category_size_map_v1');
        let parsedSizes = savedSizes ? JSON.parse(savedSizes) : {};
        if (parsedSizes && typeof parsedSizes === 'object') {
          const cleanedSizes: Record<string, string[]> = {};
          for (const [k, arr] of Object.entries(parsedSizes)) {
            if (Array.isArray(arr)) {
              cleanedSizes[k] = Array.from(new Set(arr.map(stripBottlePrefix).filter(Boolean)));
            } else {
              cleanedSizes[k] = arr as any;
            }
          }
          parsedSizes = cleanedSizes;
        }
        const savedColors = localStorage.getItem('huda_category_color_map_v1');
        const savedDesc = localStorage.getItem('huda_custom_description_options_v1');
        return {
          suppliers: savedSuppliers ? JSON.parse(savedSuppliers) : [],
          stockInNotes: savedNotes ? JSON.parse(savedNotes) : [],
          lotNumbers: savedLots ? JSON.parse(savedLots) : ['HUDA-001-1-69', 'HUDA-A005-1-69', '1-69'],
          categories: savedCategories ? JSON.parse(savedCategories) : [],
          fabrics: savedFabrics ? JSON.parse(savedFabrics) : {},
          sizes: parsedSizes,
          colors: savedColors ? JSON.parse(savedColors) : {},
          descriptions: savedDesc ? JSON.parse(savedDesc) : [],
        };
      } catch (e) {}
    }
    return {};
  });

  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_staff_users');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleaned = parsed.filter((u: StaffUser) => u.id !== 'STF-001');
            if (cleaned.length !== parsed.length) {
              localStorage.setItem('huda_staff_users', JSON.stringify(cleaned));
            }
            return cleaned.length > 0 ? cleaned : DEFAULT_STAFF_USERS;
          }
        } catch (e) {}
      }
    }
    return DEFAULT_STAFF_USERS;
  });

  const [currentStaff, setCurrentStaff] = useState<StaffUser | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_current_staff') || sessionStorage.getItem('huda_current_staff');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id === 'STF-001') {
            localStorage.removeItem('huda_current_staff');
            sessionStorage.removeItem('huda_current_staff');
            return null;
          }
          return parsed;
        } catch (e) {}
      }
    }
    return null;
  });

  const syncVersionRef = useRef<number>(0);
  const isSyncingRef = useRef<boolean>(false);
  const syncChannelRef = useRef<BroadcastChannel | null>(null);
  const tabIdRef = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tab_${Math.random()}`
  );
  const pushTimeoutRef = useRef<any>(null);
  const pendingPushPayloadRef = useRef<Partial<RealtimeSyncPayload>>({});
  const isInitialSyncCompletedRef = useRef<boolean>(false);
  const isApplyingCloudSyncRef = useRef<boolean>(false);
  const deletedStockMovementIdsRef = useRef<Set<string>>(deletedStockMovementIds);
  useEffect(() => {
    deletedStockMovementIdsRef.current = deletedStockMovementIds;
  }, [deletedStockMovementIds]);

  const productsRef = useRef<Product[]>(products);
  const ordersRef = useRef<Order[]>(orders);
  const stockMovementsRef = useRef<StockMovement[]>(stockMovements);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  useEffect(() => {
    stockMovementsRef.current = stockMovements;
  }, [stockMovements]);

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

  // Currency Converter & Formatter (Null-safe)
  const formatPrice = (priceInTHB?: number | null) => {
    const val = typeof priceInTHB === 'number' && !isNaN(priceInTHB) ? priceInTHB : (Number(priceInTHB) || 0);
    switch (currency) {
      case 'AED':
        return `د.إ ${(val * 0.11).toFixed(0)}`;
      case 'USD':
        return `${(val * 0.029).toFixed(1)}`;
      case 'EUR':
        return `€${(val * 0.027).toFixed(1)}`;
      case 'THB':
      default:
        return `฿${val.toLocaleString()}`;
    }
  };

  const syncStaffUsersToCloud = async (): Promise<{ success: boolean; count: number }> => {
    try {
      const current = staffUsers || [];
      const ver = await pushRealtimeSync({ staffUsers: current });
      if (ver) {
        setSyncStatus('synced');
        setLastSyncTime(Date.now());
        return { success: true, count: current.length };
      }
      return { success: false, count: current.length };
    } catch {
      return { success: false, count: (staffUsers || []).length };
    }
  };

  const syncBoothTransfersToCloud = async (): Promise<{ success: boolean; count: number }> => {
    try {
      const current = boothTransfers || [];
      const ver = await pushRealtimeSync({ boothTransfers: current });
      if (ver) {
        setSyncStatus('synced');
        setLastSyncTime(Date.now());
        try {
          syncChannelRef.current?.postMessage({ type: 'SYNC_NOW', senderId: tabIdRef.current });
        } catch (e) {}
        return { success: true, count: current.length };
      }
      return { success: false, count: current.length };
    } catch {
      return { success: false, count: (boothTransfers || []).length };
    }
  };

  const flushOutboxQueue = async () => {
    if (typeof window !== 'undefined') {
      try {
        const rawOutbox = localStorage.getItem('huda_sync_outbox');
        if (rawOutbox) {
          const outboxPayload = JSON.parse(rawOutbox);
          if (outboxPayload && Object.keys(outboxPayload).length > 0) {
            const ver = await pushRealtimeSync(outboxPayload);
            if (ver) {
              localStorage.removeItem('huda_sync_outbox');
              syncVersionRef.current = ver;
              setLastSyncTime(Date.now());
              setSyncStatus('synced');
            }
          }
        }
      } catch (e) {}
    }
  };

  const triggerBackgroundPush = (payload: Partial<RealtimeSyncPayload>, immediate: boolean = false) => {
    pendingPushPayloadRef.current = {
      ...pendingPushPayloadRef.current,
      ...payload,
    };
    if (typeof window !== 'undefined') {
      try {
        const currentSaved = localStorage.getItem('huda_sync_outbox');
        const parsed = currentSaved ? JSON.parse(currentSaved) : {};
        localStorage.setItem('huda_sync_outbox', JSON.stringify({ ...parsed, ...pendingPushPayloadRef.current }));
      } catch (e) {}
    }

    const executePush = async () => {
      const toSend = { ...pendingPushPayloadRef.current };
      try {
        const newVer = await pushRealtimeSync(toSend);
        if (newVer) {
          pendingPushPayloadRef.current = {};
          if (typeof window !== 'undefined') {
            localStorage.removeItem('huda_sync_outbox');
          }
          syncVersionRef.current = newVer;
          setLastSyncTime(Date.now());
          setSyncStatus('synced');
          try {
            syncChannelRef.current?.postMessage({ type: 'SYNC_NOW', senderId: tabIdRef.current });
          } catch (e) {}
        }
      } catch (e) {
        console.warn('Realtime push notice (safely stored in persistent offline outbox):', e);
        setSyncStatus('offline');
      }
    };

    if (immediate) {
      if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
      executePush();
      return;
    }

    if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
    pushTimeoutRef.current = setTimeout(executePush, 100);
  };

  async function forceRealtimeSync(forceAll: boolean = false, isManual: boolean = false) {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (isManual) {
      setSyncStatus('syncing');
    }

    // Flush any pending offline changes first
    await flushOutboxQueue();

    try {
      const verToSend = forceAll ? 0 : syncVersionRef.current;
      const data = await fetchRealtimeSync(verToSend, forceAll);
      if (data?.success) {
        if (data.upToDate && !forceAll) {
          isSyncingRef.current = false;
          if (isManual) {
            setSyncStatus('synced');
            setLastSyncTime(Date.now());
          }
          return;
        }

        if (typeof data.version === 'number' && data.version > 0) {
          if (data.version === syncVersionRef.current && !forceAll) {
            isSyncingRef.current = false;
            if (isManual) {
              setSyncStatus('synced');
              setLastSyncTime(Date.now());
            }
            return;
          }
          syncVersionRef.current = data.version;
        }

        setSyncStatus((prev) => (prev !== 'synced' ? 'synced' : prev));
        if (isManual) {
          setLastSyncTime(Date.now());
        }

        isApplyingCloudSyncRef.current = true;

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

                  // Take cloud variant when forceAll is active, or cloud product is newer/equal, or cloud variant is newer/equal
                  if (!forceAll && lvTime > cvTime && lvTime > 0 && localUpdated > cloudUpdated) {
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
                  ...(cloudUpdated >= localUpdated ? cloudProd : localProd),
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

        // Merge Deleted Product IDs (Tombstone Union: strictly monotonic, never erased by cloud)
        let activeDeletedProdIds = new Set<string>();
        if (typeof window !== 'undefined') {
          try {
            const saved = localStorage.getItem('huda_deleted_product_ids') || localStorage.getItem('huda_deleted_ids');
            if (saved) JSON.parse(saved).forEach((id: string) => activeDeletedProdIds.add(id));
          } catch (e) {}
        }
        if (Array.isArray(data.deletedIds)) {
          data.deletedIds.forEach((id: string) => activeDeletedProdIds.add(id));
        }
        setDeletedProductIds(activeDeletedProdIds);
        if (typeof window !== 'undefined') {
          localStorage.setItem('huda_deleted_product_ids', JSON.stringify(Array.from(activeDeletedProdIds)));
        }

        // Merge Orders (smart non-destructive merge protecting local orders)
        if (Array.isArray(data.orders)) {
          const cloudOrders = data.orders;
          let activeDeletedOrderIds = new Set<string>();
          if (typeof window !== 'undefined') {
            try {
              const saved = localStorage.getItem('huda_deleted_order_ids');
              if (saved) JSON.parse(saved).forEach((id: string) => activeDeletedOrderIds.add(id));
            } catch (e) {}
          }
          if (Array.isArray(data.deletedOrderIds)) {
            data.deletedOrderIds.forEach((id: string) => activeDeletedOrderIds.add(id));
          }
          setDeletedOrderIds(activeDeletedOrderIds);
          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_deleted_order_ids', JSON.stringify(Array.from(activeDeletedOrderIds)));
          }

          let ordersToPush: Order[] | null = null;
          setOrders((currentLocalOrders) => {
            const orderMap = new Map<string, Order>();
            // Keep local non-deleted orders
            currentLocalOrders.forEach((o) => {
              if (!activeDeletedOrderIds.has(o.id)) orderMap.set(o.id, o);
            });
            // Merge cloud orders
            cloudOrders.forEach((o: Order) => {
              if (!activeDeletedOrderIds.has(o.id)) orderMap.set(o.id, o);
            });
            const validOrders = Array.from(orderMap.values()).sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            if (typeof window !== 'undefined') {
              localStorage.setItem('huda_orders', JSON.stringify(validOrders));
            }

            // Two-Way Sync: If this device has local orders that cloud lacks, push them up!
            const cloudOrderIds = new Set((cloudOrders || []).map((o: Order) => o.id));
            const hasUnsyncedOrders = validOrders.some((o) => !cloudOrderIds.has(o.id));
            if (hasUnsyncedOrders || validOrders.length > cloudOrders.length) {
              ordersToPush = validOrders;
            }

            return validOrders;
          });

          if (ordersToPush) {
            pushRealtimeSync({ orders: ordersToPush }).catch(() => {});
          }
        }

        // Merge Deleted Stock Movement IDs (Tombstone Union: strictly monotonic)
        let activeDeletedMovIds = new Set<string>();
        if (typeof window !== 'undefined') {
          try {
            const saved = localStorage.getItem('huda_deleted_stock_movement_ids');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) parsed.forEach((id: string) => activeDeletedMovIds.add(id));
            }
          } catch (e) {}
        }
        deletedStockMovementIdsRef.current.forEach((id: string) => activeDeletedMovIds.add(id));
        if (Array.isArray(data.deletedStockMovementIds)) {
          data.deletedStockMovementIds.forEach((id: string) => activeDeletedMovIds.add(id));
        }
        setDeletedStockMovementIds(activeDeletedMovIds);
        deletedStockMovementIdsRef.current = activeDeletedMovIds;
        if (typeof window !== 'undefined') {
          localStorage.setItem('huda_deleted_stock_movement_ids', JSON.stringify(Array.from(activeDeletedMovIds)));
        }

        // Merge Stock Movements (smart zero-data-loss merge preserving local settlements & deletions)
        const cloudDeletedMovs = activeDeletedMovIds;
        let movementsToPush: StockMovement[] | null = null;

        setStockMovements((prev) => {
          const movMap = new Map<string, StockMovement>();

          // 1. Add current local movements first (strictly excluding any deleted ones)
          prev.forEach((m) => {
            if (!cloudDeletedMovs.has(m.id)) {
              movMap.set(m.id, m);
            }
          });

          // 2. Merge cloud movements (strictly excluding any deleted ones)
          if (Array.isArray(data.stockMovements)) {
            data.stockMovements.forEach((cloudMov: StockMovement) => {
              if (cloudDeletedMovs.has(cloudMov.id)) return;
              const localMov = movMap.get(cloudMov.id);
              if (!localMov) {
                movMap.set(cloudMov.id, cloudMov);
              } else {
                // Keep settled status if either cloud or local marked it settled
                const isSettled = Boolean(localMov.isSettled || cloudMov.isSettled);
                const settlementId = localMov.settlementId || cloudMov.settlementId;
                movMap.set(cloudMov.id, {
                  ...cloudMov,
                  ...localMov,
                  isSettled,
                  settlementId: isSettled ? settlementId : undefined,
                  lotNumber: localMov.lotNumber || cloudMov.lotNumber || '',
                });
              }
            });
          }

          const merged = Array.from(movMap.values()).sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );

          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_stock_movements', JSON.stringify(merged));
          }

          // Two-Way Sync: If this device has local movements that cloud lacks, push them up!
          const cloudMovIds = new Set((data.stockMovements || []).map((m: StockMovement) => m.id));
          const hasUnsyncedMovements = merged.some((m) => !cloudMovIds.has(m.id));
          if (hasUnsyncedMovements || merged.length > (data.stockMovements || []).length) {
            movementsToPush = merged;
          }

          return merged;
        });

        if (movementsToPush) {
          pushRealtimeSync({ stockMovements: movementsToPush }).catch(() => {});
        }

        // If cloud returned deleted items, purge them from cloud immediately!
        if (cloudDeletedMovs.size > 0 && Array.isArray(data.stockMovements) && data.stockMovements.some((m) => cloudDeletedMovs.has(m.id))) {
          const cleanedCloudList = (data.stockMovements || []).filter((m) => !cloudDeletedMovs.has(m.id));
          pushRealtimeSync({
            stockMovements: cleanedCloudList,
            deletedStockMovementIds: Array.from(cloudDeletedMovs),
          }).catch(() => {});
        }

        // Merge Supplier Settlements (smart merge preserving un-synced local records)
        let settlementsToPush: SupplierSettlement[] | null = null;
        setSupplierSettlements((prev) => {
          let deletedSettlementIds = new Set<string>();
          if (typeof window !== 'undefined') {
            try {
              const raw = localStorage.getItem('huda_deleted_settlement_ids') || '[]';
              const parsed: string[] = JSON.parse(raw);
              deletedSettlementIds = new Set(parsed);
            } catch (e) {}
          }
          const setMap = new Map<string, SupplierSettlement>();
          prev.forEach((s) => {
            if (!deletedSettlementIds.has(s.id)) {
              setMap.set(s.id, s);
            }
          });
          if (Array.isArray(data.supplierSettlements)) {
            data.supplierSettlements.forEach((s: SupplierSettlement) => {
              if (deletedSettlementIds.has(s.id)) return;
              if (!setMap.has(s.id)) {
                setMap.set(s.id, s);
              } else {
                const local = setMap.get(s.id)!;
                setMap.set(s.id, { ...s, ...local });
              }
            });
          }
          const merged = Array.from(setMap.values()).sort(
            (a, b) => new Date(b.settledAt || 0).getTime() - new Date(a.settledAt || 0).getTime()
          );
          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_supplier_settlements', JSON.stringify(merged));
          }

          // Two-Way Sync: If this device has settlements that cloud lacks, push them up!
          const cloudSetIds = new Set((data.supplierSettlements || []).map((s: SupplierSettlement) => s.id));
          const hasUnsyncedSets = merged.some((s) => !cloudSetIds.has(s.id));
          if (hasUnsyncedSets || merged.length > (data.supplierSettlements || []).length) {
            settlementsToPush = merged;
          }

          return merged;
        });

        if (settlementsToPush) {
          pushRealtimeSync({ supplierSettlements: settlementsToPush }).catch(() => {});
        }

        // Merge Supplier Return Vouchers
        let returnVouchersToPush: SupplierReturnVoucher[] | null = null;
        setSupplierReturnVouchers((prev) => {
          const retMap = new Map<string, SupplierReturnVoucher>();
          prev.forEach((v) => retMap.set(v.id, v));
          if (Array.isArray(data.supplierReturnVouchers)) {
            data.supplierReturnVouchers.forEach((v: SupplierReturnVoucher) => {
              if (!retMap.has(v.id)) {
                retMap.set(v.id, v);
              } else {
                const local = retMap.get(v.id)!;
                retMap.set(v.id, { ...v, ...local });
              }
            });
          }
          const merged = Array.from(retMap.values()).sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_supplier_return_vouchers', JSON.stringify(merged));
          }

          const cloudRetIds = new Set((data.supplierReturnVouchers || []).map((v: SupplierReturnVoucher) => v.id));
          const hasUnsyncedRets = merged.some((v) => !cloudRetIds.has(v.id));
          if (hasUnsyncedRets || merged.length > (data.supplierReturnVouchers || []).length) {
            returnVouchersToPush = merged;
          }

          return merged;
        });

        if (returnVouchersToPush) {
          pushRealtimeSync({ supplierReturnVouchers: returnVouchersToPush }).catch(() => {});
        }

        // Merge Deleted Event Schedule IDs
        if (Array.isArray(data.deletedEventScheduleIds)) {
          setDeletedEventScheduleIds(new Set(data.deletedEventScheduleIds));
          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_deleted_event_ids', JSON.stringify(data.deletedEventScheduleIds));
          }
        }

        // Merge Event Schedules (Smart Zero Data Loss Architecture)
        if (Array.isArray(data.eventSchedules)) {
          const cloudDeletedEvents = Array.isArray(data.deletedEventScheduleIds)
            ? new Set(data.deletedEventScheduleIds)
            : new Set<string>();

          setEventSchedules((prev) => {
            const schMap = new Map<string, EventSchedule>();
            // 1. Load incoming cloud schedules not marked deleted
            (data.eventSchedules || []).forEach((s: EventSchedule) => {
              if (!cloudDeletedEvents.has(s.id)) {
                schMap.set(s.id, s);
              }
            });
            // 2. CRITICAL: Preserve un-synced local schedules!
            prev.forEach((local) => {
              if (!schMap.has(local.id) && !cloudDeletedEvents.has(local.id)) {
                schMap.set(local.id, local);
              }
            });
            const merged = Array.from(schMap.values()).sort(
              (a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime()
            );
            if (typeof window !== 'undefined') {
              localStorage.setItem('huda_event_schedules', JSON.stringify(merged));
            }
            return merged;
          });
        }

        // Merge Event Branches
        if (Array.isArray(data.eventBranches) && data.eventBranches.length > 0) {
          setEventBranches(data.eventBranches);
          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_event_branches', JSON.stringify(data.eventBranches));
          }
        }

        // Merge Booth Stock Transfers (Multi-device booth sync)
        if (Array.isArray(data.boothTransfers)) {
          const cloudDeletedTransfers = Array.isArray(data.deletedBoothTransferIds)
            ? new Set(data.deletedBoothTransferIds)
            : new Set<string>();

          let transfersToPush: BoothStockTransfer[] | null = null;
          setBoothTransfers((prev) => {
            const trfMap = new Map<string, BoothStockTransfer>();
            (data.boothTransfers || []).forEach((t: BoothStockTransfer) => {
              if (!cloudDeletedTransfers.has(t.id)) {
                trfMap.set(t.id, t);
              }
            });
            prev.forEach((local) => {
              if (!trfMap.has(local.id) && !cloudDeletedTransfers.has(local.id)) {
                trfMap.set(local.id, local);
              }
            });
            const merged = Array.from(trfMap.values()).sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            if (typeof window !== 'undefined') {
              localStorage.setItem('huda_booth_transfers', JSON.stringify(merged));
            }
            // CRITICAL: If local device has transfers that cloud doesn't have, prepare push to cloud!
            const cloudIds = new Set((data.boothTransfers || []).map((t: BoothStockTransfer) => t.id));
            const hasUnsyncedLocal = merged.some((m) => !cloudIds.has(m.id));
            if (hasUnsyncedLocal || merged.length > (data.boothTransfers || []).length) {
              transfersToPush = merged;
            }
            return merged;
          });

          if (transfersToPush) {
            pushRealtimeSync({ boothTransfers: transfersToPush }).catch(() => {});
          }
        } else if (typeof window !== 'undefined') {
          const savedLocalTransfers = localStorage.getItem('huda_booth_transfers');
          if (savedLocalTransfers) {
            try {
              const parsed = JSON.parse(savedLocalTransfers);
              if (Array.isArray(parsed) && parsed.length > 0) {
                pushRealtimeSync({ boothTransfers: parsed }).catch(() => {});
              }
            } catch (e) {}
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
              lotNumbers: data.customOptions?.lotNumbers || prev.lotNumbers || ['HUDA-001-1-69', 'HUDA-A005-1-69', '1-69'],
              categories: data.customOptions?.categories || prev.categories || [],
              fabrics: data.customOptions?.fabrics || prev.fabrics || {},
              sizes: data.customOptions?.sizes || prev.sizes || {},
              colors: data.customOptions?.colors || prev.colors || {},
              descriptions: data.customOptions?.descriptions || prev.descriptions || [],
            };
            if (typeof window !== 'undefined') {
              if (updated.suppliers) localStorage.setItem('huda_custom_suppliers', JSON.stringify(updated.suppliers));
              if (updated.stockInNotes) localStorage.setItem('huda_custom_stock_in_notes', JSON.stringify(updated.stockInNotes));
              if (updated.lotNumbers) localStorage.setItem('huda_custom_lot_numbers', JSON.stringify(updated.lotNumbers));
              if (updated.categories) localStorage.setItem('huda_custom_category_list_v1', JSON.stringify(updated.categories));
              if (updated.fabrics) localStorage.setItem('huda_category_fabric_map_v3', JSON.stringify(updated.fabrics));
              if (updated.sizes) localStorage.setItem('huda_category_size_map_v1', JSON.stringify(updated.sizes));
              if (updated.colors) localStorage.setItem('huda_category_color_map_v1', JSON.stringify(updated.colors));
              if (updated.descriptions) localStorage.setItem('huda_custom_description_options_v1', JSON.stringify(updated.descriptions));
            }
            return updated;
          });
        }

        // Merge Staff Users (Multi-Device Auto-Sync)
        if (Array.isArray(data.staffUsers)) {
          let staffToPush: StaffUser[] | null = null;
          setStaffUsers((prev) => {
            const userMap = new Map<string, StaffUser>();
            (data.staffUsers || []).filter((u) => u && u.id !== 'STF-001').forEach((u) => userMap.set(u.id, u));
            (prev || []).filter((u) => u && u.id !== 'STF-001').forEach((local) => {
              const serverUser = userMap.get(local.id);
              if (!serverUser) {
                userMap.set(local.id, local);
              } else {
                const localUpdated = (local as any).updatedAt || 0;
                const serverUpdated = (serverUser as any).updatedAt || 0;
                if (localUpdated >= serverUpdated) {
                  userMap.set(local.id, local);
                }
              }
            });
            const merged = Array.from(userMap.values());
            if (typeof window !== 'undefined') {
              localStorage.setItem('huda_staff_users', JSON.stringify(merged));
            }
            // If local device has more staff than cloud returned, prepare push to cloud!
            if (merged.length > (data.staffUsers || []).length) {
              staffToPush = merged;
            }
            return merged;
          });

          if (staffToPush) {
            pushRealtimeSync({ staffUsers: staffToPush }).catch(() => {});
          }
        } else if (typeof window !== 'undefined') {
          const savedLocalStaff = localStorage.getItem('huda_staff_users');
          if (savedLocalStaff) {
            try {
              const parsed = JSON.parse(savedLocalStaff);
              if (Array.isArray(parsed) && parsed.length > 0) {
                pushRealtimeSync({ staffUsers: parsed }).catch(() => {});
              }
            } catch (e) {}
          }
        }

        // Two-Way Sync Fallback: If cloud returned empty lists for movements/orders/settlements,
        // automatically push any local persistent records up to cloud so other devices (e.g. PC / mobile) get them immediately!
        if (typeof window !== 'undefined') {
          try {
            const rawMovs = localStorage.getItem('huda_stock_movements');
            if (rawMovs && (!data.stockMovements || data.stockMovements.length === 0)) {
              const parsedMovs = JSON.parse(rawMovs);
              if (Array.isArray(parsedMovs) && parsedMovs.length > 0) {
                pushRealtimeSync({ stockMovements: parsedMovs }).catch(() => {});
              }
            }
            const rawOrders = localStorage.getItem('huda_orders');
            if (rawOrders && (!data.orders || data.orders.length === 0)) {
              const parsedOrders = JSON.parse(rawOrders);
              if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
                pushRealtimeSync({ orders: parsedOrders }).catch(() => {});
              }
            }
            const rawSets = localStorage.getItem('huda_supplier_settlements');
            if (rawSets && (!data.supplierSettlements || data.supplierSettlements.length === 0)) {
              const parsedSets = JSON.parse(rawSets);
              if (Array.isArray(parsedSets) && parsedSets.length > 0) {
                pushRealtimeSync({ supplierSettlements: parsedSets }).catch(() => {});
              }
            }
          } catch (e) {}
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
      setTimeout(() => {
        isApplyingCloudSyncRef.current = false;
        isInitialSyncCompletedRef.current = true;
      }, 80);
    }
  }

  const notifyEventScheduleToLine = async (
    schedule: EventSchedule,
    action: 'created' | 'updated' | 'reminder' = 'created'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const msg = formatEventScheduleMessage(schedule, action);
      return await sendLineNotification(msg, storeSettings);
    } catch (err: any) {
      console.warn('Failed to send LINE event schedule notification:', err);
      return { success: false, error: err?.message || 'ส่งแจ้งเตือนตารางงานไม่สำเร็จ' };
    }
  };

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

    // Auto-send LINE notification if enabled
    if (storeSettings.lineNotifyEnabled !== false && storeSettings.lineNotifyOnEventSchedule !== false) {
      notifyEventScheduleToLine(schedule, 'created').catch(() => {});
    }
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

    // Auto-send LINE notification if enabled
    if (storeSettings.lineNotifyEnabled !== false && storeSettings.lineNotifyOnEventSchedule !== false) {
      notifyEventScheduleToLine(schedule, 'updated').catch(() => {});
    }
  };

  const deleteEventSchedule = (scheduleId: string) => {
    soundFx.playDelete();
    setDeletedEventScheduleIds((prev) => {
      const updated = new Set([...prev, scheduleId]);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_deleted_event_ids', JSON.stringify(Array.from(updated)));
      }
      return updated;
    });
    setEventSchedules((prev) => {
      const updated = prev.filter((s) => s.id !== scheduleId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_event_schedules', JSON.stringify(updated));
      }
      triggerBackgroundPush({
        eventSchedules: updated,
        deletedEventScheduleIds: [scheduleId],
      });
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

  const createBoothTransfer = (transfer: BoothStockTransfer) => {
    soundFx.playSuccess();
    // 1. Deduct dispatched quantity from central products inventory
    let updatedProducts: Product[] = [];
    setProducts((prevProducts) => {
      updatedProducts = prevProducts.map((prod) => {
        const transferItemsForProd = transfer.items.filter((ti) => ti.productId === prod.id);
        if (transferItemsForProd.length === 0) return prod;

        const updatedVariants = prod.variants.map((v) => {
          const matchItem = transferItemsForProd.find((ti) => ti.variantId === v.id);
          if (!matchItem) return v;
          const newQty = Math.max(0, v.stockQuantity - matchItem.dispatchedQty);
          return {
            ...v,
            stockQuantity: newQty,
            updatedAt: Date.now(),
          };
        });

        return { ...prod, variants: updatedVariants, updatedAt: Date.now() };
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(updatedProducts));
      }
      saveCloudProducts(updatedProducts);
      return updatedProducts;
    });

    // 2. Save new booth transfer
    setBoothTransfers((prev) => {
      const updated = [transfer, ...prev.filter((t) => t.id !== transfer.id)];
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_booth_transfers', JSON.stringify(updated));
      }
      pushRealtimeSync({
        products: updatedProducts,
        boothTransfers: updated,
      }).then((ver) => {
        if (ver) {
          syncVersionRef.current = ver;
          setLastSyncTime(Date.now());
          setSyncStatus('synced');
          try {
            syncChannelRef.current?.postMessage({ type: 'SYNC_NOW', senderId: tabIdRef.current });
          } catch (e) {}
        }
      }).catch(() => {});
      triggerBackgroundPush({
        products: updatedProducts,
        boothTransfers: updated,
      });
      return updated;
    });
  };

  const updateBoothTransfer = (transfer: BoothStockTransfer) => {
    soundFx.playSuccess();
    setBoothTransfers((prev) => {
      const updated = prev.map((t) => (t.id === transfer.id ? transfer : t));
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_booth_transfers', JSON.stringify(updated));
      }
      pushRealtimeSync({ boothTransfers: updated }).then((ver) => {
        if (ver) {
          syncVersionRef.current = ver;
          setLastSyncTime(Date.now());
          setSyncStatus('synced');
          try {
            syncChannelRef.current?.postMessage({ type: 'SYNC_NOW', senderId: tabIdRef.current });
          } catch (e) {}
        }
      }).catch(() => {});
      triggerBackgroundPush({ boothTransfers: updated });
      return updated;
    });
  };

  const deleteBoothTransfer = (transferId: string) => {
    soundFx.playDelete();
    const target = (boothTransfers || []).find((t) => t.id === transferId);
    let updatedProducts: Product[] = [];

    // If transfer was active and not completed, revert remaining stock back to central products
    if (target && target.status !== 'COMPLETED') {
      const safeItems = Array.isArray(target.items) ? target.items : [];
      setProducts((prevProducts) => {
        updatedProducts = (prevProducts || []).map((prod) => {
          if (!prod) return prod;
          const transferItemsForProd = safeItems.filter((ti) => ti && ti.productId === prod.id);
          if (transferItemsForProd.length === 0) return prod;

          const updatedVariants = (prod.variants || []).map((v) => {
            if (!v) return v;
            const matchItem = transferItemsForProd.find((ti) => ti && ti.variantId === v.id);
            if (!matchItem) return v;
            const remainingToRevert = Math.max(0, (matchItem.dispatchedQty || 0) - (matchItem.soldQty || 0));
            const currentStock = typeof v.stockQuantity === 'number' && !isNaN(v.stockQuantity) ? v.stockQuantity : 0;
            return {
              ...v,
              stockQuantity: currentStock + remainingToRevert,
              updatedAt: Date.now(),
            };
          });

          return { ...prod, variants: updatedVariants, updatedAt: Date.now() };
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('huda_products', JSON.stringify(updatedProducts));
        }
        saveCloudProducts(updatedProducts);
        return updatedProducts;
      });
    }

    setBoothTransfers((prev) => {
      const updated = (prev || []).filter((t) => t.id !== transferId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_booth_transfers', JSON.stringify(updated));
      }
      const pushPayload = {
        boothTransfers: updated,
        deletedBoothTransferIds: [transferId],
        ...(updatedProducts.length > 0 ? { products: updatedProducts } : {}),
      };
      pushRealtimeSync(pushPayload).then((ver) => {
        if (ver) {
          syncVersionRef.current = ver;
          setLastSyncTime(Date.now());
          setSyncStatus('synced');
          try {
            syncChannelRef.current?.postMessage({ type: 'SYNC_NOW', senderId: tabIdRef.current });
          } catch (e) {}
        }
      }).catch(() => {});
      triggerBackgroundPush(pushPayload);
      return updated;
    });
  };

  const replenishBoothTransfer = (
    transferId: string,
    additionalItems: Array<{
      productId: string;
      variantId: string;
      productTitle: string;
      variantName: string;
      sku: string;
      price: number;
      costPrice?: number;
      image?: string;
      quantity: number;
    }>,
    staffName?: string,
    note?: string
  ) => {
    const validItems = additionalItems.filter((i) => i.quantity > 0);
    if (validItems.length === 0) return;

    soundFx.playSuccess();

    // 1. Deduct replenishment quantities from central warehouse
    let updatedProducts: Product[] = [];
    setProducts((prevProducts) => {
      updatedProducts = prevProducts.map((prod) => {
        const replenishForProd = validItems.filter((i) => i.productId === prod.id);
        if (replenishForProd.length === 0) return prod;

        const updatedVariants = prod.variants.map((v) => {
          const match = replenishForProd.find((i) => i.variantId === v.id);
          if (!match) return v;
          return {
            ...v,
            stockQuantity: Math.max(0, v.stockQuantity - match.quantity),
            updatedAt: Date.now(),
          };
        });

        return { ...prod, variants: updatedVariants, updatedAt: Date.now() };
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(updatedProducts));
      }
      saveCloudProducts(updatedProducts);
      return updatedProducts;
    });

    // 2. Update the booth transfer items and append replenishment log
    setBoothTransfers((prev) => {
      const target = prev.find((t) => t.id === transferId);
      if (!target) return prev;

      const updatedItems = [...target.items];

      for (const add of validItems) {
        const existingIdx = updatedItems.findIndex(
          (i) => i.productId === add.productId && i.variantId === add.variantId
        );

        if (existingIdx !== -1) {
          const cur = updatedItems[existingIdx];
          const newDispatched = cur.dispatchedQty + add.quantity;
          const newExpected = Math.max(0, newDispatched - (cur.soldQty || 0));
          updatedItems[existingIdx] = {
            ...cur,
            dispatchedQty: newDispatched,
            expectedReturnQty: newExpected,
            difference: (cur.actualReturnedQty || 0) - newExpected,
          };
        } else {
          updatedItems.push({
            productId: add.productId,
            variantId: add.variantId,
            productTitle: add.productTitle,
            variantName: add.variantName,
            sku: add.sku,
            price: add.price,
            costPrice: add.costPrice,
            image: add.image,
            dispatchedQty: add.quantity,
            soldQty: 0,
            expectedReturnQty: add.quantity,
            actualReturnedQty: 0,
            difference: -add.quantity,
          });
        }
      }

      const totalDispatchedQty = updatedItems.reduce((sum, item) => sum + item.dispatchedQty, 0);
      const totalQtyAdded = validItems.reduce((sum, item) => sum + item.quantity, 0);

      const replenishmentLog: BoothReplenishmentLog = {
        id: `REP-${Date.now()}`,
        timestamp: new Date().toISOString(),
        staffName: staffName || target.staffName || 'เจ้าหน้าที่',
        totalQtyAdded,
        note: note || '',
        items: validItems.map((it) => ({
          productId: it.productId,
          variantId: it.variantId,
          productTitle: it.productTitle,
          variantName: it.variantName,
          addedQty: it.quantity,
        })),
      };

      const updatedTransfer: BoothStockTransfer = {
        ...target,
        items: updatedItems,
        totalDispatchedQty,
        replenishments: [...(target.replenishments || []), replenishmentLog],
        updatedAt: new Date().toISOString(),
      };

      const updatedList = prev.map((t) => (t.id === transferId ? updatedTransfer : t));

      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_booth_transfers', JSON.stringify(updatedList));
      }

      pushRealtimeSync({
        products: updatedProducts,
        boothTransfers: updatedList,
      }).then((ver) => {
        if (ver) {
          syncVersionRef.current = ver;
          setLastSyncTime(Date.now());
          setSyncStatus('synced');
          try {
            syncChannelRef.current?.postMessage({ type: 'SYNC_NOW', senderId: tabIdRef.current });
          } catch (e) {}
        }
      }).catch(() => {});

      triggerBackgroundPush({
        products: updatedProducts,
        boothTransfers: updatedList,
      });

      return updatedList;
    });
  };

  const reconcileAndReturnBoothTransfer = (
    transferId: string,
    actualItems: BoothTransferItem[],
    note?: string
  ) => {
    try {
      soundFx.playSuccess();
      const target = (boothTransfers || []).find((t) => t.id === transferId);
      if (!target) {
        console.warn(`reconcileAndReturnBoothTransfer: Transfer #${transferId} not found`);
        return;
      }

      const safeActualItems = Array.isArray(actualItems) ? actualItems : [];

      // 1. Return the physically counted items back into central warehouse
      let updatedProducts: Product[] = [];
      setProducts((prevProducts) => {
        updatedProducts = (prevProducts || []).map((prod) => {
          if (!prod) return prod;
          const returnItemsForProd = safeActualItems.filter((ti) => ti && ti.productId === prod.id);
          if (returnItemsForProd.length === 0) return prod;

          const updatedVariants = (prod.variants || []).map((v) => {
            if (!v) return v;
            const matchItem = returnItemsForProd.find((ti) => ti && ti.variantId === v.id);
            if (!matchItem) return v;
            const returnQty = Math.max(0, Number(matchItem.actualReturnedQty) || 0);
            const currentStock = typeof v.stockQuantity === 'number' && !isNaN(v.stockQuantity) ? v.stockQuantity : 0;
            return {
              ...v,
              stockQuantity: currentStock + returnQty,
              updatedAt: Date.now(),
            };
          });

          return { ...prod, variants: updatedVariants, updatedAt: Date.now() };
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('huda_products', JSON.stringify(updatedProducts));
        }
        saveCloudProducts(updatedProducts);
        return updatedProducts;
      });

      // 2. Mark transfer as COMPLETED & isReconciled = true
      const totalActualReturnedQty = safeActualItems.reduce((sum, item) => sum + (Number(item?.actualReturnedQty) || 0), 0);
      const completedTransfer: BoothStockTransfer = {
        ...target,
        status: 'COMPLETED',
        isReconciled: true,
        returnDate: new Date().toISOString(),
        items: safeActualItems,
        totalActualReturnedQty,
        note: note !== undefined ? note : (target.note || ''),
        updatedAt: new Date().toISOString(),
      };

      setBoothTransfers((prev) => {
        const updated = (prev || []).map((t) => (t.id === transferId ? completedTransfer : t));
        if (typeof window !== 'undefined') {
          localStorage.setItem('huda_booth_transfers', JSON.stringify(updated));
        }
        pushRealtimeSync({
          products: updatedProducts,
          boothTransfers: updated,
        }).then((ver) => {
          if (ver) {
            syncVersionRef.current = ver;
            setLastSyncTime(Date.now());
            setSyncStatus('synced');
            try {
              syncChannelRef.current?.postMessage({ type: 'SYNC_NOW', senderId: tabIdRef.current });
            } catch (e) {}
          }
        }).catch(() => {});
        triggerBackgroundPush({
          products: updatedProducts,
          boothTransfers: updated,
        });
        return updated;
      });
    } catch (error) {
      console.error('Error in reconcileAndReturnBoothTransfer:', error);
      throw error;
    }
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
          lotNumbers: 'huda_custom_lot_numbers',
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
        const CURRENT_CATALOG_VERSION = 'v_79_clean_edp_perfume_sizes';
        const savedProds = localStorage.getItem('huda_products');
        const catalogVer = localStorage.getItem('huda_catalog_version');

        const cleanPerfumeVariantName = (name: string): string => {
          if (!name) return '';
          return name
            .replace(/\s*\([^)]*(?:edp|spray|premium|attar|sample|tester)[^)]*\)/gi, '')
            .trim() || name;
        };

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
                      const ovStock = typeof ov.stockQuantity === 'number' && !isNaN(ov.stockQuantity) ? ov.stockQuantity : mv.stockQuantity;
                      return {
                        ...mv,
                        price: typeof ov.price === 'number' && ov.price > 0 ? ov.price : mv.price,
                        costPrice: typeof ov.costPrice === 'number' && ov.costPrice > 0 ? ov.costPrice : mv.costPrice,
                        stockQuantity: ovStock,
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
                    const cleanedVariants = (p.variants || []).map((v) => ({
                      ...v,
                      name: p.category === 'perfume' ? cleanPerfumeVariantName(v.name) : v.name,
                    }));
                    mergedMap.set(p.id, { ...p, variants: cleanedVariants });
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
            if (parsed && typeof parsed === 'object') {
              setStoreSettings((prev) => ({
                ...DEFAULT_SETTINGS,
                ...prev,
                ...parsed,
                logoImageUrl: parsed.logoImageUrl || savedLogo || prev.logoImageUrl || DEFAULT_LOGO_BASE64,
              }));
            }
          } catch (e) {
            console.warn('Failed to parse huda_store_settings', e);
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
            if (event.data?.senderId && event.data.senderId === tabIdRef.current) {
              return;
            }
            if (event.data?.type === 'PRODUCTS_UPDATED' && Array.isArray(event.data?.products)) {
              setProducts(event.data.products);
              if (Array.isArray(event.data?.stockMovements)) {
                setStockMovements(event.data.stockMovements);
              }
            } else if (event.data?.type === 'ORDERS_UPDATED' && Array.isArray(event.data?.orders)) {
              setOrders(event.data.orders);
              if (Array.isArray(event.data?.products)) {
                setProducts(event.data.products);
              }
              if (Array.isArray(event.data?.stockMovements)) {
                setStockMovements(event.data.stockMovements);
              }
            } else if (
              event.data?.type === 'STOCK_UPDATED' ||
              event.data?.type === 'STOCK_MOVEMENTS_UPDATED'
            ) {
              if (Array.isArray(event.data?.stockMovements)) {
                setStockMovements(event.data.stockMovements);
              }
              if (Array.isArray(event.data?.products)) {
                setProducts(event.data.products);
              }
              if (Array.isArray(event.data?.supplierReturnVouchers)) {
                setSupplierReturnVouchers(event.data.supplierReturnVouchers);
              }
              if (Array.isArray(event.data?.supplierSettlements)) {
                setSupplierSettlements(event.data.supplierSettlements);
              }
            } else if (event.data?.type === 'SETTLEMENTS_UPDATED') {
              if (Array.isArray(event.data?.supplierSettlements)) {
                setSupplierSettlements(event.data.supplierSettlements);
              }
              if (Array.isArray(event.data?.stockMovements)) {
                setStockMovements(event.data.stockMovements);
              }
            } else if (event.data?.type === 'SYNC_NOW') {
              forceRealtimeSync(false, false);
            }
          };
        }
      } catch (e) {}

      // Native browser StorageEvent listener (synchronizes open tabs in 0ms without network)
      const handleStorageEvent = (e: StorageEvent) => {
        if (e.key === 'huda_products' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setProducts(parsed);
            }
          } catch (err) {}
        }
        if (e.key === 'huda_stock_movements' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed)) {
              setStockMovements(parsed);
            }
          } catch (err) {}
        }
        if (e.key === 'huda_supplier_settlements' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed)) {
              setSupplierSettlements(parsed);
            }
          } catch (err) {}
        }
        if (e.key === 'huda_deleted_stock_movement_ids' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed)) {
              setDeletedStockMovementIds(new Set(parsed));
            }
          } catch (err) {}
        }
        if (e.key === 'huda_orders' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed)) {
              setOrders(parsed);
            }
          } catch (err) {}
        }
        if (e.key === 'huda_store_settings' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed && typeof parsed === 'object') {
              setStoreSettings(parsed);
            }
          } catch (err) {}
        }
      };
      window.addEventListener('storage', handleStorageEvent);

      const handleCustomProductsUpdate = (e: any) => {
        if (e.detail?.products && Array.isArray(e.detail.products) && e.detail.products.length > 0) {
          productsRef.current = e.detail.products;
          setProducts(e.detail.products);
        }
      };
      const handleCustomOrdersUpdate = (e: any) => {
        if (e.detail?.orders && Array.isArray(e.detail.orders)) {
          ordersRef.current = e.detail.orders;
          setOrders(e.detail.orders);
        }
      };
      window.addEventListener('huda_products_updated', handleCustomProductsUpdate);
      window.addEventListener('huda_orders_updated', handleCustomOrdersUpdate);

      // Initial immediate outbox flush & sync
      forceRealtimeSync();

      // Fallback: If network is slow or offline, activate sentinels after 1200ms
      const fallbackTimer = setTimeout(() => {
        isInitialSyncCompletedRef.current = true;
      }, 1200);

      // Continuous ultra-fast realtime polling loop for instant cross-device updates (Mobile, Tablet, Desktop)
      // Polls every 1.8s when tab is active, ensuring sales on any device reflect immediately without refreshing!
      const syncInterval = setInterval(() => {
        if (typeof document !== 'undefined' && !document.hidden) {
          forceRealtimeSync(false, false);
        }
      }, 1800);

      const handleVisibilityChange = () => {
        if (!document.hidden) forceRealtimeSync(true, false);
      };
      const handleWindowFocus = () => forceRealtimeSync(true, false);
      const handleOnline = () => forceRealtimeSync(true, false);

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleWindowFocus);
      window.addEventListener('online', handleOnline);

      return () => {
        clearTimeout(fallbackTimer);
        clearInterval(syncInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleWindowFocus);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('storage', handleStorageEvent);
        window.removeEventListener('huda_products_updated', handleCustomProductsUpdate);
        window.removeEventListener('huda_orders_updated', handleCustomOrdersUpdate);
        try { syncChannelRef.current?.close(); } catch (e) {}
      };

    } catch (e) {
      console.warn('LocalStorage state notice', e);
    }
  }, []);

  const verifyAdminPasscode = (passcode: string) => {
    const trimmed = String(passcode || '').trim();
    const ownerCode = String(storeSettings?.adminPasscode || '1077').trim();

    // 1. Check if matches owner passcode
    if (trimmed === ownerCode) {
      const ownerStaff = (staffUsers || []).find((u) => u.role === 'OWNER') || {
        id: 'STF-OWNER',
        name: 'เจ้าของร้าน (Admin)',
        pin: ownerCode,
        role: 'OWNER' as const,
        phone: storeSettings?.contactPhone || '',
        active: true,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setCurrentStaff(ownerStaff);
      setIsAdminAuthenticated(true);
      setIsAdminMode(true);
      setIsAdminLoginModalOpen(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_current_staff', JSON.stringify(ownerStaff));
        sessionStorage.setItem('huda_current_staff', JSON.stringify(ownerStaff));
      }
      return true;
    }

    // 2. Check if matches any active Staff User PIN
    const matchedUser = (staffUsers || []).find((u) => (u.isActive ?? u.active ?? true) && String(u.pin || '').trim() === trimmed);
    if (matchedUser) {
      setCurrentStaff(matchedUser);
      setIsAdminAuthenticated(true);
      setIsAdminMode(true);
      setIsAdminLoginModalOpen(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_current_staff', JSON.stringify(matchedUser));
        sessionStorage.setItem('huda_current_staff', JSON.stringify(matchedUser));
      }
      return true;
    }

    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setIsAdminMode(false);
    setIsAdminLoginModalOpen(false);
    setCurrentStaff(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('huda_admin_authenticated');
      localStorage.removeItem('huda_admin_authenticated');
      sessionStorage.removeItem('huda_current_staff');
      localStorage.removeItem('huda_current_staff');
    }
  };

  const addStaffUser = (user: StaffUser) => {
    soundFx.playSuccess();
    const timestamped: StaffUser = { ...user, updatedAt: Date.now() };
    setStaffUsers((prev) => {
      const updated = [...prev.filter((u) => u.id !== timestamped.id), timestamped];
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_staff_users', JSON.stringify(updated));
      }
      triggerBackgroundPush({ staffUsers: updated });
      pushRealtimeSync({ staffUsers: updated }).catch(() => {});
      return updated;
    });
  };

  const updateStaffUser = (user: StaffUser) => {
    soundFx.playSuccess();
    const timestamped: StaffUser = { ...user, updatedAt: Date.now() };
    setStaffUsers((prev) => {
      const updated = prev.map((u) => (u.id === user.id ? timestamped : u));
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_staff_users', JSON.stringify(updated));
      }
      triggerBackgroundPush({ staffUsers: updated });
      pushRealtimeSync({ staffUsers: updated }).catch(() => {});
      return updated;
    });
    if (currentStaff?.id === user.id) {
      setCurrentStaff(timestamped);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_current_staff', JSON.stringify(timestamped));
        sessionStorage.setItem('huda_current_staff', JSON.stringify(timestamped));
      }
    }
  };

  const deleteStaffUser = (userId: string) => {
    soundFx.playDelete();
    setStaffUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_staff_users', JSON.stringify(updated));
      }
      triggerBackgroundPush({ staffUsers: updated });
      pushRealtimeSync({ staffUsers: updated }).catch(() => {});
      return updated;
    });
    if (currentStaff?.id === userId) {
      logoutAdmin();
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
          const cloudTime = cloudSettings.lastUpdated ? new Date(cloudSettings.lastUpdated).getTime() : 0;
          const localTime = prev.lastUpdated ? new Date(prev.lastUpdated).getTime() : 0;

          if (localTime > cloudTime && localTime > 0) {
            saveCloudSettings(prev);
            return prev;
          }

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
    const nowStamp = new Date().toISOString();
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

    const currentProds = productsRef.current && productsRef.current.length > 0 ? productsRef.current : products;
    let updatedProductsList: Product[] = currentProds;
    if (!newOrder.boothTransferId) {
      updatedProductsList = currentProds.map((prod) => {
        const matchingItems = newOrder.items.filter((item) => item.productId === prod.id);
        if (matchingItems.length === 0) return prod;

        const updatedVariants = prod.variants.map((variant) => {
          const orderedItem = matchingItems.find((item) => item.variantId === variant.id);
          if (!orderedItem) return variant;
          const currentStock = typeof variant.stockQuantity === 'number' && !isNaN(variant.stockQuantity) ? variant.stockQuantity : 0;
          const updatedStock = Math.max(0, currentStock - orderedItem.quantity);

          return {
            ...variant,
            stockQuantity: updatedStock,
            updatedAt: now,
          };
        });

        return { ...prod, variants: updatedVariants, updatedAt: now };
      });

      productsRef.current = updatedProductsList;
      setProducts(updatedProductsList);

      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(updatedProductsList));
        window.dispatchEvent(new CustomEvent('huda_products_updated', { detail: { products: updatedProductsList } }));
        syncChannelRef.current?.postMessage({ type: 'PRODUCTS_UPDATED', products: updatedProductsList });
      }
      saveCloudProducts(updatedProductsList);
    } else {
      // Order placed from Booth POS: record sold quantity against the booth transfer
      setBoothTransfers((prev) => {
        const updated = prev.map((bt) => {
          if (bt.id !== newOrder.boothTransferId) return bt;
          const updatedItems = bt.items.map((item) => {
            const soldInThisOrder = newOrder.items.find(
              (oi) => oi.productId === item.productId && oi.variantId === item.variantId
            );
            if (!soldInThisOrder) return item;
            const newSold = (item.soldQty || 0) + soldInThisOrder.quantity;
            const expReturn = Math.max(0, item.dispatchedQty - newSold);
            return {
              ...item,
              soldQty: newSold,
              expectedReturnQty: expReturn,
              difference: (item.actualReturnedQty || 0) - expReturn,
            };
          });

          const totalSoldQty = updatedItems.reduce((sum, i) => sum + (i.soldQty || 0), 0);
          const totalSalesAmount = (bt.totalSalesAmount || 0) + newOrder.netAmount;

          return {
            ...bt,
            items: updatedItems,
            totalSoldQty,
            totalSalesAmount,
            status: bt.status === 'DISPATCHED' ? 'SELLING' : bt.status,
            updatedAt: new Date().toISOString(),
          };
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('huda_booth_transfers', JSON.stringify(updated));
        }
        triggerBackgroundPush({ boothTransfers: updated });
        return updated;
      });
    }

    const currentOrders = ordersRef.current && ordersRef.current.length > 0 ? ordersRef.current : orders;
    const updatedOrdersList: Order[] = [newOrder, ...currentOrders.filter((o) => o.id !== newOrder.id)];
    ordersRef.current = updatedOrdersList;
    setOrders(updatedOrdersList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('huda_orders', JSON.stringify(updatedOrdersList));
      window.dispatchEvent(new CustomEvent('huda_orders_updated', { detail: { orders: updatedOrdersList } }));
    }
    saveCloudOrders(updatedOrdersList);

    // Auto-record Stock OUT movement for sold items to enable Supplier Settlement
    const newStockOutMovements: StockMovement[] = newOrder.items.map((item, idx) => {
      const prod = products.find((p) => p.id === item.productId);
      const variant = prod?.variants.find((v) => v.id === item.variantId);

      // Specific Lot Cost Identification:
      // If item has a lotNumber specified, try to find the matching IN movement to get the EXACT cost of this lot!
      let resolvedCost = item.costPrice;
      if (resolvedCost === undefined && item.lotNumber) {
        const cleanLot = item.lotNumber.trim();
        const matchingIn = stockMovements.find(
          (m) =>
            m.type === 'IN' &&
            m.productId === item.productId &&
            m.variantId === item.variantId &&
            isMatchingLot(m.lotNumber, cleanLot)
        );
        if (matchingIn && matchingIn.costPrice !== undefined) {
          resolvedCost = matchingIn.costPrice;
        }
      }

      const itemCost = resolvedCost ?? variant?.costPrice ?? Math.round(item.price * 0.5);
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
        lotNumber: item.lotNumber || '',
        referenceOrderNo: newId,
        note: `ขายสินค้าออนไลน์/POS (Order #${newId})${item.lotNumber ? ` [ล็อต: ${item.lotNumber}]` : ''}`,
        performedBy: 'ระบบขายหน้าร้าน / POS',
        createdAt: new Date().toISOString(),
        isSettled: false,
      };
    });

    const currentMovements = stockMovementsRef.current && stockMovementsRef.current.length > 0 ? stockMovementsRef.current : stockMovements;
    const updatedMovementsList: StockMovement[] = [...newStockOutMovements, ...currentMovements];
    stockMovementsRef.current = updatedMovementsList;
    setStockMovements(updatedMovementsList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('huda_stock_movements', JSON.stringify(updatedMovementsList));
    }

    if (typeof window !== 'undefined') {
      try {
        syncChannelRef.current?.postMessage({
          type: 'ORDERS_UPDATED',
          orders: updatedOrdersList,
          products: updatedProductsList,
          stockMovements: updatedMovementsList,
        });
      } catch (e) {}
    }

    triggerBackgroundPush({
      products: updatedProductsList,
      orders: updatedOrdersList,
      stockMovements: updatedMovementsList,
    }, true);

    clearCart();

    // Auto-dispatch LINE Notification for New Order
    if (storeSettings.lineNotifyOnNewOrder !== false) {
      try {
        sendLineNotification(formatNewOrderMessage(newOrder), storeSettings).catch(() => {});
      } catch (e) {}
    }

    return newOrder;
  };

  const recordStockInBatch = (
    items: Array<{
      productId: string;
      variantId: string;
      quantity: number;
      costPrice: number;
      supplierName: string;
      note?: string;
      lotNumber?: string;
    }>
  ) => {
    if (!items || items.length === 0) return;
    soundFx.playSuccess();
    const now = Date.now();
    const nowIso = new Date().toISOString();

    const currentProds = productsRef.current && productsRef.current.length > 0 ? productsRef.current : products;
    const updatedProductsList: Product[] = currentProds.map((p) => {
      const matchingItems = items.filter((it) => it.productId === p.id);
      if (matchingItems.length === 0) return p;

      let prodChanged = false;
      const updatedVariants = p.variants.map((v) => {
        // Match variant by ID or fallback if product has only 1 variant
        const matchingItem = matchingItems.find(
          (it) => it.variantId === v.id || (!it.variantId && p.variants.length === 1) || p.variants.length === 1
        );
        if (matchingItem && matchingItem.quantity > 0) {
          prodChanged = true;
          const currentStock = typeof v.stockQuantity === 'number' && !isNaN(v.stockQuantity) ? v.stockQuantity : 0;
          const newStock = Math.max(0, currentStock + matchingItem.quantity);
          const newCost = matchingItem.costPrice > 0 ? matchingItem.costPrice : (v.costPrice || 0);
          return {
            ...v,
            stockQuantity: newStock,
            costPrice: newCost,
            updatedAt: now,
          };
        }
        return v;
      });

      if (prodChanged) {
        return { ...p, variants: updatedVariants, updatedAt: now };
      }
      return p;
    });

    productsRef.current = updatedProductsList;
    setProducts(updatedProductsList);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('huda_products', JSON.stringify(updatedProductsList));
        window.dispatchEvent(
          new CustomEvent('huda_products_updated', {
            detail: { products: updatedProductsList },
          })
        );
      } catch (e) {}
    }

    const currentMovements = stockMovementsRef.current && stockMovementsRef.current.length > 0 ? stockMovementsRef.current : stockMovements;
    const newMovements: StockMovement[] = items.map((it, idx) => {
      const prod = updatedProductsList.find((p) => p.id === it.productId);
      const variant = prod?.variants.find((v) => v.id === it.variantId) || prod?.variants[0];
      const cost = it.costPrice > 0 ? it.costPrice : (variant?.costPrice || 0);

      return {
        id: `MOV-IN-${now}-${idx}-${Math.floor(Math.random() * 1000)}`,
        type: 'IN',
        productId: it.productId,
        productTitle: prod?.title || 'สินค้า',
        variantId: it.variantId || variant?.id || '',
        variantName: variant?.name || 'ไซส์/รายการ',
        quantity: it.quantity,
        costPrice: cost,
        totalCost: cost * it.quantity,
        supplierName: it.supplierName || (prod?.category === 'perfume' ? 'ซัพพลายเออร์น้ำหอมดูไบ' : 'โรงงานอาบายะห์ดูไบ'),
        note: it.note || 'บันทึกรับสินค้าเข้าสต๊อก (Stock In)',
        performedBy: 'ผู้ดูแลระบบหลังบ้าน',
        createdAt: nowIso,
        isSettled: true,
        lotNumber: it.lotNumber || '',
      };
    });

    const updatedMovementsList = [...newMovements, ...currentMovements];
    stockMovementsRef.current = updatedMovementsList;
    setStockMovements(updatedMovementsList);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('huda_stock_movements', JSON.stringify(updatedMovementsList));
        window.dispatchEvent(
          new CustomEvent('huda_stock_in_completed', {
            detail: {
              itemsCount: items.length,
              timestamp: now,
            },
          })
        );

        // Immediate BroadcastChannel notification (0ms cross-tab realtime!)
        syncChannelRef.current?.postMessage({
          type: 'PRODUCTS_UPDATED',
          products: updatedProductsList,
          stockMovements: updatedMovementsList,
        });
      } catch (e) {}
    }

    saveCloudProducts(updatedProductsList);
    triggerBackgroundPush({
      products: updatedProductsList,
      stockMovements: updatedMovementsList,
    }, true);
  };

  const recordStockIn = (data: {
    productId: string;
    variantId: string;
    quantity: number;
    costPrice: number;
    supplierName: string;
    note?: string;
    lotNumber?: string;
  }) => {
    recordStockInBatch([data]);
  };

  const deleteStockMovement = (movementId: string, revertStock: boolean = true): boolean => {
    soundFx.playDelete();
    const targetMovement = stockMovements.find((m) => m.id === movementId);

    // Save to Trash bin before deleting so user can undo / restore anytime!
    if (targetMovement) {
      setTrashedStockMovements((prev) => {
        const trashedItem: TrashedStockMovement = {
          id: movementId,
          movement: targetMovement,
          revertedStock: revertStock,
          deletedAt: new Date().toISOString(),
        };
        const updated = [trashedItem, ...prev.filter((t) => t.id !== movementId)];
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('huda_trashed_stock_movements', JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });
    }

    let updatedProductsOnDelete: Product[] | null = null;
    // If it was a Stock IN movement and revertStock is true, reduce stock back
    if (targetMovement && targetMovement.type === 'IN' && revertStock && targetMovement.productId && targetMovement.variantId) {
      const now = Date.now();
      const currentProds = productsRef.current && productsRef.current.length > 0 ? productsRef.current : products;
      const updated = currentProds.map((p) => {
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

      productsRef.current = updated;
      setProducts(updated);
      updatedProductsOnDelete = updated;

      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(updated));
        window.dispatchEvent(
          new CustomEvent('huda_products_updated', {
            detail: { products: updated },
          })
        );
      }
      saveCloudProducts(updated);
    }

    const currentMovements = stockMovementsRef.current && stockMovementsRef.current.length > 0 ? stockMovementsRef.current : stockMovements;
    const updatedMovementsOnDelete = currentMovements.filter((m) => m.id !== movementId);
    stockMovementsRef.current = updatedMovementsOnDelete;
    setStockMovements(updatedMovementsOnDelete);
    if (typeof window !== 'undefined') {
      localStorage.setItem('huda_stock_movements', JSON.stringify(updatedMovementsOnDelete));
    }

    const nextDeletedSet = new Set(Array.from(deletedStockMovementIdsRef.current)).add(movementId);
    const updatedDeletedMovs = Array.from(nextDeletedSet);
    deletedStockMovementIdsRef.current = nextDeletedSet;
    setDeletedStockMovementIds(nextDeletedSet);
    if (typeof window !== 'undefined') {
      localStorage.setItem('huda_deleted_stock_movement_ids', JSON.stringify(updatedDeletedMovs));
    }

    if (typeof window !== 'undefined') {
      try {
        syncChannelRef.current?.postMessage({
          type: 'STOCK_MOVEMENTS_UPDATED',
          stockMovements: updatedMovementsOnDelete,
          deletedStockMovementIds: updatedDeletedMovs,
          ...(updatedProductsOnDelete ? { products: updatedProductsOnDelete } : {}),
        });
      } catch (e) {}
    }

    const deletePayload: Partial<RealtimeSyncPayload> = {
      ...(updatedProductsOnDelete ? { products: updatedProductsOnDelete } : {}),
      stockMovements: updatedMovementsOnDelete,
      deletedStockMovementIds: updatedDeletedMovs,
    };

    // Immediately push to Cloud API without waiting for 150ms debounce
    pushRealtimeSync(deletePayload).catch(() => {});
    triggerBackgroundPush(deletePayload);

    return true;
  };

  const restoreStockMovement = (movementId: string): boolean => {
    soundFx.playSuccess();
    const trashed = trashedStockMovements.find((t) => t.id === movementId);
    if (!trashed) return false;

    const { movement, revertedStock } = trashed;
    let updatedProductsOnRestore: Product[] | null = null;

    // 1. If stock was reverted during deletion and it was IN movement, restore stock back to variant!
    if (movement.type === 'IN' && revertedStock && movement.productId && movement.variantId) {
      const now = Date.now();
      const currentProds = productsRef.current && productsRef.current.length > 0 ? productsRef.current : products;
      const updated = currentProds.map((p) => {
        if (p.id === movement.productId) {
          const updatedVariants = p.variants.map((v) => {
            if (v.id === movement.variantId) {
              const currentStock = typeof v.stockQuantity === 'number' && !isNaN(v.stockQuantity) ? v.stockQuantity : 0;
              const newStock = Math.max(0, currentStock + movement.quantity);
              return { ...v, stockQuantity: newStock, updatedAt: now };
            }
            return v;
          });
          return { ...p, variants: updatedVariants, updatedAt: now };
        }
        return p;
      });

      productsRef.current = updated;
      setProducts(updated);
      updatedProductsOnRestore = updated;

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('huda_products', JSON.stringify(updated));
          window.dispatchEvent(
            new CustomEvent('huda_products_updated', {
              detail: { products: updated },
            })
          );
        } catch (e) {}
      }
      saveCloudProducts(updated);
    }

    // 2. Remove movementId from deletedStockMovementIds
    const nextDeletedSet = new Set(Array.from(deletedStockMovementIdsRef.current));
    nextDeletedSet.delete(movementId);
    const updatedDeletedMovs = Array.from(nextDeletedSet);
    deletedStockMovementIdsRef.current = nextDeletedSet;
    setDeletedStockMovementIds(nextDeletedSet);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('huda_deleted_stock_movement_ids', JSON.stringify(updatedDeletedMovs));
      } catch (e) {}
    }

    // 3. Add movement back to stockMovements
    const currentMovements = stockMovementsRef.current && stockMovementsRef.current.length > 0 ? stockMovementsRef.current : stockMovements;
    const updatedMovements: StockMovement[] = [movement, ...currentMovements.filter((m) => m.id !== movementId)];
    stockMovementsRef.current = updatedMovements;
    setStockMovements(updatedMovements);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('huda_stock_movements', JSON.stringify(updatedMovements));
      } catch (e) {}
    }

    // 4. Remove from trashedStockMovements
    setTrashedStockMovements((prev) => {
      const updated = prev.filter((t) => t.id !== movementId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('huda_trashed_stock_movements', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    // 5. Broadcast to all open tabs and push to cloud
    if (typeof window !== 'undefined') {
      try {
        syncChannelRef.current?.postMessage({
          type: 'STOCK_MOVEMENTS_UPDATED',
          stockMovements: updatedMovements,
          deletedStockMovementIds: updatedDeletedMovs,
          ...(updatedProductsOnRestore ? { products: updatedProductsOnRestore } : {}),
        });
      } catch (e) {}
    }

    const restorePayload: Partial<RealtimeSyncPayload> = {
      ...(updatedProductsOnRestore ? { products: updatedProductsOnRestore } : {}),
      stockMovements: updatedMovements,
      deletedStockMovementIds: updatedDeletedMovs,
    };

    pushRealtimeSync(restorePayload).catch(() => {});
    triggerBackgroundPush(restorePayload);

    return true;
  };

  const permanentlyDeleteStockMovement = (movementId: string) => {
    soundFx.playDelete();
    setTrashedStockMovements((prev) => {
      const updated = prev.filter((t) => t.id !== movementId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('huda_trashed_stock_movements', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

  const clearTrashedStockMovements = () => {
    soundFx.playDelete();
    setTrashedStockMovements([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('huda_trashed_stock_movements');
      } catch (e) {}
    }
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

    if (typeof window !== 'undefined') {
      try {
        syncChannelRef.current?.postMessage({
          type: 'SETTLEMENTS_UPDATED',
          supplierSettlements: updatedSettlementsList,
          stockMovements: updatedMovementsOnSettle,
        });
      } catch (e) {}
    }

    triggerBackgroundPush({
      stockMovements: updatedMovementsOnSettle,
      supplierSettlements: updatedSettlementsList,
    });

    return newSettlement;
  };

  const cancelSupplierSettlement = (settlementId: string): boolean => {
    soundFx.playDelete();
    const target = supplierSettlements.find((s) => s.id === settlementId);
    if (!target) return false;

    // Track cancelled settlement ID in localStorage so cloud pull won't resurrect it
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('huda_deleted_settlement_ids') || '[]';
        const parsed: string[] = JSON.parse(raw);
        if (!parsed.includes(settlementId)) {
          parsed.push(settlementId);
          localStorage.setItem('huda_deleted_settlement_ids', JSON.stringify(parsed));
        }
      } catch (e) {}
    }

    // 1. Revert stock movements: unset isSettled and settlementId
    let updatedMovementsOnCancel: StockMovement[] = [];
    setStockMovements((prev) => {
      updatedMovementsOnCancel = prev.map((m) => {
        if (m.settlementId === settlementId || (target.movementIds && target.movementIds.includes(m.id))) {
          const { settlementId: _, ...rest } = m;
          return {
            ...rest,
            isSettled: false,
          };
        }
        return m;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_stock_movements', JSON.stringify(updatedMovementsOnCancel));
      }
      return updatedMovementsOnCancel;
    });

    // 2. Remove settlement from supplierSettlements
    let updatedSettlementsList: SupplierSettlement[] = [];
    setSupplierSettlements((prev) => {
      updatedSettlementsList = prev.filter((s) => s.id !== settlementId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_supplier_settlements', JSON.stringify(updatedSettlementsList));
      }
      return updatedSettlementsList;
    });

    // 3. Broadcast to all open tabs / windows
    if (typeof window !== 'undefined') {
      try {
        syncChannelRef.current?.postMessage({
          type: 'SETTLEMENTS_UPDATED',
          supplierSettlements: updatedSettlementsList,
          stockMovements: updatedMovementsOnCancel,
        });
      } catch (e) {}
    }

    // 4. Background push to Cloudflare
    triggerBackgroundPush({
      stockMovements: updatedMovementsOnCancel,
      supplierSettlements: updatedSettlementsList,
    });

    return true;
  };

  const createSupplierReturn = (data: Omit<SupplierReturnVoucher, 'id' | 'createdAt'>): SupplierReturnVoucher => {
    soundFx.playSuccess();
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const voucherId = `RET-${dateCode}-${randomSuffix}`;
    const nowIso = new Date().toISOString();

    const newVoucher: SupplierReturnVoucher = {
      ...data,
      id: voucherId,
      createdAt: nowIso,
    };

    // 1. Deduct stock for each returned item & create stock movement (OUT / RETURN)
    let updatedProductsOnReturn: Product[] | null = null;
    const newStockMovements: StockMovement[] = [];

    data.items.forEach((item) => {
      const movementId = `MOV-RET-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      newStockMovements.push({
        id: movementId,
        type: 'OUT',
        productId: item.productId,
        productTitle: item.productTitle,
        variantId: item.variantId,
        variantName: item.variantName,
        quantity: item.quantity,
        costPrice: item.costPrice,
        totalCost: item.totalCost,
        supplierName: data.supplierName,
        referenceOrderNo: voucherId,
        note: `[ส่งคืน Supplier] ${item.reason}${data.note ? ` - ${data.note}` : ''}`,
        performedBy: data.performedBy,
        createdAt: nowIso,
        lotNumber: item.lotNumber,
        isSettled: true, // Marked settled so it won't be counted as payable sold stock
      });
    });

    // Update products stock
    setProducts((prev) => {
      const now = Date.now();
      const updated = prev.map((p) => {
        const matchingItems = data.items.filter((item) => item.productId === p.id);
        if (matchingItems.length === 0) return p;

        const updatedVariants = p.variants.map((v) => {
          const itemToDeduct = matchingItems.find((item) => item.variantId === v.id);
          if (itemToDeduct) {
            const currentStock = typeof v.stockQuantity === 'number' && !isNaN(v.stockQuantity) ? v.stockQuantity : 0;
            const newStock = Math.max(0, currentStock - itemToDeduct.quantity);
            return { ...v, stockQuantity: newStock, updatedAt: now };
          }
          return v;
        });
        return { ...p, variants: updatedVariants, updatedAt: now };
      });
      updatedProductsOnReturn = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_products', JSON.stringify(updated));
      }
      return updated;
    });

    // Update stock movements
    let updatedMovementsOnReturn: StockMovement[] = [];
    setStockMovements((prev) => {
      updatedMovementsOnReturn = [...newStockMovements, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_stock_movements', JSON.stringify(updatedMovementsOnReturn));
      }
      return updatedMovementsOnReturn;
    });

    // Save voucher
    let updatedReturnsList: SupplierReturnVoucher[] = [];
    setSupplierReturnVouchers((prev) => {
      updatedReturnsList = [newVoucher, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_supplier_returns', JSON.stringify(updatedReturnsList));
      }
      return updatedReturnsList;
    });

    // Broadcast channel
    try {
      syncChannelRef.current?.postMessage({
        type: 'SUPPLIER_RETURN_CREATED',
        supplierReturnVouchers: updatedReturnsList,
        stockMovements: updatedMovementsOnReturn,
        products: updatedProductsOnReturn,
      });
    } catch (e) {}

    // Cloud push
    triggerBackgroundPush({
      products: updatedProductsOnReturn || undefined,
      stockMovements: updatedMovementsOnReturn,
      supplierReturnVouchers: updatedReturnsList,
    });

    return newVoucher;
  };

  const deleteSupplierReturn = (voucherId: string, revertStock: boolean = true): boolean => {
    soundFx.playDelete();
    const targetVoucher = supplierReturnVouchers.find((v) => v.id === voucherId);
    if (!targetVoucher) return false;

    // 1. Revert stock if requested
    let updatedProductsOnRevert: Product[] | null = null;
    if (revertStock) {
      setProducts((prev) => {
        const now = Date.now();
        const updated = prev.map((p) => {
          const matchingItems = targetVoucher.items.filter((item) => item.productId === p.id);
          if (matchingItems.length === 0) return p;

          const updatedVariants = p.variants.map((v) => {
            const itemToAddBack = matchingItems.find((item) => item.variantId === v.id);
            if (itemToAddBack) {
              const currentStock = typeof v.stockQuantity === 'number' && !isNaN(v.stockQuantity) ? v.stockQuantity : 0;
              return { ...v, stockQuantity: currentStock + itemToAddBack.quantity, updatedAt: now };
            }
            return v;
          });
          return { ...p, variants: updatedVariants, updatedAt: now };
        });
        updatedProductsOnRevert = updated;
        if (typeof window !== 'undefined') {
          localStorage.setItem('huda_products', JSON.stringify(updated));
        }
        return updated;
      });
    }

    // 2. Remove associated stock movements
    let updatedMovementsOnRevert: StockMovement[] = [];
    setStockMovements((prev) => {
      updatedMovementsOnRevert = prev.filter((m) => m.referenceOrderNo !== voucherId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_stock_movements', JSON.stringify(updatedMovementsOnRevert));
      }
      return updatedMovementsOnRevert;
    });

    // 3. Remove voucher
    let updatedReturnsList: SupplierReturnVoucher[] = [];
    setSupplierReturnVouchers((prev) => {
      updatedReturnsList = prev.filter((v) => v.id !== voucherId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_supplier_returns', JSON.stringify(updatedReturnsList));
      }
      return updatedReturnsList;
    });

    // Broadcast & Cloud push
    try {
      syncChannelRef.current?.postMessage({
        type: 'SUPPLIER_RETURN_DELETED',
        supplierReturnVouchers: updatedReturnsList,
        stockMovements: updatedMovementsOnRevert,
        products: updatedProductsOnRevert,
      });
    } catch (e) {}

    triggerBackgroundPush({
      products: updatedProductsOnRevert || undefined,
      stockMovements: updatedMovementsOnRevert,
      supplierReturnVouchers: updatedReturnsList,
    });

    return true;
  };

  const cancelAndRestockOrder = async (
    orderId: string,
    options?: {
      reason?: string;
      refundPayment?: boolean;
      performedBy?: string;
    }
  ): Promise<{ success: boolean; message: string }> => {
    try {
      soundFx.playDelete();
      const now = Date.now();
      const nowIso = new Date().toISOString();

      const targetOrder = (orders || []).find((o) => o.id === orderId);
      if (!targetOrder) {
        return { success: false, message: `ไม่พบคำสั่งซื้อ #${orderId}` };
      }

      if (targetOrder.orderStatus === 'cancelled') {
        return { success: false, message: `คำสั่งซื้อ #${orderId} ได้รับการยกเลิกและคืนสต๊อกไปแล้ว` };
      }

      const safeOrderItems = Array.isArray(targetOrder.items) ? targetOrder.items : [];

      // 1. Restock items back to product variants OR booth transfer
      let updatedProductsList: Product[] = [];
      if (targetOrder.boothTransferId) {
        setBoothTransfers((prev) => {
          const updated = (prev || []).map((bt) => {
            if (bt.id !== targetOrder.boothTransferId) return bt;
            const updatedItems = (bt.items || []).map((item) => {
              const matchCancelled = safeOrderItems.find(
                (oi) => oi && oi.productId === item.productId && oi.variantId === item.variantId
              );
              if (!matchCancelled) return item;
              const newSold = Math.max(0, (item.soldQty || 0) - (matchCancelled.quantity || 0));
              const expReturn = Math.max(0, (item.dispatchedQty || 0) - newSold);
              return {
                ...item,
                soldQty: newSold,
                expectedReturnQty: expReturn,
                difference: (item.actualReturnedQty || 0) - expReturn,
              };
            });
            const totalSoldQty = updatedItems.reduce((sum, i) => sum + (i.soldQty || 0), 0);
            const totalSalesAmount = Math.max(0, (bt.totalSalesAmount || 0) - (targetOrder.netAmount || 0));
            return {
              ...bt,
              items: updatedItems,
              totalSoldQty,
              totalSalesAmount,
              updatedAt: new Date().toISOString(),
            };
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_booth_transfers', JSON.stringify(updated));
          }
          triggerBackgroundPush({ boothTransfers: updated });
          return updated;
        });
      } else {
        setProducts((prevProducts) => {
          updatedProductsList = (prevProducts || []).map((prod) => {
            if (!prod) return prod;
            const matchingItems = safeOrderItems.filter(
              (item) => item && (item.productId === prod.id || (!item.productId && item.productTitle === prod.title))
            );
            if (matchingItems.length === 0) return prod;

            const updatedVariants = (prod.variants || []).map((variant) => {
              if (!variant) return variant;
              const matchingItem = matchingItems.find(
                (item) => item && (item.variantId === variant.id || (!item.variantId && item.variantName === variant.name))
              );
              if (!matchingItem) return variant;

              const currentStock = (typeof variant.stockQuantity === 'number' && !isNaN(variant.stockQuantity)) ? variant.stockQuantity : 0;
              return {
                ...variant,
                stockQuantity: currentStock + (matchingItem.quantity || 0),
                updatedAt: now,
              };
            });

            return { ...prod, variants: updatedVariants, updatedAt: now };
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_products', JSON.stringify(updatedProductsList));
            window.dispatchEvent(
              new CustomEvent('huda_order_restocked', {
                detail: { orderId, items: safeOrderItems },
              })
            );
          }
          saveCloudProducts(updatedProductsList);
          return updatedProductsList;
        });
      }

      // 2. Void unsettled OUT movements (so store doesn't pay supplier settlement)
      // AND record IN movements for return audit trail preserving exact lotNumber and costPrice
      const returnAuditMovements: StockMovement[] = safeOrderItems.map((item, idx) => {
        const itemCost = item.costPrice !== undefined && item.costPrice > 0 ? item.costPrice : Math.round((item.price || 0) * 0.5);
        const qty = item.quantity || 1;
        return {
          id: `MOV-IN-RETURN-${now}-${idx}-${Math.floor(Math.random() * 1000)}`,
          type: 'IN',
          productId: item.productId,
          productTitle: item.productTitle,
          variantId: item.variantId,
          variantName: item.variantName,
          quantity: qty,
          costPrice: itemCost,
          totalCost: itemCost * qty,
          supplierName: 'รับคืนจากลูกค้า / ยกเลิกออเดอร์',
          referenceOrderNo: orderId,
          lotNumber: item.lotNumber || '',
          note: `รับคืนสินค้า / ยกเลิกออเดอร์ #${orderId}${options?.reason ? ` (${options.reason})` : ''}${item.lotNumber ? ` [ล็อต: ${item.lotNumber}]` : ''}`,
          performedBy: options?.performedBy || 'ผู้ดูแลระบบ (คืนสินค้า)',
          createdAt: nowIso,
          isSettled: true, // Mark settled so it never queues up for supplier payout
        };
      });

      let updatedMovementsList: StockMovement[] = [];
      setStockMovements((prevMovements) => {
        // Void OUT movements created for this order
        const remainingMovements = (prevMovements || []).filter(
          (m) => !(m && m.referenceOrderNo === orderId && m.type === 'OUT')
        );
        updatedMovementsList = [...returnAuditMovements, ...remainingMovements];

        if (typeof window !== 'undefined') {
          localStorage.setItem('huda_stock_movements', JSON.stringify(updatedMovementsList));
        }
        return updatedMovementsList;
      });

      // 3. Update order status to 'cancelled'
      const reasonText = options?.reason ? options.reason : 'ลูกค้าคืนสินค้า / ยกเลิกบิลขาย';
      let updatedOrdersList: Order[] = [];
      setOrders((prevOrders) => {
        updatedOrdersList = (prevOrders || []).map((o) => {
          if (o.id === orderId) {
            const updatedNote = o.note
              ? `${o.note} | [ยกเลิก/คืนสต๊อก: ${reasonText}]`
              : `[ยกเลิก/คืนสต๊อก: ${reasonText}]`;
            return {
              ...o,
              orderStatus: 'cancelled' as const,
              paymentStatus: (options?.refundPayment ? 'refunded' : o.paymentStatus) as Order['paymentStatus'],
              note: updatedNote,
              cancelledAt: nowIso,
              cancellationReason: reasonText,
              updatedAt: nowIso,
            };
          }
          return o;
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('huda_orders', JSON.stringify(updatedOrdersList));
        }
        saveCloudOrders(updatedOrdersList);
        return updatedOrdersList;
      });

      if (typeof window !== 'undefined') {
        try {
          syncChannelRef.current?.postMessage({
            type: 'ORDERS_UPDATED',
            orders: updatedOrdersList,
            products: updatedProductsList,
            stockMovements: updatedMovementsList,
          });
        } catch (e) {}
      }

      // 4. Background push to Cloud Storage
      triggerBackgroundPush({
        products: updatedProductsList,
        orders: updatedOrdersList,
        stockMovements: updatedMovementsList,
      });

      const totalQty = safeOrderItems.reduce((s, it) => s + (it.quantity || 0), 0);
      return {
        success: true,
        message: `ยกเลิกคำสั่งซื้อ #${orderId} สำเร็จ และดึงสินค้าคืนสต๊อก ${totalQty} ชิ้น เรียบร้อยแล้ว`,
      };
    } catch (err: any) {
      console.error('Error in cancelAndRestockOrder:', err);
      return {
        success: false,
        message: `เกิดข้อผิดพลาดในการคืนสต๊อก: ${err?.message || 'โปรดลองใหม่อีกครั้ง'}`,
      };
    }
  };

  const verifySupervisorPin = (pin: string): { valid: boolean; approverName?: string } => {
    const trimmed = String(pin || '').trim();
    const ownerCode = String(storeSettings?.adminPasscode || '1077').trim();
    if (trimmed === ownerCode) {
      return { valid: true, approverName: 'เจ้าของร้าน (Admin)' };
    }
    const matched = (staffUsers || []).find(
      (u) =>
        (u.isActive ?? u.active ?? true) &&
        String(u.pin || '').trim() === trimmed &&
        (u.role === 'OWNER' || u.permissions?.canVoidPOSOrder)
    );
    if (matched) {
      return { valid: true, approverName: matched.name };
    }
    return { valid: false };
  };

  const refundOrderItems = async (params: {
    orderId: string;
    refundItems: Array<{
      productId: string;
      variantId: string;
      quantity: number;
      price: number;
      productTitle: string;
      variantName: string;
    }>;
    refundAmount: number;
    refundMethod: 'cash' | 'transfer';
    reason: string;
    performedBy: string;
    approvedBy?: string;
  }): Promise<{ success: boolean; message: string; updatedOrder?: Order }> => {
    try {
      soundFx.playDelete();
      const now = Date.now();
      const nowIso = new Date().toISOString();

      const targetOrder = (orders || []).find((o) => o.id === params.orderId);
      if (!targetOrder) {
        return { success: false, message: `ไม่พบคำสั่งซื้อ #${params.orderId}` };
      }

      if (targetOrder.orderStatus === 'cancelled') {
        return { success: false, message: `คำสั่งซื้อ #${params.orderId} ได้รับการยกเลิกไปแล้ว` };
      }

      const safeRefundItems = Array.isArray(params.refundItems) ? params.refundItems : [];
      const safeOrderItems = Array.isArray(targetOrder.items) ? targetOrder.items : [];

      // 1. Restock refunded items to Booth Transfer or Central Products
      let updatedProductsList: Product[] = [];
      if (targetOrder.boothTransferId) {
        setBoothTransfers((prev) => {
          const updated = (prev || []).map((bt) => {
            if (bt.id !== targetOrder.boothTransferId) return bt;
            const updatedItems = (bt.items || []).map((item) => {
              const matchRefund = safeRefundItems.find(
                (ri) => ri && ri.productId === item.productId && ri.variantId === item.variantId
              );
              if (!matchRefund) return item;
              const newSold = Math.max(0, (item.soldQty || 0) - (matchRefund.quantity || 0));
              const expReturn = Math.max(0, (item.dispatchedQty || 0) - newSold);
              return {
                ...item,
                soldQty: newSold,
                expectedReturnQty: expReturn,
                difference: (item.actualReturnedQty || 0) - expReturn,
              };
            });
            const totalSoldQty = updatedItems.reduce((sum, i) => sum + (i.soldQty || 0), 0);
            const totalSalesAmount = Math.max(0, (bt.totalSalesAmount || 0) - (params.refundAmount || 0));
            return {
              ...bt,
              items: updatedItems,
              totalSoldQty,
              totalSalesAmount,
              updatedAt: nowIso,
            };
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_booth_transfers', JSON.stringify(updated));
          }
          triggerBackgroundPush({ boothTransfers: updated });
          return updated;
        });
      } else {
        setProducts((prevProducts) => {
          updatedProductsList = (prevProducts || []).map((prod) => {
            if (!prod) return prod;
            const matchingRefunds = safeRefundItems.filter((ri) => ri && ri.productId === prod.id);
            if (matchingRefunds.length === 0) return prod;
            const updatedVariants = (prod.variants || []).map((variant) => {
              if (!variant) return variant;
              const matchVar = matchingRefunds.find((ri) => ri && ri.variantId === variant.id);
              if (!matchVar) return variant;
              const currentStock = typeof variant.stockQuantity === 'number' && !isNaN(variant.stockQuantity) ? variant.stockQuantity : 0;
              return {
                ...variant,
                stockQuantity: currentStock + (matchVar.quantity || 0),
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
      }

      // 2. Determine if all items in order are refunded
      const totalOrderItemsCount = safeOrderItems.reduce((s, it) => s + (it.quantity || 0), 0);
      const totalRefundedCount = safeRefundItems.reduce((s, it) => s + (it.quantity || 0), 0);
      const isFullRefund = totalRefundedCount >= totalOrderItemsCount || params.refundAmount >= (targetOrder.netAmount || 0);

      // 3. Update order
      let updatedOrderResult: Order | undefined;
      let updatedOrdersList: Order[] = [];

      setOrders((prev) => {
        updatedOrdersList = (prev || []).map((order) => {
          if (order.id !== params.orderId) return order;

          const refundLog = `[คืนเงิน ฿${(params.refundAmount || 0).toLocaleString()} (${params.refundMethod === 'cash' ? 'เงินสด' : 'โอนคืน'}) | พนักงาน: ${params.performedBy}${params.approvedBy ? ` (อนุมัติโดย: ${params.approvedBy})` : ''} | เหตุผล: ${params.reason}]`;
          const updatedNote = order.note ? `${order.note} | ${refundLog}` : refundLog;

          const updatedOrder: Order = {
            ...order,
            orderStatus: isFullRefund ? 'cancelled' : order.orderStatus,
            paymentStatus: isFullRefund ? 'refunded' : order.paymentStatus,
            note: updatedNote,
            updatedAt: nowIso,
          };
          updatedOrderResult = updatedOrder;
          return updatedOrder;
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('huda_orders', JSON.stringify(updatedOrdersList));
        }
        saveCloudOrders(updatedOrdersList);
        return updatedOrdersList;
      });

      // 4. Record stock movement IN for returned audit trail
      const returnAuditMovements: StockMovement[] = safeRefundItems.map((item, idx) => {
        const itemCost = Math.round((item.price || 0) * 0.5);
        const qty = item.quantity || 1;
        return {
          id: `MOV-IN-REFUND-${now}-${idx}-${Math.floor(Math.random() * 1000)}`,
          type: 'IN',
          productId: item.productId,
          productTitle: item.productTitle,
          variantId: item.variantId,
          variantName: item.variantName,
          quantity: qty,
          costPrice: itemCost,
          totalCost: itemCost * qty,
          supplierName: 'รับคืนสินค้า / ขอคืนเงินหน้าร้าน POS',
          referenceOrderNo: params.orderId,
          note: `รับคืนสินค้า POS #${params.orderId} (คืนเงิน ฿${(params.refundAmount || 0).toLocaleString()}) [${params.reason}]`,
          performedBy: params.performedBy,
          createdAt: nowIso,
          isSettled: true,
        };
      });

      let updatedMovementsList: StockMovement[] = [];
      setStockMovements((prev) => {
        updatedMovementsList = [...returnAuditMovements, ...(prev || [])];
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

      return {
        success: true,
        message: `บันทึกขอคืนเงินบิล #${params.orderId} สำเร็จ (คืนเงิน ฿${(params.refundAmount || 0).toLocaleString()}) ดึงสต๊อกกลับเข้าระบบแล้ว`,
        updatedOrder: updatedOrderResult,
      };
    } catch (err: any) {
      console.error('Error in refundOrderItems:', err);
      return {
        success: false,
        message: `เกิดข้อผิดพลาดในการคืนเงิน: ${err?.message || 'โปรดลองใหม่อีกครั้ง'}`,
      };
    }
  };

  const exchangeOrderItem = async (params: {
    orderId: string;
    boothTransferId?: string | null;
    returnItem: {
      productId: string;
      variantId: string;
      quantity: number;
      price: number;
      productTitle: string;
      variantName: string;
    };
    newItem: {
      productId: string;
      variantId: string;
      quantity: number;
      price: number;
      productTitle: string;
      variantName: string;
    };
    priceDifference: number;
    paymentMethodForDiff?: 'cash' | 'promptpay' | 'none';
    performedBy: string;
    approvedBy?: string;
    reason?: string;
  }): Promise<{ success: boolean; message: string; updatedOrder?: Order }> => {
    try {
      soundFx.playSuccess();
      const now = Date.now();
      const nowIso = new Date().toISOString();

      const targetOrder = (orders || []).find((o) => o.id === params.orderId);
      if (!targetOrder) {
        return { success: false, message: `ไม่พบคำสั่งซื้อ #${params.orderId}` };
      }

      // 1. Adjust inventory
      let updatedProductsList: Product[] = [];
      const effectiveBoothId = params.boothTransferId || targetOrder.boothTransferId;
      if (effectiveBoothId) {
        setBoothTransfers((prev) => {
          const updated = (prev || []).map((bt) => {
            if (bt.id !== effectiveBoothId) return bt;
            let foundNew = false;
            const updatedItems = (bt.items || []).map((item) => {
              if (item.productId === params.returnItem.productId && item.variantId === params.returnItem.variantId) {
                const newSold = Math.max(0, (item.soldQty || 0) - (params.returnItem.quantity || 0));
                const expReturn = Math.max(0, (item.dispatchedQty || 0) - newSold);
                return {
                  ...item,
                  soldQty: newSold,
                  expectedReturnQty: expReturn,
                  difference: (item.actualReturnedQty || 0) - expReturn,
                };
              }
              if (item.productId === params.newItem.productId && item.variantId === params.newItem.variantId) {
                foundNew = true;
                const newSold = (item.soldQty || 0) + (params.newItem.quantity || 0);
                const expReturn = Math.max(0, (item.dispatchedQty || 0) - newSold);
                return {
                  ...item,
                  soldQty: newSold,
                  expectedReturnQty: expReturn,
                  difference: (item.actualReturnedQty || 0) - expReturn,
                };
              }
              return item;
            });

            if (!foundNew) {
              updatedItems.push({
                productId: params.newItem.productId,
                variantId: params.newItem.variantId,
                productTitle: params.newItem.productTitle,
                variantName: params.newItem.variantName,
                sku: '',
                price: params.newItem.price,
                dispatchedQty: 0,
                soldQty: params.newItem.quantity || 1,
                expectedReturnQty: -(params.newItem.quantity || 1),
                actualReturnedQty: 0,
                difference: -(params.newItem.quantity || 1),
              });
            }

            const totalSalesAmount = Math.max(0, (bt.totalSalesAmount || 0) + (params.priceDifference || 0));
            return {
              ...bt,
              items: updatedItems,
              totalSalesAmount,
              updatedAt: nowIso,
            };
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_booth_transfers', JSON.stringify(updated));
          }
          triggerBackgroundPush({ boothTransfers: updated });
          return updated;
        });
      } else {
        setProducts((prev) => {
          updatedProductsList = (prev || []).map((prod) => {
            if (!prod) return prod;
            let updatedVariants = prod.variants || [];
            let changed = false;

            if (prod.id === params.returnItem.productId) {
              updatedVariants = updatedVariants.map((v) => {
                if (v && v.id === params.returnItem.variantId) {
                  changed = true;
                  const currentStock = typeof v.stockQuantity === 'number' && !isNaN(v.stockQuantity) ? v.stockQuantity : 0;
                  return { ...v, stockQuantity: currentStock + (params.returnItem.quantity || 0) };
                }
                return v;
              });
            }
            if (prod.id === params.newItem.productId) {
              updatedVariants = updatedVariants.map((v) => {
                if (v && v.id === params.newItem.variantId) {
                  changed = true;
                  const currentStock = typeof v.stockQuantity === 'number' && !isNaN(v.stockQuantity) ? v.stockQuantity : 0;
                  return { ...v, stockQuantity: Math.max(0, currentStock - (params.newItem.quantity || 0)) };
                }
                return v;
              });
            }

            if (changed) {
              return { ...prod, variants: updatedVariants, updatedAt: now };
            }
            return prod;
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_products', JSON.stringify(updatedProductsList));
          }
          saveCloudProducts(updatedProductsList);
          return updatedProductsList;
        });
      }

      // 2. Update order items list
      let updatedOrderResult: Order | undefined;
      let updatedOrdersList: Order[] = [];

      setOrders((prev) => {
        updatedOrdersList = (prev || []).map((order) => {
          if (order.id !== params.orderId) return order;

          const updatedItems: CartItem[] = [];
          let returnedFound = false;

          (order.items || []).forEach((it) => {
            if (it && it.productId === params.returnItem.productId && it.variantId === params.returnItem.variantId && !returnedFound) {
              returnedFound = true;
              const remainingQty = (it.quantity || 1) - (params.returnItem.quantity || 1);
              if (remainingQty > 0) {
                updatedItems.push({ ...it, quantity: remainingQty });
              }
            } else if (it) {
              updatedItems.push(it);
            }
          });

          const existingNewItemIdx = updatedItems.findIndex(
            (it) => it && it.productId === params.newItem.productId && it.variantId === params.newItem.variantId
          );
          if (existingNewItemIdx >= 0) {
            updatedItems[existingNewItemIdx] = {
              ...updatedItems[existingNewItemIdx],
              quantity: (updatedItems[existingNewItemIdx].quantity || 0) + (params.newItem.quantity || 1),
            };
          } else {
            updatedItems.push({
              productId: params.newItem.productId,
              productTitle: params.newItem.productTitle,
              productImage: '',
              variantId: params.newItem.variantId,
              variantName: params.newItem.variantName,
              price: params.newItem.price,
              quantity: params.newItem.quantity || 1,
              category: 'abaya_dubai',
            });
          }

          const diffText =
            params.priceDifference > 0
              ? `ลูกค้าจ่ายเพิ่ม ฿${params.priceDifference.toLocaleString()} (${params.paymentMethodForDiff === 'cash' ? 'เงินสด' : 'สแกนจ่าย'})`
              : params.priceDifference < 0
              ? `ร้านคืนส่วนต่าง ฿${Math.abs(params.priceDifference).toLocaleString()}`
              : 'ราคาเท่ากัน (฿0)';

          const exchangeLog = `[เปลี่ยนสินค้า ${new Date().toLocaleTimeString('th-TH')}: คืน ${params.returnItem.productTitle} (${params.returnItem.variantName}) -> รับ ${params.newItem.productTitle} (${params.newItem.variantName}) | ${diffText} | พนักงาน: ${params.performedBy}${params.approvedBy ? ` (อนุมัติโดย: ${params.approvedBy})` : ''}${params.reason ? ` | เหตุผล: ${params.reason}` : ''}]`;

          const updatedNote = order.note ? `${order.note} | ${exchangeLog}` : exchangeLog;

          const updatedOrder: Order = {
            ...order,
            items: updatedItems,
            netAmount: Math.max(0, (order.netAmount || 0) + (params.priceDifference || 0)),
            totalAmount: Math.max(0, (order.totalAmount || 0) + (params.priceDifference || 0)),
            note: updatedNote,
            exchangedAt: nowIso,
            exchangeDetails: exchangeLog,
            performedBy: params.performedBy,
            approvedBy: params.approvedBy,
            updatedAt: nowIso,
          };
          updatedOrderResult = updatedOrder;
          return updatedOrder;
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('huda_orders', JSON.stringify(updatedOrdersList));
        }
        saveCloudOrders(updatedOrdersList);
        return updatedOrdersList;
      });

      triggerBackgroundPush({
        ...(updatedProductsList.length > 0 ? { products: updatedProductsList } : {}),
        orders: updatedOrdersList,
      });

      return {
        success: true,
        message: `ทำรายการเปลี่ยนสินค้าสำเร็จ! คืน ${params.returnItem.variantName} -> ได้รับ ${params.newItem.variantName} เรียบร้อยแล้ว`,
        updatedOrder: updatedOrderResult,
      };
    } catch (err: any) {
      console.error('Error in exchangeOrderItem:', err);
      return {
        success: false,
        message: `เกิดข้อผิดพลาดในการเปลี่ยนสินค้า: ${err?.message || 'โปรดลองใหม่อีกครั้ง'}`,
      };
    }
  };

  const updateOrderStatus = (
    orderId: string,
    orderStatus: Order['orderStatus'],
    trackingNumber?: string,
    courier?: string
  ) => {
    if (orderStatus === 'cancelled') {
      cancelAndRestockOrder(orderId, { reason: 'เปลี่ยนสถานะเป็น ยกเลิกออเดอร์ (Cancelled)' });
      return;
    }

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

  const deleteOrders = (orderIds: string[], revertStock: boolean = true) => {
    if (!orderIds || orderIds.length === 0) return;
    const targetIdSet = new Set(orderIds);
    const targetOrders = orders.filter((o) => targetIdSet.has(o.id));
    let updatedProductsOnDelete: Product[] | null = null;

    if (revertStock && targetOrders.length > 0) {
      // Gather all items from valid non-cancelled orders to revert stock
      const itemsToRevert: { productId?: string; productTitle: string; variantId?: string; variantName: string; quantity: number }[] = [];
      targetOrders.forEach((o) => {
        if (o.orderStatus !== 'cancelled' && Array.isArray(o.items)) {
          o.items.forEach((item) => {
            itemsToRevert.push({
              productId: item.productId,
              productTitle: item.productTitle,
              variantId: item.variantId,
              variantName: item.variantName,
              quantity: item.quantity,
            });
          });
        }
      });

      if (itemsToRevert.length > 0) {
        const now = Date.now();
        setProducts((prevProducts) => {
          const updated = prevProducts.map((prod) => {
            const matchingItems = itemsToRevert.filter(
              (item) => item.productId === prod.id || (!item.productId && item.productTitle === prod.title)
            );
            if (matchingItems.length === 0) return prod;

            const updatedVariants = prod.variants.map((variant) => {
              const matchedForVariant = matchingItems.filter(
                (item) => item.variantId === variant.id || (!item.variantId && item.variantName === variant.name)
              );
              if (matchedForVariant.length === 0) return variant;

              const totalQtyToAdd = matchedForVariant.reduce((sum, it) => sum + (it.quantity || 0), 0);
              const currentStock = (typeof variant.stockQuantity === 'number' && !isNaN(variant.stockQuantity)) ? variant.stockQuantity : 0;
              return {
                ...variant,
                stockQuantity: currentStock + totalQtyToAdd,
                updatedAt: now,
              };
            });

            return { ...prod, variants: updatedVariants, updatedAt: now };
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem('huda_products', JSON.stringify(updated));
          }
          saveCloudProducts(updated);
          updatedProductsOnDelete = updated;
          return updated;
        });
      }
    }

    let updatedSetArr: string[] = [];
    setDeletedOrderIds((prevSet) => {
      const updatedSet = new Set(Array.from(prevSet));
      orderIds.forEach((id) => updatedSet.add(id));
      updatedSetArr = Array.from(updatedSet);
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_deleted_order_ids', JSON.stringify(updatedSetArr));
      }
      return updatedSet;
    });

    let updatedOrdersList: Order[] = [];
    setOrders((prev) => {
      updatedOrdersList = prev.filter((o) => !targetIdSet.has(o.id));
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_orders', JSON.stringify(updatedOrdersList));
      }
      saveCloudOrders(updatedOrdersList);
      return updatedOrdersList;
    });

    // Sync Stock Movements for Unsettled Sales Breakdown
    let updatedMovementsList: StockMovement[] = [];
    setStockMovements((prevMovements) => {
      updatedMovementsList = prevMovements.filter((m) => !m.referenceOrderNo || !targetIdSet.has(m.referenceOrderNo));
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_stock_movements', JSON.stringify(updatedMovementsList));
      }
      return updatedMovementsList;
    });

    if (typeof window !== 'undefined') {
      try {
        syncChannelRef.current?.postMessage({
          type: 'ORDERS_UPDATED',
          orders: updatedOrdersList,
          products: updatedProductsOnDelete || undefined,
          stockMovements: updatedMovementsList,
        });
      } catch (e) {}
    }

    triggerBackgroundPush({
      ...(updatedProductsOnDelete ? { products: updatedProductsOnDelete } : {}),
      orders: updatedOrdersList,
      deletedOrderIds: updatedSetArr,
      stockMovements: updatedMovementsList,
    });
  };

  const deleteOrder = (orderId: string, revertStock: boolean = false) => {
    deleteOrders([orderId], revertStock);
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
        syncChannelRef.current?.postMessage({ type: 'PRODUCTS_UPDATED', products: updated });
      }
      saveCloudProducts(updated);
      triggerBackgroundPush({ products: updated }, true);
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

    if (typeof window !== 'undefined') {
      try {
        syncChannelRef.current?.postMessage({
          type: 'PRODUCTS_UPDATED',
          products: updatedProductsList,
          stockMovements: updatedMovementsList,
        });
      } catch (e) {}
    }

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
        syncChannelRef.current?.postMessage({ type: 'PRODUCTS_UPDATED', products: updated });
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

  const testLineNotification = async (customMsg?: string, settingsOverride?: StoreSettings): Promise<{ success: boolean; error?: string }> => {
    const msg = customMsg || `🔔 [HUDA ABAYA DUBAI]\n━━━━━━━━━━━━━━━\nทดสอบเชื่อมต่อระบบแจ้งเตือน LINE สำเร็จ 100%!\n\nระบบพร้อมส่งการแจ้งเตือน:\n✅ ออเดอร์ใหม่จากลูกค้า\n✅ ลูกค้าแนบสลิปโอนเงิน\n✅ สินค้าสต๊อกใกล้หมด\n✅ สรุปยอดขายประจำวัน\n━━━━━━━━━━━━━━━\n⏰ เวลาทดสอบ: ${new Date().toLocaleTimeString('th-TH')} น.`;
    return sendLineNotification(msg, settingsOverride || storeSettings);
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        cart,
        orders,
        stockMovements,
        supplierSettlements,
        supplierReturnVouchers,
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
        cancelAndRestockOrder,
        deleteOrder,
        deleteOrders,
        clearSampleOrders,
        clearAllOrders,
        clearAllProducts,
        addProduct,
        updateProduct,
        updateVariantStock,
        deleteProduct,
        recordStockIn,
        recordStockInBatch,
        deleteStockMovement,
        trashedStockMovements,
        restoreStockMovement,
        permanentlyDeleteStockMovement,
        clearTrashedStockMovements,
        createSupplierSettlement,
        cancelSupplierSettlement,
        createSupplierReturn,
        deleteSupplierReturn,
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
        notifyEventScheduleToLine,
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
        boothTransfers,
        setBoothTransfers,
        createBoothTransfer,
        updateBoothTransfer,
        deleteBoothTransfer,
        replenishBoothTransfer,
        reconcileAndReturnBoothTransfer,
        syncStatus,
        lastSyncTime,
        forceRealtimeSync,
        customOptions,
        saveCustomOption,
        staffUsers,
        currentStaff,
        addStaffUser,
        updateStaffUser,
        deleteStaffUser,
        setCurrentStaff,
        refundOrderItems,
        exchangeOrderItem,
        verifySupervisorPin,
        syncStaffUsersToCloud,
        syncBoothTransfersToCloud,
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
