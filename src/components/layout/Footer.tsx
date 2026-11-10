'use client';

import React from 'react';
import { ShieldCheck, Truck, CreditCard, Award, PhoneCall, MapPin, Clock, ExternalLink } from 'lucide-react';
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
    <footer className="bg-[#141312] text-[#E6E2DC] border-t border-stone-800 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Proposition Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-stone-800">
          <div className="space-y-1.5">
            <Award className="w-5 h-5 text-[#B89352] stroke-[1.5]" />
            <h4 className="font-serif text-xs text-white uppercase tracking-[0.15em] pt-1">Authentic Origin</h4>
            <p className="text-[11px] text-stone-400 font-light">นำเข้าโดยตรงจากนครดูไบ UAE</p>
          </div>
          <div className="space-y-1.5">
            <Truck className="w-5 h-5 text-[#B89352] stroke-[1.5]" />
            <h4 className="font-serif text-xs text-white uppercase tracking-[0.15em] pt-1">Complimentary Delivery</h4>
            <p className="text-[11px] text-stone-400 font-light">จัดส่งด่วนพิเศษฟรี เมื่อช็อปครบ ฿2,000</p>
          </div>
          <div className="space-y-1.5">
            <CreditCard className="w-5 h-5 text-[#B89352] stroke-[1.5]" />
            <h4 className="font-serif text-xs text-white uppercase tracking-[0.15em] pt-1">Seamless Checkout</h4>
            <p className="text-[11px] text-stone-400 font-light">รองรับ PromptPay QR และโอนผ่านธนาคาร</p>
          </div>
          <div className="space-y-1.5">
            <ShieldCheck className="w-5 h-5 text-[#B89352] stroke-[1.5]" />
            <h4 className="font-serif text-xs text-white uppercase tracking-[0.15em] pt-1">Artisanal Quality</h4>
            <p className="text-[11px] text-stone-400 font-light">คัดสรรเนื้อผ้าและงานตัดเย็บระดับกูตูร์</p>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-12">
          
          {/* Brand Maison Info */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg tracking-[0.12em] text-white uppercase">
              {storeSettings.storeName}
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed font-light max-w-sm">
              บูติกชุดอาบายะห์ คัฟทาน เดรสตะวันออกกลาง และน้ำหอมอาหรับแท้นำเข้าจากนครดูไบ สหรัฐอาหรับเอมิเรตส์
            </p>
            <p className="text-[10px] text-[#B89352] font-serif tracking-[0.22em] uppercase pt-1">
              {storeSettings.storeTagline}
            </p>
          </div>

          {/* Boutique Location & Contact */}
          <div className="space-y-3">
            <h4 className="font-serif text-white text-xs tracking-[0.18em] uppercase">
              BOUTIQUE & CONTACT
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400 font-light">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B89352] shrink-0 mt-0.5 stroke-[1.5]" />
                <span className="leading-relaxed">{addressText}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-[#B89352] shrink-0 stroke-[1.5]" />
                <span>
                  {phoneText ? `โทร: ${phoneText}` : ''}
                  {lineText && lineText !== '-' ? ` | LINE: ${lineText}` : ''}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#B89352] shrink-0 stroke-[1.5]" />
                <span>เปิดบริการทุกวัน: 09:00 – 21:00 น.</span>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-stone-700 hover:border-[#B89352] text-xs text-stone-200 hover:text-white tracking-wider uppercase transition"
              >
                <span>แผนที่นำทาง Google Maps</span>
                <ExternalLink className="w-3 h-3 text-[#B89352]" />
              </a>
            </div>
          </div>

          {/* Accepted Payment Methods */}
          <div className="space-y-3">
            <h4 className="font-serif text-white text-xs tracking-[0.18em] uppercase">
              PAYMENT METHODS
            </h4>
            <p className="text-xs text-stone-400 font-light">
              ช่องทางการชำระเงินที่รองรับอย่างเป็นทางการ
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-stone-300">
              {enablePromptPay && (
                <span className="px-3 py-1.5 bg-stone-900 border border-stone-800">
                  PromptPay QR ({storeSettings.promptPayNumber})
                </span>
              )}
              {enableBankTransfer && storeSettings.bankName !== '-' && (
                <span className="px-3 py-1.5 bg-stone-900 border border-stone-800">
                  {storeSettings.bankName} ({storeSettings.bankAccountNo})
                </span>
              )}
              {enableCreditCard && (
                <span className="px-3 py-1.5 bg-stone-900 border border-stone-800">
                  Visa / Mastercard
                </span>
              )}
              {enableCOD && (
                <span className="px-3 py-1.5 bg-stone-900 border border-stone-800">
                  Cash on Delivery (COD)
                </span>
              )}
              {enableTrueMoney && (
                <span className="px-3 py-1.5 bg-stone-900 border border-stone-800">
                  TrueMoney Wallet
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500 font-light">
          <span>© {new Date().getFullYear()} {storeSettings.storeName}. All Rights Reserved.</span>
          <span className="tracking-widest uppercase text-[10px]">DUBAI • BANGKOK</span>
        </div>

      </div>
    </footer>
  );
};

