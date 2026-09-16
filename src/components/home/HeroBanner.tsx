'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Star, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const HeroBanner: React.FC = () => {
  const { setSelectedCategory, setIsCartOpen } = useShop();

  const slides = [
    {
      id: 1,
      title: 'DUBAI ROYAL ABAYA COLLECTION',
      subtitle: 'ชุดอาบายะห์ดูไบ ปักเลื่อมทองคำแท้ เกรดพรีเมียม',
      description: 'สัมผัสความหรูหราสง่างามส่งตรงจากนครดูไบ UAE ผ้า Nida Silk ตัดเย็บประณีต พร้อมขนาดไซส์ S ถึง XXL',
      badge: 'คอลเลกชันใหม่ส่งตรงจากดูไบ',
      category: 'abaya' as const,
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 2,
      title: 'EXCLUSIVE DUBAI OUD & PERFUME',
      subtitle: 'น้ำหอมอาหรับหัวน้ำมันแท้ อูดดูไบ หอมทรงเสน่ห์ตลอด 24 ชม.',
      description: 'กลิ่นหอมสไตล์เจ้าหญิงและเจ้าชายแห่งดูไบ สกัดจากไม้กฤษณาธรรมชาติ (Royal Agarwood) และดอกกุหลาบดามาสค์',
      badge: 'สินค้านิยมขายดี Best Seller',
      category: 'perfume' as const,
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 3,
      title: 'SPECIAL COMBO SET 25% OFF',
      subtitle: 'จัดเซ็ตสุดคุ้ม: ชุดอาบายะห์ดูไบ + น้ำหอม Royal Oud',
      description: 'ต้อนรับเทศกาลและงานสำคัญ ซื้อเป็นเซ็ตของขวัญประทับใจผู้รับ บรรจุในกล่องกำมะหยี่สีทองหรูหรา',
      badge: 'โปรโมชันพิเศษลดสูงสุด 25%',
      category: 'combo' as const,
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

  return (
    <div className="relative bg-dubai-black overflow-hidden border-b border-gold-400/30">
      
      {/* Background Glow Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dubai-card border border-gold-400/40 text-gold-300 text-xs font-semibold tracking-wider uppercase shadow-gold-glow">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>{active.badge}</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-white tracking-tight leading-tight">
                <span className="block bg-gradient-to-r from-amber-100 via-gold-300 to-gold-500 bg-clip-text text-transparent">
                  {active.title}
                </span>
              </h2>
              <p className="text-lg sm:text-xl font-serif text-gold-300 font-medium">
                {active.subtitle}
              </p>
            </div>

            <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
              {active.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setSelectedCategory(active.category)}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-gold-500 via-gold-400 to-amber-600 text-dubai-black font-bold text-sm tracking-wider uppercase hover:shadow-gold-strong transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>เลือกซื้อสินค้าคอลเลกชันนี้</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex items-center space-x-2 pt-4">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'w-8 bg-gold-400' : 'w-2 bg-gold-500/30'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Image Feature Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border-2 border-gold-400/40 shadow-2xl shadow-gold-900/30 group">
              <img
                src={active.image}
                alt={active.title}
                className="w-full h-[380px] sm:h-[450px] object-cover object-center transform transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dubai-black via-transparent to-transparent opacity-80" />
              
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-dubai-black/80 backdrop-blur-md border border-gold-400/30 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gold-300/80 font-serif">HUDA ABAYA DUBAI</p>
                  <p className="text-sm font-semibold text-white">รับประกันผ้าและกลิ่นตรงปก 100%</p>
                </div>
                <div className="flex items-center gap-1 bg-gold-500/20 px-2.5 py-1 rounded-full border border-gold-400/40 text-gold-300 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
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
