'use client';

import React, { useState } from 'react';
import { X, Search, Truck, Clock, ExternalLink } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Order } from '../../types';
import { formatThaiDateTime } from '../../utils/dateUtils';

export const OrderTrackingModal: React.FC = () => {
  const { orders, isOrderTrackingOpen, setIsOrderTrackingOpen } = useShop();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrders, setSearchedOrders] = useState<Order[] | null>(null);

  if (!isOrderTrackingOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const term = searchQuery.trim().toLowerCase();
    const results = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(term) ||
        o.customerPhone.includes(term) ||
        o.customerName.toLowerCase().includes(term)
    );
    setSearchedOrders(results);
  };

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending':
        return <span className="bg-stone-100 border border-stone-300 text-stone-700 text-[11px] px-2.5 py-0.5 font-medium">ได้รับคำสั่งซื้อแล้ว</span>;
      case 'confirmed':
        return <span className="bg-[#FAF9F6] border border-[#8C703E] text-[#8C703E] text-[11px] px-2.5 py-0.5 font-medium">ยืนยันออเดอร์แล้ว</span>;
      case 'processing':
        return <span className="bg-[#FAF9F6] border border-[#8C703E] text-[#8C703E] text-[11px] px-2.5 py-0.5 font-medium">กำลังจัดเตรียมสินค้า</span>;
      case 'shipped':
        return <span className="bg-[#141312] text-white text-[11px] px-2.5 py-0.5 font-medium">จัดส่งสินค้าแล้ว</span>;
      case 'delivered':
        return <span className="bg-emerald-900 text-white text-[11px] px-2.5 py-0.5 font-medium">จัดส่งสำเร็จ</span>;
      default:
        return <span className="bg-stone-100 text-stone-400 text-[11px] px-2.5 py-0.5">ยกเลิก</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOrderTrackingOpen(false);
      }}
    >
      <div className="relative bg-white border border-stone-200 max-w-2xl w-full overflow-hidden shadow-2xl text-[#141312] my-8">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF9F6] border-b border-stone-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-serif tracking-[0.22em] uppercase text-[#8C703E]">
              ORDER TRACKING
            </p>
            <h3 className="font-serif font-normal text-lg text-[#141312] mt-0.5">
              ติดตามสถานะคำสั่งซื้อและพัสดุ
            </h3>
          </div>
          <button
            onClick={() => setIsOrderTrackingOpen(false)}
            className="text-stone-500 hover:text-[#141312] p-2 border border-stone-200 bg-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="หมายเลขคำสั่งซื้อ หรือ เบอร์โทรศัพท์ผู้รับ"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-stone-300 py-3 pl-10 pr-4 text-xs text-[#141312] placeholder-stone-400 focus:outline-none focus:border-[#141312]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#141312] hover:bg-[#292624] text-white text-xs tracking-wider uppercase transition cursor-pointer"
            >
              ค้นหา
            </button>
          </form>

          {/* Results Area */}
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            {(searchedOrders || orders).length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs border border-stone-100 bg-[#FAF9F6]">
                ไม่พบรายการคำสั่งซื้อที่ค้นหา
              </div>
            ) : (
              (searchedOrders || orders).map((order) => (
                <div
                  key={order.id}
                  className="p-5 bg-[#FAF9F6] border border-stone-200 space-y-3.5 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
                    <div>
                      <span className="font-mono font-semibold text-[#141312] text-sm">
                        {order.id}
                      </span>
                      <span className="block text-[11px] text-stone-500 mt-0.5">
                        วันที่สั่งซื้อ: {formatThaiDateTime(order.createdAt)}
                      </span>
                    </div>
                    {getStatusBadge(order.orderStatus)}
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-stone-600">
                    <p><span className="text-stone-400">ผู้รับ:</span> <strong className="text-[#141312] font-medium">{order.customerName}</strong></p>
                    <p><span className="text-stone-400">โทรศัพท์:</span> <strong className="text-[#141312] font-medium">{order.customerPhone}</strong></p>
                    <p className="sm:col-span-2"><span className="text-stone-400">ที่อยู่จัดส่ง:</span> {order.customerAddress} {order.province} {order.postalCode}</p>
                  </div>

                  {/* Items list */}
                  <div className="bg-white p-3.5 border border-stone-200/80 space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[#141312]">
                        <span>{item.productTitle} <span className="text-stone-500">({item.variantName})</span> × {item.quantity}</span>
                        <span className="font-mono">฿{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-stone-100 flex justify-between font-serif font-semibold text-[#141312] text-sm">
                      <span>ยอดชำระสุทธิ</span>
                      <span>฿{order.netAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Courier & Tracking Number */}
                  {order.trackingNumber ? (
                    <div className="bg-white border border-stone-300 p-3.5 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#141312] flex items-center gap-1.5 text-xs">
                          <Truck className="w-4 h-4 text-[#8C703E]" />
                          <span>หมายเลขพัสดุ: <strong className="font-mono">{order.trackingNumber}</strong></span>
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5">จัดส่งโดย: {order.courier || 'Flash Express'}</p>
                      </div>
                      <a
                        href={`https://flashexpress.co.th/tracking/?se=${order.trackingNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-[#141312] hover:bg-[#292624] text-white text-[11px] tracking-wider uppercase flex items-center gap-1.5 transition"
                      >
                        <span>ตรวจสอบสถานะ</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#8C703E]" />
                      <span>อยู่ระหว่างจัดเตรียมสินค้าและออกหมายเลขพัสดุ</span>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

