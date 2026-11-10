'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Camera,
  RefreshCw,
  Zap,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Flame,
  Radio,
  Layers,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Gauge,
  Timer,
  SlidersHorizontal,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { soundFx } from '../../lib/soundEffects';

export interface ScannedFeedItem {
  id: string; // key
  title: string;
  variantName?: string;
  sku?: string;
  image?: string;
  quantity: number;
  maxStock?: number;
  price?: number;
}

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => boolean | { success: boolean; message?: string } | void | Promise<any>;
  title?: string;
  subtitle?: string;
  continuous?: boolean;
  scannedFeed?: ScannedFeedItem[];
  onAdjustQuantity?: (id: string, delta: number) => void;
  onDeleteItem?: (id: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'สแกน QR Code สินค้า',
  subtitle = 'นำกล้องส่องไปที่ QR Code บนป้ายสินค้า HUDA ABAYA เพื่อค้นหาหรือตัดสต๊อกอัตโนมัติ',
  continuous = false,
  scannedFeed,
  onAdjustQuantity,
  onDeleteItem,
}) => {
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastScannedResult, setLastScannedResult] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState<string>('');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [scanMode, setScanMode] = useState<'single' | 'continuous'>(continuous ? 'continuous' : 'single');
  const [scanDelayMs, setScanDelayMs] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('huda_qr_scan_delay_ms');
        if (saved) {
          const parsed = Number(saved);
          if (!isNaN(parsed) && parsed >= 200 && parsed <= 3000) return parsed;
        }
      } catch (e) {}
    }
    return 700; // Default 0.70s - smooth, fast, and prevents accidental repeats
  });
  const [isCooldownActive, setIsCooldownActive] = useState<boolean>(false);
  const [lastScanStatus, setLastScanStatus] = useState<'success' | 'error' | null>(null);
  const [scanFeedbackMsg, setScanFeedbackMsg] = useState<string>('');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'huda-qr-reader-container';

  // Locks to prevent rapid multi-frame triggers (debouncing)
  const isLockedRef = useRef<boolean>(false);
  const lastScannedTextRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scanDelayMsRef = useRef<number>(scanDelayMs);
  const scanModeRef = useRef<'single' | 'continuous'>(scanMode);

  useEffect(() => {
    scanDelayMsRef.current = scanDelayMs;
  }, [scanDelayMs]);

  useEffect(() => {
    scanModeRef.current = scanMode;
  }, [scanMode]);

  const updateScanDelay = (newDelay: number) => {
    const clamped = Math.max(200, Math.min(3000, Math.round(newDelay)));
    setScanDelayMs(clamped);
    scanDelayMsRef.current = clamped;
    try {
      localStorage.setItem('huda_qr_scan_delay_ms', clamped.toString());
    } catch (e) {}
  };

  // Total quantity & total price in feed
  const totalFeedQty = scannedFeed ? scannedFeed.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const totalFeedAmount = scannedFeed
    ? scannedFeed.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
    : 0;

  // Crisp sound beep using Web Audio API
  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, ctx.currentTime); // High clear chime
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch (e) {}
  };

  // Reset locks when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setLastScannedResult(null);
      setErrorMessage(null);
      setIsCooldownActive(false);
      isLockedRef.current = false;
      lastScannedTextRef.current = '';
      lastScannedTimeRef.current = 0;
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
      return;
    }

    setScanMode(continuous ? 'continuous' : 'single');
    isLockedRef.current = false;
    lastScannedTextRef.current = '';
    lastScannedTimeRef.current = 0;

    // Initialize camera listing
    let isCancelled = false;
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (isCancelled) return;
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back/rear camera on phones
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setErrorMessage('ไม่พบอุปกรณ์กล้องบนอุปกรณ์นี้ หรือยังไม่ได้รับสิทธิ์เข้าถึงกล้อง');
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        setErrorMessage('ไม่สามารถเปิดใช้งานกล้องได้: กรุณาอนุญาตให้เว็บไซต์เข้าถึงกล้อง (Camera Permission)');
      });

    return () => {
      isCancelled = true;
      stopScanner();
    };
  }, [isOpen]);

  // Start scanner when camera is selected
  useEffect(() => {
    if (isOpen && selectedCameraId) {
      startScanner(selectedCameraId);
    }
    return () => {
      stopScanner();
    };
  }, [isOpen, selectedCameraId]);

  const startScanner = async (cameraId: string) => {
    try {
      await stopScanner();

      const qrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_39,
        ],
        verbose: false,
      });

      html5QrCodeRef.current = qrCode;

      const config = {
        fps: 25, // Upgraded for ultra-responsive instant tag recognition
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0,
      };

      await qrCode.start(
        cameraId,
        config,
        (decodedText) => {
          handleSuccessScan(decodedText);
        },
        () => {
          // parse errors are normal while searching
        }
      );

      setIsScanning(true);
      setErrorMessage(null);

      // Check torch capabilities
      try {
        const capabilities = qrCode.getRunningTrackCapabilities();
        if (capabilities && (capabilities as any).torch) {
          setHasTorch(true);
        }
      } catch (e) {
        setHasTorch(false);
      }
    } catch (err: any) {
      setIsScanning(false);
      setErrorMessage(err?.message || 'ไม่สามารถเริ่มการสแกนผ่านกล้องนี้ได้');
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {}
      html5QrCodeRef.current = null;
      setIsScanning(false);
      setTorchOn(false);
    }
  };

  // Safe handler with Ultra-Fast Continuous Scanning & Intelligent Debouncing
  const handleSuccessScan = (text: string) => {
    if (!text || !text.trim()) return;

    const trimmed = text.trim();
    const now = Date.now();

    // 1. Guard: If currently in processing cooldown, ignore camera frames
    if (isLockedRef.current) {
      return;
    }

    const currentMode = scanModeRef.current;
    const currentDelay = scanDelayMsRef.current;

    // 2. Guard: If scanning the SAME QR code:
    // In continuous mode: user-configured delay (e.g. 700ms)
    // In single mode: 2000ms
    const sameItemCooldown = currentMode === 'continuous' ? currentDelay : 2000;
    if (lastScannedTextRef.current === trimmed && now - lastScannedTimeRef.current < sameItemCooldown) {
      return;
    }

    // 3. Guard: Minimum cooldown for DIFFERENT items in continuous mode:
    const diffItemCooldown = currentMode === 'continuous'
      ? Math.max(100, Math.min(600, Math.round(currentDelay * 0.3)))
      : 800;
    if (now - lastScannedTimeRef.current < diffItemCooldown) {
      return;
    }

    // Lock scanner briefly to prevent multi-fire on same frame
    isLockedRef.current = true;
    lastScannedTextRef.current = trimmed;
    lastScannedTimeRef.current = now;

    // Call consumer callback and evaluate outcome (success vs failure)
    let isSuccess = true;
    let customMsg = trimmed;
    try {
      const res = onScan(trimmed);
      if (res && typeof res === 'object') {
        if ('success' in res) isSuccess = Boolean((res as any).success);
        if ((res as any).message) customMsg = (res as any).message;
      } else if (typeof res === 'boolean') {
        isSuccess = res;
      }
    } catch (e) {
      isSuccess = false;
    }

    setLastScanStatus(isSuccess ? 'success' : 'error');
    setScanFeedbackMsg(customMsg);
    setLastScannedResult(trimmed);
    setIsCooldownActive(true);

    // Audio & Haptic feedback distinct for Success vs Failure
    if (isSuccess) {
      soundFx.playScanSuccess();
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(40);
        } catch (e) {}
      }
    } else {
      soundFx.playScanError();
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch (e) {}
      }
    }

    if (currentMode === 'single') {
      // Single scan mode: close automatically after short visual feedback
      setTimeout(() => {
        onClose();
      }, 500);
    } else {
      // Smooth dynamic unlock based on scan speed
      const unlockDuration = Math.min(300, Math.max(120, Math.round(currentDelay * 0.25)));
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = setTimeout(() => {
        isLockedRef.current = false;
        setIsCooldownActive(false);
      }, unlockDuration);
    }
  };

  const handleToggleTorch = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        const newTorch = !torchOn;
        await html5QrCodeRef.current.applyVideoConstraints({
          advanced: [{ torch: newTorch } as any],
        });
        setTorchOn(newTorch);
      } catch (e) {}
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    // For manual submit, force scan
    isLockedRef.current = false;
    lastScannedTextRef.current = '';
    handleSuccessScan(manualInput.trim());
    setManualInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative bg-white border-2 border-amber-400 rounded-3xl max-w-lg w-full p-4 sm:p-5 text-stone-950 shadow-2xl space-y-3 text-left max-h-[96vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-200 pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-400 flex items-center justify-center text-amber-900 shadow-xs">
              <Camera className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-serif font-black text-base sm:text-lg text-stone-950">{title}</h3>
              <p className="text-[10px] text-stone-500 font-medium">HUDA ABAYA Ultra-Fast QR Scanner</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-600 hover:text-stone-950 hover:bg-stone-100 border border-stone-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Mode Switcher */}
        <div className="flex items-center justify-between gap-1.5 bg-stone-100 p-1 rounded-2xl border border-stone-300 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setScanMode('continuous')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
              scanMode === 'continuous'
                ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-stone-950 shadow-xs border border-amber-500'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-800" />
            <span>⚡ สแกนรัวต่อเนื่อง ({(scanDelayMs / 1000).toFixed(2).replace(/\.00$/, '')} วิ)</span>
          </button>
          <button
            type="button"
            onClick={() => setScanMode('single')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
              scanMode === 'single'
                ? 'bg-amber-400 text-stone-950 shadow-xs border border-amber-500'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>สแกนทีละชิ้น (แม่นยำ)</span>
          </button>
        </div>

        {/* Scan Speed Adjustment Bar (ปรับความเร็วสแกน) */}
        {scanMode === 'continuous' && (
          <div className="bg-gradient-to-r from-amber-50/90 via-white to-amber-50/90 border border-amber-300 rounded-2xl p-2 sm:p-2.5 space-y-2 shrink-0 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Gauge className="w-4 h-4 text-amber-800 shrink-0" />
                <span className="text-[11px] font-black text-stone-900">
                  ความเร็วการสแกน:
                </span>
                <span className="bg-amber-400 text-stone-950 font-mono font-black text-xs px-2 py-0.5 rounded-lg border border-amber-500 shadow-2xs">
                  {(scanDelayMs / 1000).toFixed(2)} วิ
                </span>
                <span className="text-[10px] font-bold text-stone-600">
                  {scanDelayMs <= 400 && '⚡ เร็วพิเศษ (ยิงรัวสต๊อก)'}
                  {scanDelayMs > 400 && scanDelayMs <= 800 && '🚀 เร็วคล่องตัว'}
                  {scanDelayMs > 800 && scanDelayMs <= 1400 && '⏱️ มาตรฐาน (แนะนำ)'}
                  {scanDelayMs > 1400 && '🛡️ ช้า/ปลอดภัย (กันยิงเบิ้ล)'}
                </span>
              </div>

              {/* Quick Stepper Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => updateScanDelay(Math.max(200, scanDelayMs - 100))}
                  className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-amber-200 text-stone-900 font-black text-xs flex items-center justify-center transition cursor-pointer border border-stone-300 shadow-2xs active:scale-95"
                  title="เร็วขึ้น (-0.1 วิ)"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => updateScanDelay(Math.min(3000, scanDelayMs + 100))}
                  className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-amber-200 text-stone-900 font-black text-xs flex items-center justify-center transition cursor-pointer border border-stone-300 shadow-2xs active:scale-95"
                  title="ช้าลง (+0.1 วิ)"
                >
                  +
                </button>
              </div>
            </div>

            {/* 4 Speed Presets */}
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
              {[
                { label: '⚡ 0.35 วิ', desc: 'เร็วพิเศษ', ms: 350 },
                { label: '🚀 0.70 วิ', desc: 'เร็วคล่องตัว', ms: 700 },
                { label: '⏱️ 1.20 วิ', desc: 'มาตรฐาน', ms: 1200 },
                { label: '🛡️ 2.00 วิ', desc: 'ช้า/ปลอดภัย', ms: 2000 },
              ].map((p) => {
                const isActive = Math.abs(scanDelayMs - p.ms) < 40;
                return (
                  <button
                    key={p.ms}
                    type="button"
                    onClick={() => updateScanDelay(p.ms)}
                    className={`py-1 px-1 rounded-xl font-black text-center transition cursor-pointer text-[10px] leading-tight border ${
                      isActive
                        ? 'bg-amber-400 text-stone-950 border-amber-600 shadow-xs ring-2 ring-amber-400/50 scale-[1.02]'
                        : 'bg-white hover:bg-amber-50 text-stone-700 border-stone-300 hover:border-amber-400'
                    }`}
                  >
                    <div className="font-mono font-black">{p.label}</div>
                    <div className="text-[8px] sm:text-[9px] font-sans opacity-85">{p.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Slider with Min/Max indicators */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[9px] font-mono font-bold text-stone-500 shrink-0">0.2วิ (เร็วสุด)</span>
              <input
                type="range"
                min="200"
                max="3000"
                step="50"
                value={scanDelayMs}
                onChange={(e) => updateScanDelay(Number(e.target.value))}
                className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                title={`ความเร็วสแกน: ${(scanDelayMs / 1000).toFixed(2)} วินาที`}
              />
              <span className="text-[9px] font-mono font-bold text-stone-500 shrink-0">3.0วิ (ช้าสุด)</span>
            </div>
          </div>
        )}

        {/* Subtitle / Instructions */}
        <p className="text-[11px] text-stone-600 font-bold shrink-0">{subtitle}</p>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
          {/* Viewfinder Camera Box */}
          <div
            className={`relative w-full aspect-square sm:aspect-4/3 bg-stone-950 rounded-2xl overflow-hidden border-2 transition-all duration-150 ${
              isCooldownActive
                ? lastScanStatus === 'error'
                  ? 'border-rose-500 ring-4 ring-rose-500/50'
                  : 'border-emerald-400 ring-4 ring-emerald-400/50'
                : 'border-amber-500'
            }`}
          >
            <div id={scannerContainerId} className="w-full h-full object-cover"></div>

            {/* Animated Laser Scanning Line */}
            {isScanning && !isCooldownActive && (
              <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400 shadow-[0_0_12px_#34d399] animate-pulse pointer-events-none z-10"></div>
            )}

            {/* Non-blocking Live Scan Toast Pill (Floating at top without covering camera) */}
            {lastScannedResult && isCooldownActive && (
              <div
                className={`absolute top-3 inset-x-3 z-30 flex items-center justify-between px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150 border ${
                  lastScanStatus === 'error'
                    ? 'bg-rose-950/90 text-white border-rose-400'
                    : 'bg-stone-950/90 text-white border-emerald-400'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {lastScanStatus === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span
                    className={`text-xs font-bold truncate ${
                      lastScanStatus === 'error' ? 'text-rose-200' : 'text-emerald-300'
                    }`}
                  >
                    {lastScanStatus === 'error' ? '⚠️ ' : '✓ '}
                    <span className="font-mono text-white">{scanFeedbackMsg || lastScannedResult}</span>
                  </span>
                </div>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${
                    lastScanStatus === 'error'
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-500 text-stone-950'
                  }`}
                >
                  {lastScanStatus === 'error' ? '✕ ขัดข้อง' : '+1 ชิ้น'}
                </span>
              </div>
            )}

            {/* Torch toggle button overlay */}
            {hasTorch && isScanning && (
              <button
                type="button"
                onClick={handleToggleTorch}
                className={`absolute bottom-3 right-3 p-2.5 rounded-full z-20 backdrop-blur-md border transition cursor-pointer shadow-md ${
                  torchOn
                    ? 'bg-amber-400 text-stone-950 border-amber-300'
                    : 'bg-black/60 text-white border-white/30'
                }`}
                title="เปิด/ปิด ไฟฉาย"
              >
                <Zap className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Live Scanned Items Feed (รายการที่เพิ่งยิงเรียงลงมาอย่างสวยงาม) */}
          {scannedFeed && scannedFeed.length > 0 && (
            <div className="bg-gradient-to-b from-stone-50 via-white to-amber-50/20 border-2 border-amber-300/80 rounded-3xl p-3 sm:p-4 space-y-3 shadow-md">
              {/* Header Feed Banner */}
              <div className="flex items-center justify-between border-b-2 border-amber-200/80 pb-2.5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-xs">
                    <Layers className="w-4 h-4 text-stone-950" />
                  </div>
                  <div>
                    <h4 className="font-serif font-black text-xs sm:text-sm text-stone-950 flex items-center gap-1.5">
                      <span>รายการที่สแกนสำเร็จ</span>
                      <span className="bg-amber-200 text-stone-950 px-2 py-0.5 rounded-full text-[10px] font-sans font-black border border-amber-400">
                        {scannedFeed.length} ชนิด
                      </span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-black text-stone-800 bg-stone-100 px-2.5 py-1 rounded-xl border border-stone-200 shadow-2xs">
                    รวม <strong className="text-blue-700 font-mono text-xs">{totalFeedQty}</strong> ชิ้น
                  </span>
                  {totalFeedAmount > 0 && (
                    <span className="text-[11px] font-black text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-300 shadow-2xs">
                      รวม <strong className="font-mono text-xs text-emerald-700">฿{totalFeedAmount.toLocaleString()}</strong>
                    </span>
                  )}
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1 animate-pulse shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    <span>ยิงต่อเนื่องได้เลย</span>
                  </span>
                </div>
              </div>

              {/* Items Card List (เรียงสวยงาม ตัวล่าสุดอยู่บนสุด) */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {scannedFeed.map((item, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between gap-3 p-2.5 rounded-2xl transition duration-150 shadow-2xs ${
                        isLatest
                          ? 'bg-emerald-50/90 border-2 border-emerald-400 ring-2 ring-emerald-300/40'
                          : 'bg-white border border-stone-200 hover:border-amber-400 hover:shadow-xs'
                      }`}
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover border border-stone-200 shadow-2xs bg-stone-100"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-lg shadow-2xs">
                              👗
                            </div>
                          )}
                          <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-stone-800 text-white font-mono text-[9px] font-black flex items-center justify-center shadow-2xs">
                            {scannedFeed.length - idx}
                          </span>
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isLatest && (
                              <span className="text-[9px] font-black bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1 animate-pulse">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>เพิ่งสแกน (+1)</span>
                              </span>
                            )}
                            <p className="text-xs sm:text-sm font-black text-stone-950 truncate leading-tight">
                              {item.title}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-stone-600 flex-wrap">
                            {item.variantName && (
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-bold border border-stone-200">
                                {item.variantName}
                              </span>
                            )}
                            {item.sku && (
                              <span className="font-mono text-stone-500 font-bold">
                                {item.sku}
                              </span>
                            )}
                            {item.maxStock !== undefined && (
                              <span className="text-stone-500 font-medium">
                                (เหลือ {item.maxStock} ชิ้น)
                              </span>
                            )}
                          </div>

                          {item.price !== undefined && (
                            <div className="text-[11px] font-mono font-black text-emerald-800 flex items-center gap-1.5">
                              <span>฿{item.price.toLocaleString()}</span>
                              {item.quantity > 1 && (
                                <span className="text-stone-500 font-normal text-[10px]">
                                  (รวม ฿{(item.price * item.quantity).toLocaleString()})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stepper Controls & Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {onAdjustQuantity && (
                          <button
                            type="button"
                            onClick={() => onAdjustQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-black text-sm flex items-center justify-center transition cursor-pointer border border-stone-300 shadow-2xs active:scale-95"
                            title="ลดยอด -1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="font-mono text-xs sm:text-sm font-black text-emerald-950 px-2.5 py-1 bg-white rounded-xl border-2 border-emerald-400 min-w-9 text-center shadow-2xs">
                          x{item.quantity}
                        </span>
                        {onAdjustQuantity && (
                          <button
                            type="button"
                            onClick={() => onAdjustQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-95"
                            title="เพิ่มยอด +1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteItem && (
                          <button
                            type="button"
                            onClick={() => onDeleteItem(item.id)}
                            className="w-7 h-7 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-black flex items-center justify-center transition cursor-pointer ml-1 border border-rose-200 shadow-2xs active:scale-95"
                            title="ลบรายการนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Camera Selector Toolbar */}
          {cameras.length > 1 && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] font-black text-stone-700">เลือกกล้อง:</span>
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-stone-950 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label || `กล้อง ${c.id.slice(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Manual Barcode / SKU Input Form */}
          <div className="pt-2 border-t border-amber-200 space-y-1.5">
            <label className="block text-[11px] font-black text-stone-700">
              ⌨️ หรือใช้ปืนสแกนบาร์โค้ด / พิมพ์รหัสสินค้าโดยตรง:
            </label>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="ยิงบาร์โค้ด หรือพิมพ์ SKU เช่น HUDA:..."
                className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-stone-950 focus:outline-none focus:border-amber-500 shadow-inner"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-xs border border-amber-500 cursor-pointer"
              >
                ตกลง
              </button>
            </form>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-2 border-t border-stone-200 shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md border-2 border-emerald-700 flex items-center justify-center gap-2 transition cursor-pointer hover:scale-102 active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>
              ✓ เสร็จสิ้นการสแกน{' '}
              {totalFeedQty > 0 &&
                `(รวม ${totalFeedQty} ชิ้น${
                  totalFeedAmount > 0 ? ` • ฿${totalFeedAmount.toLocaleString()}` : ''
                })`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
