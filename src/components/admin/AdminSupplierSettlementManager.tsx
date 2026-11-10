'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Truck, DollarSign, PackageCheck, Plus, Search, Calendar, FileText, CheckCircle2, AlertCircle, Sparkles, Filter, ChevronRight, ChevronDown, X, Printer, ArrowDownLeft, ArrowUpRight, CheckSquare, Square, Check, Trash2, Lock, KeyRound, Eye, EyeOff, Upload, Image as ImageIcon, Camera, RotateCcw, QrCode } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { StockMovement, SupplierSettlement, SupplierReturnItem, SupplierReturnVoucher } from '../../types';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { ColorIndicator, getEffectiveVariantColor } from '../../utils/colorUtils';
import { extractProductModelCode, generateStandardHudaLot } from '../../utils/productUtils';
import { LotNumberManagerDropdown } from './LotNumberManagerDropdown';
import { QRScannerModal, ScannedFeedItem } from '../common/QRScannerModal';
import { resolveScannedProduct } from '../../utils/qrUtils';
import { soundFx } from '../../lib/soundEffects';
import { formatThaiDateTime, formatThaiDateOnly } from '../../utils/dateUtils';

export const AdminSupplierSettlementManager: React.FC = () => {
  const {
    products,
    stockMovements,
    supplierSettlements,
    supplierReturnVouchers,
    createSupplierReturn,
    deleteSupplierReturn,
    currentStaff,
    recordStockIn,
    deleteStockMovement,
    trashedStockMovements,
    restoreStockMovement,
    permanentlyDeleteStockMovement,
    clearTrashedStockMovements,
    verifyAdminPasscode,
    createSupplierSettlement,
    cancelSupplierSettlement,
    storeSettings,
    saveCustomOption,
    forceRealtimeSync,
    syncStatus,
    lastSyncTime,
  } = useShop();

  const [activeSubTab, setActiveSubTab] = useState<'payouts' | 'logs' | 'returns' | 'history' | 'trash'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get('subtab') || params.get('sub');
      if (sub === 'payouts' || sub === 'settlement') return 'payouts';
      if (sub === 'history') return 'history';
      if (sub === 'returns' || sub === 'return') return 'returns';
      if (sub === 'logs' || sub === 'stock') return 'logs';
      if (sub === 'trash') return 'trash';
    }
    return 'logs';
  });
  const [undoDeleteToast, setUndoDeleteToast] = useState<{ id: string; title: string; qty: number; type: string } | null>(null);
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState<string>('all');
  const [movementSearchQuery, setMovementSearchQuery] = useState<string>('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<'all' | 'IN' | 'OUT'>('all');
  const [logStartDateTime, setLogStartDateTime] = useState<string>('');
  const [logEndDateTime, setLogEndDateTime] = useState<string>('');

  const setQuickDatePreset = (preset: 'today' | '24hours' | '7days' | '30days' | 'all') => {
    if (preset === 'all') {
      setLogStartDateTime('');
      setLogEndDateTime('');
      return;
    }
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatDateTimeLocal = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    if (preset === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      setLogStartDateTime(formatDateTimeLocal(start));
      setLogEndDateTime(formatDateTimeLocal(end));
    } else if (preset === '24hours') {
      const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      setLogStartDateTime(formatDateTimeLocal(start));
      setLogEndDateTime(formatDateTimeLocal(now));
    } else if (preset === '7days') {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setLogStartDateTime(formatDateTimeLocal(start));
      setLogEndDateTime(formatDateTimeLocal(now));
    } else if (preset === '30days') {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setLogStartDateTime(formatDateTimeLocal(start));
      setLogEndDateTime(formatDateTimeLocal(now));
    }
  };

  // Supplier Return States
  const [isReturnModalOpen, setIsReturnModalOpen] = useState<boolean>(false);
  const [isQRScannerReturnOpen, setIsQRScannerReturnOpen] = useState<boolean>(false);
  const [viewingReturnVoucher, setViewingReturnVoucher] = useState<SupplierReturnVoucher | null>(null);
  const [returnSupplierName, setReturnSupplierName] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [returnStaff, setReturnStaff] = useState<string>('');
  const [returnReceiver, setReturnReceiver] = useState<string>('');
  const [returnNote, setReturnNote] = useState<string>('');
  const [returnSlipUrl, setReturnSlipUrl] = useState<string>('');
  const [returnCartItems, setReturnCartItems] = useState<SupplierReturnItem[]>([]);

  // Item selector states for Return
  const [selectedReturnProductId, setSelectedReturnProductId] = useState<string>('');
  const [selectedReturnVariantId, setSelectedReturnVariantId] = useState<string>('');
  const [returnItemQty, setReturnItemQty] = useState<number | ''>(1);
  const [returnItemCostPrice, setReturnItemCostPrice] = useState<number | ''>('');
  const [returnItemReason, setReturnItemReason] = useState<string>('สินค้าชำรุด / มีตำหนิ');
  const [returnCustomReason, setReturnCustomReason] = useState<string>('');
  const [returnItemLotNumber, setReturnItemLotNumber] = useState<string>('');

  // Filters for Return History tab
  const [returnFilterSupplier, setReturnFilterSupplier] = useState<string>('all');
  const [returnSearchQuery, setReturnSearchQuery] = useState<string>('');

  // Preset return reasons
  const RETURN_REASONS = [
    'สินค้าชำรุด / มีตำหนิ',
    'หมดสัญญาฝากขาย / คืนของค้างสต็อก',
    'เปลี่ยนแบบ / เปลี่ยนไซส์',
    'สินค้าไม่ตรงสเปก / ส่งผิดรุ่น',
    'ส่งของเกินจำนวนที่สั่ง',
    'อื่นๆ (ระบุเอง)',
  ];

  // Live Feed for Supplier Return QR / Barcode continuous scanner
  const returnScannedFeed: ScannedFeedItem[] = React.useMemo(() => {
    return [...returnCartItems].reverse().map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const variant = prod?.variants.find((v) => v.id === item.variantId);
      return {
        id: `${item.productId}__${item.variantId}__${item.lotNumber || ''}`,
        title: item.productTitle,
        variantName: `${item.variantName}${item.lotNumber ? ` [ล็อต: ${item.lotNumber}]` : ''}`,
        sku: item.lotNumber ? `ล็อต: ${item.lotNumber}` : undefined,
        image: prod?.images?.[0] || undefined,
        quantity: item.quantity,
        maxStock: variant?.stockQuantity || 999,
        price: item.costPrice,
      };
    });
  }, [returnCartItems, products]);

  const handleAdjustReturnFeedQty = (id: string, delta: number) => {
    const parts = id.split('__');
    const pId = parts[0];
    const vId = parts[1];
    const lot = parts[2] || undefined;

    setReturnCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.productId === pId && item.variantId === vId && (item.lotNumber || '') === (lot || '')) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalCost: newQty * item.costPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as SupplierReturnItem[];
    });
  };

  const handleDeleteReturnFeedItem = (id: string) => {
    const parts = id.split('__');
    const pId = parts[0];
    const vId = parts[1];
    const lot = parts[2] || undefined;

    setReturnCartItems((prev) =>
      prev.filter((item) => !(item.productId === pId && item.variantId === vId && (item.lotNumber || '') === (lot || '')))
    );
  };

  // Ultra-fast continuous scan handler for Supplier Returns
  const handleReturnQRScan = (decodedText: string) => {
    const match = resolveScannedProduct(decodedText, products);
    if (match) {
      const currentStock = typeof match.variant.stockQuantity === 'number' ? match.variant.stockQuantity : 0;
      if (currentStock <= 0) {
        soundFx.playScanError();
        setStockInToast(`⚠️ สินค้า "${match.product.title} (${match.variant.name})" ไม่มีสต๊อกคงเหลือในระบบ`);
        return { success: false, message: `ไม่มีสต๊อก: ${match.product.title}` };
      }

      const cost = match.variant.costPrice !== undefined && match.variant.costPrice > 0
        ? match.variant.costPrice
        : (match.product.costPrice || 0);

      if (!returnSupplierName) {
        if (match.product.category === 'perfume' || match.product.category === 'incense') {
          setReturnSupplierName('ซัพพลายเออร์น้ำหอมดูไบ');
        } else {
          setReturnSupplierName('โรงงานอาบายะห์ดูไบ');
        }
      }

      setSelectedReturnProductId(match.product.id);
      setSelectedReturnVariantId(match.variant.id);
      setReturnItemCostPrice(cost);
      if (match.lotNumber) setReturnItemLotNumber(match.lotNumber);

      let reachedLimit = false;
      setReturnCartItems((prev) => {
        const existingIdx = prev.findIndex(
          (it) => it.productId === match.product.id && it.variantId === match.variant.id && (it.lotNumber || '') === (match.lotNumber || '')
        );
        if (existingIdx >= 0) {
          const existing = prev[existingIdx];
          const newQty = existing.quantity + 1;
          if (newQty > currentStock) {
            reachedLimit = true;
            return prev;
          }
          const updated = [...prev];
          updated[existingIdx] = {
            ...existing,
            quantity: newQty,
            totalCost: newQty * existing.costPrice,
          };
          return updated;
        } else {
          const newItem: SupplierReturnItem = {
            productId: match.product.id,
            productTitle: match.product.title,
            variantId: match.variant.id,
            variantName: match.variant.name,
            quantity: 1,
            costPrice: cost,
            totalCost: cost,
            lotNumber: match.lotNumber || undefined,
            reason: returnItemReason === 'อื่นๆ (ระบุเอง)' ? (returnCustomReason.trim() || 'อื่นๆ') : returnItemReason,
          };
          return [...prev, newItem];
        }
      });

      if (reachedLimit) {
        soundFx.playScanError();
        setStockInToast(`⚠️ ไม่สามารถคืนเกินสต็อกคงเหลือ (${currentStock} ชิ้น)`);
        return { success: false, message: `เกินสต็อก (${currentStock} ชิ้น)` };
      }

      soundFx.playScanSuccess();
      setStockInToast(`✓ สแกนสำเร็จ: เพิ่ม "${match.product.title} (${match.variant.name})" ลงรายการส่งคืนแล้ว (+1)`);
      return { success: true, message: `${match.product.title} (${match.variant.name}) +1` };
    } else {
      soundFx.playScanError();
      setStockInToast(`⚠️ ไม่พบสินค้าที่ตรงกับรหัส "${decodedText}"`);
      return { success: false, message: `ไม่พบสินค้า: ${decodedText}` };
    }
  };

  const handleOpenReturnModal = () => {
    setReturnSupplierName(selectedSupplierFilter !== 'all' ? selectedSupplierFilter : (supplierOptions[0] || 'โรงงานอาบายะห์ดูไบ'));
    setReturnDate(new Date().toISOString().slice(0, 10));
    setReturnStaff(currentStaff?.name || 'เจ้าของร้าน (Admin)');
    setReturnReceiver('');
    setReturnNote('');
    setReturnSlipUrl('');
    setReturnCartItems([]);
    setSelectedReturnProductId(products[0]?.id || '');
    if (products[0]?.variants?.[0]) {
      setSelectedReturnVariantId(products[0].variants[0].id);
      setReturnItemCostPrice(products[0].variants[0].costPrice || products[0].costPrice || 0);
    } else {
      setSelectedReturnVariantId('');
      setReturnItemCostPrice('');
    }
    setReturnItemQty(1);
    setReturnItemReason('สินค้าชำรุด / มีตำหนิ');
    setReturnCustomReason('');
    setReturnItemLotNumber('');
    setIsReturnModalOpen(true);
  };

  const handleReturnProductChange = (prodId: string) => {
    setSelectedReturnProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod && prod.variants && prod.variants.length > 0) {
      const firstVar = prod.variants[0];
      setSelectedReturnVariantId(firstVar.id);
      setReturnItemCostPrice(firstVar.costPrice !== undefined ? firstVar.costPrice : (prod.costPrice || 0));
    } else {
      setSelectedReturnVariantId('');
      setReturnItemCostPrice(prod?.costPrice || 0);
    }
    setReturnItemQty(1);
  };

  const handleReturnVariantChange = (varId: string) => {
    setSelectedReturnVariantId(varId);
    const prod = products.find((p) => p.id === selectedReturnProductId);
    const variant = prod?.variants.find((v) => v.id === varId);
    if (variant) {
      setReturnItemCostPrice(variant.costPrice !== undefined ? variant.costPrice : (prod?.costPrice || 0));
    }
    setReturnItemQty(1);
  };

  const handleAddItemToReturnCart = () => {
    const prod = products.find((p) => p.id === selectedReturnProductId);
    if (!prod) {
      alert('กรุณาเลือกสินค้าที่ต้องการส่งคืน');
      return;
    }
    const variant = prod.variants.find((v) => v.id === selectedReturnVariantId);
    if (!variant) {
      alert('กรุณาเลือกไซส์/สีสินค้าที่ต้องการส่งคืน');
      return;
    }

    const qty = typeof returnItemQty === 'number' ? returnItemQty : parseInt(returnItemQty, 10);
    if (!qty || qty <= 0) {
      alert('กรุณาระบุจำนวนสินค้าที่ต้องการส่งคืนให้ถูกต้อง (อย่างน้อย 1 ชิ้น)');
      return;
    }

    const currentStock = typeof variant.stockQuantity === 'number' ? variant.stockQuantity : 0;
    // Calculate total already queued in returnCartItems for this variant
    const alreadyQueued = returnCartItems
      .filter((item) => item.productId === prod.id && item.variantId === variant.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (qty + alreadyQueued > currentStock) {
      alert(`ไม่สามารถคืนสินค้าเกินสต็อกคงเหลือได้ครับ (สต็อกคงเหลือ: ${currentStock} ชิ้น, ค้างในรายการ: ${alreadyQueued} ชิ้น)`);
      return;
    }

    const cost = typeof returnItemCostPrice === 'number' ? returnItemCostPrice : (parseFloat(returnItemCostPrice) || 0);
    const finalReason = returnItemReason === 'อื่นๆ (ระบุเอง)'
      ? (returnCustomReason.trim() || 'อื่นๆ')
      : returnItemReason;

    const newItem: SupplierReturnItem = {
      productId: prod.id,
      productTitle: prod.title,
      variantId: variant.id,
      variantName: variant.name,
      quantity: qty,
      costPrice: cost,
      totalCost: cost * qty,
      lotNumber: returnItemLotNumber.trim() || undefined,
      reason: finalReason,
    };

    setReturnCartItems((prev) => [...prev, newItem]);
    setReturnItemQty(1);
    setReturnCustomReason('');
    soundFx.playClick();
  };

  const handleUpdateReturnCartItemQty = (index: number, delta: number) => {
    setReturnCartItems((prev) => {
      const target = prev[index];
      if (!target) return prev;
      const newQty = target.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      const prod = products.find((p) => p.id === target.productId);
      const variant = prod?.variants.find((v) => v.id === target.variantId);
      const maxStock = typeof variant?.stockQuantity === 'number' ? variant.stockQuantity : 999;
      if (newQty > maxStock) {
        alert(`ไม่สามารถคืนเกินสต็อกคงเหลือได้ครับ (สต็อกคงเหลือ: ${maxStock} ชิ้น)`);
        return prev;
      }
      const updated = [...prev];
      updated[index] = {
        ...target,
        quantity: newQty,
        totalCost: newQty * target.costPrice,
      };
      return updated;
    });
  };

  const handleRemoveItemFromReturnCart = (index: number) => {
    setReturnCartItems((prev) => prev.filter((_, i) => i !== index));
    soundFx.playDelete();
  };

  const handleSaveSupplierReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnSupplierName.trim()) {
      alert('กรุณาเลือกหรือระบุชื่อ Supplier ที่ต้องการส่งคืน');
      return;
    }
    if (returnCartItems.length === 0) {
      alert('กรุณาเพิ่มรายการสินค้าที่ต้องการส่งคืนอย่างน้อย 1 รายการ');
      return;
    }

    const totalQty = returnCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalCost = returnCartItems.reduce((sum, item) => sum + item.totalCost, 0);

    const newVoucher = createSupplierReturn({
      returnDate: returnDate || new Date().toISOString().slice(0, 10),
      supplierName: returnSupplierName.trim(),
      items: returnCartItems,
      totalQuantity: totalQty,
      totalReturnCost: totalCost,
      note: returnNote.trim() || undefined,
      performedBy: returnStaff.trim() || 'เจ้าของร้าน (Admin)',
      receiverName: returnReceiver.trim() || undefined,
      proofImageUrl: returnSlipUrl || undefined,
    });

    setIsReturnModalOpen(false);
    setViewingReturnVoucher(newVoucher);
    setStockInToast(`📦 บันทึกส่งคืนสินค้าให้ ${returnSupplierName} สำเร็จ (${totalQty} ชิ้น / ฿${totalCost.toLocaleString()}) ตัดสต็อกเรียบร้อยแล้ว!`);
  };

  const handleCancelReturnVoucher = (voucher: SupplierReturnVoucher) => {
    const pin = prompt(`กรุณาใส่รหัสผ่าน Admin เพื่อยืนยันการยกเลิกใบส่งคืน ${voucher.id} (ระบบจะดึงสต็อกสินค้า ${voucher.totalQuantity} ชิ้น กลับเข้าสู่ระบบ):`);
    if (!pin) return;
    if (!verifyAdminPasscode(pin)) {
      alert('รหัสผ่าน Admin ไม่ถูกต้อง');
      return;
    }
    const success = deleteSupplierReturn(voucher.id, true);
    if (success) {
      setStockInToast(`🔄 ยกเลิกใบส่งคืน ${voucher.id} สำเร็จ! ดึงสต็อกกลับเข้าคลังเรียบร้อยแล้ว`);
      if (viewingReturnVoucher?.id === voucher.id) {
        setViewingReturnVoucher(null);
      }
    }
  };

  const handleReturnSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 12 * 1024 * 1024) {
        alert('ไฟล์มีขนาดเกิน 12MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        const rawBase64 = evt.target?.result as string;
        const img = new Image();
        img.src = rawBase64;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
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
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setReturnSlipUrl(compressed);
        };
        img.onerror = () => {
          setReturnSlipUrl(rawBase64);
        };
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Modal States
  const [isStockInModalOpen, setIsStockInModalOpen] = useState<boolean>(false);
  const [isQRScannerStockInOpen, setIsQRScannerStockInOpen] = useState<boolean>(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState<boolean>(false);
  const [viewingSettlementVoucher, setViewingSettlementVoucher] = useState<SupplierSettlement | null>(null);

  // Delete Stock Movement State & Admin Passcode Confirmation
  const [movementToDelete, setMovementToDelete] = useState<StockMovement | null>(null);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [showAdminPin, setShowAdminPin] = useState<boolean>(false);
  const [revertStockOnDelete, setRevertStockOnDelete] = useState<boolean>(true);

  // Cancel Supplier Settlement State & Admin Passcode Confirmation
  const [settlementToCancel, setSettlementToCancel] = useState<SupplierSettlement | null>(null);
  const [cancelAdminPin, setCancelAdminPin] = useState<string>('');
  const [cancelPinError, setCancelPinError] = useState<string>('');
  const [showCancelPin, setShowCancelPin] = useState<boolean>(false);

  // Default Known Suppliers
  const SUPPLIER_PRESETS = [
    'โรงงานอาบายะห์ดูไบ',
    'ซัพพลายเออร์น้ำหอมดูไบ',
    'ร้านฝากขาย A (Consignment A)',
    'ร้านฝากขาย B (Consignment B)',
    'โรงงานตัดเย็บเดรสอาหรับ UAE',
  ];

  // Dynamic Supplier Options (Persisted in localStorage)
  const [supplierOptions, setSupplierOptions] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('huda_custom_suppliers');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return Array.from(new Set([...SUPPLIER_PRESETS, ...parsed]));
          }
        }
      } catch (e) {
        console.error('Failed to load custom suppliers:', e);
      }
    }
    return SUPPLIER_PRESETS;
  });

  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState<boolean>(false);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);

  const saveSupplierOptions = (newList: string[]) => {
    const cleaned = Array.from(new Set(newList.map((s) => s.trim()).filter(Boolean)));
    setSupplierOptions(cleaned);
    saveCustomOption('suppliers', cleaned);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('huda_custom_suppliers', JSON.stringify(cleaned));
      } catch (e) {
        console.error('Failed to save custom suppliers:', e);
      }
    }
  };

  const handleAddNewSupplier = (rawName: string) => {
    const trimmed = rawName.trim();
    if (!trimmed) return;
    const existing = supplierOptions.find((s) => s.toLowerCase() === trimmed.toLowerCase());
    if (!existing) {
      const updated = [trimmed, ...supplierOptions];
      saveSupplierOptions(updated);
    }
    setStockInSupplierName(trimmed);
    setIsSupplierDropdownOpen(false);
  };

  const handleDeleteSupplier = (supplierToDelete: string) => {
    if (confirm(`คุณต้องการลบ "${supplierToDelete}" ออกจากรายการตัวเลือก Supplier ใช่หรือไม่?`)) {
      const updated = supplierOptions.filter((s) => s !== supplierToDelete);
      saveSupplierOptions(updated);
      if (stockInSupplierName === supplierToDelete) {
        setStockInSupplierName(updated[0] || '');
      }
    }
  };

  // Default Known Notes / DO numbers
  const DEFAULT_NOTE_PRESETS = [
    '00001/69',
    'รับสินค้าล็อตแรก / เปิดร้าน',
    'รับสินค้าล็อตทดลอง',
    'ล็อตสั่งตัดพิเศษ UAE',
    'รับเติมสต๊อกขายดีหน้าร้าน',
  ];

  // Dynamic Note Options (Persisted in localStorage)
  const [noteOptions, setNoteOptions] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('huda_custom_stock_in_notes');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return Array.from(new Set([...DEFAULT_NOTE_PRESETS, ...parsed]));
          }
        }
      } catch (e) {
        console.error('Failed to load custom notes:', e);
      }
    }
    return DEFAULT_NOTE_PRESETS;
  });

  const [isNoteDropdownOpen, setIsNoteDropdownOpen] = useState<boolean>(false);
  const noteDropdownRef = useRef<HTMLDivElement>(null);

  const saveNoteOptions = (newList: string[]) => {
    const cleaned = Array.from(new Set(newList.map((s) => s.trim()).filter(Boolean)));
    setNoteOptions(cleaned);
    saveCustomOption('stockInNotes', cleaned);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('huda_custom_stock_in_notes', JSON.stringify(cleaned));
      } catch (e) {
        console.error('Failed to save custom notes:', e);
      }
    }
  };

  const handleAddNewNote = (rawNote: string) => {
    const trimmed = rawNote.trim();
    if (!trimmed) return;
    const existing = noteOptions.find((s) => s.toLowerCase() === trimmed.toLowerCase());
    if (!existing) {
      const updated = [trimmed, ...noteOptions];
      saveNoteOptions(updated);
    }
    setStockInNote(trimmed);
    setIsNoteDropdownOpen(false);
  };

  const handleDeleteNote = (noteToDelete: string) => {
    if (confirm(`คุณต้องการลบ "${noteToDelete}" ออกจากรายการตัวเลือกหมายเหตุใช่หรือไม่?`)) {
      const updated = noteOptions.filter((s) => s !== noteToDelete);
      saveNoteOptions(updated);
      if (stockInNote === noteToDelete) {
        setStockInNote('');
    setStockInLotNumber('');
      }
    }
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(event.target as Node)) {
        setIsSupplierDropdownOpen(false);
      }
      if (noteDropdownRef.current && !noteDropdownRef.current.contains(event.target as Node)) {
        setIsNoteDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch freshest cloud sync on mount for instant multi-device alignment
  useEffect(() => {
    if (forceRealtimeSync) {
      forceRealtimeSync(false, false).catch(() => {});
    }
  }, [forceRealtimeSync]);

  // Stock In Form State
  const [stockInProductId, setStockInProductId] = useState<string>('');
  const [stockInVariantId, setStockInVariantId] = useState<string>('');
  const [stockInQty, setStockInQty] = useState<number | ''>('');
  const [stockInCostPrice, setStockInCostPrice] = useState<number | ''>('');
  const [stockInSupplierName, setStockInSupplierName] = useState<string>('โรงงานอาบายะห์ดูไบ');
  const [stockInNote, setStockInNote] = useState<string>('');
  const [stockInLotNumber, setStockInLotNumber] = useState<string>('HUDA-001-1-69');

  // Settlement Form & Selection State
  const [settleSupplierName, setSettleSupplierName] = useState<string>('');
  const [selectedMovementIds, setSelectedMovementIds] = useState<string[]>([]);
  const [settlementPaymentRef, setSettlementPaymentRef] = useState<string>('');
  const [settlementNote, setSettlementNote] = useState<string>('');
  const [settlementSlipImage, setSettlementSlipImage] = useState<string>('');
  const slipFileInputRef = useRef<HTMLInputElement>(null);
  const [previewSlipModalUrl, setPreviewSlipModalUrl] = useState<string | null>(null);

  // Client-side image compression and reader for payment slips
  const handleSlipFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 12 * 1024 * 1024) {
        alert('ไฟล์รูปภาพมีขนาดใหญ่เกิน 12MB กรุณาเลือกไฟล์ที่มีขนาดเล็กลงครับ');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawBase64 = event.target?.result as string;
        const img = new Image();
        img.src = rawBase64;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
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
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setSettlementSlipImage(compressed);
        };
        img.onerror = () => {
          setSettlementSlipImage(rawBase64);
        };
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Derive Unsettled Sold Movements (Stock OUT items that are not yet settled)
  const unsettledMovements = stockMovements.filter((m) => m.type === 'OUT' && !m.isSettled);

  // Auto-select all unsettled movements initially
  useEffect(() => {
    const unsettledIds = unsettledMovements.map((m) => m.id);
    setSelectedMovementIds(unsettledIds);
  }, [stockMovements]);

  // Non-blocking toast state for instant stock in feedback
  const [stockInToast, setStockInToast] = useState<string | null>(null);

  // QR Code & Barcode Scan Handler for Stock IN
  const handleStockInQRScan = (decodedText: string) => {
    const match = resolveScannedProduct(decodedText, products);
    if (match) {
      soundFx.playSuccess();
      setStockInProductId(match.product.id);
      setStockInVariantId(match.variant.id);
      setStockInCostPrice(
        match.variant.costPrice !== undefined && match.variant.costPrice > 0
          ? match.variant.costPrice
          : Math.round(match.variant.price * 0.5)
      );
      if (match.product.category === 'perfume' || match.product.category === 'incense') {
        setStockInSupplierName('ซัพพลายเออร์น้ำหอมดูไบ');
      } else {
        setStockInSupplierName('โรงงานอาบายะห์ดูไบ');
      }
      if (match.lotNumber) {
        setStockInLotNumber(generateStandardHudaLot(match.product.title, match.product.id, match.lotNumber));
      } else {
        setStockInLotNumber(generateStandardHudaLot(match.product.title, match.product.id, '1-69'));
      }
      setStockInQty(1);
      setIsQRScannerStockInOpen(false);
      setIsStockInModalOpen(true);
      setStockInToast(`🎯 สแกนพบ "${match.product.title} (${match.variant.name})" กรุณาระบุจำนวนเพื่อรับเข้าสต๊อก`);
    } else {
      soundFx.playDelete();
      alert(`ไม่พบสินค้าที่ตรงกับรหัส QR / บาร์โค้ด: "${decodedText}"`);
    }
  };

  // Barcode Gun Listener (USB / Bluetooth Barcode Scanners)
  const barcodeBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      if (e.key === 'Enter') {
        const scanned = barcodeBufferRef.current.trim();
        barcodeBufferRef.current = '';
        if (scanned.length >= 3) {
          const match = resolveScannedProduct(scanned, products);
          if (match) {
            if (isReturnModalOpen || isQRScannerReturnOpen) {
              e.preventDefault();
              handleReturnQRScan(scanned);
              return;
            }
            e.preventDefault();
            soundFx.playSuccess();
            setStockInProductId(match.product.id);
            setStockInVariantId(match.variant.id);
            setStockInCostPrice(
              match.variant.costPrice !== undefined && match.variant.costPrice > 0
                ? match.variant.costPrice
                : Math.round(match.variant.price * 0.5)
            );
            if (match.product.category === 'perfume' || match.product.category === 'incense') {
              setStockInSupplierName('ซัพพลายเออร์น้ำหอมดูไบ');
            } else {
              setStockInSupplierName('โรงงานอาบายะห์ดูไบ');
            }
            if (match.lotNumber) {
              setStockInLotNumber(generateStandardHudaLot(match.product.title, match.product.id, match.lotNumber));
            } else {
              setStockInLotNumber(generateStandardHudaLot(match.product.title, match.product.id, '1-69'));
            }
            setStockInQty(1);
            setIsStockInModalOpen(true);
            setStockInToast(`🎯 เครื่องยิงบาร์โค้ดสแกนพบ "${match.product.title} (${match.variant.name})" ระบุจำนวนแล้วกดยืนยันได้ทันที`);
          }
        }
        return;
      }

      if (e.key.length === 1) {
        if (timeDiff > 80 && !isInput) {
          barcodeBufferRef.current = e.key;
        } else if (timeDiff <= 80) {
          barcodeBufferRef.current += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  // Auto-listen and pick up pending Stock IN requests from AdminProductManager
  useEffect(() => {
    const applyStockInData = (data: { productId?: string; variantId?: string; costPrice?: number }) => {
      if (data.productId) {
        setStockInProductId(data.productId);
        const pMatched = products.find((p) => p.id === data.productId);
        if (pMatched) {
          setStockInLotNumber(generateStandardHudaLot(pMatched.title, pMatched.id, '1-69'));
        }
        const prod = products.find((p) => p.id === data.productId);
        if (prod) {
          if (prod.category === 'perfume' || prod.category === 'incense') {
            setStockInSupplierName('ซัพพลายเออร์น้ำหอมดูไบ');
          } else {
            setStockInSupplierName('โรงงานอาบายะห์ดูไบ');
          }
          if (data.variantId && prod.variants.some((v) => v.id === data.variantId)) {
            setStockInVariantId(data.variantId);
            const targetV = prod.variants.find((v) => v.id === data.variantId);
            if (targetV && (data.costPrice === undefined || data.costPrice === 0)) {
              setStockInCostPrice(targetV.costPrice ? targetV.costPrice : '');
            } else if (data.costPrice !== undefined) {
              setStockInCostPrice(data.costPrice > 0 ? data.costPrice : '');
            }
          } else if (prod.variants.length > 0) {
            setStockInVariantId(prod.variants[0].id);
            setStockInCostPrice(prod.variants[0].costPrice ? prod.variants[0].costPrice : '');
          }
        }
      } else if (data.costPrice !== undefined) {
        setStockInCostPrice(data.costPrice > 0 ? data.costPrice : '');
      }
      setStockInQty('');
      setIsStockInModalOpen(true);
    };

    // Check sessionStorage
    try {
      const pendingStr = sessionStorage.getItem('huda_pending_stock_in');
      if (pendingStr) {
        const parsed = JSON.parse(pendingStr);
        if (parsed && Date.now() - (parsed.timestamp || 0) < 120000) {
          applyStockInData(parsed);
        }
        sessionStorage.removeItem('huda_pending_stock_in');
      }
    } catch (err) {
      console.error('Failed reading pending stock in:', err);
    }

    const handleStockInEvent = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail) {
        applyStockInData(detail);
      } else {
        setStockInQty('');
        setStockInCostPrice('');
        setIsStockInModalOpen(true);
      }
    };

    window.addEventListener('switch_admin_tab_suppliers_stock_in', handleStockInEvent);
    return () => {
      window.removeEventListener('switch_admin_tab_suppliers_stock_in', handleStockInEvent);
    };
  }, [products]);

  // Unique list of suppliers found in movements and custom options
  const allSuppliers = Array.from(
    new Set([...supplierOptions, ...stockMovements.map((m) => m.supplierName).filter(Boolean)])
  );

  // Filtered Unsettled Movements based on selected Supplier & Search
  const filteredUnsettledMovements = unsettledMovements.filter((m) => {
    const matchesSupplier = selectedSupplierFilter === 'all' || m.supplierName === selectedSupplierFilter;
    const matchesSearch =
      !movementSearchQuery ||
      m.productTitle.toLowerCase().includes(movementSearchQuery.toLowerCase()) ||
      m.variantName.toLowerCase().includes(movementSearchQuery.toLowerCase()) ||
      (m.referenceOrderNo && m.referenceOrderNo.toLowerCase().includes(movementSearchQuery.toLowerCase())) ||
      (m.lotNumber && m.lotNumber.toLowerCase().includes(movementSearchQuery.toLowerCase()));
    return matchesSupplier && matchesSearch;
  });

  // Calculate Overall Metrics
  const totalUnsettledCost = unsettledMovements.reduce((sum, m) => sum + m.totalCost, 0);
  const totalUnsettledItems = unsettledMovements.reduce((sum, m) => sum + m.quantity, 0);

  // Group Unsettled Costs by Supplier
  const supplierSummaryMap = unsettledMovements.reduce((acc, m) => {
    const sName = m.supplierName || 'ไม่ระบุ Supplier';
    if (!acc[sName]) {
      acc[sName] = { supplierName: sName, totalCost: 0, itemsCount: 0, movements: [] as StockMovement[] };
    }
    acc[sName].totalCost += m.totalCost;
    acc[sName].itemsCount += m.quantity;
    acc[sName].movements.push(m);
    return acc;
  }, {} as Record<string, { supplierName: string; totalCost: number; itemsCount: number; movements: StockMovement[] }>);

  const supplierSummaries = Object.values(supplierSummaryMap);

  // Toggle single item selection
  const toggleMovementId = (id: string) => {
    setSelectedMovementIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle select all items for a supplier
  const selectAllForSupplier = (supplierName: string) => {
    const supplierItemIds = unsettledMovements
      .filter((m) => m.supplierName === supplierName)
      .map((m) => m.id);
    setSelectedMovementIds((prev) => Array.from(new Set([...prev, ...supplierItemIds])));
  };

  // Deselect all items for a supplier
  const deselectAllForSupplier = (supplierName: string) => {
    const supplierItemIds = new Set(
      unsettledMovements.filter((m) => m.supplierName === supplierName).map((m) => m.id)
    );
    setSelectedMovementIds((prev) => prev.filter((id) => !supplierItemIds.has(id)));
  };

  // Open Settlement Modal for a specific Supplier
  const handleOpenSettlementModal = (supplierName: string) => {
    const supplierMovements = unsettledMovements.filter((m) => m.supplierName === supplierName);
    const selectedCount = supplierMovements.filter((m) => selectedMovementIds.includes(m.id)).length;
    
    // If no items are selected for this supplier, select all items for this supplier by default
    if (selectedCount === 0) {
      selectAllForSupplier(supplierName);
    }

    setSettleSupplierName(supplierName);
    setSettlementPaymentRef('โอนเงินผ่านแอปธนาคาร / PromptPay');
    setSettlementNote(`เคลียร์ยอดต้นทุนสินค้าประจำรอบ ${new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}`);
    setSettlementSlipImage('');
    setIsSettlementModalOpen(true);
  };

  // Submit Settlement Action
  const handleConfirmSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    const activeSupplierMovements = unsettledMovements.filter(
      (m) => m.supplierName === settleSupplierName && selectedMovementIds.includes(m.id)
    );

    if (activeSupplierMovements.length === 0) {
      alert('กรุณาเลือกรายการสินค้าที่ต้องการเคลียร์อย่างน้อย 1 รายการครับ');
      return;
    }

    const nowIso = new Date().toISOString();
    const newSettlement = createSupplierSettlement({
      supplierName: settleSupplierName,
      periodStart: nowIso,
      periodEnd: nowIso,
      movementIds: activeSupplierMovements.map((m) => m.id),
      paymentRef: settlementPaymentRef,
      note: settlementNote,
      slipImageUrl: settlementSlipImage || undefined,
    });

    setIsSettlementModalOpen(false);
    setViewingSettlementVoucher(newSettlement);
    alert(`เคลียร์ยอดจ่ายให้ "${settleSupplierName}" จำนวน ${activeSupplierMovements.length} รายการ เรียบร้อยแล้ว!`);
  };

  // Filtered Suppliers for Stock IN dropdown
  const filteredSuppliers = supplierOptions.filter((s) =>
    s.toLowerCase().includes(stockInSupplierName.trim().toLowerCase())
  );

  const isTypedSupplierNew =
    stockInSupplierName.trim().length > 0 &&
    !supplierOptions.some((s) => s.toLowerCase() === stockInSupplierName.trim().toLowerCase());

  // Filtered Notes / DO numbers for Stock IN dropdown
  const filteredNotes = noteOptions.filter((s) =>
    s.toLowerCase().includes(stockInNote.trim().toLowerCase())
  );

  const isTypedNoteNew =
    stockInNote.trim().length > 0 &&
    !noteOptions.some((s) => s.toLowerCase() === stockInNote.trim().toLowerCase());

  // Handle Submit Stock IN Form
  const handleSaveStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInProductId || !stockInVariantId) {
      alert('กรุณาเลือกสินค้าและไซส์/ตัวเลือกสินค้าก่อนครับ');
      return;
    }

    const finalQty = typeof stockInQty === 'number' ? stockInQty : parseInt(stockInQty, 10);
    if (!finalQty || isNaN(finalQty) || finalQty <= 0) {
      alert('กรุณาระบุจำนวนสินค้าเข้าที่ถูกต้อง (ต้องมากกว่า 0 ชิ้น) ครับ');
      return;
    }

    const trimmedSupplier = stockInSupplierName.trim();
    if (!trimmedSupplier) {
      alert('กรุณาระบุชื่อ Supplier / โรงงานที่รับมาครับ');
      return;
    }

    // Auto-save new supplier to dropdown list for future use
    handleAddNewSupplier(trimmedSupplier);

    // Auto-save note / DO to dropdown list for future use if provided
    const trimmedNote = stockInNote.trim();
    if (trimmedNote) {
      handleAddNewNote(trimmedNote);
    }

    const finalCost = typeof stockInCostPrice === 'number' ? stockInCostPrice : (parseInt(stockInCostPrice, 10) || 0);

    recordStockIn({
      productId: stockInProductId,
      variantId: stockInVariantId,
      quantity: finalQty,
      costPrice: finalCost,
      supplierName: trimmedSupplier,
      note: trimmedNote,
      lotNumber: stockInLotNumber.trim(),
    });

    setIsStockInModalOpen(false);
    setStockInProductId('');
    setStockInVariantId('');
    setStockInQty('');
    setStockInCostPrice('');
    setStockInNote('');
    setStockInLotNumber('');

    // Return to previous tab and exact position if originated from product screen
    let returnData: any = null;
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('huda_stock_in_return_state');
      if (saved) {
        try {
          returnData = JSON.parse(saved);
          sessionStorage.removeItem('huda_stock_in_return_state');
        } catch (e) {}
      }
    }

    setStockInToast(`บันทึกรับสินค้าเข้าสต๊อก (+${finalQty} ชิ้น) เรียบร้อยแล้ว! สต๊อกในระบบอัปเดตทันที`);
    setTimeout(() => {
      setStockInToast(null);
    }, 4000);

    if (returnData && returnData.tab) {
      window.dispatchEvent(new CustomEvent('switch_admin_tab_products', { detail: returnData }));
    }
  };

  const handleCloseStockInModal = () => {
    setIsStockInModalOpen(false);
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('huda_stock_in_return_state');
      if (saved) {
        try {
          const returnData = JSON.parse(saved);
          sessionStorage.removeItem('huda_stock_in_return_state');
          if (returnData && returnData.tab) {
            window.dispatchEvent(new CustomEvent('switch_admin_tab_products', { detail: returnData }));
          }
        } catch (e) {}
      }
    }
  };

  // Open Admin Passcode Confirmation for Deleting Movement
  const handleRequestDeleteMovement = (m: StockMovement) => {
    setMovementToDelete(m);
    setAdminPinInput('');
    setPinError('');
    setShowAdminPin(false);
    setRevertStockOnDelete(true);
  };

  // Confirm Deletion with Admin Passcode Verification
  const handleConfirmDeleteMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementToDelete) return;

    const trimmedPin = adminPinInput.trim();
    if (!trimmedPin) {
      setPinError('กรุณากรอกรหัสผ่าน Admin เพื่อยืนยันการลบ');
      return;
    }

    const isValid = verifyAdminPasscode(trimmedPin);
    if (!isValid) {
      setPinError('รหัสผ่าน Admin ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      return;
    }

    const deletedItem = movementToDelete;
    deleteStockMovement(deletedItem.id, revertStockOnDelete);
    setSelectedMovementIds((prev) => prev.filter((id) => id !== deletedItem.id));
    setUndoDeleteToast({
      id: deletedItem.id,
      title: `${deletedItem.productTitle} (${deletedItem.variantName})`,
      qty: deletedItem.quantity,
      type: deletedItem.type,
    });
    setMovementToDelete(null);
    setAdminPinInput('');
    setPinError('');
  };

  // Open Admin Passcode Confirmation for Canceling Settlement
  const handleRequestCancelSettlement = (s: SupplierSettlement) => {
    setSettlementToCancel(s);
    setCancelAdminPin('');
    setCancelPinError('');
    setShowCancelPin(false);
  };

  // Confirm Cancelling Settlement with Admin Passcode Verification
  const handleConfirmCancelSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementToCancel) return;

    const trimmedPin = cancelAdminPin.trim();
    if (!trimmedPin) {
      setCancelPinError('กรุณากรอกรหัสผ่าน Admin เพื่อยืนยันการยกเลิก');
      return;
    }

    const isValid = verifyAdminPasscode(trimmedPin);
    if (!isValid) {
      setCancelPinError('รหัสผ่าน Admin ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      return;
    }

    const target = settlementToCancel;
    const ok = cancelSupplierSettlement(target.id);
    if (ok) {
      alert(`ยกเลิกการเคลียร์ยอด "${target.id}" เรียบร้อยแล้ว!\nรายการสินค้าทั้งหมด ${target.totalItemsCount} ชิ้น ถูกส่งกลับไปอยู่ในสถานะ "รอเคลียร์ยอด (Unsettled)" เรียบร้อยแล้วครับ`);
    } else {
      alert(`เกิดข้อผิดพลาด ไม่พบรายการเคลียร์ยอด "${target.id}"`);
    }
    setSettlementToCancel(null);
    setCancelAdminPin('');
    setCancelPinError('');
  };

  return (
    <div className="space-y-6 text-xs text-stone-950">
      
      {/* Module Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-amber-400/60 shadow-xl text-stone-950">
        <div>
          <h3 className="font-serif font-black text-lg text-stone-950 flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-600" />
            <span>ระบบสินค้าเข้า-ออก &amp; เคลียร์ยอด Supplier (Consignment Payout Engine)</span>
          </h3>
          <p className="text-xs text-stone-800 font-extrabold mt-1">
            เลือกเคลียร์ยอดจ่ายให้ Supplier ได้อิสระ รายการไหนเก็บไว้เคลียร์รอบหน้าสามารถติ๊กเลือกได้ 100%
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={async () => {
              await forceRealtimeSync(true, true);
            }}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 border border-stone-300 cursor-pointer"
            title="กดเพื่อดึงและอัปเดตข้อมูลล่าสุดแบบเรียลไทม์ทันที"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-amber-600' : 'text-stone-700'}`} />
            <span>{syncStatus === 'syncing' ? 'กำลังซิงค์...' : '🔄 อัปเดตข้อมูลล่าสุด'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsQRScannerStockInOpen(true)}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 border border-amber-600 cursor-pointer"
            title="เปิดกล้องสแกน QR Code หรือ บาร์โค้ด สินค้าเพื่อบันทึกรับเข้าสต๊อกทันที"
          >
            <QrCode className="w-4 h-4 text-stone-950" />
            <span>📸 สแกน QR / บาร์โค้ด รับเข้า</span>
          </button>

          <button
            onClick={() => {
              setStockInQty('');
              setStockInCostPrice('');
              setIsStockInModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 border border-emerald-700 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ บันทึกรับสินค้าเข้า (Stock IN)</span>
          </button>

          <button
            type="button"
            onClick={handleOpenReturnModal}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 border border-rose-700 cursor-pointer"
            title="บันทึกส่งคืนสินค้ากลับให้ซัพพลายเออร์ ตัดสต็อกอัตโนมัติ พร้อมออกใบส่งคืนสินค้า"
          >
            <ArrowUpRight className="w-4 h-4 text-white" />
            <span>📦 + บันทึกส่งคืน Supplier (Return)</span>
          </button>
        </div>
      </div>

      {/* Instant Success Toast Notification */}
      {stockInToast && (
        <div className="bg-emerald-500 text-white p-3.5 rounded-2xl shadow-lg border-2 border-emerald-600 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black">
            <CheckCircle2 className="w-5 h-5 text-emerald-100 shrink-0" />
            <span>{stockInToast}</span>
          </div>
          <button
            onClick={() => setStockInToast(null)}
            className="text-white/80 hover:text-white text-xs font-black px-2 py-1 rounded-lg hover:bg-emerald-600 cursor-pointer transition"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Undo Delete Toast Notification */}
      {undoDeleteToast && (
        <div className="bg-stone-900 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-amber-500 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            <Trash2 className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              ลบรายการ <strong className="text-amber-300 font-black">"{undoDeleteToast.title}"</strong> เรียบร้อยแล้ว (เก็บไว้ในถังขยะ)
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                restoreStockMovement(undoDeleteToast.id);
                setUndoDeleteToast(null);
                setStockInToast(`♻️ กู้คืนรายการ "${undoDeleteToast.title}" สำเร็จ ข้อมูลกลับมาเรียบร้อยแล้ว!`);
              }}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>↩️ กู้คืนรายการนี้ทันที (Undo)</span>
            </button>
            <button
              onClick={() => setUndoDeleteToast(null)}
              className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-stone-800 cursor-pointer transition"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Unsettled Cost */}
        <div className="bg-white border-2 border-amber-400/80 p-4 rounded-2xl shadow-md space-y-1 text-stone-950">
          <span className="text-xs font-black text-stone-900 block flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-amber-700" />
            <span>ยอดค้างเคลียร์ Supplier รวม</span>
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-black text-amber-900 tracking-tight">
            ฿{totalUnsettledCost.toLocaleString()}
          </div>
          <span className="text-[11px] text-stone-700 block font-black">
            ต้นทุนสินค้าที่ขายแล้ว รอเลือกเคลียร์รอบจ่ายเงิน
          </span>
        </div>

        {/* Card 2: Unsettled Items Count */}
        <div className="bg-white border-2 border-emerald-500 p-4 rounded-2xl shadow-md space-y-1 text-stone-950">
          <span className="text-xs font-black text-emerald-900 block flex items-center gap-1">
            <PackageCheck className="w-4 h-4 text-emerald-700" />
            <span>จำนวนสินค้าค้างเคลียร์</span>
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-black text-emerald-800 tracking-tight">
            {totalUnsettledItems.toLocaleString()} <span className="text-sm font-sans font-black text-stone-800">ชิ้น</span>
          </div>
          <span className="text-[11px] text-emerald-900 block font-black">
            สินค้าที่จำหน่ายออกแล้ว สะสมในระบบ
          </span>
        </div>

        {/* Card 3: Supplier Count */}
        <div className="bg-white border-2 border-amber-400/80 p-4 rounded-2xl shadow-md space-y-1 text-stone-950">
          <span className="text-xs font-black text-stone-900 block flex items-center gap-1">
            <Truck className="w-4 h-4 text-amber-700" />
            <span>จำนวน Supplier ในระบบ</span>
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-black text-stone-950 tracking-tight">
            {allSuppliers.length} <span className="text-sm font-sans font-black text-stone-800">ราย</span>
          </div>
          <span className="text-[11px] text-stone-700 block font-black">
            มี {supplierSummaries.length} รายที่มียอดรอเคลียร์ในขณะนี้
          </span>
        </div>
      </div>

      {/* Sub-Tab Navigation Header */}
      <div className="flex items-center gap-2 border-b-2 border-amber-400/40 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'logs'
              ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
              : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
          }`}
        >
          <PackageCheck className="w-4 h-4 text-stone-950" />
          <span>📦 บันทึก &amp; ประวัติสินค้าเข้า-ออก ({stockMovements.length} รายการ)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('returns')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'returns'
              ? 'bg-rose-500 text-white border-2 border-rose-600 shadow-md'
              : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
          }`}
        >
          <ArrowUpRight className={`w-4 h-4 ${activeSubTab === 'returns' ? 'text-white' : 'text-rose-600'}`} />
          <span>📦 ประวัติส่งคืน Supplier ({supplierReturnVouchers?.length || 0} ใบ)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('payouts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'payouts'
              ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
              : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
          }`}
        >
          <DollarSign className="w-4 h-4 text-stone-950" />
          <span>💰 เคลียร์ยอด Supplier ({supplierSummaries.length} รายรอเคลียร์)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
              : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
          }`}
        >
          <FileText className="w-4 h-4 text-stone-950" />
          <span>📜 ประวัติเคลียร์ยอด &amp; ใบสรุป ({supplierSettlements.length} รอบ)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('trash')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'trash'
              ? 'bg-rose-500 text-white border-2 border-rose-600 shadow-md'
              : 'bg-white text-stone-950 hover:bg-rose-50 border-2 border-stone-300'
          }`}
        >
          <Trash2 className={`w-4 h-4 ${activeSubTab === 'trash' ? 'text-white' : 'text-rose-600'}`} />
          <span>🗑️ ถังขยะ / กู้คืนรายการ ({trashedStockMovements.length} รายการ)</span>
        </button>
      </div>

      {/* TAB 1: SUPPLIER PAYOUTS SUMMARY & BATCH SETTLEMENT */}
      {activeSubTab === 'payouts' && (
        <div className="space-y-6">
          
          {/* Supplier Cards List */}
          {supplierSummaries.length === 0 ? (
            <div className="bg-white border-2 border-amber-400/60 p-12 rounded-2xl text-center space-y-3 shadow-xl text-stone-950">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="font-serif font-black text-lg text-amber-950">
                ไม่มีรายการค้างเคลียร์เงิน Supplier ในขณะนี้!
              </h4>
              <p className="text-xs text-stone-800 font-extrabold max-w-md mx-auto">
                ยอดขายต้นทุนสินค้าทั้งหมดได้รับเคลียร์เรียบร้อยแล้ว หากมีการขายสินค้าออกผ่านระบบ POS หรือออเดอร์ใหม่ ยอดจะขึ้นแสดงที่นี่โดยอัตโนมัติ
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {supplierSummaries.map((summary) => {
                const supplierMovements = summary.movements;
                const checkedMovements = supplierMovements.filter((m) => selectedMovementIds.includes(m.id));
                const checkedCost = checkedMovements.reduce((sum, m) => sum + m.totalCost, 0);
                const checkedCount = checkedMovements.reduce((sum, m) => sum + m.quantity, 0);
                const isAllSelected = supplierMovements.every((m) => selectedMovementIds.includes(m.id));

                return (
                  <div
                    key={summary.supplierName}
                    className="bg-white border-2 border-amber-400/60 rounded-2xl p-5 shadow-xl space-y-4 text-stone-950"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-3">
                      <div>
                        <span className="text-[10px] font-black text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-400 uppercase tracking-wider">
                          Supplier / ซัพพลายเออร์
                        </span>
                        <h4 className="font-serif font-black text-lg text-stone-950 mt-1">
                          {summary.supplierName}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleOpenSettlementModal(summary.supplierName)}
                        disabled={checkedMovements.length === 0}
                        className={`px-4 py-2.5 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0 transition cursor-pointer border ${
                          checkedMovements.length > 0
                            ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 border-amber-500'
                            : 'bg-stone-200 text-stone-500 border-stone-300 cursor-not-allowed'
                        }`}
                      >
                        <DollarSign className="w-4 h-4 text-stone-950" />
                        <span>เคลียร์จ่ายเงินรอบนี้ ({checkedMovements.length} รายการ)</span>
                      </button>
                    </div>

                    {/* Cost Snapshot Box */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-300 space-y-0.5">
                        <span className="text-stone-700 block text-[10px] font-black">จำนวนชิ้นค้างเคลียร์รวม</span>
                        <span className="text-stone-950 font-black text-base font-serif">
                          {summary.itemsCount} ชิ้น <span className="text-[11px] text-emerald-800 font-sans">(เลือก {checkedCount} ชิ้น)</span>
                        </span>
                      </div>

                      <div className="bg-amber-50 p-3 rounded-xl border-2 border-amber-400 space-y-0.5">
                        <span className="text-amber-950 block text-[10px] font-black">ยอดต้นทุนเลือกเคลียร์รอบนี้</span>
                        <span className="text-amber-900 font-black text-base font-serif">
                          ฿{checkedCost.toLocaleString()} <span className="text-[10px] text-stone-600 font-sans font-bold">(จาก ฿{summary.totalCost.toLocaleString()})</span>
                        </span>
                      </div>
                    </div>

                    {/* Pending Lots Row */}
                    {(() => {
                      const lots = Array.from(new Set(supplierMovements.filter((m) => m.lotNumber).map((m) => m.lotNumber)));
                      if (lots.length === 0) return null;
                      return (
                        <div className="flex items-center gap-1.5 text-[10px] bg-amber-50/70 p-2 rounded-xl border border-amber-300/80 flex-wrap">
                          <span className="font-black text-stone-900">เลขล็อต (Lot / Batch):</span>
                          {lots.map((lot) => (
                            <span key={lot} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-stone-950 border border-amber-400 rounded text-[9px] font-mono font-black shadow-2xs">
                              🏷️ {lot}
                            </span>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Interactive Items Checklist with Toggle Buttons */}
                    <div className="space-y-2 pt-2 border-t border-stone-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-stone-950 font-black flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>เลือกรายการสินค้าที่จะเคลียร์จ่ายรอบนี้ ({checkedMovements.length}/{supplierMovements.length} รายการ):</span>
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => isAllSelected ? deselectAllForSupplier(summary.supplierName) : selectAllForSupplier(summary.supplierName)}
                            className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-950 border border-amber-400 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1"
                          >
                            {isAllSelected ? <Square className="w-3 h-3 text-stone-600" /> : <CheckSquare className="w-3 h-3 text-amber-700" />}
                            <span>{isAllSelected ? 'ปลดเลือกทั้งหมด' : 'เลือกทั้งหมด'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Items List with Checkboxes */}
                      <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 no-scrollbar border border-stone-200 p-2 rounded-xl bg-stone-50/60">
                        {supplierMovements.map((m) => {
                          const isChecked = selectedMovementIds.includes(m.id);
                          return (
                            <div
                              key={m.id}
                              onClick={() => toggleMovementId(m.id)}
                              className={`flex items-center justify-between text-[11px] p-2.5 rounded-xl border transition cursor-pointer select-none ${
                                isChecked
                                  ? 'bg-amber-100/70 border-amber-500 text-stone-950 font-black shadow-xs'
                                  : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate max-w-[260px]">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                  isChecked ? 'bg-amber-400 border-amber-600 text-stone-950' : 'bg-white border-stone-400'
                                }`}>
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <div className="truncate">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-stone-950 font-black block truncate">{m.productTitle}</span>
                                    {m.lotNumber && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] bg-amber-200 text-stone-950 border border-amber-400 font-mono font-black shadow-2xs">
                                        🏷️ {m.lotNumber}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-stone-700 text-[10px] font-bold">
                                    {m.variantName} {m.referenceOrderNo ? `( Order: ${m.referenceOrderNo} )` : '( POS หน้าร้าน )'}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-amber-900 font-serif font-black block">฿{m.totalCost.toLocaleString()}</span>
                                <span className="text-stone-600 text-[10px] font-bold">{m.quantity} ชิ้น @ ฿{m.costPrice.toLocaleString()}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {supplierMovements.length > checkedMovements.length && (
                        <p className="text-[10px] text-amber-950 font-black bg-amber-100 p-1.5 rounded-lg border border-amber-300 text-center">
                          💡 มีอีก {supplierMovements.length - checkedMovements.length} รายการที่ปลดเลือก (จะถูกเก็บไว้เคลียร์รอบหน้า ไม่ถูกลบหรือสูญหาย)
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Unsettled Sold Items Detail Table */}
          <div className="bg-white border-2 border-amber-400/60 rounded-2xl p-5 space-y-4 shadow-xl text-stone-950">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
              <h4 className="font-serif font-black text-sm text-stone-950 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <span>ตารางรายละเอียดสินค้าขายออกรอเคลียร์ยอด (Unsettled Sales Breakdown)</span>
              </h4>

              {/* Filter Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อสินค้า/Order..."
                    value={movementSearchQuery}
                    onChange={(e) => setMovementSearchQuery(e.target.value)}
                    className="bg-white border-2 border-stone-400 rounded-xl px-3 py-1.5 text-xs text-stone-950 font-black pl-8 focus:outline-none focus:border-amber-500"
                  />
                  <Search className="w-3.5 h-3.5 text-amber-600 absolute left-2.5 top-2.5" />
                </div>

                <select
                  value={selectedSupplierFilter}
                  onChange={(e) => setSelectedSupplierFilter(e.target.value)}
                  className="bg-white border-2 border-amber-500 rounded-xl px-3 py-1.5 text-xs text-stone-950 font-black focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-white text-stone-950 font-bold">-- ทุก Supplier --</option>
                  {allSuppliers.map((s) => (
                    <option key={s} value={s} className="bg-white text-stone-950 font-bold">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile swipe hint banner */}
            <div className="sm:hidden bg-amber-500/10 border border-amber-300 rounded-xl px-3.5 py-2 mb-2 text-[11px] text-amber-950 font-bold flex items-center justify-between">
              <span>👉 เลื่อนหน้าจอซ้าย-ขวา เพื่อดูตารางและปุ่มเลือกเคลียร์เงินแบบเต็มเหมือนในคอม</span>
              <span className="text-[10px] text-stone-500 font-mono">9 คอลัมน์</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-xs text-left text-stone-950">
                <thead className="bg-amber-100 text-stone-950 font-serif border-b-2 border-amber-400 font-black">
                  <tr>
                    <th className="py-3 px-3 text-center font-black w-10">เลือก</th>
                    <th className="py-3 px-3 font-black">วันที่ขายออก</th>
                    <th className="py-3 px-3 font-black">เลขล็อต (Lot / Batch)</th>
                    <th className="py-3 px-3 font-black">ชื่อสินค้า / ไซส์</th>
                    <th className="py-3 px-3 font-black">Supplier / โรงงาน</th>
                    <th className="py-3 px-3 font-black text-center">จำนวนขาย</th>
                    <th className="py-3 px-3 font-black text-right">ต้นทุน/ชิ้น</th>
                    <th className="py-3 px-3 font-black text-right">ต้นทุนรวมค้างเคลียร์</th>
                    <th className="py-3 px-3 font-black text-center">สถานะการเลือก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredUnsettledMovements.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-stone-700 font-black">
                        ไม่พบรายการสินค้าขายออกที่ค้างเคลียร์ตามเงื่อนไขที่เลือก
                      </td>
                    </tr>
                  ) : (
                    filteredUnsettledMovements.map((m) => {
                      const isChecked = selectedMovementIds.includes(m.id);
                      return (
                        <tr
                          key={m.id}
                          onClick={() => toggleMovementId(m.id)}
                          className={`hover:bg-amber-50/60 transition cursor-pointer select-none ${
                            isChecked ? 'bg-amber-50/80 font-black' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center mx-auto ${
                              isChecked ? 'bg-amber-400 border-amber-600 text-stone-950' : 'bg-white border-stone-400'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-stone-800 font-bold whitespace-nowrap">
                            {formatThaiDateTime(m.createdAt)}
                          </td>
                          <td className="py-3 px-3 font-mono font-black text-stone-950">
                            {m.lotNumber ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-stone-950 border border-amber-300 text-[10px] font-black shadow-2xs">
                                🏷️ {m.lotNumber}
                              </span>
                            ) : (
                              <span className="text-stone-400 font-bold">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-black">
                            <span className="text-stone-950 block font-black">{m.productTitle}</span>
                            <span className="text-stone-700 text-[11px] font-bold">
                              {m.variantName} {m.referenceOrderNo ? `( Order: ${m.referenceOrderNo} )` : ''}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-black text-amber-950">{m.supplierName}</td>
                          <td className="py-3 px-3 text-center font-black text-emerald-800 font-mono text-sm">{m.quantity} ชิ้น</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-stone-800">฿{m.costPrice.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-serif font-black text-amber-900 text-sm">
                            ฿{m.totalCost.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                              isChecked
                                ? 'bg-amber-100 text-amber-950 border-amber-400'
                                : 'bg-stone-100 text-stone-600 border-stone-300'
                            }`}>
                              {isChecked ? '✓ เลือกเคลียร์รอบนี้' : '⏸ เก็บไว้รอบหน้า'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STOCK IN / OUT AUDIT LOG */}
      {activeSubTab === 'logs' && (
        <div className="bg-white border-2 border-amber-400/60 rounded-2xl p-5 space-y-4 shadow-xl text-stone-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
            <h4 className="font-serif font-black text-base text-stone-950 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-amber-600" />
              <span>ประวัติความเคลื่อนไหวสินค้าเข้า-ออกทั้งหมด (Stock Movement Audit Log)</span>
            </h4>

            {/* Log Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* ช่วงวันที่-เวลา: จาก ... ถึง ... */}
              <div className="flex items-center gap-1.5 bg-stone-50 border-2 border-stone-300 rounded-xl px-2.5 py-1.5 text-xs flex-wrap sm:flex-nowrap shadow-xs">
                <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-black text-stone-700 whitespace-nowrap">จาก:</span>
                  <input
                    type="datetime-local"
                    value={logStartDateTime}
                    onChange={(e) => setLogStartDateTime(e.target.value)}
                    className="bg-white border border-stone-300 rounded-lg px-2 py-0.5 text-stone-950 font-bold text-xs focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
                    title="เลือกวัน-เวลาเริ่มต้น"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-black text-stone-700 whitespace-nowrap">ถึง:</span>
                  <input
                    type="datetime-local"
                    value={logEndDateTime}
                    onChange={(e) => setLogEndDateTime(e.target.value)}
                    className="bg-white border border-stone-300 rounded-lg px-2 py-0.5 text-stone-950 font-bold text-xs focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
                    title="เลือกวัน-เวลาสิ้นสุด"
                  />
                </div>
                {(logStartDateTime || logEndDateTime) && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogStartDateTime('');
                      setLogEndDateTime('');
                    }}
                    className="p-1 bg-stone-200 hover:bg-red-100 hover:text-red-700 text-stone-600 rounded-lg transition cursor-pointer"
                    title="ล้างช่วงวัน-เวลา"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-[11px] font-black">
                <button
                  type="button"
                  onClick={() => setQuickDatePreset('today')}
                  className="px-2 py-1 rounded-lg hover:bg-white text-stone-700 hover:text-stone-950 transition cursor-pointer"
                  title="ดูประวัติเฉพาะวันนี้"
                >
                  วันนี้
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDatePreset('24hours')}
                  className="px-2 py-1 rounded-lg hover:bg-white text-amber-900 font-extrabold hover:text-amber-950 transition cursor-pointer"
                  title="ดูประวัติย้อนหลัง 24 ชั่วโมงล่าสุด (รวมช่วงค่ำ/ดึก)"
                >
                  24 ชม.
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDatePreset('7days')}
                  className="px-2 py-1 rounded-lg hover:bg-white text-stone-700 hover:text-stone-950 transition cursor-pointer"
                >
                  7 วัน
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDatePreset('all')}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${!logStartDateTime && !logEndDateTime ? 'bg-amber-400 text-stone-950 shadow-2xs font-extrabold' : 'text-stone-700 hover:bg-white'}`}
                >
                  ทั้งหมด
                </button>
              </div>

              {/* Realtime Cloud Sync Button */}
              <button
                type="button"
                onClick={async () => {
                  if (forceRealtimeSync) await forceRealtimeSync(true, true);
                }}
                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-900 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1 border border-stone-300 cursor-pointer"
                title="กดเพื่อดึงและอัปเดตประวัติความเคลื่อนไหวสต๊อกล่าสุดจากคลาวด์"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-amber-600' : 'text-stone-700'}`} />
                <span>{syncStatus === 'syncing' ? 'กำลังซิงค์...' : '🔄 ซิงค์ข้อมูล'}</span>
              </button>

              {/* Movement Type Filter */}
              <select
                value={movementTypeFilter}
                onChange={(e) => setMovementTypeFilter(e.target.value as any)}
                className="bg-white border-2 border-stone-400 rounded-xl px-3 py-1.5 text-xs text-stone-950 font-black focus:outline-none cursor-pointer shadow-xs"
              >
                <option value="all" className="bg-white text-stone-950 font-bold">-- ทุกประเภท --</option>
                <option value="IN" className="bg-white text-emerald-800 font-bold">🟢 สินค้าเข้า (Stock IN)</option>
                <option value="OUT" className="bg-white text-amber-900 font-bold">🟠 สินค้าออก (Stock OUT)</option>
              </select>
            </div>
          </div>

          {/* Mobile swipe hint banner */}
          <div className="sm:hidden bg-amber-500/10 border border-amber-300 rounded-xl px-3.5 py-2 mb-2 text-[11px] text-amber-950 font-bold flex items-center justify-between">
            <span>👉 เลื่อนหน้าจอซ้าย-ขวา เพื่อดูประวัติการเคลื่อนไหวสต๊อกครบทุกคอลัมน์</span>
            <span className="text-[10px] text-stone-500 font-mono">8 คอลัมน์</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-xs text-left text-stone-950">
              <thead className="bg-amber-100 text-stone-950 font-serif border-b-2 border-amber-400 font-black">
                <tr>
                  <th className="py-3 px-3 font-black">วัน-เวลา</th>
                  <th className="py-3 px-3 font-black">ประเภท</th>
                  <th className="py-3 px-3 font-black">ชื่อสินค้า / ไซส์</th>
                  <th className="py-3 px-3 font-black">Supplier / โรงงาน</th>
                  <th className="py-3 px-3 font-black text-center">จำนวน</th>
                  <th className="py-3 px-3 font-black text-right">ต้นทุน/ชิ้น</th>
                  <th className="py-3 px-3 font-black text-right">ต้นทุนรวม</th>
                  <th className="py-3 px-3 font-black">หมายเหตุ / อ้างอิง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {(() => {
                  const filteredMovements = stockMovements.filter((m) => {
                    if (movementTypeFilter !== 'all' && m.type !== movementTypeFilter) return false;
                    const mTime = new Date(m.createdAt).getTime();
                    if (!isNaN(mTime)) {
                      if (logStartDateTime) {
                        const startTime = new Date(logStartDateTime).getTime();
                        // 7-hour timezone buffer when start is 00:00 (covers UTC+7 Thailand orders created in UTC)
                        const isStartOfDay = logStartDateTime.endsWith('T00:00') || logStartDateTime.endsWith('T00:00:00');
                        const effectiveStartTime = isStartOfDay ? startTime - (7 * 3600 * 1000) : startTime;
                        if (!isNaN(startTime) && mTime < effectiveStartTime) return false;
                      }
                      if (logEndDateTime) {
                        const endTime = new Date(logEndDateTime).getTime();
                        const isEndOfDay = logEndDateTime.endsWith('T23:59') || logEndDateTime.endsWith('T23:59:59');
                        const effectiveEndTime = isEndOfDay ? endTime + (7 * 3600 * 1000) + 59999 : endTime + 59999;
                        if (!isNaN(endTime) && mTime > effectiveEndTime) return false;
                      }
                    }
                    if (movementSearchQuery) {
                      const q = movementSearchQuery.toLowerCase().trim();
                      const matchTitle = m.productTitle && m.productTitle.toLowerCase().includes(q);
                      const matchVariant = m.variantName && m.variantName.toLowerCase().includes(q);
                      const matchOrder = m.referenceOrderNo && m.referenceOrderNo.toLowerCase().includes(q);
                      const matchLot = m.lotNumber && m.lotNumber.toLowerCase().includes(q);
                      const matchSupplier = m.supplierName && m.supplierName.toLowerCase().includes(q);
                      if (!matchTitle && !matchVariant && !matchOrder && !matchLot && !matchSupplier) return false;
                    }
                    return true;
                  });

                  if (filteredMovements.length === 0) {
                    return (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-stone-700 font-black">
                          <div className="space-y-2 max-w-lg mx-auto">
                            <p className="text-stone-900 font-black text-sm">
                              {stockMovements.length === 0
                                ? 'ยังไม่มีประวัติสินค้าเข้า-ออกในระบบ'
                                : 'ไม่พบรายการประวัติตามช่วงวัน-เวลาหรือประเภทที่เลือก'}
                            </p>
                            {stockMovements.length > 0 ? (
                              <p className="text-xs text-stone-600 font-bold">
                                พบประวัติความเคลื่อนไหวทั้งหมดในระบบ {stockMovements.length} รายการ (อยู่นอกช่วงเวลาหรือประเภทที่เลือก)
                              </p>
                            ) : (
                              <p className="text-xs text-stone-500 font-normal">
                                เมื่อมีการขายสินค้าผ่าน POS หรือบันทึกสินค้าเข้า/คืนซัพพลายเออร์ ระบบจะบันทึกประวัติที่นี่อัตโนมัติ
                              </p>
                            )}
                            <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                              {stockMovements.length > 0 && (logStartDateTime || logEndDateTime || movementTypeFilter !== 'all') && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQuickDatePreset('all');
                                      setMovementTypeFilter('all');
                                    }}
                                    className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-lg shadow-xs cursor-pointer"
                                  >
                                    👉 ดูประวัติทั้งหมด ({stockMovements.length} รายการ)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQuickDatePreset('24hours');
                                      setMovementTypeFilter('all');
                                    }}
                                    className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs rounded-lg border border-stone-300 cursor-pointer"
                                  >
                                    ⏱️ ดู 24 ชม. ล่าสุด
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={async () => {
                                  if (forceRealtimeSync) await forceRealtimeSync(true, true);
                                }}
                                className="px-3.5 py-1.5 bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs rounded-lg border border-stone-300 shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-stone-700" />
                                <span>ดึง/ซิงค์ข้อมูลล่าสุด</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return filteredMovements.map((m) => {
                    const prod = products.find(
                      (p) => p.id === m.productId || p.title.toLowerCase() === (m.productTitle || '').toLowerCase()
                    );
                    const variant = prod?.variants?.find((v) => v.id === m.variantId || v.name === m.variantName);
                    const effectiveColor = getEffectiveVariantColor(prod, {
                      color: (m as any).color || variant?.color,
                      name: m.variantName,
                    });

                    return (
                      <tr key={m.id} className="hover:bg-amber-50/60 transition">
                        <td className="py-3 px-3 font-mono text-[11px] text-stone-800 font-bold whitespace-nowrap">
                          {formatThaiDateTime(m.createdAt)}
                        </td>
                        <td className="py-3 px-3">
                          {m.type === 'IN' ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 border border-emerald-400 text-[10px] font-black flex items-center gap-1 w-max">
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" /> สินค้าเข้า (IN)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 border border-amber-400 text-[10px] font-black flex items-center gap-1 w-max">
                              <ArrowUpRight className="w-3.5 h-3.5 text-amber-700" /> สินค้าออก (OUT)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-black">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-stone-950 block font-black text-sm">{m.productTitle}</span>
                              {effectiveColor && (
                                <span className="inline-flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-300 shadow-2xs">
                                  <ColorIndicator
                                    color={effectiveColor}
                                    dotClassName="w-3.5 h-3.5 ring-1 ring-black/20 shrink-0"
                                    showLabel={true}
                                    labelClassName="text-[10px] text-stone-950 font-black"
                                  />
                                </span>
                              )}
                            </div>
                            <span className="text-stone-700 text-[11px] font-bold">{m.variantName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-black text-amber-950">{m.supplierName}</td>
                        <td className="py-3 px-3 text-center font-black text-emerald-800 font-mono text-sm">
                          {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`} ชิ้น
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-stone-800">฿{m.costPrice.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-serif font-black text-amber-900">฿{m.totalCost.toLocaleString()}</td>
                        <td className="py-3 px-3 text-stone-800 font-bold">
                          {m.lotNumber && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300 font-mono text-[10px] font-black mr-1 shadow-2xs">
                              🏷️ {m.lotNumber}
                            </span>
                          )}
                          <span>{m.note || '-'}</span>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SETTLEMENT HISTORY & VOUCHER RECEIPTS */}
      {activeSubTab === 'history' && (
        <div className="bg-white border-2 border-amber-400/60 rounded-2xl p-5 space-y-4 shadow-xl text-stone-950">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h4 className="font-serif font-black text-base text-stone-950 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              <span>ประวัติการเคลียร์ยอดจ่ายเงิน Supplier (Settlement Voucher Receipts)</span>
            </h4>
          </div>

          {/* Mobile swipe hint banner */}
          <div className="sm:hidden bg-amber-500/10 border border-amber-300 rounded-xl px-3.5 py-2 mb-2 text-[11px] text-amber-950 font-bold flex items-center justify-between">
            <span>👉 เลื่อนหน้าจอซ้าย-ขวา เพื่อดูประวัติการเคลียร์เงินครบทุกคอลัมน์</span>
            <span className="text-[10px] text-stone-500 font-mono">8 คอลัมน์</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-xs text-left text-stone-950">
              <thead className="bg-amber-100 text-stone-950 font-serif border-b-2 border-amber-400 font-black">
                <tr>
                  <th className="py-3 px-3 font-black">เลขที่ใบเคลียร์</th>
                  <th className="py-3 px-3 font-black">วันที่เคลียร์</th>
                  <th className="py-3 px-3 font-black">เลขล็อต (Lot / Batch)</th>
                  <th className="py-3 px-3 font-black">Supplier / โรงงาน</th>
                  <th className="py-3 px-3 font-black text-center">จำนวนรวม</th>
                  <th className="py-3 px-3 font-black text-right">ยอดเงินต้นทุนรวม</th>
                  <th className="py-3 px-3 font-black">อ้างอิงชำระเงิน</th>
                  <th className="py-3 px-3 font-black text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {supplierSettlements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-stone-700 font-black">
                      ยังไม่มีประวัติการกดเคลียร์ยอดเงิน Supplier ในระบบ
                    </td>
                  </tr>
                ) : (
                  supplierSettlements.map((s) => (
                    <tr key={s.id} className="hover:bg-amber-50/60 transition">
                      <td className="py-3 px-3 font-mono font-black text-amber-950">{s.id}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-stone-800 font-bold whitespace-nowrap">
                        {formatThaiDateTime(s.settledAt)}
                      </td>
                      <td className="py-3 px-3 font-mono text-stone-950">
                        {(() => {
                          const lots = Array.from(
                            new Set(
                              stockMovements
                                .filter((m) => s.movementIds?.includes(m.id) && m.lotNumber)
                                .map((m) => m.lotNumber)
                            )
                          );
                          if (lots.length === 0) return <span className="text-stone-400 font-bold">-</span>;
                          return (
                            <div className="flex items-center gap-1 flex-wrap">
                              {lots.map((lot) => (
                                <span key={lot} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-100 text-stone-950 border border-amber-300 text-[10px] font-black shadow-2xs">
                                  🏷️ {lot}
                                </span>
                              ))}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-3 font-black text-stone-950">{s.supplierName}</td>
                      <td className="py-3 px-3 text-center font-black text-emerald-800 font-mono text-sm">{s.totalItemsCount} ชิ้น</td>
                      <td className="py-3 px-3 text-right font-serif font-black text-amber-900 text-sm">
                        ฿{s.totalCostAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-stone-800 font-bold">{s.paymentRef || 'โอนผ่านบัญชี'}</span>
                          {s.slipImageUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewSlipModalUrl(s.slipImageUrl || null)}
                              className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-400 rounded-lg text-[10px] font-black transition flex items-center gap-1 cursor-pointer shadow-xs"
                              title="คลิกดูสลิปหลักฐานโอนเงิน"
                            >
                              <ImageIcon className="w-3 h-3 text-emerald-700" />
                              <span>มีสลิป</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setViewingSettlementVoucher(s)}
                            className="px-2.5 py-1 bg-amber-100 text-stone-950 border border-amber-400 hover:bg-amber-200 rounded-lg text-xs font-black transition flex items-center gap-1 shadow-xs cursor-pointer"
                            title="ดูใบสรุปการเคลียร์ยอด"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-700" />
                            <span>ดูใบสรุป</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRequestCancelSettlement(s)}
                            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 rounded-lg text-xs font-black transition flex items-center gap-1 shadow-xs cursor-pointer"
                            title="ยกเลิกการเคลียร์ยอดนี้ (ต้องใส่รหัส Admin) รายการสินค้าจะกลับมารอเคลียร์ใหม่"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-rose-700" />
                            <span>ยกเลิก</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUPPLIER RETURN HISTORY (ประวัติส่งคืนสินค้าให้ซัพพลายเออร์) */}
      {activeSubTab === 'returns' && (
        <div className="space-y-5">
          {/* Summary Metrics Banner */}
          {(() => {
            const allReturns = supplierReturnVouchers || [];
            const totalUnits = allReturns.reduce((sum, v) => sum + (v.totalQuantity || 0), 0);
            const totalCost = allReturns.reduce((sum, v) => sum + (v.totalReturnCost || 0), 0);

            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-rose-50 to-white p-4 rounded-2xl border-2 border-rose-300 shadow-sm space-y-1">
                  <span className="text-xs text-rose-800 font-black flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4 text-rose-600" />
                    <span>จำนวนครั้งที่ส่งคืนสินค้า:</span>
                  </span>
                  <div className="font-serif font-black text-2xl text-rose-950 font-mono">
                    {allReturns.length.toLocaleString()} <span className="text-xs font-sans font-bold text-stone-600">ใบ</span>
                  </div>
                  <p className="text-[10px] text-stone-500">บันทึกส่งคืนพร้อมใบส่งคืนชัดเจน</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-white p-4 rounded-2xl border-2 border-amber-300 shadow-sm space-y-1">
                  <span className="text-xs text-amber-800 font-black flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-amber-600" />
                    <span>จำนวนสินค้าที่ส่งคืนรวม:</span>
                  </span>
                  <div className="font-serif font-black text-2xl text-amber-950 font-mono">
                    {totalUnits.toLocaleString()} <span className="text-xs font-sans font-bold text-stone-600">ชิ้น</span>
                  </div>
                  <p className="text-[10px] text-stone-500">ตัดสต็อกออกจากระบบอัตโนมัติแล้ว</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-2xl border-2 border-emerald-300 shadow-sm space-y-1">
                  <span className="text-xs text-emerald-800 font-black flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>มูลค่าต้นทุนสินค้าที่ส่งคืนรวม:</span>
                  </span>
                  <div className="font-serif font-black text-2xl text-emerald-950 font-mono">
                    ฿{totalCost.toLocaleString()} <span className="text-xs font-sans font-bold text-stone-600">บาท</span>
                  </div>
                  <p className="text-[10px] text-stone-500">ลดภาระต้นทุน/ยอดค้างจ่าย</p>
                </div>
              </div>
            );
          })()}

          {/* Controls: Search, Supplier Filter & Button */}
          <div className="bg-white border-2 border-stone-300 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={returnSearchQuery}
                  onChange={(e) => setReturnSearchQuery(e.target.value)}
                  placeholder="ค้นหาเลขที่ใบส่งคืน RET-..., ชื่อสินค้า, ผู้จัดส่ง, หรือตัวแทน..."
                  className="w-full bg-white border-2 border-stone-300 focus:border-rose-500 rounded-xl py-2 pl-9 pr-3 text-stone-950 font-bold text-xs focus:outline-none"
                />
                {returnSearchQuery && (
                  <button
                    onClick={() => setReturnSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-stone-700 shrink-0">Supplier:</span>
                <select
                  value={returnFilterSupplier}
                  onChange={(e) => setReturnFilterSupplier(e.target.value)}
                  className="bg-white border-2 border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none cursor-pointer"
                >
                  <option value="all">ทุก Supplier (ทั้งหมด)</option>
                  {supplierOptions.map((sup) => (
                    <option key={sup} value={sup}>{sup}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleOpenReturnModal();
                  setIsQRScannerReturnOpen(true);
                }}
                className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 border border-amber-600 cursor-pointer shrink-0"
                title="เปิดกล้องสแกน QR Code หรือ บาร์โค้ด สินค้าเพื่อเปิดหน้าส่งคืนสินค้าอัตโนมัติ"
              >
                <QrCode className="w-4 h-4 text-stone-950" />
                <span>📸 สแกน QR ส่งคืนด่วน</span>
              </button>

              <button
                type="button"
                onClick={handleOpenReturnModal}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 border border-rose-700 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>+ บันทึกส่งคืน Supplier ใหม่</span>
              </button>
            </div>
          </div>

          {/* Returns Table / Card List */}
          {(() => {
            const filtered = (supplierReturnVouchers || []).filter((v) => {
              if (returnFilterSupplier !== 'all' && v.supplierName !== returnFilterSupplier) return false;
              if (returnSearchQuery.trim()) {
                const q = returnSearchQuery.toLowerCase();
                const matchId = (v.id || '').toLowerCase().includes(q);
                const matchSup = (v.supplierName || '').toLowerCase().includes(q);
                const matchStaff = (v.performedBy || '').toLowerCase().includes(q);
                const matchReceiver = (v.receiverName || '').toLowerCase().includes(q);
                const matchItems = (v.items || []).some((i) =>
                  (i.productTitle || '').toLowerCase().includes(q) ||
                  (i.variantName || '').toLowerCase().includes(q) ||
                  (i.reason || '').toLowerCase().includes(q)
                );
                if (!matchId && !matchSup && !matchStaff && !matchReceiver && !matchItems) return false;
              }
              return true;
            });

            if (filtered.length === 0) {
              return (
                <div className="bg-white border-2 border-dashed border-stone-300 rounded-2xl p-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto text-2xl">
                    📦
                  </div>
                  <h4 className="font-serif font-black text-stone-900 text-base">
                    {returnSearchQuery || returnFilterSupplier !== 'all'
                      ? 'ไม่พบประวัติการส่งคืนที่ตรงกับเงื่อนไขค้นหา'
                      : 'ยังไม่มีประวัติการส่งคืนสินค้าให้ซัพพลายเออร์'}
                  </h4>
                  <p className="text-stone-500 text-xs max-w-md mx-auto">
                    เมื่อท่านบันทึกส่งคืนสินค้าชำรุด หรือของหมดสัญญาฝากขาย ระบบจะตัดลดสต็อกสินค้าให้อัตโนมัติ พร้อมออกใบส่งคืนสินค้าและเก็บประวัติไว้ที่นี่
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleOpenReturnModal}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>+ บันทึกส่งคืนรายการแรก</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div className="bg-white border-2 border-stone-300 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-rose-50 border-b-2 border-rose-200 text-stone-900 font-black">
                        <th className="p-3">วันที่ / เลขที่เอกสาร</th>
                        <th className="p-3">Supplier / ผู้รับของ</th>
                        <th className="p-3">รายการสินค้าที่ส่งคืน &amp; เหตุผล</th>
                        <th className="p-3 text-center">จำนวนรวม</th>
                        <th className="p-3 text-right">มูลค่ารวม (บาท)</th>
                        <th className="p-3">ผู้ทำรายการ</th>
                        <th className="p-3 text-center">หลักฐาน</th>
                        <th className="p-3 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {filtered.map((voucher) => (
                        <tr key={voucher.id} className="hover:bg-rose-50/40 transition">
                          <td className="p-3 whitespace-nowrap">
                            <span className="font-mono font-black text-rose-950 block text-xs">
                              {voucher.id}
                            </span>
                            <span className="text-[11px] text-stone-600 font-bold block">
                              📅 {formatThaiDateOnly(voucher.returnDate)}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-stone-900">
                            <div className="font-black text-stone-950">{voucher.supplierName}</div>
                            {voucher.receiverName && (
                              <div className="text-[10px] text-stone-600">ตัวแทนรับ: {voucher.receiverName}</div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="space-y-1 max-w-sm">
                              {(voucher.items || []).map((it, idx) => (
                                <div key={idx} className="bg-stone-50 p-1.5 rounded-lg border border-stone-200 text-[11px]">
                                  <div className="font-black text-stone-900 truncate">
                                    • {it.productTitle} ({it.variantName})
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-stone-600 pt-0.5">
                                    <span className="text-rose-800 font-bold bg-rose-100 px-1 rounded">
                                      เหตุผล: {it.reason}
                                    </span>
                                    <span className="font-mono font-bold">
                                      x{it.quantity} ชิ้น (฿{it.totalCost.toLocaleString()})
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-center font-mono font-black text-sm text-stone-950 whitespace-nowrap">
                            {voucher.totalQuantity} ชิ้น
                          </td>
                          <td className="p-3 text-right font-mono font-black text-sm text-rose-950 whitespace-nowrap">
                            ฿{voucher.totalReturnCost.toLocaleString()}
                          </td>
                          <td className="p-3 text-stone-700 font-bold whitespace-nowrap text-[11px]">
                            👤 {voucher.performedBy}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            {voucher.proofImageUrl ? (
                              <button
                                type="button"
                                onClick={() => setPreviewSlipModalUrl(voucher.proofImageUrl!)}
                                className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-black border border-amber-300 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <ImageIcon className="w-3 h-3 text-amber-700" />
                                <span>ดูรูป</span>
                              </button>
                            ) : (
                              <span className="text-stone-400 text-[10px]">-</span>
                            )}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewingReturnVoucher(voucher)}
                                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                                title="เปิดดูใบส่งคืนสินค้า / พิมพ์ A4"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>ดูใบส่งคืน</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancelReturnVoucher(voucher)}
                                className="p-1.5 bg-stone-100 hover:bg-rose-100 text-stone-600 hover:text-rose-700 rounded-xl border border-stone-300 hover:border-rose-300 transition cursor-pointer"
                                title="ยกเลิกการส่งคืนและดึงสต็อกกลับเข้าคลัง"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 4: TRASH BIN & RESTORE AUDIT LOG */}
      {activeSubTab === 'trash' && (
        <div className="bg-white border-2 border-rose-400/60 rounded-2xl p-5 space-y-4 shadow-xl text-stone-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
            <div>
              <h4 className="font-serif font-black text-base text-rose-950 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                <span>ถังขยะรายการประวัติสินค้าที่ถูกลบ (Trash Bin &amp; Restore)</span>
              </h4>
              <p className="text-[11px] text-stone-600 font-bold mt-0.5">
                รายการที่ถูกลบจะถูกเก็บไว้ที่นี่ สามารถกด "กู้คืน (Restore)" เพื่อดึงข้อมูลและสต๊อกกลับมาได้ตลอดเวลา
              </p>
            </div>

            {trashedStockMovements.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`คุณต้องการกู้คืนรายการทั้งหมด ${trashedStockMovements.length} รายการกลับคืนมาใช่หรือไม่?`)) {
                      trashedStockMovements.forEach((item) => {
                        restoreStockMovement(item.id);
                      });
                      setStockInToast(`♻️ กู้คืนข้อมูลทั้งหมด ${trashedStockMovements.length} รายการ เรียบร้อยแล้ว!`);
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>♻️ กู้คืนทั้งหมด ({trashedStockMovements.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('คุณต้องการล้างถังขยะทั้งหมดอย่างถาวรใช่หรือไม่? (จะไม่สามารถกู้คืนได้อีก)')) {
                      clearTrashedStockMovements();
                      setStockInToast('ล้างถังขยะเรียบร้อยแล้ว');
                    }
                  }}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-xl font-black text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ล้างถังขยะ</span>
                </button>
              </div>
            )}
          </div>

          {trashedStockMovements.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <div className="font-serif font-black text-stone-900 text-base">
                ถังขยะว่างเปล่า (ไม่มีรายการที่ถูกลบ)
              </div>
              <p className="text-xs text-stone-500 font-bold max-w-sm mx-auto">
                เมื่อคุณลบรายการในหน้าประวัติสินค้า รายการจะถูกย้ายมาเก็บไว้ที่นี่เพื่อความปลอดภัย และสามารถกู้คืนได้ทุกเมื่อ
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-xs text-left text-stone-950">
                <thead className="bg-stone-100 border-b border-stone-300 text-stone-900 font-black">
                  <tr>
                    <th className="py-2.5 px-3">เวลาที่ลบ</th>
                    <th className="py-2.5 px-3 text-center">ประเภท</th>
                    <th className="py-2.5 px-3">สินค้า / ไซส์</th>
                    <th className="py-2.5 px-3 text-center">จำนวน</th>
                    <th className="py-2.5 px-3 text-right">ต้นทุน/ชิ้น</th>
                    <th className="py-2.5 px-3 text-right">รวมต้นทุน</th>
                    <th className="py-2.5 px-3">Supplier / ล็อต / ข้อมูลเดิม</th>
                    <th className="py-2.5 px-3 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {trashedStockMovements.map(({ id, movement: m, revertedStock, deletedAt }) => (
                    <tr key={id} className="hover:bg-rose-50/40 transition">
                      <td className="py-3 px-3 text-stone-600 font-mono text-[11px] whitespace-nowrap">
                        <div>{formatThaiDateOnly(deletedAt)}</div>
                        <div className="text-[10px] text-stone-400">{new Date(deletedAt).toLocaleTimeString('th-TH')} น.</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black shadow-xs ${
                            m.type === 'IN'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {m.type === 'IN' ? '📥 รับเข้า' : '📤 ขายออก'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-black text-stone-950 text-sm">{m.productTitle}</div>
                        <div className="text-xs text-stone-600 font-bold">{m.variantName}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-black font-mono text-sm text-stone-900">
                        {m.quantity} ชิ้น
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-800">
                        ฿{m.costPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-amber-900">
                        ฿{m.totalCost.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 space-y-1">
                        <div className="font-bold text-stone-800">{m.supplierName || '-'}</div>
                        {m.lotNumber && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                            🏷️ {m.lotNumber}
                          </span>
                        )}
                        {m.note && <div className="text-[10px] text-stone-500 font-bold">{m.note}</div>}
                        {m.type === 'IN' && revertedStock && (
                          <div className="text-[10px] text-emerald-700 font-bold">
                            (ตอนลบได้ปรับลดสต๊อกออก - เมื่อกู้คืนจะคืนสต๊อกกลับให้)
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              const ok = restoreStockMovement(id);
                              if (ok) {
                                setStockInToast(`♻️ กู้คืนรายการ "${m.productTitle} (${m.variantName})" สำเร็จแล้ว!`);
                              }
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1 shadow-sm cursor-pointer"
                            title="ดึงรายการนี้กลับคืนไปยังหน้าประวัติสินค้าและปรับสต๊อกให้เหมือนเดิม"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>กู้คืน</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`คุณต้องการลบรายการ "${m.productTitle}" ออกจากถังขยะอย่างถาวรใช่หรือไม่?`)) {
                                permanentlyDeleteStockMovement(id);
                                setStockInToast(`ลบรายการถาวรเรียบร้อยแล้ว`);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-stone-200 cursor-pointer"
                            title="ลบถาวร"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: STOCK IN FORM MODAL */}
      {isStockInModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-lg w-full p-6 text-stone-950 shadow-2xl space-y-4 text-left">
            
            <div className="flex justify-between items-center border-b-2 border-amber-400/40 pb-3">
              <h3 className="font-serif font-black text-lg text-stone-950 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" />
                <span>บันทึกรับสินค้าเข้าสต๊อก (Stock IN)</span>
              </h3>
              <button
                onClick={handleCloseStockInModal}
                className="text-stone-700 hover:text-stone-950 p-1 rounded-full border border-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick QR & Barcode Scan Shortcut */}
            <div className="bg-amber-50/90 border border-amber-300 p-3 rounded-2xl flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-700 shrink-0" />
                <div className="text-stone-900">
                  <div className="font-black text-xs">สแกน QR Code / บาร์โค้ด สินค้า</div>
                  <div className="text-[10px] text-stone-600 font-bold">ใช้กล้องมือถือหรือเครื่องยิงเพื่อเลือกสินค้าอัตโนมัติ</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQRScannerStockInOpen(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>เปิดกล้องสแกน</span>
              </button>
            </div>

            <form onSubmit={handleSaveStockIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-950 font-black mb-1">เลือกสินค้า *</label>
                <select
                  required
                  value={stockInProductId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setStockInProductId(pid);
                    const prod = products.find((p) => p.id === pid);
                    if (prod) {
                      setStockInLotNumber(generateStandardHudaLot(prod.title, prod.id, '1-69'));
                    }
                    if (prod && prod.variants.length > 0) {
                      setStockInVariantId(prod.variants[0].id);
                      setStockInCostPrice(prod.variants[0].costPrice || Math.round(prod.variants[0].price * 0.5));
                    }
                  }}
                  className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 text-stone-950 font-black text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="" className="bg-white text-stone-950 font-bold">-- เลือกสินค้า --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} className="bg-white text-stone-950 font-bold">
                      {p.title} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              {stockInProductId && (
                <div>
                  <label className="block text-stone-950 font-black mb-1">เลือกไซส์ / ตัวเลือก *</label>
                  <select
                    required
                    value={stockInVariantId}
                    onChange={(e) => {
                      const vid = e.target.value;
                      setStockInVariantId(vid);
                      const prod = products.find((p) => p.id === stockInProductId);
                      const v = prod?.variants.find((varItem) => varItem.id === vid);
                      if (v) {
                        setStockInCostPrice(v.costPrice || Math.round(v.price * 0.5));
                      }
                    }}
                    className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 text-stone-950 font-black text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {products
                      .find((p) => p.id === stockInProductId)
                      ?.variants.map((v) => (
                        <option key={v.id} value={v.id} className="bg-white text-stone-950 font-bold">
                          {v.name} {v.color ? `(${v.color})` : ''} — สต๊อกปัจจุบัน: {v.stockQuantity} ชิ้น
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-stone-950 font-black">จำนวนสินค้าเข้า (ชิ้น) *</label>
                    <VoiceInputButton
                      isNumber={true}
                      onNumberTranscript={(num) => setStockInQty(num)}
                      onTranscript={(text) => {
                        const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
                        if (!isNaN(num) && num > 0) setStockInQty(num);
                      }}
                      className="scale-90"
                      title="พูดบอกจำนวนสินค้าเข้า"
                    />
                  </div>
                  <input
                    type="number"
                    min={1}
                    required
                    value={stockInQty}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setStockInQty('');
                      } else {
                        const num = parseInt(val, 10);
                        setStockInQty(isNaN(num) ? '' : num);
                      }
                    }}
                    placeholder="เช่น 10"
                    className="w-full bg-white border-2 border-emerald-500 rounded-xl p-3 text-stone-950 font-mono font-black text-base focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
                  />
                  <span className="text-[10px] text-stone-500 font-bold mt-1 block">
                    (ใส่ตัวเลขเอง ไม่มีปุ่มเพิ่ม/ลด)
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-stone-950 font-black">ราคาต้นทุน/ชิ้น (บาท) *</label>
                    <VoiceInputButton
                      isNumber={true}
                      onNumberTranscript={(num) => setStockInCostPrice(num)}
                      onTranscript={(text) => {
                        const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
                        if (!isNaN(num)) setStockInCostPrice(num);
                      }}
                      className="scale-90"
                      title="พูดบอกราคาต้นทุน"
                    />
                  </div>
                  <input
                    type="number"
                    min={0}
                    required
                    value={stockInCostPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setStockInCostPrice('');
                      } else {
                        const num = parseInt(val, 10);
                        setStockInCostPrice(isNaN(num) ? '' : num);
                      }
                    }}
                    placeholder="เช่น 900"
                    className="w-full bg-white border-2 border-amber-500 rounded-xl p-3 text-stone-950 font-mono font-black text-base focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
                  />
                  <span className="text-[10px] text-stone-500 font-bold mt-1 block">
                    (ใส่ตัวเลขเอง ไม่มีปุ่มเพิ่ม/ลด)
                  </span>
                </div>
              </div>

              {/* Supplier / Factory Dropdown with Custom Add & Persistent Storage */}
              <div className="relative" ref={supplierDropdownRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-stone-950 font-black">
                    ชื่อ Supplier / โรงงานที่รับมา *
                  </label>
                  <span className="text-[10px] text-amber-800 font-extrabold">
                    (เลือกจากรายการ หรือพิมพ์เพิ่มชื่อใหม่ได้อิสระ)
                  </span>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={stockInSupplierName}
                    onChange={(e) => {
                      setStockInSupplierName(e.target.value);
                      setIsSupplierDropdownOpen(true);
                    }}
                    onFocus={() => setIsSupplierDropdownOpen(true)}
                    placeholder="คลิกเลือกจากรายการ หรือพิมพ์ชื่อ Supplier ใหม่..."
                    className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 pr-20 text-stone-950 font-black text-sm focus:outline-none focus:border-amber-500 shadow-sm"
                  />

                  <div className="absolute right-2 flex items-center gap-1">
                    <VoiceInputButton
                      onTranscript={(text) => {
                        setStockInSupplierName(text);
                        setIsSupplierDropdownOpen(true);
                      }}
                      className="scale-90"
                      title="พูดพิมพ์ชื่อ Supplier"
                    />
                    <button
                      type="button"
                      onClick={() => setIsSupplierDropdownOpen((prev) => !prev)}
                      className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                      title="เปิด/ปิดรายการตัวเลือก Supplier"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSupplierDropdownOpen ? 'rotate-180 text-amber-600' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Dropdown Menu */}
                {isSupplierDropdownOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border-2 border-amber-400 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                    {/* Dropdown Header */}
                    <div className="px-3 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-[11px] font-black text-amber-950">
                      <span>รายการ Supplier / โรงงาน ({supplierOptions.length} รายการ)</span>
                      <button
                        type="button"
                        onClick={() => saveSupplierOptions(SUPPLIER_PRESETS)}
                        className="text-[10px] text-stone-500 hover:text-amber-800 underline font-bold cursor-pointer"
                        title="รีเซ็ตเป็นค่าเริ่มต้น"
                      >
                        รีเซ็ตค่าเริ่มต้น
                      </button>
                    </div>

                    {/* Add new button if typed text is not yet in options */}
                    {isTypedSupplierNew && (
                      <button
                        type="button"
                        onClick={() => handleAddNewSupplier(stockInSupplierName.trim())}
                        className="w-full text-left px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border-b border-emerald-300 text-xs font-black text-emerald-950 flex items-center justify-between transition cursor-pointer"
                      >
                        <span>➕ เพิ่ม Supplier ใหม่: <strong className="text-emerald-900 underline">"{stockInSupplierName.trim()}"</strong></span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-400 font-bold">กดเพื่อเพิ่มและบันทึก</span>
                      </button>
                    )}

                    {/* List of items */}
                    <div className="divide-y divide-stone-100">
                      {filteredSuppliers.length === 0 && !isTypedSupplierNew ? (
                        <div className="p-4 text-center text-xs text-stone-500 font-bold">
                          ไม่พบ Supplier ที่ตรงกับ "{stockInSupplierName}"
                        </div>
                      ) : (
                        filteredSuppliers.map((supp) => {
                          const isSelected = stockInSupplierName === supp;
                          return (
                            <div
                              key={supp}
                              className={`px-3 py-2 text-xs font-black transition flex items-center justify-between group ${
                                isSelected ? 'bg-amber-100 text-amber-950' : 'text-stone-900 hover:bg-stone-50'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setStockInSupplierName(supp);
                                  setIsSupplierDropdownOpen(false);
                                }}
                                className="flex-1 text-left flex items-center justify-between pr-2 cursor-pointer truncate"
                              >
                                <span className="truncate">{supp}</span>
                                {isSelected && (
                                  <span className="text-amber-800 text-[11px] font-black shrink-0 ml-1.5">✓ เลือกอยู่</span>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSupplier(supp);
                                }}
                                className="p-1 hover:bg-red-100 text-stone-400 hover:text-red-600 rounded transition cursor-pointer opacity-70 group-hover:opacity-100"
                                title={`ลบ "${supp}" ออกจากตัวเลือก`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Quick chips below */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[11px] font-black text-stone-600">ตัวเลือกด่วน:</span>
                  {supplierOptions.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setStockInSupplierName(s);
                        setIsSupplierDropdownOpen(false);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition cursor-pointer ${
                        stockInSupplierName === s
                          ? 'bg-amber-200 border-amber-400 text-amber-950 shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lot / Batch Number Dropdown with Add, Copy, Edit, Delete & Persistence */}
              <div>
                <LotNumberManagerDropdown
                  value={stockInLotNumber}
                  onChange={setStockInLotNumber}
                  productTitle={products.find((p) => p.id === stockInProductId)?.title}
                  productId={stockInProductId}
                  standardLot={(() => {
                    const prod = products.find((p) => p.id === stockInProductId);
                    return prod ? generateStandardHudaLot(prod.title, prod.id, stockInLotNumber || '1-69') : 'HUDA-001-1-69';
                  })()}
                  title="เลขล็อต (Lot / Batch):"
                  placeholder="เช่น 1-69, 2-69 หรือ HUDA-A001-2-69"
                  dropdownDirection="up"
                />
              </div>

              {/* Note / DO Number Dropdown with Custom Add & Persistent Storage */}
              <div className="relative" ref={noteDropdownRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-stone-950 font-black">
                    หมายเหตุ / เลขที่ใบส่งของ (Optional)
                  </label>
                  <span className="text-[10px] text-amber-800 font-extrabold">
                    (เลือกจากรายการ หรือพิมพ์เพิ่มเลขที่ใหม่ได้อิสระ)
                  </span>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={stockInNote}
                    onChange={(e) => {
                      setStockInNote(e.target.value);
                      setIsNoteDropdownOpen(true);
                    }}
                    onFocus={() => setIsNoteDropdownOpen(true)}
                    placeholder="คลิกเลือกจากรายการ หรือพิมพ์เลขที่ใบส่งของ เช่น 00001/69..."
                    className="w-full bg-white border-2 border-stone-300 rounded-xl p-3 pr-20 text-stone-950 font-black text-sm focus:outline-none focus:border-amber-500 shadow-sm"
                  />

                  <div className="absolute right-2 flex items-center gap-1">
                    <VoiceInputButton
                      onTranscript={(text) => {
                        setStockInNote(text);
                        setIsNoteDropdownOpen(true);
                      }}
                      className="scale-90"
                      title="พูดพิมพ์หมายเหตุ / เลขที่ใบส่งของ"
                    />
                    <button
                      type="button"
                      onClick={() => setIsNoteDropdownOpen((prev) => !prev)}
                      className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                      title="เปิด/ปิดรายการตัวเลือกหมายเหตุ / เลขที่ใบส่งของ"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isNoteDropdownOpen ? 'rotate-180 text-amber-600' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Note Dropdown Menu */}
                {isNoteDropdownOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border-2 border-amber-400 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                    {/* Dropdown Header */}
                    <div className="px-3 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-[11px] font-black text-amber-950">
                      <span>รายการหมายเหตุ / เลขที่ใบส่งของ ({noteOptions.length} รายการ)</span>
                      <button
                        type="button"
                        onClick={() => saveNoteOptions(DEFAULT_NOTE_PRESETS)}
                        className="text-[10px] text-stone-500 hover:text-amber-800 underline font-bold cursor-pointer"
                        title="รีเซ็ตเป็นค่าเริ่มต้น"
                      >
                        รีเซ็ตค่าเริ่มต้น
                      </button>
                    </div>

                    {/* Add new button if typed text is not yet in options */}
                    {isTypedNoteNew && (
                      <button
                        type="button"
                        onClick={() => handleAddNewNote(stockInNote.trim())}
                        className="w-full text-left px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border-b border-emerald-300 text-xs font-black text-emerald-950 flex items-center justify-between transition cursor-pointer"
                      >
                        <span>➕ เพิ่มตัวเลือกใหม่: <strong className="text-emerald-900 underline">"{stockInNote.trim()}"</strong></span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-400 font-bold">กดเพื่อเพิ่มและบันทึก</span>
                      </button>
                    )}

                    {/* List of items */}
                    <div className="divide-y divide-stone-100">
                      {filteredNotes.length === 0 && !isTypedNoteNew ? (
                        <div className="p-4 text-center text-xs text-stone-500 font-bold">
                          ไม่พบรายการที่ตรงกับ "{stockInNote}"
                        </div>
                      ) : (
                        filteredNotes.map((item) => {
                          const isSelected = stockInNote === item;
                          return (
                            <div
                              key={item}
                              className={`px-3 py-2 text-xs font-black transition flex items-center justify-between group ${
                                isSelected ? 'bg-amber-100 text-amber-950' : 'text-stone-900 hover:bg-stone-50'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setStockInNote(item);
                                  setIsNoteDropdownOpen(false);
                                }}
                                className="flex-1 text-left flex items-center justify-between pr-2 cursor-pointer truncate"
                              >
                                <span className="truncate">{item}</span>
                                {isSelected && (
                                  <span className="text-amber-800 text-[11px] font-black shrink-0 ml-1.5">✓ เลือกอยู่</span>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote(item);
                                }}
                                className="p-1 hover:bg-red-100 text-stone-400 hover:text-red-600 rounded transition cursor-pointer opacity-70 group-hover:opacity-100"
                                title={`ลบ "${item}" ออกจากตัวเลือก`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Quick chips below */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[11px] font-black text-stone-600">ตัวเลือกด่วน:</span>
                  {noteOptions.slice(0, 5).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setStockInNote(n);
                        setIsNoteDropdownOpen(false);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition cursor-pointer ${
                        stockInNote === n
                          ? 'bg-amber-200 border-amber-400 text-amber-950 shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber-400/30">
                <button
                  type="button"
                  onClick={handleCloseStockInModal}
                  className="px-4 py-2 bg-stone-100 border border-stone-300 text-stone-950 font-black rounded-xl hover:bg-stone-200 cursor-pointer"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md transition cursor-pointer border border-emerald-700"
                >
                  บันทึกรับสินค้าเข้าสต๊อก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BATCH SUPPLIER SETTLEMENT CONFIRMATION */}
      {isSettlementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-lg w-full p-6 text-stone-950 shadow-2xl space-y-4 text-left">
            
            <div className="flex justify-between items-center border-b-2 border-amber-400/40 pb-3">
              <h3 className="font-serif font-black text-lg text-stone-950 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                <span>ยืนยันเคลียร์รอบจ่ายเงิน Supplier</span>
              </h3>
              <button
                onClick={() => setIsSettlementModalOpen(false)}
                className="text-stone-700 hover:text-stone-950 p-1 rounded-full border border-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSettlement} className="space-y-4 text-xs">
              <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-400 space-y-2 text-stone-950">
                <div className="flex items-center justify-between">
                  <span className="text-stone-800 font-extrabold">ชื่อ Supplier:</span>
                  <span className="text-amber-950 font-black text-base">{settleSupplierName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-800 font-extrabold">จำนวนรายการที่เลือกเคลียร์:</span>
                  <span className="text-emerald-800 font-black text-sm font-mono">
                    {unsettledMovements
                      .filter((m) => m.supplierName === settleSupplierName && selectedMovementIds.includes(m.id))
                      .reduce((sum, m) => sum + m.quantity, 0)} ชิ้น
                  </span>
                </div>

                {(() => {
                  const lots = Array.from(
                    new Set(
                      unsettledMovements
                        .filter((m) => m.supplierName === settleSupplierName && selectedMovementIds.includes(m.id) && m.lotNumber)
                        .map((m) => m.lotNumber)
                    )
                  );
                  if (lots.length === 0) return null;
                  return (
                    <div className="flex items-center justify-between border-t border-amber-400/40 pt-1.5">
                      <span className="text-stone-800 font-extrabold">เลขล็อตที่เคลียร์ (Lot / Batch):</span>
                      <div className="flex items-center gap-1 flex-wrap justify-end">
                        {lots.map((lot) => (
                          <span key={lot} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-200 text-stone-950 border border-amber-400 font-mono font-black text-[10px] shadow-2xs">
                            🏷️ {lot}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="flex items-center justify-between border-t border-amber-400/40 pt-2">
                  <span className="text-stone-950 font-black text-sm">ยอดเงินต้นทุนสุทธิที่ต้องโอน:</span>
                  <span className="text-amber-900 font-black text-2xl font-serif">
                    ฿{unsettledMovements
                      .filter((m) => m.supplierName === settleSupplierName && selectedMovementIds.includes(m.id))
                      .reduce((sum, m) => sum + m.totalCost, 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-stone-950 font-black mb-1">เลขที่อ้างอิงการโอนเงิน / สลิป *</label>
                <input
                  type="text"
                  required
                  value={settlementPaymentRef}
                  onChange={(e) => setSettlementPaymentRef(e.target.value)}
                  placeholder="เช่น โอนเงินเข้าบัญชี PromptPay 08X-XXX-XXXX"
                  className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 text-stone-950 font-black text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-950 font-black mb-1">หมายเหตุรอบการเคลียร์เงิน</label>
                <input
                  type="text"
                  value={settlementNote}
                  onChange={(e) => setSettlementNote(e.target.value)}
                  placeholder="เช่น เคลียร์ยอดต้นทุนประจำรอบขายเดือนนี้"
                  className="w-full bg-white border-2 border-stone-300 rounded-xl p-2.5 text-stone-950 font-black focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Slip / Payment Proof Image Attachment */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-stone-950 font-black flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-700" />
                    <span>แนบรูปภาพหลักฐานการโอนเงิน / สลิป (Optional)</span>
                  </label>
                  {settlementSlipImage && (
                    <span className="text-[10px] text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      ✓ แนบรูปภาพแล้ว
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  ref={slipFileInputRef}
                  accept="image/*"
                  onChange={handleSlipFileUpload}
                  className="hidden"
                />

                {!settlementSlipImage ? (
                  <button
                    type="button"
                    onClick={() => slipFileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-amber-400 hover:border-amber-600 bg-amber-50/60 hover:bg-amber-100/70 rounded-2xl p-4 text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
                  >
                    <div className="p-2.5 bg-white rounded-xl shadow-xs group-hover:scale-110 transition border border-amber-300">
                      <Upload className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-xs font-black text-amber-950">
                      + คลิกเลือกไฟล์รูปภาพหลักฐานการโอนเงิน หรือรูปจากไฟล์ภาพ
                    </span>
                    <span className="text-[10px] text-stone-600 font-bold">
                      รองรับไฟล์ภาพ JPG, PNG, WEBP (ระบบบีบอัดขนาดให้อัตโนมัติ)
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-stone-50 border-2 border-emerald-400 rounded-2xl shadow-sm gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => setPreviewSlipModalUrl(settlementSlipImage)}
                        className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-500 shrink-0 cursor-pointer shadow-xs hover:opacity-90 group bg-stone-200"
                        title="คลิกเพื่อดูรูปขนาดเต็ม"
                      >
                        <img
                          src={settlementSlipImage}
                          alt="สลิปโอนเงิน"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <div className="text-left space-y-0.5">
                        <span className="text-xs font-black text-emerald-950 block">
                          แนบรูปภาพสลิปเรียบร้อยแล้ว
                        </span>
                        <span className="text-[10px] text-stone-600 block font-bold">
                          รูปจะปรากฏในใบสรุปยอดเคลียร์เงิน Supplier ทันที
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewSlipModalUrl(settlementSlipImage)}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-black border border-stone-300 transition flex items-center gap-1 cursor-pointer"
                        title="ดูรูปขนาดเต็ม"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ดูรูป</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => slipFileInputRef.current?.click()}
                        className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-xs font-black border border-amber-400 transition flex items-center gap-1 cursor-pointer"
                        title="เปลี่ยนรูปภาพใหม่"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>เปลี่ยน</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettlementSlipImage('')}
                        className="p-1.5 hover:bg-red-100 text-stone-400 hover:text-red-600 rounded-xl transition cursor-pointer"
                        title="ลบรูปภาพนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber-400/40">
                <button
                  type="button"
                  onClick={() => setIsSettlementModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 border border-stone-300 text-stone-950 font-black rounded-xl hover:bg-stone-200 cursor-pointer"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl shadow-md border border-amber-500 cursor-pointer"
                >
                  กดยืนยันเคลียร์เงิน &amp; ออกใบสรุป
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SETTLEMENT RECEIPT VOUCHER VIEW */}
      {viewingSettlementVoucher && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-xl w-full p-6 text-stone-950 shadow-2xl space-y-5 text-left">
            
            {/* Header Voucher */}
            <div className="flex items-start justify-between border-b-2 border-amber-400/40 pb-4">
              <div>
                <span className="text-[10px] text-amber-950 font-black uppercase tracking-widest bg-amber-100 px-2 py-0.5 rounded border border-amber-400">
                  SUPPLIER SETTLEMENT VOUCHER
                </span>
                <h3 className="font-serif font-black text-xl text-stone-950 mt-1">
                  ใบสรุปเคลียร์ยอดชำระเงิน Supplier
                </h3>
                <p className="text-xs text-stone-700 font-bold">
                  {storeSettings.storeName} — {storeSettings.storeTagline}
                </p>
              </div>

              <button
                onClick={() => setViewingSettlementVoucher(null)}
                className="text-stone-700 hover:text-stone-950 p-1 rounded-full border border-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voucher Details */}
            <div className="space-y-3 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-300">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-700 block text-[10px] font-black">เลขที่ใบสรุป:</span>
                  <span className="text-amber-950 font-mono font-black">{viewingSettlementVoucher.id}</span>
                </div>
                <div>
                  <span className="text-stone-700 block text-[10px] font-black">วันที่เคลียร์เงิน:</span>
                  <span className="text-stone-950 font-black">
                    {formatThaiDateTime(viewingSettlementVoucher.settledAt)}
                  </span>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-700 block text-[10px] font-black">ชื่อ Supplier / โรงงาน:</span>
                  <span className="text-amber-950 font-black text-sm">{viewingSettlementVoucher.supplierName}</span>
                </div>
                <div>
                  <span className="text-stone-700 block text-[10px] font-black">หลักฐาน/อ้างอิงชำระ:</span>
                  <span className="text-emerald-800 font-black">{viewingSettlementVoucher.paymentRef}</span>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-2 flex items-center justify-between">
                <div>
                  <span className="text-stone-700 block text-[10px] font-black">จำนวนสินค้าเคลียร์รอบนี้:</span>
                  <span className="text-stone-950 font-black">{viewingSettlementVoucher.totalItemsCount} ชิ้น</span>
                </div>
                <div className="text-right">
                  <span className="text-amber-950 block text-[10px] font-black">ยอดเงินต้นทุนรวมที่เคลียร์จ่าย:</span>
                  <span className="text-amber-900 font-black text-2xl font-serif">
                    ฿{viewingSettlementVoucher.totalCostAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Settled Items Breakdown with Lot Numbers */}
            {(() => {
              const voucherMovements = stockMovements.filter((m) =>
                viewingSettlementVoucher.movementIds?.includes(m.id)
              );
              if (voucherMovements.length === 0) return null;
              return (
                <div className="space-y-2">
                  <h5 className="font-serif font-black text-xs text-stone-950 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>รายการสินค้าที่เคลียร์ยอดในใบสรุปนี้ ({voucherMovements.length} รายการ):</span>
                  </h5>
                  <div className="max-h-52 overflow-y-auto no-scrollbar border border-stone-300 rounded-xl overflow-hidden bg-white shadow-xs">
                    <table className="w-full text-[11px] text-left text-stone-950">
                      <thead className="bg-amber-100 text-stone-950 font-serif font-black border-b border-amber-300">
                        <tr>
                          <th className="py-2 px-2.5 font-black">เลขล็อต (Lot / Batch)</th>
                          <th className="py-2 px-2.5 font-black">สินค้า / ไซส์</th>
                          <th className="py-2 px-2.5 text-center font-black">จำนวน</th>
                          <th className="py-2 px-2.5 text-right font-black">ต้นทุน/ชิ้น</th>
                          <th className="py-2 px-2.5 text-right font-black">รวมต้นทุน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {voucherMovements.map((vm) => (
                          <tr key={vm.id} className="hover:bg-amber-50/50">
                            <td className="py-2 px-2.5 font-mono font-black text-amber-950">
                              {vm.lotNumber ? (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-stone-950 border border-amber-300 text-[10px] font-black shadow-2xs">
                                  🏷️ {vm.lotNumber}
                                </span>
                              ) : (
                                <span className="text-stone-400 font-bold">-</span>
                              )}
                            </td>
                            <td className="py-2 px-2.5 font-black">
                              <span className="text-stone-950 block">{vm.productTitle}</span>
                              <span className="text-stone-600 text-[10px] font-bold">
                                {vm.variantName} {vm.referenceOrderNo ? `( Order: ${vm.referenceOrderNo} )` : ''}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 text-center font-mono font-bold text-stone-900">{vm.quantity} ชิ้น</td>
                            <td className="py-2 px-2.5 text-right font-mono text-stone-700">฿{vm.costPrice.toLocaleString()}</td>
                            <td className="py-2 px-2.5 text-right font-serif font-black text-amber-900">฿{vm.totalCost.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* Attached Slip Image Proof */}
            {viewingSettlementVoucher.slipImageUrl && (
              <div className="bg-white border-2 border-emerald-400 p-4 rounded-2xl space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>รูปภาพหลักฐานการโอนเงิน / สลิปที่แนบไว้:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewSlipModalUrl(viewingSettlementVoucher.slipImageUrl || null)}
                    className="text-xs text-amber-700 hover:text-amber-900 font-black underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ขยายดูรูปสลิปเต็มจอ</span>
                  </button>
                </div>

                <div
                  onClick={() => setPreviewSlipModalUrl(viewingSettlementVoucher.slipImageUrl || null)}
                  className="max-w-xs mx-auto border border-stone-200 rounded-xl overflow-hidden shadow-xs cursor-pointer hover:opacity-95 transition bg-stone-50 p-1"
                >
                  <img
                    src={viewingSettlementVoucher.slipImageUrl}
                    alt="สลิปโอนเงิน Supplier"
                    className="w-full max-h-60 object-contain rounded-lg mx-auto"
                  />
                </div>
              </div>
            )}

            {/* Voucher Footer Action */}
            <div className="flex items-center justify-between pt-2 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-stone-100 border border-stone-300 text-stone-950 font-black rounded-xl text-xs hover:bg-stone-200 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-stone-950" />
                  <span>พิมพ์ใบสรุป / บันทึก PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = viewingSettlementVoucher;
                    setViewingSettlementVoucher(null);
                    handleRequestCancelSettlement(target);
                  }}
                  className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="ยกเลิกการเคลียร์ยอดใบสรุปนี้ (ต้องใส่รหัส Admin) รายการสินค้าจะกลับมารอเคลียร์ใหม่"
                >
                  <RotateCcw className="w-4 h-4 text-rose-700" />
                  <span>ยกเลิกการเคลียร์ยอดนี้</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingSettlementVoucher(null)}
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl shadow-md text-xs border border-amber-500 cursor-pointer"
              >
                ปิดหน้าต่างนี้
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN PASSCODE CONFIRMATION FOR CANCELING SETTLEMENT */}
      {settlementToCancel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-white border-2 border-rose-500 rounded-3xl max-w-md w-full p-6 text-stone-950 shadow-2xl space-y-4 text-left animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex justify-between items-center border-b-2 border-rose-200 pb-3">
              <div className="flex items-center gap-2 text-rose-700">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <Lock className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base text-stone-950">
                    ยืนยันยกเลิกการเคลียร์ยอด (ต้องใส่รหัส Admin)
                  </h3>
                  <span className="text-[10px] text-rose-600 font-extrabold block">
                    Security Passcode Required - Rollback Settlement
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSettlementToCancel(null);
                  setCancelAdminPin('');
                  setCancelPinError('');
                }}
                className="text-stone-500 hover:text-stone-950 p-1 rounded-full border border-stone-300 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Settlement Details Preview Card */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-bold">เลขที่ใบเคลียร์:</span>
                <span className="font-mono font-black text-amber-950">{settlementToCancel.id}</span>
              </div>

              <div className="flex items-center justify-between border-t border-rose-200/60 pt-1.5">
                <span className="text-stone-600 font-bold">วันที่เคลียร์:</span>
                <span className="font-mono text-stone-950 font-bold">{formatThaiDateTime(settlementToCancel.settledAt)}</span>
              </div>

              <div className="flex items-center justify-between border-t border-rose-200/60 pt-1.5">
                <span className="text-stone-600 font-bold">Supplier:</span>
                <span className="font-black text-stone-950">{settlementToCancel.supplierName}</span>
              </div>

              <div className="flex items-center justify-between border-t border-rose-200/60 pt-1.5">
                <span className="text-stone-600 font-bold">จำนวนสินค้าที่เคลียร์:</span>
                <span className="font-black text-emerald-800 font-mono text-sm">{settlementToCancel.totalItemsCount} ชิ้น</span>
              </div>

              <div className="flex items-center justify-between border-t border-rose-200/60 pt-1.5">
                <span className="text-stone-600 font-bold">ยอดเงินต้นทุนรวม:</span>
                <span className="font-black text-amber-900 font-serif text-sm">฿{settlementToCancel.totalCostAmount.toLocaleString()}</span>
              </div>

              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 mt-2 text-[11px] text-emerald-950 font-bold space-y-1">
                <p className="font-black text-emerald-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>ผลลัพธ์ของการกดยกเลิก:</span>
                </p>
                <p>
                  รายการสินค้าทั้งหมด <strong>{settlementToCancel.totalItemsCount} ชิ้น</strong> ในใบเคลียร์นี้ จะถูกคืนสถานะกลับไปเป็น <strong>"รอเคลียร์ยอด (Unsettled)"</strong> ตามเดิม เพื่อให้สามารถตรวจสอบหรือรวมเคลียร์ในรอบถัดไปได้ 100%
                </p>
              </div>
            </div>

            {/* Admin Password Form */}
            <form onSubmit={handleConfirmCancelSettlement} className="space-y-3 pt-1">
              <div>
                <label className="block text-stone-950 font-black mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-rose-600" />
                    <span>ใส่รหัสผ่าน Admin เพื่อยืนยันการยกเลิก *</span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-bold">
                    (รหัสเริ่มต้น: 1077)
                  </span>
                </label>

                <div className="relative flex items-center">
                  <input
                    type={showCancelPin ? 'text' : 'password'}
                    required
                    autoFocus
                    value={cancelAdminPin}
                    onChange={(e) => {
                      setCancelAdminPin(e.target.value);
                      setCancelPinError('');
                    }}
                    placeholder="กรอกรหัส Admin เช่น 1077"
                    className="w-full bg-white border-2 border-rose-400 rounded-xl p-3 pr-20 text-stone-950 font-mono font-black text-center text-lg tracking-widest focus:outline-none focus:border-rose-600 shadow-inner"
                  />

                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowCancelPin((prev) => !prev)}
                      className="p-1.5 text-stone-500 hover:text-stone-950 rounded-lg cursor-pointer"
                      title={showCancelPin ? 'ซ่อนรหัส' : 'แสดงรหัส'}
                    >
                      {showCancelPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <VoiceInputButton
                      isNumber={true}
                      onTranscript={(text) => {
                        const num = text.replace(/[^0-9]/g, '');
                        if (num) {
                          setCancelAdminPin(num);
                          setCancelPinError('');
                        }
                      }}
                      onNumberTranscript={(num) => {
                        setCancelAdminPin(String(num));
                        setCancelPinError('');
                      }}
                      className="scale-90"
                      title="พูดรหัสผ่าน Admin"
                    />
                  </div>
                </div>

                {cancelPinError && (
                  <p className="text-xs font-black text-red-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{cancelPinError}</span>
                  </p>
                )}
              </div>

              {/* Quick PIN Keypad */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-stone-500 font-bold block text-center">
                  กดปุ่มตัวเลขรวดเร็ว (Quick Keypad):
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {['1077', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'C'].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        if (key === 'C') {
                          setCancelAdminPin('');
                          setCancelPinError('');
                        } else if (key === '1077') {
                          setCancelAdminPin('1077');
                          setCancelPinError('');
                        } else {
                          setCancelAdminPin((prev) => prev + key);
                          setCancelPinError('');
                        }
                      }}
                      className={`py-2 text-xs font-black rounded-lg transition cursor-pointer border shadow-2xs ${
                        key === '1077'
                          ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 border-amber-500 font-mono'
                          : key === 'C'
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-950 border-stone-300'
                      }`}
                    >
                      {key === '1077' ? '🔑 1077' : key === 'C' ? 'ล้าง' : key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setSettlementToCancel(null);
                    setCancelAdminPin('');
                    setCancelPinError('');
                  }}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-950 font-black rounded-xl text-xs transition cursor-pointer"
                >
                  ปิด / ไม่ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-md border border-rose-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-white" />
                  <span>ยืนยันยกเลิกการเคลียร์ยอด</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 4: ADMIN PASSCODE CONFIRMATION FOR DELETING STOCK MOVEMENT */}
      {movementToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-white border-2 border-red-500 rounded-3xl max-w-md w-full p-6 text-stone-950 shadow-2xl space-y-4 text-left animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex justify-between items-center border-b-2 border-red-200 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Lock className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base text-stone-950">
                    ยืนยันลบรายการ (ต้องใส่รหัส Admin)
                  </h3>
                  <span className="text-[10px] text-red-600 font-extrabold block">
                    Security Passcode Required
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMovementToDelete(null);
                  setAdminPinInput('');
                  setPinError('');
                }}
                className="text-stone-500 hover:text-stone-950 p-1 rounded-full border border-stone-300 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Movement Details Preview Card */}
            <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-bold">ประเภทรายการ:</span>
                {movementToDelete.type === 'IN' ? (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-950 border border-emerald-400 font-black text-[11px] flex items-center gap-1">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" /> สินค้าเข้า (Stock IN)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-950 border border-amber-400 font-black text-[11px] flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-700" /> สินค้าออก (Stock OUT)
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-2 border-t border-red-200/60 pt-1.5">
                <span className="text-stone-600 font-bold shrink-0">สินค้า / ไซส์:</span>
                <span className="font-black text-stone-950 text-right">
                  {movementToDelete.productTitle}
                  <span className="block text-[11px] text-stone-700 font-bold">{movementToDelete.variantName}</span>
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-red-200/60 pt-1.5">
                <span className="text-stone-600 font-bold">จำนวน:</span>
                <span className="font-black text-stone-950 font-mono text-sm">
                  {movementToDelete.type === 'IN' ? `+${movementToDelete.quantity}` : `-${movementToDelete.quantity}`} ชิ้น
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-red-200/60 pt-1.5">
                <span className="text-stone-600 font-bold">Supplier / ต้นทุนรวม:</span>
                <span className="font-black text-amber-950">
                  {movementToDelete.supplierName} (฿{movementToDelete.totalCost.toLocaleString()})
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-red-200/60 pt-1.5">
                <span className="text-stone-600 font-bold">หมายเหตุ / DO:</span>
                <span className="font-bold text-stone-800 font-mono">
                  {movementToDelete.note || '-'}
                </span>
              </div>
            </div>

            {/* If Stock IN: Option to automatically revert/deduct stock back */}
            {movementToDelete.type === 'IN' && (
              <label className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-300 rounded-xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={revertStockOnDelete}
                  onChange={(e) => setRevertStockOnDelete(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 border-stone-300 focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-xs font-black text-amber-950">
                  ปรับลดสต๊อกสินค้าคืนตามจำนวนที่รับเข้า (-{movementToDelete.quantity} ชิ้น)
                </span>
              </label>
            )}

            {/* Admin Password Form */}
            <form onSubmit={handleConfirmDeleteMovement} className="space-y-3 pt-1">
              <div>
                <label className="block text-stone-950 font-black mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-red-600" />
                    <span>ใส่รหัสผ่าน Admin เพื่อยืนยันการลบ *</span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-bold">
                    (รหัสเริ่มต้น: 1077)
                  </span>
                </label>

                <div className="relative flex items-center">
                  <input
                    type={showAdminPin ? 'text' : 'password'}
                    required
                    autoFocus
                    value={adminPinInput}
                    onChange={(e) => {
                      setAdminPinInput(e.target.value);
                      setPinError('');
                    }}
                    placeholder="กรอกรหัส Admin เช่น 1077"
                    className="w-full bg-white border-2 border-red-400 rounded-xl p-3 pr-20 text-stone-950 font-mono font-black text-center text-lg tracking-widest focus:outline-none focus:border-red-600 shadow-inner"
                  />

                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowAdminPin((prev) => !prev)}
                      className="p-1.5 text-stone-500 hover:text-stone-950 rounded-lg cursor-pointer"
                      title={showAdminPin ? 'ซ่อนรหัส' : 'แสดงรหัส'}
                    >
                      {showAdminPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <VoiceInputButton
                      isNumber={true}
                      onTranscript={(text) => {
                        const num = text.replace(/[^0-9]/g, '');
                        if (num) {
                          setAdminPinInput(num);
                          setPinError('');
                        }
                      }}
                      onNumberTranscript={(num) => {
                        setAdminPinInput(String(num));
                        setPinError('');
                      }}
                      className="scale-90"
                      title="พูดรหัสผ่าน Admin"
                    />
                  </div>
                </div>

                {pinError && (
                  <p className="text-xs font-black text-red-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setMovementToDelete(null);
                    setAdminPinInput('');
                    setPinError('');
                  }}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-950 font-black rounded-xl text-xs transition cursor-pointer"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer border border-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ยืนยันลบรายการนี้</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE PREVIEW MODAL */}
      {previewSlipModalUrl && (
        <div
          onClick={() => setPreviewSlipModalUrl(null)}
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[90vh] bg-white p-3 rounded-2xl shadow-2xl flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between pb-2 px-2 border-b border-stone-200">
              <span className="font-serif font-black text-sm text-stone-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>รูปภาพหลักฐานการโอนเงิน / สลิป Supplier</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewSlipModalUrl(null)}
                className="p-1 rounded-full text-stone-600 hover:text-stone-950 hover:bg-stone-100 border border-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[80vh] p-2">
              <img
                src={previewSlipModalUrl}
                alt="สลิปหลักฐานการโอนเงิน"
                className="max-h-[75vh] w-auto object-contain rounded-xl mx-auto shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: RECORD RETURN TO SUPPLIER MODAL */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="relative bg-white border-2 border-rose-500 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col text-stone-950 shadow-2xl text-left overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-rose-200 p-4 sm:p-5 shrink-0 bg-rose-50/80 z-10 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base sm:text-lg text-rose-950 flex items-center gap-2">
                    <span>บันทึกส่งคืนสินค้าให้ซัพพลายเออร์ (Return / Debit Note)</span>
                  </h3>
                  <p className="text-[11px] text-stone-600 font-medium">
                    ระบบจะตัดลดสต็อกสินค้าออกให้อัตโนมัติ พร้อมออกใบส่งคืนสินค้าสำหรับให้ซัพพลายเออร์เซ็นรับของ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="text-stone-700 hover:text-stone-950 p-1.5 rounded-full border border-stone-300 hover:bg-stone-100 transition shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveSupplierReturn} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Row 1: Supplier & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-950 font-black mb-1">
                    ซัพพลายเออร์ที่ต้องการส่งคืน *
                  </label>
                  <select
                    value={returnSupplierName}
                    onChange={(e) => setReturnSupplierName(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-stone-400 focus:border-rose-500 rounded-xl p-2.5 text-stone-950 font-black focus:outline-none cursor-pointer"
                  >
                    {supplierOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-950 font-black mb-1">
                    วันที่ส่งคืนสินค้า *
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-stone-400 focus:border-rose-500 rounded-xl p-2.5 text-stone-950 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Staff & Receiver */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-950 font-black mb-1">
                    พนักงานผู้ทำรายการส่งคืน *
                  </label>
                  <input
                    type="text"
                    value={returnStaff}
                    onChange={(e) => setReturnStaff(e.target.value)}
                    required
                    placeholder="เช่น เจ้าของร้าน (Admin) หรือชื่อพนักงาน"
                    className="w-full bg-white border-2 border-stone-400 focus:border-rose-500 rounded-xl p-2.5 text-stone-950 font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-950 font-black mb-1">
                    ตัวแทน Supplier ผู้รับของ (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={returnReceiver}
                    onChange={(e) => setReturnReceiver(e.target.value)}
                    placeholder="เช่น คุณวิเชียร (เซลส์) หรือ ขนส่ง Flash / Kerry"
                    className="w-full bg-white border-2 border-stone-400 focus:border-rose-500 rounded-xl p-2.5 text-stone-950 font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Section: Add Items to Return */}
              <div className="bg-rose-50/80 border-2 border-rose-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-rose-200/80 pb-2">
                  <span className="font-serif font-black text-rose-950 text-sm flex items-center gap-1.5">
                    <span>➕ เพิ่มรายการสินค้าที่ส่งคืน</span>
                    <span className="text-[10px] font-sans font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                      ใส่ได้หลายรายการในใบเดียว
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsQRScannerReturnOpen(true)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer border border-rose-700"
                    title="เปิดกล้องสแกน QR Code หรือ บาร์โค้ด สินค้าเพื่อเลือกสินค้าส่งคืนอัตโนมัติ"
                  >
                    <QrCode className="w-3.5 h-3.5 text-white" />
                    <span>📸 สแกน QR / บาร์โค้ด คืนของ</span>
                  </button>
                </div>

                {/* Product & Variant Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-900 font-bold mb-1">1. เลือกสินค้า *</label>
                    <select
                      value={selectedReturnProductId}
                      onChange={(e) => handleReturnProductChange(e.target.value)}
                      className="w-full bg-white border-2 border-stone-300 focus:border-rose-500 rounded-xl p-2 text-stone-950 font-black focus:outline-none cursor-pointer"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-900 font-bold mb-1">
                      2. เลือกไซส์ / สี (แบบย่อย) *
                    </label>
                    {(() => {
                      const selectedProd = products.find((p) => p.id === selectedReturnProductId);
                      const currentVar = selectedProd?.variants.find((v) => v.id === selectedReturnVariantId);
                      const inStock = currentVar ? (typeof currentVar.stockQuantity === 'number' ? currentVar.stockQuantity : 0) : 0;

                      return (
                        <div>
                          <select
                            value={selectedReturnVariantId}
                            onChange={(e) => handleReturnVariantChange(e.target.value)}
                            className="w-full bg-white border-2 border-stone-300 focus:border-rose-500 rounded-xl p-2 text-stone-950 font-black focus:outline-none cursor-pointer"
                          >
                            {(selectedProd?.variants || []).map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.name} — คงเหลือ {v.stockQuantity || 0} ชิ้น (ทุน: ฿{(v.costPrice !== undefined ? v.costPrice : (selectedProd?.costPrice || 0)).toLocaleString()})
                              </option>
                            ))}
                          </select>
                          <div className="text-[10px] text-stone-600 mt-1 flex justify-between font-bold">
                            <span>สต็อกคงเหลือปัจจุบัน:</span>
                            <span className={inStock > 0 ? "text-emerald-700 font-black font-mono" : "text-red-600 font-black font-mono"}>
                              {inStock} ชิ้น {inStock === 0 && '(สินค้าหมด)'}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Qty, Cost & Reason */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-900 font-bold mb-1">จำนวนที่ส่งคืน (ชิ้น) *</label>
                    <input
                      type="number"
                      min="1"
                      value={returnItemQty}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReturnItemQty(val === '' ? '' : Math.max(1, parseInt(val, 10) || 1));
                      }}
                      className="w-full bg-white border-2 border-stone-300 focus:border-rose-500 rounded-xl p-2 text-stone-950 font-mono font-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-900 font-bold mb-1">ราคาต้นทุน/ชิ้น (บาท)</label>
                    <input
                      type="number"
                      min="0"
                      value={returnItemCostPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReturnItemCostPrice(val === '' ? '' : Math.max(0, parseFloat(val) || 0));
                      }}
                      className="w-full bg-white border-2 border-stone-300 focus:border-rose-500 rounded-xl p-2 text-stone-950 font-mono font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-900 font-bold mb-1">เหตุผลการส่งคืน *</label>
                    <select
                      value={returnItemReason}
                      onChange={(e) => setReturnItemReason(e.target.value)}
                      className="w-full bg-white border-2 border-stone-300 focus:border-rose-500 rounded-xl p-2 text-stone-950 font-bold focus:outline-none cursor-pointer"
                    >
                      {RETURN_REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {returnItemReason === 'อื่นๆ (ระบุเอง)' && (
                  <div>
                    <label className="block text-stone-900 font-bold mb-1">ระบุเหตุผลการส่งคืน:</label>
                    <input
                      type="text"
                      value={returnCustomReason}
                      onChange={(e) => setReturnCustomReason(e.target.value)}
                      placeholder="เช่น ขอลดไซส์, ส่งของไม่ตรงสเปก, ฯลฯ"
                      className="w-full bg-white border-2 border-stone-300 focus:border-rose-500 rounded-xl p-2 text-stone-950 font-bold focus:outline-none"
                    />
                  </div>
                )}

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddItemToReturnCart}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <span>➕ เพิ่มสินค้านี้ลงใบส่งคืน</span>
                  </button>
                </div>
              </div>

              {/* Items Table in this Return Voucher */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-black text-stone-950 text-sm">
                    รายการที่จะส่งคืนในใบนี้ ({returnCartItems.length} รายการ)
                  </span>
                  {returnCartItems.length > 0 && (
                    <span className="text-stone-600 font-bold text-[11px]">
                      รวม: <strong className="text-rose-950 font-mono">{returnCartItems.reduce((s, i) => s + i.quantity, 0)}</strong> ชิ้น | มูลค่า: <strong className="text-rose-950 font-mono">฿{returnCartItems.reduce((s, i) => s + i.totalCost, 0).toLocaleString()}</strong> บาท
                    </span>
                  )}
                </div>

                {returnCartItems.length === 0 ? (
                  <div className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-xl p-6 text-center text-stone-500 font-bold">
                    ยังไม่มีสินค้าในใบส่งคืน กรุณาเลือกสินค้าและกดปุ่ม "เพิ่มสินค้านี้ลงใบส่งคืน" ด้านบนครับ
                  </div>
                ) : (
                  <div className="border-2 border-stone-300 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-gradient-to-r from-stone-100 to-amber-50/50 border-b-2 border-stone-200 font-black text-stone-900">
                          <th className="p-3 text-center w-12">ลำดับ</th>
                          <th className="p-3">สินค้า / ไซส์ / ล็อต</th>
                          <th className="p-3">เหตุผลการคืน</th>
                          <th className="p-3 text-center">จำนวน (ชิ้น)</th>
                          <th className="p-3 text-right">ทุน/ชิ้น</th>
                          <th className="p-3 text-right">มูลค่ารวม</th>
                          <th className="p-3 text-center w-12">ลบ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {returnCartItems.map((item, idx) => {
                          const matchedProd = products.find((p) => p.id === item.productId);
                          const img = matchedProd?.images?.[0];
                          return (
                            <tr key={idx} className="hover:bg-amber-50/40 transition">
                              <td className="p-3 font-mono font-black text-stone-400 text-center">{idx + 1}</td>
                              <td className="p-3 font-bold text-stone-950">
                                <div className="flex items-center gap-2.5">
                                  {img ? (
                                    <img src={img} alt="" className="w-10 h-10 rounded-xl object-cover border border-stone-200 shadow-2xs shrink-0" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-sm shadow-2xs shrink-0">👗</div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="font-black text-stone-950 truncate max-w-xs">{item.productTitle}</div>
                                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                      <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-800 text-[10px] font-black border border-stone-200">
                                        {item.variantName}
                                      </span>
                                      {item.lotNumber && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-950 text-[10px] font-mono font-bold border border-amber-300">
                                          {item.lotNumber}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="bg-rose-100 text-rose-950 px-2 py-1 rounded-lg text-[10px] font-black border border-rose-300 inline-block">
                                  {item.reason}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <div className="inline-flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-300 shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateReturnCartItemQty(idx, -1)}
                                    className="w-6 h-6 rounded-lg bg-white hover:bg-stone-200 text-stone-800 font-black text-xs flex items-center justify-center border border-stone-300 cursor-pointer"
                                    title="ลดจำนวน -1"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono font-black text-stone-950 px-2 min-w-7 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateReturnCartItemQty(idx, 1)}
                                    className="w-6 h-6 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center cursor-pointer shadow-2xs"
                                    title="เพิ่มจำนวน +1"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-stone-700">฿{item.costPrice.toLocaleString()}</td>
                              <td className="p-3 text-right font-mono font-black text-rose-950 text-sm">฿{item.totalCost.toLocaleString()}</td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItemFromReturnCart(idx)}
                                  className="w-7 h-7 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-black inline-flex items-center justify-center border border-rose-200 cursor-pointer shadow-2xs"
                                  title="ลบรายการนี้"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-stone-50 border-t-2 border-stone-200 font-black text-stone-900">
                          <td colSpan={3} className="p-3 text-right font-serif text-sm">
                            รวมสินค้าที่จะส่งคืนทั้งหมด:
                          </td>
                          <td className="p-3 text-center font-mono text-sm text-rose-950">
                            {returnCartItems.reduce((s, i) => s + i.quantity, 0)} ชิ้น
                          </td>
                          <td></td>
                          <td className="p-3 text-right font-mono text-base text-rose-950">
                            ฿{returnCartItems.reduce((s, i) => s + i.totalCost, 0).toLocaleString()}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Note & Slip/Photo Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-stone-900 font-black mb-1">
                    หมายเหตุเพิ่มเติม (ถ้ามี)
                  </label>
                  <textarea
                    rows={2}
                    value={returnNote}
                    onChange={(e) => setReturnNote(e.target.value)}
                    placeholder="เช่น สินค้ามีรอยเปื้อน ส่งคืนขนส่ง Flash เลขพัสดุ TH12345"
                    className="w-full bg-white border-2 border-stone-300 focus:border-rose-500 rounded-xl p-2.5 text-stone-950 font-bold focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-900 font-black mb-1 flex items-center justify-between">
                    <span>แนบรูปหลักฐาน (รูปตำหนิ/ใบเซ็นรับ/สลิป)</span>
                    {returnSlipUrl && (
                      <button
                        type="button"
                        onClick={() => setReturnSlipUrl('')}
                        className="text-[10px] text-red-600 hover:text-red-800 font-bold"
                      >
                        ลบรูป
                      </button>
                    )}
                  </label>
                  {returnSlipUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border border-rose-300 w-20 h-20">
                      <img src={returnSlipUrl} alt="รูปหลักฐานการคืน" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReturnSlipUpload}
                      className="w-full text-xs text-stone-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-rose-100 file:text-rose-900 hover:file:bg-rose-200 cursor-pointer"
                    />
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 border-t-2 border-rose-200 flex items-center justify-end gap-2 shrink-0 z-10">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 border border-stone-300 text-stone-950 font-black rounded-xl hover:bg-stone-200 cursor-pointer text-xs"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  disabled={returnCartItems.length === 0}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black rounded-xl shadow-md border border-rose-700 cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>บันทึกส่งคืน &amp; ตัดสต็อกสินค้าทันที</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: OFFICIAL PRINTABLE SUPPLIER RETURN VOUCHER (DEBIT NOTE) */}
      {viewingReturnVoucher && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="relative bg-white border-2 border-stone-300 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-stone-950 shadow-2xl space-y-6 text-left my-4">
            
            {/* Header Document Branding */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-stone-300 pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-stone-950 text-amber-400 font-serif font-black flex items-center justify-center text-lg shadow-sm">
                    H
                  </div>
                  <div>
                    <h2 className="font-serif font-black text-lg text-stone-950 uppercase tracking-wider">
                      {storeSettings.storeName || 'HUDA ABAYA DUBAI'}
                    </h2>
                    <p className="text-[10px] text-stone-600 font-bold">
                      {storeSettings.storeTagline || 'ฮูดา อาบายะห์ ดูไบ • ศูนย์รวมอาบายะห์และน้ำหอมดูไบแท้'}
                    </p>
                  </div>
                </div>
                <div className="text-[11px] text-stone-600 mt-2 space-y-0.5">
                  <p>โทร: <span className="font-mono font-bold text-stone-900">{storeSettings.contactPhone || '083-427-4687'}</span></p>
                  <p>LINE: <span className="font-mono font-bold text-stone-900">{storeSettings.contactLine || '@hudaabaya'}</span></p>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <span className="px-2.5 py-1 bg-rose-100 text-rose-900 font-black text-[11px] rounded-md border border-rose-300 inline-block uppercase tracking-wider">
                  GOODS RETURN NOTE / DEBIT NOTE
                </span>
                <h3 className="font-serif font-black text-base sm:text-lg text-rose-950 mt-1">
                  ใบส่งคืนสินค้า / ใบลดหนี้
                </h3>
                <div className="text-xs text-stone-700 mt-1 space-y-0.5">
                  <p>เลขที่เอกสาร: <strong className="font-mono text-rose-950 font-black">{viewingReturnVoucher.id}</strong></p>
                  <p>วันที่ส่งคืน: <strong className="font-bold text-stone-900">{formatThaiDateOnly(viewingReturnVoucher.returnDate)}</strong></p>
                </div>
              </div>
            </div>

            {/* Supplier & Courier Info */}
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-stone-500 font-black block uppercase">ถึง (ซัพพลายเออร์):</span>
                <div className="font-black text-stone-950 text-sm mt-0.5">{viewingReturnVoucher.supplierName}</div>
                {viewingReturnVoucher.receiverName && (
                  <div className="text-stone-600 mt-0.5">ตัวแทนผู้รับมอบ: <strong>{viewingReturnVoucher.receiverName}</strong></div>
                )}
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] text-stone-500 font-black block uppercase">ผู้ส่งมอบ (ร้านค้า):</span>
                <div className="font-bold text-stone-900 mt-0.5">ตัวแทนร้าน HUDA ABAYA ({viewingReturnVoucher.performedBy})</div>
                <div className="text-stone-500 text-[10px] mt-0.5 font-mono">บันทึกเมื่อ: {formatThaiDateTime(viewingReturnVoucher.createdAt)}</div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-2 border-stone-300 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-300 text-stone-900 font-black">
                    <th className="p-2.5 text-center w-10">ลำดับ</th>
                    <th className="p-2.5">รายการสินค้า / ไซส์ / สี</th>
                    <th className="p-2.5">เหตุผลที่ส่งคืน</th>
                    <th className="p-2.5 text-center">จำนวน</th>
                    <th className="p-2.5 text-right">ทุน/หน่วย</th>
                    <th className="p-2.5 text-right">มูลค่ารวม (บาท)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {viewingReturnVoucher.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="p-2.5 text-center font-mono text-stone-500">{idx + 1}</td>
                      <td className="p-2.5">
                        <div className="font-black text-stone-950">{item.productTitle}</div>
                        <div className="text-[10px] text-stone-600">{item.variantName}</div>
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-900 border border-rose-200 rounded text-[10px] font-bold">
                          {item.reason}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-mono font-black">{item.quantity} ชิ้น</td>
                      <td className="p-2.5 text-right font-mono">฿{item.costPrice.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-mono font-black text-rose-950">฿{item.totalCost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-rose-50/80 font-black text-stone-950 border-t-2 border-stone-300 text-xs">
                    <td colSpan={3} className="p-2.5 text-right">ยอดรวมสินค้าที่ส่งคืนทั้งสิ้น:</td>
                    <td className="p-2.5 text-center font-mono text-sm text-rose-950">{viewingReturnVoucher.totalQuantity} ชิ้น</td>
                    <td className="p-2.5 text-right">รวมเป็นเงิน:</td>
                    <td className="p-2.5 text-right font-mono text-base text-rose-950">฿{viewingReturnVoucher.totalReturnCost.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Note & Photo */}
            {viewingReturnVoucher.note && (
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
                <span className="font-black text-stone-900 block">หมายเหตุ:</span>
                <p className="text-stone-700 mt-0.5">{viewingReturnVoucher.note}</p>
              </div>
            )}

            {viewingReturnVoucher.proofImageUrl && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <span className="font-black text-xs text-stone-900 block">รูปภาพหลักฐานประกอบ:</span>
                <img
                  src={viewingReturnVoucher.proofImageUrl}
                  alt="รูปหลักฐาน"
                  onClick={() => setPreviewSlipModalUrl(viewingReturnVoucher.proofImageUrl!)}
                  className="max-h-36 object-contain rounded-lg border border-stone-300 cursor-pointer hover:opacity-90"
                />
              </div>
            )}

            {/* Official Signature Lines */}
            <div className="pt-4 border-t-2 border-stone-300 grid grid-cols-2 gap-6 text-xs text-stone-900">
              <div className="text-center space-y-6">
                <p className="font-black">ผู้ส่งคืนสินค้า (ร้าน HUDA ABAYA)</p>
                <div className="pt-8 border-b border-stone-400 mx-auto max-w-[200px]"></div>
                <div className="text-[11px] text-stone-600">
                  <p>(........................................................)</p>
                  <p className="mt-1">วันที่ ..... / ..... / .........</p>
                </div>
              </div>

              <div className="text-center space-y-6">
                <p className="font-black">ผู้รับคืนสินค้า (สำหรับ Supplier / ตัวแทน)</p>
                <div className="pt-8 border-b border-stone-400 mx-auto max-w-[200px]"></div>
                <div className="text-[11px] text-stone-600">
                  <p>(........................................................)</p>
                  <p className="mt-1">วันที่ ..... / ..... / .........</p>
                </div>
              </div>
            </div>

            {/* Action Buttons (Hidden during window.print) */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-2 print:hidden">
              <button
                type="button"
                onClick={() => handleCancelReturnVoucher(viewingReturnVoucher)}
                className="px-3.5 py-2 bg-stone-100 hover:bg-red-50 text-red-700 font-bold rounded-xl border border-stone-300 hover:border-red-300 text-xs transition cursor-pointer flex items-center gap-1"
                title="ยกเลิกใบส่งคืนนี้และดึงสต็อกกลับ"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ยกเลิกใบส่งคืน &amp; ดึงสต็อกกลับ</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>🖨️ พิมพ์ใบส่งคืนสินค้า (Print / PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReturnVoucher(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-950 font-black rounded-xl border border-stone-300 text-xs cursor-pointer"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR & BARCODE SCANNER MODAL FOR SUPPLIER RETURN */}
      <QRScannerModal
        isOpen={isQRScannerReturnOpen}
        onClose={() => {
          setIsQRScannerReturnOpen(false);
          setIsReturnModalOpen(true);
        }}
        onScan={handleReturnQRScan}
        title="⚡ สแกน QR / บาร์โค้ด ส่งคืน Supplier (ยิงรัวต่อเนื่อง)"
        subtitle="นำกล้องส่องที่ป้าย QR Code หรือบาร์โค้ดสินค้า ระบบจะเพิ่มลงรายการส่งคืนให้อัตโนมัติทีละชิ้นต่อเนื่อง"
        continuous={true}
        scannedFeed={returnScannedFeed}
        onAdjustQuantity={handleAdjustReturnFeedQty}
        onDeleteItem={handleDeleteReturnFeedItem}
      />

      {/* QR & BARCODE SCANNER MODAL FOR STOCK IN */}
      <QRScannerModal
        isOpen={isQRScannerStockInOpen}
        onClose={() => setIsQRScannerStockInOpen(false)}
        onScan={handleStockInQRScan}
        title="สแกน QR Code / บาร์โค้ด เพื่อรับสินค้าเข้าสต๊อก"
        subtitle="นำกล้องส่องที่ป้าย QR Code หรือ บาร์โค้ดสินค้า ระบบจะเลือกสินค้า ไซส์ และล็อตให้อัตโนมัติ"
      />

    </div>
  );
};
