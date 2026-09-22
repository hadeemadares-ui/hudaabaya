'use client';

import React, { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, Eye, Edit3, X, ExternalLink, ShieldCheck, Trash2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Order } from '../../types';

export const AdminOrderManager: React.FC = () => {
  const { orders, updateOrderStatus, updateOrderPaymentStatus, deleteOrder } = useShop();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [courierInput, setCourierInput] = useState('Flash Express');

  const handleUpdateTracking = (orderId: string) => {
    if (!trackingInput.trim()) {
      alert('กรุณากรอกเลขพัสดุ');
      return;
    }
    updateOrderStatus(orderId, 'shipped', trackingInput.trim(), courierInput);
    alert('อัปเดตเลขพัสดุและเปลี่ยนสถานะเป็น "จัดส่งแล้ว" เรียบร้อยค่ะ');
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dubai-black p-4 rounded-xl border border-gold-400/30">
        <div>
          <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-gold-400" />
            <span>จัดการรายการสั่งซื้อและสลิปชำระเงิน (Order & Slip Manager)</span>
          </h3>
          <p className="text-xs text-gold-300/80">
            ตรวจสอบสลิปโอนเงิน อนุมัติการชำระเงิน และออกเลขพัสดุสำหรับจัดส่งให้ลูกค้า
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-dubai-card border border-gold-400/30 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-200">
            <thead className="bg-dubai-black text-gold-400 font-serif border-b border-gold-400/30">
              <tr>
                <th className="p-3">เลขคำสั่งซื้อ</th>
                <th className="p-3">ลูกค้า</th>
                <th className="p-3">รายการสินค้า & ไซส์</th>
                <th className="p-3">ยอดรวม</th>
                <th className="p-3">การชำระเงิน</th>
                <th className="p-3">สถานะออเดอร์</th>
                <th className="p-3 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-400/10">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    ยังไม่มีรายการสั่งซื้อเข้ามา (ยอดขาย ฿0)
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-dubai-black/40 transition">
                    <td className="p-3 font-mono font-bold text-gold-300">
                      {order.id}
                      <span className="block text-[10px] text-gray-400 font-sans">
                        {new Date(order.createdAt).toLocaleDateString('th-TH')}
                      </span>
                    </td>

                    <td className="p-3">
                      <strong className="text-white block">{order.customerName}</strong>
                      <span className="text-gray-400">{order.customerPhone}</span>
                    </td>

                    <td className="p-3 max-w-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="truncate">
                          • {item.productTitle} <span className="text-gold-400 font-bold">({item.variantName})</span> x{item.quantity}
                        </div>
                      ))}
                    </td>

                    <td className="p-3 font-serif font-bold text-gold-400 text-sm">
                      ฿{order.netAmount.toLocaleString()}
                    </td>

                    <td className="p-3">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded bg-dubai-black text-[10px] text-gold-300 font-mono uppercase border border-gold-400/20">
                          {order.paymentMethod}
                        </span>
                        <div>
                          {order.paymentStatus === 'paid' && (
                            <span className="text-[10px] text-emerald-400 font-bold">ชำระแล้ว</span>
                          )}
                          {order.paymentStatus === 'slip_uploaded' && (
                            <span className="text-[10px] text-amber-400 font-bold animate-pulse">แนบสลิปแล้ว/รอตรวจ</span>
                          )}
                          {order.paymentStatus === 'pending' && (
                            <span className="text-[10px] text-blue-400 font-bold">รอชำระเงิน/COD</span>
                          )}
                          {order.paymentStatus === 'rejected' && (
                            <span className="text-[10px] text-red-400 font-bold">ปฏิเสธสลิป</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.orderStatus === 'shipped'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setTrackingInput(order.trackingNumber || '');
                            setCourierInput(order.courier || 'Flash Express');
                          }}
                          className="px-2.5 py-1.5 bg-dubai-black border border-gold-400/40 hover:bg-gold-500 hover:text-dubai-black text-gold-300 font-bold rounded text-xs transition"
                        >
                          รายละเอียด / อัปเดต
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`คุณต้องการลบคำสั่งซื้อ #${order.id} ใช่หรือไม่?`)) {
                              deleteOrder(order.id);
                            }
                          }}
                          className="p-1.5 bg-red-950/60 border border-red-800/40 text-red-300 hover:text-red-100 rounded text-xs"
                          title="ลบคำสั่งซื้อนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Order Detail & Tracking Modal for Admin */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-dubai-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-dubai-card border-2 border-gold-400/50 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl text-white p-6 my-8 space-y-4">
            <div className="flex justify-between items-center border-b border-gold-400/30 pb-3">
              <h3 className="font-serif font-bold text-base text-gold-400">
                จัดการออเดอร์ #{selectedOrder.id}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gold-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Inspection */}
            {selectedOrder.slipImage && (
              <div className="p-3 bg-dubai-black rounded-xl border border-gold-400/30 space-y-2 text-xs">
                <p className="font-serif font-bold text-gold-300">สลิปการโอนเงินที่ลูกค้าแนบมา:</p>
                <div className="flex gap-4 items-center">
                  <img src={selectedOrder.slipImage} alt="slip" className="w-28 h-36 object-cover rounded border border-gold-400" />
                  <div className="space-y-2">
                    <p className="text-gray-300">สถานะ: <strong className="text-gold-400">{selectedOrder.paymentStatus}</strong></p>
                    <button
                      onClick={() => {
                        updateOrderPaymentStatus(selectedOrder.id, 'paid');
                        setSelectedOrder({ ...selectedOrder, paymentStatus: 'paid' });
                        alert('ยืนยันสลิปสำเร็จ! เปลี่ยนสถานะการชำระเงินเป็น "paid"');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg"
                    >
                      อนุมัติสลิปโอนเงินนี้
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Courier & Tracking Number */}
            <div className="p-3 bg-dubai-black rounded-xl border border-gold-400/30 space-y-3 text-xs">
              <p className="font-serif font-bold text-gold-300">ออกเลขพัสดุและจัดส่ง (Fulfillment):</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1 font-bold">บริษัทขนส่ง</label>
                  <select
                    value={courierInput}
                    onChange={(e) => setCourierInput(e.target.value)}
                    className="w-full bg-dubai-dark border border-gold-400/30 rounded p-2 text-white font-bold"
                  >
                    <option value="Flash Express">Flash Express</option>
                    <option value="Kerry Express">Kerry Express</option>
                    <option value="Thailand Post EMS">ไปรษณีย์ไทย EMS</option>
                    <option value="J&T Express">J&T Express</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-bold">เลขพัสดุ (Tracking Number)</label>
                  <input
                    type="text"
                    placeholder="เช่น TH0192837465"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="w-full bg-dubai-dark border border-gold-400/30 rounded p-2 text-gold-300 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Quick Auto-Generate Tracking Helper */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-gray-400 font-bold">สุ่มสร้างเลขด่วน:</span>
                <button
                  type="button"
                  onClick={() => {
                    setCourierInput('Flash Express');
                    setTrackingInput(`TH${Math.floor(1000000000 + Math.random() * 9000000000)}`);
                  }}
                  className="px-2 py-1 bg-amber-950 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold hover:bg-amber-900 transition"
                >
                  Flash (TH...)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCourierInput('Kerry Express');
                    setTrackingInput(`KER${Math.floor(10000000 + Math.random() * 90000000)}`);
                  }}
                  className="px-2 py-1 bg-orange-950 text-orange-300 border border-orange-500/40 rounded text-[10px] font-bold hover:bg-orange-900 transition"
                >
                  Kerry (KER...)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCourierInput('Thailand Post EMS');
                    setTrackingInput(`EF${Math.floor(100000009 + Math.random() * 899999990)}TH`);
                  }}
                  className="px-2 py-1 bg-red-950 text-red-300 border border-red-500/40 rounded text-[10px] font-bold hover:bg-red-900 transition"
                >
                  EMS (EF...TH)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCourierInput('J&T Express');
                    setTrackingInput(`84${Math.floor(1000000000 + Math.random() * 9000000000)}`);
                  }}
                  className="px-2 py-1 bg-red-950 text-red-400 border border-red-500/40 rounded text-[10px] font-bold hover:bg-red-900 transition"
                >
                  J&T (84...)
                </button>
              </div>

              <button
                onClick={() => handleUpdateTracking(selectedOrder.id)}
                className="w-full py-2.5 bg-gradient-to-r from-gold-500 to-amber-600 text-dubai-black font-extrabold rounded-xl text-xs shadow-gold-glow hover:scale-102 transition"
              >
                บันทึกเลขพัสดุ & เปลี่ยนสถานะเป็น "จัดส่งแล้ว"
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-dubai-dark text-gray-300 rounded font-bold text-xs"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
