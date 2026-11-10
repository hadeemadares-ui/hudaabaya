'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { DEFAULT_LOGO_BASE64 } from '../../data/logoData';

export const PWAInstallPrompt: React.FC = () => {
  const { storeSettings } = useShop();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://hudaabaya.pages.dev';
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(appUrl)}&color=141312&bgcolor=FAF9F6`;

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const isAppleIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isAppleIOS);

    const handleOpenQRModal = () => {
      setShowQRCodeModal(true);
    };
    window.addEventListener('open_pwa_qr_modal', handleOpenQRModal);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('open_pwa_qr_modal', handleOpenQRModal);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowQRCodeModal(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showQRCodeModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowQRCodeModal(false);
      }}
    >
      <div className="relative bg-white border border-stone-200 max-w-sm w-full overflow-hidden shadow-2xl text-[#141312] p-6 sm:p-8 my-8 space-y-6 text-center">
        
        <button
          onClick={() => setShowQRCodeModal(false)}
          className="absolute top-4 right-4 text-stone-500 hover:text-[#141312] p-2 border border-stone-200 bg-white transition cursor-pointer"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-2 pt-2">
          <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border border-stone-200 bg-white p-0.5">
            <img
              src={storeSettings.logoImageUrl || DEFAULT_LOGO_BASE64}
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_LOGO_BASE64;
              }}
              alt="Logo"
              className="w-full h-full rounded-full object-contain"
            />
          </div>
          <p className="text-[10px] font-serif tracking-[0.22em] uppercase text-[#8C703E] pt-1">
            MOBILE EXPERIENCE
          </p>
          <h3 className="font-serif text-lg text-[#141312]">
            {storeSettings.storeName || 'HUDA ABAYA DUBAI'}
          </h3>
          <p className="text-xs text-stone-500 font-light">
            สแกน QR Code เพื่อเปิดใช้งานบนโทรศัพท์มือถือ หรือติดตั้งลงบนหน้าจอโฮม
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-[#FAF9F6] p-4 border border-stone-200 inline-block">
          <img
            src={qrCodeApiUrl}
            alt="HUDA ABAYA App QR Code"
            className="w-44 h-44 mx-auto object-contain"
          />
          <div className="mt-2 text-[10px] text-stone-500 font-mono">
            {appUrl}
          </div>
        </div>

        {deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 bg-[#141312] hover:bg-[#292624] text-white text-xs tracking-[0.18em] uppercase flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#D4B57B]" />
            <span>ติดตั้งแอปพลิเคชันลงเครื่อง</span>
          </button>
        )}

        {isIOS && (
          <div className="bg-[#FAF9F6] p-3.5 border border-stone-200 text-left text-xs space-y-1.5 text-stone-600">
            <p className="font-medium text-[#141312]">วิธีติดตั้งบน iPhone / iPad (Safari):</p>
            <p className="flex items-center gap-1.5 text-[11px]">
              1. แตะไอคอนแชร์ <Share className="w-3.5 h-3.5 text-[#8C703E] inline shrink-0" /> บนแถบเมนู Safari
            </p>
            <p className="flex items-center gap-1.5 text-[11px]">
              2. เลือก <PlusSquare className="w-3.5 h-3.5 text-[#8C703E] inline shrink-0" /> <strong>เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)</strong>
            </p>
          </div>
        )}

        <button
          onClick={() => setShowQRCodeModal(false)}
          className="w-full py-3 bg-white border border-stone-300 hover:border-[#141312] text-[#141312] text-xs tracking-[0.18em] uppercase transition cursor-pointer"
        >
          ปิดหน้าต่าง
        </button>

      </div>
    </div>
  );
};

