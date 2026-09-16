'use client';

import React, { useState } from 'react';
import { Calendar, TrendingUp, DollarSign, Package, PieChart, Download, ArrowUpRight, ArrowDownRight, Layers, FileSpreadsheet, RefreshCw, Sparkles, Filter } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Order, CartItem } from '../../types';

export const AdminSalesReportManager: React.FC = () => {
  const { orders, products, createOrder } = useShop();

  // Filter Mode: 'today' | 'month' | 'year' | 'all' | 'custom'
  const [filterMode, setFilterMode] = useState<'today' | 'month' | 'year' | 'all' | 'custom'>('all');
  
  // Custom Date Range State (YYYY-MM-DD)
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // 1. Calculate Total Inventory Stock Valuation across all catalog products
  let totalStockPieces = 0;
  let totalStockSellingValue = 0;
  let totalStockCostValue = 0;

  products.forEach((p) => {
    p.variants.forEach((v) => {
      totalStockPieces += v.stockQuantity;
      totalStockSellingValue += v.price * v.stockQuantity;
      const cost = v.costPrice !== undefined && v.costPrice > 0 ? v.costPrice : Math.round(v.price * 0.5);
      totalStockCostValue += cost * v.stockQuantity;
    });
  });
  const totalStockExpectedProfit = totalStockSellingValue - totalStockCostValue;

  // 2. Helper to create a sample test order to demonstrate report calculation instantly
  const handleCreateSampleOrder = () => {
    if (!products || products.length === 0) {
      alert('ไม่มีรายการสินค้าในระบบเพื่อทำออเดอร์ทดลองครับ');
      return;
    }
    const sampleProd = products[0];
    const sampleVar = sampleProd.variants[0];
    const cost = sampleVar.costPrice !== undefined && sampleVar.costPrice > 0 ? sampleVar.costPrice : Math.round(sampleVar.price * 0.5);

    createOrder({
      customerName: 'ลูกค้าทดลองระบบ (Sample Order)',
      customerPhone: '083-427-4687',
      customerAddress: '11/2 ถนน คลองสิบสาม แขวงหนองจอก เขตหนองจอก กรุงเทพมหานคร 10530',
      province: 'กรุงเทพมหานคร',
      district: 'หนองจอก',
      subDistrict: 'หนองจอก',
      postalCode: '10530',
      note: 'ออเดอร์ทดลองระบบเพื่อตรวจสอบการคำนวณต้นทุนและกำไรสุทธิ',
      items: [
        {
          productId: sampleProd.id,
          variantId: sampleVar.id,
          productTitle: sampleProd.title,
          variantName: sampleVar.name,
          price: sampleVar.price,
          costPrice: cost,
          quantity: 1,
          productImage: sampleProd.images[0],
          category: sampleProd.category,
        },
      ],
      totalAmount: sampleVar.price,
      discountAmount: 0,
      shippingFee: 0,
      netAmount: sampleVar.price,
      paymentMethod: 'promptpay',
      paymentStatus: 'paid',
      orderStatus: 'delivered',
    });
    alert(`สร้างออเดอร์ทดลองสำเร็จ 1 รายการ (${sampleProd.title} - ฿${sampleVar.price.toLocaleString()})! หน้ารายงานจะแสดงรายรับ ต้นทุน และกำไรทันที`);
  };

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

  // Filter orders by date & paid status (include all completed / paid / delivered / shipped)
  const filteredOrders = orders.filter(
    (o) => (o.paymentStatus === 'paid' || o.orderStatus === 'delivered' || o.orderStatus === 'shipped' || o.orderStatus === 'pending') && isDateInFilterRange(o.createdAt)
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

      {/* Total Inventory Stock Cost Valuation Banner (Owner Snapshot) */}
      <div className="bg-dubai-card border-2 border-gold-400/50 rounded-xl p-4 shadow-xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gold-400/20 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif font-extrabold text-gold-300 uppercase tracking-wider bg-dubai-black px-2.5 py-1 rounded-lg border border-gold-400/30">
              🏬 สรุปมูลค่าต้นทุนสต๊อกสินค้าทั้งหมดในร้าน (Inventory Valuation)
            </span>
          </div>
          <span className="text-[11px] text-gold-300/80 font-bold">
            สินค้าในคลังรวม {products.length} แบบ ({totalStockPieces} ชิ้น)
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-xs">
          <div className="bg-dubai-black p-3 rounded-lg border border-gold-400/20">
            <span className="text-[10px] text-gray-400 block font-bold">📦 สต๊อกสินค้ารวม</span>
            <span className="text-base font-serif font-extrabold text-white">{totalStockPieces} ชิ้น</span>
          </div>
          <div className="bg-dubai-black p-3 rounded-lg border border-gold-400/20">
            <span className="text-[10px] text-gold-400 block font-bold">💰 มูลค่าขายรวม (Retail Value)</span>
            <span className="text-base font-serif font-extrabold text-gold-300">฿{totalStockSellingValue.toLocaleString()}</span>
          </div>
          <div className="bg-amber-950/80 p-3 rounded-lg border-2 border-amber-500/60 shadow-inner">
            <span className="text-[10px] text-amber-300 block font-extrabold">🟧 ต้นทุนคลังรวม (Total Inventory Cost)</span>
            <span className="text-base font-serif font-extrabold text-amber-200">฿{totalStockCostValue.toLocaleString()}</span>
          </div>
          <div className="bg-emerald-950/80 p-3 rounded-lg border-2 border-emerald-500/60">
            <span className="text-[10px] text-emerald-400 block font-extrabold">💚 กำไรคาดการณ์ (Expected Profit)</span>
            <span className="text-base font-serif font-extrabold text-emerald-300">+฿{totalStockExpectedProfit.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Notice Banner when 0 Orders exist with 1-Tap Sample Order Creator */}
      {filteredOrders.length === 0 && (
        <div className="bg-amber-950/90 border-2 border-amber-500 rounded-xl p-4 text-xs text-amber-200 shadow-xl space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-extrabold text-amber-300 text-sm flex items-center gap-1.5">
                <span>💡 สถานะ: ยังไม่มีคำสั่งซื้อที่ชำระเงินในระบบ (0 รายการ)</span>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed mt-1">
                ต้นทุนและกำไรสุทธิจะคำนวณและแสดงผลในตารางด้านล่างทันทีเมื่อคุณขายสินค้าผ่าน POS หรือเมื่อมีลูกค้าสั่งซื้อเข้ามาครับ
              </p>
            </div>
            <button
              onClick={handleCreateSampleOrder}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-gold-400 hover:from-amber-400 hover:to-gold-300 text-dubai-black font-extrabold text-xs rounded-xl shadow-gold-glow hover:scale-105 transition shrink-0 whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>🧪 ทดลองสร้างออเดอร์ตัวอย่าง 1 รายการ</span>
            </button>
          </div>
        </div>
      )}

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

      {/* Visual Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Chart 1: Visual Financial Overview Bar Chart */}
        <div className="bg-dubai-card border-2 border-gold-400/40 rounded-xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gold-400/20 pb-2">
            <h4 className="font-serif font-bold text-sm text-gold-300 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-gold-400" />
              <span>📊 กราฟสรุปสัดส่วน รายรับ - ต้นทุน - กำไรสุทธิ</span>
            </h4>
            <span className="text-[10px] bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded-full font-bold">
              อัตรากำไร {profitMarginPercent}%
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* 1. Revenue Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-gold-300 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold-400 inline-block"></span>
                  💰 ยอดขายสุทธิ (Revenue)
                </span>
                <span className="text-gold-300 font-serif font-extrabold">฿{totalRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-dubai-black h-4 rounded-full overflow-hidden border border-gold-400/30 p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-500 via-gold-400 to-amber-300 h-full rounded-full transition-all duration-500 shadow-gold-glow"
                  style={{ width: totalRevenue > 0 ? '100%' : '0%' }}
                ></div>
              </div>
            </div>

            {/* 2. Total Cost Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-amber-400 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  🟧 ต้นทุนสินค้าที่ขาย (Cost)
                </span>
                <span className="text-amber-300 font-serif font-extrabold">
                  ฿{totalCost.toLocaleString()} ({totalRevenue > 0 ? Math.round((totalCost / totalRevenue) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-dubai-black h-4 rounded-full overflow-hidden border border-amber-500/30 p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalRevenue > 0 ? Math.min(100, Math.round((totalCost / totalRevenue) * 100)) : 0}%` }}
                ></div>
              </div>
            </div>

            {/* 3. Net Profit Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                  💚 กำไรสุทธิจากการขาย (Net Profit)
                </span>
                <span className="text-emerald-300 font-serif font-extrabold">
                  +฿{netProfit.toLocaleString()} ({profitMarginPercent}%)
                </span>
              </div>
              <div className="w-full bg-dubai-black h-4 rounded-full overflow-hidden border border-emerald-500/30 p-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500 shadow-md"
                  style={{ width: `${totalRevenue > 0 ? Math.max(0, Math.min(100, Math.round((netProfit / totalRevenue) * 100))) : 0}%` }}
                ></div>
              </div>
            </div>

            {/* 4. Total Inventory Valuation Cost Bar */}
            <div className="space-y-1 pt-1 border-t border-gold-400/10">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-gray-300 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                  🏬 ต้นทุนสต๊อกคลังรวมทั้งหมด
                </span>
                <span className="text-amber-200 font-serif font-bold">฿{totalStockCostValue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-dubai-black h-3 rounded-full overflow-hidden border border-gold-400/20 p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-700 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalStockSellingValue > 0 ? Math.round((totalStockCostValue / totalStockSellingValue) * 100) : 50}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Top Selling Products Progress Bar Visual Chart */}
        <div className="bg-dubai-card border-2 border-gold-400/40 rounded-xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gold-400/20 pb-2">
            <h4 className="font-serif font-bold text-sm text-gold-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold-400" />
              <span>📈 กราฟเปรียบเทียบ 5 อันดับสินค้าขายดี (Top Best Sellers)</span>
            </h4>
            <span className="text-[10px] text-gray-400">เรียงตามยอดขาย</span>
          </div>

          <div className="space-y-3 text-xs">
            {productSalesList.length === 0 ? (
              <div className="py-10 text-center text-gray-400 space-y-2">
                <p>ยังไม่มีข้อมูลสถิติมียอดขายสินค้า</p>
                <button
                  onClick={handleCreateSampleOrder}
                  className="px-3 py-1.5 bg-amber-500 text-dubai-black font-extrabold rounded-lg text-xs"
                >
                  🧪 กดทดลองสร้างออเดอร์ตัวอย่าง
                </button>
              </div>
            ) : (
              productSalesList.slice(0, 5).map((item, idx) => {
                const maxRevenue = productSalesList[0].revenue || 1;
                const percentOfMax = Math.round((item.revenue / maxRevenue) * 100);
                return (
                  <div key={idx} className="space-y-1 bg-dubai-black/60 p-2.5 rounded-lg border border-gold-400/15">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white truncate max-w-[200px]">
                        #{idx + 1} {item.productTitle} ({item.variantName})
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-gray-400">{item.quantity} ชิ้น</span>
                        <span className="font-serif font-bold text-gold-300">฿{item.revenue.toLocaleString()}</span>
                        <span className="font-serif font-extrabold text-emerald-400">+฿{item.profit.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="w-full bg-dubai-dark h-2.5 rounded-full overflow-hidden border border-gold-400/20">
                      <div
                        className="bg-gradient-to-r from-emerald-500 via-gold-400 to-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentOfMax}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
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
