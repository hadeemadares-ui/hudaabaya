'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Star, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

import { CategoryType } from '../../types';

export const HeroBanner: React.FC = () => {
  const { products, setSelectedCategory } = useShop();

  const slides = [
    {
      id: 1,
      title: 'DUBAI ROYAL ABAYA COLLECTION',
      subtitle: 'ชุดอาบายะห์ดูไบ ปักเลื่อมทองคำแท้ เกรดพรีเมียม',
      description: 'สัมผัสความหรูหราสง่างามส่งตรงจากนครดูไบ UAE ผ้า Nida Silk ตัดเย็บประณีต พร้อมขนาดไซส์ S ถึง XXL',
      badge: 'คอลเลกชันใหม่ส่งตรงจากดูไบ',
      category: 'abaya' as CategoryType,
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 2,
      title: 'EXCLUSIVE DUBAI OUD & PERFUME',
      subtitle: 'น้ำหอมอาหรับหัวน้ำมันแท้ อูดดูไบ หอมทรงเสน่ห์ตลอด 24 ชม.',
      description: 'กลิ่นหอมสไตล์เจ้าหญิงและเจ้าชายแห่งดูไบ สกัดจากไม้กฤษณาธรรมชาติ (Royal Agarwood) และดอกกุหลาบดามาสค์',
      badge: 'สินค้านิยมขายดี Best Seller',
      category: 'perfume' as CategoryType,
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 3,
      title: 'SPECIAL COMBO SET 25% OFF',
      subtitle: 'จัดเซ็ตสุดคุ้ม: ชุดอาบายะห์ดูไบ + น้ำหอม Royal Oud',
      description: 'ต้อนรับเทศกาลและงานสำคัญ ซื้อเป็นเซ็ตของขวัญประทับใจผู้รับ บรรจุในกล่องกำมะหยี่สีทองหรูหรา',
      badge: 'โปรโมชันพิเศษลดสูงสุด 25%',
      category: 'combo' as CategoryType,
      image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
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

  const realCount = products.filter((p) => p.category === active.category).length;

  return (
    <div className="relative bg-[#FAF9F6] text-[#0A0A0A] overflow-hidden border-b border-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/90 border border-amber-300 text-amber-950 text-xs font-bold tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span className="font-extrabold">{active.badge}</span>
              {realCount > 0 && (
                <span className="ml-1 text-stone-900 font-bold text-[10px]">({realCount} รายการ)</span>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-[#0A0A0A] tracking-tight leading-tight">
                {active.title}
              </h2>
              <p className="text-base sm:text-lg font-serif text-amber-900 font-bold">
                {active.subtitle}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-stone-900 max-w-xl leading-relaxed font-semibold">
              {active.description}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => handleSelectCategory(active.category)}
                className="px-7 py-3.5 bg-[#0A0A0A] hover:bg-amber-800 text-white font-bold text-xs tracking-widest uppercase transition-colors duration-300 flex items-center gap-2 cursor-pointer shadow-xs rounded-none border border-[#0A0A0A]"
              >
                <span>เลือกชมคอลเลกชัน</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex items-center space-x-2 pt-4">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 transition-all duration-300 cursor-pointer ${
                    currentSlide === idx ? 'w-8 bg-[#0A0A0A]' : 'w-3 bg-stone-400'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Image Feature Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-lg overflow-hidden border border-stone-300 shadow-sm group bg-white p-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded">
                <img
                  src={getSlideImage(active.category, active.image)}
                  alt={active.title}
                  className="w-full h-full object-cover object-center transform transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/0" />
              </div>
              
              <div className="p-3 bg-white flex items-center justify-between border-t border-stone-200">
                <div>
                  <p className="text-[10px] text-amber-900 font-serif uppercase tracking-widest font-bold">HUDA ABAYA DUBAI</p>
                  <p className="text-xs font-serif font-extrabold text-[#0A0A0A]">สินค้าแท้นำเข้าจากดูไบ 100%</p>
                </div>
                <div className="flex items-center gap-1 text-amber-800 text-xs font-extrabold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  <span>4.9 / 5.0</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
