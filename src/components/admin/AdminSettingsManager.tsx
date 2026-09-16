'use client';

import React, { useState, useEffect } from 'react';
import { Store, CreditCard, MapPin, Megaphone, CheckCircle2, Save, AlertTriangle, QrCode, Building, Truck, Wallet, Lock, Camera, Image as ImageIcon, Link as LinkIcon, Trash2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const AdminSettingsManager: React.FC = () => {
  const { storeSettings, updateStoreSettings } = useShop();

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
          const img = new Image();
          img.src = reader.result;
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
            const compressed = canvas.toDataURL('image/jpeg', 0.85);

            // Set state and IMMEDIATELY auto-save logo to Firebase & LocalStorage
            setForm((prev) => ({ ...prev, logoImageUrl: compressed }));
            updateStoreSettings({ logoImageUrl: compressed });
            
            // Backup to LocalStorage fallback key
            if (typeof window !== 'undefined') {
              localStorage.setItem('huda_saved_logo_image', compressed);
            }
          };
        }
      };
      reader.readAsDataURL(file);
    }
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
          <div className="space-y-3 p-4 bg-dubai-dark rounded-xl border border-gold-400/30">
            <h4 className="font-serif font-bold text-gold-300 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-gold-400" />
              <span>ตั้งค่ารหัสผ่านเข้าหลังบ้าน (Admin Passcode Protection)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 mb-1 font-bold">
                  รหัสผ่านเข้าโหมดผู้ดูแล (Admin Passcode PIN) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="กรอกรหัสผ่านเข้าหลังบ้าน"
                  value={form.adminPasscode}
                  onChange={(e) => setForm({ ...form, adminPasscode: e.target.value })}
                  className="w-full bg-dubai-black border border-gold-400/40 rounded p-2.5 text-gold-300 font-mono font-bold text-sm tracking-wider"
                />
              </div>
              <div className="text-[11px] text-gray-400 flex items-center">
                <span>* เมื่อกดปุ่ม "เข้าหลังบ้าน" ระบบจะเรียกร้องรหัสผ่านนี้ก่อนเปิดให้เข้าถึง ป้องกันลูกค้าเข้ากดแก้ไขข้อมูล</span>
              </div>
            </div>
          </div>

          {/* Section 2: Store Brand Info */}
          <div className="space-y-3 p-4 bg-dubai-dark rounded-xl border border-gold-400/20">
            <h4 className="font-serif font-bold text-gold-300 text-sm flex items-center gap-2">
              <Store className="w-4 h-4 text-gold-400" />
              <span>ชื่อร้านค้า & สโลแกน & โลโก้ร้าน</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 mb-1 font-bold">ชื่อร้านค้า (Store Name) *</label>
                <input
                  type="text"
                  required
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  className="w-full bg-dubai-black border border-gold-400/30 rounded p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-bold">สโลแกนร้านค้า (Tagline)</label>
                <input
                  type="text"
                  value={form.storeTagline}
                  onChange={(e) => setForm({ ...form, storeTagline: e.target.value })}
                  className="w-full bg-dubai-black border border-gold-400/30 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">อักษรย่อโลโก้สำรอง (Logo Letter)</label>
                <input
                  type="text"
                  maxLength={3}
                  value={form.logoLetter}
                  onChange={(e) => setForm({ ...form, logoLetter: e.target.value })}
                  className="w-full bg-dubai-black border border-gold-400/30 rounded p-2 text-gold-400 font-bold uppercase"
                />
              </div>

              {/* Logo Upload Section with Auto-Save & Memory Lock */}
              <div className="sm:col-span-2 space-y-2.5 p-4 bg-dubai-black rounded-xl border-2 border-gold-400/40 shadow-lg">
                <div className="flex items-center justify-between">
                  <label className="block text-gold-300 font-extrabold text-xs flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-gold-400" />
                    <span>โลโก้ร้านค้า (จำโลโก้อัตโนมัติ ไม่ต้องเลือกใหม่เมื่อแก้ไข):</span>
                  </label>
                  {form.logoImageUrl && (
                    <button
                      type="button"
                      onClick={handleClearLogo}
                      className="text-red-400 hover:text-red-200 text-[11px] font-bold flex items-center gap-1 bg-red-950/40 px-2 py-0.5 rounded border border-red-800/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบรูปโลโก้</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-4 py-2.5 bg-gradient-to-r from-gold-500 to-amber-600 text-dubai-black font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-gold-glow hover:scale-102 transition">
                    <Camera className="w-4 h-4" />
                    <span>ถ่ายภาพโลโก้จากกล้อง</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleLogoFileUpload}
                    />
                  </label>

                  <label className="cursor-pointer px-4 py-2.5 bg-dubai-dark border border-gold-400/40 text-gold-300 hover:text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
                    <ImageIcon className="w-4 h-4 text-gold-400" />
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
                      className="w-full bg-dubai-dark border border-gold-400/30 rounded p-2 text-white text-xs pl-8 font-mono"
                    />
                    <LinkIcon className="w-3.5 h-3.5 text-gold-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                {/* Logo Image Preview Frame */}
                {form.logoImageUrl && (
                  <div className="flex items-center gap-4 pt-3 border-t border-gold-400/20">
                    <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-200 shadow-gold-glow flex items-center justify-center shrink-0">
                      <img
                        src={form.logoImageUrl}
                        alt="Logo Preview"
                        className="w-full h-full rounded-full object-cover border-2 border-dubai-black"
                      />
                    </div>
                    <div>
                      <span className="text-emerald-400 font-bold text-xs block">✓ ระบบจดจำโลโก้นี้อย่างถาวรแล้ว</span>
                      <p className="text-[11px] text-gray-300">
                        โลโก้นี้จะแสดงผลใน Header, ท้ายเว็บ และใบเสร็จรับเงิน POS โดยไม่ต้องเลือกใหม่เมื่อบันทึกข้อมูล
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Section 3: Contact & Address */}
          <div className="space-y-3 p-4 bg-dubai-dark rounded-xl border border-gold-400/20">
            <h4 className="font-serif font-bold text-gold-300 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold-400" />
              <span>ข้อมูลการติดต่อ & ที่อยู่ร้านค้า</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 mb-1">เบอร์โทรศัพท์ติดต่อร้าน</label>
                <input
                  type="text"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  className="w-full bg-dubai-black border border-gold-400/30 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">LINE Official / LINE ID</label>
                <input
                  type="text"
                  value={form.contactLine}
                  onChange={(e) => setForm({ ...form, contactLine: e.target.value })}
                  className="w-full bg-dubai-black border border-gold-400/30 rounded p-2 text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-300 mb-1">ที่อยู่ร้านค้า (แสดงในท้ายเว็บ & ใบเสร็จ)</label>
                <textarea
                  rows={2}
                  value={form.contactAddress}
                  onChange={(e) => setForm({ ...form, contactAddress: e.target.value })}
                  placeholder="เช่น 11/2 ม.1 ..."
                  className="w-full bg-dubai-black border border-gold-400/30 rounded p-2 text-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Payment Channels Toggles & Configuration */}
          <div className="space-y-3 p-4 bg-dubai-dark rounded-xl border border-gold-400/20">
            <h4 className="font-serif font-bold text-gold-300 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gold-400" />
              <span>เปิด-ปิด & ตั้งค่าช่องทางชำระเงินที่รองรับ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              <label className="flex items-center gap-2 bg-dubai-black p-3 rounded-lg border border-gold-400/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enablePromptPay}
                  onChange={(e) => setForm({ ...form, enablePromptPay: e.target.checked })}
                  className="w-4 h-4 accent-gold-500 rounded"
                />
                <span className="font-bold text-gold-300 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-gold-400" /> Dynamic PromptPay QR
                </span>
              </label>

              <label className="flex items-center gap-2 bg-dubai-black p-3 rounded-lg border border-gold-400/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enableBankTransfer}
                  onChange={(e) => setForm({ ...form, enableBankTransfer: e.target.checked })}
                  className="w-4 h-4 accent-gold-500 rounded"
                />
                <span className="font-bold text-gold-300 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-gold-400" /> โอนเงินผ่านธนาคาร
                </span>
              </label>

              <label className="flex items-center gap-2 bg-dubai-black p-3 rounded-lg border border-gold-400/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enableCreditCard}
                  onChange={(e) => setForm({ ...form, enableCreditCard: e.target.checked })}
                  className="w-4 h-4 accent-gold-500 rounded"
                />
                <span className="font-bold text-gold-300 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-gold-400" /> บัตรเครดิต / เดบิต
                </span>
              </label>

              <label className="flex items-center gap-2 bg-dubai-black p-3 rounded-lg border border-gold-400/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enableCOD}
                  onChange={(e) => setForm({ ...form, enableCOD: e.target.checked })}
                  className="w-4 h-4 accent-gold-500 rounded"
                />
                <span className="font-bold text-gold-300 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-gold-400" /> ชำระปลายทาง (COD)
                </span>
              </label>

              <label className="flex items-center gap-2 bg-dubai-black p-3 rounded-lg border border-gold-400/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enableTrueMoney}
                  onChange={(e) => setForm({ ...form, enableTrueMoney: e.target.checked })}
                  className="w-4 h-4 accent-gold-500 rounded"
                />
                <span className="font-bold text-gold-300 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-gold-400" /> TrueMoney / LINE Pay
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gold-400/20">
              <div>
                <label className="block text-gray-300 mb-1">เบอร์พร้อมเพย์ (PromptPay QR)</label>
                <input
                  type="text"
                  value={form.promptPayNumber}
                  onChange={(e) => setForm({ ...form, promptPayNumber: e.target.value })}
                  className="w-full bg-dubai-black border border-gold-400/30 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">ชื่อธนาคาร</label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full bg-dubai-black border border-gold-400/30 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">เลขที่บัญชีธนาคาร</label>
                <input
                  type="text"
                  value={form.bankAccountNo}
                  onChange={(e) => setForm({ ...form, bankAccountNo: e.target.value })}
                  className="w-full bg-dubai-black border border-gold-400/30 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">ชื่อบัญชีผู้รับเงิน</label>
                <input
                  type="text"
                  value={form.bankAccountName}
                  onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })}
                  className="w-full bg-dubai-black border border-gold-400/30 rounded p-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Low Stock Threshold Alert */}
          <div className="space-y-3 p-4 bg-dubai-dark rounded-xl border border-gold-400/20">
            <h4 className="font-serif font-bold text-amber-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>กำหนดเกณฑ์แจ้งเตือนสต๊อกต่ำ (Low Stock Alert Threshold)</span>
            </h4>

            <div>
              <label className="block text-gray-300 mb-1">
                จำนวนสต๊อกสินค้าขั้นต่ำที่จะให้แสดงการแจ้งเตือน (ชิ้น)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={form.lowStockThreshold || 3}
                onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value)} )}
                className="w-full bg-dubai-black border border-amber-500/40 rounded p-2 text-amber-300 font-bold font-mono"
              />
            </div>
          </div>

          {/* Section 6: Announcement Banner */}
          <div className="space-y-3 p-4 bg-dubai-dark rounded-xl border border-gold-400/20">
            <h4 className="font-serif font-bold text-gold-300 text-sm flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-gold-400" />
              <span>ข้อความแถบประกาศด้านบนสุด (Top Announcement Banner)</span>
            </h4>

            <div>
              <input
                type="text"
                value={form.topAnnouncement}
                onChange={(e) => setForm({ ...form, topAnnouncement: e.target.value })}
                className="w-full bg-dubai-black border border-gold-400/30 rounded p-2 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-gold-500 via-gold-400 to-amber-600 text-dubai-black font-extrabold text-xs rounded-xl shadow-gold-glow hover:scale-105 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการตั้งค่าร้านค้าและรหัสผ่านทั้งหมด</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
