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
    <section className="bg-[#FAF9F6] py-8 border-b border-[#E8E3DA] text-[#1C1917]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F4ECE1] border border-[#DCC59F] flex items-center justify-center text-[#B89352]">
              <Tag className="w-4 h-4 text-[#B89352]" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#1C1917] tracking-tight">
                สิทธิพิเศษ & โค้ดส่วนลด (Exclusive Offers)
              </h3>
              <p className="text-xs text-stone-500 font-light">
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
              className="relative bg-white border border-[#E8E3DA] rounded p-3.5 flex items-center justify-between shadow-2xs hover:border-[#B89352] transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif font-semibold text-[#B89352] bg-[#F4ECE1] px-2 py-0.5 rounded-xs border border-[#DCC59F]">
                    {coupon.discountType === 'percent'
                      ? `ส่วนลด ${coupon.discountValue}%`
                      : `ส่วนลด ฿${coupon.discountValue}`}
                  </span>
                  <span className="text-xs text-[#1C1917] font-mono font-bold tracking-wider">
                    {coupon.code}
                  </span>
                </div>
                <p className="text-xs text-stone-600 font-light">
                  {coupon.description}
                </p>
                <p className="text-[10px] text-stone-400">
                  เมื่อซื้อขั้นต่ำ ฿{coupon.minSpend.toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => handleCopy(coupon.code)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                  copiedCode === coupon.code
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#1C1917] hover:bg-[#B89352] text-white'
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
