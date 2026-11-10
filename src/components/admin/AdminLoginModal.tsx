'use client';

import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, X, ArrowRight, Eye, EyeOff, Delete } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const AdminLoginModal: React.FC = () => {
  const { isAdminLoginModalOpen, setIsAdminLoginModalOpen, verifyAdminPasscode } = useShop();

  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);

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
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative bg-white border border-stone-200 max-w-sm w-full overflow-hidden shadow-2xl text-[#141312] p-6 sm:p-8 my-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FAF9F6] border border-stone-200 flex items-center justify-center text-[#8C703E]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-serif tracking-[0.2em] uppercase text-[#8C703E]">
                MANAGEMENT ACCESS
              </p>
              <h3 className="font-serif text-base text-[#141312]">
                เข้าสู่ระบบจัดการร้านค้า
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-stone-500 hover:text-[#141312] p-2 border border-stone-200 transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PIN Input Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-stone-600 font-medium">
                รหัสผ่านเข้าใช้งาน (PIN 4 หลัก)
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-stone-500 hover:text-[#141312] flex items-center gap-1 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'ซ่อนรหัส' : 'แสดงรหัส'}</span>
              </button>
            </div>

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
              className="w-full bg-[#FAF9F6] border border-stone-300 p-3 text-center text-[#141312] font-mono font-semibold text-2xl tracking-[0.35em] focus:border-[#141312] focus:outline-none"
            />
            <p className="text-[11px] text-stone-500 mt-1.5 text-center">
              รองรับทั้ง PIN เจ้าของร้าน และ PIN ประจำตัวพนักงาน
            </p>
          </div>

          {/* Touch Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => {
                  setPasscode((prev) => prev + digit);
                  setErrorMsg(false);
                }}
                className="py-3 bg-white hover:bg-[#FAF9F6] active:bg-[#141312] active:text-white border border-stone-200 text-lg font-mono font-medium text-[#141312] transition cursor-pointer select-none"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPasscode('')}
              className="py-3 bg-[#FAF9F6] hover:bg-stone-100 border border-stone-200 text-xs font-medium text-stone-600 transition cursor-pointer select-none"
            >
              ล้าง
            </button>
            <button
              type="button"
              onClick={() => {
                setPasscode((prev) => prev + '0');
                setErrorMsg(false);
              }}
              className="py-3 bg-white hover:bg-[#FAF9F6] active:bg-[#141312] active:text-white border border-stone-200 text-lg font-mono font-medium text-[#141312] transition cursor-pointer select-none"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => setPasscode((prev) => prev.slice(0, -1))}
              className="py-3 bg-[#FAF9F6] hover:bg-stone-100 border border-stone-200 text-stone-600 transition flex items-center justify-center cursor-pointer select-none"
              title="ลบตัวเลข"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 flex items-center gap-2 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-[#141312] hover:bg-[#292624] text-white text-xs tracking-[0.2em] uppercase transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>เข้าสู่ระบบ</span>
            <ArrowRight className="w-4 h-4 text-[#D4B57B]" />
          </button>
        </form>

      </div>
    </div>
  );
};

