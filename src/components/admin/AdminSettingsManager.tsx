'use client';

import React, { useState, useEffect } from 'react';
import { Store, CreditCard, MapPin, Megaphone, CheckCircle2, Save, AlertTriangle, QrCode, Building, Truck, Wallet, Lock, Camera, Image as ImageIcon, Link as LinkIcon, Trash2, RotateCcw } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const AdminSettingsManager: React.FC = () => {
  const { storeSettings, updateStoreSettings, clearBrowserCacheAndReload } = useShop();

  const [form, setForm] = useState({
    ...storeSettings,
    adminPasscode: storeSettings.adminPasscode || '1077',
  });
  const [savedMsg, setSavedMsg] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Sync initial form values on mount without overwriting active user typing
  useEffect(() => {
    if (!isFormInitialized && storeSettings.storeName) {
      setForm({
        ...storeSettings,
        adminPasscode: storeSettings.adminPasscode || '1077',
        contactAddress: storeSettings.contactAddress || '11/2 ถนน คลองสิบสาม แขวงหนองจอก เขตหนองจอก กรุงเทพมหานคร 10530',
      });
      setIsFormInitialized(true);
    }
  }, [storeSettings, isFormInitialized]);

  // Smart Logo Image Compression Handler - Auto Persists Instantly
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            const maxDim = 400; // Compress logo images to max 400px for instant loading
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
            const compressed = canvas.toDataURL('image/jpeg', 0.8);

            // Set state and IMMEDIATELY auto-save logo to Firebase & LocalStorage
            setForm((prev) => ({ ...prev, logoImageUrl: compressed }));
            updateStoreSettings({ logoImageUrl: compressed });
            
            // Backup to LocalStorage fallback key
            if (typeof window !== 'undefined') {
              localStorage.setItem('huda_saved_logo_image', compressed);
            }
          };
          img.onerror = () => {
            setForm((prev) => ({ ...prev, logoImageUrl: rawBase64 }));
            updateStoreSettings({ logoImageUrl: rawBase64 });
          };
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleClearLogo = () => {
    if (confirm('คุณต้องการลบโลโก้ร้านค้าที่อัปโหลดและกลับไปใช้โลโก้มาตรฐานใช่หรือไม่?')) {
      setForm((prev) => ({ ...prev, logoImageUrl: '/logo.jpg' }));
      updateStoreSettings({ logoImageUrl: '/logo.jpg' });
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_saved_logo_image', '/logo.jpg');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(form);
    if (typeof window !== 'undefined') {
      localStorage.setItem('huda_store_settings', JSON.stringify(form));
      if (form.logoImageUrl) {
        localStorage.setItem('huda_saved_logo_image', form.logoImageUrl);
      }
    }
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3500);
  };

  return (
    <div className="space-y-6 text-xs text-white">
      <div className="bg-dubai-black p-5 rounded-2xl border border-gold-400/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-gold-400/20 pb-3">
          <div className="flex items-center gap-2 text-gold-400 font-serif font-bold text-base">
            <Store className="w-5 h-5" />
            <span>จัดการข้อมูลร้านค้า & รหัสผ่านหลังบ้าน (Store & Security Settings)</span>
          </div>
          {savedMsg && (
            <span className="text-emerald-400 font-bold flex items-center gap-1 text-xs bg-emerald-950 px-3 py-1 rounded-full border border-emerald-500/40 animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกและจำข้อมูลทั้งหมดลงระบบถาวรเรียบร้อยแล้ว!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Section 1: Admin Security Passcode Protection */}
          <div className="space-y-3.5 p-4 sm:p-5 bg-stone-900 rounded-2xl border-2 border-amber-400/50 shadow-md">
            <h4 className="font-serif font-extrabold text-amber-300 text-sm sm:text-base flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              <span>ตั้งค่ารหัสผ่านเข้าหลังบ้าน (Admin Passcode Protection)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-amber-200 mb-1 font-extrabold text-xs sm:text-sm">
                  รหัสผ่านเข้าโหมดผู้ดูแล (Admin Passcode PIN) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="กรอกรหัสผ่านเข้าหลังบ้าน"
                  value={form.adminPasscode}
                  onChange={(e) => setForm({ ...form, adminPasscode: e.target.value })}
                  className="w-full bg-stone-950 border-2 border-amber-400/70 rounded-xl p-3 text-amber-300 font-mono font-extrabold text-base tracking-wider focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>
              <div className="text-xs text-stone-200 font-bold flex items-center">
                <span>* เมื่อกดปุ่ม "เข้าหลังบ้าน" ระบบจะเรียกร้องรหัสผ่านนี้ก่อนเปิดให้เข้าถึง ป้องกันลูกค้าเข้ากดแก้ไขข้อมูล</span>
              </div>
            </div>
          </div>

          {/* Section 2: Store Brand Info */}
          <div className="space-y-3.5 p-4 sm:p-5 bg-stone-900 rounded-2xl border-2 border-amber-400/40 shadow-md">
            <h4 className="font-serif font-extrabold text-amber-300 text-sm sm:text-base flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-400" />
              <span>ชื่อร้านค้า & สโลแกน & โลโก้ร้าน</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-amber-200 mb-1 font-extrabold text-xs sm:text-sm">ชื่อร้านค้า (Store Name) *</label>
                <input
                  type="text"
                  required
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  className="w-full bg-stone-950 border-2 border-amber-400/60 rounded-xl p-3 text-white font-extrabold text-sm focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-amber-200 mb-1 font-extrabold text-xs sm:text-sm">สโลแกนร้านค้า (Tagline)</label>
                <input
                  type="text"
                  value={form.storeTagline}
                  onChange={(e) => setForm({ ...form, storeTagline: e.target.value })}
                  className="w-full bg-stone-950 border-2 border-amber-400/60 rounded-xl p-3 text-white font-extrabold text-sm focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-amber-200 mb-1 font-extrabold text-xs sm:text-sm">อักษรย่อโลโก้สำรอง (Logo Letter)</label>
                <input
                  type="text"
                  maxLength={3}
                  value={form.logoLetter}
                  onChange={(e) => setForm({ ...form, logoLetter: e.target.value })}
                  className="w-full bg-stone-950 border-2 border-amber-400/60 rounded-xl p-3 text-amber-300 font-extrabold text-sm uppercase focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>

              {/* Logo Upload Section with Auto-Save & Memory Lock */}
              <div className="sm:col-span-2 space-y-3 p-4 bg-stone-950 rounded-2xl border-2 border-amber-400/50 shadow-lg">
                <div className="flex items-center justify-between">
                  <label className="block text-amber-300 font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>โลโก้ร้านค้า (จำโลโก้อัตโนมัติ ไม่ต้องเลือกใหม่เมื่อแก้ไข):</span>
                  </label>
                  {form.logoImageUrl && (
                    <button
                      type="button"
                      onClick={handleClearLogo}
                      className="text-red-200 hover:text-white text-xs font-extrabold flex items-center gap-1 bg-red-950 px-2.5 py-1 rounded-xl border border-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบรูปโลโก้</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow hover:scale-102 transition border border-amber-300">
                    <Camera className="w-4 h-4 text-stone-950" />
                    <span>ถ่ายภาพโลโก้จากกล้อง</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleLogoFileUpload}
                    />
                  </label>

                  <label className="cursor-pointer px-4 py-2.5 bg-stone-900 border-2 border-amber-400/50 text-amber-300 hover:text-white font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>เลือกรูปโลโก้จากอัลบั้ม</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoFileUpload}
                    />
                  </label>
                </div>

                <div className="pt-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={form.logoImageUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({ ...form, logoImageUrl: val });
                        updateStoreSettings({ logoImageUrl: val });
                      }}
                      placeholder="หรือวางลิงก์รูปโลโก้ Image URL (https://...)"
                      className="w-full bg-stone-900 border-2 border-amber-400/50 rounded-xl p-2.5 text-white font-extrabold text-xs pl-8 font-mono placeholder-stone-500 focus:outline-none focus:border-amber-400"
                    />
                    <LinkIcon className="w-4 h-4 text-amber-400 absolute left-2.5 top-3" />
                  </div>
                </div>

                {/* Logo Image Preview Frame */}
                {form.logoImageUrl && (
                  <div className="flex items-center gap-4 pt-3 border-t-2 border-amber-400/30">
                    <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-md flex items-center justify-center shrink-0">
                      <img
                        src={form.logoImageUrl}
                        alt="Logo Preview"
                        className="w-full h-full rounded-full object-cover border-2 border-stone-950"
                      />
                    </div>
                    <div>
                      <span className="text-emerald-400 font-extrabold text-xs sm:text-sm block">ระบบจดจำโลโก้นี้อย่างถาวรแล้ว</span>
                      <p className="text-xs text-stone-200 font-bold mt-0.5">
                        โลโก้นี้จะแสดงผลใน Header, ท้ายเว็บ และใบเสร็จรับเงิน POS โดยไม่ต้องเลือกใหม่เมื่อบันทึกข้อมูล
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Section 3: Contact & Address */}
          <div className="space-y-3.5 p-4 sm:p-5 bg-stone-900 rounded-2xl border-2 border-amber-400/40 shadow-md">
            <h4 className="font-serif font-extrabold text-amber-300 text-sm sm:text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>ข้อมูลการติดต่อ & ที่อยู่ร้านค้า</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-amber-200 mb-1 font-extrabold text-xs sm:text-sm">เบอร์โทรศัพท์ติดต่อร้าน</label>
                <input
                  type="text"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  className="w-full bg-stone-950 border-2 border-amber-400/60 rounded-xl p-3 text-white font-mono font-extrabold text-sm focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-amber-200 mb-1 font-extrabold text-xs sm:text-sm">LINE Official / LINE ID</label>
                <input
                  type="text"
                  value={form.contactLine}
                  onChange={(e) => setForm({ ...form, contactLine: e.target.value })}
                  className="w-full bg-stone-950 border-2 border-amber-400/60 rounded-xl p-3 text-white font-mono font-extrabold text-sm focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-amber-200 mb-1 font-extrabold text-xs sm:text-sm">ที่อยู่ร้านค้า (แสดงในท้ายเว็บ & ใบเสร็จ)</label>
                <textarea
                  rows={2}
                  value={form.contactAddress}
                  onChange={(e) => setForm({ ...form, contactAddress: e.target.value })}
                  placeholder="เช่น 11/2 ม.1 ..."
                  className="w-full bg-stone-950 border-2 border-amber-400/60 rounded-xl p-3 text-white font-bold text-sm focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Payment Channels Toggles & Configuration */}
          <div className="space-y-3.5 p-4 sm:p-5 bg-stone-900 rounded-2xl border-2 border-amber-400/40 shadow-md">
            <h4 className="font-serif font-extrabold text-amber-300 text-sm sm:text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              <span>เปิด-ปิด & ตั้งค่าช่องทางชำระเงินที่รองรับ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              <label className="flex items-center gap-2.5 bg-stone-950 p-3.5 rounded-xl border-2 border-amber-400/40 cursor-pointer shadow-md">
                <input
                  type="checkbox"
                  checked={form.enablePromptPay}
                  onChange={(e) => setForm({ ...form, enablePromptPay: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="font-extrabold text-amber-300 text-xs sm:text-sm flex items-center gap-1">
                  <QrCode className="w-4 h-4 text-amber-400" /> Dynamic PromptPay QR
                </span>
              </label>

              <label className="flex items-center gap-2.5 bg-stone-950 p-3.5 rounded-xl border-2 border-amber-400/40 cursor-pointer shadow-md">
                <input
                  type="checkbox"
                  checked={form.enableBankTransfer}
                  onChange={(e) => setForm({ ...form, enableBankTransfer: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="font-extrabold text-amber-300 text-xs sm:text-sm flex items-center gap-1">
                  <Building className="w-4 h-4 text-amber-400" /> โอนเงินผ่านธนาคาร
                </span>
              </label>

              <label className="flex items-center gap-2.5 bg-stone-950 p-3.5 rounded-xl border-2 border-amber-400/40 cursor-pointer shadow-md">
                <input
                  type="checkbox"
                  checked={form.enableCreditCard}
                  onChange={(e) => setForm({ ...form, enableCreditCard: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="font-extrabold text-amber-300 text-xs sm:text-sm flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-amber-400" /> บัตรเครดิต / เดบิต
                </span>
              </label>

              <label className="flex items-center gap-2.5 bg-stone-950 p-3.5 rounded-xl border-2 border-amber-400/40 cursor-pointer shadow-md">
                <input
                  type="checkbox"
                  checked={form.enableCOD}
                  onChange={(e) => setForm({ ...form, enableCOD: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="font-extrabold text-amber-300 text-xs sm:text-sm flex items-center gap-1">
                  <Truck className="w-4 h-4 text-amber-400" /> ชำระปลายทาง (COD)
                </span>
              </label>

              <label className="flex items-center gap-2.5 bg-stone-950 p-3.5 rounded-xl border-2 border-amber-400/40 cursor-pointer shadow-md">
                <input
                  type="checkbox"
                  checked={form.enableTrueMoney}
                  onChange={(e) => setForm({ ...form, enableTrueMoney: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="font-extrabold text-amber-300 text-xs sm:text-sm flex items-center gap-1">
                  <Wallet className="w-4 h-4 text-amber-400" /> TrueMoney / LINE Pay
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t-2 border-amber-400/30">
              <div>
                <label className="block text-amber-200 mb-1 font-extrabold text-xs sm:text-sm">เบอร์พร้อมเพย์ (PromptPay QR)</label>
                <input
                  type="text"
                  value={form.promptPayNumber}
                  onChange={(e) => setForm({ ...form, promptPayNumber: e.target.value })}
                  className="w-full bg-stone-950 border-2 border-amber-400/60 rounded-xl p-3 text-white font-mono font-extrabold text-sm focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-amber-200 mb-1 font-extrabold text-xs sm:text-sm">ชื่อธนาคาร</label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full bg-stone-950 border-2 border-amber-400/60 rounded-xl p-3 text-white font-extrabold text-sm focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-amber-200 mb-1 font-extrabold text-xs sm:text-sm">เลขที่บัญชีธนาคาร</label>
                <input
                  type="text"
                  value={form.bankAccountNo}
                  onChange={(e) => setForm({ ...form, bankAccountNo: e.target.value })}
                  className="w-full bg-stone-950 border-2 border-amber-400/60 rounded-xl p-3 text-white font-mono font-extrabold text-sm focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-amber-200 mb-1 font-extrabold text-xs sm:text-sm">ชื่อบัญชีผู้รับเงิน</label>
                <input
                  type="text"
                  value={form.bankAccountName}
                  onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })}
                  className="w-full bg-stone-950 border-2 border-amber-400/60 rounded-xl p-3 text-white font-extrabold text-sm focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Low Stock Threshold Alert */}
          <div className="space-y-3.5 p-4 sm:p-5 bg-stone-900 rounded-2xl border-2 border-amber-400/40 shadow-md">
            <h4 className="font-serif font-extrabold text-amber-300 text-sm sm:text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>กำหนดเกณฑ์แจ้งเตือนสต๊อกต่ำ (Low Stock Alert Threshold)</span>
            </h4>

            <div>
              <label className="block text-amber-200 mb-1 font-extrabold text-xs sm:text-sm">
                จำนวนสต๊อกสินค้าขั้นต่ำที่จะให้แสดงการแจ้งเตือน (ชิ้น)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                placeholder="3"
                value={form.lowStockThreshold === 0 ? '' : form.lowStockThreshold}
                onFocus={(e) => e.target.select()}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                onChange={(e) => {
                  const cleanVal = e.target.value.replace(/^0+(?=\d)/, '');
                  setForm({ ...form, lowStockThreshold: cleanVal === '' ? 0 : Math.max(1, parseInt(cleanVal, 10) || 0) });
                }}
                className="w-full bg-stone-950 border-2 border-amber-400/70 rounded-xl p-3 text-amber-300 font-extrabold font-mono text-base focus:outline-none focus:border-amber-400 shadow-inner"
              />
            </div>
          </div>

          {/* Section 6: Announcement Banner */}
          <div className="space-y-3.5 p-4 sm:p-5 bg-stone-900 rounded-2xl border-2 border-amber-400/40 shadow-md">
            <h4 className="font-serif font-extrabold text-amber-300 text-sm sm:text-base flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-400" />
              <span>ข้อความแถบประกาศด้านบนสุด (Top Announcement Banner)</span>
            </h4>

            <div>
              <input
                type="text"
                value={form.topAnnouncement}
                onChange={(e) => setForm({ ...form, topAnnouncement: e.target.value })}
                className="w-full bg-stone-950 border-2 border-amber-400/60 rounded-xl p-3 text-white font-extrabold text-sm focus:outline-none focus:border-amber-400 shadow-inner"
              />
            </div>
          </div>

          {/* Section 7: Clear Browser Cache & Purge Stale Storage */}
          <div className="space-y-3.5 p-4 sm:p-5 bg-stone-900 rounded-2xl border-2 border-amber-500/50 shadow-md">
            <h4 className="font-serif font-extrabold text-amber-300 text-sm sm:text-base flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              <span>ล้างแคชเบราว์เซอร์เครื่องนี้ (Clear Local Browser Cache)</span>
            </h4>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-950 p-4 rounded-xl border-2 border-amber-500/40">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-extrabold text-white">เครื่องติดจำแคชเวอร์ชันเก่าในมือถือ/คอมพิวเตอร์?</p>
                <p className="text-xs text-stone-200 font-bold">
                  กดปุ่มนี้เพื่อล้างไฟล์ค้างแคช ServiceWorker / Web Caches ในอุปกรณ์นี้ และบังคับดึงโค้ดล่าสุดจาก Vercel 100%
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm('คุณต้องการล้างแคชเบราว์เซอร์เครื่องนี้และรีโหลดเวอร์ชันใหม่ล่าสุด 100% ใช่หรือไม่?')) {
                    clearBrowserCacheAndReload();
                  }
                }}
                className="px-4 py-2.5 bg-amber-950 hover:bg-amber-900 border-2 border-amber-500 text-amber-200 font-extrabold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>กดล้างแคชเครื่องนี้ทันที</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-stone-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:scale-105 transition flex items-center gap-2 cursor-pointer border border-amber-300"
            >
              <Save className="w-5 h-5 text-stone-950" />
              <span>บันทึกการตั้งค่าร้านค้าและรหัสผ่านทั้งหมด</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
