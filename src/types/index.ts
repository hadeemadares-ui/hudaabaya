export type CategoryType = 'all' | 'abaya' | 'kaftan' | 'perfume' | 'combo' | 'incense' | 'other';
export type CurrencyType = 'THB' | 'AED' | 'USD' | 'EUR';

export interface ProductVariant {
  id: string;
  name: string; // e.g. Size 52 (สีดำ), Size 54 (สีทอง)
  sku: string;
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
  paymentStatus: 'pending' | 'slip_uploaded' | 'paid' | 'rejected';
  slipImage?: string;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  courier?: string;
  isSample?: boolean; // Flag to identify test/sample orders for safe reset without data loss
  createdAt: string; // UTC ISO 8601 String
  updatedAt?: string; // UTC ISO 8601 String
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

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  logoLetter: string;
  logoImageUrl: string;
  topAnnouncement: string;
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
  
  // Payment Toggles
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

  // Store Location & Realtime Server Update Timestamp Log
  mapUrl?: string;
  lastUpdated?: string;
}
