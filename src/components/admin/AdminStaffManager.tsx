'use client';

import React, { useState } from 'react';
import {
  Users,
  RefreshCw,
  CloudUpload,
  UserPlus,
  Shield,
  KeyRound,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Store,
  Info,
  Save,
  X,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { StaffUser, StaffPermissions, DEFAULT_STAFF_PERMISSIONS, OWNER_PERMISSIONS } from '../../types';

export const AdminStaffManager: React.FC = () => {
  const { staffUsers, addStaffUser, updateStaffUser, deleteStaffUser, currentStaff, eventBranches, syncStaffUsersToCloud } = useShop();
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  // Auto-sync staff to cloud whenever there are staff members
  React.useEffect(() => {
    if (staffUsers.length > 1 && syncStaffUsersToCloud) {
      syncStaffUsersToCloud().catch(() => {});
    }
  }, [staffUsers.length]);

  const handleManualSyncToCloud = async () => {
    setIsSyncingCloud(true);
    try {
      const res = await syncStaffUsersToCloud();
      if (res.success) {
        setSuccessToast(`☁️ ซิงค์พนักงานทั้งหมด ${res.count} คนขึ้นคลาวด์เรียบร้อยแล้ว! อุปกรณ์อื่นและโทรศัพท์จะเห็นตรงกันทันที`);
      } else {
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อคลาวด์ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [showPins, setShowPins] = useState<{ [key: string]: boolean }>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [saveResultPopup, setSaveResultPopup] = useState<{
    isOpen: boolean;
    success: boolean;
    title: string;
    message: string;
    staffName?: string;
    newRole?: string;
    pin?: string;
  }>({ isOpen: false, success: false, title: '', message: '' });

  // Form State
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<'OWNER' | 'STAFF'>('STAFF');
  const [phone, setPhone] = useState('');
  const [assignedBranch, setAssignedBranch] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [permissions, setPermissions] = useState<StaffPermissions>(DEFAULT_STAFF_PERMISSIONS);

  const openCreateModal = () => {
    setEditingUser(null);
    setName('');
    setPin('');
    setRole('STAFF');
    setPhone('');
    setAssignedBranch(eventBranches[0] || '');
    setIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: StaffUser) => {
    setEditingUser(user);
    setName(user.name);
    setPin(user.pin);
    setRole(user.role);
    setPhone(user.phone || '');
    setAssignedBranch(user.assignedBranch || '');
    setIsActive(user.isActive !== undefined ? user.isActive : user.active);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanName = name.trim();
    const cleanPin = pin.trim();

    if (!cleanName) {
      const msg = 'กรุณาระบุชื่อพนักงาน';
      setFormError(msg);
      setSaveResultPopup({
        isOpen: true,
        success: false,
        title: '❌ บันทึกไม่สำเร็จ',
        message: msg,
      });
      return;
    }

    if (!cleanPin || cleanPin.length < 4) {
      const msg = 'กรุณากำหนดรหัส PIN อย่างน้อย 4 หลัก (เช่น 1122, 5588)';
      setFormError(msg);
      setSaveResultPopup({
        isOpen: true,
        success: false,
        title: '❌ บันทึกไม่สำเร็จ',
        message: msg,
      });
      return;
    }

    // Check for duplicate PIN with other active users
    const duplicate = staffUsers.find(
      (u) => u.pin.trim() === cleanPin && (!editingUser || u.id !== editingUser.id)
    );
    if (duplicate) {
      const msg = `รหัส PIN "${cleanPin}" ซ้ำกับผู้ใช้ "${duplicate.name}" กรุณาเลือกรหัสอื่น`;
      setFormError(msg);
      setSaveResultPopup({
        isOpen: true,
        success: false,
        title: '❌ บันทึกไม่สำเร็จ: PIN ซ้ำ',
        message: msg,
      });
      return;
    }

    const roleTitle = role === 'STAFF' ? 'พนักงานหน้าร้าน (Staff)' : 'เจ้าของร้าน (Owner)';

    if (editingUser) {
      const updated: StaffUser = {
        ...editingUser,
        name: cleanName,
        pin: cleanPin,
        role,
        phone: phone.trim() || undefined,
        assignedBranch: assignedBranch.trim() || undefined,
        active: isActive,
        isActive,
        permissions: role === "OWNER" ? OWNER_PERMISSIONS : permissions,
      };
      updateStaffUser(updated);
      setSuccessToast(`✓ อัปเดตข้อมูลพนักงาน "${cleanName}" (${roleTitle}) เรียบร้อยแล้ว`);
      setSaveResultPopup({
        isOpen: true,
        success: true,
        title: '✅ บันทึกข้อมูลสำเร็จเรียบร้อย!',
        message: `เปลี่ยนสิทธิ์ของ "${cleanName}" เป็น "${roleTitle}" เรียบร้อยแล้ว ระบบได้ทำการบันทึกและซิงค์ข้อมูลลงฐานข้อมูลแล้วทันที`,
        staffName: cleanName,
        newRole: roleTitle,
        pin: cleanPin,
      });
    } else {
      const newUser: StaffUser = {
        id: `STF-${Date.now().toString().slice(-4)}`,
        name: cleanName,
        pin: cleanPin,
        role,
        phone: phone.trim() || undefined,
        assignedBranch: assignedBranch.trim() || undefined,
        active: isActive,
        isActive,
        permissions: role === "OWNER" ? OWNER_PERMISSIONS : permissions,
        createdAt: new Date().toISOString(),
      };
      addStaffUser(newUser);
      setLastAddedId(newUser.id);
      setSuccessToast(`✓ เพิ่มพนักงาน "${cleanName}" (${roleTitle}) เรียบร้อยแล้ว!`);
      setSaveResultPopup({
        isOpen: true,
        success: true,
        title: '✅ เพิ่มพนักงานใหม่สำเร็จ!',
        message: `เพิ่ม "${cleanName}" เข้าสู่ระบบในตำแหน่ง "${roleTitle}" เรียบร้อยแล้ว`,
        staffName: cleanName,
        newRole: roleTitle,
        pin: cleanPin,
      });
    }

    setTimeout(() => setSuccessToast(null), 4000);
    setIsModalOpen(false);
  };

  const togglePinVisibility = (id: string) => {
    setShowPins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = (user: StaffUser) => {
    if (user.id === 'STF-OWNER' || user.role === 'OWNER') {
      alert('ไม่สามารถลบบัญชีเจ้าของร้าน (Owner) ได้');
      return;
    }
    if (confirm(`คุณต้องการลบพนักงาน "${user.name}" ออกจากระบบหรือไม่?`)) {
      deleteStaffUser(user.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-stone-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-[#141312] flex items-center gap-2">
              <span>จัดการพนักงาน & รหัสผ่าน PIN (Staff Management)</span>
              <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 font-sans font-bold px-2 py-0.5 rounded-full">
                {staffUsers.length} คน
              </span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              สร้างผู้ใช้งานให้พนักงานหน้าร้าน สำหรับกดรหัส PIN 4 หลัก เข้าสู่ระบบขาย POS เบิกของ และคืนของออกบูธ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleManualSyncToCloud}
            disabled={isSyncingCloud}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-amber-500 shrink-0"
            title="ส่งรายชื่อพนักงานทั้งหมดขึ้นคลาวด์ ให้คอมเครื่องอื่นและมือถือมองเห็นทันที"
          >
            <RefreshCw className={`w-4 h-4 text-stone-950 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            <span>☁️ ซิงค์ไปมือถือ & เครื่องอื่น ({staffUsers.length} คน)</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#141312] hover:bg-[#292624] text-white font-medium text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
          >
            <UserPlus className="w-4 h-4 text-[#D4B57B]" />
            <span>+ เพิ่มพนักงานใหม่</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border-2 border-emerald-400 text-emerald-950 text-xs font-bold rounded-xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-sans">
            บันทึกแล้ว
          </span>
        </div>
      )}

      {/* Role explanation alert */}
      <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xs text-xs text-amber-950 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-bold">ระบบกำหนดสิทธิ์การใช้งาน (Role-Based Access Control):</p>
          <ul className="list-disc list-inside space-y-0.5 text-stone-700">
            <li>
              <span className="font-semibold text-blue-900">พนักงานหน้าร้าน (STAFF):</span> เข้าได้เฉพาะหน้า <strong>แคชเชียร์ POS</strong>, <strong>เบิกของออกบูธ & เช็คสต๊อกคืน</strong>, และ <strong>ตารางออกบูธ</strong> (ไม่เห็นต้นทุน กำไรสุทธิ และรายงานลับของร้าน)
            </li>
            <li>
              <span className="font-semibold text-amber-900">เจ้าของร้าน (OWNER / Admin):</span> เข้าถึงได้ทุกฟังก์ชัน ทั้งระบบบัญชี ต้นทุน ซัพพลายเออร์ ตั้งค่าร้านค้า และเพิ่ม/ลบพนักงาน
            </li>
          </ul>
        </div>
      </div>

      {/* Staff Cards / Table */}
      <div className="bg-white border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs text-[#141312] border-collapse">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">ชื่อพนักงาน</th>
                <th className="py-3 px-4">สิทธิ์การใช้งาน (Role)</th>
                <th className="py-3 px-4">รหัส PIN เข้าใช้</th>
                <th className="py-3 px-4">เบอร์โทรศัพท์</th>
                <th className="py-3 px-4">บูธ / สาขาประจำ</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {staffUsers.map((user) => {
                const isOwner = user.role === 'OWNER';
                const isCurrent = currentStaff?.id === user.id;
                const isJustAdded = lastAddedId === user.id;

                return (
                  <tr
                    key={user.id}
                    className={`transition ${
                      isJustAdded
                        ? 'bg-emerald-50 border-2 border-emerald-400 font-bold'
                        : !(user.isActive ?? user.active)
                        ? 'opacity-60 bg-stone-50'
                        : 'hover:bg-amber-50/20'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isOwner
                              ? 'bg-[#141312] text-[#D4B57B]'
                              : isJustAdded
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {user.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-1.5">
                            <span className={isJustAdded ? 'font-black text-emerald-950' : ''}>{user.name}</span>
                            {isJustAdded && (
                              <span className="text-[10px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded-xs animate-pulse">
                                ✨ เพิ่มใหม่
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-xs">
                                บัญชีนี้
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-500 font-mono">
                            ID: {user.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {isOwner ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] rounded-xs">
                          <Shield className="w-3 h-3 text-amber-700" />
                          <span>เจ้าของร้าน (Owner)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 font-medium text-[11px] rounded-xs">
                          <Store className="w-3 h-3 text-blue-600" />
                          <span>พนักงานหน้าร้าน (Staff)</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold">
                      <div className="flex items-center gap-2">
                        <span className="bg-stone-100 px-2 py-1 border border-stone-200 text-stone-800 tracking-wider">
                          {showPins[user.id] ? user.pin : '••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePinVisibility(user.id)}
                          className="p-1 text-stone-500 hover:text-stone-800 transition cursor-pointer"
                          title={showPins[user.id] ? 'ซ่อนรหัส' : 'ดูรหัส PIN'}
                        >
                          {showPins[user.id] ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-stone-600">
                      {user.phone ? (
                        <div className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{user.phone}</span>
                        </div>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-stone-600">
                      {user.assignedBranch ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{user.assignedBranch}</span>
                        </div>
                      ) : (
                        <span className="text-stone-400">ทุกสาขา / สำนักงานใหญ่</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {(user.isActive ?? user.active) ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 border border-emerald-200 text-[10px] rounded-xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>เปิดใช้งาน</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-stone-500 font-medium bg-stone-100 px-2 py-0.5 border border-stone-200 text-[10px] rounded-xs">
                          <XCircle className="w-3 h-3 text-stone-400" />
                          <span>ระงับการใช้</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-stone-900 transition cursor-pointer"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!isOwner && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 hover:bg-red-50 border border-stone-200 text-stone-400 hover:text-red-700 hover:border-red-200 transition cursor-pointer"
                            title="ลบพนักงาน"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Edit Staff Member */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[92vh] p-6 space-y-5 rounded-2xl border-2 border-amber-400 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#141312]">
                    {editingUser ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    กำหนดชื่อ สิทธิ์ และรหัส PIN 4 หลักสำหรับล็อกอิน
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-[#141312] border border-stone-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  ชื่อ-นามสกุล / ชื่อเล่น <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น น้องฟาติมะห์, น้องนัสรีน"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-stone-300 p-2.5 text-[#141312] focus:border-[#141312] focus:outline-none"
                />
              </div>

              {/* 4-digit PIN */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  รหัสผ่าน PIN (ตัวเลข 4 หลัก) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="เช่น 1122, 5588"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#FAF9F6] border border-stone-300 p-2.5 text-[#141312] font-mono font-bold tracking-widest text-center text-lg focus:border-[#141312] focus:outline-none"
                  />
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  ใช้สำหรับกดแป้นตัวเลขเพื่อเข้าสู่หน้าขาย POS และเบิกสินค้า
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  สิทธิ์การใช้งาน (Role)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex items-start gap-2 p-3 border cursor-pointer transition ${
                      role === 'STAFF'
                        ? 'bg-blue-50/70 border-blue-500 text-blue-950'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="STAFF"
                      checked={role === 'STAFF'}
                      onChange={() => setRole('STAFF')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-xs">พนักงานหน้าร้าน (Staff)</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        ขาย POS, เบิกของออกบูธ, คืนของ (ไม่เห็นกำไร)
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2 p-3 border cursor-pointer transition ${
                      role === 'OWNER'
                        ? 'bg-amber-50/70 border-amber-500 text-amber-950'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="OWNER"
                      checked={role === 'OWNER'}
                      onChange={() => setRole('OWNER')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-xs">เจ้าของร้าน (Owner)</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        เข้าถึงทุกเมนู บัญชี ต้นทุน และรายงานลับ
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  เบอร์โทรศัพท์ติดต่อ
                </label>
                <input
                  type="tel"
                  placeholder="เช่น 081-234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-stone-300 p-2.5 text-[#141312] focus:border-[#141312] focus:outline-none"
                />
              </div>

              {/* Assigned Branch */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  บูธ / สาขาประจำ (ทางเลือก)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    list="branch-suggestions"
                    placeholder="เช่น HUDA ABAYA - บูธคลอง 16"
                    value={assignedBranch}
                    onChange={(e) => setAssignedBranch(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-stone-300 p-2.5 text-[#141312] focus:border-[#141312] focus:outline-none"
                  />
                  <datalist id="branch-suggestions">
                    {eventBranches.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  ถ้าเว้นว่างจะสามารถปฏิบัติงานได้ทุกบูธ
                </p>
              </div>

                            {/* Operational Permissions Section (กำหนดสิทธิ์การปฏิบัติงาน) */}
              <div className="bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 border-2 border-amber-300 p-4 space-y-3 rounded-xl shadow-xs">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-800">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif font-black text-xs sm:text-sm text-stone-950">
                        กำหนดสิทธิ์การปฏิบัติงาน (Operational Permissions)
                      </h4>
                      <p className="text-[10px] text-stone-600 font-bold">
                        เลือกเปิดหรือปิดสิทธิ์ของพนักงานคนนี้รายฟังก์ชัน
                      </p>
                    </div>
                  </div>
                  {role === 'OWNER' && (
                    <span className="text-[10px] text-amber-900 font-black bg-amber-200 border border-amber-400 px-2 py-0.5 rounded-full">
                      เจ้าของร้าน (ได้ทุกสิทธิ์อัตโนมัติ)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-start gap-2.5 p-2.5 bg-white border border-stone-300 rounded-lg cursor-pointer hover:border-amber-400 transition shadow-2xs">
                    <input
                      type="checkbox"
                      disabled={role === 'OWNER'}
                      checked={role === 'OWNER' || permissions.canAccessPOS}
                      onChange={(e) => setPermissions({ ...permissions, canAccessPOS: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-amber-600 rounded"
                    />
                    <div>
                      <span className="font-bold text-stone-900 block">1. เข้าใช้งาน POS หน้าร้าน</span>
                      <span className="text-[10px] text-stone-500">เปิดบิลขาย ยิงสแกนสินค้า รับเงินหน้าร้าน</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 bg-white border border-stone-300 rounded-lg cursor-pointer hover:border-amber-400 transition shadow-2xs">
                    <input
                      type="checkbox"
                      disabled={role === 'OWNER'}
                      checked={role === 'OWNER' || permissions.canAccessBoothStock}
                      onChange={(e) => setPermissions({ ...permissions, canAccessBoothStock: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-amber-600 rounded"
                    />
                    <div>
                      <span className="font-bold text-stone-900 block">2. เบิก & เติมของออกบูธ</span>
                      <span className="text-[10px] text-stone-500">สร้างใบเบิก และสแกนเติมสินค้าเข้าบูธ</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 bg-white border border-stone-300 rounded-lg cursor-pointer hover:border-amber-400 transition shadow-2xs">
                    <input
                      type="checkbox"
                      disabled={role === 'OWNER'}
                      checked={role === 'OWNER' || permissions.canAccessBoothReturn}
                      onChange={(e) => setPermissions({ ...permissions, canAccessBoothReturn: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-amber-600 rounded"
                    />
                    <div>
                      <span className="font-bold text-stone-900 block">3. ตรวจนับสต๊อกคืนคลัง</span>
                      <span className="text-[10px] text-stone-500">ตรวจนับสินค้าคืนคลังใหญ่และปิดจบงาน</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 bg-white border border-stone-300 rounded-lg cursor-pointer hover:border-amber-400 transition shadow-2xs">
                    <input
                      type="checkbox"
                      disabled={role === 'OWNER'}
                      checked={role === 'OWNER' || permissions.canAccessEvents}
                      onChange={(e) => setPermissions({ ...permissions, canAccessEvents: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-amber-600 rounded"
                    />
                    <div>
                      <span className="font-bold text-stone-900 block">4. ดูตารางออกบูธ & สาขา</span>
                      <span className="text-[10px] text-stone-500">ดูปฏิทินงานอีเวนต์และบูธที่เปิดขาย</span>
                    </div>
                  </label>

                  {/* Special Security Permissions requested by user */}
                  <label className="flex items-start gap-2.5 p-3 bg-rose-50/80 border-2 border-rose-300 rounded-lg cursor-pointer sm:col-span-2 shadow-2xs">
                    <input
                      type="checkbox"
                      disabled={role === 'OWNER'}
                      checked={role === 'OWNER' || permissions.canVoidPOSOrder}
                      onChange={(e) => setPermissions({ ...permissions, canVoidPOSOrder: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-rose-600 rounded cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-rose-950 flex items-center gap-1.5 text-xs sm:text-sm">
                        <span>🛡️ 5. สิทธิ์ยกเลิกบิลขาย & คืนเงินลูกค้า (Void / Refund)</span>
                      </span>
                      <span className="text-[11px] text-rose-800 font-bold block mt-0.5">
                        {permissions.canVoidPOSOrder || role === 'OWNER'
                          ? '✓ เปิดสิทธิ์: พนักงานคนนี้สามารถกดยกเลิกบิลและคืนเงินได้ด้วยตนเอง'
                          : '⚠️ ปิดสิทธิ์ (แนะนำ): พนักงานจะคืนเงินเองไม่ได้ ต้องเรียกรหัส PIN เจ้าของร้านเพื่ออนุมัติทุกครั้ง'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 bg-amber-50/80 border-2 border-amber-300 rounded-lg cursor-pointer sm:col-span-2 shadow-2xs">
                    <input
                      type="checkbox"
                      disabled={role === 'OWNER'}
                      checked={role === 'OWNER' || permissions.canExchangeProduct}
                      onChange={(e) => setPermissions({ ...permissions, canExchangeProduct: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-amber-600 rounded cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-amber-950 flex items-center gap-1.5 text-xs sm:text-sm">
                        <span>🔄 6. สิทธิ์ทำรายการเปลี่ยนสินค้า / เปลี่ยนไซส์ (Exchange)</span>
                      </span>
                      <span className="text-[11px] text-amber-900 font-bold block mt-0.5">
                        {permissions.canExchangeProduct || role === 'OWNER'
                          ? '✓ เปิดสิทธิ์: พนักงานสามารถทำรายการเปลี่ยนไซส์/แบบสินค้าให้ลูกค้าได้โดยตรง'
                          : '⚠️ ปิดสิทธิ์: ต้องเรียกรหัส PIN เจ้าของร้านเพื่ออนุมัติ'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-semibold text-stone-700">เปิดให้ล็อกอินเข้าใช้งาน</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#141312] hover:bg-[#292624] text-white font-medium transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4 text-[#D4B57B]" />
                  <span>บันทึกข้อมูล</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESULT POPUP MODAL (แจ้งเตือนผลการบันทึก) */}
      {saveResultPopup.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-stone-950 shadow-2xl border-2 space-y-4 text-center border-amber-400">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-md ${
                saveResultPopup.success
                  ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-700'
                  : 'bg-rose-100 border-2 border-rose-500 text-rose-700'
              }`}
            >
              {saveResultPopup.success ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif font-black text-lg text-stone-950">
                {saveResultPopup.title}
              </h3>
              <p className="text-xs text-stone-600 font-bold leading-relaxed">
                {saveResultPopup.message}
              </p>
            </div>

            {saveResultPopup.success && saveResultPopup.staffName && (
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-xs text-left space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-stone-500 font-sans">ชื่อพนักงาน:</span>
                  <strong className="text-stone-950 font-black">{saveResultPopup.staffName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-sans">สิทธิ์การใช้งานใหม่:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-black text-[11px] ${
                      saveResultPopup.newRole?.includes('Staff')
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'bg-amber-100 text-amber-950 border border-amber-400'
                    }`}
                  >
                    {saveResultPopup.newRole}
                  </span>
                </div>
                {saveResultPopup.pin && (
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-sans">รหัส PIN:</span>
                    <strong className="text-stone-950 font-black">{saveResultPopup.pin}</strong>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setSaveResultPopup({ isOpen: false, success: false, title: '', message: '' })}
              className={`w-full py-3 font-black text-xs rounded-xl shadow-md transition cursor-pointer ${
                saveResultPopup.success
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-700'
                  : 'bg-stone-900 hover:bg-stone-800 text-white border border-stone-700'
              }`}
            >
              ตกลง (รับทราบ)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
