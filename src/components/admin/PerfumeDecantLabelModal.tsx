'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  Copy,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Check,
  CheckCircle2,
  RefreshCw,
  Search,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
  Tag,
  Flame,
  Droplets,
  Package,
  Edit2,
  Save,
  Bookmark,
  Mic,
  MicOff,
  QrCode,
  Camera
} from 'lucide-react';
import QRCode from 'qrcode';
import { Product, CartItem } from '../../types';
import { useShop } from '../../context/ShopContext';
import { QRScannerModal } from '../common/QRScannerModal';
import { resolveScannedProduct } from '../../utils/qrUtils';
import { soundFx } from '../../lib/soundEffects';

export interface PerfumeLabelItem {
  id: string;
  name: string;
  volume: string; // e.g. "10 ml", "5 ml"
  fragranceType: string; // e.g. "EAU DE PARFUM", "CONCENTRATED OIL"
  lotNumber: string; // e.g. "1-69"
  price?: number;
  copies: number;
}

interface PerfumeDecantLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItems?: Array<{
    name: string;
    volume?: string;
    fragranceType?: string;
    lotNumber?: string;
    price?: number;
    copies?: number;
  }>;
  cartItems?: CartItem[];
  product?: Product | null;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Standard label size presets for Niimbot & Thermal roll printers
 */
export interface SizePreset {
  id: string;
  name: string;
  desc: string;
  widthMm: number;
  heightMm: number;
  isCustom?: boolean;
}

const DEFAULT_SIZE_PRESETS: SizePreset[] = [];

export const PerfumeDecantLabelModal: React.FC<PerfumeDecantLabelModalProps> = ({
  isOpen,
  onClose,
  initialItems,
  cartItems,
  product,
}) => {
  const { products, storeSettings } = useShop();

  // Available perfumes in catalog
  const perfumeProducts = React.useMemo(() => {
    return products.filter(
      (p) =>
        p.category === 'perfume' ||
        p.title.toLowerCase().includes('perfume') ||
        p.title.includes('น้ำหอม') ||
        p.fabric?.toLowerCase().includes('oud') ||
        p.fabric?.toLowerCase().includes('attar')
    );
  }, [products]);

  // Custom Saved Presets State (persistent across sessions via localStorage)
  const [customPresets, setCustomPresets] = useState<SizePreset[]>([]);
  const [selectedSizeId, setSelectedSizeId] = useState<string>('custom');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');

  // Custom Dimension Inputs (handled as clean text without sticky clamping)
  const [customWidthInput, setCustomWidthInput] = useState<string>('40');
  const [customHeightInput, setCustomHeightInput] = useState<string>('14');
  const [customNameInput, setCustomNameInput] = useState<string>('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [isCustomFormOpen, setIsCustomFormOpen] = useState<boolean>(false);

  // Label content options with user-requested toggles
  const [brandTitle, setBrandTitle] = useState<string>('HUDA ABAYA DUBAI');
  const [includeBrandTitle, setIncludeBrandTitle] = useState<boolean>(true); // ติ๊กให้แสดง/ซ่อนชื่อหัวป้าย
  const [includeCodePrefix, setIncludeCodePrefix] = useState<boolean>(false); // ติ๊กให้แสดง/ซ่อนรหัส B001 ด้านหน้า
  const [includeVolume, setIncludeVolume] = useState<boolean>(true); // ติ๊กให้แสดง/ซ่อน 10 ml
  const [includeFragranceType, setIncludeFragranceType] = useState<boolean>(true); // ติ๊กให้แสดง/ซ่อน EAU DE PARFUM
  const [includeMiniQr, setIncludeMiniQr] = useState<boolean>(false);
  const [includePrice, setIncludePrice] = useState<boolean>(false);
  const [includeLot, setIncludeLot] = useState<boolean>(true);
  const [defaultLot, setDefaultLot] = useState<string>('1-69');

  // Items to print (starts EMPTY so user selects each one by one)
  const [items, setItems] = useState<PerfumeLabelItem[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [scentSearchQuery, setScentSearchQuery] = useState<string>('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [scanToast, setScanToast] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered perfumes for search
  const filteredPerfumes = React.useMemo(() => {
    const q = scentSearchQuery.trim().toLowerCase();
    if (!q) return perfumeProducts;
    return perfumeProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.variants.some((v) => v.sku?.toLowerCase().includes(q)) ||
        (p.fabric && p.fabric.toLowerCase().includes(q))
    );
  }, [perfumeProducts, scentSearchQuery]);

  // Voice speech-to-text handler (Web Speech API)
  const handleToggleListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert(
        'เบราว์เซอร์นี้ยังไม่รองรับระบบสั่งงานด้วยเสียง แนะนำให้เปิดใช้งานผ่าน Google Chrome หรือ Microsoft Edge ครับ'
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'th-TH';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setIsSearchDropdownOpen(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setScentSearchQuery(transcript);
          setIsSearchDropdownOpen(true);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition', err);
      setIsListening(false);
    }
  };

  // Add perfume from search result
  const handleSelectPerfumeFromSearch = (product: Product) => {
    const defaultVol = product.variants.some((v) => v.name.includes('10'))
      ? '10 ml'
      : product.variants.some((v) => v.name.includes('5'))
      ? '5 ml'
      : '10 ml';

    const defaultType =
      product.fabric?.toUpperCase().includes('OIL') ||
      product.title.toUpperCase().includes('OIL') ||
      product.title.includes('ออยล์')
        ? 'PERFUME OIL'
        : 'EAU DE PARFUM';

    const cleanTitle = cleanScentTitle(product.title);

    const newItem: PerfumeLabelItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanTitle,
      volume: defaultVol,
      fragranceType: defaultType,
      lotNumber: defaultLot,
      price: product.variants[0]?.price,
      copies: 1, // ALWAYS START AT 1!
    };

    setItems((prev) => [...prev, newItem]);
    setPreviewIndex(items.length);
    setScentSearchQuery('');
    setIsSearchDropdownOpen(false);
    try {
      soundFx.playSuccess();
    } catch (e) {}
  };

  // Add custom scent from search query
  const handleAddCustomFromSearch = () => {
    if (!scentSearchQuery.trim()) return;
    const newItem: PerfumeLabelItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: scentSearchQuery.trim(),
      volume: '10 ml',
      fragranceType: 'EAU DE PARFUM',
      lotNumber: defaultLot,
      copies: 1,
    };
    setItems((prev) => [...prev, newItem]);
    setPreviewIndex(items.length);
    setScentSearchQuery('');
    setIsSearchDropdownOpen(false);
    try {
      soundFx.playSuccess();
    } catch (e) {}
  };

  // QR / Barcode Scanner result handler
  const handleScanProduct = (decodedText: string) => {
    if (!decodedText) return;

    // 1. Try resolving using resolveScannedProduct
    const match = resolveScannedProduct(decodedText, products);
    let matchedProduct = match?.product;
    let scentTitle = '';
    let price: number | undefined;

    if (matchedProduct) {
      scentTitle = cleanScentTitle(matchedProduct.title);
      price = match?.variant?.price || matchedProduct.variants[0]?.price;
    } else {
      // 2. Direct search in products
      const clean = decodedText.trim().toLowerCase();
      const direct = products.find(
        (p) =>
          p.id.toLowerCase() === clean ||
          p.title.toLowerCase().includes(clean) ||
          p.variants.some((v) => v.sku?.toLowerCase() === clean)
      );
      if (direct) {
        matchedProduct = direct;
        scentTitle = cleanScentTitle(direct.title);
        price = direct.variants[0]?.price;
      } else {
        scentTitle = decodedText.trim();
      }
    }

    if (scentTitle) {
      const newItem: PerfumeLabelItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: scentTitle,
        volume: '10 ml',
        fragranceType: 'EAU DE PARFUM',
        lotNumber: defaultLot,
        price,
        copies: 1, // ALWAYS START AT 1!
      };
      setItems((prev) => [...prev, newItem]);
      setPreviewIndex(items.length);
      try {
        soundFx.playSuccess();
      } catch (e) {}
      setScanToast(`✓ สแกนสำเร็จ: เพิ่มกลิ่น "${scentTitle}" แล้ว (1 ดวง)`);
      setTimeout(() => setScanToast(null), 3500);
      setIsScannerOpen(false);
      return { success: true };
    }
  };
  const [isCopiedSuccess, setIsCopiedSuccess] = useState<boolean>(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState<boolean>(false);
  const [previewQrMap, setPreviewQrMap] = useState<Record<string, string>>({});

  // Active preview item index
  const [previewIndex, setPreviewIndex] = useState<number>(0);



  // Load custom presets and last selected size from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('huda_perfume_custom_sizes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCustomPresets(parsed);
        }
      }
      const lastSelected = localStorage.getItem('huda_perfume_last_selected_size');
      if (lastSelected) {
        setSelectedSizeId(lastSelected);
      }
    } catch (e) {
      console.error('Error loading saved custom sizes', e);
    }
  }, []);

  // Helper to extract clean scent title (removing emojis or "EDP 100ml" tags)
  const cleanScentTitle = (raw: string): string => {
    return raw
      .replace(/^[\s\uFE0F\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '') // remove leading emojis
      .replace(/\s*(?:edp|edt|parfum|perfume)\s*\d*\s*ml/gi, '')
      .replace(/\s*\(\s*edp[^\)]*\)/gi, '')
      .trim();
  };

  /**
   * Helper to format scent name based on includeCodePrefix toggle
   * e.g. "B001 Emirate" -> if includeCodePrefix = false, returns "Emirate"
   */
  const getEffectiveScentName = (name: string): string => {
    if (!name) return '';
    if (includeCodePrefix) return name;
    // Strips leading model codes like "B001", "001", "HD-001", "A01" etc.
    const stripped = name.replace(/^([A-Za-z0-9_-]+)\s*[-–:]*\s*/, '').trim();
    return stripped || name;
  };

  // Populate items when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Priority 1: Direct passed initial items (if explicitly provided)
    if (initialItems && initialItems.length > 0) {
      setItems(
        initialItems.map((item, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          name: item.name || 'DUBAI SCENT',
          volume: item.volume || '10 ml',
          fragranceType: item.fragranceType || 'EAU DE PARFUM',
          lotNumber: item.lotNumber || defaultLot,
          price: item.price,
          copies: item.copies || 1, // ALWAYS START AT 1 !
        }))
      );
      setPreviewIndex(0);
      return;
    }

    // Priority 2: Single Product passed explicitly (e.g. clicked from a specific product card)
    if (product) {
      const defaultVol = product.variants.some((v) => v.name.includes('10'))
        ? '10 ml'
        : product.variants.some((v) => v.name.includes('5'))
        ? '5 ml'
        : '10 ml';

      setItems([
        {
          id: `prod-${product.id}`,
          name: cleanScentTitle(product.title),
          volume: defaultVol,
          fragranceType: product.fabric?.includes('Oil') ? 'PERFUME OIL' : 'EAU DE PARFUM',
          lotNumber: defaultLot,
          price: product.variants[0]?.price || 100,
          copies: 1, // ALWAYS START AT 1 !
        },
      ]);
      setPreviewIndex(0);
      return;
    }

    // Priority 3: Extract from POS Cart (if cart items exist with perfumes)
    if (cartItems && cartItems.length > 0) {
      const extracted: PerfumeLabelItem[] = [];

      cartItems.forEach((cartItem, idx) => {
        const isPerfume =
          cartItem.category === 'perfume' ||
          cartItem.productTitle.includes('น้ำหอม') ||
          cartItem.productTitle.toLowerCase().includes('perfume') ||
          cartItem.variantName.includes('ml');

        if (isPerfume) {
          let vol = '10 ml';
          const matchVol = cartItem.variantName.match(/(\d+)\s*ml/i);
          if (matchVol) {
            vol = `${matchVol[1]} ml`;
          }

          extracted.push({
            id: `cart-${cartItem.variantId}-${idx}`,
            name: cleanScentTitle(cartItem.productTitle),
            volume: vol,
            fragranceType: 'EAU DE PARFUM',
            lotNumber: cartItem.lotNumber || defaultLot,
            price: cartItem.price,
            copies: cartItem.quantity || 1,
          });
        }
      });

      if (extracted.length > 0) {
        setItems(extracted);
        setPreviewIndex(0);
        return;
      }
    }

    // Default fallback: DO NOT pre-populate items! User will pick scents one by one!
    setItems([]);
    setPreviewIndex(0);
  }, [isOpen, initialItems, cartItems, product]);

  // Combined list of presets
  const allPresets: SizePreset[] = [...DEFAULT_SIZE_PRESETS, ...customPresets];
  const activePreset = allPresets.find((s) => s.id === selectedSizeId);

  // Determine current active dimensions
  const widthMm =
    selectedSizeId === 'custom'
      ? parseInt(customWidthInput, 10) || 40
      : activePreset
      ? activePreset.widthMm
      : parseInt(customWidthInput, 10) || 40;

  const heightMm =
    selectedSizeId === 'custom'
      ? parseInt(customHeightInput, 10) || 14
      : activePreset
      ? activePreset.heightMm
      : parseInt(customHeightInput, 10) || 14;

  // Real dimension taking orientation into account
  const finalWidthMm = orientation === 'landscape' ? Math.max(widthMm, heightMm) : Math.min(widthMm, heightMm);
  const finalHeightMm = orientation === 'landscape' ? Math.min(widthMm, heightMm) : Math.max(widthMm, heightMm);

  // Preset Selection handler
  const handleSelectPreset = (id: string) => {
    setSelectedSizeId(id);
    try {
      localStorage.setItem('huda_perfume_last_selected_size', id);
    } catch (e) {}

    const found = allPresets.find((p) => p.id === id);
    if (found) {
      setCustomWidthInput(String(found.widthMm));
      setCustomHeightInput(String(found.heightMm));
    }
  };

  // Custom Preset Management: Save or Update
  const handleSaveCustomPreset = () => {
    const w = parseInt(customWidthInput, 10);
    const h = parseInt(customHeightInput, 10);

    if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0) {
      alert('กรุณาระบุความกว้างและความสูงเป็นตัวเลขที่ถูกต้อง (มากกว่า 0 มม.)');
      return;
    }

    const defaultTitle = `${w} × ${h} มม. (กำหนดเอง)`;
    const name = customNameInput.trim() || defaultTitle;

    if (editingPresetId) {
      // Update existing preset
      const updated = customPresets.map((p) =>
        p.id === editingPresetId
          ? {
              ...p,
              name,
              widthMm: w,
              heightMm: h,
              desc: `ขนาดที่คุณกำหนดไว้ ${w} × ${h} มม.`,
            }
          : p
      );
      setCustomPresets(updated);
      try {
        localStorage.setItem('huda_perfume_custom_sizes', JSON.stringify(updated));
      } catch (e) {}
      setSelectedSizeId(editingPresetId);
      setEditingPresetId(null);
      setIsCustomFormOpen(false);
      setCustomNameInput('');
    } else {
      // Create new preset
      const newId = `custom-${Date.now()}`;
      const newPreset: SizePreset = {
        id: newId,
        name,
        desc: `ขนาดที่คุณกำหนดไว้ ${w} × ${h} มม.`,
        widthMm: w,
        heightMm: h,
        isCustom: true,
      };
      const updated = [...customPresets, newPreset];
      setCustomPresets(updated);
      try {
        localStorage.setItem('huda_perfume_custom_sizes', JSON.stringify(updated));
        localStorage.setItem('huda_perfume_last_selected_size', newId);
      } catch (e) {}
      setSelectedSizeId(newId);
      setIsCustomFormOpen(false);
      setCustomNameInput('');
    }
  };

  // Duplicate / Copy a preset to customize
  const handleCopyPreset = (preset: SizePreset) => {
    setEditingPresetId(null);
    setCustomWidthInput(String(preset.widthMm));
    setCustomHeightInput(String(preset.heightMm));
    setCustomNameInput(`${preset.name} (สำเนา)`);
    setSelectedSizeId('custom');
    setIsCustomFormOpen(true);
  };

  // Edit an existing custom preset
  const handleStartEditPreset = (preset: SizePreset) => {
    setEditingPresetId(preset.id);
    setCustomWidthInput(String(preset.widthMm));
    setCustomHeightInput(String(preset.heightMm));
    setCustomNameInput(preset.name);
    setSelectedSizeId(preset.id);
    setIsCustomFormOpen(true);
  };

  // Delete a custom preset
  const handleDeleteCustomPreset = (presetId: string) => {
    if (!window.confirm('ต้องการลบขนาดสติ๊กเกอร์นี้ออกจากรายการบันทึกใช่หรือไม่?')) return;
    const updated = customPresets.filter((p) => p.id !== presetId);
    setCustomPresets(updated);
    try {
      localStorage.setItem('huda_perfume_custom_sizes', JSON.stringify(updated));
    } catch (e) {}
    if (selectedSizeId === presetId) {
      setSelectedSizeId('40x14');
    }
    if (editingPresetId === presetId) {
      setEditingPresetId(null);
      setIsCustomFormOpen(false);
      setCustomNameInput('');
    }
  };

  // Generate QR code data URLs for items if mini QR is enabled
  useEffect(() => {
    if (!includeMiniQr || items.length === 0) {
      setPreviewQrMap({});
      return;
    }

    const map: Record<string, string> = {};
    const promises = items.map(async (item) => {
      try {
        const qrPayload = `HUDA-PERFUME:${getEffectiveScentName(item.name)}:${item.volume}:${item.lotNumber}`;
        const url = await QRCode.toDataURL(qrPayload, {
          width: 140,
          margin: 0,
          color: { dark: '#000000', light: '#ffffff' },
          errorCorrectionLevel: 'M',
        });
        map[item.id] = url;
      } catch (err) {
        console.error('Failed to generate mini QR', err);
      }
    });

    Promise.all(promises).then(() => {
      setPreviewQrMap({ ...map });
    });
  }, [items, includeMiniQr, includeCodePrefix]);

  // Total stickers to be printed
  const totalStickerCount = items.reduce((sum, item) => sum + (Number(item.copies) || 1), 0);

  // Quick actions for items
  const handleUpdateItem = (id: string, field: keyof PerfumeLabelItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (previewIndex >= items.length - 1) {
      setPreviewIndex(Math.max(0, items.length - 2));
    }
  };

  const handleAddNewCustomScent = () => {
    const newItem: PerfumeLabelItem = {
      id: `custom-${Date.now()}`,
      name: 'กลิ่นใหม่ (ระบุชื่อ)',
      volume: '10 ml',
      fragranceType: 'EAU DE PARFUM',
      lotNumber: defaultLot,
      copies: 1, // ALWAYS START AT 1 !
    };
    setItems((prev) => [...prev, newItem]);
    setPreviewIndex(items.length);
  };

  const handleAddFromCatalog = (productId: string) => {
    if (!productId) return;
    const found = products.find((p) => p.id === productId);
    if (!found) return;

    const newItem: PerfumeLabelItem = {
      id: `cat-${found.id}-${Date.now()}`,
      name: cleanScentTitle(found.title),
      volume: '10 ml',
      fragranceType: found.fabric?.includes('Oil') ? 'PERFUME OIL' : 'EAU DE PARFUM',
      lotNumber: defaultLot,
      price: found.variants[0]?.price,
      copies: 1, // ALWAYS START AT 1 !
    };
    setItems((prev) => [...prev, newItem]);
    setPreviewIndex(items.length);
    setSelectedProductToAdd('');
  };

  const handleAddAllPerfumesInCatalog = (copiesEach: number = 1) => {
    if (perfumeProducts.length === 0) {
      alert('ไม่พบสินค้าน้ำหอมในระบบค่ะ');
      return;
    }
    const allItems: PerfumeLabelItem[] = perfumeProducts.map((p, idx) => ({
      id: `all-perfume-${p.id}-${idx}`,
      name: cleanScentTitle(p.title),
      volume: '10 ml',
      fragranceType: p.fabric?.includes('Oil') ? 'PERFUME OIL' : 'EAU DE PARFUM',
      lotNumber: defaultLot,
      price: p.variants[0]?.price,
      copies: copiesEach,
    }));
    setItems(allItems);
    setPreviewIndex(0);
  };

  const handleSetAllCopies = (copies: number) => {
    setItems((prev) => prev.map((item) => ({ ...item, copies })));
  };

  // Generate Card HTML for isolated printing
  const generateLabelHtml = (item: PerfumeLabelItem, qrUrl?: string) => {
    const displayName = getEffectiveScentName(item.name);

    const qrSection =
      includeMiniQr && qrUrl
        ? `<div class="qr-col"><img src="${qrUrl}" alt="QR" class="qr-img" /></div>`
        : '';

    const priceSection =
      includePrice && item.price
        ? `<span class="price-pill">฿${item.price}</span>`
        : '';

    const lotSection =
      includeLot && item.lotNumber
        ? `<span class="lot-pill">LOT: ${escapeHtml(item.lotNumber)}</span>`
        : '';

    const volSection =
      includeVolume && item.volume
        ? `<span class="vol-badge">${escapeHtml(item.volume)}</span>`
        : '';

    const typeSection =
      includeFragranceType && item.fragranceType
        ? `<span class="type-text">${escapeHtml(item.fragranceType)}</span>`
        : '';

    const hasFooter = volSection || typeSection || lotSection || priceSection;

    const brandSection = includeBrandTitle
      ? `
        <div class="brand-row">
          <span class="brand-sparkle">✦</span>
          <span class="brand-title">${escapeHtml(brandTitle)}</span>
          <span class="brand-sparkle">✦</span>
        </div>`
      : '';

    if (orientation === 'landscape') {
      return `
        <div class="huda-perfume-tag landscape">
          ${qrSection}
          <div class="main-content">
            ${brandSection}
            <div class="scent-name-box">
              <div class="scent-name" title="${escapeHtml(displayName)}">
                ${escapeHtml(displayName)}
              </div>
            </div>
            ${
              hasFooter
                ? `
            <div class="footer-row">
              ${volSection}
              ${typeSection}
              ${lotSection}
              ${priceSection}
            </div>`
                : ''
            }
          </div>
        </div>
      `;
    } else {
      // Portrait orientation (Vertical)
      return `
        <div class="huda-perfume-tag portrait">
          ${brandSection}
          ${qrSection}
          <div class="scent-name-box">
            <div class="scent-name" title="${escapeHtml(displayName)}">
              ${escapeHtml(displayName)}
            </div>
          </div>
          ${
            hasFooter
              ? `
          <div class="footer-row">
            ${volSection}
            ${typeSection}
          </div>
          <div class="sub-footer-row">
            ${lotSection}
            ${priceSection}
          </div>`
              : ''
          }
        </div>
      `;
    }
  };

  // Direct Thermal Printing via isolated iframe
  const handleDirectPrint = () => {
    if (items.length === 0) return;

    const oldIframe = document.getElementById('huda-perfume-print-iframe');
    if (oldIframe) oldIframe.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'huda-perfume-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Render cards repeating by `item.copies`
    const cardsHtml = items
      .flatMap((item) => {
        const qrUrl = previewQrMap[item.id];
        const cardMarkup = generateLabelHtml(item, qrUrl);
        const copies = Math.max(1, Number(item.copies) || 1);
        return Array(copies).fill(cardMarkup);
      })
      .join('');

    const printStyles = `
      @page {
        size: ${finalWidthMm}mm ${finalHeightMm}mm;
        margin: 0mm !important;
      }
      @media print {
        @page {
          size: ${finalWidthMm}mm ${finalHeightMm}mm;
          margin: 0mm !important;
        }
        html, body {
          margin: 0mm !important;
          padding: 0mm !important;
          border: none !important;
          background: #fff !important;
          width: ${finalWidthMm}mm !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        color: #000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      body {
        background: #fff;
        width: ${finalWidthMm}mm;
      }
      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .huda-perfume-tag {
        width: ${finalWidthMm}mm;
        height: ${finalHeightMm}mm;
        page-break-after: always;
        break-after: page;
        padding: 1mm 1.5mm;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: #fff;
        overflow: hidden;
        border: 0.5px solid #000;
        box-sizing: border-box;
      }
      .huda-perfume-tag.landscape {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
      .qr-col {
        width: ${Math.min(finalHeightMm - 2, 14)}mm;
        height: ${Math.min(finalHeightMm - 2, 14)}mm;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 1mm;
      }
      .qr-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .main-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        height: 100%;
        text-align: center;
      }
      .brand-row {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.5px;
        font-size: 6px;
        font-weight: 900;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        line-height: 1;
        padding-top: 0.2mm;
        padding-bottom: 0.2mm;
      }
      .brand-sparkle {
        font-size: 5px;
      }
      .brand-title {
        font-weight: 900;
      }
      .scent-name-box {
        flex: 1;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        width: 100%;
        margin: auto 0;
        padding: 0 0.5mm;
        padding-top: 0.6mm; /* ขยับลงมาพอดีตามที่ยืนยัน */
      }
      .scent-name {
        font-size: ${finalHeightMm <= 14 ? '10px' : '12px'};
        font-weight: 900;
        line-height: 1.15;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
        width: 100%;
      }
      .footer-row {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 6.5px;
        font-weight: 800;
        border-top: 0.4px solid #000;
        padding-top: 0.3mm;
        line-height: 1;
      }
      .vol-badge {
        font-weight: 900;
        font-size: 7px;
      }
      .type-text {
        font-size: 5.5px;
        font-weight: 800;
        letter-spacing: 0.2px;
      }
      .lot-pill, .price-pill {
        font-size: 6px;
        font-weight: 800;
      }
      /* Portrait styles */
      .huda-perfume-tag.portrait {
        text-align: center;
        padding: 1.2mm 1mm;
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .huda-perfume-tag.portrait .scent-name-box {
        flex: 1;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        width: 100%;
        margin: auto 0;
        padding-top: 0.8mm;
      }
      .huda-perfume-tag.portrait .scent-name {
        font-size: 9.5px;
        white-space: normal;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        text-align: center;
        width: 100%;
      }
      .huda-perfume-tag.portrait .footer-row {
        justify-content: space-around;
      }
      .sub-footer-row {
        display: flex;
        justify-content: space-between;
        font-size: 5.5px;
        font-weight: 700;
        line-height: 1;
      }
    `;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title></title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="container">${cardsHtml}</div>
        </body>
      </html>
    `);
    doc.close();
    try {
      doc.title = '';
      if (iframe.contentWindow?.document) {
        iframe.contentWindow.document.title = '';
      }
    } catch (e) {}

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        iframe.remove();
      }, 3000);
    }, 400);
  };

  /**
   * Render single label to high-resolution HTML5 Canvas
   * (Resolution: 8 dots/mm or 203 DPI standard for thermal printers)
   */
  const renderLabelToCanvas = (
    item: PerfumeLabelItem,
    qrDataUrl?: string
  ): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const scale = 3; // 3x supersampling for ultra-crisp vector-like typography
      const pxPerMm = 8 * scale; // ~24 pixels per mm
      const canvasWidth = Math.round(finalWidthMm * pxPerMm);
      const canvasHeight = Math.round(finalHeightMm * pxPerMm);

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(canvas);
        return;
      }

      // Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Outer border (thin elegant black line)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.2 * scale;
      const pad = 1.2 * pxPerMm;
      ctx.strokeRect(pad, pad, canvasWidth - pad * 2, canvasHeight - pad * 2);

      // Brand Title on Top (Only if includeBrandTitle is true)
      if (includeBrandTitle) {
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const brandFontSize = Math.round(2.1 * pxPerMm);
        ctx.font = `900 ${brandFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText(`✦ ${brandTitle} ✦`, canvasWidth / 2, pad + 1 * pxPerMm);
      }

      const showFooter =
        includeVolume ||
        includeFragranceType ||
        (includeLot && item.lotNumber) ||
        (includePrice && item.price);

      // Scent Name in Center (Bold & Large)
      const effectiveName = getEffectiveScentName(item.name).toUpperCase();
      const scentFontSize = Math.round(
        (finalHeightMm <= 14
          ? showFooter
            ? includeBrandTitle ? 3.4 : 4.0
            : includeBrandTitle ? 4.4 : 5.0
          : showFooter
          ? includeBrandTitle ? 4.2 : 4.8
          : includeBrandTitle ? 5.0 : 5.8) * pxPerMm
      );
      ctx.font = `900 ${scentFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      // Calculate exact dead center of the scent text box
      let leftBound = pad + 1.2 * pxPerMm;
      let rightBound = canvasWidth - pad - 1.2 * pxPerMm;
      if (includeMiniQr && qrDataUrl) {
        const qrSize = Math.round(canvasHeight - pad * 2 - 1.5 * pxPerMm);
        leftBound = pad + 1.5 * pxPerMm + qrSize;
      }
      const centerX = (leftBound + rightBound) / 2;

      let topBound = pad + 0.8 * pxPerMm;
      let bottomBound = canvasHeight - pad - 0.8 * pxPerMm;
      if (includeBrandTitle) {
        topBound = pad + 2.8 * pxPerMm;
      }
      if (showFooter) {
        bottomBound = canvasHeight - pad - 3.2 * pxPerMm;
      }
      // ขยับลงมาพอดี (+0.6mm)
      const centerY = (topBound + bottomBound) / 2 + 0.6 * pxPerMm;

      // Truncate if too long
      let displayName = effectiveName;
      const maxTextWidth = rightBound - leftBound - 1 * pxPerMm;
      if (ctx.measureText(displayName).width > maxTextWidth) {
        while (
          ctx.measureText(displayName + '...').width > maxTextWidth &&
          displayName.length > 2
        ) {
          displayName = displayName.slice(0, -1);
        }
        displayName += '...';
      }
      ctx.fillText(displayName, centerX, centerY);

      // Footer Row (Only if at least one footer item is enabled)
      if (showFooter) {
        const footerDividerY = canvasHeight - pad - 2.8 * pxPerMm;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(pad + 1 * pxPerMm, footerDividerY);
        ctx.lineTo(canvasWidth - pad - 1 * pxPerMm, footerDividerY);
        ctx.stroke();

        const footerFontSize = Math.round(2.0 * pxPerMm);
        ctx.font = `800 ${footerFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textBaseline = 'bottom';
        const footerTextY = canvasHeight - pad - 0.6 * pxPerMm;

        // Left: Volume
        if (includeVolume) {
          ctx.textAlign = 'left';
          ctx.fillText(item.volume, pad + 1.2 * pxPerMm, footerTextY);
        }

        // Center: Type
        if (includeFragranceType) {
          ctx.textAlign = 'center';
          ctx.font = `700 ${Math.round(1.8 * pxPerMm)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          ctx.fillText(item.fragranceType, canvasWidth / 2, footerTextY);
        }

        // Right: Lot / Price
        if ((includePrice && item.price) || (includeLot && item.lotNumber)) {
          ctx.textAlign = 'right';
          ctx.font = `800 ${footerFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          const rightText =
            includePrice && item.price
              ? `฿${item.price}`
              : includeLot && item.lotNumber
              ? `LOT: ${item.lotNumber}`
              : '';
          ctx.fillText(rightText, canvasWidth - pad - 1.2 * pxPerMm, footerTextY);
        }
      }

      // If mini QR enabled, draw on left
      if (includeMiniQr && qrDataUrl) {
        const qrImg = new Image();
        qrImg.onload = () => {
          const qrSize = Math.round(canvasHeight - pad * 2 - 1.5 * pxPerMm);
          ctx.drawImage(qrImg, pad + 0.8 * pxPerMm, pad + 0.8 * pxPerMm, qrSize, qrSize);
          resolve(canvas);
        };
        qrImg.onerror = () => resolve(canvas);
        qrImg.src = qrDataUrl;
      } else {
        resolve(canvas);
      }
    });
  };

  /**
   * Export / Download high-res PNG image for the active preview item
   */
  const handleDownloadActiveImage = async () => {
    const activeItem = items[previewIndex];
    if (!activeItem) return;

    setIsGeneratingImages(true);
    try {
      const qrUrl = previewQrMap[activeItem.id];
      const canvas = await renderLabelToCanvas(activeItem, qrUrl);
      const dataUrl = canvas.toDataURL('image/png');

      const safeName = getEffectiveScentName(activeItem.name).replace(/[^a-zA-Z0-9ก-๙]/g, '_');
      const filename = `Huda_Perfume_${safeName}_${activeItem.volume.replace(/\s+/g, '')}.png`;

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export image', err);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์รูปภาพ');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  /**
   * Share / Copy image directly to Niimbot app or clipboard
   */
  const handleShareOrCopyImage = async () => {
    const activeItem = items[previewIndex];
    if (!activeItem) return;

    setIsGeneratingImages(true);
    try {
      const qrUrl = previewQrMap[activeItem.id];
      const canvas = await renderLabelToCanvas(activeItem, qrUrl);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsGeneratingImages(false);
          return;
        }

        const safeName = getEffectiveScentName(activeItem.name).replace(/[^a-zA-Z0-9ก-๙]/g, '_');
        const file = new File(
          [blob],
          `Huda_Perfume_${safeName}_${activeItem.volume.replace(/\s+/g, '')}.png`,
          { type: 'image/png' }
        );

        // Try Web Share API (mobile direct share to Niimbot app)
        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({ files: [file] })
        ) {
          try {
            await navigator.share({
              title: `สติ๊กเกอร์น้ำหอม ${getEffectiveScentName(activeItem.name)}`,
              text: `สติ๊กเกอร์ขนาด ${finalWidthMm}x${finalHeightMm}mm สำหรับเครื่องพิมพ์ Niimbot`,
              files: [file],
            });
            setIsGeneratingImages(false);
            return;
          } catch (shareErr) {
            // User cancelled or unsupported
          }
        }

        // Fallback: Copy Image to Clipboard
        if (navigator.clipboard && (window as any).ClipboardItem) {
          try {
            const clipboardItem = new (window as any).ClipboardItem({
              'image/png': blob,
            });
            await navigator.clipboard.write([clipboardItem]);
            setIsCopiedSuccess(true);
            setTimeout(() => setIsCopiedSuccess(false), 2500);
            setIsGeneratingImages(false);
            return;
          } catch (clipErr) {
            console.warn('Clipboard write failed, downloading instead', clipErr);
          }
        }

        // Final fallback: download
        handleDownloadActiveImage();
      }, 'image/png');
    } catch (err) {
      console.error('Error sharing image', err);
      setIsGeneratingImages(false);
    }
  };

  /**
   * Download all stickers as PNG files in sequence
   */
  const handleDownloadAllImages = async () => {
    if (items.length === 0) return;
    setIsGeneratingImages(true);

    try {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const qrUrl = previewQrMap[it.id];
        const canvas = await renderLabelToCanvas(it, qrUrl);
        const dataUrl = canvas.toDataURL('image/png');

        const safeName = getEffectiveScentName(it.name).replace(/[^a-zA-Z0-9ก-๙]/g, '_');
        const filename = `Huda_${i + 1}_${safeName}_${it.volume.replace(/\s+/g, '')}.png`;

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();

        await new Promise((r) => setTimeout(r, 200));
      }
    } catch (err) {
      console.error('Failed to download all', err);
    } finally {
      setIsGeneratingImages(false);
    }
  };

  if (!isOpen) return null;

  const currentPreviewItem = items[previewIndex] || items[0];
  const hasActiveFooter =
    includeVolume ||
    includeFragranceType ||
    (includeLot && currentPreviewItem?.lotNumber) ||
    (includePrice && currentPreviewItem?.price);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-5xl w-full text-stone-950 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-stone-950 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-950 text-amber-400 flex items-center justify-center font-black shadow-inner border border-amber-300">
              <Droplets className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-black text-base sm:text-lg text-stone-950 tracking-wide">
                  🏷️ พิมพ์สติ๊กเกอร์ขวดน้ำหอมแบ่ง 10ml / 5ml
                </h3>
                <span className="text-[10px] font-black uppercase bg-stone-950 text-amber-400 px-2 py-0.5 rounded-full border border-amber-400">
                  Niimbot &amp; ม้วนความร้อน
                </span>
              </div>
              <p className="text-[11px] text-stone-900 font-extrabold">
                เลือกกลิ่นที่ต้องการพิมพ์ กำหนดขนาดสติ๊กเกอร์เอง บันทึกไว้ใช้ครั้งต่อไปได้ คัดลอก ลบ และแก้ไขได้อิสระ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-900 hover:text-stone-950 p-2 rounded-full hover:bg-black/10 transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-stone-50">
          {/* Scent List & Live Preview Dual Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Scent List Table (7 cols) */}
            <div className="lg:col-span-7 bg-white p-4 rounded-2xl border-2 border-stone-300 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black text-stone-950">
                    1. รายการกลิ่นที่จะพิมพ์ ({items.length} กลิ่น / รวม {totalStickerCount} ดวง):
                  </span>
                </div>

                {items.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetAllCopies(1)}
                      className="text-[10px] px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-bold border border-stone-300 cursor-pointer"
                      title="ตั้งจำนวนพิมพ์ทุกกลิ่นเป็น 1 ดวง"
                    >
                      อย่างละ 1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetAllCopies(2)}
                      className="text-[10px] px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-bold border border-stone-300 cursor-pointer"
                      title="ตั้งจำนวนพิมพ์ทุกกลิ่นเป็น 2 ดวง"
                    >
                      อย่างละ 2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetAllCopies(5)}
                      className="text-[10px] px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-bold border border-stone-300 cursor-pointer"
                      title="ตั้งจำนวนพิมพ์ทุกกลิ่นเป็น 5 ดวง"
                    >
                      อย่างละ 5
                    </button>
                    <button
                      type="button"
                      onClick={() => setItems([])}
                      className="text-[10px] px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-bold border border-rose-300 cursor-pointer"
                      title="ล้างรายการทั้งหมด"
                    >
                      ล้างหมด
                    </button>
                  </div>
                )}
              </div>

              {/* Scan Success Toast */}
              {scanToast && (
                <div className="bg-emerald-600 text-white font-black text-xs px-3 py-2 rounded-xl shadow-md flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                    <span>{scanToast}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScanToast(null)}
                    className="text-white/80 hover:text-white text-xs font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Add Scent Bar - Search + Voice + QR + Custom */}
              <div className="bg-stone-50 p-3 rounded-2xl border-2 border-amber-300/80 shadow-xs space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  {/* Search Combobox Input */}
                  <div className="sm:col-span-8 relative" ref={searchContainerRef}>
                    <div className="relative flex items-center">
                      <Search className="w-4 h-4 text-stone-500 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        value={scentSearchQuery}
                        onChange={(e) => {
                          setScentSearchQuery(e.target.value);
                          setIsSearchDropdownOpen(true);
                        }}
                        onFocus={() => setIsSearchDropdownOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (filteredPerfumes.length > 0) {
                              handleSelectPerfumeFromSearch(filteredPerfumes[0]);
                            } else if (scentSearchQuery.trim()) {
                              handleAddCustomFromSearch();
                            }
                          } else if (e.key === 'Escape') {
                            setIsSearchDropdownOpen(false);
                          }
                        }}
                        placeholder="🔍 พิมพ์ค้นหากลิ่น / รหัส B001 / หรือกดพูด..."
                        className="w-full bg-white border-2 border-stone-300 focus:border-amber-500 rounded-xl pl-9 pr-22 py-2.5 text-xs font-black text-stone-950 placeholder-stone-400 focus:outline-none shadow-xs"
                      />

                      {/* Right action buttons inside input */}
                      <div className="absolute right-1.5 flex items-center gap-1">
                        {scentSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setScentSearchQuery('');
                              setIsSearchDropdownOpen(false);
                            }}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition cursor-pointer"
                            title="ล้างคำค้นหา"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Microphone Voice Button */}
                        <button
                          type="button"
                          onClick={handleToggleListening}
                          className={`p-1.5 rounded-lg transition cursor-pointer flex items-center justify-center ${
                            isListening
                              ? 'bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-400'
                              : 'bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-800 border border-stone-300'
                          }`}
                          title={isListening ? 'กำลังฟัง... คลิกเพื่อหยุด' : '🎙️ กดเพื่อพูดชื่อกลิ่น'}
                        >
                          {isListening ? (
                            <MicOff className="w-3.5 h-3.5 animate-bounce" />
                          ) : (
                            <Mic className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* QR / Barcode Scanner Button */}
                        <button
                          type="button"
                          onClick={() => setIsScannerOpen(true)}
                          className="p-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-stone-950 font-black border border-amber-500 transition cursor-pointer flex items-center justify-center shadow-xs"
                          title="📷 สแกน QR Code / บาร์โค้ด สินค้าน้ำหอม"
                        >
                          <QrCode className="w-3.5 h-3.5 text-stone-950" />
                        </button>
                      </div>
                    </div>

                    {/* Listening feedback banner */}
                    {isListening && (
                      <div className="mt-1.5 px-3 py-1 bg-rose-50 border border-rose-300 rounded-lg text-rose-700 text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        <span>🎙️ กำลังฟังเสียง... พูดชื่อกลิ่น เช่น <strong>"B001"</strong> หรือ <strong>"เอมิเรตส์"</strong> ได้เลยค่ะ</span>
                      </div>
                    )}

                    {/* Autocomplete / Filtered Dropdown */}
                    {isSearchDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-amber-400 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-stone-100 animate-fade-in">
                        <div className="p-2 bg-amber-50/80 text-[11px] font-black text-amber-950 flex items-center justify-between border-b border-amber-200">
                          <span>
                            {scentSearchQuery
                              ? `ผลการค้นหา "${scentSearchQuery}" (${filteredPerfumes.length} รายการ)`
                              : `เลือกกลิ่นจากสต๊อกร้าน (${filteredPerfumes.length} รายการ): `}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsSearchDropdownOpen(false)}
                            className="text-stone-500 hover:text-stone-800 text-[10px] font-bold"
                          >
                            ปิด ✕
                          </button>
                        </div>

                        {filteredPerfumes.length === 0 ? (
                          <div className="p-3 text-center space-y-2">
                            <p className="text-xs text-stone-600 font-bold">
                              ไม่พบกลิ่นที่ตรงกับ "{scentSearchQuery}"
                            </p>
                            {scentSearchQuery.trim() && (
                              <button
                                type="button"
                                onClick={handleAddCustomFromSearch}
                                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs font-black border border-amber-500 shadow-xs cursor-pointer inline-flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>เพิ่มกลิ่นพิเศษ "{scentSearchQuery}"</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          filteredPerfumes.map((p) => {
                            return (
                              <div
                                key={p.id}
                                onClick={() => handleSelectPerfumeFromSearch(p)}
                                className="p-2.5 hover:bg-amber-50 cursor-pointer flex items-center justify-between gap-2 transition"
                              >
                                <div className="min-w-0 flex-1">
                                  <span className="block text-xs font-black text-stone-950 truncate">
                                    {p.title}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-600 font-bold">
                                    {p.variants[0]?.price && <span>฿{p.variants[0].price.toLocaleString()}</span>}
                                    {p.fabric && <span className="text-stone-500">• {p.fabric}</span>}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectPerfumeFromSearch(p);
                                  }}
                                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 text-[11px] font-black rounded-lg border border-amber-500 shadow-xs shrink-0 cursor-pointer flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>เพิ่ม</span>
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Manual Custom Scent Button */}
                  <div className="sm:col-span-4 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleAddNewCustomScent}
                      className="w-full p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-950 font-black text-xs rounded-xl border border-stone-300 flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                      title="พิมพ์ชื่อกลิ่นพิเศษเอง"
                    >
                      <Plus className="w-4 h-4 text-amber-600" />
                      <span>ระบุกลิ่นเอง</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <div className="py-12 text-center text-stone-500 text-xs font-black flex flex-col items-center justify-center gap-2">
                    <Droplets className="w-8 h-8 text-amber-400 animate-bounce" />
                    <span className="text-stone-950 font-black">ยังไม่มีรายการกลิ่นที่เลือก</span>
                    <p className="text-[11px] text-stone-600 font-normal">
                      คลิกเลือกกลิ่นที่ต้องการพิมพ์จากช่องด้านบนทีละรายการ หรือกดปุ่ม <strong>"ระบุกลิ่นเอง"</strong> ได้เลยค่ะ
                    </p>
                  </div>
                ) : (
                  items.map((item, idx) => {
                    const effectiveTitle = getEffectiveScentName(item.name);
                    return (
                      <div
                        key={item.id}
                        onClick={() => setPreviewIndex(idx)}
                        className={`p-2.5 rounded-xl border-2 transition cursor-pointer flex items-center justify-between gap-2 ${
                          previewIndex === idx
                            ? 'bg-amber-50/80 border-amber-500 shadow-xs'
                            : 'bg-white border-stone-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="w-5 text-center text-[10px] font-mono font-black text-stone-500">
                            {idx + 1}.
                          </span>
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                              className="w-full bg-transparent font-black text-xs text-stone-950 border-b border-dashed border-stone-300 focus:border-amber-600 focus:outline-none"
                              placeholder="ชื่อกลิ่น..."
                            />
                            {!includeCodePrefix && item.name !== effectiveTitle && (
                              <span className="text-[10px] text-amber-900 font-bold block mt-0.5">
                                จะพิมพ์เฉพาะ: <strong className="text-stone-950">"{effectiveTitle}"</strong>
                              </span>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {includeVolume && (
                                <select
                                  value={item.volume}
                                  onChange={(e) => handleUpdateItem(item.id, 'volume', e.target.value)}
                                  className="text-[10px] bg-stone-100 border border-stone-300 rounded px-1.5 py-0.5 font-black text-stone-900 cursor-pointer"
                                >
                                  <option value="10 ml">10 ml</option>
                                  <option value="5 ml">5 ml</option>
                                  <option value="15 ml">15 ml</option>
                                  <option value="30 ml">30 ml</option>
                                  <option value="50 ml">50 ml</option>
                                  <option value="100 ml">100 ml</option>
                                </select>
                              )}

                              {includeFragranceType && (
                                <select
                                  value={item.fragranceType}
                                  onChange={(e) => handleUpdateItem(item.id, 'fragranceType', e.target.value)}
                                  className="text-[10px] bg-stone-100 border border-stone-300 rounded px-1.5 py-0.5 font-bold text-stone-900 cursor-pointer"
                                >
                                  <option value="EAU DE PARFUM">EAU DE PARFUM (EDP)</option>
                                  <option value="PERFUME OIL">PERFUME OIL (ออยล์แท้)</option>
                                  <option value="ATTAR DUBAI">ATTAR DUBAI (อัตตาร์)</option>
                                  <option value="EXTRAIT DE PARFUM">EXTRAIT DE PARFUM</option>
                                </select>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Copies counter (starts at 1) */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateItem(item.id, 'copies', Math.max(1, item.copies - 1));
                              }}
                              className="px-2.5 py-1 text-stone-900 hover:bg-stone-200 font-black text-xs rounded-l-lg cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={999}
                              value={item.copies}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                                handleUpdateItem(item.id, 'copies', val);
                              }}
                              className="w-10 text-center font-mono font-black text-xs bg-white text-stone-950 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateItem(item.id, 'copies', item.copies + 1);
                              }}
                              className="px-2.5 py-1 text-stone-900 hover:bg-stone-200 font-black text-xs rounded-r-lg cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-[10px] text-stone-600 font-bold">ดวง</span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(item.id);
                            }}
                            className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer transition"
                            title="ลบกลิ่นนี้"
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

            {/* Right: Live Label Preview on Bottle Mockup (5 cols) */}
            <div className="lg:col-span-5 bg-white p-4 rounded-2xl border-2 border-stone-300 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-black text-stone-950">
                      2. ตัวอย่างป้ายสติ๊กเกอร์จริง ({finalWidthMm} × {finalHeightMm} มม.):
                    </span>
                  </div>
                  {currentPreviewItem && items.length > 0 && (
                    <span className="text-[10px] bg-amber-100 text-amber-950 px-2 py-0.5 rounded-full font-black border border-amber-300">
                      กลิ่นที่ {previewIndex + 1} จาก {items.length}
                    </span>
                  )}
                </div>

                {/* Bottle Simulation & Sticker Preview Box */}
                <div className="mt-4 p-4 bg-gradient-to-b from-stone-100 via-stone-200 to-stone-300 rounded-2xl border-2 border-stone-300 flex flex-col items-center justify-center min-h-[200px] shadow-inner relative overflow-hidden">
                  <div className="text-[10px] text-stone-600 font-black mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>จำลองติดบนขวดสเปรย์แบ่ง 10ml</span>
                  </div>

                  {/* High Contrast Sticker Card */}
                  {currentPreviewItem && items.length > 0 ? (
                    <div
                      style={{
                        width: orientation === 'landscape' ? '280px' : '150px',
                        minHeight: orientation === 'landscape' ? '92px' : '180px',
                      }}
                      className="bg-white border-2 border-black rounded-sm p-2 shadow-xl flex flex-col justify-between text-black text-center transition-all duration-300 relative select-none"
                    >
                      {/* Brand Header (Only if includeBrandTitle) */}
                      {includeBrandTitle && (
                        <div className="flex-shrink-0 flex items-center justify-center gap-1 text-[8px] font-black tracking-widest uppercase border-b border-black/40 pb-0.5">
                          <span className="text-[7px]">✦</span>
                          <span>{brandTitle}</span>
                          <span className="text-[7px]">✦</span>
                        </div>
                      )}

                      {/* Middle: Scent Name (Centered dead-center in box, ขยับลงมาพอดี) & Optional Mini QR */}
                      <div className="flex-1 min-h-0 w-full flex items-center justify-center gap-2 my-auto px-1 pt-1.5">
                        {includeMiniQr && previewQrMap[currentPreviewItem.id] && (
                          <img
                            src={previewQrMap[currentPreviewItem.id]}
                            alt="Mini QR"
                            className="w-10 h-10 object-contain border border-black/40 flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 flex items-center justify-center text-center w-full">
                          <strong className="block font-black text-sm tracking-wide leading-tight uppercase font-serif text-center w-full truncate">
                            {getEffectiveScentName(currentPreviewItem.name)}
                          </strong>
                        </div>
                      </div>

                      {/* Footer Row (Only if at least one footer item is enabled) */}
                      {hasActiveFooter && (
                        <div className="flex-shrink-0 border-t border-black pt-0.5 flex items-center justify-between text-[8px] font-black tracking-tight">
                          {includeVolume && (
                            <span className="font-mono">{currentPreviewItem.volume}</span>
                          )}
                          {includeFragranceType && (
                            <span className="text-[7px] font-bold">{currentPreviewItem.fragranceType}</span>
                          )}
                          {includePrice && currentPreviewItem.price ? (
                            <span className="font-mono">฿{currentPreviewItem.price}</span>
                          ) : includeLot && currentPreviewItem.lotNumber ? (
                            <span className="font-mono">LOT:{currentPreviewItem.lotNumber}</span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-stone-400 text-xs py-8 text-center font-bold">
                      กรุณาเลือกกลิ่นทางฝั่งซ้ายเพื่อดูตัวอย่าง
                    </div>
                  )}

                  <p className="mt-3 text-[10px] text-stone-600 font-extrabold text-center max-w-xs">
                    💡 พิมพ์ด้วยความละเอียด 203 DPI คมชัดบนสติ๊กเกอร์ม้วนความร้อน กันน้ำ กันแอลกอฮอล์
                  </p>
                </div>
              </div>

              {/* Individual Export Actions for Niimbot App */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-300 space-y-2">
                <span className="text-[11px] font-black text-stone-900 block">
                  📲 สำหรับแอพ Niimbot ในมือถือ/แท็บเล็ต:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleShareOrCopyImage}
                    disabled={isGeneratingImages || !currentPreviewItem || items.length === 0}
                    className="p-2.5 bg-stone-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    title="ส่งไฟล์รูปเข้าแอพ Niimbot หรือคัดลอกรูปภาพ"
                  >
                    {isCopiedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>คัดลอกรูปแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-amber-400" />
                        <span>แชร์/คัดลอกรูป</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadActiveImage}
                    disabled={isGeneratingImages || !currentPreviewItem || items.length === 0}
                    className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 font-black text-xs rounded-xl border border-stone-300 shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    title="ดาวน์โหลดรูป PNG คมชัดสูงเข้าเครื่อง"
                  >
                    <Download className="w-4 h-4 text-stone-700" />
                    <span>โหลดรูปภาพ PNG</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Options & Size Settings Card */}
          <div className="bg-white p-4 rounded-2xl border-2 border-stone-300 shadow-xs space-y-4">
            {/* Content Toggles (Checkboxes for user customization) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-950 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-600" />
                  <span>3. เลือกข้อความที่จะให้ออกบนสติ๊กเกอร์ (ติ๊กเลือกเปิด/ปิด):</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs font-black text-stone-950">
                {/* 0. Toggle Brand Header (HUDA ABAYA DUBAI) */}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition select-none ${
                    includeBrandTitle
                      ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-xs'
                      : 'bg-stone-100 border-stone-300 text-stone-700'
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeBrandTitle}
                      onChange={(e) => setIncludeBrandTitle(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>ชื่อหัวป้าย:</span>
                  </label>
                  <input
                    type="text"
                    value={brandTitle}
                    disabled={!includeBrandTitle}
                    onChange={(e) => setBrandTitle(e.target.value)}
                    className="bg-white border border-stone-400 rounded-lg px-2 py-0.5 text-xs font-black w-40 text-stone-950 disabled:opacity-50 disabled:bg-stone-200"
                    placeholder="HUDA ABAYA DUBAI"
                  />
                </div>

                {/* 1. Toggle Code Prefix (e.g. B001) */}
                <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 cursor-pointer transition select-none ${
                  includeCodePrefix ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-xs' : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={includeCodePrefix}
                    onChange={(e) => setIncludeCodePrefix(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span>รหัสหน้ากลิ่น (เช่น B001)</span>
                </label>

                {/* 2. Toggle Volume (e.g. 10 ml) */}
                <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 cursor-pointer transition select-none ${
                  includeVolume ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-xs' : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={includeVolume}
                    onChange={(e) => setIncludeVolume(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span>ขนาดปริมาณ (10 ml)</span>
                </label>

                {/* 3. Toggle Fragrance Type (e.g. EAU DE PARFUM / OIL) */}
                <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 cursor-pointer transition select-none ${
                  includeFragranceType ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-xs' : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={includeFragranceType}
                    onChange={(e) => setIncludeFragranceType(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span>ประเภท (EAU DE PARFUM)</span>
                </label>

                {/* 4. Toggle Lot Number */}
                <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 cursor-pointer transition select-none ${
                  includeLot ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-xs' : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={includeLot}
                    onChange={(e) => setIncludeLot(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span>เลขล็อต ({defaultLot})</span>
                </label>

                {/* 5. Toggle Price */}
                <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 cursor-pointer transition select-none ${
                  includePrice ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-xs' : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={includePrice}
                    onChange={(e) => setIncludePrice(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span>ราคา (฿)</span>
                </label>

                {/* 6. Toggle Mini QR */}
                <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 cursor-pointer transition select-none ${
                  includeMiniQr ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-xs' : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={includeMiniQr}
                    onChange={(e) => setIncludeMiniQr(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Mini QR</span>
                </label>
              </div>
            </div>

            {/* Quick Preset Selector & Custom Size */}
            <div className="pt-3 border-t border-stone-200 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-black text-stone-950">
                  4. ขนาดสติ๊กเกอร์ & ม้วนความร้อน (กำหนดขนาดเอง และขนาดที่บันทึกไว้):
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-700 font-bold">ทิศทาง:</span>
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`px-3 py-1 rounded-lg text-xs font-black border transition cursor-pointer ${
                    orientation === 'landscape'
                      ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-xs'
                      : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                  }`}
                >
                  แนวนอน (รอบขวด)
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`px-3 py-1 rounded-lg text-xs font-black border transition cursor-pointer ${
                    orientation === 'portrait'
                      ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-xs'
                      : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                  }`}
                >
                  แนวตั้ง (ตามยาวขวด)
                </button>
              </div>
            </div>

            {/* Presets Grid: Saved Custom Presets (Shown when user has saved sizes) */}
            {allPresets.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {allPresets.map((preset) => {
                  const isSelected = selectedSizeId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`p-3 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between relative group ${
                        isSelected
                          ? 'bg-amber-50 border-amber-500 text-stone-950 shadow-sm ring-2 ring-amber-400'
                          : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <strong className="block text-xs font-black text-stone-950">
                            {preset.name}
                          </strong>
                          {preset.isCustom && (
                            <span className="text-[9px] bg-amber-400 text-stone-950 font-black px-1.5 py-0.2 rounded-full border border-amber-500 shrink-0">
                              ⭐ กำหนดเอง
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-600 block mt-0.5">
                          {preset.desc}
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-stone-200 flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono font-black text-amber-950 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                          {preset.widthMm} × {preset.heightMm} มม.
                        </span>

                        {/* Action buttons on card: Copy, Edit, Delete */}
                        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                          {/* Copy button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyPreset(preset);
                            }}
                            className="p-1 rounded hover:bg-stone-200 text-stone-600 hover:text-stone-950 transition cursor-pointer"
                            title="คัดลอกขนาดนี้ไปปรับแต่งใหม่"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* If custom: allow edit and delete */}
                          {preset.isCustom && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEditPreset(preset);
                                }}
                                className="p-1 rounded hover:bg-amber-200 text-amber-800 hover:text-stone-950 transition cursor-pointer"
                                title="แก้ไขชื่อและขนาดนี้"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomPreset(preset.id);
                                }}
                                className="p-1 rounded hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                                title="ลบขนาดนี้ออกจากที่บันทึกไว้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add New Custom Size Card */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingPresetId(null);
                    setCustomNameInput('');
                    setSelectedSizeId('custom');
                    setIsCustomFormOpen(true);
                  }}
                  className={`p-3 rounded-xl border-2 border-dashed transition cursor-pointer flex flex-col items-center justify-center gap-1 text-center min-h-[90px] ${
                    selectedSizeId === 'custom'
                      ? 'bg-amber-100/70 border-amber-500 text-stone-950 ring-2 ring-amber-400'
                      : 'bg-stone-50 hover:bg-amber-50 border-stone-300 text-stone-700'
                  }`}
                >
                  <Plus className="w-5 h-5 text-amber-600" />
                  <strong className="text-xs font-black text-stone-950">
                    + กำหนดขนาดเองใหม่
                  </strong>
                  <span className="text-[10px] text-stone-500 font-bold">
                    ใส่ความกว้าง × ยาว บันทึกไว้ใช้ครั้งต่อไป
                  </span>
                </button>
              </div>
            )}

            {/* Custom Dimension Editor Box (Always accessible so staff can adjust mm directly) */}
            <div className="p-3.5 bg-amber-50/90 border-2 border-amber-400 rounded-2xl space-y-3 animate-fade-in shadow-xs">
                <div className="flex items-center justify-between border-b border-amber-300/80 pb-2">
                  <span className="text-xs font-black text-stone-950 flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-amber-700" />
                    <span>
                      {editingPresetId ? '✏️ กำลังแก้ไขขนาดที่บันทึกไว้' : '📏 กำหนดขนาดสติ๊กเกอร์เอง (Custom mm)'}
                    </span>
                  </span>
                  {editingPresetId && (
                    <span className="text-[10px] bg-amber-200 text-amber-950 font-bold px-2 py-0.5 rounded-full">
                      โหมดแก้ไข
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  {/* Preset Name */}
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-black text-stone-800 mb-1">
                      ชื่อขนาด (เช่น ขวดแบ่ง 6ml หรือ 45x15mm):
                    </label>
                    <input
                      type="text"
                      value={customNameInput}
                      onChange={(e) => setCustomNameInput(e.target.value)}
                      placeholder="เช่น ขวดออยล์ดูไบ 6ml"
                      className="w-full bg-white border-2 border-stone-300 focus:border-amber-500 rounded-xl px-2.5 py-1.5 text-xs font-black text-stone-950 focus:outline-none"
                    />
                  </div>

                  {/* Width mm input (allows typing & backspacing freely without clamping to 5!) */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-black text-stone-800 mb-1">
                      ความกว้าง (มม.):
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={customWidthInput}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/\D/g, '');
                          setCustomWidthInput(clean);
                        }}
                        onBlur={() => {
                          const num = parseInt(customWidthInput, 10);
                          if (isNaN(num) || num <= 0) {
                            setCustomWidthInput('40');
                          } else {
                            setCustomWidthInput(String(Math.min(200, Math.max(5, num))));
                          }
                        }}
                        placeholder="40"
                        className="w-full bg-white border-2 border-stone-300 focus:border-amber-500 rounded-xl px-2.5 py-1.5 text-center font-mono font-black text-sm text-stone-950 focus:outline-none shadow-inner"
                      />
                      <span className="text-xs font-black text-stone-700">มม.</span>
                    </div>
                  </div>

                  {/* Height mm input (allows typing & backspacing freely without clamping to 5!) */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-black text-stone-800 mb-1">
                      ความสูง (มม.):
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={customHeightInput}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/\D/g, '');
                          setCustomHeightInput(clean);
                        }}
                        onBlur={() => {
                          const num = parseInt(customHeightInput, 10);
                          if (isNaN(num) || num <= 0) {
                            setCustomHeightInput('14');
                          } else {
                            setCustomHeightInput(String(Math.min(200, Math.max(5, num))));
                          }
                        }}
                        placeholder="14"
                        className="w-full bg-white border-2 border-stone-300 focus:border-amber-500 rounded-xl px-2.5 py-1.5 text-center font-mono font-black text-sm text-stone-950 focus:outline-none shadow-inner"
                      />
                      <span className="text-xs font-black text-stone-700">มม.</span>
                    </div>
                  </div>

                  {/* Save button & cancel button */}
                  <div className="sm:col-span-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleSaveCustomPreset}
                      className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md border border-amber-600 flex items-center justify-center gap-1 cursor-pointer transition hover:scale-105 active:scale-95"
                      title="บันทึกขนาดนี้ไว้ในระบบเพื่อเรียกใช้ครั้งต่อไปได้ตลอดเวลา"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingPresetId ? 'บันทึกแก้ไข' : 'บันทึกขนาดนี้'}</span>
                    </button>

                    {editingPresetId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPresetId(null);
                          setCustomNameInput('');
                        }}
                        className="py-2 px-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-black cursor-pointer"
                        title="ยกเลิกการแก้ไข"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Modal Footer - Main Printing Actions */}
        <div className="p-4 sm:p-5 bg-stone-100 border-t-2 border-stone-300 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-stone-900">
              รวมทั้งหมดที่จะพิมพ์:
            </span>
            <span className="px-3 py-1 bg-amber-400 text-stone-950 font-black text-sm rounded-full border border-amber-500 shadow-xs font-mono">
              {totalStickerCount} ดวง ({items.length} กลิ่น)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Download All PNGs for Niimbot Batch import */}
            <button
              type="button"
              onClick={handleDownloadAllImages}
              disabled={isGeneratingImages || items.length === 0}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-900 font-black text-xs rounded-xl border-2 border-stone-300 shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="บันทึกรูปสติ๊กเกอร์ทั้งหมดเป็นไฟล์รูปภาพ PNG"
            >
              <Download className="w-4 h-4 text-stone-700" />
              <span>โหลดรูปทุกกลิ่น ({items.length} รูป)</span>
            </button>

            {/* Direct Thermal Roll Print Button */}
            <button
              type="button"
              onClick={handleDirectPrint}
              disabled={items.length === 0}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-xl shadow-lg border-2 border-emerald-600 transition flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
              title="สั่งพิมพ์สติ๊กเกอร์ม้วนความร้อนต่อเนื่องอัตโนมัติ"
            >
              <Printer className="w-5 h-5 text-emerald-100" />
              <span>สั่งพิมพ์สติ๊กเกอร์ทันที ({totalStickerCount} ดวง)</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR & Barcode Scanner Modal for Scent Picking */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanProduct}
        title="สแกน QR Code / บาร์โค้ด สินค้าน้ำหอม"
        subtitle="นำกล้องส่องไปที่ QR Code หรือบาร์โค้ดบนขวด/กล่องน้ำหอม เพื่อเพิ่มเข้าคิวพิมพ์อัตโนมัติ"
      />
    </div>
  );
};
