'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Download, QrCode, Tag, Check, Copy, Sparkles, Layers, FileText, CheckCircle2, Minimize2, Maximize2, Settings2, SlidersHorizontal, Edit2, Trash2, Plus, CheckSquare, Square } from 'lucide-react';
import QRCode from 'qrcode';
import { Product, ProductVariant } from '../../types';
import { useShop } from '../../context/ShopContext';
import { ColorIndicator, getEffectiveVariantColor } from '../../utils/colorUtils';
import { extractProductModelCode, generateStandardHudaLot, sortVariantsBySize } from '../../utils/productUtils';
import { LotNumberManagerDropdown } from './LotNumberManagerDropdown';

interface ProductQRLabelModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  initialLotNumber?: string;
  initialVariantId?: string;
}

interface TagItem {
  variant: ProductVariant;
  qrDataUrl: string;
  sku: string;
}

export interface CustomTagPreset {
  id: string;
  name: string;
  widthCm: number;
  heightCm: number;
}

const CUSTOM_SIZES_STORAGE_KEY = 'huda_custom_tag_sizes';

function loadCustomPresets(): CustomTagPreset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_SIZES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
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
 * Clean variant name for tags/labels by stripping height/length explanations in parentheses
 * e.g. 'Size 52 (ส่วนสูง ~150-155 ซม. / ยาว 52")' -> 'Size 52'
 */
export function formatVariantDisplayName(name: string): string {
  if (!name) return '';
  const cleaned = name
    .replace(/\s*\([^)]*(?:ส่วนสูง|ยาว|ซม\.|ความยาว|นิ้ว|height|length|~|edp|spray|premium|attar|sample|tester)[^)]*\)/gi, '')
    .replace(/\s*\(\s*ส่วนสูง[^\)]*\)/gi, '')
    .replace(/\s*\(\s*ยาว[^\)]*\)/gi, '')
    .replace(/\s*\([^)]*ส่วนสูง[^)]*\)/gi, '')
    .replace(/\s*\([^)]*ซม\.[^)]*\)/gi, '')
    .replace(/\s*\([^)]*edp[^)]*\)/gi, '')
    .replace(/\s*\([^)]*spray[^)]*\)/gi, '')
    .trim();
  return cleaned || name;
}


export const ProductQRLabelModal: React.FC<ProductQRLabelModalProps> = ({
  product,
  isOpen,
  onClose,
  initialLotNumber,
  initialVariantId,
}) => {
  const { formatPrice, storeSettings } = useShop();

  // Multi-selection of variant IDs to print
  const [selectedVariantIds, setSelectedVariantIds] = useState<Set<string>>(new Set());

  // Individual quantity copies per variant (variantId -> number, default 1)
  const [variantCopies, setVariantCopies] = useState<Record<string, number>>({});

  const [paperFormat, setPaperFormat] = useState<'a4' | 'thermal'>('thermal');
  
  // Tag Size Presets (Defaulting to 5x2 cm)
  const [sizePreset, setSizePreset] = useState<string>('5x2');
  const [customPresets, setCustomPresets] = useState<CustomTagPreset[]>(() => loadCustomPresets());

  // Custom Tag Size Management Modal States
  const [isCustomSizeModalOpen, setIsCustomSizeModalOpen] = useState<boolean>(false);
  const [editingCustomPreset, setEditingCustomPreset] = useState<CustomTagPreset | null>(null);
  const [customSizeFormName, setCustomSizeFormName] = useState<string>('');
  const [customSizeFormWidth, setCustomSizeFormWidth] = useState<number>(5);
  const [customSizeFormHeight, setCustomSizeFormHeight] = useState<number>(2);

  // Lot / Batch Number (Default: 1-69 = ล็อต 1 ปี 2569)
  const [lotNumber, setLotNumber] = useState<string>(initialLotNumber || '1-69');

  // Naturally sort variants by size (Size 50 -> Size 52 -> Size 54... or S -> M -> L...)
  const sortedVariants = React.useMemo(() => {
    if (!product || !Array.isArray(product.variants)) return [];
    return [...product.variants].sort(sortVariantsBySize);
  }, [product]);

  useEffect(() => {
    if (isOpen) {
      if (initialLotNumber) {
        setLotNumber(initialLotNumber);
      }
      if (product) {
        if (initialVariantId && initialVariantId !== 'all') {
          setSelectedVariantIds(new Set([initialVariantId]));
        } else {
          setSelectedVariantIds(new Set(sortedVariants.map((v) => v.id)));
        }
      }
    }
  }, [isOpen, initialLotNumber, initialVariantId, product, sortedVariants]);

  const [tagList, setTagList] = useState<TagItem[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Compute Width & Height in Millimeters
  const getDimensionsMm = () => {
    if (sizePreset === '5x2') return { width: 50, height: 20 };
    if (sizePreset === '5x3') return { width: 50, height: 30 };

    // Check custom presets
    const custom = customPresets.find((p) => p.id === sizePreset);
    if (custom) {
      const w = Math.max(20, Math.min(200, Math.round(Number(custom.widthCm) * 10)));
      const h = Math.max(15, Math.min(200, Math.round(Number(custom.heightCm) * 10)));
      return { width: w, height: h };
    }

    return { width: 50, height: 20 };
  };

  const { width: widthMm, height: heightMm } = getDimensionsMm();
  const isWide = widthMm >= heightMm * 1.4; // 50x20mm is wide -> horizontal layout

  // Helper to generate SKU string: HUDA-[MODEL]-[RUN]-[YEAR] (e.g. HUDA-A001-2-69)
  const generateSKU = (p: Product, lot: string = '1-69'): string => {
    return generateStandardHudaLot(p.title, p.id, lot);
  };

  // Toggle single variant checkbox
  const toggleVariantSelection = (variantId: string) => {
    setSelectedVariantIds((prev) => {
      const next = new Set(prev);
      if (next.has(variantId)) {
        next.delete(variantId);
      } else {
        next.add(variantId);
      }
      return next;
    });
  };

  // Select all variants
  const selectAllVariants = () => {
    if (!product) return;
    setSelectedVariantIds(new Set(sortedVariants.map((v) => v.id)));
  };

  // Deselect all variants
  const deselectAllVariants = () => {
    setSelectedVariantIds(new Set());
  };

  // Update print quantity copies for a variant
  const updateVariantCopies = (variantId: string, qty: number) => {
    const validQty = Math.max(1, Math.min(999, isNaN(qty) ? 1 : qty));
    setVariantCopies((prev) => ({
      ...prev,
      [variantId]: validQty,
    }));
  };

  // Set all selected variants to the same copy count
  const setAllSelectedCopies = (qty: number) => {
    if (!product) return;
    const validQty = Math.max(1, Math.min(999, qty));
    const nextMap: Record<string, number> = { ...variantCopies };
    selectedVariantIds.forEach((id) => {
      nextMap[id] = validQty;
    });
    setVariantCopies(nextMap);
  };

  // Save new or edited custom size preset
  const handleSaveCustomSize = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = customSizeFormName.trim();
    if (!cleanName) return;

    const w = Math.max(2, Math.min(20, customSizeFormWidth));
    const h = Math.max(1.5, Math.min(20, customSizeFormHeight));

    let updated: CustomTagPreset[];
    let newId: string;

    if (editingCustomPreset) {
      newId = editingCustomPreset.id;
      updated = customPresets.map((p) =>
        p.id === editingCustomPreset.id ? { ...p, name: cleanName, widthCm: w, heightCm: h } : p
      );
    } else {
      newId = `custom_${Date.now()}`;
      const newPreset: CustomTagPreset = {
        id: newId,
        name: cleanName,
        widthCm: w,
        heightCm: h,
      };
      updated = [...customPresets, newPreset];
    }

    setCustomPresets(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_SIZES_STORAGE_KEY, JSON.stringify(updated));
    }
    setSizePreset(newId);
    setIsCustomSizeModalOpen(false);
    setEditingCustomPreset(null);
  };

  // Delete custom size preset
  const handleDeleteCustomSize = (id: string, name: string) => {
    if (!confirm(`ต้องการลบขนาด "${name}" ใช่หรือไม่?`)) return;
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_SIZES_STORAGE_KEY, JSON.stringify(updated));
    }
    if (sizePreset === id) {
      setSizePreset('5x2');
    }
  };

  // Open Edit Custom Size modal
  const handleOpenEditCustomSize = (p: CustomTagPreset) => {
    setEditingCustomPreset(p);
    setCustomSizeFormName(p.name);
    setCustomSizeFormWidth(p.widthCm);
    setCustomSizeFormHeight(p.heightCm);
    setIsCustomSizeModalOpen(true);
  };

  // Open Add Custom Size modal
  const handleOpenAddCustomSize = () => {
    setEditingCustomPreset(null);
    setCustomSizeFormName('');
    setCustomSizeFormWidth(5);
    setCustomSizeFormHeight(2);
    setIsCustomSizeModalOpen(true);
  };

  // Generate QR Code data for each variant (all variants generated once in sorted order)
  useEffect(() => {
    if (!isOpen || !product || sortedVariants.length === 0) {
      setTagList([]);
      return;
    }

    setIsGenerating(true);

    const promises = sortedVariants.map(async (v) => {
      // Standard payload format: HUDA:PRODUCT_ID:VARIANT_ID:LOT_NUMBER
      const cleanLot = (lotNumber || '').trim();
      const payload = cleanLot ? `HUDA:${product.id}:${v.id}:${cleanLot}` : `HUDA:${product.id}:${v.id}`;
      const sku = generateSKU(product, lotNumber);

      const qrDataUrl = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 1,
        color: {
          dark: '#141312',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });

      return {
        variant: v,
        qrDataUrl,
        sku,
      };
    });

    Promise.all(promises)
      .then((tags) => {
        setTagList(tags);
        setIsGenerating(false);
      })
      .catch((err) => {
        console.error('Failed to generate QR codes', err);
        setIsGenerating(false);
      });
  }, [isOpen, product, lotNumber, sortedVariants]);

  // Handle Isolated Printing with exact dimensions (e.g. 5x2 cm)
  const handlePrint = () => {
    if (!product || tagList.length === 0) return;

    const selectedTags = tagList.filter((tag) => selectedVariantIds.has(tag.variant.id));
    if (selectedTags.length === 0) {
      alert('กรุณาเลือกอย่างน้อย 1 ไซส์/ตัวเลือกเพื่อพิมพ์ครับ');
      return;
    }

    // Remove any previous print iframe
    const oldIframe = document.getElementById('huda-print-isolated-iframe');
    if (oldIframe) oldIframe.remove();

    // Create an isolated hidden iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'huda-print-isolated-iframe';
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

    const isThermal = paperFormat === 'thermal';

    // Generate Card HTML based on Wide (e.g. 5x2cm) vs Tall orientation
    const cardsHtml = selectedTags
      .flatMap((tag) => {
        const qty = Math.max(1, variantCopies[tag.variant.id] || 1);
        const colorVal = getEffectiveVariantColor(product, tag.variant);
        const displayName = formatVariantDisplayName(tag.variant.name);

        let cardMarkup = '';
        if (isWide) {
          // Horizontal side-by-side layout (Gold standard for 5x2 cm / 50x20mm)
          cardMarkup = `
            <div class="huda-price-tag huda-tag-wide">
              <div class="qr-col">
                <img src="${tag.qrDataUrl}" alt="QR" class="qr-img" />
              </div>
              <div class="info-col">
                <div class="tag-header">
                  <div class="brand-row">
                    <span class="brand-name">HUDA ABAYA</span>
                    <span class="auth-badge">DUBAI</span>
                  </div>
                  <div class="prod-title" title="${escapeHtml(product.title)}">${escapeHtml(product.title)}</div>
                </div>
                <div class="tag-footer">
                  <div class="variant-price-row">
                    <span class="var-name">${escapeHtml(displayName)}</span>
                    <span class="price-text">฿${tag.variant.price.toLocaleString()}</span>
                  </div>
                  <div class="sku-row">
                    <span class="sku-code">${escapeHtml(tag.sku)}</span>
                    ${colorVal ? `<span class="color-text">${escapeHtml(colorVal)}</span>` : ''}
                  </div>
                </div>
              </div>
            </div>
          `;
        } else {
          // Vertical stacked layout (for 4x3, 5x4, 5x5 cm)
          cardMarkup = `
            <div class="huda-price-tag huda-tag-tall">
              <div class="tag-header">
                <div class="brand-row">
                  <span class="brand-name">HUDA ABAYA</span>
                  <span class="auth-badge">DUBAI</span>
                </div>
                <div class="prod-title" title="${escapeHtml(product.title)}">${escapeHtml(product.title)}</div>
              </div>
              <div class="qr-container">
                <img src="${tag.qrDataUrl}" alt="QR" class="qr-img" />
              </div>
              <div class="tag-footer">
                <div class="variant-price-row">
                  <span class="var-name">${escapeHtml(displayName)}</span>
                  <span class="price-text">฿${tag.variant.price.toLocaleString()}</span>
                </div>
                <div class="sku-row">
                  <span class="sku-code">${escapeHtml(tag.sku)}</span>
                  ${colorVal ? `<span class="color-text">${escapeHtml(colorVal)}</span>` : ''}
                </div>
              </div>
            </div>
          `;
        }
        return Array(qty).fill(cardMarkup);
      })
      .join('');

    // Dynamic print styling based on widthMm x heightMm
    let printStyles = '';

    if (isThermal) {
      // Thermal label roll: @page dimensions match widthMm x heightMm
      printStyles = `
        @page {
          size: ${widthMm}mm ${heightMm}mm;
          margin: 0.8mm;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; color: #000; }
        body { background: #fff; color: #000; }
        .container { display: flex; flex-direction: column; align-items: center; }
        .huda-price-tag {
          width: ${widthMm - 1.6}mm;
          height: ${heightMm - 1.6}mm;
          page-break-after: always;
          break-after: page;
          border: 0.8px solid #000;
          border-radius: 2px;
          padding: 1.5mm 1.5mm 1.2mm 1.5mm;
          box-sizing: border-box;
          background: #fff;
          color: #000;
          overflow: hidden;
        }
        /* Wide layout */
        .huda-tag-wide { display: flex; flex-direction: row; align-items: center; justify-content: space-between; }
        .huda-tag-wide .qr-col { width: ${Math.min(heightMm - 3.5, 17)}mm; height: ${Math.min(heightMm - 3.5, 17)}mm; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .huda-tag-wide .qr-col img { width: 100%; height: 100%; object-fit: contain; }
        .huda-tag-wide .info-col { flex: 1; min-width: 0; margin-left: 1.5mm; display: flex; flex-direction: column; justify-content: space-between; height: 100%; text-align: left; padding: 0.2mm 0; }
        
        /* Tall layout */
        .huda-tag-tall { display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; padding: 0.2mm 0; }
        .huda-tag-tall .qr-img { width: ${Math.min(widthMm * 0.5, heightMm * 0.5)}mm; height: ${Math.min(widthMm * 0.5, heightMm * 0.5)}mm; }

        .brand-row { display: flex; justify-content: flex-start; align-items: baseline; gap: 3.5px; font-size: 7px; font-weight: 900; color: #000; line-height: 1; }
        .huda-tag-tall .brand-row { justify-content: center; }
        .brand-name { font-weight: 900; color: #000; letter-spacing: 0.3px; font-size: 7px; }
        .auth-badge { font-size: 7px; font-weight: 900; color: #000; font-family: inherit; }
        .prod-title { font-size: 8.5px; font-weight: 900; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1; margin: 0.8px 0 0 0; }
        .variant-price-row { display: flex; justify-content: space-between; align-items: center; line-height: 1.1; margin: 0; color: #000; }
        .var-name { font-size: 10.5px; font-weight: 900; color: #000; background: none; border: none; padding: 0; white-space: nowrap; }
        .price-text { font-size: 11.5px; font-weight: 900; color: #000; margin-right: 1ch; }
        .sku-row { display: flex; justify-content: space-between; align-items: center; font-size: 6px; color: #000; font-family: monospace; border-top: 0.5px solid #000; margin-top: 0.8px; padding-top: 0.8px; line-height: 1; }
        .sku-code { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 65%; color: #000; font-weight: 700; }
        .color-text { font-family: sans-serif; font-size: 7.5px; font-weight: 900; color: #000; white-space: nowrap; margin-right: 1ch; }
      `;
    } else {
      // A4 Sheet Grid calculation:
      const colCount = Math.min(6, Math.max(1, Math.floor(196 / (widthMm + 2.5))));
      const gapMm = 2.5;

      printStyles = `
        @page {
          size: A4 portrait;
          margin: 6mm;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; color: #000; }
        body { background: #fff; color: #000; }
        .container {
          display: grid;
          grid-template-columns: repeat(${colCount}, ${widthMm}mm);
          gap: ${gapMm}mm;
          justify-content: start;
        }
        .huda-price-tag {
          width: ${widthMm}mm;
          height: ${heightMm}mm;
          page-break-inside: avoid;
          break-inside: avoid;
          border: 0.8px solid #000;
          border-radius: 3px;
          padding: 1.8mm 1.8mm 1.4mm 1.8mm;
          box-sizing: border-box;
          background: #fff;
          color: #000;
          overflow: hidden;
        }
        /* Wide layout */
        .huda-tag-wide { display: flex; flex-direction: row; align-items: center; justify-content: space-between; }
        .huda-tag-wide .qr-col { width: ${Math.min(heightMm - 3, 18)}mm; height: ${Math.min(heightMm - 3, 18)}mm; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .huda-tag-wide .qr-col img { width: 100%; height: 100%; object-fit: contain; }
        .huda-tag-wide .info-col { flex: 1; min-width: 0; margin-left: 2mm; display: flex; flex-direction: column; justify-content: space-between; height: 100%; text-align: left; padding: 0.3mm 0; }

        /* Tall layout */
        .huda-tag-tall { display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; padding: 0.3mm 0; }
        .huda-tag-tall .qr-img { width: ${Math.min(widthMm * 0.5, heightMm * 0.45)}mm; height: ${Math.min(widthMm * 0.5, heightMm * 0.45)}mm; }

        .brand-row { display: flex; justify-content: flex-start; align-items: baseline; gap: 4px; font-size: 7.5px; font-weight: 900; color: #000; line-height: 1; }
        .huda-tag-tall .brand-row { justify-content: center; }
        .brand-name { font-weight: 900; color: #000; letter-spacing: 0.3px; font-size: 7.5px; }
        .auth-badge { font-size: 7.5px; font-family: monospace; font-weight: 900; color: #000; font-family: inherit; }
        .prod-title { font-size: 9.5px; font-weight: 900; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.15; margin: 1px 0 0 0; }
        .variant-price-row { display: flex; justify-content: space-between; align-items: center; line-height: 1.15; margin: 0; color: #000; }
        .var-name { font-size: 11.5px; font-weight: 900; color: #000; background: none; border: none; padding: 0; white-space: nowrap; }
        .price-text { font-size: 12.5px; font-weight: 900; color: #000; margin-right: 1ch; }
        .sku-row { display: flex; justify-content: space-between; align-items: center; font-size: 6.5px; color: #000; font-family: monospace; border-top: 0.6px solid #000; margin-top: 1px; padding-top: 1px; line-height: 1; }
        .sku-code { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 65%; color: #000; font-weight: 700; }
        .color-text { font-family: sans-serif; font-size: 8px; font-weight: 900; color: #000; white-space: nowrap; margin-right: 1ch; }
      `;
    }

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
          <div class="container">
            ${cardsHtml}
          </div>
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

    // Trigger printing inside the isolated iframe
    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        iframe.remove();
      }, 3000);
    }, 250);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSku(text);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  const handleDownloadSingle = (tag: TagItem) => {
    if (!product) return;
    const link = document.createElement('a');
    const displayName = formatVariantDisplayName(tag.variant.name);
    link.download = `QR-${product.title}-${displayName}.png`;
    link.href = tag.qrDataUrl;
    link.click();
  };

  if (!isOpen || !product) return null;

  // Capacity calculations for A4 sheet
  const colCount = Math.min(6, Math.max(1, Math.floor(196 / (widthMm + 2.5))));
  const rowCount = Math.max(1, Math.floor(280 / (heightMm + 2.5)));
  const tagsPerA4Sheet = colCount * rowCount;

  const selectedTags = tagList.filter((t) => selectedVariantIds.has(t.variant.id));
  const totalLabels = selectedTags.reduce((sum, t) => sum + Math.max(1, variantCopies[t.variant.id] || 1), 0);
  const estimatedSheets = paperFormat === 'a4' ? Math.ceil(totalLabels / tagsPerA4Sheet) : totalLabels;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-white border-2 border-amber-400 rounded-3xl max-w-4xl w-full p-4 sm:p-6 text-stone-950 shadow-2xl space-y-3.5 text-left max-h-[92vh] flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-200 pb-2.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 border border-amber-500 flex items-center justify-center text-stone-950 shadow-xs">
              <QrCode className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg sm:text-xl text-stone-950 flex items-center gap-1.5">
                <span>สร้างป้ายแท็ก &amp; QR Code สินค้า</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </h3>
              <p className="text-xs text-stone-600 font-bold truncate max-w-md">
                {product.title}
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

        {/* Options Toolbar */}
        <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-3 space-y-2.5 text-xs shrink-0">
          {/* Row 1: Paper Format */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="font-black text-stone-900 shrink-0">ประเภทกระดาษ:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPaperFormat('a4')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                    paperFormat === 'a4'
                      ? 'bg-amber-400 text-stone-950 border border-amber-500 shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>สติ๊กเกอร์ A4</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaperFormat('thermal')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                    paperFormat === 'thermal'
                      ? 'bg-amber-400 text-stone-950 border border-amber-500 shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>ม้วนความร้อน (Thermal)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Tag Dimensions (Presets & Custom sizes) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-amber-200/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black text-stone-900 shrink-0 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
                <span>ขนาดป้ายสติ๊กเกอร์:</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {/* 5x2 Preset */}
                <button
                  type="button"
                  onClick={() => setSizePreset('5x2')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                    sizePreset === '5x2'
                      ? 'bg-amber-400 text-stone-950 border border-amber-500 shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
                  }`}
                  title="5 x 2 เซนติเมตร (50 x 20 มม.) แนวนอน ยอดนิยมสำหรับป้ายราคาและแท็กสินค้า"
                >
                  <span>✨ 5 × 2 ซม. (แนะนำ)</span>
                </button>

                {/* 5x3 Preset */}
                <button
                  type="button"
                  onClick={() => setSizePreset('5x3')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    sizePreset === '5x3'
                      ? 'bg-amber-400 text-stone-950 border border-amber-500 shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
                  }`}
                >
                  <span>5 × 3 ซม.</span>
                </button>

                {/* User Saved Custom Presets */}
                {customPresets.map((p) => {
                  const isSelected = sizePreset === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`inline-flex items-center rounded-xl overflow-hidden border shadow-2xs transition ${
                        isSelected ? 'border-amber-500 bg-amber-400' : 'border-stone-300 bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSizePreset(p.id)}
                        className={`px-2.5 py-1.5 text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                          isSelected ? 'text-stone-950' : 'text-stone-700 hover:bg-stone-100'
                        }`}
                        title={`เลือกขนาด ${p.name} (${p.widthCm} × ${p.heightCm} ซม.)`}
                      >
                        <span>🏷️ {p.name} ({p.widthCm}×{p.heightCm} ซม.)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditCustomSize(p)}
                        className={`px-1.5 py-1.5 border-l transition cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 hover:bg-amber-300 text-stone-950'
                            : 'border-stone-200 hover:bg-stone-100 text-stone-600'
                        }`}
                        title={`แก้ไขขนาด "${p.name}"`}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCustomSize(p.id, p.name)}
                        className={`px-1.5 py-1.5 border-l transition cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 hover:bg-red-400 text-stone-950'
                            : 'border-stone-200 hover:bg-red-100 text-stone-500 hover:text-red-700'
                        }`}
                        title={`ลบขนาด "${p.name}"`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}

                {/* Add Custom Size Button */}
                <button
                  type="button"
                  onClick={handleOpenAddCustomSize}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 shadow-2xs"
                  title="กำหนดขนาดเองใหม่ และจดจำไว้ใช้งาน"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-700" />
                  <span>กำหนดขนาดเอง...</span>
                </button>
              </div>
            </div>

            {/* Print Estimates */}
            <div className="text-[11px] font-bold text-stone-700 flex items-center gap-2 bg-amber-100/70 px-2.5 py-1 rounded-lg border border-amber-300">
              <span>ขนาด: <strong className="text-amber-950 font-black">{widthMm / 10} × {heightMm / 10} ซม.</strong></span>
              <span>•</span>
              <span>พิมพ์ทั้งหมด: <strong className="text-amber-950 font-black">{totalLabels}</strong> ป้าย</span>
              <span>•</span>
              <span>ใช้ประมาณ: <strong className="text-emerald-800 font-black">{estimatedSheets} {paperFormat === 'a4' ? `แผ่น A4 (จุได้ ${tagsPerA4Sheet} ป้าย/แผ่น)` : 'ดวง'}</strong></span>
            </div>
          </div>

          {/* Row 2.5: Lot / Batch & SKU Generation (e.g. HUDA-A001-2-69) */}
          <div className="bg-amber-50/70 border border-amber-300/80 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[280px] max-w-md">
              <LotNumberManagerDropdown
                value={lotNumber}
                onChange={setLotNumber}
                productTitle={product?.title}
                productId={product?.id}
                standardLot={product ? generateStandardHudaLot(product.title, product.id, lotNumber || '1-69') : 'HUDA-001-1-69'}
                title="ล็อต/ปี (Lot / Batch):"
                placeholder="เช่น 1-69, 2-69 หรือ HUDA-A001-2-69"
                dropdownDirection="down"
              />
            </div>

            {/* Live Tag SKU Badge */}
            {product && (
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-amber-300 shadow-2xs">
                <span className="text-xs font-black text-stone-700">รหัสแท็ก/SKU ที่พิมพ์:</span>
                <span className="font-mono font-black text-xs text-amber-950 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                  {generateSKU(product, lotNumber)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const sku = generateSKU(product, lotNumber);
                    navigator.clipboard?.writeText(sku);
                    setCopiedSku(sku);
                    setTimeout(() => setCopiedSku(null), 2000);
                  }}
                  className="p-1 text-stone-500 hover:text-stone-900 rounded cursor-pointer"
                  title="คัดลอกรหัส SKU"
                >
                  {copiedSku ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Row 3: Variant Multi-selection Checklist & Quantity Stepper */}
          <div className="bg-white border-2 border-amber-300/80 rounded-2xl p-2.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-black text-stone-950 text-xs">
                  เลือกไซส์ / สี และระบุจำนวนพิมพ์แต่ละอัน (สั่งพิมพ์พร้อมกันในรอบเดียว):
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-stone-900 border border-amber-300 font-mono font-black text-[11px]">
                  เลือก {selectedVariantIds.size} / {sortedVariants.length} รายการ (เรียงตามไซส์)
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={selectAllVariants}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 rounded-lg text-[11px] font-black transition cursor-pointer flex items-center gap-1"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-stone-700" />
                  <span>เลือกทั้งหมด</span>
                </button>
                <button
                  type="button"
                  onClick={deselectAllVariants}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 rounded-lg text-[11px] font-black transition cursor-pointer flex items-center gap-1"
                >
                  <Square className="w-3.5 h-3.5 text-stone-700" />
                  <span>ปลดทั้งหมด</span>
                </button>

                <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-stone-200 text-[11px] text-stone-600 font-bold">
                  <span>ตั้งจำนวนทุกตัวเป็น:</span>
                  {[1, 2, 3, 5, 10].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAllSelectedCopies(q)}
                      className="px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-stone-900 border border-amber-300 rounded font-black text-[10px] cursor-pointer"
                      title={`ตั้งทุกตัวเลือกที่เลือกเป็น ${q} ใบ`}
                    >
                      {q}
                    </button>
                  ))}
                  <span>ใบ</span>
                </div>
              </div>
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1 no-scrollbar">
              {sortedVariants.map((v) => {
                const isChecked = selectedVariantIds.has(v.id);
                const colorVal = getEffectiveVariantColor(product, v);
                const displayName = formatVariantDisplayName(v.name);
                const copies = variantCopies[v.id] || 1;

                return (
                  <div
                    key={v.id}
                    className={`p-2 rounded-xl border-2 transition flex items-center justify-between gap-2 select-none ${
                      isChecked
                        ? 'bg-amber-50/80 border-amber-400 shadow-2xs'
                        : 'bg-stone-50/60 border-stone-200 opacity-60'
                    }`}
                  >
                    {/* Left: Checkbox + Name + Color */}
                    <div
                      onClick={() => toggleVariantSelection(v.id)}
                      className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-amber-400 border-amber-600 text-stone-950'
                            : 'bg-white border-stone-400'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-stone-950 text-xs truncate">
                            {displayName}
                          </span>
                          {colorVal && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-stone-300 text-[10px] font-black shrink-0">
                              <ColorIndicator
                                color={colorVal}
                                dotClassName="w-2.5 h-2.5 shrink-0"
                                showLabel={true}
                                labelClassName="text-[10px] text-stone-900"
                              />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-600 font-bold block truncate">
                          เหลือ {v.stockQuantity} ชิ้น • ฿{v.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Right: Quantity Stepper */}
                    <div className="flex items-center gap-1 shrink-0 bg-white p-1 rounded-lg border border-stone-300 shadow-2xs">
                      <button
                        type="button"
                        disabled={!isChecked}
                        onClick={() => updateVariantCopies(v.id, copies - 1)}
                        className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 font-black text-xs flex items-center justify-center cursor-pointer disabled:opacity-30"
                        title="ลดจำนวน -1"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        disabled={!isChecked}
                        value={copies}
                        onChange={(e) => updateVariantCopies(v.id, parseInt(e.target.value) || 1)}
                        className="w-8 text-center font-mono font-black text-xs text-stone-950 focus:outline-none disabled:opacity-30"
                        title="ระบุจำนวนพิมพ์ของตัวเลือกนี้"
                      />
                      <button
                        type="button"
                        disabled={!isChecked}
                        onClick={() => updateVariantCopies(v.id, copies + 1)}
                        className="w-5 h-5 rounded bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center justify-center cursor-pointer disabled:opacity-30"
                        title="เพิ่มจำนวน +1"
                      >
                        +
                      </button>
                      <span className="text-[10px] font-bold text-stone-500 pr-0.5">ใบ</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Labels Preview Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-[200px]">
          {isGenerating ? (
            <div className="py-16 text-center space-y-2">
              <QrCode className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-stone-600">กำลังสร้าง QR Code ความละเอียดสูง...</p>
            </div>
          ) : (
            <div
              ref={printAreaRef}
              id="huda-printable-tag-area"
              className={
                isWide
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5'
                  : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5'
              }
            >
              {selectedTags.length === 0 ? (
                <div className="py-16 text-center space-y-2 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300 col-span-full">
                  <Tag className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-xs font-bold text-stone-600">ยังไม่ได้เลือกไซส์สำหรับพิมพ์ กรุณาติ๊กเลือกรายการด้านบน</p>
                  <button
                    type="button"
                    onClick={selectAllVariants}
                    className="px-3 py-1.5 bg-amber-400 text-stone-950 rounded-xl text-xs font-black hover:bg-amber-300 transition cursor-pointer"
                  >
                    ✓ ติ๊กเลือกทุกไซส์
                  </button>
                </div>
              ) : (
                selectedTags.flatMap((tag) => {
                  const colorVal = getEffectiveVariantColor(product, tag.variant);
                  const displayName = formatVariantDisplayName(tag.variant.name);
                  const qty = Math.max(1, variantCopies[tag.variant.id] || 1);

                  // Multiply by individual variant copies for preview
                  return Array.from({ length: qty }).map((_, cIdx) => (
                    <div
                      key={`${tag.variant.id}-${cIdx}`}
                      className={`bg-white border-2 border-stone-400 rounded-xl shadow-md text-black hover:border-black transition ${
                        isWide ? 'p-2.5 flex flex-row items-center gap-2.5' : 'p-3 flex flex-col justify-between items-center text-center gap-2'
                      }`}
                    >
                    {isWide ? (
                      /* Wide Layout Preview (e.g. 5x2 cm) */
                      <>
                        {/* QR Col */}
                        <div className="p-1 bg-white rounded-lg border border-black/20 shadow-2xs shrink-0 flex items-center justify-center">
                          <img
                            src={tag.qrDataUrl}
                            alt="Product QR"
                            className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                          />
                        </div>

                        {/* Info Col */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between h-full pt-1 pb-0.5 text-left text-black">
                          <div>
                            {/* Brand Row: HUDA ABAYA & DUBAI ขยับลงมาจากขอบกระดาษ */}
                            <div className="flex items-center gap-1.5 leading-none">
                              <span className="text-[9.5px] font-black tracking-wider text-black uppercase">
                                HUDA ABAYA
                              </span>
                              <span className="text-[9.5px] font-black tracking-wider text-black uppercase">
                                DUBAI
                              </span>
                            </div>

                            {/* Product Code / Title: รหัสสินค้าต่อลงมาแบบแบ่งสัดส่วนสวยงาม */}
                            <h4 className="font-serif font-black text-black truncate text-xs sm:text-[13px] leading-tight mt-1" title={product.title}>
                              {product.title}
                            </h4>
                          </div>

                          <div>
                            {/* Size (No Box/Badge Frame) enlarged & Price in pure black shifted right 1ch */}
                            <div className="flex items-center justify-between font-black text-black leading-tight">
                              <span className="text-sm sm:text-base font-black text-black">
                                {displayName}
                              </span>
                              <span className="font-serif font-black text-black text-sm sm:text-base mr-[1ch]">
                                ฿{tag.variant.price.toLocaleString()}
                              </span>
                            </div>

                            {/* SKU & Color Row: Placed together (เส้นทึบ อยู่ตรงกลางพอดีระหว่างตัวอักษรบนและล่าง) */}
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-solid border-stone-400 text-[8.5px] leading-tight text-black">
                              <div className="flex items-center gap-1.5">
                                <span className="tracking-tight truncate max-w-[85px] font-mono font-bold text-black">{tag.sku}</span>
                                {colorVal && (
                                  <span className="font-sans font-black text-[11px] text-black mr-[1ch]">
                                    {colorVal}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleCopy(tag.sku)}
                                  className="text-black hover:underline font-sans font-bold flex items-center gap-0.5 cursor-pointer text-[9px]"
                                  title="คัดลอก SKU"
                                >
                                  {copiedSku === tag.sku ? '✓ คัดลอกแล้ว' : 'คัดลอก'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadSingle(tag)}
                                  className="text-black hover:opacity-70 cursor-pointer"
                                  title="บันทึกรูป PNG"
                                >
                                  <Download className="w-2.5 h-2.5 text-black" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Tall Layout Preview */
                      <>
                        <div className="w-full pt-1 pb-0.5 text-black text-center">
                          <div className="flex items-center justify-center gap-1.5 leading-none">
                            <span className="text-[9.5px] font-black tracking-wider text-black uppercase">
                              HUDA ABAYA
                            </span>
                            <span className="text-[9.5px] font-black tracking-wider text-black uppercase">
                              DUBAI
                            </span>
                          </div>
                          <h4 className="font-serif font-black text-black truncate mt-1 text-xs sm:text-[13px] leading-tight" title={product.title}>
                            {product.title}
                          </h4>
                        </div>

                        <div className="p-1 bg-white rounded-lg border border-black/20 shadow-2xs">
                          <img
                            src={tag.qrDataUrl}
                            alt="Product QR"
                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto"
                          />
                        </div>

                        <div className="w-full pt-0.5 text-black">
                          <div className="flex items-center justify-between font-black leading-tight">
                            <span className="text-sm sm:text-base font-black text-black">
                              {displayName}
                            </span>
                            <span className="font-serif font-black text-black text-sm sm:text-base mr-[1ch]">
                              ฿{tag.variant.price.toLocaleString()}
                            </span>
                          </div>

                          {/* SKU & Color: Placed together (เส้นทึบ อยู่ตรงกลางพอดีระหว่างตัวอักษรบนและล่าง) */}
                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-solid border-stone-400 text-[8.5px] leading-tight text-black">
                            <div className="flex items-center gap-1.5">
                              <span className="tracking-tight truncate max-w-[85px] font-mono font-bold text-black">{tag.sku}</span>
                              {colorVal && (
                                <span className="font-sans font-black text-[11px] text-black mr-[1ch]">
                                  {colorVal}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopy(tag.sku)}
                                className="text-black hover:underline font-sans font-bold flex items-center gap-0.5 cursor-pointer text-[9px]"
                              >
                                {copiedSku === tag.sku ? '✓ คัดลอกแล้ว' : 'คัดลอก'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadSingle(tag)}
                                className="text-black hover:opacity-70 cursor-pointer"
                                title="บันทึกรูป PNG"
                              >
                                <Download className="w-2.5 h-2.5 text-black" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ));
              })
            )}
          </div>
        )}
      </div>

        {/* Action Buttons Toolbar */}
        <div className="pt-2.5 border-t border-amber-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-600 font-bold">
            ขนาด: <strong className="text-amber-950 font-black">{widthMm / 10} × {heightMm / 10} ซม.</strong>
            <span className="text-stone-400 mx-1">|</span>
            รวมป้าย: <strong className="text-amber-950 font-mono text-sm">{totalLabels}</strong> ใบ 
            <span className="text-stone-400 mx-1">|</span>
            พิมพ์ออก: <strong className="text-emerald-800 font-black">{estimatedSheets} {paperFormat === 'a4' ? `แผ่น A4 (แผ่นละ ${tagsPerA4Sheet} ป้าย)` : 'ดวง'}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-950 font-black rounded-xl text-xs transition cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={selectedTags.length === 0 || totalLabels === 0}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs shadow-md border border-amber-500 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95"
            >
              <Printer className="w-4 h-4 text-stone-950" />
              <span>🖨️ สั่งพิมพ์ป้าย {widthMm / 10}×{heightMm / 10} ซม. ({totalLabels} ป้าย - {estimatedSheets} {paperFormat === 'a4' ? 'แผ่น' : 'ดวง'})</span>
            </button>
          </div>
        </div>

      </div>

      {/* MODAL: CUSTOM TAG SIZE CREATOR / EDITOR */}
      {isCustomSizeModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-md w-full p-5 sm:p-6 text-stone-950 shadow-2xl space-y-4 text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2 text-stone-950">
                <div className="p-2 bg-amber-100 rounded-xl border border-amber-300">
                  <SlidersHorizontal className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base text-stone-950">
                    {editingCustomPreset ? 'แก้ไขขนาดป้ายสติ๊กเกอร์' : 'กำหนดขนาดป้ายเองใหม่ (Custom Size)'}
                  </h3>
                  <span className="text-[10px] text-stone-500 font-bold block">
                    ระบบจะจดจำขนาดนี้ไว้ให้เลือกใช้ได้ตลอดเวลา
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomSizeModalOpen(false)}
                className="text-stone-500 hover:text-stone-950 p-1 rounded-full border border-stone-300 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomSize} className="space-y-3.5">
              <div>
                <label className="block text-stone-950 font-black mb-1 text-xs">
                  ชื่อขนาดป้ายสติ๊กเกอร์ *
                </label>
                <input
                  type="text"
                  required
                  value={customSizeFormName}
                  onChange={(e) => setCustomSizeFormName(e.target.value)}
                  placeholder="เช่น ป้าย 6x3 ซม. หรือ ป้ายแท็กยาว"
                  className="w-full bg-white border-2 border-stone-300 rounded-xl p-2.5 text-stone-950 font-black text-xs focus:outline-none focus:border-amber-500 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-950 font-black mb-1 text-xs">
                    ความกว้าง (ซม.) *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="2"
                      max="20"
                      step="0.1"
                      required
                      value={customSizeFormWidth}
                      onChange={(e) => setCustomSizeFormWidth(parseFloat(e.target.value) || 2)}
                      className="w-full bg-white border-2 border-stone-300 rounded-xl p-2 text-stone-950 font-mono font-black text-center text-sm focus:outline-none focus:border-amber-500 shadow-inner"
                    />
                    <span className="text-xs font-bold text-stone-600 shrink-0">ซม.</span>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-950 font-black mb-1 text-xs">
                    ความสูง (ซม.) *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1.5"
                      max="20"
                      step="0.1"
                      required
                      value={customSizeFormHeight}
                      onChange={(e) => setCustomSizeFormHeight(parseFloat(e.target.value) || 1.5)}
                      className="w-full bg-white border-2 border-stone-300 rounded-xl p-2 text-stone-950 font-mono font-black text-center text-sm focus:outline-none focus:border-amber-500 shadow-inner"
                    />
                    <span className="text-xs font-bold text-stone-600 shrink-0">ซม.</span>
                  </div>
                </div>
              </div>

              {/* Preview Dimension Box */}
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 text-xs text-stone-800 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>ขนาดในหน่วยมิลลิเมตร (สำหรับเครื่องพิมพ์):</span>
                  <strong className="text-amber-950 font-mono">
                    {Math.round(customSizeFormWidth * 10)} × {Math.round(customSizeFormHeight * 10)} มม.
                  </strong>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span>การจัดวาง:</span>
                  <span className="font-bold text-stone-900">
                    {customSizeFormWidth >= customSizeFormHeight * 1.4 ? 'แนวนอน (Wide Side-by-Side)' : 'แนวตั้ง (Tall Stacked)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCustomSizeModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-950 font-black rounded-xl text-xs transition cursor-pointer"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs shadow-md border border-amber-500 transition cursor-pointer"
                >
                  {editingCustomPreset ? '✓ บันทึกการแก้ไข' : '✓ บันทึกขนาดและใช้งานทันที'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
