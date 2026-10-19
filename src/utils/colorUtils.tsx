import React from 'react';

export interface ColorStyle {
  background: string;
  borderColor: string;
  isDark: boolean;
}

export function getColorStyle(colorStr: string): ColorStyle {
  if (!colorStr) {
    return { background: '#78716c', borderColor: '#57534e', isDark: true };
  }

  const c = colorStr.toLowerCase().trim();

  // ดำ / Black
  if (c.includes('ดำ') || c.includes('black')) {
    return { background: '#111111', borderColor: '#444444', isDark: true };
  }
  // ขาว / White
  if (c.includes('ขาว') || c.includes('white')) {
    return { background: '#ffffff', borderColor: '#cbd5e1', isDark: false };
  }
  // ทอง / Gold
  if (c.includes('ทอง') || c.includes('gold')) {
    return { background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 50%, #ffd700 100%)', borderColor: '#996515', isDark: false };
  }
  // น้ำตาล / Brown
  if (c.includes('น้ำตาล') || c.includes('brown') || c.includes('กาแฟ') || c.includes('ช็อกโกแลต')) {
    return { background: '#6b3e26', borderColor: '#4a2818', isDark: true };
  }
  // ชมพู / Pink / Rose
  if (c.includes('ชมพู') || c.includes('pink') || c.includes('rose') || c.includes('กุหลาบ')) {
    return { background: '#ec4899', borderColor: '#be185d', isDark: false };
  }
  // ฟ้า / Sky Blue
  if (c.includes('ฟ้า') || c.includes('sky')) {
    return { background: '#38bdf8', borderColor: '#0284c7', isDark: false };
  }
  // กรมท่า / น้ำเงิน / Blue / Navy
  if (c.includes('กรม') || c.includes('น้ำเงิน') || c.includes('navy') || c.includes('blue')) {
    return { background: '#1e3a8a', borderColor: '#172554', isDark: true };
  }
  // เขียว / Green / มรกต / โอลิฟ
  if (c.includes('เขียว') || c.includes('green') || c.includes('emerald') || c.includes('olive')) {
    return { background: '#15803d', borderColor: '#166534', isDark: true };
  }
  // แดง / Red / ไวน์ / เลือดหมู / Crimson
  if (c.includes('แดง') || c.includes('red') || c.includes('wine') || c.includes('crimson') || c.includes('เลือดหมู')) {
    return { background: '#b91c1c', borderColor: '#7f1d1d', isDark: true };
  }
  // ม่วง / Purple / Violet / มังคุด
  if (c.includes('ม่วง') || c.includes('purple') || c.includes('violet') || c.includes('มังคุด')) {
    return { background: '#7e22ce', borderColor: '#581c87', isDark: true };
  }
  // เทา / Gray / Grey / ควันบุหรี่ / เงิน / Silver
  if (c.includes('เงิน') || c.includes('silver')) {
    return { background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 50%, #f8fafc 100%)', borderColor: '#64748b', isDark: false };
  }
  if (c.includes('เทา') || c.includes('gray') || c.includes('grey')) {
    return { background: '#64748b', borderColor: '#475569', isDark: true };
  }
  // ส้ม / Orange / ชาไทย
  if (c.includes('ส้ม') || c.includes('orange') || c.includes('ชาไทย')) {
    return { background: '#ea580c', borderColor: '#c2410c', isDark: false };
  }
  // เหลือง / Yellow
  if (c.includes('เหลือง') || c.includes('yellow')) {
    return { background: '#eab308', borderColor: '#ca8a04', isDark: false };
  }
  // ครีม / เบจ / Beige / Cream / Nude / นู้ด
  if (c.includes('ครีม') || c.includes('เบจ') || c.includes('beige') || c.includes('cream') || c.includes('nude') || c.includes('นู้ด')) {
    return { background: '#f5ebe0', borderColor: '#d5bdaf', isDark: false };
  }
  // กลิ่นน้ำหอม / ไม้บาคัวร์ / อูด / Perfume / Incense
  if (c.includes('กลิ่น') || c.includes('น้ำหอม') || c.includes('perfume') || c.includes('attar')) {
    return { background: 'linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)', borderColor: '#e11d48', isDark: false };
  }
  if (c.includes('ไม้') || c.includes('บาคัวร์') || c.includes('oud') || c.includes('กฤษณา')) {
    return { background: 'linear-gradient(135deg, #78350f 0%, #d97706 100%)', borderColor: '#451a03', isDark: true };
  }

  // Fallback
  return { background: '#78716c', borderColor: '#44403c', isDark: true };
}

interface ColorIndicatorProps {
  color?: string | null;
  showLabel?: boolean;
  className?: string;
  dotClassName?: string;
  labelClassName?: string;
}

export const ColorIndicator: React.FC<ColorIndicatorProps> = ({
  color,
  showLabel = true,
  className = '',
  dotClassName = 'w-3.5 h-3.5',
  labelClassName = '',
}) => {
  if (!color || typeof color !== 'string' || !color.trim()) return null;

  const style = getColorStyle(color);

  return (
    <span className={`inline-flex items-center gap-1.5 align-middle ${className}`}>
      <span
        style={{
          background: style.background,
          borderColor: style.borderColor,
        }}
        className={`inline-block rounded-full border shadow-xs shrink-0 ${dotClassName}`}
        title={`สี: ${color}`}
      />
      {showLabel && <span className={labelClassName}>{color}</span>}
    </span>
  );
};

export function detectColorName(str?: string | null): string | null {
  if (!str) return null;
  const s = str.toLowerCase();
  if (s.includes('ดำ') || s.includes('black')) return 'สีดำ (Black)';
  if (s.includes('ขาว') || s.includes('white')) return 'สีขาว (White)';
  if (s.includes('ทอง') || s.includes('gold')) return 'สีทอง (Gold)';
  if (s.includes('น้ำตาล') || s.includes('brown')) return 'สีน้ำตาล (Brown)';
  if (s.includes('ชมพู') || s.includes('pink') || s.includes('rose')) return 'สีชมพู (Pink)';
  if (s.includes('ฟ้า') || s.includes('sky')) return 'สีฟ้า (Sky Blue)';
  if (s.includes('กรม') || s.includes('navy')) return 'สีกรมท่า (Navy)';
  if (s.includes('น้ำเงิน') || s.includes('blue')) return 'สีน้ำเงิน (Blue)';
  if (s.includes('เขียว') || s.includes('green') || s.includes('emerald')) return 'สีเขียว (Green)';
  if (s.includes('แดง') || s.includes('red') || s.includes('wine')) return 'สีแดง (Red)';
  if (s.includes('ม่วง') || s.includes('purple') || s.includes('violet')) return 'สีม่วง (Purple)';
  if (s.includes('เงิน') || s.includes('silver')) return 'สีเงิน (Silver)';
  if (s.includes('เทา') || s.includes('gray') || s.includes('grey')) return 'สีเทา (Gray)';
  if (s.includes('ส้ม') || s.includes('orange')) return 'สีส้ม (Orange)';
  if (s.includes('เหลือง') || s.includes('yellow')) return 'สีเหลือง (Yellow)';
  if (s.includes('ครีม') || s.includes('เบจ') || s.includes('beige')) return 'สีครีม (Beige)';
  return null;
}

export function getEffectiveVariantColor(
  prod?: { title?: string; category?: string; colors?: string[] } | null,
  variant?: { color?: string | null; name?: string } | null
): string {
  if (variant?.color && variant.color.trim()) return variant.color.trim();
  if (prod?.colors && Array.isArray(prod.colors) && prod.colors.length > 0 && prod.colors[0]?.trim()) {
    return prod.colors[0].trim();
  }
  const fromVariant = detectColorName(variant?.name);
  if (fromVariant) return fromVariant;
  const fromTitle = detectColorName(prod?.title);
  if (fromTitle) return fromTitle;
  if (prod?.category === 'perfume' || prod?.category === 'incense') {
    return 'สีทอง (Gold)';
  }
  return 'สีดำ (Black)';
}

