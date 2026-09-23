'use client';

import React, { useState } from 'react';
import { Tag, Copy, Check, Gift, Percent, Flame } from 'lucide-react';
import { INITIAL_COUPONS } from '../../data/mockProducts';
import { useShop } from '../../context/ShopContext';

export const PromotionSection: React.FC = () => {
  const { applyCoupon, setIsCartOpen } = useShop();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    applyCoupon(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section className="bg-[#FAF9F6] py-8 border-b border-stone-300 text-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold">
              <Tag className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-extrabold text-[#0A0A0A] tracking-tight">
                สิทธิพิเศษ & โค้ดส่วนลด (Exclusive Offers)
              </h3>
              <p className="text-xs text-stone-900 font-semibold">
                คัดลอกโค้ดเพื่อรับส่วนลดพิเศษในขั้นตอนชำระเงิน
              </p>
            </div>
          </div>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INITIAL_COUPONS.map((coupon) => (
            <div
              key={coupon.code}
              className="relative bg-white border border-stone-300 rounded p-3.5 flex items-center justify-between shadow-xs hover:border-black transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif font-extrabold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-xs border border-amber-300">
                    {coupon.discountType === 'percent'
                      ? `ส่วนลด ${coupon.discountValue}%`
                      : `ส่วนลด ฿${coupon.discountValue}`}
                  </span>
                  <span className="text-xs text-[#0A0A0A] font-mono font-extrabold tracking-wider">
                    {coupon.code}
                  </span>
                </div>
                <p className="text-xs text-stone-900 font-bold">
                  {coupon.description}
                </p>
                <p className="text-[10px] text-stone-700 font-semibold">
                  เมื่อซื้อขั้นต่ำ ฿{coupon.minSpend.toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => handleCopy(coupon.code)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
                  copiedCode === coupon.code
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#0A0A0A] hover:bg-amber-800 text-white'
                }`}
              >
                {copiedCode === coupon.code ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>ใช้แล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอก</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
