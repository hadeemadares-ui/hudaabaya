'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Share, PlusSquare, QrCode, Camera, Check, ExternalLink } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { DEFAULT_LOGO_BASE64 } from '../../data/logoData';

export const PWAInstallPrompt: React.FC = () => {
  const { storeSettings } = useShop();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://hudaabaya.vercel.app';
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(appUrl)}&color=FFC800&bgcolor=0D0D0D`;

  useEffect(() => {
    // Detect OS & Device
    const ua = window.navigator.userAgent;
    const isAppleIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    
    setIsIOS(isAppleIOS);
    setIsDesktop(!isMobileDevice);

    // Global event listener for navbar button trigger
    const handleOpenQRModal = () => {
      setShowQRCodeModal(true);
    };
    window.addEventListener('open_pwa_qr_modal', handleOpenQRModal);

    // Check if already installed as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return; // Already running inside installed PWA app
    }

    // Android / Chrome PWA install listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Auto-show prompt after 2.5 seconds
    const timer = setTimeout(() => {
      if (!isStandalone) {
        setShowPrompt(true);
      }
    }, 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('open_pwa_qr_modal', handleOpenQRModal);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isDesktop) {
      setShowQRCodeModal(true);
    }
  };

  return (
    <>
      {/* Floating Bottom App Installation Bar */}
      {showPrompt && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-bounce-short">
          <div className="bg-dubai-black/95 backdrop-blur-xl border-2 border-gold-400/60 rounded-2xl p-4 shadow-gold-strong text-white space-y-3 relative">
            <button
              onClick={() => setShowPrompt(false)}
              className="absolute top-2.5 right-2.5 text-gold-400 hover:text-white p-1 rounded-full border border-gold-400/30"
              aria-label="ปิดการแจ้งเตือน"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pr-6">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-sky-600 via-cyan-400 to-sky-200 shadow-gold-glow flex items-center justify-center shrink-0">
                <img
                  src={storeSettings.logoImageUrl || DEFAULT_LOGO_BASE64}
                  onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO_BASE64; }}
                  alt="Logo"
                  className="w-full h-full rounded-full object-cover border border-dubai-black"
                />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-gold-300 flex items-center gap-1.5">
                  <span>ติดตั้งแอป {storeSettings.storeName || 'HUDA ABAYA'}</span>
                  <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
                </h4>
                <p className="text-[11px] text-gray-300 leading-tight">
                  ใช้งานเสมือนแอปพลิเคชันมือถือแบบเต็มจอ สะดวกและรวดเร็วยิ่งขึ้น!
                </p>
              </div>
            </div>

            {/* Desktop Mode: Show Scan QR Code Button */}
            {isDesktop ? (
              <button
                onClick={() => setShowQRCodeModal(true)}
                className="w-full py-2.5 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 text-dubai-black font-extrabold text-xs rounded-xl shadow-gold-glow flex items-center justify-center gap-2 hover:scale-102 transition"
              >
                <QrCode className="w-4 h-4" />
                <span>สแกน QR Code ติดตั้งแอปบนมือถือทันที</span>
              </button>
            ) : deferredPrompt ? (
              /* Android / Chrome Native PWA Button */
              <button
                onClick={handleInstallClick}
                className="w-full py-2.5 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 text-dubai-black font-extrabold text-xs rounded-xl shadow-gold-glow flex items-center justify-center gap-2 hover:scale-102 transition"
              >
                <Download className="w-4 h-4" />
                <span>กดติดตั้งแอปพลิเคชันลงบนมือถือทันที</span>
              </button>
            ) : isIOS ? (
              /* iOS Safari Step Guide */
              <div className="bg-dubai-dark p-2.5 rounded-xl border border-gold-400/30 text-[11px] text-gray-300 space-y-1">
                <p className="font-bold text-gold-400 flex items-center gap-1">
                  <span>วิธีติดตั้งบน iPhone / iPad (Safari):</span>
                </p>
                <p className="flex items-center gap-1.5">
                  1. แตะปุ่มแชร์ <Share className="w-3.5 h-3.5 text-gold-400 inline shrink-0" /> ท้ายเบราว์เซอร์
                </p>
                <p className="flex items-center gap-1.5">
                  2. เลือก <PlusSquare className="w-3.5 h-3.5 text-gold-400 inline shrink-0" /> <strong>"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)</strong>
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowQRCodeModal(true)}
                className="w-full py-2 bg-dubai-dark text-gold-300 border border-gold-400/40 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>แสดง QR Code สำหรับสแกนติดตั้ง</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Desktop QR Code Mobile Download Modal */}
      {showQRCodeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-dubai-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
          <div className="relative bg-dubai-card border-2 border-gold-400/60 rounded-3xl max-w-sm w-full overflow-hidden shadow-gold-strong text-white p-6 my-8 space-y-5 text-center">
            
            <button
              onClick={() => setShowQRCodeModal(false)}
              className="absolute top-4 right-4 text-gold-400 hover:text-white p-2 rounded-full border border-gold-400/30"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1 pt-2">
              <div className="w-14 h-14 mx-auto rounded-full p-0.5 bg-gradient-to-tr from-sky-600 via-cyan-400 to-sky-200 shadow-gold-glow flex items-center justify-center">
                <img
                  src={storeSettings.logoImageUrl || DEFAULT_LOGO_BASE64}
                  onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO_BASE64; }}
                  alt="Logo"
                  className="w-full h-full rounded-full object-cover border-2 border-dubai-black"
                />
              </div>
              <h3 className="font-serif font-extrabold text-lg text-gold-400 pt-1">
                ดาวน์โหลดแอปมือถือ HUDA ABAYA
              </h3>
              <p className="text-xs text-gray-300">
                สแกน QR Code นี้ด้วยกล้องมือถือ เพื่อติดตั้งแอปพลิเคชันเต็มจอ!
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-dubai-black p-4 rounded-2xl border-2 border-gold-400/40 shadow-inner inline-block relative group">
              <img
                src={qrCodeApiUrl}
                alt="HUDA ABAYA App QR Code"
                className="w-52 h-52 mx-auto object-contain rounded-lg border border-gold-400/30 shadow-md"
              />
              <div className="mt-2 text-[10px] text-gold-300/80 font-mono">
                {appUrl}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-dubai-dark p-3 rounded-xl border border-gold-400/30 text-left text-xs space-y-2 text-gray-300">
              <p className="font-serif font-bold text-gold-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-gold-400" />
                <span>ขั้นตอนการติดตั้งบนมือถือ:</span>
              </p>
              <ol className="space-y-1 text-[11px] list-decimal list-inside text-gray-300">
                <li>เปิดกล้องถ่ายรูป หรือไลน์สแกน QR Code บนมือถือ</li>
                <li>กดเปิดลิงก์เว็บไซต์ {storeSettings.storeName || 'HUDA ABAYA'}</li>
                <li>เลือก <strong className="text-gold-400">"เพิ่มไปยังหน้าจอโฮม (Add to Home)"</strong> เพื่อติดตั้งแอปพลิเคชันเต็มจอ</li>
              </ol>
            </div>

            <button
              onClick={() => setShowQRCodeModal(false)}
              className="w-full py-2.5 bg-gold-500 text-dubai-black font-extrabold text-xs rounded-xl shadow-gold-glow"
            >
              เข้าใจแล้ว ปิดหน้าต่าง QR Code
            </button>

          </div>
        </div>
      )}
    </>
  );
};
