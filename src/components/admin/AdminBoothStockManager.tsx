'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  PackageCheck,
  Plus,
  Search,
  Store,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Printer,
  Trash2,
  ExternalLink,
  Barcode,
  Layers,
  Sparkles,
  ShoppingBag,
  DollarSign,
  Box,
  TrendingUp,
  Tag,
  Check,
  X,
  FileText,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Send,
  Camera,
  QrCode,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { BoothStockTransfer, BoothTransferItem, Product, EventSchedule } from '../../types';
import { soundFx } from '../../lib/soundEffects';
import { QRScannerModal } from '../common/QRScannerModal';
import { resolveScannedProduct } from '../../utils/qrUtils';
import { formatThaiDateOnly, formatThaiDateTime } from '../../utils/dateUtils';

interface AdminBoothStockManagerProps {
  onOpenPOSWithBooth?: (boothId: string) => void;
  preselectedEventId?: string | null;
}

export const AdminBoothStockManager: React.FC<AdminBoothStockManagerProps> = ({
  onOpenPOSWithBooth,
  preselectedEventId,
}) => {
  const {
    products,
    eventSchedules,
    boothTransfers,
    createBoothTransfer,
    updateBoothTransfer,
    deleteBoothTransfer,
    replenishBoothTransfer,
    reconcileAndReturnBoothTransfer,
    formatPrice,
    storeSettings,
    currentStaff,
    syncBoothTransfersToCloud,
    forceRealtimeSync,
  } = useShop();

  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);

  // Auto-sync booth transfers on mount (silent background check)
  React.useEffect(() => {
    // 1. Pull latest cloud data silently in background
    forceRealtimeSync(false, false).catch(() => {});
    // 2. If we have transfers in local storage, ensure cloud has them
    if (boothTransfers.length > 0 && syncBoothTransfersToCloud) {
      syncBoothTransfersToCloud().catch(() => {});
    }
  }, []);

  const handleManualSyncToCloud = async () => {
    setIsSyncingCloud(true);
    try {
      if (syncBoothTransfersToCloud) {
        await syncBoothTransfersToCloud();
      }
      await forceRealtimeSync(true, true);
      soundFx.playSuccess();
      triggerToast(`☁️ ซิงค์ใบเบิกของทั้งหมด ${boothTransfers.length} งานขึ้นคลาวด์เรียบร้อยแล้ว! ทุกเครื่องและมือถือจะมองเห็นตรงกันทันที`);
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อคลาวด์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Filter & Search States
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'COMPLETED'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [reconcilingTransfer, setReconcilingTransfer] = useState<BoothStockTransfer | null>(null);
  const [replenishingTransfer, setReplenishingTransfer] = useState<BoothStockTransfer | null>(null);
  const [viewingHistoryTransfer, setViewingHistoryTransfer] = useState<BoothStockTransfer | null>(null);
  const [printTransfer, setPrintTransfer] = useState<BoothStockTransfer | null>(null);

  // New Transfer Form State
  const [selectedEventId, setSelectedEventId] = useState<string>(preselectedEventId || '');
  const [customEventName, setCustomEventName] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('HUDA ABAYA - บูธคลอง 16');
  const [staffName, setStaffName] = useState<string>(currentStaff?.name || 'เจ้าของร้าน / ผู้ดูแลบูธ');
  const [dispatchDate, setDispatchDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [selectedProductQuantities, setSelectedProductQuantities] = useState<
    Record<string, number> // key: `${productId}_${variantId}` -> qty
  >({});
  const [transferNote, setTransferNote] = useState<string>('');
  const [productSearchInModal, setProductSearchInModal] = useState<string>('');
  const [categoryFilterInModal, setCategoryFilterInModal] = useState<string>('all');
  const [isDispatchQRScannerOpen, setIsDispatchQRScannerOpen] = useState<boolean>(false);
  const [dispatchBarcodeInput, setDispatchBarcodeInput] = useState<string>('');

  // Replenish Form State
  const [replenishProductQuantities, setReplenishProductQuantities] = useState<
    Record<string, number> // key: `${productId}_${variantId}` -> qty
  >({});
  const [replenishStaffName, setReplenishStaffName] = useState<string>('');
  const [replenishNote, setReplenishNote] = useState<string>('');
  const [replenishSearchInModal, setReplenishSearchInModal] = useState<string>('');
  const [isReplenishQRScannerOpen, setIsReplenishQRScannerOpen] = useState<boolean>(false);
  const [replenishBarcodeInput, setReplenishBarcodeInput] = useState<string>('');

  // Reconciliation working state
  const [reconcileItemsState, setReconcileItemsState] = useState<BoothTransferItem[]>([]);
  const [reconcileNote, setReconcileNote] = useState<string>('');
  const [barcodeScanInput, setBarcodeScanInput] = useState<string>('');
  const [isReconcileQRScannerOpen, setIsReconcileQRScannerOpen] = useState<boolean>(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPIs
  const activeTransfers = useMemo(
    () => boothTransfers.filter((t) => t.status !== 'COMPLETED'),
    [boothTransfers]
  );
  const completedTransfers = useMemo(
    () => boothTransfers.filter((t) => t.status === 'COMPLETED'),
    [boothTransfers]
  );
  const totalItemsAtBooths = useMemo(
    () => activeTransfers.reduce((sum, t) => sum + (t.totalDispatchedQty - (t.totalSoldQty || 0)), 0),
    [activeTransfers]
  );
  const totalSalesRevenue = useMemo(
    () => boothTransfers.reduce((sum, t) => sum + (t.totalSalesAmount || 0), 0),
    [boothTransfers]
  );

  // Filtered List
  const filteredTransfers = useMemo(() => {
    return boothTransfers.filter((t) => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'ACTIVE' && t.status !== 'COMPLETED') ||
        (statusFilter === 'COMPLETED' && t.status === 'COMPLETED');

      const matchSearch =
        !searchQuery.trim() ||
        t.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStatus && matchSearch;
    });
  }, [boothTransfers, statusFilter, searchQuery]);

  // Open Create Modal
  const handleOpenCreateModal = (eventId?: string) => {
    soundFx.playClick();
    if (eventId) {
      setSelectedEventId(eventId);
      const ev = eventSchedules.find((s) => s.id === eventId);
      if (ev) {
        setCustomEventName(ev.title);
        setBranchName(ev.branchName);
        setStaffName(ev.assignedStaff || currentStaff?.name || 'เจ้าของร้าน / ผู้ดูแลบูธ');
        setDispatchDate(ev.startDate);
      }
    } else {
      setSelectedEventId('');
      setCustomEventName('');
      setBranchName('HUDA ABAYA - บูธคลอง 16');
      setStaffName(currentStaff?.name || 'เจ้าของร้าน / ผู้ดูแลบูธ');
      setDispatchDate(new Date().toISOString().slice(0, 10));
    }
    setSelectedProductQuantities({});
    setTransferNote('');
    setProductSearchInModal('');
    setIsCreateModalOpen(true);
  };

  // Submit Create Transfer
  const handleCreateTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEventName =
      customEventName.trim() ||
      eventSchedules.find((s) => s.id === selectedEventId)?.title ||
      'งานออกบูธพิเศษ';

    const itemsToDispatch: BoothTransferItem[] = [];

    // Build items list from selectedProductQuantities
    Object.entries(selectedProductQuantities).forEach(([key, qty]) => {
      if (qty <= 0) return;
      const [prodId, varId] = key.split('_');
      const prod = products.find((p) => p.id === prodId);
      if (!prod) return;
      const variant = prod.variants.find((v) => v.id === varId);
      if (!variant) return;

      itemsToDispatch.push({
        productId: prod.id,
        variantId: variant.id,
        productTitle: prod.title,
        variantName: variant.name,
        sku: variant.sku || `${prod.id}-${variant.name}`,
        price: variant.price,
        costPrice: variant.costPrice || prod.costPrice,
        image: prod.images?.[0] || '',
        dispatchedQty: qty,
        soldQty: 0,
        expectedReturnQty: qty,
        actualReturnedQty: 0,
        difference: 0,
      });
    });

    if (itemsToDispatch.length === 0) {
      alert('กรุณาเลือกสินค้าและระบุจำนวนที่ต้องการเบิกไปออกบูธอย่างน้อย 1 รายการครับ');
      return;
    }

    const totalQty = itemsToDispatch.reduce((sum, item) => sum + item.dispatchedQty, 0);
    const newId = `TRF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newTransfer: BoothStockTransfer = {
      id: newId,
      eventId: selectedEventId || undefined,
      eventName: finalEventName,
      branchName: branchName.trim() || 'HUDA ABAYA - บูธชั่วคราว',
      status: 'SELLING',
      dispatchDate,
      staffName: staffName.trim() || 'ผู้ดูแลบูธ',
      items: itemsToDispatch,
      totalDispatchedQty: totalQty,
      totalSoldQty: 0,
      totalActualReturnedQty: 0,
      totalSalesAmount: 0,
      isReconciled: false,
      note: transferNote.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createBoothTransfer(newTransfer);
    setIsCreateModalOpen(false);
    triggerToast(`✓ สร้างใบเบิกของออกบูธ #${newId} (${totalQty} ชิ้น) เรียบร้อยแล้ว สต๊อกคลังใหญ่ถูกตัดทันที!`);
  };

  // Open Reconcile Modal
  const handleOpenReconcileModal = (transfer: BoothStockTransfer) => {
    try {
      soundFx.playClick();
      setReconcilingTransfer(transfer);
      const safeItems = Array.isArray(transfer?.items) ? transfer.items : [];
      setReconcileItemsState(
        safeItems.map((item) => {
          const expectedQty = typeof item.expectedReturnQty === 'number' && !isNaN(item.expectedReturnQty)
            ? item.expectedReturnQty
            : Math.max(0, (Number(item.dispatchedQty) || 0) - (Number(item.soldQty) || 0));
          const actualQty = item.actualReturnedQty !== undefined && item.actualReturnedQty !== null && !isNaN(item.actualReturnedQty)
            ? Number(item.actualReturnedQty)
            : expectedQty;
          return {
            ...item,
            dispatchedQty: Number(item.dispatchedQty) || 0,
            soldQty: Number(item.soldQty) || 0,
            expectedReturnQty: expectedQty,
            actualReturnedQty: actualQty,
            difference: actualQty - expectedQty,
          };
        })
      );
      setReconcileNote(transfer?.note || '');
      setBarcodeScanInput('');
    } catch (err: any) {
      console.error('Error opening reconcile modal:', err);
      alert(`ไม่สามารถเปิดหน้าตรวจรับของคืนได้: ${err?.message || 'ข้อมูลใบเบิกไม่สมบูรณ์'}`);
    }
  };

  // Auto-fill all expected
  const handleFillAllExpected = () => {
    soundFx.playSuccess();
    setReconcileItemsState((prev) =>
      (prev || []).map((item) => {
        const exp = typeof item.expectedReturnQty === 'number' && !isNaN(item.expectedReturnQty)
          ? item.expectedReturnQty
          : Math.max(0, (Number(item.dispatchedQty) || 0) - (Number(item.soldQty) || 0));
        return {
          ...item,
          actualReturnedQty: exp,
          difference: 0,
        };
      })
    );
  };

  // Update actual returned count for item
  const handleUpdateItemActualQty = (variantId: string, newActual: number) => {
    const val = Math.max(0, isNaN(newActual) ? 0 : newActual);
    setReconcileItemsState((prev) =>
      (prev || []).map((item) => {
        if (item.variantId !== variantId) return item;
        const exp = typeof item.expectedReturnQty === 'number' && !isNaN(item.expectedReturnQty)
          ? item.expectedReturnQty
          : Math.max(0, (Number(item.dispatchedQty) || 0) - (Number(item.soldQty) || 0));
        return {
          ...item,
          actualReturnedQty: val,
          difference: val - exp,
        };
      })
    );
  };

  // Barcode / SKU quick scan during reconciliation
  const handleBarcodeScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = barcodeScanInput.trim().toLowerCase();
    if (!clean) return;

    const matchedIdx = (reconcileItemsState || []).findIndex(
      (item) =>
        (item.sku || '').toLowerCase() === clean ||
        (item.variantId || '').toLowerCase() === clean ||
        (item.productTitle || '').toLowerCase().includes(clean)
    );

    if (matchedIdx !== -1) {
      soundFx.playClick();
      setReconcileItemsState((prev) => {
        const next = [...prev];
        const cur = next[matchedIdx];
        const exp = typeof cur.expectedReturnQty === 'number' && !isNaN(cur.expectedReturnQty)
          ? cur.expectedReturnQty
          : Math.max(0, (Number(cur.dispatchedQty) || 0) - (Number(cur.soldQty) || 0));
        const nextQty = (Number(cur.actualReturnedQty) || 0) + 1;
        next[matchedIdx] = {
          ...cur,
          actualReturnedQty: nextQty,
          difference: nextQty - exp,
        };
        return next;
      });
      triggerToast(`+1 ตรวจนับ: ${reconcileItemsState[matchedIdx].productTitle} (${reconcileItemsState[matchedIdx].variantName})`);
      setBarcodeScanInput('');
    } else {
      soundFx.playDelete();
      alert(`ไม่พบสินค้าที่มี SKU หรือรหัส "${barcodeScanInput}" ในใบเบิกนี้`);
    }
  };

  // QR & Barcode scan handler for Dispatch Modal (ตอนเบิกของออกบูธ)
  const handleDispatchQRScan = (decodedText: string) => {
    const match = resolveScannedProduct(decodedText, products);
    if (!match) {
      soundFx.playScanError();
      triggerToast(`⚠️ ไม่พบข้อมูลสินค้าที่ตรงกับรหัส "${decodedText}"`);
      return { success: false, message: `ไม่พบสินค้า "${decodedText}"` };
    }

    const { product, variant } = match;
    const key = `${product.id}_${variant.id}`;
    const currentSelected = selectedProductQuantities[key] || 0;
    const availableInCentral = variant.stockQuantity;

    // Check if warehouse stock is completely 0 (สินค้าหมดคลังใหญ่)
    if (availableInCentral <= 0) {
      soundFx.playScanError();
      triggerToast(
        `❌ "${product.title} (${variant.name})" สินค้าหมดคลังใหญ่แล้ว (คงเหลือ 0 ชิ้น)`
      );
      return { success: false, message: `หมดคลัง: ${product.title}` };
    }

    if (currentSelected + 1 > availableInCentral) {
      soundFx.playScanError();
      triggerToast(
        `⚠️ คลังใหญ่มีเหลือเพียง ${availableInCentral} ชิ้น (เบิกไปแล้ว ${currentSelected} ชิ้น)`
      );
      return { success: false, message: `เกินสต๊อกคลัง (เหลือ ${availableInCentral})` };
    }

    const newQty = currentSelected + 1;
    setSelectedProductQuantities((prev) => ({
      ...prev,
      [key]: newQty,
    }));
    soundFx.playScanSuccess();
    triggerToast(
      `✓ สแกนสำเร็จ: "${product.title} (${variant.name})" +1 ชิ้น (เบิกแล้ว ${newQty}/${availableInCentral} ชิ้น)`
    );
    return { success: true, message: `${product.title} (${variant.name}) +1` };
  };

  const handleDispatchBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchBarcodeInput.trim()) return;
    handleDispatchQRScan(dispatchBarcodeInput);
    setDispatchBarcodeInput('');
  };

  // Open Replenish Modal (เบิกของเติมเข้าบูธเดิม)
  const handleOpenReplenishModal = (transfer: BoothStockTransfer) => {
    soundFx.playClick();
    setReplenishingTransfer(transfer);
    setReplenishProductQuantities({});
    setReplenishStaffName(currentStaff?.name || transfer.staffName || 'เจ้าของร้าน / ผู้ดูแลบูธ');
    setReplenishNote('');
    setReplenishSearchInModal('');
    setReplenishBarcodeInput('');
  };

  // QR Scan for Replenish Modal (Ultra-fast continuous scan)
  const handleReplenishQRScan = (decodedText: string) => {
    if (!replenishingTransfer) return { success: false, message: 'ไม่พบบูธที่ทำรายการ' };
    const match = resolveScannedProduct(decodedText, products);
    if (!match) {
      soundFx.playScanError();
      triggerToast(`⚠️ ไม่พบข้อมูลสินค้าที่ตรงกับรหัส "${decodedText}"`);
      return { success: false, message: `ไม่พบสินค้า "${decodedText}"` };
    }

    const { product, variant } = match;
    const key = `${product.id}_${variant.id}`;
    const currentSelected = replenishProductQuantities[key] || 0;
    const availableInCentral = variant.stockQuantity;

    // Check if warehouse stock is completely 0 (สินค้าหมดคลังใหญ่ / ถูกบูธอื่นเบิกไปแล้ว)
    if (availableInCentral <= 0) {
      soundFx.playScanError();
      triggerToast(
        `❌ "${product.title} (${variant.name})" สินค้าหมดคลังใหญ่แล้ว (อาจถูกเบิกไปแล้ว)`
      );
      return { success: false, message: `หมดคลัง: ${product.title} (${variant.name})` };
    }

    if (currentSelected + 1 > availableInCentral) {
      soundFx.playScanError();
      triggerToast(
        `⚠️ "${product.title} (${variant.name})" ในคลังใหญ่มีเหลือเพียง ${availableInCentral} ชิ้น (คุณเลือกเติมไปครบแล้ว)`
      );
      return { success: false, message: `เกินสต๊อกคลัง (เหลือ ${availableInCentral})` };
    }

    const newQty = currentSelected + 1;
    setReplenishProductQuantities((prev) => ({
      ...prev,
      [key]: newQty,
    }));
    soundFx.playScanSuccess();
    triggerToast(
      `✓ สแกนเติมของ: "${product.title} (${variant.name})" +1 ชิ้น (รวมเติม ${newQty}/${availableInCentral} ชิ้น)`
    );
    return { success: true, message: `${product.title} (${variant.name}) +1` };
  };

  const handleReplenishBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replenishBarcodeInput.trim()) return;
    handleReplenishQRScan(replenishBarcodeInput);
    setReplenishBarcodeInput('');
  };

  // Memoized Live Scanned Feed for Replenish Modal & Scanner
  const replenishScannedFeed = useMemo(() => {
    return Object.entries(replenishProductQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([key, qty]) => {
        const [prodId, varId] = key.split('_');
        const prod = products.find((p) => p.id === prodId);
        const variant = prod?.variants.find((v) => v.id === varId);
        return {
          id: key,
          title: prod?.title || 'สินค้า',
          variantName: variant?.name || '',
          sku: variant?.sku || '',
          quantity: qty,
          image: prod?.images?.[0] || '',
          maxStock: variant?.stockQuantity || 0,
        };
      })
      .reverse();
  }, [replenishProductQuantities, products]);

  const handleAdjustReplenishQty = (key: string, delta: number) => {
    const [prodId, varId] = key.split('_');
    const prod = products.find((p) => p.id === prodId);
    const variant = prod?.variants.find((v) => v.id === varId);
    const maxStock = variant?.stockQuantity || 9999;

    setReplenishProductQuantities((prev) => {
      const cur = prev[key] || 0;
      const nextVal = cur + delta;
      const next = { ...prev };
      if (nextVal <= 0) {
        delete next[key];
      } else {
        next[key] = Math.min(maxStock, nextVal);
      }
      return next;
    });
    soundFx.playClick();
  };

  // Memoized Live Scanned Feed for Dispatch Modal & Scanner
  const dispatchScannedFeed = useMemo(() => {
    return Object.entries(selectedProductQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([key, qty]) => {
        const [prodId, varId] = key.split('_');
        const prod = products.find((p) => p.id === prodId);
        const variant = prod?.variants.find((v) => v.id === varId);
        return {
          id: key,
          title: prod?.title || 'สินค้า',
          variantName: variant?.name || '',
          sku: variant?.sku || '',
          quantity: qty,
          image: prod?.images?.[0] || '',
          maxStock: variant?.stockQuantity || 0,
        };
      })
      .reverse();
  }, [selectedProductQuantities, products]);

  const handleAdjustDispatchQty = (key: string, delta: number) => {
    const [prodId, varId] = key.split('_');
    const prod = products.find((p) => p.id === prodId);
    const variant = prod?.variants.find((v) => v.id === varId);
    const maxStock = variant?.stockQuantity || 9999;

    setSelectedProductQuantities((prev) => {
      const cur = prev[key] || 0;
      const nextVal = cur + delta;
      const next = { ...prev };
      if (nextVal <= 0) {
        delete next[key];
      } else {
        next[key] = Math.min(maxStock, nextVal);
      }
      return next;
    });
    soundFx.playClick();
  };

  // Memoized Live Scanned Feed for Reconcile Modal & Scanner
  const reconcileScannedFeed = useMemo(() => {
    return reconcileItemsState
      .filter((it) => (it.actualReturnedQty || 0) > 0)
      .map((it) => ({
        id: it.variantId,
        title: it.productTitle,
        variantName: it.variantName,
        sku: it.sku,
        quantity: it.actualReturnedQty || 0,
        image: it.image,
        maxStock: it.expectedReturnQty,
      }));
  }, [reconcileItemsState]);

  // Confirm Replenishment and save
  const handleConfirmReplenish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replenishingTransfer) return;

    const itemsToAdd: Array<{
      productId: string;
      variantId: string;
      productTitle: string;
      variantName: string;
      sku: string;
      price: number;
      costPrice?: number;
      image?: string;
      quantity: number;
    }> = [];

    for (const [key, qty] of Object.entries(replenishProductQuantities)) {
      if (qty <= 0) continue;
      const [prodId, varId] = key.split('_');
      const prod = products.find((p) => p.id === prodId);
      if (!prod) continue;
      const variant = prod.variants.find((v) => v.id === varId);
      if (!variant) continue;

      itemsToAdd.push({
        productId: prod.id,
        variantId: variant.id,
        productTitle: prod.title,
        variantName: variant.name,
        sku: variant.sku || `${prod.id}-${variant.name}`,
        price: variant.price,
        costPrice: variant.costPrice || prod.costPrice,
        image: prod.images?.[0] || '',
        quantity: qty,
      });
    }

    if (itemsToAdd.length === 0) {
      alert('กรุณาเลือกสินค้าและระบุจำนวนที่ต้องการเติมเข้าบูธอย่างน้อย 1 รายการครับ');
      return;
    }

    const totalQty = itemsToAdd.reduce((sum, it) => sum + it.quantity, 0);

    replenishBoothTransfer(
      replenishingTransfer.id,
      itemsToAdd,
      replenishStaffName.trim() || replenishingTransfer.staffName,
      replenishNote.trim()
    );

    setReplenishingTransfer(null);
    triggerToast(
      `✅ เติมสินค้าเข้าบูธ "${replenishingTransfer.eventName}" สำเร็จ (+${totalQty} ชิ้น)! ตัดสต๊อกคลังใหญ่และ POS พร้อมขายทันที`
    );
  };

  // QR & Barcode scan handler for Return & Reconciliation (ตอนตรวจรับของคืน)
  const handleReconcileQRScan = (decodedText: string) => {
    const clean = decodedText.trim();
    const match = resolveScannedProduct(clean, products);
    let matchedVariantId: string | null = null;
    let matchedTitle = '';

    if (match) {
      matchedVariantId = match.variant.id;
      matchedTitle = `${match.product.title} (${match.variant.name})`;
    } else {
      const found = (reconcileItemsState || []).find(
        (i) =>
          (i.sku || '').toLowerCase() === clean.toLowerCase() ||
          (i.variantId || '').toLowerCase() === clean.toLowerCase() ||
          (i.productId || '').toLowerCase() === clean.toLowerCase()
      );
      if (found) {
        matchedVariantId = found.variantId;
        matchedTitle = `${found.productTitle} (${found.variantName})`;
      }
    }

    if (!matchedVariantId) {
      soundFx.playScanError();
      triggerToast(`⚠️ ไม่พบสินค้าที่ตรงกับรหัส "${clean}" ในใบเบิกนี้`);
      return { success: false, message: `ไม่พบสินค้า "${clean}"` };
    }

    const targetIdx = (reconcileItemsState || []).findIndex((i) => i.variantId === matchedVariantId);
    if (targetIdx === -1) {
      soundFx.playScanError();
      triggerToast(`⚠️ สินค้า "${matchedTitle}" ไม่ได้อยู่ในใบเบิกของบูธนี้`);
      return { success: false, message: `ไม่ได้อยู่ในใบเบิก: ${matchedTitle}` };
    }

    soundFx.playScanSuccess();
    setReconcileItemsState((prev) => {
      const next = [...prev];
      const cur = next[targetIdx];
      const exp = typeof cur.expectedReturnQty === 'number' && !isNaN(cur.expectedReturnQty)
        ? cur.expectedReturnQty
        : Math.max(0, (Number(cur.dispatchedQty) || 0) - (Number(cur.soldQty) || 0));
      const nextQty = (Number(cur.actualReturnedQty) || 0) + 1;
      next[targetIdx] = {
        ...cur,
        actualReturnedQty: nextQty,
        difference: nextQty - exp,
      };
      return next;
    });
    triggerToast(
      `✓ ตรวจนับคืน: ${reconcileItemsState[targetIdx].productTitle} (${reconcileItemsState[targetIdx].variantName}) +1 ชิ้น`
    );
    return { success: true, message: `${matchedTitle} +1` };
  };

  // Finalize Reconciliation and Return to Central Warehouse
  const handleConfirmReconciliation = () => {
    if (!reconcilingTransfer) return;
    try {
      const netDifference = (reconcileItemsState || []).reduce((sum, item) => sum + (Number(item.difference) || 0), 0);
      let confirmMsg = `ยืนยันการตรวจรับของคืนเข้าสต๊อกกลางสำหรับงาน "${reconcilingTransfer.eventName || 'ออกบูธ'}" หรือไม่?\n\n`;
      if (netDifference === 0) {
        confirmMsg += `🟢 ยอดตรงครบถ้วน 100% (ไม่มีของขาด/เกิน)\nสินค้าที่นับได้จะถูกโอนคืนกลับเข้าคลังใหญ่ทันที`;
      } else if (netDifference < 0) {
        confirmMsg += `🔴 มีสินค้าขาดหายไป ${Math.abs(netDifference)} ชิ้น\nสินค้าที่นับได้จริงจะถูกโอนคืนคลังใหญ่ และบันทึกยอดสูญหายในระบบ`;
      } else {
        confirmMsg += `🟡 มีสินค้าเกินมา ${netDifference} ชิ้น\nสินค้าที่นับได้จริงจะถูกโอนคืนคลังใหญ่`;
      }

      if (confirm(confirmMsg)) {
        reconcileAndReturnBoothTransfer(reconcilingTransfer.id, reconcileItemsState || [], reconcileNote);
        setReconcilingTransfer(null);
        triggerToast(`✅ ตรวจรับของคืนเข้าสต๊อกกลางเรียบร้อยแล้ว! คลังใหญ่ได้รับการอัปเดตสต๊อกทันที`);
      }
    } catch (err: any) {
      console.error('Error in handleConfirmReconciliation:', err);
      alert(`เกิดข้อผิดพลาดในการตรวจรับของคืน: ${err?.message || 'กรุณาลองใหม่อีกครั้ง'}`);
    }
  };

  return (
    <div className="space-y-6 text-stone-950 font-sans text-left">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-950 text-amber-300 border-2 border-amber-400 px-5 py-3 rounded-2xl shadow-2xl font-black text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 border-2 border-amber-600 rounded-3xl p-5 sm:p-6 shadow-md text-stone-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-stone-950 text-amber-300 flex items-center justify-center shadow-sm">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-950">
                ระบบเบิกของออกบูธ &amp; เช็คสต๊อกคืน
              </h2>
              <p className="text-xs sm:text-sm font-bold text-amber-950/90 mt-0.5">
                ตัดของจากคลังกลางไปขายหน้าร้าน POS หลายบูธพร้อมกัน จบงานตรวจนับกระทบยอดและโอนคืนคลังใหญ่
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleManualSyncToCloud}
            disabled={isSyncingCloud}
            className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:bg-stone-200 text-stone-950 text-xs sm:text-sm font-black rounded-2xl shadow border-2 border-stone-900 flex items-center gap-1.5 transition cursor-pointer hover:scale-102 active:scale-98"
            title="กดเพื่อส่งใบเบิกของขึ้นคลาวด์ และดึงข้อมูลล่าสุดจากโทรศัพท์หรือเครื่องอื่นทันที"
          >
            <RotateCcw className={`w-4 h-4 text-stone-950 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            <span>{isSyncingCloud ? 'กำลังซิงค์...' : `☁️ ซิงค์ไปมือถือ & เครื่องอื่น (${boothTransfers.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2.5 bg-stone-950 hover:bg-stone-800 text-amber-300 text-xs sm:text-sm font-black rounded-2xl shadow-lg border-2 border-amber-300 flex items-center gap-2 transition cursor-pointer hover:scale-102 active:scale-98"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ สร้างใบเบิกของออกบูธใหม่</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border-2 border-amber-300/80 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500">
            <span>บูธที่กำลังเปิดขาย</span>
            <Store className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-black text-stone-950">
            {activeTransfers.length} <span className="text-xs font-normal text-stone-500">งาน</span>
          </div>
          <p className="text-[10px] text-stone-500">พร้อมขายผ่านระบบ POS</p>
        </div>

        <div className="bg-white border-2 border-amber-300/80 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500">
            <span>สินค้าที่บูธทั้งหมด</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-serif font-black text-amber-900">
            {totalItemsAtBooths.toLocaleString()} <span className="text-xs font-normal text-stone-500">ชิ้น</span>
          </div>
          <p className="text-[10px] text-stone-500">กระจายอยู่ในแต่ละบูธ</p>
        </div>

        <div className="bg-white border-2 border-amber-300/80 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500">
            <span>ยอดขายจากทุกบูธ</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-black text-emerald-700">
            ฿{totalSalesRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] text-stone-500">รวมจากออเดอร์ POS ทั้งหมด</p>
        </div>

        <div className="bg-white border-2 border-amber-300/80 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500">
            <span>คืนสต๊อกครบแล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-serif font-black text-stone-950">
            {completedTransfers.length} <span className="text-xs font-normal text-stone-500">งาน</span>
          </div>
          <p className="text-[10px] text-stone-500">กระทบยอดและโอนคืนคลังแล้ว</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-stone-200 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-300 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-amber-400 text-stone-950 shadow-xs border border-amber-500'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            ทั้งหมด ({boothTransfers.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            กำลังเปิดขาย ({activeTransfers.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
              statusFilter === 'COMPLETED'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            คืนสต๊อกครบแล้ว ({completedTransfers.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่องาน, สาขา, หรือรหัสใบเบิก..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-bold border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
          />
        </div>
      </div>

      {/* Booth Transfers List */}
      {filteredTransfers.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-stone-300 rounded-3xl p-12 text-center space-y-3">
          <PackageCheck className="w-12 h-12 text-stone-400 mx-auto" />
          <p className="text-base font-black text-stone-700">ยังไม่มีใบเบิกของออกบูธตามเงื่อนไขที่เลือก</p>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            กดปุ่ม "+ สร้างใบเบิกของออกบูธใหม่" เพื่อเลือกสินค้าจากคลังใหญ่ไปเตรียมเปิดขายในแต่ละบูธ
          </p>
          <button
            type="button"
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black rounded-xl border border-amber-500 shadow-sm transition cursor-pointer"
          >
            + สร้างใบเบิกของออกบูธใหม่
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTransfers.map((t) => {
            const remainingAtBooth = Math.max(0, t.totalDispatchedQty - (t.totalSoldQty || 0));
            const isCompleted = t.status === 'COMPLETED';

            return (
              <div
                key={t.id}
                className={`bg-white border-2 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 transition hover:shadow-md ${
                  isCompleted
                    ? 'border-stone-300 bg-stone-50/50 opacity-90'
                    : 'border-amber-400 bg-white'
                }`}
              >
                {/* Card Top: Title & Status */}
                <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[10px] font-black bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200">
                        #{t.id}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          isCompleted
                            ? 'bg-stone-200 text-stone-800 border-stone-300'
                            : 'bg-emerald-500 text-white border-emerald-600 animate-pulse'
                        }`}
                      >
                        {isCompleted ? '✓ คืนสต๊อกครบแล้ว' : '🟢 กำลังเปิดขาย (Active)'}
                      </span>
                    </div>

                    <h3 className="font-serif font-black text-base sm:text-lg text-stone-950 mt-1">
                      {t.eventName}
                    </h3>
                    <p className="text-xs font-bold text-stone-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t.branchName}</span>
                      <span>•</span>
                      <User className="w-3.5 h-3.5 text-stone-500" />
                      <span>{t.staffName}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-stone-500 font-bold block">วันที่เบิก</span>
                    <span className="text-xs font-black text-stone-800 block">{formatThaiDateOnly(t.dispatchDate)}</span>
                  </div>
                </div>

                {/* Progress & Item Summary */}
                <div className="grid grid-cols-3 gap-2 bg-stone-50 p-2.5 rounded-2xl border border-stone-200 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 block">เบิกไป</span>
                    <span className="text-sm font-mono font-black text-stone-900">
                      {t.totalDispatchedQty} <span className="text-[10px] font-normal">ชิ้น</span>
                    </span>
                  </div>
                  <div className="border-x border-stone-200">
                    <span className="text-[10px] font-bold text-stone-500 block">ขายใน POS</span>
                    <span className="text-sm font-mono font-black text-emerald-700">
                      {t.totalSoldQty || 0} <span className="text-[10px] font-normal">ชิ้น</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 block">
                      {isCompleted ? 'นับคืนได้' : 'เหลือที่บูธ'}
                    </span>
                    <span
                      className={`text-sm font-mono font-black ${
                        isCompleted ? 'text-blue-700' : 'text-amber-800'
                      }`}
                    >
                      {isCompleted ? t.totalActualReturnedQty : remainingAtBooth}{' '}
                      <span className="text-[10px] font-normal">ชิ้น</span>
                    </span>
                  </div>
                </div>

                {/* Sales Revenue Info */}
                <div className="flex items-center justify-between text-xs font-bold text-stone-700 px-1">
                  <span>💰 ยอดขายสะสมจากบูธนี้:</span>
                  <span className="text-sm font-black text-emerald-700 font-mono">
                    ฿{(t.totalSalesAmount || 0).toLocaleString()}
                  </span>
                </div>

                {/* Replenishments badge/row */}
                {t.replenishments && t.replenishments.length > 0 && (
                  <div className="flex items-center justify-between text-xs bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
                    <div className="flex items-center gap-1.5 text-blue-950 font-bold">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>
                        เติมของเพิ่มแล้ว <strong>{t.replenishments.length}</strong> ครั้ง (+
                        {t.replenishments.reduce((sum, r) => sum + r.totalQtyAdded, 0)} ชิ้น)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewingHistoryTransfer(t)}
                      className="text-[11px] font-black text-blue-700 hover:text-blue-900 underline cursor-pointer shrink-0"
                    >
                      ดูประวัติเติมของ
                    </button>
                  </div>
                )}

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Replenish button (เบิกเติมของ) */}
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleOpenReplenishModal(t)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs border border-blue-700 flex items-center gap-1.5 transition cursor-pointer hover:scale-102 active:scale-98"
                        title="เบิกสินค้าจากสต๊อกกลางเติมเข้าบูธนี้เพิ่ม (รอบที่ 2, 3...)"
                      >
                        <Plus className="w-3.5 h-3.5 text-white" />
                        <span>➕ เติมของเข้าบูธ</span>
                      </button>
                    )}

                    {/* Reconcile button */}
                    {!isCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleOpenReconcileModal(t)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-stone-950 font-black text-xs rounded-xl shadow-xs border border-amber-500 flex items-center gap-1.5 transition cursor-pointer hover:scale-102 active:scale-98"
                        title="ตรวจนับของคืน โอนสต๊อกกลับคลังใหญ่ และปิดงานขายบูธนี้"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-950" />
                        <span>📦 ปิดบูธ &amp; ตรวจรับของคืน</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenReconcileModal(t)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 flex items-center gap-1 transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>ดูผลกระทบยอด</span>
                      </button>
                    )}

                    {/* Quick POS shortcut */}
                    {!isCompleted && onOpenPOSWithBooth && (
                      <button
                        type="button"
                        onClick={() => onOpenPOSWithBooth(t.id)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs rounded-xl border border-emerald-300 flex items-center gap-1 transition cursor-pointer"
                        title="เปิดหน้าแคชเชียร์ขายของสำหรับบูธนี้"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>เปิด POS บูธนี้</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPrintTransfer(t)}
                      className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl border border-stone-300 transition cursor-pointer"
                      title="พิมพ์ใบเบิกสินค้า / ใบตรวจนับ"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            `คุณต้องการลบใบเบิก "${t.eventName}" หรือไม่?\n(หากยังไม่ได้คืนสต๊อก ระบบจะนำของที่เหลือคืนกลับเข้าคลังใหญ่ให้อัตโนมัติ)`
                          )
                        ) {
                          deleteBoothTransfer(t.id);
                          triggerToast('ลบใบเบิกและปรับคืนสต๊อกเข้าคลังใหญ่เรียบร้อยแล้ว');
                        }
                      }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition cursor-pointer"
                      title="ลบใบเบิก"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. CREATE DISPATCH MODAL (ฟอร์มเบิกของออกบูธใหม่) */}
      {/* ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col text-stone-950 shadow-2xl text-left overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-amber-300 p-4 sm:p-5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 shrink-0">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-6 h-6 text-stone-950" />
                <h3 className="font-serif font-black text-lg sm:text-xl text-stone-950">
                  ใบเบิกสินค้าออกบูธ (Dispatch Requisition)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-950/10 hover:bg-stone-950/20 text-stone-950 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateTransferSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Form Row: Event selection / Custom name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">
                    ผูกกับงานในปฏิทิน (ถ้ามี)
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => {
                      setSelectedEventId(e.target.value);
                      const ev = eventSchedules.find((s) => s.id === e.target.value);
                      if (ev) {
                        setCustomEventName(ev.title);
                        setBranchName(ev.branchName);
                        setStaffName(ev.assignedStaff || staffName);
                        setDispatchDate(ev.startDate);
                      }
                    }}
                    className="w-full text-xs font-bold bg-stone-50 border border-stone-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="">-- ไม่ผูกกับปฏิทิน (ระบุชื่องานเองด้านล่าง) --</option>
                    {eventSchedules.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        📅 {ev.title} ({ev.startDate})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">
                    ชื่องานออกบูธ / อีเวนต์ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น งานออกบูธตลาดนัดคลอง 16 (ชุดที่ 1)"
                    value={customEventName}
                    onChange={(e) => setCustomEventName(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-stone-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Form Row: Branch & Staff & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">ชื่อสาขา / บูธ</label>
                  <input
                    type="text"
                    required
                    placeholder="HUDA ABAYA - บูธคลอง 16"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-stone-300 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">พนักงานผู้ดูแลบูธ</label>
                  <input
                    type="text"
                    required
                    placeholder="ชื่อผู้รับผิดชอบ"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-stone-300 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">วันที่เบิกสินค้า</label>
                  <input
                    type="date"
                    required
                    value={dispatchDate}
                    onChange={(e) => setDispatchDate(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-stone-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              {/* Item Selection Section */}
              <div className="border-t-2 border-stone-200 pt-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="font-serif font-black text-base text-amber-950 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-700" />
                      <span>เลือกสินค้าจากคลังใหญ่เพื่อเบิกไปบูธ</span>
                    </h4>
                    <p className="text-[11px] text-stone-500 font-bold">
                      ระบุจำนวนที่ต้องการเบิก หรือยิงสแกน QR Code บนป้ายสินค้าเพื่อเพิ่มยอดเบิกได้ทันที
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="ค้นหาสินค้า / ไซส์..."
                      value={productSearchInModal}
                      onChange={(e) => setProductSearchInModal(e.target.value)}
                      className="text-xs font-bold px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl w-48"
                    />
                  </div>
                </div>

                {/* 📸 QR & Barcode Scanning Bar for Dispatch */}
                <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 p-3 rounded-2xl border-2 border-amber-400/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setIsDispatchQRScannerOpen(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md border border-emerald-700 transition flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98 shrink-0"
                      title="เปิดกล้องสแกน QR Code บนป้ายสินค้าเพื่อเพิ่มยอดเบิกทันที"
                    >
                      <Camera className="w-4 h-4 text-white" />
                      <span>📸 เปิดกล้องสแกน QR สินค้า</span>
                    </button>
                    <span className="text-[11px] font-bold text-amber-950 hidden md:inline">
                      หรือใช้เครื่องยิงบาร์โค้ด 👉
                    </span>
                  </div>

                  <div className="relative flex-1 w-full sm:max-w-md">
                    <input
                      type="text"
                      placeholder="🔫 ยิงเครื่องสแกนบาร์โค้ด / ป้าย QR สินค้า..."
                      value={dispatchBarcodeInput}
                      onChange={(e) => setDispatchBarcodeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleDispatchBarcodeSubmit(e);
                        }
                      }}
                      className="w-full bg-white border-2 border-amber-400 rounded-xl py-2 pl-9 pr-3 text-xs text-stone-950 font-bold placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono shadow-2xs"
                    />
                    <Barcode className="w-4 h-4 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Product Variants List for selection */}
                <div className="max-h-72 overflow-y-auto border border-stone-200 rounded-2xl divide-y divide-stone-100 bg-white">
                  {products
                    .filter((prod) => {
                      if (!productSearchInModal.trim()) return true;
                      const q = productSearchInModal.toLowerCase();
                      return (
                        prod.title.toLowerCase().includes(q) ||
                        prod.variants.some((v) => v.name.toLowerCase().includes(q))
                      );
                    })
                    .map((prod) => {
                      return (
                        <div key={prod.id} className="p-3 hover:bg-stone-50 transition space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-black text-sm text-stone-900">
                              {prod.title}
                            </span>
                            <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                              {prod.category}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {prod.variants.map((v) => {
                              const key = `${prod.id}_${v.id}`;
                              const selectedQty = selectedProductQuantities[key] || 0;
                              const availableInCentral = v.stockQuantity;

                              return (
                                <div
                                  key={v.id}
                                  className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                                    selectedQty > 0
                                      ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-400'
                                      : 'bg-stone-50/70 border-stone-200'
                                  }`}
                                >
                                  <div>
                                    <div className="font-black text-xs text-stone-800">{v.name}</div>
                                    <div className="text-[10px] text-stone-500 font-mono">
                                      คลังใหญ่มี: <strong>{availableInCentral}</strong> ชิ้น
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const cur = selectedProductQuantities[key] || 0;
                                        if (cur > 0) {
                                          setSelectedProductQuantities((prev) => ({
                                            ...prev,
                                            [key]: cur - 1,
                                          }));
                                        }
                                      }}
                                      className="w-6 h-6 rounded-lg bg-white border border-stone-300 font-black text-xs hover:bg-stone-100"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min={0}
                                      max={availableInCentral}
                                      value={selectedQty}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value, 10) || 0;
                                        const clamped = Math.min(Math.max(0, val), availableInCentral);
                                        setSelectedProductQuantities((prev) => ({
                                          ...prev,
                                          [key]: clamped,
                                        }));
                                      }}
                                      className="w-12 text-center text-xs font-mono font-black border border-stone-300 rounded-lg py-1 bg-white"
                                    />
                                    <button
                                      type="button"
                                      disabled={selectedQty >= availableInCentral}
                                      onClick={() => {
                                        const cur = selectedProductQuantities[key] || 0;
                                        if (cur < availableInCentral) {
                                          setSelectedProductQuantities((prev) => ({
                                            ...prev,
                                            [key]: cur + 1,
                                          }));
                                        }
                                      }}
                                      className="w-6 h-6 rounded-lg bg-amber-400 border border-amber-500 font-black text-xs hover:bg-amber-300 disabled:opacity-30 cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Total Dispatch Summary */}
              {(() => {
                const totalCount = Object.values(selectedProductQuantities).reduce((s, q) => s + q, 0);
                return (
                  <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-300 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black text-amber-950">
                      รวมสินค้าที่เลือกเบิกออกบูธ:
                    </span>
                    <span className="text-base font-serif font-black text-stone-950">
                      {totalCount} <span className="text-xs font-sans font-normal">ชิ้น</span>
                    </span>
                  </div>
                );
              })()}

              {/* Note */}
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">หมายเหตุเพิ่มเติม</label>
                <textarea
                  rows={2}
                  placeholder="เช่น เบิกไปตลาดนัดคลอง 16 เต็นท์โซน C ชุดพร้อมขายพร้อมไม้แขวน"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 border border-stone-300 rounded-xl"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-950 hover:bg-stone-800 text-amber-300 text-xs font-black rounded-xl shadow-md border-2 border-amber-400 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>ยืนยันเบิกของออกบูธ (ตัดสต๊อกคลังใหญ่)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. RECONCILIATION / CHECK-IN MODAL (ตรวจรับของคืน & กระทบยอด) */}
      {/* ======================================================== */}
      {reconcilingTransfer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col text-stone-950 shadow-2xl text-left overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-amber-300 p-4 sm:p-5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 shrink-0">
              <div>
                <span className="text-[10px] font-mono font-black bg-stone-950 text-amber-300 px-2 py-0.5 rounded-md">
                  #{reconcilingTransfer.id}
                </span>
                <h3 className="font-serif font-black text-lg sm:text-xl text-stone-950 mt-1">
                  ตรวจรับของคืน &amp; กระทบยอดสต๊อก (Stock Reconciliation)
                </h3>
                <p className="text-xs font-bold text-stone-800">
                  {reconcilingTransfer.eventName} • {reconcilingTransfer.branchName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReconcilingTransfer(null)}
                className="w-8 h-8 rounded-full bg-stone-950/10 hover:bg-stone-950/20 text-stone-950 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Barcode & Camera Scan Bar */}
            <div className="bg-stone-100 border-b border-stone-200 p-3 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsReconcileQRScannerOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md border border-emerald-700 transition flex items-center gap-1.5 cursor-pointer hover:scale-102 active:scale-98 shrink-0"
                  title="เปิดกล้องสแกน QR Code บนสินค้าเพื่อนับของคืนเข้าคลังทีละชิ้น"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <span>📸 สแกน QR ตรวจนับคืน</span>
                </button>

                <form onSubmit={handleBarcodeScanSubmit} className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="ยิงบาร์โค้ด / พิมพ์ SKU เพื่อนับของคืน..."
                      value={barcodeScanInput}
                      onChange={(e) => setBarcodeScanInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs font-mono font-bold bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                    <Barcode className="w-4 h-4 text-amber-700 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-stone-950 text-amber-300 text-xs font-black rounded-xl hover:bg-stone-800 transition shrink-0 cursor-pointer"
                  >
                    + นับคืน
                  </button>
                </form>
              </div>

              <button
                type="button"
                onClick={handleFillAllExpected}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
                title="กรณีของเหลือครบตามยอดที่ขายไปทั้งหมด ไม่ต้องเสียเวลานับทีละตัว"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>เติมยอดที่ต้องเหลือคืนทั้งหมดอัตโนมัติ</span>
              </button>
            </div>

            {/* Items Reconciliation Table */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
              {reconcilingTransfer.replenishments && reconcilingTransfer.replenishments.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      ℹ️ งานนี้มีการเบิกเติมของระหว่างงาน <strong>{reconcilingTransfer.replenishments.length}</strong> ครั้ง (+
                      {reconcilingTransfer.replenishments.reduce((s, r) => s + r.totalQtyAdded, 0)} ชิ้น)
                      — ยอดในช่อง "เบิกไป" รวมยอดเบิกตั้งต้นและยอดเติมทั้งหมดเรียบร้อยแล้ว
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewingHistoryTransfer(reconcilingTransfer)}
                    className="text-[11px] font-black underline text-blue-700 hover:text-blue-900 cursor-pointer shrink-0"
                  >
                    ดูประวัติการเติม
                  </button>
                </div>
              )}
              <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                <table className="w-full min-w-[720px] text-xs text-left">
                  <thead className="bg-stone-100 border-b border-stone-200 font-black text-stone-700 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">สินค้า / ไซส์</th>
                      <th className="p-3 text-center">เบิกไป</th>
                      <th className="p-3 text-center">ขายใน POS</th>
                      <th className="p-3 text-center bg-amber-50/70">ต้องเหลือคืน</th>
                      <th className="p-3 text-center bg-amber-100/80">นับได้จริง *</th>
                      <th className="p-3 text-center">ผลต่าง</th>
                      <th className="p-3 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white">
                    {reconcileItemsState.map((item) => {
                      const isBalanced = item.difference === 0;
                      const isMissing = item.difference < 0;
                      const isSurplus = item.difference > 0;

                      return (
                        <tr key={item.variantId} className="hover:bg-stone-50/60 transition">
                          <td className="p-3">
                            <div className="font-serif font-black text-stone-900">{item.productTitle}</div>
                            <div className="text-[10px] text-stone-500 font-mono">
                              ไซส์: {item.variantName} • SKU: {item.sku}
                            </div>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-stone-700">
                            {item.dispatchedQty}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-emerald-700">
                            {item.soldQty || 0}
                          </td>
                          <td className="p-3 text-center font-mono font-black text-amber-900 bg-amber-50/40">
                            {item.expectedReturnQty}
                          </td>
                          <td className="p-3 text-center bg-amber-100/40">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateItemActualQty(
                                    item.variantId,
                                    (item.actualReturnedQty || 0) - 1
                                  )
                                }
                                className="w-6 h-6 rounded bg-white border border-stone-300 font-bold hover:bg-stone-100"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={0}
                                value={item.actualReturnedQty ?? item.expectedReturnQty}
                                onChange={(e) =>
                                  handleUpdateItemActualQty(
                                    item.variantId,
                                    parseInt(e.target.value, 10) || 0
                                  )
                                }
                                className="w-14 text-center py-1 font-mono font-black text-xs border border-amber-400 rounded-lg bg-white"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateItemActualQty(
                                    item.variantId,
                                    (item.actualReturnedQty || 0) + 1
                                  )
                                }
                                className="w-6 h-6 rounded bg-amber-400 border border-amber-500 font-bold hover:bg-amber-300"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-center font-mono font-black">
                            {isBalanced && <span className="text-stone-400">0</span>}
                            {isMissing && (
                              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-300">
                                {item.difference}
                              </span>
                            )}
                            {isSurplus && (
                              <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                                +{item.difference}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {isBalanced && (
                              <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300">
                                ✓ ครบถ้วน
                              </span>
                            )}
                            {isMissing && (
                              <span className="text-[10px] font-black text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-300">
                                ⚠️ ของขาด {Math.abs(item.difference)}
                              </span>
                            )}
                            {isSurplus && (
                              <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300">
                                🟡 ของเกิน {item.difference}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reconciliation Footer Summary & Action */}
            {(() => {
              const totalDispatched = (reconcileItemsState || []).reduce((s, i) => s + (Number(i.dispatchedQty) || 0), 0);
              const totalSold = (reconcileItemsState || []).reduce((s, i) => s + (Number(i.soldQty) || 0), 0);
              const totalExpected = (reconcileItemsState || []).reduce((s, i) => s + (Number(i.expectedReturnQty) || 0), 0);
              const totalActual = (reconcileItemsState || []).reduce((s, i) => s + (Number(i.actualReturnedQty) || 0), 0);
              const netDiff = totalActual - totalExpected;

              return (
                <div className="border-t-2 border-stone-200 bg-stone-50 p-4 sm:p-5 shrink-0 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-stone-700">
                    <div className="flex items-center gap-3">
                      <span>เบิกไป: <strong>{totalDispatched}</strong></span>
                      <span>ขายได้: <strong className="text-emerald-700">{totalSold}</strong></span>
                      <span>ต้องคืน: <strong className="text-amber-800">{totalExpected}</strong></span>
                      <span>นับคืนจริง: <strong className="text-stone-900">{totalActual}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span>ผลต่างสุทธิ:</span>
                      {netDiff === 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                          🟢 ตรงครบพอดี (0)
                        </span>
                      ) : netDiff < 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-900 border border-rose-300">
                          🔴 ขาดหาย {Math.abs(netDiff)} ชิ้น
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                          🟡 เกินมา {netDiff} ชิ้น
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setReconcilingTransfer(null)}
                      className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      ปิดหน้าต่าง
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmReconciliation}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-md border-2 border-emerald-700 flex items-center gap-2 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>✅ ยืนยันรับของคืนเข้าสต๊อกกลาง (โอนคืนคลังใหญ่)</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. REPLENISH MODAL (เติมของเข้าบูธ / เบิกสินค้าเพิ่ม) */}
      {/* ======================================================== */}
      {replenishingTransfer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="relative bg-white border-2 border-blue-500 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col text-stone-950 shadow-2xl text-left overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-blue-300 p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black bg-stone-950 text-amber-300 px-2 py-0.5 rounded-md">
                      #{replenishingTransfer.id}
                    </span>
                    <span className="text-xs text-blue-100 font-bold">
                      เบิกเติมของรอบใหม่ (Replenish Stock)
                    </span>
                  </div>
                  <h3 className="font-serif font-black text-lg sm:text-xl text-white">
                    {replenishingTransfer.eventName} • {replenishingTransfer.branchName}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplenishingTransfer(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Status Overview Banner */}
            <div className="bg-blue-50/80 border-b border-blue-200 p-3 sm:px-5 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-4 text-xs font-bold text-stone-700">
                <div>
                  <span className="text-[10px] text-stone-500 block">เบิกไปก่อนหน้านี้</span>
                  <span className="font-mono text-sm font-black text-stone-900">
                    {replenishingTransfer.totalDispatchedQty} ชิ้น
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block">ขายไปแล้วใน POS</span>
                  <span className="font-mono text-sm font-black text-emerald-700">
                    {replenishingTransfer.totalSoldQty || 0} ชิ้น
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block">เหลืออยู่ที่บูธตอนนี้</span>
                  <span className="font-mono text-sm font-black text-blue-900">
                    {Math.max(
                      0,
                      replenishingTransfer.totalDispatchedQty - (replenishingTransfer.totalSoldQty || 0)
                    )}{' '}
                    ชิ้น
                  </span>
                </div>
              </div>

              {replenishingTransfer.replenishments && replenishingTransfer.replenishments.length > 0 && (
                <div className="text-[11px] font-bold text-blue-800 bg-white border border-blue-300 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    เคยเติมของไปแล้ว <strong>{replenishingTransfer.replenishments.length}</strong> รอบ (+
                    {replenishingTransfer.replenishments.reduce((s, r) => s + r.totalQtyAdded, 0)} ชิ้น)
                  </span>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmReplenish} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Form Row: Staff & Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">
                    ชื่อผู้เบิกเติมของ (เจ้าหน้าที่/พนักงาน)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ผู้ดูแลบูธ หรือ น.ส. ฮูดา"
                    value={replenishStaffName}
                    onChange={(e) => setReplenishStaffName(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-stone-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">
                    หมายเหตุการเติมของ (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น เติมรอบบ่าย 14:00 น. ไซส์ XL ขายดีหมดเกลี้ยง"
                    value={replenishNote}
                    onChange={(e) => setReplenishNote(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-stone-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 📸 QR & Barcode Scanning Bar for Replenishing */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-3 rounded-2xl border-2 border-blue-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsReplenishQRScannerOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md border border-blue-700 transition flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98 shrink-0"
                    title="เปิดกล้องสแกน QR Code บนป้ายสินค้าเพื่อเพิ่มยอดเติมเข้าบูธทันที"
                  >
                    <Camera className="w-4 h-4 text-white" />
                    <span>📸 เปิดกล้องสแกน QR สินค้า</span>
                  </button>
                  <span className="text-[11px] font-bold text-blue-950 hidden md:inline">
                    หรือใช้เครื่องยิงบาร์โค้ด 👉
                  </span>
                </div>

                <div className="relative flex-1 w-full sm:max-w-md">
                  <input
                    type="text"
                    placeholder="🔫 ยิงเครื่องสแกนบาร์โค้ด / ป้าย QR สินค้า..."
                    value={replenishBarcodeInput}
                    onChange={(e) => setReplenishBarcodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleReplenishBarcodeSubmit(e);
                      }
                    }}
                    className="w-full bg-white border-2 border-blue-300 rounded-xl py-2 pl-9 pr-3 text-xs text-stone-950 font-bold placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono shadow-2xs"
                  />
                  <Barcode className="w-4 h-4 text-blue-700 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* ⚡ Live Scanned Feed Tray (รายการที่เพิ่งยิงเรียงลงมาให้เห็นชัดเจน) */}
              {replenishScannedFeed.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                      <span className="font-serif font-black text-xs sm:text-sm text-blue-950">
                        ⚡ รายการสินค้าที่ยิง/เลือกเติมแล้ว ({replenishScannedFeed.length} รายการ / รวม{' '}
                        <strong className="text-blue-700 font-mono">
                          {replenishScannedFeed.reduce((sum, it) => sum + it.quantity, 0)}
                        </strong>{' '}
                        ชิ้น)
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded-full">
                      เรียงจากล่าสุดด้านบน
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1.5 divide-y divide-blue-100 pr-1">
                    {replenishScannedFeed.map((item, idx) => {
                      const isLatest = idx === 0;
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between gap-2 p-2 rounded-xl transition ${
                            isLatest
                              ? 'bg-white border-2 border-blue-400 shadow-xs'
                              : 'bg-white/80 border border-blue-200 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.image && (
                              <img
                                src={item.image}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                {isLatest && (
                                  <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.2 rounded shrink-0">
                                    ล่าสุด
                                  </span>
                                )}
                                <span className="font-serif font-black text-xs text-stone-900 truncate">
                                  {item.title}
                                </span>
                              </div>
                              <p className="text-[10px] text-stone-600 font-bold">
                                ไซส์: <span className="text-blue-900">{item.variantName}</span> • คลังใหญ่เหลือ:{' '}
                                <strong>{item.maxStock}</strong> ชิ้น
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleAdjustReplenishQty(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-black flex items-center justify-center transition cursor-pointer"
                              title="ลดยอด -1"
                            >
                              -
                            </button>
                            <span className="font-mono text-xs font-black text-blue-800 px-2 py-1 bg-blue-50 rounded-lg border border-blue-300 min-w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAdjustReplenishQty(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center transition cursor-pointer"
                              title="เพิ่มยอด +1"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplenishProductQuantities((prev) => {
                                  const next = { ...prev };
                                  delete next[item.id];
                                  return next;
                                });
                                soundFx.playDelete();
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer ml-1"
                              title="ลบรายการนี้ออก"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Search & List of Available Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="font-serif font-black text-base text-stone-900 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-700" />
                      <span>เลือกสินค้าจากสต๊อกคลังใหญ่เพื่อเติมเข้าบูธ</span>
                    </h4>
                    <p className="text-[11px] text-stone-500 font-bold">
                      ระบุจำนวนชิ้นที่ต้องการเติมเพิ่ม หรือกดเครื่องหมาย + / ยิงสแกน QR Code
                    </p>
                  </div>

                  <input
                    type="text"
                    placeholder="ค้นหาสินค้า / ไซส์..."
                    value={replenishSearchInModal}
                    onChange={(e) => setReplenishSearchInModal(e.target.value)}
                    className="text-xs font-bold px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl w-48"
                  />
                </div>

                {/* Product Variants List */}
                <div className="max-h-72 overflow-y-auto border border-stone-200 rounded-2xl divide-y divide-stone-100 bg-white">
                  {products
                    .filter((prod) => {
                      if (!replenishSearchInModal.trim()) return true;
                      const q = replenishSearchInModal.toLowerCase();
                      return (
                        prod.title.toLowerCase().includes(q) ||
                        prod.variants.some((v) => v.name.toLowerCase().includes(q))
                      );
                    })
                    .map((prod) => {
                      return (
                        <div key={prod.id} className="p-3 hover:bg-stone-50 transition space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-black text-sm text-stone-900">
                              {prod.title}
                            </span>
                            <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                              {prod.category}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {prod.variants.map((v) => {
                              const key = `${prod.id}_${v.id}`;
                              const selectedQty = replenishProductQuantities[key] || 0;
                              const availableInCentral = v.stockQuantity;

                              // Check how many currently already at booth
                              const existingItem = replenishingTransfer.items.find(
                                (it) => it.productId === prod.id && it.variantId === v.id
                              );
                              const alreadyAtBooth = existingItem
                                ? existingItem.dispatchedQty - (existingItem.soldQty || 0)
                                : 0;

                              return (
                                <div
                                  key={v.id}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                                    selectedQty > 0
                                      ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                                      : 'bg-stone-50/70 border-stone-200'
                                  }`}
                                >
                                  <div>
                                    <div className="font-black text-xs text-stone-800">{v.name}</div>
                                    <div className="text-[10px] text-stone-500 font-mono">
                                      คลังใหญ่มี: <strong>{availableInCentral}</strong> | ที่บูธมี:{' '}
                                      <strong>{alreadyAtBooth}</strong>
                                    </div>
                                    {existingItem && (
                                      <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 inline-block mt-0.5">
                                        มีในบูธนี้แล้ว
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={selectedQty <= 0}
                                      onClick={() => {
                                        setReplenishProductQuantities((prev) => {
                                          const next = { ...prev };
                                          const cur = next[key] || 0;
                                          if (cur <= 1) delete next[key];
                                          else next[key] = cur - 1;
                                          return next;
                                        });
                                      }}
                                      className="w-6 h-6 rounded-lg bg-stone-200 hover:bg-stone-300 disabled:opacity-40 font-bold text-xs flex items-center justify-center transition cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min={0}
                                      max={availableInCentral}
                                      value={selectedQty}
                                      onChange={(e) => {
                                        const val = Math.max(
                                          0,
                                          Math.min(availableInCentral, parseInt(e.target.value, 10) || 0)
                                        );
                                        setReplenishProductQuantities((prev) => {
                                          const next = { ...prev };
                                          if (val <= 0) delete next[key];
                                          else next[key] = val;
                                          return next;
                                        });
                                      }}
                                      className="w-12 text-center text-xs font-mono font-black border border-stone-300 rounded-lg py-1 bg-white"
                                    />
                                    <button
                                      type="button"
                                      disabled={selectedQty >= availableInCentral}
                                      onClick={() => {
                                        setReplenishProductQuantities((prev) => {
                                          const cur = prev[key] || 0;
                                          if (cur >= availableInCentral) return prev;
                                          return { ...prev, [key]: cur + 1 };
                                        });
                                      }}
                                      className="w-6 h-6 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 font-bold text-xs flex items-center justify-center transition cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Selected Replenishment Items Summary Tray */}
              {(() => {
                const totalSelectedQty = Object.values(replenishProductQuantities).reduce(
                  (sum, q) => sum + q,
                  0
                );
                return (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-blue-600" />
                        <span>สรุปรายการสินค้าที่จะเติมเข้าบูธ:</span>
                      </div>
                      <div className="text-xs font-bold text-stone-600 mt-0.5">
                        รวมทั้งหมด{' '}
                        <strong className="text-blue-700 text-sm font-mono">{totalSelectedQty}</strong> ชิ้น
                        (จะถูกตัดออกจากสต๊อกคลังใหญ่ และเพิ่มในบูธทันที)
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setReplenishingTransfer(null)}
                        className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        disabled={totalSelectedQty <= 0}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-black rounded-xl shadow-lg border-2 border-blue-700 flex items-center gap-2 transition cursor-pointer hover:scale-102 active:scale-98"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>✅ ยืนยันเติมของเข้าบูธ (+{totalSelectedQty} ชิ้น)</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. REPLENISHMENT HISTORY MODAL (ประวัติการเติมของเข้าบูธ) */}
      {/* ======================================================== */}
      {viewingHistoryTransfer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="relative bg-white border-2 border-blue-500 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col text-stone-950 shadow-2xl text-left overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-blue-300 p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-white" />
                <div>
                  <h3 className="font-serif font-black text-lg sm:text-xl text-white">
                    ประวัติการเติมของเข้าบูธ (Replenishment History)
                  </h3>
                  <p className="text-xs text-blue-100 font-bold">
                    {viewingHistoryTransfer.eventName} • {viewingHistoryTransfer.branchName} (#
                    {viewingHistoryTransfer.id})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingHistoryTransfer(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {(!viewingHistoryTransfer.replenishments ||
                viewingHistoryTransfer.replenishments.length === 0) ? (
                <div className="text-center py-10 text-stone-500">
                  <PackageCheck className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                  <p className="font-bold text-sm">ยังไม่มีประวัติการเติมของเพิ่มเติมสำหรับบูธนี้</p>
                  <p className="text-xs">
                    (สินค้าทั้งหมดที่เบิกไปเป็นยอดเบิกตั้งต้นตอนเปิดใบเบิก {viewingHistoryTransfer.totalDispatchedQty} ชิ้น)
                  </p>
                </div>
              ) : (
                viewingHistoryTransfer.replenishments.map((rep, idx) => (
                  <div
                    key={rep.id || idx}
                    className="bg-stone-50 border-2 border-blue-200 rounded-2xl p-4 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-blue-600 text-white px-2.5 py-0.5 rounded-lg shadow-2xs">
                          รอบเติมที่ #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-stone-700">
                          โดย: <strong>{rep.staffName}</strong>
                        </span>
                      </div>
                      <span className="text-xs font-bold text-stone-600">
                        {formatThaiDateTime(rep.timestamp)}
                      </span>
                    </div>

                    {rep.note && (
                      <p className="text-xs font-medium text-stone-600 bg-white border border-stone-200 p-2 rounded-xl italic">
                        📝 หมายเหตุ: "{rep.note}"
                      </p>
                    )}

                    <div className="border border-stone-200 rounded-xl overflow-x-auto bg-white">
                      <table className="w-full text-xs min-w-[340px]">
                        <thead className="bg-stone-100 font-bold text-stone-600 border-b">
                          <tr>
                            <th className="p-2 text-left">สินค้า</th>
                            <th className="p-2 text-left">ไซส์</th>
                            <th className="p-2 text-right">จำนวนที่เติม</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 font-mono">
                          {rep.items.map((it, itemIdx) => (
                            <tr key={itemIdx}>
                              <td className="p-2 font-sans font-bold text-stone-900">
                                {it.productTitle}
                              </td>
                              <td className="p-2 font-sans text-stone-700">{it.variantName}</td>
                              <td className="p-2 text-right font-black text-blue-700">
                                +{it.addedQty} ชิ้น
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-blue-50/70 border-t border-blue-200 font-bold">
                          <tr>
                            <td colSpan={2} className="p-2 text-right text-stone-700">
                              รวมเติมรอบนี้:
                            </td>
                            <td className="p-2 text-right text-sm font-mono font-black text-blue-900">
                              +{rep.totalQtyAdded} ชิ้น
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-stone-200 p-4 bg-stone-50 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingHistoryTransfer(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. PRINTABLE DELIVERY & RECONCILIATION SLIP */}
      {/* ======================================================== */}
      {printTransfer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="relative bg-white border-2 border-stone-800 rounded-3xl max-w-2xl w-full p-6 text-stone-950 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-serif font-black text-lg text-stone-900">
                  {storeSettings.storeName || 'HUDA ABAYA DUBAI'}
                </h3>
                <p className="text-xs text-stone-500">ใบเบิกและตรวจรับสินค้าออกบูธ (Booth Dispatch Slip)</p>
              </div>
              <button
                type="button"
                onClick={() => setPrintTransfer(null)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-1 font-mono">
              <p><strong>รหัสเอกสาร:</strong> #{printTransfer.id}</p>
              <p><strong>ชื่องาน:</strong> {printTransfer.eventName}</p>
              <p><strong>สาขา/บูธ:</strong> {printTransfer.branchName}</p>
              <p><strong>ผู้ดูแลบูธ:</strong> {printTransfer.staffName}</p>
              <p><strong>วันที่เบิก:</strong> {formatThaiDateOnly(printTransfer.dispatchDate)}</p>
              {printTransfer.returnDate && (
                <p><strong>วันที่ตรวจนับคืน:</strong> {formatThaiDateOnly(printTransfer.returnDate)}</p>
              )}
            </div>

            <div className="border border-stone-300 rounded-xl overflow-x-auto">
              <table className="w-full text-xs min-w-[420px]">
                <thead className="bg-stone-100 font-bold border-b">
                  <tr>
                    <th className="p-2 text-left">รายการสินค้า</th>
                    <th className="p-2 text-center">เบิกไป</th>
                    <th className="p-2 text-center">ขายได้</th>
                    <th className="p-2 text-center">นับคืน</th>
                    <th className="p-2 text-center">ผลต่าง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-mono">
                  {printTransfer.items.map((it) => (
                    <tr key={it.variantId}>
                      <td className="p-2">
                        {it.productTitle} ({it.variantName})
                      </td>
                      <td className="p-2 text-center">{it.dispatchedQty}</td>
                      <td className="p-2 text-center">{it.soldQty || 0}</td>
                      <td className="p-2 text-center">{it.actualReturnedQty || '-'}</td>
                      <td className="p-2 text-center">
                        {it.difference !== undefined ? it.difference : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4 border-t text-xs">
              <div className="text-center w-36 border-t border-stone-400 pt-2 text-[10px]">
                ลงชื่อผู้เบิกสินค้า
              </div>
              <div className="text-center w-36 border-t border-stone-400 pt-2 text-[10px]">
                ลงชื่อผู้ตรวจรับคืนสต๊อก
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-950 text-amber-300 text-xs font-black rounded-xl hover:bg-stone-800 transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์เอกสารนี้</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* QR Scanner Modal for Dispatching */}
      <QRScannerModal
        isOpen={isDispatchQRScannerOpen}
        onClose={() => setIsDispatchQRScannerOpen(false)}
        onScan={handleDispatchQRScan}
        title="⚡ สแกน QR Code เบิกสินค้าออกบูธ (ยิงรัวต่อเนื่อง)"
        subtitle="นำกล้องส่องไปที่ป้าย QR ของสินค้าเพื่อเพิ่มจำนวนที่ต้องการเบิก (ระบบขึ้นรายการเรียงลงมาด้านล่างอัตโนมัติ)"
        continuous={true}
        scannedFeed={dispatchScannedFeed}
        onAdjustQuantity={handleAdjustDispatchQty}
        onDeleteItem={(key) => {
          setSelectedProductQuantities((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
          soundFx.playDelete();
        }}
      />

      {/* QR Scanner Modal for Reconciliation */}
      <QRScannerModal
        isOpen={isReconcileQRScannerOpen}
        onClose={() => setIsReconcileQRScannerOpen(false)}
        onScan={handleReconcileQRScan}
        title="⚡ สแกน QR Code ตรวจนับของคืนเข้าสต๊อก (ยิงรัวต่อเนื่อง)"
        subtitle="นำกล้องส่องไปที่ป้าย QR ของสินค้าที่ขนกลับมาเพื่อนับแต้มคืนเข้าคลังทีละชิ้น"
        continuous={true}
        scannedFeed={reconcileScannedFeed}
        onAdjustQuantity={(varId, delta) => {
          const cur = reconcileItemsState.find((i) => i.variantId === varId)?.actualReturnedQty || 0;
          handleUpdateItemActualQty(varId, Math.max(0, cur + delta));
        }}
      />

      {/* QR Scanner Modal for Replenishing */}
      <QRScannerModal
        isOpen={isReplenishQRScannerOpen}
        onClose={() => setIsReplenishQRScannerOpen(false)}
        onScan={handleReplenishQRScan}
        title="⚡ สแกน QR Code เติมสินค้าเข้าบูธ (ยิงรัวต่อเนื่อง)"
        subtitle="นำกล้องส่องไปที่ป้าย QR ของสินค้าเพื่อเพิ่มจำนวนที่ต้องการเบิกเติมเข้าบูธนี้ (ระบบขึ้นรายการเรียงลงมาด้านล่างอัตโนมัติ)"
        continuous={true}
        scannedFeed={replenishScannedFeed}
        onAdjustQuantity={handleAdjustReplenishQty}
        onDeleteItem={(key) => {
          setReplenishProductQuantities((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
          soundFx.playDelete();
        }}
      />
    </div>
  );
};
