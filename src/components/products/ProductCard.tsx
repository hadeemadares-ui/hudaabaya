'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { ProductModal } from './ProductModal';
import { useShop } from '../../context/ShopContext';

interface ProductCardProps {
  product: Product;
}

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  abaya: '/images/placeholder-abaya.jpg',
  kaftan: '/images/placeholder-abaya.jpg',
  perfume: '/images/placeholder-perfume.jpg',
  incense: '/images/placeholder-incense.jpg',
  combo: '/images/placeholder-abaya.jpg',
  other: '/images/placeholder-abaya.jpg',
};

const optimizeImageUrl = (url: string): string => {
  if (!url) return url;
  if (url.includes('images.unsplash.com')) {
    return url.replace(/w=\d+/, 'w=500').replace(/q=\d+/, 'q=75');
  }
  return url;
};

export const ProductCard: React.FC<ProductCardProps> = ({ product: initialProduct }) => {
  const { products, formatPrice } = useShop();
  const product = products.find((p) => p.id === initialProduct.id) || initialProduct;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const validPrices = product.variants.map((v) => Number(v.price) || 0).filter((p) => p > 0);
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : (product.variants[0]?.price || 0);
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : (product.variants[0]?.price || 0);
  const totalStock = product.variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0);

  const defaultImg = DEFAULT_CATEGORY_IMAGES[product.category] || DEFAULT_CATEGORY_IMAGES.abaya;
  const rawInitialImg =
    product.images &&
    product.images.length > 0 &&
    product.images[0] &&
    typeof product.images[0] === 'string' &&
    product.images[0].trim() !== ''
      ? product.images[0]
      : defaultImg;

  const initialImg = optimizeImageUrl(rawInitialImg);
  const [imgSrc, setImgSrc] = useState<string>(initialImg);

  useEffect(() => {
    const nextImg = optimizeImageUrl(rawInitialImg);
    if (nextImg && nextImg !== imgSrc) {
      setImgSrc(nextImg);
    }
  }, [rawInitialImg]);

  return (
    <>
      <article
        onClick={() => setIsModalOpen(true)}
        className="group bg-white border border-stone-200/80 hover:border-stone-400 transition-all duration-300 flex flex-col justify-between cursor-pointer"
      >
        {/* Editorial Portrait Frame - Solid soft background, instant render, no blinking animation */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#F7F5F0] flex items-center justify-center p-2.5 sm:p-3">
          <img
            src={imgSrc}
            alt={product.title}
            onError={() => {
              if (imgSrc !== defaultImg) {
                setImgSrc(defaultImg);
              }
            }}
            className="w-full h-full object-contain object-center transform transition duration-300 ease-out group-hover:scale-[1.03] relative z-1"
          />

          {/* Minimalist Editorial Status Tag */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {totalStock <= 0 ? (
              <span className="bg-stone-900/90 text-white text-[10px] tracking-[0.15em] uppercase px-2.5 py-1">
                SOLD OUT
              </span>
            ) : product.onSale && product.discountPercent ? (
              <span className="bg-[#8C703E] text-white text-[10px] tracking-[0.12em] uppercase px-2.5 py-0.5">
                -{product.discountPercent}%
              </span>
            ) : product.isNew ? (
              <span className="bg-white/95 text-[#141312] text-[9px] tracking-[0.18em] uppercase px-2.5 py-1 border border-stone-200">
                NEW
              </span>
            ) : null}
          </div>

          {/* Video Indicator Badge */}
          {product.videoUrl && (
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-[#141312]/85 text-[#F5DEB3] border border-amber-500/50 text-[9px] tracking-wider uppercase px-2 py-0.5 rounded shadow-sm flex items-center gap-1 backdrop-blur-xs">
                <span>🎬</span>
                <span className="font-semibold">มีวิดีโอ</span>
              </span>
            </div>
          )}

          {/* Subtle Quick Action Bar on Hover */}
          <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <div className="w-full bg-[#141312]/90 text-white text-[11px] tracking-[0.15em] uppercase py-2.5 text-center backdrop-blur-xs">
              {totalStock > 0 ? 'เลือกขนาด / สั่งซื้อ' : 'ดูรายละเอียด'}
            </div>
          </div>
        </div>

        {/* Clean Editorial Typography */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] tracking-[0.18em] uppercase text-[#8C703E] font-serif">
              <span>
                {product.category === 'abaya' && 'DUBAI ABAYA'}
                {product.category === 'kaftan' && 'KAFTAN'}
                {product.category === 'perfume' && 'PARFUM D’OUD'}
                {product.category === 'incense' && 'BUKHOOR'}
                {product.category === 'combo' && 'GIFT ENSEMBLE'}
                {product.category === 'other' && 'COLLECTION'}
              </span>
              {totalStock > 0 && (
                <span className="text-stone-400 font-sans tracking-normal">
                  คลัง {totalStock}
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-[15px] font-serif font-medium text-[#141312] group-hover:text-[#8C703E] transition-colors line-clamp-2 leading-snug">
              {product.title}
            </h3>

            {/* Available Sizes Pill Strip */}
            {product.variants.length > 0 && (
              <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                {product.variants.slice(0, 6).map((v) => (
                  <span
                    key={v.id}
                    className={`text-[10px] px-1.5 py-0.5 border ${
                      v.stockQuantity > 0
                        ? 'border-stone-200 text-stone-600 bg-[#FAF9F6]'
                        : 'border-stone-100 text-stone-300 line-through'
                    }`}
                  >
                    {v.name.replace('Size ', '')}
                  </span>
                ))}
                {product.variants.length > 6 && (
                  <span className="text-[10px] text-stone-400">+{product.variants.length - 6}</span>
                )}
              </div>
            )}
          </div>

          {/* Price Row */}
          <div className="pt-3 border-t border-stone-100 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-serif font-semibold text-[#141312] tracking-wide">
                {formatPrice(minPrice)}
              </span>
              {maxPrice > minPrice && (
                <span className="text-xs text-stone-400 font-serif">
                  – {formatPrice(maxPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-[0.15em] uppercase text-stone-500 group-hover:text-[#141312] transition-colors">
              สั่งซื้อ →
            </span>
          </div>
        </div>
      </article>

      {isModalOpen && (
        <ProductModal product={product} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

