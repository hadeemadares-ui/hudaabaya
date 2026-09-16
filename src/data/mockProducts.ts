import { Product, Coupon, ProductReview } from '../types';

// Production Clean Slate: Starts with 0 Products so the store owner can add real inventory
export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'HUDA100',
    discountType: 'fixed',
    discountValue: 100,
    minSpend: 1500,
    description: 'ส่วนลด 100 บาท เมื่อซื้อครบ 1,500 บาทขึ้นไป',
  },
  {
    code: 'DUBAI15',
    discountType: 'percent',
    discountValue: 15,
    minSpend: 3000,
    description: 'ลดทันที 15% เมื่อซื้อสินค้าครบ 3,000 บาทขึ้นไป (ลดสูงสุด 500 บาท)',
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 80,
    minSpend: 2000,
    description: 'ส่วนลดค่าจัดส่ง 80 บาท (ส่งฟรี!)',
  },
];

export const MOCK_REVIEWS: ProductReview[] = [];
