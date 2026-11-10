'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Copy, Check, Edit2, Trash2, Plus, X, ChevronDown, Sparkles, RefreshCw, BookmarkPlus } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { generateStandardHudaLot } from '../../utils/productUtils';

export interface LotNumberManagerDropdownProps {
  value: string;
  onChange: (val: string) => void;
  standardLot?: string;
  productTitle?: string;
  productId?: string;
  title?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  dropdownDirection?: 'up' | 'down';
  showStandardButton?: boolean;
}

const DEFAULT_LOT_PRESETS = ['HUDA-001-1-69', 'HUDA-A005-1-69', '1-69', '2-69'];

export const LotNumberManagerDropdown: React.FC<LotNumberManagerDropdownProps> = ({
  value,
  onChange,
  standardLot = 'HUDA-001-1-69',
  productTitle,
  productId,
  title = 'เลขล็อต (Lot / Batch):',
  placeholder = 'เช่น HUDA-001-1-69',
  className = '',
  inputClassName = '',
  dropdownDirection = 'up',
  showStandardButton = true,
}) => {
  const { customOptions, saveCustomOption } = useShop();

  const [isOpen, setIsOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [newLotInput, setNewLotInput] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setEditingItem(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Saved Lot Options from CustomOptions / LocalStorage
  const lotOptions = useMemo<string[]>(() => {
    if (customOptions?.lotNumbers && Array.isArray(customOptions.lotNumbers) && customOptions.lotNumbers.length > 0) {
      return customOptions.lotNumbers;
    }
    return DEFAULT_LOT_PRESETS;
  }, [customOptions?.lotNumbers]);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  // Copy to clipboard
  const handleCopy = (textToCopy: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!textToCopy) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedText(textToCopy);
      showFeedback(`✓ คัดลอก "${textToCopy}" แล้ว`);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Add new lot preset
  const handleAddLot = (lotText: string) => {
    const trimmed = lotText.trim();
    if (!trimmed) return;
    if (lotOptions.includes(trimmed)) {
      showFeedback(`ℹ️ "${trimmed}" มีอยู่ในตัวเลือกแล้ว`);
      return;
    }
    const updated = [trimmed, ...lotOptions];
    saveCustomOption('lotNumbers', updated);
    setNewLotInput('');
    showFeedback(`✓ บันทึก "${trimmed}" เป็นตัวเลือกแล้ว`);
  };

  // Quick save active value as preset
  const handleQuickSaveCurrent = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    handleAddLot(trimmed);
  };

  // Edit an existing preset
  const handleStartEdit = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setEditingText(item);
  };

  const handleSaveEdit = (oldItem: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const trimmed = editingText.trim();
    if (!trimmed || trimmed === oldItem) {
      setEditingItem(null);
      return;
    }
    const updated = lotOptions.map((item) => (item === oldItem ? trimmed : item));
    saveCustomOption('lotNumbers', updated);
    if (value === oldItem) {
      onChange(trimmed);
    }
    setEditingItem(null);
    showFeedback(`✓ แก้ไขเป็น "${trimmed}" เรียบร้อย`);
  };

  // Delete a preset
  const handleDelete = (itemToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`คุณต้องการลบเลขล็อต "${itemToDelete}" ออกจากตัวเลือกใช่หรือไม่?`)) {
      const updated = lotOptions.filter((item) => item !== itemToDelete);
      saveCustomOption('lotNumbers', updated);
      showFeedback(`🗑️ ลบ "${itemToDelete}" แล้ว`);
    }
  };

  const isCurrentValueSaved = value.trim() ? lotOptions.includes(value.trim()) : true;

  // Dynamic Standard Lot Calculation:
  // If productTitle or productId is present, compute standard lot as HUDA-[MODEL]-[RUN]-[YEAR]
  // e.g. for "A001ดำเพชรเงิน" and value "2-69" -> "HUDA-A001-2-69"
  const computedStandardLot = useMemo(() => {
    if (productTitle || productId) {
      const cleanVal = (value || '').trim();
      const lotParam = cleanVal ? cleanVal : '1-69';
      return generateStandardHudaLot(productTitle || '', productId || '', lotParam);
    }
    return standardLot || 'HUDA-001-1-69';
  }, [productTitle, productId, value, standardLot]);

  // Check if current value is a short lot format like "2-69", "1-69", "3-69" that can be upgraded to full HUDA-[MODEL]-X-YY
  const showConvertPill = useMemo(() => {
    if (!productTitle && !productId) return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    if (trimmed.toUpperCase().startsWith('HUDA-')) return false;
    return trimmed !== computedStandardLot;
  }, [productTitle, productId, value, computedStandardLot]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-1 gap-1.5 flex-wrap">
        <label className="text-xs font-black text-stone-900 flex items-center gap-1">
          <span>{title}</span>
        </label>

        <div className="flex items-center gap-1.5 flex-wrap">
          {feedbackMsg && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md animate-pulse">
              {feedbackMsg}
            </span>
          )}

          {/* Standard Lot 1-Click Button */}
          {showStandardButton && (
            <button
              type="button"
              onClick={() => {
                onChange(computedStandardLot);
                showFeedback(`✓ ใช้ล็อตมาตรฐาน: ${computedStandardLot}`);
              }}
              className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 transition cursor-pointer flex items-center gap-0.5 shrink-0"
              title={`เปลี่ยนเป็นล็อตมาตรฐาน: ${computedStandardLot}`}
            >
              <RefreshCw className="w-3 h-3 text-emerald-600" />
              <span>ล็อตมาตรฐาน</span>
            </button>
          )}

          {/* Quick Copy Active Value */}
          {value.trim() && (
            <button
              type="button"
              onClick={(e) => handleCopy(value.trim(), e)}
              className="text-[10px] font-bold text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded-md border border-stone-300 transition cursor-pointer flex items-center gap-1 shrink-0"
              title="คัดลอกเลขล็อตปัจจุบัน"
            >
              {copiedText === value.trim() ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-stone-600" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}

          {/* Quick Add / Remember Current Value Button */}
          {value.trim() && !isCurrentValueSaved && (
            <button
              type="button"
              onClick={handleQuickSaveCurrent}
              className="text-[10px] font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 transition cursor-pointer flex items-center gap-1 shrink-0"
              title="บันทึกเลขล็อตนี้ไว้เป็นตัวเลือกในครั้งถัดไป"
            >
              <BookmarkPlus className="w-3 h-3 text-amber-600" />
              <span>+ จำล็อตนี้</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Input Box with Dropdown Toggle */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-1.5 pr-8 bg-white border-2 border-stone-300 focus:border-amber-500 rounded-xl text-stone-950 font-mono font-black text-xs focus:outline-none transition shadow-2xs ${inputClassName}`}
        />

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md transition cursor-pointer"
          title="ดูรายการตัวเลือกเลขล็อตที่บันทึกไว้"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-600' : ''}`} />
        </button>
      </div>

      {/* Smart Quick-Convert Pill for short inputs like "2-69" */}
      {showConvertPill && (
        <div className="mt-1 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              onChange(computedStandardLot);
              showFeedback(`✓ แปลงเป็น "${computedStandardLot}" เรียบร้อย`);
            }}
            className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300 transition cursor-pointer flex items-center gap-1 shadow-2xs"
            title={`คลิกเพื่อแปลงรหัสล็อตสั้น "${value}" เป็นรหัสมาตรฐานสากล "${computedStandardLot}"`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>แปลงเป็น: <strong className="font-mono font-black text-emerald-950">{computedStandardLot}</strong></span>
          </button>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute left-0 right-0 z-50 bg-white border-2 border-amber-400 rounded-2xl shadow-2xl p-2.5 space-y-2 text-stone-900 ${
            dropdownDirection === 'up' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } min-w-[280px] max-w-full`}
        >
          {/* Dropdown Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-stone-200 text-xs font-black">
            <span className="flex items-center gap-1 text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>ตัวเลือกเลขล็อตที่จำไว้ ({lotOptions.length})</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Apply Standard Lot */}
          {computedStandardLot && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-amber-800 block">ล็อตมาตรฐานของสินค้านี้:</span>
                <span className="font-mono font-black text-xs text-amber-950 truncate block">{computedStandardLot}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onChange(computedStandardLot);
                  setIsOpen(false);
                  showFeedback(`✓ ใช้ล็อตมาตรฐาน: ${computedStandardLot}`);
                }}
                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-[11px] rounded-lg shadow-xs cursor-pointer shrink-0 transition"
              >
                เลือกใช้ทันที
              </button>
            </div>
          )}

          {/* List of Remembered Lots */}
          <div className="max-h-48 overflow-y-auto space-y-1 pr-0.5">
            {lotOptions.length === 0 ? (
              <p className="text-[11px] text-stone-500 text-center py-2">ยังไม่มีตัวเลือกเลขล็อตที่บันทึกไว้</p>
            ) : (
              lotOptions.map((lot) => {
                const isSelected = value.trim() === lot.trim();
                const isEditing = editingItem === lot;

                if (isEditing) {
                  return (
                    <div key={lot} className="flex items-center gap-1 p-1 bg-amber-100/80 rounded-lg border border-amber-300">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(lot);
                          if (e.key === 'Escape') setEditingItem(null);
                        }}
                        className="flex-1 px-2 py-0.5 bg-white border border-stone-300 rounded text-xs font-mono font-bold focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={(e) => handleSaveEdit(lot, e)}
                        className="p-1 text-emerald-700 hover:bg-emerald-200 rounded cursor-pointer"
                        title="บันทึกการแก้ไข"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem(null);
                        }}
                        className="p-1 text-stone-500 hover:bg-stone-200 rounded cursor-pointer"
                        title="ยกเลิก"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={lot}
                    onClick={() => {
                      onChange(lot);
                      setIsOpen(false);
                      showFeedback(`✓ เลือกใช้ "${lot}"`);
                    }}
                    className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition text-xs font-mono group ${
                      isSelected
                        ? 'bg-amber-100 border border-amber-400 font-black text-amber-950'
                        : 'hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <span className="truncate flex-1 font-bold">{lot}</span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                      {/* Copy */}
                      <button
                        type="button"
                        onClick={(e) => handleCopy(lot, e)}
                        className="p-1 text-stone-600 hover:text-stone-950 hover:bg-stone-200 rounded cursor-pointer transition"
                        title="คัดลอกเลขล็อตนี้"
                      >
                        {copiedText === lot ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={(e) => handleStartEdit(lot, e)}
                        className="p-1 text-stone-600 hover:text-amber-800 hover:bg-amber-100 rounded cursor-pointer transition"
                        title="แก้ไขชื่อเลขล็อตนี้"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(lot, e)}
                        className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-100 rounded cursor-pointer transition"
                        title="ลบออกจากตัวเลือก"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add New Custom Lot Section */}
          <div className="pt-2 border-t border-stone-200">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newLotInput}
                onChange={(e) => setNewLotInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLot(newLotInput);
                  }
                }}
                placeholder="เพิ่มเลขล็อตใหม่ เช่น HUDA-001-1-69"
                className="flex-1 px-2.5 py-1 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => handleAddLot(newLotInput)}
                disabled={!newLotInput.trim()}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition cursor-pointer shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่ม</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
