'use client';

import React, { useState } from 'react';
import { Star, Eye, ShoppingBag, Sparkles, Tag, Layers, Box } from 'lucide-react';
import { Product } from '../../types';
import { ProductModal } from './ProductModal';
import { useShop } from '../../context/ShopContext';

interface ProductCardProps {
  product: Product;
}

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  abaya: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
  kaftan: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?q=80&w=1000&auto=format&fit=crop',
  perfume: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
  incense: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop',
  combo: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1000&auto=format&fit=crop',
  other: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { formatPrice, setActive3DProduct } = useShop();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate price range & total stock across sizes
  const prices = product.variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);

  const defaultImg = DEFAULT_CATEGORY_IMAGES[product.category] || DEFAULT_CATEGORY_IMAGES.abaya;
  const initialImg = (product.images && product.images.length > 0 && product.images[0] && typeof product.images[0] === 'string' && product.images[0].trim() !== '')
    ? product.images[0]
    : defaultImg;

  const [imgSrc, setImgSrc] = useState<string>(initialImg);

  return (
    <>
      <div className="group bg-white border border-[#E8E3DA] rounded-lg overflow-hidden hover:border-[#B89352] shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5">
        
        {/* Image Frame */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F3EF] cursor-pointer" onClick={() => setIsModalOpen(true)}>
          <img
            src={imgSrc}
            alt={product.title}
            onError={() => {
              if (imgSrc !== defaultImg) {
                setImgSrc(defaultImg);
              }
            }}
            className="w-full h-full object-cover object-center transform transition duration-500 group-hover:scale-105"
          />
          
          {/* Subtle image Overlay on Hover */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition duration-300" />

          {/* Badges - Subtle & Clean */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {product.onSale && product.discountPercent && (
              <span className="bg-[#B89352] text-white text-[10px] font-medium px-2 py-0.5 rounded-xs tracking-wider">
                -{product.discountPercent}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-[#1C1917] text-white text-[9px] font-medium px-2 py-0.5 rounded-xs uppercase tracking-wider">
                NEW ARRIVAL
              </span>
            )}
          </div>

          {/* Stock & 3D Interactive Badge */}
          <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1">
            {totalStock > 0 ? (
              <span className="bg-white/90 text-stone-800 text-[10px] font-medium px-2 py-0.5 rounded-xs border border-stone-200">
                พร้อมส่ง ({totalStock})
              </span>
            ) : (
              <span className="bg-stone-100 text-stone-500 text-[10px] font-medium px-2 py-0.5 rounded-xs border border-stone-200">
                สินค้าหมด
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActive3DProduct(product);
              }}
              className="bg-white/90 hover:bg-[#1C1917] hover:text-white text-stone-700 text-[10px] font-medium px-2 py-0.5 rounded-xs border border-stone-200 flex items-center gap-1 transition"
              title="ดูมุมมอง 3 มิติ 360°"
            >
              <Box className="w-3 h-3 text-[#B89352]" />
              <span>3D</span>
            </button>
          </div>

          {/* Quick View Button on Hover */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="w-full bg-[#1C1917]/90 hover:bg-[#1C1917] text-white font-medium text-xs py-2 rounded transition shadow-md flex items-center justify-center gap-1.5 backdrop-blur-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>ดูรายละเอียด</span>
            </button>
          </div>
        </div>

        {/* Product Details Info */}
        <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between bg-white text-[#0A0A0A]">
          <div>
            {/* Category / Rating */}
            <div className="flex items-center justify-between text-[11px] font-serif mb-1">
              <span className="uppercase tracking-widest text-[10px] font-bold text-amber-900">
                {product.category === 'abaya' && 'ชุดอาบายะห์ดูไบ'}
                {product.category === 'kaftan' && 'ชุดคัฟทาน'}
                {product.category === 'perfume' && 'น้ำหอมดูไบ'}
                {product.category === 'incense' && 'เครื่องหอมดูไบ'}
                {product.category === 'combo' && 'เซ็ตของขวัญพิเศษ'}
                {product.category === 'other' && 'สินค้าทั่วไป'}
              </span>
              <div className="flex items-center gap-1 text-amber-700">
                <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                <span className="font-extrabold text-[#0A0A0A] text-[11px]">{product.rating}</span>
              </div>
            </div>

            {/* Product Title */}
            <h3
              onClick={() => setIsModalOpen(true)}
              className="text-sm font-serif font-extrabold text-[#0A0A0A] group-hover:text-amber-900 transition-colors line-clamp-2 cursor-pointer leading-snug"
            >
              {product.title}
            </h3>

            {/* Arabic Title */}
            {product.arabicTitle && (
              <p className="text-[11px] font-serif text-amber-900 dir-rtl mt-0.5 font-bold">
                {product.arabicTitle}
              </p>
            )}

            {/* Size Variants Display */}
            <div className="mt-2 flex items-center gap-1 flex-wrap">
              {product.variants.map((v) => (
                <span
                  key={v.id}
                  className={`text-[10px] px-1.5 py-0.5 rounded-xs border font-bold ${
                    v.stockQuantity > 0
                      ? 'bg-stone-100 border-stone-300 text-stone-900'
                      : 'bg-stone-50 border-stone-200 text-stone-400 line-through'
                  }`}
                  title={`${v.name} (สต๊อก ${v.stockQuantity})`}
                >
                  {v.name.replace('Size ', 'S')}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing & Order Action */}
          <div className="pt-2.5 border-t border-stone-200 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-serif font-extrabold text-[#0A0A0A]">
                  {formatPrice(minPrice)}
                </span>
                {maxPrice > minPrice && (
                  <span className="text-xs text-stone-700 font-serif font-bold">
                    - {formatPrice(maxPrice)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#0A0A0A] hover:bg-amber-800 text-white font-bold text-xs px-3.5 py-1.5 rounded transition flex items-center gap-1 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>สั่งซื้อ</span>
            </button>
          </div>

        </div>

      </div>

      {/* Product Detail Modal */}
      {isModalOpen && (
        <ProductModal product={product} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};
