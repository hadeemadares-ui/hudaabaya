'use client';

import React, { useState } from 'react';
import { Star, Eye, ShoppingBag, Sparkles, Tag, Layers, Box } from 'lucide-react';
import { Product } from '../../types';
import { ProductModal } from './ProductModal';
import { useShop } from '../../context/ShopContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { formatPrice, setActive3DProduct } = useShop();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate price range & total stock across sizes
  const prices = product.variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);

  return (
    <>
      <div className="group bg-dubai-card/90 backdrop-blur-md border border-gold-400/30 rounded-2xl overflow-hidden hover:border-gold-400 shadow-gold-strong transition-all duration-500 flex flex-col justify-between hover:-translate-y-1">
        
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-dubai-black cursor-pointer" onClick={() => setIsModalOpen(true)}>
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover object-center transform transition duration-700 group-hover:scale-108"
          />
          
          {/* Dark Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-dubai-black/90 via-transparent to-black/20 opacity-70 group-hover:opacity-40 transition" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.onSale && product.discountPercent && (
              <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                ลด {product.discountPercent}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-gold-500 text-dubai-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                HAUTE COUTURE
              </span>
            )}
          </div>

          {/* Stock & 3D Badges */}
          <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
            {totalStock > 0 ? (
              <span className="bg-dubai-black/80 backdrop-blur-md border border-gold-400/40 text-gold-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
                พร้อมส่ง (สต๊อก {totalStock})
              </span>
            ) : (
              <span className="bg-red-950/90 border border-red-500 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                สินค้าหมด
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActive3DProduct(product);
              }}
              className="bg-dubai-black/90 hover:bg-gold-500 hover:text-dubai-black border border-gold-400/50 text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md transition"
              title="ดูมุมมอง 3 มิติ 360°"
            >
              <Box className="w-3 h-3 animate-spin" />
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
              className="bg-gold-500 hover:bg-gold-400 text-dubai-black font-extrabold text-xs px-4 py-2.5 rounded-full shadow-gold-strong flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition duration-300"
            >
              <Eye className="w-4 h-4" />
              <span>ดูรายละเอียด & เลือกไซส์</span>
            </button>
          </div>
        </div>

        {/* Product Details Info */}
        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div>
            {/* Category / Rating */}
            <div className="flex items-center justify-between text-[11px] text-gold-400/80 mb-1">
              <span className="uppercase font-medium tracking-wider">
                {product.category === 'abaya' && 'ชุดอาบายะห์ดูไบ'}
                {product.category === 'kaftan' && 'ชุดคัฟทาน'}
                {product.category === 'perfume' && 'น้ำหอมดูไบ'}
                {product.category === 'incense' && 'เครื่องหอมดูไบ'}
                {product.category === 'combo' && 'เซ็ตของขวัญพิเศษ'}
                {product.category === 'other' && 'สินค้าอื่นๆ'}
              </span>
              <div className="flex items-center gap-1 text-gold-400">
                <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                <span>{product.rating}</span>
                <span className="text-gray-400 text-[10px]">({product.reviewsCount})</span>
              </div>
            </div>

            {/* Title */}
            <h3
              onClick={() => setIsModalOpen(true)}
              className="text-sm font-serif font-semibold text-white group-hover:text-gold-300 transition line-clamp-2 cursor-pointer leading-snug"
            >
              {product.title}
            </h3>

            {/* Arabic Title */}
            {product.arabicTitle && (
              <p className="text-[11px] font-serif text-gold-400/70 dir-rtl mt-0.5">
                {product.arabicTitle}
              </p>
            )}

            {/* Available Sizes / Variants Pill */}
            <div className="mt-2.5 flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-gray-400 font-medium mr-1 flex items-center gap-0.5">
                <Layers className="w-3 h-3 text-gold-400" />
                <span>ไซส์:</span>
              </span>
              {product.variants.map((v) => (
                <span
                  key={v.id}
                  className={`text-[10px] px-2 py-0.5 rounded border ${
                    v.stockQuantity > 0
                      ? 'bg-dubai-black/60 border-gold-400/40 text-gold-200'
                      : 'bg-red-950/40 border-red-800/40 text-gray-400 line-through'
                  }`}
                  title={`${v.name} (สต๊อก ${v.stockQuantity})`}
                >
                  {v.name.split(' ')[0]} {v.name.includes('Size') ? v.name.split(' ')[1] : ''}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing & Add Action */}
          <div className="pt-3 border-t border-gold-400/20 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-serif font-bold text-gold-300">
                  {formatPrice(minPrice)}
                </span>
                {maxPrice > minPrice && (
                  <span className="text-xs text-gold-300/70 font-serif">
                    - {formatPrice(maxPrice)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-dubai-black hover:bg-gold-500 hover:text-dubai-black border border-gold-400/50 text-gold-300 text-xs px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 shadow"
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
