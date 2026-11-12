'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Plus, Store, User, Phone, DollarSign, Sparkles, CheckCircle2, AlertCircle, X, ChevronRight, ChevronLeft, Filter, Flame, Edit2, Trash2, ShoppingBag, Tag, List, LayoutGrid, Upload, Image as ImageIcon, ExternalLink, ArrowRightLeft, Car, Smartphone, Laptop, Check, Bell, BookUser, Search, Eye, ArrowLeft, ArrowRight, RefreshCw, MessageSquare, Send } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatThaiDateWithDay, getThaiDayName } from '../../utils/dateUtils';
import { safeSetLocalStorage } from '../../utils/storageUtils';
import { EventSchedule, EventCoordinationImage, CoordinationPhotoCategory } from '../../types';

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

// Helper to categorize event date status: PAST, TODAY, or FUTURE
const getEventDateCategory = (startDate: string, endDate: string): 'PAST' | 'TODAY' | 'FUTURE' => {
  const today = new Date().toISOString().slice(0, 10);
  if (endDate < today) return 'PAST';
  if (startDate <= today && today <= endDate) return 'TODAY';
  return 'FUTURE';
};

// Helper to convert Buddhist Era (2569) to Christian Era (2026) ISO date string
export const normalizeToCE = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    if (y > 2400) {
      return `${y - 543}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }
  return dateStr;
};

// Helper to normalize and auto-reconcile event schedule status based on actual dates
export const normalizeEventScheduleStatus = (schedule: EventSchedule): EventSchedule => {
  let sStart = schedule.startDate || '';
  let sEnd = schedule.endDate || schedule.startDate || '';
  if (sStart) {
    const parts = sStart.split('-');
    if (parts.length === 3 && parseInt(parts[0], 10) > 2400) {
      sStart = `${parseInt(parts[0], 10) - 543}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }
  if (sEnd) {
    const parts = sEnd.split('-');
    if (parts.length === 3 && parseInt(parts[0], 10) > 2400) {
      sEnd = `${parseInt(parts[0], 10) - 543}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }

  const normalized: EventSchedule = {
    ...schedule,
    startDate: sStart || schedule.startDate,
    endDate: sEnd || sStart || schedule.endDate,
  };

  if (schedule.status === 'TRANSFERRED' || schedule.status === 'CANCELLED') return normalized;
  const today = new Date().toISOString().slice(0, 10);

  // เลยวันมาแล้ว (Past event) -> COMPLETED
  if (sEnd && sEnd < today) {
    return { ...normalized, status: 'COMPLETED' };
  }
  // ยังไม่ถึงวัน (Future event) -> UPCOMING
  if (sStart && sStart > today) {
    return { ...normalized, status: 'UPCOMING' };
  }
  // อยู่ในช่วงวันที่จัดงาน (Today)
  if (schedule.status === 'COMPLETED') {
    return normalized;
  }
  return { ...normalized, status: 'ACTIVE' };
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

export const COORDINATION_CATEGORIES: {
  key: CoordinationPhotoCategory;
  label: string;
  icon: string;
  color: string;
}[] = [
  { key: 'layout', label: 'ผังบูธ / แผนที่ล็อก', icon: '🗺️', color: 'bg-emerald-100 text-emerald-950 border-emerald-300' },
  { key: 'chat', label: 'แชท LINE ประสานงาน', icon: '💬', color: 'bg-green-100 text-green-950 border-green-300' },
  { key: 'business_card', label: 'นามบัตรผู้จัดงาน', icon: '📇', color: 'bg-amber-100 text-amber-950 border-amber-300' },
  { key: 'contract', label: 'สัญญาจอง / ใบสมัคร', icon: '📝', color: 'bg-purple-100 text-purple-950 border-purple-300' },
  { key: 'receipt', label: 'สลิป / ใบเสร็จมัดจำ', icon: '🧾', color: 'bg-blue-100 text-blue-950 border-blue-300' },
  { key: 'other', label: 'ภาพหน้างาน / บรรยากาศ', icon: '📷', color: 'bg-stone-100 text-stone-900 border-stone-300' },
];

export const getNormalizedCoordinationPhotos = (schedule?: Partial<EventSchedule> | null): EventCoordinationImage[] => {
  if (!schedule) return [];
  if (Array.isArray(schedule.coordinationPhotos) && schedule.coordinationPhotos.length > 0) {
    return schedule.coordinationPhotos;
  }
  if (Array.isArray(schedule.images) && schedule.images.length > 0) {
    return schedule.images.map((url, idx) => ({
      id: `photo-${idx}-${Date.now()}`,
      url,
      caption: '',
      category: (idx === 0 ? 'layout' : 'other') as CoordinationPhotoCategory,
      createdAt: new Date().toISOString(),
    }));
  }
  return [];
};

export const AdminEventMarketManager: React.FC = () => {
  const {
    storeSettings,
    eventSchedules,
    eventBranches,
    setEventSchedules,
    setEventBranches,
    addEventSchedule,
    updateEventSchedule,
    deleteEventSchedule,
    notifyEventScheduleToLine,
  } = useShop();

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

  // Auto-reconcile and normalize schedules status on mount or when eventSchedules update
  useEffect(() => {
    if (Array.isArray(eventSchedules) && eventSchedules.length > 0) {
      const normalized = eventSchedules.map(normalizeEventScheduleStatus);
      setSchedules(normalized);
      const hasDiff = normalized.some((item, i) => item.status !== eventSchedules[i]?.status);
      if (hasDiff) {
        setEventSchedules(normalized);
        if (typeof window !== 'undefined') {
          safeSetLocalStorage('huda_event_schedules', JSON.stringify(normalized));
        }
      }
    }
  }, [eventSchedules, setEventSchedules]);

  useEffect(() => {
    if (Array.isArray(eventBranches) && eventBranches.length > 0) {
      setBranches(eventBranches);
    }
  }, [eventBranches]);

  const [activeBranch, setActiveBranch] = useState<string>('HUDA ABAYA - บูธ/ตลาดนัดคลอง16');
  const [eventStatusFilter, setEventStatusFilter] = useState<'all' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'TRANSFERRED' | 'CANCELLED'>('all');
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState<boolean>(false);
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState<boolean>(false);
  const [newBranchInput, setNewBranchInput] = useState<string>('');

  // Event schedules state with auto-normalization on initial load
  const [schedules, setSchedules] = useState<EventSchedule[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('huda_event_schedules');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed.map(normalizeEventScheduleStatus);
        } catch (e) {}
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
        depositAmount: 500,
        googleMapsUrl: 'https://maps.google.com/?q=ตลาดนัดคลอง16',
        note: 'คำนวณเตรียมสต๊อกอาบายะห์ 100 ชุด และน้ำหอมดูไบ EDP 50 ขวด',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  // Reconcile on first mount and persist back to storage
  useEffect(() => {
    let hasChanges = false;
    const reconciled = schedules.map((s) => {
      const normalized = normalizeEventScheduleStatus(s);
      if (s.status !== normalized.status) {
        hasChanges = true;
        return normalized;
      }
      return s;
    });

    if (hasChanges) {
      setSchedules(reconciled);
      setEventSchedules(reconciled);
      if (typeof window !== 'undefined') {
        safeSetLocalStorage('huda_event_schedules', JSON.stringify(reconciled));
      }
    }
  }, []);

  // Form State for Add/Edit Event (HUDA ABAYA Default)
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [eventTravelExpense, setEventTravelExpense] = useState<number | ''>('');
  const [agendaMobileViewMode, setAgendaMobileViewMode] = useState<'auto' | 'cards' | 'table'>('auto');

  // Transfer Booth / Sublet Modal State (บันทึกการส่งต่อ / ปล่อยต่อบูธให้คนอื่น / เซ้งต่อ)
  const [transferModalSchedule, setTransferModalSchedule] = useState<EventSchedule | null>(null);
  const [transfereeName, setTransfereeName] = useState<string>('');
  const [transfereePhone, setTransfereePhone] = useState<string>('');
  const [transferPrice, setTransferPrice] = useState<number | ''>('');
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [transferNote, setTransferNote] = useState<string>('');
  const [transferSlipUrl, setTransferSlipUrl] = useState<string>('');
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventBranch, setEventBranch] = useState<string>(activeBranch || 'HUDA ABAYA - ออกบูธ');
  const [eventLocation, setEventLocation] = useState<string>('');
  const [eventHours, setEventHours] = useState<string>('10:00 - 22:00 น.');
  const [eventProducts, setEventProducts] = useState<string>('ชุดอาบายะห์ดูไบ • คัฟทาน • น้ำหอมดูไบ & Oud');
  const [eventPhone, setEventPhone] = useState<string>(storeSettings.contactPhone || '083-427-4687');
  const [eventStatus, setEventStatus] = useState<'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'TRANSFERRED' | 'CANCELLED'>('ACTIVE');
  const [eventMissedReason, setEventMissedReason] = useState<string>('');
  const [eventStartDate, setEventStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [eventEndDate, setEventEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [eventSalesTarget, setEventSalesTarget] = useState<number>(30000);
  const [eventStaff, setEventStaff] = useState<string>('เจ้าของร้าน (Admin)');
  const [eventRentalFee, setEventRentalFee] = useState<number | ''>('');
  const [eventDepositAmount, setEventDepositAmount] = useState<number | ''>('');
  const [eventDepositSlipUrl, setEventDepositSlipUrl] = useState<string>('');
  const [eventGoogleMapsUrl, setEventGoogleMapsUrl] = useState<string>('');
  const [previewSlipModalUrl, setPreviewSlipModalUrl] = useState<string | null>(null);
  const [eventNote, setEventNote] = useState<string>('');

  // Organizer / Venue Contact Info for Future & Re-booking
  const [eventOrganizerName, setEventOrganizerName] = useState<string>('');
  const [eventOrganizerPhone, setEventOrganizerPhone] = useState<string>('');
  const [eventOrganizerLine, setEventOrganizerLine] = useState<string>('');
  const [eventBoothNumber, setEventBoothNumber] = useState<string>('');

  // Organizer Directory Modal States
  const [isOrganizerDirectoryOpen, setIsOrganizerDirectoryOpen] = useState<boolean>(false);
  const [directorySearchQuery, setDirectorySearchQuery] = useState<string>('');
  const [directorySelectedYear, setDirectorySelectedYear] = useState<string>('all');
  const [directoryStatusFilter, setDirectoryStatusFilter] = useState<'all' | 'attended' | 'missed'>('all');

  // Coordination Photos (รูปภาพการติดต่อประสานงานออกบูธ / ผังงาน / แชทไลน์ / นามบัตร)
  const [eventPhotos, setEventPhotos] = useState<EventCoordinationImage[]>([]);

  // Quick Photo Manager Modal state (สำหรับเปิดจัดการรูปภาพโดยตรงจากหน้าดูรายละเอียดงาน หรือหน้าสมุดผู้จัด)
  const [photoManagerSchedule, setPhotoManagerSchedule] = useState<EventSchedule | null>(null);
  const [managerPhotos, setManagerPhotos] = useState<EventCoordinationImage[]>([]);

  // Manual LINE Notification State
  const [sendingLineEventId, setSendingLineEventId] = useState<string | null>(null);

  const handleSendLineNotification = async (schedule: EventSchedule) => {
    setSendingLineEventId(schedule.id);
    try {
      const res = await notifyEventScheduleToLine(schedule, 'reminder');
      if (res.success) {
        alert(`✅ ส่งข้อมูลตารางออกงาน "${schedule.title}" เข้า LINE สำเร็จเรียบร้อยแล้ว!`);
      } else {
        alert(`❌ ส่งข้อมูลเข้า LINE ไม่สำเร็จ: ${res.error || 'กรุณาตรวจสอบการตั้งค่า LINE'}`);
      }
    } catch (err: any) {
      alert(`❌ เกิดข้อผิดพลาด: ${err?.message || 'ไม่สามารถส่งข้อความได้'}`);
    } finally {
      setSendingLineEventId(null);
    }
  };

  // Robust Image Compressor: Fills White Background to prevent transparent PNG/LINE screenshots from turning black!
  const compressImageSafely = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawBase64 = event.target?.result as string;
        if (!rawBase64) {
          resolve('');
          return;
        }

        const img = new window.Image();
        img.onload = () => {
          try {
            const naturalW = img.naturalWidth || img.width || 0;
            const naturalH = img.naturalHeight || img.height || 0;

            // If dimensions are missing or 0, fallback directly to raw image
            if (naturalW <= 0 || naturalH <= 0) {
              resolve(rawBase64);
              return;
            }

            const maxDim = 1280;
            let targetW = naturalW;
            let targetH = naturalH;
            if (targetW > maxDim || targetH > maxDim) {
              if (targetW > targetH) {
                targetH = Math.round((targetH * maxDim) / targetW);
                targetW = maxDim;
              } else {
                targetW = Math.round((targetW * maxDim) / targetH);
                targetH = maxDim;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, targetW);
            canvas.height = Math.max(1, targetH);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(rawBase64);
              return;
            }

            // CRITICAL FIX: Fill solid white background before drawing!
            // Transparent PNG/LINE screenshots without a white background turn PURE BLACK when converted to JPEG!
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw image on top of white background
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            if (compressed && compressed.length > 200 && compressed !== 'data:,') {
              resolve(compressed);
            } else {
              resolve(rawBase64);
            }
          } catch (e) {
            resolve(rawBase64);
          }
        };

        img.onerror = () => {
          resolve(rawBase64);
        };

        img.src = rawBase64;
      };

      reader.onerror = () => {
        resolve('');
      };

      reader.readAsDataURL(file);
    });
  };

  const handleCompressAndAddPhotos = async (
    files: FileList | null,
    targetSetter: React.Dispatch<React.SetStateAction<EventCoordinationImage[]>>,
    currentPhotos: EventCoordinationImage[],
    defaultCategory: CoordinationPhotoCategory = 'layout'
  ) => {
    if (!files || files.length === 0) return;
    if (currentPhotos.length + files.length > 16) {
      alert('สามารถแนบรูปภาพการติดต่อประสานงานได้สูงสุด 16 รูปภาพครับ');
      return;
    }

    const fileList = Array.from(files);
    for (let fIdx = 0; fIdx < fileList.length; fIdx++) {
      const file = fileList[fIdx];
      if (file.size > 15 * 1024 * 1024) {
        alert(`ไฟล์ "${file.name}" มีขนาดใหญ่เกิน 15MB กรุณาเลือกไฟล์ที่มีขนาดเล็กลงครับ`);
        continue;
      }

      const compressedUrl = await compressImageSafely(file);
      if (!compressedUrl) continue;

      const newPhoto: EventCoordinationImage = {
        id: `PHOTO-${Date.now()}-${Math.floor(100 + Math.random() * 900)}-${fIdx}`,
        url: compressedUrl,
        category: defaultCategory,
        caption: '',
        createdAt: new Date().toISOString(),
      };

      targetSetter((prev) => [...prev, newPhoto]);
    }
  };

  const handleCompressAndReplacePhoto = async (
    photoId: string,
    file: File,
    targetSetter: React.Dispatch<React.SetStateAction<EventCoordinationImage[]>>
  ) => {
    if (file.size > 15 * 1024 * 1024) {
      alert(`ไฟล์ "${file.name}" มีขนาดใหญ่เกิน 15MB`);
      return;
    }

    const compressedUrl = await compressImageSafely(file);
    if (!compressedUrl) return;

    targetSetter((prev) => prev.map((p) => p.id === photoId ? { ...p, url: compressedUrl } : p));
  };

  // Quick Photo Manager Open / Save handlers
  const handleOpenPhotoManager = (schedule: EventSchedule) => {
    setPhotoManagerSchedule(schedule);
    setManagerPhotos(getNormalizedCoordinationPhotos(schedule));
  };

  const handleSavePhotoManager = () => {
    if (!photoManagerSchedule) return;
    const finalImages = managerPhotos.map((p) => p.url);
    const updatedSchedule: EventSchedule = {
      ...photoManagerSchedule,
      images: finalImages.length > 0 ? finalImages : undefined,
      coordinationPhotos: managerPhotos.length > 0 ? managerPhotos : undefined,
    };

    const updatedList = schedules.map((s) => s.id === photoManagerSchedule.id ? updatedSchedule : s);
    saveSchedulesToStorage(updatedList);
    updateEventSchedule(updatedSchedule);

    if (selectedCalendarSchedule?.id === photoManagerSchedule.id) {
      setSelectedCalendarSchedule(updatedSchedule);
    }
    setPhotoManagerSchedule(null);
    alert('บันทึกรูปภาพการติดต่อประสานงานเรียบร้อยแล้ว!');
  };

  // Dedicated Bank Slip Compressor: Crystal clear text & QR, but ultra-lean (<35KB) to prevent localStorage quota crash
  const compressSlipSafely = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawBase64 = event.target?.result as string;
        if (!rawBase64) {
          resolve('');
          return;
        }

        const img = new window.Image();
        img.onload = () => {
          try {
            const naturalW = img.naturalWidth || img.width || 0;
            const naturalH = img.naturalHeight || img.height || 0;
            if (naturalW <= 0 || naturalH <= 0) {
              resolve(rawBase64.length < 50000 ? rawBase64 : '');
              return;
            }

            // Max 600px width/height provides crisp bank slip text while keeping data URL ~25KB
            const maxDim = 600;
            let targetW = naturalW;
            let targetH = naturalH;
            if (targetW > maxDim || targetH > maxDim) {
              if (targetW > targetH) {
                targetH = Math.round((targetH * maxDim) / targetW);
                targetW = maxDim;
              } else {
                targetW = Math.round((targetW * maxDim) / targetH);
                targetH = maxDim;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, targetW);
            canvas.height = Math.max(1, targetH);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(rawBase64.length < 50000 ? rawBase64 : '');
              return;
            }

            // Solid white background prevents transparent PNG/LINE screenshots from turning pure black
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            let quality = 0.65;
            let compressed = canvas.toDataURL('image/jpeg', quality);
            if (compressed.length > 55000) {
              quality = 0.5;
              compressed = canvas.toDataURL('image/jpeg', quality);
            }

            resolve(compressed);
          } catch (e) {
            console.warn('compressSlipSafely error:', e);
            resolve(rawBase64.length < 50000 ? rawBase64 : '');
          }
        };

        img.onerror = () => {
          resolve(rawBase64.length < 50000 ? rawBase64 : '');
        };

        img.src = rawBase64;
      };

      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Handle deposit slip file upload with safe canvas compression
  const handleDepositSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('ไฟล์รูปภาพมีขนาดใหญ่เกิน 15MB กรุณาเลือกไฟล์ที่มีขนาดเล็กลงครับ');
        return;
      }
      try {
        const compressedUrl = await compressSlipSafely(file);
        if (compressedUrl) {
          setEventDepositSlipUrl(compressedUrl);
        } else {
          alert('ไม่สามารถประมวลผลรูปภาพสลิปได้ กรุณาลองเลือกรูปใหม่อีกครั้งครับ');
        }
      } catch (err: any) {
        console.error('Slip upload error:', err);
        alert('เกิดข้อผิดพลาดในการโหลดรูปภาพสลิป กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  // View mode: 'calendar' (default), 'agenda', 'cards'
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda' | 'cards'>('calendar');
  const [calendarYear, setCalendarYear] = useState<number>(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(() => new Date().getMonth());
  const [selectedCalendarSchedule, setSelectedCalendarSchedule] = useState<EventSchedule | null>(null);

  // Active / Selected schedule displayed prominently at the top ("ชื่องานด้านบน")
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const activeEvent = React.useMemo(() => {
    if (selectedEventId) {
      const found = schedules.find((s) => s.id === selectedEventId);
      if (found) return found;
    }
    // Prefer event in current activeBranch
    const branchSchedules = schedules.filter((s) => s.branchName === activeBranch);
    const pool = branchSchedules.length > 0 ? branchSchedules : schedules;

    const eligiblePool = pool.filter((s) => s.status !== 'CANCELLED');
    const today = new Date().toISOString().slice(0, 10);
    // 1. ACTIVE
    const active = eligiblePool.find((s) => s.status === 'ACTIVE');
    if (active) return active;
    // 2. UPCOMING closest to today
    const upcoming = eligiblePool
      .filter((s) => s.startDate >= today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
    if (upcoming) return upcoming;
    // 3. Fallback to newest or first eligible
    return eligiblePool[0] || pool[0] || null;
  }, [schedules, activeBranch, selectedEventId]);

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
      const daySchedules = filteredSchedules.filter((s) => {
        const sStart = normalizeToCE(s.startDate);
        const sEnd = normalizeToCE(s.endDate || s.startDate);
        return dateStr >= sStart && dateStr <= sEnd;
      });
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
      const daySchedules = filteredSchedules.filter((s) => {
        const sStart = normalizeToCE(s.startDate);
        const sEnd = normalizeToCE(s.endDate || s.startDate);
        return dateStr >= sStart && dateStr <= sEnd;
      });
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
      const daySchedules = filteredSchedules.filter((s) => {
        const sStart = normalizeToCE(s.startDate);
        const sEnd = normalizeToCE(s.endDate || s.startDate);
        return dateStr >= sStart && dateStr <= sEnd;
      });
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
  const transferredCount = schedules.filter((s) => s.status === 'TRANSFERRED').length;
  const activeCount = schedules.filter((s) => s.status === 'ACTIVE').length;
  const completedCount = schedules.filter((s) => s.status === 'COMPLETED').length;
  const cancelledCount = schedules.filter((s) => s.status === 'CANCELLED').length;

  const saveBranchesToStorage = (updatedBranches: string[]) => {
    setBranches(updatedBranches);
    setEventBranches(updatedBranches);
    if (typeof window !== 'undefined') {
      localStorage.setItem('huda_event_branches', JSON.stringify(updatedBranches));
    }
  };

  const saveSchedulesToStorage = (updated: EventSchedule[]) => {
    setSchedules(updated);
    setEventSchedules(updated);
    if (typeof window !== 'undefined') {
      safeSetLocalStorage('huda_event_schedules', JSON.stringify(updated));
    }
  };

  // Transfer handlers (ปล่อยต่อบูธ)
  const handleOpenTransferModal = (schedule: EventSchedule) => {
    setTransferModalSchedule(schedule);
    setTransfereeName(schedule.transfereeName || '');
    setTransfereePhone(schedule.transfereePhone || '');
    setTransferPrice(typeof schedule.transferPrice === 'number' ? schedule.transferPrice : (typeof schedule.rentalFee === 'number' && schedule.rentalFee > 0 ? schedule.rentalFee : ''));
    setTransferDate(schedule.transferDate || new Date().toISOString().slice(0, 10));
    setTransferNote(schedule.transferNote || '');
    setTransferSlipUrl(schedule.transferSlipUrl || '');
  };

  const handleSaveTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalSchedule) return;
    if (!transfereeName.trim()) {
      alert('กรุณาระบุชื่อผู้รับต่อ / ชื่อร้านที่รับช่วงต่อ');
      return;
    }

    const updatedSchedule: EventSchedule = {
      ...transferModalSchedule,
      status: 'TRANSFERRED',
      transfereeName: transfereeName.trim(),
      transfereePhone: transfereePhone.trim(),
      transferPrice: typeof transferPrice === 'number' ? transferPrice : 0,
      transferDate: transferDate || new Date().toISOString().slice(0, 10),
      transferNote: transferNote.trim(),
      transferSlipUrl: transferSlipUrl.trim(),
    };

    const updatedList = schedules.map((s) => s.id === transferModalSchedule.id ? updatedSchedule : s);
    saveSchedulesToStorage(updatedList);
    if (selectedCalendarSchedule?.id === transferModalSchedule.id) {
      setSelectedCalendarSchedule(updatedSchedule);
    }
    setTransferModalSchedule(null);
  };

  const handleCancelTransfer = (scheduleId: string) => {
    if (!confirm('ต้องการยกเลิกสถานะปล่อยต่อ และนำบูธกลับมาเป็นบูธของเราใช่หรือไม่?')) return;
    const target = schedules.find((s) => s.id === scheduleId);
    if (!target) return;

    const today = new Date().toISOString().slice(0, 10);
    const restoredStatus: EventSchedule['status'] = target.endDate < today ? 'COMPLETED' : 'UPCOMING';

    const updatedSchedule: EventSchedule = {
      ...target,
      status: restoredStatus,
      transfereeName: undefined,
      transfereePhone: undefined,
      transferPrice: undefined,
      transferDate: undefined,
      transferNote: undefined,
      transferSlipUrl: undefined,
    };

    const updatedList = schedules.map((s) => s.id === scheduleId ? updatedSchedule : s);
    saveSchedulesToStorage(updatedList);
    if (selectedCalendarSchedule?.id === scheduleId) {
      setSelectedCalendarSchedule(updatedSchedule);
    }
    setTransferModalSchedule(null);
  };

  // Unique or historical organizers and venues directory for calling up next year or re-booking
  const organizerDirectoryList = React.useMemo(() => {
    return schedules
      .filter((s) => {
        // filter by search query
        if (directorySearchQuery.trim()) {
          const q = directorySearchQuery.toLowerCase();
          const matchTitle = (s.title || '').toLowerCase().includes(q);
          const matchLocation = (s.location || '').toLowerCase().includes(q);
          const matchOrganizer = (s.organizerName || '').toLowerCase().includes(q);
          const matchPhone = (s.organizerPhone || s.organizerContact || '').includes(q);
          const matchLine = (s.organizerLine || '').toLowerCase().includes(q);
          const matchBooth = (s.boothNumber || '').toLowerCase().includes(q);
          const matchMissed = (s.missedReason || '').toLowerCase().includes(q);
          if (!matchTitle && !matchLocation && !matchOrganizer && !matchPhone && !matchLine && !matchBooth && !matchMissed) {
            return false;
          }
        }
        // filter by year
        if (directorySelectedYear !== 'all') {
          const startYear = (s.startDate || '').slice(0, 4);
          if (startYear !== directorySelectedYear) {
            return false;
          }
        }
        // filter by attendance status
        if (directoryStatusFilter === 'attended' && s.status === 'CANCELLED') {
          return false;
        }
        if (directoryStatusFilter === 'missed' && s.status !== 'CANCELLED') {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.startDate.localeCompare(a.startDate)); // latest first
  }, [schedules, directorySearchQuery, directorySelectedYear, directoryStatusFilter]);

  // Available years from schedules for directory filter dropdown
  const availableDirectoryYears = React.useMemo(() => {
    const years = new Set<string>();
    schedules.forEach((s) => {
      if (s.startDate) {
        years.add(s.startDate.slice(0, 4));
      }
    });
    const currentY = String(new Date().getFullYear());
    const nextY = String(new Date().getFullYear() + 1);
    years.add(currentY);
    years.add(nextY);
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [schedules]);

  const handleMarkAsMissed = (schedule: EventSchedule) => {
    const reason = prompt('กรุณาระบุเหตุผลที่ไม่ได้งานนี้ (เช่น ล็อกเต็ม, สละสิทธิ์, ไม่ผ่านเกณฑ์, ค่าที่สูงเกินไป):', schedule.missedReason || 'ล็อกเต็ม / จองไม่ทัน');
    if (reason === null) return;
    const updated: EventSchedule = {
      ...schedule,
      status: 'CANCELLED',
      missedReason: reason.trim() || 'ไม่ได้งานครั้งนี้',
    };
    const updatedList = schedules.map((s) => s.id === schedule.id ? updated : s);
    saveSchedulesToStorage(updatedList);
    if (selectedCalendarSchedule?.id === schedule.id) {
      setSelectedCalendarSchedule(updated);
    }
  };

  const handleRestoreFromMissed = (schedule: EventSchedule) => {
    if (!confirm(`ต้องการยกเลิกสถานะ "ไม่ได้งาน" และนำตารางงาน "${schedule.title}" กลับมาเป็นงานออกบูธปกติใช่หรือไม่?`)) return;
    const today = new Date().toISOString().slice(0, 10);
    const restoredStatus: EventSchedule['status'] = schedule.endDate < today ? 'COMPLETED' : (schedule.startDate > today ? 'UPCOMING' : 'ACTIVE');
    const updated: EventSchedule = {
      ...schedule,
      status: restoredStatus,
      missedReason: undefined,
    };
    const updatedList = schedules.map((s) => s.id === schedule.id ? updated : s);
    saveSchedulesToStorage(updatedList);
    if (selectedCalendarSchedule?.id === schedule.id) {
      setSelectedCalendarSchedule(updated);
    }
  };

  const handleRebookFromDirectory = (sourceSchedule: EventSchedule) => {
    setIsOrganizerDirectoryOpen(false);
    handleOpenAddModal(undefined, {
      title: sourceSchedule.title,
      branchName: sourceSchedule.branchName,
      location: sourceSchedule.location,
      operatingHours: sourceSchedule.operatingHours,
      productsToPrepare: sourceSchedule.productsToPrepare,
      phonePromptPay: sourceSchedule.phonePromptPay,
      salesTarget: sourceSchedule.salesTarget,
      assignedStaff: sourceSchedule.assignedStaff,
      rentalFee: sourceSchedule.rentalFee,
      travelExpense: sourceSchedule.travelExpense,
      googleMapsUrl: sourceSchedule.googleMapsUrl,
      organizerName: sourceSchedule.organizerName,
      organizerPhone: sourceSchedule.organizerPhone || sourceSchedule.organizerContact,
      organizerLine: sourceSchedule.organizerLine,
      boothNumber: sourceSchedule.boothNumber,
      note: sourceSchedule.note,
    });
  };

  const handleOpenAddModal = (defaultDate?: string, prefill?: Partial<EventSchedule>) => {
    setEditingScheduleId(null);
    setEventTitle(prefill?.title || '');
    setEventBranch(prefill?.branchName || activeBranch);
    setEventLocation(prefill?.location || '');
    setEventHours(prefill?.operatingHours || '10:00 - 22:00 น.');
    setEventProducts(prefill?.productsToPrepare || 'ชุดอาบายะห์ดูไบ • คัฟทาน • น้ำหอมดูไบ & Oud');
    setEventPhone(prefill?.phonePromptPay || storeSettings.contactPhone || '083-427-4687');
    const targetDate = defaultDate || new Date().toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    setEventStartDate(targetDate);
    setEventEndDate(targetDate);
    setEventStatus(prefill?.status || (targetDate > today ? 'UPCOMING' : 'ACTIVE'));
    setEventMissedReason(prefill?.missedReason || '');
    setEventSalesTarget(prefill?.salesTarget || 30000);
    setEventStaff(prefill?.assignedStaff || 'เจ้าของร้าน (Admin)');
    setEventRentalFee(prefill?.rentalFee !== undefined ? prefill.rentalFee : '');
    setEventDepositAmount(prefill?.depositAmount !== undefined ? prefill.depositAmount : '');
    setEventTravelExpense(prefill?.travelExpense !== undefined ? prefill.travelExpense : '');
    setEventDepositSlipUrl('');
    setEventGoogleMapsUrl(prefill?.googleMapsUrl || '');
    setEventOrganizerName(prefill?.organizerName || '');
    setEventOrganizerPhone(prefill?.organizerPhone || prefill?.organizerContact || '');
    setEventOrganizerLine(prefill?.organizerLine || '');
    setEventBoothNumber(prefill?.boothNumber || '');
    setEventNote(prefill?.note || '');
    setEventPhotos(getNormalizedCoordinationPhotos(prefill));
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
    setEventMissedReason(schedule.missedReason || '');
    setEventStartDate(schedule.startDate);
    setEventEndDate(schedule.endDate);
    setEventSalesTarget(schedule.salesTarget || 30000);
    setEventStaff(schedule.assignedStaff || 'เจ้าของร้าน (Admin)');
    setEventRentalFee(schedule.rentalFee !== undefined ? schedule.rentalFee : 0);
    setEventDepositAmount(schedule.depositAmount !== undefined ? schedule.depositAmount : 0);
    setEventTravelExpense(schedule.travelExpense !== undefined ? schedule.travelExpense : '');
    setEventDepositSlipUrl(schedule.depositSlipUrl || '');
    setEventGoogleMapsUrl(schedule.googleMapsUrl || '');
    setEventOrganizerName(schedule.organizerName || '');
    setEventOrganizerPhone(schedule.organizerPhone || schedule.organizerContact || '');
    setEventOrganizerLine(schedule.organizerLine || '');
    setEventBoothNumber(schedule.boothNumber || '');
    setEventNote(schedule.note || '');
    setEventPhotos(getNormalizedCoordinationPhotos(schedule));
    setIsAddEventModalOpen(true);
  };

  const handleSaveNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!eventTitle.trim()) {
        alert('กรุณากรอกชื่อตารางงานด้วยครับ');
        return;
      }

      const finalRentalFee = typeof eventRentalFee === 'number' ? eventRentalFee : (parseInt(eventRentalFee, 10) || 0);
      const finalDepositAmount = typeof eventDepositAmount === 'number' ? eventDepositAmount : (parseInt(eventDepositAmount, 10) || 0);
      const finalTravelExpense = typeof eventTravelExpense === 'number' ? eventTravelExpense : (parseInt(eventTravelExpense, 10) || 0);

      if (editingScheduleId) {
        let updatedItem: EventSchedule | null = null;
        const updatedSchedules = schedules.map((s) => {
          if (s.id === editingScheduleId) {
            updatedItem = {
              ...s,
              title: eventTitle.trim(),
              branchName: eventBranch,
              location: eventLocation.trim(),
              startDate: eventStartDate,
              endDate: eventEndDate,
              operatingHours: eventHours.trim(),
              productsToPrepare: eventProducts.trim(),
              phonePromptPay: eventPhone.trim(),
              status: eventStatus === 'CANCELLED' ? 'CANCELLED' : (eventStartDate > new Date().toISOString().slice(0, 10) && eventStatus === 'ACTIVE' ? 'UPCOMING' : eventStatus),
              missedReason: eventStatus === 'CANCELLED' ? (eventMissedReason.trim() || 'ไม่ได้งาน / ไม่ได้ไป') : undefined,
              salesTarget: eventSalesTarget,
              assignedStaff: eventStaff.trim(),
              rentalFee: finalRentalFee,
              depositAmount: finalDepositAmount,
              travelExpense: finalTravelExpense > 0 ? finalTravelExpense : undefined,
              depositSlipUrl: eventDepositSlipUrl,
              googleMapsUrl: eventGoogleMapsUrl.trim(),
              organizerName: eventOrganizerName.trim() || undefined,
              organizerPhone: eventOrganizerPhone.trim() || undefined,
              organizerLine: eventOrganizerLine.trim() || undefined,
              boothNumber: eventBoothNumber.trim() || undefined,
              organizerContact: eventOrganizerPhone.trim() || eventOrganizerName.trim() || undefined,
              note: eventNote.trim(),
              images: eventPhotos.length > 0 ? eventPhotos.map(p => p.url) : undefined,
              coordinationPhotos: eventPhotos.length > 0 ? eventPhotos : undefined,
            };
            return updatedItem;
          }
          return s;
        });
        saveSchedulesToStorage(updatedSchedules);
        if (updatedItem) {
          updateEventSchedule(updatedItem);
          setSelectedEventId(editingScheduleId);
        }
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
          status: eventStatus === 'CANCELLED' ? 'CANCELLED' : (eventStartDate > new Date().toISOString().slice(0, 10) && eventStatus === 'ACTIVE' ? 'UPCOMING' : eventStatus),
          missedReason: eventStatus === 'CANCELLED' ? (eventMissedReason.trim() || 'ไม่ได้งาน / ไม่ได้ไป') : undefined,
          salesTarget: eventSalesTarget,
          actualSales: 0,
          assignedStaff: eventStaff.trim(),
          rentalFee: finalRentalFee,
          depositAmount: finalDepositAmount,
          travelExpense: finalTravelExpense > 0 ? finalTravelExpense : undefined,
          depositSlipUrl: eventDepositSlipUrl,
          googleMapsUrl: eventGoogleMapsUrl.trim(),
          organizerName: eventOrganizerName.trim() || undefined,
          organizerPhone: eventOrganizerPhone.trim() || undefined,
          organizerLine: eventOrganizerLine.trim() || undefined,
          boothNumber: eventBoothNumber.trim() || undefined,
          organizerContact: eventOrganizerPhone.trim() || eventOrganizerName.trim() || undefined,
          note: eventNote.trim(),
          images: eventPhotos.length > 0 ? eventPhotos.map(p => p.url) : undefined,
          coordinationPhotos: eventPhotos.length > 0 ? eventPhotos : undefined,
          createdAt: new Date().toISOString(),
        };

        saveSchedulesToStorage([newEvent, ...schedules]);
        addEventSchedule(newEvent);
        setSelectedEventId(newEvent.id);
        setActiveBranch(newEvent.branchName);
        alert(`เพิ่มตารางออกงาน "${eventTitle}" เรียบร้อยแล้ว!`);
      }

      setEditingScheduleId(null);
      setIsAddEventModalOpen(false);
    } catch (err: any) {
      console.error('handleSaveNewEvent error:', err);
      alert(`❌ เกิดข้อผิดพลาดในการบันทึก: ${err?.message || 'กรุณาลองใหม่อีกครั้ง'}`);
    }
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
      deleteEventSchedule(id);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: EventSchedule['status']) => {
    saveSchedulesToStorage(
      schedules.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-stone-950 font-sans">
      
      {/* Centered Top Branch & Event Header Banner */}
      <div className="bg-white border-2 border-amber-400/80 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 text-center">
        
        {/* Brand Badges & Store Info */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] font-black uppercase text-stone-950 bg-amber-400 px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-amber-500">
            <Store className="w-3.5 h-3.5 text-stone-950" />
            <span>HUDA ABAYA ออกบูธ &amp; ตลาดนัด</span>
          </span>
          <span className="text-[11px] font-black text-emerald-950 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-800" />
            <span>เปิด 10:00 - 22:00 น.</span>
          </span>
          <span className="text-[11px] font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{activeBranch}</span>
          </span>
          <span className="text-[11px] font-black text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1 font-mono">
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>โทร/พร้อมเพย์: {storeSettings.contactPhone || '083-427-4687'}</span>
          </span>
        </div>

        {/* PROMINENT EVENT TITLE SPOTLIGHT BANNER (ชื่องานเด่นชัดด้านบนสุด ไม่หายแน่นอน) */}
        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100/70 border-2 border-amber-400 rounded-3xl p-4 sm:p-6 shadow-md space-y-4 max-w-4xl mx-auto text-left">
          
          {/* Spotlight Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-300/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎪</span>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                  ชื่องานออกบูธ &amp; กิจกรรมปัจจุบัน (Event Title):
                </span>
                <span className="text-[11px] text-stone-600 font-bold">
                  แสดงชื่องานและรายละเอียดสำคัญครบถ้วนด้านบนสุดของหน้าจอ
                </span>
              </div>
            </div>

            {/* Status Pill */}
            {activeEvent && (
              <div className="flex items-center gap-1.5 shrink-0">
                {activeEvent.status === 'TRANSFERRED' && (
                  <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-black text-xs shadow-sm flex items-center gap-1">
                    <ArrowRightLeft className="w-3 h-3" /> ปล่อยต่อแล้ว
                  </span>
                )}
                {activeEvent.status === 'ACTIVE' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs shadow-sm flex items-center gap-1 animate-pulse">
                    <Flame className="w-3 h-3 text-white" /> กำลังขายอยู่
                  </span>
                )}
                {activeEvent.status === 'UPCOMING' && (
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-xs shadow-sm border border-amber-500">
                    ● เร็วๆ นี้
                  </span>
                )}
                {activeEvent.status === 'COMPLETED' && (
                  <span className="px-3 py-1 rounded-full bg-stone-200 text-stone-800 font-black text-xs shadow-sm border border-stone-300">
                    ✓ เสร็จสิ้นแล้ว
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Large, High-Contrast Event Title */}
          <div className="space-y-1">
            <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-amber-950 tracking-wide leading-tight">
              {activeEvent ? activeEvent.title : 'ยังไม่มีตารางออกบูธ'}
            </h1>
            {activeEvent && (
              <div className="flex items-center gap-2 flex-wrap text-xs text-stone-600 font-bold">
                <span>สังกัดสาขา: <strong className="text-stone-900">{activeEvent.branchName}</strong></span>
                <span>•</span>
                <span>รหัสงาน: <strong className="font-mono text-amber-900">{activeEvent.id}</strong></span>
              </div>
            )}
          </div>

          {/* Quick Key Highlights Grid */}
          {activeEvent && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1 text-xs">
              {/* Card 1: Date with Thai Day */}
              <div className="bg-white/90 p-3 rounded-2xl border border-amber-300 shadow-2xs space-y-1">
                <span className="text-[10px] text-amber-800 font-black flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>วัน &amp; วันที่ออกงาน:</span>
                </span>
                <div className="font-black text-stone-950 font-mono text-sm">
                  {getThaiDayName(activeEvent.startDate)} {formatThaiDMY(activeEvent.startDate)}
                  {activeEvent.startDate !== activeEvent.endDate && ` - ${getThaiDayName(activeEvent.endDate)} ${formatThaiDMY(activeEvent.endDate)}`}
                </div>
                <div className="text-[11px] text-stone-500 font-sans font-bold">
                  เวลา: {activeEvent.operatingHours}
                </div>
              </div>

              {/* Card 2: Location & Maps */}
              <div className="bg-white/90 p-3 rounded-2xl border border-amber-300 shadow-2xs space-y-1">
                <span className="text-[10px] text-amber-800 font-black flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>สถานที่ออกบูธ:</span>
                </span>
                <div className="font-black text-stone-950 text-sm truncate">
                  {activeEvent.location}
                </div>
                {activeEvent.googleMapsUrl ? (
                  <a
                    href={activeEvent.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-sky-700 hover:text-sky-900 font-black inline-flex items-center gap-1 underline"
                  >
                    <span>🗺️ เปิดดูแผนที่ Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[10px] text-stone-400">ไม่ได้ระบุลิงก์แผนที่</span>
                )}
              </div>

              {/* Card 3: Financials (Rent + Travel) */}
              <div className="bg-white/90 p-3 rounded-2xl border border-amber-300 shadow-2xs space-y-1">
                <span className="text-[10px] text-amber-800 font-black flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  <span>ต้นทุนคงที่ (ค่าที่ + เดินทาง):</span>
                </span>
                <div className="font-black text-stone-950 font-mono text-sm">
                  ค่าที่: ฿{activeEvent.rentalFee?.toLocaleString() || 0}
                  {activeEvent.travelExpense ? ` + เดินทาง ฿${activeEvent.travelExpense.toLocaleString()}` : ''}
                </div>
                <div className="text-[11px] text-emerald-800 font-bold font-mono">
                  รวม: ฿{((activeEvent.rentalFee || 0) + (activeEvent.travelExpense || 0)).toLocaleString()} บาท
                </div>
              </div>

              {/* Card 4: Products to prepare */}
              {activeEvent.productsToPrepare && (
                <div className="bg-white/90 p-3 rounded-2xl border border-amber-300 shadow-2xs space-y-1 sm:col-span-2 lg:col-span-2">
                  <span className="text-[10px] text-amber-800 font-black flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                    <span>สินค้าเตรียมไปขาย:</span>
                  </span>
                  <div className="font-extrabold text-stone-900 text-xs">
                    🛍️ {activeEvent.productsToPrepare}
                  </div>
                </div>
              )}

              {/* Card 5: Staff & Phone */}
              <div className="bg-white/90 p-3 rounded-2xl border border-amber-300 shadow-2xs space-y-1 sm:col-span-2 lg:col-span-1">
                <span className="text-[10px] text-amber-800 font-black flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>ผู้รับผิดชอบ / ติดต่อ:</span>
                </span>
                <div className="font-black text-stone-900 text-xs truncate">
                  👤 {activeEvent.assignedStaff}
                </div>
                {activeEvent.phonePromptPay && (
                  <div className="text-[11px] text-emerald-800 font-mono font-bold">
                    📞 {activeEvent.phonePromptPay}
                  </div>
                )}
              </div>

              {/* Card 6: Organizer & Booking Contact (for next time / next year) */}
              {(activeEvent.organizerName || activeEvent.organizerPhone || activeEvent.organizerLine || activeEvent.boothNumber) && (
                <div className="bg-emerald-50/90 p-3 rounded-2xl border-2 border-emerald-300 shadow-2xs space-y-1 sm:col-span-2 lg:col-span-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-900 font-black flex items-center gap-1">
                      <span>📇</span>
                      <span>ผู้จัดงาน &amp; ติดต่อจองบูธรอบหน้า:</span>
                    </span>
                    {activeEvent.boothNumber && (
                      <span className="text-[10px] font-black bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-md border border-emerald-400">
                        ล็อก / โซน: {activeEvent.boothNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <div className="text-xs font-bold text-stone-900">
                      {activeEvent.organizerName ? (
                        <span>ผู้จัด: <strong className="text-emerald-950 font-black">{activeEvent.organizerName}</strong></span>
                      ) : (
                        <span className="text-stone-500">ไม่ได้ระบุชื่อผู้จัด</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {activeEvent.organizerPhone && (
                        <a
                          href={`tel:${activeEvent.organizerPhone.replace(/[^0-9+]/g, '')}`}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg flex items-center gap-1 shadow-xs transition"
                          title="โทรหาผู้จัดงาน"
                        >
                          <Phone className="w-3 h-3" />
                          <span>โทร {activeEvent.organizerPhone}</span>
                        </a>
                      )}
                      {activeEvent.organizerLine && (
                        <a
                          href={`https://line.me/R/ti/p/~${activeEvent.organizerLine}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white font-black text-xs rounded-lg flex items-center gap-1 shadow-xs transition"
                          title="ทัก LINE ผู้จัดงาน"
                        >
                          <span>💬 LINE: {activeEvent.organizerLine}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Event Switcher & Action Buttons */}
          <div className="pt-3 border-t-2 border-amber-300/60 flex flex-wrap items-center justify-between gap-2.5">
            {/* Quick Event Dropdown Switcher */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-stone-900 flex items-center gap-1">
                <span>🔄 สลับดูชื่องานอื่น:</span>
              </span>
              <select
                value={activeEvent ? activeEvent.id : ''}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  const found = schedules.find((s) => s.id === e.target.value);
                  if (found) {
                    setActiveBranch(found.branchName);
                  }
                }}
                className="bg-white border-2 border-amber-500 rounded-xl px-3 py-1.5 text-xs text-stone-950 font-black focus:outline-none cursor-pointer shadow-xs max-w-[260px] sm:max-w-md truncate"
              >
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({getThaiDayName(s.startDate)} {formatThaiDMY(s.startDate)})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Action Buttons for this Event */}
            <div className="flex items-center gap-2 flex-wrap">
              {activeEvent && (
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(activeEvent)}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-xs border border-amber-500 flex items-center gap-1 cursor-pointer transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>แก้ไขข้อมูลงานนี้</span>
                </button>
              )}
              {activeEvent && (
                <button
                  type="button"
                  onClick={() => handleSendLineNotification(activeEvent)}
                  disabled={sendingLineEventId === activeEvent.id}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs border border-emerald-700 flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                  title="ส่งข้อมูลตารางออกงานนี้เข้า LINE"
                >
                  <Send className={`w-3.5 h-3.5 ${sendingLineEventId === activeEvent.id ? 'animate-spin' : ''}`} />
                  <span>{sendingLineEventId === activeEvent.id ? 'กำลังส่ง...' : '🔔 ส่งข้อมูลเข้า LINE'}</span>
                </button>
              )}
              {activeEvent && activeEvent.status !== 'TRANSFERRED' && (
                <button
                  type="button"
                  onClick={() => handleOpenTransferModal(activeEvent)}
                  className="px-3.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-950 font-black text-xs rounded-xl border border-purple-400 flex items-center gap-1 cursor-pointer transition"
                  title="บันทึกการปล่อยต่อบูธให้คนอื่น"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-purple-700" />
                  <span>ปล่อยต่อบูธนี้</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOrganizerDirectoryOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition border border-emerald-700"
                title="เปิดสมุดรายชื่อผู้จัดงานและประวัติติดต่อออกบูธ (สำหรับติดต่อปีหน้าหรือครั้งหน้า)"
              >
                <BookUser className="w-3.5 h-3.5 text-white" />
                <span>สมุดติดต่อผู้จัดงาน</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenAddModal()}
                className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>+ ลงตารางใหม่</span>
              </button>
            </div>
          </div>
        </div>

        {/* Branch Selector & Add Branch Button */}
        <div className="pt-2 border-t-2 border-amber-400/30 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          <span className="text-xs text-stone-950 font-black">เลือกสาขา/บูธ:</span>
          
          <select
            value={activeBranch}
            onChange={(e) => {
              setActiveBranch(e.target.value);
              const match = schedules.find((s) => s.branchName === e.target.value);
              if (match) setSelectedEventId(match.id);
            }}
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

      {/* Centered Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 max-w-5xl mx-auto">
        
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
              <span>🗂️ การ์ดสรุปงาน (เห็นรายละเอียดครบ 100%)</span>
            </button>
          </div>

          <div className="text-xs font-black text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
            แสดง: <strong className="text-amber-950 font-mono">{filteredSchedules.length}</strong> จาก {schedules.length} รายการ
          </div>
        </div>

        {/* Helpful navigation notice banner */}
        <div className="bg-amber-50 border-2 border-amber-300/80 px-4 py-2.5 rounded-2xl max-w-4xl mx-auto flex items-center justify-between text-xs text-amber-950 font-bold flex-wrap gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>หากต้องการดูข้อมูลครบทุกอย่าง (สินค้าเตรียมขาย, มัดจำ, สลิป, แผนที่, หมายเหตุ, พร้อมเพย์) แนะนำกดแถบ <strong>"🗂️ การ์ดสรุปงาน"</strong> หรือ <strong>"📋 ตารางนัดหมาย"</strong></span>
          </div>
          <span className="text-[11px] text-amber-800 font-normal">หรือคลิกที่การ์ดเพื่อเปิดดูฉบับเต็ม</span>
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

          <button
            onClick={() => setEventStatusFilter('TRANSFERRED')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              eventStatusFilter === 'TRANSFERRED'
                ? 'bg-purple-600 text-white border-2 border-purple-800 shadow-md'
                : 'bg-white text-purple-900 hover:bg-purple-50 border-2 border-purple-300'
            }`}
          >
            🤝 ปล่อยต่อแล้ว ({transferredCount})
          </button>

          <button
            onClick={() => setEventStatusFilter('CANCELLED')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              eventStatusFilter === 'CANCELLED'
                ? 'bg-rose-600 text-white border-2 border-rose-800 shadow-md'
                : 'bg-white text-rose-900 hover:bg-rose-50 border-2 border-rose-300'
            }`}
          >
            ❌ ไม่ได้งาน/ยกเลิก ({cancelledCount})
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
                  onClick={() => {
                    handleOpenAddModal(cell.dateStr);
                  }}
                  className={`min-h-[110px] sm:min-h-[135px] p-1.5 sm:p-2 rounded-2xl border flex flex-col justify-between transition group relative cursor-pointer ${
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

                    {/* Quick + button on mobile and hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddModal(cell.dateStr);
                      }}
                      className="opacity-90 sm:opacity-0 sm:group-hover:opacity-100 pointer-events-auto p-1 rounded-md bg-amber-100 hover:bg-amber-300 text-amber-950 transition text-[10px] font-black cursor-pointer shadow-2xs border border-amber-300"
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
                          setSelectedEventId(s.id);
                          setActiveBranch(s.branchName);
                        }}
                        className={`p-1.5 rounded-xl text-left cursor-pointer transition shadow-xs border ${
                          s.status === 'TRANSFERRED'
                            ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-700 font-black'
                            : s.status === 'CANCELLED'
                            ? 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300 font-black line-through opacity-85'
                            : s.status === 'ACTIVE'
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
                        {s.productsToPrepare && (
                          <div className="text-[8px] sm:text-[9px] truncate opacity-85 leading-tight text-amber-950 mt-0.5">
                            🛍️ {s.productsToPrepare}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-[8px] sm:text-[9px] pt-0.5 flex-wrap">
                          {s.travelExpense !== undefined && s.travelExpense > 0 && (
                            <span className="bg-black/10 px-1 rounded font-mono">
                              🚗 ฿{s.travelExpense.toLocaleString()}
                            </span>
                          )}
                          {s.depositSlipUrl && (
                            <span title="มีสลิปมัดจำ">🧾</span>
                          )}
                          {s.googleMapsUrl && (
                            <span title="มีพิกัดแผนที่">🗺️</span>
                          )}
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
          <div className="bg-white border-2 border-amber-400/80 rounded-3xl p-3.5 sm:p-6 shadow-xl max-w-5xl mx-auto space-y-4 text-stone-950 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-amber-200 pb-3 gap-2">
              <div>
                <h3 className="font-serif font-black text-lg sm:text-xl text-amber-950 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>ตารางนัดหมายออกงาน & ไทม์ไลน์ (Agenda Timetable)</span>
                </h3>
                <p className="text-[11px] text-stone-600 font-bold mt-0.5">
                  แสดงรายการออกบูธครบถ้วน แยกสีตามวัน (เหลือง=วันนี้, เทา=ผ่านไปแล้ว, เขียว=เร็วๆนี้, ม่วง=ปล่อยต่อ)
                </p>
              </div>

              {/* Mobile View Switcher: Cards vs Full Table */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="sm:hidden text-[11px] font-black text-stone-600">แสดงผล:</span>
                <div className="sm:hidden inline-flex p-1 bg-stone-100 rounded-xl border border-stone-300">
                  <button
                    type="button"
                    onClick={() => setAgendaMobileViewMode('cards')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition ${
                      agendaMobileViewMode === 'cards' || agendaMobileViewMode === 'auto'
                        ? 'bg-amber-400 text-stone-950 shadow-xs'
                        : 'text-stone-600 hover:text-stone-950'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>การ์ดมือถือ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgendaMobileViewMode('table')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition ${
                      agendaMobileViewMode === 'table'
                        ? 'bg-amber-400 text-stone-950 shadow-xs'
                        : 'text-stone-600 hover:text-stone-950'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>ตารางคอม</span>
                  </button>
                </div>
                <span className="text-xs font-black text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 shrink-0">
                  พบ {filteredSchedules.length} รายการ
                </span>
              </div>
            </div>

            {filteredSchedules.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Calendar className="w-10 h-10 text-stone-400 mx-auto" />
                <p className="font-black text-stone-700">ไม่มีตารางงานตามตัวกรองที่เลือก</p>
              </div>
            ) : (
              <>
                {/* 1. MOBILE RESPONSIVE CARDS (แสดงเมื่ออยู่บนมือถือ หรือเลือกมุมมองการ์ด) */}
                <div className={`space-y-3 sm:hidden ${agendaMobileViewMode === 'table' ? 'hidden' : 'block'}`}>
                  {filteredSchedules
                    .sort((a, b) => a.startDate.localeCompare(b.startDate))
                    .map((s) => {
                      const dateCat = getEventDateCategory(s.startDate, s.endDate);
                      const isPast = dateCat === 'PAST';
                      const isToday = dateCat === 'TODAY';
                      const dayName = getThaiDayName(s.startDate);

                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedCalendarSchedule(s);
                            setSelectedEventId(s.id);
                            setActiveBranch(s.branchName);
                          }}
                          className={`p-4 rounded-2xl border-2 transition cursor-pointer shadow-sm space-y-2.5 ${
                            s.status === 'TRANSFERRED'
                              ? 'bg-purple-50/70 border-purple-400'
                              : s.status === 'CANCELLED'
                              ? 'bg-rose-50/70 border-rose-300 opacity-90'
                              : isToday
                              ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-300 shadow-md'
                              : isPast
                              ? 'bg-stone-50 border-stone-200 text-stone-600 opacity-90'
                              : 'bg-white border-emerald-300 hover:border-emerald-500'
                          }`}
                        >
                          {/* Header: Date + Day Name + Status */}
                          <div className="flex items-start justify-between gap-2 border-b border-stone-200/80 pb-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-lg text-[11px] font-black ${
                                  isToday ? 'bg-amber-500 text-stone-950 font-extrabold animate-pulse' : 'bg-stone-200 text-stone-800'
                                }`}>
                                  {dayName}
                                </span>
                                <span className="font-mono font-black text-sm text-stone-950">
                                  {formatThaiDMY(s.startDate)}
                                  {s.startDate !== s.endDate && ` - ${formatThaiDMY(s.endDate)}`}
                                </span>
                                {isToday && (
                                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-amber-200 text-amber-900 border border-amber-400">
                                    🌟 วันนี้
                                  </span>
                                )}
                                {isPast && (
                                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-stone-200 text-stone-600">
                                    ผ่านไปแล้ว
                                  </span>
                                )}
                              </div>
                              <h4 className="font-serif font-black text-base text-stone-950 mt-1">
                                {s.title}
                              </h4>
                              <p className="text-[11px] text-stone-500">{s.branchName}</p>
                            </div>

                            <div className="shrink-0 text-right">
                              {s.status === 'TRANSFERRED' && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-black text-[10px] inline-flex items-center gap-1">
                                  <ArrowRightLeft className="w-2.5 h-2.5" /> ปล่อยต่อแล้ว
                                </span>
                              )}
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
                              {s.status === 'CANCELLED' && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] inline-flex items-center gap-1">
                                  ❌ ไม่ได้งานครั้งนี้
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-stone-50/90 p-2 rounded-xl border border-stone-200">
                              <span className="text-[10px] text-stone-500 font-bold block">⏰ เวลาทำการ:</span>
                              <span className="font-bold text-stone-900">{s.operatingHours}</span>
                            </div>
                            <div className="bg-stone-50/90 p-2 rounded-xl border border-stone-200">
                              <span className="text-[10px] text-stone-500 font-bold block">📍 สถานที่:</span>
                              <span className="font-bold text-stone-900 truncate block">{s.location}</span>
                            </div>
                          </div>

                          {/* Cost & Travel Expense Breakdown */}
                          <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-300/80 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-stone-700">🎪 ค่าเช่าบูธ:</span>
                              <span className="font-mono font-black text-amber-950">
                                {s.rentalFee === undefined || s.rentalFee === 0 ? 'ฟรี (ไม่มีค่าที่)' : `฿${s.rentalFee.toLocaleString()}`}
                              </span>
                            </div>

                            {s.travelExpense !== undefined && s.travelExpense > 0 && (
                              <div className="flex items-center justify-between text-stone-700">
                                <span className="flex items-center gap-1">
                                  <Car className="w-3.5 h-3.5 text-amber-700" />
                                  <span>ค่าเดินทาง/ค่าน้ำมัน:</span>
                                </span>
                                <span className="font-mono font-black text-amber-900">
                                  ฿{s.travelExpense.toLocaleString()}
                                </span>
                              </div>
                            )}

                            {((s.rentalFee || 0) > 0 || (s.travelExpense || 0) > 0) && (
                              <div className="flex items-center justify-between pt-1 border-t border-amber-200 font-bold text-amber-950">
                                <span>🏷️ รวมต้นทุนคงที่:</span>
                                <span className="font-mono font-black text-sm">
                                  ฿{((s.rentalFee || 0) + (s.travelExpense || 0)).toLocaleString()}
                                </span>
                              </div>
                            )}

                            {s.depositAmount !== undefined && s.depositAmount > 0 && (
                              <div className="flex items-center justify-between pt-1 border-t border-amber-200 text-stone-700">
                                <span>💰 เงินมัดจำค่าที่:</span>
                                <span className="font-mono font-bold text-amber-900">
                                  ฿{s.depositAmount.toLocaleString()}
                                  {s.rentalFee !== undefined && s.rentalFee > s.depositAmount && (
                                    <span className="text-red-700 font-mono ml-1 text-[10px]">
                                      (คงเหลือวันงาน: ฿{(s.rentalFee - s.depositAmount).toLocaleString()})
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* สินค้าเตรียมขาย (แสดงในมือถือครบถ้วน) */}
                          {s.productsToPrepare && (
                            <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-200 text-xs">
                              <p className="flex items-center gap-1.5 font-black text-amber-900">
                                <ShoppingBag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>สินค้าเตรียมขาย:</span>
                              </p>
                              <p className="font-bold text-stone-800 text-[11px] mt-0.5 leading-relaxed pl-5">
                                {s.productsToPrepare}
                              </p>
                            </div>
                          )}

                          {/* ข้อมูลติดต่อผู้จัดงานสำหรับติดต่อรอบหน้า */}
                          {(s.organizerName || s.organizerPhone || s.organizerLine || s.boothNumber) && (
                            <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-300 text-xs space-y-1" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-emerald-950 flex items-center gap-1">
                                  <span>📇</span>
                                  <span>ผู้จัดงาน / จองบูธรอบหน้า:</span>
                                </span>
                                {s.boothNumber && (
                                  <span className="text-[10px] font-black bg-emerald-200 text-emerald-950 px-1.5 py-0.5 rounded border border-emerald-400">
                                    ล็อก {s.boothNumber}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center justify-between gap-1 pt-0.5">
                                {s.organizerName && (
                                  <span className="text-stone-800 font-bold text-[11px]">
                                    {s.organizerName}
                                  </span>
                                )}
                                <div className="flex items-center gap-1.5 ml-auto">
                                  {(s.organizerPhone || s.organizerContact) && (
                                    <a
                                      href={`tel:${(s.organizerPhone || s.organizerContact || '').replace(/[^0-9+]/g, '')}`}
                                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded-md flex items-center gap-1 shadow-2xs"
                                      title="โทรออกหาผู้จัดงาน"
                                    >
                                      <Phone className="w-2.5 h-2.5" />
                                      <span>{s.organizerPhone || s.organizerContact}</span>
                                    </a>
                                  )}
                                  {s.organizerLine && (
                                    <a
                                      href={`https://line.me/R/ti/p/~${s.organizerLine}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-0.5 bg-green-500 hover:bg-green-600 text-white font-black text-[10px] rounded-md flex items-center gap-1 shadow-2xs"
                                      title="แอดไลน์ผู้จัดงาน"
                                    >
                                      <span>LINE</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* พนักงานรับผิดชอบ & เบอร์ติดต่อ/พร้อมเพย์ */}
                          {(s.assignedStaff || s.phonePromptPay) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {s.assignedStaff && (
                                <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <div>
                                    <span className="text-[10px] text-stone-500 block font-bold">พนักงาน:</span>
                                    <span className="font-bold text-stone-900">{s.assignedStaff}</span>
                                  </div>
                                </div>
                              )}
                              {s.phonePromptPay && (
                                <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <div>
                                    <span className="text-[10px] text-stone-500 block font-bold">เบอร์ติดต่อ/พร้อมเพย์:</span>
                                    <span className="font-mono font-bold text-stone-900">{s.phonePromptPay}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ปุ่มเปิดดูสลิปมัดจำ & Google Maps นำทาง */}
                          {(s.depositSlipUrl || s.googleMapsUrl) && (
                            <div className="flex items-center gap-2 flex-wrap pt-0.5" onClick={(e) => e.stopPropagation()}>
                              {s.depositSlipUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewSlipModalUrl(s.depositSlipUrl!)}
                                  className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-xl text-xs font-black flex items-center gap-1 transition shadow-2xs cursor-pointer"
                                >
                                  <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                                  <span>🧾 ดูสลิปมัดจำ</span>
                                </button>
                              )}
                              {s.googleMapsUrl && (
                                <a
                                  href={s.googleMapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-950 border border-sky-300 rounded-xl text-xs font-black flex items-center gap-1 transition shadow-2xs"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-sky-700" />
                                  <span>🗺️ นำทาง Google Maps</span>
                                  <ExternalLink className="w-3 h-3 text-sky-700" />
                                </a>
                              )}
                            </div>
                          )}

                          {/* หมายเหตุ */}
                          {s.note && (
                            <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 text-[11px] text-stone-700">
                              <span className="font-bold text-stone-900 block">📝 หมายเหตุ:</span>
                              <p className="mt-0.5 leading-relaxed">{s.note}</p>
                            </div>
                          )}

                          {/* เป้าหมายยอดขาย */}
                          {s.salesTarget && s.salesTarget > 0 && (
                            <div className="flex items-center justify-between text-[11px] font-black bg-stone-100/90 px-2.5 py-1 rounded-lg border border-stone-200">
                              <span className="text-stone-600">🎯 เป้าหมายยอดขาย:</span>
                              <span className="font-mono text-stone-900">฿{s.salesTarget.toLocaleString()}</span>
                            </div>
                          )}

                          {/* Transferee Info if transferred */}
                          {s.status === 'TRANSFERRED' && s.transfereeName && (
                            <div className="bg-purple-100/80 p-2.5 rounded-xl border border-purple-300 text-xs font-bold text-purple-950 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <ArrowRightLeft className="w-3.5 h-3.5 text-purple-700" />
                                <span>ปล่อยต่อให้: {s.transfereeName}</span>
                              </span>
                              {s.transferPrice !== undefined && (
                                <span className="font-mono font-black text-purple-900 bg-white px-2 py-0.5 rounded-md border border-purple-300">
                                  ฿{s.transferPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Actions Bottom Bar */}
                          <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleOpenTransferModal(s)}
                              className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5 text-purple-700" />
                              <span>{s.status === 'TRANSFERRED' ? 'แก้ไขปล่อยต่อ' : 'ปล่อยต่อบูธ'}</span>
                            </button>

                            <div className="flex items-center gap-1.5">
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
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* 2. FULL DESKTOP & SCROLLABLE TABLE (แสดงบนจอคอม หรือเมื่อเลือกมุมมองตาราง) */}
                <div className={`overflow-x-auto ${agendaMobileViewMode === 'cards' ? 'hidden sm:block' : 'block'}`}>
                  {/* Mobile swipe hint banner */}
                  <div className="sm:hidden bg-amber-500/10 border-b border-amber-300 px-3.5 py-2 text-[11px] text-amber-950 font-bold flex items-center justify-between">
                    <span>👉 เลื่อนหน้าจอซ้าย-ขวา เพื่อดูตาราง 10 คอลัมน์แบบเต็มเหมือนในคอม</span>
                    <span className="text-[10px] text-stone-500 font-mono">10 คอลัมน์</span>
                  </div>

                  <table className="w-full min-w-[960px] text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-amber-50 border-b-2 border-amber-300 text-stone-900 font-black">
                        <th className="p-3 rounded-l-xl">วัน / วันที่ออกงาน (ว/ด/ป)</th>
                        <th className="p-3">เวลาทำการ</th>
                        <th className="p-3">ชื่องาน / ตลาดนัด</th>
                        <th className="p-3">สถานที่</th>
                        <th className="p-3">ค่าเช่าบูธ</th>
                        <th className="p-3">🚗 ค่าเดินทาง</th>
                        <th className="p-3">🏷️ รวมต้นทุนคงที่</th>
                        <th className="p-3">พนักงาน</th>
                        <th className="p-3">สถานะ</th>
                        <th className="p-3 text-right rounded-r-xl">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {filteredSchedules
                        .sort((a, b) => a.startDate.localeCompare(b.startDate))
                        .map((s) => {
                          const dateCat = getEventDateCategory(s.startDate, s.endDate);
                          const isPast = dateCat === 'PAST';
                          const isToday = dateCat === 'TODAY';
                          const dayName = getThaiDayName(s.startDate);

                          return (
                            <tr
                              key={s.id}
                              className={`transition cursor-pointer ${
                                s.status === 'TRANSFERRED'
                                  ? 'bg-purple-50/60 hover:bg-purple-100/70'
                                  : isToday
                                  ? 'bg-amber-100/80 font-bold border-l-4 border-l-amber-500 hover:bg-amber-200/60'
                                  : isPast
                                  ? 'bg-stone-50/80 text-stone-500 hover:bg-stone-100'
                                  : 'bg-white hover:bg-amber-50/50'
                              }`}
                              onClick={() => {
                                setSelectedCalendarSchedule(s);
                                setSelectedEventId(s.id);
                                setActiveBranch(s.branchName);
                              }}
                            >
                              <td className="p-3 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                    isToday ? 'bg-amber-500 text-stone-950 font-extrabold' : 'bg-stone-200 text-stone-800'
                                  }`}>
                                    {dayName}
                                  </span>
                                  <span className="font-mono font-black text-amber-950 text-xs">
                                    {formatThaiDMY(s.startDate)}
                                  </span>
                                  {isToday && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-300 text-amber-950">
                                      วันนี้
                                    </span>
                                  )}
                                </div>
                                {s.startDate !== s.endDate && (
                                  <span className="text-stone-500 font-sans block text-[10px] pl-1">
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
                                {s.productsToPrepare && (
                                  <div className="text-[10px] text-amber-900 font-sans font-bold truncate max-w-[200px]" title={s.productsToPrepare}>
                                    🛍️ {s.productsToPrepare}
                                  </div>
                                )}
                                {s.phonePromptPay && (
                                  <div className="text-[10px] text-emerald-800 font-mono font-bold">
                                    📞 {s.phonePromptPay}
                                  </div>
                                )}
                                {(s.organizerName || s.organizerPhone || s.organizerLine || s.boothNumber) && (
                                  <div className="text-[10px] text-emerald-800 font-sans font-bold flex items-center gap-1.5 flex-wrap mt-0.5" onClick={(e) => e.stopPropagation()}>
                                    <span>📇</span>
                                    {s.boothNumber && <span className="bg-emerald-100 text-emerald-950 px-1 rounded text-[9px] border border-emerald-300">ล็อก {s.boothNumber}</span>}
                                    {s.organizerName && <span>ผู้จัด: {s.organizerName}</span>}
                                    {(s.organizerPhone || s.organizerContact) && (
                                      <a
                                        href={`tel:${(s.organizerPhone || s.organizerContact || '').replace(/[^0-9+]/g, '')}`}
                                        className="text-emerald-700 underline hover:text-emerald-900 font-mono"
                                      >
                                        📞 {s.organizerPhone || s.organizerContact}
                                      </a>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-stone-800 font-black whitespace-nowrap">
                                <div>📍 {s.location}</div>
                                {s.googleMapsUrl && (
                                  <a
                                    href={s.googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[10px] text-sky-700 hover:text-sky-900 font-bold inline-flex items-center gap-0.5 mt-0.5 underline"
                                  >
                                    <span>🗺️ แผนที่นำทาง</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </td>
                              <td className="p-3 font-mono font-black text-amber-900 whitespace-nowrap">
                                <div>{s.rentalFee === undefined || s.rentalFee === 0 ? 'ฟรี' : `฿${s.rentalFee.toLocaleString()}`}</div>
                                {s.depositAmount !== undefined && s.depositAmount > 0 && (
                                  <div className="text-[10px] text-stone-500 font-bold">
                                    มัดจำ: ฿{s.depositAmount.toLocaleString()}
                                  </div>
                                )}
                                {s.depositSlipUrl && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewSlipModalUrl(s.depositSlipUrl!);
                                    }}
                                    className="text-[10px] text-amber-800 hover:text-amber-950 font-bold inline-flex items-center gap-0.5 underline cursor-pointer"
                                  >
                                    <ImageIcon className="w-2.5 h-2.5" />
                                    <span>ดูสลิป</span>
                                  </button>
                                )}
                              </td>
                              <td className="p-3 font-mono font-black text-amber-800 whitespace-nowrap">
                                {s.travelExpense !== undefined && s.travelExpense > 0 ? `฿${s.travelExpense.toLocaleString()}` : '-'}
                              </td>
                              <td className="p-3 font-mono font-black text-amber-950 whitespace-nowrap bg-amber-50/50">
                                {((s.rentalFee || 0) > 0 || (s.travelExpense || 0) > 0)
                                  ? `฿${((s.rentalFee || 0) + (s.travelExpense || 0)).toLocaleString()}`
                                  : 'ฟรี'}
                              </td>
                              <td className="p-3 text-stone-700 font-bold whitespace-nowrap">
                                {s.assignedStaff || '-'}
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                {s.status === 'TRANSFERRED' && (
                                  <div>
                                    <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-black text-[10px] inline-flex items-center gap-1">
                                      <ArrowRightLeft className="w-2.5 h-2.5" /> ปล่อยต่อแล้ว
                                    </span>
                                    {s.transfereeName && (
                                      <div className="text-[10px] text-purple-900 font-bold truncate max-w-[120px]" title={s.transfereeName}>
                                        ผู้รับ: {s.transfereeName}
                                      </div>
                                    )}
                                  </div>
                                )}
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
                                    type="button"
                                    onClick={() => handleOpenTransferModal(s)}
                                    className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg transition"
                                    title="ปล่อยต่อบูธ / โอนสิทธิ์"
                                  >
                                    <ArrowRightLeft className="w-3.5 h-3.5" />
                                  </button>
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
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </>
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
                        {s.travelExpense !== undefined && s.travelExpense > 0 && (
                          <p className="flex items-center gap-1.5 font-black text-amber-950 bg-amber-50/90 px-2.5 py-1.5 rounded-xl border border-amber-300/80 shadow-xs">
                            <Car className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>
                              ค่าเดินทาง / ค่าน้ำมัน: <strong className="text-amber-900 font-mono">฿{s.travelExpense.toLocaleString()}</strong>
                            </span>
                          </p>
                        )}
                        {((s.rentalFee || 0) > 0 || (s.travelExpense || 0) > 0) && (
                          <div className="flex items-center justify-between text-xs font-black bg-amber-100/90 px-2.5 py-1.5 rounded-xl border border-amber-400">
                            <span className="text-stone-800">🏷️ รวมต้นทุนคงที่ (ค่าที่ + ค่าเดินทาง):</span>
                            <strong className="text-amber-950 font-mono">฿{((s.rentalFee || 0) + (s.travelExpense || 0)).toLocaleString()}</strong>
                          </div>
                        )}
                        {s.status === 'TRANSFERRED' && s.transfereeName && (
                          <div className="bg-purple-100/80 p-2.5 rounded-xl border border-purple-300 text-xs font-bold text-purple-950 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <ArrowRightLeft className="w-3.5 h-3.5 text-purple-700" />
                                <span>ปล่อยต่อให้: <strong>{s.transfereeName}</strong></span>
                              </span>
                              {s.transferPrice !== undefined && (
                                <span className="font-mono font-black text-purple-900 bg-white px-2 py-0.5 rounded-md border border-purple-300">
                                  ฿{s.transferPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {s.transfereePhone && (
                              <p className="text-[11px] text-purple-800 font-mono">เบอร์ติดต่อ: {s.transfereePhone}</p>
                            )}
                          </div>
                        )}
                        {s.depositAmount !== undefined && s.depositAmount > 0 && (
                          <p className="flex items-center gap-1.5 font-black text-amber-950 bg-amber-100/70 px-2.5 py-1.5 rounded-xl border border-amber-300 shadow-xs">
                            <DollarSign className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>
                              เงินมัดจำค่าที่: <strong className="text-amber-900 font-mono">฿{s.depositAmount.toLocaleString()}</strong>
                              {s.rentalFee !== undefined && s.rentalFee > s.depositAmount && (
                                <span className="text-red-700 font-mono ml-1 text-[11px]">
                                  (คงเหลือจ่ายวันงาน: ฿{(s.rentalFee - s.depositAmount).toLocaleString()})
                                </span>
                              )}
                              {s.rentalFee !== undefined && s.depositAmount >= s.rentalFee && (
                                <span className="text-emerald-700 font-bold ml-1 text-[11px]">
                                  (มัดจำครบแล้ว)
                                </span>
                              )}
                            </span>
                          </p>
                        )}
                        {/* Deposit Slip & Google Maps Buttons */}
                        {(s.depositSlipUrl || s.googleMapsUrl) && (
                          <div className="flex items-center gap-2 flex-wrap pt-0.5">
                            {s.depositSlipUrl && (
                              <button
                                type="button"
                                onClick={() => setPreviewSlipModalUrl(s.depositSlipUrl!)}
                                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-lg text-[11px] font-black flex items-center gap-1 transition shadow-2xs cursor-pointer"
                              >
                                <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                                <span>ดูสลิปมัดจำ</span>
                              </button>
                            )}
                            {s.googleMapsUrl && (
                              <a
                                href={s.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-950 border border-sky-300 rounded-lg text-[11px] font-black flex items-center gap-1 transition shadow-2xs"
                              >
                                <MapPin className="w-3.5 h-3.5 text-sky-700" />
                                <span>แผนที่ Google Maps</span>
                                <ExternalLink className="w-3 h-3 text-sky-600" />
                              </a>
                            )}
                          </div>
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
                          type="button"
                          onClick={() => handleSendLineNotification(s)}
                          disabled={sendingLineEventId === s.id}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 shadow-xs border border-emerald-700 disabled:opacity-50"
                          title="ส่งข้อมูลตารางงานนี้เข้า LINE ทันที"
                        >
                          <Send className={`w-3 h-3 ${sendingLineEventId === s.id ? 'animate-spin' : ''}`} />
                          <span>{sendingLineEventId === s.id ? 'กำลังส่ง...' : 'แจ้ง LINE'}</span>
                        </button>

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

              {selectedCalendarSchedule.travelExpense !== undefined && selectedCalendarSchedule.travelExpense > 0 && (
                <p className="flex items-center gap-2 font-black text-amber-950 bg-amber-100/70 p-2 rounded-xl border border-amber-300">
                  <Car className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    ค่าเดินทาง / ค่าน้ำมัน / ค่ารถ:{' '}
                    <strong className="text-amber-900 font-mono text-sm">
                      ฿{selectedCalendarSchedule.travelExpense.toLocaleString()}
                    </strong>
                  </span>
                </p>
              )}

              {((selectedCalendarSchedule.rentalFee || 0) > 0 || (selectedCalendarSchedule.travelExpense || 0) > 0) && (
                <div className="flex items-center justify-between text-xs font-black bg-amber-200/70 px-3 py-2 rounded-xl border border-amber-400">
                  <span className="text-stone-800">🏷️ รวมต้นทุนคงที่ออกบูธนี้ (ค่าที่ + ค่าเดินทาง):</span>
                  <strong className="text-amber-950 font-mono text-sm">
                    ฿{((selectedCalendarSchedule.rentalFee || 0) + (selectedCalendarSchedule.travelExpense || 0)).toLocaleString()}
                  </strong>
                </div>
              )}

              {/* Missed / Cancelled Status in Detail Modal */}
              {selectedCalendarSchedule.status === 'CANCELLED' && (
                <div className="bg-rose-50 p-3.5 rounded-2xl border-2 border-rose-400 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                      <span>❌ สถานะ: ไม่ได้งานครั้งนี้ / ล็อกเต็ม / สละสิทธิ์</span>
                    </span>
                    <span className="text-[10px] font-black bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full border border-rose-300">
                      บันทึกประวัติแล้ว
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-stone-800">
                      📌 เหตุผล: <strong className="text-rose-950 font-black">{selectedCalendarSchedule.missedReason || 'ไม่ได้งาน / ไม่ได้ไป'}</strong>
                    </p>
                    <p className="text-[11px] text-stone-600">
                      💡 ข้อมูลผู้จัดงาน (ชื่อ, เบอร์โทร, LINE, ค่าเช่าบูธ) ยังคงถูกเก็บรักษาไว้ใน &quot;สมุดติดต่อผู้จัดงาน&quot; ครบถ้วน เพื่อให้ท่านโทรหรือทักจองในรอบถัดไปได้ทันที
                    </p>
                  </div>
                </div>
              )}

              {/* Transferred Status in Detail Modal */}
              {selectedCalendarSchedule.status === 'TRANSFERRED' && (
                <div className="bg-purple-50 p-3.5 rounded-2xl border-2 border-purple-400 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                      <ArrowRightLeft className="w-4 h-4 text-purple-700" />
                      <span>สถานะ: ปล่อยต่อ / โอนสิทธิ์ออกบูธแล้ว</span>
                    </span>
                    {selectedCalendarSchedule.transferPrice !== undefined && (
                      <span className="font-mono font-black text-purple-900 bg-purple-200 px-2 py-0.5 rounded-lg border border-purple-300 text-xs">
                        ฿{selectedCalendarSchedule.transferPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-stone-800">
                      👤 ผู้รับช่วงต่อ: <strong className="text-purple-950">{selectedCalendarSchedule.transfereeName || '-'}</strong>
                    </p>
                    {selectedCalendarSchedule.transfereePhone && (
                      <p className="font-bold text-stone-800">
                        📞 เบอร์โทรศัพท์: <strong className="text-purple-950 font-mono">{selectedCalendarSchedule.transfereePhone}</strong>
                      </p>
                    )}
                    {selectedCalendarSchedule.transferDate && (
                      <p className="text-stone-600 font-mono">
                        📅 วันที่ส่งต่อ: {formatThaiDMY(selectedCalendarSchedule.transferDate)}
                      </p>
                    )}
                    {selectedCalendarSchedule.transferNote && (
                      <p className="text-stone-700 bg-white p-2 rounded-xl border border-purple-200">
                        📝 หมายเหตุ: {selectedCalendarSchedule.transferNote}
                      </p>
                    )}
                  </div>
                  {selectedCalendarSchedule.transferSlipUrl && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setPreviewSlipModalUrl(selectedCalendarSchedule.transferSlipUrl!)}
                        className="text-xs font-black text-purple-800 underline hover:text-purple-950 flex items-center gap-1"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>ดูหลักฐานการโอนเงินจากผู้รับต่อ</span>
                      </button>
                    </div>
                  )}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleCancelTransfer(selectedCalendarSchedule.id)}
                      className="text-[11px] font-bold text-red-600 hover:text-red-800 underline cursor-pointer"
                    >
                      ยกเลิกการปล่อยต่อ (ดึงบูธกลับมาเป็นของเรา)
                    </button>
                  </div>
                </div>
              )}

              {selectedCalendarSchedule.depositAmount !== undefined && selectedCalendarSchedule.depositAmount > 0 && (
                <div className="bg-amber-100/80 p-2.5 rounded-xl border border-amber-300 text-xs font-black space-y-1">
                  <div className="flex items-center justify-between text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-amber-700" />
                      <span>เงินมัดจำค่าที่:</span>
                    </span>
                    <span className="font-mono text-sm text-amber-900">
                      ฿{selectedCalendarSchedule.depositAmount.toLocaleString()}
                    </span>
                  </div>
                  {selectedCalendarSchedule.rentalFee !== undefined && (
                    <div className="text-[11px] text-stone-600 flex justify-between pt-0.5 border-t border-amber-200">
                      <span>คงเหลือชำระวันงาน:</span>
                      <span className="font-mono font-bold text-red-700">
                        {selectedCalendarSchedule.depositAmount >= selectedCalendarSchedule.rentalFee
                          ? '✅ ชำระครบแล้ว 100%'
                          : `฿${(selectedCalendarSchedule.rentalFee - selectedCalendarSchedule.depositAmount).toLocaleString()}`
                        }
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Deposit Slip in Detail Modal */}
              {selectedCalendarSchedule.depositSlipUrl && (
                <div className="bg-white p-2.5 rounded-xl border border-stone-300 space-y-1.5 shadow-2xs">
                  <span className="text-[11px] font-black text-stone-800 block flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                    <span>หลักฐานการโอนเงินมัดจำ:</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedCalendarSchedule.depositSlipUrl}
                      alt="สลิปมัดจำ"
                      onClick={() => setPreviewSlipModalUrl(selectedCalendarSchedule.depositSlipUrl!)}
                      className="w-16 h-16 object-cover rounded-lg border border-amber-300 cursor-pointer hover:scale-105 transition shadow-xs"
                      title="คลิกเพื่อดูรูปขนาดเต็ม"
                    />
                    <div className="text-[11px] text-stone-600 space-y-1">
                      <p className="font-bold text-stone-900">แนบหลักฐานสลิปมัดจำแล้ว</p>
                      <button
                        type="button"
                        onClick={() => setPreviewSlipModalUrl(selectedCalendarSchedule.depositSlipUrl!)}
                        className="text-amber-800 hover:text-amber-950 underline font-bold cursor-pointer"
                      >
                        กดเพื่อดูรูปสลิปขนาดเต็ม
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Google Maps Link in Detail Modal */}
              {selectedCalendarSchedule.googleMapsUrl && (
                <a
                  href={selectedCalendarSchedule.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-sky-100 hover:bg-sky-200 text-sky-950 font-black text-xs rounded-xl border border-sky-300 flex items-center justify-center gap-2 transition shadow-2xs"
                >
                  <MapPin className="w-4 h-4 text-sky-700" />
                  <span>🗺️ เปิด Google Maps เพื่อนำทางไปยังสถานที่จัดงาน</span>
                  <ExternalLink className="w-3.5 h-3.5 text-sky-700" />
                </a>
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

              {/* Organizer / Contact Info for Future & Coordination */}
              {(selectedCalendarSchedule.organizerName || selectedCalendarSchedule.organizerPhone || selectedCalendarSchedule.organizerLine || selectedCalendarSchedule.boothNumber) && (
                <div className="bg-emerald-50/90 border-2 border-emerald-300 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <span>📇</span>
                      <span>ข้อมูลผู้จัดงาน & ติดต่อออกบูธรอบหน้า:</span>
                    </span>
                    {selectedCalendarSchedule.boothNumber && (
                      <span className="text-[10px] font-black bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-md border border-emerald-400">
                        ล็อก: {selectedCalendarSchedule.boothNumber}
                      </span>
                    )}
                  </div>
                  {selectedCalendarSchedule.organizerName && (
                    <p className="text-xs font-bold text-stone-900">
                      ผู้จัด/ผู้ประสานงาน: <span className="font-black text-emerald-950">{selectedCalendarSchedule.organizerName}</span>
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {(selectedCalendarSchedule.organizerPhone || selectedCalendarSchedule.organizerContact) && (
                      <a
                        href={`tel:${(selectedCalendarSchedule.organizerPhone || selectedCalendarSchedule.organizerContact || '').replace(/[^0-9+]/g, '')}`}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>โทร {selectedCalendarSchedule.organizerPhone || selectedCalendarSchedule.organizerContact}</span>
                      </a>
                    )}
                    {selectedCalendarSchedule.organizerLine && (
                      <a
                        href={`https://line.me/R/ti/p/~${selectedCalendarSchedule.organizerLine}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white font-black text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition"
                      >
                        <span>💬 LINE: {selectedCalendarSchedule.organizerLine}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Event Coordination Images Gallery in Detail Modal */}
              {(() => {
                const photos = getNormalizedCoordinationPhotos(selectedCalendarSchedule);
                return (
                  <div className="bg-indigo-50/90 p-3.5 rounded-2xl border-2 border-indigo-300 space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-indigo-700" />
                        <span className="text-xs font-black text-indigo-950">
                          📸 รูปภาพการติดต่อประสานงาน & ผังบูธ ({photos.length} รูป)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenPhotoManager(selectedCalendarSchedule)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] rounded-xl flex items-center gap-1 shadow-xs transition cursor-pointer"
                        title="เพิ่มรูปใหม่ ลบ หรือแก้ไขคำอธิบายรูปภาพนี้"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>จัดการรูป (เพิ่ม/ลบ/แก้ไข)</span>
                      </button>
                    </div>

                    {photos.length === 0 ? (
                      <p className="text-[11px] text-stone-500 italic bg-white p-3 rounded-xl border border-indigo-100">
                        ยังไม่มีรูปภาพประสานงานแนบไว้ คลิกปุ่ม &quot;จัดการรูป&quot; เพื่อแนบรูปผังบูธ สัญญา หรือนามบัตรได้ทันที
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {photos.map((p, idx) => {
                          const catInfo = COORDINATION_CATEGORIES.find((c) => c.key === p.category) || COORDINATION_CATEGORIES[0];
                          return (
                            <div
                              key={p.id || idx}
                              onClick={() => setPreviewSlipModalUrl(p.url)}
                              className="relative rounded-xl overflow-hidden border-2 border-indigo-200 hover:border-indigo-500 shadow-2xs aspect-4/3 cursor-pointer group transition bg-white"
                            >
                              <img
                                src={p.url}
                                alt={p.caption || ''}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-black shadow-xs bg-black/75 text-white flex items-center gap-1">
                                <span>{catInfo.icon}</span>
                                <span>{catInfo.label.split(' / ')[0]}</span>
                              </div>
                              {p.caption && (
                                <div className="absolute bottom-0 inset-x-0 bg-black/75 text-white p-1 text-[9px] truncate font-medium">
                                  {p.caption}
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-center justify-center transition">
                                <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

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
                {selectedCalendarSchedule.status !== 'CANCELLED' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const toMark = selectedCalendarSchedule;
                      handleMarkAsMissed(toMark);
                    }}
                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-black text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
                    title="บันทึกว่างานนี้ไม่ได้ไป/ไม่ได้บูธ เพื่อเก็บรายชื่อผู้จัดไว้โทรติดต่อรอบหน้า"
                  >
                    <span>❌ ไม่ได้งานนี้</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const toRestore = selectedCalendarSchedule;
                      handleRestoreFromMissed(toRestore);
                    }}
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-black text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
                    title="เปลี่ยนสถานะกลับเป็นงานออกบูธปกติ"
                  >
                    <span>🔄 เปลี่ยนเป็นได้งาน</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const toTransfer = selectedCalendarSchedule;
                    setSelectedCalendarSchedule(null);
                    handleOpenTransferModal(toTransfer);
                  }}
                  className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 font-black text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-purple-700" />
                  <span>{selectedCalendarSchedule.status === 'TRANSFERRED' ? 'แก้ไขปล่อยต่อ' : '🤝 ปล่อยต่อบูธ'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendLineNotification(selectedCalendarSchedule)}
                  disabled={sendingLineEventId === selectedCalendarSchedule.id}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 border border-emerald-700 cursor-pointer disabled:opacity-50"
                  title="ส่งแจ้งเตือนตารางงานนี้เข้า LINE ทันที"
                >
                  <Send className={`w-3.5 h-3.5 ${sendingLineEventId === selectedCalendarSchedule.id ? 'animate-spin' : ''}`} />
                  <span>{sendingLineEventId === selectedCalendarSchedule.id ? 'กำลังส่ง...' : '🔔 ส่งเข้า LINE'}</span>
                </button>

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

      {/* MODAL 1: ADD / EDIT EVENT SCHEDULE MODAL */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col text-stone-950 shadow-2xl text-left overflow-hidden">
            
            {/* STICKY TOP MODAL HEADER: หัวชื่องาน & วันที่ (ไม่หายแน่นอน 100%) */}
            <div className="flex justify-between items-center border-b-2 border-amber-500/80 p-4 sm:p-5 shrink-0 bg-amber-400 z-20 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-stone-950 bg-white/90 px-2.5 py-0.5 rounded-full shadow-2xs inline-flex items-center gap-1 border border-amber-600">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>{editingScheduleId ? 'แก้ไขข้อมูลตารางออกงาน' : 'ลงตารางออกงานใหม่'}</span>
                </span>
                <h3 className="font-serif font-black text-lg sm:text-xl text-stone-950 truncate max-w-[270px] sm:max-w-md">
                  {eventTitle.trim() ? eventTitle : 'ระบุชื่องาน / ตลาดนัด'}
                </h3>
                <div className="text-xs font-black text-amber-950 inline-flex items-center gap-1.5 flex-wrap">
                  <span>📅 วันที่ออกงาน:</span>
                  <span className="underline font-mono">
                    {getThaiDayName(eventStartDate)} {formatThaiDMY(eventStartDate)}
                  </span>
                  <span>•</span>
                  <span>{eventBranch}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEventModalOpen(false)}
                className="text-stone-950 hover:bg-amber-300 p-2 rounded-full border border-amber-600 bg-white/80 transition cursor-pointer shadow-xs shrink-0"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewEvent} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              
              {/* หัวที่เป็นชื่องาน (Event Title Header Section) - เด่นชัดที่สุดด้านบนสุด */}
              <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/80 border-2 border-amber-400 p-4 rounded-2xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-stone-950 font-black text-sm sm:text-base flex items-center gap-2">
                    <span className="text-xl">🎪</span>
                    <span>ชื่องาน / ตลาดนัด (หัวข้อหลัก) *</span>
                  </label>
                  <span className="text-[10px] font-black text-amber-950 bg-amber-300 px-2 py-0.5 rounded-full border border-amber-500">
                    หัวข้อหลัก (สำคัญ)
                  </span>
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="เช่น ออกบูธตลาดนัดคลอง 16 (HUDA ABAYA Pop-up) หรือ งานแฟชั่นมุสลิม"
                  className="w-full bg-white border-2 border-amber-500 rounded-xl p-3 text-stone-950 font-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
                />
                <p className="text-[11px] text-amber-900 font-bold">
                  💡 ระบุชื่องาน หรือชื่อตลาดนัดที่ไปออกบูธ เพื่อให้แสดงเด่นชัดด้านบนสุดและในตารางนัดหมาย
                </p>
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

              {/* Section: Travel & Transit Expenses (ค่าเดินทาง / ค่าน้ำมัน / ค่ารถไปออกบูธ) */}
                <div className="bg-amber-50/70 border border-amber-300/80 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-stone-950 font-black flex items-center gap-1.5 text-xs">
                      <Car className="w-4 h-4 text-amber-700" />
                      <span>ค่าเดินทาง / ค่าน้ำมัน / ค่ารถไปออกบูธ (บาท)</span>
                    </label>
                    <span className="text-[10px] text-amber-900 font-extrabold bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                      {eventTravelExpense === '' || eventTravelExpense === 0 ? '฿0 (ไม่มีค่าเดินทาง)' : `฿${(typeof eventTravelExpense === 'number' ? eventTravelExpense : 0).toLocaleString()}`}
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
                      value={eventTravelExpense}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEventTravelExpense(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
                      }}
                      onFocus={(e) => e.target.select()}
                      placeholder="เช่น 200, 300 หรือ 0 หากไม่มีค่าเดินทาง"
                      className="w-full bg-white border-2 border-stone-400 focus:border-amber-500 rounded-xl py-2 pl-8 pr-12 text-stone-950 font-mono font-black text-xs focus:outline-none shadow-xs"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 font-bold">
                      บาท
                    </span>
                  </div>

                  {/* Quick preset chips for travel expense */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] font-black text-stone-600 shrink-0">ตัวเลือกด่วน:</span>
                    {[0, 100, 200, 300, 500, 800, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setEventTravelExpense(amt)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition cursor-pointer ${
                          eventTravelExpense === amt
                            ? 'bg-amber-400 border-amber-600 text-stone-950 shadow-xs'
                            : 'bg-white hover:bg-stone-100 border-stone-300 text-stone-800'
                        }`}
                      >
                        {amt === 0 ? 'ฟรี ฿0' : `฿${amt.toLocaleString()}`}
                      </button>
                    ))}
                  </div>

                  {/* Total Event Fixed Costs Summary (ค่าที่ + ค่าเดินทาง) */}
                  {((typeof eventRentalFee === 'number' && eventRentalFee > 0) || (typeof eventTravelExpense === 'number' && eventTravelExpense > 0)) && (
                    <div className="flex items-center justify-between text-[11px] bg-white px-2.5 py-1.5 rounded-xl border border-amber-300 font-bold mt-1">
                      <span className="text-stone-700">🏷️ รวมต้นทุนคงที่ออกบูธนี้ (ค่าที่ + ค่าเดินทาง):</span>
                      <strong className="text-amber-950 font-mono text-xs">
                        ฿{(((typeof eventRentalFee === 'number' ? eventRentalFee : 0) + (typeof eventTravelExpense === 'number' ? eventTravelExpense : 0))).toLocaleString()}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Section: Deposit Amount & Payment Slip */}
              <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-3.5 space-y-3 shadow-xs">
                {/* Deposit Amount Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-stone-950 font-black flex items-center gap-1.5 text-xs">
                      <DollarSign className="w-4 h-4 text-amber-700" />
                      <span>จำนวนเงินมัดจำค่าที่ / ค่าบูธ (บาท)</span>
                    </label>
                    <span className="text-[10px] text-amber-900 font-extrabold bg-amber-200/90 px-2.5 py-0.5 rounded-full border border-amber-300">
                      {eventDepositAmount === '' || eventDepositAmount === 0
                        ? 'ยังไม่มีการมัดจำ (฿0)'
                        : `มัดจำแล้ว: ฿${(typeof eventDepositAmount === 'number' ? eventDepositAmount : 0).toLocaleString()}`
                      }
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
                      value={eventDepositAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEventDepositAmount(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
                      }}
                      onFocus={(e) => e.target.select()}
                      placeholder="ใส่จำนวนเงินมัดจำที่โอนจ่ายไปแล้ว หรือ 0 หากยังไม่มัดจำ"
                      className="w-full bg-white border-2 border-stone-400 focus:border-amber-500 rounded-xl py-2 pl-8 pr-12 text-stone-950 font-mono font-black text-xs focus:outline-none shadow-xs"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 font-bold">
                      บาท
                    </span>
                  </div>

                  {/* Deposit Calculation Summary */}
                  {typeof eventRentalFee === 'number' && eventRentalFee > 0 && (
                    <div className="flex items-center justify-between text-[11px] bg-white px-2.5 py-1.5 rounded-xl border border-amber-200 font-bold">
                      <span className="text-stone-600">สรุปยอดชำระ:</span>
                      <span className="font-black text-amber-950">
                        ค่าที่ ฿{eventRentalFee.toLocaleString()}
                        {typeof eventDepositAmount === 'number' && eventDepositAmount > 0 ? (
                          <>
                            {' - '}มัดจำ ฿{eventDepositAmount.toLocaleString()}{' = '}
                            {eventDepositAmount >= eventRentalFee ? (
                              <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 ml-1">
                                ✅ ชำระมัดจำครบเต็มจำนวนแล้ว
                              </span>
                            ) : (
                              <span className="text-red-700 font-mono ml-1">
                                คงเหลือจ่ายวันงาน: ฿{(eventRentalFee - eventDepositAmount).toLocaleString()}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-stone-500 ml-1">(ยังไม่ชำระมัดจำ)</span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Quick preset chips for deposit */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] font-black text-stone-600 shrink-0">ตัวเลือกมัดจำด่วน:</span>
                    {[0, 300, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setEventDepositAmount(amt)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition cursor-pointer ${
                          eventDepositAmount === amt
                            ? 'bg-amber-400 border-amber-600 text-stone-950 shadow-xs'
                            : 'bg-white hover:bg-stone-100 border-stone-300 text-stone-800'
                        }`}
                      >
                        {amt === 0 ? '฿0 (ไม่มัดจำ)' : `฿${amt.toLocaleString()}`}
                      </button>
                    ))}
                    {typeof eventRentalFee === 'number' && eventRentalFee > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setEventDepositAmount(Math.round(eventRentalFee * 0.5))}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 transition cursor-pointer"
                        >
                          50% (฿{Math.round(eventRentalFee * 0.5).toLocaleString()})
                        </button>
                        <button
                          type="button"
                          onClick={() => setEventDepositAmount(eventRentalFee)}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-900 transition cursor-pointer"
                        >
                          เต็มจำนวน (฿{eventRentalFee.toLocaleString()})
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Deposit Slip Image Attachment */}
                <div className="pt-2 border-t border-amber-300/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-stone-950 font-black flex items-center gap-1.5 text-xs">
                      <ImageIcon className="w-4 h-4 text-amber-700" />
                      <span>หลักฐานการโอนเงินมัดจำ (สลิป / เอกสาร)</span>
                    </label>
                    {eventDepositSlipUrl && (
                      <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> แนบสลิปแล้ว
                      </span>
                    )}
                  </div>

                  {eventDepositSlipUrl ? (
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-stone-300 shadow-2xs">
                      <img
                        src={eventDepositSlipUrl}
                        alt="สลิปมัดจำ"
                        onClick={() => setPreviewSlipModalUrl(eventDepositSlipUrl)}
                        className="w-14 h-14 object-cover rounded-lg border border-amber-300 shadow-xs cursor-pointer hover:scale-105 transition"
                        title="คลิกเพื่อดูรูปขนาดเต็ม"
                      />
                      <div className="flex-1 space-y-1">
                        <p className="text-[11px] font-black text-stone-900">แนบสลิปมัดจำเรียบร้อยแล้ว</p>
                        <p className="text-[10px] text-stone-500">คลิกที่รูปเพื่อขยายดูภาพสลิปขนาดเต็ม</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-[10px] rounded-lg border border-amber-300 cursor-pointer transition text-center">
                          เปลี่ยนรูป
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleDepositSlipUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setEventDepositSlipUrl('')}
                          className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-black text-[10px] rounded-lg border border-red-300 transition cursor-pointer"
                        >
                          ลบรูป
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-amber-400 hover:border-amber-600 bg-white hover:bg-amber-50/50 rounded-xl cursor-pointer transition group shadow-2xs">
                      <div className="flex items-center gap-2 text-stone-700 group-hover:text-amber-950 font-black text-xs">
                        <Upload className="w-4 h-4 text-amber-600 group-hover:scale-110 transition" />
                        <span>คลิกเพื่อแนบไฟล์ภาพสลิปมัดจำ หรือถ่ายภาพ</span>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-0.5">รองรับไฟล์รูปภาพ PNG, JPG, JPEG (ระบบปรับขนาดให้อัตโนมัติ)</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDepositSlipUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Section: รูปภาพการติดต่อประสานงานออกบูธ / ผังงาน / แชทไลน์ / นามบัตร (เพิ่ม ลบ แก้ไข ได้) */}
              <div className="bg-indigo-50/90 border-2 border-indigo-300 rounded-3xl p-4 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-indigo-200 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif font-black text-xs sm:text-sm text-indigo-950 flex items-center gap-1.5">
                        <span>รูปภาพการติดต่อประสานงานออกบูธ</span>
                        <span className="bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-full text-[10px] font-sans font-black border border-indigo-300">
                          {eventPhotos.length} / 16 รูป
                        </span>
                      </h4>
                      <p className="text-[10px] text-stone-600">ผังบูธ • แชท LINE • นามบัตร • สัญญาจอง • ใบเสร็จ (เพิ่ม ลบ แก้ไข และสลับลำดับได้)</p>
                    </div>
                  </div>

                  {eventPhotos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('ต้องการลบรูปภาพประสานงานทั้งหมดของงานนี้ใช่หรือไม่?')) {
                          setEventPhotos([]);
                        }
                      }}
                      className="text-[10px] font-black text-rose-700 hover:text-rose-900 bg-rose-100 hover:bg-rose-200 px-2.5 py-1 rounded-xl border border-rose-300 transition cursor-pointer"
                    >
                      ลบทั้งหมด
                    </button>
                  )}
                </div>

                {/* Quick Add Presets by Category */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-black text-indigo-950">
                    <span>➕ คลิกเพื่อเลือกรูปและกำหนดหมวดหมู่:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COORDINATION_CATEGORIES.map((cat) => (
                      <label
                        key={cat.key}
                        className="flex items-center justify-center gap-1.5 p-2 bg-white hover:bg-indigo-100/70 border-2 border-indigo-200 hover:border-indigo-400 rounded-xl cursor-pointer text-xs font-black text-stone-900 shadow-2xs transition"
                      >
                        <span>{cat.icon}</span>
                        <span className="truncate">+ {cat.label.split(' / ')[0]}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            handleCompressAndAddPhotos(e.target.files, setEventPhotos, eventPhotos, cat.key);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Photos List with Full Edit, Replace, Reorder, and Caption */}
                {eventPhotos.length === 0 ? (
                  <div className="bg-white/80 border-2 border-dashed border-indigo-300 rounded-2xl p-5 text-center text-stone-500 space-y-1.5">
                    <p className="text-xs font-bold text-stone-700">ยังไม่มีรูปภาพการติดต่อประสานงานที่แนบไว้</p>
                    <p className="text-[10px] text-stone-500">
                      ท่านสามารถกดเลือกปุ่มด้านบนเพื่อแนบรูปผังบูธ สัญญา หรือนามบัตรผู้จัดงาน เพื่อเก็บไว้ดูย้อนหลังหรือใช้เปิดดูตอนไปจัดหน้าร้านได้ทันที
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {eventPhotos.map((photo, idx) => {
                        const currentCat = COORDINATION_CATEGORIES.find((c) => c.key === photo.category) || COORDINATION_CATEGORIES[0];
                        return (
                          <div
                            key={photo.id}
                            className="bg-white rounded-2xl border-2 border-indigo-200 hover:border-indigo-400 p-2.5 shadow-2xs flex flex-col justify-between gap-2 transition"
                          >
                            <div className="flex gap-2.5">
                              {/* Thumbnail with overlay view button */}
                              <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-100 group">
                                <img
                                  src={photo.url}
                                  alt=""
                                  onClick={() => setPreviewSlipModalUrl(photo.url)}
                                  className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition"
                                />
                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[9px] font-bold">
                                  #{idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setPreviewSlipModalUrl(photo.url)}
                                  className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition"
                                  title="ดูรูปขนาดเต็ม"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                              </div>

                              {/* Form Fields: Category and Caption */}
                              <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                                <div>
                                  <label className="block text-[10px] font-black text-stone-600 mb-0.5">หมวดหมู่รูป:</label>
                                  <select
                                    value={photo.category || 'layout'}
                                    onChange={(e) => {
                                      const newCat = e.target.value as CoordinationPhotoCategory;
                                      setEventPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, category: newCat } : p));
                                    }}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2 py-1 text-xs font-black text-stone-900 focus:outline-none focus:border-indigo-500 cursor-pointer"
                                  >
                                    {COORDINATION_CATEGORIES.map((c) => (
                                      <option key={c.key} value={c.key}>
                                        {c.icon} {c.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-black text-stone-600 mb-0.5">คำอธิบายภาพ (ถ้ามี):</label>
                                  <input
                                    type="text"
                                    value={photo.caption || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEventPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, caption: val } : p));
                                    }}
                                    placeholder="เช่น ล็อก A12 หรือ เบอร์เสริม"
                                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2 py-1 text-xs text-stone-950 font-medium focus:outline-none focus:border-indigo-500"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Card Bottom Actions: Move Left/Right, Replace Image, Delete */}
                            <div className="flex items-center justify-between border-t border-stone-100 pt-1.5 text-[11px]">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    setEventPhotos((prev) => {
                                      if (idx === 0) return prev;
                                      const updated = [...prev];
                                      const temp = updated[idx];
                                      updated[idx] = updated[idx - 1];
                                      updated[idx - 1] = temp;
                                      return updated;
                                    });
                                  }}
                                  className="p-1 rounded-lg border border-stone-200 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed text-stone-700"
                                  title="เลื่อนไปข้างหน้า"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === eventPhotos.length - 1}
                                  onClick={() => {
                                    setEventPhotos((prev) => {
                                      if (idx === prev.length - 1) return prev;
                                      const updated = [...prev];
                                      const temp = updated[idx];
                                      updated[idx] = updated[idx + 1];
                                      updated[idx + 1] = temp;
                                      return updated;
                                    });
                                  }}
                                  className="p-1 rounded-lg border border-stone-200 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed text-stone-700"
                                  title="เลื่อนไปข้างหลัง"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                                <span className="text-[10px] text-stone-400 font-mono">#{idx + 1}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Replace Photo Input Button */}
                                <label className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold border border-stone-300 flex items-center gap-1 cursor-pointer text-[10px] transition">
                                  <RefreshCw className="w-2.5 h-2.5 text-stone-600" />
                                  <span>เปลี่ยนรูป</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleCompressAndReplacePhoto(photo.id, file, setEventPhotos);
                                      }
                                      e.target.value = '';
                                    }}
                                    className="hidden"
                                  />
                                </label>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEventPhotos((prev) => prev.filter((p) => p.id !== photo.id));
                                  }}
                                  className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer"
                                  title="ลบรูปนี้"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Section: Google Maps Pin Link */}
              <div className="bg-sky-50/80 border-2 border-sky-300 rounded-2xl p-3.5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="block text-stone-950 font-black flex items-center gap-1.5 text-xs">
                    <MapPin className="w-4 h-4 text-sky-700" />
                    <span>แผนที่ปักหมุด Google Maps (Optional)</span>
                  </label>
                  {eventGoogleMapsUrl.trim() && (
                    <a
                      href={eventGoogleMapsUrl.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-sky-800 font-extrabold bg-sky-200/90 hover:bg-sky-300 px-2.5 py-0.5 rounded-full border border-sky-300 flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3 h-3 text-sky-700" />
                      <span>ทดสอบเปิดแผนที่</span>
                    </a>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-700 text-sm">
                    🗺️
                  </span>
                  <input
                    type="url"
                    value={eventGoogleMapsUrl}
                    onChange={(e) => setEventGoogleMapsUrl(e.target.value)}
                    placeholder="วางลิงก์ Google Maps เช่น https://maps.app.goo.gl/... หรือ https://goo.gl/maps/..."
                    className="w-full bg-white border-2 border-stone-400 focus:border-sky-500 rounded-xl py-2 pl-9 pr-3 text-stone-950 font-mono font-medium text-xs focus:outline-none shadow-xs"
                  />
                </div>
                <p className="text-[10px] text-stone-500 font-medium">
                  💡 คัดลอกลิงก์แชร์จากแอป Google Maps หรือค้นหาสถานที่แล้วนำลิงก์มาวางได้ทันที เพื่อให้ทีมงานและลูกค้ากดนำทางได้สะดวกรวดเร็ว
                </p>
              </div>

              {/* Section: ข้อมูลผู้จัดงาน / ผู้ประสานงาน (สำหรับติดต่อรอบหน้า & ปีหน้า) */}
              <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl p-3.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="block text-stone-950 font-black flex items-center gap-1.5 text-xs">
                    <span className="text-base">📇</span>
                    <span>ข้อมูลผู้จัดงาน & ผู้ประสานงาน (สำหรับติดต่อจองบูธรอบหน้า / ปีหน้า)</span>
                  </label>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                    บันทึกเก็บไว้เรียกดูได้
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-900 font-black mb-1">
                      ชื่อผู้จัดงาน / ผู้ดูแลพื้นที่ / ฝ่ายจองบูธ
                    </label>
                    <input
                      type="text"
                      value={eventOrganizerName}
                      onChange={(e) => setEventOrganizerName(e.target.value)}
                      placeholder="เช่น คุณฟารีดา (ฝ่ายจองบูธ) หรือ นิติบุคคล"
                      className="w-full bg-white border-2 border-stone-400 focus:border-emerald-500 rounded-xl p-2.5 text-stone-950 font-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-900 font-black mb-1">
                      เบอร์โทรศัพท์ผู้จัดงาน (สำหรับโทรติดต่อ)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">📞</span>
                      <input
                        type="tel"
                        value={eventOrganizerPhone}
                        onChange={(e) => setEventOrganizerPhone(e.target.value)}
                        placeholder="เช่น 081-234-5678"
                        className="w-full bg-white border-2 border-stone-400 focus:border-emerald-500 rounded-xl py-2 pl-8 pr-3 text-stone-950 font-mono font-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-900 font-black mb-1">
                      LINE ID ผู้จัดงาน / ลิงก์ติดต่อ
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">💬</span>
                      <input
                        type="text"
                        value={eventOrganizerLine}
                        onChange={(e) => setEventOrganizerLine(e.target.value)}
                        placeholder="เช่น fareeda_event หรือ @market"
                        className="w-full bg-white border-2 border-stone-400 focus:border-emerald-500 rounded-xl py-2 pl-8 pr-3 text-stone-950 font-medium focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-900 font-black mb-1">
                      เลขล็อก / โซนบูธที่ได้
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">🎪</span>
                      <input
                        type="text"
                        value={eventBoothNumber}
                        onChange={(e) => setEventBoothNumber(e.target.value)}
                        placeholder="เช่น ล็อก A12 หรือ โซนหน้าเวทีกลาง"
                        className="w-full bg-white border-2 border-stone-400 focus:border-emerald-500 rounded-xl py-2 pl-8 pr-3 text-stone-950 font-black focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-stone-500 font-medium">
                  💡 ข้อมูลนี้จะถูกบันทึกเก็บไว้ในระบบอย่างถาวร สามารถกดเรียกดูใน <strong>"สมุดติดต่อผู้จัดงาน"</strong> เพื่อโทรหาหรือทักไลน์จองบูธเดิมซ้ำในปีถัดไปได้ทันที
                </p>
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

              {/* Section: สถานะการออกงาน (Event Status) */}
              <div className="bg-stone-50 border-2 border-stone-300 rounded-2xl p-3.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="block text-stone-950 font-black flex items-center gap-1.5 text-xs">
                    <span>📌 ผลการจองบูธ / สถานะการออกงาน</span>
                  </label>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    eventStatus === 'CANCELLED'
                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                      : eventStatus === 'TRANSFERRED'
                      ? 'bg-purple-100 text-purple-900 border-purple-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    {eventStatus === 'CANCELLED' ? '❌ ไม่ได้งานครั้งนี้ / ล็อกเต็ม' : eventStatus === 'TRANSFERRED' ? '🤝 ปล่อยต่อบูธ' : '✅ ได้งาน / ไปออกบูธ'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setEventStatus(eventStartDate > new Date().toISOString().slice(0, 10) ? 'UPCOMING' : 'ACTIVE')}
                    className={`p-2.5 rounded-xl border-2 font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      eventStatus !== 'CANCELLED' && eventStatus !== 'TRANSFERRED'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <span>✅ ได้งาน / ไปออกบูธ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEventStatus('CANCELLED');
                      if (!eventMissedReason) setEventMissedReason('ล็อกเต็ม / จองไม่ทัน');
                    }}
                    className={`p-2.5 rounded-xl border-2 font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      eventStatus === 'CANCELLED'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    <span>❌ ไม่ได้งานครั้งนี้ / ล็อกเต็ม</span>
                  </button>
                </div>

                {eventStatus === 'CANCELLED' && (
                  <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-3 space-y-2 mt-2">
                    <label className="block text-rose-950 font-black text-xs">
                      ระบุเหตุผลที่ไม่ได้งานนี้ (เพื่อเก็บบันทึกประวัติและเปรียบเทียบในอนาคต):
                    </label>
                    <input
                      type="text"
                      value={eventMissedReason}
                      onChange={(e) => setEventMissedReason(e.target.value)}
                      placeholder="เช่น ล็อกเต็ม / จองไม่ทัน, ไม่ผ่านการคัดเลือก, ค่าที่สูงเกินไป"
                      className="w-full bg-white border-2 border-rose-300 focus:border-rose-500 rounded-xl p-2 text-stone-950 font-black text-xs focus:outline-none"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] font-black text-rose-800 shrink-0">ตัวเลือกด่วน:</span>
                      {[
                        'ล็อกเต็ม / จองไม่ทัน',
                        'ไม่ผ่านการคัดเลือก',
                        'สละสิทธิ์ / ติดงานอื่น',
                        'ค่าที่/ค่าบูธสูงเกินไป',
                        'ผู้จัดยกเลิก/เลื่อนงาน',
                        'บันทึกข้อมูลผู้จัดไว้ก่อน',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setEventMissedReason(preset)}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-rose-800 font-medium pt-0.5">
                      💡 ข้อมูลผู้จัดงาน (ชื่อ, เบอร์โทร, LINE ID) จะยังคงถูกบันทึกเก็บไว้ใน <strong>&quot;สมุดติดต่อผู้จัดงาน&quot;</strong> อย่างถาวร เพื่อให้โทรหรือทักจองในรอบถัดไปได้ทันที!
                    </p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 border-t-2 border-amber-300 flex items-center justify-end gap-2 shrink-0 z-10">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 border border-stone-300 text-stone-950 font-black rounded-xl hover:bg-stone-200 cursor-pointer text-xs"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl shadow-md border border-amber-500 cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-stone-950" />
                  <span>{editingScheduleId ? 'บันทึกการแก้ไขตารางงาน' : 'บันทึกตารางออกงาน'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TRANSFER BOOTH / SUBLET MODAL (บันทึกการส่งต่อ / ปล่อยต่อบูธให้คนอื่น) */}
      {transferModalSchedule && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="relative bg-white border-2 border-purple-500 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col text-stone-950 shadow-2xl text-left overflow-hidden">
            <div className="flex justify-between items-center border-b-2 border-purple-200 p-4 sm:p-5 shrink-0 bg-purple-50/70 z-10 gap-2">
              <div>
                <span className="text-[10px] font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-300">
                  {transferModalSchedule.branchName}
                </span>
                <h3 className="font-serif font-black text-base sm:text-lg text-purple-950 flex items-center gap-2 mt-1">
                  <ArrowRightLeft className="w-5 h-5 text-purple-700 shrink-0" />
                  <span>บันทึกการปล่อยต่อ / โอนสิทธิ์ออกบูธ</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTransferModalSchedule(null)}
                className="text-stone-700 hover:text-stone-950 p-1.5 rounded-full border border-stone-300 hover:bg-stone-100 transition shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-200 space-y-1">
                <h4 className="font-black text-purple-950 text-sm">{transferModalSchedule.title}</h4>
                <p className="text-stone-600 font-mono text-[11px]">
                  📅 วันที่: {formatThaiDMY(transferModalSchedule.startDate)}
                  {transferModalSchedule.startDate !== transferModalSchedule.endDate && ` ถึง ${formatThaiDMY(transferModalSchedule.endDate)}`}
                </p>
                <p className="text-stone-600 text-[11px]">📍 สถานที่: {transferModalSchedule.location}</p>
                <div className="flex items-center gap-3 pt-1 text-[11px] font-bold text-stone-700">
                  <span>🎪 ค่าเช่าบูธเดิม: ฿{transferModalSchedule.rentalFee ? transferModalSchedule.rentalFee.toLocaleString() : '0'}</span>
                  {transferModalSchedule.travelExpense ? (
                    <span>🚗 ค่าเดินทางเดิม: ฿{transferModalSchedule.travelExpense.toLocaleString()}</span>
                  ) : null}
                </div>
              </div>

              <form onSubmit={handleSaveTransfer} className="space-y-3.5">
                <div>
                  <label className="block text-stone-950 font-black mb-1">
                    👤 ชื่อผู้รับต่อบูธ / ชื่อร้านค้าที่รับช่วงต่อ <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transfereeName}
                    onChange={(e) => setTransfereeName(e.target.value)}
                    placeholder="เช่น ร้านคุณดาว เสื้อผ้าแฟชั่น, ร้านนายฮาซัน"
                    className="w-full bg-white border-2 border-stone-400 focus:border-purple-500 rounded-xl p-2.5 text-stone-950 font-bold text-xs focus:outline-none shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-950 font-black mb-1">
                      📞 เบอร์โทรศัพท์ของผู้รับต่อ
                    </label>
                    <input
                      type="tel"
                      value={transfereePhone}
                      onChange={(e) => setTransfereePhone(e.target.value)}
                      placeholder="เช่น 081-234-5678"
                      className="w-full bg-white border-2 border-stone-400 focus:border-purple-500 rounded-xl p-2.5 text-stone-950 font-mono font-bold text-xs focus:outline-none shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-950 font-black mb-1">
                      💰 เงินที่ปล่อยต่อได้ / ยอดเงินชดเชย (บาท)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-serif font-black text-purple-800 text-sm">฿</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={transferPrice}
                        onChange={(e) => setTransferPrice(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))}
                        placeholder="เช่น 1500"
                        className="w-full bg-white border-2 border-stone-400 focus:border-purple-500 rounded-xl py-2.5 pl-8 pr-3 text-stone-950 font-mono font-black text-xs focus:outline-none shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-950 font-black mb-1">
                    📅 วันที่ปล่อยต่อ
                  </label>
                  <input
                    type="date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full bg-white border-2 border-stone-400 focus:border-purple-500 rounded-xl p-2.5 text-stone-950 font-mono font-bold text-xs focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-950 font-black mb-1">
                    📝 หมายเหตุการปล่อยต่อ
                  </label>
                  <textarea
                    rows={2}
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    placeholder="เช่น โอนเงินมัดจำมาแล้ว 500 บาท รอจ่ายวันงานอีก 1,000 บาท"
                    className="w-full bg-white border-2 border-stone-400 focus:border-purple-500 rounded-xl p-2.5 text-stone-950 font-bold text-xs focus:outline-none shadow-xs resize-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-950 font-black mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-purple-700" />
                      <span>แนบสลิป/หลักฐานการโอนเงิน (ถ้ามี)</span>
                    </span>
                    {transferSlipUrl && (
                      <button
                        type="button"
                        onClick={() => setTransferSlipUrl('')}
                        className="text-[10px] text-red-600 hover:text-red-800 font-bold"
                      >
                        ลบรูปสลิป
                      </button>
                    )}
                  </label>
                  {transferSlipUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border-2 border-purple-300 w-24 h-24">
                      <img src={transferSlipUrl} alt="สลิปโอนเงินปล่อยต่อ" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressSlipSafely(file);
                            if (compressed) setTransferSlipUrl(compressed);
                          } catch (err) {
                            console.error('Transfer slip compression error:', err);
                          }
                        }
                      }}
                      className="w-full text-xs text-stone-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-purple-100 file:text-purple-900 hover:file:bg-purple-200 cursor-pointer"
                    />
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-200">
                  <button
                    type="button"
                    onClick={() => setTransferModalSchedule(null)}
                    className="px-4 py-2 bg-stone-100 border border-stone-300 text-stone-900 font-black rounded-xl hover:bg-stone-200 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>บันทึกการปล่อยต่อบูธ</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ORGANIZER & VENUE DIRECTORY MODAL (สมุดรายชื่อผู้จัดงาน & ประวัติติดต่อออกบูธ) */}
      {isOrganizerDirectoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="relative bg-white border-2 border-emerald-500 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col text-stone-950 shadow-2xl text-left overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-emerald-200 p-4 sm:p-5 shrink-0 bg-emerald-50/80 z-10 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <BookUser className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base sm:text-lg text-emerald-950 flex items-center gap-2">
                    <span>สมุดรายชื่อผู้จัดงาน & ประวัติติดต่อออกบูธ</span>
                    <span className="text-[10px] font-sans font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-400">
                      {organizerDirectoryList.length} รายการ
                    </span>
                  </h3>
                  <p className="text-[11px] text-stone-600 font-medium">
                    บันทึกประวัติสถานที่ ผู้จัดงาน เบอร์ติดต่อ และค่าใช้จ่าย สำหรับโทรจองบูธในครั้งถัดไปหรือปีหน้า (รวมงานที่ไม่ได้บูธ)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsOrganizerDirectoryOpen(false);
                    handleOpenAddModal(undefined, {
                      title: 'งานที่ติดต่อไว้ (บันทึกผู้จัดงาน)',
                      status: 'CANCELLED',
                      missedReason: 'บันทึกข้อมูลผู้จัดงานไว้ล่วงหน้า (ไม่ได้งานรอบนี้)',
                    });
                  }}
                  className="hidden sm:flex px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-xs items-center gap-1.5 text-xs cursor-pointer"
                  title="บันทึกข้อมูลผู้จัดงานที่ติดต่อไว้ แม้รอบนี้จะไม่ได้ไปออกงาน เพื่อเก็บเบอร์ไว้โทรจองปีหน้า"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ บันทึกผู้จัดงาน (แม้ไม่ได้งาน)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOrganizerDirectoryOpen(false)}
                  className="text-stone-700 hover:text-stone-950 p-1.5 rounded-full border border-stone-300 hover:bg-stone-100 transition shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="p-3 sm:p-4 bg-stone-50 border-b border-emerald-100 flex flex-col sm:flex-row gap-2.5 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={directorySearchQuery}
                  onChange={(e) => setDirectorySearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อสถานที่, ชื่องาน, ชื่อผู้จัด, เบอร์โทร, หรือล็อก..."
                  className="w-full bg-white border-2 border-stone-300 focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-stone-950 font-black text-xs focus:outline-none"
                />
                {directorySearchQuery && (
                  <button
                    onClick={() => setDirectorySearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-stone-700 shrink-0">ปี:</span>
                <select
                  value={directorySelectedYear}
                  onChange={(e) => setDirectorySelectedYear(e.target.value)}
                  className="bg-white border-2 border-emerald-400 rounded-xl px-3 py-2 text-xs font-black text-stone-900 focus:outline-none cursor-pointer"
                >
                  <option value="all">ทุกปี (ทั้งหมด)</option>
                  {availableDirectoryYears.map((yr) => (
                    <option key={yr} value={yr}>
                      ปี พ.ศ. {parseInt(yr, 10) + 543} ({yr})
                    </option>
                  ))}
                </select>
              </div>

              {/* Attendance Filter Tabs */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-300 shrink-0">
                <button
                  type="button"
                  onClick={() => setDirectoryStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                    directoryStatusFilter === 'all'
                      ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => setDirectoryStatusFilter('attended')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                    directoryStatusFilter === 'attended'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                >
                  ✅ ได้ไปออกบูธ
                </button>
                <button
                  type="button"
                  onClick={() => setDirectoryStatusFilter('missed')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                    directoryStatusFilter === 'missed'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                >
                  ❌ ไม่ได้งาน ({schedules.filter((s) => s.status === 'CANCELLED').length})
                </button>
              </div>
            </div>

            {/* Directory Cards List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1 text-xs">
              {organizerDirectoryList.length === 0 ? (
                <div className="text-center py-12 px-4 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center mx-auto text-xl">
                    📇
                  </div>
                  <h4 className="font-serif font-black text-stone-800 text-sm">
                    {directorySearchQuery || directorySelectedYear !== 'all'
                      ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'
                      : 'ยังไม่มีข้อมูลประวัติผู้จัดงานในระบบ'}
                  </h4>
                  <p className="text-stone-500 text-xs max-w-md mx-auto">
                    เมื่อท่านบันทึกตารางออกงานพร้อมข้อมูลผู้จัดงาน ระบบจะรวบรวมรายชื่อ สถานที่ และเบอร์โทรศัพท์ไว้ที่นี่อัตโนมัติ เพื่อให้ค้นหาและติดต่อโทรจองบูธในปีหน้าได้อย่างสะดวกรวดเร็ว
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOrganizerDirectoryOpen(false);
                        handleOpenAddModal();
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ บันทึกตารางงานใหม่</span>
                    </button>
                  </div>
                </div>
              ) : (
                organizerDirectoryList.map((entry) => {
                  const yearBE = parseInt(entry.startDate.slice(0, 4), 10) + 543;
                  return (
                    <div
                      key={entry.id}
                      className="p-4 bg-white rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 shadow-sm space-y-3 transition"
                    >
                      {/* Top Bar: Title & Year/Date badge */}
                      <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-950 font-black text-[10px] border border-emerald-300">
                              ปี พ.ศ. {yearBE}
                            </span>
                            <span className="text-[11px] font-mono text-stone-500 font-bold">
                              {formatThaiDMY(entry.startDate)} {entry.startDate !== entry.endDate && ` - ${formatThaiDMY(entry.endDate)}`}
                            </span>
                            {entry.boothNumber && (
                              <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-950 font-black text-[10px] border border-amber-300">
                                🎪 ล็อก: {entry.boothNumber}
                              </span>
                            )}
                            {entry.status === 'CANCELLED' && (
                              <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-900 font-black text-[10px] border border-rose-300 flex items-center gap-1">
                                <span>❌ ไม่ได้งานรอบนี้</span>
                                {entry.missedReason && <span className="font-normal font-sans">({entry.missedReason})</span>}
                              </span>
                            )}
                          </div>
                          <h4 className="font-serif font-black text-stone-950 text-base mt-1">
                            {entry.title}
                          </h4>
                          <div className="flex items-center gap-2 text-stone-600 text-[11px] font-bold mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-stone-500" />
                              <span>{entry.location}</span>
                            </span>
                            {entry.googleMapsUrl && (
                              <a
                                href={entry.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-700 underline hover:text-sky-900 inline-flex items-center gap-0.5 text-[10px]"
                              >
                                🗺️ ดูแผนที่
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <button
                            type="button"
                            onClick={() => handleRebookFromDirectory(entry)}
                            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl border border-amber-500 shadow-xs flex items-center gap-1 cursor-pointer text-xs hover:scale-105 transition"
                            title="นำข้อมูลสถานที่ ผู้จัดงาน และค่าเช่า มาใช้สร้างตารางงานใหม่ในปีหน้าทันที"
                          >
                            <span>➕</span>
                            <span>จองรอบใหม่จากที่นี่</span>
                          </button>
                        </div>
                      </div>

                      {/* Organizer Details & Actions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Organizer Contact Card */}
                        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 space-y-1.5">
                          <div className="text-[10px] font-black text-emerald-900 flex items-center gap-1">
                            <span>📇 ข้อมูลผู้ติดต่อ/ผู้จัดงาน:</span>
                          </div>
                          {entry.organizerName ? (
                            <p className="text-xs font-black text-stone-900">
                              {entry.organizerName}
                            </p>
                          ) : (
                            <p className="text-xs text-stone-400 italic">
                              ไม่ได้ระบุชื่อผู้จัดงาน
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {(entry.organizerPhone || entry.organizerContact) && (
                              <a
                                href={`tel:${(entry.organizerPhone || entry.organizerContact || '').replace(/[^0-9+]/g, '')}`}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg flex items-center gap-1 shadow-2xs transition"
                              >
                                <Phone className="w-3 h-3" />
                                <span>โทร {entry.organizerPhone || entry.organizerContact}</span>
                              </a>
                            )}
                            {entry.organizerLine && (
                              <a
                                href={`https://line.me/R/ti/p/~${entry.organizerLine}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white font-black text-xs rounded-lg flex items-center gap-1 shadow-2xs transition"
                              >
                                <span>💬 LINE: {entry.organizerLine}</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Historical Financials / Reference */}
                        {entry.status === 'CANCELLED' ? (
                          <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200 space-y-1 text-[11px]">
                            <span className="text-[10px] font-black text-rose-900 block">
                              📌 ข้อมูลบันทึก (รอบที่ไม่ได้งาน):
                            </span>
                            <div className="flex justify-between text-stone-700">
                              <span>สถานะรอบนั้น:</span>
                              <span className="font-black text-rose-700">ไม่ได้งาน / สละสิทธิ์</span>
                            </div>
                            {entry.missedReason && (
                              <div className="flex justify-between text-stone-700">
                                <span>เหตุผล:</span>
                                <strong className="text-rose-950">{entry.missedReason}</strong>
                              </div>
                            )}
                            {entry.rentalFee ? (
                              <div className="flex justify-between text-stone-700">
                                <span>ค่าเช่าที่สอบถามไว้:</span>
                                <span className="font-mono font-bold text-amber-950">฿{entry.rentalFee.toLocaleString()}</span>
                              </div>
                            ) : null}
                            <p className="text-[10px] text-stone-500 pt-0.5 border-t border-rose-200/60">
                              💡 สามารถกด &quot;จองรอบใหม่จากที่นี่&quot; เพื่อใช้ข้อมูลนี้โทรจองในปีถัดไปได้ทันที
                            </p>
                          </div>
                        ) : (
                          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 space-y-1 text-[11px]">
                            <span className="text-[10px] font-black text-amber-900 block">
                              📊 ข้อมูลอ้างอิงรอบที่แล้ว (สำหรับเปรียบเทียบ):
                            </span>
                          <div className="flex justify-between text-stone-700">
                            <span>ค่าเช่าบูธ:</span>
                            <span className="font-mono font-bold text-amber-950">
                              {entry.rentalFee ? `฿${entry.rentalFee.toLocaleString()}` : 'ฟรี / ไม่ระบุ'}
                            </span>
                          </div>
                          {entry.travelExpense ? (
                            <div className="flex justify-between text-stone-700">
                              <span>ค่าเดินทาง/น้ำมัน:</span>
                              <span className="font-mono font-bold text-stone-900">
                                ฿{entry.travelExpense.toLocaleString()}
                              </span>
                            </div>
                          ) : null}
                          <div className="flex justify-between text-stone-500 text-[10px] pt-0.5 border-t border-amber-200/60">
                            <span>เวลาเปิด-ปิด:</span>
                            <span>{entry.operatingHours}</span>
                          </div>
                        </div>
                        )}

                        {/* Attached Coordination Photos Thumbnail Strip in Organizer Directory */}
                        {(() => {
                          const photos = getNormalizedCoordinationPhotos(entry);
                          return (
                            <div className="col-span-1 sm:col-span-2 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-200 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-indigo-950 flex items-center gap-1">
                                  <ImageIcon className="w-3.5 h-3.5 text-indigo-700" />
                                  <span>📸 รูปภาพประสานงาน / ผังบูธ / นามบัตร ({photos.length} รูป):</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenPhotoManager(entry)}
                                  className="text-[10px] font-bold text-indigo-800 hover:text-indigo-950 underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                  <span>จัดการรูปภาพ</span>
                                </button>
                              </div>
                              {photos.length > 0 && (
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                                  {photos.map((p, i) => {
                                    const catInfo = COORDINATION_CATEGORIES.find((c) => c.key === p.category) || COORDINATION_CATEGORIES[0];
                                    return (
                                      <div
                                        key={p.id || i}
                                        onClick={() => setPreviewSlipModalUrl(p.url)}
                                        className="relative group shrink-0 cursor-pointer"
                                      >
                                        <img
                                          src={p.url}
                                          alt={p.caption || ''}
                                          className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-300 group-hover:scale-105 transition shadow-2xs bg-white"
                                          title={p.caption ? `${catInfo.label}: ${p.caption}` : catInfo.label}
                                        />
                                        <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/75 text-white text-[8px] font-black">
                                          {catInfo.icon}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm p-4 border-t-2 border-emerald-200 flex items-center justify-between gap-2 shrink-0 z-10">
              <span className="text-[11px] text-stone-500 font-medium">
                💡 ข้อมูลทั้งหมดจัดเก็บในเครื่องและคลาวด์ พร้อมเรียกดูได้ตลอดเวลา
              </span>
              <button
                type="button"
                onClick={() => setIsOrganizerDirectoryOpen(false)}
                className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-950 font-black rounded-xl border border-stone-300 cursor-pointer text-xs"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: COORDINATION PHOTO MANAGER MODAL (หน้าต่างจัดการรูปภาพประสานงาน: เพิ่ม ลบ แก้ไข) */}
      {photoManagerSchedule && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="relative bg-white border-2 border-indigo-500 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col text-stone-950 shadow-2xl text-left overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-indigo-200 p-4 sm:p-5 shrink-0 bg-indigo-50/90 z-10 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base sm:text-lg text-indigo-950 flex items-center gap-2">
                    <span>จัดการรูปภาพการติดต่อประสานงานออกบูธ</span>
                    <span className="text-[10px] font-sans font-black bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-full border border-indigo-400">
                      {managerPhotos.length} รูป
                    </span>
                  </h3>
                  <p className="text-[11px] text-stone-600 font-bold truncate max-w-md">
                    งาน: {photoManagerSchedule.title} ({formatThaiDMY(photoManagerSchedule.startDate)})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPhotoManagerSchedule(null)}
                className="text-stone-700 hover:text-stone-950 p-1.5 rounded-full border border-stone-300 hover:bg-stone-100 transition shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Add New Photos Toolbar */}
              <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-200 space-y-2">
                <span className="text-xs font-black text-indigo-950 block">➕ เพิ่มรูปภาพใหม่เข้าสู่งานนี้ (เลือกหมวดหมู่เพื่ออัปโหลด):</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COORDINATION_CATEGORIES.map((cat) => (
                    <label
                      key={cat.key}
                      className="flex items-center justify-center gap-1.5 p-2 bg-white hover:bg-indigo-100/70 border-2 border-indigo-300 hover:border-indigo-500 rounded-xl cursor-pointer text-xs font-black text-stone-900 shadow-2xs transition"
                    >
                      <span>{cat.icon}</span>
                      <span className="truncate">+ {cat.label.split(' / ')[0]}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          handleCompressAndAddPhotos(e.target.files, setManagerPhotos, managerPhotos, cat.key);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Photos List */}
              {managerPhotos.length === 0 ? (
                <div className="text-center py-10 px-4 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300 space-y-2">
                  <div className="text-3xl">📸</div>
                  <h4 className="font-serif font-black text-stone-800 text-sm">ยังไม่มีรูปภาพประสานงานในงานนี้</h4>
                  <p className="text-stone-500 text-xs max-w-sm mx-auto">
                    คลิกเลือกหมวดหมู่ด้านบนเพื่อถ่ายภาพหรือแนบรูปผังบูธ สัญญา หรือนามบัตรผู้จัดงาน
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {managerPhotos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className="bg-white rounded-2xl border-2 border-indigo-200 p-3 shadow-xs space-y-2.5 transition hover:border-indigo-400"
                    >
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-100 group">
                          <img
                            src={photo.url}
                            alt=""
                            onClick={() => setPreviewSlipModalUrl(photo.url)}
                            className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition"
                          />
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-white font-mono text-[9px] font-bold">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPreviewSlipModalUrl(photo.url)}
                            className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                            title="ดูรูปขนาดเต็ม"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Fields */}
                        <div className="flex-1 min-w-0 space-y-2 text-xs">
                          <div>
                            <label className="block text-[10px] font-black text-stone-600 mb-0.5">หมวดหมู่รูปภาพ:</label>
                            <select
                              value={photo.category || 'layout'}
                              onChange={(e) => {
                                const newCat = e.target.value as CoordinationPhotoCategory;
                                setManagerPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, category: newCat } : p));
                              }}
                              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-black text-stone-900 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                              {COORDINATION_CATEGORIES.map((c) => (
                                <option key={c.key} value={c.key}>
                                  {c.icon} {c.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-stone-600 mb-0.5">คำอธิบายภาพ / บันทึกช่วยจำ:</label>
                            <input
                              type="text"
                              value={photo.caption || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setManagerPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, caption: val } : p));
                              }}
                              placeholder="เช่น แชทตกลงค่าไฟเพิ่ม 200, ผังบูธล็อก A12"
                              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-stone-950 font-medium focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Controls */}
                      <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => {
                              setManagerPhotos((prev) => {
                                if (idx === 0) return prev;
                                const updated = [...prev];
                                const temp = updated[idx];
                                updated[idx] = updated[idx - 1];
                                updated[idx - 1] = temp;
                                return updated;
                              });
                            }}
                            className="px-2 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed text-stone-700 font-bold flex items-center gap-1 cursor-pointer"
                            title="สลับไปรูปก่อนหน้า"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>เลื่อนขึ้น</span>
                          </button>
                          <button
                            type="button"
                            disabled={idx === managerPhotos.length - 1}
                            onClick={() => {
                              setManagerPhotos((prev) => {
                                if (idx === prev.length - 1) return prev;
                                const updated = [...prev];
                                const temp = updated[idx];
                                updated[idx] = updated[idx + 1];
                                updated[idx + 1] = temp;
                                return updated;
                              });
                            }}
                            className="px-2 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed text-stone-700 font-bold flex items-center gap-1 cursor-pointer"
                            title="สลับไปรูปถัดไป"
                          >
                            <span>เลื่อนลง</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Replace Photo Button */}
                          <label className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-black border border-stone-300 flex items-center gap-1 cursor-pointer text-xs transition">
                            <RefreshCw className="w-3 h-3 text-stone-600" />
                            <span>เปลี่ยนรูปใหม่</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleCompressAndReplacePhoto(photo.id, file, setManagerPhotos);
                                }
                                e.target.value = '';
                              }}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              setManagerPhotos((prev) => prev.filter((p) => p.id !== photo.id));
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-black border border-rose-200 flex items-center gap-1 cursor-pointer"
                            title="ลบรูปนี้"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>ลบ</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t-2 border-indigo-200 bg-white/95 flex items-center justify-between gap-2 shrink-0">
              <span className="text-[11px] text-stone-500 font-bold">
                รวมทั้งหมด: {managerPhotos.length} รูปภาพ
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPhotoManagerSchedule(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-950 font-black rounded-xl border border-stone-300 cursor-pointer text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSavePhotoManager}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-md border-2 border-indigo-700 cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>บันทึกรูปภาพ</span>
                </button>
              </div>
            </div>
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

      {/* FULLSCREEN PREVIEW SLIP MODAL */}
      {previewSlipModalUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewSlipModalUrl(null)}
        >
          <div
            className="relative max-w-lg w-full max-h-[90vh] bg-white p-4 rounded-3xl shadow-2xl flex flex-col items-center cursor-default space-y-3 border-2 border-amber-400"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full border-b-2 border-amber-200 pb-2.5">
              <span className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-700" />
                <span>หลักฐานการโอนเงินมัดจำ (สลิปโอนเงิน)</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewSlipModalUrl(null)}
                className="p-1 rounded-full text-stone-600 hover:text-stone-950 hover:bg-stone-100 cursor-pointer border border-stone-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[72vh] w-full flex justify-center p-2 bg-stone-100 rounded-2xl border border-stone-200">
              <img
                src={previewSlipModalUrl}
                alt="หลักฐานการโอนเงินมัดจำ"
                className="max-h-[68vh] object-contain rounded-xl shadow-md"
              />
            </div>
            <button
              type="button"
              onClick={() => setPreviewSlipModalUrl(null)}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md border border-amber-500 cursor-pointer transition"
            >
              ปิดหน้าต่างรูปภาพ
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
