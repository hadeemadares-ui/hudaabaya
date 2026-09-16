'use client';

import React, { useState } from 'react';
import { X, Sparkles, Box, RotateCw, Eye, Layers, ShieldCheck } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const Hologram3DViewerModal: React.FC = () => {
  const { active3DProduct, setActive3DProduct } = useShop();
  const [rotationAngle, setRotationAngle] = useState(0);

  if (!active3DProduct) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-dubai-black/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-dubai-card/90 border-2 border-gold-400/60 rounded-3xl max-w-2xl w-full overflow-hidden shadow-gold-strong text-white p-6 my-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold-400/30 pb-4">
          <div className="flex items-center gap-2.5">
            <Box className="w-6 h-6 text-gold-400 animate-spin" />
            <div>
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <span>HUDA 3D Hologram 360° Experience</span>
                <span className="text-[10px] bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded border border-gold-400/40">
                  AR 2076 Ready
                </span>
              </h3>
              <p className="text-xs text-gold-300/80">
                สัมผัสความประณีตของผ้านำเข้าจากดูไบในมุมมองโฮโลแกรม 3D 360 องศา
              </p>
            </div>
          </div>
          <button
            onClick={() => setActive3DProduct(null)}
            className="text-gold-400 hover:text-white p-2 rounded-full border border-gold-400/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Hologram Preview Container */}
        <div className="relative h-80 sm:h-96 rounded-2xl bg-gradient-to-b from-dubai-black via-dubai-dark to-dubai-black border border-gold-400/40 overflow-hidden flex items-center justify-center shadow-inner group">
          
          {/* Hologram Aura Ring Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0,transparent_70%)] animate-pulse" />
          
          {/* Holographic Scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(212,175,55,0.05)_51%)] bg-[length:100%_4px] pointer-events-none" />

          <img
            src={active3DProduct.images[0]}
            alt={active3DProduct.title}
            style={{ transform: `rotateY(${rotationAngle}deg) scale(1.05)` }}
            className="h-full object-contain transition-transform duration-300 drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]"
          />

          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-dubai-black/80 backdrop-blur-md p-3 rounded-xl border border-gold-400/30 text-xs">
            <span className="text-gold-300 font-serif font-bold">
              {active3DProduct.title}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRotationAngle((prev) => prev - 45)}
                className="p-2 bg-dubai-card rounded-lg text-gold-400 hover:text-white border border-gold-400/30"
                title="หมุนซ้าย 45°"
              >
                <RotateCw className="w-4 h-4 transform -scale-x-100" />
              </button>
              <button
                onClick={() => setRotationAngle((prev) => prev + 45)}
                className="p-2 bg-dubai-card rounded-lg text-gold-400 hover:text-white border border-gold-400/30"
                title="หมุนขวา 45°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex justify-between items-center pt-2 text-xs">
          <span className="text-gray-400 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>เทคโนโลยีจำลองเนื้อผ้าและงานปักระดับ Haute Couture</span>
          </span>
          <button
            onClick={() => setActive3DProduct(null)}
            className="px-6 py-2.5 bg-gold-500 text-dubai-black font-extrabold rounded-xl shadow-gold-glow"
          >
            ปิดมุมมอง 3D
          </button>
        </div>

      </div>
    </div>
  );
};
