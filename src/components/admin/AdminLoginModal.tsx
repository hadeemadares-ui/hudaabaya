'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const AdminLoginModal: React.FC = () => {
  const { isAdminLoginModalOpen, setIsAdminLoginModalOpen, verifyAdminPasscode, storeSettings } = useShop();

  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);

  if (!isAdminLoginModalOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = verifyAdminPasscode(passcode);
    if (!success) {
      setErrorMsg(true);
      setPasscode('');
      setTimeout(() => setErrorMsg(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-dubai-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="relative bg-dubai-card border-2 border-gold-400/60 rounded-3xl max-w-md w-full overflow-hidden shadow-gold-strong text-white p-6 my-8 space-y-5 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold-400/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-500/20 border border-gold-400 flex items-center justify-center text-gold-400 shadow-gold-glow">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-white tracking-wide">
                ยืนยันตัวตนผู้ดูแลร้าน (Admin PIN)
              </h3>
              <p className="text-[10px] text-gold-300/80">
                กรุณากรอกรหัสผ่านเพื่อเข้าสู่ระบบหลังบ้าน {storeSettings.storeName}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAdminLoginModalOpen(false)}
            className="text-gold-400 hover:text-white p-2 rounded-full border border-gold-400/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Input Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 mb-1 font-serif font-bold flex items-center gap-1">
              <KeyRound className="w-4 h-4 text-gold-400" />
              <span>รหัสผ่านเข้าหลังบ้าน (Admin Passcode)</span>
            </label>
            <input
              type="password"
              required
              autoFocus
              placeholder="••••••••"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-dubai-black border border-gold-400/40 rounded-xl p-3 text-center text-gold-300 font-mono font-extrabold text-lg tracking-widest focus:border-gold-400 focus:outline-none shadow-inner"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-red-300 flex items-center gap-2 text-xs font-bold animate-bounce">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>รหัสผ่านไม่ถูกต้อง! กรุณาลองใหม่อีกครั้ง</span>
            </div>
          )}

          <div className="p-3 bg-dubai-black/60 rounded-xl border border-gold-400/20 text-[11px] text-gray-400 leading-relaxed flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
            <span>ระบบความปลอดภัยหน้าร้านและหลังบ้าน สิทธิ์ผู้ดูแลเฉพาะบุคคล</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-gold-500 via-gold-400 to-amber-600 text-dubai-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-gold-glow hover:scale-102 transition flex items-center justify-center gap-2"
          >
            <span>ปลดล็อกเข้าสู่หลังบ้าน</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
