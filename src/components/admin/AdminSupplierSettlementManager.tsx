'use client';

import React, { useState } from 'react';
import { Truck, DollarSign, PackageCheck, Plus, Search, Calendar, FileText, CheckCircle2, AlertCircle, Sparkles, Filter, ChevronRight, X, Printer, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
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

  // Settlement Form State
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

  // Unique list of suppliers found in movements
  const allSuppliers = Array.from(
    new Set([...SUPPLIER_PRESETS, ...stockMovements.map((m) => m.supplierName).filter(Boolean)])
  );

  // Filtered Unsettled Movements based on selected Supplier
  const filteredUnsettledMovements = unsettledMovements.filter((m) => {
    const matchesSupplier = selectedSupplierFilter === 'all' || m.supplierName === selectedSupplierFilter;
    const matchesSearch =
      !movementSearchQuery ||
      m.productTitle.toLowerCase().includes(movementSearchQuery.toLowerCase()) ||
      m.variantName.toLowerCase().includes(movementSearchQuery.toLowerCase()) ||
      (m.referenceOrderNo && m.referenceOrderNo.toLowerCase().includes(movementSearchQuery.toLowerCase()));
    return matchesSupplier && matchesSearch;
  });

  // Calculate Metrics
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

  // Open Settlement Modal for a specific Supplier
  const handleOpenSettlementModal = (supplierName: string) => {
    const supplierMovements = unsettledMovements.filter((m) => m.supplierName === supplierName);
    setSettleSupplierName(supplierName);
    setSelectedMovementIds(supplierMovements.map((m) => m.id));
    setSettlementPaymentRef('โอนเงินผ่านแอปธนาคาร / PromptPay');
    setSettlementNote(`เคลียร์ยอดต้นทุนสินค้าประจำรอบ ${new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}`);
    setIsSettlementModalOpen(true);
  };

  // Submit Settlement Action
  const handleConfirmSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMovementIds.length === 0) {
      alert('กรุณาเลือกรายการสินค้าที่ต้องการเคลียร์อย่างน้อย 1 รายการครับ');
      return;
    }

    const nowIso = new Date().toISOString();
    const newSettlement = createSupplierSettlement({
      supplierName: settleSupplierName,
      periodStart: nowIso,
      periodEnd: nowIso,
      movementIds: selectedMovementIds,
      paymentRef: settlementPaymentRef,
      note: settlementNote,
    });

    setIsSettlementModalOpen(false);
    setViewingSettlementVoucher(newSettlement);
    alert(`เคลียร์ยอดจ่ายให้ "${settleSupplierName}" เรียบร้อยแล้ว! ออกใบสรุปรอบเรียบร้อยแล้ว`);
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
    <div className="space-y-6">
      
      {/* Module Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 p-5 rounded-2xl border-2 border-amber-400/50 shadow-xl">
        <div>
          <h3 className="font-serif font-extrabold text-xl text-amber-300 flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-400" />
            <span>ระบบสินค้าเข้า-ออก & เคลียร์ยอด Supplier (Consignment Payout Engine)</span>
          </h3>
          <p className="text-xs text-stone-300 font-bold mt-1">
            บันทึกรับสินค้าเข้า ตัดสต๊อกอัตโนมัติจากการขาย และคำนวณสรุปยอดเคลียร์ค่าใช้จ่ายต้นทุนจ่ายให้ Supplier เป็นรอบๆ
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setIsStockInModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg cursor-pointer border border-emerald-400/50"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>+ บันทึกรับสินค้าเข้า (Stock IN)</span>
          </button>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Unsettled Cost */}
        <div className="bg-gradient-to-br from-stone-900 via-amber-950/40 to-stone-950 border-2 border-amber-500/80 p-4 rounded-2xl shadow-xl space-y-1">
          <span className="text-xs font-extrabold text-amber-300 block flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>ยอดค้างเคลียร์ Supplier รวม</span>
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight">
            ฿{totalUnsettledCost.toLocaleString()}
          </div>
          <span className="text-[11px] text-stone-300 block font-bold">
            ต้นทุนสินค้าที่ขายแล้ว รอเคลียร์รอบจ่ายเงิน
          </span>
        </div>

        {/* Card 2: Unsettled Items Count */}
        <div className="bg-gradient-to-br from-stone-900 via-emerald-950/40 to-stone-950 border-2 border-emerald-500/80 p-4 rounded-2xl shadow-xl space-y-1">
          <span className="text-xs font-extrabold text-emerald-300 block flex items-center gap-1">
            <PackageCheck className="w-4 h-4 text-emerald-400" />
            <span>จำนวนสินค้าค้างเคลียร์</span>
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono tracking-tight">
            {totalUnsettledItems.toLocaleString()} <span className="text-sm font-normal text-stone-300">ชิ้น</span>
          </div>
          <span className="text-[11px] text-stone-300 block font-bold">
            สินค้าที่จำหน่ายออกแล้ว สะสมในระบบ
          </span>
        </div>

        {/* Card 3: Supplier Count */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-400/40 p-4 rounded-2xl shadow-xl space-y-1">
          <span className="text-xs font-extrabold text-amber-200 block flex items-center gap-1">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>จำนวน Supplier ในระบบ</span>
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {allSuppliers.length} <span className="text-sm font-normal text-stone-300">ราย</span>
          </div>
          <span className="text-[11px] text-stone-300 block font-bold">
            มี {supplierSummaries.length} รายที่มียอดรอเคลียร์ในขณะนี้
          </span>
        </div>
      </div>

      {/* Sub-Tab Navigation Header */}
      <div className="flex items-center gap-2 border-b-2 border-amber-400/30 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('payouts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'payouts'
              ? 'bg-amber-400 text-stone-950 shadow-lg scale-102 font-black'
              : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>💰 เคลียร์ยอด Supplier ({supplierSummaries.length} รายรอเคลียร์)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'logs'
              ? 'bg-amber-400 text-stone-950 shadow-lg scale-102 font-black'
              : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>📦 บันทึก &amp; ประวัติสินค้าเข้า-ออก ({stockMovements.length} รายการ)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-amber-400 text-stone-950 shadow-lg scale-102 font-black'
              : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>📜 ประวัติเคลียร์ยอด &amp; ใบสรุป ({supplierSettlements.length} รอบ)</span>
        </button>
      </div>

      {/* TAB 1: SUPPLIER PAYOUTS SUMMARY & BATCH SETTLEMENT */}
      {activeSubTab === 'payouts' && (
        <div className="space-y-6">
          
          {/* Supplier Cards List */}
          {supplierSummaries.length === 0 ? (
            <div className="bg-stone-900 border-2 border-amber-400/30 p-12 rounded-2xl text-center space-y-3 shadow-xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="font-serif font-extrabold text-lg text-amber-300">
                ไม่มีรายการค้างเคลียร์เงิน Supplier ในขณะนี้!
              </h4>
              <p className="text-xs text-stone-300 max-w-md mx-auto">
                ยอดขายต้นทุนสินค้าทั้งหมดได้รับเคลียร์เรียบร้อยแล้ว หากมีการขายสินค้าออกผ่านระบบ POS หรือออเดอร์ใหม่ ยอดจะขึ้นแสดงที่นี่โดยอัตโนมัติ
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supplierSummaries.map((summary) => (
                <div
                  key={summary.supplierName}
                  className="bg-stone-900 border-2 border-amber-400/50 rounded-2xl p-5 shadow-2xl space-y-4 hover:border-amber-400 transition"
                >
                  <div className="flex items-start justify-between gap-3 border-b-2 border-amber-400/20 pb-3">
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-400 bg-stone-950 px-2.5 py-0.5 rounded-lg border border-amber-400/30 uppercase tracking-wider">
                        Supplier / ซัพพลายเออร์
                      </span>
                      <h4 className="font-serif font-extrabold text-lg text-white mt-1">
                        {summary.supplierName}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleOpenSettlementModal(summary.supplierName)}
                      className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs rounded-xl shadow-gold-glow flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4 text-stone-950" />
                      <span>เคลียร์จ่ายเงินรอบนี้</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-950 p-3 rounded-xl border border-amber-400/30 space-y-0.5">
                      <span className="text-stone-400 block text-[10px] font-bold">จำนวนชิ้นที่ขายได้</span>
                      <span className="text-emerald-400 font-extrabold text-base">
                        {summary.itemsCount} ชิ้น
                      </span>
                    </div>

                    <div className="bg-amber-950/80 p-3 rounded-xl border-2 border-amber-500 space-y-0.5">
                      <span className="text-amber-200 block text-[10px] font-bold">ต้นทุนรวมค้างเคลียร์</span>
                      <span className="text-amber-300 font-black text-base">
                        ฿{summary.totalCost.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Sample Items list */}
                  <div className="space-y-1.5 pt-2 border-t border-amber-400/20">
                    <span className="text-[11px] text-amber-300 font-extrabold block">
                      รายการสินค้าขายล่าสุดที่รอเคลียร์ ({summary.movements.length} รายการ):
                    </span>
                    <div className="max-h-36 overflow-y-auto space-y-1 pr-1 no-scrollbar">
                      {summary.movements.slice(0, 5).map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between text-[11px] bg-stone-950 p-2 rounded-lg border border-amber-400/20"
                        >
                          <div className="truncate max-w-[200px]">
                            <span className="text-white font-bold block truncate">{m.productTitle}</span>
                            <span className="text-stone-400 text-[10px]">{m.variantName} ( Order: {m.referenceOrderNo || 'POS'} )</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-amber-300 font-extrabold block">฿{m.totalCost.toLocaleString()}</span>
                            <span className="text-stone-400 text-[10px]">{m.quantity} ชิ้น @ ฿{m.costPrice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Unsettled Sold Items Detail Table */}
          <div className="bg-stone-900 border-2 border-amber-400/40 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-amber-400/20 pb-3">
              <h4 className="font-serif font-extrabold text-base text-amber-300 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>ตารางายละเอียดสินค้าขายออกรอเคลียร์ยอด (Unsettled Sales Breakdown)</span>
              </h4>

              {/* Filter Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อสินค้า/Order..."
                    value={movementSearchQuery}
                    onChange={(e) => setMovementSearchQuery(e.target.value)}
                    className="bg-stone-950 border border-amber-400/40 rounded-xl px-3 py-1.5 text-xs text-white pl-8 focus:outline-none focus:border-amber-400"
                  />
                  <Search className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-2.5" />
                </div>

                <select
                  value={selectedSupplierFilter}
                  onChange={(e) => setSelectedSupplierFilter(e.target.value)}
                  className="bg-stone-950 border border-amber-400/40 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none"
                >
                  <option value="all" className="bg-stone-900 text-white font-bold">-- ทุก Supplier --</option>
                  {allSuppliers.map((s) => (
                    <option key={s} value={s} className="bg-stone-900 text-white font-bold">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs text-left text-stone-200">
                <thead className="bg-stone-950 text-amber-300 font-serif border-b-2 border-amber-400/30">
                  <tr>
                    <th className="py-3 px-3 font-extrabold">วันที่ขายออก</th>
                    <th className="py-3 px-3 font-extrabold">ชื่อสินค้า / ไซส์</th>
                    <th className="py-3 px-3 font-extrabold">Supplier / โรงงาน</th>
                    <th className="py-3 px-3 font-extrabold text-center">จำนวนขาย</th>
                    <th className="py-3 px-3 font-extrabold text-right">ต้นทุน/ชิ้น</th>
                    <th className="py-3 px-3 font-extrabold text-right">ต้นทุนรวมค้างเคลียร์</th>
                    <th className="py-3 px-3 font-extrabold text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-400/20 text-white">
                  {filteredUnsettledMovements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400">
                        ไม่พบรายการสินค้าขายออกที่ค้างเคลียร์ตามเงื่อนไขที่เลือก
                      </td>
                    </tr>
                  ) : (
                    filteredUnsettledMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-stone-950 transition">
                        <td className="py-3 px-3 font-mono text-[11px] text-amber-300 font-bold">
                          {new Date(m.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3 px-3 font-bold">
                          <span className="text-white block font-extrabold">{m.productTitle}</span>
                          <span className="text-stone-400 text-[11px]">{m.variantName}</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-amber-200">{m.supplierName}</td>
                        <td className="py-3 px-3 text-center font-black text-emerald-400">{m.quantity} ชิ้น</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-stone-300">฿{m.costPrice.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono font-black text-amber-300 text-sm">
                          ฿{m.totalCost.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/50 text-[10px] font-extrabold">
                            ● ค้างเคลียร์
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STOCK IN / OUT AUDIT LOG */}
      {activeSubTab === 'logs' && (
        <div className="bg-stone-900 border-2 border-amber-400/40 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-amber-400/20 pb-3">
            <h4 className="font-serif font-extrabold text-base text-amber-300 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-amber-400" />
              <span>ประวัติความเคลื่อนไหวสินค้าเข้า-ออกทั้งหมด (Stock Movement Audit Log)</span>
            </h4>

            {/* Log Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={movementTypeFilter}
                onChange={(e) => setMovementTypeFilter(e.target.value as any)}
                className="bg-stone-950 border border-amber-400/40 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none"
              >
                <option value="all" className="bg-stone-900 text-white font-bold">-- ทุกประเภท --</option>
                <option value="IN" className="bg-stone-900 text-emerald-400 font-bold">🟢 สินค้าเข้า (Stock IN)</option>
                <option value="OUT" className="bg-stone-900 text-amber-400 font-bold">🟠 สินค้าออก (Stock OUT)</option>
              </select>

              <button
                onClick={() => setIsStockInModalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow hover:bg-emerald-500 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ บันทึกรับสินค้าเข้า</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-xs text-left text-stone-200">
              <thead className="bg-stone-950 text-amber-300 font-serif border-b-2 border-amber-400/30">
                <tr>
                  <th className="py-3 px-3 font-extrabold">วัน-เวลา</th>
                  <th className="py-3 px-3 font-extrabold">ประเภท</th>
                  <th className="py-3 px-3 font-extrabold">ชื่อสินค้า / ไซส์</th>
                  <th className="py-3 px-3 font-extrabold">Supplier / โรงงาน</th>
                  <th className="py-3 px-3 font-extrabold text-center">จำนวน</th>
                  <th className="py-3 px-3 font-extrabold text-right">ต้นทุน/ชิ้น</th>
                  <th className="py-3 px-3 font-extrabold text-right">ต้นทุนรวม</th>
                  <th className="py-3 px-3 font-extrabold">หมายเหตุ / อ้างอิง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-400/20 text-white">
                {stockMovements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-stone-400">
                      ยังไม่มีประวัติสินค้าเข้า-ออกในระบบ (เมื่อขายสินค้าออกหรือรับสินค้าเข้า ระบบจะบันทึกประวัติที่นี่อัตโนมัติ)
                    </td>
                  </tr>
                ) : (
                  stockMovements
                    .filter((m) => movementTypeFilter === 'all' || m.type === movementTypeFilter)
                    .map((m) => (
                      <tr key={m.id} className="hover:bg-stone-950 transition">
                        <td className="py-3 px-3 font-mono text-[11px] text-amber-300 font-bold">
                          {new Date(m.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3 px-3">
                          {m.type === 'IN' ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/60 text-[10px] font-black flex items-center gap-1 w-max">
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" /> สินค้าเข้า (IN)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/60 text-[10px] font-black flex items-center gap-1 w-max">
                              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" /> สินค้าออก (OUT)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-bold">
                          <span className="text-white block font-extrabold">{m.productTitle}</span>
                          <span className="text-stone-400 text-[11px]">{m.variantName}</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-amber-200">{m.supplierName}</td>
                        <td className="py-3 px-3 text-center font-black text-emerald-400">
                          {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`} ชิ้น
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-stone-300">฿{m.costPrice.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono font-black text-amber-300">฿{m.totalCost.toLocaleString()}</td>
                        <td className="py-3 px-3 text-stone-300 font-bold">{m.note || '-'}</td>
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
        <div className="bg-stone-900 border-2 border-amber-400/40 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b-2 border-amber-400/20 pb-3">
            <h4 className="font-serif font-extrabold text-base text-amber-300 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>ประวัติการเคลียร์ยอดจ่ายเงิน Supplier (Settlement Voucher Receipts)</span>
            </h4>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-xs text-left text-stone-200">
              <thead className="bg-stone-950 text-amber-300 font-serif border-b-2 border-amber-400/30">
                <tr>
                  <th className="py-3 px-3 font-extrabold">เลขที่ใบเคลียร์</th>
                  <th className="py-3 px-3 font-extrabold">วันที่เคลียร์</th>
                  <th className="py-3 px-3 font-extrabold">Supplier / โรงงาน</th>
                  <th className="py-3 px-3 font-extrabold text-center">จำนวนรวม</th>
                  <th className="py-3 px-3 font-extrabold text-right">ยอดเงินต้นทุนรวม</th>
                  <th className="py-3 px-3 font-extrabold">อ้างอิงชำระเงิน</th>
                  <th className="py-3 px-3 font-extrabold text-center">ใบสรุป</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-400/20 text-white">
                {supplierSettlements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      ยังไม่มีประวัติการกดเคลียร์ยอดเงิน Supplier ในระบบ
                    </td>
                  </tr>
                ) : (
                  supplierSettlements.map((s) => (
                    <tr key={s.id} className="hover:bg-stone-950 transition">
                      <td className="py-3 px-3 font-mono font-black text-amber-300">{s.id}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-stone-300 font-bold">
                        {new Date(s.settledAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-white">{s.supplierName}</td>
                      <td className="py-3 px-3 text-center font-black text-emerald-400">{s.totalItemsCount} ชิ้น</td>
                      <td className="py-3 px-3 text-right font-mono font-black text-amber-300 text-sm">
                        ฿{s.totalCostAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-stone-300 font-bold">{s.paymentRef || 'โอนผ่านบัญชี'}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setViewingSettlementVoucher(s)}
                          className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-400/50 hover:bg-amber-900 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto shadow"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
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
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-stone-950 border-2 border-amber-400 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b-2 border-amber-400/30 pb-3">
              <h3 className="font-serif font-extrabold text-lg text-amber-300 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>บันทึกรับสินค้าเข้าสต๊อก (Stock IN)</span>
              </h3>
              <button
                onClick={() => setIsStockInModalOpen(false)}
                className="text-amber-300 hover:text-white p-1 rounded-full border border-amber-400/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-amber-300 font-extrabold mb-1">เลือกสินค้า *</label>
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
                  className="w-full bg-stone-900 border-2 border-amber-400/60 rounded-xl p-3 text-amber-300 font-extrabold text-sm focus:outline-none"
                >
                  <option value="" className="bg-stone-900 text-white font-bold">-- เลือกสินค้า --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} className="bg-stone-900 text-white font-bold">
                      {p.title} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              {stockInProductId && (
                <div>
                  <label className="block text-amber-300 font-extrabold mb-1">เลือกไซส์ / ตัวเลือก *</label>
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
                    className="w-full bg-stone-900 border-2 border-amber-400/60 rounded-xl p-3 text-white font-extrabold text-sm focus:outline-none"
                  >
                    {products
                      .find((p) => p.id === stockInProductId)
                      ?.variants.map((v) => (
                        <option key={v.id} value={v.id} className="bg-stone-900 text-white font-bold">
                          {v.name} {v.color ? `(${v.color})` : ''} — สต๊อกปัจจุบัน: {v.stockQuantity} ชิ้น
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-emerald-300 font-extrabold mb-1">จำนวนสินค้าเข้า (ชิ้น) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={stockInQty}
                    onChange={(e) => setStockInQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full bg-stone-900 border-2 border-emerald-500 rounded-xl p-3 text-emerald-300 font-mono font-extrabold text-base focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-amber-300 font-extrabold mb-1">ราคาต้นทุน/ชิ้น (บาท) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={stockInCostPrice}
                    onChange={(e) => setStockInCostPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-stone-900 border-2 border-amber-400 rounded-xl p-3 text-amber-300 font-mono font-extrabold text-base focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-300 font-extrabold mb-1">ชื่อ Supplier / โรงงานที่รับมา *</label>
                <input
                  type="text"
                  list="supplier-preset-list"
                  required
                  value={stockInSupplierName}
                  onChange={(e) => setStockInSupplierName(e.target.value)}
                  placeholder="เช่น โรงงานอาบายะห์ดูไบ"
                  className="w-full bg-stone-900 border-2 border-amber-400/60 rounded-xl p-3 text-white font-extrabold text-sm focus:outline-none"
                />
                <datalist id="supplier-preset-list">
                  {SUPPLIER_PRESETS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-stone-300 font-extrabold mb-1">หมายเหตุ / เลขที่ใบส่งของ (Optional)</label>
                <input
                  type="text"
                  value={stockInNote}
                  onChange={(e) => setStockInNote(e.target.value)}
                  placeholder="เช่น รับสินค้าล็อตทดลอง / ล็อตที่ 5"
                  className="w-full bg-stone-900 border border-amber-400/30 rounded-xl p-2.5 text-white font-bold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber-400/20">
                <button
                  type="button"
                  onClick={() => setIsStockInModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 font-bold rounded-xl hover:bg-stone-700"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-stone-950 font-black rounded-xl shadow-lg hover:scale-102 transition"
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
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-stone-950 border-2 border-amber-400 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b-2 border-amber-400/30 pb-3">
              <h3 className="font-serif font-extrabold text-lg text-amber-300 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <span>ยืนยันเคลียร์รอบจ่ายเงิน Supplier</span>
              </h3>
              <button
                onClick={() => setIsSettlementModalOpen(false)}
                className="text-amber-300 hover:text-white p-1 rounded-full border border-amber-400/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSettlement} className="space-y-4 text-xs">
              <div className="bg-stone-900 p-3.5 rounded-2xl border border-amber-400/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 font-bold">ชื่อ Supplier:</span>
                  <span className="text-amber-300 font-extrabold text-sm">{settleSupplierName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-400 font-bold">จำนวนสินค้าขายที่เคลียร์:</span>
                  <span className="text-emerald-400 font-black text-sm">
                    {unsettledMovements
                      .filter((m) => selectedMovementIds.includes(m.id))
                      .reduce((sum, m) => sum + m.quantity, 0)} ชิ้น
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-amber-400/20 pt-2">
                  <span className="text-white font-extrabold text-sm">ยอดเงินต้นทุนสุทธิที่ต้องโอน:</span>
                  <span className="text-amber-300 font-black text-xl font-mono">
                    ฿{unsettledMovements
                      .filter((m) => selectedMovementIds.includes(m.id))
                      .reduce((sum, m) => sum + m.totalCost, 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-amber-300 font-extrabold mb-1">เลขที่อ้างอิงการโอนเงิน / สลิป *</label>
                <input
                  type="text"
                  required
                  value={settlementPaymentRef}
                  onChange={(e) => setSettlementPaymentRef(e.target.value)}
                  placeholder="เช่น โอนเงินเข้าบัญชี PromptPay 08X-XXX-XXXX"
                  className="w-full bg-stone-900 border-2 border-amber-400/60 rounded-xl p-3 text-white font-extrabold text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-extrabold mb-1">หมายเหตุรอบการเคลียร์เงิน</label>
                <input
                  type="text"
                  value={settlementNote}
                  onChange={(e) => setSettlementNote(e.target.value)}
                  placeholder="เช่น เคลียร์ยอดต้นทุนประจำรอบขายเดือนนี้"
                  className="w-full bg-stone-900 border border-amber-400/30 rounded-xl p-2.5 text-white font-bold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber-400/20">
                <button
                  type="button"
                  onClick={() => setIsSettlementModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 font-bold rounded-xl hover:bg-stone-700"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-gold-400 to-amber-600 text-stone-950 font-black rounded-xl shadow-gold-glow hover:scale-102 transition"
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
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-stone-950 border-2 border-amber-400 rounded-3xl max-w-xl w-full p-6 text-white shadow-2xl space-y-5">
            
            {/* Header Voucher */}
            <div className="flex items-start justify-between border-b-2 border-amber-400/40 pb-4">
              <div>
                <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest bg-stone-900 px-2 py-0.5 rounded border border-amber-400/30">
                  SUPPLIER SETTLEMENT VOUCHER
                </span>
                <h3 className="font-serif font-extrabold text-xl text-amber-300 mt-1">
                  ใบสรุปเคลียร์ยอดชำระเงิน Supplier
                </h3>
                <p className="text-xs text-stone-300 font-bold">
                  {storeSettings.storeName} — {storeSettings.storeTagline}
                </p>
              </div>

              <button
                onClick={() => setViewingSettlementVoucher(null)}
                className="text-amber-300 hover:text-white p-1 rounded-full border border-amber-400/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voucher Details */}
            <div className="space-y-3 text-xs bg-stone-900 p-4 rounded-2xl border border-amber-400/30">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-400 block text-[10px]">เลขที่ใบสรุป:</span>
                  <span className="text-amber-300 font-mono font-extrabold">{viewingSettlementVoucher.id}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">วันที่เคลียร์เงิน:</span>
                  <span className="text-white font-extrabold">
                    {new Date(viewingSettlementVoucher.settledAt).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              <div className="border-t border-amber-400/20 pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-400 block text-[10px]">ชื่อ Supplier / โรงงาน:</span>
                  <span className="text-amber-300 font-extrabold text-sm">{viewingSettlementVoucher.supplierName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">หลักฐาน/อ้างอิงชำระ:</span>
                  <span className="text-emerald-400 font-extrabold">{viewingSettlementVoucher.paymentRef}</span>
                </div>
              </div>

              <div className="border-t border-amber-400/20 pt-2 flex items-center justify-between">
                <div>
                  <span className="text-stone-400 block text-[10px]">จำนวนสินค้าเคลียร์รอบนี้:</span>
                  <span className="text-white font-extrabold">{viewingSettlementVoucher.totalItemsCount} ชิ้น</span>
                </div>
                <div className="text-right">
                  <span className="text-amber-300 block text-[10px] font-bold">ยอดเงินต้นทุนรวมที่เคลียร์จ่าย:</span>
                  <span className="text-amber-300 font-black text-2xl font-mono">
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
                className="px-4 py-2 bg-stone-900 border border-amber-400/40 text-amber-300 font-extrabold rounded-xl text-xs hover:bg-amber-400 hover:text-stone-950 transition flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ใบสรุป / บันทึก PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingSettlementVoucher(null)}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black rounded-xl shadow-gold-glow text-xs"
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
