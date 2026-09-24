'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Plus, Store, User, Phone, DollarSign, Sparkles, CheckCircle2, AlertCircle, X, ChevronRight, Filter, Flame, Edit2, Trash2, ShoppingBag } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { EventSchedule } from '../../types';

export const AdminEventMarketManager: React.FC = () => {
  const { storeSettings } = useShop();

  const [activeBranch, setActiveBranch] = useState<string>('HUDA ABAYA - สาขาใหญ่ หนองจอก');
  const [eventStatusFilter, setEventStatusFilter] = useState<'all' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED'>('all');
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState<boolean>(false);
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState<boolean>(false);

  // Store branches state for HUDA ABAYA (Single Main Branch by default)
  const [branches, setBranches] = useState<string[]>([
    'HUDA ABAYA - สาขาใหญ่ หนองจอก',
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

  // Form State for Add Event (HUDA ABAYA Default)
  const [eventTitle, setEventTitle] = useState<string>('งานแฟชั่นมุสลิม & มลายูเอ็กซ์โป');
  const [eventBranch, setEventBranch] = useState<string>('HUDA ABAYA - สาขาใหญ่ หนองจอก');
  const [eventLocation, setEventLocation] = useState<string>('ศูนย์การค้า / งานแฟชั่นมุสลิม');
  const [eventHours, setEventHours] = useState<string>('10:00 - 22:00 น.');
  const [eventProducts, setEventProducts] = useState<string>('ชุดอาบายะห์ดูไบ • ชุดคัฟทาน • น้ำหอมดูไบ EDP');
  const [eventPhone, setEventPhone] = useState<string>(storeSettings.contactPhone || storeSettings.promptPayNumber || '0966482037');
  const [eventStatus, setEventStatus] = useState<'UPCOMING' | 'ACTIVE' | 'COMPLETED'>('UPCOMING');
  const [eventStartDate, setEventStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [eventEndDate, setEventEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [eventSalesTarget, setEventSalesTarget] = useState<number>(20000);
  const [eventStaff, setEventStaff] = useState<string>('เจ้าของร้าน (Admin)');
  const [eventNote, setEventNote] = useState<string>('คำนวณเตรียมสต๊อกอาบายะห์ 100 ชุด และน้ำหอมดูไบ 50 ขวด');

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
    <div className="max-w-5xl mx-auto space-y-6 text-stone-950 font-sans">
      
      {/* Centered Top Branch & Store Banner */}
      <div className="bg-white border-2 border-amber-400/60 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 text-center">
        
        {/* Top Header Badge & Store Name */}
        <div className="space-y-1.5 max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-black uppercase text-stone-950 bg-amber-400 px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-amber-500">
              <Store className="w-3.5 h-3.5 text-stone-950" />
              <span>HUDA ABAYA ออกบูธ &amp; ตลาดนัด</span>
            </span>
            <span className="text-[11px] font-black text-emerald-950 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-800" />
              <span>เปิด 10:00 - 22:00 น.</span>
            </span>
          </div>

          <h2 className="font-serif font-black text-2xl sm:text-3xl text-amber-950 tracking-wide mt-1">
            {activeBranch}
          </h2>

          <p className="text-xs sm:text-sm text-stone-950 font-black flex items-center justify-center gap-2 flex-wrap">
            <span className="text-amber-900 font-black flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>ชุดอาบายะห์ดูไบ • คัฟทาน • น้ำหอมดูไบ &amp; Oud</span>
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-emerald-900 flex items-center gap-1 font-mono font-black">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>โทร/พร้อมเพย์: {storeSettings.contactPhone || storeSettings.promptPayNumber || '0966482037'}</span>
            </span>
          </p>
        </div>

        {/* Branch Selector & Add Branch Button */}
        <div className="pt-3 border-t-2 border-amber-400/30 flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
          <span className="text-xs text-stone-950 font-black">เลือกสาขา/บูธ:</span>
          
          <select
            value={activeBranch}
            onChange={(e) => setActiveBranch(e.target.value)}
            className="bg-white border-2 border-amber-500 rounded-xl px-3.5 py-1.5 text-xs text-stone-950 font-black focus:outline-none cursor-pointer shadow-sm"
          >
            {branches.map((b) => (
              <option key={b} value={b} className="bg-white text-stone-950 font-bold py-1">
                {b}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsAddBranchModalOpen(true)}
            className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs shadow-md transition flex items-center gap-1 cursor-pointer border border-amber-500"
          >
            <Plus className="w-4 h-4 text-stone-950" />
            <span>เพิ่มบูธ/สาขา</span>
          </button>
        </div>
      </div>

      {/* Centered 4 Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
        
        {/* Card 1: Total Schedules */}
        <div className="bg-white border-2 border-amber-400/60 p-4 rounded-2xl shadow-lg text-center space-y-1 text-stone-950">
          <span className="text-xs font-black text-stone-900 block flex items-center justify-center gap-1">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>ตารางงานทั้งหมด</span>
          </span>
          <div className="text-2xl sm:text-3xl font-black text-stone-950 font-mono">
            {schedules.length} <span className="text-xs font-sans font-bold text-stone-800">งาน</span>
          </div>
        </div>

        {/* Card 2: Upcoming */}
        <div className="bg-white border-2 border-amber-400/60 p-4 rounded-2xl shadow-lg text-center space-y-1 text-stone-950">
          <span className="text-xs font-black text-amber-900 block flex items-center justify-center gap-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>เร็วๆ นี้ / รอจัด</span>
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-900 font-mono">
            {upcomingCount} <span className="text-xs font-sans font-bold text-stone-800">งาน</span>
          </div>
        </div>

        {/* Card 3: Active Selling */}
        <div className="bg-white border-2 border-emerald-500 p-4 rounded-2xl shadow-lg text-center space-y-1 text-stone-950">
          <span className="text-xs font-black text-emerald-900 block flex items-center justify-center gap-1">
            <Flame className="w-4 h-4 text-emerald-600 animate-bounce" />
            <span>กำลังขายอยู่</span>
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">
            {activeCount} <span className="text-xs font-sans font-bold text-stone-800">งาน</span>
          </div>
        </div>

        {/* Card 4: Completed */}
        <div className="bg-white border-2 border-stone-300 p-4 rounded-2xl shadow-lg text-center space-y-1 text-stone-950">
          <span className="text-xs font-black text-stone-800 block flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-stone-600" />
            <span>เสร็จสิ้นแล้ว</span>
          </span>
          <div className="text-2xl sm:text-3xl font-black text-stone-700 font-mono">
            {completedCount} <span className="text-xs font-sans font-bold text-stone-800">งาน</span>
          </div>
        </div>

      </div>

      {/* Main Centered Event Planner Section */}
      <div className="bg-white border-2 border-amber-400/60 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6 text-center text-stone-950">
        
        {/* Section Header & Main Call to Action Button (Centered) */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="space-y-1">
            <h3 className="font-serif font-black text-xl sm:text-2xl text-stone-950 flex items-center justify-center gap-2">
              <Calendar className="w-6 h-6 text-amber-600" />
              <span>ตารางออกงาน &amp; วางแผนตลาดนัด (HUDA ABAYA)</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-800 font-extrabold">
              ลงตารางออกบูธล่วงหน้า คำนวณเตรียมสต๊อกอาบายะห์และน้ำหอมดูไบ แจ้งพนักงาน และเปิด POS ขายแยกสาขา
            </p>
          </div>

          <div className="pt-1">
            <button
              onClick={() => setIsAddEventModalOpen(true)}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm rounded-2xl shadow-md hover:scale-105 transition flex items-center justify-center gap-2 mx-auto cursor-pointer border-2 border-amber-500"
            >
              <Plus className="w-5 h-5 text-stone-950" />
              <span>ลงตารางออกงานใหม่</span>
            </button>
          </div>
        </div>

        {/* Centered Filter Tabs Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-t-2 border-b-2 border-amber-400/30 py-3 max-w-2xl mx-auto">
          <button
            onClick={() => setEventStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              eventStatusFilter === 'all'
                ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            ทั้งหมด ({schedules.length})
          </button>

          <button
            onClick={() => setEventStatusFilter('UPCOMING')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              eventStatusFilter === 'UPCOMING'
                ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            รอดำเนินการ / เร็วๆ นี้ ({upcomingCount})
          </button>

          <button
            onClick={() => setEventStatusFilter('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              eventStatusFilter === 'ACTIVE'
                ? 'bg-emerald-500 text-stone-950 border-2 border-emerald-600 shadow-md'
                : 'bg-white text-emerald-950 hover:bg-emerald-50 border-2 border-emerald-600/60'
            }`}
          >
            กำลังขายอยู่ ({activeCount})
          </button>

          <button
            onClick={() => setEventStatusFilter('COMPLETED')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              eventStatusFilter === 'COMPLETED'
                ? 'bg-stone-800 text-white border-2 border-stone-900 shadow-md'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            เสร็จสิ้นแล้ว ({completedCount})
          </button>
        </div>

        {/* Schedule List / Centered Empty State Card */}
        {filteredSchedules.length === 0 ? (
          <div className="bg-stone-50 border-2 border-amber-400/40 rounded-3xl p-10 sm:p-14 max-w-xl mx-auto space-y-4 shadow-md text-stone-950">
            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center mx-auto text-amber-700 shadow-sm">
              <Calendar className="w-8 h-8 text-amber-700" />
            </div>

            <div className="space-y-1">
              <h4 className="font-serif font-black text-lg sm:text-xl text-stone-950">
                ยังไม่มีรายการตารางงานในช่วงนี้
              </h4>
              <p className="text-xs text-stone-800 max-w-sm mx-auto font-black leading-relaxed">
                กดปุ่ม "ลงตารางออกงานใหม่" เพื่อเริ่มวางแผนออกงาน/ตลาดนัดล่วงหน้า คำนวณสต๊อกสินค้า HUDA ABAYA และเปิดขายหน้าร้าน POS
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsAddEventModalOpen(true)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md hover:scale-105 transition flex items-center gap-1.5 mx-auto cursor-pointer border border-amber-500"
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
                className="bg-white border-2 border-amber-400/60 rounded-2xl p-5 shadow-lg space-y-3.5 hover:border-amber-500 transition flex flex-col justify-between text-stone-950"
              >
                <div className="space-y-2">
                  {/* Card Status & Title Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-amber-400/30 pb-2.5">
                    <div>
                      <span className="text-[10px] font-black text-stone-950 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-400">
                        {s.branchName}
                      </span>
                      <h4 className="font-serif font-black text-base text-stone-950 mt-1">
                        {s.title}
                      </h4>
                    </div>

                    {s.status === 'ACTIVE' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-stone-950 font-black text-[10px] shadow flex items-center gap-1 shrink-0 border border-emerald-600">
                        <Flame className="w-3 h-3 text-stone-950 animate-bounce" /> กำลังขายอยู่
                      </span>
                    )}
                    {s.status === 'UPCOMING' && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-[10px] shadow shrink-0 border border-amber-500">
                        ● เร็วๆ นี้
                      </span>
                    )}
                    {s.status === 'COMPLETED' && (
                      <span className="px-2.5 py-1 rounded-full bg-stone-200 text-stone-800 font-black text-[10px] shrink-0 border border-stone-300">
                        ✓ เสร็จสิ้นแล้ว
                      </span>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-1.5 text-xs text-stone-950">
                    <p className="flex items-center gap-1.5 font-black text-amber-950">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>สถานที่: {s.location}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-black text-stone-950">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>เวลาเปิด-ปิด: {s.operatingHours} ({s.startDate} ถึง {s.endDate})</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-black text-amber-900">
                      <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>สินค้าเตรียมขาย: {s.productsToPrepare}</span>
                    </p>
                    {s.assignedStaff && (
                      <p className="flex items-center gap-1.5 font-black text-stone-800">
                        <User className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>พนักงานรับผิดชอบ: {s.assignedStaff}</span>
                      </p>
                    )}
                    {s.phonePromptPay && (
                      <p className="flex items-center gap-1.5 font-black text-emerald-950 font-mono">
                        <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>โทร/พร้อมเพย์: {s.phonePromptPay}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-amber-400/30 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {s.status === 'UPCOMING' && (
                      <button
                        onClick={() => handleUpdateStatus(s.id, 'ACTIVE')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] rounded-lg transition shadow border border-emerald-700"
                      >
                        เริ่มเปิดขาย
                      </button>
                    )}
                    {s.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleUpdateStatus(s.id, 'COMPLETED')}
                        className="px-2.5 py-1 bg-stone-700 hover:bg-stone-600 text-white font-black text-[11px] rounded-lg transition"
                      >
                        ปิดงานขาย
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteSchedule(s.id)}
                    className="p-1.5 bg-red-100 hover:bg-red-200 border border-red-400 text-red-950 rounded-lg text-xs transition cursor-pointer"
                    title="ลบตารางงานนี้"
                  >
                    <Trash2 className="w-4 h-4 text-red-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL 1: ADD NEW EVENT SCHEDULE MODAL */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-xl w-full p-6 text-stone-950 shadow-2xl space-y-4 text-left">
            
            <div className="flex justify-between items-center border-b-2 border-amber-400/40 pb-3">
              <h3 className="font-serif font-black text-lg text-stone-950 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <span>ลงตารางออกงาน &amp; ตลาดนัดใหม่ (HUDA ABAYA)</span>
              </h3>
              <button
                onClick={() => setIsAddEventModalOpen(false)}
                className="text-stone-700 hover:text-stone-950 p-1 rounded-full border border-stone-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-950 font-black mb-1">ชื่องาน / ตลาดนัด *</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="เช่น งานแฟชั่นมุสลิม & มลายูเอ็กซ์โป"
                  className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 text-stone-950 font-black text-sm focus:outline-none focus:border-amber-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-950 font-black mb-1">เลือกสาขา / บูธ *</label>
                  <select
                    value={eventBranch}
                    onChange={(e) => setEventBranch(e.target.value)}
                    className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 text-stone-950 font-black text-xs focus:outline-none focus:border-amber-500"
                  >
                    {branches.map((b) => (
                      <option key={b} value={b} className="bg-white text-stone-950 font-bold py-1">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-950 font-black mb-1">สถานที่ออกงาน *</label>
                  <input
                    type="text"
                    required
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="เช่น ศูนย์การค้า / งานแฟชั่นมุสลิม"
                    className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 text-stone-950 font-black text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-950 font-black mb-1">เวลาเปิด-ปิดร้าน *</label>
                  <input
                    type="text"
                    required
                    value={eventHours}
                    onChange={(e) => setEventHours(e.target.value)}
                    placeholder="เช่น 10:00 - 22:00 น."
                    className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 text-stone-950 font-black text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-950 font-black mb-1">เบอร์โทร / พร้อมเพย์ร้าน *</label>
                  <input
                    type="text"
                    required
                    value={eventPhone}
                    onChange={(e) => setEventPhone(e.target.value)}
                    placeholder="เช่น 0966482037"
                    className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 text-stone-950 font-mono font-black text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-950 font-black mb-1">รายการสินค้าที่ต้องเตรียมขาย *</label>
                <input
                  type="text"
                  required
                  value={eventProducts}
                  onChange={(e) => setEventProducts(e.target.value)}
                  placeholder="เช่น ชุดอาบายะห์ดูไบ • ชุดคัฟทาน • น้ำหอมดูไบ EDP"
                  className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 text-stone-950 font-black text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-950 font-black mb-1">วันที่เริ่มออกงาน *</label>
                  <input
                    type="date"
                    required
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="w-full bg-white border-2 border-stone-400 rounded-xl p-2.5 text-stone-950 font-black focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-950 font-black mb-1">วันที่สิ้นสุดงาน *</label>
                  <input
                    type="date"
                    required
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="w-full bg-white border-2 border-stone-400 rounded-xl p-2.5 text-stone-950 font-black focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-950 font-black mb-1">คำนวณเตรียมสต๊อก / หมายเหตุเตรียมตัว</label>
                <input
                  type="text"
                  value={eventNote}
                  onChange={(e) => setEventNote(e.target.value)}
                  placeholder="เช่น คำนวณเตรียมสต๊อกอาบายะห์ 100 ชุด และน้ำหอมดูไบ 50 ขวด"
                  className="w-full bg-white border-2 border-stone-400 rounded-xl p-2.5 text-stone-950 font-black focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber-400/40">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 border border-stone-300 text-stone-950 font-black rounded-xl hover:bg-stone-200 cursor-pointer"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl shadow-md border border-amber-500 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-md w-full p-6 text-stone-950 shadow-2xl space-y-4 text-left">
            
            <div className="flex justify-between items-center border-b-2 border-amber-400/40 pb-3">
              <h3 className="font-serif font-black text-lg text-stone-950 flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-600" />
                <span>เพิ่มบูธ / สาขาใหม่ (HUDA ABAYA)</span>
              </h3>
              <button
                onClick={() => setIsAddBranchModalOpen(false)}
                className="text-stone-700 hover:text-stone-950 p-1 rounded-full border border-stone-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-950 font-black mb-1">ชื่อบูธ / สาขาใหม่ *</label>
                <input
                  type="text"
                  required
                  value={newBranchInput}
                  onChange={(e) => setNewBranchInput(e.target.value)}
                  placeholder="เช่น HUDA ABAYA - บูธป๊อบอัพ งานแฟชั่นมุสลิม"
                  className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 text-stone-950 font-black text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber-400/40">
                <button
                  type="button"
                  onClick={() => setIsAddBranchModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 border border-stone-300 text-stone-950 font-black rounded-xl hover:bg-stone-200 cursor-pointer"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl shadow-md border border-amber-500 cursor-pointer"
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
