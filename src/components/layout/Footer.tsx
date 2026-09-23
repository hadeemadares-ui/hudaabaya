'use client';

import React from 'react';
import { ShieldCheck, Truck, CreditCard, QrCode, Sparkles, PhoneCall, MapPin, Clock, Award, Building, Navigation, ExternalLink, Compass } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const Footer: React.FC = () => {
  const { storeSettings } = useShop();

  const enablePromptPay = storeSettings.enablePromptPay ?? true;
  const enableBankTransfer = storeSettings.enableBankTransfer ?? true;
  const enableCreditCard = storeSettings.enableCreditCard ?? false;
  const enableCOD = storeSettings.enableCOD ?? false;
  const enableTrueMoney = storeSettings.enableTrueMoney ?? false;

  const phoneText = storeSettings.contactPhone?.trim() || '083-427-4687';
  const addressText = storeSettings.contactAddress?.trim() || '11/2 ถนน คลองสิบสาม แขวงหนองจอก เขตหนองจอก กรุงเทพมหานคร 10530';
  const lineText = storeSettings.contactLine?.trim();
  const defaultMapUrl = 'https://www.google.com/maps/dir//%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99+HUDA+ABAYA+DUBAI+11%2F2+%E0%B8%96%E0%B8%99%E0%B8%99+%E0%B8%84%E0%B8%A5%E0%B8%AD%E0%B8%87%E0%B8%AA%E0%B8%B4%E0%B8%9A%E0%B8%AA%E0%B8%B2%E0%B8%A1+%E0%B9%81%E0%B8%82%E0%B8%A7%E0%B8%87%E0%B8%AB%E0%B8%99%E0%B8%AD%E0%B8%87%E0%B8%88%E0%B8%AD%E0%B8%81+%E0%B9%80%E0%B8%82%E0%B8%95%E0%B8%AB%E0%B8%99%E0%B8%AD%E0%B8%87%E0%B8%88%E0%B8%AD%E0%B8%81+%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B9%80%E0%B8%97%E0%B8%9E%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A3+10530/@13.8461503,100.8564361,4592m/data=!3m1!1e3!4m8!4m7!1m0!1m5!1m1!1s0x311d73004172d045:0xca04d1c0a845986e!2m2!1d100.894964!2d13.8839807';
  const mapUrl = storeSettings.mapUrl || defaultMapUrl;

  return (
    <footer className="bg-[#FAF9F6] text-[#0A0A0A] border-t border-stone-300 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-stone-300 text-center">
          <div className="flex flex-col items-center space-y-2 p-4 rounded bg-white border border-stone-300 shadow-xs">
            <Award className="w-6 h-6 text-amber-700" />
            <h4 className="font-serif font-extrabold text-xs text-[#0A0A0A] uppercase tracking-wider">Authentic Dubai Import</h4>
            <p className="text-[11px] text-stone-900 font-semibold">นำเข้าตรงจากดูไบ สหรัฐอาหรับเอมิเรตส์</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 rounded bg-white border border-stone-300 shadow-xs">
            <Truck className="w-6 h-6 text-amber-700" />
            <h4 className="font-serif font-extrabold text-xs text-[#0A0A0A] uppercase tracking-wider">Express Delivery</h4>
            <p className="text-[11px] text-stone-900 font-semibold">จัดส่งด่วนฟรี เมื่อช็อปครบ 2,000 บาท</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 rounded bg-white border border-stone-300 shadow-xs">
            <CreditCard className="w-6 h-6 text-amber-700" />
            <h4 className="font-serif font-extrabold text-xs text-[#0A0A0A] uppercase tracking-wider">Secure Payment</h4>
            <p className="text-[11px] text-stone-900 font-semibold">พร้อมเพย์ QR ({storeSettings.promptPayNumber}) / โอนเงิน</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 rounded bg-white border border-stone-300 shadow-xs">
            <ShieldCheck className="w-6 h-6 text-amber-700" />
            <h4 className="font-serif font-extrabold text-xs text-[#0A0A0A] uppercase tracking-wider">Quality Guaranteed</h4>
            <p className="text-[11px] text-stone-900 font-semibold">รับประกันคุณภาพผ้าและขนาดไซส์แม่นยำ</p>
          </div>
        </div>

        {/* Footer Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <h3 className="font-serif text-xl font-extrabold text-[#0A0A0A]">
              {storeSettings.storeName}
            </h3>
            <p className="text-xs text-stone-900 leading-relaxed font-semibold">
              ร้านจำหน่ายชุดอาบายะห์ ชุดคัฟทาน เดรสอาหรับ และน้ำหอมดูไบเกรดพรีเมียม นำเข้าตรงจาก UAE มุ่งมั่นมอบความสง่างามตามแบบฉบับดูไบให้แก่คุณ
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-900 font-serif font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Bespoke Luxury Dubai Fashion</span>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3">
            <h4 className="font-serif font-extrabold text-[#0A0A0A] text-xs tracking-widest uppercase flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-700" />
              <span>ที่ตั้งร้านค้า & GPS Location</span>
            </h4>
            <ul className="space-y-2 text-xs text-stone-900 font-semibold">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{addressText}</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  {phoneText ? `โทร: ${phoneText}` : ''}
                  {lineText && lineText !== '-' ? ` | LINE: ${lineText}` : ''}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>เวลาทำการ: 09:00 - 21:00 น. ทุกวัน</span>
              </li>
            </ul>

            <div className="pt-1">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] hover:bg-amber-800 text-white font-bold text-xs rounded transition"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>นำทางด้วย Google Maps</span>
                <ExternalLink className="w-3 h-3 text-stone-200" />
              </a>
            </div>
          </div>

          {/* Accepted Payment Channels */}
          <div className="space-y-3">
            <h4 className="font-serif font-extrabold text-[#0A0A0A] text-xs tracking-widest uppercase">
              ช่องทางชำระเงินที่รองรับ
            </h4>
            <p className="text-xs text-stone-900 font-semibold">
              ระบบชำระเงินปลอดภัย ตรวจสอบสลิปอัตโนมัติ
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {enablePromptPay && (
                <span className="px-2.5 py-1 bg-white border border-stone-300 rounded text-xs text-stone-900 font-bold flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-amber-700" /> PromptPay QR ({storeSettings.promptPayNumber})
                </span>
              )}
              {enableBankTransfer && storeSettings.bankName !== '-' && (
                <span className="px-2.5 py-1 bg-white border border-stone-300 rounded text-xs text-stone-900 font-bold flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-amber-700" /> {storeSettings.bankName} ({storeSettings.bankAccountNo})
                </span>
              )}
              {enableCreditCard && (
                <span className="px-2.5 py-1 bg-white border border-stone-300 rounded text-xs text-stone-900 font-bold">
                  Visa / Mastercard
                </span>
              )}
              {enableCOD && (
                <span className="px-2.5 py-1 bg-white border border-stone-300 rounded text-xs text-stone-900 font-bold">
                  เก็บเงินปลายทาง (COD)
                </span>
              )}
              {enableTrueMoney && (
                <span className="px-2.5 py-1 bg-white border border-stone-300 rounded text-xs text-stone-900 font-bold">
                  TrueMoney / LINE Pay
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-stone-300 text-center text-xs text-stone-800 font-semibold">
          © {new Date().getFullYear()} {storeSettings.storeName}. All Rights Reserved. นำเข้าชุดอาบายะห์และน้ำหอมอาหรับแท้จากดูไบ
        </div>

      </div>
    </footer>
  );
};
