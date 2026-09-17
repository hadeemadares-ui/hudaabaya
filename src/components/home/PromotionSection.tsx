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
    <section className="bg-slate-900/90 py-10 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-gold-glow">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-white tracking-wide">
                โค้ดส่วนลดพิเศษ & คูปองดูไบ (Exclusive Coupons)
              </h3>
              <p className="text-xs text-sky-300">
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
              className="relative bg-gradient-to-r from-slate-800 to-slate-850 border border-amber-400/35 rounded-xl p-4 flex items-center justify-between shadow-md hover:border-amber-400 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/40">
                    {coupon.discountType === 'percent'
                      ? `ลด ${coupon.discountValue}%`
                      : `ลด ฿${coupon.discountValue}`}
                  </span>
                  <span className="text-xs text-slate-200 font-mono font-bold">
                    {coupon.code}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {coupon.description}
                </p>
                <p className="text-[10px] text-sky-300/80">
                  ขั้นต่ำ ฿{coupon.minSpend.toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => handleCopy(coupon.code)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  copiedCode === coupon.code
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-sky-400 to-cyan-500 text-slate-950 font-extrabold hover:from-amber-400 hover:to-amber-500 shadow-sky-glow'
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
