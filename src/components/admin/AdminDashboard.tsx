'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Layers, AlertCircle, LogOut, ShieldCheck, Settings, Store, Sparkles, Clock, History, Smartphone, Monitor, TrendingUp, RotateCcw, Truck, Calendar, PackageCheck, Users, User, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AdminProductManager } from './AdminProductManager';
import { AdminOrderManager } from './AdminOrderManager';
import { AdminSettingsManager } from './AdminSettingsManager';
import { AdminPOSManager } from './AdminPOSManager';
import { AdminSalesReportManager } from './AdminSalesReportManager';
import { AdminSupplierSettlementManager } from './AdminSupplierSettlementManager';
import { AdminEventMarketManager } from './AdminEventMarketManager';
import { AdminBoothStockManager } from './AdminBoothStockManager';
import { AdminStaffManager } from './AdminStaffManager';
import { BoothTimeReminderModal } from './BoothTimeReminderModal';
import { AuditLog } from '../../types';
import { formatThaiDateTime } from '../../utils/dateUtils';


export interface TabTheme {
  name: string;
  btnInactive: string;
  btnActive: string;
  iconActive: string;
  iconInactive: string;
  containerBg: string;
  containerBorder: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentTitle: string;
}

export const TAB_THEMES: Record<string, TabTheme> = {
  pos: {
    name: 'แคชเชียร์หน้าร้าน (POS)',
    btnInactive: 'bg-white text-stone-700 hover:bg-[#FFFBEB] hover:text-[#B45309] border-stone-200/90 hover:border-amber-300',
    btnActive: 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B] shadow-xs font-bold ring-2 ring-[#F59E0B]/30',
    iconActive: 'text-[#D97706]',
    iconInactive: 'text-stone-400 group-hover:text-[#D97706]',
    containerBg: 'bg-[#FFFDF5]',
    containerBorder: 'border-[#FDE68A]',
    badgeBg: 'bg-[#FEF3C7]',
    badgeText: 'text-[#92400E]',
    badgeBorder: 'border-[#FCD34D]',
    accentTitle: 'text-[#78350F]',
  },
  products: {
    name: 'คลังสินค้า & ต้นทุน',
    btnInactive: 'bg-white text-stone-700 hover:bg-[#F0FDF4] hover:text-[#15803D] border-stone-200/90 hover:border-emerald-300',
    btnActive: 'bg-[#DCFCE7] text-[#166534] border-[#4ADE80] shadow-xs font-bold ring-2 ring-[#4ADE80]/30',
    iconActive: 'text-[#16A34A]',
    iconInactive: 'text-stone-400 group-hover:text-[#16A34A]',
    containerBg: 'bg-[#F7FEFA]',
    containerBorder: 'border-[#BBF7D0]',
    badgeBg: 'bg-[#DCFCE7]',
    badgeText: 'text-[#166534]',
    badgeBorder: 'border-[#86EFAC]',
    accentTitle: 'text-[#14532D]',
  },
  reports: {
    name: 'รายงานยอดขาย & กำไร',
    btnInactive: 'bg-white text-stone-700 hover:bg-[#FFF1F2] hover:text-[#BE123C] border-stone-200/90 hover:border-rose-300',
    btnActive: 'bg-[#FFE4E6] text-[#9F1239] border-[#FB7185] shadow-xs font-bold ring-2 ring-[#FB7185]/30',
    iconActive: 'text-[#E11D48]',
    iconInactive: 'text-stone-400 group-hover:text-[#E11D48]',
    containerBg: 'bg-[#FFF8F9]',
    containerBorder: 'border-[#FECDD3]',
    badgeBg: 'bg-[#FFE4E6]',
    badgeText: 'text-[#9F1239]',
    badgeBorder: 'border-[#FDA4AF]',
    accentTitle: 'text-[#881337]',
  },
  events: {
    name: 'ตารางออกบูธ & สาขา',
    btnInactive: 'bg-white text-stone-700 hover:bg-[#F0F9FF] hover:text-[#0369A1] border-stone-200/90 hover:border-sky-300',
    btnActive: 'bg-[#E0F2FE] text-[#075985] border-[#38BDF8] shadow-xs font-bold ring-2 ring-[#38BDF8]/30',
    iconActive: 'text-[#0284C7]',
    iconInactive: 'text-stone-400 group-hover:text-[#0284C7]',
    containerBg: 'bg-[#F8FCFF]',
    containerBorder: 'border-[#BAE6FD]',
    badgeBg: 'bg-[#E0F2FE]',
    badgeText: 'text-[#0369A1]',
    badgeBorder: 'border-[#7DD3FC]',
    accentTitle: 'text-[#0C4A6E]',
  },
  booth_stock: {
    name: 'เบิกของออกบูธ & เช็คสต๊อกคืน',
    btnInactive: 'bg-white text-stone-700 hover:bg-[#FFF7ED] hover:text-[#C2410C] border-stone-200/90 hover:border-orange-300',
    btnActive: 'bg-[#FFEDD5] text-[#9A3412] border-[#F97316] shadow-xs font-bold ring-2 ring-[#F97316]/30',
    iconActive: 'text-[#EA580C]',
    iconInactive: 'text-stone-400 group-hover:text-[#EA580C]',
    containerBg: 'bg-[#FFFBF7]',
    containerBorder: 'border-[#FED7AA]',
    badgeBg: 'bg-[#FFEDD5]',
    badgeText: 'text-[#9A3412]',
    badgeBorder: 'border-[#FDBA74]',
    accentTitle: 'text-[#7C2D12]',
  },
  suppliers: {
    name: 'รับสต๊อก & ซัพพลายเออร์',
    btnInactive: 'bg-white text-stone-700 hover:bg-[#F0FDFA] hover:text-[#0F766E] border-stone-200/90 hover:border-teal-300',
    btnActive: 'bg-[#CCFBF1] text-[#115E59] border-[#2DD4BF] shadow-xs font-bold ring-2 ring-[#2DD4BF]/30',
    iconActive: 'text-[#0D9488]',
    iconInactive: 'text-stone-400 group-hover:text-[#0D9488]',
    containerBg: 'bg-[#F7FEFD]',
    containerBorder: 'border-[#99F6E4]',
    badgeBg: 'bg-[#CCFBF1]',
    badgeText: 'text-[#115E59]',
    badgeBorder: 'border-[#5EEAD4]',
    accentTitle: 'text-[#134E4A]',
  },
  orders: {
    name: 'คำสั่งซื้อ',
    btnInactive: 'bg-white text-stone-700 hover:bg-[#FAF5FF] hover:text-[#7E22CE] border-stone-200/90 hover:border-purple-300',
    btnActive: 'bg-[#F3E8FF] text-[#6B21A8] border-[#C084FC] shadow-xs font-bold ring-2 ring-[#C084FC]/30',
    iconActive: 'text-[#9333EA]',
    iconInactive: 'text-stone-400 group-hover:text-[#9333EA]',
    containerBg: 'bg-[#FCF9FF]',
    containerBorder: 'border-[#E9D5FF]',
    badgeBg: 'bg-[#F3E8FF]',
    badgeText: 'text-[#6B21A8]',
    badgeBorder: 'border-[#D8B4FE]',
    accentTitle: 'text-[#581C87]',
  },
  staff: {
    name: 'จัดการพนักงาน',
    btnInactive: 'bg-white text-stone-700 hover:bg-[#EEF2FF] hover:text-[#4338CA] border-stone-200/90 hover:border-indigo-300',
    btnActive: 'bg-[#E0E7FF] text-[#3730A3] border-[#818CF8] shadow-xs font-bold ring-2 ring-[#818CF8]/30',
    iconActive: 'text-[#4F46E5]',
    iconInactive: 'text-stone-400 group-hover:text-[#4F46E5]',
    containerBg: 'bg-[#F8FAFF]',
    containerBorder: 'border-[#C7D2FE]',
    badgeBg: 'bg-[#E0E7FF]',
    badgeText: 'text-[#3730A3]',
    badgeBorder: 'border-[#A5B4FC]',
    accentTitle: 'text-[#312E81]',
  },
  settings: {
    name: 'ตั้งค่าร้านค้า',
    btnInactive: 'bg-white text-stone-700 hover:bg-[#F5F5F4] hover:text-[#44403C] border-stone-200/90 hover:border-stone-300',
    btnActive: 'bg-[#E7E5E4] text-[#292524] border-[#A8A29E] shadow-xs font-bold ring-2 ring-[#A8A29E]/30',
    iconActive: 'text-[#57534E]',
    iconInactive: 'text-stone-400 group-hover:text-[#57534E]',
    containerBg: 'bg-[#FAFAF9]',
    containerBorder: 'border-[#E7E5E4]',
    badgeBg: 'bg-[#E7E5E4]',
    badgeText: 'text-[#292524]',
    badgeBorder: 'border-[#D6D3D1]',
    accentTitle: 'text-[#1C1917]',
  },
  logs: {
    name: 'ประวัติระบบ',
    btnInactive: 'bg-white text-stone-700 hover:bg-[#F1F5F9] hover:text-[#334155] border-stone-200/90 hover:border-slate-300',
    btnActive: 'bg-[#E2E8F0] text-[#1E293B] border-[#94A3B8] shadow-xs font-bold ring-2 ring-[#94A3B8]/30',
    iconActive: 'text-[#475569]',
    iconInactive: 'text-stone-400 group-hover:text-[#475569]',
    containerBg: 'bg-[#F8FAFC]',
    containerBorder: 'border-[#CBD5E1]',
    badgeBg: 'bg-[#E2E8F0]',
    badgeText: 'text-[#1E293B]',
    badgeBorder: 'border-[#94A3B8]',
    accentTitle: 'text-[#0F172A]',
  },
};

export const AdminDashboard: React.FC = () => {
  const {
    products,
    orders,
    logoutAdmin,
    storeSettings,
    clearBrowserCacheAndReload,
    forceRealtimeSync,
    syncStatus,
    boothTransfers,
    currentStaff,
    staffUsers,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings' | 'pos' | 'logs' | 'reports' | 'suppliers' | 'events' | 'booth_stock' | 'staff'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const targetTab = sessionStorage.getItem('huda_target_tab');
      if (
        targetTab === 'reports' ||
        params.get('tab') === 'reports' ||
        params.get('report') === 'true' ||
        params.get('analytics') === 'true' ||
        params.get('sales') === 'true'
      ) {
        return 'reports';
      }
      if (params.get('tab') === 'booth_stock' || params.get('tab') === 'booth' || params.get('tab') === 'transfer') return 'booth_stock';
      if (params.get('tab') === 'suppliers' || params.get('tab') === 'supplier') return 'suppliers';
      if (params.get('tab') === 'events' || params.get('tab') === 'market') return 'events';
      if (params.get('tab') === 'products') return 'products';
      if (params.get('tab') === 'orders') return 'orders';
      if (params.get('tab') === 'settings') return 'settings';
      if (params.get('tab') === 'staff' || params.get('tab') === 'users') return 'staff';
      if (params.get('tab') === 'pos' || params.get('tab') === 'cashier') return 'pos';
    }
    return 'pos';
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [targetBoothForPOS, setTargetBoothForPOS] = useState<string | null>(null);
  const [showKpiCards, setShowKpiCards] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_admin_show_kpi');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const toggleKpiCards = () => {
    setShowKpiCards((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('huda_admin_show_kpi', String(next));
      }
      return next;
    });
  };
  const activeBoothCount = boothTransfers ? boothTransfers.filter((t) => t.status !== 'COMPLETED').length : 0;
  const currentTheme = TAB_THEMES[activeTab] || TAB_THEMES.pos;
  const isStaff = currentStaff?.role === 'STAFF';
  const canAccessPOS = !isStaff || currentStaff?.permissions?.canAccessPOS !== false;
  const canAccessBooth = !isStaff || (currentStaff?.permissions?.canAccessBoothStock !== false || currentStaff?.permissions?.canAccessBoothReturn !== false);
  const canAccessEvents = !isStaff || currentStaff?.permissions?.canAccessEvents !== false;

  // Role Guard: Restrict staff to permitted tabs only
  useEffect(() => {
    if (isStaff) {
      if (activeTab === 'pos' && !canAccessPOS) {
        if (canAccessBooth) setActiveTab('booth_stock');
        else if (canAccessEvents) setActiveTab('events');
      } else if (activeTab === 'booth_stock' && !canAccessBooth) {
        if (canAccessPOS) setActiveTab('pos');
        else if (canAccessEvents) setActiveTab('events');
      } else if (activeTab === 'events' && !canAccessEvents) {
        if (canAccessPOS) setActiveTab('pos');
        else if (canAccessBooth) setActiveTab('booth_stock');
      } else if (activeTab !== 'pos' && activeTab !== 'booth_stock' && activeTab !== 'events') {
        if (canAccessPOS) setActiveTab('pos');
        else if (canAccessBooth) setActiveTab('booth_stock');
        else if (canAccessEvents) setActiveTab('events');
      }
    }
  }, [isStaff, activeTab, canAccessPOS, canAccessBooth, canAccessEvents]);

  // Dynamic Metrics Calculation
  const totalRevenue = orders.reduce((sum, o) => (o.paymentStatus === 'paid' ? sum + o.netAmount : sum), 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;
  
  const threshold = storeSettings.lowStockThreshold || 3;
  const lowStockCount = products.filter((p) =>
    p.variants.some((v) => v.stockQuantity <= threshold)
  ).length;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkAndSetTab = () => {
        const params = new URLSearchParams(window.location.search);
        const targetTab = sessionStorage.getItem('huda_target_tab');
        if (
          targetTab === 'reports' ||
          params.get('tab') === 'reports' ||
          params.get('report') === 'true' ||
          params.get('analytics') === 'true' ||
          params.get('sales') === 'true'
        ) {
          setActiveTab('reports');
          sessionStorage.removeItem('huda_target_tab');
        } else if (
          params.get('tab') === 'pos' ||
          params.get('tab') === 'cashier'
        ) {
          setActiveTab('pos');
        } else if (
          params.get('tab') === 'orders'
        ) {
          setActiveTab('orders');
        } else if (
          params.get('tab') === 'products'
        ) {
          setActiveTab('products');
        } else if (
          params.get('tab') === 'settings'
        ) {
          setActiveTab('settings');
        }
      };

      checkAndSetTab();

      const handleSwitchEvent = () => {
        setActiveTab('reports');
      };
      const handleSwitchSuppliersStockIn = () => {
        setActiveTab('suppliers');
      };
      const handleSwitchProducts = (e: Event) => {
        const detail = (e as CustomEvent)?.detail;
        setActiveTab('products');
        if (detail) {
          const attemptScroll = (attemptsLeft: number) => {
            if (detail.productId) {
              const el = document.getElementById(`product-card-${detail.productId}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-4', 'ring-amber-400', 'transition-all');
                setTimeout(() => {
                  el.classList.remove('ring-4', 'ring-amber-400');
                }, 3500);
                return;
              }
            }
            if (attemptsLeft > 0) {
              setTimeout(() => attemptScroll(attemptsLeft - 1), 150);
              return;
            }
            if (typeof detail.scrollY === 'number') {
              window.scrollTo({ top: detail.scrollY, behavior: 'smooth' });
            }
          };
          setTimeout(() => attemptScroll(3), 100);
        }
      };

      window.addEventListener('switch_admin_tab_reports', handleSwitchEvent);
      window.addEventListener('switch_admin_tab_suppliers_stock_in', handleSwitchSuppliersStockIn);
      window.addEventListener('switch_admin_tab_products', handleSwitchProducts);
      return () => {
        window.removeEventListener('switch_admin_tab_reports', handleSwitchEvent);
        window.removeEventListener('switch_admin_tab_suppliers_stock_in', handleSwitchSuppliersStockIn);
        window.removeEventListener('switch_admin_tab_products', handleSwitchProducts);
      };
    }
  }, []);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      })
      .catch(() => {});
  }, [activeTab]);

  return (
    <div className="bg-[#FAF9F6] border-b border-stone-200 py-8 text-[#141312]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Executive Admin Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 border border-stone-200/90 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#141312] flex items-center justify-center text-[#D4B57B] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-serif font-semibold text-lg sm:text-xl text-[#141312] tracking-wide">
                  ระบบบริหารจัดการร้านค้า (Management Console)
                </h2>
                <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Cloud Sync ปกติ</span>
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                จัดการระบบขายหน้าร้าน (POS) คลังสินค้า คำสั่งซื้อ ตารางออกบูธ และรายงานผลประกอบการ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              onClick={async () => {
                if (forceRealtimeSync) await forceRealtimeSync(true, true);
              }}
              className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="ดึงข้อมูลล่าสุดจากเซิร์ฟเวอร์แบบเรียลไทม์"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-amber-600' : ''}`} />
              <span>{syncStatus === 'syncing' ? 'กำลังซิงค์...' : '🔄 ซิงค์ข้อมูลล่าสุด'}</span>
            </button>

            {currentStaff && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF9F6] border border-stone-300 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                    isStaff ? 'bg-blue-600 text-white' : 'bg-[#141312] text-[#D4B57B]'
                  }`}
                >
                  {currentStaff.name.slice(0, 1)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-[#141312] text-xs leading-tight">{currentStaff.name}</span>
                  <span className="text-[10px] text-stone-500 font-medium">
                    {isStaff ? 'พนักงานหน้าร้าน (Staff)' : 'เจ้าของร้าน (Owner)'}
                  </span>
                </div>
              </div>
            )}

            {!isStaff && (
              <button
                onClick={() => setActiveTab('reports')}
                className="px-4 py-2.5 bg-[#141312] hover:bg-[#292624] text-white font-medium text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="เปิดดูรายงานวิเคราะห์ต้นทุน กำไรสุทธิ และสรุปคลังสินค้า"
              >
                <TrendingUp className="w-4 h-4 text-[#D4B57B]" />
                <span>รายงานต้นทุน & กำไร</span>
              </button>
            )}

            {!isStaff && (
              <button
                type="button"
                onClick={toggleKpiCards}
                className="px-3.5 py-2.5 bg-white border border-stone-300 hover:border-[#141312] text-stone-700 hover:text-[#141312] font-medium text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                title={showKpiCards ? 'คลิกเพื่อซ่อนแถบสรุปภาพรวม (ยอดขาย, ออเดอร์, คลังสินค้า)' : 'คลิกเพื่อแสดงแถบสรุปภาพรวม'}
              >
                {showKpiCards ? <EyeOff className="w-3.5 h-3.5 text-stone-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{showKpiCards ? 'ซ่อนแถบสรุป' : 'แสดงแถบสรุป'}</span>
              </button>
            )}

            <button
              onClick={() => {
                if (confirm('ต้องการล้างแคชเบราว์เซอร์และรีโหลดข้อมูลล่าสุดหรือไม่?')) {
                  clearBrowserCacheAndReload();
                }
              }}
              className="px-3.5 py-2.5 bg-white border border-stone-300 hover:border-[#141312] text-stone-700 hover:text-[#141312] font-medium text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="รีเฟรชข้อมูลและล้างแคช"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเฟรชระบบ</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="px-4 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-700 font-medium text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>สลับผู้ใช้ / ออก</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Cards (Hidden for Staff or when toggled off) */}
        {!isStaff ? (
          showKpiCards ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#8C703E]" />
                  <span>ภาพรวมธุรกิจ & ยอดขาย (KPI Summary)</span>
                </span>
                <button
                  type="button"
                  onClick={toggleKpiCards}
                  className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer transition hover:underline"
                  title="คลิกเพื่อย่อซ่อนแถบสรุปนี้"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>ย่อซ่อนแถบสรุป</span>
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveTab('reports')}
                  className="p-5 bg-white hover:border-[#141312] border border-stone-200/90 space-y-1.5 cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>ยอดขายสะสมสุทธิ</span>
                    <DollarSign className="w-4 h-4 text-[#8C703E]" />
                  </div>
                  <p className="text-xl sm:text-2xl font-serif font-semibold text-[#141312]">
                    ฿{totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-[#8C703E] group-hover:underline">ดูรายละเอียดกำไร →</p>
                </div>

                <div
                  onClick={() => setActiveTab('orders')}
                  className="p-5 bg-white hover:border-[#141312] border border-stone-200/90 space-y-1.5 cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>คำสั่งซื้อทั้งหมด</span>
                    <ShoppingBag className="w-4 h-4 text-[#8C703E]" />
                  </div>
                  <p className="text-xl sm:text-2xl font-serif font-semibold text-[#141312]">
                    {totalOrdersCount} <span className="text-xs font-sans font-normal text-stone-500">รายการ</span>
                  </p>
                  <p className="text-[11px] text-stone-500 group-hover:text-[#141312]">จัดการคำสั่งซื้อ →</p>
                </div>

                <div
                  onClick={() => setActiveTab('products')}
                  className="p-5 bg-white hover:border-[#141312] border border-stone-200/90 space-y-1.5 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>รายการสินค้าในคลัง</span>
                    <Layers className="w-4 h-4 text-[#8C703E]" />
                  </div>
                  <p className="text-xl sm:text-2xl font-serif font-semibold text-[#141312]">
                    {totalProductsCount} <span className="text-xs font-sans font-normal text-stone-500">รุ่น</span>
                  </p>
                  <p className="text-[11px] text-stone-500">แยกสต๊อกตามขนาดและสี</p>
                </div>

                <div
                  onClick={() => setActiveTab('products')}
                  className="p-5 bg-white hover:border-[#141312] border border-stone-200/90 space-y-1.5 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>สินค้าใกล้หมดสต๊อก</span>
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                  </div>
                  <p className="text-xl sm:text-2xl font-serif font-semibold text-amber-800">
                    {lowStockCount} <span className="text-xs font-sans font-normal text-stone-500">รุ่น</span>
                  </p>
                  <p className="text-[11px] text-stone-500">คงเหลือ ≤ {threshold} ชิ้น</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 px-4 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 transition">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-stone-400" />
                <span className="font-medium text-stone-700">แถบสรุปยอดขายและสต๊อก (KPI) ถูกย่อซ่อนอยู่</span>
                <span className="hidden sm:inline text-stone-300">|</span>
                <span className="hidden sm:inline text-stone-500 text-[11px]">
                  ยอดขาย ฿{totalRevenue.toLocaleString()} • ออเดอร์ {totalOrdersCount} รายการ • สต๊อก {totalProductsCount} รุ่น
                </span>
              </div>
              <button
                type="button"
                onClick={toggleKpiCards}
                className="px-3 py-1.5 bg-white border border-stone-300 hover:border-stone-500 text-stone-700 font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>เปิดแสดงแถบสรุป</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>
            </div>
          )
        ) : (
          <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-300 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs text-base shrink-0">
                👤
              </div>
              <div>
                <div className="font-bold text-sm text-[#141312] flex items-center gap-2 flex-wrap">
                  <span>เข้าสู่ระบบโดย: <strong>{currentStaff?.name || 'พนักงานหน้าร้าน'}</strong></span>
                  <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                    พนักงานหน้าร้าน (Staff)
                  </span>
                </div>
                <div className="text-xs text-stone-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>
                    {currentStaff?.assignedBranch
                      ? `📍 ประจำสาขา: ${currentStaff.assignedBranch}`
                      : 'ปฏิบัติงานระบบขาย POS และเบิกสินค้าออกบูธ'}
                  </span>
                  <span className="text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md text-[10px]">
                    🔒 เมนูจัดการพนักงาน & คลังสินค้าถูกซ่อนตามสิทธิ์ความปลอดภัย
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <span className="text-xs bg-white text-blue-900 border border-blue-200 px-3 py-1.5 font-bold rounded-xl shadow-2xs">
                บูธที่เปิด: {activeBoothCount} บูธ
              </span>
              <button
                type="button"
                onClick={logoutAdmin}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl border-2 border-amber-600 shadow-xs cursor-pointer flex items-center gap-1.5 transition"
                title="ออกจากโหมดพนักงาน เพื่อเข้าเป็นเจ้าของร้าน"
              >
                <span>🔑 สลับเข้าเป็นเจ้าของร้าน (Admin PIN 1077)</span>
              </button>
            </div>
          </div>
        )}

                {/* Clean Pastel Tab Switcher Bar */}
        <div className="flex flex-wrap gap-2 border-b border-stone-200/90 pb-3">
          {/* 1. POS */}
          {canAccessPOS && (
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3.5 py-2.5 text-xs sm:text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer border rounded-xl group ${
                activeTab === 'pos' ? TAB_THEMES.pos.btnActive : TAB_THEMES.pos.btnInactive
              }`}
              title="แคชเชียร์หน้าร้าน (POS)"
            >
              <Store className={`w-4 h-4 transition-colors ${activeTab === 'pos' ? TAB_THEMES.pos.iconActive : TAB_THEMES.pos.iconInactive}`} />
              <span>แคชเชียร์หน้าร้าน (POS)</span>
            </button>
          )}

          {/* 2. Products (คลังสินค้า & ต้นทุน) */}
          {!isStaff && (
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-2.5 text-xs sm:text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer border rounded-xl group ${
                activeTab === 'products' ? TAB_THEMES.products.btnActive : TAB_THEMES.products.btnInactive
              }`}
              title="คลังสินค้า & ต้นทุน"
            >
              <Layers className={`w-4 h-4 transition-colors ${activeTab === 'products' ? TAB_THEMES.products.iconActive : TAB_THEMES.products.iconInactive}`} />
              <span>คลังสินค้า & ต้นทุน ({products.length})</span>
            </button>
          )}

          {/* 3. Reports (รายงานยอดขาย & กำไร) */}
          {!isStaff && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-2.5 text-xs sm:text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer border rounded-xl group ${
                activeTab === 'reports' ? TAB_THEMES.reports.btnActive : TAB_THEMES.reports.btnInactive
              }`}
              title="รายงานยอดขาย & กำไร"
            >
              <TrendingUp className={`w-4 h-4 transition-colors ${activeTab === 'reports' ? TAB_THEMES.reports.iconActive : TAB_THEMES.reports.iconInactive}`} />
              <span>รายงานยอดขาย & กำไร</span>
            </button>
          )}

          {/* 4. Events Schedule (ตารางออกบูธ & สาขา) */}
          {canAccessEvents && (
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3.5 py-2.5 text-xs sm:text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer border rounded-xl group ${
                activeTab === 'events' ? TAB_THEMES.events.btnActive : TAB_THEMES.events.btnInactive
              }`}
              title="ตารางออกบูธ & สาขา"
            >
              <Calendar className={`w-4 h-4 transition-colors ${activeTab === 'events' ? TAB_THEMES.events.iconActive : TAB_THEMES.events.iconInactive}`} />
              <span>ตารางออกบูธ & สาขา</span>
            </button>
          )}

          {/* 5. Booth Stock (เบิกของออกบูธ & เช็คสต๊อกคืน) */}
          {canAccessBooth && (
            <button
              onClick={() => setActiveTab('booth_stock')}
              className={`px-3.5 py-2.5 text-xs sm:text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer border rounded-xl group ${
                activeTab === 'booth_stock' ? TAB_THEMES.booth_stock.btnActive : TAB_THEMES.booth_stock.btnInactive
              }`}
              title="เบิกของออกบูธ & เช็คสต๊อกคืน"
            >
              <PackageCheck className={`w-4 h-4 transition-colors ${activeTab === 'booth_stock' ? TAB_THEMES.booth_stock.iconActive : TAB_THEMES.booth_stock.iconInactive}`} />
              <span>เบิกของออกบูธ & เช็คสต๊อกคืน</span>
              {activeBoothCount > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full transition ${
                  activeTab === 'booth_stock'
                    ? 'bg-[#FED7AA] text-[#7C2D12]'
                    : 'bg-stone-100 text-stone-600 group-hover:bg-orange-100 group-hover:text-orange-900'
                }`}>
                  {activeBoothCount}
                </span>
              )}
            </button>
          )}

          {/* Admin Owner Only Tabs */}
          {!isStaff && (
            <>
              {/* 6. Suppliers */}
              <button
                onClick={() => setActiveTab('suppliers')}
                className={`px-3.5 py-2.5 text-xs sm:text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer border rounded-xl group ${
                  activeTab === 'suppliers' ? TAB_THEMES.suppliers.btnActive : TAB_THEMES.suppliers.btnInactive
                }`}
                title="รับสต๊อก & ซัพพลายเออร์"
              >
                <Truck className={`w-4 h-4 transition-colors ${activeTab === 'suppliers' ? TAB_THEMES.suppliers.iconActive : TAB_THEMES.suppliers.iconInactive}`} />
                <span>รับสต๊อก & ซัพพลายเออร์</span>
              </button>

              {/* 7. Orders */}
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3.5 py-2.5 text-xs sm:text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer border rounded-xl group ${
                  activeTab === 'orders' ? TAB_THEMES.orders.btnActive : TAB_THEMES.orders.btnInactive
                }`}
                title="คำสั่งซื้อ"
              >
                <ShoppingBag className={`w-4 h-4 transition-colors ${activeTab === 'orders' ? TAB_THEMES.orders.iconActive : TAB_THEMES.orders.iconInactive}`} />
                <span>คำสั่งซื้อ ({orders.length})</span>
              </button>

              {/* 8. Staff Management */}
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-3.5 py-2.5 text-xs sm:text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer border rounded-xl group ${
                  activeTab === 'staff' ? TAB_THEMES.staff.btnActive : TAB_THEMES.staff.btnInactive
                }`}
                title="จัดการพนักงาน"
              >
                <Users className={`w-4 h-4 transition-colors ${activeTab === 'staff' ? TAB_THEMES.staff.iconActive : TAB_THEMES.staff.iconInactive}`} />
                <span>จัดการพนักงาน ({staffUsers.length})</span>
              </button>

              {/* 9. Settings */}
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3.5 py-2.5 text-xs sm:text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer border rounded-xl group ${
                  activeTab === 'settings' ? TAB_THEMES.settings.btnActive : TAB_THEMES.settings.btnInactive
                }`}
                title="ตั้งค่าร้านค้า"
              >
                <Settings className={`w-4 h-4 transition-colors ${activeTab === 'settings' ? TAB_THEMES.settings.iconActive : TAB_THEMES.settings.iconInactive}`} />
                <span>ตั้งค่าร้านค้า</span>
              </button>

              {/* 10. Audit Logs */}
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3.5 py-2.5 text-xs sm:text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer border rounded-xl group ${
                  activeTab === 'logs' ? TAB_THEMES.logs.btnActive : TAB_THEMES.logs.btnInactive
                }`}
                title="ประวัติระบบ"
              >
                <History className={`w-4 h-4 transition-colors ${activeTab === 'logs' ? TAB_THEMES.logs.iconActive : TAB_THEMES.logs.iconInactive}`} />
                <span>ประวัติระบบ</span>
              </button>
            </>
          )}
        </div>

        {/* Themed Tab Content Container (Matching soft pastel tint & frame) */}
        <div className={`p-4 sm:p-6 rounded-3xl border-2 transition-all duration-200 shadow-xs ${currentTheme.containerBg} ${currentTheme.containerBorder}`}>
          {/* Active Tab Indicator Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-stone-200/80">
            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-1 text-xs font-black rounded-lg border flex items-center gap-1.5 shadow-2xs ${currentTheme.badgeBg} ${currentTheme.badgeText} ${currentTheme.badgeBorder}`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                <span>กำลังเปิดใช้งาน</span>
              </span>
              <span className={`font-serif font-black text-sm sm:text-base tracking-wide ${currentTheme.accentTitle}`}>
                {currentTheme.name}
              </span>
            </div>
            <div className="text-xs text-stone-500 font-bold hidden sm:block">
              ระบบจัดการร้านค้า HUDA ABAYA DUBAI
            </div>
          </div>
        {/* Automatic Booth Opening & Closing Time Reminder Modal */}
        <BoothTimeReminderModal
          onNavigateTab={(tab) => {
            if (tab === 'events') setActiveTab('events');
            else if (tab === 'booth_stock') setActiveTab('booth_stock');
            else if (tab === 'pos') setActiveTab('pos');
            else if (tab === 'reports') setActiveTab('reports');
            else if (tab === 'suppliers') setActiveTab('suppliers');
            else if (tab === 'products') setActiveTab('products');
            else if (tab === 'orders') setActiveTab('orders');
            else if (tab === 'staff') setActiveTab('staff');
            else if (tab === 'settings') setActiveTab('settings');
            else if (tab === 'logs') setActiveTab('logs');
          }}
          onOpenPOSWithBooth={(boothId) => {
            setTargetBoothForPOS(boothId);
            setActiveTab('pos');
          }}
        />

        {activeTab === 'pos' && (
          <AdminPOSManager
            initialBoothTransferId={targetBoothForPOS}
            onNavigateTab={(tab) => {
              if (tab === 'events') setActiveTab('events');
              else if (tab === 'booth_stock') setActiveTab('booth_stock');
              else if (tab === 'pos') setActiveTab('pos');
              else if (tab === 'reports') setActiveTab('reports');
            }}
          />
        )}
        {activeTab === 'products' && <AdminProductManager />}
        {activeTab === 'events' && <AdminEventMarketManager />}
        {activeTab === 'booth_stock' && (
          <AdminBoothStockManager
            onOpenPOSWithBooth={(boothId) => {
              setTargetBoothForPOS(boothId);
              setActiveTab('pos');
            }}
          />
        )}
        {activeTab === 'reports' && <AdminSalesReportManager />}
        {activeTab === 'suppliers' && <AdminSupplierSettlementManager />}
        {activeTab === 'orders' && <AdminOrderManager />}
        {activeTab === 'settings' && !isStaff && <AdminSettingsManager />}
        {activeTab === 'staff' && !isStaff && <AdminStaffManager />}
        {activeTab === 'logs' && (
          <div className="bg-white p-6 rounded-2xl border-2 border-amber-400/60 space-y-4 shadow-xl text-stone-950">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-black text-lg text-stone-950 flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" />
                <span>บันทึกประวัติการเพิ่ม/แก้ไขข้อมูลเรียลไทม์ (Audit Logs)</span>
              </h3>
              <span className="text-xs text-stone-800 font-black">บันทึกเครื่อง อุปกรณ์ และเวลา UTC ล่าสุด</span>
            </div>

            {auditLogs.length === 0 ? (
              <p className="text-xs text-stone-700 font-black py-6 text-center">ยังไม่มีประวัติการทำรายการย้อนหลัง</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-xs border-collapse text-stone-950">
                  <thead>
                    <tr className="border-b-2 border-amber-400/40 text-stone-950 font-serif text-xs sm:text-sm">
                      <th className="py-3 px-3 font-black">เวลา (Timestamp)</th>
                      <th className="py-3 px-3 font-black">ประเภทกิจกรรม</th>
                      <th className="py-3 px-3 font-black">ผู้ทำรายการ / อุปกรณ์</th>
                      <th className="py-3 px-3 font-black">รายละเอียด (Description)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-950">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-amber-50/60 transition">
                        <td className="py-3 px-3 font-mono text-xs text-stone-950 font-black whitespace-nowrap">
                          {formatThaiDateTime(log.timestamp)}
                        </td>
                        <td className="py-3 px-3 font-black">
                          <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-950 border border-stone-300 text-xs font-black">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-black flex items-center gap-1.5 text-stone-950">
                          {log.performedBy.includes('Mobile') || log.performedBy.includes('iPhone') ? (
                            <Smartphone className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Monitor className="w-4 h-4 text-amber-600" />
                          )}
                          <span>{log.performedBy}</span>
                        </td>
                        <td className="py-3 px-3 text-stone-950 font-extrabold">{log.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        </div>
      </div>
    </div>
  );
};
