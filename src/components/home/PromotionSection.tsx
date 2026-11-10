'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { INITIAL_COUPONS } from '../../data/mockProducts';
import { useShop } from '../../context/ShopContext';

export const PromotionSection: React.FC = () => {
  const { applyCoupon } = useShop();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    applyCoupon(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section className="bg-[#FAF9F6] py-8 border-b border-stone-200/80 text-[#141312]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="shrink-0">
            <p className="text-[10px] font-serif tracking-[0.22em] uppercase text-[#8C703E] mb-1">
              CLIENT PRIVILEGES
            </p>
            <h3 className="text-base sm:text-lg font-serif font-medium text-[#141312] tracking-wide">
              สิทธิพิเศษสำหรับลูกค้าออนไลน์
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-4xl">
            {INITIAL_COUPONS.map((coupon) => (
              <div
                key={coupon.code}
                onClick={() => handleCopy(coupon.code)}
                className="group bg-white border border-stone-200/90 hover:border-[#141312] px-4 py-3 flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold tracking-wider text-[#141312]">
                      {coupon.code}
                    </span>
                    <span className="text-[11px] font-serif text-[#8C703E]">
                      ({coupon.discountType === 'percent' ? `-${coupon.discountValue}%` : `-฿${coupon.discountValue}`})
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">
                    ขั้นต่ำ ฿{coupon.minSpend.toLocaleString()}
                  </p>
                </div>

                <span
                  className={`text-[10px] tracking-widest uppercase px-2.5 py-1 transition shrink-0 ${
                    copiedCode === coupon.code
                      ? 'bg-[#141312] text-white'
                      : 'text-[#141312] border border-stone-300 group-hover:bg-[#141312] group-hover:text-white group-hover:border-[#141312]'
                  }`}
                >
                  {copiedCode === coupon.code ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3" /> ใช้โค้ดแล้ว
                    </span>
                  ) : (
                    'รับสิทธิ์'
                  )}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

