'use client';

import React from 'react';
import { ShoppingBag, Search, Sparkles, User, PackageSearch, Bot, Globe, Lock, QrCode, Compass, TrendingUp } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { CategoryType, CurrencyType } from '../../types';
import { DEFAULT_LOGO_BASE64 } from '../../data/logoData';

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
    <header className="sticky top-0 z-40 bg-dubai-black/95 backdrop-blur-xl border-b border-gold-400/30 text-white shadow-gold-strong transition-all">
      {/* Top Announcement Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-cyan-400 to-sky-700 text-dubai-black text-xs font-bold py-1.5 px-3 text-center tracking-wide flex items-center justify-between">
        <div className="hidden md:flex items-center gap-1.5 text-[11px]">
          <Globe className="w-3.5 h-3.5 shrink-0" />
          <span>สั่งซื้อตรงจากดูไบ UAE — สินค้าแท้ 100%</span>
        </div>

        <div className="flex items-center justify-center gap-2 mx-auto md:mx-0 truncate text-[11px] sm:text-xs">
          <Sparkles className="w-3.5 h-3.5 animate-pulse shrink-0" />
          <span className="truncate">{storeSettings.topAnnouncement}</span>
          <Sparkles className="w-3.5 h-3.5 animate-pulse shrink-0" />
        </div>

        {/* Currency Switcher */}
        <div className="hidden md:flex items-center gap-1 bg-dubai-black/40 px-2 py-0.5 rounded-full border border-gold-400/40">
          {currencies.map((c) => (
            <button
              key={c.id}
              onClick={() => setCurrency(c.id)}
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition ${
                currency === c.id
                  ? 'bg-gold-500 text-dubai-black font-extrabold shadow'
                  : 'text-gold-200 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 md:h-28 gap-2">
          
          {/* Main Logo & Store Name Display */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group shrink min-w-0" onClick={() => handleCategoryClick('all')}>
            <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full p-0.5 sm:p-1 bg-gradient-to-tr from-sky-600 via-cyan-400 to-sky-200 shadow-gold-strong flex items-center justify-center shrink-0 group-hover:scale-105 transition duration-300">
                <img
                  src={storeSettings.logoImageUrl || DEFAULT_LOGO_BASE64}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = DEFAULT_LOGO_BASE64;
                  }}
                  alt={storeSettings.storeName}
                  className="w-full h-full rounded-full object-contain bg-white p-0.5 border border-dubai-black sm:border-2 shadow-inner"
                />
              </div>
              <div className="min-w-0">
                <h1 className="font-serif text-sm sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight sm:tracking-wider bg-gradient-to-r from-sky-200 via-cyan-300 to-sky-100 bg-clip-text text-transparent drop-shadow-md truncate">
                  {storeSettings.storeName}
                </h1>
                <p className="text-[9px] sm:text-xs text-gold-300/90 tracking-wider uppercase font-sans font-semibold mt-0.5 truncate hidden xs:block">
                  {storeSettings.storeTagline}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4 relative">
            <input
              type="text"
              placeholder="ค้นหาชุดอาบายะห์, เดรส, น้ำหอมดูไบ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dubai-dark/80 border border-gold-400/40 rounded-full py-2 pl-10 pr-4 text-xs text-sky-100 placeholder-gold-500/50 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition backdrop-blur-md"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gold-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-gold-400/70 hover:text-gold-300"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Google Maps Button */}
            <a
              href={storeSettings.mapUrl || defaultMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-xs text-gold-300 hover:text-white transition bg-dubai-card px-2.5 sm:px-3 py-1.5 rounded-full border border-gold-400/40 hover:border-gold-400 shadow-gold-glow"
              title="เปิดแผนที่นำทาง Google Maps มายังหน้าร้าน HUDA ABAYA DUBAI"
            >
              <Compass className="w-4 h-4 text-gold-400" />
              <span className="hidden xl:inline font-bold">แผนที่ GPS</span>
            </a>

            {/* Install App / QR Code Button */}
            <button
              onClick={triggerQRModal}
              className="flex items-center gap-1 text-xs text-gold-300 hover:text-white transition bg-dubai-card px-2.5 sm:px-3 py-1.5 rounded-full border border-gold-400/40 hover:border-gold-400 shadow-gold-glow"
              title="ติดตั้งแอปพลิเคชันหรือสแกน QR Code เพื่อดาวน์โหลดลงมือถือ"
            >
              <QrCode className="w-4 h-4 text-gold-400" />
              <span className="hidden xl:inline font-bold">ติดตั้งแอป</span>
            </button>

            {/* AI Stylist Button */}
            <button
              onClick={() => setIsAIConciergeOpen(true)}
              className="flex items-center gap-1 text-xs text-gold-300 hover:text-white transition bg-gradient-to-r from-dubai-card to-dubai-black px-2.5 sm:px-3 py-1.5 rounded-full border border-gold-400/40 hover:border-gold-400 shadow-gold-glow animate-pulse"
              title="ผู้ช่วยสไตลิสต์ดูไบ AI ช่วยเลือกไซส์"
            >
              <Bot className="w-4 h-4 text-gold-400" />
              <span className="hidden sm:inline font-bold">AI Stylist</span>
            </button>

            {/* Order Tracking Button */}
            <button
              onClick={() => setIsOrderTrackingOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-gold-200 hover:text-gold-400 transition bg-dubai-card px-3 py-1.5 rounded-full border border-gold-400/30 hover:border-gold-400"
            >
              <PackageSearch className="w-4 h-4 text-gold-400" />
              <span>ติดตามพัสดุ</span>
            </button>

            {/* Password-Protected Admin Button */}
            <button
              onClick={handleAdminBtnClick}
              className={`flex items-center gap-1 text-xs px-2.5 sm:px-3 py-1.5 rounded-full transition border ${
                isAdminMode
                  ? 'bg-gold-500 text-dubai-black font-extrabold border-gold-400 shadow-gold-glow'
                  : 'bg-dubai-card text-gold-300/80 border-gold-500/30 hover:text-gold-300'
              }`}
              title="เข้าสู่ระบบผู้ดูแลร้านค้า (ต้องใส่รหัสผ่าน)"
            >
              {isAdminAuthenticated ? <User className="w-4 h-4" /> : <Lock className="w-4 h-4 text-gold-400" />}
              <span className="hidden sm:inline">{isAdminMode ? 'โหมดหลังบ้าน' : 'หลังบ้าน'}</span>
            </button>

            {/* Prominent Green Sales & Profit Report Button */}
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
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold border-2 border-emerald-400/80 shadow-gold-glow scale-100 hover:scale-105"
              title="เปิดรายงานยอดขาย & กำไรสุทธิ"
            >
              <TrendingUp className="w-4 h-4 text-emerald-200 animate-pulse shrink-0" />
              <span className="font-extrabold font-sans">📊 รายงานยอดขาย & กำไร</span>
            </button>

            {/* Cart Button with Count Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:p-2.5 text-gold-300 hover:text-gold-400 transition bg-dubai-card rounded-full border border-gold-400/40 hover:border-gold-400 shadow-gold-glow"
              aria-label="ตะกร้าสินค้า"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input & Currency Row */}
        <div className="lg:hidden pb-3 space-y-2">
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหาชุดอาบายะห์, เดรส, น้ำหอมดูไบ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dubai-dark border border-gold-400/40 rounded-full py-1.5 pl-9 pr-4 text-xs text-sky-100 placeholder-gold-500/50 focus:outline-none focus:border-gold-400"
            />
            <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-gold-400" />
          </div>

          {/* Mobile Prominent Sales & Profit Report Banner Button */}
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
            className="w-full py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl border-2 border-emerald-400/80 shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            <TrendingUp className="w-4 h-4 text-emerald-200 animate-pulse shrink-0" />
            <span>📊 เปิดรายงานยอดขาย & กำไรสุทธิ</span>
          </button>

          <div className="flex items-center justify-between text-[11px]">
            <a
              href={storeSettings.mapUrl || defaultMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden text-gold-300 flex items-center gap-1 underline font-medium"
            >
              <Compass className="w-3.5 h-3.5 text-gold-400" />
              <span>แผนที่นำทาง GPS</span>
            </a>

            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-gold-300 font-bold">สกุลเงิน:</span>
              <div className="flex gap-1">
                {currencies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCurrency(c.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      currency === c.id ? 'bg-gold-500 text-dubai-black font-bold' : 'bg-dubai-card text-gold-300'
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
        <nav className="flex items-center gap-2 overflow-x-auto py-2 sm:py-2.5 no-scrollbar border-t border-gold-400/10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 text-dubai-black font-bold shadow-gold-glow scale-105'
                  : 'bg-dubai-card/70 text-gold-200/80 hover:text-gold-300 border border-gold-400/20 hover:border-gold-400/50'
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
