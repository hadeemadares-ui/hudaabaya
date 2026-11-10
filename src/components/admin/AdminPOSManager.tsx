'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, Plus, Minus, Trash2, QrCode, CreditCard, Banknote, Printer, CheckCircle, Sparkles, Layers, RotateCcw, Box, User, Phone, DollarSign, Receipt, Check, ZoomIn, Eye, Maximize2, X, Upload, Camera, Image as ImageIcon, Tag, ShieldCheck, CheckCheck, Droplets } from 'lucide-react';
import QRCode from 'qrcode';
import { useShop } from '../../context/ShopContext';
import { Product, ProductVariant, CartItem, Order, StaffUser, SlipVerificationData } from '../../types';
import { DEFAULT_LOGO_BASE64 } from '../../data/logoData';
import { sortProductsNatural } from '../../utils/productUtils';
import { ColorIndicator, getEffectiveVariantColor } from '../../utils/colorUtils';
import { QRScannerModal } from '../common/QRScannerModal';
import { resolveScannedProduct, isMatchingLot } from '../../utils/qrUtils';
import { generatePromptPayPayload } from '../../utils/promptpayUtils';
import { soundFx } from '../../lib/soundEffects';
import { verifySlipData } from '../../lib/slipVerification';
import { POSRefundExchangeModal } from './POSRefundExchangeModal';
import { LotSearchModal } from './LotSearchModal';
import { ProductQRLabelModal } from './ProductQRLabelModal';
import { PerfumeDecantLabelModal } from './PerfumeDecantLabelModal';
import { formatThaiDateTime } from '../../utils/dateUtils';

interface AdminPOSManagerProps {
  initialBoothTransferId?: string | null;
  onNavigateTab?: (tab: string) => void;
}

function normalizeToCE(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    let y = parseInt(parts[0], 10);
    if (y > 2400) y -= 543;
    return `${y}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }
  return dateStr;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const AdminPOSManager: React.FC<AdminPOSManagerProps> = ({ initialBoothTransferId, onNavigateTab }) => {
  const {
    products,
    createOrder,
    formatPrice,
    storeSettings,
    cancelAndRestockOrder,
    boothTransfers,
    currentStaff,
    staffUsers,
    setCurrentStaff,
    forceRealtimeSync,
    syncStatus,
    eventSchedules,
    updateEventSchedule,
    stockMovements,
  } = useShop();

  const [selectedBoothTransferId, setSelectedBoothTransferId] = useState<string | null>(initialBoothTransferId || null);
  const [isRefundExchangeModalOpen, setIsRefundExchangeModalOpen] = useState(false);
  const [isLotSearchModalOpen, setIsLotSearchModalOpen] = useState(false);
  const [posReprintProduct, setPosReprintProduct] = useState<Product | null>(null);
  const [posReprintLot, setPosReprintLot] = useState<string | undefined>(undefined);
  const [isSwitchCashierModalOpen, setIsSwitchCashierModalOpen] = useState(false);
  const [selectedStaffToSwitch, setSelectedStaffToSwitch] = useState<StaffUser | null>(null);
  const [switchStaffPinInput, setSwitchStaffPinInput] = useState('');
  const [switchStaffError, setSwitchStaffError] = useState('');

  useEffect(() => {
    forceRealtimeSync(false, false).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialBoothTransferId !== undefined) {
      setSelectedBoothTransferId(initialBoothTransferId);
    }
  }, [initialBoothTransferId]);

  const activeBoothTransfers = React.useMemo(
    () => boothTransfers.filter((bt) => bt.status !== 'COMPLETED'),
    [boothTransfers]
  );

  const todayStr = React.useMemo(() => {
    return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Bangkok' }).format(new Date());
  }, []);

  const activeEventSellingPoints = React.useMemo(() => {
    if (!Array.isArray(eventSchedules)) return [];
    return eventSchedules.filter((ev) => {
      // Must not be completed, cancelled or transferred
      if (ev.status === 'COMPLETED' || ev.status === 'TRANSFERRED' || ev.status === 'CANCELLED') return false;
      // Must cover today or be currently active
      const sStart = normalizeToCE(ev.startDate);
      const sEnd = normalizeToCE(ev.endDate);
      if (ev.status !== 'ACTIVE' && (sStart > todayStr || sEnd < todayStr)) return false;
      // If already handled by a dedicated booth stock transfer, avoid duplicate
      const hasBoothTransfer = boothTransfers.some(
        (bt) => (bt.eventId === ev.id || bt.eventName === ev.title) && bt.status !== 'COMPLETED'
      );
      return !hasBoothTransfer;
    });
  }, [eventSchedules, boothTransfers, todayStr]);

  const selectedEventSchedule = React.useMemo(() => {
    if (!selectedBoothTransferId) return null;
    if (selectedBoothTransferId.startsWith('EVENT_')) {
      const targetId = selectedBoothTransferId.replace('EVENT_', '');
      return eventSchedules?.find((ev) => ev.id === targetId) || null;
    }
    return eventSchedules?.find((ev) => ev.id === selectedBoothTransferId) || null;
  }, [selectedBoothTransferId, eventSchedules]);

  const selectedBoothTransfer = React.useMemo(
    () => boothTransfers.find((bt) => bt.id === selectedBoothTransferId),
    [boothTransfers, selectedBoothTransferId]
  );

  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [isPerfumeLabelModalOpen, setIsPerfumeLabelModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'promptpay' | 'credit_card' | 'gov_copay'>('cash');
  const [govRatio, setGovRatio] = useState<'60_40' | '50_50' | '70_30' | 'custom'>('60_40');
  const [customGovPercent, setCustomGovPercent] = useState<number>(60);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('ลูกค้าหน้าร้าน (Walk-in Customer)');
  const [customerPhone, setCustomerPhone] = useState<string>('000-000-0000');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [completedPOSOrder, setCompletedPOSOrder] = useState<Order | null>(null);
  const [receiptCopies, setReceiptCopies] = useState<number>(2);
  const [receiptPaperWidth, setReceiptPaperWidth] = useState<'58mm' | '80mm'>('58mm');

  // QR Code Scanner State & Toast
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [scanToast, setScanToast] = useState<string | null>(null);
  const [isZoomQRModalOpen, setIsZoomQRModalOpen] = useState<boolean>(false);

  // POS Slip / Payment Proof Image Attachment State
  const [posSlipImage, setPosSlipImage] = useState<string>('');
  const [previewSlipModalUrl, setPreviewSlipModalUrl] = useState<string | null>(null);
  const slipFileInputRef = useRef<HTMLInputElement>(null);
  const slipCameraInputRef = useRef<HTMLInputElement>(null);

  // Slip Auto-Verification State
  const [isSlipScannerOpen, setIsSlipScannerOpen] = useState<boolean>(false);
  const [isVerifyingSlip, setIsVerifyingSlip] = useState<boolean>(false);
  const [slipVerifiedData, setSlipVerifiedData] = useState<SlipVerificationData | null>(null);
  const [slipVerifyError, setSlipVerifyError] = useState<string | null>(null);

  // Client-side image compression for POS slip
  const handleSlipFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 12 * 1024 * 1024) {
        alert('ไฟล์รูปภาพมีขนาดใหญ่เกิน 12MB กรุณาเลือกไฟล์ที่มีขนาดเล็กลงค่ะ');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawBase64 = event.target?.result as string;
        const img = new Image();
        img.src = rawBase64;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setPosSlipImage(compressed);

          // Automatic slip verification if enabled
          if (storeSettings.slipVerifyEnabled !== false) {
            setIsVerifyingSlip(true);
            setSlipVerifyError(null);
            const targetAmt = paymentMethod === 'gov_copay' ? customerPayAmount : netAmount;
            verifySlipData({
              imageBase64: compressed,
              expectedAmount: targetAmt,
              settings: storeSettings,
            })
              .then((res) => {
                if (res.success) {
                  soundFx.playSuccess();
                  setSlipVerifiedData(res);
                  setSlipVerifyError(null);
                } else if (res.message) {
                  soundFx.playError();
                  setSlipVerifyError(res.message);
                }
              })
              .catch((err) => {
                console.warn('Auto slip verify error:', err);
              })
              .finally(() => {
                setIsVerifyingSlip(false);
              });
          }
        };
        img.onerror = () => {
          setPosSlipImage(rawBase64);
        };
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Full Image View Modal State
  const [previewImageProduct, setPreviewImageProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Derived products taking into account whether a specific Booth is active:
  const posAvailableProducts = React.useMemo(() => {
    if (!selectedBoothTransfer) {
      return products;
    }

    return products
      .map((p) => {
        const hasItem = selectedBoothTransfer.items.some((i) => i.productId === p.id);
        if (!hasItem) return null;

        const updatedVariants = p.variants.map((v) => {
          const matchItem = selectedBoothTransfer.items.find(
            (i) => i.productId === p.id && i.variantId === v.id
          );
          const boothQty = matchItem
            ? Math.max(0, matchItem.dispatchedQty - (matchItem.soldQty || 0))
            : 0;
          return {
            ...v,
            stockQuantity: boothQty,
          };
        });

        return { ...p, variants: updatedVariants };
      })
      .filter((p): p is Product => p !== null);
  }, [products, selectedBoothTransfer]);

  // Filter products for POS (Supports Title, SKU, Barcode, and Lot Number e.g. 1-69)
  const filteredProducts = React.useMemo(() => {
    return posAvailableProducts
      .filter((p) => {
        const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
        if (!searchQuery) return matchCat;

        const q = searchQuery.toLowerCase().trim();

        // 1. Title or Arabic Title
        const matchesTitle =
          p.title.toLowerCase().includes(q) ||
          (p.arabicTitle && p.arabicTitle.toLowerCase().includes(q));

        // 2. Description
        const matchesDesc = p.description && p.description.toLowerCase().includes(q);

        // 3. Variant Name or SKU
        const matchesVariant = p.variants.some(
          (v) =>
            v.name.toLowerCase().includes(q) ||
            (v.sku && v.sku.toLowerCase().includes(q))
        );

        // 4. Matches QR / SKU resolver (e.g. HUDA-A005-1-69 or HUDA-A005)
        const qrMatch = resolveScannedProduct(searchQuery, [p]);

        // 5. Matches Lot Number in Stock Movements history (e.g. 1-69, 2-69, or HUDA-A005-1-69)
        const matchesLot =
          Array.isArray(stockMovements) &&
          stockMovements.some(
            (m) =>
              m.productId === p.id &&
              m.lotNumber &&
              (m.lotNumber.toLowerCase().includes(q) || q.includes(m.lotNumber.toLowerCase()))
          );

        return matchCat && (matchesTitle || matchesDesc || matchesVariant || Boolean(qrMatch) || matchesLot);
      })
      .sort(sortProductsNatural);
  }, [posAvailableProducts, selectedCategory, searchQuery, stockMovements]);

  // Calculate Subtotal & Totals
  const subtotal = posCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const netAmount = Math.max(0, subtotal - discountInput);
  const cashNum = Number(cashReceived) || 0;
  const changeAmount = Math.max(0, cashNum - netAmount);

  // Government Co-payment Calculations (Supports 60/40, 50/50, 70/30, Custom)
  const getGovPercent = () => {
    if (govRatio === '60_40') return 60;
    if (govRatio === '50_50') return 50;
    if (govRatio === '70_30') return 70;
    return Math.min(100, Math.max(0, customGovPercent));
  };
  const govPercent = getGovPercent();
  const customerPercent = 100 - govPercent;
  const govAmount = Math.round((netAmount * govPercent) / 100);
  const customerPayAmount = Math.max(0, netAmount - govAmount);

  // Generate PromptPay QR for POS (Supports regular PromptPay & Government Customer Share)
  useEffect(() => {
    const payAmt = paymentMethod === 'gov_copay' ? customerPayAmount : netAmount;
    if ((paymentMethod === 'promptpay' || paymentMethod === 'gov_copay') && payAmt > 0) {
      const cleanPhone = (storeSettings.promptPayNumber || '0812345678').replace(/[^0-9]/g, '');
      const payload = generatePromptPayPayload(cleanPhone, payAmt);
      if (payload) {
        QRCode.toDataURL(payload, { width: 260, margin: 1 })
          .then((url) => setQrCodeUrl(url))
          .catch((err) => console.error(err));
      }
    }
  }, [paymentMethod, netAmount, customerPayAmount, storeSettings.promptPayNumber]);

  const handleAddToCart = (product: Product, variant: ProductVariant, lotNumber?: string) => {
    if (variant.stockQuantity <= 0) {
      alert(`ขออภัยค่ะ สินค้าไซส์ ${variant.name} สต๊อกหมดแล้ว`);
      return;
    }

    setPosCart((prev) => {
      const idx = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          item.variantId === variant.id &&
          (lotNumber ? isMatchingLot(item.lotNumber, lotNumber) || item.lotNumber === lotNumber : !item.lotNumber)
      );
      if (idx > -1) {
        const updated = [...prev];
        if (updated[idx].quantity + 1 > variant.stockQuantity) {
          alert(`ขออภัยค่ะ สต๊อกไซส์ ${variant.name} มีเหลือเพียง ${variant.stockQuantity} ชิ้น`);
          return prev;
        }
        updated[idx].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            productTitle: product.title,
            productImage: product.images[0],
            variantId: variant.id,
            variantName: variant.name,
            price: variant.price,
            costPrice: variant.costPrice,
            quantity: 1,
            category: product.category,
            fabric: product.fabric,
            lotNumber: lotNumber || undefined,
          },
        ];
      }
    });
  };

  // Barcode & QR Code Scan Handler for POS
  const handleQRScan = (decodedText: string) => {
    const match = resolveScannedProduct(decodedText, posAvailableProducts);
    if (match) {
      if (match.variant.stockQuantity <= 0) {
        soundFx.playScanError();
        const msg = `ขออภัย สินค้า "${match.product.title} (${match.variant.name})" หมดสต๊อกแล้ว`;
        setScanToast(`❌ ${msg}`);
        setTimeout(() => setScanToast(null), 3000);
        return { success: false, message: `หมดสต๊อก: ${match.product.title}` };
      }
      handleAddToCart(match.product, match.variant, match.lotNumber);
      soundFx.playScanSuccess();
      const lotInfo = match.lotNumber ? ` [ล็อต: ${match.lotNumber}]` : '';
      setScanToast(`✓ สแกนสำเร็จ: เพิ่ม "${match.product.title} (${match.variant.name})"${lotInfo} ลงตะกร้าแล้ว!`);
      setTimeout(() => setScanToast(null), 3000);
      return { success: true, message: `${match.product.title} +1` };
    } else {
      soundFx.playScanError();
      const msg = `ไม่พบข้อมูลสินค้าที่ตรงกับรหัส "${decodedText}"`;
      setScanToast(`⚠️ ${msg}`);
      setTimeout(() => setScanToast(null), 3000);
      return { success: false, message: `ไม่พบสินค้า "${decodedText}"` };
    }
  };

  // Live Scanned Feed for POS QR Scanner Modal (Latest scanned item at top)
  const posScannedFeed = React.useMemo(() => {
    return [...posCart].reverse().map((item) => {
      const prod = posAvailableProducts.find((p) => p.id === item.productId);
      const variant = prod?.variants.find((v) => v.id === item.variantId);
      return {
        id: `${item.productId}__${item.variantId}__${item.lotNumber || ''}`,
        title: item.productTitle,
        variantName: `${item.variantName}${item.lotNumber ? ` [ล็อต: ${item.lotNumber}]` : ''}`,
        sku: item.lotNumber ? `ล็อต: ${item.lotNumber}` : undefined,
        image: item.productImage,
        quantity: item.quantity,
        price: item.price,
        maxStock: variant ? variant.stockQuantity : undefined,
      };
    });
  }, [posCart, posAvailableProducts]);

  const handleAdjustFeedQty = (feedId: string, delta: number) => {
    const [productId, variantId, lotNumber] = feedId.split('__');
    const targetProduct = posAvailableProducts.find((p) => p.id === productId);
    const targetVariant = targetProduct?.variants.find((v) => v.id === variantId);
    const maxStock = targetVariant ? targetVariant.stockQuantity : Infinity;

    setPosCart((prev) => {
      return prev
        .map((item) => {
          const matchLot = lotNumber ? item.lotNumber === lotNumber : !item.lotNumber;
          if (item.productId === productId && item.variantId === variantId && matchLot) {
            const newQty = item.quantity + delta;
            if (newQty > maxStock) {
              alert(`ขออภัยค่ะ สินค้า "${item.productTitle} (${item.variantName})" มีสต๊อกคงเหลือเพียง ${maxStock} ชิ้น`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((i): i is CartItem => i !== null);
    });
  };

  const handleDeleteFeedItem = (feedId: string) => {
    const [productId, variantId, lotNumber] = feedId.split('__');
    setPosCart((prev) =>
      prev.filter((item) => {
        const matchLot = lotNumber ? item.lotNumber === lotNumber : !item.lotNumber;
        return !(item.productId === productId && item.variantId === variantId && matchLot);
      })
    );
  };

  // Quick Card Click: Add first available size
  const handleQuickAddCard = (product: Product) => {
    const availableVariant = product.variants.find((v) => v.stockQuantity > 0);
    if (!availableVariant) {
      alert(`ขออภัยค่ะ สินค้าแบบ "${product.title}" สต๊อกหมดทุกไซส์แล้ว`);
      return;
    }
    handleAddToCart(product, availableVariant);
  };

  const handleUpdateQty = (variantId: string, qty: number, itemIndex?: number) => {
    if (itemIndex !== undefined) {
      if (qty <= 0) {
        setPosCart((prev) => prev.filter((_, idx) => idx !== itemIndex));
        return;
      }
      setPosCart((prev) => prev.map((item, idx) => (idx === itemIndex ? { ...item, quantity: qty } : item)));
      return;
    }
    if (qty <= 0) {
      setPosCart((prev) => prev.filter((item) => item.variantId !== variantId));
      return;
    }
    setPosCart((prev) => prev.map((item) => (item.variantId === variantId ? { ...item, quantity: qty } : item)));
  };

  const handleQuickCashPreset = (amount: number) => {
    setCashReceived(amount.toString());
  };

  const handleCheckoutPOS = () => {
    if (posCart.length === 0) {
      alert('กรุณาเลือกรายการสินค้าเข้าแคชเชียร์ก่อนชำระเงินค่ะ');
      return;
    }

    if (paymentMethod === 'cash' && cashNum < netAmount) {
      alert(`ยอดเงินสดที่รับมา (฿${cashNum.toLocaleString()}) น้อยกว่ายอดรวมที่ต้องชำระ (฿${netAmount.toLocaleString()})`);
      return;
    }

    let pm: Order['paymentMethod'] = 'promptpay';
    if (paymentMethod === 'cash') pm = 'cod';
    if (paymentMethod === 'credit_card') pm = 'credit_card';
    if (paymentMethod === 'gov_copay') pm = 'promptpay';

    const staffSuffix = currentStaff ? ` | แคชเชียร์: ${currentStaff.name}` : '';
    let orderAddress = 'ชำระและรับสินค้าหน้าร้าน (Walk-in Store POS)';
    let orderBranch = 'คลังหลัก / หน้าร้านกลาง';
    let orderBoothId: string | undefined = undefined;

    if (selectedBoothTransfer) {
      orderAddress = `ชำระและรับสินค้าที่ ${selectedBoothTransfer.eventName} (${selectedBoothTransfer.branchName})`;
      orderBranch = selectedBoothTransfer.branchName;
      orderBoothId = selectedBoothTransfer.id;
    } else if (selectedEventSchedule) {
      orderAddress = `ชำระและรับสินค้าที่ ${selectedEventSchedule.title} (${selectedEventSchedule.branchName})`;
      orderBranch = selectedEventSchedule.branchName;
    }

    let orderNote = `ออเดอร์หน้าร้าน POS | วิธีชำระ: ${paymentMethod} | รับเงิน: ฿${cashNum} | เงินทอน: ฿${changeAmount}${staffSuffix}`;
    if (paymentMethod === 'gov_copay') {
      orderNote = `ออเดอร์หน้าร้าน POS | โครงการรัฐบาล (${govPercent}%/ลูกค้า ${customerPercent}%) | รัฐจ่าย: ฿${govAmount.toLocaleString()} | ลูกค้าจ่าย: ฿${customerPayAmount.toLocaleString()}${staffSuffix}`;
    } else if (selectedEventSchedule) {
      orderNote = `ออเดอร์หน้าร้าน POS [${selectedEventSchedule.title}] | วิธีชำระ: ${paymentMethod} | รับเงิน: ฿${cashNum} | เงินทอน: ฿${changeAmount}${staffSuffix}`;
    }

    const order = createOrder({
      customerName: customerName.trim() || 'ลูกค้าหน้าร้าน (Walk-in)',
      customerPhone: customerPhone.trim() || '000-000-0000',
      customerAddress: orderAddress,
      province: 'กรุงเทพมหานคร',
      district: 'วัฒนา',
      subDistrict: 'สุขุมวิท',
      postalCode: '10110',
      note: orderNote,
      items: posCart,
      totalAmount: subtotal,
      discountAmount: discountInput,
      shippingFee: 0,
      netAmount,
      paymentMethod: pm,
      paymentStatus: 'paid',
      slipImage: posSlipImage || undefined,
      orderStatus: 'delivered',
      boothTransferId: orderBoothId,
      branchName: orderBranch,
    });

    if (selectedEventSchedule && updateEventSchedule) {
      updateEventSchedule({
        ...selectedEventSchedule,
        actualSales: (selectedEventSchedule.actualSales || 0) + netAmount,
      });
    }

    setCompletedPOSOrder(order);
  };

  const buildReceiptSlipHtml = (order: Order, copyType: 'customer' | 'staff', paperSize: '58mm' | '80mm' = receiptPaperWidth) => {
    const isCustomer = copyType === 'customer';
    const is58 = paperSize === '58mm';
    const copyLabel = isCustomer
      ? '*** สำหรับลูกค้า (Customer Copy) ***'
      : '*** สำหรับร้านค้า / พนักงานเก็บ (Staff Copy) ***';

    const itemsHtml = (order.items || [])
      .map(
        (item) => `
        <div style="display: flex; justify-content: space-between; font-size: ${is58 ? '9.5px' : '11px'}; margin-bottom: 3px; line-height: 1.35;">
          <span style="padding-right: 4px; word-break: break-word;">
            ${escapeHtml(item.productTitle)} (${escapeHtml(item.variantName)})
            ${item.lotNumber ? `<span style="font-size: 8px; opacity: 0.85;"> [ล็อต: ${escapeHtml(item.lotNumber)}]</span>` : ''}
            x${item.quantity}
          </span>
          <span style="font-weight: bold; white-space: nowrap;">฿${(item.price * item.quantity).toLocaleString()}</span>
        </div>
      `
      )
      .join('');

    const logoHtml = storeSettings.logoImageUrl
      ? `<img src="${storeSettings.logoImageUrl}" alt="Logo" style="width: ${is58 ? '36px' : '44px'}; height: ${is58 ? '36px' : '44px'}; border-radius: 50%; margin: 0 auto 4px auto; display: block; object-fit: cover; border: 1px solid #000;" />`
      : '';

    const dateStr = formatThaiDateTime(order.createdAt);

    const sellingPointTitle = selectedBoothTransfer
      ? `บูธ: ${selectedBoothTransfer.eventName}`
      : selectedEventSchedule
      ? `บูธ: ${selectedEventSchedule.title}`
      : 'หน้าร้าน / คลังหลัก';

    return `
      <div class="receipt-single-copy" style="padding: 2px 0; font-family: monospace, system-ui, sans-serif; font-size: ${is58 ? '10px' : '11px'}; color: #000; width: 100%;">
        <div style="text-align: center; border-bottom: 1px dashed #444; padding-bottom: 5px; margin-bottom: 5px;">
          ${logoHtml}
          <div style="font-weight: bold; font-size: ${is58 ? '11.5px' : '13px'}; letter-spacing: 0.3px; text-transform: uppercase;">${escapeHtml(storeSettings.storeName)}</div>
          <div style="font-size: 8.5px; color: #333;">${escapeHtml(storeSettings.storeTagline || '')}</div>
          <div style="font-size: 8.5px; color: #333;">โทร: ${escapeHtml(storeSettings.contactPhone || '')} | LINE: ${escapeHtml(storeSettings.contactLine || '')}</div>
        </div>

        <div style="text-align: center; font-weight: bold; font-size: ${is58 ? '9.5px' : '11px'}; padding: 2px 0; background: #eee; margin-bottom: 5px; border: 1px solid #777; border-radius: 4px;">
          ${copyLabel}
        </div>

        <div style="display: flex; justify-content: space-between; font-size: ${is58 ? '9px' : '10px'}; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin-bottom: 5px; font-weight: bold;">
          <span>ใบเสร็จรับเงินอย่างย่อ POS</span>
          <span>#${escapeHtml(order.id)}</span>
        </div>

        <div style="font-size: ${is58 ? '9px' : '10px'}; color: #444; margin-bottom: 5px; line-height: 1.35;">
          <div>วันที่: ${dateStr}</div>
          <div>จุดขาย: ${escapeHtml(sellingPointTitle)}</div>
          ${currentStaff ? `<div>พนักงานขาย: ${escapeHtml(currentStaff.name)}</div>` : ''}
          ${order.customerName && order.customerName !== 'ลูกค้าหน้าร้าน (Walk-in Customer)' ? `<div>ลูกค้า: ${escapeHtml(order.customerName)}</div>` : ''}
        </div>

        <div style="border-bottom: 1px dashed #444; padding-bottom: 5px; margin-bottom: 5px;">
          ${itemsHtml}
        </div>

        <div style="font-size: ${is58 ? '10px' : '11px'}; margin-bottom: 5px; line-height: 1.35;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span>ยอดรวม:</span>
            <span>฿${order.totalAmount.toLocaleString()}</span>
          </div>
          ${
            order.discountAmount > 0
              ? `
            <div style="display: flex; justify-content: space-between; color: #c00; font-weight: bold; margin-bottom: 2px;">
              <span>ส่วนลด:</span>
              <span>-฿${order.discountAmount.toLocaleString()}</span>
            </div>
          `
              : ''
          }
          <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: ${is58 ? '11.5px' : '13px'}; border-top: 1px solid #000; padding-top: 3px; margin-top: 2px;">
            <span>ยอดชำระสุทธิ:</span>
            <span>฿${order.netAmount.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: ${is58 ? '9px' : '10px'}; color: #333; margin-top: 3px;">
            <span>ชำระโดย: ${order.paymentMethod === 'cod' ? 'เงินสด (Cash)' : escapeHtml(order.paymentMethod)}</span>
            ${order.note ? `<span>${escapeHtml(order.note)}</span>` : ''}
          </div>
        </div>

        <div style="text-align: center; border-top: 1px dashed #444; padding-top: 5px; margin-top: 5px; font-size: 9px; color: #444; line-height: 1.3;">
          ${
            isCustomer
              ? '<p>ขอบคุณที่อุดหนุน HUDA ABAYA DUBAI</p><p>ยินดีให้บริการในโอกาสถัดไปค่ะ 🤍</p>'
              : '<p>*** สำเนาสำหรับร้านค้า / แคชเชียร์เก็บเข้าแฟ้ม ***</p><p>ใช้สำหรับตรวจนับยอดเงินและปิดกะ</p>'
          }
        </div>
      </div>
    `;
  };

  const handlePrintPOSReceipt = () => {
    if (!completedPOSOrder) return;

    const oldIframe = document.getElementById('huda-pos-receipt-iframe');
    if (oldIframe) oldIframe.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'huda-pos-receipt-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const is58 = receiptPaperWidth === '58mm';
    const contentHtml = receiptCopies === 2
      ? `
        ${buildReceiptSlipHtml(completedPOSOrder, 'customer', receiptPaperWidth)}
        <div style="page-break-after: always; break-after: page; text-align: center; margin: 12px 0; border-top: 1px dashed #444; padding-top: 6px; font-size: 9px; font-family: monospace;">
          - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -<br/>
          ✂️ ตัด / ฉีกตรงนี้ (Tear Here)<br/>
          - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        </div>
        ${buildReceiptSlipHtml(completedPOSOrder, 'staff', receiptPaperWidth)}
      `
      : buildReceiptSlipHtml(completedPOSOrder, 'customer', receiptPaperWidth);

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title></title>
          <style>
            @page {
              size: ${is58 ? '58mm auto' : '80mm auto'};
              margin: 0mm !important;
            }
            @media print {
              @page {
                size: ${is58 ? '58mm auto' : '80mm auto'};
                margin: 0mm !important;
              }
              .page-break {
                page-break-after: always;
                break-after: page;
              }
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: monospace, system-ui, -apple-system, sans-serif;
              color: #000;
              background: #fff;
              width: ${is58 ? '48mm' : '74mm'};
              margin: 0 auto;
              padding: 1.5mm 0;
            }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${contentHtml}
        </body>
      </html>
    `);
    doc.close();
    try {
      doc.title = '';
      if (iframe.contentWindow?.document) {
        iframe.contentWindow.document.title = '';
      }
    } catch (e) {}

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        iframe.remove();
      }, 3000);
    }, 250);
  };

  const handleResetPOS = () => {
    setPosCart([]);
    setDiscountInput(0);
    setCashReceived('');
    setPosSlipImage('');
    setCompletedPOSOrder(null);
    setReceiptCopies(2);
    setSlipVerifiedData(null);
    setSlipVerifyError(null);
    setIsSlipScannerOpen(false);
  };

  const handleScanSlipQR = async (decodedText: string) => {
    setIsVerifyingSlip(true);
    setSlipVerifyError(null);
    const targetAmt = paymentMethod === 'gov_copay' ? customerPayAmount : netAmount;
    try {
      const res = await verifySlipData({
        payload: decodedText,
        expectedAmount: targetAmt,
        settings: storeSettings,
      });

      if (res.success) {
        soundFx.playSuccess();
        setSlipVerifiedData(res);
        setSlipVerifyError(null);
        setIsSlipScannerOpen(false);
        return { success: true, message: res.message };
      } else {
        soundFx.playError();
        setSlipVerifyError(res.message);
        return { success: false, message: res.message };
      }
    } catch (err: any) {
      soundFx.playError();
      const errMsg = `เกิดข้อผิดพลาดในการตรวจสอบ: ${err?.message || 'โปรดลองใหม่อีกครั้ง'}`;
      setSlipVerifyError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsVerifyingSlip(false);
    }
  };

  const openFullImageModal = (product: Product) => {
    setPreviewImageProduct(product);
    setActiveImageIndex(0);
  };

  return (
    <div className="space-y-4 text-xs text-stone-950">
      {/* Toast Notification for QR / Barcode Scan */}
      {scanToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl font-black text-xs flex items-center gap-2 border-2 border-emerald-400 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-200" />
          <span>{scanToast}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-amber-400/60 shadow-xl text-stone-950">
        <div>
          <h3 className="font-serif font-black text-lg text-stone-950 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <span>ระบบแคชเชียร์ขายหน้าร้าน POS (Point of Sale System)</span>
          </h3>
          <p className="text-xs text-stone-800 font-extrabold mt-1">
            ยิงกดเลือกสินค้า ดูรูปสินค้าเต็มๆ ไม่โดนครอบ ตัดสต๊อกและออกใบเสร็จรับเงินแบบเรียลไทม์
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSelectedStaffToSwitch(null);
                setSwitchStaffPinInput('');
                setSwitchStaffError('');
                setIsSwitchCashierModalOpen(true);
              }}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border-2 border-amber-400 hover:border-amber-600 rounded-xl text-stone-900 flex items-center gap-1.5 text-xs font-bold shadow-xs transition cursor-pointer"
              title="กดเพื่อสลับพนักงานแคชเชียร์ขายบิลนี้"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>แคชเชียร์: <strong>{currentStaff?.name || 'เจ้าของร้าน'}</strong></span>
              <span className="text-[10px] text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded-md font-black border border-blue-300 ml-1">
                สลับคน 🔄
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsPerfumeLabelModalOpen(true)}
            className="px-3.5 py-2.5 bg-white hover:bg-amber-50 text-stone-950 border border-stone-300 hover:border-amber-400 font-black rounded-xl flex items-center gap-1.5 shrink-0 transition shadow-xs cursor-pointer text-xs"
            title="พิมพ์สติ๊กเกอร์ติดขวดน้ำหอมแบ่ง 10ml / 5ml (Niimbot & สติ๊กเกอร์ม้วน)"
          >
            <Droplets className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">ป้ายน้ำหอม 10ml</span>
            <span className="sm:hidden">ป้าย 10ml</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              if (forceRealtimeSync) {
                await forceRealtimeSync(true, true);
                setScanToast('✓ ซิงค์สต็อกและข้อมูลล่าสุดจากคลาวด์สำเร็จแล้ว');
                setTimeout(() => setScanToast(null), 2500);
              }
            }}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 font-black rounded-xl flex items-center gap-1.5 shrink-0 transition shadow-xs cursor-pointer text-xs"
            title="กดเพื่อดึงจำนวนสต็อกและออเดอร์ล่าสุดจากคลาวด์ทันที (หากเครื่องอื่นเพิ่งขายออกหรือแก้ไขสต็อก)"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-amber-600' : 'text-stone-700'}`} />
            <span>{syncStatus === 'syncing' ? 'กำลังซิงค์...' : '🔄 ซิงค์สต็อก'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsRefundExchangeModalOpen(true)}
            className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 border-2 border-amber-600 font-black rounded-xl flex items-center gap-1.5 shrink-0 transition shadow-xs cursor-pointer text-xs"
            title="ค้นหาบิลเพื่อขอคืนเงิน หรือเปลี่ยนสินค้า/ไซส์"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-950" />
            <span>คืนเงิน / เปลี่ยนสินค้า</span>
          </button>
          {posCart.length > 0 && (
            <button
              onClick={handleResetPOS}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-950 border border-stone-300 font-black rounded-xl flex items-center gap-1.5 shrink-0 transition shadow-xs cursor-pointer text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-950" />
              <span>ล้างตะกร้า POS</span>
            </button>
          )}
        </div>
      </div>

      {/* Main POS 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Product Selection Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* จุดขาย & คลังสต๊อก Selector (Multi-Booth POS Support) */}
          <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-2 border-amber-400 p-3 rounded-2xl flex items-center justify-between flex-wrap gap-2.5 text-stone-950 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-stone-950 text-amber-300 flex items-center justify-center font-black shadow-xs text-base">
                {selectedBoothTransfer || selectedEventSchedule ? '🎪' : '🏬'}
              </div>
              <div>
                <span className="text-xs font-black text-amber-950 flex items-center gap-1.5 flex-wrap">
                  <span>จุดขาย POS:</span>
                  <span className="bg-amber-400 text-stone-950 px-2 py-0.5 rounded-lg border border-amber-600 font-serif">
                    {selectedBoothTransfer
                      ? selectedBoothTransfer.eventName
                      : selectedEventSchedule
                      ? selectedEventSchedule.title
                      : 'คลังหลัก / หน้าร้านกลาง'}
                  </span>
                  {selectedEventSchedule && (
                    <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                      ตารางงานวันนี้
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-stone-600 font-bold block mt-0.5">
                  {selectedBoothTransfer ? (
                    `📍 สาขา: ${selectedBoothTransfer.branchName} • ตัดสต๊อกเฉพาะของบูธนี้ (เหลือ ${selectedBoothTransfer.totalDispatchedQty - (selectedBoothTransfer.totalSoldQty || 0)} ชิ้น)`
                  ) : selectedEventSchedule ? (
                    <span className="flex items-center gap-2 flex-wrap">
                      <span>📍 สาขา: {selectedEventSchedule.branchName} • ขายหน้าร้านตามตารางงาน (ตัดสต๊อกคลังหลัก)</span>
                      {onNavigateTab && (
                        <button
                          type="button"
                          onClick={() => onNavigateTab('booth_stock')}
                          className="text-[10px] text-amber-900 underline font-black hover:text-amber-700 cursor-pointer"
                        >
                          📦 ทำใบเบิกสินค้าเฉพาะบูธนี้
                        </button>
                      )}
                    </span>
                  ) : (
                    'ตัดสต๊อกตรงจากคลังใหญ่รวม'
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-black text-amber-950 whitespace-nowrap">สลับจุดขาย:</label>
              <select
                value={selectedBoothTransferId || ''}
                onChange={(e) => {
                  setSelectedBoothTransferId(e.target.value || null);
                  setPosCart([]);
                }}
                className="text-xs font-black bg-white border-2 border-amber-500 rounded-xl px-3 py-1.5 shadow-xs focus:outline-none cursor-pointer max-w-[280px]"
              >
                <option value="">🏬 คลังหลัก / หน้าร้านกลาง (สต๊อกรวม)</option>
                
                {activeBoothTransfers.length > 0 && (
                  <optgroup label="📦 บูธที่เบิกสินค้าแยก (ตัดสต๊อกเฉพาะบูธ)">
                    {activeBoothTransfers.map((bt) => (
                      <option key={bt.id} value={bt.id}>
                        🎪 {bt.eventName} ({bt.branchName}) - เหลือ {bt.totalDispatchedQty - (bt.totalSoldQty || 0)} ชิ้น
                      </option>
                    ))}
                  </optgroup>
                )}

                {activeEventSellingPoints.length > 0 && (
                  <optgroup label="📅 ตารางงานออกบูธวันนี้ (ตัดสต๊อกคลังหลัก)">
                    {activeEventSellingPoints.map((ev) => (
                      <option key={ev.id} value={`EVENT_${ev.id}`}>
                        🎪 {ev.title} ({ev.branchName})
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* Fallback if a specific event is selected but not currently in active list */}
                {selectedEventSchedule && !activeEventSellingPoints.some((ev) => ev.id === selectedEventSchedule.id) && (
                  <optgroup label="📍 บูธที่เลือกใช้งานอยู่">
                    <option value={`EVENT_${selectedEventSchedule.id}`}>
                      🎪 {selectedEventSchedule.title} ({selectedEventSchedule.branchName})
                    </option>
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          {/* Category & Search Filter Row */}
          <div className="bg-white p-4 rounded-2xl border-2 border-amber-400/60 shadow-md text-stone-950 space-y-3">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="พิมพ์ค้นหาชื่อแบบสินค้า หรือ ไซส์..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border-2 border-stone-400 rounded-xl py-2.5 pl-9 pr-3 text-xs text-stone-950 font-black placeholder-stone-400 focus:outline-none focus:border-amber-500 font-mono"
                />
                <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-amber-600" />
              </div>

              <button
                type="button"
                onClick={() => setIsLotSearchModalOpen(true)}
                className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md border border-amber-600 transition flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                title="ค้นหาสินค้าจากเลขล็อตเมื่อป้ายบาร์โค้ดชำรุดหรือฉีกขาด"
              >
                <Tag className="w-4 h-4 text-stone-950" />
                <span className="hidden sm:inline">ค้นด้วยเลขล็อต (ป้ายชำรุด)</span>
                <span className="sm:hidden">เลขล็อต</span>
              </button>
              <button
                type="button"
                onClick={() => setIsQRScannerOpen(true)}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md border border-emerald-700 transition flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                title="เปิดกล้องสแกน QR Code / บาร์โค้ด สินค้าเพื่อยิงเข้าตะกร้าคิดเงินทันที"
              >
                <Camera className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">📸 สแกน QR สินค้า</span>
                <span className="sm:hidden">📸 สแกน QR</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (forceRealtimeSync) {
                    await forceRealtimeSync(true, true);
                    setScanToast('✓ ซิงค์สต็อกและข้อมูลล่าสุดจากคลาวด์สำเร็จแล้ว');
                    setTimeout(() => setScanToast(null), 2500);
                  }
                }}
                className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 font-black text-xs rounded-xl shadow-md border border-stone-300 transition flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                title="กดเพื่อดึงจำนวนสต็อกล่าสุดจากคลาวด์ทันที"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-amber-600' : 'text-stone-700'}`} />
                <span className="hidden sm:inline">{syncStatus === 'syncing' ? 'กำลังซิงค์...' : '🔄 ซิงค์สต็อก'}</span>
                <span className="sm:hidden">{syncStatus === 'syncing' ? 'ซิงค์...' : '🔄 ซิงค์'}</span>
              </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {['all', 'abaya', 'kaftan', 'perfume', 'incense', 'combo', 'other'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
                      : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
                  }`}
                >
                  {cat === 'all' && 'ทั้งหมด'}
                  {cat === 'abaya' && 'ชุดอาบายะห์'}
                  {cat === 'kaftan' && 'ชุดคัฟทาน'}
                  {cat === 'perfume' && 'น้ำหอมดูไบ'}
                  {cat === 'incense' && 'เครื่องหอมดูไบ'}
                  {cat === 'combo' && 'เซ็ตสุดคุ้ม'}
                  {cat === 'other' && 'สินค้าอื่นๆ'}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items List Grid with Full Uncropped Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[620px] overflow-y-auto pr-1 no-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-stone-700 bg-white rounded-2xl border-2 border-amber-400/60 font-black shadow-md">
                ไม่พบรายการสินค้าที่ค้นหา
              </div>
            ) : (
              filteredProducts.map((prod) => {
                const totalProdStock = prod.variants.reduce((sum, v) => sum + v.stockQuantity, 0);

                return (
                  <div
                    key={prod.id}
                    className="bg-white border-2 border-amber-400/60 rounded-2xl p-3.5 space-y-3 flex flex-col justify-between hover:border-amber-500 transition shadow-xl group text-stone-950"
                  >
                    {/* Full Image Box (Uncropped object-contain with light background & Zoom Button) */}
                    <div className="space-y-2">
                      <div className="relative h-48 sm:h-52 bg-stone-50 rounded-xl border border-stone-300 flex items-center justify-center p-2 overflow-hidden shadow-inner group/img">
                        <img
                          src={prod.images?.[0] || (prod.category === 'perfume' ? '/images/placeholder-perfume.jpg' : '/images/placeholder-abaya.jpg')}
                          alt={prod.title}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = prod.category === 'perfume' ? '/images/placeholder-perfume.jpg' : '/images/placeholder-abaya.jpg';
                          }}
                          className="w-full h-full object-contain rounded-lg transition duration-300 group-hover/img:scale-105"
                        />

                        {/* Total Stock Badge */}
                        <span className="absolute top-2 right-2 bg-stone-950 text-amber-300 border border-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md z-10">
                          <Box className="w-3 h-3 text-amber-400" />
                          <span>รวม {totalProdStock} ชิ้น</span>
                        </span>

                        {/* Direct Full Image Zoom Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openFullImageModal(prod);
                          }}
                          className="absolute bottom-2 right-2 bg-white/95 text-stone-950 hover:bg-amber-400 border border-amber-500 font-black text-[10px] px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1 transition z-10 cursor-pointer"
                          title="กดดูรูปสินค้าขนาดใหญ่เต็มตา"
                        >
                          <ZoomIn className="w-3.5 h-3.5 text-amber-700" />
                          <span>ดูรูปเต็มๆ</span>
                        </button>

                        {/* Hover Overlay Quick Add Action */}
                        <div
                          onClick={() => handleQuickAddCard(prod)}
                          className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center cursor-pointer"
                        >
                          <span className="bg-amber-400 text-stone-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-amber-500 flex items-center gap-1">
                            <Plus className="w-4 h-4" /> เลือกสินค้านี้
                          </span>
                        </div>
                      </div>

                      {/* Product Title & Zoom Link */}
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => handleQuickAddCard(prod)}
                          className="font-serif font-black text-stone-950 text-xs sm:text-sm truncate hover:text-amber-700 transition cursor-pointer flex-1"
                          title={prod.title}
                        >
                          {prod.title}
                        </h4>

                        <button
                          type="button"
                          onClick={() => openFullImageModal(prod)}
                          className="text-amber-700 hover:text-amber-900 p-0.5 rounded transition shrink-0"
                          title="ดูรูปภาพสินค้าเต็มๆ"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Size Variants Pills with Dynamic Realtime Stock Badges */}
                    <div className="space-y-1.5 pt-2 border-t border-stone-200">
                      <span className="text-[10px] text-stone-800 font-black flex items-center justify-between">
                        <span>กดเลือกไซส์เฉพาะ:</span>
                      </span>

                      <div className="flex flex-wrap gap-1.5">
                        {prod.variants.map((variant) => {
                          const isOutOfStock = variant.stockQuantity <= 0;
                          const isLowStock = variant.stockQuantity > 0 && variant.stockQuantity <= (storeSettings.lowStockThreshold || 3);
                          const vColor = getEffectiveVariantColor(prod, variant);

                          return (
                            <button
                              key={variant.id}
                              disabled={isOutOfStock}
                              onClick={() => handleAddToCart(prod, variant)}
                              className={`group relative text-[11px] px-2.5 py-1.5 rounded-xl font-black border transition flex items-center justify-between gap-2.5 cursor-pointer ${
                                isOutOfStock
                                  ? 'bg-stone-100 border-stone-300 text-stone-400 line-through opacity-50 cursor-not-allowed'
                                  : isLowStock
                                  ? 'bg-amber-50 hover:bg-amber-400 text-stone-950 border-amber-400 shadow-xs'
                                  : 'bg-white hover:bg-amber-400 text-stone-950 border-stone-300 hover:border-amber-500 shadow-xs'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>{variant.name}</span>
                                {vColor && (
                                  <span className="inline-flex items-center gap-1 bg-stone-100 group-hover:bg-white px-2 py-0.5 rounded-md border border-stone-300 shadow-2xs">
                                    <ColorIndicator color={vColor} dotClassName="w-3.5 h-3.5 ring-1 ring-black/20 shrink-0" showLabel={true} labelClassName="text-[10px] text-stone-950 font-black" />
                                  </span>
                                )}
                              </div>

                              {/* Dynamic Stock Badge */}
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-black shadow-xs shrink-0 ${
                                  isOutOfStock
                                    ? 'bg-red-600 text-white'
                                    : isLowStock
                                    ? 'bg-amber-400 text-stone-950 border border-amber-500'
                                    : 'bg-emerald-600 text-white'
                                }`}
                              >
                                {isOutOfStock ? 'หมด' : `เหลือ ${variant.stockQuantity}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: POS Cart & Checkout Terminal (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white p-5 rounded-2xl border-2 border-amber-400/60 shadow-2xl space-y-4 text-stone-950">
            
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h4 className="font-serif font-black text-sm text-stone-950 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-600" />
                <span>รายการชำระเงิน POS (Cart &amp; Checkout)</span>
              </h4>
              <div className="flex items-center gap-2">
                {posCart.some(
                  (item) =>
                    item.category === 'perfume' ||
                    item.productTitle.includes('น้ำหอม') ||
                    item.productTitle.toLowerCase().includes('perfume') ||
                    item.variantName.includes('ml')
                ) && (
                  <button
                    type="button"
                    onClick={() => setIsPerfumeLabelModalOpen(true)}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md border border-amber-600 transition flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 shrink-0 animate-pulse"
                    title="พิมพ์สติ๊กเกอร์ติดขวดน้ำหอม 10ml สำหรับรายการในตะกร้านี้"
                  >
                    <Droplets className="w-3.5 h-3.5 text-stone-950" />
                    <span>
                      🏷️ พิมพ์ป้ายน้ำหอม (
                      {posCart
                        .filter(
                          (item) =>
                            item.category === 'perfume' ||
                            item.productTitle.includes('น้ำหอม') ||
                            item.productTitle.toLowerCase().includes('perfume') ||
                            item.variantName.includes('ml')
                        )
                        .reduce((sum, item) => sum + item.quantity, 0)}{' '}
                      ขวด)
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsQRScannerOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md border border-emerald-700 transition flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                  title="เปิดกล้องสแกน QR Code เพื่อเพิ่มสินค้าลงตะกร้าคิดเงินนี้ทันที"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                  <span>📸 สแกน QR สินค้า</span>
                </button>
                <span className="text-[11px] bg-amber-100 text-amber-950 px-2.5 py-1 rounded-full border border-amber-400 font-black">
                  {posCart.length} รายการ
                </span>
              </div>
            </div>

            {/* Selected Cart Items Table with Micro Thumbnails */}
            <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
              {posCart.length === 0 ? (
                <div className="py-8 text-center text-stone-700 flex flex-col items-center justify-center gap-2 font-black">
                  <ShoppingBag className="w-8 h-8 text-amber-600" />
                  <span className="font-black text-xs text-stone-950">กดเลือกสินค้าทางฝั่งซ้ายเข้าตะกร้าขาย หรือสแกน QR Code</span>
                  <p className="text-[10px] text-stone-600 font-extrabold">เมื่อเลือกสินค้าแล้ว ปุ่มยืนยันคิดเงินสีเขียวจะปรากฏขึ้นทันที</p>
                  
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setIsQRScannerOpen(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-full border border-emerald-700 shadow-md flex items-center gap-1.5 transition cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <Camera className="w-4 h-4 text-white" />
                      <span>📸 สแกน QR Code สินค้าเข้าตะกร้า</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('switch_admin_tab_reports'));
                        }
                      }}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 font-black text-[11px] rounded-full border border-stone-300 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>ดูรายงานยอดขาย &amp; กำไรสุทธิ</span>
                    </button>
                  </div>
                </div>
              ) : (
                posCart.map((item, idx) => (
                  <div key={`${item.variantId}-${item.lotNumber || idx}`} className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-300 text-stone-950">
                    <div className="flex items-center gap-2.5 flex-1 pr-2 truncate">
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        className="w-10 h-12 object-cover rounded-lg border border-amber-400 shrink-0 bg-white shadow-xs"
                      />
                      <div className="truncate">
                        <strong className="text-stone-950 text-xs block truncate font-black">{item.productTitle}</strong>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-amber-950 font-bold">({item.variantName})</span>
                          {item.lotNumber && (
                            <span className="text-[9px] bg-amber-100 text-amber-950 font-black px-1.5 py-0.2 rounded border border-amber-400">
                              ล็อต: {item.lotNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white">
                        <button
                          onClick={() => handleUpdateQty(item.variantId, item.quantity - 1, idx)}
                          className="px-2 py-1 text-stone-950 hover:bg-stone-100 font-black text-xs rounded-l-lg cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 font-mono font-black text-stone-950 text-xs">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item.variantId, item.quantity + 1, idx)}
                          className="px-2 py-1 text-stone-950 hover:bg-stone-100 font-black text-xs rounded-r-lg cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-serif font-black text-amber-900 text-xs w-16 text-right">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </span>

                      <button
                        onClick={() => handleUpdateQty(item.variantId, 0, idx)}
                        className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Walk-in Customer Info */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-amber-400/30">
              <div>
                <label className="block text-stone-950 text-xs mb-1 font-black">ชื่อลูกค้า (หรือ Walk-in)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white border-2 border-stone-400 rounded-xl p-2 text-stone-950 font-black text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-950 text-xs mb-1 font-black">ส่วนลดหน้าร้าน (บาท)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={discountInput === 0 ? '' : discountInput}
                  onFocus={(e) => e.target.select()}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  onChange={(e) => {
                    const cleanVal = e.target.value.replace(/^0+(?=\d)/, '');
                    setDiscountInput(cleanVal === '' ? 0 : Math.max(0, parseInt(cleanVal, 10) || 0));
                  }}
                  className="w-full bg-white border-2 border-amber-500 rounded-xl p-2 text-amber-900 font-black font-mono text-xs text-right focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2.5 pt-2.5 border-t-2 border-amber-400/30">
              <label className="block text-stone-950 text-xs font-black">เลือกวิธีชำระเงินหน้าร้าน:</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-xl border-2 text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'bg-amber-400 text-stone-950 font-black border-amber-500 shadow-md'
                      : 'bg-white text-stone-950 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-stone-950" />
                  <span className="text-xs font-black">เงินสด (Cash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`p-2.5 rounded-xl border-2 text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'promptpay'
                      ? 'bg-amber-400 text-stone-950 font-black border-amber-500 shadow-md'
                      : 'bg-white text-stone-950 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-stone-950" />
                  <span className="text-xs font-black">พร้อมเพย์ QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-2.5 rounded-xl border-2 text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'credit_card'
                      ? 'bg-amber-400 text-stone-950 font-black border-amber-500 shadow-md'
                      : 'bg-white text-stone-950 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-stone-950" />
                  <span className="text-xs font-black">รูดบัตร EDC</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('gov_copay')}
                  className={`p-2.5 rounded-xl border-2 text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'gov_copay'
                      ? 'bg-amber-400 text-stone-950 font-black border-amber-500 shadow-md'
                      : 'bg-white text-stone-950 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-black">โครงการรัฐบาล</span>
                </button>
              </div>

              {/* Cash Quick Presets & Change Calculation */}
              {paymentMethod === 'cash' && (
                <div className="p-4 bg-amber-50/60 rounded-2xl border-2 border-amber-400 space-y-3 shadow-md text-stone-950">
                  <div className="space-y-1.5">
                    <span className="text-stone-950 text-xs font-black block">ปุ่มลัดรับเงินสด (Quick Cash Presets):</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickCashPreset(netAmount)}
                        className="px-3 py-1.5 bg-amber-400 text-stone-950 border border-amber-500 rounded-xl font-black text-xs shadow-md hover:bg-amber-300 transition cursor-pointer"
                      >
                        พอดี (฿{netAmount.toLocaleString()})
                      </button>
                      {[100, 500, 1000, 2000, 5000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleQuickCashPreset(amt)}
                          className="px-3 py-1.5 bg-white hover:bg-amber-400 text-stone-950 border border-stone-300 rounded-xl font-mono font-black text-xs shadow-xs transition cursor-pointer"
                        >
                          ฿{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-stone-950 text-xs sm:text-sm font-black">รับเงินสดมา (บาท):</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={cashReceived}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      onChange={(e) => {
                        const cleanVal = e.target.value.replace(/^0+(?=\d)/, '');
                        setCashReceived(cleanVal);
                      }}
                      className="w-36 bg-white border-2 border-amber-500 rounded-xl p-2 text-right font-mono font-black text-stone-950 text-base shadow-inner focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-emerald-500 shadow-md">
                    <span className="text-emerald-950 font-serif font-black text-xs sm:text-sm">เงินทอนลูกค้า:</span>
                    <span className="text-emerald-800 font-serif font-black text-xl sm:text-2xl">
                      ฿{changeAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* PromptPay QR View */}
              {paymentMethod === 'promptpay' && qrCodeUrl && (
                <div className="p-4 bg-amber-50/60 rounded-2xl border-2 border-amber-400 flex items-center justify-between gap-3.5 shadow-md text-stone-950">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="relative group cursor-pointer"
                      onClick={() => setIsZoomQRModalOpen(true)}
                      title="กดขยาย QR Code เต็มจอ"
                    >
                      <img src={qrCodeUrl} alt="POS QR Code" className="w-24 h-24 rounded-xl border-2 border-amber-400 bg-white shadow-md shrink-0" />
                      <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-stone-950 font-black block text-xs sm:text-sm">สแกนชำระพร้อมเพย์:</span>
                      <p className="text-amber-900 font-serif font-black text-xl">฿{netAmount.toLocaleString()}</p>
                      <p className="text-xs text-stone-700 font-bold">เบอร์ร้าน: {storeSettings.promptPayNumber || '081-234-5678'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsZoomQRModalOpen(true)}
                    className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl border border-amber-500 shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
                    title="ขยาย QR Code ให้ลูกค้าสแกนได้สะดวก"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>ขยายเต็มจอ</span>
                  </button>
                </div>
              )}

              {/* Payment Summary for Government Co-Pay */}
              {paymentMethod === 'gov_copay' && (
                <div className="p-4 bg-amber-50/60 rounded-2xl border-2 border-amber-400 space-y-3 shadow-md text-stone-950">
                  <div className="space-y-1.5">
                    <span className="text-stone-950 font-black text-xs block">สัดส่วนเงินสนับสนุนโครงการรัฐบาล:</span>
                    
                    <div className="grid grid-cols-4 gap-1.5 text-xs font-black">
                      {['60_40', '50_50', '70_30', 'custom'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setGovRatio(mode as any)}
                          className={`py-2 rounded-xl border-2 text-center transition cursor-pointer ${
                            govRatio === mode
                              ? 'bg-amber-400 text-stone-950 border-amber-500 font-black shadow-md'
                              : 'bg-white text-stone-950 border-stone-300 hover:bg-stone-100'
                          }`}
                        >
                          {mode === '60_40' ? '60 / 40' : mode === '50_50' ? '50 / 50' : mode === '70_30' ? '70 / 30' : 'ระบุ % เอง'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {govRatio === 'custom' && (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-300">
                      <span className="text-stone-950 font-black text-xs">ระบุ % รัฐบาลจ่าย:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="0"
                          value={customGovPercent === 0 ? '' : customGovPercent}
                          onFocus={(e) => e.target.select()}
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                          onChange={(e) => {
                            const cleanVal = e.target.value.replace(/^0+(?=\d)/, '');
                            setCustomGovPercent(cleanVal === '' ? 0 : Math.min(100, Math.max(0, parseInt(cleanVal, 10) || 0)));
                          }}
                          className="w-20 bg-white border-2 border-stone-400 rounded-lg px-2 py-1 text-right text-stone-950 font-mono font-black text-sm"
                        />
                        <span className="text-stone-950 font-black">%</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex justify-between items-center text-amber-950 font-black">
                      <span>รัฐบาล/โครงการจ่าย ({govPercent}%):</span>
                      <span className="font-serif font-black text-amber-900 text-sm">
                        ฿{govAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-emerald-950 font-black bg-white p-2.5 rounded-xl border-2 border-emerald-500 shadow-sm">
                      <span>ยอดที่ลูกค้าชำระเพิ่ม ({customerPercent}%):</span>
                      <span className="font-serif font-black text-base text-emerald-800">
                        ฿{customerPayAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {qrCodeUrl && (
                    <div className="p-3 bg-white rounded-xl border border-stone-300 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative group cursor-pointer"
                          onClick={() => setIsZoomQRModalOpen(true)}
                          title="กดขยาย QR Code เต็มจอ"
                        >
                          <img src={qrCodeUrl} alt="POS Gov QR Code" className="w-20 h-20 rounded-lg border border-amber-400 bg-white shrink-0" />
                          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                            <ZoomIn className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <span className="text-stone-950 font-black block">สแกนชำระส่วนของลูกค้า (เป๋าตัง/พร้อมเพย์):</span>
                          <p className="text-amber-900 font-serif font-black text-base">฿{customerPayAmount.toLocaleString()}</p>
                          <p className="text-[11px] text-stone-700 font-bold">แอปถุงเงิน / เบอร์ร้าน: {storeSettings.promptPayNumber || '081-234-5678'}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsZoomQRModalOpen(true)}
                        className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-lg border border-amber-500 shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>ขยาย</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Slip / Proof Image Attachment (ถ่ายภาพ หรือ แนบไฟล์ภาพ) */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <label className="text-stone-950 font-black text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>ตรวจสลิปโอนเงิน / หลักฐานการโอน:</span>
                </label>
                {posSlipImage && (
                  <span className="text-[10px] text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    ✓ แนบสลิปแล้ว
                  </span>
                )}
              </div>

              {/* Slip Mini QR Scan Button */}
              {storeSettings.slipVerifyEnabled !== false && (
                <button
                  type="button"
                  onClick={() => setIsSlipScannerOpen(true)}
                  className="w-full p-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md border border-emerald-500 flex items-center justify-center gap-2 cursor-pointer transition hover:scale-[1.01] active:scale-[0.99]"
                  title="ส่องกล้องไปที่ Mini QR บนสลิปในมือถือของลูกค้าเพื่อตรวจความถูกต้องของยอดเงินและส่งสัญญาณเข้า POS ทันที"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-100" />
                  <span>🔍 สแกนตรวจ Mini QR สลิป (ตรวจเงินเข้าอัตโนมัติ)</span>
                </button>
              )}

              {/* Verified Slip Badge Card */}
              {slipVerifiedData && (
                <div className="p-3 bg-emerald-50/90 border-2 border-emerald-500 rounded-2xl space-y-2 text-left shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-950 text-xs flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{slipVerifiedData.isDemo ? '✨ สลิปถูกต้อง! (โหมดทดสอบ)' : '✅ สลิปถูกต้อง 100%! เงินเข้าบัญชีจริง'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSlipVerifiedData(null);
                        setSlipVerifyError(null);
                      }}
                      className="text-[10px] text-stone-500 hover:text-rose-600 underline font-bold cursor-pointer"
                    >
                      ล้างตรวจใหม่
                    </button>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-300 text-[11px] space-y-1 font-mono text-stone-900 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-sans">ธนาคารผู้โอน:</span>
                      <strong className="text-stone-950 font-black">{slipVerifiedData.senderBank}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-sans">ยอดเงินโอน:</span>
                      <strong className="text-emerald-800 font-black text-xs font-serif">฿{slipVerifiedData.amount?.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-sans">เวลาโอน:</span>
                      <span className="font-bold">{slipVerifiedData.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-sans">รหัสอ้างอิง:</span>
                      <span className="text-[10px] font-bold text-stone-700">{slipVerifiedData.transRef}</span>
                    </div>
                    <div className="flex justify-between border-t border-stone-200 pt-1">
                      <span className="text-stone-500 font-sans">บัญชีผู้รับ:</span>
                      <span className="font-bold text-stone-900">{slipVerifiedData.receiverName}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-800 font-bold text-center">
                    🎉 ได้รับสัญญาณยืนยันเรียบร้อย ยอดเงินตรงกับบิล 100%
                  </p>
                </div>
              )}

              {/* Verifying Spinner */}
              {isVerifyingSlip && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-center flex items-center justify-center gap-2 text-xs font-bold text-amber-950 animate-pulse">
                  <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>กำลังส่งตรวจข้อมูลสลิปกับระบบธนาคาร...</span>
                </div>
              )}

              {/* Verification Error */}
              {slipVerifyError && (
                <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 font-bold flex items-center justify-between gap-2 shadow-xs">
                  <span>{slipVerifyError}</span>
                  <button
                    type="button"
                    onClick={() => setSlipVerifyError(null)}
                    className="text-stone-400 hover:text-stone-700 font-black text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Hidden file and camera inputs */}
              <input
                type="file"
                ref={slipFileInputRef}
                accept="image/*"
                onChange={handleSlipFileUpload}
                className="hidden"
              />
              <input
                type="file"
                ref={slipCameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleSlipFileUpload}
                className="hidden"
              />

              {!posSlipImage ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => slipCameraInputRef.current?.click()}
                    className="p-2.5 bg-amber-50 hover:bg-amber-100 border-2 border-dashed border-amber-400 rounded-xl text-stone-900 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer group"
                    title="ถ่ายภาพสลิปจากกล้องมือถือ/แท็บเล็ต"
                  >
                    <Camera className="w-4 h-4 text-amber-700 group-hover:scale-110 transition" />
                    <span>📷 ถ่ายภาพสลิป</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => slipFileInputRef.current?.click()}
                    className="p-2.5 bg-stone-50 hover:bg-stone-100 border-2 border-dashed border-stone-300 rounded-xl text-stone-900 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer group"
                    title="แนบรูปภาพจากไฟล์ภาพ / อัลบั้ม"
                  >
                    <Upload className="w-4 h-4 text-stone-700 group-hover:scale-110 transition" />
                    <span>📁 แนบไฟล์ภาพ</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 bg-stone-50 border-2 border-emerald-400 rounded-xl shadow-xs gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      onClick={() => setPreviewSlipModalUrl(posSlipImage)}
                      className="relative w-12 h-12 rounded-lg overflow-hidden border border-emerald-500 shrink-0 cursor-pointer shadow-xs hover:opacity-90 group bg-stone-200"
                      title="คลิกเพื่อดูรูปสลิปขนาดเต็ม"
                    >
                      <img
                        src={posSlipImage}
                        alt="สลิปโอนเงิน"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Eye className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    <div className="text-left space-y-0.5">
                      <span className="text-xs font-black text-emerald-950 block">
                        แนบรูปสลิปแล้ว
                      </span>
                      <span className="text-[10px] text-stone-500 block font-bold">
                        รูปบันทึกติดออเดอร์ทันที
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewSlipModalUrl(posSlipImage)}
                      className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-black border border-stone-300 transition flex items-center gap-1 cursor-pointer"
                      title="ดูรูปขนาดเต็ม"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ดูรูป</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => slipFileInputRef.current?.click()}
                      className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-lg text-xs font-black border border-amber-400 transition flex items-center gap-1 cursor-pointer"
                      title="เปลี่ยนรูปภาพใหม่"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>เปลี่ยน</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosSlipImage('')}
                      className="p-1 hover:bg-red-100 text-stone-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                      title="ลบรูปภาพนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Total Summary & Complete Action */}
            <div className="pt-3 border-t-2 border-amber-400/40 space-y-3">
              <div className="flex justify-between items-baseline font-serif">
                <span className="text-stone-800 text-sm font-black">ยอดชำระสุทธิ:</span>
                <span className="text-2xl font-black text-amber-900">
                  ฿{netAmount.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleCheckoutPOS}
                disabled={posCart.length === 0}
                className={`w-full py-4 text-sm font-black uppercase tracking-wider rounded-xl shadow-xl transition flex items-center justify-center gap-2 border cursor-pointer ${
                  posCart.length === 0
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed border-stone-300'
                    : slipVerifiedData
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:brightness-110 text-white border-emerald-700 shadow-xl ring-2 ring-emerald-400 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700 shadow-md font-sans'
                }`}
              >
                <CheckCircle className="w-5 h-5 text-white" />
                <span>
                  {slipVerifiedData
                    ? `✓ สลิปถูกต้อง! ยืนยันการขาย & ออกใบเสร็จ (฿${netAmount.toLocaleString()})`
                    : `ยืนยันการขาย & ออกใบเสร็จ (ชำระเงิน ฿${netAmount.toLocaleString()})`}
                </span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* FULL PRODUCT IMAGE ZOOM PREVIEW MODAL */}
      {previewImageProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-2xl w-full p-5 sm:p-6 text-stone-950 shadow-2xl space-y-4 text-left animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b-2 border-amber-400/40 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-400">
                  {previewImageProduct.category === 'perfume' ? 'น้ำหอมดูไบ (Dubai Perfume)' : previewImageProduct.category}
                </span>
                <h3 className="font-serif font-black text-lg sm:text-xl text-stone-950 mt-1">
                  {previewImageProduct.title}
                </h3>
                {previewImageProduct.fabric && (
                  <p className="text-xs text-stone-700 font-bold">{previewImageProduct.fabric}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPreviewImageProduct(null)}
                className="text-stone-700 hover:text-stone-950 p-1.5 rounded-full border border-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Uncropped Image Box */}
            <div className="relative bg-stone-50 border-2 border-stone-300 rounded-2xl p-3 flex items-center justify-center min-h-[320px] max-h-[50vh] overflow-hidden shadow-inner">
              <img
                src={previewImageProduct.images[activeImageIndex] || previewImageProduct.images[0]}
                alt={previewImageProduct.title}
                className="max-w-full max-h-[46vh] object-contain rounded-xl shadow-md transition-all duration-300"
              />

              {previewImageProduct.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/70 px-3 py-1 rounded-full text-white text-[10px] font-black border border-white/30">
                  <span>รูปที่ {activeImageIndex + 1} จาก {previewImageProduct.images.length}</span>
                </div>
              )}
            </div>

            {/* Gallery Thumbnails list if multiple images exist */}
            {previewImageProduct.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {previewImageProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-16 rounded-xl border-2 p-0.5 overflow-hidden transition cursor-pointer shrink-0 ${
                      activeImageIndex === idx ? 'border-amber-500 ring-2 ring-amber-400/50' : 'border-stone-300 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            )}

            {/* Direct Add-to-Cart Size Selector inside Image Modal */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <span className="text-xs font-black text-stone-950 block">เลือกไซส์ / แบบ เพิ่มเข้าตะกร้าขาย POS ได้ทันที:</span>
              <div className="flex flex-wrap gap-2">
                {previewImageProduct.variants.map((v) => {
                  const isOut = v.stockQuantity <= 0;
                  const vColor = getEffectiveVariantColor(previewImageProduct, v);
                  return (
                    <button
                      key={v.id}
                      disabled={isOut}
                      onClick={() => {
                        handleAddToCart(previewImageProduct, v);
                        setPreviewImageProduct(null);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black border transition flex items-center justify-between gap-2.5 cursor-pointer ${
                        isOut
                          ? 'bg-stone-100 border-stone-300 text-stone-400 line-through opacity-50 cursor-not-allowed'
                          : 'bg-amber-400 hover:bg-amber-300 text-stone-950 border-amber-500 shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{v.name}</span>
                        {vColor && (
                          <span className="bg-white/90 px-2 py-0.5 rounded-lg border border-stone-300 shadow-2xs">
                            <ColorIndicator color={vColor} dotClassName="w-3.5 h-3.5 ring-1 ring-black/20 shrink-0" showLabel={true} labelClassName="text-[10px] text-stone-950 font-black" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-serif">฿{v.price.toLocaleString()}</span>
                        <span className="text-[10px] bg-stone-950 text-white px-2 py-0.5 rounded-full font-mono">
                          {isOut ? 'หมด' : `${v.stockQuantity} ชิ้น`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-stone-600 font-bold">
                💡 สามารถดูรายละเอียดและลายปักบนเสื้อผ้า/ขวดน้ำหอมได้แบบคมชัด 100%
              </span>
              <button
                type="button"
                onClick={() => setPreviewImageProduct(null)}
                className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-950 font-black rounded-xl border border-stone-300 text-xs cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

      {/* POS Completed Thermal Receipt Slip Modal */}
      {completedPOSOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-stone-950 p-6 my-8 space-y-4 text-center">
            
            <div className="w-14 h-14 bg-emerald-100 border-2 border-emerald-500 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-black text-lg text-stone-950">
                การขายหน้าร้านสำเร็จเรียบร้อย!
              </h3>
              <p className="text-xs text-stone-700 font-bold">
                ระบบได้ทำการตัดสต๊อกสินค้าเรียลไทม์ และบันทึกยอดขายหน้าร้านแล้ว
              </p>
            </div>

            {/* Thermal Receipt Print Slip Layout */}
            <div id="pos-thermal-slip" className={`p-4 bg-stone-50 text-black rounded-xl text-left font-mono space-y-3 shadow-inner border border-stone-300 mx-auto transition-all ${
              receiptPaperWidth === '58mm' ? 'max-w-[270px] text-[10px]' : 'max-w-[340px] text-xs'
            }`}>
              <div className="text-center border-b border-black/30 pb-2 space-y-1">
                {storeSettings.logoImageUrl && (
                  <img src={storeSettings.logoImageUrl} alt="Logo" className="w-12 h-12 rounded-full mx-auto object-cover border border-black bg-white" />
                )}
                <h4 className="font-bold text-sm tracking-wider uppercase">{storeSettings.storeName}</h4>
                <p className="text-[10px] text-gray-700">{storeSettings.storeTagline}</p>
                <p className="text-[10px] text-gray-700">ที่อยู่: {storeSettings.contactAddress}</p>
                <p className="text-[10px] text-gray-700">โทร: {storeSettings.contactPhone} | LINE: {storeSettings.contactLine}</p>
              </div>

              <div className="flex justify-between text-[11px] border-b border-black/20 pb-1 font-bold">
                <span>ใบเสร็จรับเงินอย่างย่อ POS</span>
                <span>#{completedPOSOrder.id}</span>
              </div>

              <div className="text-[10px] text-gray-600">
                <span>วันที่: {new Date(completedPOSOrder.createdAt).toLocaleString('th-TH')}</span>
              </div>

              <div className="space-y-1 border-b border-black/20 pb-2">
                {completedPOSOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="pr-2">
                      {item.productTitle} ({item.variantName})
                      {item.lotNumber ? ` [ล็อต: ${item.lotNumber}]` : ''} x{item.quantity}
                    </span>
                    <span className="font-bold shrink-0">฿{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-1 text-[11px]">
                <div className="flex justify-between">
                  <span>ยอดรวม (Subtotal):</span>
                  <span>฿{completedPOSOrder.totalAmount.toLocaleString()}</span>
                </div>
                {completedPOSOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>ส่วนลด (Discount):</span>
                    <span>-฿{completedPOSOrder.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm border-t border-black/40 pt-1">
                  <span>ยอดชำระสุทธิ:</span>
                  <span>฿{completedPOSOrder.netAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] pt-1 text-gray-700">
                  <span>ชำระโดย: {completedPOSOrder.paymentMethod === 'cod' ? 'เงินสด (Cash)' : completedPOSOrder.paymentMethod}</span>
                  <span>{completedPOSOrder.note}</span>
                </div>

                {completedPOSOrder.slipImage && (
                  <div className="pt-2 border-t border-black/20 space-y-1.5 text-left">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="flex items-center gap-1 text-stone-900 font-sans">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>สลิป / หลักฐานการโอนเงิน:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewSlipModalUrl(completedPOSOrder.slipImage || null)}
                        className="text-amber-800 underline hover:text-amber-950 font-sans text-xs cursor-pointer font-black"
                      >
                        ดูรูปขยาย
                      </button>
                    </div>
                    <div
                      onClick={() => setPreviewSlipModalUrl(completedPOSOrder.slipImage || null)}
                      className="max-w-[200px] mx-auto border border-black/30 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition p-1 bg-white shadow-xs"
                    >
                      <img
                        src={completedPOSOrder.slipImage}
                        alt="สลิปโอนเงิน POS"
                        className="w-full max-h-40 object-contain rounded mx-auto"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center pt-3 border-t border-black/30 text-[10px] text-gray-600">
                <p>ขอบคุณที่อุดหนุน HUDA ABAYA DUBAI</p>
                <p>ยินดีให้บริการในโอกาสถัดไปค่ะ</p>
              </div>
            </div>

            {/* Paper Size Selector (58mm vs 80mm Bluetooth) */}
            <div className="flex items-center justify-between bg-stone-100 px-3.5 py-2 rounded-xl border border-stone-300 text-xs">
              <span className="font-black text-stone-900 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-amber-700" />
                <span>ขนาดกระดาษความร้อน:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setReceiptPaperWidth('58mm')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                    receiptPaperWidth === '58mm'
                      ? 'bg-amber-400 text-stone-950 border border-amber-500 shadow-xs ring-1 ring-amber-500'
                      : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-300'
                  }`}
                  title="สำหรับเครื่องพิมพ์พกพาไร้สาย Bluetooth 58 มม. (ยอดนิยมตามตลาดนัด)"
                >
                  <span>📱 58mm (บลูทูธพกพา)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptPaperWidth('80mm')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                    receiptPaperWidth === '80mm'
                      ? 'bg-amber-400 text-stone-950 border border-amber-500 shadow-xs ring-1 ring-amber-500'
                      : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-300'
                  }`}
                  title="สำหรับเครื่องพิมพ์ความร้อนแบบตั้งโต๊ะ 80 มม."
                >
                  <span>🖥️ 80mm (ตั้งโต๊ะ)</span>
                </button>
              </div>
            </div>

            {/* Print Copies Selector */}
            <div className="flex items-center justify-between bg-amber-50/90 px-3.5 py-2 rounded-xl border border-amber-300 text-xs">
              <span className="font-black text-stone-900 flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-amber-700" />
                <span>จำนวนพิมพ์:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setReceiptCopies(2)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                    receiptCopies === 2
                      ? 'bg-amber-400 text-stone-950 border border-amber-500 shadow-xs ring-1 ring-amber-500'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
                  }`}
                  title="พิมพ์ 2 ชุด: ชุดที่ 1 ให้ลูกค้า และ ชุดที่ 2 สำหรับร้านค้า/พนักงานเก็บ"
                >
                  <span>✨ 2 ชุด (ลูกค้า 1 + พนักงานเก็บ 1)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptCopies(1)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                    receiptCopies === 1
                      ? 'bg-amber-400 text-stone-950 border border-amber-500 shadow-xs ring-1 ring-amber-500'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
                  }`}
                  title="พิมพ์ 1 ชุด สำหรับลูกค้าเท่านั้น"
                >
                  <span>1 ชุด</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrintPOSReceipt}
                className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition border border-amber-500/40"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>🖨️ พิมพ์ใบเสร็จ ({receiptPaperWidth} • {receiptCopies === 2 ? '2 ชุด' : '1 ชุด'})</span>
              </button>
              <button
                onClick={handleResetPOS}
                className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs uppercase shadow-md border border-amber-500 cursor-pointer"
              >
                ทำรายการขายถัดไป
              </button>
            </div>

            {completedPOSOrder.items.some(
              (it) =>
                it.category === 'perfume' ||
                it.productTitle.includes('น้ำหอม') ||
                it.productTitle.toLowerCase().includes('perfume') ||
                it.variantName.includes('ml')
            ) && (
              <button
                type="button"
                onClick={() => setIsPerfumeLabelModalOpen(true)}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md border border-amber-600 cursor-pointer transition hover:scale-[1.01]"
              >
                <Droplets className="w-4 h-4 text-stone-950" />
                <span>🏷️ พิมพ์สติ๊กเกอร์ขวดน้ำหอม 10ml ของบิลนี้</span>
              </button>
            )}

            <button
              type="button"
              onClick={async () => {
                try {
                  if (window.confirm(`ต้องการยกเลิกบิลนี้ #${completedPOSOrder.id} และดึงสินค้าคืนคลังทันทีใช่หรือไม่?\n(ระบบจะคืนสต๊อกเข้าคลัง และยกเลิกยอดค้างจ่าย Supplier ให้อัตโนมัติ)`)) {
                    const res = await cancelAndRestockOrder(completedPOSOrder.id, { reason: 'ยกเลิกบิลหน้าร้านทันที (POS Void)' });
                    if (res && res.success) {
                      alert(res.message);
                      handleResetPOS();
                    } else {
                      alert(res?.message || 'ไม่สามารถยกเลิกบิลได้');
                    }
                  }
                } catch (err: any) {
                  console.error('Void error:', err);
                  alert(`เกิดข้อผิดพลาดในการยกเลิกบิล: ${err?.message || 'กรุณาลองใหม่อีกครั้ง'}`);
                }
              }}
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>↩️ ยกเลิกบิลนี้ & คืนสต๊อกกลับ (Void / Return)</span>
            </button>

          </div>
        </div>
      )}

      {/* FULLSCREEN SLIP IMAGE PREVIEW MODAL */}
      {previewSlipModalUrl && (
        <div
          onClick={() => setPreviewSlipModalUrl(null)}
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg max-h-[90vh] bg-white p-3 rounded-2xl shadow-2xl flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between pb-2 px-2 border-b border-stone-200">
              <span className="font-serif font-black text-sm text-stone-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>รูปภาพหลักฐานการโอนเงิน / สลิป POS</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewSlipModalUrl(null)}
                className="p-1 rounded-full text-stone-600 hover:text-stone-950 hover:bg-stone-100 border border-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[80vh] p-2">
              <img
                src={previewSlipModalUrl}
                alt="สลิปหลักฐานการโอนเงิน POS"
                className="max-h-[75vh] w-auto object-contain rounded-xl mx-auto shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN PROMPTPAY QR ZOOM MODAL */}
      {isZoomQRModalOpen && qrCodeUrl && (
        <div
          onClick={() => setIsZoomQRModalOpen(false)}
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center space-y-3 border-4 border-amber-400"
          >
            <div className="w-full flex items-center justify-between pb-2 border-b border-stone-200">
              <span className="font-serif font-black text-sm text-stone-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-600" />
                <span>สแกนจ่ายผ่าน QR พร้อมเพย์</span>
              </span>
              <button
                type="button"
                onClick={() => setIsZoomQRModalOpen(false)}
                className="p-1 rounded-full text-stone-500 hover:text-stone-950 hover:bg-stone-100 border border-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              src={qrCodeUrl}
              alt="PromptPay QR Code"
              className="w-64 h-64 mx-auto border-2 border-amber-400 rounded-2xl p-2 bg-white shadow-lg"
            />

            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-600">ยอดที่ต้องชำระ</span>
              <div className="text-2xl font-serif font-black text-amber-700">
                ฿{(paymentMethod === 'gov_copay' ? customerPayAmount : netAmount).toLocaleString()}
              </div>
              <p className="text-[11px] font-bold text-stone-500">พร้อมเพย์: {storeSettings.promptPayNumber || '081-234-5678'}</p>
            </div>
          </div>
        </div>
      )}

      {/* LOT NUMBER & DAMAGED TAG SEARCH MODAL */}
      <LotSearchModal
        isOpen={isLotSearchModalOpen}
        onClose={() => setIsLotSearchModalOpen(false)}
        onOpenQRLabel={(prod, lot) => {
          setPosReprintProduct(prod);
          setPosReprintLot(lot);
        }}
        onSelectProductForPOS={(prod) => {
          handleQuickAddCard(prod);
        }}
      />

      {/* QUICK REPRINT MODAL FOR DAMAGED TAGS IN POS */}
      <ProductQRLabelModal
        product={posReprintProduct}
        isOpen={!!posReprintProduct}
        onClose={() => {
          setPosReprintProduct(null);
          setPosReprintLot(undefined);
        }}
        initialLotNumber={posReprintLot}
      />

      {/* REFUND & EXCHANGE MODAL */}
      <POSRefundExchangeModal
        isOpen={isRefundExchangeModalOpen}
        onClose={() => setIsRefundExchangeModalOpen(false)}
        currentBoothTransferId={selectedBoothTransferId}
      />

      {/* PRODUCT BARCODE & QR CODE SCANNER MODAL */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={handleQRScan}
        title="⚡ สแกน QR Code คิดเงิน POS (ยิงรัวต่อเนื่อง)"
        subtitle="นำกล้องส่องไปที่ป้ายสินค้าเพื่อยิงสินค้าลงตะกร้าคิดเงินอัตโนมัติ (ระบบเรียงรายการที่เพิ่งยิงลงมาให้เห็นชัดเจนทันที)"
        continuous={true}
        scannedFeed={posScannedFeed}
        onAdjustQuantity={handleAdjustFeedQty}
        onDeleteItem={handleDeleteFeedItem}
      />

      {/* SLIP MINI QR SCANNER MODAL (OPTION 2: SLIP VERIFY) */}
      <QRScannerModal
        isOpen={isSlipScannerOpen}
        onClose={() => setIsSlipScannerOpen(false)}
        onScan={handleScanSlipQR}
        title="🔍 สแกน Mini QR บนสลิปโอนเงิน (ตรวจสัญญาณเงินเข้า)"
        subtitle="นำกล้องหรือปืนยิงสแกนไปที่ QR เล็กๆ บนสลิปในมือถือของลูกค้า เพื่อตรวจความถูกต้องและยอดเงินจริงจากระบบธนาคารทันที"
        continuous={false}
      />

      {/* PERFUME 10ML DECANT LABEL MODAL */}
      <PerfumeDecantLabelModal
        isOpen={isPerfumeLabelModalOpen}
        onClose={() => setIsPerfumeLabelModalOpen(false)}
        cartItems={completedPOSOrder && posCart.length === 0 ? completedPOSOrder.items : posCart}
      />

      {/* QUICK SWITCH CASHIER MODAL */}
      {isSwitchCashierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 text-stone-950 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold">
                  🔄
                </div>
                <div>
                  <h3 className="font-serif font-black text-base text-stone-950">สลับพนักงานแคชเชียร์ POS</h3>
                  <p className="text-[11px] text-stone-500 font-bold">เลือกชื่อพนักงานเพื่อบันทึกชื่อลงในบิลขาย</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSwitchCashierModalOpen(false)}
                className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {switchStaffError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold">
                ⚠️ {switchStaffError}
              </div>
            )}

            {!selectedStaffToSwitch ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-stone-700">แตะเลือกพนักงานที่กำลังจะคิดเงิน:</p>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-stone-100">
                  {staffUsers
                    .filter((u) => u.isActive ?? u.active ?? true)
                    .map((user) => {
                      const isCur = currentStaff?.id === user.id;
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setSelectedStaffToSwitch(user);
                            setSwitchStaffPinInput('');
                            setSwitchStaffError('');
                          }}
                          className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                            isCur
                              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300/50'
                              : 'bg-stone-50 hover:bg-white border-stone-200 hover:border-amber-400'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-stone-950 text-amber-300 font-black text-xs flex items-center justify-center">
                              {user.name.slice(0, 1)}
                            </div>
                            <div>
                              <div className="font-black text-xs text-stone-950 flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isCur && (
                                  <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-sans">
                                    กำลังใช้อยู่
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-stone-500 font-bold">
                                {user.role === 'OWNER' ? '👑 เจ้าของร้าน' : '👤 พนักงานหน้าร้าน'}
                                {user.assignedBranch ? ` • ${user.assignedBranch}` : ''}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-blue-600">เลือก →</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const clean = switchStaffPinInput.trim();
                  if (clean === selectedStaffToSwitch.pin.trim() || clean === (storeSettings.adminPasscode || '1077').trim()) {
                    setCurrentStaff(selectedStaffToSwitch);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('huda_current_staff', JSON.stringify(selectedStaffToSwitch));
                      sessionStorage.setItem('huda_current_staff', JSON.stringify(selectedStaffToSwitch));
                    }
                    setIsSwitchCashierModalOpen(false);
                  } else {
                    setSwitchStaffError('รหัส PIN ไม่ถูกต้อง กรุณากรอกรหัส 4 หลักของพนักงานคนนี้');
                    setSwitchStaffPinInput('');
                  }
                }}
                className="space-y-4"
              >
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-stone-950 text-amber-300 font-black text-xs flex items-center justify-center">
                      {selectedStaffToSwitch.name.slice(0, 1)}
                    </div>
                    <div>
                      <span className="text-xs font-black text-stone-950 block">{selectedStaffToSwitch.name}</span>
                      <span className="text-[10px] text-stone-500 font-bold">
                        {selectedStaffToSwitch.role === 'OWNER' ? 'เจ้าของร้าน' : 'พนักงานหน้าร้าน'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStaffToSwitch(null)}
                    className="text-xs font-bold text-blue-700 underline cursor-pointer"
                  >
                    เปลี่ยนคน
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5 text-center">
                    กรุณากรอกรหัส PIN (4 หลัก) เพื่อยืนยันตัวตน:
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    placeholder="••••"
                    value={switchStaffPinInput}
                    onChange={(e) => setSwitchStaffPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-stone-50 border-2 border-stone-300 rounded-2xl py-3 text-center font-mono font-black text-2xl tracking-widest text-stone-950 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStaffToSwitch(null)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl border border-amber-500 shadow-md cursor-pointer"
                  >
                    ยืนยันสลับแคชเชียร์
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
