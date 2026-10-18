const fs = require('fs');

async function main() {
  const products = JSON.parse(fs.readFileSync('ultimate_master_catalog.json', 'utf8'));

  // Ensure 015 เทปทอง is abaya
  const tepThong = products.find(p => p.title.includes('เทปทอง'));
  if (tepThong) {
    tepThong.category = 'abaya';
    tepThong.fabric = 'Nida Silk Dubai Original';
  }

  console.log(`Pushing ${products.length} products to Cloudflare Pages ...`);
  const payload = {
    replace_all: true,
    products: products,
    deletedIds: []
  };

  const bodyStr = JSON.stringify(payload);
  console.log(`Payload size: ${(bodyStr.length / 1024 / 1024).toFixed(2)} MB`);

  const res = await fetch('https://hudaabaya.pages.dev/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bodyStr
  });

  const resJson = await res.json();
  console.log('POST Response:', res.status, resJson);

  // Verify
  const getRes = await fetch('https://hudaabaya.pages.dev/api/sync?v=0');
  const getData = await getRes.json();
  console.log('Total products on Cloudflare KV:', getData.products?.length);

  let realPhotos = 0;
  getData.products?.forEach(p => {
    if (p.images?.[0]?.startsWith('data:image')) realPhotos++;
  });
  console.log(`Verified real photos count: ${realPhotos} / ${getData.products?.length}`);
}

main().catch(err => console.error(err));
