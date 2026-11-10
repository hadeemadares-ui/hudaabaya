'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Plus, Minus, Trash2, CheckCircle2, AlertCircle, PackageCheck, Zap, RefreshCw, Layers, Sparkles, Building2, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Product, ProductVariant } from '../../types';
import { resolveScannedProduct } from '../../utils/qrUtils';
import { ColorIndicator, getEffectiveVariantColor } from '../../utils/colorUtils';
import { soundFx } from '../../lib/soundEffects';
import { extractProductModelCode } from '../../utils/productUtils';
import { LotNumberManagerDropdown } from './LotNumberManagerDropdown';

export interface BatchCountItem {
  productId: string;
  productTitle: string;
  productImage?: string;
  category?: string;
  variantId: string;
  variantName: string;
  currentStock: number;
  costPrice: number;
  countedQty: number;
  color?: string;
}

interface BatchStockCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onBatchSubmit: (items: BatchCountItem[], supplier: string, note: string, lotNumber: string) => void;
}

export const BatchStockCountModal: React.FC<BatchStockCountModalProps> = ({
  isOpen,
  onClose,
  products,
  onBatchSubmit,
}) => {
  const getTodayDefaultLot = () => {
    const firstP = products && products.length > 0 ? products[0] : null;
    const model = firstP ? extractProductModelCode(firstP.title, firstP.id) : 'A005';
    return `HUDA-${model}-1-69`;
  };

  const [countedItems, setCountedItems] = useState<BatchCountItem[]>([]);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [lastScannedFeedback, setLastScannedFeedback] = useState<{ title: string; variant: string; qty: number } | null>(null);
  const [lotNumber, setLotNumber] = useState<string>(getTodayDefaultLot());
  const [supplierName, setSupplierName] = useState<string>('นำเข้าตรงจากดูไบ (Direct Dubai Import)');
  const [batchNote, setBatchNote] = useState<string>('ยิงนับรับเข้าสต๊อกสินค้าล็อตใหม่');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'huda-batch-counter-scanner';

  // Locks to prevent rapid multi-frame triggers
  const isLockedRef = useRef<boolean>(false);
  const lastScannedTextRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);
  const manualInputRef = useRef<HTMLInputElement>(null);

  // Sound beep using Web Audio API
  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.14);
      }
    } catch (e) {}
  };

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setCountedItems([]);
      setLastScannedFeedback(null);
      isLockedRef.current = false;
      lastScannedTextRef.current = '';
      lastScannedTimeRef.current = 0;
      return;
    }

    // List cameras
    let isCancelled = false;
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (isCancelled) return;
        if (devices && devices.length > 0) {
          setCameras(devices);
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch(() => {});

    // Focus manual input for barcode gun
    setTimeout(() => {
      manualInputRef.current?.focus();
    }, 500);

    return () => {
      isCancelled = true;
      stopScanner();
    };
  }, [isOpen]);

  // Start scanner when camera is selected & active
  useEffect(() => {
    if (isOpen && isCameraActive && selectedCameraId) {
      startScanner(selectedCameraId);
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isOpen, isCameraActive, selectedCameraId]);

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
        fps: 12,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0,
      };

      await qrCode.start(
        cameraId,
        config,
        (decodedText) => {
          handleItemScanned(decodedText);
        },
        () => {}
      );

      setIsScanning(true);

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

  // Main Item Scan-to-Count Handler
  const handleItemScanned = (rawText: string) => {
    if (!rawText || !rawText.trim()) return;

    const trimmed = rawText.trim();
    const now = Date.now();

    // Guard: Prevent rapid multi-frame triggers for the same tag within 1.2 seconds
    if (lastScannedTextRef.current === trimmed && now - lastScannedTimeRef.current < 1200) {
      return;
    }
    if (isLockedRef.current) return;

    const match = resolveScannedProduct(trimmed, products);
    if (!match) {
      soundFx.playDelete();
      return;
    }

    isLockedRef.current = true;
    lastScannedTextRef.current = trimmed;
    lastScannedTimeRef.current = now;

    playBeep();

    if (match.lotNumber) {
      const model = extractProductModelCode(match.product.title, match.product.id) || '001';
      const cleanLot = match.lotNumber.trim();
      const formattedLot = cleanLot.toUpperCase().startsWith('HUDA-')
        ? cleanLot.toUpperCase()
        : `HUDA-${model}-${cleanLot}`;
      setLotNumber(formattedLot);
    }

    setCountedItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.variantId === match.variant.id);
      let newTotalCounted = 1;

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].countedQty += 1;
        newTotalCounted = updated[existingIdx].countedQty;
        setLastScannedFeedback({
          title: match.product.title,
          variant: match.variant.name,
          qty: newTotalCounted,
        });
        return updated;
      } else {
        const defaultCost = match.variant.costPrice ?? Math.round(match.variant.price * 0.5);
        const newItem: BatchCountItem = {
          productId: match.product.id,
          productTitle: match.product.title,
          productImage: match.product.images?.[0] || '',
          category: match.product.category,
          variantId: match.variant.id,
          variantName: match.variant.name,
          currentStock: typeof match.variant.stockQuantity === 'number' && !isNaN(match.variant.stockQuantity) ? match.variant.stockQuantity : 0,
          costPrice: defaultCost,
          countedQty: 1,
          color: getEffectiveVariantColor(match.product, match.variant),
        };
        setLastScannedFeedback({
          title: match.product.title,
          variant: match.variant.name,
          qty: 1,
        });
        return [newItem, ...prev];
      }
    });

    // Unlock after 800ms cooldown
    setTimeout(() => {
      isLockedRef.current = false;
    }, 800);
  };

  const handleUpdateQty = (variantId: string, delta: number) => {
    setCountedItems((prev) =>
      prev
        .map((item) => {
          if (item.variantId === variantId) {
            const newQty = item.countedQty + delta;
            return newQty > 0 ? { ...item, countedQty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as BatchCountItem[]
    );
  };

  const handleSetExactQty = (variantId: string, val: string) => {
    const num = parseInt(val, 10);
    setCountedItems((prev) =>
      prev.map((item) => (item.variantId === variantId ? { ...item, countedQty: isNaN(num) ? 0 : Math.max(0, num) } : item))
    );
  };

  const handleSetCostPrice = (variantId: string, val: string) => {
    const cost = parseFloat(val);
    setCountedItems((prev) =>
      prev.map((item) => (item.variantId === variantId ? { ...item, costPrice: isNaN(cost) ? 0 : Math.max(0, cost) } : item))
    );
  };

  const handleDeleteItem = (variantId: string) => {
    setCountedItems((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const handleManualBarcodeInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    lastScannedTextRef.current = '';
    handleItemScanned(manualInput.trim());
    setManualInput('');
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

  const handleFinalSubmit = () => {
    if (countedItems.length === 0) {
      alert('กรุณาสแกนหรือระบุสินค้าอย่างน้อย 1 ชิ้นเพื่อรับเข้าสต๊อก');
      return;
    }

    const totalQty = countedItems.reduce((sum, item) => sum + item.countedQty, 0);
    if (totalQty <= 0) {
      alert('จำนวนสินค้าที่นับได้ต้องมากกว่า 0 ชิ้น');
      return;
    }

    const confirmMsg = `ยืนยันบันทึกรับเข้าสต๊อกสินค้าทั้งหมด:\n\n• เลขล็อตสินค้า: ${lotNumber || '-'}\n• จำนวนสินค้า: ${countedItems.length} รายการ\n• รวมจำนวนชิ้นทั้งหมด: ${totalQty} ชิ้น\n• แหล่งที่มา: ${supplierName}\n\nระบบจะทำการเพิ่มจำนวนสต๊อกเข้าคลังสินค้าทันที ยืนยันใช่หรือไม่?`;
    if (!confirm(confirmMsg)) return;

    setIsSubmitting(true);
    try {
      onBatchSubmit(countedItems, supplierName, batchNote, lotNumber);
      soundFx.playSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalCountedQty = countedItems.reduce((acc, item) => acc + item.countedQty, 0);
  const totalBatchCost = countedItems.reduce((acc, item) => acc + item.countedQty * item.costPrice, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative bg-white border-2 border-emerald-500 rounded-3xl max-w-4xl w-full p-4 sm:p-6 text-stone-950 shadow-2xl space-y-4 text-left max-h-[94vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-200 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg sm:text-xl text-stone-950 flex items-center gap-1.5">
                <span>สแกนยิงนับจำนวนสต๊อก (Batch Count &amp; Stock In)</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-[10px] font-black">
                  LIVE COUNTER
                </span>
              </h3>
              <p className="text-xs text-stone-600 font-bold truncate">
                ยิง QR หรือบาร์โค้ดสินค้าต่อเนื่องเพื่อสะสมจำนวน แล้วกดบันทึกรับเข้าคลังพร้อมกันในคลิกเดียว
              </p>
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

        {/* 1. TOP SECTION: Viewfinder Camera Scanner */}
        <div className="shrink-0 bg-stone-950 rounded-2xl p-2.5 border-2 border-emerald-500 relative flex flex-col items-center justify-center overflow-hidden">
          {isCameraActive ? (
            <div className="relative w-full max-w-md h-40 sm:h-44 bg-black rounded-xl overflow-hidden flex items-center justify-center">
              <div id={scannerContainerId} className="w-full h-full object-cover"></div>
              
              {/* Laser animation */}
              {isScanning && (
                <div className="absolute inset-x-6 h-0.5 bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse pointer-events-none z-10"></div>
              )}

              {/* Torch Toggle */}
              {hasTorch && isScanning && (
                <button
                  type="button"
                  onClick={handleToggleTorch}
                  className={`absolute bottom-2 right-2 p-2 rounded-full z-20 backdrop-blur-md border transition cursor-pointer shadow-md ${
                    torchOn ? 'bg-amber-400 text-stone-950' : 'bg-black/60 text-white'
                  }`}
                  title="เปิด/ปิด ไฟฉาย"
                >
                  <Zap className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Live Floating Feedback on Scan */}
              {lastScannedFeedback && (
                <div className="absolute inset-x-2 bottom-2 bg-emerald-950/90 text-white px-2.5 py-1.5 rounded-xl border border-emerald-400 flex items-center justify-between text-xs z-20 animate-slide-in">
                  <span className="truncate font-bold">
                    ✓ {lastScannedFeedback.title} ({lastScannedFeedback.variant})
                  </span>
                  <span className="font-mono font-black text-amber-300 bg-black/50 px-2 py-0.5 rounded ml-2 shrink-0">
                    +{lastScannedFeedback.qty}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-3 text-stone-400 space-y-1.5">
              <Camera className="w-7 h-7 mx-auto text-stone-500" />
              <p className="text-xs font-bold">กล้องพักอยู่ (สามารถใช้ปืนยิงบาร์โค้ดด้านล่างได้ตามปกติ)</p>
              <button
                type="button"
                onClick={() => setIsCameraActive(true)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black"
              >
                เปิดกล้องสแกน
              </button>
            </div>
          )}

          {/* Camera Controls Bar */}
          <div className="w-full max-w-md flex items-center justify-between gap-2 pt-1 text-[11px] text-white">
            <button
              type="button"
              onClick={() => setIsCameraActive(!isCameraActive)}
              className="text-stone-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
            >
              <Camera className="w-3 h-3" />
              <span>{isCameraActive ? 'พักกล้อง' : 'เปิดกล้อง'}</span>
            </button>

            {cameras.length > 1 && isCameraActive && (
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="bg-stone-800 text-white border border-stone-600 rounded px-1.5 py-0.5 text-[10px] focus:outline-none cursor-pointer"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label || `กล้อง ${c.id.slice(0, 4)}`}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* 2. MIDDLE SECTION: รายการสินค้าที่ยิงสะสมๆ ต่อกัน (Scanned Items Table List) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-serif font-black text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
              <span>📋 รายการสินค้าที่ยิงสะสม:</span>
              <span className="text-[11px] font-mono text-emerald-800 font-black bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                {countedItems.length} แบบ
              </span>
            </h4>
            <span className="text-xs text-stone-500 font-bold">
              รวมสะสม: <strong className="text-emerald-950 font-black text-sm">{totalCountedQty}</strong> ชิ้น
            </span>
          </div>

          <div className="overflow-y-auto min-h-[160px] max-h-[260px] border-2 border-stone-200 rounded-2xl p-1.5 bg-stone-50/70 space-y-1.5 shadow-inner">
            {countedItems.length === 0 ? (
              <div className="py-10 text-center text-stone-500 space-y-2">
                <PackageCheck className="w-9 h-9 text-stone-400 mx-auto animate-pulse" />
                <p className="text-xs font-black text-stone-700">ยังไม่มีรายการที่ยิงสะสม</p>
                <p className="text-[11px] text-stone-500">นำสินค้ามายิง QR Code ผ่านกล้องด้านบน หรือยิงด้วยปืนบาร์โค้ดด้านล่างเพื่อเริ่มนับ</p>
              </div>
            ) : (
              countedItems.map((item, idx) => {
                const projectedNewStock = item.currentStock + item.countedQty;

                return (
                  <div
                    key={item.variantId}
                    className="bg-white p-2.5 rounded-xl border border-stone-300 shadow-xs flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-xs text-stone-950 hover:border-emerald-400 transition"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-950 font-mono font-black text-xs flex items-center justify-center shrink-0 border border-emerald-300">
                        {idx + 1}
                      </span>
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="w-10 h-12 object-cover rounded-lg border border-stone-200 shrink-0 bg-white"
                        />
                      )}
                      <div className="truncate">
                        <h4 className="font-serif font-black text-stone-950 truncate max-w-xs sm:max-w-sm text-xs">
                          {item.productTitle}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-2 py-0.5 bg-amber-100 text-stone-950 rounded font-black text-[10px] border border-amber-300 flex items-center gap-1">
                            {item.color && <ColorIndicator color={item.color} showLabel={false} dotClassName="w-2 h-2" />}
                            <span>{item.variantName}</span>
                          </span>
                          <span className="text-[10px] text-stone-500 font-bold">
                            สต๊อกเดิม: <strong className="text-stone-800 font-mono">{item.currentStock}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Count Stepper */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* Stepper */}
                      <div className="flex items-center bg-stone-100 border-2 border-stone-300 rounded-xl overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.variantId, -1)}
                          className="px-2.5 py-1 text-stone-800 hover:bg-stone-200 font-black text-sm cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.countedQty === 0 ? '' : item.countedQty}
                          onChange={(e) => handleSetExactQty(item.variantId, e.target.value)}
                          className="w-12 text-center bg-white font-mono font-black text-emerald-800 text-sm focus:outline-none py-1 border-x border-stone-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.variantId, 1)}
                          className="px-2.5 py-1 text-stone-800 hover:bg-stone-200 font-black text-sm cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Projected Stock Badge */}
                      <div className="text-center px-2 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-[10px] font-bold text-emerald-950 shrink-0">
                        สต๊อกใหม่: <strong className="text-emerald-800 font-mono text-xs font-black">{projectedNewStock}</strong>
                      </div>

                      {/* Cost Input */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-stone-500 font-bold">ทุน:</span>
                        <input
                          type="number"
                          min="0"
                          value={item.costPrice === 0 ? '' : item.costPrice}
                          onChange={(e) => handleSetCostPrice(item.variantId, e.target.value)}
                          className="w-16 border border-stone-300 rounded-lg px-1.5 py-1 text-right font-mono font-black text-xs focus:outline-none focus:border-emerald-500"
                        />
                        <span className="text-[10px] text-stone-500">฿</span>
                      </div>

                      {/* Delete Item from batch */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.variantId)}
                        className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="ลบออกจากรอบนับนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. BOTTOM SECTION: ข้อความชุดนี้ย้ายมาต่อท้ายรายการสินค้าตามที่ขอ */}
        <div className="shrink-0 flex flex-col justify-between space-y-2.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-300 text-xs">
          {/* Quick Barcode Gun Input */}
          <div className="space-y-1">
            <label className="font-black text-stone-900 flex items-center justify-between">
              <span>⌨️ ยิงบาร์โค้ดด้วยปืนสแกน หรือพิมพ์ SKU:</span>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                พร้อมรับสัญญาณเครื่องยิงบาร์โค้ด
              </span>
            </label>
            <form onSubmit={handleManualBarcodeInput} className="flex gap-2">
              <input
                ref={manualInputRef}
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="ยิงบาร์โค้ด หรือพิมพ์ SKU เช่น HUDA:..."
                className="flex-1 bg-white border-2 border-stone-300 rounded-xl px-3 py-1.5 text-xs font-mono font-black focus:outline-none focus:border-emerald-500 shadow-inner"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-xs border border-emerald-700 cursor-pointer"
              >
                + นับ 1
              </button>
            </form>
          </div>

          {/* Batch Metadata (Lot Number, Supplier, Note) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-stone-200">
            <div>
              <LotNumberManagerDropdown
                value={lotNumber}
                onChange={setLotNumber}
                standardLot={(() => {
                  let model = '001';
                  if (countedItems.length > 0) {
                    const activeProd = products.find((p) => p.id === countedItems[0]?.productId);
                    if (activeProd) model = extractProductModelCode(activeProd.title, activeProd.id);
                  } else if (products && products.length > 0) {
                    const pWithCode = products.find((p) => extractProductModelCode(p.title, p.id) !== 'A005') || products[0];
                    model = extractProductModelCode(pWithCode.title, pWithCode.id);
                  }
                  return `HUDA-${model}-1-69`;
                })()}
                title="เลขล็อต (Lot / Batch):"
                placeholder="เช่น HUDA-001-1-69"
                dropdownDirection="up"
              />
            </div>

            <div>
              <label className="font-black text-stone-900 block mb-0.5">แหล่งที่มา / ผู้จัดส่ง:</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-black text-stone-900 block mb-0.5">หมายเหตุรอบรับเข้านี้:</label>
              <input
                type="text"
                value={batchNote}
                onChange={(e) => setBatchNote(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Mini Summary Counters */}
          <div className="flex flex-wrap items-center justify-between bg-emerald-100/70 border border-emerald-300 rounded-xl px-3 py-1.5 text-emerald-950 font-black gap-2">
            <span>รายการที่นับได้: <strong className="text-emerald-900 text-sm font-mono">{countedItems.length}</strong> แบบ</span>
            <span>•</span>
            <span>รวมทั้งหมด: <strong className="text-emerald-800 text-base font-mono">{totalCountedQty}</strong> ชิ้น</span>
            <span>•</span>
            <span>ต้นทุนรวม: <strong className="text-amber-900 text-sm font-mono">฿{totalBatchCost.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* 4. FOOTER ACTIONS */}
        <div className="pt-2 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (countedItems.length > 0 && confirm('ต้องการล้างรายการนับทั้งหมดใช่หรือไม่?')) {
                  setCountedItems([]);
                }
              }}
              disabled={countedItems.length === 0}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl disabled:opacity-40 transition cursor-pointer"
            >
              ล้างรายการนับ
            </button>
            <span className="text-xs text-stone-600 font-bold hidden sm:inline">
              รวม: <strong className="text-emerald-900 font-mono">{totalCountedQty}</strong> ชิ้น ({countedItems.length} แบบ)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 font-black rounded-xl text-xs transition cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={countedItems.length === 0 || totalCountedQty <= 0 || isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-xl text-xs shadow-md border border-emerald-700 transition flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>📥 บันทึกรับเข้าสต๊อกทั้งหมด ({totalCountedQty} ชิ้น)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
