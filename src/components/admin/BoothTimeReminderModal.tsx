'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock,
  Store,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ChevronRight,
  TrendingUp,
  PackageCheck,
  Minimize2,
  Maximize2,
  Calendar,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { EventSchedule, BoothStockTransfer } from '../../types';
import { soundFx } from '../../lib/soundEffects';

interface BoothTimeReminderModalProps {
  onNavigateTab: (tab: string) => void;
  onOpenPOSWithBooth?: (boothId: string) => void;
}

interface BoothAlert {
  type: 'OPEN' | 'CLOSE';
  schedule: EventSchedule;
  matchingTransfer?: BoothStockTransfer;
  scheduledTimeStr: string;
}

interface ParsedHours {
  openMinutes: number;
  closeMinutes: number;
  openTimeStr: string;
  closeTimeStr: string;
}

function normalizeToCE(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    let y = parseInt(parts[0], 10);
    if (y > 2400) y -= 543;
    return `${y}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }
  return dateStr;
}

function parseOperatingHours(hoursStr: string): ParsedHours | null {
  if (!hoursStr) return null;
  // Supports "8.00-20.00", "08:00 - 20:00 น.", "8:00-20:00", "8 - 20", "08.00 - 20.00"
  const match = hoursStr.match(/(\d{1,2})(?:[:.](\d{1,2}))?\s*[-–—toถึง\s]\s*(\d{1,2})(?:[:.](\d{1,2}))?/);
  if (!match) return null;
  const openH = parseInt(match[1], 10);
  const openM = match[2] ? parseInt(match[2], 10) : 0;
  const closeH = parseInt(match[3], 10);
  const closeM = match[4] ? parseInt(match[4], 10) : 0;

  if (isNaN(openH) || isNaN(closeH) || openH > 24 || closeH > 24) return null;

  return {
    openMinutes: openH * 60 + openM,
    closeMinutes: closeH * 60 + closeM,
    openTimeStr: `${String(openH).padStart(2, '0')}:${String(openM).padStart(2, '0')}`,
    closeTimeStr: `${String(closeH).padStart(2, '0')}:${String(closeM).padStart(2, '0')}`,
  };
}

export const BoothTimeReminderModal: React.FC<BoothTimeReminderModalProps> = ({
  onNavigateTab,
  onOpenPOSWithBooth,
}) => {
  const { eventSchedules, boothTransfers, updateEventSchedule } = useShop();

  const [currentAlert, setCurrentAlert] = useState<BoothAlert | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const currentAlertRef = useRef<BoothAlert | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Timer loop: checks every 15 seconds against local Thailand time
  useEffect(() => {
    const checkScheduleTimes = () => {
      if (typeof window === 'undefined') return;
      if (!Array.isArray(eventSchedules) || eventSchedules.length === 0) return;
      if (currentAlertRef.current) return;

      const now = new Date();
      // Bangkok date string: "YYYY-MM-DD"
      const todayStr = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Bangkok',
      }).format(now);

      // Bangkok hours & minutes
      const bangkokTimeParts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Bangkok',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now).split(':');

      const currentMinutes = parseInt(bangkokTimeParts[0], 10) * 60 + parseInt(bangkokTimeParts[1], 10);

      for (const schedule of eventSchedules) {
        // 1. ข้ามทันทีหากเป็นงานที่เสร็จสิ้นแล้ว หรือเป็นงานที่เซ้ง/ปล่อยต่อบูธไปแล้ว
        if (schedule.status === 'COMPLETED' || schedule.status === 'TRANSFERRED') {
          continue;
        }

        // 2. ตรวจสอบวันที่อย่างเคร่งครัด: วันนี้ต้องอยู่ในช่วงวันที่จัดงาน [startDate ถึง endDate] เท่านั้น
        const sStart = normalizeToCE(schedule.startDate);
        const sEnd = normalizeToCE(schedule.endDate);
        if (todayStr < sStart || todayStr > sEnd) {
          // หากยังไม่ถึงวันที่กำหนด (todayStr < sStart) หรือเลยกำหนดไปแล้ว (todayStr > sEnd) ห้ามแจ้งเตือนเด็ดขาด!
          continue;
        }

        const parsed = parseOperatingHours(schedule.operatingHours);
        if (!parsed) continue;

        const openedKey = `huda_opened_event_${schedule.id}_${todayStr}`;
        const isAlreadyOpenedToday = localStorage.getItem(openedKey) === 'true';

        // 1. Check OPENING Alert
        // Condition: Not yet confirmed opened today
        if (!isAlreadyOpenedToday) {
          const isDuringOpenHours = parsed.closeMinutes > parsed.openMinutes
            ? (currentMinutes >= parsed.openMinutes && currentMinutes < parsed.closeMinutes)
            : (currentMinutes >= parsed.openMinutes || currentMinutes < parsed.closeMinutes);

          if (isDuringOpenHours) {
            const snoozeKey = `huda_snooze_open_${schedule.id}`;
            const snoozeUntil = Number(localStorage.getItem(snoozeKey) || 0);
            const dismissKey = `huda_dismiss_open_${schedule.id}_${todayStr}`;
            const isDismissed = localStorage.getItem(dismissKey) === 'true';

            if (Date.now() >= snoozeUntil && !isDismissed) {
              const matchTransfer = boothTransfers.find(
                (t) => (t.eventId === schedule.id || t.eventName === schedule.title) && t.status !== 'COMPLETED'
              );
              soundFx.playSuccess();
              const newAlert: BoothAlert = {
                type: 'OPEN',
                schedule,
                matchingTransfer: matchTransfer,
                scheduledTimeStr: parsed.openTimeStr,
              };
              currentAlertRef.current = newAlert;
              setCurrentAlert(newAlert);
              setIsMinimized(false);
              return; // Show one alert at a time
            }
          }
        }

        // 2. Check CLOSING Alert
        // Condition: Status is ACTIVE or has been opened today, current time is at or past closing time
        const isEligibleForClose = schedule.status === 'ACTIVE' || isAlreadyOpenedToday;
        if (isEligibleForClose) {
          const isAtOrPastClose = parsed.closeMinutes > parsed.openMinutes
            ? currentMinutes >= parsed.closeMinutes
            : (currentMinutes >= parsed.closeMinutes && currentMinutes < parsed.openMinutes);

          if (isAtOrPastClose) {
            const snoozeKey = `huda_snooze_close_${schedule.id}`;
            const snoozeUntil = Number(localStorage.getItem(snoozeKey) || 0);
            const dismissKey = `huda_dismiss_close_${schedule.id}_${todayStr}`;
            const isDismissed = localStorage.getItem(dismissKey) === 'true';

            if (Date.now() >= snoozeUntil && !isDismissed) {
              const matchTransfer = boothTransfers.find(
                (t) => (t.eventId === schedule.id || t.eventName === schedule.title) && t.status !== 'COMPLETED'
              );
              soundFx.playSuccess();
              const newAlert: BoothAlert = {
                type: 'CLOSE',
                schedule,
                matchingTransfer: matchTransfer,
                scheduledTimeStr: parsed.closeTimeStr,
              };
              currentAlertRef.current = newAlert;
              setCurrentAlert(newAlert);
              setIsMinimized(false);
              return; // Show one alert at a time
            }
          }
        }
      }
    };

    // Initial check
    checkScheduleTimes();

    const interval = setInterval(checkScheduleTimes, 15000);
    return () => clearInterval(interval);
  }, [eventSchedules, boothTransfers]);

  // Action Handlers for OPEN Alert
  const handleConfirmOpen = () => {
    if (!currentAlert) return;
    soundFx.playSuccess();
    const todayStr = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Bangkok' }).format(new Date());
    localStorage.setItem(`huda_opened_event_${currentAlert.schedule.id}_${todayStr}`, 'true');

    const updated: EventSchedule = {
      ...currentAlert.schedule,
      status: 'ACTIVE',
    };
    updateEventSchedule(updated);

    triggerToast(`🟢 เริ่มเปิดขาย "${currentAlert.schedule.title}" เรียบร้อยแล้ว!`);

    // If there is an existing booth transfer, go to POS with it
    if (currentAlert.matchingTransfer && onOpenPOSWithBooth) {
      onOpenPOSWithBooth(currentAlert.matchingTransfer.id);
    } else if (onOpenPOSWithBooth) {
      // Otherwise open POS directly with this event as the selling point!
      onOpenPOSWithBooth(`EVENT_${currentAlert.schedule.id}`);
    } else {
      // Otherwise navigate to POS tab directly
      onNavigateTab('pos');
    }

    currentAlertRef.current = null;
    setCurrentAlert(null);
  };

  const handleSnoozeOpen = (minutes: number = 15) => {
    if (!currentAlert) return;
    soundFx.playClick();
    const snoozeUntil = Date.now() + minutes * 60 * 1000;
    localStorage.setItem(`huda_snooze_open_${currentAlert.schedule.id}`, String(snoozeUntil));
    triggerToast(`⏳ เลื่อนการเตือนเปิดร้านออกไป ${minutes} นาที`);
    currentAlertRef.current = null;
    setCurrentAlert(null);
  };

  const handleDismissOpenToday = () => {
    if (!currentAlert) return;
    soundFx.playClick();
    const todayStr = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Bangkok' }).format(new Date());
    localStorage.setItem(`huda_dismiss_open_${currentAlert.schedule.id}_${todayStr}`, 'true');
    triggerToast(`รับทราบ: ยังไม่เปิดบูธ "${currentAlert.schedule.title}" ในวันนี้`);
    currentAlertRef.current = null;
    setCurrentAlert(null);
  };

  // Action Handlers for CLOSE Alert
  const handleConfirmClose = () => {
    if (!currentAlert) return;
    soundFx.playSuccess();

    // Check if today is the end date, then mark completed
    const todayStr = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Bangkok' }).format(new Date());
    localStorage.setItem(`huda_dismiss_close_${currentAlert.schedule.id}_${todayStr}`, 'true');

    const sEnd = normalizeToCE(currentAlert.schedule.endDate);
    if (sEnd <= todayStr) {
      const updated: EventSchedule = {
        ...currentAlert.schedule,
        status: 'COMPLETED',
      };
      updateEventSchedule(updated);
    }

    triggerToast(`🌙 นำทางไปยังหน้าเบิกของออกบูธ เพื่อตรวจนับของคืนเข้าคลังใหญ่...`);
    onNavigateTab('booth_stock');
    currentAlertRef.current = null;
    setCurrentAlert(null);
  };

  const handleExtendCloseTime = (minutes: number) => {
    if (!currentAlert) return;
    soundFx.playClick();
    const snoozeUntil = Date.now() + minutes * 60 * 1000;
    localStorage.setItem(`huda_snooze_close_${currentAlert.schedule.id}`, String(snoozeUntil));
    const label = minutes >= 60 ? `${minutes / 60} ชั่วโมง` : `${minutes} นาที`;
    triggerToast(`⏱️ ขยายเวลาขายต่ออีก ${label}! ระบบจะแจ้งเตือนปิดร้านอีกครั้งเมื่อครบเวลา`);
    currentAlertRef.current = null;
    setCurrentAlert(null);
  };

  const handleDismissCloseToday = () => {
    if (!currentAlert) return;
    soundFx.playClick();
    const todayStr = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Bangkok' }).format(new Date());
    localStorage.setItem(`huda_dismiss_close_${currentAlert.schedule.id}_${todayStr}`, 'true');
    triggerToast(`รับทราบ: เลื่อนการตรวจนับปิดบูธไว้ดำเนินการภายหลัง`);
    currentAlertRef.current = null;
    setCurrentAlert(null);
  };

  if (!currentAlert) {
    return (
      <>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-950 text-amber-300 border-2 border-amber-400 px-5 py-3 rounded-2xl shadow-2xl font-black text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  const { schedule, matchingTransfer, scheduledTimeStr, type } = currentAlert;

  // Render Minimized Pill
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className={`px-4 py-3 rounded-2xl shadow-2xl border-2 flex items-center gap-2.5 font-black text-xs cursor-pointer transition hover:scale-105 active:scale-95 ${
            type === 'OPEN'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
              : 'bg-stone-950 hover:bg-stone-900 text-amber-300 border-amber-400'
          }`}
        >
          <Clock className="w-4 h-4 animate-bounce" />
          <span>
            {type === 'OPEN'
              ? `⏰ ถึงเวลาเปิดบูธ: ${schedule.title} (${scheduledTimeStr} น.)`
              : `🌙 ถึงเวลาปิดบูธ: ${schedule.title} (${scheduledTimeStr} น.)`}
          </span>
          <Maximize2 className="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`relative bg-white border-2 rounded-3xl max-w-lg w-full text-stone-950 shadow-2xl text-left overflow-hidden ${
          type === 'OPEN' ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 'border-amber-500 ring-4 ring-amber-500/20'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 sm:p-5 border-b-2 text-stone-950 ${
            type === 'OPEN'
              ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 border-emerald-600 text-white'
              : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 border-amber-400 text-stone-950'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                type === 'OPEN' ? 'bg-white text-emerald-700' : 'bg-stone-950 text-amber-300'
              }`}
            >
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/15">
                {type === 'OPEN' ? '⏰ แจ้งเตือนเวลาเปิดบูธ' : '🌙 แจ้งเตือนเวลาปิดบูธ'}
              </span>
              <h3 className="font-serif font-black text-lg sm:text-xl leading-tight mt-0.5">
                {type === 'OPEN' ? 'ได้เวลาเปิดร้านออกบูธแล้ว!' : 'ได้เวลาปิดร้าน & สรุปยอดขาย!'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-xl hover:bg-black/10 transition cursor-pointer"
              title="ย่อการแจ้งเตือนไว้มุมจอ"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => (type === 'OPEN' ? handleDismissOpenToday() : handleDismissCloseToday())}
              className="p-1.5 rounded-xl hover:bg-black/10 transition cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-stone-950">
          {/* Event Details Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-serif font-black text-base text-stone-950">{schedule.title}</h4>
                <p className="text-xs font-bold text-amber-900 mt-0.5">
                  🎪 {schedule.branchName || 'สาขาออกบูธ'} • 📍 {schedule.location}
                </p>
              </div>
              <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-amber-100 text-amber-950 border border-amber-300 shrink-0">
                ⏰ {schedule.operatingHours}
              </span>
            </div>

            {/* Sales Stats for Closing */}
            {type === 'CLOSE' && matchingTransfer && (
              <div className="pt-2.5 border-t border-stone-200 grid grid-cols-2 gap-2 text-center">
                <div className="bg-white p-2 rounded-xl border border-stone-200">
                  <div className="text-[10px] font-bold text-stone-500">ยอดขายรวมจากบูธนี้</div>
                  <div className="text-base font-serif font-black text-emerald-700">
                    ฿{(matchingTransfer.totalSalesAmount || 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-stone-200">
                  <div className="text-[10px] font-bold text-stone-500">ขายได้แล้ว / ของคงเหลือ</div>
                  <div className="text-base font-serif font-black text-amber-900">
                    {matchingTransfer.totalSoldQty || 0} /{' '}
                    {matchingTransfer.totalDispatchedQty - (matchingTransfer.totalSoldQty || 0)} ชิ้น
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contextual Question */}
          <div className="text-center py-1">
            <p className="text-sm font-black text-stone-800">
              {type === 'OPEN'
                ? `ถึงเวลา ${scheduledTimeStr} น. ตามตารางที่ลงไว้ ต้องการเริ่มเปิดระบบขายหน้าร้านเลยหรือไม่?`
                : `ถึงเวลา ${scheduledTimeStr} น. ตามตารางปิดร้าน ต้องการตรวจรับของคืนเข้าคลังใหญ่ หรือต้องการขยายเวลาขายต่อ?`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {type === 'OPEN' ? (
              <>
                <button
                  type="button"
                  onClick={handleConfirmOpen}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-lg border-2 border-emerald-700 flex items-center justify-center gap-2 transition cursor-pointer hover:scale-101 active:scale-98"
                >
                  <Store className="w-4 h-4" />
                  <span>🟢 เริ่มเปิดขายหน้าร้านทันที (เข้าสู่ระบบ POS)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSnoozeOpen(15)}
                    className="py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-xs rounded-xl border border-amber-300 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>⏳ ขอเวลาจัดร้านอีก 15 นาที</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDismissOpenToday}
                    className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl border border-stone-300 transition cursor-pointer"
                  >
                    ยังไม่เปิดวันนี้
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleConfirmClose}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-sm rounded-2xl shadow-lg border-2 border-amber-600 flex items-center justify-center gap-2 transition cursor-pointer hover:scale-101 active:scale-98"
                >
                  <PackageCheck className="w-4 h-4 text-stone-950" />
                  <span>📦 ปิดบูธ &amp; ตรวจรับของคืนเข้าคลังใหญ่</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleExtendCloseTime(30)}
                    className="py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-950 font-black text-xs rounded-xl border border-blue-300 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>⏱️ ขยายเวลาขายต่อ +30 นาที</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExtendCloseTime(60)}
                    className="py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-950 font-black text-xs rounded-xl border border-purple-300 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>⏱️ ขยายเวลาขายต่อ +1 ชม.</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDismissCloseToday}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs rounded-xl transition cursor-pointer text-center"
                >
                  ไว้ตรวจนับสต๊อกพรุ่งนี้เช้า
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
