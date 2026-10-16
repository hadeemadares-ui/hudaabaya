'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Plus, Store, User, Phone, DollarSign, Sparkles, CheckCircle2, AlertCircle, X, ChevronRight, ChevronLeft, Filter, Flame, Edit2, Trash2, ShoppingBag, Tag, List, LayoutGrid } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { EventSchedule } from '../../types';

// Thai Full Months Data
const THAI_MONTH_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

// Thai Weekdays Data with themed colors
const THAI_WEEKDAYS = [
  { short: 'อา.', full: 'วันอาทิตย์', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { short: 'จ.', full: 'วันจันทร์', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { short: 'อ.', full: 'วันอังคาร', color: 'bg-pink-100 text-pink-800 border-pink-300' },
  { short: 'พ.', full: 'วันพุธ', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { short: 'พฤ.', full: 'วันพฤหัสบดี', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { short: 'ศ.', full: 'วันศุกร์', color: 'bg-sky-100 text-sky-800 border-sky-300' },
  { short: 'ส.', full: 'วันเสาร์', color: 'bg-purple-100 text-purple-800 border-purple-300' },
];

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

  // View mode: 'calendar' (default), 'agenda', 'cards'
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda' | 'cards'>('calendar');
  const [calendarYear, setCalendarYear] = useState<number>(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(() => new Date().getMonth());
  const [selectedCalendarSchedule, setSelectedCalendarSchedule] = useState<EventSchedule | null>(null);

  // Filtered Schedules
  const filteredSchedules = schedules.filter((s) => {
    const matchesStatus = eventStatusFilter === 'all' || s.status === eventStatusFilter;
    return matchesStatus;
  });

  // Calendar month navigation
  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const handleTodayMonth = () => {
    const today = new Date();
    setCalendarYear(today.getFullYear());
    setCalendarMonth(today.getMonth());
  };

  // Generate calendar days for current month view
  const calendarDays = React.useMemo(() => {
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const prevMonthDays = new Date(calendarYear, calendarMonth, 0).getDate();
    const todayStr = new Date().toISOString().slice(0, 10);

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      schedules: EventSchedule[];
    }[] = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevMonth = calendarMonth === 0 ? 11 : calendarMonth - 1;
      const prevYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const daySchedules = filteredSchedules.filter((s) => dateStr >= s.startDate && dateStr <= s.endDate);
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        schedules: daySchedules,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const daySchedules = filteredSchedules.filter((s) => dateStr >= s.startDate && dateStr <= s.endDate);
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        schedules: daySchedules,
      });
    }

    // Next month padding to fill weeks (multiples of 7)
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remainingDays; d++) {
      const nextMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
      const nextYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const daySchedules = filteredSchedules.filter((s) => dateStr >= s.startDate && dateStr <= s.endDate);
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        schedules: daySchedules,
      });
    }

    return days;
  }, [calendarYear, calendarMonth, filteredSchedules]);

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

  const handleOpenAddModal = (defaultDate?: string) => {
    setEditingScheduleId(null);
    setEventTitle('งานออกบูธตลาดนัดคลอง 16');
    setEventBranch(activeBranch);
    setEventLocation('ตลาดนัดคลอง 16');
    setEventHours('10:00 - 22:00 น.');
    setEventProducts('ชุดอาบายะห์ดูไบ • คัฟทาน • น้ำหอมดูไบ & Oud');
    setEventPhone(storeSettings.contactPhone || '083-427-4687');
    setEventStatus('ACTIVE');
    const targetDate = defaultDate || new Date().toISOString().slice(0, 10);
    setEventStartDate(targetDate);
    setEventEndDate(targetDate);
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

          <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleOpenAddModal()}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm rounded-2xl shadow-md hover:scale-105 transition flex items-center justify-center gap-2 cursor-pointer border-2 border-amber-500"
            >
              <Plus className="w-5 h-5 text-stone-950" />
              <span>+ ลงตารางออกงานใหม่</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto pt-2">
          {/* 3 View Tabs */}
          <div className="inline-flex bg-amber-100/80 p-1.5 rounded-2xl border border-amber-300 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-amber-400 text-stone-950 shadow-md border border-amber-500'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-amber-200/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-900" />
              <span>📅 ปฏิทินนัดหมาย</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-amber-400 text-stone-950 shadow-md border border-amber-500'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-amber-200/60'
              }`}
            >
              <List className="w-3.5 h-3.5 text-amber-900" />
              <span>📋 ตารางนัดหมาย &amp; เวลา</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-amber-400 text-stone-950 shadow-md border border-amber-500'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-amber-200/60'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-900" />
              <span>🗂️ การ์ดสรุปงาน</span>
            </button>
          </div>

          <div className="text-xs font-black text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
            แสดง: <strong className="text-amber-950 font-mono">{filteredSchedules.length}</strong> จาก {schedules.length} รายการ
          </div>
        </div>

        {/* Centered Filter Tabs Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-t-2 border-b-2 border-amber-400/30 py-3 max-w-4xl mx-auto">
          <button
            onClick={() => setEventStatusFilter('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              eventStatusFilter === 'all'
                ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            ทั้งหมด ({schedules.length})
          </button>

          <button
            onClick={() => setEventStatusFilter('UPCOMING')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              eventStatusFilter === 'UPCOMING'
                ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            รอดำเนินการ / เร็วๆ นี้ ({upcomingCount})
          </button>

          <button
            onClick={() => setEventStatusFilter('ACTIVE')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              eventStatusFilter === 'ACTIVE'
                ? 'bg-emerald-500 text-stone-950 border-2 border-emerald-600 shadow-md'
                : 'bg-white text-emerald-950 hover:bg-emerald-50 border-2 border-emerald-600/60'
            }`}
          >
            กำลังขายอยู่ ({activeCount})
          </button>

          <button
            onClick={() => setEventStatusFilter('COMPLETED')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              eventStatusFilter === 'COMPLETED'
                ? 'bg-stone-800 text-white border-2 border-stone-900 shadow-md'
                : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
            }`}
          >
            เสร็จสิ้นแล้ว ({completedCount})
          </button>
        </div>

        {/* 1. CALENDAR VIEW (มุมมองปฏิทินนัดหมาย) */}
        {viewMode === 'calendar' && (
          <div className="bg-stone-50/70 border-2 border-amber-400/80 rounded-3xl p-3 sm:p-5 shadow-inner max-w-5xl mx-auto space-y-3.5 text-stone-950 text-left">
            {/* Calendar Month Header & Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-amber-300/80 shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-amber-100 border border-stone-300 text-stone-800 hover:text-amber-950 transition cursor-pointer shadow-2xs"
                  title="เดือนก่อนหน้า"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleTodayMonth}
                  className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 text-xs font-black transition cursor-pointer shadow-2xs"
                >
                  เดือนนี้ (วันนี้)
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-amber-100 border border-stone-300 text-stone-800 hover:text-amber-950 transition cursor-pointer shadow-2xs"
                  title="เดือนถัดไป"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <h3 className="font-serif font-black text-xl sm:text-2xl text-amber-950 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-amber-600 shrink-0" />
                <span>
                  {THAI_MONTH_FULL[calendarMonth]} พ.ศ. {calendarYear + 543}{' '}
                  <span className="text-sm font-sans font-bold text-stone-500">({calendarYear})</span>
                </span>
              </h3>

              <div className="flex items-center gap-2 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
                  กำลังขาย
                </span>
                <span className="flex items-center gap-1 text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                  เร็วๆ นี้
                </span>
              </div>
            </div>

            {/* Calendar Weekday Headers (อา. - ส.) */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
              {THAI_WEEKDAYS.map((w, idx) => (
                <div
                  key={idx}
                  className={`py-2 px-1 rounded-xl text-xs font-black border shadow-2xs ${w.color}`}
                >
                  <span className="hidden sm:inline">{w.full}</span>
                  <span className="sm:hidden">{w.short}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid (7 columns) */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {calendarDays.map((cell, idx) => (
                <div
                  key={idx}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      handleOpenAddModal(cell.dateStr);
                    }
                  }}
                  className={`min-h-[110px] sm:min-h-[135px] p-1.5 sm:p-2 rounded-2xl border flex flex-col justify-between transition group relative ${
                    cell.isCurrentMonth
                      ? 'bg-white border-stone-200 hover:border-amber-400 shadow-2xs'
                      : 'bg-stone-100/60 border-stone-200/50 opacity-60 text-stone-400'
                  } ${cell.isToday ? 'ring-2 ring-amber-500 bg-amber-50/40 shadow-sm' : ''}`}
                >
                  {/* Top Bar: Date Number & Today Badge */}
                  <div className="flex items-center justify-between pointer-events-none">
                    <span
                      className={`text-xs sm:text-sm font-black rounded-lg px-1.5 py-0.5 ${
                        cell.isToday
                          ? 'bg-amber-500 text-stone-950 font-mono shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-stone-900 font-mono'
                          : 'text-stone-400 font-mono'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {cell.isToday && (
                      <span className="text-[9px] font-black bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded-full border border-amber-400 shadow-2xs">
                        วันนี้
                      </span>
                    )}

                    {/* Quick + button on hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddModal(cell.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 pointer-events-auto p-1 rounded-md bg-amber-100 hover:bg-amber-300 text-amber-950 transition text-[10px] font-black cursor-pointer shadow-2xs"
                      title={`ลงตารางงานวันที่ ${formatThaiDMY(cell.dateStr)}`}
                    >
                      +
                    </button>
                  </div>

                  {/* Cell Schedules List */}
                  <div className="space-y-1 my-1 overflow-y-auto max-h-[85px] sm:max-h-[100px] scrollbar-thin">
                    {cell.schedules.map((s) => (
                      <div
                        key={s.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCalendarSchedule(s);
                        }}
                        className={`p-1.5 rounded-xl text-left cursor-pointer transition shadow-xs border ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700'
                            : s.status === 'UPCOMING'
                            ? 'bg-amber-300 hover:bg-amber-200 text-stone-950 border-amber-400 font-black'
                            : 'bg-stone-200 hover:bg-stone-300 text-stone-800 border-stone-300'
                        }`}
                        title={`${s.title} (${s.operatingHours}) - คลิกเพื่อดูรายละเอียดหรือแก้ไข`}
                      >
                        <div className="flex items-center justify-between gap-1 leading-tight">
                          <span className="font-mono text-[9px] sm:text-[10px] font-black truncate">
                            {s.operatingHours.split(' ')[0] || s.operatingHours}
                          </span>
                          <span className="text-[9px] font-black px-1 rounded bg-black/10 shrink-0">
                            {s.rentalFee === undefined || s.rentalFee === 0 ? 'ฟรี' : `฿${s.rentalFee?.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="font-black text-[10px] sm:text-[11px] truncate leading-tight mt-0.5">
                          {s.title}
                        </div>
                        <div className="text-[9px] truncate opacity-90 leading-tight">
                          📍 {s.location}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Empty state hint on hover if no schedules */}
                  {cell.schedules.length === 0 && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddModal(cell.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-center py-1 text-[10px] text-amber-800 font-bold bg-amber-50 hover:bg-amber-100 rounded-lg border border-dashed border-amber-300 cursor-pointer transition"
                    >
                      + ออกงาน
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center text-[11px] text-stone-600 font-bold pt-1">
              💡 <em>คลิกที่วันบนปฏิทินเพื่อลงตารางงานใหม่ หรือคลิกที่แถบกิจกรรมเพื่อดูรายละเอียด &amp; แก้ไข</em>
            </div>
          </div>
        )}

        {/* 2. AGENDA / TIMETABLE VIEW (ตารางนัดหมาย & เวลา) */}
        {viewMode === 'agenda' && (
          <div className="bg-white border-2 border-amber-400/80 rounded-3xl p-4 sm:p-6 shadow-xl max-w-5xl mx-auto space-y-4 text-stone-950 text-left">
            <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3">
              <h3 className="font-serif font-black text-xl text-amber-950 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>ตารางนัดหมายออกงาน &amp; ไทม์ไลน์ (Agenda Timetable)</span>
              </h3>
              <span className="text-xs font-black text-stone-600 bg-stone-100 px-3 py-1 rounded-xl border border-stone-200">
                พบ {filteredSchedules.length} รายการ
              </span>
            </div>

            {filteredSchedules.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Calendar className="w-10 h-10 text-stone-400 mx-auto" />
                <p className="font-black text-stone-700">ไม่มีตารางงานตามตัวกรองที่เลือก</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-amber-50 border-b-2 border-amber-300 text-stone-900 font-black">
                      <th className="p-3 rounded-l-xl">วันที่ออกงาน (ว/ด/ป)</th>
                      <th className="p-3">เวลาทำการ</th>
                      <th className="p-3">ชื่องาน / ตลาดนัด</th>
                      <th className="p-3">สถานที่</th>
                      <th className="p-3">ค่าเช่าบูธ</th>
                      <th className="p-3">พนักงาน</th>
                      <th className="p-3">สถานะ</th>
                      <th className="p-3 text-right rounded-r-xl">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {filteredSchedules
                      .sort((a, b) => a.startDate.localeCompare(b.startDate))
                      .map((s) => (
                        <tr
                          key={s.id}
                          className="hover:bg-amber-50/50 transition cursor-pointer"
                          onClick={() => setSelectedCalendarSchedule(s)}
                        >
                          <td className="p-3 font-mono font-black text-amber-950 whitespace-nowrap">
                            {formatThaiDMY(s.startDate)}
                            {s.startDate !== s.endDate && (
                              <span className="text-stone-500 font-sans block text-[10px]">
                                ถึง {formatThaiDMY(s.endDate)}
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-black text-stone-800 whitespace-nowrap">
                            {s.operatingHours}
                          </td>
                          <td className="p-3 font-serif font-black text-stone-950">
                            <div>{s.title}</div>
                            <div className="text-[10px] text-stone-600 font-sans">{s.branchName}</div>
                          </td>
                          <td className="p-3 text-stone-800 font-black whitespace-nowrap">
                            📍 {s.location}
                          </td>
                          <td className="p-3 font-mono font-black text-amber-900 whitespace-nowrap">
                            {s.rentalFee === undefined || s.rentalFee === 0 ? 'ฟรี' : `฿${s.rentalFee.toLocaleString()}`}
                          </td>
                          <td className="p-3 text-stone-700 font-bold whitespace-nowrap">
                            {s.assignedStaff || '-'}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {s.status === 'ACTIVE' && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px]">
                                กำลังขาย
                              </span>
                            )}
                            {s.status === 'UPCOMING' && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-[10px]">
                                เร็วๆ นี้
                              </span>
                            )}
                            {s.status === 'COMPLETED' && (
                              <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 font-black text-[10px]">
                                เสร็จสิ้น
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(s)}
                                className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg transition"
                                title="แก้ไข"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSchedule(s.id)}
                                className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                                title="ลบ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. CARDS VIEW (มุมมองการ์ดสรุปงาน) */}
        {viewMode === 'cards' && (
          <>
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
                    onClick={() => handleOpenAddModal()}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md hover:scale-105 transition flex items-center gap-1.5 mx-auto cursor-pointer border border-amber-500"
                  >
                    <Plus className="w-4 h-4 text-stone-950" />
                    <span>+ ลงตารางออกงานใหม่</span>
                  </button>
                </div>
              </div>
            ) : (
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
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] rounded-lg transition shadow border border-emerald-700 cursor-pointer"
                          >
                            เริ่มเปิดขาย
                          </button>
                        )}
                        {s.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateStatus(s.id, 'COMPLETED')}
                            className="px-2.5 py-1 bg-stone-700 hover:bg-stone-600 text-white font-black text-[11px] rounded-lg transition cursor-pointer"
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
          </>
        )}

      </div>

      {/* QUICK DETAIL MODAL FROM CALENDAR / AGENDA CLICK */}
      {selectedCalendarSchedule && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-lg w-full p-6 text-stone-950 shadow-2xl space-y-4 text-left">
            <div className="flex justify-between items-start border-b-2 border-amber-400/40 pb-3">
              <div>
                <span className="text-[10px] font-black text-stone-950 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-400">
                  {selectedCalendarSchedule.branchName}
                </span>
                <h3 className="font-serif font-black text-lg text-stone-950 mt-1">
                  {selectedCalendarSchedule.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCalendarSchedule(null)}
                className="text-stone-700 hover:text-stone-950 p-1.5 rounded-full border border-stone-300 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-stone-950">
              <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-300/80 space-y-1.5">
                <p className="flex items-center gap-2 font-black text-amber-950">
                  <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    วันที่ออกงาน (ว/ด/ป):{' '}
                    <strong className="text-amber-900 font-mono text-sm">
                      {selectedCalendarSchedule.startDate === selectedCalendarSchedule.endDate
                        ? `${formatThaiDMY(selectedCalendarSchedule.startDate)} (${formatThaiDateReadable(selectedCalendarSchedule.startDate)})`
                        : `${formatThaiDMY(selectedCalendarSchedule.startDate)} ถึง ${formatThaiDMY(selectedCalendarSchedule.endDate)}`
                      }
                    </strong>
                  </span>
                </p>
                <p className="flex items-center gap-2 font-black text-stone-800 pl-6">
                  <Clock className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                  <span>เวลาทำการ: {selectedCalendarSchedule.operatingHours}</span>
                </p>
              </div>

              <p className="flex items-center gap-2 font-black text-stone-950">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span>สถานที่: {selectedCalendarSchedule.location}</span>
              </p>

              {selectedCalendarSchedule.rentalFee !== undefined && (
                <p className="flex items-center gap-2 font-black text-amber-950 bg-amber-100/70 p-2 rounded-xl border border-amber-300">
                  <Tag className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    ราคาค่าเช่าสถานที่ออกบูธ:{' '}
                    <strong className="text-amber-900 font-mono text-sm">
                      {selectedCalendarSchedule.rentalFee === 0 ? 'ฟรี (ไม่มีค่าที่)' : `฿${selectedCalendarSchedule.rentalFee.toLocaleString()}`}
                    </strong>
                  </span>
                </p>
              )}

              <p className="flex items-center gap-2 font-black text-amber-900">
                <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
                <span>สินค้าเตรียมขาย: {selectedCalendarSchedule.productsToPrepare}</span>
              </p>

              {selectedCalendarSchedule.assignedStaff && (
                <p className="flex items-center gap-2 font-black text-stone-800">
                  <User className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>พนักงานรับผิดชอบ: {selectedCalendarSchedule.assignedStaff}</span>
                </p>
              )}

              {selectedCalendarSchedule.phonePromptPay && (
                <p className="flex items-center gap-2 font-black text-emerald-950 font-mono">
                  <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>โทร/พร้อมเพย์: {selectedCalendarSchedule.phonePromptPay}</span>
                </p>
              )}

              {selectedCalendarSchedule.note && (
                <p className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-stone-700 italic">
                  หมายเหตุ: {selectedCalendarSchedule.note}
                </p>
              )}
            </div>

            {/* Quick Actions in Detail Modal */}
            <div className="pt-3 border-t-2 border-amber-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {selectedCalendarSchedule.status === 'UPCOMING' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(selectedCalendarSchedule.id, 'ACTIVE');
                      setSelectedCalendarSchedule(null);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition cursor-pointer"
                  >
                    เริ่มเปิดขาย
                  </button>
                )}
                {selectedCalendarSchedule.status === 'ACTIVE' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(selectedCalendarSchedule.id, 'COMPLETED');
                      setSelectedCalendarSchedule(null);
                    }}
                    className="px-3 py-1.5 bg-stone-700 hover:bg-stone-800 text-white font-black text-xs rounded-xl shadow transition cursor-pointer"
                  >
                    ปิดงานขาย
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = selectedCalendarSchedule;
                    setSelectedCalendarSchedule(null);
                    handleOpenEditModal(toEdit);
                  }}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1 border border-amber-500 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>แก้ไข</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const toDelId = selectedCalendarSchedule.id;
                    setSelectedCalendarSchedule(null);
                    handleDeleteSchedule(toDelId);
                  }}
                  className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-xl transition cursor-pointer"
                  title="ลบตารางงานนี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
