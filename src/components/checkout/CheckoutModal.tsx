'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, QrCode, CreditCard, Building, Truck, Wallet, Upload, Download, AlertCircle, Copy, Sparkles, ClipboardPaste } from 'lucide-react';
import QRCode from 'qrcode';
import { useShop } from '../../context/ShopContext';
import { PaymentMethodType, Order } from '../../types';
import { generatePromptPayPayload } from '../../utils/promptpayUtils';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, onSuccess }) => {
  const { cart, appliedCoupon, createOrder, storeSettings } = useShop();

  const enablePromptPay = storeSettings.enablePromptPay ?? true;
  const enableBankTransfer = storeSettings.enableBankTransfer ?? true;
  const enableCreditCard = storeSettings.enableCreditCard ?? true;
  const enableCOD = storeSettings.enableCOD ?? true;
  const enableTrueMoney = storeSettings.enableTrueMoney ?? true;

  const initialMethod: PaymentMethodType = enablePromptPay
    ? 'promptpay'
    : enableBankTransfer
    ? 'bank_transfer'
    : enableCreditCard
    ? 'credit_card'
    : enableCOD
    ? 'cod'
    : 'truemoney';

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [province, setProvince] = useState('กรุงเทพมหานคร');
  const [district, setDistrict] = useState('');
  const [subDistrict, setSubDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [note, setNote] = useState('');

  // Quick Address Smart Paste (วางข้อความที่อยู่ด่วน แยกลงช่องให้อัตโนมัติ)
  const [showQuickPaste, setShowQuickPaste] = useState(false);
  const [quickPasteText, setQuickPasteText] = useState('');

  const handleApplyQuickPaste = (raw: string) => {
    if (!raw.trim()) return;
    let text = raw.trim();

    // 1. Extract phone number (e.g. 0812345678, 081-234-5678, 09x, 06x)
    const phoneMatch = text.match(/(?:tel|โทร|เบอร์|โทรศัพท์)?[:\s-]*([0][689]\d{1}[-\s]?\d{3}[-\s]?\d{4}|[0][2-9]\d{1}[-\s]?\d{3}[-\s]?\d{3,4})/i);
    if (phoneMatch) {
      const cleanPhone = phoneMatch[1].replace(/[-\s]/g, '');
      setCustomerPhone(cleanPhone);
      text = text.replace(phoneMatch[0], ' ');
    }

    // 2. Extract 5-digit postal code
    const zipMatch = text.match(/\b([1-9]\d{4})\b/);
    if (zipMatch) {
      setPostalCode(zipMatch[1]);
      text = text.replace(zipMatch[0], ' ');
    }

    // 3. Extract province if mentions จ. or จังหวัด
    const provMatch = text.match(/(?:จ\.|จังหวัด)\s*([^\s]+)/);
    if (provMatch) {
      setProvince(provMatch[1]);
      text = text.replace(provMatch[0], ' ');
    }

    // 4. Split remaining text into name and address
    const cleanLines = text.split(/[\n,]/).map(l => l.trim()).filter(Boolean);
    if (cleanLines.length >= 2) {
      const name = cleanLines[0].replace(/^(ชื่อ|ผู้รับ|คุณ|k\.)[:\s]*/i, '').trim();
      const addr = cleanLines.slice(1).join(' ').trim();
      if (name) setCustomerName(name);
      if (addr) setCustomerAddress(addr);
    } else {
      const parts = text.split(/\s+/).filter(Boolean);
      if (parts.length >= 3) {
        setCustomerName(`${parts[0]} ${parts[1]}`);
        setCustomerAddress(parts.slice(2).join(' '));
      } else if (parts.length > 0) {
        setCustomerAddress(text);
      }
    }

    setShowQuickPaste(false);
    setQuickPasteText('');
  };

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(initialMethod);
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discountValue = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percent') {
      discountValue = Math.min(500, (subtotal * appliedCoupon.discountValue) / 100);
    } else {
      discountValue = appliedCoupon.discountValue;
    }
  }
  const shippingFee = subtotal >= 2000 || subtotal === 0 ? 0 : 80;
  const netAmount = Math.max(0, subtotal - discountValue + shippingFee);

  const SHOP_PROMPTPAY_NUMBER = storeSettings.promptPayNumber || '0812345678';
  const SHOP_NAME = storeSettings.storeName || 'HUDA ABAYA DUBAI';

  useEffect(() => {
    if (paymentMethod === 'promptpay') {
      const promptpayPayload = generatePromptPayPayload(SHOP_PROMPTPAY_NUMBER, netAmount);
      if (promptpayPayload) {
        QRCode.toDataURL(promptpayPayload, {
          width: 280,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        })
          .then((url) => setQrCodeDataUrl(url))
          .catch((err) => console.error('QR generation error', err));
      } else {
        setQrCodeDataUrl('');
      }
    }
  }, [paymentMethod, netAmount, SHOP_PROMPTPAY_NUMBER]);

  const handleCopyAccount = (accNo: string) => {
    navigator.clipboard.writeText(accNo);
    setCopiedAccount(accNo);
    setTimeout(() => setCopiedAccount(null), 3000);
  };

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const rawBase64 = reader.result;
          const img = new Image();
          img.src = rawBase64;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 600;
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.75);
            setSlipImage(compressed);
          };
          img.onerror = () => {
            setSlipImage(rawBase64);
          };
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerPhone || !customerAddress || !postalCode) {
      alert('กรุณากรอกข้อมูลชื่อ เบอร์โทรศัพท์ และที่อยู่จัดส่งให้ครบถ้วนค่ะ');
      return;
    }

    if (paymentMethod === 'bank_transfer' && !slipImage) {
      alert('กรุณาแนบภาพสลิปการโอนเงินชำระค่าสินค้าค่ะ');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      let paymentStatus: Order['paymentStatus'] = 'paid';
      if (paymentMethod === 'bank_transfer') paymentStatus = 'slip_uploaded';
      if (paymentMethod === 'cod') paymentStatus = 'pending';

      const newOrder = createOrder({
        customerName,
        customerPhone,
        customerAddress,
        province,
        district,
        subDistrict,
        postalCode,
        note,
        items: cart,
        totalAmount: subtotal,
        discountAmount: discountValue,
        shippingFee,
        netAmount,
        paymentMethod,
        paymentStatus,
        orderStatus: 'pending',
        slipImage: slipImage || undefined,
      });

      setIsSubmitting(false);
      setCompletedOrder(newOrder);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white border border-stone-200 max-w-3xl w-full overflow-hidden shadow-2xl text-[#141312] my-8">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF9F6] border-b border-stone-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-serif tracking-[0.22em] uppercase text-[#8C703E]">
              {completedOrder ? 'ORDER CONFIRMATION' : 'CHECKOUT & DELIVERY'}
            </p>
            <h3 className="font-serif font-normal text-lg sm:text-xl text-[#141312] mt-0.5">
              {completedOrder ? 'ใบยืนยันคำสั่งซื้อ' : `ยืนยันคำสั่งซื้อ — ${SHOP_NAME}`}
            </h3>
          </div>
          <button
            onClick={completedOrder ? onSuccess : onClose}
            className="text-stone-500 hover:text-[#141312] p-2 border border-stone-200 bg-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Digital Receipt View */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-12 h-12 bg-[#141312] text-[#D4B57B] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-serif text-[#141312]">
                ได้รับคำสั่งซื้อเรียบร้อยแล้ว
              </h4>
              <p className="text-xs text-stone-500">
                ขอบคุณที่ไว้วางใจเลือกซื้อสินค้ากับ <strong className="text-[#141312]">{SHOP_NAME}</strong>
              </p>
            </div>

            {/* Receipt Details Box */}
            <div className="bg-[#FAF9F6] border border-stone-200 p-5 text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-stone-200 pb-2.5">
                <span className="text-stone-500">หมายเลขคำสั่งซื้อ (Order ID)</span>
                <span className="text-[#141312] font-mono font-semibold">{completedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">ชื่อผู้รับ</span>
                <span className="text-[#141312] font-medium">{completedOrder.customerName} ({completedOrder.customerPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">ที่อยู่จัดส่ง</span>
                <span className="text-[#141312] text-right max-w-xs truncate">{completedOrder.customerAddress} {completedOrder.province} {completedOrder.postalCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">ช่องทางชำระเงิน</span>
                <span className="text-[#8C703E] font-medium uppercase">{completedOrder.paymentMethod}</span>
              </div>

              <div className="pt-2.5 border-t border-stone-200 space-y-1.5">
                <span className="text-stone-500 block mb-1">รายการสินค้า</span>
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[#141312]">
                    <span>{item.productTitle} ({item.variantName}) × {item.quantity}</span>
                    <span className="font-mono">฿{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2.5 border-t border-stone-200 flex justify-between font-serif text-sm font-semibold text-[#141312]">
                <span>ยอดรวมชำระสุทธิ</span>
                <span className="text-lg">฿{completedOrder.netAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3.5 bg-white border border-stone-300 hover:border-[#141312] text-[#141312] text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>พิมพ์ใบยืนยัน</span>
              </button>
              <button
                onClick={onSuccess}
                className="flex-1 py-3.5 bg-[#141312] hover:bg-[#292624] text-white text-xs tracking-[0.2em] uppercase transition cursor-pointer"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-8">
            
            {/* Step 1: Customer Shipping Address */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                <h4 className="font-serif text-sm text-[#141312] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#8C703E]" />
                  <span>1. ข้อมูลการจัดส่ง (Shipping Details)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowQuickPaste(!showQuickPaste)}
                  className="text-xs text-[#8C703E] hover:text-[#5E4B28] font-bold flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAF9F6] border border-[#8C703E]/40 hover:bg-[#F3EFE6] transition cursor-pointer"
                  title="คัดลอกข้อความที่อยู่จาก LINE หรือ Facebook มาวาง ระบบจะแยกลงช่องให้อัตโนมัติ"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>{showQuickPaste ? 'ปิดช่องวางด่วน' : '⚡ วางที่อยู่แบบข้อความเดียวจบ'}</span>
                </button>
              </div>

              {/* Quick Smart Paste Box */}
              {showQuickPaste && (
                <div className="bg-[#FAF9F6] border-2 border-dashed border-[#8C703E]/60 rounded-xl p-3.5 space-y-2.5 animate-in fade-in-50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#141312] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#8C703E]" />
                      <span>วางข้อความชื่อ ที่อยู่ เบอร์โทร (ระบบจะกรอกลงช่องให้อัตโนมัติในคลิกเดียว):</span>
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={quickPasteText}
                    onChange={(e) => setQuickPasteText(e.target.value)}
                    placeholder="เช่น คุณวรรณา มีสุข 0812345678 123/45 ซ.สุขุมวิท 101 แขวงบางจาก เขตพระโขนง กรุงเทพฯ 10260"
                    className="w-full bg-white border border-stone-300 p-2.5 text-xs text-[#141312] rounded-lg focus:outline-none focus:border-[#8C703E]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickPaste(false)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      disabled={!quickPasteText.trim()}
                      onClick={() => handleApplyQuickPaste(quickPasteText)}
                      className="px-4 py-1.5 bg-[#141312] hover:bg-[#292624] text-white rounded-lg text-xs font-bold transition disabled:opacity-40"
                    >
                      ✨ แยกลงช่องให้อัตโนมัติ
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-stone-600 mb-1.5">ชื่อ-นามสกุล ผู้รับ *</label>
                  <input
                    type="text"
                    required
                    placeholder="ระบุชื่อ-นามสกุล"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-stone-300 p-2.5 text-[#141312] placeholder-stone-400 focus:outline-none focus:border-[#141312]"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1.5">เบอร์โทรศัพท์ติดต่อ *</label>
                  <input
                    type="tel"
                    required
                    placeholder="เช่น 0899998888"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white border border-stone-300 p-2.5 text-[#141312] placeholder-stone-400 focus:outline-none focus:border-[#141312]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-600 mb-1.5">ที่อยู่จัดส่ง (บ้านเลขที่ ถนน ซอย แขวง/ตำบล เขต/อำเภอ) *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="กรอกรายละเอียดที่อยู่สำหรับจัดส่งพัสดุ"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-white border border-stone-300 p-2.5 text-[#141312] placeholder-stone-400 focus:outline-none focus:border-[#141312]"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1.5">จังหวัด *</label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-white border border-stone-300 p-2.5 text-[#141312] focus:outline-none focus:border-[#141312]"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1.5">รหัสไปรษณีย์ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 10530"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-white border border-stone-300 p-2.5 text-[#141312] focus:outline-none focus:border-[#141312]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Channels Selection */}
            <div className="space-y-4">
              <h4 className="font-serif text-sm text-[#141312] flex items-center gap-2 border-b border-stone-200 pb-2.5">
                <CreditCard className="w-4 h-4 text-[#8C703E]" />
                <span>2. ช่องทางชำระเงิน (Payment Method)</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {enablePromptPay && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('promptpay')}
                    className={`p-3.5 border text-left transition flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'promptpay'
                        ? 'border-[#141312] bg-[#FAF9F6]'
                        : 'border-stone-200 bg-white hover:border-stone-400'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-[#8C703E] mb-2" />
                    <span className="text-xs font-medium text-[#141312] block">พร้อมเพย์ QR</span>
                    <span className="text-[10px] text-stone-500">สแกนชำระผ่านแอปธนาคาร</span>
                  </button>
                )}

                {enableBankTransfer && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-3.5 border text-left transition flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-[#141312] bg-[#FAF9F6]'
                        : 'border-stone-200 bg-white hover:border-stone-400'
                    }`}
                  >
                    <Building className="w-5 h-5 text-[#8C703E] mb-2" />
                    <span className="text-xs font-medium text-[#141312] block">โอนผ่านบัญชีธนาคาร</span>
                    <span className="text-[10px] text-stone-500">แนบหลักฐานสลิปโอนเงิน</span>
                  </button>
                )}

                {enableCreditCard && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3.5 border text-left transition flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'credit_card'
                        ? 'border-[#141312] bg-[#FAF9F6]'
                        : 'border-stone-200 bg-white hover:border-stone-400'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[#8C703E] mb-2" />
                    <span className="text-xs font-medium text-[#141312] block">บัตรเครดิต / เดบิต</span>
                    <span className="text-[10px] text-stone-500">Visa / Mastercard</span>
                  </button>
                )}

                {enableCOD && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3.5 border text-left transition flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-[#141312] bg-[#FAF9F6]'
                        : 'border-stone-200 bg-white hover:border-stone-400'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-[#8C703E] mb-2" />
                    <span className="text-xs font-medium text-[#141312] block">เก็บเงินปลายทาง</span>
                    <span className="text-[10px] text-stone-500">ชำระเมื่อได้รับสินค้า</span>
                  </button>
                )}

                {enableTrueMoney && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('truemoney')}
                    className={`p-3.5 border text-left transition flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'truemoney'
                        ? 'border-[#141312] bg-[#FAF9F6]'
                        : 'border-stone-200 bg-white hover:border-stone-400'
                    }`}
                  >
                    <Wallet className="w-5 h-5 text-[#8C703E] mb-2" />
                    <span className="text-xs font-medium text-[#141312] block">TrueMoney Wallet</span>
                    <span className="text-[10px] text-stone-500">กระเป๋าเงินอิเล็กทรอนิกส์</span>
                  </button>
                )}
              </div>

              {/* Dynamic Payment Channel Details */}
              <div className="bg-[#FAF9F6] p-5 border border-stone-200 text-xs">
                {paymentMethod === 'promptpay' && enablePromptPay && (
                  <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    {qrCodeDataUrl ? (
                      <div className="p-2.5 bg-white border border-stone-200 shrink-0">
                        <img src={qrCodeDataUrl} alt="PromptPay QR Code" className="w-36 h-36" />
                        <span className="block text-[10px] text-stone-500 text-center mt-1 font-mono">
                          PromptPay: {SHOP_PROMPTPAY_NUMBER}
                        </span>
                      </div>
                    ) : (
                      <div className="w-36 h-36 bg-stone-100 flex items-center justify-center text-stone-400">
                        กำลังสร้าง QR...
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <p className="font-serif font-medium text-[#141312] text-sm">
                        สแกน QR Code ด้วยแอปพลิเคชันธนาคาร
                      </p>
                      <p className="text-stone-600">
                        ชื่อบัญชีร้าน: <strong className="text-[#141312]">{SHOP_NAME}</strong>
                      </p>
                      <p className="text-stone-600">
                        ยอดชำระสุทธิ: <strong className="text-[#141312] text-base font-serif">฿{netAmount.toLocaleString()}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'bank_transfer' && enableBankTransfer && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-white border border-stone-200 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-medium text-[#8C703E]">{storeSettings.bankName}</p>
                        <p className="text-[#141312] font-mono font-semibold text-sm">{storeSettings.bankAccountNo}</p>
                        <p className="text-stone-500">ชื่อบัญชี: {storeSettings.bankAccountName}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyAccount(storeSettings.bankAccountNo)}
                        className="px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#141312] hover:text-white text-[#141312] border border-stone-300 text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedAccount ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>

                    <div className="pt-2">
                      <label className="block text-[#141312] font-medium mb-2">
                        แนบหลักฐานการโอนเงิน (สลิปธนาคาร) *
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-[#141312] hover:bg-[#292624] text-white px-4 py-2.5 text-xs tracking-wider uppercase flex items-center gap-2 transition">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{slipImage ? 'เปลี่ยนไฟล์สลิป' : 'อัปโหลดรูปสลิป'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleSlipUpload} />
                        </label>
                        {slipImage && (
                          <div className="flex items-center gap-2">
                            <img src={slipImage} alt="slip preview" className="w-10 h-10 object-cover border border-stone-300" />
                            <span className="text-emerald-700 text-[11px] font-medium">แนบสลิปเรียบร้อยแล้ว</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'credit_card' && enableCreditCard && (
                  <div className="space-y-1">
                    <p className="font-serif font-medium text-[#141312]">
                      ชำระด้วยบัตรเครดิต / เดบิต (Visa, Mastercard, JCB)
                    </p>
                    <p className="text-stone-500 text-[11px]">
                      รองรับการชำระเงินปลอดภัยตามมาตรฐานสากล 3D-Secure
                    </p>
                  </div>
                )}

                {paymentMethod === 'cod' && enableCOD && (
                  <div className="flex items-start gap-2.5 text-stone-700">
                    <AlertCircle className="w-4 h-4 text-[#8C703E] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#141312]">ชำระเงินสดปลายทาง (Cash on Delivery)</p>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        เตรียมชำระยอด <strong className="text-[#141312]">฿{netAmount.toLocaleString()}</strong> กับเจ้าหน้าที่ขนส่งเมื่อได้รับพัสดุ
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'truemoney' && enableTrueMoney && (
                  <div className="space-y-1">
                    <p className="font-serif font-medium text-[#141312]">
                      ชำระผ่าน TrueMoney Wallet
                    </p>
                    <p className="text-stone-500 text-[11px]">
                      ยอดชำระสุทธิ ฿{netAmount.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Total Summary & Confirm Button */}
            <div className="pt-5 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-stone-500">ยอดชำระสุทธิทั้งสิ้น</span>
                <p className="text-2xl font-serif font-semibold text-[#141312]">
                  ฿{netAmount.toLocaleString()}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-4 bg-[#141312] hover:bg-[#292624] text-white text-xs tracking-[0.2em] uppercase transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>กำลังบันทึกคำสั่งซื้อ...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-[#D4B57B]" />
                    <span>ยืนยันคำสั่งซื้อ</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

