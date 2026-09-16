'use client';

import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, Sparkles } from 'lucide-react';
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

  // Calculate coupon discount
  let discountValue = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percent') {
      discountValue = Math.min(500, (rawSubtotal * appliedCoupon.discountValue) / 100);
    } else {
      discountValue = appliedCoupon.discountValue;
    }
  }

  // Free shipping threshold (2,000 THB)
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
      {/* Drawer Overlay */}
      <div className="fixed inset-0 z-50 overflow-hidden bg-dubai-black/80 backdrop-blur-sm">
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-dubai-card border-l-2 border-gold-400/40 text-white shadow-2xl flex flex-col justify-between">
            
            {/* Drawer Header */}
            <div className="p-4 sm:p-6 border-b border-gold-400/20 flex items-center justify-between bg-dubai-black">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-400 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    ตะกร้าสินค้า (Cart)
                  </h3>
                  <p className="text-xs text-gold-300/70">
                    {cart.length} รายการ ({cart.reduce((sum, i) => sum + i.quantity, 0)} ชิ้น)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full text-gold-400 hover:text-white hover:bg-dubai-card transition"
                aria-label="ปิดตะกร้า"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="bg-dubai-black/60 px-6 py-2.5 border-b border-gold-400/10 text-xs">
              <div className="flex items-center justify-between text-gold-300 mb-1 font-medium">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-gold-400" />
                  {rawSubtotal >= freeShippingThreshold ? (
                    <span className="text-emerald-400 font-bold">ยินดีด้วย! คุณได้รับสิทธิ์ส่งฟรีแล้ว</span>
                  ) : (
                    <span>ช็อปอีก ฿{(freeShippingThreshold - rawSubtotal).toLocaleString()} เพื่อรับสิทธิ์ส่งฟรี!</span>
                  )}
                </span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-1.5 bg-dubai-dark rounded-full overflow-hidden border border-gold-400/20">
                <div
                  className="h-full bg-gradient-to-r from-gold-600 via-gold-400 to-amber-300 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                  <div className="w-16 h-16 rounded-full bg-dubai-dark border border-gold-400/30 flex items-center justify-center text-gold-500/40">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <p className="font-serif text-gray-300 text-sm font-semibold">
                    ไม่มีสินค้าในตะกร้า
                  </p>
                  <p className="text-xs text-gold-300/60 max-w-xs">
                    เลือกชมชุดอาบายะห์ คัฟทาน และน้ำหอมจากดูไบ แล้วกดเพิ่มลงในตะกร้าได้เลยค่ะ
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-2 px-5 py-2 rounded-full bg-gold-500 text-dubai-black font-bold text-xs"
                  >
                    เลือกชมสินค้า
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.variantId}
                    className="p-3 bg-dubai-black/60 border border-gold-400/20 rounded-xl flex gap-3 items-center hover:border-gold-400/40 transition"
                  >
                    <img
                      src={item.productImage}
                      alt={item.productTitle}
                      className="w-16 h-20 object-cover rounded-lg border border-gold-400/20 shrink-0 bg-dubai-dark"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs font-serif font-bold text-amber-100 truncate">
                        {item.productTitle}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded border border-gold-400/30 font-medium">
                          {item.variantName}
                        </span>
                      </div>
                      <p className="text-xs font-serif font-extrabold text-gold-400">
                        ฿{item.price.toLocaleString()}
                      </p>

                      {/* Quantity Controller */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center border border-gold-400/40 rounded bg-dubai-dark">
                          <button
                            onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-gold-400 hover:bg-gold-500/20"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-gold-400 hover:bg-gold-500/20"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-gray-400 hover:text-red-400 p-1"
                          title="ลบรายการนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer & Checkout */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-6 bg-dubai-black border-t border-gold-400/30 space-y-4">
                
                {/* Coupon Code Input Form */}
                <div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-gold-500/10 border border-gold-400/40 p-2 rounded-lg text-xs">
                      <span className="text-gold-300 font-semibold flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-gold-400" />
                        ใช้คูปอง: <strong className="font-mono text-white">{appliedCoupon.code}</strong>
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-red-400 hover:underline text-[11px]"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="กรอกโค้ดส่วนลด (เช่น HUDA100)"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value)}
                        className="flex-1 bg-dubai-dark border border-gold-400/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-400"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-dubai-card border border-gold-400/50 hover:bg-gold-500 hover:text-dubai-black text-gold-300 font-bold text-xs rounded-lg transition"
                      >
                        ใช้โค้ด
                      </button>
                    </form>
                  )}
                  {couponMessage && (
                    <p
                      className={`text-[10px] mt-1 ${
                        couponMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {couponMessage.text}
                    </p>
                  )}
                </div>

                {/* Subtotal Calculation */}
                <div className="space-y-1.5 text-xs border-t border-gold-400/10 pt-3">
                  <div className="flex justify-between text-gray-300">
                    <span>ยอดรวมสินค้า (Subtotal):</span>
                    <span>฿{rawSubtotal.toLocaleString()}</span>
                  </div>
                  {discountValue > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>ส่วนลดคูปอง:</span>
                      <span>-฿{discountValue.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-300">
                    <span>ค่าจัดส่ง ด่วน:</span>
                    <span>{shippingFee === 0 ? <strong className="text-emerald-400">ส่งฟรี</strong> : `฿${shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-serif font-bold text-gold-400 pt-2 border-t border-gold-400/20">
                    <span>ยอดชำระสุทธิ (Net Total):</span>
                    <span className="text-lg">฿{netTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Checkout Trigger Button */}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-600 text-dubai-black font-extrabold text-sm uppercase tracking-wider shadow-gold-glow hover:shadow-gold-strong transition flex items-center justify-center gap-2"
                >
                  <span>ดำเนินการสั่งซื้อ & ชำระเงิน</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* Checkout Modal Launcher */}
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
