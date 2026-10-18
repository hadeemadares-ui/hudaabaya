const fs = require('fs');

const p29 = JSON.parse(fs.readFileSync('extracted_user_real_products.json', 'utf8'));
const p78 = JSON.parse(fs.readFileSync('complete_78_products_catalog.json', 'utf8'));
const realImages = JSON.parse(fs.readFileSync('all_unique_real_images_combined.json', 'utf8'));

const finalMap = new Map();

// 1. First insert all 78 products
p78.forEach(p => {
  finalMap.set(p.title.trim(), p);
});

// 2. Overwrite with the 29 user products to keep exact stock and variants
p29.forEach(p => {
  const t = p.title.trim();
  finalMap.set(t, p);
});

// 3. Attach all real images and fix categories
for (const [title, p] of finalMap.entries()) {
  const t = title.trim();
  if (realImages[t] && realImages[t].img) {
    p.images = [realImages[t].img];
  }

  const lower = t.toLowerCase();
  if (
    lower.includes('perfume') || lower.includes('edp') || lower.includes('น้ำหอม') ||
    lower.includes('lattafa') || lower.includes('zaafaran') || lower.includes('shams') ||
    lower.includes('sultan') || lower.includes('dirham') || lower.includes('maghribi') ||
    lower.includes('asdaaf') || lower.includes('lacoste') || /^\d{3}\s/.test(t)
  ) {
    p.category = 'perfume';
  } else if (lower.includes('ไม้บาคัวร์') || lower.includes('thaljee') || lower.includes('greed')) {
    p.category = 'incense';
  } else {
    p.category = 'abaya';
  }
}

const list = Array.from(finalMap.values());
console.log(`TOTAL FINAL PRODUCTS: ${list.length}`);

let realPhotoCount = 0;
list.sort((a, b) => a.title.localeCompare(b.title)).forEach((p, i) => {
  const isReal = p.images?.[0]?.startsWith('data:image');
  if (isReal) realPhotoCount++;
  console.log(`${(i+1).toString().padStart(2)}. [${isReal ? 'REAL PHOTO' : 'NO PHOTO  '}] ${p.title} (${p.category}, variants: ${p.variants?.length})`);
});

console.log(`\nREAL PHOTOS: ${realPhotoCount} / ${list.length}`);
fs.writeFileSync('master_78_products.json', JSON.stringify(list, null, 2), 'utf8');

async function push() {
  const payload = {
    replace_all: true,
    products: list,
    deletedIds: []
  };

  console.log('Pushing 78 products to Cloudflare Pages...');
  const res = await fetch('https://hudaabaya.pages.dev/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const resJson = await res.json();
  console.log('Push Response:', res.status, resJson);

  // Verify
  const getRes = await fetch('https://hudaabaya.pages.dev/api/sync?v=0');
  const getData = await getRes.json();
  console.log(`Verified total products on Cloudflare KV: ${getData.products?.length}`);
}

push().catch(err => console.error(err));
