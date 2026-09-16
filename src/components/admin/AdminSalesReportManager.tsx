'use client';

import React, { useState } from 'react';
import { Calendar, TrendingUp, DollarSign, Package, PieChart, Download, ArrowUpRight, ArrowDownRight, Layers, FileSpreadsheet, RefreshCw, Sparkles, Filter } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Order, CartItem } from '../../types';

export const AdminSalesReportManager: React.FC = () => {
  const { orders } = useShop();

  // Filter Mode: 'today' | 'month' | 'year' | 'all' | 'custom'
  const [filterMode, setFilterMode] = useState<'today' | 'month' | 'year' | 'all' | 'custom'>('month');
  
  // Custom Date Range State (YYYY-MM-DD)
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Helper to test if date string falls within selected filter
  const isDateInFilterRange = (dateStr: string) => {
    if (!dateStr) return false;
    const orderDate = new Date(dateStr);
    const now = new Date();

    if (filterMode === 'today') {
      return (
        orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getDate() === now.getDate()
      );
    }

    if (filterMode === 'month') {
      return (
        orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth()
      );
    }

    if (filterMode === 'year') {
      return orderDate.getFullYear() === now.getFullYear();
    }

    if (filterMode === 'all') {
      return true;
    }

    if (filterMode === 'custom') {
      if (!startDate || !endDate) return true;
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T23:59:59`);
      return orderDate >= start && orderDate <= end;
    }

    return true;
  };

  // Filter orders by date & paid status
  const filteredOrders = orders.filter(
    (o) => (o.paymentStatus === 'paid' || o.orderStatus === 'delivered' || o.orderStatus === 'shipped') && isDateInFilterRange(o.createdAt)
  );

  // Financial Calculations
  let totalRevenue = 0;
  let totalCost = 0;
  let totalItemsSold = 0;

  // Aggregate Product Performance
  const productSalesMap = new Map<
    string,
    {
      productTitle: string;
      variantName: string;
      category: string;
      quantity: number;
      revenue: number;
      cost: number;
      profit: number;
    }
  >();

  filteredOrders.forEach((order) => {
    totalRevenue += order.netAmount;
    
    order.items.forEach((item) => {
      totalItemsSold += item.quantity;
      
      // Cost price calculation: fallback to 50% of price if not specified
      const itemCostPrice = item.costPrice !== undefined && item.costPrice > 0 
        ? item.costPrice 
        : Math.round(item.price * 0.5);
      
      const itemTotalCost = itemCostPrice * item.quantity;
      const itemTotalRevenue = item.price * item.quantity;
      totalCost += itemTotalCost;

      const key = `${item.productTitle}___${item.variantName}`;
      const existing = productSalesMap.get(key);

      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += itemTotalRevenue;
        existing.cost += itemTotalCost;
        existing.profit += itemTotalRevenue - itemTotalCost;
      } else {
        productSalesMap.set(key, {
          productTitle: item.productTitle,
          variantName: item.variantName,
          category: item.category,
          quantity: item.quantity,
          revenue: itemTotalRevenue,
          cost: itemTotalCost,
          profit: itemTotalRevenue - itemTotalCost,
        });
      }
    });
  });

  const netProfit = totalRevenue - totalCost;
  const profitMarginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';
  const productSalesList = Array.from(productSalesMap.values()).sort((a, b) => b.revenue - a.revenue);

  // CSV Export Handler with Thai UTF-8 BOM
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert('ไม่มีข้อมูลยอดขายในช่วงเวลาที่เลือกเพื่อส่งออก CSV ครับ');
      return;
    }

    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel Thai language support
    csvContent += 'เลขที่ออเดอร์,วันที่ทำรายการ,ชื่อลูกค้า,เบอร์โทรศัพท์,รายการสินค้า,ยอดขายสุทธิ (บาท),ต้นทุนรวม (บาท),กำไรสุทธิ (บาท),วิธีชำระเงิน\n';

    filteredOrders.forEach((o) => {
      const dateFormatted = new Date(o.createdAt).toLocaleString('th-TH');
      const itemsFormatted = o.items.map((i) => `${i.productTitle} (${i.variantName}) x${i.quantity}`).join(' | ');
      const orderCost = o.items.reduce((sum, i) => sum + (i.costPrice || Math.round(i.price * 0.5)) * i.quantity, 0);
      const orderProfit = o.netAmount - orderCost;
      
      csvContent += `"${o.id}","${dateFormatted}","${o.customerName}","${o.customerPhone}","${itemsFormatted}",${o.netAmount},${orderCost},${orderProfit},"${o.paymentMethod}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `รายงานยอดขายและกำไร_HUDA_ABAYA_${filterMode}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-xs text-white">
      
      {/* Header & Date Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dubai-black p-4 rounded-xl border border-gold-400/40 shadow-xl">
        <div>
          <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold-400" />
            <span>รายงานวิเคราะห์ยอดขาย ต้นทุน และกำไรสุทธิ (Financial & Profit Report)</span>
          </h3>
          <p className="text-xs text-gold-300/80">
            เรียกดูสถิติรายได้ ต้นทุน กำไรสุทธิ และสินค้าขายดี เลือกดูตามวัน เดือน ปี หรือช่วงเวลาที่กำหนดได้ 100%
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-md hover:scale-105 transition flex items-center justify-center gap-2 shrink-0 border border-emerald-400/40"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>ดาวน์โหลดรายงาน Excel (CSV)</span>
        </button>
      </div>

      {/* Date Filter Tabs */}
      <div className="bg-dubai-black p-3.5 rounded-xl border border-gold-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <Filter className="w-4 h-4 text-gold-400 shrink-0 mr-1" />
          
          <button
            onClick={() => setFilterMode('today')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              filterMode === 'today'
                ? 'bg-gold-500 text-dubai-black shadow-gold-glow'
                : 'bg-dubai-card text-gold-200/80 border border-gold-400/20'
            }`}
          >
            📅 วันนี้ (Today)
          </button>

          <button
            onClick={() => setFilterMode('month')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              filterMode === 'month'
                ? 'bg-gold-500 text-dubai-black shadow-gold-glow'
                : 'bg-dubai-card text-gold-200/80 border border-gold-400/20'
            }`}
          >
            🗓️ เดือนนี้ (This Month)
          </button>

          <button
            onClick={() => setFilterMode('year')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              filterMode === 'year'
                ? 'bg-gold-500 text-dubai-black shadow-gold-glow'
                : 'bg-dubai-card text-gold-200/80 border border-gold-400/20'
            }`}
          >
            🏆 ปีนี้ (This Year)
          </button>

          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              filterMode === 'all'
                ? 'bg-gold-500 text-dubai-black shadow-gold-glow'
                : 'bg-dubai-card text-gold-200/80 border border-gold-400/20'
            }`}
          >
            ♾️ สะสมทั้งหมด (All Time)
          </button>

          <button
            onClick={() => setFilterMode('custom')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              filterMode === 'custom'
                ? 'bg-amber-400 text-dubai-black shadow'
                : 'bg-dubai-card text-gold-200/80 border border-gold-400/20'
            }`}
          >
            ⚙️ กำหนดช่วงวันที่เอง
          </button>
        </div>

        {/* Custom Date Range Picker */}
        {filterMode === 'custom' && (
          <div className="flex items-center gap-2 bg-dubai-dark p-2 rounded-lg border border-amber-500/40">
            <span className="text-[11px] text-amber-300 font-bold">ตั้งแต่วันที่:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-dubai-black border border-amber-500/30 rounded px-2 py-1 text-xs text-white"
            />
            <span className="text-[11px] text-amber-300 font-bold">ถึง:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-dubai-black border border-amber-500/30 rounded px-2 py-1 text-xs text-white"
            />
          </div>
        )}
      </div>

      {/* Financial Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Revenue Card */}
        <div className="p-4 bg-dubai-card border border-gold-400/40 rounded-xl space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gold-400 font-bold">
            <span>รายรับรวม (Revenue)</span>
            <DollarSign className="w-4 h-4 text-gold-400" />
          </div>
          <p className="text-xl sm:text-2xl font-serif font-extrabold text-gold-300">
            ฿{totalRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-400">จากออเดอร์ที่ชำระเงินแล้ว</p>
        </div>

        {/* Total Cost Card */}
        <div className="p-4 bg-dubai-card border border-gold-400/20 rounded-xl space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
            <span>ต้นทุนรวม (Total Cost)</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-serif font-extrabold text-amber-300">
            ฿{totalCost.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-400">ต้นทุนสินค้าทั้งหมด</p>
        </div>

        {/* Net Profit Card */}
        <div className="p-4 bg-gradient-to-br from-emerald-950/80 to-dubai-card border-2 border-emerald-500/50 rounded-xl space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
            <span>กำไรสุทธิ (Net Profit)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-serif font-extrabold text-emerald-300">
            ฿{netProfit.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-400 font-bold">รายรับ หัก ต้นทุนสินค้า</p>
        </div>

        {/* Profit Margin Card */}
        <div className="p-4 bg-dubai-card border border-gold-400/30 rounded-xl space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-teal-400 font-bold">
            <span>อัตรากำไร (Margin)</span>
            <PieChart className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl sm:text-2xl font-serif font-extrabold text-teal-300">
            {profitMarginPercent}%
          </p>
          <p className="text-[10px] text-gray-400">สัดส่วนกำไรต่อรายรับ</p>
        </div>

        {/* Items Sold Count Card */}
        <div className="p-4 bg-dubai-card border border-gold-400/30 rounded-xl space-y-1 shadow-lg col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-purple-400 font-bold">
            <span>จำนวนขายได้ทั้งหมด</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl sm:text-2xl font-serif font-extrabold text-white">
            {totalItemsSold} <span className="text-xs font-sans font-normal text-gray-400">ชิ้น</span>
          </p>
          <p className="text-[10px] text-gray-400">รวม {filteredOrders.length} คำสั่งซื้อ</p>
        </div>

      </div>

      {/* Product-by-Product Sales Performance Table */}
      <div className="bg-dubai-card border border-gold-400/30 rounded-xl overflow-hidden shadow-xl space-y-3 p-4">
        <div className="flex items-center justify-between border-b border-gold-400/20 pb-2">
          <h4 className="font-serif font-bold text-sm text-gold-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>ตารางสรุปยอดขายและกำไรแยกตามสินค้า (Best Sellers Breakdown)</span>
          </h4>
          <span className="text-[11px] text-gray-400">
            รวม {productSalesList.length} รายการแบบ/ไซส์ที่ขายได้
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-200">
            <thead className="bg-dubai-black text-gold-400 font-serif border-b border-gold-400/30">
              <tr>
                <th className="p-3">ลำดับ</th>
                <th className="p-3">ชื่อสินค้า / แบบ</th>
                <th className="p-3">ไซส์ / ปริมาณ</th>
                <th className="p-3 text-center">จำนวนที่ขายได้</th>
                <th className="p-3 text-right">ยอดขายรวม (บาท)</th>
                <th className="p-3 text-right">ต้นทุนรวม (บาท)</th>
                <th className="p-3 text-right">กำไรสุทธิ (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-400/10">
              {productSalesList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    ยังไม่มีข้อมูลยอดขายในช่วงเวลาที่เลือก
                  </td>
                </tr>
              ) : (
                productSalesList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-dubai-black/40 transition">
                    <td className="p-3 font-mono font-bold text-gold-400">#{idx + 1}</td>
                    <td className="p-3 font-bold text-white">{item.productTitle}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-dubai-black text-[11px] text-gold-300 font-bold border border-gold-400/20">
                        {item.variantName}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold font-mono text-white text-sm">
                      {item.quantity} ชิ้น
                    </td>
                    <td className="p-3 text-right font-serif font-bold text-gold-300">
                      ฿{item.revenue.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-amber-300">
                      ฿{item.cost.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-serif font-extrabold text-emerald-400 text-sm">
                      +฿{item.profit.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
