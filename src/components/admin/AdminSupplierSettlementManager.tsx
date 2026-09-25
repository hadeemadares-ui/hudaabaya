'use client';

import React, { useState, useEffect } from 'react';
import { Truck, DollarSign, PackageCheck, Plus, Search, Calendar, FileText, CheckCircle2, AlertCircle, Sparkles, Filter, ChevronRight, X, Printer, ArrowDownLeft, ArrowUpRight, CheckSquare, Square, Check } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { StockMovement, SupplierSettlement } from '../../types';
import { VoiceInputButton } from '../common/VoiceInputButton';

export const AdminSupplierSettlementManager: React.FC = () => {
  const {
    products,
    stockMovements,
    supplierSettlements,
    recordStockIn,
    createSupplierSettlement,
    storeSettings,
  } = useShop();

  const [activeSubTab, setActiveSubTab] = useState<'payouts' | 'logs' | 'history'>('payouts');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState<string>('all');
  const [movementSearchQuery, setMovementSearchQuery] = useState<string>('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<'all' | 'IN' | 'OUT'>('all');

  // Modal States
  const [isStockInModalOpen, setIsStockInModalOpen] = useState<boolean>(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState<boolean>(false);
  const [viewingSettlementVoucher, setViewingSettlementVoucher] = useState<SupplierSettlement | null>(null);

  // Stock In Form State
  const [stockInProductId, setStockInProductId] = useState<string>('');
  const [stockInVariantId, setStockInVariantId] = useState<string>('');
  const [stockInQty, setStockInQty] = useState<number>(10);
  const [stockInCostPrice, setStockInCostPrice] = useState<number>(0);
  const [stockInSupplierName, setStockInSupplierName] = useState<string>('โรงงานอาบายะห์ดูไบ');
  const [stockInNote, setStockInNote] = useState<string>('');

  // Settlement Form & Selection State
  const [settleSupplierName, setSettleSupplierName] = useState<string>('');
  const [selectedMovementIds, setSelectedMovementIds] = useState<string[]>([]);
  const [settlementPaymentRef, setSettlementPaymentRef] = useState<string>('');
  const [settlementNote, setSettlementNote] = useState<string>('');

  // Default Known Suppliers
  const SUPPLIER_PRESETS = [
    'โรงงานอาบายะห์ดูไบ',
    'ซัพพลายเออร์น้ำหอมดูไบ',
    'ร้านฝากขาย A (Consignment A)',
    'ร้านฝากขาย B (Consignment B)',
    'โรงงานตัดเย็บเดรสอาหรับ UAE',
  ];

  // Derive Unsettled Sold Movements (Stock OUT items that are not yet settled)
  const unsettledMovements = stockMovements.filter((m) => m.type === 'OUT' && !m.isSettled);

  // Auto-select all unsettled movements initially
  useEffect(() => {
    const unsettledIds = unsettledMovements.map((m) => m.id);
    setSelectedMovementIds(unsettledIds);
  }, [stockMovements]);

  // Unique list of suppliers found in movements
  const allSuppliers = Array.from(
    new Set([...SUPPLIER_PRESETS, ...stockMovements.map((m) => m.supplierName).filter(Boolean)])
  );

  // Filtered Unsettled Movements based on selected Supplier & Search
  const filteredUnsettledMovements = unsettledMovements.filter((m) => {
    const matchesSupplier = selectedSupplierFilter === 'all' || m.supplierName === selectedSupplierFilter;
    const matchesSearch =
      !movementSearchQuery ||
      m.productTitle.toLowerCase().includes(movementSearchQuery.toLowerCase()) ||
      m.variantName.toLowerCase().includes(movementSearchQuery.toLowerCase()) ||
      (m.referenceOrderNo && m.referenceOrderNo.toLowerCase().includes(movementSearchQuery.toLowerCase()));
    return matchesSupplier && matchesSearch;
  });

  // Calculate Overall Metrics
  const totalUnsettledCost = unsettledMovements.reduce((sum, m) => sum + m.totalCost, 0);
  const totalUnsettledItems = unsettledMovements.reduce((sum, m) => sum + m.quantity, 0);

  // Group Unsettled Costs by Supplier
  const supplierSummaryMap = unsettledMovements.reduce((acc, m) => {
    const sName = m.supplierName || 'ไม่ระบุ Supplier';
    if (!acc[sName]) {
      acc[sName] = { supplierName: sName, totalCost: 0, itemsCount: 0, movements: [] as StockMovement[] };
    }
    acc[sName].totalCost += m.totalCost;
    acc[sName].itemsCount += m.quantity;
    acc[sName].movements.push(m);
    return acc;
  }, {} as Record<string, { supplierName: string; totalCost: number; itemsCount: number; movements: StockMovement[] }>);

  const supplierSummaries = Object.values(supplierSummaryMap);

  // Toggle single item selection
  const toggleMovementId = (id: string) => {
    setSelectedMovementIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle select all items for a supplier
  const selectAllForSupplier = (supplierName: string) => {
    const supplierItemIds = unsettledMovements
      .filter((m) => m.supplierName === supplierName)
      .map((m) => m.id);
    setSelectedMovementIds((prev) => Array.from(new Set([...prev, ...supplierItemIds])));
  };

  // Deselect all items for a supplier
  const deselectAllForSupplier = (supplierName: string) => {
    const supplierItemIds = new Set(
      unsettledMovements.filter((m) => m.supplierName === supplierName).map((m) => m.id)
    );
    setSelectedMovementIds((prev) => prev.filter((id) => !supplierItemIds.has(id)));
  };

  // Open Settlement Modal for a specific Supplier
  const handleOpenSettlementModal = (supplierName: string) => {
    const supplierMovements = unsettledMovements.filter((m) => m.supplierName === supplierName);
    const selectedCount = supplierMovements.filter((m) => selectedMovementIds.includes(m.id)).length;
    
    // If no items are selected for this supplier, select all items for this supplier by default
    if (selectedCount === 0) {
      selectAllForSupplier(supplierName);
    }

    setSettleSupplierName(supplierName);
    setSettlementPaymentRef('โอนเงินผ่านแอปธนาคาร / PromptPay');
    setSettlementNote(`เคลียร์ยอดต้นทุนสินค้าประจำรอบ ${new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}`);
    setIsSettlementModalOpen(true);
  };

  // Submit Settlement Action
  const handleConfirmSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    const activeSupplierMovements = unsettledMovements.filter(
      (m) => m.supplierName === settleSupplierName && selectedMovementIds.includes(m.id)
    );

    if (activeSupplierMovements.length === 0) {
      alert('กรุณาเลือกรายการสินค้าที่ต้องการเคลียร์อย่างน้อย 1 รายการครับ');
      return;
    }

    const nowIso = new Date().toISOString();
    const newSettlement = createSupplierSettlement({
      supplierName: settleSupplierName,
      periodStart: nowIso,
      periodEnd: nowIso,
      movementIds: activeSupplierMovements.map((m) => m.id),
      paymentRef: settlementPaymentRef,
      note: settlementNote,
    });

    setIsSettlementModalOpen(false);
    setViewingSettlementVoucher(newSettlement);
    alert(`เคลียร์ยอดจ่ายให้ "${settleSupplierName}" จำนวน ${activeSupplierMovements.length} รายการ เรียบร้อยแล้ว!`);
  };

  // Handle Submit Stock IN Form
  const handleSaveStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInProductId || !stockInVariantId) {
      alert('กรุณาเลือกสินค้าและไซส์/ตัวเลือกสินค้าก่อนครับ');
      return;
    }
    if (stockInQty <= 0) {
      alert('กรุณาระบุจำนวนสินค้าเข้าที่ถูกต้องครับ');
      return;
    }

    recordStockIn({
      productId: stockInProductId,
      variantId: stockInVariantId,
      quantity: stockInQty,
      costPrice: stockInCostPrice,
      supplierName: stockInSupplierName,
      note: stockInNote,
    });

    alert('บันทึกรับสินค้าเข้าสต๊อกเรียบร้อยแล้ว! สต๊อกในระบบอัปเดตทันที');
    setIsStockInModalOpen(false);
    setStockInProductId('');
    setStockInVariantId('');
    setStockInQty(10);
    setStockInCostPrice(0);
    setStockInNote('');
  };

  return (
    <div className="space-y-6 text-xs text-stone-950">
      
      {/* Module Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-amber-400/60 shadow-xl text-stone-950">
        <div>
          <h3 className="font-serif font-black text-lg text-stone-950 flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-600" />
            <span>ระบบสินค้าเข้า-ออก &amp; เคลียร์ยอด Supplier (Consignment Payout Engine)</span>
          </h3>
          <p className="text-xs text-stone-800 font-extrabold mt-1">
            เลือกเคลียร์ยอดจ่ายให้ Supplier ได้อิสระ รายการไหนเก็บไว้เคลียร์รอบหน้าสามารถติ๊กเลือกได้ 100%
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setIsStockInModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 border border-emerald-700 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ บันทึกรับสินค้าเข้า (Stock IN)</span>
          </button>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Unsettled Cost */}
        <div className="bg-white border-2 border-amber-400/80 p-4 rounded-2xl shadow-md space-y-1 text-stone-950">
          <span className="text-xs font-black text-stone-900 block flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-amber-700" />
            <span>ยอดค้างเคลียร์ Supplier รวม</span>
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-black text-amber-900 tracking-tight">
            ฿{totalUnsettledCost.toLocaleString()}
          </div>
          <span className="text-[11px] text-stone-700 block font-black">
            ต้นทุนสินค้าที่ขายแล้ว รอเลือกเคลียร์รอบจ่ายเงิน
          </span>
        </div>

        {/* Card 2: Unsettled Items Count */}
        <div className="bg-white border-2 border-emerald-500 p-4 rounded-2xl shadow-md space-y-1 text-stone-950">
          <span className="text-xs font-black text-emerald-900 block flex items-center gap-1">
            <PackageCheck className="w-4 h-4 text-emerald-700" />
            <span>จำนวนสินค้าค้างเคลียร์</span>
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-black text-emerald-800 tracking-tight">
            {totalUnsettledItems.toLocaleString()} <span className="text-sm font-sans font-black text-stone-800">ชิ้น</span>
          </div>
          <span className="text-[11px] text-emerald-900 block font-black">
            สินค้าที่จำหน่ายออกแล้ว สะสมในระบบ
          </span>
        </div>

        {/* Card 3: Supplier Count */}
        <div className="bg-white border-2 border-amber-400/80 p-4 rounded-2xl shadow-md space-y-1 text-stone-950">
          <span className="text-xs font-black text-stone-900 block flex items-center gap-1">
            <Truck className="w-4 h-4 text-amber-700" />
            <span>จำนวน Supplier ในระบบ</span>
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-black text-stone-950 tracking-tight">
            {allSuppliers.length} <span className="text-sm font-sans font-black text-stone-800">ราย</span>
          </div>
          <span className="text-[11px] text-stone-700 block font-black">
            มี {supplierSummaries.length} รายที่มียอดรอเคลียร์ในขณะนี้
          </span>
        </div>
      </div>

      {/* Sub-Tab Navigation Header */}
      <div className="flex items-center gap-2 border-b-2 border-amber-400/40 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('payouts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'payouts'
              ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
              : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
          }`}
        >
          <DollarSign className="w-4 h-4 text-stone-950" />
          <span>💰 เคลียร์ยอด Supplier ({supplierSummaries.length} รายรอเคลียร์)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'logs'
              ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
              : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
          }`}
        >
          <PackageCheck className="w-4 h-4 text-stone-950" />
          <span>📦 บันทึก &amp; ประวัติสินค้าเข้า-ออก ({stockMovements.length} รายการ)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
              : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
          }`}
        >
          <FileText className="w-4 h-4 text-stone-950" />
          <span>📜 ประวัติเคลียร์ยอด &amp; ใบสรุป ({supplierSettlements.length} รอบ)</span>
        </button>
      </div>

      {/* TAB 1: SUPPLIER PAYOUTS SUMMARY & BATCH SETTLEMENT */}
      {activeSubTab === 'payouts' && (
        <div className="space-y-6">
          
          {/* Supplier Cards List */}
          {supplierSummaries.length === 0 ? (
            <div className="bg-white border-2 border-amber-400/60 p-12 rounded-2xl text-center space-y-3 shadow-xl text-stone-950">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="font-serif font-black text-lg text-amber-950">
                ไม่มีรายการค้างเคลียร์เงิน Supplier ในขณะนี้!
              </h4>
              <p className="text-xs text-stone-800 font-extrabold max-w-md mx-auto">
                ยอดขายต้นทุนสินค้าทั้งหมดได้รับเคลียร์เรียบร้อยแล้ว หากมีการขายสินค้าออกผ่านระบบ POS หรือออเดอร์ใหม่ ยอดจะขึ้นแสดงที่นี่โดยอัตโนมัติ
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {supplierSummaries.map((summary) => {
                const supplierMovements = summary.movements;
                const checkedMovements = supplierMovements.filter((m) => selectedMovementIds.includes(m.id));
                const checkedCost = checkedMovements.reduce((sum, m) => sum + m.totalCost, 0);
                const checkedCount = checkedMovements.reduce((sum, m) => sum + m.quantity, 0);
                const isAllSelected = supplierMovements.every((m) => selectedMovementIds.includes(m.id));

                return (
                  <div
                    key={summary.supplierName}
                    className="bg-white border-2 border-amber-400/60 rounded-2xl p-5 shadow-xl space-y-4 text-stone-950"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-3">
                      <div>
                        <span className="text-[10px] font-black text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-400 uppercase tracking-wider">
                          Supplier / ซัพพลายเออร์
                        </span>
                        <h4 className="font-serif font-black text-lg text-stone-950 mt-1">
                          {summary.supplierName}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleOpenSettlementModal(summary.supplierName)}
                        disabled={checkedMovements.length === 0}
                        className={`px-4 py-2.5 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0 transition cursor-pointer border ${
                          checkedMovements.length > 0
                            ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 border-amber-500'
                            : 'bg-stone-200 text-stone-500 border-stone-300 cursor-not-allowed'
                        }`}
                      >
                        <DollarSign className="w-4 h-4 text-stone-950" />
                        <span>เคลียร์จ่ายเงินรอบนี้ ({checkedMovements.length} รายการ)</span>
                      </button>
                    </div>

                    {/* Cost Snapshot Box */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-300 space-y-0.5">
                        <span className="text-stone-700 block text-[10px] font-black">จำนวนชิ้นค้างเคลียร์รวม</span>
                        <span className="text-stone-950 font-black text-base font-serif">
                          {summary.itemsCount} ชิ้น <span className="text-[11px] text-emerald-800 font-sans">(เลือก {checkedCount} ชิ้น)</span>
                        </span>
                      </div>

                      <div className="bg-amber-50 p-3 rounded-xl border-2 border-amber-400 space-y-0.5">
                        <span className="text-amber-950 block text-[10px] font-black">ยอดต้นทุนเลือกเคลียร์รอบนี้</span>
                        <span className="text-amber-900 font-black text-base font-serif">
                          ฿{checkedCost.toLocaleString()} <span className="text-[10px] text-stone-600 font-sans font-bold">(จาก ฿{summary.totalCost.toLocaleString()})</span>
                        </span>
                      </div>
                    </div>

                    {/* Interactive Items Checklist with Toggle Buttons */}
                    <div className="space-y-2 pt-2 border-t border-stone-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-stone-950 font-black flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>เลือกรายการสินค้าที่จะเคลียร์จ่ายรอบนี้ ({checkedMovements.length}/{supplierMovements.length} รายการ):</span>
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => isAllSelected ? deselectAllForSupplier(summary.supplierName) : selectAllForSupplier(summary.supplierName)}
                            className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-950 border border-amber-400 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1"
                          >
                            {isAllSelected ? <Square className="w-3 h-3 text-stone-600" /> : <CheckSquare className="w-3 h-3 text-amber-700" />}
                            <span>{isAllSelected ? 'ปลดเลือกทั้งหมด' : 'เลือกทั้งหมด'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Items List with Checkboxes */}
                      <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 no-scrollbar border border-stone-200 p-2 rounded-xl bg-stone-50/60">
                        {supplierMovements.map((m) => {
                          const isChecked = selectedMovementIds.includes(m.id);
                          return (
                            <div
                              key={m.id}
                              onClick={() => toggleMovementId(m.id)}
                              className={`flex items-center justify-between text-[11px] p-2.5 rounded-xl border transition cursor-pointer select-none ${
                                isChecked
                                  ? 'bg-amber-100/70 border-amber-500 text-stone-950 font-black shadow-xs'
                                  : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate max-w-[260px]">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                  isChecked ? 'bg-amber-400 border-amber-600 text-stone-950' : 'bg-white border-stone-400'
                                }`}>
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <div className="truncate">
                                  <span className="text-stone-950 font-black block truncate">{m.productTitle}</span>
                                  <span className="text-stone-700 text-[10px] font-bold">
                                    {m.variantName} {m.referenceOrderNo ? `( Order: ${m.referenceOrderNo} )` : '( POS หน้าร้าน )'}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-amber-900 font-serif font-black block">฿{m.totalCost.toLocaleString()}</span>
                                <span className="text-stone-600 text-[10px] font-bold">{m.quantity} ชิ้น @ ฿{m.costPrice.toLocaleString()}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {supplierMovements.length > checkedMovements.length && (
                        <p className="text-[10px] text-amber-950 font-black bg-amber-100 p-1.5 rounded-lg border border-amber-300 text-center">
                          💡 มีอีก {supplierMovements.length - checkedMovements.length} รายการที่ปลดเลือก (จะถูกเก็บไว้เคลียร์รอบหน้า ไม่ถูกลบหรือสูญหาย)
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Unsettled Sold Items Detail Table */}
          <div className="bg-white border-2 border-amber-400/60 rounded-2xl p-5 space-y-4 shadow-xl text-stone-950">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
              <h4 className="font-serif font-black text-sm text-stone-950 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <span>ตารางรายละเอียดสินค้าขายออกรอเคลียร์ยอด (Unsettled Sales Breakdown)</span>
              </h4>

              {/* Filter Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อสินค้า/Order..."
                    value={movementSearchQuery}
                    onChange={(e) => setMovementSearchQuery(e.target.value)}
                    className="bg-white border-2 border-stone-400 rounded-xl px-3 py-1.5 text-xs text-stone-950 font-black pl-8 focus:outline-none focus:border-amber-500"
                  />
                  <Search className="w-3.5 h-3.5 text-amber-600 absolute left-2.5 top-2.5" />
                </div>

                <select
                  value={selectedSupplierFilter}
                  onChange={(e) => setSelectedSupplierFilter(e.target.value)}
                  className="bg-white border-2 border-amber-500 rounded-xl px-3 py-1.5 text-xs text-stone-950 font-black focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-white text-stone-950 font-bold">-- ทุก Supplier --</option>
                  {allSuppliers.map((s) => (
                    <option key={s} value={s} className="bg-white text-stone-950 font-bold">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs text-left text-stone-950">
                <thead className="bg-amber-100 text-stone-950 font-serif border-b-2 border-amber-400 font-black">
                  <tr>
                    <th className="py-3 px-3 text-center font-black w-10">เลือก</th>
                    <th className="py-3 px-3 font-black">วันที่ขายออก</th>
                    <th className="py-3 px-3 font-black">ชื่อสินค้า / ไซส์</th>
                    <th className="py-3 px-3 font-black">Supplier / โรงงาน</th>
                    <th className="py-3 px-3 font-black text-center">จำนวนขาย</th>
                    <th className="py-3 px-3 font-black text-right">ต้นทุน/ชิ้น</th>
                    <th className="py-3 px-3 font-black text-right">ต้นทุนรวมค้างเคลียร์</th>
                    <th className="py-3 px-3 font-black text-center">สถานะการเลือก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredUnsettledMovements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-stone-700 font-black">
                        ไม่พบรายการสินค้าขายออกที่ค้างเคลียร์ตามเงื่อนไขที่เลือก
                      </td>
                    </tr>
                  ) : (
                    filteredUnsettledMovements.map((m) => {
                      const isChecked = selectedMovementIds.includes(m.id);
                      return (
                        <tr
                          key={m.id}
                          onClick={() => toggleMovementId(m.id)}
                          className={`hover:bg-amber-50/60 transition cursor-pointer select-none ${
                            isChecked ? 'bg-amber-50/80 font-black' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center mx-auto ${
                              isChecked ? 'bg-amber-400 border-amber-600 text-stone-950' : 'bg-white border-stone-400'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-stone-800 font-bold">
                            {new Date(m.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="py-3 px-3 font-black">
                            <span className="text-stone-950 block font-black">{m.productTitle}</span>
                            <span className="text-stone-700 text-[11px] font-bold">
                              {m.variantName} {m.referenceOrderNo ? `( Order: ${m.referenceOrderNo} )` : ''}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-black text-amber-950">{m.supplierName}</td>
                          <td className="py-3 px-3 text-center font-black text-emerald-800 font-mono text-sm">{m.quantity} ชิ้น</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-stone-800">฿{m.costPrice.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-serif font-black text-amber-900 text-sm">
                            ฿{m.totalCost.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                              isChecked
                                ? 'bg-amber-100 text-amber-950 border-amber-400'
                                : 'bg-stone-100 text-stone-600 border-stone-300'
                            }`}>
                              {isChecked ? '✓ เลือกเคลียร์รอบนี้' : '⏸ เก็บไว้รอบหน้า'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STOCK IN / OUT AUDIT LOG */}
      {activeSubTab === 'logs' && (
        <div className="bg-white border-2 border-amber-400/60 rounded-2xl p-5 space-y-4 shadow-xl text-stone-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
            <h4 className="font-serif font-black text-base text-stone-950 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-amber-600" />
              <span>ประวัติความเคลื่อนไหวสินค้าเข้า-ออกทั้งหมด (Stock Movement Audit Log)</span>
            </h4>

            {/* Log Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={movementTypeFilter}
                onChange={(e) => setMovementTypeFilter(e.target.value as any)}
                className="bg-white border-2 border-stone-400 rounded-xl px-3 py-1.5 text-xs text-stone-950 font-black focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-white text-stone-950 font-bold">-- ทุกประเภท --</option>
                <option value="IN" className="bg-white text-emerald-800 font-bold">🟢 สินค้าเข้า (Stock IN)</option>
                <option value="OUT" className="bg-white text-amber-900 font-bold">🟠 สินค้าออก (Stock OUT)</option>
              </select>

              <button
                onClick={() => setIsStockInModalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 text-white font-black text-xs rounded-xl shadow hover:bg-emerald-500 transition flex items-center gap-1 cursor-pointer border border-emerald-700"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>+ บันทึกรับสินค้าเข้า</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-xs text-left text-stone-950">
              <thead className="bg-amber-100 text-stone-950 font-serif border-b-2 border-amber-400 font-black">
                <tr>
                  <th className="py-3 px-3 font-black">วัน-เวลา</th>
                  <th className="py-3 px-3 font-black">ประเภท</th>
                  <th className="py-3 px-3 font-black">ชื่อสินค้า / ไซส์</th>
                  <th className="py-3 px-3 font-black">Supplier / โรงงาน</th>
                  <th className="py-3 px-3 font-black text-center">จำนวน</th>
                  <th className="py-3 px-3 font-black text-right">ต้นทุน/ชิ้น</th>
                  <th className="py-3 px-3 font-black text-right">ต้นทุนรวม</th>
                  <th className="py-3 px-3 font-black">หมายเหตุ / อ้างอิง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {stockMovements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-stone-700 font-black">
                      ยังไม่มีประวัติสินค้าเข้า-ออกในระบบ (เมื่อขายสินค้าออกหรือรับสินค้าเข้า ระบบจะบันทึกประวัติที่นี่อัตโนมัติ)
                    </td>
                  </tr>
                ) : (
                  stockMovements
                    .filter((m) => movementTypeFilter === 'all' || m.type === movementTypeFilter)
                    .map((m) => (
                      <tr key={m.id} className="hover:bg-amber-50/60 transition">
                        <td className="py-3 px-3 font-mono text-[11px] text-stone-800 font-bold">
                          {new Date(m.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3 px-3">
                          {m.type === 'IN' ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 border border-emerald-400 text-[10px] font-black flex items-center gap-1 w-max">
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" /> สินค้าเข้า (IN)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 border border-amber-400 text-[10px] font-black flex items-center gap-1 w-max">
                              <ArrowUpRight className="w-3.5 h-3.5 text-amber-700" /> สินค้าออก (OUT)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-black">
                          <span className="text-stone-950 block font-black">{m.productTitle}</span>
                          <span className="text-stone-700 text-[11px] font-bold">{m.variantName}</span>
                        </td>
                        <td className="py-3 px-3 font-black text-amber-950">{m.supplierName}</td>
                        <td className="py-3 px-3 text-center font-black text-emerald-800 font-mono text-sm">
                          {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`} ชิ้น
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-stone-800">฿{m.costPrice.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-serif font-black text-amber-900">฿{m.totalCost.toLocaleString()}</td>
                        <td className="py-3 px-3 text-stone-800 font-bold">{m.note || '-'}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SETTLEMENT HISTORY & VOUCHER RECEIPTS */}
      {activeSubTab === 'history' && (
        <div className="bg-white border-2 border-amber-400/60 rounded-2xl p-5 space-y-4 shadow-xl text-stone-950">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h4 className="font-serif font-black text-base text-stone-950 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              <span>ประวัติการเคลียร์ยอดจ่ายเงิน Supplier (Settlement Voucher Receipts)</span>
            </h4>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-xs text-left text-stone-950">
              <thead className="bg-amber-100 text-stone-950 font-serif border-b-2 border-amber-400 font-black">
                <tr>
                  <th className="py-3 px-3 font-black">เลขที่ใบเคลียร์</th>
                  <th className="py-3 px-3 font-black">วันที่เคลียร์</th>
                  <th className="py-3 px-3 font-black">Supplier / โรงงาน</th>
                  <th className="py-3 px-3 font-black text-center">จำนวนรวม</th>
                  <th className="py-3 px-3 font-black text-right">ยอดเงินต้นทุนรวม</th>
                  <th className="py-3 px-3 font-black">อ้างอิงชำระเงิน</th>
                  <th className="py-3 px-3 font-black text-center">ใบสรุป</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {supplierSettlements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-700 font-black">
                      ยังไม่มีประวัติการกดเคลียร์ยอดเงิน Supplier ในระบบ
                    </td>
                  </tr>
                ) : (
                  supplierSettlements.map((s) => (
                    <tr key={s.id} className="hover:bg-amber-50/60 transition">
                      <td className="py-3 px-3 font-mono font-black text-amber-950">{s.id}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-stone-800 font-bold">
                        {new Date(s.settledAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-3 font-black text-stone-950">{s.supplierName}</td>
                      <td className="py-3 px-3 text-center font-black text-emerald-800 font-mono text-sm">{s.totalItemsCount} ชิ้น</td>
                      <td className="py-3 px-3 text-right font-serif font-black text-amber-900 text-sm">
                        ฿{s.totalCostAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-stone-800 font-bold">{s.paymentRef || 'โอนผ่านบัญชี'}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setViewingSettlementVoucher(s)}
                          className="px-3 py-1 bg-amber-100 text-stone-950 border border-amber-400 hover:bg-amber-200 rounded-lg text-xs font-black transition flex items-center gap-1 mx-auto shadow-xs cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-700" />
                          <span>ดูใบสรุป</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: STOCK IN FORM MODAL */}
      {isStockInModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-lg w-full p-6 text-stone-950 shadow-2xl space-y-4 text-left">
            
            <div className="flex justify-between items-center border-b-2 border-amber-400/40 pb-3">
              <h3 className="font-serif font-black text-lg text-stone-950 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" />
                <span>บันทึกรับสินค้าเข้าสต๊อก (Stock IN)</span>
              </h3>
              <button
                onClick={() => setIsStockInModalOpen(false)}
                className="text-stone-700 hover:text-stone-950 p-1 rounded-full border border-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-950 font-black mb-1">เลือกสินค้า *</label>
                <select
                  required
                  value={stockInProductId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setStockInProductId(pid);
                    const prod = products.find((p) => p.id === pid);
                    if (prod && prod.variants.length > 0) {
                      setStockInVariantId(prod.variants[0].id);
                      setStockInCostPrice(prod.variants[0].costPrice || Math.round(prod.variants[0].price * 0.5));
                    }
                  }}
                  className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 text-stone-950 font-black text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="" className="bg-white text-stone-950 font-bold">-- เลือกสินค้า --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} className="bg-white text-stone-950 font-bold">
                      {p.title} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              {stockInProductId && (
                <div>
                  <label className="block text-stone-950 font-black mb-1">เลือกไซส์ / ตัวเลือก *</label>
                  <select
                    required
                    value={stockInVariantId}
                    onChange={(e) => {
                      const vid = e.target.value;
                      setStockInVariantId(vid);
                      const prod = products.find((p) => p.id === stockInProductId);
                      const v = prod?.variants.find((varItem) => varItem.id === vid);
                      if (v) {
                        setStockInCostPrice(v.costPrice || Math.round(v.price * 0.5));
                      }
                    }}
                    className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 text-stone-950 font-black text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {products
                      .find((p) => p.id === stockInProductId)
                      ?.variants.map((v) => (
                        <option key={v.id} value={v.id} className="bg-white text-stone-950 font-bold">
                          {v.name} {v.color ? `(${v.color})` : ''} — สต๊อกปัจจุบัน: {v.stockQuantity} ชิ้น
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-950 font-black mb-1">จำนวนสินค้าเข้า (ชิ้น) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={stockInQty}
                    onChange={(e) => setStockInQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full bg-white border-2 border-emerald-500 rounded-xl p-3 text-stone-950 font-mono font-black text-base focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-950 font-black mb-1">ราคาต้นทุน/ชิ้น (บาท) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={stockInCostPrice}
                    onChange={(e) => setStockInCostPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-white border-2 border-amber-500 rounded-xl p-3 text-stone-950 font-mono font-black text-base focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-950 font-black mb-1">ชื่อ Supplier / โรงงานที่รับมา *</label>
                <input
                  type="text"
                  list="supplier-preset-list"
                  required
                  value={stockInSupplierName}
                  onChange={(e) => setStockInSupplierName(e.target.value)}
                  placeholder="เช่น โรงงานอาบายะห์ดูไบ"
                  className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 text-stone-950 font-black text-sm focus:outline-none focus:border-amber-500"
                />
                <datalist id="supplier-preset-list">
                  {SUPPLIER_PRESETS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-stone-950 font-black mb-1">หมายเหตุ / เลขที่ใบส่งของ (Optional)</label>
                <input
                  type="text"
                  value={stockInNote}
                  onChange={(e) => setStockInNote(e.target.value)}
                  placeholder="เช่น รับสินค้าล็อตทดลอง / ล็อตที่ 5"
                  className="w-full bg-white border-2 border-stone-300 rounded-xl p-2.5 text-stone-950 font-black focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber-400/30">
                <button
                  type="button"
                  onClick={() => setIsStockInModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 border border-stone-300 text-stone-950 font-black rounded-xl hover:bg-stone-200 cursor-pointer"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md transition cursor-pointer border border-emerald-700"
                >
                  บันทึกรับสินค้าเข้าสต๊อก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BATCH SUPPLIER SETTLEMENT CONFIRMATION */}
      {isSettlementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-lg w-full p-6 text-stone-950 shadow-2xl space-y-4 text-left">
            
            <div className="flex justify-between items-center border-b-2 border-amber-400/40 pb-3">
              <h3 className="font-serif font-black text-lg text-stone-950 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                <span>ยืนยันเคลียร์รอบจ่ายเงิน Supplier</span>
              </h3>
              <button
                onClick={() => setIsSettlementModalOpen(false)}
                className="text-stone-700 hover:text-stone-950 p-1 rounded-full border border-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSettlement} className="space-y-4 text-xs">
              <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-400 space-y-2 text-stone-950">
                <div className="flex items-center justify-between">
                  <span className="text-stone-800 font-extrabold">ชื่อ Supplier:</span>
                  <span className="text-amber-950 font-black text-base">{settleSupplierName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-800 font-extrabold">จำนวนรายการที่เลือกเคลียร์:</span>
                  <span className="text-emerald-800 font-black text-sm font-mono">
                    {unsettledMovements
                      .filter((m) => m.supplierName === settleSupplierName && selectedMovementIds.includes(m.id))
                      .reduce((sum, m) => sum + m.quantity, 0)} ชิ้น
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-amber-400/40 pt-2">
                  <span className="text-stone-950 font-black text-sm">ยอดเงินต้นทุนสุทธิที่ต้องโอน:</span>
                  <span className="text-amber-900 font-black text-2xl font-serif">
                    ฿{unsettledMovements
                      .filter((m) => m.supplierName === settleSupplierName && selectedMovementIds.includes(m.id))
                      .reduce((sum, m) => sum + m.totalCost, 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-stone-950 font-black mb-1">เลขที่อ้างอิงการโอนเงิน / สลิป *</label>
                <input
                  type="text"
                  required
                  value={settlementPaymentRef}
                  onChange={(e) => setSettlementPaymentRef(e.target.value)}
                  placeholder="เช่น โอนเงินเข้าบัญชี PromptPay 08X-XXX-XXXX"
                  className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 text-stone-950 font-black text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-950 font-black mb-1">หมายเหตุรอบการเคลียร์เงิน</label>
                <input
                  type="text"
                  value={settlementNote}
                  onChange={(e) => setSettlementNote(e.target.value)}
                  placeholder="เช่น เคลียร์ยอดต้นทุนประจำรอบขายเดือนนี้"
                  className="w-full bg-white border-2 border-stone-300 rounded-xl p-2.5 text-stone-950 font-black focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber-400/40">
                <button
                  type="button"
                  onClick={() => setIsSettlementModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 border border-stone-300 text-stone-950 font-black rounded-xl hover:bg-stone-200 cursor-pointer"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl shadow-md border border-amber-500 cursor-pointer"
                >
                  กดยืนยันเคลียร์เงิน &amp; ออกใบสรุป
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SETTLEMENT RECEIPT VOUCHER VIEW */}
      {viewingSettlementVoucher && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-xl w-full p-6 text-stone-950 shadow-2xl space-y-5 text-left">
            
            {/* Header Voucher */}
            <div className="flex items-start justify-between border-b-2 border-amber-400/40 pb-4">
              <div>
                <span className="text-[10px] text-amber-950 font-black uppercase tracking-widest bg-amber-100 px-2 py-0.5 rounded border border-amber-400">
                  SUPPLIER SETTLEMENT VOUCHER
                </span>
                <h3 className="font-serif font-black text-xl text-stone-950 mt-1">
                  ใบสรุปเคลียร์ยอดชำระเงิน Supplier
                </h3>
                <p className="text-xs text-stone-700 font-bold">
                  {storeSettings.storeName} — {storeSettings.storeTagline}
                </p>
              </div>

              <button
                onClick={() => setViewingSettlementVoucher(null)}
                className="text-stone-700 hover:text-stone-950 p-1 rounded-full border border-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voucher Details */}
            <div className="space-y-3 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-300">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-700 block text-[10px] font-black">เลขที่ใบสรุป:</span>
                  <span className="text-amber-950 font-mono font-black">{viewingSettlementVoucher.id}</span>
                </div>
                <div>
                  <span className="text-stone-700 block text-[10px] font-black">วันที่เคลียร์เงิน:</span>
                  <span className="text-stone-950 font-black">
                    {new Date(viewingSettlementVoucher.settledAt).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-700 block text-[10px] font-black">ชื่อ Supplier / โรงงาน:</span>
                  <span className="text-amber-950 font-black text-sm">{viewingSettlementVoucher.supplierName}</span>
                </div>
                <div>
                  <span className="text-stone-700 block text-[10px] font-black">หลักฐาน/อ้างอิงชำระ:</span>
                  <span className="text-emerald-800 font-black">{viewingSettlementVoucher.paymentRef}</span>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-2 flex items-center justify-between">
                <div>
                  <span className="text-stone-700 block text-[10px] font-black">จำนวนสินค้าเคลียร์รอบนี้:</span>
                  <span className="text-stone-950 font-black">{viewingSettlementVoucher.totalItemsCount} ชิ้น</span>
                </div>
                <div className="text-right">
                  <span className="text-amber-950 block text-[10px] font-black">ยอดเงินต้นทุนรวมที่เคลียร์จ่าย:</span>
                  <span className="text-amber-900 font-black text-2xl font-serif">
                    ฿{viewingSettlementVoucher.totalCostAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Voucher Footer Action */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-100 border border-stone-300 text-stone-950 font-black rounded-xl text-xs hover:bg-stone-200 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-stone-950" />
                <span>พิมพ์ใบสรุป / บันทึก PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingSettlementVoucher(null)}
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl shadow-md text-xs border border-amber-500 cursor-pointer"
              >
                ปิดหน้าต่างนี้
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
