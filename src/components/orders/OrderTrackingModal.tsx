'use client';

import React, { useState } from 'react';
import { X, Search, PackageCheck, Truck, CheckCircle2, Clock, MapPin, ExternalLink } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Order } from '../../types';

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
        return <span className="bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold">ได้รับคำสั่งซื้อแล้ว</span>;
      case 'confirmed':
        return <span className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold">ยืนยันออเดอร์แล้ว</span>;
      case 'processing':
        return <span className="bg-blue-950/80 border border-blue-500/50 text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-bold">กำลังจัดเตรียมสินค้า</span>;
      case 'shipped':
        return <span className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold">จัดส่งสินค้าแล้ว</span>;
      case 'delivered':
        return <span className="bg-green-950/80 border border-green-500/50 text-green-300 text-xs px-2.5 py-0.5 rounded-full font-bold">ส่งถึงผู้รับเรียบร้อย</span>;
      default:
        return <span className="bg-gray-800 text-gray-400 text-xs px-2.5 py-0.5 rounded-full">ยกเลิก</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-dubai-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-dubai-card border-2 border-gold-400/50 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl text-white my-8">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-dubai-black border-b border-gold-400/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-gold-400" />
            <h3 className="font-serif font-bold text-lg text-white">
              ระบบติดตามสถานะคำสั่งซื้อ (Order Tracking)
            </h3>
          </div>
          <button
            onClick={() => setIsOrderTrackingOpen(false)}
            className="text-gold-400 hover:text-white p-2 rounded-full border border-gold-400/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="กรอกเลขคำสั่งซื้อ (เช่น HAD-...) หรือ เบอร์โทรศัพท์"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dubai-black border border-gold-400/40 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-400"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gold-400" />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-gold-500 hover:bg-gold-400 text-dubai-black font-bold text-xs rounded-xl transition shadow-gold-glow"
            >
              ค้นหาพัสดุ
            </button>
          </form>

          {/* Results Area */}
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            {(searchedOrders || orders).length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                ไม่พบรายการคำสั่งซื้อที่ค้นหา
              </div>
            ) : (
              (searchedOrders || orders).map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-dubai-black/70 border border-gold-400/30 rounded-xl space-y-3 font-sans text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold-400/20 pb-2">
                    <div>
                      <span className="font-mono font-bold text-gold-400 text-sm">
                        {order.id}
                      </span>
                      <span className="block text-[10px] text-gray-400">
                        สั่งซื้อเมื่อ: {new Date(order.createdAt).toLocaleString('th-TH')}
                      </span>
                    </div>
                    {getStatusBadge(order.orderStatus)}
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300">
                    <p><strong className="text-gold-300">ผู้สั่งซื้อ:</strong> {order.customerName}</p>
                    <p><strong className="text-gold-300">เบอร์โทร:</strong> {order.customerPhone}</p>
                    <p className="sm:col-span-2"><strong className="text-gold-300">ที่อยู่จัดส่ง:</strong> {order.customerAddress} {order.province} {order.postalCode}</p>
                  </div>

                  {/* Items list */}
                  <div className="bg-dubai-card/50 p-2.5 rounded-lg space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-gray-200">
                        <span>{item.productTitle} <span className="text-gold-400">({item.variantName})</span> x{item.quantity}</span>
                        <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="pt-1.5 border-t border-gold-400/20 flex justify-between font-serif font-bold text-gold-300 text-sm">
                      <span>ยอดรวมสุทธิ:</span>
                      <span>฿{order.netAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Courier & Tracking Number */}
                  {order.trackingNumber ? (
                    <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-lg flex items-center justify-between text-emerald-300">
                      <div>
                        <p className="font-bold flex items-center gap-1 text-sm">
                          <Truck className="w-4 h-4 text-emerald-400" />
                          <span>เลขพัสดุ: {order.trackingNumber}</span>
                        </p>
                        <p className="text-[10px] text-emerald-200/80">ขนส่งโดย: {order.courier || 'Flash Express'}</p>
                      </div>
                      <a
                        href={`https://flashexpress.co.th/tracking/?se=${order.trackingNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition"
                      >
                        <span>เช็คสถานะขนส่ง</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gold-400" />
                      <span>สถานะพัสดุ: ร้านค้ากำลังเตรียมจัดส่งและออกเลขพัสดุ</span>
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
