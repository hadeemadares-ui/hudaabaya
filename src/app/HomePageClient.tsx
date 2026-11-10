'use client';

import React from 'react';
import { Star, PackageSearch } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { HeroBanner } from '../components/home/HeroBanner';
import { PromotionSection } from '../components/home/PromotionSection';
import { ProductCard } from '../components/products/ProductCard';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminLoginModal } from '../components/admin/AdminLoginModal';
import { MOCK_REVIEWS } from '../data/mockProducts';
import { sortProductsNatural } from '../utils/productUtils';

export default function HomePageClient() {
  const { products, selectedCategory, searchQuery, isAdminMode, isAdminAuthenticated, storeSettings } = useShop();

  const filteredProducts = React.useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'all' || product.category === selectedCategory;

        const matchesSearch =
          !searchQuery ||
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.arabicTitle && product.arabicTitle.includes(searchQuery)) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.variants.some((v) => v.name.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
      })
      .sort(sortProductsNatural);
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="space-y-0 relative bg-[#FAF9F6] text-[#141312]">
      {isAdminMode && isAdminAuthenticated ? (
        <AdminDashboard />
      ) : (
        <>
          {storeSettings?.showHeroBanner !== false && <HeroBanner />}

          {/* Editorial Product Catalog */}
          <section id="catalog-section" className="py-14 sm:py-20 bg-[#FAF9F6] scroll-mt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Editorial Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-stone-200/90 pb-5">
                <div>
                  <p className="text-[10px] font-serif tracking-[0.25em] uppercase text-[#8C703E] mb-1.5">
                    MAISON ARCHIVE & COLLECTION
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#141312] tracking-wide">
                    {selectedCategory === 'all' && 'คอลเลกชันทั้งหมด (All Collections)'}
                    {selectedCategory === 'abaya' && 'อาบายะห์ดูไบ (Dubai Abaya)'}
                    {selectedCategory === 'kaftan' && 'คัฟทานดูไบ (Dubai Kaftan)'}
                    {selectedCategory === 'perfume' && 'น้ำหอมดูไบแท้ (Parfums d’Oud)'}
                    {selectedCategory === 'incense' && 'เครื่องหอมและไม้กฤษณา (Bukhoor)'}
                    {selectedCategory === 'combo' && 'เซ็ตของขวัญ (Curated Gift Sets)'}
                    {selectedCategory === 'other' && 'คอลเลกชันไลฟ์สไตล์ (Lifestyle)'}
                  </h2>
                </div>

                <div className="text-xs text-stone-500 font-serif tracking-wider self-start md:self-auto">
                  แสดง <span className="text-[#141312] font-semibold">{filteredProducts.length}</span> รายการ
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white border border-stone-200/80 space-y-3">
                  <PackageSearch className="w-8 h-8 text-stone-300 mx-auto stroke-[1.5]" />
                  <p className="font-serif text-base text-[#141312]">
                    ไม่พบรายการสินค้าที่ค้นหา
                  </p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    กรุณาลองเลือกหมวดหมู่ &ldquo;คอลเลกชันทั้งหมด&rdquo; หรือใช้คำค้นหาอื่น
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

          {/* Editorial Client Testimonials */}
          <section className="py-16 sm:py-20 bg-[#F5F2EC] border-t border-stone-200/80 text-[#141312]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <p className="text-[10px] font-serif tracking-[0.25em] uppercase text-[#8C703E]">
                  CLIENT TESTIMONIALS
                </p>
                <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#141312]">
                  เสียงตอบรับจากลูกค้าของเรา
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {MOCK_REVIEWS.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-6 sm:p-8 bg-white border border-stone-200/80 flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-0.5 text-[#B89352]">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#B89352] text-[#B89352]" />
                          ))}
                        </div>
                        <span className="text-[10px] tracking-[0.15em] uppercase text-stone-400">
                          VERIFIED CLIENT
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-light italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="font-serif font-medium text-[#141312]">
                        {rev.userName}
                      </span>
                      <span className="text-[11px] text-[#8C703E] truncate max-w-[160px]">
                        {rev.productName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        </>
      )}

      <AdminLoginModal />
    </div>
  );
}

