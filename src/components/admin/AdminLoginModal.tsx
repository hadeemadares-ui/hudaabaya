'use client';

import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, ShieldAlert, X, ArrowRight, ShieldCheck, Eye, EyeOff, Delete } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const AdminLoginModal: React.FC = () => {
  const { isAdminLoginModalOpen, setIsAdminLoginModalOpen, verifyAdminPasscode, storeSettings } = useShop();

  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);

  // Clear passcode whenever modal opens
  useEffect(() => {
    if (isAdminLoginModalOpen) {
      setPasscode('');
      setErrorMsg(false);
    }
  }, [isAdminLoginModalOpen]);

  if (!isAdminLoginModalOpen) return null;

  const handleClose = () => {
    setPasscode('');
    setErrorMsg(false);
    setIsAdminLoginModalOpen(false);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passcode.trim()) return;

    const success = verifyAdminPasscode(passcode);
    if (success) {
      setPasscode('');
      setErrorMsg(false);
    } else {
      setErrorMsg(true);
      setPasscode('');
      setTimeout(() => setErrorMsg(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="relative bg-[#14120f] border-2 border-amber-400/60 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl text-white p-6 my-8 space-y-5 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-white tracking-wide">
                ยืนยันตัวตนผู้ดูแลร้าน (Admin PIN)
              </h3>
              <p className="text-[10px] text-amber-200/80">
                กรุณากรอกรหัสผ่านเพื่อเข้าสู่หลังบ้านทุกครั้ง
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-amber-400 hover:text-white p-2 rounded-full border border-amber-400/30 transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Input Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-gray-300 font-serif font-bold flex items-center gap-1">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>รหัสผ่านเข้าหลังบ้าน</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-amber-400/80 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'ซ่อนรหัส' : 'แสดงรหัส'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="••••"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setErrorMsg(false);
                }}
                className="w-full bg-[#0a0907] border-2 border-amber-400/50 rounded-xl p-3 text-center text-amber-300 font-mono font-black text-2xl tracking-[0.3em] focus:border-amber-400 focus:outline-none shadow-inner"
              />
            </div>
          </div>

          {/* Quick Touch Keypad for Easy PIN Entry on Mobile & Desktop */}
          <div className="space-y-1.5 pt-1">
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => {
                    setPasscode((prev) => prev + digit);
                    setErrorMsg(false);
                  }}
                  className="py-3 bg-stone-900/90 hover:bg-stone-800 active:bg-amber-400 active:text-stone-950 border border-amber-400/30 rounded-xl text-xl font-mono font-black text-amber-200 transition shadow-sm cursor-pointer select-none"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPasscode('')}
                className="py-3 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl text-xs font-bold text-red-300 transition cursor-pointer select-none"
              >
                ล้าง (C)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasscode((prev) => prev + '0');
                  setErrorMsg(false);
                }}
                className="py-3 bg-stone-900/90 hover:bg-stone-800 active:bg-amber-400 active:text-stone-950 border border-amber-400/30 rounded-xl text-xl font-mono font-black text-amber-200 transition shadow-sm cursor-pointer select-none"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setPasscode((prev) => prev.slice(0, -1))}
                className="py-3 bg-stone-900/90 hover:bg-stone-800 border border-amber-400/30 rounded-xl text-sm font-bold text-amber-300 transition flex items-center justify-center cursor-pointer select-none"
                title="ลบตัวเลขตัวล่าสุด"
              >
                <Delete className="w-5 h-5 text-amber-400" />
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 flex items-center gap-2 text-xs font-bold animate-bounce">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>รหัสผ่านไม่ถูกต้อง! กรุณาลองใหม่อีกครั้ง</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-stone-950 font-black text-sm tracking-wider rounded-xl shadow-lg hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-stone-950" />
            <span>เข้าสู่ระบบหลังบ้าน (Admin Login)</span>
            <ArrowRight className="w-4 h-4 text-stone-950" />
          </button>
        </form>

      </div>
    </div>
  );
};
