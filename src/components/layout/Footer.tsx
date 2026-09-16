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
    <footer className="bg-dubai-black text-amber-100/90 border-t border-gold-400/30 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-gold-400/20 text-center">
          <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-dubai-card/40 border border-gold-400/20">
            <Award className="w-8 h-8 text-gold-400" />
            <h4 className="font-serif font-semibold text-sm text-gold-200">100% Authentic Dubai Import</h4>
            <p className="text-xs text-gold-300/70">นำเข้าตรงจากดูไบ สหรัฐอาหรับเอมิเรตส์</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-dubai-card/40 border border-gold-400/20">
            <Truck className="w-8 h-8 text-gold-400" />
            <h4 className="font-serif font-semibold text-sm text-gold-200">Fast Express Shipping</h4>
            <p className="text-xs text-gold-300/70">ส่งฟรีเมื่อช็อปครบ 2,000.- ทั่วประเทศ</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-dubai-card/40 border border-gold-400/20">
            <CreditCard className="w-8 h-8 text-gold-400" />
            <h4 className="font-serif font-semibold text-sm text-gold-200">All Payment Methods</h4>
            <p className="text-xs text-gold-300/70">พร้อมเพย์ QR ({storeSettings.promptPayNumber}), โอนผ่านธนาคาร</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-dubai-card/40 border border-gold-400/20">
            <ShieldCheck className="w-8 h-8 text-gold-400" />
            <h4 className="font-serif font-semibold text-sm text-gold-200">Size & Quality Guaranteed</h4>
            <p className="text-xs text-gold-300/70">รับประกันผ้าและไซส์ สต๊อกอัปเดตแม่นยำ</p>
          </div>
        </div>

        {/* Footer Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-serif text-2xl font-bold bg-gradient-to-r from-gold-200 via-gold-400 to-amber-200 bg-clip-text text-transparent">
                {storeSettings.storeName}
              </span>
            </div>
            <p className="text-xs text-gold-300/70 leading-relaxed">
              ร้านจำหน่ายชุดอาบายะห์ ชุดคัฟทาน เดรสอาหรับ และน้ำหอมดูไบเกรดพรีเมียม (Oud & Attar) นำเข้าจาก UAE โดยตรง มุ่งมั่นมอบความสง่างามตามแบบฉบับดูไบให้แก่คุณ
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-400">
              <Sparkles className="w-4 h-4" />
              <span>ความหรูหราส่งตรงถึงบ้านคุณ</span>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-gold-300 text-sm tracking-wider uppercase flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-gold-400" />
              <span>ที่ตั้งร้านค้า & นำทาง GPS (Location)</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-gold-200/80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{addressText}</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-gold-400 shrink-0" />
                <span>
                  {phoneText ? `โทรศัพท์: ${phoneText}` : ''}
                  {lineText && lineText !== '-' ? ` | LINE ID: ${lineText}` : ''}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-400 shrink-0" />
                <span>เวลาทำการ: เปิดบริการทุกวัน 09:00 - 21:00 น.</span>
              </li>
            </ul>

            {/* Premium GPS Button */}
            <div className="pt-2">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold-500 via-gold-400 to-amber-600 text-dubai-black font-extrabold text-xs rounded-xl shadow-gold-glow hover:scale-105 transition border border-gold-300/40 group"
              >
                <Navigation className="w-4 h-4 text-dubai-black fill-dubai-black group-hover:rotate-45 transition-transform" />
                <span>เปิดแผนที่นำทาง GPS (Google Maps)</span>
                <ExternalLink className="w-3.5 h-3.5 text-dubai-black" />
              </a>
            </div>
          </div>

          {/* Accepted Payment Channels */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-gold-300 text-sm tracking-wider uppercase">
              ช่องทางชำระเงินที่รองรับ
            </h4>
            <p className="text-xs text-gold-300/70">
              เราเปิดรับการชำระเงินอย่างปลอดภัย
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {enablePromptPay && (
                <span className="px-3 py-1 bg-dubai-card border border-gold-400/30 rounded text-xs text-gold-300 font-semibold flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-gold-400" /> PromptPay QR ({storeSettings.promptPayNumber})
                </span>
              )}
              {enableBankTransfer && storeSettings.bankName !== '-' && (
                <span className="px-3 py-1 bg-dubai-card border border-gold-400/30 rounded text-xs text-gold-300 font-semibold flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-gold-400" /> {storeSettings.bankName} ({storeSettings.bankAccountNo})
                </span>
              )}
              {enableCreditCard && (
                <span className="px-3 py-1 bg-dubai-card border border-gold-400/30 rounded text-xs text-gold-300 font-semibold">
                  Visa / Mastercard / JCB
                </span>
              )}
              {enableCOD && (
                <span className="px-3 py-1 bg-dubai-card border border-gold-400/30 rounded text-xs text-gold-300 font-semibold">
                  ชำระปลายทาง (COD)
                </span>
              )}
              {enableTrueMoney && (
                <span className="px-3 py-1 bg-dubai-card border border-gold-400/30 rounded text-xs text-gold-300 font-semibold">
                  TrueMoney Wallet / LINE Pay
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gold-400/20 text-center text-xs text-gold-400/60">
          © {new Date().getFullYear()} {storeSettings.storeName}. All Rights Reserved. นำเข้าชุดและน้ำหอมอาหรับแท้จากดูไบ
        </div>

      </div>
    </footer>
  );
};
