'use client';

import React, { useState } from 'react';
import { Mic } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  title?: string;
  mode?: 'replace' | 'append';
  currentValue?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  className = '',
  title = 'กดพูดแทนการพิมพ์ (Voice Speech-to-Text)',
  mode = 'replace',
  currentValue = '',
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
          if (mode === 'append' && currentValue) {
            onTranscript(`${currentValue} ${transcript}`.trim());
          } else {
            onTranscript(transcript.trim());
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
      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
        isListening
          ? 'bg-red-600 text-white animate-pulse border border-red-400 shadow-lg shadow-red-500/50'
          : 'bg-gradient-to-r from-amber-500/20 via-gold-400/20 to-yellow-500/20 text-gold-300 border border-gold-400/50 hover:bg-gold-500 hover:text-dubai-black'
      } ${className}`}
      title={title}
    >
      <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce text-white' : 'text-gold-400'}`} />
      <span>{isListening ? '🎙️ กำลังฟัง...' : '🎤 พูดพิมพ์'}</span>
    </button>
  );
};
