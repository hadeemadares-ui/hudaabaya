const fs = require('fs');

// Load all sources
const edgeProds = JSON.parse(fs.readFileSync('all_complete_recovered_products.json', 'utf8'));
const chromeProds = JSON.parse(fs.readFileSync('chrome_full_products.json', 'utf8'));
const baseProds = JSON.parse(fs.readFileSync('extracted_user_real_products.json', 'utf8'));
const allExhaustiveImages = JSON.parse(fs.readFileSync('all_exhaustive_extracted_images.json', 'utf8'));
const combinedImages = JSON.parse(fs.readFileSync('all_unique_real_images_combined.json', 'utf8'));

// Create a master image lookup by title
const imageLookup = new Map();

for (const [title, item] of Object.entries(combinedImages)) {
  imageLookup.set(title.trim(), item.img);
}

for (const item of allExhaustiveImages) {
  if (item.title && item.title !== 'UNKNOWN' && item.title !== 'DEPOSIT SLIP') {
    const t = item.title.trim();
    const existing = imageLookup.get(t);
    if (!existing || item.length > existing.length) {
      imageLookup.set(t, item.fullImage);
    }
  }
}

// Master map of all products
const masterMap = new Map();

// 1. Add base products
baseProds.forEach(p => {
  masterMap.set(p.title.trim(), p);
});

// 2. Add Chrome products
chromeProds.forEach(p => {
  const t = p.title.trim();
  const existing = masterMap.get(t);
  if (!existing) {
    masterMap.set(t, p);
  } else {
    // If chrome product has real image or more variants
    const pReal = p.images?.[0]?.startsWith('data:image');
    const exReal = existing.images?.[0]?.startsWith('data:image');
    if (!exReal && pReal) {
      masterMap.set(t, p);
    } else if (p.variants?.length > (existing.variants?.length || 0)) {
      masterMap.set(t, { ...p, images: existing.images });
    }
  }
});

// 3. Add Edge products
edgeProds.forEach(p => {
  const t = p.title.trim();
  const existing = masterMap.get(t);
  if (!existing) {
    masterMap.set(t, p);
  }
});

// 4. Also check all titles in imageLookup - every single one MUST be a product in masterMap!
for (const [title, img] of imageLookup.entries()) {
  let prod = masterMap.get(title);
  if (!prod) {
    // Create product
    const isPerfume = title.toLowerCase().includes('lattafa') || title.toLowerCase().includes('edp') || title.includes('น้ำหอม') || /^\d{3}\s/.test(title) || title.includes('asdaaf') || title.includes('Zaafaran');
    prod = {
      id: `huda-prod-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      title: title,
      arabicTitle: '',
      category: isPerfume ? 'perfume' : 'abaya',
      description: 'สินค้าคุณภาพสูง นำเข้าจากเมืองดูไบ UAE แท้ 100%',
      fabric: isPerfume ? 'Oud Oil & Attar Perfume Dubai' : 'Nida Silk Dubai Original',
      origin: 'เมืองดูไบ, UAE',
      images: [img],
      colors: isPerfume ? ['กลิ่นดูไบออริจินัล'] : ['สีดำ (Black)'],
      variants: isPerfume ? [
        { id: `var-${Date.now()}-1`, name: 'ขวดสเปรย์ (Original)', sku: `HD-PRF-${title.substring(0, 4).trim()}`, price: 990, costPrice: 490, stockQuantity: 5, color: 'กลิ่นดูไบออริจินัล' }
      ] : [
        { id: `var-${Date.now()}-52`, name: 'Size 52', sku: `HD-ABY-52`, price: 1590, costPrice: 890, stockQuantity: 2, color: 'สีดำ (Black)' },
        { id: `var-${Date.now()}-54`, name: 'Size 54', sku: `HD-ABY-54`, price: 1590, costPrice: 890, stockQuantity: 2, color: 'สีดำ (Black)' }
      ],
      rating: 5,
      reviewsCount: 1,
      isNew: true,
      updatedAt: Date.now()
    };
    masterMap.set(title, prod);
  } else {
    // Ensure the best high-res image is attached
    if (img && (!prod.images?.[0]?.startsWith('data:image') || img.length > prod.images[0].length)) {
      prod.images = [img];
    }
  }
}

// Ensure correct category
for (const prod of masterMap.values()) {
  const t = prod.title.toLowerCase();
  if (
    t.includes('perfume') || t.includes('edp') || t.includes('น้ำหอม') ||
    t.includes('lattafa') || t.includes('zaafaran') || t.includes('shams') ||
    t.includes('sultan') || t.includes('dirham') || t.includes('maghribi') ||
    t.includes('asdaaf') || t.includes('lacoste') || /^\d{3}\s/.test(prod.title)
  ) {
    prod.category = 'perfume';
  }
}

// Remove any dummy sample products (like 'ชุดอาบายะห์ดูไบ ปักลูกปัดเลื่อมทองคำ Royal Gold Abaya' if they are pure dummies)
const dummyTitles = [
  'ชุดคัฟทานราชาดูไบ ปักดิ้นทอง Luxury Dubai Kaftan Dress',
  'ชุดอาบายะห์ดูไบ ปักลูกปัดเลื่อมทองคำ Royal Gold Abaya',
  'ชุดอาบายะห์สีขาวไข่มุก ปักลูกไม้ดูไบ Pearl White Lace Abaya',
  'ชุดอาบายะห์สีดำมรกต คริสตัลดูไบ Emerald Velvet Abaya',
  'เซ็ตของขวัญพิเศษ: ชุดอาบายะห์ดูไบ + น้ำหอม Royal Oud',
  'น้ำหอมดูไบ Royal Sultan Oud & Rose EDP',
  'น้ำหอมอาหรับหัวน้ำมันแท้ Oud Amber Gold Attar Oil',
  'ชุดคัฟทาน', 'ชุดอาบายะห์เพชร', 'แมงกระพรุน', 'อาบายะห์', 'Emerat', 'YARA'
];

dummyTitles.forEach(dt => {
  // Only remove if it doesn't have a real uploaded photo
  const p = masterMap.get(dt);
  if (p && !p.images?.[0]?.startsWith('data:image')) {
    masterMap.delete(dt);
  }
});

const finalList = Array.from(masterMap.values());
console.log(`\n======================================================`);
console.log(`ULTIMATE CATALOG SIZE: ${finalList.length} products`);

let realCount = 0;
finalList.sort((a, b) => a.title.localeCompare(b.title)).forEach((p, i) => {
  const isReal = p.images?.[0]?.startsWith('data:image');
  if (isReal) realCount++;
  console.log(`${(i+1).toString().padStart(2)}. [${isReal ? 'REAL PHOTO' : 'NO PHOTO  '}] ${p.title} (${p.category}, variants: ${p.variants?.length})`);
});

console.log(`\nTOTAL PRODUCTS WITH REAL PHOTOS: ${realCount} / ${finalList.length}`);

fs.writeFileSync('ultimate_master_catalog.json', JSON.stringify(finalList, null, 2), 'utf8');
