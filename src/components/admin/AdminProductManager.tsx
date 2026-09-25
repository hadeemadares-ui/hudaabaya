'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Layers, X, Search, Filter, Camera, Image as ImageIcon, Link as LinkIcon, Sparkles, Palette, CheckCircle2, RotateCcw, TrendingUp } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, ProductVariant, CategoryType } from '../../types';
import { VoiceInputButton } from '../common/VoiceInputButton';

export const AdminProductManager: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    updateVariantStock,
    deleteProduct,
    clearAllProducts,
    selectedCategory,
    setSelectedCategory,
    syncProducts,
  } = useShop();

  const [adminSearch, setAdminSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for Add/Edit
  const [title, setTitle] = useState('');
  const [arabicTitle, setArabicTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('abaya');
  const [description, setDescription] = useState('');
  const [fabric, setFabric] = useState('Nida Silk Dubai');
  const [imageUrl, setImageUrl] = useState('');

  // Comprehensive Color List in Thai (English)
  const PRODUCT_COLOR_PRESETS = [
    'สีดำ (Black)',
    'สีทอง (Gold)',
    'สีขาว (White)',
    'สีครีม (Cream)',
    'สีไอวอรี่ (Ivory)',
    'สีเบจ (Beige)',
    'สีนู๊ด (Nude)',
    'สีน้ำตาล (Brown)',
    'สีช็อกโกแลต (Chocolate Brown)',
    'สีน้ำตาลกาแฟ (Coffee / Latte)',
    'สีเทา (Grey / Gray)',
    'สีเทาเงิน (Silver)',
    'สีชาโคล (Charcoal Grey)',
    'สีเขียวมรกต (Emerald Green)',
    'สีเขียวเข้ม (Dark Green / Pine)',
    'สีเขียวมะกอก (Olive Green)',
    'สีเขียวมินต์ (Mint Green)',
    'สีเขียวเซจ (Sage Green)',
    'สีน้ำเงินรอยัล (Royal Blue)',
    'สีน้ำเงินกรมท่า (Navy Blue)',
    'สีฟ้าสกายบลู (Sky Blue)',
    'สีฟ้าพาสเทล (Baby Blue)',
    'สีเทอร์ควอยซ์ (Turquoise)',
    'สีม่วง (Purple / Violet)',
    'สีม่วงเข้ม (Dark Plum)',
    'สีม่วงลาเวนเดอร์ (Lavender)',
    'สีแดง (Red)',
    'สีแดงเลือดหมู (Burgundy / Wine)',
    'สีแดงทับทิม (Ruby Red)',
    'สีส้ม (Orange)',
    'สีส้มอิฐ (Terracotta / Copper)',
    'สีพีช (Peach)',
    'สีชมพู (Pink)',
    'สีโรสโกลด์ (Rose Gold)',
    'สีชมพูบานเย็น (Fuchsia / Magenta)',
    'สีชมพูพาสเทล (Baby Pink)',
    'สีเหลือง (Yellow)',
    'สีเหลืองมัสตาร์ด (Mustard Yellow)',
    'สีทองแดง (Bronze)',
    'สีแชมเปญ (Champagne)',
    'สีทูโทน (Two-Tone)',
    'สีมัลติคัลเลอร์ (Multicolor)',
  ];

  // Standard Dubai Abaya Default Sizes
  const DEFAULT_DUBAI_SIZES = [
    { name: 'Size 52 (ส่วนสูง ~150-155 ซม. / ยาว 52")', sku: 'HD-ABY-52', price: 0, costPrice: 0, stockQuantity: 0, color: 'สีดำ (Black)' },
    { name: 'Size 54 (ส่วนสูง ~155-160 ซม. / ยาว 54")', sku: 'HD-ABY-54', price: 0, costPrice: 0, stockQuantity: 0, color: 'สีดำ (Black)' },
    { name: 'Size 56 (ส่วนสูง ~160-165 ซม. / ยาว 56")', sku: 'HD-ABY-56', price: 0, costPrice: 0, stockQuantity: 0, color: 'สีดำ (Black)' },
    { name: 'Size 58 (ส่วนสูง ~165-170 ซม. / ยาว 58")', sku: 'HD-ABY-58', price: 0, costPrice: 0, stockQuantity: 0, color: 'สีดำ (Black)' },
  ];

  // Standard Dubai Perfume Default Volumes/Sizes
  const DEFAULT_PERFUME_SIZES = [
    { name: 'ขวดสเปรย์ 50 ml (EDP Spray)', sku: 'HD-PRF-50ML', price: 0, costPrice: 0, stockQuantity: 0, color: 'กลิ่นดูไบออริจินัล' },
    { name: 'ขวดสเปรย์ 100 ml (EDP Premium Spray)', sku: 'HD-PRF-100ML', price: 0, costPrice: 0, stockQuantity: 0, color: 'กลิ่นดูไบออริจินัล' },
    { name: 'ขวดแก้วคริสตัล 12 ml (Attar Pure Oil)', sku: 'HD-PRF-12ML', price: 0, costPrice: 0, stockQuantity: 0, color: 'กลิ่นดูไบออริจินัล' },
  ];

  // Standard Dubai Incense Default Variants
  const DEFAULT_INCENSE_SIZES = [
    { name: 'ขวด/กระปุก 50g (Standard Bukhoor)', sku: 'HD-INC-50G', price: 0, costPrice: 0, stockQuantity: 0, color: 'ไม้หอมอูดออริจินัล' },
    { name: 'ขวด/กระปุก 100g (Premium Bukhoor)', sku: 'HD-INC-100G', price: 0, costPrice: 0, stockQuantity: 0, color: 'ไม้หอมอูดออริจินัล' },
    { name: 'เซ็ตเตาเผาหอม + ถ่านหอมดูไบ', sku: 'HD-INC-SET', price: 0, costPrice: 0, stockQuantity: 0, color: 'สีทอง (Royal Gold)' },
  ];

  // Standard Other Items Default Variants
  const DEFAULT_OTHER_SIZES = [
    { name: 'ชิ้น/กล่อง (Standard)', sku: 'HD-OTH-STD', price: 0, costPrice: 0, stockQuantity: 0, color: 'มาตรฐาน' },
    { name: 'แพ็กสุดคุ้ม (Pack)', sku: 'HD-OTH-PACK', price: 0, costPrice: 0, stockQuantity: 0, color: 'มาตรฐาน' },
  ];

  // Size & Color Variants State
  const [variants, setVariants] = useState<
    { name: string; sku: string; price: number; costPrice?: number; stockQuantity: number; color?: string }[]
  >(DEFAULT_DUBAI_SIZES);

  // Handle Category Change (Auto Switch Variants between Abaya Sizes, Perfume, Incense & Others)
  const handleCategoryChange = (newCat: CategoryType) => {
    setCategory(newCat);
    if (newCat === 'perfume') {
      setFabric('Oud Oil & Attar Perfume Dubai');
      setVariants(DEFAULT_PERFUME_SIZES);
    } else if (newCat === 'incense') {
      setFabric('เครื่องหอม / ไม้หอมดูไบ (Bukhoor Dubai)');
      setVariants(DEFAULT_INCENSE_SIZES);
    } else if (newCat === 'other') {
      setFabric('สินค้าทั่วไป (General Item)');
      setVariants(DEFAULT_OTHER_SIZES);
    } else {
      setFabric('Nida Silk Dubai Original');
      setVariants(DEFAULT_DUBAI_SIZES);
    }
  };

  const handleForceSync = async () => {
    await syncProducts();
    alert('ซิงก์ดึงข้อมูลสินค้าล่าสุดจากทุกเครื่องขึ้นคลาวด์และแสดงผลตรงกัน 100% เรียบร้อยแล้ว!');
  };

  // Smart Image Compression Handler for Camera & Gallery uploads
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const rawBase64 = reader.result;
          const img = new Image();
          img.src = rawBase64;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 600; // Compress high-res camera photos to max 600px
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.75);
            setImageUrl(compressed);
          };
          img.onerror = () => {
            setImageUrl(rawBase64);
          };
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const resetForm = () => {
    setTitle('');
    setArabicTitle('');
    setCategory('abaya');
    setDescription('');
    setFabric('Nida Silk Dubai');
    setImageUrl('');
    setVariants(DEFAULT_DUBAI_SIZES);
    setEditingProduct(null);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('กรุณากรอก "ชื่อแบบสินค้า" ด้วยครับ');
      return;
    }

    if (variants.length === 0) {
      alert('กรุณาระบุขนาด ปริมาณ หรือไซส์สินค้าอย่างน้อย 1 รายการครับ');
      return;
    }

    const uniqueColors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[];
    const fallbackImage = category === 'perfume' 
      ? 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop';

    const newProductObj: Product = {
      id: editingProduct ? editingProduct.id : `huda-prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      arabicTitle: arabicTitle.trim(),
      category,
      description: description.trim() || 'สินค้าคุณภาพสูง นำเข้าจากเมืองดูไบ UAE แท้ 100%',
      fabric: fabric.trim() || (category === 'perfume' ? 'Oud Oil & Attar Perfume Dubai' : 'Nida Silk Dubai Original'),
      origin: 'เมืองดูไบ, UAE',
      images: [imageUrl.trim() || fallbackImage],
      colors: uniqueColors,
      variants: variants.map((v, idx) => ({
        id: `var-${Date.now()}-${idx}`,
        name: v.name.trim() || (category === 'perfume' ? `ขนาด ${idx + 1}` : `Size ${idx + 1}`),
        sku: v.sku || `HD-SKU-${idx + 1}`,
        price: isNaN(Number(v.price)) ? 0 : Number(v.price),
        costPrice: isNaN(Number(v.costPrice)) ? (isNaN(Number(v.price)) ? 0 : Math.round(Number(v.price) * 0.5)) : Number(v.costPrice),
        stockQuantity: isNaN(Number(v.stockQuantity)) ? 0 : Number(v.stockQuantity),
        color: v.color || '',
      })),
      rating: 5.0,
      reviewsCount: 1,
      isNew: true,
      updatedAt: Date.now(),
    };

    if (editingProduct) {
      updateProduct(newProductObj);
      alert(`อัปเดตข้อมูลสินค้า "${title}" เรียบร้อยแล้ว!`);
    } else {
      addProduct(newProductObj);
      setSelectedCategory('all');
      setAdminSearch('');
      alert(`เพิ่มสินค้าใหม่ "${title}" เข้าสู่ระบบเรียบร้อยแล้ว! แสดงผลหน้าร้านทันที`);
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  // Quick Preset Handlers
  const handleApplyDefaultPreset = () => {
    if (category === 'perfume') {
      setVariants(DEFAULT_PERFUME_SIZES);
    } else if (category === 'incense') {
      setVariants(DEFAULT_INCENSE_SIZES);
    } else if (category === 'other') {
      setVariants(DEFAULT_OTHER_SIZES);
    } else {
      setVariants(DEFAULT_DUBAI_SIZES);
    }
  };

  const handleAddSingleSize = (sizeName: string) => {
    const skuCode = `HD-${category.toUpperCase()}-${sizeName.replace(/[^0-9A-Z]/gi, '')}`;
    setVariants((prev) => [
      ...prev,
      {
        name: sizeName,
        sku: skuCode,
        price: 0,
        costPrice: 0,
        stockQuantity: 0,
        color: category === 'perfume' ? 'กลิ่นดูไบออริจินัล' : category === 'incense' ? 'ไม้หอมอูดออริจินัล' : category === 'other' ? 'มาตรฐาน' : 'สีดำ (Black)',
      },
    ]);
  };

  const handleAddVariantField = () => {
    setVariants([
      ...variants,
      { 
        name: category === 'perfume' ? 'ขวดสเปรย์ 50 ml' : category === 'incense' ? 'กระปุก 50g' : category === 'other' ? 'ชิ้น/กล่อง (Standard)' : 'Size 52 (ส่วนสูง ~150-155 ซม.)', 
        sku: `SKU-${variants.length + 1}`, 
        price: 0, 
        costPrice: 0,
        stockQuantity: 0, 
        color: category === 'perfume' ? 'กลิ่นดูไบออริจินัล' : category === 'incense' ? 'ไม้หอมอูดออริจินัล' : category === 'other' ? 'มาตรฐาน' : 'สีดำ (Black)' 
      },
    ]);
  };

  const handleRemoveVariantField = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  // Filter products by category & search in Admin Manager
  const filteredAdminProducts = products.filter((product) => {
    const matchesCat =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      !adminSearch ||
      product.title.toLowerCase().includes(adminSearch.toLowerCase()) ||
      product.description.toLowerCase().includes(adminSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories: { id: CategoryType; label: string }[] = [
    { id: 'all', label: 'ทั้งหมด (All)' },
    { id: 'abaya', label: 'ชุดอาบายะห์ (Abaya)' },
    { id: 'kaftan', label: 'ชุดคัฟทาน (Kaftan)' },
    { id: 'perfume', label: 'น้ำหอมดูไบ (Dubai Oud)' },
    { id: 'incense', label: 'เครื่องหอมดูไบ (Bukhoor)' },
    { id: 'combo', label: 'เซ็ตสุดคุ้ม (Combo Set)' },
    { id: 'other', label: 'อื่นๆ (ของเล่น ขนม ฯลฯ)' },
  ];

  return (
    <div className="space-y-6 text-xs text-stone-950">
      
      {/* Header & Action Buttons Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-amber-400/60 shadow-xl text-stone-950">
        <div>
          <h3 className="font-serif font-black text-lg text-stone-950 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <span>จัดการสต๊อกสินค้าเสื้อผ้า และน้ำหอมดูไบ (Dubai Catalog POS)</span>
          </h3>
          <p className="text-xs text-stone-800 font-extrabold mt-1">
            รองรับไซส์อาบายะห์ดูไบ (Size 52-58), ปริมาณน้ำหอมดูไบ (ml), ตัวเลือกสี/กลิ่น และปรับสต๊อกเรียลไทม์
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('switch_admin_tab_reports'));
              }
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 border border-emerald-700 cursor-pointer"
            title="เปิดดูสรุปต้นทุนสินค้า และกำไรคาดการณ์ในคลัง"
          >
            <TrendingUp className="w-4 h-4 text-white" />
            <span>ดูสรุปต้นทุน &amp; กำไรคลัง</span>
          </button>

          <button
            onClick={handleForceSync}
            className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-stone-950 border border-amber-400 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            title="ดึงข้อมูลสินค้าล่าสุดจากทุกเครื่องให้ตรงกัน 100%"
          >
            <RotateCcw className="w-4 h-4 text-amber-700 animate-spin-slow" />
            <span>ซิงก์ดึงข้อมูลสินค้าด่วน</span>
          </button>

          <button
            onClick={async () => {
              if (confirm('คุณต้องการลบรายการสินค้าทั้งหมดออกจากระบบเพื่อเริ่มเปิดร้านใส่สินค้าของคุณเองใช่หรือไม่?')) {
                await clearAllProducts();
                alert('ลบรายการสินค้าทั้งหมดออกจากระบบและฐานข้อมูลเรียบร้อยแล้ว!');
              }
            }}
            className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-950 border border-red-400 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            title="ลบสินค้าตัวอย่างทั้งหมดออกจากระบบเพื่อเริ่มขายจริง"
          >
            <Trash2 className="w-4 h-4 text-red-700" />
            <span>ล้างสินค้าตัวอย่างทั้งหมด</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 border border-amber-500 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-stone-950" />
            <span>เพิ่มแบบสินค้าใหม่</span>
          </button>
        </div>
      </div>

      {/* Admin Category Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-amber-400/60 shadow-md text-stone-950">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <Filter className="w-4 h-4 text-amber-600 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-md'
                  : 'bg-white text-stone-950 hover:bg-stone-100 border-2 border-stone-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72 flex items-center gap-1.5">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ค้นหาชื่อสินค้าในหลังบ้าน..."
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              className="w-full bg-white border-2 border-stone-400 rounded-xl py-1.5 pl-8 pr-3 text-xs text-stone-950 font-black placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-amber-600 absolute left-2.5 top-2.5" />
          </div>
          <VoiceInputButton
            onTranscript={(text) => setAdminSearch(text)}
            currentValue={adminSearch}
          />
        </div>
      </div>

      {/* Product & Size/Color Stock Table Grid */}
      <div className="space-y-4">
        {filteredAdminProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-amber-400/60 text-stone-950 text-xs space-y-3 shadow-md">
            <p className="text-sm font-serif text-amber-950 font-black">ยังไม่มีรายการสินค้าในหมวดหมู่นี้ (สต๊อกว่างพร้อมสำหรับเปิดร้านขายจริง)</p>
            <p className="text-xs text-stone-800 font-extrabold">กดปุ่ม "+ เพิ่มแบบสินค้าใหม่" ด้านบนเพื่อเพิ่มสินค้าของคุณได้ทันที!</p>
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md border border-amber-500 cursor-pointer"
            >
              + เพิ่มแบบสินค้าแรกของคุณ
            </button>
          </div>
        ) : (
          filteredAdminProducts.map((product) => {
            const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);

            return (
              <div
                key={product.id}
                className="bg-white border-2 border-amber-400/60 rounded-2xl p-5 space-y-4 shadow-xl text-stone-950 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      loading="lazy"
                      decoding="async"
                      className="w-16 h-20 object-cover rounded-xl border-2 border-amber-400 bg-stone-100 shrink-0 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black uppercase text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-400">
                          {product.category === 'perfume' ? 'น้ำหอมดูไบ' : product.category}
                        </span>
                        {product.colors && product.colors.length > 0 && (
                          <span className="text-xs font-black text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-400 flex items-center gap-1">
                            <Palette className="w-3.5 h-3.5 text-emerald-700" />
                            {product.colors.join(', ')}
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-black text-base sm:text-lg text-stone-950 mt-1">
                        {product.title}
                      </h4>
                      <p className="text-xs text-stone-800 font-extrabold mt-0.5">
                        สต๊อกรวมทั้งหมด: <strong className="text-emerald-800 text-sm font-black">{totalStock} ชิ้น</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setTitle(product.title);
                        setArabicTitle(product.arabicTitle || '');
                        setCategory(product.category);
                        setDescription(product.description || '');
                        setFabric(product.fabric || '');
                        setImageUrl(product.images[0]);
                        setVariants(
                          product.variants.map((v) => ({
                            name: v.name,
                            sku: v.sku,
                            price: v.price,
                            costPrice: v.costPrice ?? Math.round(v.price * 0.5),
                            stockQuantity: v.stockQuantity,
                            color: v.color || '',
                          }))
                        );
                        setIsAddModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md border border-amber-500 transition cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4 text-stone-950" />
                      <span>แก้ไขสินค้า &amp; ใส่ต้นทุน</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm(`คุณต้องการลบสินค้า "${product.title}" ออกจากคลังสินค้าใช่หรือไม่?\n\n*คำเตือน: การลบนี้จะทำการลบข้อมูลสินค้าออกจากคลังและหน้าคิดเงิน POS ทั่วโลก`)) {
                          deleteProduct(product.id);
                        }
                      }}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-950 border border-red-400 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                      title="ลบสินค้าชนิดนี้ออกจากคลังสินค้าอย่างถาวร"
                    >
                      <Trash2 className="w-4 h-4 text-red-700" />
                    </button>
                  </div>
                </div>

                {/* Size / Volume & Color Variants Quick Stock Adjuster */}
                <div>
                  <p className="text-xs font-serif font-black text-amber-950 mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>{product.category === 'perfume' ? 'สต๊อกน้ำหอมแยกตามขนาด/ปริมาณ (ml):' : 'สต๊อกสินค้าและต้นทุนแยกตามไซส์ (Size, Cost & Stock):'}</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {product.variants.map((variant) => {
                      const costVal = variant.costPrice ?? Math.round(variant.price * 0.5);
                      const profitVal = variant.price - costVal;

                      return (
                        <div
                          key={variant.id}
                          className={`p-3 rounded-2xl border-2 flex flex-col justify-between text-xs shadow-md transition-all gap-2 bg-stone-50 ${
                            variant.stockQuantity > 0
                              ? 'border-emerald-500'
                              : 'border-red-400'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-black text-stone-950 text-xs sm:text-sm">{variant.name}</span>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                                  variant.stockQuantity > 0
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-red-600 text-white'
                                }`}
                              >
                                {variant.stockQuantity > 0 ? `สต๊อก ${variant.stockQuantity} ชิ้น` : 'สต๊อกหมด (0)'}
                              </span>
                            </div>
                            {variant.color && (
                              <span className="text-xs text-amber-950 block font-black mb-1.5">
                                🎨 {variant.color}
                              </span>
                            )}
                            <div className="flex flex-wrap items-center gap-1.5 text-xs mt-1.5">
                              <span className="font-black text-stone-950 bg-white px-2 py-1 rounded-lg border border-stone-300">
                                ขาย ฿{variant.price.toLocaleString()}
                              </span>
                              
                              <span className="font-black text-amber-950 bg-amber-100 px-2 py-1 rounded-lg border border-amber-400">
                                ต้นทุน ฿{costVal.toLocaleString()}
                              </span>

                              <span className="font-black text-emerald-900 bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-400">
                                กำไร {profitVal >= 0 ? '+' : ''}฿{profitVal.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Product Modal with Sticky Header & Sticky Bottom Footer */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="relative bg-white border-2 border-amber-500 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl text-stone-950 my-4 max-h-[90vh] flex flex-col">
            
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-white px-5 py-4 border-b-2 border-amber-400/40 flex justify-between items-center shrink-0">
              <h3 className="font-serif font-black text-base sm:text-xl text-stone-950 flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-600" />
                <span>
                  {editingProduct 
                    ? 'แก้ไขสินค้า & สต๊อก (Edit Product)' 
                    : category === 'perfume' 
                      ? 'เพิ่มสินค้าหมวดน้ำหอมดูไบ (Dubai Perfume)' 
                      : 'เพิ่มสินค้าและกำหนดสต๊อกตามไซส์ (Add New Product)'}
                </span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-700 hover:text-stone-950 p-1.5 rounded-full border border-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs no-scrollbar flex flex-col justify-between">
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-stone-950 font-black text-xs sm:text-sm">ชื่อแบบสินค้า *</label>
                      <VoiceInputButton
                        onTranscript={(text) => setTitle(text)}
                        currentValue={title}
                      />
                    </div>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={category === 'perfume' ? 'เช่น น้ำหอมดูไบ Royal Oud Amber Dubai 100ml' : 'เช่น ชุดอาบายะห์ดูไบปักลายทอง Royal Crystal Abaya'}
                      className="w-full bg-white border-2 border-stone-400 focus:border-amber-500 rounded-xl p-3 text-stone-950 font-black text-sm placeholder-stone-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-950 mb-1 font-black text-xs sm:text-sm">เลือกหมวดหมู่สินค้า *</label>
                    <select
                      value={category}
                      onChange={(e) => handleCategoryChange(e.target.value as CategoryType)}
                      className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 text-stone-950 font-black text-sm focus:border-amber-500 shadow-md cursor-pointer focus:outline-none"
                    >
                      <option value="abaya" className="bg-white text-stone-950 font-bold py-2">ชุดอาบายะห์ (Abaya)</option>
                      <option value="kaftan" className="bg-white text-stone-950 font-bold py-2">ชุดคัฟทาน (Kaftan)</option>
                      <option value="perfume" className="bg-white text-stone-950 font-bold py-2">น้ำหอมดูไบ (Dubai Perfume / Oud)</option>
                      <option value="incense" className="bg-white text-stone-950 font-bold py-2">เครื่องหอม / ไม้หอมดูไบ (Bukhoor / Incense)</option>
                      <option value="combo" className="bg-white text-stone-950 font-bold py-2">เซ็ตสุดคุ้ม (Combo Set)</option>
                      <option value="other" className="bg-white text-stone-950 font-bold py-2">อื่นๆ (ของเล่นเด็ก ขนม สินค้าทั่วไป)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-stone-950 font-black text-xs sm:text-sm">
                        {category === 'perfume' ? 'ประเภทน้ำหอม / ส่วนผสม' : category === 'incense' ? 'ชนิดเครื่องหอม / ส่วนผสม' : category === 'other' ? 'ประเภทสินค้า / รายละเอียด' : 'ชนิดเนื้อผ้า (Fabric)'}
                      </label>
                      <VoiceInputButton
                        onTranscript={(text) => setFabric(text)}
                        currentValue={fabric}
                      />
                    </div>
                    <input
                      type="text"
                      value={fabric}
                      onChange={(e) => setFabric(e.target.value)}
                      placeholder={category === 'perfume' ? 'เช่น Oud Oil & Royal Amber' : 'เช่น Nida Silk Dubai Original'}
                      className="w-full bg-white border-2 border-stone-400 focus:border-amber-500 rounded-xl p-3 text-stone-950 font-black text-sm placeholder-stone-400 focus:outline-none"
                    />
                  </div>

                  {/* Compressed Image Upload Section */}
                  <div className="sm:col-span-2 space-y-2.5 p-3.5 bg-stone-50 rounded-2xl border-2 border-amber-400/50 shadow-md text-stone-950">
                    <label className="block text-stone-950 font-black text-xs sm:text-sm">
                      รูปภาพสินค้า (Smart Compressed Camera / Upload)
                    </label>

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow transition border border-amber-500">
                        <Camera className="w-4 h-4 text-stone-950" />
                        <span>ถ่ายภาพจากกล้อง</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={handleImageFileUpload}
                        />
                      </label>

                      <label className="cursor-pointer px-4 py-2.5 bg-stone-100 hover:bg-stone-200 border-2 border-stone-300 text-stone-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition">
                        <ImageIcon className="w-4 h-4 text-stone-700" />
                        <span>เลือกจากอัลบั้ม/คลังภาพ</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFileUpload}
                        />
                      </label>
                    </div>

                    <div className="pt-1">
                      <div className="relative">
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="หรือวางลิงก์รูปภาพ Image URL (https://...)"
                          className="w-full bg-white border-2 border-stone-400 rounded-xl p-2.5 text-stone-950 font-black text-xs pl-8 font-mono placeholder-stone-400 focus:outline-none focus:border-amber-500"
                        />
                        <LinkIcon className="w-4 h-4 text-amber-600 absolute left-2.5 top-3" />
                      </div>
                    </div>

                    {imageUrl && (
                      <div className="flex items-center gap-3 pt-2 border-t border-amber-400/30">
                        <img
                          src={imageUrl}
                          alt="Preview"
                          loading="lazy"
                          decoding="async"
                          className="w-16 h-20 object-cover rounded-xl border-2 border-amber-400 shadow-md shrink-0 bg-white"
                        />
                        <div className="space-y-1">
                          <span className="text-emerald-700 font-black block flex items-center gap-1 text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>ภาพถูกบีบอัดและพร้อมใช้งานทันที</span>
                          </span>
                          {imageUrl.startsWith('data:image') && (
                            <span className="text-[10px] text-amber-950 font-mono bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-400 inline-block font-black">
                              บีบอัดไฟล์เหลือเพียง ~{Math.round(((imageUrl.length * 3) / 4) / 1024)} KB (ย่อขนาด HD 600px โหลดเร็วสูงสุด)
                            </span>
                          )}
                          <span className="text-[10px] text-stone-600 truncate max-w-xs block font-mono font-bold">
                            {imageUrl.slice(0, 40)}...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-stone-950 font-black text-xs sm:text-sm">รายละเอียดสินค้า (ถ้ามี / ไม่บังคับกรอก)</label>
                      <VoiceInputButton
                        mode="append"
                        onTranscript={(text) => setDescription(text)}
                        currentValue={description}
                      />
                    </div>
                    <textarea
                      rows={3}
                      placeholder={category === 'perfume' ? 'เช่น กลิ่นหอมติดทนนาน 24 ชม. นำเข้าจากดูไบแท้' : 'กรอกหรือไม่กรอกก็ได้ (ไม่บังคับ)'}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-white border-2 border-stone-400 rounded-xl p-3 text-stone-950 font-black placeholder-stone-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Dynamic Size & Volume Variants Manager */}
                <div className="pt-4 border-t-2 border-amber-400/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-serif font-black text-amber-950 text-sm sm:text-base flex items-center gap-1.5">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <span>
                        {category === 'perfume'
                          ? 'กำหนดขนาดขวดน้ำหอม (ml), ราคา และสต๊อก:'
                          : 'กำหนดสี, ไซส์, ราคา และสต๊อกสินค้า:'}
                      </span>
                    </label>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleApplyDefaultPreset}
                        className="px-3 py-1.5 bg-amber-400 text-stone-950 rounded-xl text-xs font-black shadow hover:bg-amber-300 transition border border-amber-500 cursor-pointer"
                      >
                        {category === 'perfume' ? 'ปริมาณขวดมาตรฐานน้ำหอม' : 'ไซส์มาตรฐานอาบายะห์ดูไบ'}
                      </button>
                      <button
                        type="button"
                        onClick={handleAddVariantField}
                        className="px-3 py-1.5 bg-stone-100 text-stone-950 border-2 border-stone-300 rounded-xl text-xs font-black hover:bg-stone-200 transition cursor-pointer"
                      >
                        {category === 'perfume' ? '+ เพิ่มขนาดขวดอื่น' : '+ เพิ่มไซส์/สีอื่น'}
                      </button>
                    </div>
                  </div>

                  {/* Quick Add Buttons based on Category */}
                  <div className="flex flex-wrap items-center gap-2 bg-stone-50 p-3 rounded-2xl border-2 border-amber-400/40">
                    <span className="text-xs text-amber-950 font-black mr-1">ปุ่มกดเพิ่มเร็ว:</span>
                    {(category === 'perfume'
                      ? ['ขวดสเปรย์ 50 ml', 'ขวดสเปรย์ 100 ml', 'Attar Oil 12 ml', 'ขวดเทสเตอร์ 3 ml', 'ขนาดมาตรฐาน (Free Size)']
                      : category === 'incense'
                      ? ['กระปุก 50g', 'กระปุก 100g', 'เซ็ตเตาเผา + ถ่านหอม', 'ขนาดมาตรฐาน (Free Size)']
                      : category === 'other'
                      ? ['ชิ้น/กล่อง (Standard)', 'แพ็กสุดคุ้ม (Pack)', 'ขนาดมาตรฐาน (Free Size)']
                      : ['Size 52 (ส่วนสูง ~150-155 ซม.)', 'Size 54 (ส่วนสูง ~155-160 ซม.)', 'Size 56 (ส่วนสูง ~160-165 ซม.)', 'Size 58 (ส่วนสูง ~165-170 ซม.)']
                    ).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleAddSingleSize(sz)}
                        className="px-2.5 py-1 bg-white hover:bg-amber-400 text-stone-950 border border-stone-300 rounded-lg text-xs font-mono font-black transition shadow-xs cursor-pointer"
                      >
                        + {sz}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                    {variants.map((v, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border-2 shadow-md space-y-3 transition-all bg-stone-50 ${
                          v.stockQuantity > 0
                            ? 'border-emerald-500'
                            : 'border-red-400'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b-2 border-amber-400/30 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-black text-stone-950 font-serif">
                              รายการที่ {idx + 1}: {v.name || 'ไซส์/รายการใหม่'}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 text-xs font-black rounded-full ${
                                v.stockQuantity > 0
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              {v.stockQuantity > 0 ? `มีสต๊อก (${v.stockQuantity} ชิ้น)` : 'ไม่มีสต๊อก (0 ชิ้น)'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantField(idx)}
                            className="px-3 py-1 text-red-950 hover:bg-red-200 bg-red-100 border border-red-400 rounded-xl text-xs font-black transition flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-red-700" />
                            <span>ลบรายการนี้</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          
                          {/* Color / Scent Choice Field */}
                          <div className="sm:col-span-3 space-y-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-xs text-stone-950 font-black block">
                                {category === 'perfume' ? 'ตัวเลือกกลิ่น / สี' : 'สีสินค้า (Color)'}
                              </label>
                              <VoiceInputButton
                                onTranscript={(text) => {
                                  const updated = [...variants];
                                  updated[idx].color = text;
                                  setVariants(updated);
                                }}
                                currentValue={v.color || ''}
                              />
                            </div>
                            <input
                              type="text"
                              list="product-color-preset-list"
                              placeholder={category === 'perfume' ? 'เช่น กลิ่นอัมเบอร์ทอง' : 'เลือก/พิมพ์สี เช่น สีดำ (Black)'}
                              value={v.color || ''}
                              onFocus={(e) => e.target.select()}
                              onClick={(e) => (e.target as HTMLInputElement).select()}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].color = e.target.value;
                                setVariants(updated);
                              }}
                              className="w-full bg-white border-2 border-stone-400 rounded-xl p-2 text-stone-950 font-black text-xs sm:text-sm focus:outline-none focus:border-amber-500 shadow-inner"
                            />
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  const updated = [...variants];
                                  updated[idx].color = e.target.value;
                                  setVariants(updated);
                                }
                              }}
                              className="w-full bg-white border border-stone-300 rounded-xl px-2 py-1.5 text-xs text-stone-950 font-black hover:border-amber-500 transition cursor-pointer"
                            >
                              <option value="" className="bg-white text-stone-950 font-bold">-- เลือกสีด่วน (Quick Select) --</option>
                              {PRODUCT_COLOR_PRESETS.map((colorName) => (
                                <option key={colorName} value={colorName} className="bg-white text-stone-950 font-bold py-1">
                                  {colorName}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Size / Volume Name Field */}
                          <div className="sm:col-span-3 space-y-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-xs text-stone-950 font-black block">
                                {category === 'perfume' ? 'ขนาดปริมาณ (ml / ขวด)' : 'ชื่อไซส์ / ความยาว'}
                              </label>
                              <VoiceInputButton
                                onTranscript={(text) => {
                                  const updated = [...variants];
                                  updated[idx].name = text;
                                  setVariants(updated);
                                }}
                                currentValue={v.name}
                              />
                            </div>
                            <input
                              type="text"
                              placeholder={category === 'perfume' ? 'เช่น ขวดสเปรย์ 50 ml' : 'เช่น Size 52 (ส่วนสูง ~150-155 ซม.)'}
                              value={v.name}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].name = e.target.value;
                                setVariants(updated);
                              }}
                              className="w-full bg-white border-2 border-stone-400 rounded-xl p-2 text-stone-950 font-black text-xs sm:text-sm focus:outline-none focus:border-amber-500 shadow-inner"
                            />
                          </div>

                          {/* 3 Numeric Inputs Grid (Price, Cost Price, Stock) */}
                          <div className="sm:col-span-6 grid grid-cols-3 gap-2">
                            {/* Price Field */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-xs text-stone-950 block font-black truncate">
                                  ราคาขาย (บาท)
                                </label>
                                <VoiceInputButton
                                  isNumber={true}
                                  onNumberTranscript={(num) => {
                                    const updated = [...variants];
                                    updated[idx].price = num;
                                    if (updated[idx].costPrice === undefined || updated[idx].costPrice === 0) {
                                      updated[idx].costPrice = Math.round(num * 0.5);
                                    }
                                    setVariants(updated);
                                  }}
                                  onTranscript={() => {}}
                                />
                              </div>
                              <input
                                type="number"
                                placeholder="0"
                                value={v.price === 0 ? '' : v.price}
                                onFocus={(e) => e.target.select()}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                                onChange={(e) => {
                                  const updated = [...variants];
                                  const cleanVal = e.target.value.replace(/^0+(?=\d)/, '');
                                  const newPrice = cleanVal === '' ? 0 : Math.max(0, parseInt(cleanVal, 10) || 0);
                                  updated[idx].price = newPrice;
                                  if (updated[idx].costPrice === undefined || updated[idx].costPrice === 0) {
                                    updated[idx].costPrice = Math.round(newPrice * 0.5);
                                  }
                                  setVariants(updated);
                                }}
                                className="w-full bg-white border-2 border-stone-400 rounded-xl p-2 text-stone-950 font-black font-mono text-sm sm:text-base text-right shadow-inner focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              />
                            </div>

                            {/* Cost Price Field - High Visibility Badge Box */}
                            <div className="bg-amber-50 p-1.5 rounded-xl border-2 border-amber-400 shadow-sm">
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] text-amber-950 block font-black text-center bg-amber-200 rounded px-1.5 py-0.5 border border-amber-400 truncate">
                                  ต้นทุน (บาท)
                                </label>
                                <VoiceInputButton
                                  isNumber={true}
                                  onNumberTranscript={(num) => {
                                    const updated = [...variants];
                                    updated[idx].costPrice = num;
                                    setVariants(updated);
                                  }}
                                  onTranscript={() => {}}
                                />
                              </div>
                              <input
                                type="number"
                                placeholder="0"
                                value={v.costPrice === 0 ? '' : (v.costPrice ?? (v.price ? Math.round(v.price * 0.5) : 0))}
                                onFocus={(e) => e.target.select()}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                                onChange={(e) => {
                                  const updated = [...variants];
                                  const cleanVal = e.target.value.replace(/^0+(?=\d)/, '');
                                  updated[idx].costPrice = cleanVal === '' ? 0 : Math.max(0, parseInt(cleanVal, 10) || 0);
                                  setVariants(updated);
                                }}
                                className="w-full bg-white border-2 border-amber-400 rounded-lg p-2 text-stone-950 font-black font-mono text-sm sm:text-base text-right shadow-inner focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              />
                            </div>

                            {/* Stock Field */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-xs text-stone-950 block font-black truncate">
                                  สต๊อก (ชิ้น)
                                </label>
                                <VoiceInputButton
                                  isNumber={true}
                                  onNumberTranscript={(num) => {
                                    const updated = [...variants];
                                    updated[idx].stockQuantity = num;
                                    setVariants(updated);
                                  }}
                                  onTranscript={() => {}}
                                />
                              </div>
                              <input
                                type="number"
                                placeholder="0"
                                value={v.stockQuantity === 0 ? '' : v.stockQuantity}
                                onFocus={(e) => e.target.select()}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                                onChange={(e) => {
                                  const updated = [...variants];
                                  const cleanVal = e.target.value.replace(/^0+(?=\d)/, '');
                                  updated[idx].stockQuantity = cleanVal === '' ? 0 : Math.max(0, parseInt(cleanVal, 10) || 0);
                                  setVariants(updated);
                                }}
                                className="w-full bg-white border-2 border-emerald-400 rounded-xl p-2 text-stone-950 font-black font-mono text-sm sm:text-base text-right shadow-inner focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              />
                            </div>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sticky Bottom Footer */}
              <div className="sticky bottom-0 z-30 bg-white -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 border-t-2 border-amber-400/40 flex items-center justify-between gap-3 shrink-0 shadow-2xl mt-4">
                <span className="text-xs text-amber-950 font-black hidden sm:block">
                  ตรวจสอบความถูกต้อง แล้วกดปุ่มบันทึกสินค้า
                </span>
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-950 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer font-sans w-full sm:w-auto border border-emerald-700"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                    <span>บันทึกสินค้า (Save Product)</span>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}
      <datalist id="product-color-preset-list">
        {PRODUCT_COLOR_PRESETS.map((colorName) => (
          <option key={colorName} value={colorName} />
        ))}
      </datalist>
    </div>
  );
};
