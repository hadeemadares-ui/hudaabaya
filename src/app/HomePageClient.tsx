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
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-[#E8E3DA] pb-4">
                <div>
                  <div className="flex items-center gap-2 text-[#B89352] text-xs font-serif font-medium tracking-widest uppercase mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#B89352]" />
                    <span>COLLECTION CATALOG</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917] tracking-tight">
                    {selectedCategory === 'all' && 'สินค้าทั้งหมด (All Products)'}
                    {selectedCategory === 'abaya' && 'ชุดอาบายะห์ดูไบพรีเมียม (Abaya Dubai)'}
                    {selectedCategory === 'kaftan' && 'ชุดคัฟทานสไตล์ดูไบ (Dubai Kaftan)'}
                    {selectedCategory === 'perfume' && 'น้ำหอมดูไบแท้ 100% (Dubai Perfumes)'}
                    {selectedCategory === 'incense' && 'เครื่องหอมและไม้หอมดูไบ (Incense & Bukhoor)'}
                    {selectedCategory === 'combo' && 'เซ็ตของขวัญสุดคุ้ม (Gift Sets)'}
                    {selectedCategory === 'other' && 'สินค้าทั่วไป (General Products)'}
                  </h2>
                </div>

                <div className="text-xs text-stone-600 bg-white px-3.5 py-1.5 rounded-full border border-[#E8E3DA] font-medium self-start md:self-auto">
                  ทั้งหมด <span className="text-[#B89352] font-bold">{filteredProducts.length}</span> รายการ
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-[#E8E3DA] space-y-3">
                  <PackageSearch className="w-10 h-10 text-stone-300 mx-auto" />
                  <p className="font-serif text-base font-bold text-[#1C1917]">
                    ไม่พบรายการสินค้าตรงตามหมวดหมู่ที่เลือก
                  </p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto font-light">
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
          <section className="py-12 bg-[#F4ECE1]/50 border-t border-[#E8E3DA] text-[#1C1917]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <div className="inline-flex items-center gap-1.5 bg-white border border-[#DCC59F] px-3.5 py-1 rounded-full text-[#B89352] text-xs font-serif shadow-2xs">
                  <Star className="w-3.5 h-3.5 fill-[#B89352] text-[#B89352]" />
                  <span className="font-medium">4.9 / 5.0 จากรีวิวล่าสุด</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
                  ความประทับใจจากลูกค้า HUDA ABAYA DUBAI
                </h3>
                <p className="text-xs text-stone-600 font-light">
                  การันตีคุณภาพผ้า ดีไซน์ที่ทรงเสน่ห์ และน้ำหอมดูไบแท้หอมติดทนนาน
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_REVIEWS.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 bg-white border border-[#E8E3DA] rounded-lg space-y-3 shadow-2xs flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-sm text-[#1C1917]">
                          {rev.userName}
                        </span>
                        <div className="flex text-[#B89352]">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#B89352] text-[#B89352]" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed font-light italic">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                      <span className="text-[#B89352] truncate max-w-[180px] font-medium">
                        {rev.productName}
                      </span>
                      <span className="text-emerald-700 font-medium flex items-center gap-0.5">
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
