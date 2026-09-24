'use client';

import React, { useState } from 'react';
import { X, Star, ShoppingBag, Check, ShieldCheck, Ruler, Sparkles, AlertCircle, Truck, Palette } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useShop } from '../../context/ShopContext';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  abaya: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
  kaftan: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?q=80&w=1000&auto=format&fit=crop',
  perfume: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
  incense: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop',
  combo: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1000&auto=format&fit=crop',
  other: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
};

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useShop();

  const defaultImg = DEFAULT_CATEGORY_IMAGES[product.category] || DEFAULT_CATEGORY_IMAGES.abaya;
  const initialImg = (product.images && product.images.length > 0 && product.images[0] && typeof product.images[0] === 'string' && product.images[0].trim() !== '')
    ? product.images[0]
    : defaultImg;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [selectedImage, setSelectedImage] = useState<string>(initialImg);
  const [quantity, setQuantity] = useState<number>(1);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  const handleAddToCart = () => {
    if (selectedVariant.stockQuantity < quantity) {
      alert(`ขออภัยค่ะ สินค้าไซส์ ${selectedVariant.name} มีสต๊อกคงเหลือเพียง ${selectedVariant.stockQuantity} ชิ้น`);
      return;
    }
    addToCart(product, selectedVariant, quantity);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-dubai-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-dubai-card border-2 border-gold-400/50 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl text-white my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-dubai-black/80 text-gold-400 hover:text-white p-2 rounded-full border border-gold-400/40 transition"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-gold-400/30 bg-dubai-black">
              <img
                src={selectedImage}
                alt={product.title}
                onError={() => {
                  if (selectedImage !== defaultImg) {
                    setSelectedImage(defaultImg);
                  }
                }}
                className="w-full h-full object-cover object-center"
              />
              {product.onSale && (
                <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  ลดพิเศษ {product.discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnail switcher */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                      selectedImage === img ? 'border-gold-400 scale-105' : 'border-gold-400/20 opacity-70'
                    }`}
                  >
                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Specs & Size/Color Variant Selection */}
          <div className="md:col-span-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-gold-400">
                <span className="uppercase font-serif tracking-wider font-semibold">
                  HUDA ABAYA DUBAI • {product.origin || 'Imported UAE'}
                </span>
                <div className="flex items-center gap-1 bg-dubai-black px-2.5 py-1 rounded-full border border-gold-400/30">
                  <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                  <span className="font-bold text-white">{product.rating}</span>
                  <span className="text-gray-400 text-[10px]">({product.reviewsCount} รีวิว)</span>
                </div>
              </div>

              {/* Title & Arabic */}
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-sky-100 leading-tight">
                {product.title}
              </h2>
              {product.arabicTitle && (
                <p className="text-sm font-serif text-gold-400/80 dir-rtl">
                  {product.arabicTitle}
                </p>
              )}

              {/* Colors Available Badge */}
              {product.colors && product.colors.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-xs text-sky-300 font-bold flex items-center gap-1 bg-dubai-black px-2.5 py-1 rounded-full border border-gold-400/30">
                    <Palette className="w-3.5 h-3.5 text-gold-400" />
                    <span>ตัวเลือกสี: {product.colors.join(', ')}</span>
                  </span>
                </div>
              )}

              {/* Description */}
              <p className="text-xs text-gray-300 leading-relaxed border-t border-gold-400/10 pt-2">
                {product.description}
              </p>

              {/* Fabric Specs */}
              {product.fabric && (
                <div className="bg-dubai-black/60 p-2.5 rounded-lg border border-gold-400/20 text-xs flex items-center justify-between">
                  <span className="text-gold-300 font-medium">เนื้อผ้า (Fabric):</span>
                  <span className="text-white font-semibold">{product.fabric}</span>
                </div>
              )}

              {/* Fragrance Notes (For Perfumes) */}
              {product.fragranceNotes && (
                <div className="bg-dubai-black/70 p-3 rounded-lg border border-gold-400/30 text-xs space-y-1.5">
                  <p className="font-serif font-bold text-gold-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Fragrance Pyramid Notes:
                  </p>
                  <p className="text-gray-300"><span className="text-gold-300">Top Note:</span> {product.fragranceNotes.top}</p>
                  <p className="text-gray-300"><span className="text-gold-300">Heart Note:</span> {product.fragranceNotes.heart}</p>
                  <p className="text-gray-300"><span className="text-gold-300">Base Note:</span> {product.fragranceNotes.base}</p>
                </div>
              )}

              {/* Size & Color Variant Picker Header */}
              <div className="pt-2 border-t border-gold-400/20">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-serif font-bold text-gold-300 uppercase tracking-wider flex items-center gap-1">
                    <span>เลือกสีและไซส์สินค้า:</span>
                  </label>
                  {(product.category === 'abaya' || product.category === 'kaftan') && (
                    <button
                      onClick={() => setShowSizeGuide(!showSizeGuide)}
                      className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 underline"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>ตารางเทียบไซส์ (Size Guide)</span>
                    </button>
                  )}
                </div>

                {/* Variant Options Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant.id === v.id;
                    const isOutOfStock = v.stockQuantity <= 0;

                    return (
                      <button
                        key={v.id}
                        disabled={isOutOfStock}
                        onClick={() => {
                          setSelectedVariant(v);
                          setQuantity(1);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between relative ${
                          isSelected
                            ? 'bg-gold-500/20 border-gold-400 text-gold-200 ring-1 ring-gold-400 shadow-gold-glow'
                            : isOutOfStock
                            ? 'bg-dubai-black/40 border-red-900/40 text-gray-500 cursor-not-allowed opacity-60'
                            : 'bg-dubai-black border-gold-400/20 text-gray-200 hover:border-gold-400/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{v.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-gold-400" />}
                        </div>
                        
                        {v.color && (
                          <span className="text-[10px] text-sky-300 block font-serif mt-0.5">
                            {v.color}
                          </span>
                        )}

                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-gold-400/10">
                          <span className="text-xs font-serif font-semibold text-gold-300">
                            ฿{v.price.toLocaleString()}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              isOutOfStock
                                ? 'bg-red-950 text-red-400'
                                : v.stockQuantity <= 3
                                ? 'bg-sky-950 text-sky-300'
                                : 'bg-emerald-950 text-emerald-300'
                            }`}
                          >
                            {isOutOfStock ? 'สินค้าหมด' : `คงเหลือ ${v.stockQuantity}`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Picker & Pricing Summary */}
              <div className="pt-2 flex items-center justify-between bg-dubai-black/60 p-3 rounded-xl border border-gold-400/20">
                <div>
                  <span className="text-[11px] text-gray-400 block">ราคาสินค้า (ตัวเลือกที่เลือก):</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-serif font-extrabold text-gold-400">
                      ฿{(selectedVariant.price * quantity).toLocaleString()}
                    </span>
                    {selectedVariant.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ฿{(selectedVariant.originalPrice * quantity).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center border border-gold-400/40 rounded-lg overflow-hidden bg-dubai-dark">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 text-gold-400 hover:bg-gold-500/20 transition text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-xs font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedVariant.stockQuantity, quantity + 1))}
                    disabled={quantity >= selectedVariant.stockQuantity}
                    className="px-3 py-1.5 text-gold-400 hover:bg-gold-500/20 transition text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                disabled={selectedVariant.stockQuantity <= 0}
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg ${
                  addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : selectedVariant.stockQuantity > 0
                    ? 'bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 text-stone-950 font-black hover:shadow-gold-strong shadow-gold-glow cursor-pointer'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>เพิ่มเข้าตะกร้าสินค้าสำเร็จ!</span>
                  </>
                ) : selectedVariant.stockQuantity > 0 ? (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>เพิ่มเข้าตะกร้าสั่งซื้อ (฿{(selectedVariant.price * quantity).toLocaleString()})</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    <span>สินค้าตัวเลือกนี้หมดชั่วคราว</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-gold-300/70 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-400" /> นำเข้าดูไบ 100%
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-gold-400" /> จัดส่งฟรีเมื่อครบ 2,000.-
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Size Guide Modal Overlay */}
        {showSizeGuide && (
          <div className="absolute inset-0 bg-dubai-black/95 z-30 p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gold-400/30 pb-3 mb-4">
                <h3 className="font-serif text-lg font-bold text-gold-400 flex items-center gap-2">
                  <Ruler className="w-5 h-5" />
                  <span>ตารางเทียบขนาดมาตรฐานชุดอาบายะห์ (Standard Abaya Size Chart)</span>
                </h3>
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="text-gold-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-300 mb-4">
                ชุดอาบายะห์เน้นการสวมใส่ที่พริ้วไหว สบาย ไม่รัดรูป ขนาดไซส์อิงตามความสูงและรอบอกเป็นหลัก:
              </p>

              <div className="overflow-x-auto border border-gold-400/30 rounded-xl mb-4">
                <table className="w-full text-xs text-left text-gray-200">
                  <thead className="bg-dubai-black text-gold-400 font-serif">
                    <tr>
                      <th className="p-3 border-b border-gold-400/30">ไซส์ดูไบ (Size)</th>
                      <th className="p-3 border-b border-gold-400/30">ความสูงที่แนะนำ (Height)</th>
                      <th className="p-3 border-b border-gold-400/30">ความยาวชุด (Length)</th>
                      <th className="p-3 border-b border-gold-400/30">รอบอกที่แนะนำ (Bust)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-400/10 font-mono">
                    <tr className="bg-gold-500/10">
                      <td className="p-3 font-bold text-gold-300">Size 52</td>
                      <td className="p-3 font-bold text-emerald-400">~150 - 155 ซม.</td>
                      <td className="p-3">52 นิ้ว (132 ซม.)</td>
                      <td className="p-3">36" - 38"</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-gold-300">Size 54</td>
                      <td className="p-3 font-bold text-emerald-400">~155 - 160 ซม.</td>
                      <td className="p-3">54 นิ้ว (137 ซม.)</td>
                      <td className="p-3">38" - 40"</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-gold-300">Size 56</td>
                      <td className="p-3 font-bold text-emerald-400">~160 - 165 ซม.</td>
                      <td className="p-3">56 นิ้ว (142 ซม.)</td>
                      <td className="p-3">40" - 42"</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-gold-300">Size 58</td>
                      <td className="p-3 font-bold text-emerald-400">~165 - 170 ซม.</td>
                      <td className="p-3">58 นิ้ว (147 ซม.)</td>
                      <td className="p-3">42" - 44"</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={() => setShowSizeGuide(false)}
              className="w-full py-2.5 bg-gold-500 text-dubai-black font-bold text-xs rounded-xl"
            >
              เข้าใจแล้ว ปิดตารางไซส์
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
