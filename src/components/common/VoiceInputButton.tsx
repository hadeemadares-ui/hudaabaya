'use client';

import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { parseThaiNumberSpeech } from '../../utils/speechUtils';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  onNumberTranscript?: (num: number) => void;
  isNumber?: boolean;
  className?: string;
  title?: string;
  mode?: 'replace' | 'append';
  currentValue?: string | number;
  iconOnly?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  onNumberTranscript,
  isNumber = false,
  className = '',
  title = 'กดพูดแทนการพิมพ์ (พูดตัวเลข เช่น 1250 หรือ หกร้อยห้าสิบ)',
  mode = 'replace',
  currentValue = '',
  iconOnly = false,
}) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('เบราว์เซอร์ของคุณยังไม่รองรับระบบสั่งงานด้วยเสียงครับ แนะนำให้ใช้งานบน Google Chrome หรือ Safari');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'th-TH';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          if (isNumber || onNumberTranscript) {
            const parsedNum = parseThaiNumberSpeech(transcript);
            if (parsedNum !== null && !isNaN(parsedNum)) {
              if (onNumberTranscript) {
                onNumberTranscript(parsedNum);
              }
              onTranscript(String(parsedNum));
            } else {
              // Fallback to direct digits if any
              const digitsOnly = transcript.replace(/\D/g, '');
              if (digitsOnly) {
                const numVal = parseInt(digitsOnly, 10);
                if (onNumberTranscript) onNumberTranscript(numVal);
                onTranscript(String(numVal));
              } else {
                alert(`ถอดรหัสเสียง "${transcript}" เป็นตัวเลขไม่สำเร็จ กรุณาพูดใหม่อีกครั้งครับ (เช่น 1250 หรือ หกร้อยห้าสิบ)`);
              }
            }
          } else {
            if (mode === 'append' && currentValue) {
              onTranscript(`${currentValue} ${transcript}`.trim());
            } else {
              onTranscript(transcript.trim());
            }
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={startListening}
      className={`${iconOnly ? 'p-1.5 rounded-lg' : 'px-2 py-1 rounded-lg text-[11px]'} font-bold transition flex items-center justify-center gap-1 cursor-pointer shrink-0 ${
        isListening
          ? 'bg-red-600 text-white animate-pulse border border-red-400 shadow-lg shadow-red-500/50'
          : 'bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200 hover:text-stone-950'
      } ${className}`}
      title={title}
    >
      <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce text-white' : 'text-amber-700'}`} />
      {!iconOnly && <span>{isListening ? 'กำลังฟัง...' : 'พูดพิมพ์'}</span>}
    </button>
  );
};
