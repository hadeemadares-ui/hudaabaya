'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Layers, AlertCircle, LogOut, ShieldCheck, Settings, Store, Sparkles, Clock, History, Smartphone, Monitor, TrendingUp, RotateCcw, Truck, Calendar } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AdminProductManager } from './AdminProductManager';
import { AdminOrderManager } from './AdminOrderManager';
import { AdminSettingsManager } from './AdminSettingsManager';
import { AdminPOSManager } from './AdminPOSManager';
import { AdminSalesReportManager } from './AdminSalesReportManager';
import { AdminSupplierSettlementManager } from './AdminSupplierSettlementManager';
import { AdminEventMarketManager } from './AdminEventMarketManager';
import { AuditLog } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    orders,
    logoutAdmin,
    storeSettings,
    clearBrowserCacheAndReload,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings' | 'pos' | 'logs' | 'reports' | 'suppliers' | 'events'>(() => {
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
      if (params.get('tab') === 'suppliers' || params.get('tab') === 'supplier') return 'suppliers';
      if (params.get('tab') === 'events' || params.get('tab') === 'market') return 'events';
      if (params.get('tab') === 'pos' || params.get('tab') === 'cashier') return 'pos';
      if (params.get('tab') === 'orders') return 'orders';
      if (params.get('tab') === 'settings') return 'settings';
    }
    return 'products';
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

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
          params.get('tab') === 'settings'
        ) {
          setActiveTab('settings');
        }
      };

      checkAndSetTab();

      const handleSwitchEvent = () => {
        setActiveTab('reports');
      };
      window.addEventListener('switch_admin_tab_reports', handleSwitchEvent);
      return () => {
        window.removeEventListener('switch_admin_tab_reports', handleSwitchEvent);
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
    <div className="bg-[#FAF9F6] border-b-2 border-amber-400/50 py-8 text-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Admin Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-amber-400/60 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 border-2 border-amber-500 flex items-center justify-center text-amber-700 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif font-black text-xl sm:text-2xl text-stone-950 tracking-wide">
                  HUDA ABAYA Backoffice (ระบบผู้ดูแลร้านค้า)
                </h2>
                <span className="text-xs bg-emerald-100 text-emerald-950 border border-emerald-500 px-2.5 py-0.5 rounded-full font-black font-sans flex items-center gap-1">
                  ● เชื่อมต่อระบบเรียลไทม์ 100%
                </span>
                <span className="text-xs bg-amber-100 text-amber-950 border border-amber-500 px-2.5 py-0.5 rounded-full font-black font-sans">
                  v1.0.8 White Theme High-Contrast
                </span>
              </div>
              <p className="text-xs text-stone-800 font-extrabold mt-1">
                จัดการสต๊อกสินค้าเสื้อผ้าและน้ำหอมดูไบ คิดเงิน POS ตรวจสอบออเดอร์ และดูรายงานวิเคราะห์ต้นทุน/กำไร
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setActiveTab('reports')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer border border-emerald-700"
              title="เปิดดูรายงานวิเคราะห์ต้นทุน กำไรสุทธิ และสรุปคลังสินค้า"
            >
              <TrendingUp className="w-4 h-4 text-white" />
              <span>ดูรายงานต้นทุน & กำไร</span>
            </button>

            <button
              onClick={() => {
                if (confirm('คุณต้องการล้างแคชเบราว์เซอร์เครื่องนี้และรีโหลดเวอร์ชันใหม่ล่าสุด 100% ใช่หรือไม่?')) {
                  clearBrowserCacheAndReload();
                }
              }}
              className="px-3.5 py-2.5 bg-amber-100 border-2 border-amber-500 hover:bg-amber-200 text-amber-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-md relative cursor-pointer"
              title="ล้างไฟล์ค้างแคชในมือถือ/คอมพิวเตอร์นี้และดึงเวอร์ชันล่าสุด"
            >
              <span className="animate-pulse bg-amber-400 text-stone-950 text-[10px] px-1.5 py-0.2 rounded font-black mr-0.5">NEW</span>
              <RotateCcw className="w-4 h-4 text-amber-900" />
              <span>ล้างแคช</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="px-4 py-2.5 bg-red-100 border-2 border-red-500 hover:bg-red-200 text-red-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-950" />
              <span>ออกจากหลังบ้าน</span>
            </button>
          </div>
        </div>

        {/* Dynamic Stats Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveTab('reports')}
            className="p-4 bg-white hover:bg-amber-50/50 border-2 border-amber-400/80 hover:border-amber-500 rounded-2xl space-y-1.5 shadow-lg cursor-pointer transition group text-stone-950"
            title="กดที่นี่เพื่อเปิดดูรายงานยอดขาย ต้นทุน และกำไรสุทธิ"
          >
            <div className="flex items-center justify-between text-xs text-stone-900 font-black">
              <span>ยอดขายสะสมสุทธิ</span>
              <DollarSign className="w-4 h-4 text-amber-600 group-hover:scale-110 transition" />
            </div>
            <p className="text-xl sm:text-2xl font-serif font-black text-amber-900">
              ฿{totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-800 font-black">กดเพื่อดูรายงานต้นทุน & กำไร</p>
          </div>

          <div
            onClick={() => setActiveTab('reports')}
            className="p-4 bg-white hover:bg-amber-50/50 border-2 border-amber-400/80 hover:border-amber-500 rounded-2xl space-y-1.5 shadow-lg cursor-pointer transition group text-stone-950"
            title="กดที่นี่เพื่อเปิดดูรายงานยอดขาย ต้นทุน และกำไรสุทธิ"
          >
            <div className="flex items-center justify-between text-xs text-stone-900 font-black">
              <span>คำสั่งซื้อทั้งหมด</span>
              <ShoppingBag className="w-4 h-4 text-amber-600 group-hover:scale-110 transition" />
            </div>
            <p className="text-xl sm:text-2xl font-serif font-black text-stone-950">
              {totalOrdersCount} <span className="text-xs font-sans font-black text-stone-800">รายการ</span>
            </p>
            <p className="text-xs text-emerald-800 font-black">กดเพื่อดูตารางขายสินค้า</p>
          </div>

          <div className="p-4 bg-white border-2 border-amber-400/80 rounded-2xl space-y-1.5 shadow-lg text-stone-950">
            <div className="flex items-center justify-between text-xs text-stone-900 font-black">
              <span>รายการสินค้าในร้าน</span>
              <Layers className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl sm:text-2xl font-serif font-black text-stone-950">
              {totalProductsCount} <span className="text-xs font-sans font-black text-stone-800">แบบ/รุ่น</span>
            </p>
            <p className="text-xs text-stone-800 font-bold">แยกสต๊อกรายไซส์</p>
          </div>

          <div className="p-4 bg-white border-2 border-amber-400/80 rounded-2xl space-y-1.5 shadow-lg text-stone-950">
            <div className="flex items-center justify-between text-xs text-amber-900 font-black">
              <span>แจ้งเตือนไซส์สต๊อกต่ำ</span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl sm:text-2xl font-serif font-black text-amber-900">
              {lowStockCount} <span className="text-xs font-sans font-black text-stone-800">แบบ</span>
            </p>
            <p className="text-xs text-amber-800 font-black">สต๊อกเหลือน้อยกว่า {threshold} ชิ้น</p>
          </div>
        </div>

        {/* Tab Switcher Bar */}
        <div className="flex flex-wrap gap-2.5 border-b-2 border-amber-400/40 pb-3">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md cursor-pointer ${
              activeTab === 'products'
                ? 'bg-amber-400 text-stone-950 shadow-lg border-2 border-amber-500'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            <Layers className="w-4.5 h-4.5 text-stone-950" />
            <span>จัดการสต๊อกสินค้า & ใส่ต้นทุน ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-amber-400 text-stone-950 shadow-lg border-2 border-amber-500'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            <Store className="w-4.5 h-4.5 text-stone-950" />
            <span>คิดเงินหน้าร้าน (POS Cashier)</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-emerald-500 text-stone-950 shadow-lg border-2 border-emerald-600'
                : 'bg-white text-emerald-950 hover:bg-emerald-50 border-2 border-emerald-600/60 shadow-md'
            }`}
          >
            <TrendingUp className="w-4.5 h-4.5 text-emerald-900" />
            <span>เปิดรายงานยอดขาย & กำไรสุทธิ</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md cursor-pointer ${
              activeTab === 'events'
                ? 'bg-amber-400 text-stone-950 shadow-lg border-2 border-amber-500'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            <Calendar className="w-4.5 h-4.5 text-stone-950" />
            <span>ตารางออกงาน &amp; ตลาดนัด</span>
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md cursor-pointer ${
              activeTab === 'suppliers'
                ? 'bg-amber-400 text-stone-950 shadow-lg border-2 border-amber-500'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            <Truck className="w-4.5 h-4.5 text-stone-950" />
            <span>สินค้าเข้า-ออก &amp; เคลียร์ Supplier</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-400 text-stone-950 shadow-lg border-2 border-amber-500'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-stone-950" />
            <span>ออเดอร์ ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-amber-400 text-stone-950 shadow-lg border-2 border-amber-500'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            <Settings className="w-4 h-4 text-stone-950" />
            <span>ตั้งค่าร้านค้า</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-amber-400 text-stone-950 shadow-lg border-2 border-amber-500'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            <History className="w-4 h-4 text-stone-950" />
            <span>ประวัติเครื่อง</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'pos' && <AdminPOSManager />}
        {activeTab === 'reports' && <AdminSalesReportManager />}
        {activeTab === 'events' && <AdminEventMarketManager />}
        {activeTab === 'suppliers' && <AdminSupplierSettlementManager />}
        {activeTab === 'products' && <AdminProductManager />}
        {activeTab === 'orders' && <AdminOrderManager />}
        {activeTab === 'settings' && <AdminSettingsManager />}
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
                <table className="w-full text-left text-xs border-collapse text-stone-950">
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
                        <td className="py-3 px-3 font-mono text-xs text-stone-950 font-black">
                          {new Date(log.timestamp).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
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
  );
};
