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
    <section className="bg-[#FDFBF7] py-10 border-b border-amber-300/40 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 shadow-sm">
              <Flame className="w-5 h-5 text-amber-600 fill-amber-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900 tracking-wide">
                โค้ดส่วนลดพิเศษ & คูปองดูไบ (Exclusive Coupons)
              </h3>
              <p className="text-xs text-amber-800 font-medium">
                คลิกคัดลอกโค้ดเพื่อนำไปใช้ลดราคาเพิ่มทันทีในขั้นตอนเช็คเอาต์
              </p>
            </div>
          </div>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INITIAL_COUPONS.map((coupon) => (
            <div
              key={coupon.code}
              className="relative bg-white border border-amber-300/60 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-amber-400 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    {coupon.discountType === 'percent'
                      ? `ลด ${coupon.discountValue}%`
                      : `ลด ฿${coupon.discountValue}`}
                  </span>
                  <span className="text-xs text-slate-800 font-mono font-bold">
                    {coupon.code}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  {coupon.description}
                </p>
                <p className="text-[10px] text-amber-800/80">
                  ขั้นต่ำ ฿{coupon.minSpend.toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => handleCopy(coupon.code)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  copiedCode === coupon.code
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold hover:from-amber-400 hover:to-amber-500 shadow-sm'
                }`}
              >
                {copiedCode === coupon.code ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>ใช้โค้ดแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>เก็บโค้ด</span>
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
