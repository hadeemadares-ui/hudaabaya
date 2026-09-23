'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Plus, Minus, Trash2, QrCode, CreditCard, Banknote, Printer, CheckCircle, Sparkles, Layers, RotateCcw, Box, User, Phone, DollarSign, Receipt, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { useShop } from '../../context/ShopContext';
import { Product, ProductVariant, CartItem, Order } from '../../types';
import { DEFAULT_LOGO_BASE64 } from '../../data/logoData';

export const AdminPOSManager: React.FC = () => {
  const { products, createOrder, formatPrice, storeSettings } = useShop();

  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'promptpay' | 'credit_card' | 'gov_copay'>('cash');
  const [govRatio, setGovRatio] = useState<'60_40' | '50_50' | '70_30' | 'custom'>('60_40');
  const [customGovPercent, setCustomGovPercent] = useState<number>(60);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('ลูกค้าหน้าร้าน (Walk-in Customer)');
  const [customerPhone, setCustomerPhone] = useState<string>('000-000-0000');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [completedPOSOrder, setCompletedPOSOrder] = useState<Order | null>(null);

  // Filter products for POS
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variants.some((v) => v.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  // Calculate Subtotal & Totals
  const subtotal = posCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const netAmount = Math.max(0, subtotal - discountInput);
  const cashNum = Number(cashReceived) || 0;
  const changeAmount = Math.max(0, cashNum - netAmount);

  // Government Co-payment Calculations (Supports 60/40, 50/50, 70/30, Custom)
  const getGovPercent = () => {
    if (govRatio === '60_40') return 60;
    if (govRatio === '50_50') return 50;
    if (govRatio === '70_30') return 70;
    return Math.min(100, Math.max(0, customGovPercent));
  };
  const govPercent = getGovPercent();
  const customerPercent = 100 - govPercent;
  const govAmount = Math.round((netAmount * govPercent) / 100);
  const customerPayAmount = Math.max(0, netAmount - govAmount);

  // Generate PromptPay QR for POS (Supports regular PromptPay & Government Customer Share)
  useEffect(() => {
    const payAmt = paymentMethod === 'gov_copay' ? customerPayAmount : netAmount;
    if ((paymentMethod === 'promptpay' || paymentMethod === 'gov_copay') && payAmt > 0) {
      const cleanPhone = (storeSettings.promptPayNumber || '0812345678').replace(/[^0-9]/g, '');
      const payload = `00020101021229370016A00000067701011101130066${cleanPhone.slice(1)}5802TH5303764540${payAmt.toFixed(
        2
      ).length.toString().padStart(2, '0')}${payAmt.toFixed(2)}6304`;

      QRCode.toDataURL(payload, { width: 220, margin: 1 })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error(err));
    }
  }, [paymentMethod, netAmount, customerPayAmount, storeSettings.promptPayNumber]);

  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    if (variant.stockQuantity <= 0) {
      alert(`ขออภัยค่ะ สินค้าไซส์ ${variant.name} สต๊อกหมดแล้ว`);
      return;
    }

    setPosCart((prev) => {
      const idx = prev.findIndex((item) => item.productId === product.id && item.variantId === variant.id);
      if (idx > -1) {
        const updated = [...prev];
        if (updated[idx].quantity + 1 > variant.stockQuantity) {
          alert(`ขออภัยค่ะ สต๊อกไซส์ ${variant.name} มีเหลือเพียง ${variant.stockQuantity} ชิ้น`);
          return prev;
        }
        updated[idx].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            productTitle: product.title,
            productImage: product.images[0],
            variantId: variant.id,
            variantName: variant.name,
            price: variant.price,
            quantity: 1,
            category: product.category,
            fabric: product.fabric,
          },
        ];
      }
    });
  };

  // Quick Card Click: Add first available size
  const handleQuickAddCard = (product: Product) => {
    const availableVariant = product.variants.find((v) => v.stockQuantity > 0);
    if (!availableVariant) {
      alert(`ขออภัยค่ะ สินค้าแบบ "${product.title}" สต๊อกหมดทุกไซส์แล้ว`);
      return;
    }
    handleAddToCart(product, availableVariant);
  };

  const handleUpdateQty = (variantId: string, qty: number) => {
    if (qty <= 0) {
      setPosCart((prev) => prev.filter((item) => item.variantId !== variantId));
      return;
    }
    setPosCart((prev) => prev.map((item) => (item.variantId === variantId ? { ...item, quantity: qty } : item)));
  };

  const handleQuickCashPreset = (amount: number) => {
    setCashReceived(amount.toString());
  };

  const handleCheckoutPOS = () => {
    if (posCart.length === 0) {
      alert('กรุณาเลือกรายการสินค้าเข้าแคชเชียร์ก่อนชำระเงินค่ะ');
      return;
    }

    if (paymentMethod === 'cash' && cashNum < netAmount) {
      alert(`ยอดเงินสดที่รับมา (฿${cashNum.toLocaleString()}) น้อยกว่ายอดรวมที่ต้องชำระ (฿${netAmount.toLocaleString()})`);
      return;
    }

    let pm: Order['paymentMethod'] = 'promptpay';
    if (paymentMethod === 'cash') pm = 'cod';
    if (paymentMethod === 'credit_card') pm = 'credit_card';
    if (paymentMethod === 'gov_copay') pm = 'promptpay';

    let orderNote = `ออเดอร์หน้าร้าน POS | วิธีชำระ: ${paymentMethod} | รับเงิน: ฿${cashNum} | เงินทอน: ฿${changeAmount}`;
    if (paymentMethod === 'gov_copay') {
      orderNote = `ออเดอร์หน้าร้าน POS | โครงการรัฐบาล (${govPercent}%/ลูกค้า ${customerPercent}%) | รัฐจ่าย: ฿${govAmount.toLocaleString()} | ลูกค้าจ่าย: ฿${customerPayAmount.toLocaleString()}`;
    }

    const order = createOrder({
      customerName: customerName.trim() || 'ลูกค้าหน้าร้าน (Walk-in)',
      customerPhone: customerPhone.trim() || '000-000-0000',
      customerAddress: 'ชำระและรับสินค้าหน้าร้าน (Walk-in Store POS)',
      province: 'กรุงเทพมหานคร',
      district: 'วัฒนา',
      subDistrict: 'สุขุมวิท',
      postalCode: '10110',
      note: orderNote,
      items: posCart,
      totalAmount: subtotal,
      discountAmount: discountInput,
      shippingFee: 0,
      netAmount,
      paymentMethod: pm,
      paymentStatus: 'paid',
      orderStatus: 'delivered',
    });

    setCompletedPOSOrder(order);
  };

  const handleResetPOS = () => {
    setPosCart([]);
    setDiscountInput(0);
    setCashReceived('');
    setCompletedPOSOrder(null);
  };

  return (
    <div className="space-y-4 text-xs text-white">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dubai-black p-4 rounded-xl border border-gold-400/40 shadow-xl">
        <div>
          <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold-400" />
            <span>ระบบแคชเชียร์ขายหน้าร้าน POS (Point of Sale System)</span>
          </h3>
          <p className="text-xs text-gold-300/80">
            ยิงกดเลือกสินค้า คิดเงิน ออกใบเสร็จ และดูสต๊อกคงเหลือรายไซส์แบบเรียลไทม์
          </p>
        </div>

        {posCart.length > 0 && (
          <button
            onClick={handleResetPOS}
            className="px-3.5 py-2 bg-dubai-dark hover:bg-gold-500 hover:text-dubai-black border border-gold-400/40 text-gold-300 font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ล้างตะกร้า POS</span>
          </button>
        )}
      </div>

      {/* Main POS 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Product Selection Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Category & Search Filter Row */}
          <div className="bg-dubai-black p-3 rounded-xl border border-gold-400/30 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="พิมพ์ค้นหาชื่อแบบสินค้า หรือ ไซส์..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dubai-dark border border-gold-400/30 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 font-mono"
              />
              <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-gold-400" />
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {['all', 'abaya', 'kaftan', 'perfume', 'incense', 'combo', 'other'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-gold-500 text-dubai-black shadow-gold-glow'
                      : 'bg-dubai-dark text-gold-300 border border-gold-400/20'
                  }`}
                >
                  {cat === 'all' && 'ทั้งหมด'}
                  {cat === 'abaya' && 'ชุดอาบายะห์'}
                  {cat === 'kaftan' && 'ชุดคัฟทาน'}
                  {cat === 'perfume' && 'น้ำหอมดูไบ'}
                  {cat === 'incense' && 'เครื่องหอมดูไบ'}
                  {cat === 'combo' && 'เซ็ตสุดคุ้ม'}
                  {cat === 'other' && 'สินค้าอื่นๆ'}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1 no-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-gray-500 bg-dubai-black rounded-xl border border-gold-400/20">
                ไม่พบรายการสินค้าที่ค้นหา
              </div>
            ) : (
              filteredProducts.map((prod) => {
                const totalProdStock = prod.variants.reduce((sum, v) => sum + v.stockQuantity, 0);

                return (
                  <div
                    key={prod.id}
                    className="bg-stone-900 border-2 border-amber-400/40 rounded-2xl p-3 space-y-2.5 flex flex-col justify-between hover:border-amber-400 transition shadow-xl group"
                  >
                    {/* Clickable Image & Title Area for Fast Touch Selection */}
                    <div
                      onClick={() => handleQuickAddCard(prod)}
                      className="space-y-1.5 cursor-pointer active:scale-98 transition"
                      title="กดเพื่อเลือกสินค้า"
                    >
                      <div className="relative overflow-hidden rounded-lg">
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-full h-28 object-cover rounded-lg border border-gold-400/20 group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute top-1.5 right-1.5 bg-stone-950/90 border border-amber-400/50 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                          <Box className="w-3 h-3 text-amber-400" />
                          <span>รวม {totalProdStock} ชิ้น</span>
                        </span>
                        
                        <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <span className="bg-amber-400 text-stone-950 font-black text-[11px] px-3 py-1 rounded-full shadow-gold-glow flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> เลือกสินค้านี้
                          </span>
                        </div>
                      </div>

                      <h4 className="font-serif font-extrabold text-amber-300 text-xs sm:text-sm truncate group-hover:text-amber-200 transition">
                        {prod.title}
                      </h4>
                    </div>

                    {/* Size Variants Pills with Dynamic Realtime Stock Badges */}
                    <div className="space-y-1.5 pt-2 border-t border-gold-400/15">
                      <span className="text-[10px] text-gold-400 font-bold flex items-center justify-between">
                        <span>กดเลือกไซส์เฉพาะ:</span>
                      </span>

                      <div className="flex flex-wrap gap-1.5">
                        {prod.variants.map((variant) => {
                          const isOutOfStock = variant.stockQuantity <= 0;
                          const isLowStock = variant.stockQuantity > 0 && variant.stockQuantity <= (storeSettings.lowStockThreshold || 3);

                          return (
                            <button
                              key={variant.id}
                              disabled={isOutOfStock}
                              onClick={() => handleAddToCart(prod, variant)}
                              className={`group relative text-[11px] px-2.5 py-1.5 rounded-lg font-bold border transition flex items-center justify-between gap-2 ${
                                isOutOfStock
                                  ? 'bg-red-950/30 border-red-900/50 text-gray-500 line-through opacity-40 cursor-not-allowed'
                                  : isLowStock
                                  ? 'bg-dubai-black hover:bg-amber-500 hover:text-dubai-black border-amber-500/60 text-amber-300 shadow'
                                  : 'bg-dubai-black hover:bg-gold-500 hover:text-dubai-black border-gold-400/40 text-gold-200 shadow'
                              }`}
                            >
                              <span>{variant.name}</span>

                              {/* Dynamic Stock Badge */}
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-extrabold shadow-sm ${
                                  isOutOfStock
                                    ? 'bg-red-900 text-red-200'
                                    : isLowStock
                                    ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                }`}
                              >
                                {isOutOfStock ? 'หมด' : `เหลือ ${variant.stockQuantity}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: POS Cart & Checkout Terminal (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-dubai-black p-4 rounded-2xl border-2 border-gold-400/40 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-gold-400/30 pb-3">
              <h4 className="font-serif font-bold text-sm text-gold-400 flex items-center gap-1.5">
                <Receipt className="w-4 h-4" />
                <span>รายการชำระเงิน POS (Cart & Checkout)</span>
              </h4>
              <span className="text-[10px] bg-gold-500/20 text-gold-300 px-2.5 py-0.5 rounded border border-gold-400/30 font-bold">
                {posCart.length} รายการ
              </span>
            </div>

            {/* Selected Cart Items Table */}
            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {posCart.length === 0 ? (
                <div className="py-8 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                  <ShoppingBag className="w-8 h-8 text-gold-400/40" />
                  <span className="font-bold text-xs text-gold-200">กดเลือกสินค้าทางฝั่งซ้ายเข้าตะกร้าขาย</span>
                  <p className="text-[10px] text-gray-400">เมื่อเลือกสินค้าแล้ว ปุ่มยืนยันคิดเงินสีเขียวจะปรากฏขึ้นทันที</p>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('switch_admin_tab_reports'));
                      }
                    }}
                    className="mt-1 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-[11px] rounded-full border border-emerald-300 shadow-md flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>ดูรายงานยอดขาย &amp; กำไรสุทธิ (Financial Analytics)</span>
                  </button>
                </div>
              ) : (
                posCart.map((item) => (
                  <div key={item.variantId} className="flex items-center justify-between p-2.5 bg-dubai-dark rounded-xl border border-gold-400/20">
                    <div className="flex-1 pr-2 truncate">
                      <strong className="text-white text-xs block truncate">{item.productTitle}</strong>
                      <span className="text-[10px] text-gold-400 font-bold">({item.variantName})</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-gold-400/30 rounded bg-dubai-black">
                        <button
                          onClick={() => handleUpdateQty(item.variantId, item.quantity - 1)}
                          className="px-2.5 py-1 text-gold-400 hover:text-white font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="px-2 font-mono font-bold text-white text-xs">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item.variantId, item.quantity + 1)}
                          className="px-2.5 py-1 text-gold-400 hover:text-white font-bold text-xs"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono font-bold text-gold-300 text-xs w-16 text-right">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </span>

                      <button
                        onClick={() => handleUpdateQty(item.variantId, 0)}
                        className="text-red-400 hover:text-red-200 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Walk-in Customer Info */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gold-400/20">
              <div>
                <label className="block text-gray-400 text-[10px] mb-1">ชื่อลูกค้า (หรือ Walk-in)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-dubai-dark border border-gold-400/30 rounded p-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] mb-1">ส่วนลดหน้าร้าน (บาท)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={discountInput === 0 ? '' : discountInput}
                  onFocus={(e) => e.target.select()}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  onChange={(e) => {
                    const cleanVal = e.target.value.replace(/^0+(?=\d)/, '');
                    setDiscountInput(cleanVal === '' ? 0 : Math.max(0, parseInt(cleanVal, 10) || 0));
                  }}
                  className="w-full bg-dubai-dark border border-gold-400/30 rounded p-1.5 text-gold-300 font-bold font-mono"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2.5 pt-2 border-t border-gold-400/20">
              <label className="block text-gold-400 text-[11px] font-bold">เลือกวิธีชำระเงินหน้าร้าน:</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    paymentMethod === 'cash'
                      ? 'bg-gold-500 text-dubai-black font-extrabold border-gold-400 shadow-gold-glow'
                      : 'bg-dubai-dark text-gold-300 border-gold-400/20'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span className="text-[10px]">เงินสด (Cash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    paymentMethod === 'promptpay'
                      ? 'bg-gold-500 text-dubai-black font-extrabold border-gold-400 shadow-gold-glow'
                      : 'bg-dubai-dark text-gold-300 border-gold-400/20'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span className="text-[10px]">พร้อมเพย์ QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    paymentMethod === 'credit_card'
                      ? 'bg-gold-500 text-dubai-black font-extrabold border-gold-400 shadow-gold-glow'
                      : 'bg-dubai-dark text-gold-300 border-gold-400/20'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[10px]">รูดบัตร EDC</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('gov_copay')}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    paymentMethod === 'gov_copay'
                      ? 'bg-gradient-to-r from-amber-400 via-gold-400 to-amber-500 text-dubai-black font-extrabold border-gold-300 shadow-gold-glow scale-102'
                      : 'bg-dubai-dark text-amber-300 border-amber-500/40 hover:border-amber-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-[10px] font-bold">โครงการรัฐบาล</span>
                </button>
              </div>

              {/* Cash Quick Presets & Change Calculation */}
              {paymentMethod === 'cash' && (
                <div className="p-3 bg-dubai-dark rounded-xl border border-gold-400/30 space-y-2.5">
                  <div className="space-y-1">
                    <span className="text-gray-300 text-[11px] font-bold block">ปุ่มลัดรับเงินสด (Quick Cash Presets):</span>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickCashPreset(netAmount)}
                        className="px-2 py-1 bg-gold-500/20 hover:bg-gold-500 hover:text-dubai-black border border-gold-400/40 text-gold-300 rounded font-bold text-[10px]"
                      >
                        พอดี (฿{netAmount.toLocaleString()})
                      </button>
                      {[100, 500, 1000, 2000, 5000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleQuickCashPreset(amt)}
                          className="px-2 py-1 bg-dubai-black hover:bg-gold-500 hover:text-dubai-black border border-gold-400/30 text-gold-200 rounded font-mono font-bold text-[10px]"
                        >
                          ฿{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-gray-300 text-xs font-bold">รับเงินสดมา (บาท):</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={cashReceived}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      onChange={(e) => {
                        const cleanVal = e.target.value.replace(/^0+(?=\d)/, '');
                        setCashReceived(cleanVal);
                      }}
                      className="w-32 bg-dubai-black border border-gold-400/40 rounded p-1.5 text-right font-mono font-bold text-white text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gold-400/20">
                    <span className="text-emerald-400 font-serif font-bold text-xs">เงินทอนลูกค้า:</span>
                    <span className="text-emerald-400 font-mono font-extrabold text-lg">
                      ฿{changeAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* PromptPay QR View */}
              {paymentMethod === 'promptpay' && qrCodeUrl && (
                <div className="p-3 bg-dubai-dark rounded-xl border border-gold-400/30 flex items-center gap-3">
                  <img src={qrCodeUrl} alt="POS QR Code" className="w-24 h-24 rounded border border-gold-400 bg-white" />
                  <div className="space-y-1">
                    <span className="text-gold-400 font-bold block">สแกนชำระพร้อมเพย์:</span>
                    <p className="text-white font-mono font-bold text-sm">฿{netAmount.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">เบอร์ร้าน: {storeSettings.promptPayNumber}</p>
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              {paymentMethod === 'gov_copay' && (
                <div className="p-3 bg-dubai-dark rounded-xl border border-amber-500/30 space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-amber-300 font-bold text-xs block">สัดส่วนเงินสนับสนุนโครงการรัฐบาล:</span>
                    
                    <div className="grid grid-cols-4 gap-1.5 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setGovRatio('60_40')}
                        className={`py-1.5 rounded-lg border text-center transition ${
                          govRatio === '60_40'
                            ? 'bg-amber-400 text-dubai-black border-amber-300 font-extrabold'
                            : 'bg-dubai-black text-amber-200 border-amber-500/30 hover:border-amber-400'
                        }`}
                      >
                        60 / 40
                      </button>
                      <button
                        type="button"
                        onClick={() => setGovRatio('50_50')}
                        className={`py-1.5 rounded-lg border text-center transition ${
                          govRatio === '50_50'
                            ? 'bg-amber-400 text-dubai-black border-amber-300 font-extrabold'
                            : 'bg-dubai-black text-amber-200 border-amber-500/30 hover:border-amber-400'
                        }`}
                      >
                        50 / 50
                      </button>
                      <button
                        type="button"
                        onClick={() => setGovRatio('70_30')}
                        className={`py-1.5 rounded-lg border text-center transition ${
                          govRatio === '70_30'
                            ? 'bg-amber-400 text-dubai-black border-amber-300 font-extrabold'
                            : 'bg-dubai-black text-amber-200 border-amber-500/30 hover:border-amber-400'
                        }`}
                      >
                        70 / 30
                      </button>
                      <button
                        type="button"
                        onClick={() => setGovRatio('custom')}
                        className={`py-1.5 rounded-lg border text-center transition ${
                          govRatio === 'custom'
                            ? 'bg-amber-400 text-dubai-black border-amber-300 font-extrabold'
                            : 'bg-dubai-black text-amber-200 border-amber-500/30 hover:border-amber-400'
                        }`}
                      >
                        ระบุ % เอง
                      </button>
                    </div>
                  </div>

                  {/* Custom Percent Input */}
                  {govRatio === 'custom' && (
                    <div className="flex items-center justify-between bg-dubai-black p-2 rounded-lg border border-amber-500/30">
                      <span className="text-gray-300 text-xs">ระบุ % รัฐบาลจ่าย:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="0"
                          value={customGovPercent === 0 ? '' : customGovPercent}
                          onFocus={(e) => e.target.select()}
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                          onChange={(e) => {
                            const cleanVal = e.target.value.replace(/^0+(?=\d)/, '');
                            setCustomGovPercent(cleanVal === '' ? 0 : Math.min(100, Math.max(0, parseInt(cleanVal, 10) || 0)));
                          }}
                          className="w-16 bg-dubai-dark border border-amber-500/50 rounded px-2 py-1 text-right text-amber-300 font-mono font-bold text-xs"
                        />
                        <span className="text-amber-400 font-bold">%</span>
                      </div>
                    </div>
                  )}

                  {/* Calculation Result Summary Box */}
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex justify-between items-center text-amber-300/90 font-medium">
                      <span>รัฐบาล/โครงการจ่าย ({govPercent}%):</span>
                      <span className="font-mono font-bold text-amber-300">
                        ฿{govAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-emerald-300 font-bold bg-emerald-950/60 p-2 rounded-lg border border-emerald-500/40">
                      <span>ยอดที่ลูกค้าชำระเพิ่ม ({customerPercent}%):</span>
                      <span className="font-mono font-extrabold text-sm text-emerald-400">
                        ฿{customerPayAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* QR Code for Customer Share Scan */}
                  {qrCodeUrl && (
                    <div className="p-2.5 bg-dubai-black rounded-lg border border-gold-400/30 flex items-center gap-3">
                      <img src={qrCodeUrl} alt="POS Gov QR Code" className="w-20 h-20 rounded border border-gold-400 bg-white shrink-0" />
                      <div className="space-y-1 text-[11px]">
                        <span className="text-gold-400 font-bold block">สแกนชำระส่วนของลูกค้า (เป๋าตัง/พร้อมเพย์):</span>
                        <p className="text-white font-mono font-bold text-sm">฿{customerPayAmount.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">แอปถุงเงิน / เบอร์ร้าน: {storeSettings.promptPayNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Total Summary & Complete Action */}
            <div className="pt-3 border-t border-gold-400/30 space-y-3">
              <div className="flex justify-between items-baseline font-serif">
                <span className="text-gray-300 text-sm">ยอดชำระสุทธิ:</span>
                <span className="text-2xl font-extrabold text-gold-400">
                  ฿{netAmount.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleCheckoutPOS}
                disabled={posCart.length === 0}
                className={`w-full py-4 text-sm font-extrabold uppercase tracking-wider rounded-xl shadow-2xl transition duration-200 flex items-center justify-center gap-2 ${
                  posCart.length === 0
                    ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-dubai-black border-2 border-emerald-300 shadow-gold-strong scale-100 hover:scale-102 cursor-pointer font-sans'
                }`}
              >
                <CheckCircle className="w-5 h-5 text-dubai-black" />
                <span>ยืนยันการขาย &amp; ออกใบเสร็จ (ชำระเงิน ฿{netAmount.toLocaleString()})</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* POS Completed Thermal Receipt Slip Modal */}
      {completedPOSOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-dubai-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-dubai-card border-2 border-gold-400/60 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-white p-6 my-8 space-y-4 text-center">
            
            <div className="w-14 h-14 bg-emerald-950/80 border-2 border-emerald-400 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-gold-300">
                การขายหน้าร้านสำเร็จเรียบร้อย!
              </h3>
              <p className="text-xs text-gray-300">
                ระบบได้ทำการตัดสต๊อกสินค้าเรียลไทม์ และบันทึกยอดขายหน้าร้านแล้ว
              </p>
            </div>

            {/* Thermal Receipt Print Slip Layout */}
            <div id="pos-thermal-slip" className="p-5 bg-white text-black rounded-xl text-left text-xs font-mono space-y-3 shadow-inner">
              <div className="text-center border-b border-black/30 pb-2 space-y-1">
                {storeSettings.logoImageUrl && (
                  <img src={storeSettings.logoImageUrl} alt="Logo" className="w-12 h-12 rounded-full mx-auto object-cover border border-black" />
                )}
                <h4 className="font-bold text-sm tracking-wider uppercase">{storeSettings.storeName}</h4>
                <p className="text-[10px] text-gray-700">{storeSettings.storeTagline}</p>
                <p className="text-[10px] text-gray-700">ที่อยู่: {storeSettings.contactAddress}</p>
                <p className="text-[10px] text-gray-700">โทร: {storeSettings.contactPhone} | LINE: {storeSettings.contactLine}</p>
              </div>

              <div className="flex justify-between text-[11px] border-b border-black/20 pb-1 font-bold">
                <span>ใบเสร็จรับเงินอย่างย่อ POS</span>
                <span>#{completedPOSOrder.id}</span>
              </div>

              <div className="text-[10px] text-gray-600">
                <span>วันที่: {new Date(completedPOSOrder.createdAt).toLocaleString('th-TH')}</span>
              </div>

              <div className="space-y-1 border-b border-black/20 pb-2">
                {completedPOSOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="pr-2">{item.productTitle} ({item.variantName}) x{item.quantity}</span>
                    <span className="font-bold shrink-0">฿{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-1 text-[11px]">
                <div className="flex justify-between">
                  <span>ยอดรวม (Subtotal):</span>
                  <span>฿{completedPOSOrder.totalAmount.toLocaleString()}</span>
                </div>
                {completedPOSOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>ส่วนลด (Discount):</span>
                    <span>-฿{completedPOSOrder.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm border-t border-black/40 pt-1">
                  <span>ยอดชำระสุทธิ:</span>
                  <span>฿{completedPOSOrder.netAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] pt-1 text-gray-700">
                  <span>ชำระโดย: {completedPOSOrder.paymentMethod === 'cod' ? 'เงินสด (Cash)' : completedPOSOrder.paymentMethod}</span>
                  <span>{completedPOSOrder.note}</span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-black/30 text-[10px] text-gray-600">
                <p>ขอบคุณที่อุดหนุน HUDA ABAYA DUBAI</p>
                <p>ยินดีให้บริการในโอกาสถัดไปค่ะ</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-dubai-dark border border-gold-400/40 text-gold-300 hover:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ใบเสร็จ (Print Slip)</span>
              </button>
              <button
                onClick={handleResetPOS}
                className="flex-1 py-2.5 bg-gold-500 text-dubai-black font-extrabold rounded-xl text-xs uppercase shadow-gold-glow"
              >
                ทำรายการขายถัดไป
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
