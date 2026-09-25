'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Plus, Minus, Trash2, QrCode, CreditCard, Banknote, Printer, CheckCircle, Sparkles, Layers, RotateCcw, Box, User, Phone, DollarSign, Receipt, Check, ZoomIn, Eye, Maximize2, X } from 'lucide-react';
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

  // Full Image View Modal State
  const [previewImageProduct, setPreviewImageProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

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

  const openFullImageModal = (product: Product) => {
    setPreviewImageProduct(product);
    setActiveImageIndex(0);
  };

  return (
    <div className="space-y-4 text-xs text-stone-950">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-amber-400/60 shadow-xl text-stone-950">
        <div>
          <h3 className="font-serif font-black text-lg text-stone-950 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <span>ระบบแคชเชียร์ขายหน้าร้าน POS (Point of Sale System)</span>
          </h3>
          <p className="text-xs text-stone-800 font-extrabold mt-1">
            ยิงกดเลือกสินค้า ดูรูปสินค้าเต็มๆ ไม่โดนครอบ ตัดสต๊อกและออกใบเสร็จรับเงินแบบเรียลไทม์
          </p>
        </div>

        {posCart.length > 0 && (
          <button
            onClick={handleResetPOS}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-950 border border-stone-300 font-black rounded-xl flex items-center gap-1.5 shrink-0 transition shadow-xs cursor-pointer text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-950" />
            <span>ล้างตะกร้า POS</span>
          </button>
        )}
      </div>

      {/* Main POS 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Product Selection Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Category & Search Filter Row */}
          <div className="bg-white p-4 rounded-2xl border-2 border-amber-400/60 shadow-md text-stone-950 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="พิมพ์ค้นหาชื่อแบบสินค้า หรือ ไซส์..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-stone-400 rounded-xl py-2.5 pl-9 pr-3 text-xs text-stone-950 font-black placeholder-stone-400 focus:outline-none focus:border-amber-500 font-mono"
              />
              <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-amber-600" />
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {['all', 'abaya', 'kaftan', 'perfume', 'incense', 'combo', 'other'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
                      : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
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

          {/* Product Items List Grid with Full Uncropped Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[620px] overflow-y-auto pr-1 no-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-stone-700 bg-white rounded-2xl border-2 border-amber-400/60 font-black shadow-md">
                ไม่พบรายการสินค้าที่ค้นหา
              </div>
            ) : (
              filteredProducts.map((prod) => {
                const totalProdStock = prod.variants.reduce((sum, v) => sum + v.stockQuantity, 0);

                return (
                  <div
                    key={prod.id}
                    className="bg-white border-2 border-amber-400/60 rounded-2xl p-3.5 space-y-3 flex flex-col justify-between hover:border-amber-500 transition shadow-xl group text-stone-950"
                  >
                    {/* Full Image Box (Uncropped object-contain with light background & Zoom Button) */}
                    <div className="space-y-2">
                      <div className="relative h-48 sm:h-52 bg-stone-50 rounded-xl border border-stone-300 flex items-center justify-center p-2 overflow-hidden shadow-inner group/img">
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain rounded-lg transition duration-300 group-hover/img:scale-105"
                        />

                        {/* Total Stock Badge */}
                        <span className="absolute top-2 right-2 bg-stone-950 text-amber-300 border border-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md z-10">
                          <Box className="w-3 h-3 text-amber-400" />
                          <span>รวม {totalProdStock} ชิ้น</span>
                        </span>

                        {/* Direct Full Image Zoom Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openFullImageModal(prod);
                          }}
                          className="absolute bottom-2 right-2 bg-white/95 text-stone-950 hover:bg-amber-400 border border-amber-500 font-black text-[10px] px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1 transition z-10 cursor-pointer"
                          title="กดดูรูปสินค้าขนาดใหญ่เต็มตา"
                        >
                          <ZoomIn className="w-3.5 h-3.5 text-amber-700" />
                          <span>ดูรูปเต็มๆ</span>
                        </button>

                        {/* Hover Overlay Quick Add Action */}
                        <div
                          onClick={() => handleQuickAddCard(prod)}
                          className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center cursor-pointer"
                        >
                          <span className="bg-amber-400 text-stone-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-amber-500 flex items-center gap-1">
                            <Plus className="w-4 h-4" /> เลือกสินค้านี้
                          </span>
                        </div>
                      </div>

                      {/* Product Title & Zoom Link */}
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => handleQuickAddCard(prod)}
                          className="font-serif font-black text-stone-950 text-xs sm:text-sm truncate hover:text-amber-700 transition cursor-pointer flex-1"
                          title={prod.title}
                        >
                          {prod.title}
                        </h4>

                        <button
                          type="button"
                          onClick={() => openFullImageModal(prod)}
                          className="text-amber-700 hover:text-amber-900 p-0.5 rounded transition shrink-0"
                          title="ดูรูปภาพสินค้าเต็มๆ"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Size Variants Pills with Dynamic Realtime Stock Badges */}
                    <div className="space-y-1.5 pt-2 border-t border-stone-200">
                      <span className="text-[10px] text-stone-800 font-black flex items-center justify-between">
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
                              className={`group relative text-[11px] px-2.5 py-1.5 rounded-xl font-black border transition flex items-center justify-between gap-2 cursor-pointer ${
                                isOutOfStock
                                  ? 'bg-stone-100 border-stone-300 text-stone-400 line-through opacity-50 cursor-not-allowed'
                                  : isLowStock
                                  ? 'bg-amber-50 hover:bg-amber-400 text-stone-950 border-amber-400 shadow-xs'
                                  : 'bg-white hover:bg-amber-400 text-stone-950 border-stone-300 hover:border-amber-500 shadow-xs'
                              }`}
                            >
                              <span>{variant.name}</span>

                              {/* Dynamic Stock Badge */}
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-black shadow-xs ${
                                  isOutOfStock
                                    ? 'bg-red-600 text-white'
                                    : isLowStock
                                    ? 'bg-amber-400 text-stone-950 border border-amber-500'
                                    : 'bg-emerald-600 text-white'
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
          
          <div className="bg-white p-5 rounded-2xl border-2 border-amber-400/60 shadow-2xl space-y-4 text-stone-950">
            
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h4 className="font-serif font-black text-sm text-stone-950 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-600" />
                <span>รายการชำระเงิน POS (Cart &amp; Checkout)</span>
              </h4>
              <span className="text-[11px] bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-400 font-black">
                {posCart.length} รายการ
              </span>
            </div>

            {/* Selected Cart Items Table with Micro Thumbnails */}
            <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
              {posCart.length === 0 ? (
                <div className="py-8 text-center text-stone-700 flex flex-col items-center justify-center gap-2 font-black">
                  <ShoppingBag className="w-8 h-8 text-amber-600" />
                  <span className="font-black text-xs text-stone-950">กดเลือกสินค้าทางฝั่งซ้ายเข้าตะกร้าขาย</span>
                  <p className="text-[10px] text-stone-600 font-extrabold">เมื่อเลือกสินค้าแล้ว ปุ่มยืนยันคิดเงินสีเขียวจะปรากฏขึ้นทันที</p>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('switch_admin_tab_reports'));
                      }
                    }}
                    className="mt-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] rounded-full border border-emerald-700 shadow-md flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>ดูรายงานยอดขาย &amp; กำไรสุทธิ (Financial Analytics)</span>
                  </button>
                </div>
              ) : (
                posCart.map((item) => (
                  <div key={item.variantId} className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-300 text-stone-950">
                    <div className="flex items-center gap-2.5 flex-1 pr-2 truncate">
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        className="w-10 h-12 object-cover rounded-lg border border-amber-400 shrink-0 bg-white shadow-xs"
                      />
                      <div className="truncate">
                        <strong className="text-stone-950 text-xs block truncate font-black">{item.productTitle}</strong>
                        <span className="text-[10px] text-amber-950 font-bold">({item.variantName})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white">
                        <button
                          onClick={() => handleUpdateQty(item.variantId, item.quantity - 1)}
                          className="px-2 py-1 text-stone-950 hover:bg-stone-100 font-black text-xs rounded-l-lg"
                        >
                          -
                        </button>
                        <span className="px-2 font-mono font-black text-stone-950 text-xs">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item.variantId, item.quantity + 1)}
                          className="px-2 py-1 text-stone-950 hover:bg-stone-100 font-black text-xs rounded-r-lg"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-serif font-black text-amber-900 text-xs w-16 text-right">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </span>

                      <button
                        onClick={() => handleUpdateQty(item.variantId, 0)}
                        className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Walk-in Customer Info */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-amber-400/30">
              <div>
                <label className="block text-stone-950 text-xs mb-1 font-black">ชื่อลูกค้า (หรือ Walk-in)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white border-2 border-stone-400 rounded-xl p-2 text-stone-950 font-black text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-950 text-xs mb-1 font-black">ส่วนลดหน้าร้าน (บาท)</label>
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
                  className="w-full bg-white border-2 border-amber-500 rounded-xl p-2 text-amber-900 font-black font-mono text-xs text-right focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2.5 pt-2.5 border-t-2 border-amber-400/30">
              <label className="block text-stone-950 text-xs font-black">เลือกวิธีชำระเงินหน้าร้าน:</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-xl border-2 text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'bg-amber-400 text-stone-950 font-black border-amber-500 shadow-md'
                      : 'bg-white text-stone-950 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-stone-950" />
                  <span className="text-xs font-black">เงินสด (Cash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`p-2.5 rounded-xl border-2 text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'promptpay'
                      ? 'bg-amber-400 text-stone-950 font-black border-amber-500 shadow-md'
                      : 'bg-white text-stone-950 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-stone-950" />
                  <span className="text-xs font-black">พร้อมเพย์ QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-2.5 rounded-xl border-2 text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'credit_card'
                      ? 'bg-amber-400 text-stone-950 font-black border-amber-500 shadow-md'
                      : 'bg-white text-stone-950 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-stone-950" />
                  <span className="text-xs font-black">รูดบัตร EDC</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('gov_copay')}
                  className={`p-2.5 rounded-xl border-2 text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'gov_copay'
                      ? 'bg-amber-400 text-stone-950 font-black border-amber-500 shadow-md'
                      : 'bg-white text-stone-950 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-black">โครงการรัฐบาล</span>
                </button>
              </div>

              {/* Cash Quick Presets & Change Calculation */}
              {paymentMethod === 'cash' && (
                <div className="p-4 bg-amber-50/60 rounded-2xl border-2 border-amber-400 space-y-3 shadow-md text-stone-950">
                  <div className="space-y-1.5">
                    <span className="text-stone-950 text-xs font-black block">ปุ่มลัดรับเงินสด (Quick Cash Presets):</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickCashPreset(netAmount)}
                        className="px-3 py-1.5 bg-amber-400 text-stone-950 border border-amber-500 rounded-xl font-black text-xs shadow-md hover:bg-amber-300 transition cursor-pointer"
                      >
                        พอดี (฿{netAmount.toLocaleString()})
                      </button>
                      {[100, 500, 1000, 2000, 5000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleQuickCashPreset(amt)}
                          className="px-3 py-1.5 bg-white hover:bg-amber-400 text-stone-950 border border-stone-300 rounded-xl font-mono font-black text-xs shadow-xs transition cursor-pointer"
                        >
                          ฿{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-stone-950 text-xs sm:text-sm font-black">รับเงินสดมา (บาท):</span>
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
                      className="w-36 bg-white border-2 border-amber-500 rounded-xl p-2 text-right font-mono font-black text-stone-950 text-base shadow-inner focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-emerald-500 shadow-md">
                    <span className="text-emerald-950 font-serif font-black text-xs sm:text-sm">เงินทอนลูกค้า:</span>
                    <span className="text-emerald-800 font-serif font-black text-xl sm:text-2xl">
                      ฿{changeAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* PromptPay QR View */}
              {paymentMethod === 'promptpay' && qrCodeUrl && (
                <div className="p-4 bg-amber-50/60 rounded-2xl border-2 border-amber-400 flex items-center gap-3.5 shadow-md text-stone-950">
                  <img src={qrCodeUrl} alt="POS QR Code" className="w-24 h-24 rounded-xl border-2 border-amber-400 bg-white shadow-md shrink-0" />
                  <div className="space-y-1">
                    <span className="text-stone-950 font-black block text-xs sm:text-sm">สแกนชำระพร้อมเพย์:</span>
                    <p className="text-amber-900 font-serif font-black text-xl">฿{netAmount.toLocaleString()}</p>
                    <p className="text-xs text-stone-700 font-bold">เบอร์ร้าน: {storeSettings.promptPayNumber}</p>
                  </div>
                </div>
              )}

              {/* Payment Summary for Government Co-Pay */}
              {paymentMethod === 'gov_copay' && (
                <div className="p-4 bg-amber-50/60 rounded-2xl border-2 border-amber-400 space-y-3 shadow-md text-stone-950">
                  <div className="space-y-1.5">
                    <span className="text-stone-950 font-black text-xs block">สัดส่วนเงินสนับสนุนโครงการรัฐบาล:</span>
                    
                    <div className="grid grid-cols-4 gap-1.5 text-xs font-black">
                      {['60_40', '50_50', '70_30', 'custom'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setGovRatio(mode as any)}
                          className={`py-2 rounded-xl border-2 text-center transition cursor-pointer ${
                            govRatio === mode
                              ? 'bg-amber-400 text-stone-950 border-amber-500 font-black shadow-md'
                              : 'bg-white text-stone-950 border-stone-300 hover:bg-stone-100'
                          }`}
                        >
                          {mode === '60_40' ? '60 / 40' : mode === '50_50' ? '50 / 50' : mode === '70_30' ? '70 / 30' : 'ระบุ % เอง'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {govRatio === 'custom' && (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-300">
                      <span className="text-stone-950 font-black text-xs">ระบุ % รัฐบาลจ่าย:</span>
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
                          className="w-20 bg-white border-2 border-stone-400 rounded-lg px-2 py-1 text-right text-stone-950 font-mono font-black text-sm"
                        />
                        <span className="text-stone-950 font-black">%</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex justify-between items-center text-amber-950 font-black">
                      <span>รัฐบาล/โครงการจ่าย ({govPercent}%):</span>
                      <span className="font-serif font-black text-amber-900 text-sm">
                        ฿{govAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-emerald-950 font-black bg-white p-2.5 rounded-xl border-2 border-emerald-500 shadow-sm">
                      <span>ยอดที่ลูกค้าชำระเพิ่ม ({customerPercent}%):</span>
                      <span className="font-serif font-black text-base text-emerald-800">
                        ฿{customerPayAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {qrCodeUrl && (
                    <div className="p-3 bg-white rounded-xl border border-stone-300 flex items-center gap-3">
                      <img src={qrCodeUrl} alt="POS Gov QR Code" className="w-20 h-20 rounded-lg border border-amber-400 bg-white shrink-0" />
                      <div className="space-y-1 text-xs">
                        <span className="text-stone-950 font-black block">สแกนชำระส่วนของลูกค้า (เป๋าตัง/พร้อมเพย์):</span>
                        <p className="text-amber-900 font-serif font-black text-base">฿{customerPayAmount.toLocaleString()}</p>
                        <p className="text-[11px] text-stone-700 font-bold">แอปถุงเงิน / เบอร์ร้าน: {storeSettings.promptPayNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Total Summary & Complete Action */}
            <div className="pt-3 border-t-2 border-amber-400/40 space-y-3">
              <div className="flex justify-between items-baseline font-serif">
                <span className="text-stone-800 text-sm font-black">ยอดชำระสุทธิ:</span>
                <span className="text-2xl font-black text-amber-900">
                  ฿{netAmount.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleCheckoutPOS}
                disabled={posCart.length === 0}
                className={`w-full py-4 text-sm font-black uppercase tracking-wider rounded-xl shadow-xl transition flex items-center justify-center gap-2 border cursor-pointer ${
                  posCart.length === 0
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed border-stone-300'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700 shadow-md font-sans'
                }`}
              >
                <CheckCircle className="w-5 h-5 text-white" />
                <span>ยืนยันการขาย &amp; ออกใบเสร็จ (ชำระเงิน ฿{netAmount.toLocaleString()})</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* FULL PRODUCT IMAGE ZOOM PREVIEW MODAL */}
      {previewImageProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-2xl w-full p-5 sm:p-6 text-stone-950 shadow-2xl space-y-4 text-left animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b-2 border-amber-400/40 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-400">
                  {previewImageProduct.category === 'perfume' ? 'น้ำหอมดูไบ (Dubai Perfume)' : previewImageProduct.category}
                </span>
                <h3 className="font-serif font-black text-lg sm:text-xl text-stone-950 mt-1">
                  {previewImageProduct.title}
                </h3>
                {previewImageProduct.fabric && (
                  <p className="text-xs text-stone-700 font-bold">{previewImageProduct.fabric}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPreviewImageProduct(null)}
                className="text-stone-700 hover:text-stone-950 p-1.5 rounded-full border border-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Uncropped Image Box */}
            <div className="relative bg-stone-50 border-2 border-stone-300 rounded-2xl p-3 flex items-center justify-center min-h-[320px] max-h-[50vh] overflow-hidden shadow-inner">
              <img
                src={previewImageProduct.images[activeImageIndex] || previewImageProduct.images[0]}
                alt={previewImageProduct.title}
                className="max-w-full max-h-[46vh] object-contain rounded-xl shadow-md transition-all duration-300"
              />

              {previewImageProduct.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/70 px-3 py-1 rounded-full text-white text-[10px] font-black border border-white/30">
                  <span>รูปที่ {activeImageIndex + 1} จาก {previewImageProduct.images.length}</span>
                </div>
              )}
            </div>

            {/* Gallery Thumbnails list if multiple images exist */}
            {previewImageProduct.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {previewImageProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-16 rounded-xl border-2 p-0.5 overflow-hidden transition cursor-pointer shrink-0 ${
                      activeImageIndex === idx ? 'border-amber-500 ring-2 ring-amber-400/50' : 'border-stone-300 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            )}

            {/* Direct Add-to-Cart Size Selector inside Image Modal */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <span className="text-xs font-black text-stone-950 block">เลือกไซส์ / แบบ เพิ่มเข้าตะกร้าขาย POS ได้ทันที:</span>
              <div className="flex flex-wrap gap-2">
                {previewImageProduct.variants.map((v) => {
                  const isOut = v.stockQuantity <= 0;
                  return (
                    <button
                      key={v.id}
                      disabled={isOut}
                      onClick={() => {
                        handleAddToCart(previewImageProduct, v);
                        setPreviewImageProduct(null);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black border transition flex items-center gap-2 cursor-pointer ${
                        isOut
                          ? 'bg-stone-100 border-stone-300 text-stone-400 line-through opacity-50 cursor-not-allowed'
                          : 'bg-amber-400 hover:bg-amber-300 text-stone-950 border-amber-500 shadow-md'
                      }`}
                    >
                      <span>{v.name} {v.color ? `(${v.color})` : ''}</span>
                      <span className="font-serif">฿{v.price.toLocaleString()}</span>
                      <span className="text-[10px] bg-stone-950 text-white px-2 py-0.5 rounded-full font-mono">
                        {isOut ? 'หมด' : `${v.stockQuantity} ชิ้น`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-stone-600 font-bold">
                💡 สามารถดูรายละเอียดและลายปักบนเสื้อผ้า/ขวดน้ำหอมได้แบบคมชัด 100%
              </span>
              <button
                type="button"
                onClick={() => setPreviewImageProduct(null)}
                className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-950 font-black rounded-xl border border-stone-300 text-xs cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

      {/* POS Completed Thermal Receipt Slip Modal */}
      {completedPOSOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-stone-950 p-6 my-8 space-y-4 text-center">
            
            <div className="w-14 h-14 bg-emerald-100 border-2 border-emerald-500 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-black text-lg text-stone-950">
                การขายหน้าร้านสำเร็จเรียบร้อย!
              </h3>
              <p className="text-xs text-stone-700 font-bold">
                ระบบได้ทำการตัดสต๊อกสินค้าเรียลไทม์ และบันทึกยอดขายหน้าร้านแล้ว
              </p>
            </div>

            {/* Thermal Receipt Print Slip Layout */}
            <div id="pos-thermal-slip" className="p-5 bg-stone-50 text-black rounded-xl text-left text-xs font-mono space-y-3 shadow-inner border border-stone-300">
              <div className="text-center border-b border-black/30 pb-2 space-y-1">
                {storeSettings.logoImageUrl && (
                  <img src={storeSettings.logoImageUrl} alt="Logo" className="w-12 h-12 rounded-full mx-auto object-cover border border-black bg-white" />
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
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-stone-950" />
                <span>พิมพ์ใบเสร็จ (Print Slip)</span>
              </button>
              <button
                onClick={handleResetPOS}
                className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs uppercase shadow-md border border-amber-500 cursor-pointer"
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
