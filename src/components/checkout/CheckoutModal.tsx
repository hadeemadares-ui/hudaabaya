'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, QrCode, CreditCard, Building, Truck, Wallet, Upload, Download, Sparkles, AlertCircle, Copy } from 'lucide-react';
import QRCode from 'qrcode';
import { useShop } from '../../context/ShopContext';
import { PaymentMethodType, Order } from '../../types';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, onSuccess }) => {
  const { cart, appliedCoupon, createOrder, storeSettings } = useShop();

  // Payment Toggles from Settings
  const enablePromptPay = storeSettings.enablePromptPay ?? true;
  const enableBankTransfer = storeSettings.enableBankTransfer ?? true;
  const enableCreditCard = storeSettings.enableCreditCard ?? true;
  const enableCOD = storeSettings.enableCOD ?? true;
  const enableTrueMoney = storeSettings.enableTrueMoney ?? true;

  // Default initial active payment method
  const initialMethod: PaymentMethodType = enablePromptPay
    ? 'promptpay'
    : enableBankTransfer
    ? 'bank_transfer'
    : enableCreditCard
    ? 'credit_card'
    : enableCOD
    ? 'cod'
    : 'truemoney';

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [province, setProvince] = useState('กรุงเทพมหานคร');
  const [district, setDistrict] = useState('');
  const [subDistrict, setSubDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [note, setNote] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(initialMethod);
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Calculate totals
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

  // Dynamic Shop Payment Details Configuration
  const SHOP_PROMPTPAY_NUMBER = storeSettings.promptPayNumber || '0812345678';
  const SHOP_NAME = storeSettings.storeName || 'ร้าน HUDA ABAYA DUBAI';

  // Generate PromptPay QR Code
  useEffect(() => {
    if (paymentMethod === 'promptpay') {
      const cleanPhone = SHOP_PROMPTPAY_NUMBER.replace(/[^0-9]/g, '');
      const promptpayPayload = `00020101021229370016A00000067701011101130066${cleanPhone.slice(1)}5802TH5303764540${netAmount.toFixed(
        2
      ).length.toString().padStart(2, '0')}${netAmount.toFixed(2)}6304`;
      
      QRCode.toDataURL(promptpayPayload, { width: 250, margin: 1 })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR generation error', err));
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
      alert('กรุณากรอกข้อมูลชื่อ เบอร์โทร และที่อยู่จัดส่งให้ครบถ้วนค่ะ');
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
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-dubai-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-dubai-card border-2 border-gold-400/50 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl text-white my-8">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-dubai-black border-b border-gold-400/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-400" />
            <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
              {completedOrder ? 'ใบเสร็จรับเงิน (Order Receipt)' : `ชำระเงิน & จัดส่ง ${SHOP_NAME}`}
            </h3>
          </div>
          <button
            onClick={completedOrder ? onSuccess : onClose}
            className="text-gold-400 hover:text-white p-2 rounded-full border border-gold-400/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Digital Receipt View */}
        {completedOrder ? (
          <div className="p-6 space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-950/80 border-2 border-emerald-400 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-serif font-bold text-gold-300">
                สั่งซื้อสินค้าสำเร็จแล้วค่ะ!
              </h4>
              <p className="text-xs text-gray-300">
                ขอบคุณที่เลือกซื้อสินค้าจาก <strong className="text-gold-400">{SHOP_NAME}</strong>
              </p>
            </div>

            {/* Receipt Details Box */}
            <div className="bg-dubai-black border border-gold-400/30 rounded-xl p-5 text-left text-xs space-y-3 font-mono">
              <div className="flex justify-between border-b border-gold-400/20 pb-2">
                <span className="text-gold-400 font-bold">หมายเลขออเดอร์ (Order ID):</span>
                <span className="text-white font-bold">{completedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ชื่อผู้รับ:</span>
                <span className="text-white">{completedOrder.customerName} ({completedOrder.customerPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ที่อยู่จัดส่ง:</span>
                <span className="text-white text-right max-w-xs truncate">{completedOrder.customerAddress} {completedOrder.province} {completedOrder.postalCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ช่องทางชำระเงิน:</span>
                <span className="text-gold-300 font-bold uppercase">{completedOrder.paymentMethod} ({completedOrder.paymentStatus})</span>
              </div>
              
              <div className="pt-2 border-t border-gold-400/20 space-y-1">
                <span className="text-gold-400 font-bold block mb-1">รายการสินค้าที่สั่ง:</span>
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-gray-300">
                    <span>{item.productTitle} ({item.variantName}) x {item.quantity}</span>
                    <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gold-400/20 flex justify-between font-serif text-sm font-bold text-gold-400">
                <span>ยอดรวมชำระทั้งสิ้น:</span>
                <span className="text-lg">฿{completedOrder.netAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-dubai-dark border border-gold-400/40 text-gold-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลด / พิมพ์ใบเสร็จ</span>
              </button>
              <button
                onClick={onSuccess}
                className="flex-1 py-3 rounded-xl bg-gold-500 text-dubai-black font-extrabold text-xs uppercase tracking-wider shadow-gold-glow"
              >
                เสร็จสิ้น ปิดหน้าต่าง
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
            
            {/* Step 1: Customer Shipping Address */}
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-sm text-gold-300 flex items-center gap-2 border-b border-gold-400/20 pb-2">
                <Truck className="w-4 h-4 text-gold-400" />
                <span>1. ข้อมูลชื่อและที่อยู่จัดส่ง (Shipping Information)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-300 mb-1">ชื่อ-นามสกุล ผู้รับ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น คุณกานดา สมบูรณ์"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-dubai-black border border-gold-400/30 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">เบอร์โทรศัพท์ติดต่อ *</label>
                  <input
                    type="tel"
                    required
                    placeholder="เช่น 0899998888"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-dubai-black border border-gold-400/30 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-300 mb-1">ที่อยู่บ้านเลขที่ ถนน ซอย *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="เช่น 123/45 ซอยสุขุมวิท 55 แขวงคลองตันเหนือ"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-dubai-black border border-gold-400/30 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">จังหวัด *</label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-dubai-black border border-gold-400/30 rounded-lg p-2.5 text-white focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">รหัสไปรษณีย์ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 10110"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-dubai-black border border-gold-400/30 rounded-lg p-2.5 text-white focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Channels Selection */}
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-sm text-gold-300 flex items-center gap-2 border-b border-gold-400/20 pb-2">
                <CreditCard className="w-4 h-4 text-gold-400" />
                <span>2. เลือกช่องทางคิดเงิน/ชำระเงิน (Select Payment Channel)</span>
              </h4>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                
                {enablePromptPay && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('promptpay')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      paymentMethod === 'promptpay'
                        ? 'bg-gold-500/20 border-gold-400 text-gold-300 ring-1 ring-gold-400 shadow-gold-glow'
                        : 'bg-dubai-black border-gold-400/20 text-gray-300 hover:border-gold-400/50'
                    }`}
                  >
                    <QrCode className="w-6 h-6 text-gold-400 mb-2" />
                    <span className="text-xs font-bold block">พร้อมเพย์ QR Code</span>
                    <span className="text-[10px] text-gray-400">สแกนชำระทันที</span>
                  </button>
                )}

                {enableBankTransfer && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      paymentMethod === 'bank_transfer'
                        ? 'bg-gold-500/20 border-gold-400 text-gold-300 ring-1 ring-gold-400 shadow-gold-glow'
                        : 'bg-dubai-black border-gold-400/20 text-gray-300 hover:border-gold-400/50'
                    }`}
                  >
                    <Building className="w-6 h-6 text-gold-400 mb-2" />
                    <span className="text-xs font-bold block">โอนเงินธนาคาร</span>
                    <span className="text-[10px] text-gray-400">แนบสลิปสแกน</span>
                  </button>
                )}

                {enableCreditCard && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      paymentMethod === 'credit_card'
                        ? 'bg-gold-500/20 border-gold-400 text-gold-300 ring-1 ring-gold-400 shadow-gold-glow'
                        : 'bg-dubai-black border-gold-400/20 text-gray-300 hover:border-gold-400/50'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 text-gold-400 mb-2" />
                    <span className="text-xs font-bold block">บัตรเครดิต / เดบิต</span>
                    <span className="text-[10px] text-gray-400">Visa / Master / JCB</span>
                  </button>
                )}

                {enableCOD && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      paymentMethod === 'cod'
                        ? 'bg-gold-500/20 border-gold-400 text-gold-300 ring-1 ring-gold-400 shadow-gold-glow'
                        : 'bg-dubai-black border-gold-400/20 text-gray-300 hover:border-gold-400/50'
                    }`}
                  >
                    <Truck className="w-6 h-6 text-gold-400 mb-2" />
                    <span className="text-xs font-bold block">ชำระเงินปลายทาง</span>
                    <span className="text-[10px] text-gray-400">COD ชำระกับพนักงานส่ง</span>
                  </button>
                )}

                {enableTrueMoney && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('truemoney')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      paymentMethod === 'truemoney'
                        ? 'bg-gold-500/20 border-gold-400 text-gold-300 ring-1 ring-gold-400 shadow-gold-glow'
                        : 'bg-dubai-black border-gold-400/20 text-gray-300 hover:border-gold-400/50'
                    }`}
                  >
                    <Wallet className="w-6 h-6 text-gold-400 mb-2" />
                    <span className="text-xs font-bold block">TrueMoney / LINE Pay</span>
                    <span className="text-[10px] text-gray-400">กระเป๋าเงินดิจิทัล</span>
                  </button>
                )}

              </div>

              {/* Dynamic Payment Channel Details */}
              <div className="bg-dubai-black p-4 rounded-xl border border-gold-400/30 text-xs">
                
                {/* PROMPTPAY */}
                {paymentMethod === 'promptpay' && enablePromptPay && (
                  <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    {qrCodeDataUrl ? (
                      <div className="p-2 bg-white rounded-xl shadow-lg shrink-0 border-2 border-gold-400">
                        <img src={qrCodeDataUrl} alt="PromptPay QR Code" className="w-40 h-40" />
                        <span className="block text-[10px] text-gray-800 font-bold text-center mt-1">
                          พร้อมเพย์: {SHOP_PROMPTPAY_NUMBER}
                        </span>
                      </div>
                    ) : (
                      <div className="w-40 h-40 bg-gray-800 rounded-xl flex items-center justify-center animate-pulse">
                        กำลังสร้าง QR...
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="font-serif font-bold text-gold-400 text-sm">
                        สแกน QR Code ด้วยแอปพลิเคชันทุกธนาคาร
                      </p>
                      <p className="text-gray-300">
                        บัญชี: <strong className="text-white">{SHOP_NAME}</strong>
                      </p>
                      <p className="text-gray-300">
                        ยอดที่ต้องชำระ: <strong className="text-gold-300 text-base font-serif">฿{netAmount.toLocaleString()}</strong>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        ระบบจะตรวจสอบยอดเงินเข้าโดยอัตโนมัติเมื่อสแกนสำเร็จ
                      </p>
                    </div>
                  </div>
                )}

                {/* BANK TRANSFER */}
                {paymentMethod === 'bank_transfer' && enableBankTransfer && (
                  <div className="space-y-3">
                    <p className="font-serif font-bold text-gold-400">
                      โอนเงินเข้าบัญชีธนาคาร {SHOP_NAME}:
                    </p>
                    
                    <div className="p-3 bg-dubai-card rounded-lg border border-gold-400/20 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-emerald-400">{storeSettings.bankName}</p>
                        <p className="text-white font-mono font-bold text-sm">{storeSettings.bankAccountNo}</p>
                        <p className="text-gray-400">ชื่อบัญชี: {storeSettings.bankAccountName}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyAccount(storeSettings.bankAccountNo)}
                        className="p-2 bg-dubai-black rounded text-gold-400 hover:text-white border border-gold-400/30 font-bold"
                        title="คัดลอกเลขบัญชี"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    {copiedAccount && (
                      <p className="text-[10px] text-emerald-400 font-bold">คัดลอกเลขบัญชีสำเร็จ!</p>
                    )}

                    {/* Slip Attachment */}
                    <div className="pt-2 border-t border-gold-400/20">
                      <label className="block text-gold-300 font-bold mb-1">
                        แนบรูปภาพสลิปการโอนเงิน (Payment Slip Upload) *
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-gold-500 hover:bg-gold-400 text-dubai-black px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow">
                          <Upload className="w-4 h-4" />
                          <span>{slipImage ? 'เปลี่ยนรูปสลิป' : 'เลือกไฟล์รูปสลิป'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleSlipUpload} />
                        </label>
                        {slipImage && (
                          <div className="flex items-center gap-2">
                            <img src={slipImage} alt="slip preview" className="w-10 h-10 object-cover rounded border border-gold-400" />
                            <span className="text-emerald-400 text-[11px] font-bold">แนบสลิปเรียบร้อย</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* CREDIT CARD */}
                {paymentMethod === 'credit_card' && enableCreditCard && (
                  <div className="space-y-2">
                    <p className="font-serif font-bold text-gold-400">
                      ชำระผ่านบัตรเครดิต / เดบิต (Visa, Mastercard, JCB)
                    </p>
                    <p className="text-gray-300 text-[11px]">
                      ระบบรองรับบัตรทุกธนาคาร ปลอดภัยสูงสุดด้วยการยืนยันรหัส OTP 3D-Secure
                    </p>
                  </div>
                )}

                {/* COD */}
                {paymentMethod === 'cod' && enableCOD && (
                  <div className="p-3 bg-sky-950/40 border border-sky-500/40 rounded-lg text-sky-200">
                    <p className="font-bold text-sm mb-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-sky-400" />
                      ชำระเงินปลายทาง (Cash on Delivery)
                    </p>
                    <p className="text-xs">
                      กรุณเตรียมเงินสดจำนวน <strong className="text-gold-300 font-serif">฿{netAmount.toLocaleString()}</strong> ชำระแก่พนักงานส่งพัสดุ Express เมื่อนำส่งถึงบ้านท่าน
                    </p>
                  </div>
                )}

                {/* TRUEMONEY */}
                {paymentMethod === 'truemoney' && enableTrueMoney && (
                  <div className="space-y-2">
                    <p className="font-serif font-bold text-gold-400">
                      ชำระผ่าน TrueMoney Wallet / Rabbit LINE Pay
                    </p>
                    <p className="text-gray-300 text-[11px]">
                      ระบุเบอร์โทรศัพท์เพื่อรับการแจ้งเตือนกดชำระ ฿{netAmount.toLocaleString()} บนแอปพลิเคชัน
                    </p>
                  </div>
                )}

              </div>

            </div>

            {/* Total Summary & Confirm Button */}
            <div className="pt-4 border-t border-gold-400/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-gray-400">ยอดชำระสุทธิทั้งสิ้น:</span>
                <p className="text-2xl font-serif font-extrabold text-gold-400">
                  ฿{netAmount.toLocaleString()}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 text-dubai-black font-extrabold text-sm uppercase tracking-wider shadow-gold-strong hover:scale-105 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>กำลังดำเนินการ...</span>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>ยืนยันคำสั่งซื้อ & ชำระเงิน</span>
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
