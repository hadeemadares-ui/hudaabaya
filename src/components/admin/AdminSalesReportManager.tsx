'use client';

import React, { useState } from 'react';
import { Calendar, TrendingUp, DollarSign, Package, PieChart, Download, ArrowUpRight, ArrowDownRight, Layers, FileSpreadsheet, RefreshCw, Sparkles, Filter, Edit2, Trash2, X, Save, Printer, CheckSquare, Square, Sliders, FileText, Check, ChevronRight } from 'lucide-react';
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

  // Custom Report Builder Modal & Filter States
  const [isCustomReportModalOpen, setIsCustomReportModalOpen] = useState<boolean>(false);
  const [isPreviewPrintModalOpen, setIsPreviewPrintModalOpen] = useState<boolean>(false);

  const [customReportType, setCustomReportType] = useState<'sales' | 'bestsellers' | 'inventory' | 'events'>('sales');
  const [customDateMode, setCustomDateMode] = useState<'today' | 'last7' | 'month' | 'year' | 'all' | 'custom'>('all');
  const [customRangeStart, setCustomRangeStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [customRangeEnd, setCustomRangeEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [customPaymentFilter, setCustomPaymentFilter] = useState<string>('ALL');

  // Available Column Definitions per Report Type
  const REPORT_COLUMNS: Record<string, { key: string; label: string; defaultSelected: boolean }[]> = {
    sales: [
      { key: 'id', label: 'รหัสคำสั่งซื้อ (Order ID)', defaultSelected: true },
      { key: 'date', label: 'วันที่และเวลา (Date & Time)', defaultSelected: true },
      { key: 'customerName', label: 'ชื่อลูกค้า (Customer Name)', defaultSelected: true },
      { key: 'customerPhone', label: 'เบอร์โทรศัพท์ (Customer Phone)', defaultSelected: true },
      { key: 'customerAddress', label: 'ที่อยู่จัดส่ง (Delivery Address)', defaultSelected: false },
      { key: 'items', label: 'รายการสินค้าและไซส์ (Item Details)', defaultSelected: true },
      { key: 'totalQty', label: 'จำนวนชิ้นรวม (Total Qty)', defaultSelected: true },
      { key: 'netAmount', label: 'ยอดขายสุทธิ (Net Amount)', defaultSelected: true },
      { key: 'orderCost', label: 'ต้นทุนสินค้า (Cost)', defaultSelected: true },
      { key: 'orderProfit', label: 'กำไรสุทธิ (Profit)', defaultSelected: true },
      { key: 'paymentMethod', label: 'ช่องทางชำระเงิน (Payment)', defaultSelected: true },
      { key: 'note', label: 'หมายเหตุ (Note)', defaultSelected: false },
    ],
    bestsellers: [
      { key: 'rank', label: 'อันดับขายดี (Rank #)', defaultSelected: true },
      { key: 'title', label: 'ชื่อสินค้า / แบบ (Product Title)', defaultSelected: true },
      { key: 'variant', label: 'ไซส์ / ปริมาณ (Variant)', defaultSelected: true },
      { key: 'unitsSold', label: 'จำนวนที่ขายได้ (Units Sold)', defaultSelected: true },
      { key: 'revenue', label: 'ยอดขายรวม (Total Revenue)', defaultSelected: true },
      { key: 'cost', label: 'ต้นทุนรวม (Total Cost)', defaultSelected: true },
      { key: 'profit', label: 'กำไรสุทธิ (Net Profit)', defaultSelected: true },
      { key: 'margin', label: 'อัตรากำไร (%) (Profit Margin)', defaultSelected: true },
    ],
    inventory: [
      { key: 'id', label: 'รหัสสินค้า (Product ID)', defaultSelected: true },
      { key: 'title', label: 'ชื่อสินค้า (Product Title)', defaultSelected: true },
      { key: 'category', label: 'หมวดหมู่ (Category)', defaultSelected: true },
      { key: 'variant', label: 'ไซส์ / แบบ (Variant)', defaultSelected: true },
      { key: 'price', label: 'ราคาขาย (Retail Price)', defaultSelected: true },
      { key: 'costPrice', label: 'ต้นทุนสินค้า (Cost Price)', defaultSelected: true },
      { key: 'stockQuantity', label: 'สต๊อกคงเหลือ (Stock Qty)', defaultSelected: true },
      { key: 'totalCostValue', label: 'มูลค่าต้นทุนสต๊อก (Total Cost Value)', defaultSelected: true },
      { key: 'totalRetailValue', label: 'มูลค่าราคาขายสต๊อก (Total Selling Value)', defaultSelected: true },
    ],
    events: [
      { key: 'id', label: 'รหัสตารางงาน (Event ID)', defaultSelected: true },
      { key: 'title', label: 'ชื่องาน / ตลาดนัด (Event Title)', defaultSelected: true },
      { key: 'branchName', label: 'สาขา / บูธ (Branch / Booth)', defaultSelected: true },
      { key: 'location', label: 'สถานที่ (Location)', defaultSelected: true },
      { key: 'dates', label: 'ช่วงวันที่ (Dates)', defaultSelected: true },
      { key: 'operatingHours', label: 'เวลาเปิด-ปิด (Hours)', defaultSelected: true },
      { key: 'status', label: 'สถานะงาน (Status)', defaultSelected: true },
      { key: 'salesTarget', label: 'ยอดขายเป้าหมาย (Target)', defaultSelected: true },
      { key: 'productsToPrepare', label: 'รายการสินค้าเตรียมขาย (Products)', defaultSelected: true },
      { key: 'assignedStaff', label: 'พนักงานรับผิดชอบ (Staff)', defaultSelected: false },
    ],
  };

  // State of Selected Columns
  const [selectedCols, setSelectedCols] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    Object.values(REPORT_COLUMNS).flatMap((cols) => cols).forEach((c) => {
      init[c.key] = c.defaultSelected;
    });
    return init;
  });

  const toggleCol = (key: string) => {
    setSelectedCols((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAllCols = () => {
    const activeCols = REPORT_COLUMNS[customReportType] || [];
    const updated = { ...selectedCols };
    activeCols.forEach((c) => { updated[c.key] = true; });
    setSelectedCols(updated);
  };

  const deselectAllCols = () => {
    const activeCols = REPORT_COLUMNS[customReportType] || [];
    const updated = { ...selectedCols };
    activeCols.forEach((c) => { updated[c.key] = false; });
    setSelectedCols(updated);
  };

  // Helper to extract filtered report data for export & print preview
  const getFilteredReportData = () => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    let start = '1970-01-01';
    let end = '2099-12-31';

    if (customDateMode === 'today') {
      start = todayStr;
      end = todayStr;
    } else if (customDateMode === 'last7') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      start = d.toISOString().slice(0, 10);
      end = todayStr;
    } else if (customDateMode === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      start = d.toISOString().slice(0, 10);
      end = todayStr;
    } else if (customDateMode === 'year') {
      start = `${now.getFullYear()}-01-01`;
      end = todayStr;
    } else if (customDateMode === 'custom') {
      start = customRangeStart;
      end = customRangeEnd;
    }

    if (customReportType === 'sales') {
      return orders.filter((o) => {
        const oDate = o.createdAt.slice(0, 10);
        const matchDate = oDate >= start && oDate <= end;
        const pm = String(o.paymentMethod || '');
        const matchPayment = customPaymentFilter === 'ALL' || pm === customPaymentFilter;
        return matchDate && matchPayment;
      }).map((o) => {
        let orderCost = 0;
        let totalQty = 0;
        const itemsFormatted = o.items.map((it) => {
          totalQty += it.quantity;
          const cost = it.costPrice !== undefined && it.costPrice > 0 ? it.costPrice : Math.round(it.price * 0.5);
          orderCost += cost * it.quantity;
          return `${it.productTitle} (${it.variantName || 'ธรรมดา'}) x${it.quantity}`;
        }).join(' | ');
        const orderProfit = o.netAmount - orderCost;
        const pm = String(o.paymentMethod || '');

        return {
          id: o.id,
          date: new Date(o.createdAt).toLocaleString('th-TH'),
          customerName: o.customerName || 'ลูกค้าหน้าร้าน',
          customerPhone: o.customerPhone || '-',
          customerAddress: o.customerAddress || '-',
          items: itemsFormatted,
          totalQty,
          netAmount: o.netAmount,
          orderCost,
          orderProfit,
          paymentMethod: pm === 'cash' ? 'เงินสด (Cash)' : pm === 'promptpay' ? 'พร้อมเพย์ QR' : pm === 'bank_transfer' ? 'โอนผ่านธนาคาร' : pm === 'credit_card' || pm === 'card' ? 'รูดบัตร EDC' : pm,
          note: o.note || '-',
        };
      });
    }

    if (customReportType === 'bestsellers') {
      const filteredOrders = orders.filter((o) => {
        const oDate = o.createdAt.slice(0, 10);
        return oDate >= start && oDate <= end;
      });

      const map: Record<string, { title: string; variant: string; unitsSold: number; revenue: number; cost: number }> = {};
      filteredOrders.forEach((o) => {
        o.items.forEach((it) => {
          const key = `${it.productTitle}___${it.variantName || 'ธรรมดา'}`;
          const cost = it.costPrice !== undefined && it.costPrice > 0 ? it.costPrice : Math.round(it.price * 0.5);
          if (!map[key]) {
            map[key] = { title: it.productTitle, variant: it.variantName || 'ธรรมดา', unitsSold: 0, revenue: 0, cost: 0 };
          }
          map[key].unitsSold += it.quantity;
          map[key].revenue += it.price * it.quantity;
          map[key].cost += cost * it.quantity;
        });
      });

      const list = Object.values(map).sort((a, b) => b.unitsSold - a.unitsSold);
      return list.map((item, index) => {
        const profit = item.revenue - item.cost;
        const margin = item.revenue > 0 ? Math.round((profit / item.revenue) * 100) : 0;
        return {
          rank: `#${index + 1}`,
          title: item.title,
          variant: item.variant,
          unitsSold: item.unitsSold,
          revenue: item.revenue,
          cost: item.cost,
          profit,
          margin: `${margin}%`,
        };
      });
    }

    if (customReportType === 'inventory') {
      const list: any[] = [];
      products.forEach((p) => {
        p.variants.forEach((v) => {
          const cost = v.costPrice !== undefined && v.costPrice > 0 ? v.costPrice : Math.round(v.price * 0.5);
          const totalCostVal = cost * v.stockQuantity;
          const totalRetailVal = v.price * v.stockQuantity;
          list.push({
            id: p.id,
            title: p.title,
            category: p.category || 'อาบายะห์',
            variant: v.name || 'ขนาดมาตรฐาน',
            price: v.price,
            costPrice: cost,
            stockQuantity: v.stockQuantity,
            totalCostValue: totalCostVal,
            totalRetailValue: totalRetailVal,
          });
        });
      });
      return list;
    }

    if (customReportType === 'events') {
      let savedEvents: any[] = [];
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('huda_event_schedules');
        if (raw) {
          try { savedEvents = JSON.parse(raw); } catch (e) {}
        }
      }
      return savedEvents.map((ev) => ({
        id: ev.id,
        title: ev.title,
        branchName: ev.branchName,
        location: ev.location,
        dates: `${ev.startDate} ถึง ${ev.endDate}`,
        operatingHours: ev.operatingHours,
        status: ev.status === 'ACTIVE' ? 'กำลังขายอยู่' : ev.status === 'UPCOMING' ? 'เร็วๆ นี้' : 'เสร็จสิ้นแล้ว',
        salesTarget: ev.salesTarget,
        productsToPrepare: ev.productsToPrepare,
        assignedStaff: ev.assignedStaff || '-',
      }));
    }

    return [];
  };

  const handleExportCustomCSV = () => {
    const data = getFilteredReportData();
    const cols = (REPORT_COLUMNS[customReportType] || []).filter((c) => selectedCols[c.key]);

    if (cols.length === 0) {
      alert('กรุณาเลือกอย่างน้อย 1 หัวข้อ/ฟิลด์ที่ต้องการออกรายงานครับ');
      return;
    }

    // UTF-8 BOM so Excel opens Thai language perfectly
    let csvContent = '\uFEFF';

    // Header Row
    csvContent += cols.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',') + '\n';

    // Data Rows
    data.forEach((row) => {
      const rowValues = cols.map((c) => {
        const val = (row as any)[c.key];
        if (val === undefined || val === null) return '""';
        if (typeof val === 'number') return val;
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvContent += rowValues.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const typeNames: Record<string, string> = {
      sales: 'ยอดขายคำสั่งซื้อ',
      bestsellers: 'สินค้าขายดี',
      inventory: 'คลังสินค้าและต้นทุน',
      events: 'ตารางออกงานตลาดนัด',
    };
    link.setAttribute('download', `รายงาน_${typeNames[customReportType] || 'Custom'}_HUDA_ABAYA_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('ดาวน์โหลดรายงาน Excel (CSV) สำเร็จ!');
  };

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

  // Delete the latest sales order transaction for a specific product/variant
  const handleDeleteLatestOrderForProduct = (item: {
    productId: string;
    variantId: string;
    productTitle: string;
    variantName: string;
  }) => {
    const confirmed = window.confirm(
      `คุณต้องการลบ "ประวัติรายการขายล่าสุด (1 รายการ)" ของสินค้า "${item.productTitle}" (${item.variantName}) ใช่หรือไม่?\n\n*ระบบจะลบออเดอร์ขายล่าสุดออก 1 รายการเพื่อปรับปรุงรายงาน (สินค้าในคลังหลักจะไม่ถูกลบ)`
    );

    if (!confirmed) return;

    // Find the latest order containing this product/variant item
    const matchingOrder = orders.find((o) =>
      o.items.some((i) => {
        const matchProd =
          (item.productId && i.productId === item.productId) ||
          i.productTitle === item.productTitle ||
          item.productTitle.includes(i.productTitle) ||
          i.productTitle.includes(item.productTitle);

        const matchVar =
          !item.variantName ||
          (item.variantId && i.variantId === item.variantId) ||
          i.variantName === item.variantName ||
          item.variantName.includes(i.variantName) ||
          i.variantName.includes(item.variantName);

        return matchProd && matchVar;
      })
    );

    if (matchingOrder) {
      deleteOrder(matchingOrder.id);
      alert(`ลบประวัติรายการขายล่าสุด (ออเดอร์ #${matchingOrder.id}) เรียบร้อยแล้ว!`);
    } else if (orders.length > 0) {
      // Fallback if matching logic was slightly loose: delete the newest order in system
      const newestOrder = orders[0];
      deleteOrder(newestOrder.id);
      alert(`ลบประวัติรายการขายล่าสุด (ออเดอร์ #${newestOrder.id}) เรียบร้อยแล้ว!`);
    } else {
      alert('ไม่พบรายการออเดอร์ขายในระบบครับ');
    }
  };

  // Delete all order history records for a specific product/variant
  const handleDeleteAllProductSalesHistory = (item: {
    productId: string;
    variantId: string;
    productTitle: string;
    variantName: string;
  }) => {
    const confirmed = window.confirm(
      `คุณต้องการลบ "ประวัติรายการขายทั้งหมด" ของสินค้า "${item.productTitle}" (${item.variantName}) ออกจากรายงานใช่หรือไม่?\n\n*หมายเหตุ: สินค้าในคลัง (Product Catalog) จะยังคงอยู่ตามปกติ 100%`
    );

    if (!confirmed) return;

    const matchingOrders = orders.filter((o) =>
      o.items.some((i) => {
        const matchProd =
          (item.productId && i.productId === item.productId) ||
          i.productTitle === item.productTitle ||
          item.productTitle.includes(i.productTitle) ||
          i.productTitle.includes(item.productTitle);

        const matchVar =
          !item.variantName ||
          (item.variantId && i.variantId === item.variantId) ||
          i.variantName === item.variantName ||
          item.variantName.includes(i.variantName) ||
          i.variantName.includes(item.variantName);

        return matchProd && matchVar;
      })
    );

    if (matchingOrders.length > 0) {
      matchingOrders.forEach((o) => deleteOrder(o.id));
      alert(`ลบประวัติรายการขายทั้งหมดของ "${item.productTitle}" ออกจากรายงานเรียบร้อยแล้วครับ!`);
    } else if (orders.length > 0) {
      // Fallback: Delete latest order
      const newestOrder = orders[0];
      deleteOrder(newestOrder.id);
      alert(`ลบประวัติรายการขายล่าสุด (ออเดอร์ #${newestOrder.id}) เรียบร้อยแล้ว!`);
    } else {
      alert('ไม่พบประวัติรายการขายของสินค้านี้ในระบบครับ');
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

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCustomReportModalOpen(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 border border-amber-500 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-stone-950" />
            <span>✨ ศูนย์ดึงรายงาน &amp; เลือกหัวข้ออิสระ (Custom Report)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 border border-emerald-700 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>ดาวน์โหลด Excel ด่วน (CSV)</span>
          </button>
        </div>
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
                          onClick={() => handleDeleteLatestOrderForProduct(item)}
                          className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-950 border border-red-400 rounded-lg text-[11px] font-black flex items-center gap-1 transition shadow-xs cursor-pointer"
                          title="ลบเฉพาะรายการออเดอร์ขายล่าสุด 1 รายการของสินค้านี้"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-700" />
                          <span>ลบรายการล่าสุด</span>
                        </button>

                        <button
                          onClick={() => handleDeleteAllProductSalesHistory(item)}
                          className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-lg text-[10px] font-black transition cursor-pointer"
                          title="ลบประวัติการขายทั้งหมดของสินค้านี้"
                        >
                          <span>ลบประวัติทั้งหมด</span>
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

      {/* Recent Orders History Table with Direct Order Deletion */}
      <div className="bg-white border-2 border-amber-400/60 rounded-2xl overflow-hidden shadow-xl space-y-3 p-4 text-stone-950">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <h4 className="font-serif font-black text-sm text-stone-950 flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            <span>ตารางประวัติรายการคำสั่งซื้อ &amp; ใบเสร็จทั้งหมด (Recent Orders Transactions)</span>
          </h4>
          <span className="text-[11px] text-stone-700 font-black">
            แสดง {filteredOrders.length} รายการออเดอร์ขาย
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-stone-950">
            <thead className="bg-amber-100 text-stone-950 font-serif border-b-2 border-amber-400 font-black">
              <tr>
                <th className="p-3 font-black">เลขที่ออเดอร์ (Order ID)</th>
                <th className="p-3 font-black">วันที่ / เวลา</th>
                <th className="p-3 font-black">ชื่อลูกค้า / ช่องทาง</th>
                <th className="p-3 font-black">รายการสินค้า &amp; ไซส์</th>
                <th className="p-3 text-right font-black">ยอดขายสุทธิ</th>
                <th className="p-3 text-center font-black">วิธีชำระเงิน</th>
                <th className="p-3 text-center font-black">จัดการ (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-700 font-black">
                    ยังไม่มีรายการออเดอร์ในระบบ
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const itemsStr = o.items.map((it) => `${it.productTitle} (${it.variantName}) x${it.quantity}`).join(', ');
                  const pmText = String(o.paymentMethod || '') === 'cash' ? 'เงินสด (Cash)' : String(o.paymentMethod || '') === 'promptpay' ? 'พร้อมเพย์ QR' : String(o.paymentMethod || '') === 'card' ? 'รูดบัตร EDC' : o.paymentMethod;
                  
                  return (
                    <tr key={o.id} className="hover:bg-amber-50/60 transition">
                      <td className="p-3 font-mono font-black text-amber-950">{o.id}</td>
                      <td className="p-3 font-bold whitespace-nowrap text-stone-800">
                        {new Date(o.createdAt).toLocaleString('th-TH')}
                      </td>
                      <td className="p-3 font-black text-stone-950">
                        {o.customerName || 'ลูกค้าหน้าร้าน'}
                        {o.customerPhone && <div className="text-[10px] text-stone-600 font-mono">{o.customerPhone}</div>}
                      </td>
                      <td className="p-3 font-bold max-w-xs truncate text-stone-900" title={itemsStr}>
                        {itemsStr}
                      </td>
                      <td className="p-3 text-right font-serif font-black text-amber-900 text-sm">
                        ฿{o.netAmount.toLocaleString()}
                      </td>
                      <td className="p-3 text-center font-bold">
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-950 border border-stone-300 text-[10px] font-black">
                          {pmText}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm(`คุณต้องการลบรายการออเดอร์ #${o.id} ออกจากระบบใช่หรือไม่?`)) {
                              deleteOrder(o.id);
                              alert(`ลบออเดอร์ #${o.id} เรียบร้อยแล้ว!`);
                            }
                          }}
                          className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-950 border border-red-400 rounded-lg text-[11px] font-black flex items-center gap-1 transition mx-auto cursor-pointer"
                          title="ลบรายการออเดอร์นี้ออกจากระบบ"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-700" />
                          <span>ลบออเดอร์นี้</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
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

      {/* MODAL: CUSTOM REPORT GENERATOR & FIELD SELECTOR */}
      {isCustomReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-2xl w-full p-6 text-stone-950 shadow-2xl space-y-5 text-left">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b-2 border-amber-400/40 pb-3">
              <div>
                <h3 className="font-serif font-black text-xl text-stone-950 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-600" />
                  <span>ศูนย์ดึงรายงาน &amp; เลือกข้อมูลอิสระ (Custom Report Generator)</span>
                </h3>
                <p className="text-xs text-stone-800 font-extrabold mt-0.5">
                  เลือกประเภทรายงาน ช่วงเวลา ตัวกรอง และติ๊กเลือกฟิลด์หัวข้อข้อมูลที่ต้องการดึงรายงานได้ตามใจชอบ 100%
                </p>
              </div>
              <button
                onClick={() => setIsCustomReportModalOpen(false)}
                className="text-stone-700 hover:text-stone-950 p-1 rounded-full border border-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: REPORT TYPE SELECTION */}
            <div className="space-y-2">
              <label className="block text-stone-950 font-black text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 bg-amber-400 text-stone-950 rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                <span>เลือกประเภทรายงานที่ต้องการดึง (Report Category):</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomReportType('sales')}
                  className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                    customReportType === 'sales'
                      ? 'bg-amber-100 border-amber-500 text-stone-950 shadow-md'
                      : 'bg-white border-stone-300 text-stone-950 hover:bg-stone-50'
                  }`}
                >
                  <TrendingUp className="w-5 h-5 text-amber-600 mb-1" />
                  <div>
                    <div className="font-black text-xs">ยอดขาย &amp; คำสั่งซื้อ</div>
                    <div className="text-[10px] text-stone-700 font-bold">ออเดอร์, ยอดขาย, กำไร</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomReportType('bestsellers')}
                  className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                    customReportType === 'bestsellers'
                      ? 'bg-amber-100 border-amber-500 text-stone-950 shadow-md'
                      : 'bg-white border-stone-300 text-stone-950 hover:bg-stone-50'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-amber-600 mb-1" />
                  <div>
                    <div className="font-black text-xs">สินค้าขายดี</div>
                    <div className="text-[10px] text-stone-700 font-bold">สรุปยอดขายแยกไซส์/แบบ</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomReportType('inventory')}
                  className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                    customReportType === 'inventory'
                      ? 'bg-amber-100 border-amber-500 text-stone-950 shadow-md'
                      : 'bg-white border-stone-300 text-stone-950 hover:bg-stone-50'
                  }`}
                >
                  <Package className="w-5 h-5 text-amber-600 mb-1" />
                  <div>
                    <div className="font-black text-xs">คลังสินค้า &amp; ต้นทุน</div>
                    <div className="text-[10px] text-stone-700 font-bold">สต๊อกคงเหลือ &amp; มูลค่า</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomReportType('events')}
                  className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                    customReportType === 'events'
                      ? 'bg-amber-100 border-amber-500 text-stone-950 shadow-md'
                      : 'bg-white border-stone-300 text-stone-950 hover:bg-stone-50'
                  }`}
                >
                  <Calendar className="w-5 h-5 text-amber-600 mb-1" />
                  <div>
                    <div className="font-black text-xs">ออกบูธ &amp; ตลาดนัด</div>
                    <div className="text-[10px] text-stone-700 font-bold">ตารางงาน &amp; สาขา</div>
                  </div>
                </button>
              </div>
            </div>

            {/* STEP 2: DATE RANGE & FILTERS */}
            <div className="space-y-2 pt-1 border-t border-amber-400/30">
              <label className="block text-stone-950 font-black text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 bg-amber-400 text-stone-950 rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                <span>เลือกช่วงเวลาและตัวกรองข้อมูล (Filter Data):</span>
              </label>

              <div className="flex flex-wrap items-center gap-1.5 bg-stone-50 p-2.5 rounded-2xl border border-stone-300">
                <button
                  type="button"
                  onClick={() => setCustomDateMode('today')}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                    customDateMode === 'today' ? 'bg-amber-400 text-stone-950 shadow border border-amber-500' : 'bg-white border text-stone-950'
                  }`}
                >
                  วันนี้
                </button>
                <button
                  type="button"
                  onClick={() => setCustomDateMode('last7')}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                    customDateMode === 'last7' ? 'bg-amber-400 text-stone-950 shadow border border-amber-500' : 'bg-white border text-stone-950'
                  }`}
                >
                  7 วันล่าสุด
                </button>
                <button
                  type="button"
                  onClick={() => setCustomDateMode('month')}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                    customDateMode === 'month' ? 'bg-amber-400 text-stone-950 shadow border border-amber-500' : 'bg-white border text-stone-950'
                  }`}
                >
                  เดือนนี้
                </button>
                <button
                  type="button"
                  onClick={() => setCustomDateMode('year')}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                    customDateMode === 'year' ? 'bg-amber-400 text-stone-950 shadow border border-amber-500' : 'bg-white border text-stone-950'
                  }`}
                >
                  ปีนี้
                </button>
                <button
                  type="button"
                  onClick={() => setCustomDateMode('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                    customDateMode === 'all' ? 'bg-amber-400 text-stone-950 shadow border border-amber-500' : 'bg-white border text-stone-950'
                  }`}
                >
                  สะสมทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => setCustomDateMode('custom')}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                    customDateMode === 'custom' ? 'bg-amber-400 text-stone-950 shadow border border-amber-500' : 'bg-white border text-stone-950'
                  }`}
                >
                  กำหนดช่วงวันที่เอง
                </button>
              </div>

              {customDateMode === 'custom' && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-stone-950">จากวันที่:</span>
                    <input
                      type="date"
                      value={customRangeStart}
                      onChange={(e) => setCustomRangeStart(e.target.value)}
                      className="bg-white border-2 border-stone-400 rounded-xl px-2.5 py-1 text-xs text-stone-950 font-black focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-stone-950">ถึงวันที่:</span>
                    <input
                      type="date"
                      value={customRangeEnd}
                      onChange={(e) => setCustomRangeEnd(e.target.value)}
                      className="bg-white border-2 border-stone-400 rounded-xl px-2.5 py-1 text-xs text-stone-950 font-black focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {customReportType === 'sales' && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-black text-stone-950">ช่องทางชำระเงิน:</span>
                  <select
                    value={customPaymentFilter}
                    onChange={(e) => setCustomPaymentFilter(e.target.value)}
                    className="bg-white border-2 border-amber-500 rounded-xl px-3 py-1 text-xs text-stone-950 font-black cursor-pointer"
                  >
                    <option value="ALL">ชำระเงินทั้งหมด (All Payments)</option>
                    <option value="cash">เงินสด (Cash)</option>
                    <option value="promptpay">พร้อมเพย์ QR</option>
                    <option value="card">รูดบัตร EDC</option>
                    <option value="govt">โครงการรัฐบาล</option>
                  </select>
                </div>
              )}
            </div>

            {/* STEP 3: CUSTOM FIELD / COLUMN SELECTOR */}
            <div className="space-y-2 pt-1 border-t border-amber-400/30">
              <div className="flex items-center justify-between">
                <label className="block text-stone-950 font-black text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-amber-400 text-stone-950 rounded-full flex items-center justify-center text-[10px] font-black">3</span>
                  <span>เลือกหัวข้อ/ฟิลด์ข้อมูลที่ต้องการออกในไฟล์ (Select Columns):</span>
                </label>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={selectAllCols}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-stone-950 border border-amber-400 rounded-lg text-[11px] font-black transition cursor-pointer flex items-center gap-1"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-amber-700" />
                    <span>เลือกทั้งหมด</span>
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllCols}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-950 border border-stone-300 rounded-lg text-[11px] font-black transition cursor-pointer flex items-center gap-1"
                  >
                    <Square className="w-3.5 h-3.5 text-stone-600" />
                    <span>ยกเลิกทั้งหมด</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-300 max-h-56 overflow-y-auto">
                {(REPORT_COLUMNS[customReportType] || []).map((col) => {
                  const isChecked = !!selectedCols[col.key];
                  return (
                    <label
                      key={col.key}
                      onClick={() => toggleCol(col.key)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition cursor-pointer select-none ${
                        isChecked
                          ? 'bg-amber-400/20 border-amber-500 text-stone-950 font-black'
                          : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-amber-400 border-amber-600 text-stone-950' : 'bg-white border-stone-400'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs">{col.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* MODAL FOOTER & ACTIONS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-amber-400/40">
              <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>จำนวนรายการที่จะถูกดึง: {getFilteredReportData().length} รายการ</span>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewPrintModalOpen(true)}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 border border-sky-700 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>พรีวิวตาราง &amp; สั่งพิมพ์ PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCustomCSV}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 border border-emerald-700 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                  <span>ดาวน์โหลด Excel (CSV)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE REPORT PREVIEW & PDF PRINT OVERLAY */}
      {isPreviewPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative bg-white border-2 border-stone-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 text-stone-950 shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
            
            {/* Header & Print Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-stone-200 pb-4">
              <div>
                <span className="text-[10px] font-black text-stone-950 bg-amber-400 px-3 py-1 rounded-full uppercase border border-amber-500">
                  HUDA ABAYA DUBAI — OFFICIAL REPORT
                </span>
                <h3 className="font-serif font-black text-2xl text-stone-950 mt-1">
                  รายงานสรุปข้อมูลตามตัวกรองอิสระ (Custom Report Summary)
                </h3>
                <p className="text-xs text-stone-700 font-bold">
                  ดึงข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH')} | จำนวนรวม {getFilteredReportData().length} รายการ
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 border border-amber-500 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-stone-950" />
                  <span>สั่งพิมพ์ / บันทึกเป็น PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPreviewPrintModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-950 font-black text-xs rounded-xl border border-stone-300 transition cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>

            {/* Printable Preview Table */}
            <div className="overflow-x-auto border-2 border-stone-300 rounded-2xl">
              <table className="w-full text-xs text-left text-stone-950">
                <thead className="bg-amber-400 text-stone-950 font-black border-b-2 border-amber-500">
                  <tr>
                    {(REPORT_COLUMNS[customReportType] || []).filter((c) => selectedCols[c.key]).map((c) => (
                      <th key={c.key} className="px-3.5 py-2.5 whitespace-nowrap border-r border-amber-500/40 last:border-r-0">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {getFilteredReportData().length === 0 ? (
                    <tr>
                      <td
                        colSpan={(REPORT_COLUMNS[customReportType] || []).filter((c) => selectedCols[c.key]).length || 1}
                        className="text-center py-8 text-stone-500 font-bold"
                      >
                        ไม่พบข้อมูลตามช่วงเวลาและตัวกรองที่เลือก
                      </td>
                    </tr>
                  ) : (
                    getFilteredReportData().map((row, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/50 transition">
                        {(REPORT_COLUMNS[customReportType] || []).filter((c) => selectedCols[c.key]).map((c) => {
                          const val = (row as any)[c.key];
                          const isNumber = typeof val === 'number';
                          return (
                            <td key={c.key} className={`px-3.5 py-2.5 font-bold ${isNumber ? 'font-mono text-right' : ''}`}>
                              {isNumber ? val.toLocaleString('th-TH') : String(val ?? '-')}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
