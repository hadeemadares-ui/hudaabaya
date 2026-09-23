'use client';

import React from 'react';
import { ShoppingBag, Search, Sparkles, User, PackageSearch, Bot, Globe, Lock, QrCode, Compass } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { CategoryType, CurrencyType } from '../../types';
import { DEFAULT_LOGO_BASE64 } from '../../data/logoData';
import { VoiceInputButton } from '../common/VoiceInputButton';

export const Navbar: React.FC = () => {
  const {
    cart,
    setIsCartOpen,
    setIsOrderTrackingOpen,
    isAdminMode,
    setIsAdminMode,
    isAdminAuthenticated,
    setIsAdminLoginModalOpen,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    storeSettings,
    currency,
    setCurrency,
    setIsAIConciergeOpen,
  } = useShop();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categories: { id: CategoryType; label: string }[] = [
    { id: 'all', label: 'ทั้งหมด (All)' },
    { id: 'abaya', label: 'ชุดอาบายะห์ (Abaya)' },
    { id: 'kaftan', label: 'ชุดคัฟทาน (Kaftan)' },
    { id: 'perfume', label: 'น้ำหอมดูไบ (Dubai Oud)' },
    { id: 'incense', label: 'เครื่องหอมดูไบ (Incense & Bukhoor)' },
    { id: 'combo', label: 'เซ็ตสุดคุ้ม (Combo Set)' },
    { id: 'other', label: 'อื่นๆ (ของเล่นเด็ก ขนม ฯลฯ)' },
  ];

  const currencies: { id: CurrencyType; label: string }[] = [
    { id: 'THB', label: '฿ THB' },
    { id: 'AED', label: 'د.إ AED' },
    { id: 'USD', label: '$ USD' },
    { id: 'EUR', label: '€ EUR' },
  ];

  const defaultMapUrl = 'https://www.google.com/maps/dir//%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99+HUDA+ABAYA+DUBAI+11%2F2+%E0%B8%96%E0%B8%99%E0%B8%99+%E0%B8%84%E0%B8%A5%E0%B8%AD%E0%B8%87%E0%B8%AA%E0%B8%B4%E0%B8%9A%E0%B8%AA%E0%B8%B2%E0%B8%A1+%E0%B9%81%E0%B8%82%E0%B8%A7%E0%B8%87%E0%B8%AB%E0%B8%99%E0%B8%AD%E0%B8%87%E0%B8%88%E0%B8%AD%E0%B8%81+%E0%B9%80%E0%B8%82%E0%B8%95%E0%B8%AB%E0%B8%99%E0%B8%AD%E0%B8%87%E0%B8%88%E0%B8%AD%E0%B8%81+%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B9%80%E0%B8%97%E0%B8%9E%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A3+10530/@13.8461503,100.8564361,4592m/data=!3m1!1e3!4m8!4m7!1m0!1m5!1m1!1s0x311d73004172d045:0xca04d1c0a845986e!2m2!1d100.894964!2d13.8839807';

  const handleAdminBtnClick = () => {
    if (isAdminAuthenticated) {
      setIsAdminMode(!isAdminMode);
    } else {
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
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/98 backdrop-blur-md border-b border-stone-300 text-[#0A0A0A] shadow-xs transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-[#0A0A0A] text-white text-xs py-2 px-4 tracking-wider flex items-center justify-between font-normal">
        <div className="hidden md:flex items-center gap-2 text-[11px] text-stone-200">
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>นำเข้าชุดอาบายะห์และน้ำหอมแท้จากดูไบ UAE | 100% Authentic Import</span>
        </div>

        <div className="flex items-center justify-center gap-2 mx-auto md:mx-0 text-[11px] sm:text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold tracking-wide text-white">{storeSettings.topAnnouncement}</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>

        {/* Currency Switcher */}
        <div className="hidden md:flex items-center gap-1.5 border-l border-stone-800 pl-3">
          <span className="text-[10px] text-stone-300 font-serif uppercase tracking-widest mr-1 font-semibold">Currency:</span>
          {currencies.map((c) => (
            <button
              key={c.id}
              onClick={() => setCurrency(c.id)}
              className={`text-[10px] font-mono px-2 py-0.5 transition rounded-sm ${
                currency === c.id
                  ? 'bg-amber-500 text-[#0A0A0A] font-extrabold'
                  : 'text-stone-300 hover:text-white font-semibold'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 md:h-26 gap-3">
          
          {/* Main Store Logo & Name */}
          <div className="flex items-center gap-3 sm:gap-4 cursor-pointer group shrink-0" onClick={() => handleCategoryClick('all')}>
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-600 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition duration-300">
              <img
                src={storeSettings.logoImageUrl || DEFAULT_LOGO_BASE64}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_LOGO_BASE64;
                }}
                alt={storeSettings.storeName}
                className="w-full h-full rounded-full object-contain bg-white p-0.5 border border-stone-300"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="font-serif text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#0A0A0A] group-hover:text-amber-800 transition-colors leading-tight">
                {storeSettings.storeName}
              </h1>
              <p className="text-[9px] sm:text-[11px] text-amber-800 tracking-widest uppercase font-serif font-bold mt-0.5">
                {storeSettings.storeTagline}
              </p>
            </div>
          </div>

          {/* Desktop Search Input */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6 items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ค้นหาชุดอาบายะห์, เดรส, น้ำหอมดูไบ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-stone-300 focus:border-black focus:ring-1 focus:ring-black rounded-full py-2 pl-10 pr-12 text-xs text-[#0A0A0A] font-semibold placeholder-stone-500 transition-all outline-none"
              />
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-700" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-stone-700 hover:text-black font-bold"
                >
                  ล้าง
                </button>
              )}
            </div>
            <VoiceInputButton
              onTranscript={(text) => setSearchQuery(text)}
              currentValue={searchQuery}
            />
          </div>

          {/* Header Utilities / Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* GPS Map Link */}
            <a
              href={storeSettings.mapUrl || defaultMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-1.5 text-xs text-stone-900 hover:text-black transition bg-white px-3 py-1.5 rounded-full border border-stone-300 hover:border-black shadow-xs font-bold"
              title="แผนที่นำทาง GPS ร้าน HUDA ABAYA DUBAI"
            >
              <Compass className="w-3.5 h-3.5 text-amber-700" />
              <span>แผนที่ร้าน</span>
            </a>

            {/* Install App QR */}
            <button
              onClick={triggerQRModal}
              className="hidden sm:flex items-center gap-1.5 text-xs text-stone-900 hover:text-black transition bg-white px-3 py-1.5 rounded-full border border-stone-300 hover:border-black shadow-xs font-bold"
              title="สแกน QR Code เพื่อใช้งานบนแอปพลิเคชัน"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-700" />
              <span>แอปพลิเคชัน</span>
            </button>

            {/* AI Stylist */}
            <button
              onClick={() => setIsAIConciergeOpen(true)}
              className="flex items-center gap-1.5 text-xs text-amber-950 hover:text-black transition bg-amber-100/90 hover:bg-amber-200 px-3 py-1.5 rounded-full border border-amber-300 shadow-xs font-extrabold"
              title="ผู้ช่วยสไตลิสต์ดูไบ AI ช่วยเลือกไซส์"
            >
              <Bot className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">AI Stylist</span>
            </button>

            {/* Order Tracking */}
            <button
              onClick={() => setIsOrderTrackingOpen(true)}
              className="hidden md:flex items-center gap-1.5 text-xs text-stone-900 hover:text-black transition bg-white px-3 py-1.5 rounded-full border border-stone-300 hover:border-black font-bold"
            >
              <PackageSearch className="w-3.5 h-3.5 text-amber-700" />
              <span>ติดตามพัสดุ</span>
            </button>

            {/* Admin Management Button */}
            <button
              onClick={handleAdminBtnClick}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition border font-bold ${
                isAdminMode
                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                  : 'bg-white text-stone-900 border-stone-300 hover:border-black'
              }`}
              title="เข้าสู่ระบบหลังบ้านผู้ดูแลร้านค้า"
            >
              {isAdminAuthenticated ? <User className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-700" />}
              <span className="hidden sm:inline">{isAdminMode ? 'จัดการหลังบ้าน' : 'หลังบ้าน'}</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-[#0A0A0A] hover:text-amber-800 transition bg-white rounded-full border border-stone-300 hover:border-black shadow-xs"
              aria-label="ตะกร้าสินค้า"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A0A0A]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-extrabold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="lg:hidden pb-3 space-y-2">
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหาชุดอาบายะห์, เดรส, น้ำหอมดูไบ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-full py-2 pl-9 pr-4 text-xs text-[#0A0A0A] font-semibold placeholder-stone-500 focus:outline-none focus:border-black"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-700" />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-900 font-semibold">
            <a
              href={storeSettings.mapUrl || defaultMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden text-amber-900 flex items-center gap-1 underline font-bold"
            >
              <Compass className="w-3.5 h-3.5 text-amber-700" />
              <span>นำทาง GPS</span>
            </a>

            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-stone-900 font-bold">สกุลเงิน:</span>
              <div className="flex gap-1">
                {currencies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCurrency(c.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      currency === c.id ? 'bg-[#0A0A0A] text-white font-bold' : 'bg-white border border-stone-300 text-stone-900 font-bold'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <nav className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar border-t border-stone-300">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#0A0A0A] text-white font-extrabold shadow-xs'
                  : 'bg-white text-stone-900 hover:text-black hover:bg-stone-100 border border-stone-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
