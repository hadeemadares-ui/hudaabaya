'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Truck, DollarSign, PackageCheck, Plus, Search, Calendar, FileText, CheckCircle2, AlertCircle, Sparkles, Filter, ChevronRight, ChevronDown, X, Printer, ArrowDownLeft, ArrowUpRight, CheckSquare, Square, Check, Trash2, Lock, KeyRound, Eye, EyeOff, Upload, Image as ImageIcon, Camera } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { StockMovement, SupplierSettlement } from '../../types';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { ColorIndicator, getEffectiveVariantColor } from '../../utils/colorUtils';

export const AdminSupplierSettlementManager: React.FC = () => {
  const {
    products,
    stockMovements,
    supplierSettlements,
    recordStockIn,
    deleteStockMovement,
    verifyAdminPasscode,
    createSupplierSettlement,
    storeSettings,
    saveCustomOption,
  } = useShop();

  const [activeSubTab, setActiveSubTab] = useState<'payouts' | 'logs' | 'history'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get('subtab') || params.get('sub');
      if (sub === 'payouts' || sub === 'settlement') return 'payouts';
      if (sub === 'history') return 'history';
      if (sub === 'logs' || sub === 'stock') return 'logs';
    }
    return 'logs';
  });
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState<string>('all');
  const [movementSearchQuery, setMovementSearchQuery] = useState<string>('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<'all' | 'IN' | 'OUT'>('all');
  const [logStartDateTime, setLogStartDateTime] = useState<string>('');
  const [logEndDateTime, setLogEndDateTime] = useState<string>('');

  const setQuickDatePreset = (preset: 'today' | '7days' | '30days' | 'all') => {
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

  // Modal States
  const [isStockInModalOpen, setIsStockInModalOpen] = useState<boolean>(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState<boolean>(false);
  const [viewingSettlementVoucher, setViewingSettlementVoucher] = useState<SupplierSettlement | null>(null);

  // Delete Stock Movement State & Admin Passcode Confirmation
  const [movementToDelete, setMovementToDelete] = useState<StockMovement | null>(null);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [showAdminPin, setShowAdminPin] = useState<boolean>(false);
  const [revertStockOnDelete, setRevertStockOnDelete] = useState<boolean>(true);

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

  // Stock In Form State
  const [stockInProductId, setStockInProductId] = useState<string>('');
  const [stockInVariantId, setStockInVariantId] = useState<string>('');
  const [stockInQty, setStockInQty] = useState<number | ''>('');
  const [stockInCostPrice, setStockInCostPrice] = useState<number | ''>('');
  const [stockInSupplierName, setStockInSupplierName] = useState<string>('โรงงานอาบายะห์ดูไบ');
  const [stockInNote, setStockInNote] = useState<string>('');

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

  // Auto-listen and pick up pending Stock IN requests from AdminProductManager
  useEffect(() => {
    const applyStockInData = (data: { productId?: string; variantId?: string; costPrice?: number }) => {
      if (data.productId) {
        setStockInProductId(data.productId);
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
      (m.referenceOrderNo && m.referenceOrderNo.toLowerCase().includes(movementSearchQuery.toLowerCase()));
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
    });

    setIsStockInModalOpen(false);
    setStockInProductId('');
    setStockInVariantId('');
    setStockInQty('');
    setStockInCostPrice('');
    setStockInNote('');

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

    deleteStockMovement(movementToDelete.id, revertStockOnDelete);
    alert(`ลบรายการ ${movementToDelete.type === 'IN' ? 'รับสินค้าเข้า' : 'สินค้าออก'} "${movementToDelete.productTitle} (${movementToDelete.variantName})" เรียบร้อยแล้ว!`);
    setMovementToDelete(null);
    setAdminPinInput('');
    setPinError('');
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
                                  <span className="text-stone-950 font-black block truncate">{m.productTitle}</span>
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

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs text-left text-stone-950">
                <thead className="bg-amber-100 text-stone-950 font-serif border-b-2 border-amber-400 font-black">
                  <tr>
                    <th className="py-3 px-3 text-center font-black w-10">เลือก</th>
                    <th className="py-3 px-3 font-black">วันที่ขายออก</th>
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
                      <td colSpan={8} className="py-8 text-center text-stone-700 font-black">
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
                          <td className="py-3 px-3 font-mono text-[11px] text-stone-800 font-bold">
                            {new Date(m.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
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
                >
                  วันนี้
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
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${!logStartDateTime && !logEndDateTime ? 'bg-white text-stone-950 shadow-2xs' : 'text-stone-600 hover:bg-white'}`}
                >
                  ทั้งหมด
                </button>
              </div>

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

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-xs text-left text-stone-950">
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
                  <th className="py-3 px-3 font-black text-center w-24">จัดการ</th>
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
                        if (!isNaN(startTime) && mTime < startTime) return false;
                      }
                      if (logEndDateTime) {
                        const endTime = new Date(logEndDateTime).getTime();
                        if (!isNaN(endTime) && mTime > endTime + 59999) return false;
                      }
                    }
                    return true;
                  });

                  if (filteredMovements.length === 0) {
                    return (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-stone-700 font-black">
                          {stockMovements.length === 0
                            ? 'ยังไม่มีประวัติสินค้าเข้า-ออกในระบบ (เมื่อขายสินค้าออกหรือรับสินค้าเข้า ระบบจะบันทึกประวัติที่นี่อัตโนมัติ)'
                            : 'ไม่พบรายการประวัติตามช่วงวัน-เวลาหรือประเภทที่เลือก'}
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
                        <td className="py-3 px-3 font-mono text-[11px] text-stone-800 font-bold">
                          {new Date(m.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
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
                        <td className="py-3 px-3 text-stone-800 font-bold">{m.note || '-'}</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRequestDeleteMovement(m)}
                            className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-950 border border-red-300 rounded-xl text-xs font-black transition flex items-center gap-1 mx-auto cursor-pointer shadow-xs"
                            title="ลบรายการนี้ (ต้องใส่รหัส Admin)"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            <span>ลบ</span>
                          </button>
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

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-xs text-left text-stone-950">
              <thead className="bg-amber-100 text-stone-950 font-serif border-b-2 border-amber-400 font-black">
                <tr>
                  <th className="py-3 px-3 font-black">เลขที่ใบเคลียร์</th>
                  <th className="py-3 px-3 font-black">วันที่เคลียร์</th>
                  <th className="py-3 px-3 font-black">Supplier / โรงงาน</th>
                  <th className="py-3 px-3 font-black text-center">จำนวนรวม</th>
                  <th className="py-3 px-3 font-black text-right">ยอดเงินต้นทุนรวม</th>
                  <th className="py-3 px-3 font-black">อ้างอิงชำระเงิน</th>
                  <th className="py-3 px-3 font-black text-center">ใบสรุป</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {supplierSettlements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-700 font-black">
                      ยังไม่มีประวัติการกดเคลียร์ยอดเงิน Supplier ในระบบ
                    </td>
                  </tr>
                ) : (
                  supplierSettlements.map((s) => (
                    <tr key={s.id} className="hover:bg-amber-50/60 transition">
                      <td className="py-3 px-3 font-mono font-black text-amber-950">{s.id}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-stone-800 font-bold">
                        {new Date(s.settledAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
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
                        <button
                          onClick={() => setViewingSettlementVoucher(s)}
                          className="px-3 py-1 bg-amber-100 text-stone-950 border border-amber-400 hover:bg-amber-200 rounded-lg text-xs font-black transition flex items-center gap-1 mx-auto shadow-xs cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-700" />
                          <span>ดูใบสรุป</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
                    {new Date(viewingSettlementVoucher.settledAt).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}
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
            <div className="flex items-center justify-between pt-2">
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
                onClick={() => setViewingSettlementVoucher(null)}
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl shadow-md text-xs border border-amber-500 cursor-pointer"
              >
                ปิดหน้าต่างนี้
              </button>
            </div>
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

    </div>
  );
};
