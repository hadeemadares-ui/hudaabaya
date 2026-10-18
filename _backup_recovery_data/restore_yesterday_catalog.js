const fs = require('fs');

const p29 = JSON.parse(fs.readFileSync('extracted_user_real_products.json', 'utf8'));
const allRealImages = JSON.parse(fs.readFileSync('all_unique_real_images_combined.json', 'utf8'));

// Attach best images
p29.forEach(p => {
  const t = p.title.trim();
  if (allRealImages[t] && allRealImages[t].img) {
    p.images = [allRealImages[t].img];
  }
});

console.log(`Prepared exact 29 products from yesterday.`);
let realCount = 0;
p29.forEach((p, i) => {
  const isReal = p.images?.[0]?.startsWith('data:image');
  if (isReal) realCount++;
  console.log(`${(i+1).toString().padStart(2)}. [${isReal ? 'REAL PHOTO' : 'NO PHOTO  '}] ${p.title} (${p.category})`);
});
console.log(`Real photos: ${realCount} / ${p29.length}`);

fs.writeFileSync('exact_yesterday_29_products.json', JSON.stringify(p29, null, 2), 'utf8');

async function pushToCloud() {
  const payload = {
    replace_all: true,
    products: p29,
    deletedIds: []
  };

  console.log('Pushing exact 29 products to Cloudflare Pages...');
  const res = await fetch('https://hudaabaya.pages.dev/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const resJson = await res.json();
  console.log('Response:', res.status, resJson);

  // Verify
  const getRes = await fetch('https://hudaabaya.pages.dev/api/sync?v=0');
  const getData = await getRes.json();
  console.log(`Cloud now has exactly: ${getData.products?.length} products!`);
}

pushToCloud().catch(err => console.error(err));
