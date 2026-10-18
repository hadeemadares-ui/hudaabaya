'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Edit2, Trash2, Layers, X, Search, Filter, Camera, Image as ImageIcon, Link as LinkIcon, Sparkles, Palette, CheckCircle2, RotateCcw, TrendingUp, FileSpreadsheet, ExternalLink, RefreshCw, CheckCircle, AlertCircle, HelpCircle, ChevronDown, Check, Lock, Unlock, KeyRound, Eye, EyeOff, ShieldAlert, PackagePlus } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, ProductVariant, CategoryType } from '../../types';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { sortProductsNatural } from '../../utils/productUtils';

export interface CategoryOptionItem {
  id: string;
  label: string;
  isBuiltin?: boolean;
}

export const DEFAULT_CATEGORY_OPTIONS: CategoryOptionItem[] = [
  { id: 'abaya', label: 'ชุดอาบายะห์ (Abaya)', isBuiltin: true },
  { id: 'kaftan', label: 'ชุดคัฟทาน (Kaftan)', isBuiltin: true },
  { id: 'perfume', label: 'น้ำหอมดูไบ (Dubai Perfume / Oud)', isBuiltin: true },
  { id: 'incense', label: 'เครื่องหอม / ไม้หอมดูไบ (Bukhoor / Incense)', isBuiltin: true },
  { id: 'combo', label: 'เซ็ตสุดคุ้ม (Combo Set)', isBuiltin: true },
  { id: 'other', label: 'อื่นๆ (ของเล่นเด็ก ขนม สินค้าทั่วไป)', isBuiltin: true },
];

export const AdminProductManager: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    updateVariantStock,
    deleteProduct,
    recordStockIn,
    selectedCategory,
    setSelectedCategory,
    syncProducts,
    syncFromGoogleSheet,
    storeSettings,
    verifyAdminPasscode,
  } = useShop();

  const [adminSearch, setAdminSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Quick Direct Stock IN Modal State (Instant In-Place)
  const [quickStockInItem, setQuickStockInItem] = useState<{
    productId: string;
    productTitle: string;
    variantId: string;
    variantName: string;
    currentStock: number;
    costPrice: number;
    color?: string;
  } | null>(null);
  const [quickStockInQty, setQuickStockInQty] = useState<string>('1');
  const [quickStockInCost, setQuickStockInCost] = useState<string>('');
  const [quickStockInSupplier, setQuickStockInSupplier] = useState<string>('โรงงานอาบายะห์ดูไบ');
  const [quickStockInNote, setQuickStockInNote] = useState<string>('รับเติมสต๊อกหน้าร้าน');
  const [highlightedVariantId, setHighlightedVariantId] = useState<string | null>(null);
  const [stockSuccessToast, setStockSuccessToast] = useState<{ message: string; submessage?: string } | null>(null);

  // Stock Editing Lock & PIN Modal State
  const [isStockEditUnlocked, setIsStockEditUnlocked] = useState(false);
  const [stockPinModalOpen, setStockPinModalOpen] = useState(false);
  const [stockPinInput, setStockPinInput] = useState('');
  const [stockPinError, setStockPinError] = useState('');
  const [showStockPin, setShowStockPin] = useState(false);
  const [pendingStockAction, setPendingStockAction] = useState<(() => void) | null>(null);

  // Quick Stock Adjust from Catalog Card State
  const [quickStockAdjustItem, setQuickStockAdjustItem] = useState<{
    productId: string;
    productTitle: string;
    variantId: string;
    variantName: string;
    currentStock: number;
    color?: string;
  } | null>(null);
  const [newStockInput, setNewStockInput] = useState<number>(0);

  const handleRequestStockUnlock = (onSuccessAction?: () => void) => {
    if (isStockEditUnlocked) {
      if (onSuccessAction) onSuccessAction();
      return;
    }
    setStockPinInput('');
    setStockPinError('');
    setShowStockPin(false);
    setPendingStockAction(() => onSuccessAction || null);
    setStockPinModalOpen(true);
  };

  const handleConfirmStockPin = () => {
    const trimmed = stockPinInput.trim();
    if (!trimmed) {
      setStockPinError('กรุณากรอกรหัสผ่าน Admin');
      return;
    }
    const isValid = verifyAdminPasscode(trimmed);
    if (!isValid) {
      setStockPinError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      setStockPinInput('');
      return;
    }

    setIsStockEditUnlocked(true);
    setStockPinModalOpen(false);
    setStockPinInput('');
    setStockPinError('');
    if (pendingStockAction) {
      pendingStockAction();
      setPendingStockAction(null);
    }
  };

  const handleOpenQuickStockAdjust = (
    prod: Product,
    v: ProductVariant
  ) => {
    handleRequestStockUnlock(() => {
      setQuickStockAdjustItem({
        productId: prod.id,
        productTitle: prod.title,
        variantId: v.id,
        variantName: v.name,
        currentStock: v.stockQuantity,
        color: v.color,
      });
      setNewStockInput(v.stockQuantity);
    });
  };

  // Instant Stock IN Handlers (Direct & Real-time inside Product Manager)
  useEffect(() => {
    const handleStockInCompleted = (e: any) => {
      if (e.detail?.variantId) {
        setHighlightedVariantId(e.detail.variantId);
        setTimeout(() => {
          setHighlightedVariantId(null);
        }, 4000);
      }
    };
    window.addEventListener('huda_stock_in_completed', handleStockInCompleted);
    return () => window.removeEventListener('huda_stock_in_completed', handleStockInCompleted);
  }, []);

  const handleOpenQuickStockIn = (prod: Product, v: ProductVariant) => {
    const costVal = v.costPrice ?? (v.price ? Math.round(v.price * 0.5) : 0);
    const defaultSupplier = (prod.category === 'perfume' || prod.category === 'incense')
      ? 'ซัพพลายเออร์น้ำหอมดูไบ'
      : 'โรงงานอาบายะห์ดูไบ';
    setQuickStockInItem({
      productId: prod.id,
      productTitle: prod.title,
      variantId: v.id,
      variantName: v.name,
      currentStock: typeof v.stockQuantity === 'number' && !isNaN(v.stockQuantity) ? v.stockQuantity : 0,
      costPrice: costVal,
      color: v.color,
    });
    setQuickStockInQty('1');
    setQuickStockInCost(costVal > 0 ? costVal.toString() : '');
    setQuickStockInSupplier(defaultSupplier);
    setQuickStockInNote('รับเติมสต๊อกหน้าร้าน');
  };

  const handleExecuteQuickStockIn = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickStockInItem) return;
    const qty = parseInt(quickStockInQty, 10);
    if (isNaN(qty) || qty <= 0) {
      alert('กรุณากรอกจำนวนสินค้าที่รับเข้าอย่างน้อย 1 ชิ้นครับ');
      return;
    }
    const cost = parseFloat(quickStockInCost) || quickStockInItem.costPrice || 0;

    recordStockIn({
      productId: quickStockInItem.productId,
      variantId: quickStockInItem.variantId,
      quantity: qty,
      costPrice: cost,
      supplierName: quickStockInSupplier.trim() || 'โรงงานอาบายะห์ดูไบ',
      note: quickStockInNote.trim() || 'รับเติมสต๊อกหน้าร้าน',
    });

    const vName = quickStockInItem.variantName;
    const newQty = quickStockInItem.currentStock + qty;
    setStockSuccessToast({
      message: `รับเข้าสต๊อก (+${qty} ชิ้น) สำเร็จทันที!`,
      submessage: `${quickStockInItem.productTitle} (${vName}) สต๊อกใหม่: ${newQty} ชิ้น`,
    });
    setHighlightedVariantId(quickStockInItem.variantId);
    setTimeout(() => {
      setHighlightedVariantId(null);
    }, 4000);
    setTimeout(() => {
      setStockSuccessToast(null);
    }, 4500);

    setQuickStockInItem(null);
  };

  // Google Sheets Live Sync State
  const [sheetUrl, setSheetUrl] = useState(
    storeSettings.googleSheetUrl || 'https://docs.google.com/spreadsheets/d/1WA1_fnTBdXe-ykTBNr1yOt3815uy-0hguA3n1kYDzkg/edit?gid=0#gid=0'
  );
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (storeSettings.googleSheetUrl) {
      setSheetUrl(storeSettings.googleSheetUrl);
    }
  }, [storeSettings.googleSheetUrl]);

  const handleSyncGoogleSheet = async () => {
    setIsSyncingSheet(true);
    setSyncFeedback(null);
    const res = await syncFromGoogleSheet(sheetUrl);
    setIsSyncingSheet(false);
    setSyncFeedback({
      success: res.success,
      message: res.success ? (res.message || 'ซิงก์สำเร็จ') : (res.error || 'เกิดข้อผิดพลาดในการซิงก์'),
    });
  };

  // Form State for Add/Edit
  const [title, setTitle] = useState('');
  const [arabicTitle, setArabicTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('abaya');
  const [categoryInput, setCategoryInput] = useState<string>('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatLabel, setEditingCatLabel] = useState<string>('');

  // Category Options List with localStorage persistence
  const [categoryOptions, setCategoryOptions] = useState<CategoryOptionItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('huda_custom_category_list_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (err) {
        console.error('Failed to parse saved categories:', err);
      }
    }
    return DEFAULT_CATEGORY_OPTIONS;
  });

  const saveCategoryOptions = (newList: CategoryOptionItem[]) => {
    setCategoryOptions(newList);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('huda_custom_category_list_v1', JSON.stringify(newList));
        window.dispatchEvent(new CustomEvent('huda_categories_updated'));
      } catch (e) {
        console.error('Failed to save categories:', e);
      }
    }
  };

  const getCategoryLabel = (catId: string, list: CategoryOptionItem[] = categoryOptions): string => {
    const found = list.find((c) => c.id === catId);
    return found ? found.label : catId;
  };

  const handleSelectCategory = (catItem: CategoryOptionItem) => {
    setCategory(catItem.id as CategoryType);
    setCategoryInput(catItem.label);
    setIsCategoryDropdownOpen(false);
    setEditingCatId(null);
  };

  const handleAddNewCategoryOption = (rawName: string) => {
    const trimmed = rawName.trim();
    if (!trimmed) return;

    // Check if item already exists by label or id (case-insensitive)
    const existing = categoryOptions.find(
      (c) => c.id.toLowerCase() === trimmed.toLowerCase() || c.label.toLowerCase() === trimmed.toLowerCase()
    );

    if (existing) {
      setCategory(existing.id as CategoryType);
      setCategoryInput(existing.label);
      setIsCategoryDropdownOpen(false);
      return;
    }

    const newCatItem: CategoryOptionItem = {
      id: trimmed,
      label: trimmed,
      isBuiltin: false,
    };

    const updated = [...categoryOptions, newCatItem];
    saveCategoryOptions(updated);
    setCategory(trimmed as CategoryType);
    setCategoryInput(trimmed);
    setIsCategoryDropdownOpen(false);
  };

  const handleDeleteCategoryOption = (catToDelete: CategoryOptionItem) => {
    if (confirm(`คุณต้องการลบหมวดหมู่ "${catToDelete.label}" ออกจากระบบใช่หรือไม่?\n\n*หมายเหตุ: สามารถกด "รีเซ็ตหมวดหมู่เริ่มต้น" ด้านล่างเพื่อนำหมวดหมู่มาตรฐานกลับมาได้ตลอดเวลา`)) {
      const updated = categoryOptions.filter((c) => c.id !== catToDelete.id);
      saveCategoryOptions(updated);

      if (category === catToDelete.id) {
        const fallback = updated[0] || DEFAULT_CATEGORY_OPTIONS[0];
        setCategory(fallback.id as CategoryType);
        setCategoryInput(fallback.label);
      }
    }
  };

  const handleSaveEditCategoryOption = (catId: string) => {
    const trimmed = editingCatLabel.trim();
    if (!trimmed) return;

    const updated = categoryOptions.map((c) => {
      if (c.id === catId) {
        return { ...c, label: trimmed };
      }
      return c;
    });

    saveCategoryOptions(updated);

    if (category === catId) {
      setCategoryInput(trimmed);
    }

    setEditingCatId(null);
    setEditingCatLabel('');
  };

  const handleResetCategoryDefaults = () => {
    if (confirm('คุณต้องการรีเซ็ตหมวดหมู่สินค้าทั้งหมดกลับเป็นค่าเริ่มต้นมาตรฐานใช่หรือไม่?')) {
      saveCategoryOptions(DEFAULT_CATEGORY_OPTIONS);
      setCategory('abaya');
      setCategoryInput(DEFAULT_CATEGORY_OPTIONS[0].label);
    }
  };

  const filteredCategoryOptions = useMemo(() => {
    if (!categoryInput.trim()) return categoryOptions;
    const q = categoryInput.trim().toLowerCase();
    const matched = categoryOptions.filter(
      (c) => c.label.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
    return matched.length > 0 ? matched : categoryOptions;
  }, [categoryOptions, categoryInput]);

  const isTypedCategoryNew = useMemo(() => {
    const q = categoryInput.trim().toLowerCase();
    if (!q) return false;
    return !categoryOptions.some(
      (c) => c.label.toLowerCase() === q || c.id.toLowerCase() === q
    );
  }, [categoryOptions, categoryInput]);

  const [description, setDescription] = useState('');

  // Default Description Presets (Persisted in localStorage)
  const DEFAULT_DESCRIPTION_PRESETS: string[] = [
    'ชุดอาบายะห์นำเข้าแท้จากดูไบ ดีไซน์หรูหราทันสมัย เนื้อผ้าพรีเมียม สวมใส่สบาย ไม่ร้อน ทิ้งตัวสวย',
    'ชุดเซ็ตอาบายะห์พร้อมผ้าคลุมชีฟองเข้าชุด ดีไซน์พรีเมียม สวมใส่ได้ทุกโอกาสสำคัญ',
    'น้ำหอมแท้นำเข้าจากดูไบ กลิ่นหอมติดทนนาน 24 ชม. หอมละมุน มีเสน่ห์เฉพาะตัว',
    'เครื่องหอมและไม้กฤษณาแท้จากดูไบ กลิ่นหอมอบอวล สร้างบรรยากาศอบอุ่น ผ่อนคลาย',
    'ชุดคัฟทานอาหรับพรีเมียม ดีไซน์สวยหรู งานตัดเย็บประณีต ผ้าพริ้วทิ้งตัวงดงาม',
    'สินค้าพร้อมส่ง นำเข้าแท้ 100% มีบริการเก็บเงินปลายทาง',
    'กรอกหรือไม่กรอกก็ได้ (ไม่บังคับ)',
  ];

  const [descriptionOptions, setDescriptionOptions] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('huda_custom_description_options_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (err) {
        console.error('Failed to parse saved descriptions:', err);
      }
    }
    return DEFAULT_DESCRIPTION_PRESETS;
  });

  const [isDescriptionDropdownOpen, setIsDescriptionDropdownOpen] = useState(false);
  const descriptionDropdownRef = useRef<HTMLDivElement>(null);
  const [editingDescIdx, setEditingDescIdx] = useState<number | null>(null);
  const [editingDescText, setEditingDescText] = useState<string>('');

  const saveDescriptionOptions = (newList: string[]) => {
    setDescriptionOptions(newList);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('huda_custom_description_options_v1', JSON.stringify(newList));
      } catch (e) {
        console.error('Failed to save descriptions:', e);
      }
    }
  };

  const handleAddNewDescriptionOption = (rawText: string, autoSelect: boolean = true) => {
    const trimmed = rawText.trim();
    if (!trimmed) return;
    const exists = descriptionOptions.some((opt) => opt.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      const updated = [trimmed, ...descriptionOptions];
      saveDescriptionOptions(updated);
    }
    if (autoSelect) {
      setDescription(trimmed);
      setIsDescriptionDropdownOpen(false);
    }
  };

  const handleUpdateDescriptionOption = (index: number, newText: string) => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    const updated = [...descriptionOptions];
    updated[index] = trimmed;
    saveDescriptionOptions(updated);
    setEditingDescIdx(null);
    setEditingDescText('');
  };

  const handleDeleteDescriptionOption = (optToDelete: string) => {
    if (confirm(`คุณต้องการลบข้อความตัวเลือกนี้ออกจากรายการใช่หรือไม่?\n\n"${optToDelete.slice(0, 45)}..."`)) {
      const updated = descriptionOptions.filter((opt) => opt !== optToDelete);
      saveDescriptionOptions(updated);
    }
  };

  const handleResetDescriptionOptions = () => {
    if (confirm('คุณต้องการรีเซ็ตตัวเลือกรายละเอียดสินค้ากลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      saveDescriptionOptions(DEFAULT_DESCRIPTION_PRESETS);
    }
  };

  const isTypedDescriptionNew = useMemo(() => {
    const trimmed = description.trim();
    if (!trimmed) return false;
    return !descriptionOptions.some((opt) => opt.toLowerCase() === trimmed.toLowerCase());
  }, [description, descriptionOptions]);

  const filteredDescriptionOptions = useMemo(() => {
    const trimmed = description.trim().toLowerCase();
    if (!trimmed) return descriptionOptions;
    const matched = descriptionOptions.filter((opt) => opt.toLowerCase().includes(trimmed));
    return matched.length > 0 ? matched : descriptionOptions;
  }, [description, descriptionOptions]);

  const [fabric, setFabric] = useState('');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [newImageUrlInput, setNewImageUrlInput] = useState<string>('');
  const [customVariantInput, setCustomVariantInput] = useState<string>('');

  // Comprehensive Default Presets Per Category
  const DEFAULT_CATEGORY_FABRIC_PRESETS: Record<string, string[]> = {
    abaya: [
      'Nida Silk Dubai Original (ผ้านิดาดูไบแท้)',
      'Nida Premium (ผ้านิดาพรีเมียม นุ่มทิ้งตัว)',
      'Chiffon Dubai (ผ้าชีฟองดูไบ สองชั้นพริ้วสวย)',
      'Zoom Fabric (ผ้าซูมดูไบ ทรงสวยยับยาก)',
      'Crepe Dubai (ผ้าเครปดูไบ เกรดนำเข้า)',
      'Firdous Fabric (ผ้าฟิรเดาส์ นุ่มสบาย)',
      'Linen Dubai (ผ้าลินินดูไบ ระบายอากาศดี)',
      'Satin Silk (ผ้าซาตินดูไบ ผิวสัมผัสเงางาม)',
      'Velvet Dubai (ผ้ากำมะหยี่ดูไบ หรูหราพรีเมียม)',
      'Cotton Silk (ผ้าคอตตอนซิลค์ นุ่มเบาสบาย)',
      'ผ้าไหม (Silk Dubai)',
    ],
    kaftan: [
      'Nida Silk Dubai Original (ผ้านิดาดูไบแท้)',
      'Chiffon Silk Dubai (ผ้าชีฟองซิลค์ดูไบ)',
      'Satin Silk (ผ้าซาตินดูไบ ผิวสัมผัสเงางาม)',
      'Georgette Silk (ผ้าจอร์เจียดูไบพริ้วสวย)',
      'Cotton Linen Dubai (ผ้าคอตตอนลินินใส่สบาย)',
      'Crepe Dubai (ผ้าเครปดูไบ เกรดนำเข้า)',
    ],
    perfume: [
      'Oud Oil & Attar Perfume Dubai (หัวน้ำหอมและออยล์ดูไบแท้)',
      'Pure Oud Oil (น้ำมันอูดบริสุทธิ์ 100%)',
      'EDP Concentrated Spray (หัวน้ำหอมเข้มข้นสเปรย์)',
      'Royal Amber & Musk (กลิ่นอัมเบอร์ทองผสมมัสก์)',
      'Rose Damascena & Oud (กุหลาบดามัสกัสผสมอูด)',
      'Sweet Vanilla & Amber Dubai (วานิลลาดูไบผสมอัมเบอร์)',
    ],
    incense: [
      'ไม้หอมอูดดูไบ (Bukhoor Dubai Original)',
      'ไม้กฤษณาแท้ดูไบ (Agarwood / Oud Chips)',
      'ผงไม้หอมหมักน้ำมันอูด (Bukhoor Powder / Tablets)',
      'ถ่านหอมไร้ควันดูไบ (Quick-Light Charcoal)',
      'เซ็ตเตาเผาไฟฟ้า + ไม้หอมดูไบ',
      'กำยานอาหรับพรีเมียม (Frankincense / Luban)',
    ],
    combo: [
      'เซ็ตชุดอาบายะห์ + ผ้าคลุมฮิญาบเข้าชุด',
      'เซ็ตอาบายะห์ดูไบ + น้ำหอมพกพา',
      'เซ็ตน้ำหอมดูไบ + ไม้หอมอูด Bukhoor',
      'กิฟต์เซ็ตกล่องของขวัญพรีเมียมดูไบ',
    ],
    other: [
      'สินค้าทั่วไป (General Item)',
      'สินค้านำเข้าดูไบ UAE แท้',
      'ขนม / อินทผลัมนำเข้าดูไบ',
      'ของเล่นและของใช้เด็ก',
    ],
  };

  // Category-specific Fabric / Details Map State (Stored in localStorage)
  const [categoryFabricMap, setCategoryFabricMap] = useState<Record<string, string[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('huda_category_fabric_map_v3');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch (err) {
        console.error('Failed to parse saved category fabric map:', err);
      }
    }
    return DEFAULT_CATEGORY_FABRIC_PRESETS;
  });

  const activeCategoryKey = (category && category !== 'all') ? category : 'abaya';
  
  const currentCategoryFabricOptions = useMemo(() => {
    return categoryFabricMap[activeCategoryKey] || DEFAULT_CATEGORY_FABRIC_PRESETS[activeCategoryKey] || [];
  }, [categoryFabricMap, activeCategoryKey]);

  // State for inline editing of a fabric option
  const [editingFabricIdx, setEditingFabricIdx] = useState<number | null>(null);
  const [editingFabricText, setEditingFabricText] = useState<string>('');

  // Helper to persist category fabric map
  const saveCategoryFabricMap = (newMap: Record<string, string[]>) => {
    setCategoryFabricMap(newMap);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('huda_category_fabric_map_v3', JSON.stringify(newMap));
      } catch (e) {
        console.error('Error saving category fabric map:', e);
      }
    }
  };

  const handleAddNewFabricOption = (newFabricName: string) => {
    const trimmed = newFabricName.trim();
    if (!trimmed) return;
    const catList = currentCategoryFabricOptions;
    if (!catList.includes(trimmed)) {
      const updatedCatList = [trimmed, ...catList];
      const updatedMap = {
        ...categoryFabricMap,
        [activeCategoryKey]: updatedCatList,
      };
      saveCategoryFabricMap(updatedMap);
    }
    setFabric(trimmed);
  };

  const handleDeleteFabricOption = (fabricToDelete: string) => {
    if (confirm(`คุณต้องการลบตัวเลือก "${fabricToDelete}" ออกจากหมวดหมู่นี้ใช่หรือไม่?`)) {
      const updatedCatList = currentCategoryFabricOptions.filter((opt) => opt !== fabricToDelete);
      const updatedMap = {
        ...categoryFabricMap,
        [activeCategoryKey]: updatedCatList,
      };
      saveCategoryFabricMap(updatedMap);
      if (fabric === fabricToDelete) {
        setFabric('');
      }
    }
  };

  const handleSaveEditFabricOption = (idx: number, oldName: string) => {
    const trimmed = editingFabricText.trim();
    if (!trimmed) return;
    const updatedCatList = [...currentCategoryFabricOptions];
    updatedCatList[idx] = trimmed;
    const updatedMap = {
      ...categoryFabricMap,
      [activeCategoryKey]: updatedCatList,
    };
    saveCategoryFabricMap(updatedMap);
    if (fabric === oldName) {
      setFabric(trimmed);
    }
    setEditingFabricIdx(null);
    setEditingFabricText('');
  };

  const handleResetFabricDefaults = () => {
    if (confirm(`คุณต้องการรีเซ็ตตัวเลือกของหมวดหมู่นี้กลับเป็นค่าเริ่มต้นใช่หรือไม่?`)) {
      const updatedMap = {
        ...categoryFabricMap,
        [activeCategoryKey]: DEFAULT_CATEGORY_FABRIC_PRESETS[activeCategoryKey] || [],
      };
      saveCategoryFabricMap(updatedMap);
    }
  };

  // Comprehensive Default Size/Volume Presets Per Category
  const DEFAULT_CATEGORY_SIZE_PRESETS: Record<string, string[]> = {
    abaya: [
      'Size 52 (ส่วนสูง ~150-155 ซม. / ยาว 52")',
      'Size 54 (ส่วนสูง ~155-160 ซม. / ยาว 54")',
      'Size 56 (ส่วนสูง ~160-165 ซม. / ยาว 56")',
      'Size 58 (ส่วนสูง ~165-170 ซม. / ยาว 58")',
      'Size 60 (ส่วนสูง ~170-175 ซม. / ยาว 60")',
      'Free Size (ฟรีไซส์)',
    ],
    kaftan: [
      'Free Size (อก 32-46" ยาว 54")',
      'Size S/M (อก 32-38")',
      'Size L/XL (อก 40-46")',
      'Plus Size (อก 48-54")',
      'ขนาดมาตรฐาน (Free Size)',
    ],
    perfume: [
      'ขวดสเปรย์ 10 ml',
      'ขวดสเปรย์ 15 ml',
      'ขวดสเปรย์ 30 ml',
      'ขวดสเปรย์ 50 ml',
      'ขวดสเปรย์ 100 ml',
      'ขวดลูกกลิ้ง 3 ml',
      'ขวดลูกกลิ้ง 6 ml',
      'ขวดลูกกลิ้ง 10 ml',
      'ขวดลูกกลิ้ง 12 ml',
      'ขวดลูกกลิ้ง 15 ml',
      'Attar Oil 12 ml',
      'ขวดแก้วคริสตัล 6 ml',
      'ขวดแก้วคริสตัล 12 ml',
      'ขวดเทสเตอร์ 3 ml',
      'ขวดเทสเตอร์ 5 ml',
      'ขนาดมาตรฐาน (Free Size)',
    ],
    incense: [
      'กระปุก 50g',
      'กระปุก 100g',
      'ไม้หอมอูด 20g',
      'เซ็ตเตาเผา + ถ่านหอม',
      'ขนาดมาตรฐาน (Free Size)',
    ],
    combo: [
      'เซ็ต 2 ชิ้น (Set of 2)',
      'เซ็ต 3 ชิ้น (Set of 3)',
      'เซ็ตกล่องของขวัญ (Gift Box Set)',
      'ขนาดมาตรฐาน (Standard Set)',
    ],
    other: [
      'ชิ้น/กล่อง (Standard)',
      'แพ็กสุดคุ้ม (Pack)',
      'ขนาดมาตรฐาน (Free Size)',
    ],
  };

  // Category-specific Size / Volume Options Map State (Stored in localStorage)
  const [categorySizeMap, setCategorySizeMap] = useState<Record<string, string[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('huda_category_size_map_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch (err) {
        console.error('Failed to parse saved category size map:', err);
      }
    }
    return DEFAULT_CATEGORY_SIZE_PRESETS;
  });

  const currentCategorySizeOptions = useMemo(() => {
    return categorySizeMap[activeCategoryKey] || DEFAULT_CATEGORY_SIZE_PRESETS[activeCategoryKey] || [];
  }, [categorySizeMap, activeCategoryKey]);

  const filteredCategorySizeOptions = useMemo(() => {
    if (!customVariantInput.trim()) return currentCategorySizeOptions;
    const query = customVariantInput.trim().toLowerCase();
    const matched = currentCategorySizeOptions.filter((opt) => opt.toLowerCase().includes(query));
    return matched.length > 0 ? matched : currentCategorySizeOptions;
  }, [currentCategorySizeOptions, customVariantInput]);

  // State for inline editing of a size option
  const [editingSizeIdx, setEditingSizeIdx] = useState<number | null>(null);
  const [editingSizeText, setEditingSizeText] = useState<string>('');

  // Helper to persist category size map
  const saveCategorySizeMap = (newMap: Record<string, string[]>) => {
    setCategorySizeMap(newMap);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('huda_category_size_map_v1', JSON.stringify(newMap));
      } catch (e) {
        console.error('Error saving category size map:', e);
      }
    }
  };

  const handleAddNewSizeOption = (newSizeName: string) => {
    const trimmed = newSizeName.trim();
    if (!trimmed) return;
    const catList = currentCategorySizeOptions;
    if (!catList.includes(trimmed)) {
      const updatedCatList = [trimmed, ...catList];
      const updatedMap = {
        ...categorySizeMap,
        [activeCategoryKey]: updatedCatList,
      };
      saveCategorySizeMap(updatedMap);
    }
  };

  const handleDeleteSizeOption = (sizeToDelete: string) => {
    if (confirm(`คุณต้องการลบตัวเลือกขนาด "${sizeToDelete}" ออกจากหมวดหมู่นี้ใช่หรือไม่?`)) {
      const updatedCatList = currentCategorySizeOptions.filter((opt) => opt !== sizeToDelete);
      const updatedMap = {
        ...categorySizeMap,
        [activeCategoryKey]: updatedCatList,
      };
      saveCategorySizeMap(updatedMap);
    }
  };

  const handleSaveEditSizeOption = (idx: number, oldName: string) => {
    const trimmed = editingSizeText.trim();
    if (!trimmed) return;
    const updatedCatList = [...currentCategorySizeOptions];
    updatedCatList[idx] = trimmed;
    const updatedMap = {
      ...categorySizeMap,
      [activeCategoryKey]: updatedCatList,
    };
    saveCategorySizeMap(updatedMap);

    // Also update any variants currently in the form that used the old name
    setVariants((prev) =>
      prev.map((v) => (v.name === oldName ? { ...v, name: trimmed } : v))
    );

    setEditingSizeIdx(null);
    setEditingSizeText('');
  };

  const handleResetSizeDefaults = () => {
    if (confirm(`คุณต้องการรีเซ็ตตัวเลือกขนาดของหมวดหมู่นี้กลับเป็นค่าเริ่มต้นใช่หรือไม่?`)) {
      const updatedMap = {
        ...categorySizeMap,
        [activeCategoryKey]: DEFAULT_CATEGORY_SIZE_PRESETS[activeCategoryKey] || [],
      };
      saveCategorySizeMap(updatedMap);
    }
  };

  // Unified Fabric & Size Dropdown State & Click-Outside Handling
  const [isFabricDropdownOpen, setIsFabricDropdownOpen] = useState(false);
  const fabricDropdownRef = useRef<HTMLDivElement>(null);

  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const sizeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
        setEditingCatId(null);
      }
      if (fabricDropdownRef.current && !fabricDropdownRef.current.contains(event.target as Node)) {
        setIsFabricDropdownOpen(false);
        setEditingFabricIdx(null);
      }
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target as Node)) {
        setIsSizeDropdownOpen(false);
        setEditingSizeIdx(null);
      }
      if (descriptionDropdownRef.current && !descriptionDropdownRef.current.contains(event.target as Node)) {
        setIsDescriptionDropdownOpen(false);
        setEditingDescIdx(null);
      }
      if (!(event.target as HTMLElement).closest('[data-color-dropdown]')) {
        setOpenColorDropdownIdx(null);
        setEditingColorIdx(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredFabricOptions = useMemo(() => {
    if (!fabric.trim()) return currentCategoryFabricOptions;
    const query = fabric.trim().toLowerCase();
    const matched = currentCategoryFabricOptions.filter((opt) => opt.toLowerCase().includes(query));
    return matched.length > 0 ? matched : currentCategoryFabricOptions;
  }, [currentCategoryFabricOptions, fabric]);

  // Comprehensive Category-Bound Color & Scent Presets
  const DEFAULT_CATEGORY_COLOR_PRESETS: Record<string, string[]> = {
    abaya: [
      'สีดำ (Black)',
      'สีทอง (Gold)',
      'สีขาว (White)',
      'สีครีม (Cream)',
      'สีเบจ (Beige)',
      'สีนู๊ด (Nude)',
      'สีน้ำตาล (Brown)',
      'สีช็อกโกแลต (Chocolate Brown)',
      'สีเขียวมรกต (Emerald Green)',
      'สีเขียวเข้ม (Dark Green / Pine)',
      'สีเขียวมะกอก (Olive Green)',
      'สีน้ำเงินกรมท่า (Navy Blue)',
      'สีฟ้าพาสเทล (Baby Blue)',
      'สีม่วงเข้ม (Dark Plum)',
      'สีแดงเลือดหมู (Burgundy / Wine)',
      'สีชมพู (Pink)',
      'สีเทาเงิน (Silver)',
      'สีทูโทน (Two-Tone)',
    ],
    kaftan: [
      'สีทองราชวงศ์ (Royal Gold)',
      'สีดำ (Black)',
      'สีขาว (White)',
      'สีครีม (Cream)',
      'สีมรกต (Emerald)',
      'สีน้ำเงินรอยัล (Royal Blue)',
      'สีแดงทับทิม (Ruby Red)',
      'สีชมพูพาสเทล (Baby Pink)',
      'สีเขียวมิ้นต์ (Mint Green)',
      'สีทูโทน (Two-Tone)',
    ],
    perfume: [
      'กลิ่นดูไบออริจินัล (Dubai Original)',
      'กลิ่นอัมเบอร์ทอง (Royal Amber & Musk)',
      'กลิ่นกุหลาบดามัสกัสผสมอูด (Rose Damascena & Oud)',
      'กลิ่นไม้หอมอูดบริสุทธิ์ (Pure Oud Wood)',
      'กลิ่นมัสก์ขาวบริสุทธิ์ (White Musk)',
      'กลิ่นวานิลลาดูไบ (Sweet Vanilla Dubai)',
      'กลิ่นฟรุตตี้อาหรับ (Fruity Arabic EDP)',
      'กลิ่นสดชื่นซีตรัส & อูด (Fresh Citrus & Oud)',
      'กลิ่นคาร์ดามอม & สไปซ์ (Cardamom Spice)',
      'กลิ่นชาฮานะห์ (Shahana Floral)',
    ],
    incense: [
      'ไม้หอมอูดออริจินัล (Original Oud Chips)',
      'กลิ่นอัมเบอร์ทอง & มัสก์ (Amber Musk Bukhoor)',
      'กลิ่นกุหลาบอาหรับพรีเมียม (Taif Rose Bukhoor)',
      'กลิ่นกำยานแท้โอมาน (Pure Frankincense)',
      'กลิ่นไม้กฤษณารอยัล (Royal Agarwood)',
    ],
    combo: [
      'สีดำ (Black)',
      'คละสี / คละกลิ่น (Assorted)',
      'เซ็ตของขวัญมาตรฐาน',
      'สีทอง (Gold)',
    ],
    other: [
      'มาตรฐาน (Standard)',
      'คละสี (Multicolor)',
      'สีดำ (Black)',
      'สีขาว (White)',
    ],
  };

  // Category-specific Color / Scent Map State (Stored in localStorage)
  const [categoryColorMap, setCategoryColorMap] = useState<Record<string, string[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('huda_category_color_map_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch (err) {
        console.error('Failed to parse saved category color map:', err);
      }
    }
    return DEFAULT_CATEGORY_COLOR_PRESETS;
  });

  const currentCategoryColorOptions = useMemo(() => {
    return categoryColorMap[activeCategoryKey] || DEFAULT_CATEGORY_COLOR_PRESETS[activeCategoryKey] || [];
  }, [categoryColorMap, activeCategoryKey]);

  // State for Color Dropdown and inline editing
  const [openColorDropdownIdx, setOpenColorDropdownIdx] = useState<number | null>(null);
  const [editingColorIdx, setEditingColorIdx] = useState<number | null>(null);
  const [editingColorText, setEditingColorText] = useState<string>('');

  const saveCategoryColorMap = (newMap: Record<string, string[]>) => {
    setCategoryColorMap(newMap);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('huda_category_color_map_v1', JSON.stringify(newMap));
      } catch (e) {
        console.error('Error saving category color map:', e);
      }
    }
  };

  const handleAddNewColorOption = (newColorName: string) => {
    const trimmed = newColorName.trim();
    if (!trimmed) return;
    const catList = currentCategoryColorOptions;
    if (!catList.includes(trimmed)) {
      const updatedCatList = [trimmed, ...catList];
      const updatedMap = {
        ...categoryColorMap,
        [activeCategoryKey]: updatedCatList,
      };
      saveCategoryColorMap(updatedMap);
    }
  };

  const handleDeleteColorOption = (colorToDelete: string) => {
    if (confirm(`คุณต้องการลบตัวเลือกสี/กลิ่น "${colorToDelete}" ออกจากหมวดหมู่นี้ใช่หรือไม่?`)) {
      const updatedCatList = currentCategoryColorOptions.filter((opt) => opt !== colorToDelete);
      const updatedMap = {
        ...categoryColorMap,
        [activeCategoryKey]: updatedCatList,
      };
      saveCategoryColorMap(updatedMap);
    }
  };

  const handleSaveEditColorOption = (idx: number, oldName: string) => {
    const trimmed = editingColorText.trim();
    if (!trimmed) return;
    const updatedCatList = [...currentCategoryColorOptions];
    updatedCatList[idx] = trimmed;
    const updatedMap = {
      ...categoryColorMap,
      [activeCategoryKey]: updatedCatList,
    };
    saveCategoryColorMap(updatedMap);

    // Also update any variants currently in the form that used the old color name
    setVariants((prev) =>
      prev.map((v) => (v.color === oldName ? { ...v, color: trimmed } : v))
    );

    setEditingColorIdx(null);
    setEditingColorText('');
  };

  const handleResetColorDefaults = () => {
    if (confirm(`คุณต้องการรีเซ็ตตัวเลือกสี/กลิ่นของหมวดหมู่นี้กลับเป็นค่าเริ่มต้นใช่หรือไม่?`)) {
      const updatedMap = {
        ...categoryColorMap,
        [activeCategoryKey]: DEFAULT_CATEGORY_COLOR_PRESETS[activeCategoryKey] || [],
      };
      saveCategoryColorMap(updatedMap);
    }
  };

  // Standard Dubai Abaya Default Sizes
  const DEFAULT_DUBAI_SIZES = [
    { name: 'Size 52 (ส่วนสูง ~150-155 ซม. / ยาว 52")', sku: 'HD-ABY-52', price: 0, costPrice: 0, stockQuantity: 999, color: '' },
    { name: 'Size 54 (ส่วนสูง ~155-160 ซม. / ยาว 54")', sku: 'HD-ABY-54', price: 0, costPrice: 0, stockQuantity: 999, color: '' },
    { name: 'Size 56 (ส่วนสูง ~160-165 ซม. / ยาว 56")', sku: 'HD-ABY-56', price: 0, costPrice: 0, stockQuantity: 999, color: '' },
    { name: 'Size 58 (ส่วนสูง ~165-170 ซม. / ยาว 58")', sku: 'HD-ABY-58', price: 0, costPrice: 0, stockQuantity: 999, color: '' },
    { name: 'Size 60 (ส่วนสูง ~170-175 ซม. / ยาว 60")', sku: 'HD-ABY-60', price: 0, costPrice: 0, stockQuantity: 999, color: '' },
  ];

  // Standard Dubai Perfume Default Volumes/Sizes
  const DEFAULT_PERFUME_SIZES = [
    { name: 'ขวดสเปรย์ 50 ml (EDP Spray)', sku: 'HD-PRF-50ML', price: 0, costPrice: 0, stockQuantity: 999, color: '' },
    { name: 'ขวดสเปรย์ 100 ml (EDP Premium Spray)', sku: 'HD-PRF-100ML', price: 0, costPrice: 0, stockQuantity: 999, color: '' },
    { name: 'ขวดแก้วคริสตัล 12 ml (Attar Pure Oil)', sku: 'HD-PRF-12ML', price: 0, costPrice: 0, stockQuantity: 999, color: '' },
    { name: 'ขวดเทสเตอร์ 3 ml (Sample Tester)', sku: 'HD-PRF-3ML', price: 0, costPrice: 0, stockQuantity: 999, color: '' },
  ];

  // Standard Dubai Incense Default Variants
  const DEFAULT_INCENSE_SIZES = [
    { name: 'ขวด/กระปุก 50g (Standard Bukhoor)', sku: 'HD-INC-50G', price: 0, costPrice: 0, stockQuantity: 999, color: '' },
    { name: 'ขวด/กระปุก 100g (Premium Bukhoor)', sku: 'HD-INC-100G', price: 0, costPrice: 0, stockQuantity: 999, color: '' },
    { name: 'เซ็ตเตาเผาหอม + ถ่านหอมดูไบ', sku: 'HD-INC-SET', price: 0, costPrice: 0, stockQuantity: 999, color: '' },
  ];

  // Standard Other Items Default Variants
  const DEFAULT_OTHER_SIZES = [
    { name: 'ชิ้น/กล่อง (Standard)', sku: 'HD-OTH-STD', price: 0, costPrice: 0, stockQuantity: 999, color: '' },
    { name: 'แพ็กสุดคุ้ม (Pack)', sku: 'HD-OTH-PACK', price: 0, costPrice: 0, stockQuantity: 999, color: '' },
  ];

  // Size & Color Variants State (เริ่มต้นเป็นค่าว่าง [] เพื่อให้ผู้ใช้กดเลือกเฉพาะขนาดที่ต้องการเอง)
  const [variants, setVariants] = useState<
    { name: string; sku: string; price: number; costPrice?: number; stockQuantity: number; color?: string }[]
  >([]);

  // Handle Category Change (keep fabric and variants clean for user to choose freely)
  const handleCategoryChange = (newCat: CategoryType) => {
    setCategory(newCat);
    setCategoryInput(getCategoryLabel(newCat));
  };

  const handleForceSync = async () => {
    await syncProducts();
    alert('ซิงก์ดึงข้อมูลสินค้าล่าสุดจากทุกเครื่องขึ้นคลาวด์และแสดงผลตรงกัน 100% เรียบร้อยแล้ว!');
  };

  // Smart Image Compression Handler for Camera & Gallery uploads
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const rawBase64 = reader.result;
          const img = new Image();
          img.src = rawBase64;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 600; // Compress high-res camera photos to max 600px
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
            const compressed = canvas.toDataURL('image/jpeg', 0.75);
            setImagesList((prev) => [...prev, compressed]);
          };
          img.onerror = () => {
            setImagesList((prev) => [...prev, rawBase64]);
          };
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleAddUrlImage = () => {
    if (newImageUrlInput.trim()) {
      setImagesList((prev) => [...prev, newImageUrlInput.trim()]);
      setNewImageUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetMainCover = (index: number) => {
    setImagesList((prev) => {
      const newArr = [...prev];
      const [item] = newArr.splice(index, 1);
      newArr.unshift(item);
      return newArr;
    });
  };

  const resetForm = () => {
    setTitle('');
    setArabicTitle('');
    setCategory('abaya');
    setCategoryInput('');
    setDescription('');
    setIsDescriptionDropdownOpen(false);
    setEditingDescIdx(null);
    setFabric('');
    setImagesList([]);
    setNewImageUrlInput('');
    setVariants([]);
    setEditingProduct(null);
    setIsStockEditUnlocked(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('กรุณากรอก "ชื่อแบบสินค้า" ด้วยครับ');
      return;
    }

    if (!categoryInput.trim()) {
      alert('กรุณาเลือกหรือระบุ "หมวดหมู่สินค้า" ด้วยครับ');
      return;
    }

    if (description.trim()) {
      handleAddNewDescriptionOption(description.trim(), false);
    }

    if (fabric.trim()) {
      handleAddNewFabricOption(fabric.trim());
    }

    if (categoryInput.trim() && isTypedCategoryNew) {
      handleAddNewCategoryOption(categoryInput.trim());
    }

    const matchedOpt = categoryOptions.find(
      (c) => c.label.toLowerCase() === categoryInput.trim().toLowerCase() || c.id.toLowerCase() === categoryInput.trim().toLowerCase()
    );
    const effectiveCategory = isTypedCategoryNew
      ? (categoryInput.trim() as CategoryType)
      : (matchedOpt ? (matchedOpt.id as CategoryType) : category);

    variants.forEach((v) => {
      if (v.color && v.color.trim()) {
        handleAddNewColorOption(v.color.trim());
      }
    });

    if (variants.length === 0) {
      alert('กรุณาระบุขนาด ปริมาณ หรือไซส์สินค้าอย่างน้อย 1 รายการครับ');
      return;
    }

    const uniqueColors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[];
    const fallbackImage = (effectiveCategory === 'perfume' || category === 'perfume')
      ? 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop';

    const validImages = imagesList.filter((img) => img && typeof img === 'string' && img.trim() !== '');
    const finalImages = validImages.length > 0 ? validImages : [fallbackImage];

    const newProductObj: Product = {
      id: editingProduct ? editingProduct.id : `huda-prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      arabicTitle: arabicTitle.trim(),
      category: effectiveCategory,
      description: description.trim() || 'สินค้าคุณภาพสูง นำเข้าจากเมืองดูไบ UAE แท้ 100%',
      fabric: fabric.trim() || '',
      origin: 'เมืองดูไบ, UAE',
      images: finalImages,
      colors: uniqueColors,
      variants: variants.map((v, idx) => ({
        id: (editingProduct && editingProduct.variants[idx]?.id) ? editingProduct.variants[idx].id : `var-${Date.now()}-${idx}`,
        name: v.name.trim() || (category === 'perfume' ? `ขนาด ${idx + 1}` : `Size ${idx + 1}`),
        sku: v.sku || `HD-SKU-${idx + 1}`,
        price: isNaN(Number(v.price)) ? 0 : Number(v.price),
        costPrice: isNaN(Number(v.costPrice)) ? (isNaN(Number(v.price)) ? 0 : Math.round(Number(v.price) * 0.5)) : Number(v.costPrice),
        stockQuantity: isNaN(Number(v.stockQuantity)) ? 0 : Math.max(0, Number(v.stockQuantity)),
        color: v.color || '',
      })),
      rating: 5.0,
      reviewsCount: 1,
      isNew: true,
      updatedAt: Date.now(),
    };

    if (editingProduct) {
      updateProduct(newProductObj);
      alert(`อัปเดตข้อมูลสินค้า "${title}" เรียบร้อยแล้ว!`);
    } else {
      addProduct(newProductObj);
      setSelectedCategory('all');
      setAdminSearch('');
      alert(`เพิ่มสินค้าใหม่ "${title}" เข้าสู่ระบบเรียบร้อยแล้ว! แสดงผลหน้าร้านทันที`);
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleSaveProductAndOpenStockIn = (variantIdx?: number) => {
    if (!title.trim()) {
      alert('กรุณากรอก "ชื่อแบบสินค้า" ก่อนบันทึกรับสินค้าเข้าสต๊อกครับ');
      return;
    }

    if (fabric.trim()) {
      handleAddNewFabricOption(fabric.trim());
    }

    if (categoryInput.trim() && isTypedCategoryNew) {
      handleAddNewCategoryOption(categoryInput.trim());
    }

    const matchedOpt = categoryOptions.find(
      (c) => c.label.toLowerCase() === categoryInput.trim().toLowerCase() || c.id.toLowerCase() === categoryInput.trim().toLowerCase()
    );
    const effectiveCategory = isTypedCategoryNew
      ? (categoryInput.trim() as CategoryType)
      : (matchedOpt ? (matchedOpt.id as CategoryType) : category);

    variants.forEach((v) => {
      if (v.color && v.color.trim()) {
        handleAddNewColorOption(v.color.trim());
      }
    });

    if (variants.length === 0) {
      alert('กรุณาระบุขนาด ปริมาณ หรือไซส์สินค้าอย่างน้อย 1 รายการครับ');
      return;
    }

    const uniqueColors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[];
    const fallbackImage = (effectiveCategory === 'perfume' || category === 'perfume')
      ? 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop';

    const validImages = imagesList.filter((img) => img && typeof img === 'string' && img.trim() !== '');
    const finalImages = validImages.length > 0 ? validImages : [fallbackImage];

    const prodId = editingProduct ? editingProduct.id : `huda-prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const savedVariants = variants.map((v, idx) => ({
      id: (editingProduct && editingProduct.variants[idx]?.id) ? editingProduct.variants[idx].id : `var-${Date.now()}-${idx}`,
      name: v.name.trim() || (category === 'perfume' ? `ขนาด ${idx + 1}` : `Size ${idx + 1}`),
      sku: v.sku || `HD-SKU-${idx + 1}`,
      price: isNaN(Number(v.price)) ? 0 : Number(v.price),
      costPrice: isNaN(Number(v.costPrice)) ? (isNaN(Number(v.price)) ? 0 : Math.round(Number(v.price) * 0.5)) : Number(v.costPrice),
      stockQuantity: isNaN(Number(v.stockQuantity)) ? 0 : Math.max(0, Number(v.stockQuantity)),
      color: v.color || '',
    }));

    const newProductObj: Product = {
      id: prodId,
      title: title.trim(),
      arabicTitle: arabicTitle.trim(),
      category: effectiveCategory,
      description: description.trim() || 'สินค้าคุณภาพสูง นำเข้าจากเมืองดูไบ UAE แท้ 100%',
      fabric: fabric.trim() || '',
      origin: 'เมืองดูไบ, UAE',
      images: finalImages,
      colors: uniqueColors,
      variants: savedVariants,
      rating: 5.0,
      reviewsCount: 1,
      isNew: true,
      updatedAt: Date.now(),
    };

    if (editingProduct) {
      updateProduct(newProductObj);
    } else {
      addProduct(newProductObj);
      setSelectedCategory('all');
      setAdminSearch('');
    }

    const targetIdx = (variantIdx !== undefined && savedVariants[variantIdx]) ? variantIdx : 0;
    const targetVar = savedVariants[targetIdx] || savedVariants[0];

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('huda_pending_stock_in', JSON.stringify({
          productId: newProductObj.id,
          variantId: targetVar?.id || '',
          costPrice: targetVar?.costPrice ?? (targetVar?.price ? Math.round(targetVar.price * 0.5) : 0),
          timestamp: Date.now(),
        }));
      } catch (e) {
        console.error(e);
      }
    }

    setIsAddModalOpen(false);
    resetForm();

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'huda_stock_in_return_state',
        JSON.stringify({
          tab: 'products',
          scrollY: window.scrollY,
          productId: newProductObj.id,
          variantId: targetVar?.id || '',
        })
      );
      window.dispatchEvent(new CustomEvent('switch_admin_tab_suppliers_stock_in', {
        detail: {
          productId: newProductObj.id,
          variantId: targetVar?.id || '',
          costPrice: targetVar?.costPrice ?? (targetVar?.price ? Math.round(targetVar.price * 0.5) : 0),
        },
      }));
    }
  };

  // Quick Preset Handlers
  const handleApplyDefaultPreset = () => {
    if (category === 'perfume') {
      setVariants(DEFAULT_PERFUME_SIZES);
    } else if (category === 'incense') {
      setVariants(DEFAULT_INCENSE_SIZES);
    } else if (category === 'other') {
      setVariants(DEFAULT_OTHER_SIZES);
    } else {
      setVariants(DEFAULT_DUBAI_SIZES);
    }
  };

  const handleAddSingleSize = (sizeName: string, andSaveOption: boolean = true) => {
    const trimmed = sizeName.trim();
    if (!trimmed) return;
    const skuCode = `HD-${category.toUpperCase()}-${trimmed.replace(/[^0-9A-Z]/gi, '')}`;
    setVariants((prev) => [
      ...prev,
      {
        name: trimmed,
        sku: skuCode || `SKU-${Date.now().toString().slice(-4)}`,
        price: 0,
        costPrice: 0,
        stockQuantity: 999,
        color: '',
      },
    ]);
    if (andSaveOption) {
      handleAddNewSizeOption(trimmed);
    }
  };

  const handleAddVariantField = () => {
    setVariants([
      ...variants,
      { 
        name: category === 'perfume' ? 'ขวดสเปรย์ 50 ml' : category === 'incense' ? 'กระปุก 50g' : category === 'other' ? 'ชิ้น/กล่อง (Standard)' : 'Size 52 (ส่วนสูง ~150-155 ซม.)', 
        sku: `SKU-${variants.length + 1}`, 
        price: 0, 
        costPrice: 0,
        stockQuantity: 999, 
        color: '', 
      },
    ]);
  };

  const handleRemoveVariantField = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  // Filter products by category & search in Admin Manager, sorted naturally by product code (A001 -> A002 -> ...)
  const filteredAdminProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCat =
          selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSearch =
          !adminSearch ||
          product.title.toLowerCase().includes(adminSearch.toLowerCase()) ||
          product.description.toLowerCase().includes(adminSearch.toLowerCase());
        return matchesCat && matchesSearch;
      })
      .sort(sortProductsNatural);
  }, [products, selectedCategory, adminSearch]);

  const categories: { id: CategoryType; label: string }[] = useMemo(() => [
    { id: 'all', label: 'ทั้งหมด (All)' },
    ...categoryOptions.map((c) => ({ id: c.id as CategoryType, label: c.label })),
  ], [categoryOptions]);

  return (
    <div className="space-y-6 text-xs text-stone-950">
      
      {/* Header & Action Buttons Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-amber-400/60 shadow-xl text-stone-950">
        <div>
          <h3 className="font-serif font-black text-lg text-stone-950 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <span>จัดการสต๊อกสินค้าเสื้อผ้า และน้ำหอมดูไบ (Dubai Catalog POS)</span>
          </h3>
          <p className="text-xs text-stone-800 font-extrabold mt-1">
            รองรับไซส์อาบายะห์ดูไบ (Size 52-58), ปริมาณน้ำหอมดูไบ (ml), ตัวเลือกสี/กลิ่น และปรับสต๊อกเรียลไทม์
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('switch_admin_tab_reports'));
              }
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 border border-emerald-700 cursor-pointer"
            title="เปิดดูสรุปต้นทุนสินค้า และกำไรคาดการณ์ในคลัง"
          >
            <TrendingUp className="w-4 h-4 text-white" />
            <span>ดูสรุปต้นทุน &amp; กำไรคลัง</span>
          </button>

          <button
            onClick={handleForceSync}
            className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-stone-950 border border-amber-400 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            title="ดึงข้อมูลสินค้าล่าสุดจากทุกเครื่องให้ตรงกัน 100%"
          >
            <RotateCcw className="w-4 h-4 text-amber-700 animate-spin-slow" />
            <span>ซิงก์ดึงข้อมูลสินค้าด่วน</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 border border-amber-500 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-stone-950" />
            <span>เพิ่มแบบสินค้าใหม่</span>
          </button>
        </div>
      </div>

      {/* 📊 กล่องสีเขียว: เชื่อมต่อสต๊อกสินค้ากับ Google Sheets (Google Sheets Live Sync) */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-950 border-2 border-emerald-400 rounded-3xl p-4 sm:p-6 shadow-2xl text-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600/30 rounded-2xl border-2 border-emerald-400 text-emerald-300 shadow-inner shrink-0">
              <FileSpreadsheet className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif font-black text-base sm:text-lg text-amber-300 flex items-center gap-1.5">
                  <span>เชื่อมต่อสต๊อกสินค้ากับ Google Sheets</span>
                  <span className="text-white text-xs sm:text-sm font-sans font-extrabold">(Live Cloud Sync)</span>
                </h3>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-[11px] font-black rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>พร้อมซิงก์เรียลไทม์ 100%</span>
                </span>
              </div>
              <p className="text-xs text-stone-200 font-bold mt-1">
                จัดการราคาและจำนวนสต๊อกสินค้าผ่าน Google Sheet แผ่นนี้ สต๊อกหน้าร้านค้าและระบบ POS จะอัปเดตตามตารางทันที!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <a
              href="https://docs.google.com/spreadsheets/d/1WA1_fnTBdXe-ykTBNr1yOt3815uy-0hguA3n1kYDzkg/edit?gid=0#gid=0"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-400/80 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
              title="เปิดตาราง Google Sheet ของคุณในแท็บใหม่"
            >
              <span>เปิดตาราง Google Sheet ↗</span>
            </a>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="px-3 py-2 bg-stone-800/90 hover:bg-stone-750 text-stone-200 border border-stone-600 font-black text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{showGuide ? 'ซ่อนวิธีเชื่อมต่อ' : 'วิธีเชื่อมต่อ'}</span>
            </button>
          </div>
        </div>

        {/* Input URL & Sync Button */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <div className="relative flex-1">
            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="วางลิงก์ Google Sheet ที่นี่..."
              className="w-full bg-stone-950 border-2 border-emerald-400/80 focus:border-amber-400 rounded-xl px-4 py-3 text-xs sm:text-sm text-amber-200 font-mono font-black placeholder-stone-500 focus:outline-none shadow-inner"
            />
          </div>
          <button
            type="button"
            onClick={handleSyncGoogleSheet}
            disabled={isSyncingSheet}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg border-2 border-amber-300 flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50 shrink-0"
            title="ดึงข้อมูลสต๊อกและราคาสินค้าจาก Google Sheets ทันที"
          >
            <RefreshCw className={`w-4 h-4 text-stone-950 ${isSyncingSheet ? 'animate-spin' : ''}`} />
            <span>{isSyncingSheet ? 'กำลังดึงข้อมูลจากชีต...' : 'ซิงก์ดึงสต๊อกทันที'}</span>
          </button>
        </div>

        {/* Sync Feedback Message */}
        {syncFeedback && (
          <div
            className={`p-3.5 rounded-xl border-2 flex items-center gap-2.5 text-xs font-black shadow-md ${
              syncFeedback.success
                ? 'bg-emerald-950 border-emerald-400 text-emerald-200'
                : 'bg-red-950 border-red-400 text-red-200'
            }`}
          >
            {syncFeedback.success ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{syncFeedback.message}</span>
          </div>
        )}

        {/* Last Sync Timestamp Indicator */}
        {storeSettings.googleSheetLastSync && !syncFeedback && (
          <div className="flex items-center gap-2 text-xs text-emerald-300/90 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ซิงก์ดึงข้อมูลสำเร็จล่าสุด: {storeSettings.googleSheetLastSync}</span>
          </div>
        )}

        {/* Step-by-Step Instructions Collapsible */}
        {showGuide && (
          <div className="p-4 bg-stone-900/90 rounded-2xl border border-emerald-500/40 text-xs text-stone-200 space-y-2 mt-2">
            <p className="font-serif font-black text-amber-300 text-sm">
              📋 ขั้นตอนการเชื่อมต่อและอัปเดต Google Sheet ให้ซิงก์กับหน้าร้าน:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-stone-200 font-bold leading-relaxed">
              <li>เปิดตาราง Google Sheet ของคุณ: <a href="https://docs.google.com/spreadsheets/d/1WA1_fnTBdXe-ykTBNr1yOt3815uy-0hguA3n1kYDzkg/edit?gid=0#gid=0" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline hover:text-amber-300">กดเปิดที่นี่</a></li>
              <li>ไปที่เมนูมุมซ้ายบนของ Google Sheet: <span className="text-amber-300">ไฟล์ (File) ➔ แชร์ (Share) ➔ เผยแพร่ไปยังเว็บ (Publish to web)</span></li>
              <li>เปลี่ยนช่องตัวเลือกจาก "หน้าเว็บ (Web page)" เป็น <span className="text-amber-300">"ค่าที่คั่นด้วยจุลภาค (.csv)"</span> แล้วกด <span className="text-emerald-400">เผยแพร่ (Publish)</span></li>
              <li>คัดลอกลิงก์ที่ได้ นำมาวางในช่องด้านบน หรือใช้ลิงก์ Google Sheet ปกติได้เลย ระบบรองรับแปลงอัตโนมัติ 100%</li>
              <li>กดปุ่ม <span className="text-amber-300 font-black">"ซิงก์ดึงสต๊อกทันที"</span> สต๊อกสินค้าและราคาในระบบ POS จะอัปเดตตรงตามตาราง Google Sheet ทันที!</li>
            </ol>
            <p className="text-[11px] text-amber-200/90 mt-2 font-medium">
              💡 หมายเหตุ: คอลัมน์มาตรฐานใน Google Sheet ได้แก่: <span className="font-mono text-white">id | title | category | description | fabric | image | sizeName | price | stock</span>
            </p>
          </div>
        )}
      </div>

      {/* Admin Category Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-amber-400/60 shadow-md text-stone-950">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <Filter className="w-4 h-4 text-amber-600 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
                  : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-96 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ค้นหาชื่อสินค้าในหลังบ้าน..."
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              className="w-full bg-white border-2 border-stone-400 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-stone-950 font-black placeholder-stone-400 focus:outline-none focus:border-amber-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <VoiceInputButton
            onTranscript={(text) => setAdminSearch(text)}
            currentValue={adminSearch}
            className="py-2 px-3 rounded-xl text-xs font-bold shrink-0"
          />
        </div>
      </div>

      {/* Product & Size/Color Stock Table Grid */}
      <div className="space-y-4">
        {filteredAdminProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-amber-400/60 text-stone-950 text-xs space-y-3 shadow-md">
            <p className="text-sm font-serif text-amber-950 font-black">ยังไม่มีรายการสินค้าในหมวดหมู่นี้ (สต๊อกว่างพร้อมสำหรับเปิดร้านขายจริง)</p>
            <p className="text-xs text-stone-800 font-extrabold">กดปุ่ม "+ เพิ่มแบบสินค้าใหม่" ด้านบนเพื่อเพิ่มสินค้าของคุณได้ทันที!</p>
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md border border-amber-500 cursor-pointer"
            >
              + เพิ่มแบบสินค้าแรกของคุณ
            </button>
          </div>
        ) : (
          filteredAdminProducts.map((product) => {
            const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);

            return (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                className="bg-white border-2 border-amber-400/60 rounded-2xl p-5 space-y-4 shadow-xl text-stone-950 transition scroll-mt-24"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      loading="lazy"
                      decoding="async"
                      className="w-16 h-20 object-contain p-1 rounded-xl border-2 border-amber-400 bg-stone-100 shrink-0 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black uppercase text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-400">
                          {getCategoryLabel(product.category)}
                        </span>
                        {product.colors && product.colors.length > 0 && (
                          <span className="text-xs font-black text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-400 flex items-center gap-1">
                            <Palette className="w-3.5 h-3.5 text-emerald-700" />
                            {product.colors.join(', ')}
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-black text-base sm:text-lg text-stone-950 mt-1">
                        {product.title}
                      </h4>
                      <p className="text-xs text-stone-800 font-extrabold mt-0.5">
                        สต๊อกรวมทั้งหมด: <strong className="text-emerald-800 text-sm font-black">{totalStock} ชิ้น</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setTitle(product.title);
                        setArabicTitle(product.arabicTitle || '');
                        setCategory(product.category);
                        setCategoryInput(getCategoryLabel(product.category));
                        if (!categoryOptions.some((c) => c.id === product.category)) {
                          const newCatItem = { id: product.category, label: product.category, isBuiltin: false };
                          saveCategoryOptions([...categoryOptions, newCatItem]);
                        }
                        setDescription(product.description || '');
                        setFabric(product.fabric || '');
                        setImagesList(Array.isArray(product.images) && product.images.length > 0 ? product.images : []);
                        setNewImageUrlInput('');
                        setVariants(
                          product.variants.map((v) => ({
                            name: v.name,
                            sku: v.sku,
                            price: v.price,
                            costPrice: v.costPrice ?? Math.round(v.price * 0.5),
                            stockQuantity: (v.stockQuantity !== undefined && !isNaN(v.stockQuantity)) ? v.stockQuantity : 0,
                            color: v.color || '',
                          }))
                        );
                        setIsAddModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md border border-amber-500 transition cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4 text-stone-950" />
                      <span>แก้ไขสินค้า &amp; ใส่ต้นทุน</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm(`คุณต้องการลบสินค้า "${product.title}" ออกจากคลังสินค้าใช่หรือไม่?\n\n*คำเตือน: การลบนี้จะทำการลบข้อมูลสินค้าออกจากคลังและหน้าคิดเงิน POS ทั่วโลก`)) {
                          deleteProduct(product.id);
                        }
                      }}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-950 border border-red-400 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                      title="ลบสินค้าชนิดนี้ออกจากคลังสินค้าอย่างถาวร"
                    >
                      <Trash2 className="w-4 h-4 text-red-700" />
                    </button>
                  </div>
                </div>

                {/* Size / Volume & Color Variants Quick Stock Adjuster */}
                <div>
                  <p className="text-xs font-serif font-black text-amber-950 mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>{product.category === 'perfume' ? 'สต๊อกน้ำหอมแยกตามขนาด/ปริมาณ (ml):' : 'สต๊อกสินค้าและต้นทุนแยกตามไซส์ (Size, Cost & Stock):'}</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {product.variants.map((variant) => {
                      const costVal = variant.costPrice ?? Math.round(variant.price * 0.5);
                      const profitVal = variant.price - costVal;

                      return (
                        <div
                          key={variant.id}
                          className={`p-3 rounded-2xl border-2 flex flex-col justify-between text-xs shadow-md transition-all duration-300 gap-2 ${
                            highlightedVariantId === variant.id
                              ? 'border-emerald-500 ring-4 ring-emerald-300 bg-emerald-50 scale-[1.02]'
                              : variant.stockQuantity > 0
                              ? 'border-emerald-500 bg-stone-50'
                              : 'border-red-400 bg-stone-50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-black text-stone-950 text-xs sm:text-sm truncate" title={variant.name}>{variant.name}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-black rounded-full transition-all ${
                                    highlightedVariantId === variant.id
                                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 animate-pulse'
                                      : variant.stockQuantity > 0
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-red-600 text-white'
                                  }`}
                                >
                                  {highlightedVariantId === variant.id
                                    ? `⚡ สต๊อกใหม่ ${variant.stockQuantity} ชิ้น`
                                    : variant.stockQuantity > 0
                                    ? `สต๊อก ${variant.stockQuantity} ชิ้น`
                                    : 'สต๊อกหมด (0)'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenQuickStockAdjust(product, variant)}
                                  className="px-1.5 py-0.5 text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-950 font-black rounded-lg border border-amber-400 flex items-center gap-0.5 transition cursor-pointer shadow-xs"
                                  title="ปรับยอดสต๊อกชิ้นนี้โดยตรง (ต้องใส่รหัส Admin PIN)"
                                >
                                  <Lock className="w-2.5 h-2.5 text-amber-800" />
                                  <span>ปรับยอด</span>
                                </button>
                              </div>
                            </div>
                            {variant.color && (
                              <span className="text-xs text-amber-950 block font-black mb-1.5">
                                🎨 {variant.color}
                              </span>
                            )}
                            <div className="flex flex-wrap items-center gap-1.5 text-xs mt-1.5">
                              <span className="font-black text-stone-950 bg-white px-2 py-1 rounded-lg border border-stone-300">
                                ขาย ฿{variant.price.toLocaleString()}
                              </span>
                              
                              <span className="font-black text-amber-950 bg-amber-100 px-2 py-1 rounded-lg border border-amber-400">
                                ต้นทุน ฿{costVal.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-1.5 text-xs mt-2 pt-2 border-t border-stone-200">
                              <span className="font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-400 text-[11px]">
                                กำไร {profitVal >= 0 ? '+' : ''}฿{profitVal.toLocaleString()}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenQuickStockIn(product, variant)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black rounded-lg text-[11px] shadow-xs flex items-center gap-1 cursor-pointer transition border border-emerald-700 hover:scale-[1.02]"
                                title={`บันทึกรับสต๊อกเข้าทันทีสำหรับ ${variant.name}`}
                              >
                                <Plus className="w-3.5 h-3.5 text-white" />
                                <span>+ รับเข้า (Stock IN)</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Product Modal with Sticky Header & Sticky Bottom Footer */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl text-stone-950 my-4 max-h-[90vh] flex flex-col">
            
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-white px-5 py-4 border-b-2 border-amber-400/40 flex justify-between items-center shrink-0">
              <h3 className="font-serif font-black text-base sm:text-xl text-stone-950 flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-600" />
                <span>
                  {editingProduct 
                    ? 'แก้ไขสินค้า & สต๊อก (Edit Product)' 
                    : category === 'perfume' 
                      ? 'เพิ่มสินค้าหมวดน้ำหอมดูไบ (Dubai Perfume)' 
                      : 'เพิ่มสินค้าและกำหนดสต๊อกตามไซส์ (Add New Product)'}
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveProductAndOpenStockIn()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md border border-emerald-700 transition flex items-center gap-1.5 cursor-pointer"
                  title="บันทึกสินค้า และเปิดหน้าบันทึกรับสินค้าเข้าสต๊อก (Stock IN) ที่หน้าสินค้าเข้า-ออก & เคลียร์ Supplier ทันที"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>+ บันทึกรับสินค้าเข้า (Stock IN)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-stone-700 hover:text-stone-950 p-1.5 rounded-full border border-stone-300 hover:bg-stone-100 cursor-pointer"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <form id="admin-product-form" onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs no-scrollbar flex flex-col justify-between">
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-stone-950 font-black text-xs sm:text-sm">ชื่อแบบสินค้า *</label>
                      <VoiceInputButton
                        onTranscript={(text) => setTitle(text)}
                        currentValue={title}
                      />
                    </div>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={category === 'perfume' ? 'เช่น น้ำหอมดูไบ Royal Oud Amber Dubai 100ml' : 'เช่น ชุดอาบายะห์ดูไบปักลายทอง Royal Crystal Abaya'}
                      className="w-full bg-white border-2 border-stone-400 focus:border-amber-500 rounded-xl p-3 text-stone-950 font-black text-sm placeholder-stone-400 focus:outline-none"
                    />
                  </div>

                  <div className="relative" ref={categoryDropdownRef}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-stone-950 font-black text-xs sm:text-sm">
                        เลือกหมวดหมู่สินค้า *
                      </label>
                      <VoiceInputButton
                        onTranscript={(text) => {
                          setCategoryInput(text);
                          handleAddNewCategoryOption(text);
                        }}
                        currentValue={categoryInput}
                      />
                    </div>

                    {/* Single Unified Input with Dropdown Arrow */}
                    <div className="relative">
                      <input
                        type="text"
                        value={categoryInput}
                        onFocus={() => setIsCategoryDropdownOpen(true)}
                        onClick={() => setIsCategoryDropdownOpen(true)}
                        onChange={(e) => {
                          setCategoryInput(e.target.value);
                          setIsCategoryDropdownOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (categoryInput.trim()) {
                              handleAddNewCategoryOption(categoryInput.trim());
                            }
                          }
                        }}
                        placeholder="คลิกเลือกหมวดหมู่ หรือพิมพ์เพิ่มหมวดหมู่ใหม่..."
                        className="w-full bg-white border-2 border-stone-400 focus:border-amber-500 rounded-xl p-3 pr-16 text-stone-950 font-black text-sm placeholder-stone-400 focus:outline-none shadow-sm cursor-text"
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                        {categoryInput && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategoryInput('');
                              setIsCategoryDropdownOpen(true);
                            }}
                            className="p-1 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition cursor-pointer"
                            title="เคลียร์ช่องให้ว่าง"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                          className="p-1.5 text-stone-600 hover:text-amber-800 transition cursor-pointer"
                          title="เปิด/ปิด รายการหมวดหมู่สินค้า"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180 text-amber-600' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Floating Dropdown List with Edit & Delete on each item */}
                    {isCategoryDropdownOpen && (
                      <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border-2 border-amber-400 rounded-2xl shadow-2xl max-h-72 overflow-y-auto no-scrollbar py-1">
                        {/* Header info in dropdown */}
                        <div className="px-3 py-1.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-[11px] font-black text-stone-700">
                          <span>รายการหมวดหมู่สินค้า ({categoryOptions.length} หมวด)</span>
                          <span className="text-[10px] text-stone-500 font-bold">กด ✏️ แก้ไข หรือ 🗑️ ลบได้อิสระ</span>
                        </div>

                        {/* Add new button if typed text is not yet in options */}
                        {isTypedCategoryNew && (
                          <button
                            type="button"
                            onClick={() => {
                              handleAddNewCategoryOption(categoryInput.trim());
                            }}
                            className="w-full text-left px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 border-b border-amber-300 text-xs font-black text-amber-950 flex items-center justify-between transition cursor-pointer"
                          >
                            <span>➕ เพิ่มหมวดหมู่ใหม่: <strong className="text-amber-900 underline">"{categoryInput.trim()}"</strong></span>
                            <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-full border border-amber-400 font-bold">กดเพื่อเพิ่มตัวเลือก</span>
                          </button>
                        )}

                        {/* List of category options */}
                        <div className="divide-y divide-stone-100">
                          {filteredCategoryOptions.map((catItem) => {
                            const isEditing = editingCatId === catItem.id;

                            if (isEditing) {
                              return (
                                <div key={catItem.id} className="p-2 bg-amber-50/90 flex items-center gap-1.5 border-b border-amber-300">
                                  <input
                                    type="text"
                                    value={editingCatLabel}
                                    onChange={(e) => setEditingCatLabel(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveEditCategoryOption(catItem.id);
                                      } else if (e.key === 'Escape') {
                                        setEditingCatId(null);
                                      }
                                    }}
                                    autoFocus
                                    className="flex-1 bg-white border-2 border-amber-500 rounded-lg px-2.5 py-1 text-xs font-black text-stone-950 focus:outline-none shadow-inner"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditCategoryOption(catItem.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black shadow transition cursor-pointer"
                                    title="บันทึกการแก้ไขชื่อหมวดหมู่นี้"
                                  >
                                    บันทึก
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingCatId(null)}
                                    className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-black transition cursor-pointer"
                                    title="ยกเลิก"
                                  >
                                    ยกเลิก
                                  </button>
                                </div>
                              );
                            }

                            const isSelected = category === catItem.id;

                            return (
                              <div
                                key={catItem.id}
                                className={`px-3 py-2 text-xs font-black transition flex items-center justify-between group ${
                                  isSelected
                                    ? 'bg-amber-100 text-amber-950'
                                    : 'text-stone-900 hover:bg-stone-50'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleSelectCategory(catItem)}
                                  className="flex-1 text-left flex items-center justify-between pr-2 cursor-pointer truncate"
                                >
                                  <span className="truncate">{catItem.label}</span>
                                  {isSelected && (
                                    <span className="text-amber-800 text-[11px] font-black shrink-0 ml-1.5">✓ เลือกอยู่</span>
                                  )}
                                </button>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingCatId(catItem.id);
                                      setEditingCatLabel(catItem.label);
                                    }}
                                    className="p-1 hover:bg-amber-200 text-stone-500 hover:text-amber-950 rounded transition cursor-pointer"
                                    title={`แก้ไขชื่อหมวดหมู่ "${catItem.label}"`}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCategoryOption(catItem);
                                    }}
                                    className="p-1 hover:bg-red-100 text-stone-400 hover:text-red-700 rounded transition cursor-pointer"
                                    title={`ลบหมวดหมู่ "${catItem.label}" ออกจากรายการ`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer Reset Button */}
                        <div className="p-2 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-[11px]">
                          <span className="text-stone-500 font-bold">บันทึกตัวเลือกลงระบบถาวร</span>
                          <button
                            type="button"
                            onClick={handleResetCategoryDefaults}
                            className="text-stone-600 hover:text-red-700 underline font-black cursor-pointer transition flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>รีเซ็ตหมวดหมู่เริ่มต้น</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={fabricDropdownRef}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-stone-950 font-black text-xs sm:text-sm">
                        {category === 'perfume' 
                          ? 'ประเภทน้ำหอม / กลิ่น (Fragrance Type / Scents)' 
                          : category === 'incense' 
                          ? 'ชนิดเครื่องหอม / ส่วนผสม (Bukhoor Type)' 
                          : category === 'kaftan'
                          ? 'ชนิดเนื้อผ้าชุดคัฟทาน (Kaftan Fabric)'
                          : category === 'other' 
                          ? 'ประเภทสินค้า / รายละเอียด' 
                          : category === 'combo'
                          ? 'รายละเอียดเซ็ตสินค้า (Combo Set Details)'
                          : 'ชนิดเนื้อผ้า (Fabric)'}
                      </label>
                      <VoiceInputButton
                        onTranscript={(text) => {
                          setFabric(text);
                          handleAddNewFabricOption(text);
                        }}
                        currentValue={fabric}
                      />
                    </div>
                    
                    {/* Single Unified Input with Dropdown Arrow */}
                    <div className="relative">
                      <input
                        type="text"
                        value={fabric}
                        onFocus={() => setIsFabricDropdownOpen(true)}
                        onClick={() => setIsFabricDropdownOpen(true)}
                        onChange={(e) => {
                          setFabric(e.target.value);
                          setIsFabricDropdownOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (fabric.trim()) {
                              handleAddNewFabricOption(fabric.trim());
                              setIsFabricDropdownOpen(false);
                            }
                          }
                        }}
                        placeholder={
                          category === 'perfume'
                            ? 'คลิกเลือกกลิ่น/ประเภทน้ำหอม หรือพิมพ์กลิ่นใหม่...'
                            : category === 'incense'
                            ? 'คลิกเลือกชนิดเครื่องหอม หรือพิมพ์ใหม่ เช่น ไม้กฤษณาดูไบ...'
                            : category === 'other'
                            ? 'คลิกเลือกประเภท หรือพิมพ์รายละเอียดสินค้า...'
                            : category === 'combo'
                            ? 'คลิกเลือกรูปแบบเซ็ต หรือพิมพ์รายละเอียดเซ็ต...'
                            : category === 'kaftan'
                            ? 'คลิกเลือกชนิดเนื้อผ้า หรือพิมพ์ชนิดผ้าใหม่ เช่น ผ้าไหม...'
                            : 'คลิกเลือกชนิดเนื้อผ้า หรือพิมพ์ชนิดผ้าใหม่ เช่น ผ้าไหม, ผ้านิดา...'
                        }
                        className="w-full bg-white border-2 border-stone-400 focus:border-amber-500 rounded-xl p-3 pr-10 text-stone-950 font-black text-sm placeholder-stone-400 focus:outline-none shadow-sm cursor-text"
                      />
                      <button
                        type="button"
                        onClick={() => setIsFabricDropdownOpen(!isFabricDropdownOpen)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-stone-600 hover:text-amber-800 transition cursor-pointer"
                        title="เปิด/ปิด รายการตัวเลือก"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFabricDropdownOpen ? 'rotate-180 text-amber-600' : ''}`} />
                      </button>
                    </div>

                    {/* Floating Dropdown List with Edit & Delete on each item */}
                    {isFabricDropdownOpen && (
                      <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border-2 border-amber-400 rounded-2xl shadow-2xl max-h-72 overflow-y-auto no-scrollbar py-1">
                        {/* Header info in dropdown */}
                        <div className="px-3 py-1.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-[11px] font-black text-stone-700">
                          <span>
                            {category === 'perfume'
                              ? 'ตัวเลือกน้ำหอมดูไบ'
                              : category === 'incense'
                              ? 'ตัวเลือกเครื่องหอมดูไบ'
                              : category === 'kaftan'
                              ? 'ตัวเลือกผ้าชุดคัฟทาน'
                              : category === 'combo'
                              ? 'ตัวเลือกเซ็ตสินค้า'
                              : category === 'other'
                              ? 'ตัวเลือกสินค้าทั่วไป'
                              : 'ตัวเลือกชนิดผ้าอาบายะห์'} ({currentCategoryFabricOptions.length} ตัวเลือก)
                          </span>
                          <span className="text-[10px] text-stone-500 font-bold">กด ✏️ แก้ไข หรือ 🗑️ ลบได้อิสระ</span>
                        </div>

                        {/* Add new button if typed text is not yet in options */}
                        {fabric.trim() && !currentCategoryFabricOptions.some((opt) => opt.toLowerCase() === fabric.trim().toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => {
                              handleAddNewFabricOption(fabric.trim());
                              setIsFabricDropdownOpen(false);
                            }}
                            className="w-full text-left px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 border-b border-amber-300 text-xs font-black text-amber-950 flex items-center justify-between transition cursor-pointer"
                          >
                            <span>➕ เพิ่ม <strong className="text-amber-900 underline">"{fabric.trim()}"</strong> เข้าหมวดนี้</span>
                            <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-full border border-amber-400 font-bold">กดเพื่อเพิ่ม</span>
                          </button>
                        )}

                        {/* List of fabric options */}
                        <div className="divide-y divide-stone-100">
                          {filteredFabricOptions.map((opt, idx) => {
                            const isEditing = editingFabricIdx === idx;

                            if (isEditing) {
                              return (
                                <div key={idx} className="p-2 bg-amber-50/90 flex items-center gap-1.5 border-b border-amber-300">
                                  <input
                                    type="text"
                                    value={editingFabricText}
                                    onChange={(e) => setEditingFabricText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveEditFabricOption(idx, opt);
                                      } else if (e.key === 'Escape') {
                                        setEditingFabricIdx(null);
                                      }
                                    }}
                                    autoFocus
                                    className="flex-1 bg-white border-2 border-amber-500 rounded-lg px-2.5 py-1 text-xs font-black text-stone-950 focus:outline-none shadow-inner"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditFabricOption(idx, opt)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black shadow transition cursor-pointer"
                                    title="บันทึกการแก้ไข"
                                  >
                                    บันทึก
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingFabricIdx(null)}
                                    className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-black transition cursor-pointer"
                                    title="ยกเลิก"
                                  >
                                    ยกเลิก
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={opt}
                                className={`px-3 py-2 text-xs font-black transition flex items-center justify-between group ${
                                  fabric === opt
                                    ? 'bg-amber-100 text-amber-950'
                                    : 'text-stone-900 hover:bg-stone-50'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFabric(opt);
                                    setIsFabricDropdownOpen(false);
                                  }}
                                  className="flex-1 text-left flex items-center justify-between pr-2 cursor-pointer truncate"
                                >
                                  <span className="truncate">{opt}</span>
                                  {fabric === opt && (
                                    <span className="text-amber-800 text-[11px] font-black shrink-0 ml-1.5">✓ เลือกอยู่</span>
                                  )}
                                </button>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingFabricIdx(idx);
                                      setEditingFabricText(opt);
                                    }}
                                    className="p-1 hover:bg-amber-200 text-stone-500 hover:text-amber-950 rounded transition cursor-pointer"
                                    title={`แก้ไขชื่อ "${opt}"`}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteFabricOption(opt);
                                    }}
                                    className="p-1 hover:bg-red-100 text-stone-400 hover:text-red-700 rounded transition cursor-pointer"
                                    title={`ลบ "${opt}" ออกจากรายการ`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer Reset Button */}
                        <div className="p-2 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-[11px]">
                          <span className="text-stone-500 font-bold">
                            ผูกเฉพาะหมวด{category === 'perfume' ? 'น้ำหอม' : category === 'incense' ? 'เครื่องหอม' : category === 'kaftan' ? 'คัฟทาน' : category === 'combo' ? 'เซ็ต' : category === 'other' ? 'ทั่วไป' : 'อาบายะห์'}
                          </span>
                          <button
                            type="button"
                            onClick={handleResetFabricDefaults}
                            className="text-stone-600 hover:text-amber-800 font-bold underline cursor-pointer"
                            title="คืนค่าตัวเลือกเริ่มต้นเฉพาะหมวดนี้"
                          >
                            ↺ รีเซ็ตหมวดนี้
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Compressed Multi-Image Upload Section */}
                  <div className="sm:col-span-2 space-y-3 p-4 bg-stone-50 rounded-2xl border-2 border-amber-400/50 shadow-md text-stone-950">
                    <div className="flex items-center justify-between">
                      <label className="block text-stone-950 font-black text-xs sm:text-sm">
                        🖼️ รูปภาพสินค้า (เพิ่มได้หลายรูปภาพ / Smart Compressed HD)
                      </label>
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                        {imagesList.length} รูปภาพ
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow transition border border-amber-500">
                        <Camera className="w-4 h-4 text-stone-950" />
                        <span>ถ่ายภาพเพิ่มจากกล้อง</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={handleImageFileUpload}
                        />
                      </label>

                      <label className="cursor-pointer px-4 py-2.5 bg-stone-100 hover:bg-stone-200 border-2 border-stone-300 text-stone-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition">
                        <ImageIcon className="w-4 h-4 text-stone-700" />
                        <span>เพิ่มจากอัลบั้มภาพ</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFileUpload}
                        />
                      </label>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={newImageUrlInput}
                          onChange={(e) => setNewImageUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddUrlImage();
                            }
                          }}
                          placeholder="หรือวางลิงก์รูปภาพ Image URL (https://...) แล้วกด + เพิ่มรูป"
                          className="w-full bg-white border-2 border-stone-400 rounded-xl p-2.5 text-stone-950 font-black text-xs pl-8 font-mono placeholder-stone-400 focus:outline-none focus:border-amber-500"
                        />
                        <LinkIcon className="w-4 h-4 text-amber-600 absolute left-2.5 top-3" />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddUrlImage}
                        className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow transition border border-amber-500 cursor-pointer shrink-0"
                      >
                        + เพิ่มรูปภาพนี้
                      </button>
                    </div>

                    {/* Image Thumbnails List */}
                    {imagesList.length > 0 && (
                      <div className="pt-3 border-t border-amber-400/30 space-y-2">
                        <span className="text-xs font-black text-stone-800 block">
                          รายการรูปภาพสินค้า ({imagesList.length} รายการ - รูปแรกจะเป็นภาพปกหลัก):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          {imagesList.map((img, idx) => (
                            <div
                              key={idx}
                              className={`relative group rounded-xl border-2 overflow-hidden bg-white shadow-sm flex flex-col justify-between ${
                                idx === 0 ? 'border-amber-500 ring-2 ring-amber-400' : 'border-stone-300'
                              }`}
                            >
                              <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100">
                                <img
                                  src={img}
                                  alt={`Image ${idx + 1}`}
                                  className="w-full h-full object-contain p-1"
                                />
                                {idx === 0 && (
                                  <span className="absolute top-1 left-1 bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow">
                                    ภาพปกหลัก
                                  </span>
                                )}
                              </div>
                              <div className="p-1.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-1">
                                {idx !== 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSetMainCover(idx)}
                                    className="text-[10px] font-black text-amber-800 hover:text-amber-950 underline"
                                  >
                                    ตั้งเป็นปก
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-black text-emerald-700">ปกปัจจุบัน</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="text-[10px] font-black text-red-600 hover:text-red-800 p-0.5 rounded"
                                  title="ลบรูปนี้"
                                >
                                  ลบ
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2 relative" ref={descriptionDropdownRef}>
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                      <div className="flex items-center gap-1.5">
                        <label className="block text-stone-950 font-black text-xs sm:text-sm">
                          รายละเอียดสินค้า (ถ้ามี / ไม่บังคับกรอก)
                        </label>
                        <span className="text-[10px] text-amber-800 font-extrabold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                          (เลือกจาก dropdown หรือพิมพ์เพิ่มได้อิสระ)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsDescriptionDropdownOpen((prev) => !prev)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-stone-950 font-black rounded-lg text-[11px] border border-amber-400 transition flex items-center gap-1 shadow-xs cursor-pointer"
                          title="คลิกเลือกรายละเอียดจากตัวเลือก Dropdown"
                        >
                          <span>ตัวเลือกสำเร็จรูป ({descriptionOptions.length})</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDescriptionDropdownOpen ? 'rotate-180 text-amber-700' : ''}`} />
                        </button>
                        <VoiceInputButton
                          mode="append"
                          onTranscript={(text) => {
                            setDescription((prev) => (prev ? `${prev} ${text}` : text));
                            setIsDescriptionDropdownOpen(true);
                          }}
                          currentValue={description}
                          title="พูดพิมพ์รายละเอียดสินค้า"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        rows={3}
                        placeholder={
                          category === 'perfume'
                            ? 'เช่น กลิ่นหอมติดทนนาน 24 ชม. นำเข้าจากดูไบแท้ (กรอกหรือไม่กรอกก็ได้ ไม่บังคับ)'
                            : 'กรอกหรือไม่กรอกก็ได้ (ไม่บังคับ) — คลิกเพื่อเลือกตัวเลือก หรือพิมพ์รายละเอียดใหม่'
                        }
                        value={description}
                        onFocus={() => setIsDescriptionDropdownOpen(true)}
                        onClick={() => setIsDescriptionDropdownOpen(true)}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          setIsDescriptionDropdownOpen(true);
                        }}
                        className="w-full bg-white border-2 border-stone-400 focus:border-amber-500 rounded-xl p-3 pr-10 text-stone-950 font-black placeholder-stone-400 focus:outline-none shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setIsDescriptionDropdownOpen((prev) => !prev)}
                        className="absolute right-2.5 top-3 p-1.5 text-stone-600 hover:text-amber-800 transition cursor-pointer"
                        title="เปิด/ปิด รายการตัวเลือกรายละเอียด"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDescriptionDropdownOpen ? 'rotate-180 text-amber-600' : ''}`} />
                      </button>
                    </div>

                    {/* Quick chips below */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[11px] font-black text-stone-600 shrink-0">ตัวเลือกด่วน:</span>
                      {descriptionOptions.slice(0, 4).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setDescription(opt);
                            setIsDescriptionDropdownOpen(false);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black border transition cursor-pointer max-w-[220px] truncate ${
                            description === opt
                              ? 'bg-amber-200 border-amber-400 text-amber-950 shadow-xs'
                              : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
                          }`}
                          title={opt}
                        >
                          {opt}
                        </button>
                      ))}
                      {isTypedDescriptionNew && (
                        <button
                          type="button"
                          onClick={() => handleAddNewDescriptionOption(description.trim())}
                          className="px-2 py-1 rounded-lg text-[10px] font-black bg-emerald-100 hover:bg-emerald-200 border border-emerald-400 text-emerald-900 flex items-center gap-1 cursor-pointer transition shadow-xs"
                          title="กดเพื่อบันทึกข้อความนี้เป็นตัวเลือกใน Dropdown"
                        >
                          <Plus className="w-3 h-3 text-emerald-700" />
                          <span>บันทึกข้อความนี้เป็นตัวเลือก</span>
                        </button>
                      )}
                    </div>

                    {/* Floating Dropdown Menu */}
                    {isDescriptionDropdownOpen && (
                      <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border-2 border-amber-400 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                        {/* Header */}
                        <div className="px-3.5 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-[11px] font-black text-amber-950">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>ตัวเลือกรายละเอียดสินค้า ({descriptionOptions.length} รายการ)</span>
                          </span>
                          <button
                            type="button"
                            onClick={handleResetDescriptionOptions}
                            className="text-[10px] text-stone-500 hover:text-amber-800 underline font-bold cursor-pointer"
                            title="รีเซ็ตเป็นค่าเริ่มต้น"
                          >
                            รีเซ็ตค่าเริ่มต้น
                          </button>
                        </div>

                        {/* Add new button if typed text is not yet in options */}
                        {isTypedDescriptionNew && (
                          <button
                            type="button"
                            onClick={() => handleAddNewDescriptionOption(description.trim())}
                            className="w-full text-left px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border-b border-emerald-300 text-xs font-black text-emerald-950 flex items-center justify-between transition cursor-pointer"
                          >
                            <span className="truncate pr-2">
                              ➕ เพิ่มเป็นตัวเลือกใหม่: <strong className="text-emerald-900 underline">"{description.trim()}"</strong>
                            </span>
                            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-400 font-bold shrink-0">
                              กดบันทึกตัวเลือก
                            </span>
                          </button>
                        )}

                        {/* Options List */}
                        <div className="divide-y divide-stone-100">
                          {filteredDescriptionOptions.length === 0 && !isTypedDescriptionNew ? (
                            <div className="p-4 text-center text-xs text-stone-500 font-bold">
                              ไม่พบตัวเลือกรายละเอียดที่ตรงกับ "{description}"
                            </div>
                          ) : (
                            filteredDescriptionOptions.map((opt, idx) => {
                              const isSelected = description === opt;
                              const isEditing = editingDescIdx === idx;

                              return (
                                <div
                                  key={idx}
                                  className={`px-3 py-2 text-xs flex items-start justify-between gap-2 transition ${
                                    isSelected
                                      ? 'bg-amber-100/70 text-amber-950 font-black'
                                      : 'hover:bg-amber-50/60 text-stone-900 font-medium'
                                  }`}
                                >
                                  {isEditing ? (
                                    <div className="flex-1 flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        value={editingDescText}
                                        onChange={(e) => setEditingDescText(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleUpdateDescriptionOption(idx, editingDescText);
                                          }
                                        }}
                                        className="flex-1 px-2 py-1 border-2 border-amber-500 rounded-lg text-xs font-black text-stone-950 bg-white"
                                        autoFocus
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateDescriptionOption(idx, editingDescText)}
                                        className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                                        title="บันทึก"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingDescIdx(null);
                                          setEditingDescText('');
                                        }}
                                        className="p-1 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 cursor-pointer"
                                        title="ยกเลิก"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <div
                                        onClick={() => {
                                          setDescription(opt);
                                          setIsDescriptionDropdownOpen(false);
                                        }}
                                        className="flex-1 flex items-start gap-2 cursor-pointer text-left py-0.5"
                                      >
                                        <span className="mt-0.5 shrink-0">
                                          {isSelected ? (
                                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                          ) : (
                                            <span className="w-4 h-4 block" />
                                          )}
                                        </span>
                                        <span className="leading-snug break-words">{opt}</span>
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingDescIdx(idx);
                                            setEditingDescText(opt);
                                          }}
                                          className="p-1 text-stone-400 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                                          title="แก้ไขข้อความตัวเลือกนี้"
                                        >
                                          <span className="text-xs">✏️</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteDescriptionOption(opt)}
                                          className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                          title="ลบตัวเลือกนี้"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dynamic Size & Volume Variants Manager */}
                <div className="pt-4 border-t-2 border-amber-400/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-serif font-black text-amber-950 text-sm sm:text-base flex items-center gap-1.5">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <span>
                        {category === 'perfume'
                          ? 'กำหนดขนาดขวดน้ำหอม (ml), กลิ่น และราคาขาย:'
                          : 'กำหนดสี, ไซส์ และราคาขายสินค้า:'}
                      </span>
                    </label>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {variants.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setVariants([])}
                          className="px-3 py-1.5 bg-red-100 text-red-950 border border-red-400 rounded-xl text-xs font-black hover:bg-red-200 transition cursor-pointer"
                          title="ล้างรายการทั้งหมดเพื่อเลือกเฉพาะขนาดที่ต้องการ"
                        >
                          ล้างรายการทั้งหมด
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleApplyDefaultPreset}
                        className="px-3 py-1.5 bg-stone-100 text-stone-950 border-2 border-stone-300 rounded-xl text-xs font-black shadow-sm hover:bg-amber-100 transition cursor-pointer"
                        title="คลิกหากต้องการใส่ชุดมาตรฐานทั้งหมดในครั้งเดียว"
                      >
                        {category === 'perfume' ? '⚡ ใส่ทุกปริมาณขวดมาตรฐาน' : '⚡ ใส่ทุกไซส์มาตรฐาน (52-60)'}
                      </button>
                      <button
                        type="button"
                        onClick={handleAddVariantField}
                        className="px-3 py-1.5 bg-amber-400 text-stone-950 border border-amber-500 rounded-xl text-xs font-black hover:bg-amber-300 transition cursor-pointer shadow-sm"
                      >
                        {category === 'perfume' ? '+ เพิ่มขนาดขวดอื่น' : '+ เพิ่มไซส์/สีอื่น'}
                      </button>
                    </div>
                  </div>

                  {/* Custom Size / Volume Combobox & Quick Add Buttons */}
                  <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border-2 border-amber-400/50 text-stone-950">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-950 font-black shrink-0 flex items-center gap-1">
                        ➕ เพิ่มขนาดกำหนดเอง / เลือกจากรายการ:
                      </span>
                      <VoiceInputButton
                        mode="append"
                        onTranscript={(text) => {
                          setCustomVariantInput(text);
                          setIsSizeDropdownOpen(true);
                        }}
                        currentValue={customVariantInput}
                      />
                    </div>

                    {/* Combobox Input with Dropdown Arrow */}
                    <div className="relative" ref={sizeDropdownRef}>
                      <div className="flex items-stretch gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={customVariantInput}
                            onChange={(e) => {
                              setCustomVariantInput(e.target.value);
                              setIsSizeDropdownOpen(true);
                            }}
                            onFocus={() => setIsSizeDropdownOpen(true)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (customVariantInput.trim()) {
                                  handleAddSingleSize(customVariantInput.trim(), true);
                                  setCustomVariantInput('');
                                  setIsSizeDropdownOpen(false);
                                }
                              }
                            }}
                            placeholder={
                              category === 'perfume'
                                ? 'คลิกเลือกขนาดขวด หรือพิมพ์ขนาดใหม่ (เช่น ขวดลูกกลิ้ง 6 ml หรือ ขวดสเปรย์พกพา 15 ml)...'
                                : 'คลิกเลือกขนาด หรือพิมพ์ไซส์ใหม่ (เช่น Size 60, Free Size, อก 44" ยาว 56")...'
                            }
                            className="w-full bg-white border-2 border-stone-400 rounded-xl px-3 py-2 pr-9 text-xs font-black text-stone-950 placeholder-stone-400 focus:outline-none focus:border-amber-500 shadow-inner"
                          />
                          <button
                            type="button"
                            onClick={() => setIsSizeDropdownOpen((prev) => !prev)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-600 hover:text-stone-950 transition cursor-pointer"
                            title="เปิด/ปิดรายการขนาด"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSizeDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (customVariantInput.trim()) {
                              handleAddSingleSize(customVariantInput.trim(), true);
                              setCustomVariantInput('');
                              setIsSizeDropdownOpen(false);
                            }
                          }}
                          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow transition border border-amber-500 cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          <span>+ เพิ่มขนาดนี้</span>
                        </button>
                      </div>

                      {/* Floating Dropdown Menu */}
                      {isSizeDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border-2 border-amber-400 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
                          {/* Header */}
                          <div className="p-2 bg-amber-100/90 border-b border-amber-300 flex items-center justify-between text-[11px] font-black text-amber-950">
                            <span>
                              📦 รายการขนาด/ปริมาณหมวด {category === 'perfume' ? 'น้ำหอมดูไบ' : category === 'incense' ? 'เครื่องหอม' : category === 'kaftan' ? 'ชุดคัฟทาน' : category === 'combo' ? 'เซ็ตสุดคุ้ม' : category === 'other' ? 'สินค้าอื่นๆ' : 'ชุดอาบายะห์'} ({filteredCategorySizeOptions.length})
                            </span>
                            <span className="text-[10px] text-stone-500 font-normal">คลิกเพื่อใส่ | ✏️ แก้ไข | 🗑️ ลบ</span>
                          </div>

                          {/* Quick Add Custom typed size option if not already in list */}
                          {customVariantInput.trim() && !currentCategorySizeOptions.includes(customVariantInput.trim()) && (
                            <button
                              type="button"
                              onClick={() => {
                                handleAddSingleSize(customVariantInput.trim(), true);
                                setCustomVariantInput('');
                                setIsSizeDropdownOpen(false);
                              }}
                              className="w-full text-left px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 border-b border-amber-300 text-xs font-black text-amber-950 flex items-center justify-between transition cursor-pointer"
                            >
                              <span>➕ เพิ่มและใช้ขนาด <strong className="text-amber-900 underline">"{customVariantInput.trim()}"</strong></span>
                              <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-full border border-amber-400 font-bold">กดเพื่อเพิ่ม</span>
                            </button>
                          )}

                          {/* List of size options */}
                          <div className="divide-y divide-stone-100">
                            {filteredCategorySizeOptions.map((opt, idx) => {
                              const isEditing = editingSizeIdx === idx;

                              if (isEditing) {
                                return (
                                  <div key={idx} className="p-2 bg-amber-50/90 flex items-center gap-1.5 border-b border-amber-300">
                                    <input
                                      type="text"
                                      value={editingSizeText}
                                      onChange={(e) => setEditingSizeText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleSaveEditSizeOption(idx, opt);
                                        } else if (e.key === 'Escape') {
                                          setEditingSizeIdx(null);
                                        }
                                      }}
                                      autoFocus
                                      className="flex-1 bg-white border-2 border-amber-500 rounded-lg px-2.5 py-1 text-xs font-black text-stone-950 focus:outline-none shadow-inner"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditSizeOption(idx, opt)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black shadow transition cursor-pointer"
                                      title="บันทึกการแก้ไข"
                                    >
                                      บันทึก
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingSizeIdx(null)}
                                      className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-black transition cursor-pointer"
                                      title="ยกเลิก"
                                    >
                                      ยกเลิก
                                    </button>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={opt}
                                  className="px-3 py-2 text-xs font-black transition flex items-center justify-between group hover:bg-amber-50/60"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleAddSingleSize(opt, false);
                                      setIsSizeDropdownOpen(false);
                                    }}
                                    className="flex-1 text-left flex items-center justify-between pr-2 cursor-pointer truncate"
                                    title={`คลิกเพื่อใส่ ${opt}`}
                                  >
                                    <span className="truncate">{opt}</span>
                                    <span className="text-[10px] text-amber-700 font-bold opacity-0 group-hover:opacity-100 transition shrink-0 ml-1.5">+ ใส่ขนาดนี้</span>
                                  </button>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSizeIdx(idx);
                                        setEditingSizeText(opt);
                                      }}
                                      className="p-1 hover:bg-amber-200 text-stone-500 hover:text-amber-950 rounded transition cursor-pointer"
                                      title={`แก้ไขชื่อขนาด "${opt}"`}
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSizeOption(opt);
                                      }}
                                      className="p-1 hover:bg-red-100 text-stone-400 hover:text-red-700 rounded transition cursor-pointer"
                                      title={`ลบ "${opt}" ออกจากรายการ`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Footer Reset Button */}
                          <div className="p-2 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-[11px]">
                            <span className="text-stone-500 font-bold">
                              ผูกเฉพาะหมวด{category === 'perfume' ? 'น้ำหอม' : category === 'incense' ? 'เครื่องหอม' : category === 'kaftan' ? 'คัฟทาน' : category === 'combo' ? 'เซ็ต' : category === 'other' ? 'ทั่วไป' : 'อาบายะห์'}
                            </span>
                            <button
                              type="button"
                              onClick={handleResetSizeDefaults}
                              className="text-stone-600 hover:text-amber-800 font-bold underline cursor-pointer"
                              title="คืนค่าตัวเลือกเริ่มต้นเฉพาะหมวดนี้"
                            >
                              ↺ รีเซ็ตขนาดหมวดนี้
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dynamic Quick Add Buttons mapped from currentCategorySizeOptions */}
                    <div className="space-y-1.5 pt-2 border-t border-amber-400/30 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-stone-900 shrink-0">⚡ ปุ่มกดเพิ่มเร็ว (คลิกเพื่อเพิ่มลงรายการทันที):</span>
                        <span className="text-[11px] text-stone-600 font-bold">({currentCategorySizeOptions.length} ขนาด)</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {currentCategorySizeOptions.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleAddSingleSize(sz, false)}
                            className="px-2.5 py-1 bg-white hover:bg-amber-400 text-stone-950 border border-stone-300 hover:border-amber-500 rounded-lg text-xs font-mono font-black transition cursor-pointer shadow-xs"
                            title={`คลิกเพื่อเพิ่ม ${sz}`}
                          >
                            + {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                    {variants.length === 0 ? (
                      <div className="p-8 text-center bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-400 text-stone-900 space-y-2">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-200/80 flex items-center justify-center text-amber-900 text-xl font-black border border-amber-400 shadow-sm">
                          ✨
                        </div>
                        <p className="font-serif font-black text-base text-stone-950">
                          ยังไม่มีรายการไซส์ / ตัวเลือก
                        </p>
                        <p className="text-xs text-stone-700 font-extrabold max-w-md mx-auto leading-relaxed">
                          คลิกเลือกที่ <span className="text-amber-950 bg-amber-200 px-2 py-0.5 rounded-lg border border-amber-400 font-black">"ปุ่มกดเพิ่มเร็ว"</span> ด้านบน หรือพิมพ์ชื่อไซส์แล้วกด <span className="text-amber-950 bg-amber-200 px-2 py-0.5 rounded-lg border border-amber-400 font-black">+ เพิ่มขนาดนี้</span> เพื่อเพิ่มเฉพาะขนาดที่ต้องการขายได้เลยครับ
                        </p>
                      </div>
                    ) : (
                      variants.map((v, idx) => {
                        const effectiveCost = v.costPrice ?? (v.price ? Math.round(v.price * 0.5) : 0);
                        const profitPerUnit = v.price > 0 ? (v.price - effectiveCost) : 0;

                        return (
                        <div
                          key={idx}
                          className="p-4 sm:p-5 rounded-2xl border-2 border-stone-300 hover:border-amber-400 shadow-sm space-y-3.5 transition-all bg-stone-50/60 hover:bg-white"
                        >
                          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 border-b-2 border-amber-400/30 pb-3">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-stone-950 font-black text-xs font-serif shadow-xs shrink-0">
                                รายการที่ {idx + 1}
                              </span>
                              <span className="text-xs sm:text-sm font-black text-stone-950 font-serif truncate max-w-[200px] sm:max-w-xs" title={v.name || 'ไซส์/รายการใหม่'}>
                                {v.name || 'ไซส์/รายการใหม่'}
                              </span>
                              {v.color && (
                                <span className="px-2 py-0.5 rounded-lg bg-white text-stone-800 text-[11px] font-black border border-stone-300 shrink-0">
                                  สี: {v.color}
                                </span>
                              )}
                              {v.price > 0 && (
                                <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-950 border border-emerald-300 text-[11px] font-black shrink-0">
                                  กำไร +฿{profitPerUnit.toLocaleString()}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-auto">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSaveProductAndOpenStockIn(idx);
                                }}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm border border-emerald-700 transition cursor-pointer"
                                title="บันทึกสินค้า และเปิดหน้าบันทึกรับสินค้าเข้าสต๊อก (Stock IN) สำหรับรายการนี้ทันที"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                                <span className="whitespace-nowrap">+ บันทึกรับสินค้าเข้า (Stock IN)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveVariantField(idx)}
                                className="px-2.5 py-1.5 text-red-950 hover:bg-red-200 bg-red-100 border border-red-300 rounded-xl text-xs font-black transition flex items-center gap-1 shadow-xs cursor-pointer"
                                title="ลบรายการนี้"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-700 shrink-0" />
                                <span className="whitespace-nowrap">ลบรายการนี้</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-start">
                            
                            {/* Color / Scent Combobox Field */}
                            <div className="col-span-1 sm:col-span-1 lg:col-span-3 space-y-1 relative" data-color-dropdown>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="text-xs text-stone-950 font-black block truncate">
                                  {category === 'perfume' ? 'ตัวเลือกกลิ่น / สี' : 'สีสินค้า (Color)'}
                                </label>
                                <VoiceInputButton
                                  iconOnly={true}
                                  onTranscript={(text) => {
                                    const updated = [...variants];
                                    updated[idx].color = text;
                                    setVariants(updated);
                                    setOpenColorDropdownIdx(idx);
                                  }}
                                  currentValue={v.color || ''}
                                  title="พูดระบุสีสินค้า"
                                />
                              </div>

                            <div className="relative">
                              <input
                                type="text"
                                placeholder={
                                  category === 'perfume'
                                    ? 'คลิกเลือกกลิ่น หรือพิมพ์กลิ่นใหม่...'
                                    : 'คลิกเลือกสี หรือพิมพ์สีใหม่...'
                                }
                                value={v.color || ''}
                                onFocus={() => setOpenColorDropdownIdx(idx)}
                                onClick={() => setOpenColorDropdownIdx(idx)}
                                onChange={(e) => {
                                  const updated = [...variants];
                                  updated[idx].color = e.target.value;
                                  setVariants(updated);
                                  setOpenColorDropdownIdx(idx);
                                }}
                                className="w-full bg-white border-2 border-stone-400 rounded-xl p-2 pr-14 text-stone-950 font-black text-xs sm:text-sm focus:outline-none focus:border-amber-500 shadow-inner"
                              />
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                                {v.color && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const updated = [...variants];
                                      updated[idx].color = '';
                                      setVariants(updated);
                                      setOpenColorDropdownIdx(idx);
                                    }}
                                    className="p-1 text-stone-400 hover:text-red-600 rounded-full hover:bg-stone-100 transition cursor-pointer"
                                    title="เคลียร์ช่องสีให้ว่าง"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setOpenColorDropdownIdx(openColorDropdownIdx === idx ? null : idx)}
                                  className="p-1 text-stone-600 hover:text-stone-950 transition cursor-pointer"
                                  title="เปิด/ปิดรายการสี/กลิ่น"
                                >
                                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openColorDropdownIdx === idx ? 'rotate-180' : ''}`} />
                                </button>
                              </div>
                            </div>

                            {/* Floating Dropdown for this variant's color */}
                            {openColorDropdownIdx === idx && (
                              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border-2 border-amber-400 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                                {/* Dropdown Header */}
                                <div className="p-2 bg-amber-100/90 border-b border-amber-300 flex items-center justify-between text-[11px] font-black text-amber-950">
                                  <span>
                                    🎨 ตัวเลือกหมวด {category === 'perfume' ? 'น้ำหอม' : category === 'incense' ? 'เครื่องหอม' : category === 'kaftan' ? 'คัฟทาน' : category === 'combo' ? 'เซ็ต' : category === 'other' ? 'ทั่วไป' : 'อาบายะห์'}
                                  </span>
                                  <span className="text-[10px] text-stone-500 font-normal">✏️ แก้ไข | 🗑️ ลบ</span>
                                </div>

                                {/* Quick Option to Clear / Leave Blank */}
                                {v.color && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...variants];
                                      updated[idx].color = '';
                                      setVariants(updated);
                                      setOpenColorDropdownIdx(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs text-stone-600 hover:bg-red-50 hover:text-red-700 font-bold border-b border-stone-200 flex items-center gap-1.5 cursor-pointer transition"
                                  >
                                    <span>⚪ ไม่ระบุสี / เคลียร์ช่องให้ว่าง</span>
                                  </button>
                                )}

                                {/* Option to Add new typed color if not present */}
                                {v.color && v.color.trim() && !currentCategoryColorOptions.includes(v.color.trim()) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleAddNewColorOption(v.color!.trim());
                                      setOpenColorDropdownIdx(null);
                                    }}
                                    className="w-full text-left px-3 py-2 bg-amber-50 hover:bg-amber-100 border-b border-amber-300 text-xs font-black text-amber-950 flex items-center justify-between transition cursor-pointer"
                                  >
                                    <span className="truncate">➕ เพิ่ม <strong className="text-amber-900 underline">"{v.color.trim()}"</strong> เข้าหมวดนี้</span>
                                    <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-full border border-amber-400 font-bold shrink-0 ml-1">กดเพิ่ม</span>
                                  </button>
                                )}

                                {/* Options List */}
                                <div className="divide-y divide-stone-100">
                                  {currentCategoryColorOptions
                                    .filter((opt) => !v.color || !v.color.trim() || opt.toLowerCase().includes(v.color.trim().toLowerCase()))
                                    .map((opt, colorIdx) => {
                                      const isEditing = editingColorIdx === colorIdx;

                                      if (isEditing) {
                                        return (
                                          <div key={colorIdx} className="p-1.5 bg-amber-50/90 flex items-center gap-1 border-b border-amber-300">
                                            <input
                                              type="text"
                                              value={editingColorText}
                                              onChange={(e) => setEditingColorText(e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  e.preventDefault();
                                                  handleSaveEditColorOption(colorIdx, opt);
                                                } else if (e.key === 'Escape') {
                                                  setEditingColorIdx(null);
                                                }
                                              }}
                                              autoFocus
                                              className="flex-1 bg-white border-2 border-amber-500 rounded-lg px-2 py-1 text-xs font-black text-stone-950 focus:outline-none shadow-inner"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleSaveEditColorOption(colorIdx, opt)}
                                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black transition cursor-pointer"
                                            >
                                              บันทึก
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setEditingColorIdx(null)}
                                              className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-black transition cursor-pointer"
                                            >
                                              ยกเลิก
                                            </button>
                                          </div>
                                        );
                                      }

                                      return (
                                        <div
                                          key={opt}
                                          className={`px-3 py-1.5 text-xs font-black transition flex items-center justify-between group ${
                                            v.color === opt ? 'bg-amber-100 text-amber-950' : 'text-stone-900 hover:bg-stone-50'
                                          }`}
                                        >
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updated = [...variants];
                                              updated[idx].color = opt;
                                              setVariants(updated);
                                              setOpenColorDropdownIdx(null);
                                            }}
                                            className="flex-1 text-left flex items-center justify-between pr-2 cursor-pointer truncate"
                                          >
                                            <span className="truncate">{opt}</span>
                                            {v.color === opt && (
                                              <span className="text-amber-800 text-[10px] font-black shrink-0 ml-1">✓ เลือก</span>
                                            )}
                                          </button>

                                          <div className="flex items-center gap-1 shrink-0">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingColorIdx(colorIdx);
                                                setEditingColorText(opt);
                                              }}
                                              className="p-1 hover:bg-amber-200 text-stone-400 hover:text-amber-950 rounded transition cursor-pointer"
                                              title={`แก้ไขชื่อ "${opt}"`}
                                            >
                                              <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteColorOption(opt);
                                              }}
                                              className="p-1 hover:bg-red-100 text-stone-400 hover:text-red-700 rounded transition cursor-pointer"
                                              title={`ลบ "${opt}" ออกจากรายการ`}
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>

                                {/* Footer Reset Button */}
                                <div className="p-2 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-[11px]">
                                  <span className="text-stone-500 font-bold">
                                    ผูกเฉพาะหมวด{category === 'perfume' ? 'น้ำหอม' : category === 'incense' ? 'เครื่องหอม' : category === 'kaftan' ? 'คัฟทาน' : category === 'combo' ? 'เซ็ต' : category === 'other' ? 'ทั่วไป' : 'อาบายะห์'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={handleResetColorDefaults}
                                    className="text-stone-600 hover:text-amber-800 font-bold underline cursor-pointer"
                                    title="คืนค่าตัวเลือกสีเริ่มต้นเฉพาะหมวดนี้"
                                  >
                                    ↺ รีเซ็ตหมวดนี้
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Size / Volume Name Field */}
                          <div className="col-span-1 sm:col-span-1 lg:col-span-3 space-y-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-xs text-stone-950 font-black block truncate">
                                {category === 'perfume' ? 'ขนาดปริมาณ (ml / ขวด)' : 'ชื่อไซส์ / ความยาว'}
                              </label>
                              <VoiceInputButton
                                iconOnly={true}
                                onTranscript={(text) => {
                                  const updated = [...variants];
                                  updated[idx].name = text;
                                  setVariants(updated);
                                }}
                                currentValue={v.name}
                                title="พูดระบุชื่อไซส์หรือความยาว"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder={category === 'perfume' ? 'เช่น ขวดสเปรย์ 50 ml' : 'เช่น Size 56 (ส่วนสูง ~160-165 ซม. / ยาว 56")'}
                              value={v.name}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].name = e.target.value;
                                setVariants(updated);
                              }}
                              className="w-full bg-white border-2 border-stone-400 focus:border-amber-500 rounded-xl p-2.5 text-stone-950 font-black text-xs sm:text-sm focus:outline-none shadow-sm placeholder-stone-400"
                            />
                            {category === 'perfume' && (
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const updated = [...variants];
                                    updated[idx].name = e.target.value;
                                    setVariants(updated);
                                  }
                                }}
                                className="w-full bg-white border border-stone-300 rounded-xl px-2 py-1 text-xs text-stone-950 font-black hover:border-amber-500 transition cursor-pointer"
                              >
                                <option value="" className="bg-white text-stone-950 font-bold">-- เลือกขนาดด่วน --</option>
                                <option value="ขวดสเปรย์ 50 ml (EDP Spray)" className="bg-white text-stone-950 font-bold py-1">ขวดสเปรย์ 50 ml</option>
                                <option value="ขวดสเปรย์ 100 ml (EDP Premium Spray)" className="bg-white text-stone-950 font-bold py-1">ขวดสเปรย์ 100 ml</option>
                                <option value="Attar Oil 12 ml (Pure Oil)" className="bg-white text-stone-950 font-bold py-1">Attar Oil 12 ml</option>
                                <option value="ขวดเทสเตอร์ 3 ml (Sample Tester)" className="bg-white text-stone-950 font-bold py-1">ขวดเทสเตอร์ 3 ml</option>
                              </select>
                            )}
                          </div>

                          {/* Price Field */}
                          <div className="col-span-1 sm:col-span-1 lg:col-span-2 space-y-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-xs text-stone-950 font-black flex items-center gap-1 truncate" title="ราคาขาย (บาท)">
                                <span>ราคาขาย</span>
                                <span className="text-[10px] text-stone-600 font-bold">(฿)</span>
                              </label>
                              <VoiceInputButton
                                iconOnly={true}
                                isNumber={true}
                                onNumberTranscript={(num) => {
                                  const updated = [...variants];
                                  updated[idx].price = num;
                                  if (updated[idx].costPrice === undefined || updated[idx].costPrice === 0) {
                                    updated[idx].costPrice = Math.round(num * 0.5);
                                  }
                                  setVariants(updated);
                                }}
                                onTranscript={() => {}}
                                title="พูดราคาขาย เช่น 1290"
                              />
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="0"
                                value={v.price === 0 ? '' : v.price}
                                onFocus={(e) => e.target.select()}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                                onChange={(e) => {
                                  const rawVal = e.target.value.replace(/[^0-9]/g, '');
                                  const cleanVal = rawVal.replace(/^0+(?=\d)/, '');
                                  const newPrice = cleanVal === '' ? 0 : Math.max(0, parseInt(cleanVal, 10) || 0);
                                  const updated = [...variants];
                                  updated[idx].price = newPrice;
                                  if (updated[idx].costPrice === undefined || updated[idx].costPrice === 0) {
                                    updated[idx].costPrice = Math.round(newPrice * 0.5);
                                  }
                                  setVariants(updated);
                                }}
                                className="w-full bg-white border-2 border-stone-400 focus:border-amber-500 rounded-xl p-2.5 pr-7 text-stone-950 font-black font-mono text-xs sm:text-sm text-right shadow-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-600 font-black pointer-events-none">฿</span>
                            </div>
                          </div>

                          {/* Cost Price Field */}
                          <div className="col-span-1 sm:col-span-1 lg:col-span-2 space-y-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-xs text-amber-950 font-black flex items-center gap-1 truncate" title="ต้นทุนสินค้า (บาท)">
                                <span>ต้นทุน</span>
                                <span className="text-[10px] text-amber-800 font-bold">(฿)</span>
                              </label>
                              <VoiceInputButton
                                iconOnly={true}
                                isNumber={true}
                                onNumberTranscript={(num) => {
                                  const updated = [...variants];
                                  updated[idx].costPrice = num;
                                  setVariants(updated);
                                }}
                                onTranscript={() => {}}
                                title="พูดต้นทุน เช่น 900"
                              />
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="0"
                                value={v.costPrice === 0 ? '' : (v.costPrice ?? (v.price ? Math.round(v.price * 0.5) : 0))}
                                onFocus={(e) => e.target.select()}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                                onChange={(e) => {
                                  const rawVal = e.target.value.replace(/[^0-9]/g, '');
                                  const cleanVal = rawVal.replace(/^0+(?=\d)/, '');
                                  const newCost = cleanVal === '' ? 0 : Math.max(0, parseInt(cleanVal, 10) || 0);
                                  const updated = [...variants];
                                  updated[idx].costPrice = newCost;
                                  setVariants(updated);
                                }}
                                className="w-full bg-amber-50/70 border-2 border-amber-400 focus:border-amber-600 rounded-xl p-2.5 pr-7 text-amber-950 font-black font-mono text-xs sm:text-sm text-right shadow-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-amber-800 font-black pointer-events-none">฿</span>
                            </div>
                          </div>

                          {/* Stock Quantity Field with Admin PIN Lock */}
                          <div className="col-span-1 sm:col-span-1 lg:col-span-2 space-y-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-xs text-stone-950 font-black flex items-center gap-1 truncate" title="สต๊อกสินค้า (ชิ้น) - ต้องใส่รหัสผ่านเพื่อแก้ไข">
                                <span>สต๊อก</span>
                                <span className="text-[10px] text-stone-600 font-bold">(ชิ้น)</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isStockEditUnlocked) {
                                    handleRequestStockUnlock();
                                  } else {
                                    setIsStockEditUnlocked(false);
                                  }
                                }}
                                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1 transition cursor-pointer border ${
                                  isStockEditUnlocked
                                    ? 'bg-emerald-100 text-emerald-950 border-emerald-400 hover:bg-emerald-200'
                                    : 'bg-amber-100 text-amber-950 border-amber-400 hover:bg-amber-200'
                                }`}
                                title={isStockEditUnlocked ? 'คลิกเพื่อล็อกสต๊อก' : 'คลิกเพื่อใส่รหัส Admin ปลดล็อกแก้ไขสต๊อก'}
                              >
                                {isStockEditUnlocked ? (
                                  <>
                                    <Unlock className="w-2.5 h-2.5 text-emerald-700" />
                                    <span>ปลดล็อก</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-2.5 h-2.5 text-amber-800" />
                                    <span>ล็อก</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="relative flex items-center">
                              {isStockEditUnlocked ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...variants];
                                      const cur = updated[idx].stockQuantity ?? 0;
                                      updated[idx].stockQuantity = Math.max(0, cur - 1);
                                      setVariants(updated);
                                    }}
                                    className="w-7 h-10 bg-stone-100 hover:bg-stone-200 active:bg-amber-300 border-2 border-r-0 border-stone-400 rounded-l-xl flex items-center justify-center font-black text-stone-800 text-sm cursor-pointer select-none"
                                    title="ลดสต๊อก -1"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={v.stockQuantity ?? 0}
                                    onFocus={(e) => e.target.select()}
                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                    onChange={(e) => {
                                      const rawVal = e.target.value.replace(/[^0-9]/g, '');
                                      const cleanVal = rawVal.replace(/^0+(?=\d)/, '');
                                      const newQty = cleanVal === '' ? 0 : Math.max(0, parseInt(cleanVal, 10) || 0);
                                      const updated = [...variants];
                                      updated[idx].stockQuantity = newQty;
                                      setVariants(updated);
                                    }}
                                    className="w-full bg-white border-y-2 border-stone-400 focus:border-amber-500 h-10 text-stone-950 font-black font-mono text-xs sm:text-sm text-center shadow-inner focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...variants];
                                      const cur = updated[idx].stockQuantity ?? 0;
                                      updated[idx].stockQuantity = cur + 1;
                                      setVariants(updated);
                                    }}
                                    className="w-7 h-10 bg-stone-100 hover:bg-stone-200 active:bg-amber-300 border-2 border-l-0 border-stone-400 rounded-r-xl flex items-center justify-center font-black text-stone-800 text-sm cursor-pointer select-none"
                                    title="เพิ่มสต๊อก +1"
                                  >
                                    +
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleRequestStockUnlock()}
                                  className="w-full h-10 bg-stone-100/90 hover:bg-amber-100/90 border-2 border-stone-400 hover:border-amber-500 rounded-xl px-2 text-center text-stone-950 font-mono font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer group"
                                  title="คลิกเพื่อใส่รหัสผ่านและปรับยอดสต๊อก"
                                >
                                  <Lock className="w-3.5 h-3.5 text-amber-700 group-hover:scale-110 transition shrink-0" />
                                  <span>{v.stockQuantity ?? 0}</span>
                                  <span className="text-[10px] text-stone-600 font-bold">ชิ้น</span>
                                  <span className="text-[9px] text-amber-950 bg-amber-300/80 border border-amber-400 px-1 py-0.2 rounded font-black ml-0.5">แก้</span>
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })
                  )}
                  </div>
                </div>
              </div>

              {/* Sticky Bottom Footer */}
              <div className="sticky bottom-0 z-30 bg-white -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 border-t-2 border-amber-400/40 flex items-center justify-between gap-3 shrink-0 shadow-2xl mt-4">
                <span className="text-xs text-amber-950 font-black hidden sm:block">
                  ตรวจสอบความถูกต้อง แล้วกดปุ่มบันทึกสินค้า
                </span>
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-950 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs sm:text-sm shadow-sm transition cursor-pointer border border-amber-500"
                    title="บันทึกข้อมูลสินค้าอย่างเดียว"
                  >
                    บันทึกข้อมูลสินค้า
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveProductAndOpenStockIn()}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer font-sans w-full sm:w-auto border border-emerald-700"
                    title="บันทึกสินค้า และเปิดหน้าบันทึกรับสินค้าเข้าสต๊อก (Stock IN) ที่หน้าสินค้าเข้า-ออก & เคลียร์ Supplier ทันที"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                    <span>+ บันทึกรับสินค้าเข้า (Stock IN)</span>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Admin Passcode Modal for Stock Adjustment */}
      {stockPinModalOpen && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="relative bg-[#14120f] border-2 border-amber-400/80 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl text-white p-6 my-8 space-y-5 animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white tracking-wide">
                    ยืนยันรหัสผ่านปรับสต๊อก (Admin PIN)
                  </h3>
                  <p className="text-[10px] text-amber-200/80">
                    ต้องใส่รหัสผู้ดูแลร้านเพื่อปลดล็อกแก้ไขสต๊อกสินค้า
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStockPinModalOpen(false);
                  setStockPinInput('');
                  setStockPinError('');
                  setPendingStockAction(null);
                }}
                className="text-amber-400 hover:text-white p-2 rounded-full border border-amber-400/30 transition cursor-pointer"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmStockPin();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-300 font-serif font-bold flex items-center gap-1">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>รหัสผ่าน Admin</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowStockPin(!showStockPin)}
                    className="text-[11px] text-amber-400/80 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    {showStockPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showStockPin ? 'ซ่อนรหัส' : 'แสดงรหัส'}</span>
                  </button>
                </div>
                <input
                  type={showStockPin ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="••••"
                  value={stockPinInput}
                  onChange={(e) => {
                    setStockPinInput(e.target.value);
                    setStockPinError('');
                  }}
                  className="w-full bg-[#0a0907] border-2 border-amber-400/50 rounded-xl p-3 text-center text-amber-300 font-mono font-black text-2xl tracking-[0.3em] focus:border-amber-400 focus:outline-none shadow-inner"
                />
              </div>

              {/* Quick Keypad */}
              <div className="space-y-1.5 pt-1">
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => {
                        setStockPinInput((prev) => prev + digit);
                        setStockPinError('');
                      }}
                      className="py-3 bg-stone-900/90 hover:bg-stone-800 active:bg-amber-400 active:text-stone-950 border border-amber-400/30 rounded-xl text-xl font-mono font-black text-amber-200 transition shadow-sm cursor-pointer select-none"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setStockPinInput('')}
                    className="py-3 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl text-xs font-bold text-red-300 transition cursor-pointer select-none"
                  >
                    ล้าง (C)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStockPinInput((prev) => prev + '0');
                      setStockPinError('');
                    }}
                    className="py-3 bg-stone-900/90 hover:bg-stone-800 active:bg-amber-400 active:text-stone-950 border border-amber-400/30 rounded-xl text-xl font-mono font-black text-amber-200 transition shadow-sm cursor-pointer select-none"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockPinInput((prev) => prev.slice(0, -1))}
                    className="py-3 bg-stone-900/90 hover:bg-stone-800 border border-amber-400/30 rounded-xl text-sm font-bold text-amber-300 transition flex items-center justify-center cursor-pointer select-none"
                    title="ลบตัวเลขตัวล่าสุด"
                  >
                    ⌫
                  </button>
                </div>
              </div>

              {stockPinError && (
                <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 flex items-center gap-2 text-xs font-bold animate-bounce">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{stockPinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-stone-950 font-black text-sm tracking-wider rounded-xl shadow-lg hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-5 h-5 text-stone-950" />
                <span>ยืนยันปลดล็อกปรับยอดสต๊อก</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stock Adjust Modal for Catalog Cards */}
      {quickStockAdjustItem && (
        <div className="fixed inset-0 z-[75] overflow-y-auto bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="relative bg-white border-2 border-amber-400 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl text-stone-950 p-6 my-8 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center text-amber-900">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-sm text-stone-950">
                    ปรับยอดสต๊อกโดยตรง
                  </h3>
                  <p className="text-[11px] text-stone-600 truncate max-w-[200px]" title={quickStockAdjustItem.productTitle}>
                    {quickStockAdjustItem.productTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickStockAdjustItem(null)}
                className="text-stone-400 hover:text-stone-900 p-1.5 rounded-full hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 space-y-1.5">
              <div className="text-xs font-black text-amber-950 flex items-center justify-between">
                <span>ไซส์ / รายการ:</span>
                <span className="font-extrabold text-stone-900">{quickStockAdjustItem.variantName}</span>
              </div>
              {quickStockAdjustItem.color && (
                <div className="text-xs font-bold text-stone-700 flex items-center justify-between">
                  <span>สี:</span>
                  <span>{quickStockAdjustItem.color}</span>
                </div>
              )}
              <div className="text-xs font-bold text-stone-700 flex items-center justify-between pt-1 border-t border-amber-200/60">
                <span>สต๊อกปัจจุบัน:</span>
                <span className="font-black text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-lg border border-amber-300">
                  {quickStockAdjustItem.currentStock} ชิ้น
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-950 block">
                จำนวนสต๊อกใหม่ที่ต้องการตั้งค่า (ชิ้น):
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setNewStockInput(Math.max(0, newStockInput - 1))}
                  className="w-10 h-11 bg-stone-100 hover:bg-stone-200 active:bg-amber-300 border-2 border-r-0 border-stone-400 rounded-l-xl flex items-center justify-center font-black text-lg text-stone-800 cursor-pointer select-none"
                  title="ลดสต๊อก -1"
                >
                  -
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newStockInput}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const rawVal = e.target.value.replace(/[^0-9]/g, '');
                    const cleanVal = rawVal.replace(/^0+(?=\d)/, '');
                    setNewStockInput(cleanVal === '' ? 0 : Math.max(0, parseInt(cleanVal, 10) || 0));
                  }}
                  className="w-full bg-white border-y-2 border-stone-400 focus:border-amber-500 h-11 text-stone-950 font-black font-mono text-xl text-center shadow-inner focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setNewStockInput(newStockInput + 1)}
                  className="w-10 h-11 bg-stone-100 hover:bg-stone-200 active:bg-amber-300 border-2 border-l-0 border-stone-400 rounded-r-xl flex items-center justify-center font-black text-lg text-stone-800 cursor-pointer select-none"
                  title="เพิ่มสต๊อก +1"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuickStockAdjustItem(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  updateVariantStock(quickStockAdjustItem.productId, quickStockAdjustItem.variantId, newStockInput);
                  setStockSuccessToast({
                    message: `อัปเดตสต๊อก ${quickStockAdjustItem.variantName} เป็น ${newStockInput} ชิ้น เรียบร้อยแล้ว!`,
                    submessage: quickStockAdjustItem.productTitle,
                  });
                  setHighlightedVariantId(quickStockAdjustItem.variantId);
                  setTimeout(() => setHighlightedVariantId(null), 4000);
                  setTimeout(() => setStockSuccessToast(null), 4500);
                  setQuickStockAdjustItem(null);
                }}
                className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs transition shadow-md border border-amber-500 cursor-pointer"
              >
                บันทึกสต๊อกใหม่
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Direct Stock IN Modal for Catalog Cards */}
      {quickStockInItem && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-white border-2 border-emerald-500 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-stone-950 p-6 my-8 space-y-4 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-400 flex items-center justify-center text-emerald-900 shadow-xs">
                  <PackagePlus className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base text-stone-950 flex items-center gap-1.5">
                    <span>บันทึกรับเข้าสต๊อกทันที (Stock IN)</span>
                  </h3>
                  <p className="text-xs text-stone-600 font-bold truncate max-w-[240px]" title={quickStockInItem.productTitle}>
                    {quickStockInItem.productTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickStockInItem(null)}
                className="text-stone-400 hover:text-stone-900 p-1.5 rounded-full hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Item Details Box */}
            <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-300 space-y-2">
              <div className="text-xs font-black text-stone-900 flex items-center justify-between">
                <span>ไซส์ / รายการ:</span>
                <span className="font-extrabold text-emerald-950 text-sm bg-white px-2.5 py-0.5 rounded-lg border border-emerald-300">
                  {quickStockInItem.variantName}
                </span>
              </div>
              {quickStockInItem.color && (
                <div className="text-xs font-bold text-stone-700 flex items-center justify-between">
                  <span>สี:</span>
                  <span className="font-black text-stone-900">🎨 {quickStockInItem.color}</span>
                </div>
              )}
              <div className="text-xs font-bold text-stone-700 flex items-center justify-between pt-1.5 border-t border-emerald-200">
                <span>สต๊อกปัจจุบัน:</span>
                <span className="font-black text-emerald-950 bg-emerald-200/80 px-2.5 py-0.5 rounded-lg border border-emerald-400 text-xs">
                  {quickStockInItem.currentStock} ชิ้น
                </span>
              </div>
            </div>

            <form onSubmit={handleExecuteQuickStockIn} className="space-y-3.5">
              {/* Qty Input & Preview */}
              <div>
                <label className="text-xs font-black text-stone-950 flex items-center justify-between mb-1">
                  <span>จำนวนที่รับเข้าเพิ่ม *</span>
                  {parseInt(quickStockInQty, 10) > 0 && (
                    <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                      ➔ สต๊อกใหม่: {quickStockInItem.currentStock + (parseInt(quickStockInQty, 10) || 0)} ชิ้น
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 font-black text-lg select-none">+</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoFocus
                    required
                    value={quickStockInQty}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, '');
                      setQuickStockInQty(clean);
                    }}
                    placeholder="เช่น 10"
                    className="w-full pl-8 pr-14 py-2.5 bg-white border-2 border-emerald-500 focus:ring-4 focus:ring-emerald-200 rounded-xl text-stone-950 font-black text-lg focus:outline-none transition shadow-xs"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-stone-500 select-none">ชิ้น</span>
                </div>
                {/* Quick Add Qty Chips */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {[1, 5, 10, 20, 50, 100].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setQuickStockInQty(chip.toString())}
                      className="px-2 py-1 text-[11px] font-black bg-stone-100 hover:bg-emerald-100 hover:text-emerald-950 text-stone-700 rounded-lg border border-stone-300 cursor-pointer transition"
                    >
                      +{chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Price Input */}
              <div>
                <label className="text-xs font-black text-stone-950 block mb-1">
                  ราคาทุนต่อชิ้น (บาท)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600 font-bold text-sm select-none">฿</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={quickStockInCost}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9.]/g, '');
                      setQuickStockInCost(clean);
                    }}
                    placeholder="เช่น 450"
                    className="w-full pl-8 pr-3 py-2 bg-white border-2 border-stone-300 focus:border-amber-500 rounded-xl text-stone-950 font-black text-sm focus:outline-none transition shadow-xs"
                  />
                </div>
                {parseInt(quickStockInQty, 10) > 0 && parseFloat(quickStockInCost) > 0 && (
                  <p className="text-[11px] text-stone-600 font-bold mt-1">
                    รวมต้นทุนรอบนี้: ฿{((parseInt(quickStockInQty, 10) || 0) * (parseFloat(quickStockInCost) || 0)).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Supplier Selection */}
              <div>
                <label className="text-xs font-black text-stone-950 block mb-1">
                  Supplier / แหล่งนำเข้า
                </label>
                <input
                  type="text"
                  value={quickStockInSupplier}
                  onChange={(e) => setQuickStockInSupplier(e.target.value)}
                  placeholder="เช่น โรงงานอาบายะห์ดูไบ"
                  className="w-full px-3 py-2 bg-white border-2 border-stone-300 focus:border-amber-500 rounded-xl text-stone-950 font-bold text-xs focus:outline-none transition shadow-xs"
                />
              </div>

              {/* Note / DO Number */}
              <div>
                <label className="text-xs font-black text-stone-950 block mb-1">
                  หมายเหตุ / ล็อต / เลขที่ DO
                </label>
                <input
                  type="text"
                  value={quickStockInNote}
                  onChange={(e) => setQuickStockInNote(e.target.value)}
                  placeholder="เช่น ล็อตสั่งตัดพิเศษ UAE, 00001/69"
                  className="w-full px-3 py-2 bg-white border-2 border-stone-300 focus:border-amber-500 rounded-xl text-stone-950 font-bold text-xs focus:outline-none transition shadow-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickStockInItem(null)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!quickStockInQty || parseInt(quickStockInQty, 10) <= 0}
                  className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-xl text-xs transition shadow-md border border-emerald-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>บันทึกรับเข้าทันที (+{parseInt(quickStockInQty, 10) || 0} ชิ้น)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Stock Success Notification Toast */}
      {stockSuccessToast && (
        <div className="fixed top-5 right-5 z-[100] max-w-sm bg-stone-950 text-white border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-slide-in">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm text-emerald-400">{stockSuccessToast.message}</p>
            {stockSuccessToast.submessage && (
              <p className="text-xs text-stone-300 font-bold truncate mt-0.5">{stockSuccessToast.submessage}</p>
            )}
          </div>
          <button
            onClick={() => setStockSuccessToast(null)}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 cursor-pointer transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <datalist id="product-color-preset-list">
        {currentCategoryColorOptions.map((colorName) => (
          <option key={colorName} value={colorName} />
        ))}
      </datalist>
      <datalist id="fabric-preset-datalist">
        {currentCategoryFabricOptions.map((fab) => (
          <option key={fab} value={fab} />
        ))}
      </datalist>
    </div>
  );
};
