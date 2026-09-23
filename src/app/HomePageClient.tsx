'use client';

import React from 'react';
import { Star, ShieldCheck, Sparkles, PackageSearch } from 'lucide-react';
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
    <div className="space-y-0 relative bg-[#FAF9F6] text-[#1C1917]">
      
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
          <section id="catalog-section" className="py-12 bg-[#FAF9F6] scroll-mt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-stone-300 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-amber-900 text-xs font-serif font-extrabold tracking-widest uppercase mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>COLLECTION CATALOG</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#0A0A0A] tracking-tight">
                    {selectedCategory === 'all' && 'สินค้าทั้งหมด (All Products)'}
                    {selectedCategory === 'abaya' && 'ชุดอาบายะห์ดูไบพรีเมียม (Abaya Dubai)'}
                    {selectedCategory === 'kaftan' && 'ชุดคัฟทานสไตล์ดูไบ (Dubai Kaftan)'}
                    {selectedCategory === 'perfume' && 'น้ำหอมดูไบแท้ 100% (Dubai Perfumes)'}
                    {selectedCategory === 'incense' && 'เครื่องหอมและไม้หอมดูไบ (Incense & Bukhoor)'}
                    {selectedCategory === 'combo' && 'เซ็ตของขวัญสุดคุ้ม (Gift Sets)'}
                    {selectedCategory === 'other' && 'สินค้าทั่วไป (General Products)'}
                  </h2>
                </div>

                <div className="text-xs text-stone-900 bg-white px-3.5 py-1.5 rounded-full border border-stone-300 font-bold self-start md:self-auto">
                  ทั้งหมด <span className="text-amber-900 font-extrabold">{filteredProducts.length}</span> รายการ
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-stone-300 space-y-3">
                  <PackageSearch className="w-10 h-10 text-stone-400 mx-auto" />
                  <p className="font-serif text-base font-extrabold text-[#0A0A0A]">
                    ไม่พบรายการสินค้าตรงตามหมวดหมู่ที่เลือก
                  </p>
                  <p className="text-xs text-stone-800 max-w-sm mx-auto font-semibold">
                    ลองเปลี่ยนไปเลือกหมวด "ทั้งหมด (All)" หรือค้นหาคำอื่นนะคะ
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
          <section className="py-12 bg-[#F4ECE1]/60 border-t border-stone-300 text-[#0A0A0A]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <div className="inline-flex items-center gap-1.5 bg-white border border-amber-300 px-3.5 py-1 rounded-full text-amber-950 text-xs font-serif font-bold shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  <span className="font-extrabold">4.9 / 5.0 จากรีวิวล่าสุด</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#0A0A0A]">
                  ความประทับใจจากลูกค้า HUDA ABAYA DUBAI
                </h3>
                <p className="text-xs text-stone-900 font-semibold">
                  การันตีคุณภาพผ้า ดีไซน์ที่ทรงเสน่ห์ และน้ำหอมดูไบแท้หอมติดทนนาน
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_REVIEWS.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 bg-white border border-stone-300 rounded-lg space-y-3 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-extrabold text-sm text-[#0A0A0A]">
                          {rev.userName}
                        </span>
                        <div className="flex text-amber-500">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-stone-900 leading-relaxed font-medium italic">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-700 font-semibold">
                      <span className="text-amber-950 truncate max-w-[180px] font-bold">
                        {rev.productName}
                      </span>
                      <span className="text-emerald-800 font-extrabold flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> ยืนยันผู้ซื้อจริง
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        </>
      )}

      {/* Global Modals */}
      <AdminLoginModal />
      <AIConciergeModal />
      <Hologram3DViewerModal />

    </div>
  );
}
