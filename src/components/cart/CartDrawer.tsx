'use client';

import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { CheckoutModal } from '../checkout/CheckoutModal';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useShop();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  const rawSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountValue = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percent') {
      discountValue = Math.min(500, (rawSubtotal * appliedCoupon.discountValue) / 100);
    } else {
      discountValue = appliedCoupon.discountValue;
    }
  }

  const freeShippingThreshold = 2000;
  const shippingFee = rawSubtotal >= freeShippingThreshold || rawSubtotal === 0 ? 0 : 80;
  const progressPercent = Math.min(100, (rawSubtotal / freeShippingThreshold) * 100);

  const netTotal = Math.max(0, rawSubtotal - discountValue + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const res = applyCoupon(couponCodeInput);
    if (res.success) {
      setCouponMessage({ type: 'success', text: res.message });
      setCouponCodeInput('');
    } else {
      setCouponMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsCartOpen(false);
        }}
      >
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white border-l border-stone-200 text-[#141312] shadow-2xl flex flex-col justify-between">
            
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-[#FAF9F6]">
              <div>
                <p className="text-[10px] font-serif tracking-[0.2em] uppercase text-[#8C703E]">
                  SHOPPING BAG
                </p>
                <h3 className="font-serif font-normal text-lg text-[#141312] mt-0.5">
                  ถุงช็อปปิ้ง ({cart.reduce((sum, i) => sum + i.quantity, 0)} ชิ้น)
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-stone-500 hover:text-[#141312] border border-stone-200 bg-white transition cursor-pointer"
                aria-label="ปิดตะกร้า"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="bg-white px-6 py-3 border-b border-stone-200/80 text-xs">
              <div className="flex items-center justify-between text-stone-600 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#8C703E]" />
                  {rawSubtotal >= freeShippingThreshold ? (
                    <span className="text-[#141312] font-medium">คุณได้รับสิทธิ์จัดส่งด่วนฟรีแล้ว</span>
                  ) : (
                    <span>ช็อปเพิ่มอีก ฿{(freeShippingThreshold - rawSubtotal).toLocaleString()} เพื่อรับสิทธิ์ส่งฟรี</span>
                  )}
                </span>
                <span className="font-mono text-[11px]">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-1 bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-[#141312] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <ShoppingBag className="w-8 h-8 text-stone-300 stroke-[1.25]" />
                  <div className="space-y-1">
                    <p className="font-serif text-[#141312] text-base">
                      ยังไม่มีสินค้าในถุงช็อปปิ้ง
                    </p>
                    <p className="text-xs text-stone-500 max-w-xs">
                      เลือกชมคอลเลกชันชุดอาบายะห์ คัฟทาน และน้ำหอมดูไบแท้เพื่อเพิ่มลงในถุงช็อปปิ้ง
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-2 px-6 py-2.5 bg-[#141312] text-white text-xs tracking-[0.18em] uppercase cursor-pointer"
                  >
                    เลือกชมคอลเลกชัน
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.variantId}
                    className="p-3.5 bg-[#FAF9F6] border border-stone-200/80 flex gap-3.5 items-center"
                  >
                    <img
                      src={item.productImage || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=75&w=500&auto=format&fit=crop'}
                      alt={item.productTitle}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=75&w=500&auto=format&fit=crop';
                      }}
                      className="w-16 h-20 object-contain bg-white border border-stone-200/60 p-1 shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs font-serif font-medium text-[#141312] truncate">
                        {item.productTitle}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        ตัวเลือก: {item.variantName}
                      </p>
                      <p className="text-xs font-serif font-semibold text-[#141312]">
                        ฿{item.price.toLocaleString()}
                      </p>

                      {/* Quantity Controller */}
                      <div className="flex items-center justify-between pt-1.5">
                        <div className="flex items-center border border-stone-300 bg-white">
                          <button
                            onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}
                            className="px-2.5 py-0.5 text-xs text-[#141312] hover:bg-stone-100 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2.5 text-xs font-medium text-[#141312] border-x border-stone-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}
                            className="px-2.5 py-0.5 text-xs text-[#141312] hover:bg-stone-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-stone-400 hover:text-red-700 p-1 transition cursor-pointer"
                          title="ลบรายการนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer & Checkout */}
            {cart.length > 0 && (
              <div className="p-5 sm:p-6 bg-[#FAF9F6] border-t border-stone-200 space-y-4">
                
                {/* Coupon Code Input Form */}
                <div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-white border border-stone-300 p-2.5 text-xs">
                      <span className="text-[#141312] flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#8C703E]" />
                        โค้ดส่วนลด: <strong className="font-mono">{appliedCoupon.code}</strong>
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-stone-500 hover:text-black underline text-[11px] cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="รหัสส่วนลดพิเศษ (เช่น HUDA100)"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value)}
                        className="flex-1 bg-white border border-stone-300 px-3 py-2 text-xs text-[#141312] placeholder-stone-400 focus:outline-none focus:border-[#141312]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-white border border-[#141312] hover:bg-[#141312] hover:text-white text-[#141312] text-xs tracking-wider uppercase transition cursor-pointer"
                      >
                        ใช้โค้ด
                      </button>
                    </form>
                  )}
                  {couponMessage && (
                    <p
                      className={`text-[11px] mt-1.5 ${
                        couponMessage.type === 'success' ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {couponMessage.text}
                    </p>
                  )}
                </div>

                {/* Subtotal Calculation */}
                <div className="space-y-1.5 text-xs border-t border-stone-200 pt-3">
                  <div className="flex justify-between text-stone-600">
                    <span>ยอดรวมสินค้า</span>
                    <span>฿{rawSubtotal.toLocaleString()}</span>
                  </div>
                  {discountValue > 0 && (
                    <div className="flex justify-between text-[#8C703E]">
                      <span>ส่วนลดสิทธิพิเศษ</span>
                      <span>-฿{discountValue.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-600">
                    <span>ค่าจัดส่งด่วน</span>
                    <span>{shippingFee === 0 ? 'ฟรี' : `฿${shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-serif font-semibold text-[#141312] pt-2.5 border-t border-stone-200">
                    <span>ยอดชำระสุทธิ</span>
                    <span className="text-lg">฿{netTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Checkout Trigger Button */}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-4 bg-[#141312] hover:bg-[#292624] text-white text-xs tracking-[0.2em] uppercase transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ดำเนินการชำระเงิน</span>
                  <ArrowRight className="w-4 h-4 text-[#D4B57B]" />
                </button>

              </div>
            )}

          </div>
        </div>
      </div>

      {isCheckoutOpen && (
        <CheckoutModal
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={() => {
            setIsCheckoutOpen(false);
            setIsCartOpen(false);
          }}
        />
      )}
    </>
  );
};

