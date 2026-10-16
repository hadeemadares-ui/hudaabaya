'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Plus, Store, User, Phone, DollarSign, Sparkles, CheckCircle2, AlertCircle, X, ChevronRight, Filter, Flame, Edit2, Trash2, ShoppingBag, Tag } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { EventSchedule } from '../../types';

// Thai Months Data
const THAI_MONTHS = [
  { value: 1, name: 'มกราคม', short: 'ม.ค.' },
  { value: 2, name: 'กุมภาพันธ์', short: 'ก.พ.' },
  { value: 3, name: 'มีนาคม', short: 'มี.ค.' },
  { value: 4, name: 'เมษายน', short: 'เม.ย.' },
  { value: 5, name: 'พฤษภาคม', short: 'พ.ค.' },
  { value: 6, name: 'มิถุนายน', short: 'มิ.ย.' },
  { value: 7, name: 'กรกฎาคม', short: 'ก.ค.' },
  { value: 8, name: 'สิงหาคม', short: 'ส.ค.' },
  { value: 9, name: 'กันยายน', short: 'ก.ย.' },
  { value: 10, name: 'ตุลาคม', short: 'ต.ค.' },
  { value: 11, name: 'พฤศจิกายน', short: 'พ.ย.' },
  { value: 12, name: 'ธันวาคม', short: 'ธ.ค.' },
];

// Thai Years Range (พ.ศ. 2567 - 2575 / ค.ศ. 2024 - 2032)
const THAI_YEARS = [
  { ce: 2024, be: 2567 },
  { ce: 2025, be: 2568 },
  { ce: 2026, be: 2569 },
  { ce: 2027, be: 2570 },
  { ce: 2028, be: 2571 },
  { ce: 2029, be: 2572 },
  { ce: 2030, be: 2573 },
  { ce: 2031, be: 2574 },
  { ce: 2032, be: 2575 },
];

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

const formatThaiDMY = (isoStr: string): string => {
  if (!isoStr) return '-';
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    const thaiYear = y > 2500 ? y : y + 543;
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${thaiYear}`;
  }
  return isoStr;
};

const formatThaiDateReadable = (isoStr: string): string => {
  if (!isoStr) return '-';
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    const thaiMonth = THAI_MONTHS[m - 1]?.short || `${m}`;
    const thaiYear = y > 2500 ? y : y + 543;
    return `${d} ${thaiMonth} ${thaiYear}`;
  }
  return isoStr;
};

const addDaysToISO = (isoStr: string, days: number): string => {
  const parts = isoStr ? isoStr.split('-') : [];
  const d = parts.length === 3
    ? new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
    : new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getUpcomingSaturdayISO = (): string => {
  const d = new Date();
  const dayOfWeek = d.getDay(); // 0 is Sun, 6 is Sat
  const diff = (6 - dayOfWeek + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Thai DMY Date Picker Component (วัน / เดือน / ปี)
interface ThaiDMYDatePickerProps {
  label: string;
  value: string; // ISO format 'YYYY-MM-DD'
  onChange: (isoDate: string) => void;
  quickPresets?: { label: string; onClick: () => void }[];
}

const ThaiDMYDatePicker: React.FC<ThaiDMYDatePickerProps> = ({
  label,
  value,
  onChange,
  quickPresets,
}) => {
  const hiddenDateInputRef = React.useRef<HTMLInputElement>(null);

  const parts = value ? value.split('-') : [];
  const today = new Date();
  const curYear = parts.length === 3 ? parseInt(parts[0], 10) || today.getFullYear() : today.getFullYear();
  const curMonth = parts.length === 3 ? parseInt(parts[1], 10) || today.getMonth() + 1 : today.getMonth() + 1;
  let curDay = parts.length === 3 ? parseInt(parts[2], 10) || today.getDate() : today.getDate();

  const daysInMonth = getDaysInMonth(curYear, curMonth);
  if (curDay > daysInMonth) curDay = daysInMonth;

  const handleDayChange = (d: number) => {
    const newIso = `${curYear}-${String(curMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onChange(newIso);
  };

  const handleMonthChange = (m: number) => {
    const maxDays = getDaysInMonth(curYear, m);
    const validDay = Math.min(curDay, maxDays);
    const newIso = `${curYear}-${String(m).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
    onChange(newIso);
  };

  const handleYearChange = (y: number) => {
    const maxDays = getDaysInMonth(y, curMonth);
    const validDay = Math.min(curDay, maxDays);
    const newIso = `${y}-${String(curMonth).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
    onChange(newIso);
  };

  return (
    <div className="bg-stone-50/90 border-2 border-stone-300 rounded-2xl p-3 space-y-2.5 shadow-xs">
      <div className="flex items-center justify-between">
        <label className="block text-stone-950 font-black text-xs flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-700" />
          <span>{label}</span>
          <span className="text-[10px] text-amber-900 bg-amber-200/90 font-black px-1.5 py-0.5 rounded border border-amber-400">
            ว / ด / ป
          </span>
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (hiddenDateInputRef.current) {
                if (typeof hiddenDateInputRef.current.showPicker === 'function') {
                  try {
                    hiddenDateInputRef.current.showPicker();
                  } catch (e) {
                    hiddenDateInputRef.current.focus();
                  }
                } else {
                  hiddenDateInputRef.current.focus();
                }
              }
            }}
            className="text-[11px] font-bold text-amber-900 hover:text-stone-950 flex items-center gap-1 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg border border-amber-300 transition shadow-2xs cursor-pointer"
            title="กดเพื่อเปิดปฏิทินเลือกวันที่"
          >
            <span>📅 ปฏิทิน</span>
          </button>
          <input
            ref={hiddenDateInputRef}
            type="date"
            value={value}
            onChange={(e) => {
              if (e.target.value) onChange(e.target.value);
            }}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* 3 Selectors: ว (วัน), ด (เดือน), ป (ปี) in EXACT ว/ด/ป order */}
      <div className="grid grid-cols-3 gap-1.5">
        {/* วัน (ว) */}
        <div>
          <label className="block text-[10px] font-black text-stone-600 mb-0.5">วัน (ว)</label>
          <select
            value={curDay}
            onChange={(e) => handleDayChange(parseInt(e.target.value, 10))}
            className="w-full bg-white border border-stone-300 rounded-xl p-2 text-stone-950 font-black text-xs focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
          >
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {String(d).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        {/* เดือน (ด) */}
        <div>
          <label className="block text-[10px] font-black text-stone-600 mb-0.5">เดือน (ด)</label>
          <select
            value={curMonth}
            onChange={(e) => handleMonthChange(parseInt(e.target.value, 10))}
            className="w-full bg-white border border-stone-300 rounded-xl p-2 text-stone-950 font-black text-xs focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
          >
            {THAI_MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {String(m.value).padStart(2, '0')} - {m.short}
              </option>
            ))}
          </select>
        </div>

        {/* ปี (ป) */}
        <div>
          <label className="block text-[10px] font-black text-stone-600 mb-0.5">ปี (ป)</label>
          <select
            value={curYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
            className="w-full bg-white border border-stone-300 rounded-xl p-2 text-stone-950 font-black text-xs focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
          >
            {THAI_YEARS.map((y) => (
              <option key={y.ce} value={y.ce}>
                {y.be} ({y.ce})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Preview Badge */}
      <div className="flex items-center justify-between text-[11px] bg-white px-2.5 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
        <span className="text-stone-600 font-bold">ว/ด/ป ที่เลือก:</span>
        <span className="font-black text-amber-950 font-mono">
          {formatThaiDMY(value)} <span className="text-stone-600 font-sans font-medium">({formatThaiDateReadable(value)})</span>
        </span>
      </div>

      {/* Quick Presets */}
      {quickPresets && quickPresets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          <span className="text-[10px] text-stone-500 font-bold">ด่วน:</span>
          {quickPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={preset.onClick}
              className="text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-stone-800 hover:text-amber-950 px-2 py-0.5 rounded-lg border border-amber-200 shadow-2xs transition cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminEventMarketManager: React.FC = () => {
  const { storeSettings } = useShop();

  // Store branches state for HUDA ABAYA with localStorage persistence
  const [branches, setBranches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_event_branches');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [
      'HUDA ABAYA - สาขาใหญ่ หนองจอก',
      'HUDA ABAYA - บูธ/ตลาดนัดคลอง16',
    ];
  });

  const [activeBranch, setActiveBranch] = useState<string>('HUDA ABAYA - บูธ/ตลาดนัดคลอง16');
  const [eventStatusFilter, setEventStatusFilter] = useState<'all' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED'>('all');
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState<boolean>(false);
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState<boolean>(false);
  const [newBranchInput, setNewBranchInput] = useState<string>('');

  // Event schedules state
  const [schedules, setSchedules] = useState<EventSchedule[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_event_schedules');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [
      {
        id: 'EVENT-KLONG16-001',
        title: 'ออกบูธตลาดนัดคลอง 16 (HUDA ABAYA Pop-up)',
        branchName: 'HUDA ABAYA - บูธ/ตลาดนัดคลอง16',
        location: 'ตลาดนัดคลอง 16',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        operatingHours: '10:00 - 22:00 น.',
        productsToPrepare: 'ชุดอาบายะห์ดูไบ • คัฟทาน • น้ำหอมดูไบ & Oud',
        phonePromptPay: storeSettings.contactPhone || '083-427-4687',
        status: 'ACTIVE',
        salesTarget: 30000,
        actualSales: 0,
        assignedStaff: 'เจ้าของร้าน (Admin)',
        rentalFee: 1500,
        note: 'คำนวณเตรียมสต๊อกอาบายะห์ 100 ชุด และน้ำหอมดูไบ EDP 50 ขวด',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  // Form State for Add/Edit Event (HUDA ABAYA Default)
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState<string>('งานออกบูธตลาดนัดคลอง 16');
  const [eventBranch, setEventBranch] = useState<string>('HUDA ABAYA - บูธ/ตลาดนัดคลอง16');
  const [eventLocation, setEventLocation] = useState<string>('ตลาดนัดคลอง 16');
  const [eventHours, setEventHours] = useState<string>('10:00 - 22:00 น.');
  const [eventProducts, setEventProducts] = useState<string>('ชุดอาบายะห์ดูไบ • คัฟทาน • น้ำหอมดูไบ & Oud');
  const [eventPhone, setEventPhone] = useState<string>(storeSettings.contactPhone || '083-427-4687');
  const [eventStatus, setEventStatus] = useState<'UPCOMING' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [eventStartDate, setEventStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [eventEndDate, setEventEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [eventSalesTarget, setEventSalesTarget] = useState<number>(30000);
  const [eventStaff, setEventStaff] = useState<string>('เจ้าของร้าน (Admin)');
  const [eventRentalFee, setEventRentalFee] = useState<number | ''>(1500);
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

  const saveBranchesToStorage = (updatedBranches: string[]) => {
    setBranches(updatedBranches);
    if (typeof window !== 'undefined') {
      localStorage.setItem('huda_event_branches', JSON.stringify(updatedBranches));
    }
  };

  const saveSchedulesToStorage = (updated: EventSchedule[]) => {
    setSchedules(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('huda_event_schedules', JSON.stringify(updated));
    }
  };

  const handleOpenAddModal = () => {
    setEditingScheduleId(null);
    setEventTitle('งานออกบูธตลาดนัดคลอง 16');
    setEventBranch(activeBranch);
    setEventLocation('ตลาดนัดคลอง 16');
    setEventHours('10:00 - 22:00 น.');
    setEventProducts('ชุดอาบายะห์ดูไบ • คัฟทาน • น้ำหอมดูไบ & Oud');
    setEventPhone(storeSettings.contactPhone || '083-427-4687');
    setEventStatus('ACTIVE');
    setEventStartDate(new Date().toISOString().slice(0, 10));
    setEventEndDate(new Date().toISOString().slice(0, 10));
    setEventSalesTarget(30000);
    setEventStaff('เจ้าของร้าน (Admin)');
    setEventRentalFee(1500);
    setEventNote('คำนวณเตรียมสต๊อกอาบายะห์ 100 ชุด และน้ำหอมดูไบ 50 ขวด');
    setIsAddEventModalOpen(true);
  };

  const handleOpenEditModal = (schedule: EventSchedule) => {
    setEditingScheduleId(schedule.id);
    setEventTitle(schedule.title);
    setEventBranch(schedule.branchName);
    setEventLocation(schedule.location);
    setEventHours(schedule.operatingHours);
    setEventProducts(schedule.productsToPrepare);
    setEventPhone(schedule.phonePromptPay);
    setEventStatus(schedule.status);
    setEventStartDate(schedule.startDate);
    setEventEndDate(schedule.endDate);
    setEventSalesTarget(schedule.salesTarget || 30000);
    setEventStaff(schedule.assignedStaff || 'เจ้าของร้าน (Admin)');
    setEventRentalFee(schedule.rentalFee !== undefined ? schedule.rentalFee : 0);
    setEventNote(schedule.note || '');
    setIsAddEventModalOpen(true);
  };

  const handleSaveNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      alert('กรุณากรอกชื่อตารางงานด้วยครับ');
      return;
    }

    const finalRentalFee = typeof eventRentalFee === 'number' ? eventRentalFee : (parseInt(eventRentalFee, 10) || 0);

    if (editingScheduleId) {
      const updatedSchedules = schedules.map((s) => {
        if (s.id === editingScheduleId) {
          return {
            ...s,
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
            assignedStaff: eventStaff.trim(),
            rentalFee: finalRentalFee,
            note: eventNote.trim(),
          };
        }
        return s;
      });
      saveSchedulesToStorage(updatedSchedules);
      alert(`บันทึกการแก้ไขตารางงาน "${eventTitle}" เรียบร้อยแล้ว!`);
    } else {
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
        rentalFee: finalRentalFee,
        note: eventNote.trim(),
        createdAt: new Date().toISOString(),
      };

      saveSchedulesToStorage([newEvent, ...schedules]);
      alert(`เพิ่มตารางออกงาน "${eventTitle}" เรียบร้อยแล้ว!`);
    }

    setEditingScheduleId(null);
    setIsAddEventModalOpen(false);
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchInput.trim()) return;
    const formattedBranch = newBranchInput.trim().startsWith('HUDA ABAYA')
      ? newBranchInput.trim()
      : `HUDA ABAYA - ${newBranchInput.trim()}`;

    if (branches.includes(formattedBranch)) {
      alert(`มีสาขา/บูธ "${formattedBranch}" อยู่ในระบบแล้วครับ`);
      return;
    }

    const updated = [...branches, formattedBranch];
    saveBranchesToStorage(updated);
    setActiveBranch(formattedBranch);
    setNewBranchInput('');
    setIsAddBranchModalOpen(false);
    alert(`เพิ่มบูธ/สาขา "${formattedBranch}" สำเร็จ! สามารถเลือกใช้งานได้ทันที`);
  };

  const handleDeleteBranch = (branchToDelete: string) => {
    if (branches.length <= 1) {
      alert('ต้องมีอย่างน้อย 1 สาขาหลักในระบบครับ');
      return;
    }
    if (confirm(`คุณต้องการลบสาขา/บูธ "${branchToDelete}" ใช่หรือไม่?`)) {
      const updated = branches.filter((b) => b !== branchToDelete);
      saveBranchesToStorage(updated);
      if (activeBranch === branchToDelete) {
        setActiveBranch(updated[0]);
      }
    }
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
              <span>โทร/พร้อมเพย์: {storeSettings.contactPhone || '083-427-4687'}</span>
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

          {branches.length > 1 && (
            <button
              onClick={() => handleDeleteBranch(activeBranch)}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-950 font-black border border-red-300 rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
              title="ลบสาขา/บูธที่เลือกอยู่นี้"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-700" />
              <span>ลบสาขานี้</span>
            </button>
          )}
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
              onClick={handleOpenAddModal}
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
                onClick={handleOpenAddModal}
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
                    <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-300/70 space-y-1">
                      <p className="flex items-center gap-1.5 font-black text-amber-950">
                        <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>
                          วันที่ออกงาน (ว/ด/ป):{' '}
                          <strong className="text-amber-900 font-mono text-[13px]">
                            {s.startDate === s.endDate
                              ? `${formatThaiDMY(s.startDate)} (${formatThaiDateReadable(s.startDate)})`
                              : `${formatThaiDMY(s.startDate)} ถึง ${formatThaiDMY(s.endDate)} (${formatThaiDateReadable(s.startDate)} - ${formatThaiDateReadable(s.endDate)})`
                            }
                          </strong>
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5 font-black text-stone-800 text-[11px] pl-5">
                        <Clock className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                        <span>เวลาทำการ: {s.operatingHours}</span>
                      </p>
                    </div>
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
                    {s.rentalFee !== undefined && (
                      <p className="flex items-center gap-1.5 font-black text-amber-950 bg-amber-50/90 px-2.5 py-1.5 rounded-xl border border-amber-300/80 shadow-xs">
                        <Tag className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>
                          ราคาค่าเช่าสถานที่ออกบูธ: <strong className="text-amber-900 font-serif font-black">{s.rentalFee === 0 ? 'ฟรี (ไม่มีค่าที่)' : `฿${s.rentalFee.toLocaleString()}`}</strong>
                        </span>
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

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(s)}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 border border-amber-400 text-amber-950 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1"
                      title="แก้ไขตารางงานนี้"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-800" />
                      <span>แก้ไข</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSchedule(s.id)}
                      className="p-1.5 bg-red-100 hover:bg-red-200 border border-red-400 text-red-950 rounded-lg text-xs transition cursor-pointer"
                      title="ลบตารางงานนี้"
                    >
                      <Trash2 className="w-4 h-4 text-red-700" />
                    </button>
                  </div>
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
                <span>{editingScheduleId ? 'แก้ไขตารางออกงาน & ตลาดนัด (HUDA ABAYA)' : 'ลงตารางออกงาน & ตลาดนัดใหม่ (HUDA ABAYA)'}</span>
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

              {/* Thai DMY Date Selection (วัน / เดือน / ปี) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ThaiDMYDatePicker
                  label="วันที่เริ่มออกงาน"
                  value={eventStartDate}
                  onChange={(newDate) => {
                    setEventStartDate(newDate);
                    // If end date is earlier than new start date, sync end date to new start date
                    if (eventEndDate < newDate) {
                      setEventEndDate(newDate);
                    }
                  }}
                  quickPresets={[
                    {
                      label: 'วันนี้',
                      onClick: () => {
                        const today = new Date().toISOString().slice(0, 10);
                        setEventStartDate(today);
                        if (eventEndDate < today) setEventEndDate(today);
                      },
                    },
                    {
                      label: 'พรุ่งนี้',
                      onClick: () => {
                        const tomorrow = addDaysToISO(new Date().toISOString().slice(0, 10), 1);
                        setEventStartDate(tomorrow);
                        if (eventEndDate < tomorrow) setEventEndDate(tomorrow);
                      },
                    },
                    {
                      label: 'เสาร์นี้',
                      onClick: () => {
                        const sat = getUpcomingSaturdayISO();
                        setEventStartDate(sat);
                        if (eventEndDate < sat) setEventEndDate(sat);
                      },
                    },
                    {
                      label: '+3 วัน',
                      onClick: () => {
                        const next3 = addDaysToISO(new Date().toISOString().slice(0, 10), 3);
                        setEventStartDate(next3);
                        if (eventEndDate < next3) setEventEndDate(next3);
                      },
                    },
                    {
                      label: '+7 วัน',
                      onClick: () => {
                        const next7 = addDaysToISO(new Date().toISOString().slice(0, 10), 7);
                        setEventStartDate(next7);
                        if (eventEndDate < next7) setEventEndDate(next7);
                      },
                    },
                  ]}
                />

                <ThaiDMYDatePicker
                  label="วันที่สิ้นสุดงาน"
                  value={eventEndDate}
                  onChange={(newDate) => {
                    setEventEndDate(newDate);
                  }}
                  quickPresets={[
                    {
                      label: 'วันเดียวกับวันเริ่ม',
                      onClick: () => setEventEndDate(eventStartDate),
                    },
                    {
                      label: '+1 วัน (2 วัน)',
                      onClick: () => setEventEndDate(addDaysToISO(eventStartDate, 1)),
                    },
                    {
                      label: '+2 วัน (ศุกร์-อาทิตย์)',
                      onClick: () => setEventEndDate(addDaysToISO(eventStartDate, 2)),
                    },
                    {
                      label: '+7 วัน (1 สัปดาห์)',
                      onClick: () => setEventEndDate(addDaysToISO(eventStartDate, 7)),
                    },
                  ]}
                />
              </div>

              {/* Booth Rental Fee Input with Preset Chips */}
              <div className="bg-amber-50/70 border border-amber-300/80 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-stone-950 font-black flex items-center gap-1.5 text-xs">
                    <Tag className="w-4 h-4 text-amber-700" />
                    <span>ราคาเช่าสถานที่ออกบูธ (บาท)</span>
                  </label>
                  <span className="text-[10px] text-amber-900 font-extrabold bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                    {eventRentalFee === '' || eventRentalFee === 0 ? 'ฟรี (ไม่มีค่าที่)' : `฿${(typeof eventRentalFee === 'number' ? eventRentalFee : 0).toLocaleString()}`}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-serif font-black text-amber-800 text-sm">
                    ฿
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={eventRentalFee}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEventRentalFee(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="กรอกราคาค่าเช่าสถานที่ หรือ 0 หากไม่มีค่าที่/ฟรี"
                    className="w-full bg-white border-2 border-stone-400 focus:border-amber-500 rounded-xl py-2 pl-8 pr-12 text-stone-950 font-mono font-black text-xs focus:outline-none shadow-xs"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 font-bold">
                    บาท
                  </span>
                </div>

                {/* Quick preset chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] font-black text-stone-600 shrink-0">ตัวเลือกด่วน:</span>
                  {[0, 300, 500, 1000, 1500, 2000, 3000, 5000].map((fee) => (
                    <button
                      key={fee}
                      type="button"
                      onClick={() => setEventRentalFee(fee)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition cursor-pointer ${
                        eventRentalFee === fee
                          ? 'bg-amber-400 border-amber-600 text-stone-950 shadow-xs'
                          : 'bg-white hover:bg-stone-100 border-stone-300 text-stone-800'
                      }`}
                    >
                      {fee === 0 ? 'ฟรี ฿0' : `฿${fee.toLocaleString()}`}
                    </button>
                  ))}
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
                  {editingScheduleId ? 'บันทึกการแก้ไขตารางงาน' : 'บันทึกตารางออกงาน'}
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
