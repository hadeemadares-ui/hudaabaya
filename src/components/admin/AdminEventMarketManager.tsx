'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Plus, Store, User, Phone, DollarSign, Sparkles, CheckCircle2, AlertCircle, X, ChevronRight, Filter, Flame, Edit2, Trash2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { EventSchedule } from '../../types';

export const AdminEventMarketManager: React.FC = () => {
  const { storeSettings } = useShop();

  const [activeBranch, setActiveBranch] = useState<string>('ร้านลูกไอ้บัง - ตลาดนัดคลอง16');
  const [eventStatusFilter, setEventStatusFilter] = useState<'all' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED'>('all');
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState<boolean>(false);
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState<boolean>(false);

  // Store branches state
  const [branches, setBranches] = useState<string[]>([
    'ร้านลูกไอ้บัง - ตลาดนัดคลอง16',
    'สาขาสำนักงานใหญ่ - หนองจอก',
    'บูธสตรีทฟู้ด - งานกาชาด',
  ]);
  const [newBranchInput, setNewBranchInput] = useState<string>('');

  // Event schedules state
  const [schedules, setSchedules] = useState<EventSchedule[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_event_schedules');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [];
  });

  // Form State for Add Event
  const [eventTitle, setEventTitle] = useState<string>('ตลาดนัดคลอง 16 เสาร์-อาทิตย์');
  const [eventBranch, setEventBranch] = useState<string>('ร้านลูกไอ้บัง - ตลาดนัดคลอง16');
  const [eventLocation, setEventLocation] = useState<string>('ตลาดนัดคลอง 16');
  const [eventHours, setEventHours] = useState<string>('04:00 - 12:00 น.');
  const [eventProducts, setEventProducts] = useState<string>('โรตีนาน • เนื้อย่างสดใหม่');
  const [eventPhone, setEventPhone] = useState<string>('0966482037');
  const [eventStatus, setEventStatus] = useState<'UPCOMING' | 'ACTIVE' | 'COMPLETED'>('UPCOMING');
  const [eventStartDate, setEventStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [eventEndDate, setEventEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [eventSalesTarget, setEventSalesTarget] = useState<number>(5000);
  const [eventStaff, setEventStaff] = useState<string>('เจ้าของร้าน (Admin)');
  const [eventNote, setEventNote] = useState<string>('คำนวณเตรียมแป้งโรตี 50 กิโลกรัม และเนื้อหมัก 30 กิโลกรัม');

  // Filtered Schedules
  const filteredSchedules = schedules.filter((s) => {
    const matchesStatus = eventStatusFilter === 'all' || s.status === eventStatusFilter;
    return matchesStatus;
  });

  // Metrics
  const upcomingCount = schedules.filter((s) => s.status === 'UPCOMING').length;
  const activeCount = schedules.filter((s) => s.status === 'ACTIVE').length;
  const completedCount = schedules.filter((s) => s.status === 'COMPLETED').length;

  const saveSchedulesToStorage = (updated: EventSchedule[]) => {
    setSchedules(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('huda_event_schedules', JSON.stringify(updated));
    }
  };

  const handleSaveNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      alert('กรุณากรอกชื่อตารางงานด้วยครับ');
      return;
    }

    const newEvent: EventSchedule = {
      id: `EVENT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      title: eventTitle.trim(),
      branchName: eventBranch,
      location: eventLocation.trim(),
      startDate: eventStartDate,
      endDate: eventEndDate,
      operatingHours: eventHours.trim(),
      productsToPrepare: eventProducts.trim(),
      phonePromptPay: eventPhone.trim(),
      status: eventStatus,
      salesTarget: eventSalesTarget,
      actualSales: 0,
      assignedStaff: eventStaff.trim(),
      note: eventNote.trim(),
      createdAt: new Date().toISOString(),
    };

    saveSchedulesToStorage([newEvent, ...schedules]);
    alert(`เพิ่มตารางออกงาน "${eventTitle}" เรียบร้อยแล้ว!`);
    setIsAddEventModalOpen(false);
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchInput.trim()) return;
    setBranches([...branches, newBranchInput.trim()]);
    setActiveBranch(newBranchInput.trim());
    setNewBranchInput('');
    setIsAddBranchModalOpen(false);
    alert(`เพิ่มบูธ/สาขา "${newBranchInput}" สำเร็จ!`);
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm('คุณต้องการลบตารางงานนี้ใช่หรือไม่?')) {
      saveSchedulesToStorage(schedules.filter((s) => s.id !== id));
    }
  };

  const handleUpdateStatus = (id: string, newStatus: EventSchedule['status']) => {
    saveSchedulesToStorage(
      schedules.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-white font-sans">
      
      {/* Centered Top Branch & Store Banner */}
      <div className="bg-stone-900 border-2 border-amber-400/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-center">
        
        {/* Top Header Badge & Store Name */}
        <div className="space-y-1.5 max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-black uppercase text-stone-950 bg-amber-400 px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              <span>ออกบูธ &amp; ตลาดนัด</span>
            </span>
            <span className="text-[11px] font-extrabold text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-500/50 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>เปิด 04:00 - 12:00 น.</span>
            </span>
          </div>

          <h2 className="font-serif font-black text-2xl sm:text-3xl text-amber-300 tracking-wide mt-1">
            {activeBranch}
          </h2>

          <p className="text-xs sm:text-sm text-stone-200 font-extrabold flex items-center justify-center gap-2 flex-wrap">
            <span className="text-amber-200 flex items-center gap-1">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>โรตีนาน • เนื้อย่างสดใหม่</span>
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-emerald-400 flex items-center gap-1 font-mono">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>โทร/พร้อมเพย์: 0966482037</span>
            </span>
          </p>
        </div>

        {/* Branch Selector & Add Branch Button */}
        <div className="pt-3 border-t-2 border-amber-400/20 flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
          <span className="text-xs text-amber-300 font-extrabold">เลือกสาขา/บูธ:</span>
          
          <select
            value={activeBranch}
            onChange={(e) => setActiveBranch(e.target.value)}
            className="bg-stone-950 border-2 border-amber-400/60 rounded-xl px-3.5 py-1.5 text-xs text-amber-300 font-extrabold focus:outline-none cursor-pointer shadow-inner"
          >
            {branches.map((b) => (
              <option key={b} value={b} className="bg-stone-900 text-white font-bold py-1">
                {b}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsAddBranchModalOpen(true)}
            className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs shadow-md transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มบูธ/สาขา</span>
          </button>
        </div>
      </div>

      {/* Centered 4 Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
        
        {/* Card 1: Total Schedules */}
        <div className="bg-stone-900 border-2 border-amber-400/40 p-4 rounded-2xl shadow-xl text-center space-y-1">
          <span className="text-xs font-extrabold text-amber-300 block flex items-center justify-center gap-1">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>ตารางงานทั้งหมด</span>
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {schedules.length} <span className="text-xs font-sans font-bold text-stone-300">งาน</span>
          </div>
        </div>

        {/* Card 2: Upcoming */}
        <div className="bg-stone-900 border-2 border-amber-400/40 p-4 rounded-2xl shadow-xl text-center space-y-1">
          <span className="text-xs font-extrabold text-amber-300 block flex items-center justify-center gap-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>เร็วๆ นี้ / รอจัด</span>
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
            {upcomingCount} <span className="text-xs font-sans font-bold text-stone-300">งาน</span>
          </div>
        </div>

        {/* Card 3: Active Selling */}
        <div className="bg-stone-900 border-2 border-emerald-500/80 p-4 rounded-2xl shadow-xl text-center space-y-1">
          <span className="text-xs font-extrabold text-emerald-300 block flex items-center justify-center gap-1">
            <Flame className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>กำลังขายอยู่</span>
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {activeCount} <span className="text-xs font-sans font-bold text-stone-300">งาน</span>
          </div>
        </div>

        {/* Card 4: Completed */}
        <div className="bg-stone-900 border-2 border-stone-700 p-4 rounded-2xl shadow-xl text-center space-y-1">
          <span className="text-xs font-extrabold text-stone-300 block flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-stone-400" />
            <span>เสร็จสิ้นแล้ว</span>
          </span>
          <div className="text-2xl sm:text-3xl font-black text-stone-400 font-mono">
            {completedCount} <span className="text-xs font-sans font-bold text-stone-300">งาน</span>
          </div>
        </div>

      </div>

      {/* Main Centered Event Planner Section */}
      <div className="bg-stone-900 border-2 border-amber-400/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6 text-center">
        
        {/* Section Header & Main Call to Action Button (Centered) */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="space-y-1">
            <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-amber-300 flex items-center justify-center gap-2">
              <Calendar className="w-6 h-6 text-amber-400" />
              <span>ตารางออกงาน &amp; วางแผนตลาดนัด</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-200 font-bold">
              ลงตารางออกบูธล่วงหน้า คำนวณเตรียมของ แจ้งพนักงาน และเปิด POS ขายแยกสาขา
            </p>
          </div>

          <div className="pt-1">
            <button
              onClick={() => setIsAddEventModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black text-sm rounded-2xl shadow-gold-glow hover:scale-105 transition flex items-center justify-center gap-2 mx-auto cursor-pointer border-2 border-amber-300"
            >
              <Plus className="w-5 h-5 text-stone-950" />
              <span>ลงตารางออกงานใหม่</span>
            </button>
          </div>
        </div>

        {/* Centered Filter Tabs Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-t-2 border-b-2 border-amber-400/20 py-3 max-w-2xl mx-auto">
          <button
            onClick={() => setEventStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              eventStatusFilter === 'all'
                ? 'bg-amber-400 text-stone-950 font-black shadow-md'
                : 'bg-stone-950 text-stone-300 hover:text-white border border-stone-800'
            }`}
          >
            ทั้งหมด ({schedules.length})
          </button>

          <button
            onClick={() => setEventStatusFilter('UPCOMING')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              eventStatusFilter === 'UPCOMING'
                ? 'bg-amber-400 text-stone-950 font-black shadow-md'
                : 'bg-stone-950 text-amber-300 hover:text-white border border-stone-800'
            }`}
          >
            รอดำเนินการ / เร็วๆ นี้ ({upcomingCount})
          </button>

          <button
            onClick={() => setEventStatusFilter('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              eventStatusFilter === 'ACTIVE'
                ? 'bg-emerald-500 text-stone-950 font-black shadow-md'
                : 'bg-stone-950 text-emerald-400 hover:text-white border border-stone-800'
            }`}
          >
            กำลังขายอยู่ ({activeCount})
          </button>

          <button
            onClick={() => setEventStatusFilter('COMPLETED')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              eventStatusFilter === 'COMPLETED'
                ? 'bg-stone-700 text-white font-black shadow-md'
                : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            เสร็จสิ้นแล้ว ({completedCount})
          </button>
        </div>

        {/* Schedule List / Centered Empty State Card */}
        {filteredSchedules.length === 0 ? (
          <div className="bg-stone-950 border-2 border-amber-400/30 rounded-3xl p-10 sm:p-14 max-w-xl mx-auto space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400 shadow-md">
              <Calendar className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-1">
              <h4 className="font-serif font-extrabold text-lg sm:text-xl text-amber-300">
                ยังไม่มีรายการตารางงานในช่วงนี้
              </h4>
              <p className="text-xs text-stone-300 max-w-sm mx-auto font-bold leading-relaxed">
                กดปุ่ม "ลงตารางออกงานใหม่" เพื่อเริ่มวางแผนออกงาน/ตลาดนัดล่วงหน้า คำนวณวัตถุดิบโรตีนาน &amp; เนื้อย่าง และเปิดขายหน้าร้าน POS
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsAddEventModalOpen(true)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-gold-glow hover:scale-105 transition flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                <Plus className="w-4 h-4 text-stone-950" />
                <span>+ ลงตารางออกงานใหม่</span>
              </button>
            </div>
          </div>
        ) : (
          /* Populated Event Cards Grid (Centered max-w-4xl) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto text-left">
            {filteredSchedules.map((s) => (
              <div
                key={s.id}
                className="bg-stone-950 border-2 border-amber-400/50 rounded-2xl p-5 shadow-2xl space-y-3.5 hover:border-amber-400 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  {/* Card Status & Title Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-amber-400/20 pb-2.5">
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-300 bg-stone-900 px-2.5 py-0.5 rounded-lg border border-amber-400/30">
                        {s.branchName}
                      </span>
                      <h4 className="font-serif font-extrabold text-base text-white mt-1">
                        {s.title}
                      </h4>
                    </div>

                    {s.status === 'ACTIVE' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-stone-950 font-black text-[10px] shadow flex items-center gap-1 shrink-0">
                        <Flame className="w-3 h-3 text-stone-950 animate-bounce" /> กำลังขายอยู่
                      </span>
                    )}
                    {s.status === 'UPCOMING' && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-[10px] shadow shrink-0">
                        ● เร็วๆ นี้
                      </span>
                    )}
                    {s.status === 'COMPLETED' && (
                      <span className="px-2.5 py-1 rounded-full bg-stone-800 text-stone-400 font-extrabold text-[10px] shrink-0">
                        ✓ เสร็จสิ้นแล้ว
                      </span>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-1.5 text-xs text-stone-300">
                    <p className="flex items-center gap-1.5 font-extrabold text-amber-200">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>สถานที่: {s.location}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-extrabold text-stone-300">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>เวลาเปิด-ปิด: {s.operatingHours} ({s.startDate} ถึง {s.endDate})</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-bold text-amber-300">
                      <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>เมนูเตรียมขาย: {s.productsToPrepare}</span>
                    </p>
                    {s.assignedStaff && (
                      <p className="flex items-center gap-1.5 font-bold text-stone-400">
                        <User className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>พนักงานรับผิดชอบ: {s.assignedStaff}</span>
                      </p>
                    )}
                    {s.phonePromptPay && (
                      <p className="flex items-center gap-1.5 font-bold text-emerald-400 font-mono">
                        <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>โทร/พร้อมเพย์: {s.phonePromptPay}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-amber-400/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {s.status === 'UPCOMING' && (
                      <button
                        onClick={() => handleUpdateStatus(s.id, 'ACTIVE')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-lg transition shadow"
                      >
                        เริ่มเปิดขาย
                      </button>
                    )}
                    {s.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleUpdateStatus(s.id, 'COMPLETED')}
                        className="px-2.5 py-1 bg-stone-700 hover:bg-stone-600 text-stone-200 font-extrabold text-[11px] rounded-lg transition"
                      >
                        ปิดงานขาย
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteSchedule(s.id)}
                    className="p-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg text-xs transition"
                    title="ลบตารางงานนี้"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL 1: ADD NEW EVENT SCHEDULE MODAL */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-stone-950 border-2 border-amber-400 rounded-3xl max-w-xl w-full p-6 text-white shadow-2xl space-y-4 text-left">
            
            <div className="flex justify-between items-center border-b-2 border-amber-400/30 pb-3">
              <h3 className="font-serif font-extrabold text-lg text-amber-300 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <span>ลงตารางออกงาน &amp; ตลาดนัดใหม่</span>
              </h3>
              <button
                onClick={() => setIsAddEventModalOpen(false)}
                className="text-amber-300 hover:text-white p-1 rounded-full border border-amber-400/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-amber-300 font-extrabold mb-1">ชื่องาน / ตลาดนัด *</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="เช่น ตลาดนัดคลอง 16 เสาร์-อาทิตย์"
                  className="w-full bg-stone-900 border-2 border-amber-400/60 rounded-xl p-3 text-white font-extrabold text-sm focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-300 font-extrabold mb-1">เลือกสาขา / บูธ *</label>
                  <select
                    value={eventBranch}
                    onChange={(e) => setEventBranch(e.target.value)}
                    className="w-full bg-stone-900 border-2 border-amber-400/60 rounded-xl p-3 text-amber-300 font-extrabold text-xs focus:outline-none"
                  >
                    {branches.map((b) => (
                      <option key={b} value={b} className="bg-stone-900 text-white font-bold py-1">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-amber-300 font-extrabold mb-1">สถานที่ออกงาน *</label>
                  <input
                    type="text"
                    required
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="เช่น ตลาดนัดคลอง 16"
                    className="w-full bg-stone-900 border-2 border-amber-400/60 rounded-xl p-3 text-white font-extrabold text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-emerald-300 font-extrabold mb-1">เวลาเปิด-ปิดร้าน *</label>
                  <input
                    type="text"
                    required
                    value={eventHours}
                    onChange={(e) => setEventHours(e.target.value)}
                    placeholder="เช่น 04:00 - 12:00 น."
                    className="w-full bg-stone-900 border-2 border-emerald-500 rounded-xl p-3 text-emerald-300 font-extrabold text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-amber-300 font-extrabold mb-1">เบอร์โทร / พร้อมเพย์ร้าน *</label>
                  <input
                    type="text"
                    required
                    value={eventPhone}
                    onChange={(e) => setEventPhone(e.target.value)}
                    placeholder="เช่น 0966482037"
                    className="w-full bg-stone-900 border-2 border-amber-400 rounded-xl p-3 text-amber-300 font-mono font-extrabold text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-300 font-extrabold mb-1">รายการเมนูที่ต้องเตรียมขาย *</label>
                <input
                  type="text"
                  required
                  value={eventProducts}
                  onChange={(e) => setEventProducts(e.target.value)}
                  placeholder="เช่น โรตีนาน • เนื้อย่างสดใหม่"
                  className="w-full bg-stone-900 border-2 border-amber-400/60 rounded-xl p-3 text-white font-extrabold text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-extrabold mb-1">วันที่เริ่มออกงาน *</label>
                  <input
                    type="date"
                    required
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="w-full bg-stone-900 border border-amber-400/40 rounded-xl p-2.5 text-white font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-extrabold mb-1">วันที่สิ้นสุดงาน *</label>
                  <input
                    type="date"
                    required
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="w-full bg-stone-900 border border-amber-400/40 rounded-xl p-2.5 text-white font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-extrabold mb-1">คำนวณวัตถุดิบ / หมายเหตุเตรียมตัว</label>
                <input
                  type="text"
                  value={eventNote}
                  onChange={(e) => setEventNote(e.target.value)}
                  placeholder="เช่น คำนวณเตรียมแป้งโรตี 50 กิโลกรัม และเนื้อหมัก 30 กิโลกรัม"
                  className="w-full bg-stone-900 border border-amber-400/30 rounded-xl p-2.5 text-white font-bold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber-400/20">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 font-bold rounded-xl hover:bg-stone-700"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 font-black rounded-xl shadow-gold-glow hover:scale-102 transition cursor-pointer"
                >
                  บันทึกตารางออกงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW BRANCH MODAL */}
      {isAddBranchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-stone-950 border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4 text-left">
            
            <div className="flex justify-between items-center border-b-2 border-amber-400/30 pb-3">
              <h3 className="font-serif font-extrabold text-lg text-amber-300 flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" />
                <span>เพิ่มบูธ / สาขาใหม่</span>
              </h3>
              <button
                onClick={() => setIsAddBranchModalOpen(false)}
                className="text-amber-300 hover:text-white p-1 rounded-full border border-amber-400/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-4 text-xs">
              <div>
                <label className="block text-amber-300 font-extrabold mb-1">ชื่อบูธ / สาขาใหม่ *</label>
                <input
                  type="text"
                  required
                  value={newBranchInput}
                  onChange={(e) => setNewBranchInput(e.target.value)}
                  placeholder="เช่น ร้านลูกไอ้บัง - ตลาดนัดคลอง16"
                  className="w-full bg-stone-900 border-2 border-amber-400/60 rounded-xl p-3 text-white font-extrabold text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber-400/20">
                <button
                  type="button"
                  onClick={() => setIsAddBranchModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 font-bold rounded-xl hover:bg-stone-700"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl shadow-gold-glow"
                >
                  เพิ่มบูธ/สาขา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
