'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, X, Check, ShieldCheck, Ruler, Wand2, Star } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const AIConciergeModal: React.FC = () => {
  const { isAIConciergeOpen, setIsAIConciergeOpen, products, addToCart } = useShop();

  const [height, setHeight] = useState<number>(152);
  const [weight, setWeight] = useState<number>(50);
  const [stylePreference, setStylePreference] = useState<'abaya' | 'kaftan' | 'perfume'>('abaya');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    size: string;
    reason: string;
    productTitle: string;
    productImage: string;
    productPrice: number;
    matchedProduct: any;
  } | null>(null);

  if (!isAIConciergeOpen) return null;

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setRecommendation(null);

    setTimeout(() => {
      let recommendedSize = 'Size 54';
      let reasonStr = 'ความยาวชุด 54 นิ้ว พอดีกับส่วนสูง 155-160 ซม. ทรงพริ้วทิ้งตัวสง่างาม';

      if (height >= 150 && height <= 155) {
        recommendedSize = 'Size 52';
        reasonStr = 'ตรงกับส่วนสูง 150 - 155 ซม. ของคุณเป๊ะ! ความยาวชุด 52 นิ้ว ชายผ้าพอดี ไม่ลากพื้น เดินสบาย';
      } else if (height > 155 && height <= 160) {
        recommendedSize = 'Size 54';
        reasonStr = 'ตรงกับส่วนสูง 155 - 160 ซม. ของคุณ! ความยาวชุด 54 นิ้ว สวมใส่สวยพอดี';
      } else if (height > 160 && height <= 165) {
        recommendedSize = 'Size 56';
        reasonStr = 'ตรงกับส่วนสูง 160 - 165 ซม. ของคุณ! ความยาวชุด 56 นิ้ว สง่างามสมบูรณ์แบบ';
      } else if (height > 165) {
        recommendedSize = 'Size 58';
        reasonStr = 'ตรงกับส่วนสูง 165 - 170 ซม. ของคุณ! ความยาวชุด 58 นิ้ว หรูหราและพริ้วไหวสวยงาม';
      }

      const match = products.find((p) => p.category === stylePreference) || products[0];

      setRecommendation({
        size: recommendedSize,
        reason: reasonStr,
        productTitle: match.title,
        productImage: match.images[0],
        productPrice: match.variants[0].price,
        matchedProduct: match,
      });
      setIsAnalyzing(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-dubai-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-dubai-card border-2 border-gold-400/60 rounded-3xl max-w-lg w-full overflow-hidden shadow-gold-strong text-white p-6 my-8 space-y-5 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold-400/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-500 via-amber-300 to-gold-600 p-0.5 shadow-gold-glow flex items-center justify-center">
              <div className="w-full h-full bg-dubai-black rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-gold-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
                <span>AI Royal Dubai Stylist 2076</span>
                <Sparkles className="w-4 h-4 text-gold-400 animate-spin" />
              </h3>
              <p className="text-[10px] text-gold-300/80">
                ผู้ช่วยสไตลิสต์ดูไบส่วนตัววิเคราะห์ไซส์และส่วนสูงของคุณ 100%
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAIConciergeOpen(false)}
            className="text-gold-400 hover:text-white p-2 rounded-full border border-gold-400/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 mb-1 font-medium flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-gold-400" />
                <span>ส่วนสูง (ซม.)</span>
              </label>
              <input
                type="number"
                required
                min={130}
                max={210}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-dubai-black border border-gold-400/30 rounded-xl p-2.5 text-white font-mono font-bold focus:border-gold-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1 font-medium flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-gold-400" />
                <span>น้ำหนัก (กก.)</span>
              </label>
              <input
                type="number"
                required
                min={30}
                max={150}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-dubai-black border border-gold-400/30 rounded-xl p-2.5 text-white font-mono font-bold focus:border-gold-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-1 font-medium">หมวดหมู่ชุดที่สนใจ</label>
            <select
              value={stylePreference}
              onChange={(e) => setStylePreference(e.target.value as any)}
              className="w-full bg-dubai-black border border-gold-400/30 rounded-xl p-2.5 text-white"
            >
              <option value="abaya">ชุดอาบายะห์ดูไบ (Abaya Haute Couture)</option>
              <option value="kaftan">ชุดคัฟทาน (Kaftan Silk)</option>
              <option value="perfume">น้ำหอมเกรดพรีเมียม (Dubai Oud & Perfume)</option>
              <option value="incense">เครื่องหอม & ไม้หอมดูไบ (Bukhoor & Incense)</option>
              <option value="other">สินค้าอื่นๆ (ของเล่นเด็ก ขนม ฯลฯ)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full py-3 bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600 text-dubai-black font-extrabold text-xs rounded-xl shadow-gold-glow hover:scale-102 transition flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>AI กำลังวิเคราะห์ส่วนสูงกับไซส์ดูไบ...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Wand2 className="w-4 h-4" />
                <span>คำนวณไซส์และชุดที่เหมาะสมด้วย AI</span>
              </span>
            )}
          </button>
        </form>

        {/* AI Result Card */}
        {recommendation && (
          <div className="p-4 bg-dubai-black/80 border-2 border-gold-400/60 rounded-2xl space-y-3 shadow-xl animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-gold-400/20 pb-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>วิเคราะห์ตรงกับส่วนสูง {height} ซม.</span>
              </span>
              <span className="bg-gold-500 text-dubai-black font-extrabold px-3 py-1 rounded-full shadow-gold-glow">
                แนะนำ: {recommendation.size}
              </span>
            </div>

            <p className="text-gray-300 leading-relaxed">
              💡 {recommendation.reason}
            </p>

            <div className="flex items-center gap-3 p-2 bg-dubai-dark rounded-xl border border-gold-400/30">
              <img
                src={recommendation.productImage}
                alt={recommendation.productTitle}
                className="w-14 h-16 object-cover rounded-lg border border-gold-400/30"
              />
              <div className="flex-1">
                <h4 className="font-serif font-bold text-white text-xs truncate">
                  {recommendation.productTitle}
                </h4>
                <p className="text-gold-300 font-serif font-bold text-xs">
                  ฿{recommendation.productPrice.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => {
                  addToCart(recommendation.matchedProduct, recommendation.matchedProduct.variants[0]);
                  setIsAIConciergeOpen(false);
                }}
                className="px-3 py-2 bg-gold-500 text-dubai-black font-extrabold rounded-lg text-[11px] shadow-gold-glow shrink-0"
              >
                ใส่ตะกร้าทันที
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
