'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Layers, AlertCircle, LogOut, ShieldCheck, Settings, Store, Sparkles, Clock, History, Smartphone, Monitor, TrendingUp, RotateCcw } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AdminProductManager } from './AdminProductManager';
import { AdminOrderManager } from './AdminOrderManager';
import { AdminSettingsManager } from './AdminSettingsManager';
import { AdminPOSManager } from './AdminPOSManager';
import { AdminSalesReportManager } from './AdminSalesReportManager';
import { AuditLog } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    orders,
    logoutAdmin,
    storeSettings,
    clearBrowserCacheAndReload,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings' | 'pos' | 'logs' | 'reports'>(() => {
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
    <div className="bg-dubai-dark border-b-2 border-gold-400/50 py-8 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Admin Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dubai-black p-5 rounded-2xl border border-gold-400/40 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-500/20 border border-gold-400 flex items-center justify-center text-gold-400 shadow-gold-glow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif font-extrabold text-xl text-white tracking-wide">
                  HUDA ABAYA Backoffice (ระบบผู้ดูแลร้านค้า)
                </h2>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-2.5 py-0.5 rounded-full font-bold font-sans flex items-center gap-1">
                  ● เชื่อมต่อระบบเรียลไทม์ 100%
                </span>
                <span className="text-[10px] bg-gold-500/20 text-gold-300 border border-gold-400/40 px-2 py-0.5 rounded-full font-bold font-sans">
                  เวอร์ชันใหม่ v1.0.6
                </span>
              </div>
              <p className="text-xs text-gold-300/80 mt-1">
                จัดการสต๊อกสินค้าเสื้อผ้าและน้ำหอมดูไบ คิดเงิน POS ตรวจสอบออเดอร์ และดูรายงานวิเคราะห์ต้นทุน/กำไร
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setActiveTab('reports')}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-gold-glow cursor-pointer border border-emerald-400/40"
              title="เปิดดูรายงานวิเคราะห์ต้นทุน กำไรสุทธิ และสรุปคลังสินค้า"
            >
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              <span>ดูรายงานต้นทุน & กำไร</span>
            </button>

            <button
              onClick={() => {
                if (confirm('คุณต้องการล้างแคชเบราว์เซอร์เครื่องนี้และรีโหลดเวอร์ชันใหม่ล่าสุด 100% ใช่หรือไม่?')) {
                  clearBrowserCacheAndReload();
                }
              }}
              className="px-3 py-2 bg-amber-950/80 border border-amber-600/50 hover:bg-amber-900 text-amber-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-md relative"
              title="ล้างไฟล์ค้างแคชในมือถือ/คอมพิวเตอร์นี้และดึงเวอร์ชันล่าสุด"
            >
              <span className="animate-pulse bg-gold-500 text-dubai-black text-[9px] px-1.5 py-0.2 rounded font-extrabold mr-0.5">NEW</span>
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>ล้างแคช</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="px-4 py-2 bg-red-950/80 border border-red-700/50 hover:bg-red-900 text-red-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากหลังบ้าน</span>
            </button>
          </div>
        </div>

        {/* Dynamic Stats Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveTab('reports')}
            className="p-4 bg-dubai-card hover:bg-gold-500/10 border-2 border-gold-400/40 hover:border-gold-400 rounded-xl space-y-1 shadow-md cursor-pointer transition group"
            title="กดที่นี่เพื่อเปิดดูรายงานยอดขาย ต้นทุน และกำไรสุทธิ"
          >
            <div className="flex items-center justify-between text-xs text-gold-400 font-bold">
              <span>ยอดขายสะสมสุทธิ</span>
              <DollarSign className="w-4 h-4 text-gold-400 group-hover:scale-110 transition" />
            </div>
            <p className="text-xl sm:text-2xl font-serif font-extrabold text-gold-300">
              ฿{totalRevenue.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-400 font-bold">กดเพื่อดูรายงานต้นทุน & กำไร</p>
          </div>

          <div
            onClick={() => setActiveTab('reports')}
            className="p-4 bg-dubai-card hover:bg-gold-500/10 border-2 border-gold-400/40 hover:border-gold-400 rounded-xl space-y-1 shadow-md cursor-pointer transition group"
            title="กดที่นี่เพื่อเปิดดูรายงานยอดขาย ต้นทุน และกำไรสุทธิ"
          >
            <div className="flex items-center justify-between text-xs text-gold-400 font-bold">
              <span>คำสั่งซื้อทั้งหมด</span>
              <ShoppingBag className="w-4 h-4 text-gold-400 group-hover:scale-110 transition" />
            </div>
            <p className="text-xl sm:text-2xl font-serif font-extrabold text-white">
              {totalOrdersCount} <span className="text-xs font-sans font-normal text-gray-400">รายการ</span>
            </p>
            <p className="text-[10px] text-emerald-400 font-bold">กดเพื่อดูตารางขายสินค้า</p>
          </div>

          <div className="p-4 bg-dubai-card border border-gold-400/30 rounded-xl space-y-1 shadow-md">
            <div className="flex items-center justify-between text-xs text-gold-400">
              <span>รายการสินค้าในร้าน</span>
              <Layers className="w-4 h-4" />
            </div>
            <p className="text-xl sm:text-2xl font-serif font-extrabold text-white">
              {totalProductsCount} <span className="text-xs font-sans font-normal text-gray-400">แบบ/รุ่น</span>
            </p>
            <p className="text-[10px] text-gray-400">แยกสต๊อกรายไซส์</p>
          </div>

          <div className="p-4 bg-dubai-card border border-gold-400/30 rounded-xl space-y-1 shadow-md">
            <div className="flex items-center justify-between text-xs text-amber-400">
              <span>แจ้งเตือนไซส์สต๊อกต่ำ</span>
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="text-xl sm:text-2xl font-serif font-extrabold text-amber-300">
              {lowStockCount} <span className="text-xs font-sans font-normal text-gray-400">แบบ</span>
            </p>
            <p className="text-[10px] text-amber-400 font-bold">สต๊อกเหลือน้อยกว่า {threshold} ชิ้น</p>
          </div>
        </div>

        {/* Tab Switcher Bar */}
        <div className="flex flex-wrap gap-2.5 border-b border-gold-400/20 pb-3">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-amber-500 via-gold-400 to-amber-600 text-dubai-black shadow-gold-glow scale-102 border-2 border-amber-300 font-sans'
                : 'bg-dubai-card text-gold-300 hover:text-white border-2 border-gold-400/40'
            }`}
          >
            <Layers className="w-4.5 h-4.5 text-gold-400" />
            <span>จัดการสต๊อกสินค้า & ใส่ต้นทุน ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md ${
              activeTab === 'pos'
                ? 'bg-gold-500 text-dubai-black shadow-gold-glow scale-102 border-2 border-gold-300'
                : 'bg-dubai-card text-gold-300/80 hover:text-white border border-gold-400/30'
            }`}
          >
            <Store className="w-4.5 h-4.5 text-gold-400" />
            <span>คิดเงินหน้าร้าน (POS Cashier)</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-dubai-black font-extrabold shadow-gold-glow scale-102 border-2 border-emerald-300'
                : 'bg-emerald-950/80 text-emerald-300 hover:text-white border-2 border-emerald-500/60 shadow-md'
            }`}
          >
            <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
            <span>เปิดรายงานยอดขาย & กำไรสุทธิ</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-gold-500 text-dubai-black shadow-gold-glow font-extrabold'
                : 'bg-dubai-card text-gold-300/70 hover:text-white border border-gold-400/20'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-gold-400" />
            <span>ออเดอร์ ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-gold-500 text-dubai-black shadow-gold-glow font-extrabold'
                : 'bg-dubai-card text-gold-300/70 hover:text-white border border-gold-400/20'
            }`}
          >
            <Settings className="w-4 h-4 text-gold-400" />
            <span>ตั้งค่าร้านค้า</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-gold-500 text-dubai-black shadow-gold-glow font-extrabold'
                : 'bg-dubai-card text-gold-300/70 hover:text-white border border-gold-400/20'
            }`}
          >
            <History className="w-4 h-4 text-gold-400" />
            <span>ประวัติเครื่อง</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'pos' && <AdminPOSManager />}
        {activeTab === 'reports' && <AdminSalesReportManager />}
        {activeTab === 'products' && <AdminProductManager />}
        {activeTab === 'orders' && <AdminOrderManager />}
        {activeTab === 'settings' && <AdminSettingsManager />}
        {activeTab === 'logs' && (
          <div className="bg-dubai-card p-6 rounded-2xl border border-gold-400/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-gold-300 flex items-center gap-2">
                <History className="w-5 h-5 text-gold-400" />
                <span>บันทึกประวัติการเพิ่ม/แก้ไขข้อมูลเรียลไทม์ (Audit Logs)</span>
              </h3>
              <span className="text-xs text-gray-400">บันทึกเครื่อง อุปกรณ์ และเวลา UTC ล่าสุด</span>
            </div>

            {auditLogs.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">ยังไม่มีประวัติการทำรายการย้อนหลัง</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gold-400/20 text-gold-400 font-serif">
                      <th className="py-2.5 px-3">เวลา (Timestamp)</th>
                      <th className="py-2.5 px-3">ประเภทกิจกรรม</th>
                      <th className="py-2.5 px-3">ผู้ทำรายการ / อุปกรณ์</th>
                      <th className="py-2.5 px-3">รายละเอียด (Description)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-400/10 text-gray-200">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-dubai-black/40">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-gold-300">
                          {new Date(log.timestamp).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <span className="px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 border border-gold-400/30 text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium flex items-center gap-1.5">
                          {log.performedBy.includes('Mobile') || log.performedBy.includes('iPhone') ? (
                            <Smartphone className="w-3.5 h-3.5 text-gold-400" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5 text-gold-400" />
                          )}
                          <span>{log.performedBy}</span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-300">{log.description}</td>
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
