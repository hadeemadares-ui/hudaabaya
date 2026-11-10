export type CategoryType = 'all' | 'abaya' | 'kaftan' | 'perfume' | 'combo' | 'incense' | 'other' | (string & {});
export type CurrencyType = 'THB' | 'AED' | 'USD' | 'EUR';

export interface ProductVariant {
  id: string;
  name: string; // e.g. Size 52 (สีดำ), Size 54 (สีทอง)
  sku: string;
  barcode?: string;
  price: number;
  costPrice?: number; // Optional Cost Price per variant
  originalPrice?: number;
  stockQuantity: number;
  color?: string; // Optional product color choice
  updatedAt?: number | string;
}

export interface Product {
  id: string;
  title: string;
  arabicTitle?: string;
  category: CategoryType;
  description: string;
  fabric?: string;
  origin?: string;
  costPrice?: number; // Optional Cost Price for product
  images: string[];
  variants: ProductVariant[];
  colors?: string[]; // List of available colors
  featured?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  discountPercent?: number;
  rating?: number;
  reviewsCount?: number;
  has3DView?: boolean;
  hasARFit?: boolean;
  version?: number;
  updatedAt?: number | string;
  fragranceNotes?: {
    top: string;
    heart: string;
    base: string;
  };
}

export interface CartItem {
  productId: string;
  productTitle: string;
  productImage: string;
  variantId: string;
  variantName: string;
  price: number;
  costPrice?: number; // Cost Price per item
  quantity: number;
  category: CategoryType;
  fabric?: string;
  lotNumber?: string; // เลขล็อตเฉพาะของชิ้นที่ขาย (เช่น 2-69 หรือ HUDA-A001-2-69)
}

export type PaymentMethodType = 'promptpay' | 'bank_transfer' | 'credit_card' | 'cod' | 'truemoney' | 'crypto';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
  note?: string;
  items: CartItem[];
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  netAmount: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: 'pending' | 'slip_uploaded' | 'paid' | 'rejected' | 'refunded';
  slipImage?: string;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  courier?: string;
  boothTransferId?: string; // ID of the Booth Transfer if ordered from a booth POS
  branchName?: string; // Branch / Booth Name
  isSample?: boolean; // Flag to identify test/sample orders for safe reset without data loss
  createdAt: string; // UTC ISO 8601 String
  updatedAt?: string; // UTC ISO 8601 String
  cancelledAt?: string; // UTC ISO 8601 String
  cancellationReason?: string;
  refundedAt?: string;
  refundAmount?: number;
  refundReason?: string;
  refundMethod?: 'cash' | 'transfer';
  exchangedAt?: string;
  exchangeDetails?: string;
  approvedBy?: string;
  performedBy?: string;
}

export interface Coupon {
  code: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  minSpend: number;
  description: string;
}

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  productName: string;
}

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESET_SAMPLES' | 'CLEAR_DATA';
  target: 'PRODUCT' | 'ORDER' | 'SETTINGS' | 'SYSTEM';
  description: string;
  performedBy: string;
  timestamp: string; // UTC ISO String
  meta?: any;
}

export interface StockMovement {
  id: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  productId: string;
  productTitle: string;
  variantId: string;
  variantName: string;
  quantity: number;
  costPrice: number;
  totalCost: number;
  supplierName: string;
  referenceOrderNo?: string;
  note?: string;
  performedBy: string;
  createdAt: string; // ISO String
  isSettled?: boolean; // True if cost paid to supplier
  settlementId?: string; // Settlement Voucher ID
  lotNumber?: string; // e.g. LOT-20261021-01
}

export interface TrashedStockMovement {
  id: string;
  movement: StockMovement;
  revertedStock: boolean;
  deletedAt: string;
}

export interface SupplierSettlement {
  id: string; // e.g. SETTLE-202609-001
  supplierName: string;
  periodStart: string;
  periodEnd: string;
  totalItemsCount: number;
  totalCostAmount: number;
  status: 'SETTLED' | 'PENDING';
  settledAt: string;
  paymentRef?: string;
  note?: string;
  movementIds: string[];
  slipImageUrl?: string;
}

export interface SupplierReturnItem {
  productId: string;
  productTitle: string;
  variantId: string;
  variantName: string;
  quantity: number;
  costPrice: number;
  totalCost: number;
  lotNumber?: string;
  reason: string; // เช่น 'สินค้าชำรุด / มีตำหนิ', 'หมดสัญญาฝากขาย / คืนของค้างสต็อก', 'เปลี่ยนแบบ / เปลี่ยนไซส์', 'สินค้าไม่ตรงสเปก', 'อื่นๆ'
}

export interface SupplierReturnVoucher {
  id: string; // e.g. RET-20261104-001
  returnDate: string; // ISO date string YYYY-MM-DD
  supplierName: string;
  items: SupplierReturnItem[];
  totalQuantity: number;
  totalReturnCost: number;
  note?: string;
  performedBy: string; // พนักงานผู้ส่งคืน
  receiverName?: string; // ตัวแทน Supplier ผู้รับคืน
  proofImageUrl?: string; // ภาพสลิป / ภาพตำหนิ / เอกสารเซ็นรับ
  createdAt: string; // ISO Timestamp
}

export type CoordinationPhotoCategory = 'layout' | 'chat' | 'business_card' | 'contract' | 'receipt' | 'other';

export interface EventCoordinationImage {
  id: string;
  url: string; // Base64 data URL
  caption?: string; // คำอธิบายภาพ / บันทึกช่วยจำ เช่น "ผังล็อก A12", "คุยไลน์กับคุณฟารีดา"
  category?: CoordinationPhotoCategory; // หมวดหมู่: layout (ผังบูธ) | chat (แชทไลน์) | business_card (นามบัตร) | contract (สัญญา) | receipt (ใบเสร็จ) | other
  createdAt?: string;
}

export interface EventSchedule {
  id: string;
  title: string;
  branchName: string;
  location: string;
  startDate: string;
  endDate: string;
  operatingHours: string;
  productsToPrepare: string;
  phonePromptPay: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'TRANSFERRED' | 'CANCELLED';
  missedReason?: string; // เหตุผลที่ไม่ได้งาน เช่น ล็อกเต็ม, สละสิทธิ์, ไม่ผ่านเกณฑ์, ค่าที่สูงเกินไป, ผู้จัดเลื่อน
  salesTarget?: number;
  actualSales?: number;
  assignedStaff?: string;
  rentalFee?: number; // ราคาค่าเช่าสถานที่ออกบูท / ค่าที่ (บาท)
  depositAmount?: number; // จำนวนเงินมัดจำ (บาท)
  depositSlipUrl?: string; // แนบไฟล์ภาพหลักฐานการโอนเงินมัดจำ (Base64 Data URL)
  travelExpense?: number; // ค่าเดินทาง / ค่าน้ำมัน / ค่ารถ / ค่าทางด่วน (บาท)
  googleMapsUrl?: string; // ลิงก์แผนที่ปักหมุด Google Maps
  organizerContact?: string; // เบอร์ติดต่อคนที่ให้ไปตั้งร้าน / ผู้จัดงาน / ผู้ดูแลพื้นที่
  organizerName?: string; // ชื่อผู้ติดต่อ / ผู้จัดงาน / ผู้ดูแลพื้นที่ (สำหรับติดต่อรอบหน้า)
  organizerPhone?: string; // เบอร์โทรศัพท์ผู้ติดต่อ (สำหรับโทรจองบูธครั้งหน้า/ปีหน้า)
  organizerLine?: string; // LINE ID ผู้ติดต่อ
  boothNumber?: string; // เลขล็อก / โซนบูธ เช่น ล็อก A12, โซนหน้าเวที
  images?: string[]; // รูปภาพประกอบงานออกบูธ เช่น บรรยากาศ, ผังบูธ, สถานที่, สัญญา (สูงสุด 4-6 รูป)
  coordinationPhotos?: EventCoordinationImage[]; // รายการรูปภาพการติดต่อประสานงานออกบูธ / ผังบูธ / แชทไลน์ / นามบัตร (พร้อมคำอธิบาย หมวดหมู่ และการจัดการเพิ่ม/ลบ/แก้ไข)
  transfereeName?: string; // ชื่อผู้รับต่อบูธ / ชื่อร้านที่รับเซ้งต่อ
  transfereePhone?: string; // เบอร์โทรศัพท์ของผู้รับต่อ
  transferPrice?: number; // ยอดเงินที่ปล่อยต่อได้ / เงินที่ได้รับชดเชย (บาท)
  transferDate?: string; // วันที่ส่งต่อบูธ
  transferNote?: string; // หมายเหตุการปล่อยต่อ
  transferSlipUrl?: string; // สลิปหรือหลักฐานการโอนเงินจากผู้รับต่อ
  note?: string;
  createdAt: string;
}

export interface BoothTransferItem {
  productId: string;
  variantId: string;
  productTitle: string;
  variantName: string;
  sku: string;
  price: number;
  costPrice?: number;
  image?: string;
  dispatchedQty: number; // จำนวนที่เบิกไปบูธ
  soldQty: number; // จำนวนที่ขายผ่าน POS ของบูธนี้
  expectedReturnQty: number; // ต้องเหลือคืน = dispatchedQty - soldQty
  actualReturnedQty: number; // จำนวนที่นับคืนได้จริงตอนจบงาน
  damagedQty?: number; // ของชำรุด/มีตำหนิ
  difference: number; // actualReturnedQty - expectedReturnQty (0 = ครบ, ติดลบ = หาย, บวก = เกิน)
  note?: string;
}

export interface BoothReplenishmentLog {
  id: string; // e.g. REP-1
  timestamp: string;
  staffName: string;
  totalQtyAdded: number;
  note?: string;
  items: {
    productId: string;
    variantId: string;
    productTitle: string;
    variantName: string;
    addedQty: number;
  }[];
}

export interface BoothStockTransfer {
  id: string; // e.g. TRF-20261027-001
  eventId?: string; // ID ของตารางออกงาน EventSchedule
  eventName: string; // ชื่องาน เช่น งานออกบูธตลาดนัดคลอง 16
  branchName: string; // ชื่อสาขา / บูธ
  status: 'PREPARING' | 'DISPATCHED' | 'SELLING' | 'RETURNING' | 'COMPLETED';
  dispatchDate: string; // วันที่เบิกของ
  returnDate?: string; // วันที่ตรวจนับคืน
  staffName: string; // ผู้ดูแล / ผู้เบิก
  items: BoothTransferItem[];
  totalDispatchedQty: number;
  totalSoldQty: number;
  totalActualReturnedQty: number;
  totalSalesAmount: number;
  isReconciled: boolean;
  replenishments?: BoothReplenishmentLog[]; // ประวัติการเบิกของเติมเข้าบูธเพิ่มเติม
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffPermissions {
  canAccessPOS: boolean; // ขายหน้าร้าน POS
  canAccessBoothStock: boolean; // เบิกของออกบูธ / เติมของ
  canAccessBoothReturn: boolean; // ตรวจนับสต๊อกคืนคลัง
  canAccessEvents: boolean; // ดูตารางออกบูธ
  canVoidPOSOrder: boolean; // สิทธิ์ยกเลิกบิลขาย / ขอคืนเงิน
  canExchangeProduct: boolean; // สิทธิ์เปลี่ยนสินค้า
}

export const DEFAULT_STAFF_PERMISSIONS: StaffPermissions = {
  canAccessPOS: true,
  canAccessBoothStock: true,
  canAccessBoothReturn: true,
  canAccessEvents: true,
  canVoidPOSOrder: false,
  canExchangeProduct: true,
};

export const OWNER_PERMISSIONS: StaffPermissions = {
  canAccessPOS: true,
  canAccessBoothStock: true,
  canAccessBoothReturn: true,
  canAccessEvents: true,
  canVoidPOSOrder: true,
  canExchangeProduct: true,
};

export interface StaffUser {
  id: string; // e.g. "STF-20261027-01"
  name: string; // e.g. "น้องมีนา"
  phone?: string;
  pin: string; // 4-digit PIN e.g. "1122"
  role: 'OWNER' | 'STAFF'; // OWNER = all access, STAFF = POS & Booth & Events only (ซ่อนต้นทุนและกำไร)
  assignedBranch?: string; // e.g. "บูธคลอง 16"
  active: boolean; // true = active, false = disabled
  isActive?: boolean;
  permissions?: StaffPermissions;
  createdAt: string;
  updatedAt?: number;
  lastLoginAt?: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  logoLetter: string;
  logoImageUrl: string;
  topAnnouncement: string;
  showHeroBanner?: boolean; // สวิตช์ เปิด/ปิด สไลด์โชว์สินค้าหน้าแรก
  contactPhone: string;
  contactLine: string;
  contactAddress: string;
  bankName: string;
  bankAccountNo: string;
  bankAccountName: string;
  promptPayNumber: string;
  lowStockThreshold?: number;
  adminPasscode?: string; // Password protection for Backoffice
  appsScriptWebhookUrl?: string; // Google Apps Script Webhook URL for 2-Way Sync
  googleSheetUrl?: string; // Google Sheets CSV / Edit URL for 1-Click Live Stock Sync
  googleSheetLastSync?: string; // Timestamp of last Google Sheet sync
  
  // LINE Notification & Bot Settings
  lineNotifyEnabled?: boolean;
  lineNotifyToken?: string; // LINE Notify Token or Line Messaging API Channel Access Token
  lineChannelId?: string; // LINE Channel ID
  lineChannelSecret?: string; // LINE Channel Secret
  lineUserId?: string; // LINE Target User ID or Group ID
  lineWebhookUrl?: string; // LINE Webhook (e.g. Google Apps Script / Make / Discord)
  lineNotifyOnNewOrder?: boolean; // แจ้งเตือนเมื่อมีออเดอร์ใหม่
  lineNotifyOnSlipUpload?: boolean; // แจ้งเตือนเมื่อลูกค้าแนบสลิปโอนเงิน
  lineNotifyOnLowStock?: boolean; // แจ้งเตือนเมื่อสต๊อกใกล้หมด
  lineNotifyOnDailySummary?: boolean; // แจ้งเตือนสรุปยอดขายประจำวัน
  lineNotifyOnEventSchedule?: boolean; // แจ้งเตือนตารางออกบูธ/ตลาดนัด
  enablePromptPay?: boolean;
  enableBankTransfer?: boolean;
  enableCreditCard?: boolean;
  enableCOD?: boolean;
  enableTrueMoney?: boolean;

  // Social Marketing & Tracking Pixels (TikTok, Facebook, IG, LINE)
  facebookPixelId?: string;
  tiktokPixelId?: string;
  facebookPageUrl?: string;
  instagramUrl?: string;
  lineOfficialUrl?: string;
  tiktokShopUrl?: string;

  // Slip Verification Settings (EasySlip / Mini QR BScanC)
  slipVerifyEnabled?: boolean;
  slipVerifyApiKey?: string;
  slipVerifyDemoMode?: boolean;

  // Store Location & Realtime Server Update Timestamp Log
  mapUrl?: string;
  lastUpdated?: string;
}

export interface SlipVerificationData {
  success: boolean;
  message: string;
  isDemo?: boolean;
  transRef?: string;
  date?: string;
  amount?: number;
  senderName?: string;
  senderBank?: string;
  receiverName?: string;
  receiverAccount?: string;
  receiverBank?: string;
  rawPayload?: string;
}

export interface CustomOptions {
  suppliers?: string[];
  stockInNotes?: string[];
  lotNumbers?: string[];
  categories?: any[];
  fabrics?: Record<string, string[]>;
  sizes?: Record<string, any[]>;
  colors?: Record<string, string[]>;
  descriptions?: string[];
}

export interface RealtimeSyncPayload {
  success?: boolean;
  error?: string;
  version: number;
  products?: Product[];
  deletedIds?: string[];
  orders?: Order[];
  deletedOrderIds?: string[];
  stockMovements?: StockMovement[];
  deletedStockMovementIds?: string[];
  supplierSettlements?: SupplierSettlement[];
  supplierReturnVouchers?: SupplierReturnVoucher[];
  deletedSupplierReturnIds?: string[];
  eventSchedules?: EventSchedule[];
  deletedEventScheduleIds?: string[];
  eventBranches?: string[];
  boothTransfers?: BoothStockTransfer[];
  deletedBoothTransferIds?: string[];
  staffUsers?: StaffUser[];
  settings?: StoreSettings;
  customOptions?: CustomOptions;
  serverTimeUTC?: string;
  upToDate?: boolean;
}

