'use client';

import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  DollarSign,
  User,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
  Printer,
  FileText,
  Camera,
  QrCode,
  Sparkles,
  Check,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Order, CartItem, Product, StaffUser } from '../../types';
import { QRScannerModal } from '../common/QRScannerModal';
import { resolveScannedProduct } from '../../utils/qrUtils';
import { formatThaiDateTime } from '../../utils/dateUtils';
import { soundFx } from '../../lib/soundEffects';

interface POSRefundExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBoothTransferId?: string | null;
}

export const POSRefundExchangeModal: React.FC<POSRefundExchangeModalProps> = ({
  isOpen,
  onClose,
  currentBoothTransferId,
}) => {
  const {
    orders,
    products,
    formatPrice,
    refundOrderItems,
    exchangeOrderItem,
    verifySupervisorPin,
    currentStaff,
    boothTransfers,
  } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeAction, setActiveAction] = useState<'refund' | 'exchange'>('refund');

  // Refund State
  const [selectedRefundItems, setSelectedRefundItems] = useState<{ [key: string]: number }>({});
  const [refundMethod, setRefundMethod] = useState<'cash' | 'transfer'>('cash');
  const [refundReason, setRefundReason] = useState('ลูกค้าลองแล้วไซส์ไม่พอดี');
  const [customRefundReason, setCustomRefundReason] = useState('');

  // Exchange State
  const [exchangeReturnItemKey, setExchangeReturnItemKey] = useState<string>('');
  const [selectedNewProductId, setSelectedNewProductId] = useState<string>('');
  const [selectedNewVariantId, setSelectedNewVariantId] = useState<string>('');
  const [exchangePaymentMethod, setExchangePaymentMethod] = useState<'cash' | 'promptpay' | 'none'>('cash');
  const [exchangeReason, setExchangeReason] = useState('ขอเปลี่ยนไซส์');
  const [customExchangeReason, setCustomExchangeReason] = useState('');

  // Scanner state for Exchange (Step 2)
  const [isExchangeQRScannerOpen, setIsExchangeQRScannerOpen] = useState(false);
  const [exchangeBarcodeInput, setExchangeBarcodeInput] = useState('');
  const [exchangeScannedHistory, setExchangeScannedHistory] = useState<
    Array<{
      productId: string;
      variantId: string;
      productTitle: string;
      variantName: string;
      sku?: string;
      price: number;
      stockQuantity: number;
      boothStock?: number;
      image?: string;
      scannedAt: number;
    }>
  >([]);

  // Supervisor PIN Override Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pendingAction, setPendingAction] = useState<'refund' | 'exchange' | null>(null);

  // Success Feedback State
  const [successResult, setSuccessResult] = useState<{
    type: 'refund' | 'exchange';
    message: string;
    orderId: string;
    details?: string;
  } | null>(null);

  // Helper date formatter that never throws
  const formatOrderDate = (dateVal?: string | number) => {
    return formatThaiDateTime(dateVal);
  };

  const formatOrderTime = (dateVal?: string | number) => {
    if (!dateVal) return '-';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleTimeString('th-TH');
    } catch {
      return '-';
    }
  };

  // Filter orders: POS orders that are paid and not fully cancelled
  const candidateOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    const q = (searchQuery || '').trim().toLowerCase();

    return list
      .filter((o) => {
        if (!o) return false;
        const isPos = Boolean(o.note?.includes('ออเดอร์หน้าร้าน POS') || o.boothTransferId);
        const matchesQuery =
          !q ||
          (o.id || '').toLowerCase().includes(q) ||
          (o.customerName || '').toLowerCase().includes(q) ||
          (o.customerPhone || '').includes(q);
        return isPos && matchesQuery;
      })
      .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime())
      .slice(0, 30);
  }, [orders, searchQuery]);

  // Selected Order's Active Items
  const orderItems = Array.isArray(selectedOrder?.items) ? selectedOrder.items : [];

  // Calculate Total Refund Amount
  const totalRefundAmount = useMemo(() => {
    if (!selectedOrder) return 0;
    let sum = 0;
    orderItems.forEach((item, idx) => {
      if (!item) return;
      const key = `${item.productId}_${item.variantId}_${idx}`;
      const qty = selectedRefundItems[key] || 0;
      sum += qty * (Number(item.price) || 0);
    });
    return sum;
  }, [selectedOrder, orderItems, selectedRefundItems]);

  // Selected Return Item for Exchange
  const returnItemCandidate = useMemo(() => {
    if (!selectedOrder || !exchangeReturnItemKey) return null;
    const parts = exchangeReturnItemKey.split('_');
    const idx = parseInt(parts[parts.length - 1], 10);
    return orderItems[idx] || null;
  }, [selectedOrder, exchangeReturnItemKey, orderItems]);

  // Effective Booth: Prioritize current POS cashier booth, fallback to order's booth
  const effectiveBooth = useMemo(() => {
    if (currentBoothTransferId) {
      const b = (boothTransfers || []).find((bt) => bt.id === currentBoothTransferId);
      if (b) return b;
    }
    if (selectedOrder?.boothTransferId) {
      const b = (boothTransfers || []).find((bt) => bt.id === selectedOrder.boothTransferId);
      if (b) return b;
    }
    return null;
  }, [boothTransfers, currentBoothTransferId, selectedOrder]);

  // Helper to query stock at effective booth vs central warehouse
  const getBoothStock = (productId: string, variantId: string) => {
    const prod = (products || []).find((p) => p && p.id === productId);
    const variant = (prod?.variants || []).find((v) => v && v.id === variantId);
    const warehouseStock = variant ? (Number(variant.stockQuantity) || 0) : 0;

    if (effectiveBooth) {
      const boothItem = (effectiveBooth.items || []).find(
        (i) => i.productId === productId && i.variantId === variantId
      );
      const dispatched = boothItem ? (Number(boothItem.dispatchedQty) || 0) : 0;
      const sold = boothItem ? (Number(boothItem.soldQty) || 0) : 0;
      const boothStock = Math.max(0, dispatched - sold);
      return {
        warehouseStock,
        boothStock,
        isBooth: true,
        boothName: effectiveBooth.eventName,
        branchName: effectiveBooth.branchName,
        hasBoothStock: boothStock > 0,
      };
    }

    return {
      warehouseStock,
      boothStock: warehouseStock,
      isBooth: false,
      boothName: null,
      branchName: null,
      hasBoothStock: warehouseStock > 0,
    };
  };

  // Helper to compute total booth stock for a product across all variants
  const getProductTotalBoothStock = (prod: Product | null | undefined) => {
    if (!prod || !Array.isArray(prod.variants)) {
      return { totalBooth: 0, totalWarehouse: 0, variantsWithStock: 0 };
    }
    let totalBooth = 0;
    let totalWarehouse = 0;
    let variantsWithStock = 0;

    for (const v of prod.variants) {
      if (!v) continue;
      const info = getBoothStock(prod.id, v.id);
      totalWarehouse += info.warehouseStock;
      if (info.isBooth) {
        totalBooth += info.boothStock;
        if (info.boothStock > 0) variantsWithStock++;
      } else {
        totalBooth += info.warehouseStock;
        if (info.warehouseStock > 0) variantsWithStock++;
      }
    }

    return { totalBooth, totalWarehouse, variantsWithStock };
  };

  // Product corresponding to returnItemCandidate
  const returnProduct = useMemo(() => {
    if (!returnItemCandidate) return null;
    return (products || []).find((p) => p && p.id === returnItemCandidate.productId) || null;
  }, [products, returnItemCandidate]);

  // Selected Replacement Product & Variant for Exchange
  const selectedNewProduct = (products || []).find((p) => p && p.id === selectedNewProductId);
  const selectedNewVariant = (selectedNewProduct?.variants || []).find((v) => v && v.id === selectedNewVariantId);

  // Exchange Price Difference Calculation
  const priceDifference = useMemo(() => {
    if (!returnItemCandidate || !selectedNewVariant) return 0;
    return (Number(selectedNewVariant.price) || 0) - (Number(returnItemCandidate.price) || 0);
  }, [returnItemCandidate, selectedNewVariant]);

  // Staff Permissions Check
  const isOwner = currentStaff?.role === 'OWNER';
  const canVoid = isOwner || !!currentStaff?.permissions?.canVoidPOSOrder;
  const canExchange = isOwner || (currentStaff?.permissions?.canExchangeProduct !== false);

  // Exchange Scanner Functions
  const handleSelectReplacement = (prod: Product, variant: any) => {
    setSelectedNewProductId(prod.id);
    setSelectedNewVariantId(variant.id);

    const stockInfo = getBoothStock(prod.id, variant.id);

    const historyItem = {
      productId: prod.id,
      variantId: variant.id,
      productTitle: prod.title,
      variantName: variant.name,
      sku: variant.sku,
      price: Number(variant.price) || 0,
      stockQuantity: stockInfo.warehouseStock,
      boothStock: stockInfo.isBooth ? stockInfo.boothStock : undefined,
      image: prod.images?.[0] || '',
      scannedAt: Date.now(),
    };

    setExchangeScannedHistory((prev) => {
      const filtered = prev.filter(
        (it) => !(it.productId === prod.id && it.variantId === variant.id)
      );
      return [historyItem, ...filtered].slice(0, 15);
    });
  };

  const handleExchangeQRScan = (decodedText: string) => {
    const match = resolveScannedProduct(decodedText, products);
    if (match) {
      handleSelectReplacement(match.product, match.variant);
      soundFx.playScanSuccess();
      return {
        success: true,
        message: `เลือก: ${match.product.title} (${match.variant.name})`,
      };
    } else {
      soundFx.playScanError();
      return {
        success: false,
        message: `ไม่พบสินค้า "${decodedText}"`,
      };
    }
  };

  const handleExchangeBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = exchangeBarcodeInput.trim();
    if (!clean) return;

    const match = resolveScannedProduct(clean, products);
    if (match) {
      handleSelectReplacement(match.product, match.variant);
      soundFx.playScanSuccess();
      setExchangeBarcodeInput('');
    } else {
      soundFx.playScanError();
      alert(`ไม่พบสินค้าที่ตรงกับรหัสหรือบาร์โค้ด "${clean}"`);
    }
  };

  const exchangeScannedFeed = useMemo(() => {
    return exchangeScannedHistory.map((item) => ({
      id: `${item.productId}__${item.variantId}`,
      title: item.productTitle,
      variantName: item.variantName,
      sku: item.sku,
      image: item.image,
      quantity: 1,
      price: item.price,
      maxStock: item.stockQuantity,
    }));
  }, [exchangeScannedHistory]);

  if (!isOpen) return null;

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setSelectedRefundItems({});
    setSuccessResult(null);

    // Default select first item for exchange
    if (Array.isArray(order.items) && order.items.length > 0) {
      setExchangeReturnItemKey(`${order.items[0].productId}_${order.items[0].variantId}_0`);
    }
  };

  const handleToggleRefundItem = (key: string, maxQty: number) => {
    setSelectedRefundItems((prev) => {
      const current = prev[key] || 0;
      if (current > 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: maxQty };
    });
  };

  const handleRefundSubmit = (approvedBy?: string) => {
    if (!selectedOrder) return;
    if (totalRefundAmount <= 0) {
      alert('กรุณาเลือกรายการสินค้าที่ต้องการคืนเงินอย่างน้อย 1 ชิ้น');
      return;
    }

    // Check permission
    if (!canVoid && !approvedBy) {
      setPendingAction('refund');
      setIsPinModalOpen(true);
      return;
    }

    const itemsToRefund: Array<{
      productId: string;
      variantId: string;
      quantity: number;
      price: number;
      productTitle: string;
      variantName: string;
    }> = [];

    orderItems.forEach((item, idx) => {
      if (!item) return;
      const key = `${item.productId}_${item.variantId}_${idx}`;
      const qty = selectedRefundItems[key] || 0;
      if (qty > 0) {
        itemsToRefund.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: qty,
          price: Number(item.price) || 0,
          productTitle: item.productTitle || 'สินค้า',
          variantName: item.variantName || 'มาตรฐาน',
        });
      }
    });

    const finalReason = refundReason === 'อื่นๆ' ? (customRefundReason.trim() || 'ลูกค้าขอคืนเงิน') : refundReason;

    refundOrderItems({
      orderId: selectedOrder.id,
      refundItems: itemsToRefund,
      refundAmount: totalRefundAmount,
      refundMethod,
      reason: finalReason,
      performedBy: currentStaff?.name || 'พนักงานหน้าร้าน',
      approvedBy,
    }).then((res) => {
      if (res.success) {
        setSuccessResult({
          type: 'refund',
          message: res.message,
          orderId: selectedOrder.id,
          details: `คืนเงิน ${formatPrice(totalRefundAmount)} (${refundMethod === 'cash' ? 'เงินสด' : 'โอนคืน'}) โดย: ${currentStaff?.name || 'พนักงาน'}${approvedBy ? ` (อนุมัติโดย: ${approvedBy})` : ''}`,
        });
        setSelectedOrder(res.updatedOrder || null);
        setSelectedRefundItems({});
      } else {
        alert(res.message);
      }
    }).catch((err) => {
      console.error('Refund error:', err);
      alert(`เกิดข้อผิดพลาดในการคืนเงิน: ${err?.message || 'กรุณาลองใหม่อีกครั้ง'}`);
    });
  };

  const handleExchangeSubmit = (approvedBy?: string) => {
    if (!selectedOrder || !returnItemCandidate || !selectedNewProduct || !selectedNewVariant) {
      alert('กรุณาเลือกสินค้าชิ้นเดิมที่ลูกค้านำมาคืน และเลือกสินค้าชิ้นใหม่ที่ต้องการเปลี่ยนให้ครบถ้วน');
      return;
    }

    // Check permission
    if (!canExchange && !approvedBy) {
      setPendingAction('exchange');
      setIsPinModalOpen(true);
      return;
    }

    // Check booth stock availability
    if (effectiveBooth) {
      const stockInfo = getBoothStock(selectedNewProduct.id, selectedNewVariant.id);
      if (stockInfo.boothStock <= 0) {
        const proceed = window.confirm(
          `⚠️ แจ้งเตือน: สินค้าใหม่ (${selectedNewProduct.title} - ${selectedNewVariant.name}) ไม่มีสต๊อกคงเหลือที่บูธ "${effectiveBooth.eventName}" (คงเหลือ 0 ชิ้น)\n\nคุณต้องการยืนยันการเปลี่ยนสินค้านี้หรือไม่?`
        );
        if (!proceed) return;
      }
    }

    const finalReason = exchangeReason === 'อื่นๆ' ? (customExchangeReason.trim() || 'ขอเปลี่ยนสินค้า') : exchangeReason;

    exchangeOrderItem({
      orderId: selectedOrder.id,
      boothTransferId: effectiveBooth ? effectiveBooth.id : undefined,
      returnItem: {
        productId: returnItemCandidate.productId,
        variantId: returnItemCandidate.variantId,
        quantity: 1,
        price: Number(returnItemCandidate.price) || 0,
        productTitle: returnItemCandidate.productTitle || 'สินค้า',
        variantName: returnItemCandidate.variantName || 'ไซส์เดิม',
      },
      newItem: {
        productId: selectedNewProduct.id,
        variantId: selectedNewVariant.id,
        quantity: 1,
        price: Number(selectedNewVariant.price) || 0,
        productTitle: selectedNewProduct.title || 'สินค้าใหม่',
        variantName: selectedNewVariant.name || 'ไซส์ใหม่',
      },
      priceDifference,
      paymentMethodForDiff: priceDifference !== 0 ? exchangePaymentMethod : 'none',
      performedBy: currentStaff?.name || 'พนักงานหน้าร้าน',
      approvedBy,
      reason: finalReason,
    }).then((res) => {
      if (res.success) {
        const diffText =
          priceDifference > 0
            ? `รับเงินเพิ่ม ${formatPrice(priceDifference)} (${exchangePaymentMethod === 'cash' ? 'เงินสด' : 'สแกนจ่าย'})`
            : priceDifference < 0
            ? `คืนเงินส่วนต่าง ${formatPrice(Math.abs(priceDifference))}`
            : 'ราคาเท่ากัน (฿0)';

        setSuccessResult({
          type: 'exchange',
          message: res.message,
          orderId: selectedOrder.id,
          details: `คืน ${returnItemCandidate.variantName} -> ได้รับ ${selectedNewVariant.name} | ${diffText}`,
        });
        setSelectedOrder(res.updatedOrder || null);
        setSelectedNewProductId('');
        setSelectedNewVariantId('');
      } else {
        alert(res.message);
      }
    }).catch((err) => {
      console.error('Exchange error:', err);
      alert(`เกิดข้อผิดพลาดในการเปลี่ยนสินค้า: ${err?.message || 'กรุณาลองใหม่อีกครั้ง'}`);
    });
  };

  const handlePinApprove = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    const res = verifySupervisorPin(pinInput);
    if (res.valid) {
      setIsPinModalOpen(false);
      setPinInput('');
      const approver = res.approverName || 'เจ้าของร้าน (Admin)';
      if (pendingAction === 'refund') {
        handleRefundSubmit(approver);
      } else if (pendingAction === 'exchange') {
        handleExchangeSubmit(approver);
      }
      setPendingAction(null);
    } else {
      setPinError('รหัสผ่านไม่ถูกต้อง หรือไม่มีสิทธิ์อนุมัติการยกเลิก/คืนเงิน');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border-2 border-amber-400 max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden text-stone-950 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Header Bar */}
        <div className="p-4 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 flex items-center justify-between border-b-2 border-amber-500 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-stone-950 text-amber-300 flex items-center justify-center shadow-xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-black text-base sm:text-lg text-stone-950">
                จัดการขอคืนเงิน & เปลี่ยนสินค้า (Refund & Exchange)
              </h3>
              <p className="text-[11px] text-stone-800 font-bold">
                ค้นหาบิลขายหน้าร้าน POS เพื่อทำรายการคืนเงิน หรือเปลี่ยนขนาด/แบบสินค้า และดึงสต๊อกกลับคลังอัตโนมัติ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-950 hover:text-white rounded-xl transition cursor-pointer text-stone-950 border border-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Success Banner */}
          {successResult && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl text-emerald-950 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successResult.message}</span>
              </div>
              {successResult.details && (
                <p className="text-xs text-stone-700 font-bold pl-7">
                  {successResult.details}
                </p>
              )}
            </div>
          )}

          {/* Section 1: Order Lookup */}
          {!selectedOrder ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="พิมพ์เลขที่บิล (เช่น 20261027-001) หรือชื่อ/เบอร์โทรลูกค้า..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#FAF9F6] border-2 border-stone-300 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold focus:border-amber-500 focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Candidate Orders List */}
              <div className="space-y-2">
                <span className="text-xs font-black text-stone-700 block">
                  รายการบิลขายล่าสุด ({candidateOrders.length} บิล):
                </span>

                {candidateOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-500 bg-[#FAF9F6] border border-stone-200 rounded-xl font-bold">
                    ไม่พบบิลคำสั่งซื้อหน้าร้านที่ตรงกับคำค้นหา
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                    {candidateOrders.map((ord) => {
                      if (!ord) return null;
                      const isCancelled = ord.orderStatus === 'cancelled';
                      const isRefunded = ord.paymentStatus === 'refunded';
                      const safeItems = Array.isArray(ord.items) ? ord.items : [];
                      const totalQty = safeItems.reduce((s, i) => s + (Number(i?.quantity) || 0), 0);

                      return (
                        <div
                          key={ord.id}
                          onClick={() => handleSelectOrder(ord)}
                          className={`p-3.5 border-2 rounded-xl transition cursor-pointer flex flex-col justify-between gap-2 shadow-xs ${
                            isCancelled
                              ? 'bg-stone-100 border-stone-300 opacity-70'
                              : 'bg-white border-stone-200 hover:border-amber-500 hover:bg-amber-50/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-mono font-black text-xs text-[#141312] flex items-center gap-1.5">
                                <span>#{ord.id}</span>
                                {isCancelled && (
                                  <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded">
                                    ยกเลิกแล้ว
                                  </span>
                                )}
                                {isRefunded && (
                                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                                    คืนเงินแล้ว
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-stone-700 mt-0.5">
                                {ord.customerName || 'ลูกค้าหน้าร้าน/Walk-in'} {ord.customerPhone ? `(${ord.customerPhone})` : ''}
                              </p>
                              <span className="text-[10px] text-stone-500 font-bold block mt-0.5">
                                {formatOrderDate(ord.createdAt)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-black text-sm text-[#141312]">
                                {formatPrice(ord.netAmount)}
                              </span>
                              <span className="text-[10px] text-stone-500 block font-bold">
                                {safeItems.length} รายการ ({totalQty} ชิ้น)
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-amber-900 font-bold">
                            <span>กดเลือกเพื่อคืนเงิน / เปลี่ยนสินค้า</span>
                            <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Section 2: Selected Order Actions (Refund or Exchange) */
            <div className="space-y-5">
              {/* Selected Order Header Card */}
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-[#141312]">บิล #{selectedOrder.id}</span>
                    <span className="text-[10px] bg-stone-950 text-amber-300 font-black px-2 py-0.5 rounded">
                      ยอดสุทธิ: {formatPrice(selectedOrder.netAmount)}
                    </span>
                    {selectedOrder.orderStatus === 'cancelled' && (
                      <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded">
                        ยกเลิกแล้ว
                      </span>
                    )}
                  </div>
                  <p className="text-stone-700 font-bold mt-1">
                    ลูกค้า: {selectedOrder.customerName || 'ลูกค้าหน้าร้าน'} • เวลาขาย: {formatOrderTime(selectedOrder.createdAt)}
                  </p>
                  {selectedOrder.note && (
                    <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                      {selectedOrder.note}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg text-xs font-bold text-stone-700 transition cursor-pointer self-start sm:self-auto"
                >
                  ← เลือกลูกค้าบิลอื่น
                </button>
              </div>

              {/* Action Tabs: Refund vs Exchange */}
              <div className="grid grid-cols-2 gap-2 border-b border-stone-200 pb-3">
                <button
                  type="button"
                  onClick={() => setActiveAction('refund')}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer border-2 ${
                    activeAction === 'refund'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-rose-300'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>1. ขอคืนเงิน / ยกเลิกบิล (Refund)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAction('exchange')}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer border-2 ${
                    activeAction === 'exchange'
                      ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-amber-400'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>2. ขอเปลี่ยนสินค้า / ไซส์ (Exchange)</span>
                </button>
              </div>

              {/* ACTION 1: REFUND VIEW */}
              {activeAction === 'refund' && (
                <div className="space-y-4">
                  <div className="bg-[#FAF9F6] border border-stone-300 rounded-xl p-4 space-y-3">
                    <span className="text-xs font-black text-stone-800 block">
                      เลือกรายการสินค้าที่ลูกค้าต้องการคืน (ระบบจะดึงสินค้าชิ้นนั้นกลับเข้าสต๊อกอัตโนมัติ):
                    </span>

                    <div className="space-y-2">
                      {orderItems.map((item, idx) => {
                        if (!item) return null;
                        const key = `${item.productId}_${item.variantId}_${idx}`;
                        const isSelected = (selectedRefundItems[key] || 0) > 0;
                        const itemQty = Number(item.quantity) || 1;
                        const itemPrice = Number(item.price) || 0;

                        return (
                          <div
                            key={key}
                            onClick={() => handleToggleRefundItem(key, itemQty)}
                            className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-rose-50 border-rose-500 text-rose-950 shadow-xs'
                                : 'bg-white border-stone-200 hover:border-stone-400 text-stone-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                              />
                              <div>
                                <span className="font-bold text-xs block">{item.productTitle || 'สินค้า'}</span>
                                <span className="text-[11px] text-stone-500 font-medium">
                                  ไซส์/สี: {item.variantName || 'มาตรฐาน'} • ซื้อจำนวน {itemQty} ชิ้น
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-black text-xs">
                                {formatPrice(itemPrice * itemQty)}
                              </span>
                              <span className="text-[10px] text-stone-500 block font-medium">
                                @{formatPrice(itemPrice)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Refund Details Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                    {/* Method */}
                    <div>
                      <label className="block text-stone-700 mb-1">
                        ช่องทางการคืนเงินให้ลูกค้า:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label
                          className={`p-2.5 border-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition ${
                            refundMethod === 'cash'
                              ? 'bg-rose-50 border-rose-500 text-rose-950'
                              : 'bg-white border-stone-300 text-stone-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="refundMethod"
                            checked={refundMethod === 'cash'}
                            onChange={() => setRefundMethod('cash')}
                            className="hidden"
                          />
                          <span>💵 คืนเงินสด (Cash)</span>
                        </label>

                        <label
                          className={`p-2.5 border-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition ${
                            refundMethod === 'transfer'
                              ? 'bg-rose-50 border-rose-500 text-rose-950'
                              : 'bg-white border-stone-300 text-stone-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="refundMethod"
                            checked={refundMethod === 'transfer'}
                            onChange={() => setRefundMethod('transfer')}
                            className="hidden"
                          />
                          <span>📱 โอนเงินคืน (PromptPay)</span>
                        </label>
                      </div>
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-stone-700 mb-1">เหตุผลในการขอคืนเงิน:</label>
                      <select
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        className="w-full bg-[#FAF9F6] border-2 border-stone-300 rounded-xl p-2.5 text-xs font-bold text-stone-900 focus:outline-none"
                      >
                        <option value="ลูกค้าลองแล้วไซส์ไม่พอดี">ลองแล้วไซส์ไม่พอดี</option>
                        <option value="ลูกค้าเปลี่ยนใจ">ลูกค้าเปลี่ยนใจ</option>
                        <option value="สินค้ามีตำหนิหรือชำรุด">สินค้ามีตำหนิหรือชำรุด</option>
                        <option value="ส่งมอบสินค้าผิดรุ่น">ส่งมอบสินค้าผิดรุ่น</option>
                        <option value="อื่นๆ">ระบุเหตุผลอื่นๆ...</option>
                      </select>
                      {refundReason === 'อื่นๆ' && (
                        <input
                          type="text"
                          placeholder="กรอกเหตุผลที่คืนเงิน..."
                          value={customRefundReason}
                          onChange={(e) => setCustomRefundReason(e.target.value)}
                          className="mt-1.5 w-full bg-white border border-stone-300 rounded-lg p-2 text-xs"
                        />
                      )}
                    </div>
                  </div>

                  {/* Summary & Submit */}
                  <div className="bg-rose-50/80 border-2 border-rose-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                      <span className="text-xs text-rose-900 font-bold block">
                        ยอดรวมที่ต้องจ่ายคืนลูกค้า:
                      </span>
                      <span className="font-mono font-black text-2xl text-rose-700">
                        {formatPrice(totalRefundAmount)}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={totalRefundAmount <= 0}
                      onClick={() => handleRefundSubmit()}
                      className={`px-6 py-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                        totalRefundAmount > 0
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ยืนยันคืนเงิน & คืนสต๊อกสินค้า</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION 2: EXCHANGE VIEW */}
              {activeAction === 'exchange' && (
                <div className="space-y-4">
                  {/* Step A: Pick Return Item */}
                  <div className="bg-[#FAF9F6] border border-stone-300 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-stone-200 pb-2">
                      <div>
                        <span className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                          <span>ขั้นตอนที่ 1: เลือกสินค้าที่ลูกค้านำมาขอเปลี่ยน (ดึงกลับคืนสต๊อก)</span>
                        </span>
                        <p className="text-[11px] text-stone-500 font-bold mt-0.5">
                          คลิกเลือกชิ้นที่ลูกค้านำมา ระบบจะตรวจสอบสต๊อกของบูธและไซส์อื่นๆ ที่พร้อมให้เปลี่ยนทันที
                        </p>
                      </div>

                      {/* Location Badge */}
                      <div className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-amber-100/90 text-amber-950 border border-amber-300 flex items-center gap-1.5 self-start sm:self-auto">
                        <span>{effectiveBooth ? '🎪 จุดขายบูธ:' : '🏬 จุดขาย:'}</span>
                        <span className="font-serif">
                          {effectiveBooth ? `${effectiveBooth.eventName}` : 'คลังหลัก / หน้าร้านกลาง'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {orderItems.map((item, idx) => {
                        if (!item) return null;
                        const key = `${item.productId}_${item.variantId}_${idx}`;
                        const isSelected = exchangeReturnItemKey === key;
                        const prod = (products || []).find((p) => p && p.id === item.productId);
                        const stockSummary = getProductTotalBoothStock(prod);
                        const itemStockInfo = getBoothStock(item.productId, item.variantId);

                        return (
                          <div
                            key={key}
                            onClick={() => setExchangeReturnItemKey(key)}
                            className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between gap-2 ${
                              isSelected
                                ? 'bg-amber-100/90 border-amber-600 text-stone-950 font-bold shadow-xs ring-1 ring-amber-500'
                                : 'bg-white border-stone-200 hover:border-amber-400 text-stone-800'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-xs font-black block text-stone-900">{item.productTitle || 'สินค้า'}</span>
                                <span className="text-[11px] text-stone-600">
                                  ขนาดเดิม: <strong className="text-stone-900">{item.variantName || 'มาตรฐาน'}</strong>
                                </span>
                              </div>
                              <span className="font-mono font-black text-xs text-amber-900 shrink-0">
                                {formatPrice(item.price)}
                              </span>
                            </div>

                            {/* Booth availability badge on each card */}
                            <div className="pt-1.5 border-t border-stone-100 flex items-center justify-between text-[10px]">
                              {effectiveBooth ? (
                                itemStockInfo.boothStock > 0 ? (
                                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                                    <span>✓ ไซส์นี้ที่บูธมี {itemStockInfo.boothStock} ชิ้น</span>
                                  </span>
                                ) : stockSummary.totalBooth > 0 ? (
                                  <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                                    <span>⚠️ ไซส์เดิมหมด (ไซส์อื่นมี {stockSummary.totalBooth} ชิ้น)</span>
                                  </span>
                                ) : (
                                  <span className="font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300 flex items-center gap-1">
                                    <span>❌ หมดที่บูธ (คลังใหญ่มี {stockSummary.totalWarehouse} ชิ้น)</span>
                                  </span>
                                )
                              ) : (
                                <span className="font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-300">
                                  🏬 คลังใหญ่: {itemStockInfo.warehouseStock} ชิ้น
                                </span>
                              )}

                              {isSelected && (
                                <span className="text-[10px] font-black text-amber-700">
                                  ✓ เลือกคืนชิ้นนี้
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* DEDICATED BOOTH STOCK INSPECTION & QUICK SIZE EXCHANGE PANEL */}
                    {returnItemCandidate && returnProduct && (
                      <div className="mt-3 p-3.5 sm:p-4 bg-gradient-to-br from-amber-50/90 to-orange-50/70 border-2 border-amber-400 rounded-xl space-y-3 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-stone-950 text-amber-400 flex items-center justify-center font-black text-base shadow-xs">
                              {effectiveBooth ? '🎪' : '🏬'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-stone-950">
                                  {effectiveBooth
                                    ? `เช็คสต๊อกที่บูธ: ${effectiveBooth.eventName}`
                                    : 'เช็คสต๊อกที่: คลังหลัก / หน้าร้านกลาง'}
                                </span>
                                {effectiveBooth && (
                                  <span className="text-[10px] bg-amber-200 text-stone-800 font-bold px-1.5 py-0.2 rounded">
                                    สาขา {effectiveBooth.branchName}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-stone-600 font-bold block mt-0.5">
                                รุ่น: <strong>{returnProduct.title}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Summary Badge */}
                          {(() => {
                            const summary = getProductTotalBoothStock(returnProduct);
                            if (effectiveBooth) {
                              if (summary.totalBooth > 0) {
                                return (
                                  <span className="text-xs font-black text-emerald-900 bg-emerald-100 border border-emerald-400 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>มีของที่บูธพร้อมเปลี่ยน {summary.totalBooth} ชิ้น</span>
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="text-xs font-black text-rose-900 bg-rose-100 border border-rose-400 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
                                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                                    <span>❌ สินค้ารุ่นนี้หมดที่บูธแล้ว</span>
                                  </span>
                                );
                              }
                            }
                            return (
                              <span className="text-xs font-black text-stone-900 bg-stone-200/90 border border-stone-300 px-3 py-1 rounded-xl">
                                มีที่คลังใหญ่รวม: {summary.totalWarehouse} ชิ้น
                              </span>
                            );
                          })()}
                        </div>

                        {/* Sizes breakdown of this product */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-black text-stone-800 flex items-center gap-1">
                              <span>👕 สต๊อกไซส์ต่างๆ ของรุ่นนี้ที่บูธ:</span>
                              <span className="text-[10px] text-amber-800 font-bold">(คลิกปุ่มเพื่อเลือกเปลี่ยนเป็นไซส์นั้นทันที)</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {(returnProduct.variants || []).map((variant) => {
                              if (!variant) return null;
                              const stockInfo = getBoothStock(returnProduct.id, variant.id);
                              const isOriginalSize = variant.id === returnItemCandidate.variantId;
                              const isCurrentlyChosen =
                                selectedNewProductId === returnProduct.id && selectedNewVariantId === variant.id;
                              const hasStock = effectiveBooth ? stockInfo.boothStock > 0 : stockInfo.warehouseStock > 0;
                              const stockCount = effectiveBooth ? stockInfo.boothStock : stockInfo.warehouseStock;

                              return (
                                <div
                                  key={variant.id}
                                  className={`p-2.5 rounded-xl border-2 transition flex flex-col justify-between gap-2 ${
                                    isCurrentlyChosen
                                      ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-500 shadow-xs'
                                      : hasStock
                                      ? 'bg-white border-amber-200 hover:border-amber-400'
                                      : 'bg-stone-100 border-stone-200 opacity-80'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-serif font-black text-xs text-stone-950">
                                        {variant.name}
                                      </span>
                                      {isOriginalSize && (
                                        <span className="text-[9px] font-black bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">
                                          ไซส์เดิม
                                        </span>
                                      )}
                                    </div>

                                    <div className="mt-1 flex items-center justify-between text-[11px]">
                                      <span className="font-mono font-bold text-stone-600">
                                        {formatPrice(variant.price)}
                                      </span>
                                      <span
                                        className={`font-black px-1.5 py-0.5 rounded text-[10px] ${
                                          hasStock
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                                        }`}
                                      >
                                        {effectiveBooth ? `ที่บูธ: ${stockCount} ชิ้น` : `คลัง: ${stockCount} ชิ้น`}
                                      </span>
                                    </div>

                                    {effectiveBooth && (
                                      <span className="text-[10px] text-stone-400 font-bold block mt-0.5">
                                        คลังใหญ่: {stockInfo.warehouseStock} ชิ้น
                                      </span>
                                    )}
                                  </div>

                                  {/* Quick Select Button */}
                                  {isCurrentlyChosen ? (
                                    <div className="w-full py-1.5 bg-amber-500 text-stone-950 font-black text-[11px] rounded-lg text-center flex items-center justify-center gap-1 shadow-2xs">
                                      <Check className="w-3.5 h-3.5" />
                                      <span>เลือกเป็นสินค้าใหม่แล้ว</span>
                                    </div>
                                  ) : hasStock ? (
                                    <button
                                      type="button"
                                      onClick={() => handleSelectReplacement(returnProduct, variant)}
                                      className="w-full py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-black text-[11px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                                    >
                                      <Sparkles className="w-3 h-3 text-amber-400" />
                                      <span>⚡ เลือกเปลี่ยนไซส์นี้</span>
                                    </button>
                                  ) : (
                                    <div className="w-full py-1 bg-stone-200 text-stone-400 font-bold text-[10px] rounded-lg text-center cursor-not-allowed">
                                      หมดที่บูธ
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Customer wanting a different model notice */}
                        <div className="p-2.5 bg-white/90 border border-amber-200 rounded-xl text-[11px] text-stone-600 font-bold flex items-center gap-2">
                          <span className="text-base">💡</span>
                          <span>
                            หากลูกค้าต้องการเปลี่ยนเป็น <strong>สินค้ารุ่นอื่น / สินค้าคนละประเภท</strong> สามารถเลื่อนลงไปที่ <strong>"ขั้นตอนที่ 2"</strong> เพื่อสแกน QR Code หรือเลือกรุ่นสินค้าใหม่ได้ทันทีครับ
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step B: Pick New Replacement Product & Variant with QR SCANNER & LIVE STACK */}
                  <div className="bg-white border-2 border-amber-400 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
                      <div>
                        <span className="text-xs font-black text-stone-950 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>ขั้นตอนที่ 2: เลือกสินค้าชิ้นใหม่ที่ลูกค้าต้องการเปลี่ยนไป (ตัดสต๊อกออก)</span>
                        </span>
                        <p className="text-[11px] text-stone-500 font-bold mt-0.5">
                          สแกนด้วยกล้องมือถือ / ยิงปืนบาร์โค้ด หรือเลือกรุ่นสินค้าจากเมนูด้านล่าง
                        </p>
                      </div>

                      {/* Camera Scanner Button */}
                      <button
                        type="button"
                        onClick={() => setIsExchangeQRScannerOpen(true)}
                        className="px-4 py-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-stone-950 border-2 border-amber-600 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer shrink-0"
                      >
                        <Camera className="w-4 h-4 text-stone-950" />
                        <span>📸 สแกน QR Code กล้อง (ยิงรัวต่อเนื่อง)</span>
                      </button>
                    </div>

                    {/* Quick Barcode / SKU Scan Input Bar */}
                    <form onSubmit={handleExchangeBarcodeSubmit} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="⚡ ยิงบาร์โค้ด หรือพิมพ์ SKU / รหัสสินค้าใหม่ เช่น HUDA:..."
                          value={exchangeBarcodeInput}
                          onChange={(e) => setExchangeBarcodeInput(e.target.value)}
                          className="w-full bg-[#FAF9F6] border-2 border-stone-300 rounded-xl py-2 pl-9 pr-3 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                        />
                        <QrCode className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-black rounded-xl text-xs transition cursor-pointer border border-stone-700 shrink-0"
                      >
                        ค้นหา / ตกลง
                      </button>
                    </form>

                    {/* Currently Selected Replacement Highlight Card */}
                    {selectedNewProduct && selectedNewVariant ? (
                      <div className="p-3.5 bg-amber-50 border-2 border-amber-500 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
                        <div className="flex items-center gap-3">
                          {selectedNewProduct.images?.[0] ? (
                            <img
                              src={selectedNewProduct.images[0]}
                              alt={selectedNewProduct.title}
                              className="w-12 h-12 rounded-lg object-cover border border-amber-300 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-amber-200/60 border border-amber-300 flex items-center justify-center text-amber-800 font-bold shrink-0 text-xl">
                              👗
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full inline-block">
                                ✓ เลือกเป็นสินค้าใหม่แล้ว
                              </span>
                              {effectiveBooth && (
                                <span className="text-[10px] bg-amber-200 text-stone-900 font-black px-2 py-0.5 rounded-full inline-block">
                                  🎪 บูธ: {effectiveBooth.eventName}
                                </span>
                              )}
                            </div>
                            <h4 className="font-serif font-black text-sm text-stone-950 mt-0.5">
                              {selectedNewProduct.title}
                            </h4>
                            <p className="text-xs text-stone-600 font-bold">
                              ขนาด/ไซส์: <strong className="text-stone-900">{selectedNewVariant.name}</strong>
                              {selectedNewVariant.sku && <span className="text-stone-400 font-mono ml-1.5 text-[10px]">• SKU: {selectedNewVariant.sku}</span>}
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span className="font-mono font-black text-base text-stone-950 block">
                            {formatPrice(selectedNewVariant.price)}
                          </span>
                          {(() => {
                            const stockInfo = getBoothStock(selectedNewProduct.id, selectedNewVariant.id);
                            if (effectiveBooth) {
                              return (
                                <div className="space-y-0.5">
                                  <span
                                    className={`text-[10px] font-black px-2 py-0.5 rounded-md inline-block ${
                                      stockInfo.boothStock > 0
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                                    }`}
                                  >
                                    {stockInfo.boothStock > 0
                                      ? `🎪 สต๊อกที่บูธ: ${stockInfo.boothStock} ชิ้น`
                                      : '⚠️ ไม่มีของที่บูธนี้ (0 ชิ้น)'}
                                  </span>
                                  <span className="text-[10px] text-stone-500 font-bold block">
                                    (คลังใหญ่: {stockInfo.warehouseStock} ชิ้น)
                                  </span>
                                </div>
                              );
                            }
                            return (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block ${
                                  (selectedNewVariant.stockQuantity || 0) > 0
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                คลังใหญ่คงเหลือ: {selectedNewVariant.stockQuantity || 0} ชิ้น
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-stone-50 border border-dashed border-stone-300 rounded-xl text-center text-xs text-stone-500 font-bold">
                        ยังไม่ได้เลือกสินค้าชิ้นใหม่ — กรุณาสแกน QR Code หรือเลือกรุ่นสินค้าด้านล่าง
                      </div>
                    )}

                    {/* Scanned Items History List (รายการที่เพิ่งยิงสแกนเรียงกันลงมา) */}
                    {exchangeScannedHistory.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-stone-600">
                          <span>📋 รายการที่ยิงสแกนล่าสุด ({exchangeScannedHistory.length} ชิ้น):</span>
                          <span className="text-[10px] text-amber-700">คลิกที่รายการเพื่อสลับชิ้นได้ทันที</span>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {exchangeScannedHistory.map((item, idx) => {
                            const isCurrent = item.productId === selectedNewProductId && item.variantId === selectedNewVariantId;
                            return (
                              <div
                                key={`${item.productId}_${item.variantId}_${item.scannedAt}`}
                                onClick={() => {
                                  setSelectedNewProductId(item.productId);
                                  setSelectedNewVariantId(item.variantId);
                                }}
                                className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 cursor-pointer ${
                                  isCurrent
                                    ? 'bg-amber-100/90 border-amber-500 shadow-xs ring-1 ring-amber-500'
                                    : 'bg-white border-stone-200 hover:bg-stone-50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </span>
                                  <div>
                                    <span className="font-bold text-xs text-stone-900 block">{item.productTitle}</span>
                                    <span className="text-[10px] text-stone-500">
                                      ไซส์: <strong className="text-stone-700">{item.variantName}</strong>
                                      {item.sku && <span className="ml-1 font-mono">• {item.sku}</span>}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="text-right">
                                    <span className="font-mono font-black text-xs text-stone-900 block">
                                      {formatPrice(item.price)}
                                    </span>
                                    {effectiveBooth && typeof item.boothStock === 'number' && (
                                      <span
                                        className={`text-[9px] font-black px-1.5 py-0.2 rounded block ${
                                          item.boothStock > 0
                                            ? 'text-emerald-700 bg-emerald-50'
                                            : 'text-rose-700 bg-rose-50'
                                        }`}
                                      >
                                        บูธ: {item.boothStock} ชิ้น
                                      </span>
                                    )}
                                  </div>
                                  {isCurrent ? (
                                    <span className="text-[10px] font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-md">
                                      ✓ กำลังเลือก
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold bg-stone-100 hover:bg-amber-200 text-stone-700 px-2 py-0.5 rounded-md border border-stone-300">
                                      สลับเป็นชิ้นนี้
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Manual Dropdowns (เป็นตัวเลือกสำรอง) */}
                    <div className="pt-2 border-t border-stone-200">
                      <span className="text-[11px] font-bold text-stone-500 block mb-2">
                        หรือเลือกจากเมนูดรอปดาวน์ด้วยตนเอง:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-stone-700 font-bold mb-1">
                            เลือกรุ่นสินค้า:
                          </label>
                          <select
                            value={selectedNewProductId}
                            onChange={(e) => {
                              const pId = e.target.value;
                              setSelectedNewProductId(pId);
                              const p = (products || []).find((x) => x && x.id === pId);
                              if (p && Array.isArray(p.variants) && p.variants.length > 0) {
                                handleSelectReplacement(p, p.variants[0]);
                              } else {
                                setSelectedNewVariantId('');
                              }
                            }}
                            className="w-full bg-[#FAF9F6] border-2 border-stone-300 rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none focus:border-amber-500"
                          >
                            <option value="">-- กรุณาเลือกรุ่นสินค้า --</option>
                            {(products || []).map((p) => {
                              if (!p) return null;
                              const summary = getProductTotalBoothStock(p);
                              return (
                                <option key={p.id} value={p.id}>
                                  {p.title} {effectiveBooth ? `(ที่บูธ ${summary.totalBooth} ชิ้น)` : `(${summary.totalWarehouse} ชิ้น)`}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="block text-stone-700 font-bold mb-1">
                            เลือกขนาด/ไซส์ใหม่:
                          </label>
                          <select
                            value={selectedNewVariantId}
                            disabled={!selectedNewProductId}
                            onChange={(e) => {
                              const vId = e.target.value;
                              setSelectedNewVariantId(vId);
                              if (selectedNewProduct) {
                                const v = (selectedNewProduct.variants || []).find((x) => x && x.id === vId);
                                if (v) handleSelectReplacement(selectedNewProduct, v);
                              }
                            }}
                            className="w-full bg-[#FAF9F6] border-2 border-stone-300 rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                          >
                            <option value="">-- กรุณาเลือกไซส์ใหม่ --</option>
                            {(selectedNewProduct?.variants || []).map((v) => {
                              if (!selectedNewProduct || !v) return null;
                              const stockInfo = getBoothStock(selectedNewProduct.id, v.id);
                              return (
                                <option key={v.id} value={v.id}>
                                  {v.name} - {effectiveBooth ? `ที่บูธ ${stockInfo.boothStock} ชิ้น (คลังใหญ่ ${stockInfo.warehouseStock})` : `คงเหลือ ${stockInfo.warehouseStock} ชิ้น`} ({formatPrice(v.price)})
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Difference Calculation Box */}
                  {returnItemCandidate && selectedNewVariant && (
                    <div className="p-4 bg-amber-50/90 border-2 border-amber-400 rounded-xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2.5 text-xs">
                        <div>
                          <span className="text-stone-600 block">สินค้าคืน:</span>
                          <span className="font-bold text-stone-950">
                            {returnItemCandidate.productTitle} ({returnItemCandidate.variantName}) = {formatPrice(returnItemCandidate.price)}
                          </span>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-stone-600 block">สินค้าใหม่:</span>
                          <span className="font-bold text-stone-950">
                            {selectedNewProduct?.title} ({selectedNewVariant.name}) = {formatPrice(selectedNewVariant.price)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-stone-600 block">
                            ผลต่างราคา:
                          </span>
                          <div className="font-mono font-black text-xl">
                            {priceDifference > 0 && (
                              <span className="text-emerald-700">
                                ลูกค้าต้องจ่ายเพิ่ม: +{formatPrice(priceDifference)}
                              </span>
                            )}
                            {priceDifference < 0 && (
                              <span className="text-rose-700">
                                คืนเงินส่วนต่างให้ลูกค้า: -{formatPrice(Math.abs(priceDifference))}
                              </span>
                            )}
                            {priceDifference === 0 && (
                              <span className="text-stone-800">
                                ราคาเท่ากัน (ส่วนต่าง ฿0)
                              </span>
                            )}
                          </div>
                        </div>

                        {priceDifference !== 0 && (
                          <div className="flex items-center gap-2 text-xs font-bold">
                            <label className="text-stone-700">วิธีชำระส่วนต่าง:</label>
                            <select
                              value={exchangePaymentMethod}
                              onChange={(e) => setExchangePaymentMethod(e.target.value as any)}
                              className="bg-white border-2 border-amber-500 rounded-lg p-2 font-bold focus:outline-none"
                            >
                              <option value="cash">💵 เงินสด (Cash)</option>
                              <option value="promptpay">📱 โอนจ่าย/สแกน (PromptPay)</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reason & Submit */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex-1 max-w-xs text-xs font-bold">
                      <label className="block text-stone-700 mb-1">เหตุผลในการเปลี่ยน:</label>
                      <select
                        value={exchangeReason}
                        onChange={(e) => setExchangeReason(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-stone-300 rounded-xl p-2 font-bold"
                      >
                        <option value="ขอเปลี่ยนไซส์ให้ใหญ่ขึ้น">ขอเปลี่ยนไซส์ให้ใหญ่ขึ้น</option>
                        <option value="ขอเปลี่ยนไซส์ให้เล็กลง">ขอเปลี่ยนไซส์ให้เล็กลง</option>
                        <option value="ขอเปลี่ยนสี/แบบอื่น">ขอเปลี่ยนสี/แบบอื่น</option>
                        <option value="อื่นๆ">ระบุเหตุผลอื่นๆ...</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      disabled={!returnItemCandidate || !selectedNewVariant}
                      onClick={() => handleExchangeSubmit()}
                      className={`px-6 py-3.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                        returnItemCandidate && selectedNewVariant
                          ? 'bg-stone-950 hover:bg-stone-800 text-amber-300 border border-amber-400'
                          : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      <RefreshCw className="w-4 h-4 text-amber-400" />
                      <span>ยืนยันเปลี่ยนสินค้า & อัปเดตสต๊อก</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF9F6] border-t border-stone-200 flex items-center justify-between text-xs text-stone-600 font-bold shrink-0">
          <span>
            แคชเชียร์ปัจจุบัน: <strong>{currentStaff?.name || 'พนักงาน'}</strong> (
            {isOwner ? 'เจ้าของร้าน - อนุมัติได้ทันที' : canVoid ? 'มีสิทธิ์คืนเงิน' : 'ต้องขออนุมัติจากผู้จัดการ'}
            )
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-stone-300 bg-white hover:bg-stone-100 rounded-xl transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>

      {/* SUPERVISOR PIN OVERRIDE MODAL */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-500 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-stone-950">
            <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-black text-base text-rose-950">
                  ต้องได้รับอนุมัติจากผู้จัดการ
                </h4>
                <p className="text-[11px] text-stone-500 font-bold">
                  กรุณาใส่รหัส PIN เจ้าของร้าน เพื่ออนุมัติรายการนี้
                </p>
              </div>
            </div>

            {pinError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-lg flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handlePinApprove} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  รหัส PIN ผู้จัดการ / เจ้าของร้าน:
                </label>
                <input
                  type="password"
                  autoFocus
                  maxLength={6}
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#FAF9F6] border-2 border-stone-300 text-center font-mono font-bold text-2xl tracking-widest p-3 rounded-xl focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPinModalOpen(false);
                    setPinInput('');
                    setPinError('');
                  }}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold hover:bg-stone-100 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-md"
                >
                  อนุมัติทำรายการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT BARCODE & QR CODE SCANNER MODAL FOR EXCHANGE */}
      <QRScannerModal
        isOpen={isExchangeQRScannerOpen}
        onClose={() => setIsExchangeQRScannerOpen(false)}
        onScan={handleExchangeQRScan}
        title="⚡ สแกน QR Code สินค้าใหม่ (ยิงรัวต่อเนื่อง)"
        subtitle="นำกล้องส่องไปที่ป้ายสินค้าชิ้นใหม่เพื่อเลือกเปลี่ยนทันที (ระบบจะเรียงรายการที่เพิ่งยิงลงมาให้เห็นชัดเจนทันที)"
        continuous={true}
        scannedFeed={exchangeScannedFeed}
      />
    </div>
  );
};
