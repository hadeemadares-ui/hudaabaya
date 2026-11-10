'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, User, PackageSearch, Lock, QrCode, MapPin, X } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { CategoryType, CurrencyType } from '../../types';
import { DEFAULT_LOGO_BASE64 } from '../../data/logoData';

export const Navbar: React.FC = () => {
  const {
    cart,
    setIsCartOpen,
    setIsOrderTrackingOpen,
    isAdminMode,
    isAdminAuthenticated,
    setIsAdminAuthenticated,
    setIsAdminLoginModalOpen,
    logoutAdmin,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    storeSettings,
    currency,
    setCurrency,
  } = useShop();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const DEFAULT_CATEGORIES: { id: CategoryType; label: string }[] = [
    { id: 'all', label: 'คอลเลกชันทั้งหมด' },
    { id: 'abaya', label: 'ชุดอาบายะห์ (Abaya)' },
    { id: 'kaftan', label: 'ชุดคัฟทาน (Kaftan)' },
    { id: 'perfume', label: 'น้ำหอมดูไบ (Dubai Oud)' },
    { id: 'incense', label: 'เครื่องหอม (Bukhoor)' },
    { id: 'combo', label: 'เซ็ตของขวัญ (Gift Sets)' },
    { id: 'other', label: 'ไลฟ์สไตล์ & อื่นๆ' },
  ];

  const [categories, setCategories] = useState<{ id: CategoryType; label: string }[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    const loadCategories = () => {
      try {
        const stored = localStorage.getItem('huda_custom_category_list_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories([
              { id: 'all', label: 'คอลเลกชันทั้งหมด' },
              ...parsed.map((item: any) => ({ id: item.id as CategoryType, label: item.label })),
            ]);
            return;
          }
        }
      } catch (e) {
        console.error('Navbar category load error:', e);
      }
    };
    loadCategories();
    window.addEventListener('huda_categories_updated', loadCategories);
    return () => window.removeEventListener('huda_categories_updated', loadCategories);
  }, []);

  const currencies: { id: CurrencyType; label: string }[] = [
    { id: 'THB', label: 'THB (฿)' },
    { id: 'AED', label: 'AED (د.إ)' },
    { id: 'USD', label: 'USD ($)' },
    { id: 'EUR', label: 'EUR (€)' },
  ];

  const defaultMapUrl = 'https://www.google.com/maps/dir//%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99+HUDA+ABAYA+DUBAI+11%2F2+%E0%B8%96%E0%B8%99%E0%B8%99+%E0%B8%84%E0%B8%A5%E0%B8%AD%E0%B8%87%E0%B8%AA%E0%B8%B4%E0%B8%9A%E0%B8%AA%E0%B8%B2%E0%B8%A1+%E0%B9%81%E0%B8%82%E0%B8%A7%E0%B8%87%E0%B8%AB%E0%B8%99%E0%B8%AD%E0%B8%87%E0%B8%88%E0%B8%AD%E0%B8%81+%E0%B9%80%E0%B8%82%E0%B8%95%E0%B8%AB%E0%B8%99%E0%B8%AD%E0%B8%87%E0%B8%88%E0%B8%AD%E0%B8%81+%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B9%80%E0%B8%97%E0%B8%9E%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A3+10530/@13.8461503,100.8564361,4592m/data=!3m1!1e3!4m8!4m7!1m0!1m5!1m1!1s0x311d73004172d045:0xca04d1c0a845986e!2m2!1d100.894964!2d13.8839807';

  const handleAdminBtnClick = () => {
    if (isAdminMode && isAdminAuthenticated) {
      logoutAdmin();
    } else {
      setIsAdminAuthenticated(false);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('huda_admin_authenticated');
        localStorage.removeItem('huda_admin_authenticated');
      }
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleCategoryClick = (catId: CategoryType) => {
    setSelectedCategory(catId);
    if (!isAdminMode) {
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const triggerQRModal = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open_pwa_qr_modal'));
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200/80 text-[#1C1917] transition-all">
      {/* Top Editorial Announcement Strip */}
      <div className="bg-[#141312] text-[#E6E2DC] text-[11px] py-2 px-4 sm:px-6 lg:px-8 tracking-widest">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden lg:flex items-center gap-2 text-stone-400 font-light tracking-[0.15em] uppercase text-[10px]">
            <span>DUBAI • BANGKOK</span>
            <span className="text-[#B89352]">|</span>
            <span>AUTHENTIC EMIRATI HAUTE COUTURE</span>
          </div>

          <div className="text-center mx-auto lg:mx-0 font-normal tracking-wider text-[11px] text-[#F5F2EC] truncate">
            {storeSettings.topAnnouncement}
          </div>

          {/* Currency & Store Locator */}
          <div className="hidden md:flex items-center gap-4 text-[10px] tracking-widest uppercase">
            <a
              href={storeSettings.mapUrl || defaultMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-300 hover:text-white transition flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-[#B89352]" />
              <span>บูติกหนองจอก</span>
            </a>

            <span className="text-stone-700">|</span>

            <div className="flex items-center gap-1">
              {currencies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCurrency(c.id)}
                  className={`px-1.5 py-0.5 transition cursor-pointer ${
                    currency === c.id
                      ? 'text-[#B89352] font-semibold border-b border-[#B89352]'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {c.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Maison Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 gap-4 sm:gap-8">
          
          {/* Brand Identity */}
          <div
            className="flex items-center gap-3.5 cursor-pointer group shrink-0"
            onClick={() => handleCategoryClick('all')}
          >
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-[#DCD6CD] bg-white p-0.5 shrink-0 transition duration-500 group-hover:border-[#B89352]">
              <img
                src={storeSettings.logoImageUrl || DEFAULT_LOGO_BASE64}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_LOGO_BASE64;
                }}
                alt={storeSettings.storeName}
                className="w-full h-full rounded-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-serif text-lg sm:text-2xl md:text-[26px] font-semibold tracking-[0.08em] text-[#141312] leading-none">
                {storeSettings.storeName}
              </h1>
              <p className="text-[9px] sm:text-[10px] text-[#8C703E] tracking-[0.22em] uppercase font-serif mt-1.5">
                {storeSettings.storeTagline}
              </p>
            </div>
          </div>

          {/* Minimalist Editorial Search Input */}
          <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="ค้นหาอาบายะห์, คัฟทาน, น้ำหอมดูไบ หรือรหัสสินค้า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-stone-300/90 focus:border-[#141312] rounded-none py-2.5 pl-10 pr-9 text-xs text-[#141312] placeholder-stone-400 transition-colors outline-none tracking-wide"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#141312] transition"
                  aria-label="ล้างคำค้นหา"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-5 shrink-0">
            
            {/* Order Tracking */}
            <button
              onClick={() => setIsOrderTrackingOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-stone-700 hover:text-[#141312] transition tracking-wide py-1.5 cursor-pointer"
            >
              <PackageSearch className="w-4 h-4 text-[#8C703E]" />
              <span>ติดตามคำสั่งซื้อ</span>
            </button>

            {/* Mobile App QR */}
            <button
              onClick={triggerQRModal}
              className="hidden lg:flex items-center gap-1.5 text-xs text-stone-700 hover:text-[#141312] transition tracking-wide py-1.5 cursor-pointer"
              title="ใช้งานผ่านมือถือ"
            >
              <QrCode className="w-4 h-4 text-[#8C703E]" />
              <span>Mobile App</span>
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={handleAdminBtnClick}
              className={`flex items-center gap-1.5 text-xs px-3.5 py-2 transition tracking-wider uppercase cursor-pointer ${
                isAdminMode && isAdminAuthenticated
                  ? 'bg-[#141312] text-white'
                  : 'text-stone-700 hover:text-[#141312] border border-stone-300/80 hover:border-[#141312] bg-white'
              }`}
              title={isAdminMode && isAdminAuthenticated ? 'ออกจากระบบจัดการกลับสู่หน้าร้าน' : 'สำหรับผู้ดูแลร้านค้า'}
            >
              {isAdminMode && isAdminAuthenticated ? (
                <User className="w-3.5 h-3.5 text-[#B89352]" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-stone-500" />
              )}
              <span className="hidden sm:inline font-medium text-[11px]">
                {isAdminMode && isAdminAuthenticated ? 'หน้าร้าน' : 'จัดการร้าน'}
              </span>
            </button>

            {/* Shopping Bag */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-[#141312] hover:bg-[#292624] text-white transition cursor-pointer"
              aria-label="ตะกร้าสินค้า"
            >
              <ShoppingBag className="w-4 h-4 text-[#D4B57B]" />
              <span className="text-xs font-serif tracking-wider">{totalCartCount}</span>
            </button>
          </div>
        </div>

        {/* Mobile Search & Quick Links */}
        <div className="md:hidden pb-3 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="ค้นหาอาบายะห์, คัฟทาน, น้ำหอมดูไบ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-300 focus:border-[#141312] py-2 pl-10 pr-9 text-xs text-[#141312] placeholder-stone-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#141312]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-600 pt-0.5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOrderTrackingOpen(true)}
                className="flex items-center gap-1 text-stone-700 hover:text-black font-medium"
              >
                <PackageSearch className="w-3.5 h-3.5 text-[#8C703E]" />
                <span>เช็คพัสดุ</span>
              </button>
              <a
                href={storeSettings.mapUrl || defaultMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-stone-700 hover:text-black font-medium"
              >
                <MapPin className="w-3.5 h-3.5 text-[#8C703E]" />
                <span>แผนที่ร้าน</span>
              </a>
            </div>

            <div className="flex items-center gap-1">
              {currencies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCurrency(c.id)}
                  className={`px-1.5 py-0.5 text-[10px] tracking-wider ${
                    currency === c.id
                      ? 'bg-[#141312] text-white font-medium'
                      : 'text-stone-500'
                  }`}
                >
                  {c.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editorial Category Navigation Bar */}
        <nav className="flex items-center justify-start md:justify-center gap-6 sm:gap-8 overflow-x-auto py-3 no-scrollbar border-t border-stone-200/80">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`relative py-1 text-xs sm:text-[13px] tracking-wide whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#141312] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#141312]'
                    : 'text-stone-500 hover:text-[#141312] font-normal'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

