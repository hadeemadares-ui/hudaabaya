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
      <div className="group bg-white border border-amber-300/60 rounded-2xl overflow-hidden hover:border-amber-400 shadow-md hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500 flex flex-col justify-between hover:-translate-y-1">
        
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-amber-50/50 cursor-pointer" onClick={() => setIsModalOpen(true)}>
          <img
            src={imgSrc}
            alt={product.title}
            onError={() => {
              if (imgSrc !== defaultImg) {
                setImgSrc(defaultImg);
              }
            }}
            className="w-full h-full object-cover object-center transform transition duration-700 group-hover:scale-105"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.onSale && product.discountPercent && (
              <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                ลด {product.discountPercent}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                HAUTE COUTURE
              </span>
            )}
          </div>

          {/* Stock & 3D Badges */}
          <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
            {totalStock > 0 ? (
              <span className="bg-white/90 backdrop-blur-md border border-amber-300 text-amber-900 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                พร้อมส่ง (สต๊อก {totalStock})
              </span>
            ) : (
              <span className="bg-red-50 border border-red-300 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                สินค้าหมด
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActive3DProduct(product);
              }}
              className="bg-white/90 hover:bg-amber-400 hover:text-slate-950 border border-amber-300 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm transition"
              title="ดูมุมมอง 3 มิติ 360°"
            >
              <Box className="w-3 h-3 animate-spin text-amber-600" />
              <span>3D Hologram</span>
            </button>
          </div>

          {/* Quick View Button on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-full shadow-md flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition duration-300 border border-amber-300"
            >
              <Eye className="w-4 h-4" />
              <span>ดูรายละเอียด & เลือกไซส์</span>
            </button>
          </div>
        </div>

        {/* Product Details Info */}
        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-slate-900">
          <div>
            {/* Category / Rating */}
            <div className="flex items-center justify-between text-[11px] text-amber-800 font-medium mb-1">
              <span className="uppercase font-semibold tracking-wider">
                {product.category === 'abaya' && 'ชุดอาบายะห์ดูไบ'}
                {product.category === 'kaftan' && 'ชุดคัฟทาน'}
                {product.category === 'perfume' && 'น้ำหอมดูไบ'}
                {product.category === 'incense' && 'เครื่องหอมดูไบ'}
                {product.category === 'combo' && 'เซ็ตของขวัญพิเศษ'}
                {product.category === 'other' && 'สินค้าอื่นๆ'}
              </span>
              <div className="flex items-center gap-1 text-amber-600">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span className="font-bold">{product.rating}</span>
                <span className="text-slate-500 text-[10px]">({product.reviewsCount})</span>
              </div>
            </div>

            {/* Title */}
            <h3
              onClick={() => setIsModalOpen(true)}
              className="text-sm font-serif font-bold text-slate-900 group-hover:text-amber-800 transition line-clamp-2 cursor-pointer leading-snug"
            >
              {product.title}
            </h3>

            {/* Arabic Title */}
            {product.arabicTitle && (
              <p className="text-[11px] font-serif text-amber-700/80 dir-rtl mt-0.5 font-medium">
                {product.arabicTitle}
              </p>
            )}

            {/* Available Sizes / Variants Pill */}
            <div className="mt-2.5 flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-slate-500 font-medium mr-1 flex items-center gap-0.5">
                <Layers className="w-3 h-3 text-amber-600" />
                <span>ไซส์:</span>
              </span>
              {product.variants.map((v) => (
                <span
                  key={v.id}
                  className={`text-[10px] px-2 py-0.5 rounded border ${
                    v.stockQuantity > 0
                      ? 'bg-amber-50 border-amber-200 text-slate-800 font-medium'
                      : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                  }`}
                  title={`${v.name} (สต๊อก ${v.stockQuantity})`}
                >
                  {v.name.split(' ')[0]} {v.name.includes('Size') ? v.name.split(' ')[1] : ''}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing & Add Action */}
          <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-serif font-extrabold text-amber-700">
                  {formatPrice(minPrice)}
                </span>
                {maxPrice > minPrice && (
                  <span className="text-xs text-slate-500 font-serif font-medium">
                    - {formatPrice(maxPrice)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 via-gold-400 to-amber-600 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-lg transition shadow-sm hover:shadow-md flex items-center gap-1.5 border border-amber-300"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>เลือกไซส์</span>
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
