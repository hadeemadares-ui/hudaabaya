'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Layers, X, Search, Filter, Camera, Image as ImageIcon, Link as LinkIcon, Sparkles, Palette, CheckCircle2, RotateCcw, TrendingUp } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, ProductVariant, CategoryType } from '../../types';

export const AdminProductManager: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    updateVariantStock,
    deleteProduct,
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
          const img = new Image();
          img.src = reader.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 800; // Compress high-res camera photos to max 800px
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
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            setImageUrl(compressed);
          };
        }
      };
      reader.readAsDataURL(file);
    }
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
      alert(`เพิ่มสินค้าใหม่ "${title}" เข้าสู่ระบบและแสดงผลหน้าร้านเรียบร้อยแล้ว!`);
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
    <div className="space-y-6">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dubai-black p-4 rounded-xl border border-gold-400/30">
        <div>
          <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-gold-400" />
            <span>จัดการสต๊อกสินค้าเสื้อผ้า และน้ำหอมดูไบ (Dubai Catalog POS)</span>
          </h3>
          <p className="text-xs text-gold-300/80">
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
            className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400/50 hover:border-emerald-300 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            title="เปิดดูสรุปต้นทุนสินค้า และกำไรคาดการณ์ในคลัง"
          >
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <span>📊 ดูสรุปต้นทุน & กำไรคลัง</span>
          </button>

          <button
            onClick={handleForceSync}
            className="px-3.5 py-2.5 bg-dubai-card border border-gold-400/40 hover:border-gold-400 text-gold-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            title="ดึงข้อมูลสินค้าล่าสุดจากทุกเครื่องให้ตรงกัน 100%"
          >
            <RotateCcw className="w-4 h-4 text-gold-400 animate-spin-slow" />
            <span>ซิงก์ดึงข้อมูลสินค้าด่วน</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-amber-600 text-dubai-black font-extrabold text-xs rounded-xl shadow-gold-glow hover:scale-105 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มแบบสินค้าใหม่</span>
          </button>
        </div>
      </div>

      {/* Admin Category Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-dubai-black p-3.5 rounded-xl border border-gold-400/20">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <Filter className="w-4 h-4 text-gold-400 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-gold-500 text-dubai-black font-bold shadow'
                  : 'bg-dubai-card text-gold-200/80 hover:text-white border border-gold-400/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="ค้นหาชื่อสินค้าในหลังบ้าน..."
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
            className="w-full bg-dubai-dark border border-gold-400/30 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-400"
          />
          <Search className="w-3.5 h-3.5 text-gold-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Product & Size/Color Stock Table Grid */}
      <div className="space-y-4">
        {filteredAdminProducts.length === 0 ? (
          <div className="text-center py-16 bg-dubai-black rounded-xl border border-gold-400/20 text-gray-400 text-xs space-y-3">
            <p className="text-sm font-serif text-gold-400 font-bold">ยังไม่มีรายการสินค้าในหมวดหมู่นี้ (สต๊อกว่างพร้อมสำหรับเปิดร้านขายจริง)</p>
            <p className="text-xs text-gray-400">กดปุ่ม "+ เพิ่มแบบสินค้าใหม่" ด้านบนเพื่อเพิ่มสินค้าของคุณได้ทันที!</p>
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-600 text-dubai-black font-extrabold text-xs rounded-xl shadow-gold-glow"
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
                className="bg-dubai-card border border-gold-400/30 rounded-xl p-4 space-y-3 shadow-lg hover:border-gold-400/60 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold-400/20 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      loading="lazy"
                      decoding="async"
                      className="w-14 h-16 object-cover rounded-lg border border-gold-400/30 bg-dubai-black shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-gold-400 bg-dubai-black px-2 py-0.5 rounded border border-gold-400/20">
                          {product.category === 'perfume' ? 'น้ำหอมดูไบ' : product.category}
                        </span>
                        {product.colors && product.colors.length > 0 && (
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                            <Palette className="w-3 h-3 text-emerald-400" />
                            {product.colors.join(', ')}
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-sm text-white mt-0.5">
                        {product.title}
                      </h4>
                      <p className="text-xs text-gray-400">
                        สต๊อกรวมทั้งหมด: <strong className="text-gold-300">{totalStock} ชิ้น</strong>
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
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 via-gold-400 to-amber-600 text-dubai-black font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-gold-glow hover:scale-105 transition cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4 text-dubai-black" />
                      <span>✏️ แก้ไขสินค้า & ใส่ต้นทุน</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm(`คุณต้องการลบสินค้า "${product.title}" ใช่หรือไม่?`)) {
                          deleteProduct(product.id);
                        }
                      }}
                      className="p-2 bg-red-950/60 border border-red-800/40 text-red-300 hover:text-red-100 rounded-xl text-xs flex items-center gap-1 transition"
                      title="ลบสินค้าชนิดนี้ออกจากระบบ"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Size / Volume & Color Variants Quick Stock Adjuster */}
                <div>
                  <p className="text-xs font-serif font-bold text-gold-300 mb-2">
                    {product.category === 'perfume' ? 'สต๊อกน้ำหอมแยกตามขนาด/ปริมาณ (ml):' : 'สต๊อกสินค้าและต้นทุนแยกตามไซส์ (Size, Cost & Stock):'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="p-2.5 bg-dubai-black rounded-xl border border-gold-400/30 flex items-center justify-between text-xs shadow-sm"
                      >
                        <div>
                          <span className="font-bold text-white block">{variant.name}</span>
                          {variant.color && (
                            <span className="text-[10px] text-amber-300 block font-serif">
                              🎨 {variant.color}
                            </span>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] mt-1">
                            <span className="font-bold text-gold-300 bg-dubai-dark px-1.5 py-0.5 rounded border border-gold-400/20">
                              💰 ขาย ฿{variant.price.toLocaleString()}
                            </span>
                            
                            {/* Inlined Bright Orange Cost Price Box */}
                            <div className="bg-amber-950/90 px-1.5 py-0.5 rounded-lg border-2 border-amber-500 flex items-center gap-1 shadow-md">
                              <span className="text-[9px] text-amber-300 font-extrabold shrink-0">🟧 ต้นทุน</span>
                              <input
                                type="number"
                                placeholder="0"
                                value={variant.costPrice ?? Math.round(variant.price * 0.5)}
                                onChange={(e) => {
                                  const newCost = Number(e.target.value);
                                  const updatedVariants = product.variants.map((v) =>
                                    v.id === variant.id ? { ...v, costPrice: newCost } : v
                                  );
                                  updateProduct({
                                    ...product,
                                    variants: updatedVariants,
                                    updatedAt: Date.now(),
                                  });
                                }}
                                className="w-16 bg-amber-950 border border-amber-400/80 rounded px-1 py-0.5 text-amber-200 font-extrabold font-mono text-xs text-right shadow-inner focus:ring-1 focus:ring-amber-400 focus:outline-none"
                              />
                            </div>

                            <span className="font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                              กำไร +฿{(variant.price - (variant.costPrice ?? Math.round(variant.price * 0.5))).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Stock Plus/Minus Quick Counter */}
                        <div className="flex items-center gap-1 bg-dubai-dark p-1 rounded border border-gold-400/30">
                          <button
                            onClick={() => updateVariantStock(product.id, variant.id, variant.stockQuantity - 1)}
                            className="w-5 h-5 rounded bg-dubai-card text-gold-400 hover:bg-gold-500 hover:text-dubai-black font-bold flex items-center justify-center text-xs"
                            title="ลดสต๊อก 1 ชิ้น"
                          >
                            -
                          </button>
                          <span
                            className={`px-2 font-mono font-bold text-xs ${
                              variant.stockQuantity === 0 ? 'text-red-400' : 'text-emerald-400'
                            }`}
                          >
                            {variant.stockQuantity}
                          </span>
                          <button
                            onClick={() => updateVariantStock(product.id, variant.id, variant.stockQuantity + 1)}
                            className="w-5 h-5 rounded bg-dubai-card text-gold-400 hover:bg-gold-500 hover:text-dubai-black font-bold flex items-center justify-center text-xs"
                            title="เพิ่มสต๊อก 1 ชิ้น"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Product Modal with Sticky Header & Sticky Bottom Footer */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-dubai-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="relative bg-dubai-card border-2 border-gold-400/60 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl text-white my-4 max-h-[90vh] flex flex-col">
            
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-dubai-black/95 backdrop-blur-md px-5 py-4 border-b border-gold-400/40 flex justify-between items-center shrink-0">
              <h3 className="font-serif font-bold text-base sm:text-lg text-gold-300 flex items-center gap-2">
                <Palette className="w-5 h-5 text-gold-400" />
                <span>
                  {editingProduct 
                    ? 'แก้ไขสินค้า & สต๊อก' 
                    : category === 'perfume' 
                      ? 'เพิ่มสินค้าหมวดน้ำหอมดูไบ (Dubai Perfume)' 
                      : 'เพิ่มสินค้าและกำหนดสต๊อกตามไซส์'}
                </span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gold-400 hover:text-white p-1.5 rounded-full border border-gold-400/30 hover:border-gold-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs no-scrollbar flex flex-col justify-between">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-gray-300 mb-1 font-bold">ชื่อแบบสินค้า *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={category === 'perfume' ? 'เช่น น้ำหอมดูไบ Royal Oud Amber Dubai 100ml' : 'เช่น ชุดอาบายะห์ดูไบปักลายทอง Royal Crystal Abaya'}
                      className="w-full bg-dubai-black border border-gold-400/30 rounded p-2 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-gold-400 mb-1 font-bold">เลือกหมวดหมู่สินค้า *</label>
                    <select
                      value={category}
                      onChange={(e) => handleCategoryChange(e.target.value as CategoryType)}
                      className="w-full bg-dubai-black border border-gold-400/50 rounded p-2 text-gold-300 font-bold focus:border-gold-400"
                    >
                      <option value="abaya">👗 ชุดอาบายะห์ (Abaya)</option>
                      <option value="kaftan">✨ ชุดคัฟทาน (Kaftan)</option>
                      <option value="perfume">💎 น้ำหอมดูไบ (Dubai Perfume / Oud)</option>
                      <option value="incense">🌿 เครื่องหอม / ไม้หอมดูไบ (Bukhoor / Incense)</option>
                      <option value="combo">🎁 เซ็ตสุดคุ้ม (Combo Set)</option>
                      <option value="other">🧸 อื่นๆ (ของเล่นเด็ก ขนม สินค้าทั่วไป)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-1">
                      {category === 'perfume' ? 'ประเภทน้ำหอม / ส่วนผสม' : category === 'incense' ? 'ชนิดเครื่องหอม / ส่วนผสม' : category === 'other' ? 'ประเภทสินค้า / รายละเอียด' : 'ชนิดเนื้อผ้า (Fabric)'}
                    </label>
                    <input
                      type="text"
                      value={fabric}
                      onChange={(e) => setFabric(e.target.value)}
                      placeholder={category === 'perfume' ? 'เช่น Oud Oil & Royal Amber' : 'เช่น Nida Silk Dubai Original'}
                      className="w-full bg-dubai-black border border-gold-400/30 rounded p-2 text-white"
                    />
                  </div>

                  {/* Upgraded Compressed Image Upload Section */}
                  <div className="sm:col-span-2 space-y-2 p-3 bg-dubai-black rounded-xl border border-gold-400/30">
                    <label className="block text-gold-300 font-bold">
                      รูปภาพสินค้า (Smart Compressed Camera / Upload)
                    </label>

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer px-3 py-2 bg-gradient-to-r from-gold-500 to-amber-600 text-dubai-black font-extrabold rounded-lg text-xs flex items-center gap-1.5 shadow hover:scale-102 transition">
                        <Camera className="w-4 h-4" />
                        <span>ถ่ายภาพจากกล้อง</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={handleImageFileUpload}
                        />
                      </label>

                      <label className="cursor-pointer px-3 py-2 bg-dubai-dark border border-gold-400/40 text-gold-300 hover:text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition">
                        <ImageIcon className="w-4 h-4 text-gold-400" />
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
                          className="w-full bg-dubai-dark border border-gold-400/30 rounded p-2 text-white text-xs pl-8 font-mono"
                        />
                        <LinkIcon className="w-3.5 h-3.5 text-gold-400 absolute left-2.5 top-2.5" />
                      </div>
                    </div>

                    {imageUrl && (
                      <div className="flex items-center gap-3 pt-2 border-t border-gold-400/10">
                        <img
                          src={imageUrl}
                          alt="Preview"
                          loading="lazy"
                          decoding="async"
                          className="w-16 h-20 object-cover rounded-lg border border-gold-400 shadow-md"
                        />
                        <div>
                          <span className="text-emerald-400 font-bold block">✓ ภาพพร้อมใช้งานเรียบร้อย</span>
                          <span className="text-[10px] text-gray-400 truncate max-w-xs block font-mono">
                            {imageUrl.slice(0, 40)}...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-gray-300 mb-1">รายละเอียดสินค้า (ถ้ามี / ไม่บังคับกรอก)</label>
                    <textarea
                      rows={3}
                      placeholder={category === 'perfume' ? 'เช่น กลิ่นหอมติดทนนาน 24 ชม. นำเข้าจากดูไบแท้' : 'กรอกหรือไม่กรอกก็ได้ (ไม่บังคับ)'}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-dubai-black border border-gold-400/30 rounded p-2 text-white placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Dynamic Size & Volume Variants Manager */}
                <div className="pt-3 border-t border-gold-400/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-serif font-bold text-gold-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-gold-400" />
                      <span>
                        {category === 'perfume'
                          ? 'กำหนดขนาดขวดน้ำหอม (ml), ราคา และสต๊อก:'
                          : 'กำหนดสี, ไซส์, ราคา และสต๊อกสินค้า:'}
                      </span>
                    </label>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleApplyDefaultPreset}
                        className="px-2.5 py-1 bg-gold-500 text-dubai-black rounded text-[11px] font-extrabold shadow-sm hover:scale-102 transition"
                      >
                        {category === 'perfume' ? '⚡ ปริมาณขวดมาตรฐานน้ำหอม' : '⚡ ไซส์มาตรฐานอาบายะห์ดูไบ'}
                      </button>
                      <button
                        type="button"
                        onClick={handleAddVariantField}
                        className="px-2.5 py-1 bg-dubai-dark text-gold-300 border border-gold-400/30 rounded text-[11px] font-bold"
                      >
                        {category === 'perfume' ? '+ เพิ่มขนาดขวดอื่น' : '+ เพิ่มไซส์/สีอื่น'}
                      </button>
                    </div>
                  </div>

                  {/* Quick Add Buttons based on Category */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-dubai-black p-2.5 rounded-xl border border-gold-400/20">
                    <span className="text-[11px] text-gray-400 font-bold mr-1">ปุ่มกดเพิ่มเร็ว:</span>
                    {(category === 'perfume'
                      ? ['ขวดสเปรย์ 50 ml', 'ขวดสเปรย์ 100 ml', 'Attar Oil 12 ml', 'ขวดเทสเตอร์ 3 ml', 'ขนาดมาตรฐาน (Free Size)']
                      : category === 'incense'
                      ? ['กระปุก 50g', 'กระปุก 100g', 'เซ็ตเตาเผา + ถ่านหอม', 'ขนาดมาตรฐาน (Free Size)']
                      : category === 'other'
                      ? ['ชิ้น/กล่อง (Standard)', 'แพ็กสุดคุ้ม (Pack)', 'ขนาดมาตรฐาน (Free Size)']
                      : ['Size 52 (ส่วนสูง ~150-155 ซม.)', 'Size 54 (ส่วนสูง ~155-160 ซม.)', 'Size 56 (ส่วนสูง ~160-165 ซม.)', 'Size 58 (ส่วนสูง ~165-170 ซม.)', 'Size S', 'Size M', 'Size L', 'Free Size']
                    ).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleAddSingleSize(sz)}
                        className="px-2 py-1 bg-dubai-dark hover:bg-gold-500 hover:text-dubai-black text-gold-300 border border-gold-400/30 rounded text-[10px] font-mono font-bold transition"
                      >
                        + {sz}
                      </button>
                    ))}
                  </div>

                  {/* Explicit Owner Cost Notice Banner */}
                  <div className="bg-amber-950/80 border-2 border-amber-500/80 rounded-xl p-3 text-xs text-amber-200 shadow-md space-y-1">
                    <div className="font-extrabold text-amber-300 text-xs sm:text-sm flex items-center gap-1.5">
                      <span>🟧 คำแนะนำสำหรับเจ้าของร้าน: กรอกราคาต้นทุนสินค้า</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      โปรดกรอกราคาต้นทุนสินค้าจริงในช่อง <strong>[ 🟧 ต้นทุน (บาท) ]</strong> สีส้มสดของแต่ละไซส์ด้านล่างได้เลยครับ ระบบจะนำราคาต้นทุนนี้ไปคำนวณกำไรสุทธิให้อัตโนมัติในหน้ารายงานยอดขาย
                    </p>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                    {variants.map((v, idx) => (
                      <div key={idx} className="bg-dubai-black p-3.5 rounded-xl border-2 border-gold-400/40 shadow-md space-y-2.5">
                        <div className="flex items-center justify-between border-b border-gold-400/20 pb-1.5">
                          <span className="text-[11px] font-bold text-gold-300 font-serif">
                            รายการที่ {idx + 1}: {v.name || 'ไซส์/รายการใหม่'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantField(idx)}
                            className="px-2.5 py-1 text-red-300 hover:text-white bg-red-950/80 hover:bg-red-900 border border-red-700/50 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ลบรายการนี้</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          
                          {/* Color / Scent Choice Field */}
                          <div className="sm:col-span-3">
                            <label className="text-[10px] text-amber-400 font-bold block mb-1">
                              {category === 'perfume' ? '💧 ตัวเลือกกลิ่น / สี' : '🎨 สีสินค้า (Color)'}
                            </label>
                            <input
                              type="text"
                              placeholder={category === 'perfume' ? 'เช่น กลิ่นอัมเบอร์ทอง' : 'เช่น สีดำ, สีทอง'}
                              value={v.color || ''}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].color = e.target.value;
                                setVariants(updated);
                              }}
                              className="w-full bg-dubai-dark border border-gold-400/30 rounded p-1.5 text-amber-300 font-bold text-xs"
                            />
                          </div>

                          {/* Size / Volume Name Field */}
                          <div className="sm:col-span-3">
                            <label className="text-[10px] text-gray-300 block mb-1 font-bold">
                              {category === 'perfume' ? 'ขนาดปริมาณ (ml / ขวด)' : 'ชื่อไซส์ / ความยาว'}
                            </label>
                            <input
                              type="text"
                              placeholder={category === 'perfume' ? 'เช่น ขวดสเปรย์ 50 ml' : 'เช่น Size 52 (ส่วนสูง ~150-155 ซม.)'}
                              value={v.name}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].name = e.target.value;
                                setVariants(updated);
                              }}
                              className="w-full bg-dubai-dark border border-gold-400/30 rounded p-1.5 text-white font-bold text-xs"
                            />
                          </div>

                          {/* 3 Numeric Inputs Grid (Price, Cost Price, Stock) */}
                          <div className="sm:col-span-6 grid grid-cols-3 gap-2">
                            {/* Price Field */}
                            <div>
                              <label className="text-[10px] text-gold-400 block mb-1 font-extrabold truncate">
                                💰 ราคาขาย
                              </label>
                              <input
                                type="number"
                                placeholder="0"
                                value={v.price}
                                onChange={(e) => {
                                  const updated = [...variants];
                                  const newPrice = Number(e.target.value);
                                  updated[idx].price = newPrice;
                                  if (updated[idx].costPrice === undefined || updated[idx].costPrice === 0) {
                                    updated[idx].costPrice = Math.round(newPrice * 0.5);
                                  }
                                  setVariants(updated);
                                }}
                                className="w-full bg-dubai-dark border-2 border-gold-400/60 rounded p-1.5 text-gold-300 font-extrabold font-mono text-xs sm:text-sm text-right"
                              />
                            </div>

                            {/* Cost Price Field - High Visibility Orange Badge Box */}
                            <div className="bg-amber-950/80 p-1 rounded-lg border-2 border-amber-500 shadow-md">
                              <label className="text-[10px] text-amber-300 block mb-0.5 font-extrabold text-center bg-amber-500/20 rounded py-0.5 border border-amber-500/40 truncate">
                                🟧 ต้นทุน (บาท)
                              </label>
                              <input
                                type="number"
                                placeholder="0"
                                value={v.costPrice ?? (v.price ? Math.round(v.price * 0.5) : 0)}
                                onChange={(e) => {
                                  const updated = [...variants];
                                  updated[idx].costPrice = Number(e.target.value);
                                  setVariants(updated);
                                }}
                                className="w-full bg-amber-950 border-2 border-amber-400 rounded p-1.5 text-amber-200 font-extrabold font-mono text-xs sm:text-sm text-right shadow-inner focus:ring-2 focus:ring-amber-400 focus:outline-none"
                              />
                            </div>

                            {/* Stock Field */}
                            <div>
                              <label className="text-[10px] text-emerald-400 block mb-1 font-extrabold truncate">
                                📦 สต๊อก (ชิ้น)
                              </label>
                              <input
                                type="number"
                                placeholder="0"
                                value={v.stockQuantity}
                                onChange={(e) => {
                                  const updated = [...variants];
                                  updated[idx].stockQuantity = Number(e.target.value);
                                  setVariants(updated);
                                }}
                                className="w-full bg-dubai-dark border-2 border-emerald-500/60 rounded p-1.5 text-emerald-300 font-extrabold font-mono text-xs sm:text-sm text-right"
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
              <div className="sticky bottom-0 z-30 bg-dubai-black/95 backdrop-blur-md -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 border-t-2 border-gold-400/50 flex items-center justify-between gap-3 shrink-0 shadow-2xl mt-4">
                <span className="text-[11px] text-gold-300/80 font-bold hidden sm:block">
                  ✨ ตรวจสอบความถูกต้อง แล้วกดปุ่มบันทึกสินค้า
                </span>
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 bg-dubai-dark hover:bg-gold-500/20 border border-gold-400/30 text-gray-300 rounded-xl font-bold text-xs transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-dubai-black font-extrabold rounded-xl text-xs sm:text-sm shadow-gold-strong scale-100 hover:scale-105 transition flex items-center justify-center gap-2 cursor-pointer font-sans w-full sm:w-auto"
                  >
                    <CheckCircle2 className="w-5 h-5 text-dubai-black shrink-0" />
                    <span>💾 บันทึกสินค้า (Save Product)</span>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};
