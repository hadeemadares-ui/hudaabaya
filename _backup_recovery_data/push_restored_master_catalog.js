const fs = require('fs');

async function main() {
  const products = JSON.parse(fs.readFileSync('restored_master_products_with_images.json', 'utf8'));

  // Fix any perfume categories
  products.forEach(p => {
    const t = p.title.toLowerCase();
    if (
      t.includes('perfume') ||
      t.includes('edp') ||
      t.includes('น้ำหอม') ||
      t.includes('lattafa') ||
      t.includes('zaafaran') ||
      t.includes('shams') ||
      t.includes('sultan') ||
      t.includes('dirham') ||
      t.includes('maghribi') ||
      /^\d{3}\s/.test(p.title)
    ) {
      p.category = 'perfume';
      if (!p.fabric || p.fabric === '-' || p.fabric.includes('Nida Silk')) {
        p.fabric = 'Oud Oil & Attar Perfume Dubai';
      }
    }
  });

  console.log(`Loaded ${products.length} products to push.`);
  let realImgCount = 0;
  products.forEach(p => {
    if (p.images?.[0]?.startsWith('data:image')) realImgCount++;
  });
  console.log(`Products with real photos: ${realImgCount} / ${products.length}`);

  const payload = {
    replace_all: true,
    products: products,
    deletedIds: []
  };

  const bodyStr = JSON.stringify(payload);
  console.log(`Payload size: ${(bodyStr.length / 1024 / 1024).toFixed(2)} MB`);

  console.log('Sending POST to https://hudaabaya.pages.dev/api/sync ...');
  const res = await fetch('https://hudaabaya.pages.dev/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bodyStr
  });

  const resJson = await res.json();
  console.log('POST Response status:', res.status, resJson);

  console.log('Verifying with GET https://hudaabaya.pages.dev/api/sync ...');
  const getRes = await fetch('https://hudaabaya.pages.dev/api/sync?v=0');
  const getData = await getRes.json();
  console.log('GET Response success:', getData.success);
  console.log('Total products on Cloudflare KV:', getData.products?.length);

  let verifiedRealImages = 0;
  getData.products?.forEach(p => {
    const isReal = p.images?.[0]?.startsWith('data:image');
    if (isReal) verifiedRealImages++;
    console.log(`  - [${isReal ? 'REAL PHOTO' : 'NO PHOTO  '}] ${p.title} (${p.category})`);
  });
  console.log(`\nVERIFIED: ${verifiedRealImages} / ${getData.products?.length} products have REAL photos on Cloud!`);
}

main().catch(err => console.error('Error:', err));
