'use client';

import React from 'react';
import { Star, ShieldCheck, Sparkles, PackageSearch, TrendingUp } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { HeroBanner } from '../components/home/HeroBanner';
import { PromotionSection } from '../components/home/PromotionSection';
import { ProductCard } from '../components/products/ProductCard';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminLoginModal } from '../components/admin/AdminLoginModal';
import { AIConciergeModal } from '../components/common/AIConciergeModal';
import { Hologram3DViewerModal } from '../components/common/Hologram3DViewerModal';
import { MOCK_REVIEWS } from '../data/mockProducts';

export default function HomePageClient() {
  const { products, selectedCategory, searchQuery, isAdminMode, setIsAdminMode, isAdminAuthenticated, setIsAdminLoginModalOpen } = useShop();

  // Filter products by category & search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;

    const matchesSearch =
      !searchQuery ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.arabicTitle && product.arabicTitle.includes(searchQuery)) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.variants.some((v) => v.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-0 relative bg-slate-900 text-slate-100">
      
      {/* If Admin Mode & Authenticated is ON -> Display Backoffice Management */}
      {isAdminMode && isAdminAuthenticated ? (
        <AdminDashboard />
      ) : (
        <>
          {/* Hero Banner Slider */}
          <HeroBanner />

          {/* Promotion & Coupon Section */}
          <PromotionSection />

          {/* Product Catalog Section */}
          <section id="catalog-section" className="py-12 bg-slate-900 scroll-mt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Section Title */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-serif font-bold tracking-wider uppercase mb-1">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>HUDA ABAYA DUBAI CATALOG 2076</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-serif font-extrabold text-white tracking-wide">
                    {selectedCategory === 'all' && 'คอลเลกชันสินค้าทั้งหมด (All Products)'}
                    {selectedCategory === 'abaya' && 'ชุดอาบายะห์ดูไบพรีเมียม (Abaya Dubai)'}
                    {selectedCategory === 'kaftan' && 'ชุดคัฟทานสไตล์ดูไบ (Dubai Kaftan)'}
                    {selectedCategory === 'perfume' && 'น้ำหอมดูไบแท้ 100% (Dubai Oud & Perfumes)'}
                    {selectedCategory === 'incense' && 'เครื่องหอมและไม้หอมดูไบ (Dubai Incense & Bukhoor)'}
                    {selectedCategory === 'combo' && 'เซ็ตของขวัญสุดคุ้ม (Combo Gift Sets)'}
                    {selectedCategory === 'other' && 'หมวดหมู่อื่นๆ (ของเล่นเด็ก ขนม สินค้าทั่วไป)'}
                  </h2>
                </div>

                <div className="text-xs text-sky-300 bg-slate-800 px-4 py-2 rounded-full border border-slate-700 font-medium">
                  แสดงทั้งหมด <strong className="text-amber-400 font-bold">{filteredProducts.length}</strong> รายการสินค้า
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
                  <PackageSearch className="w-12 h-12 text-sky-400/50 mx-auto" />
                  <p className="font-serif text-lg font-bold text-white">
                    ไม่พบรายการสินค้าตรงตามหมวดหมู่ที่เลือก
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    ลองเปลี่ยนไปเลือกหมวด "ทั้งหมด (All)" หรือกดซิงก์สินค้าเพิ่มจาก Google Sheet นะคะ
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

            </div>
          </section>

          {/* Customer Reviews Section */}
          <section className="py-12 bg-slate-950 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <div className="inline-flex items-center gap-1 bg-amber-400/20 border border-amber-400/40 px-3 py-1 rounded-full text-amber-300 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5.0 คะแนนการรีวิวจากลูกค้าจริง</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-white">
                  ความประทับใจจากลูกค้า HUDA ABAYA DUBAI
                </h3>
                <p className="text-xs text-sky-300">
                  การันตีคุณภาพผ้า ดีไซน์ที่ทรงเสน่ห์ และน้ำหอมดูไบแท้หอมติดทนนาน
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_REVIEWS.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-sm text-amber-300">
                          {rev.userName}
                        </span>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="text-sky-400 truncate max-w-[180px] font-mono">
                        {rev.productName}
                      </span>
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> ผู้ซื้อสินค้าจริง
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        </>
      )}

      {/* Permanent Fixed Floating Action Button for Sales & Profit Report (Always visible on mobile & desktop) */}
      <div className="fixed bottom-5 right-4 sm:right-6 z-50 pointer-events-auto">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('huda_target_tab', 'reports');
              window.dispatchEvent(new CustomEvent('switch_admin_tab_reports'));
            }
            if (isAdminAuthenticated) {
              setIsAdminMode(true);
            } else {
              setIsAdminLoginModalOpen(true);
            }
          }}
          className="px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-full shadow-2xl border-2 border-emerald-300 flex items-center gap-2 scale-100 hover:scale-105 active:scale-95 transition cursor-pointer font-sans shadow-tritone-glow"
          title="เปิดรายงานยอดขาย & กำไรสุทธิ"
        >
          <TrendingUp className="w-5 h-5 text-emerald-200 animate-pulse shrink-0" />
          <span className="font-extrabold font-sans">📊 รายงานยอดขาย & กำไร</span>
        </button>
      </div>

      {/* Global Modals */}
      <AdminLoginModal />
      <AIConciergeModal />
      <Hologram3DViewerModal />

    </div>
  );
}
