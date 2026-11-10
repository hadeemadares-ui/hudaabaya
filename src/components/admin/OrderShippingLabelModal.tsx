'use client';

import React, { useState, useEffect } from 'react';
import { X, Printer, Package, Truck, CheckCircle2, QrCode, Tag, Sparkles, Building, Phone, MapPin } from 'lucide-react';
import QRCode from 'qrcode';
import { Order } from '../../types';

interface OrderShippingLabelModalProps {
  order: Order | null;
  onClose: () => void;
  storeSettings: {
    storeName?: string;
    contactPhone?: string;
    address?: string;
    lineId?: string;
    promptPayNumber?: string;
  };
}

/**
 * Standard Code 39 Barcode Generator (Vector SVG)
 * Supports uppercase letters, digits, and hyphens
 */
const CODE39_PATTERNS: Record<string, string> = {
  '0': 'bwbwwwbbw', '1': 'bbbwwwbwb', '2': 'bwbwwwbbb', '3': 'bbbwwwbbb',
  '4': 'bwbwwwbbb', '5': 'bbbwwwbwb', '6': 'bwbwwwbbb', '7': 'bwbwwwbbb',
  '8': 'bbbwwwbwb', '9': 'bwbwwwbbb', 'A': 'bbwwbwbwb', 'B': 'bwbbwbwbw',
  'C': 'bbbbwbwbw', 'D': 'bwwbbbwbw', 'E': 'bbwbbbwbw', 'F': 'bwbbbbwbw',
  'G': 'bwwbwwbbb', 'H': 'bbwbwwbbb', 'I': 'bwbbwwbbb', 'J': 'bwwbbwbbb',
  'K': 'bbwbwbwwb', 'L': 'bwbbwbwwb', 'M': 'bbbbwbwwb', 'N': 'bwwbbwbww',
  'O': 'bbwbbwbww', 'P': 'bwbbbbwbw', 'Q': 'bwwbwwbbw', 'R': 'bbwbwwbbw',
  'S': 'bwbbwwbbw', 'T': 'bwwbbwwbb', 'U': 'bbwwbwbww', 'V': 'bwbbwbwwb',
  'W': 'bbbbwbwwb', 'X': 'bwwbbbwbw', 'Y': 'bbwbbbwbw', 'Z': 'bwbbbbwbw',
  '-': 'bwwbwbwwb', '.': 'bbwwbwbww', ' ': 'bwbbwbwwb', '$': 'bwbwbwbww',
  '/': 'bwbwbwwbw', '+': 'bwbwwbwbw', '%': 'bwwbwbwbw', '*': 'bwwbbwbwb'
};

const renderCode39Svg = (rawText: string, height: number = 48): string => {
  const sanitized = `*${rawText.toUpperCase().replace(/[^0-9A-Z\-.$/+% ]/g, '')}*`;
  let x = 0;
  const rects: string[] = [];

  for (let i = 0; i < sanitized.length; i++) {
    const char = sanitized[i];
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS['*'];
    for (let j = 0; j < pattern.length; j++) {
      const isBar = pattern[j] === 'b';
      const width = (j % 2 === 0) ? (isBar ? 2.4 : 1.2) : (isBar ? 2.4 : 1.2);
      if (isBar) {
        rects.push(`<rect x="${x}" y="0" width="${width}" height="${height}" fill="#000" />`);
      }
      x += width;
    }
    x += 2; // inter-character gap
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x} ${height}" preserveAspectRatio="none" style="width: 100%; height: ${height}px;">${rects.join('')}</svg>`;
};

export const OrderShippingLabelModal: React.FC<OrderShippingLabelModalProps> = ({
  order,
  onClose,
  storeSettings,
}) => {
  const [labelSize, setLabelSize] = useState<'100x150' | 'A4' | '80x100'>('100x150');
  const [showPackingList, setShowPackingList] = useState<boolean>(true);
  const [showShopBranding, setShowShopBranding] = useState<boolean>(true);
  const [customNote, setCustomNote] = useState<string>('ขอบคุณที่อุดหนุน HUDA ABAYA • ได้รับสินค้าแล้วอย่าลืมถ่ายคลิปวิดีโอขณะแกะกล่องนะคะ');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const trackingNumber = order?.trackingNumber || `TH${order?.id.replace(/[^0-9]/g, '').slice(-9) || '990182736'}`;
  const courierName = order?.courier || 'Flash Express';
  const isCOD = order?.paymentMethod === 'cod';

  // Generate QR Code for Tracking
  useEffect(() => {
    if (!order) return;
    const qrContent = order.trackingNumber
      ? `https://track.thailandpost.co.th/?trackNumber=${order.trackingNumber}`
      : `ORDER:${order.id}|TEL:${order.customerPhone}`;

    QRCode.toDataURL(qrContent, {
      width: 120,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [order]);

  if (!order) return null;

  // Split postal code into individual digit boxes
  const postalDigits = (order.postalCode || '10530').replace(/\s/g, '').split('');

  // Sender details
  const senderName = storeSettings.storeName || 'HUDA ABAYA DUBAI (ฮูดา อาบายะห์)';
  const senderPhone = storeSettings.contactPhone || '083-427-4687';
  const senderAddress = storeSettings.address || 'เลขที่ 45/2 ถ.เลียบวารี แขวงโคกแฝด เขตหนองจอก กรุงเทพฯ 10530';

  // Full Receiver Address
  const fullReceiverAddress = [
    order.customerAddress,
    order.subDistrict ? `ต./แขวง ${order.subDistrict}` : '',
    order.district ? `อ./เขต ${order.district}` : '',
    order.province ? `จ.${order.province}` : '',
  ].filter(Boolean).join(' ');

  // Direct print via isolated iframe (100% clean, no browser headers/footers)
  const handlePrint = () => {
    const oldIframe = document.getElementById('huda-shipping-label-iframe');
    if (oldIframe) oldIframe.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'huda-shipping-label-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const widthMm = labelSize === '100x150' ? 100 : labelSize === '80x100' ? 80 : 210;
    const heightMm = labelSize === '100x150' ? 150 : labelSize === '80x100' ? 100 : 297;

    const barcodeSvg = renderCode39Svg(trackingNumber, 44);

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>ใบปะหน้าพัสดุ #${order.id}</title>
        <style>
          @page {
            size: ${widthMm}mm ${heightMm}mm;
            margin: 0 !important;
          }
          @media print {
            body {
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Sarabun", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #000;
          }
          body {
            width: ${widthMm}mm;
            height: ${heightMm}mm;
            padding: 3mm;
            background: #fff;
          }
          .label-container {
            width: 100%;
            height: 100%;
            border: 2px solid #000;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            font-size: 11px;
            line-height: 1.35;
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #000;
            padding: 4px 6px;
            background: #fff;
          }
          .courier-badge {
            font-size: 14px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .order-id-badge {
            font-size: 10px;
            font-weight: 700;
            font-family: monospace;
          }
          .barcode-section {
            border-bottom: 2px solid #000;
            padding: 4px 8px;
            text-align: center;
          }
          .barcode-number {
            font-size: 12px;
            font-weight: 900;
            font-family: monospace;
            letter-spacing: 2px;
            margin-top: 2px;
          }
          .address-section {
            display: flex;
            border-bottom: 2px solid #000;
            flex: 1;
            min-height: 0;
          }
          .sender-col {
            width: 42%;
            border-right: 1.5px solid #000;
            padding: 4px 6px;
            font-size: 9.5px;
            background: #fafafa;
          }
          .receiver-col {
            width: 58%;
            padding: 4px 7px;
            font-size: 11px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .section-title {
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            color: #333;
            margin-bottom: 2px;
            display: block;
          }
          .receiver-name {
            font-size: 13px;
            font-weight: 900;
          }
          .receiver-phone {
            font-size: 13px;
            font-weight: 900;
            font-family: monospace;
            margin-bottom: 3px;
          }
          .postal-boxes {
            display: flex;
            gap: 3px;
            margin-top: 5px;
          }
          .postal-digit {
            width: 20px;
            height: 24px;
            border: 1.5px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 900;
            font-family: monospace;
          }
          .cod-banner {
            background: #000;
            color: #fff;
            padding: 4px 8px;
            font-size: 15px;
            font-weight: 900;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #000;
          }
          .cod-banner * {
            color: #fff !important;
          }
          .prepaid-banner {
            background: #f0f0f0;
            color: #000;
            padding: 3px 8px;
            font-size: 10px;
            font-weight: 800;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1.5px solid #000;
          }
          .items-section {
            border-bottom: 1.5px solid #000;
            padding: 4px 6px;
            font-size: 9.5px;
            background: #fff;
          }
          .item-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1px;
          }
          .footer-section {
            padding: 3px 6px;
            font-size: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fff;
          }
        </style>
      </head>
      <body>
        <div class="label-container">
          <!-- Top Courier & Order ID -->
          <div class="header-row">
            <div class="courier-badge">🚚 ${courierName}</div>
            <div class="order-id-badge">ORDER: #${order.id}</div>
          </div>

          <!-- Barcode Section -->
          <div class="barcode-section">
            ${barcodeSvg}
            <div class="barcode-number">${trackingNumber}</div>
          </div>

          <!-- Address Section (Sender & Receiver) -->
          <div class="address-section">
            <div class="sender-col">
              <span class="section-title">ผู้ส่ง (FROM):</span>
              <div style="font-weight: 800;">${senderName}</div>
              <div>โทร: ${senderPhone}</div>
              <div style="color: #444; margin-top: 2px;">${senderAddress}</div>
            </div>

            <div class="receiver-col">
              <div>
                <span class="section-title">ผู้รับ (TO):</span>
                <div class="receiver-name">${order.customerName}</div>
                <div class="receiver-phone">📞 ${order.customerPhone}</div>
                <div style="font-weight: 600; line-height: 1.3;">${fullReceiverAddress}</div>
              </div>

              <div>
                <div class="postal-boxes">
                  ${postalDigits.map(d => `<div class="postal-digit">${d}</div>`).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Status / COD Banner -->
          ${isCOD ? `
            <div class="cod-banner">
              <span>💰 เก็บเงินปลายทาง (COD)</span>
              <span style="font-size: 17px; font-family: monospace;">฿${order.netAmount.toLocaleString()}</span>
            </div>
          ` : `
            <div class="prepaid-banner">
              <span>✅ ชำระเงินเรียบร้อยแล้ว (ไม่ต้องเก็บเงินปลายทาง)</span>
              <span>ยอดสุทธิ ฿${order.netAmount.toLocaleString()}</span>
            </div>
          `}

          <!-- Packing Checklist Items -->
          ${showPackingList ? `
            <div class="items-section">
              <div style="font-weight: 900; margin-bottom: 2px;">📦 รายการสินค้าในกล่อง (Packing Checklist):</div>
              ${order.items.map(item => `
                <div class="item-line">
                  <span>[  ] ${item.productTitle} ${item.variantName ? `(${item.variantName})` : ''}</span>
                  <span style="font-weight: 800;">× ${item.quantity}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Footer & Thank You -->
          <div class="footer-section">
            <div style="max-width: 82%;">
              ${customNote}
            </div>
            ${qrCodeDataUrl ? `
              <img src="${qrCodeDataUrl}" style="width: 28px; height: 28px; object-fit: contain;" />
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    doc.open();
    doc.write(printHtml);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-2xl w-full max-h-[94vh] flex flex-col text-stone-950 shadow-2xl text-left overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b-2 border-amber-300 p-4 sm:p-5 shrink-0 bg-amber-50/70">
          <div>
            <span className="text-[10px] font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-400">
              ออเดอร์ #{order.id}
            </span>
            <h3 className="font-serif font-black text-base sm:text-lg text-amber-950 flex items-center gap-2 mt-1">
              <Printer className="w-5 h-5 text-amber-700 shrink-0" />
              <span>พิมพ์ใบปะหน้ากล่องพัสดุ (Shipping Label / Waybill)</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-700 hover:text-stone-950 p-1.5 rounded-full border border-stone-300 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-3 sm:p-4 bg-stone-50 border-b border-stone-200 space-y-2.5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-black text-stone-700">ขนาดสติ๊กเกอร์:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLabelSize('100x150')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer border ${
                    labelSize === '100x150'
                      ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  ⚡ 100 × 150 mm (4×6 นิ้ว ม้วนความร้อน)
                </button>
                <button
                  type="button"
                  onClick={() => setLabelSize('A4')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer border ${
                    labelSize === 'A4'
                      ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  📄 A4
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 font-bold cursor-pointer text-stone-800">
                <input
                  type="checkbox"
                  checked={showPackingList}
                  onChange={(e) => setShowPackingList(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>รายการของในกล่อง (Checklist)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Live Label Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-stone-100 flex justify-center">
          <div className="w-full max-w-[420px] bg-white border-2 border-stone-900 rounded-xl shadow-lg p-3.5 space-y-2.5 text-stone-950 text-xs font-sans">
            
            {/* Header: Courier & Order # */}
            <div className="flex items-center justify-between border-b-2 border-stone-900 pb-2">
              <div className="flex items-center gap-1.5">
                <Truck className="w-5 h-5 text-stone-900" />
                <span className="font-black text-base uppercase tracking-tight">{courierName}</span>
              </div>
              <span className="font-mono text-xs font-black text-stone-700">#{order.id}</span>
            </div>

            {/* Barcode Mock */}
            <div className="border-b-2 border-stone-900 pb-2 text-center">
              <div
                dangerouslySetInnerHTML={{ __html: renderCode39Svg(trackingNumber, 44) }}
                className="w-full h-11 flex justify-center"
              />
              <div className="font-mono font-black text-sm tracking-widest mt-1">
                {trackingNumber}
              </div>
            </div>

            {/* Addresses Grid */}
            <div className="grid grid-cols-5 border-b-2 border-stone-900 divide-x-2 divide-stone-900">
              {/* Sender (40%) */}
              <div className="col-span-2 pr-2.5 text-[10px] space-y-0.5 bg-stone-50/70 p-1.5 rounded-l">
                <span className="font-black text-stone-500 block uppercase text-[9px]">ผู้ส่ง (FROM):</span>
                <strong className="block text-stone-950 font-black">{senderName}</strong>
                <div>โทร: {senderPhone}</div>
                <div className="text-stone-600 line-clamp-3">{senderAddress}</div>
              </div>

              {/* Receiver (60%) */}
              <div className="col-span-3 pl-2.5 p-1.5 space-y-1">
                <span className="font-black text-stone-500 block uppercase text-[9px]">ผู้รับ (TO):</span>
                <div className="text-sm font-black text-stone-950">{order.customerName}</div>
                <div className="font-mono text-xs font-black text-stone-900">📞 {order.customerPhone}</div>
                <div className="text-xs font-medium text-stone-800 leading-tight">
                  {fullReceiverAddress}
                </div>
                {/* Postal Code Digits */}
                <div className="pt-1.5 flex items-center gap-1">
                  {postalDigits.map((digit, idx) => (
                    <span
                      key={idx}
                      className="w-6 h-7 rounded border-2 border-stone-900 flex items-center justify-center font-mono font-black text-sm bg-stone-50 shadow-2xs"
                    >
                      {digit}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* COD / Payment Banner */}
            {isCOD ? (
              <div className="bg-stone-950 text-white p-2 rounded-lg flex items-center justify-between font-black text-sm border-2 border-stone-950 shadow-xs">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span>💰 เก็บเงินปลายทาง (COD)</span>
                </span>
                <span className="font-mono text-base text-amber-300">
                  ฿{order.netAmount.toLocaleString()}
                </span>
              </div>
            ) : (
              <div className="bg-emerald-50 text-emerald-950 border border-emerald-300 p-2 rounded-lg flex items-center justify-between font-black text-xs">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>✅ ชำระเงินเรียบร้อยแล้ว (ไม่ต้องเก็บเงินปลายทาง)</span>
                </span>
                <span className="font-mono font-extrabold text-stone-800">฿{order.netAmount.toLocaleString()}</span>
              </div>
            )}

            {/* Packing Checklist */}
            {showPackingList && (
              <div className="border border-stone-300 bg-stone-50/80 rounded-lg p-2 space-y-1 text-[11px]">
                <div className="font-black text-stone-900 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-amber-700" />
                  <span>รายการสินค้าในกล่อง (Packing Checklist):</span>
                </div>
                <div className="divide-y divide-stone-200">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 text-stone-800">
                      <span className="truncate pr-2 font-medium">
                        ☐ {item.productTitle} {item.variantName ? `(${item.variantName})` : ''}
                      </span>
                      <strong className="font-mono font-black shrink-0 text-stone-950">× {item.quantity}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-stone-200 text-[10px] text-stone-600">
              <span className="truncate max-w-[80%] font-medium">{customNote}</span>
              {qrCodeDataUrl && (
                <img src={qrCodeDataUrl} alt="QR" className="w-7 h-7 object-contain rounded" />
              )}
            </div>

          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-3 sm:p-4 border-t-2 border-amber-300 bg-stone-50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black rounded-xl text-sm shadow-md border-2 border-amber-500 flex items-center gap-2 cursor-pointer transition hover:scale-102"
          >
            <Printer className="w-4 h-4 text-stone-950" />
            <span>🖨️ สั่งพิมพ์ใบปะหน้าทันที (1 คลิก)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
