'use client';

import React, { useState } from 'react';
import { Calendar, TrendingUp, DollarSign, Package, PieChart, Download, ArrowUpRight, ArrowDownRight, Layers, FileSpreadsheet, RefreshCw, Sparkles, Filter, Edit2, Trash2, X, Save } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, Order, CartItem, CategoryType } from '../../types';

export const AdminSalesReportManager: React.FC = () => {
  const { orders, products, createOrder, deleteOrder, addProduct, updateProduct } = useShop();

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

  // Modal state for editing product details directly from Sales Report table
  const [editingProduct, setEditingProduct] = useState<{
    productId: string;
    variantId: string;
    title: string;
    category: CategoryType;
    variantName: string;
    price: number;
    costPrice: number;
    stockQuantity: number;
  } | null>(null);

  // Financial Calculations
  let totalRevenue = 0;
  let totalCost = 0;
  let totalItemsSold = 0;

  // Aggregate Product Performance
  const productSalesMap = new Map<
    string,
    {
      productId: string;
      variantId: string;
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

      const matchedProd = products.find((p) => p.id === item.productId || p.title === item.productTitle);
      const matchedVar = matchedProd?.variants.find((v) => v.id === item.variantId || v.name === item.variantName);

      const resolvedProductId = item.productId || matchedProd?.id || '';
      const resolvedVariantId = item.variantId || matchedVar?.id || '';

      const key = `${resolvedProductId || item.productTitle}___${resolvedVariantId || item.variantName}`;
      const existing = productSalesMap.get(key);

      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += itemTotalRevenue;
        existing.cost += itemTotalCost;
        existing.profit += itemTotalRevenue - itemTotalCost;
      } else {
        productSalesMap.set(key, {
          productId: resolvedProductId,
          variantId: resolvedVariantId,
          productTitle: item.productTitle,
          variantName: item.variantName,
          category: item.category || matchedProd?.category || 'all',
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

  // Delete sales history record handler from Sales Report table (Keep product catalog intact)
  const handleDeleteProduct = (item: { productId: string; variantId: string; productTitle: string; variantName: string }) => {
    const confirmed = window.confirm(
      `คุณต้องการลบ "ประวัติรายการขาย" ของสินค้า "${item.productTitle}" (${item.variantName}) ออกจากรายงานใช่หรือไม่?\n\n*หมายเหตุ: สินค้าในคลัง (Product Catalog) จะยังคงอยู่ตามปกติ 100% ไม่ถูกลบออก`
    );

    if (confirmed) {
      // Delete matching orders containing this item from order history
      const matchingOrders = orders.filter((o) =>
        o.items.some((i) => (item.productId && i.productId === item.productId) || i.productTitle === item.productTitle)
      );
      matchingOrders.forEach((o) => deleteOrder(o.id));

      alert(`ลบประวัติรายการขายของ "${item.productTitle}" ออกจากรายงานเรียบร้อยแล้วครับ!\n(สินค้าในคลังยังคงอยู่ในระบบตามปกติ)`);
    }
  };

  // Open Edit Product Modal from Sales Report table
  const handleOpenEditModal = (item: {
    productId: string;
    variantId: string;
    productTitle: string;
    variantName: string;
    category: string;
    revenue: number;
    cost: number;
    quantity: number;
  }) => {
    const targetProd = products.find((p) => (item.productId && p.id === item.productId) || p.title === item.productTitle);

    if (targetProd) {
      const targetVar = targetProd.variants.find((v) => (item.variantId && v.id === item.variantId) || v.name === item.variantName) || targetProd.variants[0];
      setEditingProduct({
        productId: targetProd.id,
        variantId: targetVar?.id || '',
        title: targetProd.title,
        category: targetProd.category || 'all',
        variantName: targetVar?.name || item.variantName,
        price: targetVar?.price || 0,
        costPrice: targetVar?.costPrice !== undefined ? targetVar.costPrice : Math.round((targetVar?.price || 0) * 0.5),
        stockQuantity: targetVar?.stockQuantity || 0,
      });
    } else {
      // Product from test order: Create editable entry seamlessly
      const calcPrice = item.quantity > 0 ? Math.round(item.revenue / item.quantity) : 0;
      const calcCost = item.quantity > 0 ? Math.round(item.cost / item.quantity) : Math.round(calcPrice * 0.5);

      setEditingProduct({
        productId: item.productId || `huda-prod-${Date.now()}`,
        variantId: item.variantId || `var-${Date.now()}`,
        title: item.productTitle,
        category: (item.category as CategoryType) || 'abaya',
        variantName: item.variantName || 'Size 52',
        price: calcPrice,
        costPrice: calcCost,
        stockQuantity: 10,
      });
    }
  };

  // Save changes from Edit Product Modal
  const handleSaveEditProduct = () => {
    if (!editingProduct) return;

    const target = products.find((p) => p.id === editingProduct.productId || p.title === editingProduct.title);

    if (target) {
      const updatedVariants = target.variants.map((v) => {
        if ((editingProduct.variantId && v.id === editingProduct.variantId) || v.name === editingProduct.variantName) {
          return {
            ...v,
            price: Number(editingProduct.price),
            costPrice: Number(editingProduct.costPrice),
            stockQuantity: Number(editingProduct.stockQuantity),
            updatedAt: Date.now(),
          };
        }
        return v;
      });

      const updatedProduct = {
        ...target,
        title: editingProduct.title,
        category: editingProduct.category,
        variants: updatedVariants,
        updatedAt: Date.now(),
      };

      updateProduct(updatedProduct);
    } else {
      // Add product into catalog if it was a test order item
      const fallbackImage = editingProduct.category === 'perfume'
        ? 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop';

      const newProdObj: Product = {
        id: editingProduct.productId || `huda-prod-${Date.now()}`,
        title: editingProduct.title,
        arabicTitle: editingProduct.title,
        category: editingProduct.category || 'abaya',
        description: 'สินค้าคุณภาพสูง นำเข้าจากเมืองดูไบ UAE แท้ 100%',
        fabric: editingProduct.category === 'perfume' ? 'Oud Oil & Attar Perfume Dubai' : 'Nida Silk Dubai Original',
        origin: 'เมืองดูไบ, UAE',
        images: [fallbackImage],
        colors: ['สีดำ (Black)'],
        variants: [
          {
            id: editingProduct.variantId || `var-${Date.now()}`,
            name: editingProduct.variantName,
            sku: `HD-SKU-1`,
            price: Number(editingProduct.price),
            costPrice: Number(editingProduct.costPrice),
            stockQuantity: Number(editingProduct.stockQuantity),
            color: 'สีดำ (Black)',
          },
        ],
        rating: 5.0,
        reviewsCount: 1,
        isNew: true,
        updatedAt: Date.now(),
      };

      addProduct(newProdObj);
    }

    setEditingProduct(null);
    alert(`บันทึกการแก้ไขสินค้า "${editingProduct.title}" สำเร็จเรียบร้อยแล้ว!`);
  };

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
    <div className="space-y-6 text-xs text-stone-950">
      
      {/* Header & Date Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-amber-400/60 shadow-xl text-stone-950">
        <div>
          <h3 className="font-serif font-black text-lg text-stone-950 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <span>แดชบอร์ดสรุปรายรับ - รายจ่าย/ต้นทุน - ยอดขาย &amp; กำไร (Financial Dashboard)</span>
          </h3>
          <p className="text-xs text-stone-800 font-extrabold mt-1">
            วิเคราะห์สรุปรายรับสุทธิ รายจ่ายต้นทุนสินค้า กำไรสุทธิ และสินค้าขายดี เลือกดูตามวัน เดือน ปี หรือช่วงเวลาที่ต้องการได้ 100%
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 shrink-0 border border-emerald-700 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-white" />
          <span>ดาวน์โหลดรายงาน Excel (CSV)</span>
        </button>
      </div>

      {/* Date Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border-2 border-amber-400/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md text-stone-950">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <Filter className="w-4 h-4 text-amber-600 shrink-0 mr-1" />
          
          <button
            onClick={() => setFilterMode('today')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
              filterMode === 'today'
                ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            วันนี้ (Today)
          </button>

          <button
            onClick={() => setFilterMode('month')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
              filterMode === 'month'
                ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            เดือนนี้ (This Month)
          </button>

          <button
            onClick={() => setFilterMode('year')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
              filterMode === 'year'
                ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            ปีนี้ (This Year)
          </button>

          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
              filterMode === 'all'
                ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            สะสมทั้งหมด (All Time)
          </button>

          <button
            onClick={() => setFilterMode('custom')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
              filterMode === 'custom'
                ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            กำหนดช่วงวันที่เอง
          </button>
        </div>

        {/* Custom Date Range Picker */}
        {filterMode === 'custom' && (
          <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-300 text-stone-950">
            <span className="text-[11px] text-stone-950 font-black">ตั้งแต่วันที่:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border-2 border-stone-400 rounded-lg px-2 py-1 text-xs text-stone-950 font-black"
            />
            <span className="text-[11px] text-stone-950 font-black">ถึง:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border-2 border-stone-400 rounded-lg px-2 py-1 text-xs text-stone-950 font-black"
            />
          </div>
        )}
      </div>

      {/* Total Inventory Stock Cost Valuation Banner (Owner Executive Snapshot) */}
      <div className="bg-white border-2 border-amber-400/80 rounded-2xl p-5 shadow-xl space-y-3 text-stone-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif font-black text-stone-950 uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-xl border border-amber-400 shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              สรุปมูลค่าต้นทุนสต๊อกสินค้าทั้งหมดในร้าน (Inventory Valuation)
            </span>
          </div>
          <span className="text-xs text-stone-950 font-black bg-amber-100 px-3 py-1 rounded-full border border-amber-400">
            สินค้าในคลังรวม {products.length} แบบ ({totalStockPieces} ชิ้น)
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-1 text-xs">
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-300 shadow-xs">
            <span className="text-[10px] text-stone-700 block font-black mb-0.5">สต๊อกสินค้ารวม</span>
            <span className="text-lg font-serif font-black text-stone-950">{totalStockPieces.toLocaleString()} ชิ้น</span>
          </div>
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-300 shadow-xs">
            <span className="text-[10px] text-amber-900 block font-black mb-0.5">มูลค่าขายรวม (Retail Value)</span>
            <span className="text-lg font-serif font-black text-amber-900">฿{totalStockSellingValue.toLocaleString()}</span>
          </div>
          <div className="bg-amber-50 p-3.5 rounded-xl border-2 border-amber-400 shadow-xs">
            <span className="text-[10px] text-amber-950 block font-black mb-0.5">ต้นทุนคลังรวม (Total Inventory Cost)</span>
            <span className="text-lg font-serif font-black text-amber-950">฿{totalStockCostValue.toLocaleString()}</span>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-xl border-2 border-emerald-400 shadow-xs">
            <span className="text-[10px] text-emerald-950 block font-black mb-0.5">กำไรคาดการณ์ (Expected Profit)</span>
            <span className="text-lg font-serif font-black text-emerald-900">+฿{totalStockExpectedProfit.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Notice Banner when 0 Orders exist with 1-Tap Sample Order Creator */}
      {filteredOrders.length === 0 && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 text-xs text-stone-950 shadow-md space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-black text-stone-950 text-sm flex items-center gap-1.5">
                <span>สถานะ: ยังไม่มีคำสั่งซื้อที่ชำระเงินในระบบ (0 รายการ)</span>
              </div>
              <p className="text-xs text-stone-800 font-extrabold mt-1">
                ต้นทุนและกำไรสุทธิจะคำนวณและแสดงผลในตารางด้านล่างทันทีเมื่อคุณขายสินค้าผ่าน POS หรือเมื่อมีลูกค้าสั่งซื้อเข้ามาครับ
              </p>
            </div>
            <button
              onClick={handleCreateSampleOrder}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md transition shrink-0 whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 border border-amber-500"
            >
              <span>ทดลองสร้างออเดอร์ตัวอย่าง 1 รายการ</span>
            </button>
          </div>
        </div>
      )}

      {/* Financial Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* Total Revenue Card */}
        <div className="p-4 bg-white border-2 border-amber-400/80 rounded-2xl space-y-1.5 shadow-md hover:scale-102 transition text-stone-950">
          <div className="flex items-center justify-between text-xs text-stone-900 font-black">
            <span>รายรับรวม (Revenue)</span>
            <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-black text-amber-900">
            ฿{totalRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-stone-700 font-black">จากออเดอร์ที่ชำระเงินแล้ว</p>
        </div>

        {/* Total Cost Card */}
        <div className="p-4 bg-white border-2 border-amber-400/80 rounded-2xl space-y-1.5 shadow-md hover:scale-102 transition text-stone-950">
          <div className="flex items-center justify-between text-xs text-stone-900 font-black">
            <span>ต้นทุนรวม (Total Cost)</span>
            <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center">
              <Package className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-black text-amber-900">
            ฿{totalCost.toLocaleString()}
          </p>
          <p className="text-[10px] text-stone-700 font-black">ต้นทุนสินค้าที่ขายออกไป</p>
        </div>

        {/* Net Profit Card */}
        <div className="p-4 bg-white border-2 border-emerald-500 rounded-2xl space-y-1.5 shadow-md hover:scale-102 transition text-stone-950">
          <div className="flex items-center justify-between text-xs text-emerald-900 font-black">
            <span>กำไรสุทธิ (Net Profit)</span>
            <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-500 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-black text-emerald-800">
            +฿{netProfit.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-800 font-black">รายรับ หัก ต้นทุนสินค้า</p>
        </div>

        {/* Profit Margin Card */}
        <div className="p-4 bg-white border-2 border-amber-400/80 rounded-2xl space-y-1.5 shadow-md hover:scale-102 transition text-stone-950">
          <div className="flex items-center justify-between text-xs text-stone-900 font-black">
            <span>อัตรากำไร (Margin %)</span>
            <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center">
              <PieChart className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-black text-stone-950">
            {profitMarginPercent}%
          </p>
          <p className="text-[10px] text-stone-700 font-black">สัดส่วนกำไรต่อรายรับ</p>
        </div>

        {/* Items Sold Count Card */}
        <div className="p-4 bg-white border-2 border-amber-400/80 rounded-2xl space-y-1.5 shadow-md col-span-2 lg:col-span-1 hover:scale-102 transition text-stone-950">
          <div className="flex items-center justify-between text-xs text-stone-900 font-black">
            <span>จำนวนขายได้ทั้งหมด</span>
            <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center">
              <Layers className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-black text-stone-950">
            {totalItemsSold} <span className="text-xs font-sans font-black text-stone-800">ชิ้น</span>
          </p>
          <p className="text-[10px] text-stone-700 font-black">รวม {filteredOrders.length} คำสั่งซื้อ</p>
        </div>

      </div>

      {/* Visual Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Chart 1: Visual Financial Overview Bar Chart */}
        <div className="bg-white border-2 border-amber-400/60 rounded-2xl p-5 shadow-xl space-y-4 text-stone-950">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <h4 className="font-serif font-black text-sm text-stone-950 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-600" />
              <span>กราฟสรุปสัดส่วน รายรับ - ต้นทุน - กำไรสุทธิ</span>
            </h4>
            <span className="text-[10px] bg-amber-100 text-stone-950 px-2 py-0.5 rounded-full font-black border border-amber-300">
              อัตรากำไร {profitMarginPercent}%
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* 1. Revenue Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-black text-stone-950">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  ยอดขายสุทธิ (Revenue)
                </span>
                <span className="font-serif font-black text-stone-950">฿{totalRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-stone-100 h-4 rounded-full overflow-hidden border border-stone-300 p-0.5">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: totalRevenue > 0 ? '100%' : '0%' }}
                ></div>
              </div>
            </div>

            {/* 2. Total Cost Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-black text-stone-950">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-500 inline-block"></span>
                  ต้นทุนสินค้าที่ขาย (Cost)
                </span>
                <span className="font-serif font-black text-amber-900">
                  ฿{totalCost.toLocaleString()} ({totalRevenue > 0 ? Math.round((totalCost / totalRevenue) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-stone-100 h-4 rounded-full overflow-hidden border border-stone-300 p-0.5">
                <div
                  className="bg-stone-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalRevenue > 0 ? Math.min(100, Math.round((totalCost / totalRevenue) * 100)) : 0}%` }}
                ></div>
              </div>
            </div>

            {/* 3. Net Profit Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-black text-stone-950">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  กำไรสุทธิจากการขาย (Net Profit)
                </span>
                <span className="font-serif font-black text-emerald-800">
                  +฿{netProfit.toLocaleString()} ({profitMarginPercent}%)
                </span>
              </div>
              <div className="w-full bg-stone-100 h-4 rounded-full overflow-hidden border border-stone-300 p-0.5">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalRevenue > 0 ? Math.max(0, Math.min(100, Math.round((netProfit / totalRevenue) * 100))) : 0}%` }}
                ></div>
              </div>
            </div>

            {/* 4. Total Inventory Valuation Cost Bar */}
            <div className="space-y-1 pt-1 border-t border-stone-200">
              <div className="flex justify-between text-[11px] font-black text-stone-950">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
                  ต้นทุนสต๊อกคลังรวมทั้งหมด
                </span>
                <span className="font-serif font-black text-stone-950">฿{totalStockCostValue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden border border-stone-300 p-0.5">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalStockSellingValue > 0 ? Math.round((totalStockCostValue / totalStockSellingValue) * 100) : 50}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Top Selling Products Progress Bar Visual Chart */}
        <div className="bg-white border-2 border-amber-400/60 rounded-2xl p-5 shadow-xl space-y-4 text-stone-950">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <h4 className="font-serif font-black text-sm text-stone-950 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>กราฟเปรียบเทียบ 5 อันดับสินค้าขายดี (Top Best Sellers)</span>
            </h4>
            <span className="text-[10px] text-stone-700 font-black">เรียงตามยอดขาย</span>
          </div>

          <div className="space-y-3 text-xs">
            {productSalesList.length === 0 ? (
              <div className="py-10 text-center text-stone-700 space-y-2">
                <p className="font-black">ยังไม่มีข้อมูลสถิติมียอดขายสินค้า</p>
                <button
                  onClick={handleCreateSampleOrder}
                  className="px-3 py-1.5 bg-amber-400 text-stone-950 font-black rounded-lg text-xs border border-amber-500"
                >
                  กดทดลองสร้างออเดอร์ตัวอย่าง
                </button>
              </div>
            ) : (
              productSalesList.slice(0, 5).map((item, idx) => {
                const maxRevenue = productSalesList[0].revenue || 1;
                const percentOfMax = Math.round((item.revenue / maxRevenue) * 100);
                return (
                  <div key={idx} className="space-y-1 bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-stone-950">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-black text-stone-950 truncate max-w-[200px]">
                        #{idx + 1} {item.productTitle} ({item.variantName})
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-stone-700 font-bold">{item.quantity} ชิ้น</span>
                        <span className="font-serif font-black text-amber-900">฿{item.revenue.toLocaleString()}</span>
                        <span className="font-serif font-black text-emerald-800">+฿{item.profit.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden border border-stone-300">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
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
      <div className="bg-white border-2 border-amber-400/60 rounded-2xl overflow-hidden shadow-xl space-y-3 p-4 text-stone-950">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <h4 className="font-serif font-black text-sm text-stone-950 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>ตารางสรุปยอดขายและกำไรแยกตามสินค้า (Best Sellers Breakdown)</span>
          </h4>
          <span className="text-[11px] text-stone-700 font-black">
            รวม {productSalesList.length} รายการแบบ/ไซส์ที่ขายได้
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-stone-950">
            <thead className="bg-amber-100 text-stone-950 font-serif border-b-2 border-amber-400 font-black">
              <tr>
                <th className="p-3 font-black">ลำดับ</th>
                <th className="p-3 font-black">ชื่อสินค้า / แบบ</th>
                <th className="p-3 font-black">ไซส์ / ปริมาณ</th>
                <th className="p-3 text-center font-black">จำนวนที่ขายได้</th>
                <th className="p-3 text-right font-black">ยอดขายรวม (บาท)</th>
                <th className="p-3 text-right font-black">ต้นทุนรวม (บาท)</th>
                <th className="p-3 text-right font-black">กำไรสุทธิ (บาท)</th>
                <th className="p-3 text-center font-black">จัดการ (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {productSalesList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-700 font-black">
                    ยังไม่มีข้อมูลยอดขายในช่วงเวลาที่เลือก
                  </td>
                </tr>
              ) : (
                productSalesList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/60 transition">
                    <td className="p-3 font-mono font-black text-stone-950">#{idx + 1}</td>
                    <td className="p-3 font-black text-stone-950">{item.productTitle}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-[11px] text-stone-950 font-black border border-stone-300">
                        {item.variantName}
                      </span>
                    </td>
                    <td className="p-3 text-center font-black font-mono text-stone-950 text-sm">
                      {item.quantity} ชิ้น
                    </td>
                    <td className="p-3 text-right font-serif font-black text-amber-900">
                      ฿{item.revenue.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-stone-950 font-black">
                      ฿{item.cost.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-serif font-black text-emerald-800 text-sm">
                      +฿{item.profit.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-stone-950 border border-amber-400 rounded-lg text-[11px] font-black flex items-center gap-1 transition shadow-xs cursor-pointer"
                          title="แก้ไขข้อมูลสินค้า / ต้นทุน / สต๊อก"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-stone-950" />
                          <span>แก้ไข</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(item)}
                          className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-950 border border-red-400 rounded-lg text-[11px] font-black flex items-center gap-1 transition shadow-xs cursor-pointer"
                          title="ลบเฉพาะประวัติรายการขายออกจากรายงาน (สินค้าในคลังจะไม่ถูกลบ)"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-700" />
                          <span>ลบประวัติขาย</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal for Sales Report Table */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-amber-500 rounded-3xl max-w-md w-full p-6 space-y-4 text-stone-950 shadow-2xl animate-scale-up text-left">
            <div className="flex items-center justify-between border-b-2 border-amber-400/40 pb-3">
              <h3 className="font-serif font-black text-base text-stone-950 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-600" />
                <span>แก้ไขข้อมูลสินค้า & ต้นทุน</span>
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-stone-700 hover:text-stone-950 p-1 rounded-full border border-stone-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-950 mb-1 font-black">ชื่อสินค้า / แบบ</label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full bg-white border-2 border-stone-400 rounded-xl p-2.5 text-stone-950 font-black focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-950 mb-1 font-black">หมวดหมู่</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as CategoryType })}
                    className="w-full bg-white border-2 border-stone-400 rounded-xl p-2.5 text-stone-950 font-black focus:border-amber-500 focus:outline-none"
                  >
                    <option value="abaya" className="bg-white text-stone-950 font-bold">ชุดอาบายะห์ (Abaya)</option>
                    <option value="kaftan" className="bg-white text-stone-950 font-bold">ชุดคัฟทาน (Kaftan)</option>
                    <option value="perfume" className="bg-white text-stone-950 font-bold">น้ำหอมดูไบ (Perfume)</option>
                    <option value="incense" className="bg-white text-stone-950 font-bold">ไม้หอม & บุคคูร์ (Oud)</option>
                    <option value="combo" className="bg-white text-stone-950 font-bold">เซตสุดคุ้ม (Combo)</option>
                    <option value="other" className="bg-white text-stone-950 font-bold">สินค้าอื่นๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-950 mb-1 font-black">ไซส์ / ตัวเลือก</label>
                  <input
                    type="text"
                    disabled
                    value={editingProduct.variantName}
                    className="w-full bg-stone-100 border-2 border-stone-300 rounded-xl p-2.5 text-stone-950 font-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-950 mb-1 font-black">ราคาขาย (บาท)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.price === 0 ? '' : editingProduct.price}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    onChange={(e) => {
                      const cleanVal = e.target.value.replace(/^0+(?=\d)/, '');
                      setEditingProduct({ ...editingProduct, price: cleanVal === '' ? 0 : Math.max(0, parseInt(cleanVal, 10) || 0) });
                    }}
                    placeholder="0"
                    className="w-full bg-white border-2 border-stone-400 rounded-xl p-2.5 text-stone-950 font-mono font-black focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-950 mb-1 font-black">ต้นทุน (บาท)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.costPrice === 0 ? '' : editingProduct.costPrice}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    onChange={(e) => {
                      const cleanVal = e.target.value.replace(/^0+(?=\d)/, '');
                      setEditingProduct({ ...editingProduct, costPrice: cleanVal === '' ? 0 : Math.max(0, parseInt(cleanVal, 10) || 0) });
                    }}
                    placeholder="0"
                    className="w-full bg-white border-2 border-stone-400 rounded-xl p-2.5 text-stone-950 font-mono font-black focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-950 mb-1 font-black">สต๊อกคงเหลือ</label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.stockQuantity === 0 ? '' : editingProduct.stockQuantity}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    onChange={(e) => {
                      const cleanVal = e.target.value.replace(/^0+(?=\d)/, '');
                      setEditingProduct({ ...editingProduct, stockQuantity: cleanVal === '' ? 0 : Math.max(0, parseInt(cleanVal, 10) || 0) });
                    }}
                    placeholder="0"
                    className="w-full bg-white border-2 border-stone-400 rounded-xl p-2.5 text-stone-950 font-mono font-black focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber-400/30">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 bg-stone-100 border border-stone-300 text-stone-950 rounded-xl text-xs font-black hover:bg-stone-200 transition cursor-pointer"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleSaveEditProduct}
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md border border-amber-500 transition cursor-pointer"
              >
                <Save className="w-4 h-4 text-stone-950" />
                <span>บันทึกการแก้ไข</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
