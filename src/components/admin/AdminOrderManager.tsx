'use client';

import React, { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, Eye, EyeOff, Edit3, X, ExternalLink, ShieldCheck, Trash2, Lock, KeyRound, AlertCircle } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Order } from '../../types';
import { VoiceInputButton } from '../common/VoiceInputButton';

export const AdminOrderManager: React.FC = () => {
  const { orders, updateOrderStatus, updateOrderPaymentStatus, deleteOrder, verifyAdminPasscode } = useShop();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [courierInput, setCourierInput] = useState('Flash Express');

  // Admin PIN verification modal for deleting order
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [pinError, setPinError] = useState('');

  const handleConfirmDeleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToDelete) return;

    const trimmedPin = adminPinInput.trim();
    if (!trimmedPin) {
      setPinError('กรุณากรอกรหัสผ่าน Admin เพื่อยืนยันการลบ');
      return;
    }

    const isValid = verifyAdminPasscode(trimmedPin);
    if (!isValid) {
      setPinError('รหัสผ่าน Admin ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      return;
    }

    deleteOrder(orderToDelete.id);
    alert(`ลบคำสั่งซื้อ #${orderToDelete.id} เรียบร้อยแล้ว!`);
    setOrderToDelete(null);
    setAdminPinInput('');
    setPinError('');
    setShowAdminPin(false);
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 p-4 rounded-2xl border-2 border-amber-400/50 shadow-md">
        <div>
          <h3 className="font-serif font-extrabold text-lg sm:text-xl text-amber-300 flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" />
            <span>จัดการรายการสั่งซื้อและสลิปชำระเงิน (Order & Slip Manager)</span>
          </h3>
          <p className="text-xs text-white font-bold mt-1">
            ตรวจสอบสลิปโอนเงิน อนุมัติการชำระเงิน และออกเลขพัสดุสำหรับจัดส่งให้ลูกค้า
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-stone-950 border-2 border-amber-400/40 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-white">
            <thead className="bg-stone-900 text-amber-300 font-serif border-b-2 border-amber-400/50 text-xs sm:text-sm">
              <tr>
                <th className="p-3.5 font-extrabold">เลขคำสั่งซื้อ</th>
                <th className="p-3.5 font-extrabold">ลูกค้า</th>
                <th className="p-3.5 font-extrabold">รายการสินค้า & ไซส์</th>
                <th className="p-3.5 font-extrabold">ยอดรวม</th>
                <th className="p-3.5 font-extrabold">การชำระเงิน</th>
                <th className="p-3.5 font-extrabold">สถานะออเดอร์</th>
                <th className="p-3.5 text-center font-extrabold">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-400/20">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-amber-200 font-extrabold text-sm">
                    ยังไม่มีรายการสั่งซื้อเข้ามา (ยอดขาย ฿0)
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-900/60 transition">
                    <td className="p-3.5 font-mono font-extrabold text-amber-300 text-xs sm:text-sm">
                      {order.id}
                      <span className="block text-[11px] text-stone-200 font-sans font-bold mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('th-TH')}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <strong className="text-white block font-extrabold text-xs sm:text-sm">{order.customerName}</strong>
                      <span className="text-amber-200 font-bold font-mono text-xs">{order.customerPhone}</span>
                    </td>

                    <td className="p-3.5 max-w-xs space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="truncate text-stone-100 font-bold text-xs">
                          • {item.productTitle} <span className="text-amber-300 font-extrabold">({item.variantName})</span> x{item.quantity}
                        </div>
                      ))}
                    </td>

                    <td className="p-3.5 font-serif font-extrabold text-amber-300 text-sm sm:text-base">
                      ฿{order.netAmount.toLocaleString()}
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        <span className="px-2.5 py-1 rounded-lg bg-stone-900 text-xs text-amber-300 font-mono uppercase font-extrabold border border-amber-400/40 inline-block">
                          {order.paymentMethod}
                        </span>
                        <div>
                          {order.paymentStatus === 'paid' && (
                            <span className="text-xs text-emerald-400 font-extrabold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/50">ชำระแล้ว</span>
                          )}
                          {order.paymentStatus === 'slip_uploaded' && (
                            <span className="text-xs text-amber-300 font-extrabold bg-amber-950 px-2 py-0.5 rounded border border-amber-500/50 animate-pulse">แนบสลิปแล้ว/รอตรวจ</span>
                          )}
                          {order.paymentStatus === 'pending' && (
                            <span className="text-xs text-cyan-300 font-extrabold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/50">รอชำระเงิน/COD</span>
                          )}
                          {order.paymentStatus === 'rejected' && (
                            <span className="text-xs text-red-300 font-extrabold bg-red-950 px-2 py-0.5 rounded border border-red-500/50">ปฏิเสธสลิป</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold inline-block ${
                        order.orderStatus === 'shipped'
                          ? 'bg-emerald-950 text-emerald-300 border-2 border-emerald-500/60'
                          : 'bg-amber-950 text-amber-300 border-2 border-amber-500/60'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setTrackingInput(order.trackingNumber || '');
                            setCourierInput(order.courier || 'Flash Express');
                          }}
                          className="px-3 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 font-extrabold rounded-xl text-xs hover:scale-105 transition shadow cursor-pointer border border-amber-300"
                        >
                          รายละเอียด / อัปเดต
                        </button>
                        <button
                          onClick={() => {
                            setOrderToDelete(order);
                            setAdminPinInput('');
                            setShowAdminPin(false);
                            setPinError('');
                          }}
                          className="p-2 bg-red-950 border-2 border-red-600/70 text-red-200 hover:text-white rounded-xl text-xs transition cursor-pointer"
                          title="ลบเฉพาะคำสั่งซื้อนี้ออกจากระบบ (ต้องใส่รหัส Admin)"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-stone-950 border-2 border-amber-400 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl text-white p-6 my-8 space-y-4">
            <div className="flex justify-between items-center border-b-2 border-amber-400/40 pb-3">
              <h3 className="font-serif font-extrabold text-lg text-amber-300">
                จัดการออเดอร์ #{selectedOrder.id}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-amber-300 hover:text-white p-1 rounded-full border border-amber-400/30">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Inspection */}
            {selectedOrder.slipImage && (
              <div className="p-4 bg-stone-900 rounded-2xl border-2 border-amber-400/40 space-y-3 text-xs">
                <p className="font-serif font-extrabold text-amber-300 text-sm">สลิปการโอนเงินที่ลูกค้าแนบมา:</p>
                <div className="flex gap-4 items-center">
                  <img src={selectedOrder.slipImage} alt="slip" className="w-28 h-36 object-cover rounded-xl border-2 border-amber-400 shadow-md" />
                  <div className="space-y-2">
                    <p className="text-white font-bold text-xs">สถานะ: <strong className="text-amber-300 font-extrabold">{selectedOrder.paymentStatus}</strong></p>
                    <button
                      onClick={() => {
                        updateOrderPaymentStatus(selectedOrder.id, 'paid');
                        setSelectedOrder({ ...selectedOrder, paymentStatus: 'paid' });
                        alert('ยืนยันสลิปสำเร็จ! เปลี่ยนสถานะการชำระเงินเป็น "paid"');
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-stone-950 font-extrabold text-xs rounded-xl shadow cursor-pointer border border-emerald-300"
                    >
                      อนุมัติสลิปโอนเงินนี้
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Courier & Tracking Number */}
            <div className="p-4 bg-stone-900 rounded-2xl border-2 border-amber-400/40 space-y-3 text-xs">
              <p className="font-serif font-extrabold text-amber-300 text-sm">ออกเลขพัสดุและจัดส่ง (Fulfillment):</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-200 mb-1 font-extrabold text-xs">บริษัทขนส่ง</label>
                  <select
                    value={courierInput}
                    onChange={(e) => setCourierInput(e.target.value)}
                    className="w-full bg-stone-950 border-2 border-amber-400/60 rounded-xl p-2.5 text-white font-extrabold text-xs focus:outline-none focus:border-amber-400 shadow-inner"
                  >
                    <option value="Flash Express" className="bg-stone-900 text-white font-bold py-2">Flash Express</option>
                    <option value="Kerry Express" className="bg-stone-900 text-white font-bold py-2">Kerry Express</option>
                    <option value="Thailand Post EMS" className="bg-stone-900 text-white font-bold py-2">ไปรษณีย์ไทย EMS</option>
                    <option value="J&T Express" className="bg-stone-900 text-white font-bold py-2">J&T Express</option>
                  </select>
                </div>

                <div>
                  <label className="block text-amber-200 mb-1 font-extrabold text-xs">เลขพัสดุ (Tracking Number)</label>
                  <input
                    type="text"
                    placeholder="เช่น TH0192837465"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="w-full bg-stone-950 border-2 border-amber-400/60 rounded-xl p-2.5 text-amber-300 font-mono font-extrabold text-xs focus:outline-none focus:border-amber-400 shadow-inner"
                  />
                </div>
              </div>

              {/* Quick Auto-Generate Tracking Helper */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs text-stone-200 font-extrabold">สุ่มสร้างเลขด่วน:</span>
                <button
                  type="button"
                  onClick={() => {
                    setCourierInput('Flash Express');
                    setTrackingInput(`TH${Math.floor(1000000000 + Math.random() * 9000000000)}`);
                  }}
                  className="px-2.5 py-1 bg-amber-950 text-amber-200 border border-amber-400/60 rounded-lg text-xs font-extrabold hover:bg-amber-900 transition"
                >
                  Flash (TH...)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCourierInput('Kerry Express');
                    setTrackingInput(`KER${Math.floor(10000000 + Math.random() * 90000000)}`);
                  }}
                  className="px-2.5 py-1 bg-orange-950 text-orange-200 border border-orange-400/60 rounded-lg text-xs font-extrabold hover:bg-orange-900 transition"
                >
                  Kerry (KER...)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCourierInput('Thailand Post EMS');
                    setTrackingInput(`EF${Math.floor(100000009 + Math.random() * 899999990)}TH`);
                  }}
                  className="px-2.5 py-1 bg-red-950 text-red-200 border border-red-400/60 rounded-lg text-xs font-extrabold hover:bg-red-900 transition"
                >
                  EMS (EF...TH)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCourierInput('J&T Express');
                    setTrackingInput(`84${Math.floor(1000000000 + Math.random() * 9000000000)}`);
                  }}
                  className="px-2.5 py-1 bg-red-950 text-red-300 border border-red-400/60 rounded-lg text-xs font-extrabold hover:bg-red-900 transition"
                >
                  J&T (84...)
                </button>
              </div>

              <button
                onClick={() => handleUpdateTracking(selectedOrder.id)}
                className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-stone-950 font-extrabold rounded-xl text-xs sm:text-sm shadow-md hover:scale-102 transition cursor-pointer border border-amber-300"
              >
                บันทึกเลขพัสดุ & เปลี่ยนสถานะเป็น "จัดส่งแล้ว"
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-extrabold text-xs transition border border-stone-600"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Passcode Verification Modal for Deleting Order */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border-2 border-red-500 rounded-3xl max-w-md w-full p-5 sm:p-6 text-stone-950 shadow-2xl space-y-4 text-left animate-scale-up">
            <div className="flex justify-between items-center border-b-2 border-red-200 pb-3">
              <div className="flex items-center gap-2.5 text-red-600">
                <div className="p-2 bg-red-100 rounded-xl border border-red-300">
                  <Lock className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base text-stone-950">
                    ยืนยันลบคำสั่งซื้อ (ต้องใส่รหัส Admin)
                  </h3>
                  <span className="text-[10px] text-red-600 font-extrabold block">
                    Security Passcode Required
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOrderToDelete(null);
                  setAdminPinInput('');
                  setPinError('');
                }}
                className="text-stone-500 hover:text-stone-950 p-1.5 rounded-full border border-stone-300 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Preview Card */}
            <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-bold">เลขที่ออเดอร์ (ID):</span>
                <span className="font-black text-amber-950 font-mono text-sm">#{orderToDelete.id}</span>
              </div>
              <div className="flex items-center justify-between border-t border-red-200/60 pt-1.5">
                <span className="text-stone-600 font-bold">วันที่ / เวลา:</span>
                <span className="font-bold text-stone-900">{new Date(orderToDelete.createdAt).toLocaleString('th-TH')}</span>
              </div>
              <div className="flex items-center justify-between border-t border-red-200/60 pt-1.5">
                <span className="text-stone-600 font-bold">ลูกค้า:</span>
                <span className="font-black text-stone-950">{orderToDelete.customerName || 'ลูกค้าหน้าร้าน'}</span>
              </div>
              <div className="flex items-start justify-between gap-2 border-t border-red-200/60 pt-1.5">
                <span className="text-stone-600 font-bold shrink-0">รายการสินค้า:</span>
                <span className="font-bold text-stone-900 text-right truncate max-w-[200px]" title={orderToDelete.items.map((it) => `${it.productTitle} (${it.variantName}) x${it.quantity}`).join(', ')}>
                  {orderToDelete.items.map((it) => `${it.productTitle} (${it.variantName}) x${it.quantity}`).join(', ')}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-red-200/60 pt-1.5">
                <span className="text-stone-600 font-bold">ยอดขายสุทธิ:</span>
                <span className="font-black text-amber-900 text-sm font-serif">฿{orderToDelete.netAmount.toLocaleString()} ({orderToDelete.paymentMethod || 'เงินสด'})</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-bold">
              *คำเตือน: ข้อมูลคำสั่งซื้อและประวัติการชำระเงินของออเดอร์นี้จะถูกลบออกจากระบบอย่างถาวร (ไม่กระทบสินค้าในคลัง)
            </p>

            {/* Admin Password Form */}
            <form onSubmit={handleConfirmDeleteOrder} className="space-y-3 pt-1">
              <div>
                <label className="block text-stone-950 font-black mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-red-600" />
                    <span>ใส่รหัสผ่าน Admin เพื่อยืนยันการลบ *</span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-bold">
                    (รหัสเริ่มต้น: 1077)
                  </span>
                </label>

                <div className="relative flex items-center">
                  <input
                    type={showAdminPin ? 'text' : 'password'}
                    required
                    autoFocus
                    value={adminPinInput}
                    onChange={(e) => {
                      setAdminPinInput(e.target.value);
                      setPinError('');
                    }}
                    placeholder="กรอกรหัส Admin เช่น 1077"
                    className="w-full bg-white border-2 border-red-400 rounded-xl p-3 pr-20 text-stone-950 font-mono font-black text-center text-lg tracking-widest focus:outline-none focus:border-red-600 shadow-inner"
                  />

                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowAdminPin((prev) => !prev)}
                      className="p-1.5 text-stone-500 hover:text-stone-950 rounded-lg cursor-pointer"
                      title={showAdminPin ? 'ซ่อนรหัส' : 'แสดงรหัส'}
                    >
                      {showAdminPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <VoiceInputButton
                      isNumber={true}
                      onTranscript={(text) => {
                        const num = text.replace(/[^0-9]/g, '');
                        if (num) {
                          setAdminPinInput(num);
                          setPinError('');
                        }
                      }}
                      onNumberTranscript={(num) => {
                        setAdminPinInput(String(num));
                        setPinError('');
                      }}
                      className="scale-90"
                      title="พูดรหัสผ่าน Admin"
                    />
                  </div>
                </div>

                {pinError && (
                  <p className="text-xs font-black text-red-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setOrderToDelete(null);
                    setAdminPinInput('');
                    setPinError('');
                  }}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-950 font-black rounded-xl text-xs transition cursor-pointer"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer border border-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ยืนยันลบคำสั่งซื้อ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

