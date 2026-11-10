'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Tag,
  Printer,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  CheckCircle2,
  Calendar,
  Building2,
  Maximize2,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, ProductVariant, StockMovement } from '../../types';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { resolveScannedProduct } from '../../utils/qrUtils';
import { extractProductModelCode } from '../../utils/productUtils';
import { formatThaiDateOnly } from '../../utils/dateUtils';
import { ColorIndicator, getEffectiveVariantColor } from '../../utils/colorUtils';

interface LotSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQRLabel?: (product: Product, lotNumber?: string) => void;
  onSelectProductForPOS?: (product: Product, variant?: ProductVariant) => void;
}

export const LotSearchModal: React.FC<LotSearchModalProps> = ({
  isOpen,
  onClose,
  onOpenQRLabel,
  onSelectProductForPOS,
}) => {
  const { products, stockMovements, customOptions, formatPrice } = useShop();
  const [searchLotQuery, setSearchLotQuery] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Collect unique available lot numbers from stockMovements and custom options
  const availableLots = useMemo(() => {
    const lotSet = new Set<string>();
    if (Array.isArray(stockMovements)) {
      stockMovements.forEach((m) => {
        if (m.lotNumber && m.lotNumber.trim()) {
          lotSet.add(m.lotNumber.trim());
        }
      });
    }
    if (Array.isArray(customOptions?.lotNumbers)) {
      customOptions.lotNumbers.forEach((l) => {
        if (l && l.trim()) lotSet.add(l.trim());
      });
    }
    return Array.from(lotSet);
  }, [stockMovements, customOptions]);

  // Match products based on query
  const matchedResults = useMemo(() => {
    const q = searchLotQuery.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      product: Product;
      matchedLots: string[];
      recentMovements: StockMovement[];
      matchReason: string;
    }> = [];

    const matchedProdIds = new Set<string>();

    // 1. Check stockMovements for lotNumber match
    if (Array.isArray(stockMovements)) {
      stockMovements.forEach((m) => {
        if (!m.productId) return;
        const lot = (m.lotNumber || '').toLowerCase().trim();
        const lotMatches =
          lot && (lot === q || lot.includes(q) || q.includes(lot));

        if (lotMatches) {
          const prod = products.find((p) => p.id === m.productId);
          if (prod && !matchedProdIds.has(prod.id)) {
            matchedProdIds.add(prod.id);
            const prodMovements = stockMovements.filter((sm) => sm.productId === prod.id && sm.lotNumber);
            const lots = Array.from(new Set(prodMovements.map((sm) => sm.lotNumber as string)));
            results.push({
              product: prod,
              matchedLots: lots,
              recentMovements: prodMovements.slice(0, 3),
              matchReason: `ตรงกับเลขล็อตที่รับเข้า: "${m.lotNumber}"`,
            });
          }
        }
      });
    }

    // 2. Check QR / SKU resolver (e.g. HUDA-A005-1-69 or HUDA-A005)
    products.forEach((prod) => {
      if (matchedProdIds.has(prod.id)) return;

      const qrResolved = resolveScannedProduct(searchLotQuery, [prod]);
      if (qrResolved) {
        matchedProdIds.add(prod.id);
        const prodMovements = Array.isArray(stockMovements)
          ? stockMovements.filter((sm) => sm.productId === prod.id && sm.lotNumber)
          : [];
        const lots = Array.from(new Set(prodMovements.map((sm) => sm.lotNumber as string)));
        results.push({
          product: prod,
          matchedLots: lots.length > 0 ? lots : [qrResolved.lotNumber || q],
          recentMovements: prodMovements.slice(0, 3),
          matchReason: `ตรงกับรหัสแบบบาร์โค้ด: "${qrResolved.matchType}"`,
        });
        return;
      }

      // 3. Match Model Code from title (e.g. "A005" in "A005 ฟาราช่า")
      const modelCode = extractProductModelCode(prod.title, prod.id).toLowerCase();
      if (modelCode && (q.includes(modelCode) || modelCode.includes(q))) {
        matchedProdIds.add(prod.id);
        const prodMovements = Array.isArray(stockMovements)
          ? stockMovements.filter((sm) => sm.productId === prod.id && sm.lotNumber)
          : [];
        const lots = Array.from(new Set(prodMovements.map((sm) => sm.lotNumber as string)));
        results.push({
          product: prod,
          matchedLots: lots,
          recentMovements: prodMovements.slice(0, 3),
          matchReason: `ตรงกับรหัสแบบสินค้า: "${modelCode.toUpperCase()}"`,
        });
        return;
      }

      // 4. Match SKU on variants
      const hasSkuMatch = prod.variants.some(
        (v) => v.sku && v.sku.toLowerCase().includes(q)
      );
      if (hasSkuMatch) {
        matchedProdIds.add(prod.id);
        const prodMovements = Array.isArray(stockMovements)
          ? stockMovements.filter((sm) => sm.productId === prod.id && sm.lotNumber)
          : [];
        const lots = Array.from(new Set(prodMovements.map((sm) => sm.lotNumber as string)));
        results.push({
          product: prod,
          matchedLots: lots,
          recentMovements: prodMovements.slice(0, 3),
          matchReason: `ตรงกับรหัส SKU ของไซส์สินค้า`,
        });
        return;
      }

      // 5. Match Product Title / Keyword
      if (prod.title.toLowerCase().includes(q) || (prod.arabicTitle && prod.arabicTitle.toLowerCase().includes(q))) {
        matchedProdIds.add(prod.id);
        const prodMovements = Array.isArray(stockMovements)
          ? stockMovements.filter((sm) => sm.productId === prod.id && sm.lotNumber)
          : [];
        const lots = Array.from(new Set(prodMovements.map((sm) => sm.lotNumber as string)));
        results.push({
          product: prod,
          matchedLots: lots,
          recentMovements: prodMovements.slice(0, 3),
          matchReason: `ตรงกับชื่อแบบสินค้า`,
        });
      }
    });

    return results;
  }, [searchLotQuery, products, stockMovements]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-3xl w-full text-stone-950 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-4 sm:p-5 border-b-2 border-amber-600 flex items-center justify-between text-stone-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-stone-950 text-amber-300 flex items-center justify-center shadow-md shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/15 text-stone-900">
                ระบบกู้ข้อมูลป้ายสินค้าชำรุด
              </span>
              <h3 className="font-serif font-black text-lg sm:text-xl leading-tight mt-0.5">
                ค้นหาสินค้าจากเลขล็อต (Lot / Batch Finder)
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-stone-950 transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Search Input Box */}
          <div className="bg-amber-50/80 border-2 border-amber-400 rounded-2xl p-4 space-y-3">
            <label className="block text-xs font-black text-amber-950">
              พิมพ์เลขล็อตหรือรหัสที่ยังหลงเหลืออยู่บนป้ายชำรุด:
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                autoFocus
                value={searchLotQuery}
                onChange={(e) => setSearchLotQuery(e.target.value)}
                placeholder="เช่น 1-69, 2-69, A005, HUDA-A005-1-69, หรือรหัสล็อต..."
                className="w-full bg-white border-2 border-stone-400 rounded-xl py-3 pl-10 pr-24 text-sm font-mono font-black text-stone-950 placeholder-stone-400 focus:outline-none focus:border-amber-500 shadow-inner"
              />
              <Search className="w-4 h-4 text-amber-600 absolute left-3.5 pointer-events-none" />

              <div className="absolute right-2.5 flex items-center gap-1.5">
                {searchLotQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchLotQuery('')}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                    title="ล้างข้อความ"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <VoiceInputButton
                  onTranscript={(text) => setSearchLotQuery(text)}
                  className="scale-90"
                  title="พูดเลขล็อต เช่น หนึ่งขีดหกเก้า"
                />
              </div>
            </div>

            {/* Quick Available Lot Pills */}
            {availableLots.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-amber-900 block">
                  หรือกดเลือกเลขล็อตในระบบ:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {availableLots.map((lot) => (
                    <button
                      key={lot}
                      type="button"
                      onClick={() => setSearchLotQuery(lot)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black border transition cursor-pointer ${
                        searchLotQuery.trim().toLowerCase() === lot.toLowerCase()
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                          : 'bg-white hover:bg-amber-100 text-stone-800 border-amber-300'
                      }`}
                    >
                      🏷️ {lot}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {searchLotQuery.trim() !== '' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-stone-800">
                <span>
                  ผลการค้นหา: พบ <strong>{matchedResults.length}</strong> รายการสินค้าที่เกี่ยวข้อง
                </span>
              </div>

              {matchedResults.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-stone-200 space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                  <p className="font-serif font-black text-stone-900 text-base">
                    ไม่พบสินค้าที่ตรงกับเลขล็อต "{searchLotQuery}"
                  </p>
                  <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                    ลองพิมพ์เฉพาะตัวเลขสั้นๆ เช่น <strong>1-69</strong> หรือรหัสแบบ เช่น <strong>A005</strong> หรือตรวจดูว่าสินค้าชิ้นนี้เคยถูกบันทึกรับเข้าสต๊อกในระบบแล้วหรือยังครับ
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {matchedResults.map(({ product, matchedLots, recentMovements, matchReason }) => {
                    const totalStock = product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
                    const defaultImg = product.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=75&w=500&auto=format&fit=crop';
                    const modelCode = extractProductModelCode(product.title, product.id);

                    return (
                      <div
                        key={product.id}
                        className="bg-white border-2 border-amber-400/80 rounded-2xl p-4 shadow-md space-y-3 hover:border-amber-500 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-20 bg-stone-100 rounded-xl border border-stone-300 overflow-hidden shrink-0 group/img cursor-pointer">
                              <img
                                src={defaultImg}
                                alt={product.title}
                                onClick={() => setPreviewImage(defaultImg)}
                                className="w-full h-full object-contain p-1"
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewImage(defaultImg)}
                                className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white"
                                title="ดูภาพขยาย"
                              >
                                <Maximize2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="bg-amber-400 text-stone-950 font-serif font-black px-2 py-0.5 rounded-lg text-xs border border-amber-600">
                                  รหัสแบบ: {modelCode}
                                </span>
                                <span className="bg-emerald-100 text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded-lg text-[11px] font-black">
                                  สต๊อกรวม {totalStock} ชิ้น
                                </span>
                              </div>
                              <h4 className="font-serif font-black text-stone-950 text-sm sm:text-base leading-snug">
                                {product.title}
                              </h4>
                              <p className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>{matchReason}</span>
                              </p>
                            </div>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex items-center gap-2 flex-wrap shrink-0">
                            {onOpenQRLabel && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onOpenQRLabel(product, searchLotQuery || matchedLots[0] || '1-69');
                                }}
                                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md border border-amber-600 flex items-center gap-1.5 transition cursor-pointer"
                                title="เปิดหน้าต่างพิมพ์ป้ายบาร์โค้ดใหม่พร้อมเลขล็อตนี้ทันที"
                              >
                                <Printer className="w-4 h-4" />
                                <span>🏷️ พิมพ์ป้าย QR ใหม่</span>
                              </button>
                            )}

                            {onSelectProductForPOS && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onSelectProductForPOS(product);
                                }}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md border border-emerald-700 flex items-center gap-1.5 transition cursor-pointer"
                                title="เลือกสินค้านี้เข้าคิดเงินใน POS ทันที"
                              >
                                <ShoppingBag className="w-4 h-4" />
                                <span>🛒 ใส่ตะกร้า POS</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Variants and Sizes breakdown */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-black text-stone-700 block">
                            ไซส์และราคาขายหน้าร้าน:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {product.variants.map((v) => (
                              <div
                                key={v.id}
                                className={`p-2 rounded-xl border flex flex-col justify-between text-xs ${
                                  v.stockQuantity > 0
                                    ? 'bg-stone-50 border-stone-200 text-stone-950'
                                    : 'bg-stone-100 border-stone-200 text-stone-400'
                                }`}
                              >
                                <div className="font-bold truncate">{v.name}</div>
                                <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 mt-1 font-mono text-[11px]">
                                  <span className="font-black text-amber-900">฿{v.price.toLocaleString()}</span>
                                  <span className={v.stockQuantity > 0 ? 'text-emerald-700 font-black' : 'text-rose-600'}>
                                    {v.stockQuantity > 0 ? `เหลือ ${v.stockQuantity}` : 'หมด'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Stock IN movements info */}
                        {recentMovements.length > 0 && (
                          <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[11px] font-mono space-y-1 text-stone-800">
                            <span className="font-sans font-black text-stone-900 block">
                              📦 ข้อมูลประวัติการรับเข้าในล็อตนี้:
                            </span>
                            {recentMovements.map((rm) => (
                              <div key={rm.id} className="flex items-center justify-between gap-2 flex-wrap text-stone-700">
                                <span>🏷️ ล็อต: <strong>{rm.lotNumber}</strong> ({rm.variantName})</span>
                                <span>🏭 ซัพพลายเออร์: <strong>{rm.supplierName}</strong></span>
                                <span>📅 วันที่: <strong>{formatThaiDateOnly(rm.createdAt)}</strong></span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Educational Guide on Reading Damaged Tags */
            <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-5 space-y-3">
              <h4 className="font-serif font-black text-stone-900 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>คำแนะนำ: วิธีอ่านข้อมูลจากป้ายสินค้าที่ชำรุด</span>
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                ป้ายสินค้าของร้าน <strong>HUDA ABAYA</strong> ได้รับการออกแบบโครงสร้างมาตรฐานให้อ่านง่าย แม้ป้ายจะฉีกขาด:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-white p-3.5 rounded-xl border border-stone-300 space-y-1">
                  <span className="font-mono text-xs font-black text-amber-950 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 inline-block">
                    HUDA-A005-1-69
                  </span>
                  <p className="text-xs text-stone-700 font-bold mt-1">
                    ถ้าเห็นตัวอักษรหน้า เช่น <code className="text-amber-800 font-mono">A005</code>:
                  </p>
                  <p className="text-[11px] text-stone-500">
                    นั่นคือรหัสแบบสินค้า ให้พิมพ์ <strong>A005</strong> ลงในช่องค้นหาด้านบน จะเจอรุ่นชุดทันที
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-stone-300 space-y-1">
                  <span className="font-mono text-xs font-black text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 inline-block">
                    1-69 หรือ 2-69
                  </span>
                  <p className="text-xs text-stone-700 font-bold mt-1">
                    ถ้าเห็นตัวเลขท้าย เช่น <code className="text-emerald-800 font-mono">1-69</code>:
                  </p>
                  <p className="text-[11px] text-stone-500">
                    นั่นคือเลขล็อตสินค้า (ล็อต 1 ปี 2569) ให้พิมพ์ <strong>1-69</strong> ลงในช่องค้นหาด้านบนได้ทันที
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500 font-bold hidden sm:inline">
            💡 เมื่อเจอรุ่นสินค้าแล้ว สามารถสั่งพิมพ์ป้าย QR Code ใหม่มาติดแทนป้ายที่ชำรุดได้ทันที
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-900 font-black text-xs rounded-xl transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-lg w-full bg-white p-4 rounded-3xl shadow-2xl flex flex-col items-center space-y-3 border-2 border-amber-400">
            <div className="flex justify-between items-center w-full border-b pb-2">
              <span className="text-xs font-black text-stone-950">รูปภาพขยายสินค้า</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-full text-stone-600 hover:text-stone-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={previewImage} alt="ขยายรูปสินค้า" className="max-h-[70vh] object-contain rounded-xl" />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="w-full py-2 bg-amber-400 text-stone-950 font-black text-xs rounded-xl"
            >
              ปิดรูปภาพ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
