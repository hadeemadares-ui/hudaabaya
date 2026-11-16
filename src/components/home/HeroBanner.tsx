'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { CategoryType } from '../../types';

export const HeroBanner: React.FC = () => {
  const { products, setSelectedCategory } = useShop();

  const slides = [
    {
      id: 1,
      eyebrow: 'HAUTE COUTURE COLLECTION • DUBAI UAE',
      title: 'The Art of Emirati Elegance',
      subtitle: 'อาบายะห์ดูไบระดับกูตูร์ ตัดเย็บประณีตจากผ้า Nida Silk แท้',
      description: 'รังสรรค์ความสง่างามเหนือกาลเวลาด้วยงานปักมือและเนื้อผ้าเกรดพรีเมียมนำเข้าโดยตรงจากนครดูไบ สวมใส่สบาย พริ้วไหวทุกอิริยาบถ',
      category: 'abaya' as CategoryType,
      ctaText: 'สำรวจคอลเลกชันอาบายะห์',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 2,
      eyebrow: 'SIGNATURE FRAGRANCE • ROYAL AGARWOOD',
      title: 'Imperial Dubai Oud & Parfums',
      subtitle: 'น้ำหอมอาหรับหัวน้ำมันแท้ กลิ่นหอมลุ่มลึกติดทนนานตลอดวัน',
      description: 'สกัดจากไม้กฤษณาธรรมชาติ (Royal Oud) กุหลาบดามาสกัส และอำพันทองคำ มอบเอกลักษณ์ความหอมระดับราชวงศ์ตะวันออกกลาง',
      category: 'perfume' as CategoryType,
      ctaText: 'สำรวจคอลเลกชันน้ำหอมดูไบ',
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 3,
      eyebrow: 'CURATED GIFTING • BESPOKE EDITION',
      title: 'The Royal Gift Ensemble',
      subtitle: 'เซ็ตของขวัญสุดพิเศษ อาบายะห์ดูไบคู่กับน้ำหอม Royal Oud',
      description: 'คัดสรรอย่างพิถีพิถันสำหรับโอกาสสำคัญและการมอบให้คนพิเศษ บรรจุในแพ็กเกจจิ้งหรูหราพร้อมส่งมอบความประทับใจ',
      category: 'combo' as CategoryType,
      ctaText: 'ชมเซ็ตของขวัญพิเศษ',
      image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const active = slides[currentSlide];

  const getSlideImage = (cat: CategoryType, fallback: string) => {
    const matched = products.find((p) => p.category === cat && p.images && p.images.length > 0);
    return matched?.images[0] || fallback;
  };

  const handleSelectCategory = (cat: CategoryType) => {
    setSelectedCategory(cat);
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-[#F5F2EC] text-[#141312] overflow-hidden border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Editorial Copy */}
          <div className="lg:col-span-7 space-y-6 z-10">
            <div className="inline-block border-b border-[#B89352] pb-1">
              <span className="text-[10px] sm:text-[11px] font-serif tracking-[0.25em] uppercase text-[#8C703E] font-medium">
                {active.eyebrow}
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-serif font-normal text-[#141312] tracking-tight leading-[1.12]">
                {active.title}
              </h2>
              <p className="text-base sm:text-xl font-serif text-[#57534E] font-normal pt-1">
                {active.subtitle}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 max-w-xl leading-relaxed font-light">
              {active.description}
            </p>

            <div className="pt-3 flex items-center gap-6">
              <button
                onClick={() => handleSelectCategory(active.category)}
                className="px-8 py-4 bg-[#141312] hover:bg-[#292624] text-white text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center gap-3 cursor-pointer"
              >
                <span>{active.ctaText}</span>
                <ArrowRight className="w-4 h-4 text-[#D4B57B]" />
              </button>
            </div>

            {/* Minimalist Slide Progress Indicators */}
            <div className="flex items-center gap-3 pt-6">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-[2px] transition-all duration-500 cursor-pointer ${
                    currentSlide === idx ? 'w-12 bg-[#141312]' : 'w-5 bg-stone-300 hover:bg-stone-400'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Editorial Portrait Frame */}
          <div className="lg:col-span-5">
            <div
              onClick={() => handleSelectCategory(active.category)}
              className="relative mx-auto max-w-md lg:max-w-none bg-white p-3 sm:p-4 border border-stone-200/90 shadow-lux-soft cursor-pointer group"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#FAF8F5]">
                <img
                  src={getSlideImage(active.category, active.image)}
                  alt={active.title}
                  onError={(e) => { const target = e.target as HTMLImageElement; if (target.src !== active.image) target.src = active.image; }}
                  className="w-full h-full object-contain object-center transform transition duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
              
              <div className="pt-3.5 pb-1 px-1 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-100 mt-3">
                <span className="font-serif tracking-[0.2em] uppercase text-[#141312]">
                  HUDA ABAYA DUBAI
                </span>
                <span className="tracking-wider text-[#8C703E] font-serif">
                  100% Authentic Import
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

