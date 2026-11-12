'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, ShieldCheck, Ruler, AlertCircle, Truck, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Play, Video, Film, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useShop } from '../../context/ShopContext';
import { ColorIndicator } from '../../utils/colorUtils';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  abaya: '/images/placeholder-abaya.jpg',
  kaftan: '/images/placeholder-abaya.jpg',
  perfume: '/images/placeholder-perfume.jpg',
  incense: '/images/placeholder-incense.jpg',
  combo: '/images/placeholder-abaya.jpg',
  other: '/images/placeholder-abaya.jpg',
};

const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1`;
    }
  } catch {
    return null;
  }
  return null;
};

export const ProductModal: React.FC<ProductModalProps> = ({ product: initialProduct, onClose }) => {
  const { products, addToCart } = useShop();
  // Always derive live product from ShopContext so stock updates instantly in realtime!
  const product = products.find((p) => p.id === initialProduct.id) || initialProduct;
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const defaultImg = DEFAULT_CATEGORY_IMAGES[product.category] || DEFAULT_CATEGORY_IMAGES.abaya;
  const initialImg =
    product.images &&
    product.images.length > 0 &&
    product.images[0] &&
    typeof product.images[0] === 'string' &&
    product.images[0].trim() !== ''
      ? product.images[0]
      : defaultImg;

  const [selectedVariantId, setSelectedVariantId] = useState<string>(initialProduct.variants[0]?.id || '');
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const [selectedImage, setSelectedImage] = useState<string>(initialImg);
  const [mediaTab, setMediaTab] = useState<'image' | 'video'>('image');
  const [quantity, setQuantity] = useState<number>(1);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const [showLoupe, setShowLoupe] = useState<boolean>(false);
  const [loupePos, setLoupePos] = useState<{ x: number; y: number; xPercent: number; yPercent: number }>({
    x: 0,
    y: 0,
    xPercent: 50,
    yPercent: 50,
  });

  const handlePointerMove = (x: number, y: number, rect: DOMRect) => {
    const xClamped = Math.max(0, Math.min(rect.width, x));
    const yClamped = Math.max(0, Math.min(rect.height, y));
    const xPercent = (xClamped / rect.width) * 100;
    const yPercent = (yClamped / rect.height) * 100;
    setLoupePos({ x: xClamped, y: yClamped, xPercent, yPercent });
  };

  const handleFullscreenPointerMove = (clientX: number, clientY: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const xPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));
    setZoomOrigin({ x: xPercent, y: yPercent });
  };

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
    }, 900);
  };

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative bg-white border border-stone-200 max-w-4xl w-full overflow-hidden shadow-2xl text-[#141312] my-3 sm:my-8 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-50 bg-white/95 hover:bg-[#141312] text-[#141312] hover:text-white p-2.5 border border-stone-200 transition cursor-pointer"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Column: Portrait Gallery & Advertising Video */}
          <div className="md:col-span-6 bg-[#F7F5F0] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200/80">
            {product.videoUrl && (
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setMediaTab('image')}
                  className={`flex-1 py-2 px-3 text-xs font-serif tracking-wider uppercase transition flex items-center justify-center gap-2 border cursor-pointer ${
                    mediaTab === 'image'
                      ? 'bg-[#141312] text-white border-[#141312] shadow-sm font-semibold'
                      : 'bg-white/90 text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>ภาพถ่าย Ultra HD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTab('video')}
                  className={`flex-1 py-2 px-3 text-xs font-serif tracking-wider uppercase transition flex items-center justify-center gap-2 border cursor-pointer ${
                    mediaTab === 'video'
                      ? 'bg-[#8C703E] text-white border-[#8C703E] shadow-sm font-semibold'
                      : 'bg-white/90 text-[#8C703E] border-[#8C703E]/50 hover:bg-amber-50'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>🎬 วิดีโอโฆษณา / รีวิว</span>
                </button>
              </div>
            )}

            {mediaTab === 'video' && product.videoUrl ? (
              <div className="relative aspect-[4/5] overflow-hidden bg-black border border-stone-200/60 flex items-center justify-center">
                {getYouTubeEmbedUrl(product.videoUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(product.videoUrl)!}
                    title={`${product.title} Video Review`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={product.videoUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  >
                    บราวเซอร์ของคุณไม่รองรับการเล่นวิดีโอ กรุณาเปิดลิงก์โดยตรง
                  </video>
                )}
                <a
                  href={product.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white/90 px-2 py-1 rounded text-[10px] flex items-center gap-1 transition z-10"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>เปิดเต็มจอ</span>
                </a>
              </div>
            ) : (
              <div
                className="relative aspect-[4/5] overflow-hidden bg-white border border-stone-200/60 cursor-crosshair group select-none"
                onMouseEnter={() => setShowLoupe(true)}
                onMouseLeave={() => setShowLoupe(false)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  handlePointerMove(e.clientX - rect.left, e.clientY - rect.top, rect);
                }}
                onClick={() => {
                  setZoomScale(1);
                  setIsZoomOpen(true);
                }}
              >
                <img
                  src={selectedImage}
                  alt={product.title}
                  onError={() => {
                    if (selectedImage !== defaultImg) {
                      setSelectedImage(defaultImg);
                    }
                  }}
                  className="w-full h-full object-contain object-center transition duration-500 p-3"
                />

                {product.onSale && product.discountPercent && (
                  <span className="absolute top-3 left-3 bg-[#8C703E] text-white text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 z-10">
                    -{product.discountPercent}%
                  </span>
                )}

                {/* Subtle Magnifying Loupe */}
                {showLoupe && (
                  <div
                    style={{
                      top: `${loupePos.y - 70}px`,
                      left: `${loupePos.x - 70}px`,
                      backgroundImage: `url(${selectedImage})`,
                      backgroundPosition: `${loupePos.xPercent}% ${loupePos.yPercent}%`,
                      backgroundSize: '360%',
                    }}
                    className="hidden sm:block absolute w-36 h-36 rounded-full border-2 border-[#141312] shadow-xl pointer-events-none z-30 bg-no-repeat bg-white"
                  />
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomScale(1);
                    setIsZoomOpen(true);
                  }}
                  className="absolute bottom-3 right-3 bg-white/90 hover:bg-[#141312] hover:text-white text-[#141312] px-3 py-1.5 border border-stone-200 text-[10px] tracking-widest uppercase transition flex items-center gap-1.5 cursor-pointer z-10"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>ขยายภาพ</span>
                </button>
              </div>
            )}

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pt-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage(img);
                      setMediaTab('image');
                    }}
                    className={`w-16 h-20 overflow-hidden border transition shrink-0 bg-white ${
                      mediaTab === 'image' && selectedImage === img ? 'border-[#141312]' : 'border-stone-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Editorial Specifications & Variant Selection */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
            <div className="space-y-5">
              
              {/* Eyebrow */}
              <div className="text-[10px] font-serif tracking-[0.22em] uppercase text-[#8C703E]">
                HUDA ABAYA DUBAI • {product.origin || 'IMPORTED UAE'}
              </div>

              {/* Product Title & Price */}
              <div className="space-y-2 border-b border-stone-200 pb-4">
                <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#141312] leading-snug">
                  {product.title}
                </h2>
                {product.arabicTitle && (
                  <p className="text-xs font-serif text-[#8C703E] dir-rtl">
                    {product.arabicTitle}
                  </p>
                )}

                <div className="pt-2 flex items-baseline gap-3">
                  <span className="text-2xl font-serif font-semibold text-[#141312]">
                    ฿{(selectedVariant.price * quantity).toLocaleString()}
                  </span>
                  {selectedVariant.originalPrice && (
                    <span className="text-xs text-stone-400 line-through">
                      ฿{(selectedVariant.originalPrice * quantity).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-light">
                {product.description}
              </p>

              {/* Fabric & Color Specs */}
              {(product.fabric || (product.colors && product.colors.length > 0)) && (
                <div className="space-y-2 pt-1 text-xs border-t border-stone-100">
                  {product.fabric && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-stone-500">เนื้อผ้า (Material):</span>
                      <span className="text-[#141312] font-medium">{product.fabric}</span>
                    </div>
                  )}
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex items-center justify-between py-1 flex-wrap gap-2">
                      <span className="text-stone-500">โทนสี (Colorway):</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {product.colors.map((c, idx) => (
                          <span key={idx} className="text-xs text-[#141312]">
                            <ColorIndicator color={c} dotClassName="w-2.5 h-2.5" />
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Fragrance Notes */}
              {product.fragranceNotes && (
                <div className="bg-[#FAF9F6] p-3.5 border border-stone-200/80 text-xs space-y-1">
                  <p className="font-serif text-[11px] tracking-widest uppercase text-[#8C703E] mb-1">
                    OLFACTORY NOTES
                  </p>
                  <p className="text-stone-600"><span className="text-[#141312] font-medium">Top:</span> {product.fragranceNotes.top}</p>
                  <p className="text-stone-600"><span className="text-[#141312] font-medium">Heart:</span> {product.fragranceNotes.heart}</p>
                  <p className="text-stone-600"><span className="text-[#141312] font-medium">Base:</span> {product.fragranceNotes.base}</p>
                </div>
              )}

              {/* Variant Selector */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-serif tracking-[0.15em] uppercase text-[#141312] font-medium">
                    เลือกขนาด / ตัวเลือก ({selectedVariant.name})
                  </label>
                  {(product.category === 'abaya' || product.category === 'kaftan') && (
                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(!showSizeGuide)}
                      className="text-xs text-[#8C703E] hover:text-[#141312] flex items-center gap-1 underline cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>ตารางเทียบไซส์</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant.id === v.id;
                    const isOutOfStock = v.stockQuantity <= 0;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          setQuantity(1);
                        }}
                        className={`p-3 border text-left transition flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'border-[#141312] bg-[#FAF9F6]'
                            : isOutOfStock
                            ? 'border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed opacity-60'
                            : 'border-stone-200 bg-white hover:border-stone-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#141312]">{v.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#141312]" />}
                        </div>

                        {v.color && (
                          <span className="text-[10px] text-stone-600 block mt-0.5">
                            <ColorIndicator color={v.color} dotClassName="w-2.5 h-2.5" />
                          </span>
                        )}

                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-100 text-[11px]">
                          <span className="font-serif text-[#141312]">฿{v.price.toLocaleString()}</span>
                          <span className={isOutOfStock ? 'text-stone-400' : 'text-[#8C703E]'}>
                            {isOutOfStock ? 'หมด' : `มี ${v.stockQuantity}`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-stone-600">จำนวนที่ต้องการ:</span>
                <div className="flex items-center border border-stone-300 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3.5 py-1.5 text-sm text-[#141312] hover:bg-stone-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-medium text-[#141312] border-x border-stone-200">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(selectedVariant.stockQuantity, quantity + 1))}
                    disabled={quantity >= selectedVariant.stockQuantity}
                    className="px-3.5 py-1.5 text-sm text-[#141312] hover:bg-stone-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Primary CTA */}
            <div className="space-y-3 pt-4 border-t border-stone-200">
              <button
                type="button"
                disabled={selectedVariant.stockQuantity <= 0}
                onClick={handleAddToCart}
                className={`w-full py-4 text-xs tracking-[0.2em] uppercase font-medium transition flex items-center justify-center gap-2 ${
                  addedSuccess
                    ? 'bg-emerald-800 text-white'
                    : selectedVariant.stockQuantity > 0
                    ? 'bg-[#141312] hover:bg-[#292624] text-white cursor-pointer'
                    : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>เพิ่มลงในถุงช็อปปิ้งแล้ว</span>
                  </>
                ) : selectedVariant.stockQuantity > 0 ? (
                  <span>เพิ่มลงในถุงช็อปปิ้ง — ฿{(selectedVariant.price * quantity).toLocaleString()}</span>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>สินค้าหมดชั่วคราว</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-6 text-[11px] text-stone-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8C703E]" /> สินค้านำเข้าจากดูไบ UAE
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#8C703E]" /> จัดส่งฟรีเมื่อช็อปครบ ฿2,000
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Size Guide Overlay */}
        {showSizeGuide && (
          <div className="absolute inset-0 bg-white z-30 p-6 sm:p-10 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
                <div>
                  <p className="text-[10px] font-serif tracking-[0.22em] uppercase text-[#8C703E]">
                    SIZE SPECIFICATIONS
                  </p>
                  <h3 className="font-serif text-lg sm:text-xl text-[#141312] mt-1">
                    ตารางเทียบขนาดมาตรฐานชุดอาบายะห์ดูไบ
                  </h3>
                </div>
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="text-stone-500 hover:text-[#141312] p-2 border border-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-stone-600 mb-6">
                ขนาดของชุดอาบายะห์ดูไบวัดจากความยาวชุดเป็นนิ้ว (52–58) โดยอ้างอิงตามส่วนสูงของผู้สวมใส่เป็นหลัก:
              </p>

              <div className="overflow-x-auto border border-stone-200">
                <table className="w-full text-xs text-left text-[#141312]">
                  <thead className="bg-[#FAF9F6] text-stone-600 font-serif border-b border-stone-200">
                    <tr>
                      <th className="p-3.5 font-medium">ขนาด (Size)</th>
                      <th className="p-3.5 font-medium">ส่วนสูงที่แนะนำ</th>
                      <th className="p-3.5 font-medium">ความยาวชุด</th>
                      <th className="p-3.5 font-medium">รอบอก</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    <tr>
                      <td className="p-3.5 font-medium">Size 52</td>
                      <td className="p-3.5">150 – 155 ซม.</td>
                      <td className="p-3.5">52 นิ้ว (132 ซม.)</td>
                      <td className="p-3.5">38 – 42 นิ้ว</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium">Size 54</td>
                      <td className="p-3.5">156 – 160 ซม.</td>
                      <td className="p-3.5">54 นิ้ว (137 ซม.)</td>
                      <td className="p-3.5">40 – 44 นิ้ว</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium">Size 56</td>
                      <td className="p-3.5">161 – 166 ซม.</td>
                      <td className="p-3.5">56 นิ้ว (142 ซม.)</td>
                      <td className="p-3.5">42 – 46 นิ้ว</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium">Size 58</td>
                      <td className="p-3.5">167 – 173 ซม.</td>
                      <td className="p-3.5">58 นิ้ว (147 ซม.)</td>
                      <td className="p-3.5">44 – 48 นิ้ว</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={() => setShowSizeGuide(false)}
              className="w-full py-3.5 bg-[#141312] text-white text-xs tracking-[0.2em] uppercase mt-6 cursor-pointer"
            >
              ปิดตารางเทียบขนาด
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-between p-4">
          <div className="flex items-center justify-between text-white border-b border-white/15 pb-3 z-10">
            <span className="text-xs sm:text-sm font-serif tracking-wide text-stone-200">
              {product.title}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomScale((s) => Math.min(s + 0.5, 3.5))}
                className="p-2 bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="ซูมเข้า"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomScale((s) => Math.max(s - 0.5, 1))}
                className="p-2 bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="ซูมออก"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomScale(1)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="รีเซ็ต"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsZoomOpen(false);
                  setZoomScale(1);
                }}
                className="p-2 bg-white text-[#141312] transition cursor-pointer ml-2"
                title="ปิด"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 flex items-center justify-center overflow-hidden my-2">
            {product.images.length > 1 && (
              <button
                onClick={() => {
                  const currentIdx = product.images.indexOf(selectedImage);
                  const prevIdx = currentIdx > 0 ? currentIdx - 1 : product.images.length - 1;
                  setSelectedImage(product.images[prevIdx]);
                }}
                className="absolute left-3 z-20 p-3 bg-white/10 hover:bg-white/25 text-white transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <div
              className="w-full h-full flex items-center justify-center overflow-auto p-2 cursor-crosshair select-none"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                handleFullscreenPointerMove(e.clientX, e.clientY, rect);
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                handleFullscreenPointerMove(e.clientX, e.clientY, rect);
                setZoomScale((s) => (s >= 2.5 ? 1 : Math.min(s + 0.75, 3.5)));
              }}
            >
              <img
                src={selectedImage}
                alt={product.title}
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                }}
                className="max-h-[82vh] max-w-[92vw] object-contain transition-transform duration-200"
              />
            </div>

            {product.images.length > 1 && (
              <button
                onClick={() => {
                  const currentIdx = product.images.indexOf(selectedImage);
                  const nextIdx = currentIdx < product.images.length - 1 ? currentIdx + 1 : 0;
                  setSelectedImage(product.images[nextIdx]);
                }}
                className="absolute right-3 z-20 p-3 bg-white/10 hover:bg-white/25 text-white transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

