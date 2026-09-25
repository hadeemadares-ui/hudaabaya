'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Check, AlertCircle } from 'lucide-react';
import { parseThaiNumberSpeech, isSpeechRecognitionSupported } from '../../utils/speechUtils';

interface VoiceNumberInputProps {
  value: number | string;
  onChange: (val: number) => void;
  placeholder?: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  unitLabel?: string; // e.g. "บาท", "ชิ้น"
}

export const VoiceNumberInput: React.FC<VoiceNumberInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  label,
  min = 0,
  max,
  step = 1,
  className = '',
  inputClassName = '',
  disabled = false,
  unitLabel,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const supported = isSpeechRecognitionSupported();

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const handleStartListening = () => {
    if (disabled) return;

    if (!supported) {
      alert('เบราว์เซอร์ของคุณยังไม่รองรับระบบสั่งการด้วยเสียง กรุณาพิมพ์ตัวเลขโดยตรงครับ');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'th-TH'; // Thai language recognition
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMsg('กำลังฟังเสียง... กรุณาพูดตัวเลข (เช่น 1250 หรือ หกร้อยห้าสิบ)');
        setSpokenText(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');

        setSpokenText(transcript);
        const parsedNum = parseThaiNumberSpeech(transcript);

        if (parsedNum !== null && !isNaN(parsedNum)) {
          const finalVal = Math.max(min, max !== undefined ? Math.min(max, parsedNum) : parsedNum);
          onChange(finalVal);
          setStatusMsg(`ถอดรหัสเสียงสำเร็จ: "${transcript}" ➔ ${finalVal.toLocaleString()} ${unitLabel || ''}`);
        } else {
          setStatusMsg(`กำลังฟัง: "${transcript}"...`);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech Recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setStatusMsg('โปรดอนุญาตสิทธิ์ใช้งานไมโครโฟนเพื่อใช้เสียงพิมพ์ตัวเลขครับ');
        } else if (event.error === 'no-speech') {
          setStatusMsg('ไม่ได้ยินเสียง พูดใหม่อีกครั้งได้เลยครับ');
        } else {
          setStatusMsg('เกิดข้อผิดพลาดในการฟังเสียง ลองอีกครั้งครับ');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => {
          setStatusMsg((prev) => (prev?.startsWith('ถอดรหัส') ? prev : null));
        }, 3000);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setStatusMsg('ไม่สามารถเปิดใช้งานไมโครโฟนได้');
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const displayVal = value === 0 || value === '0' || value === '' ? '' : value;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-stone-950 font-black text-xs">{label}</label>
          {supported && (
            <span className="text-[10px] text-amber-950 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>พิมพ์ด้วยเสียงได้</span>
            </span>
          )}
        </div>
      )}

      <div className="relative flex items-center">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={displayVal}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={(e) => e.target.select()}
          onClick={(e) => (e.target as HTMLInputElement).select()}
          onChange={(e) => {
            const raw = e.target.value.replace(/^0+(?=\d)/, '');
            const parsed = raw === '' ? 0 : Math.max(min, parseInt(raw, 10) || 0);
            onChange(parsed);
          }}
          className={`w-full bg-white border-2 ${
            isListening ? 'border-amber-500 ring-2 ring-amber-400/50' : 'border-stone-400'
          } rounded-xl p-2.5 pr-11 text-stone-950 font-mono font-black focus:border-amber-500 focus:outline-none transition ${inputClassName}`}
        />

        {/* Voice Input Button */}
        {supported && (
          <button
            type="button"
            onClick={isListening ? handleStopListening : handleStartListening}
            disabled={disabled}
            title={isListening ? 'กดเพื่อหยุดฟังเสียง' : 'กดแล้วพูดตัวเลข (เช่น 1250, หกร้อยห้าสิบ)'}
            className={`absolute right-1.5 p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center ${
              isListening
                ? 'bg-red-500 text-white border-red-600 animate-pulse shadow-md'
                : 'bg-amber-100 hover:bg-amber-200 text-stone-950 border-amber-400 shadow-xs'
            }`}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Mic className="w-4 h-4 text-stone-950" />
            )}
          </button>
        )}
      </div>

      {/* Voice Recognition Feedback Status */}
      {statusMsg && (
        <div
          className={`text-[10px] p-1.5 rounded-lg font-black border flex items-center gap-1.5 transition animate-fade-in ${
            statusMsg.startsWith('ถอดรหัส')
              ? 'bg-emerald-50 text-emerald-950 border-emerald-400'
              : isListening
              ? 'bg-amber-50 text-amber-950 border-amber-400'
              : 'bg-stone-100 text-stone-900 border-stone-300'
          }`}
        >
          {statusMsg.startsWith('ถอดรหัส') ? (
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : isListening ? (
            <Volume2 className="w-3.5 h-3.5 text-amber-600 animate-bounce shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-stone-600 shrink-0" />
          )}
          <span className="truncate">{statusMsg}</span>
        </div>
      )}
    </div>
  );
};
