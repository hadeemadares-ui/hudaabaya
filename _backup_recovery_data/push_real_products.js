const fs = require('fs');

async function main() {
  const products = JSON.parse(fs.readFileSync('extracted_user_real_products.json', 'utf8'));
  console.log(`Loaded ${products.length} products to push.`);
  console.log('Sample product titles:', products.slice(0, 5).map(p => p.title));

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
    headers: {
      'Content-Type': 'application/json',
    },
    body: bodyStr,
  });

  const resJson = await res.json();
  console.log('POST Response status:', res.status, resJson);

  console.log('Verifying with GET https://hudaabaya.pages.dev/api/sync ...');
  const getRes = await fetch('https://hudaabaya.pages.dev/api/sync?v=0');
  const getData = await getRes.json();
  console.log('GET Response success:', getData.success);
  console.log('Total products on Cloudflare KV:', getData.products?.length);
  console.log('Cloudflare KV products:', getData.products?.map(p => p.title));
}

main().catch(err => console.error('Error:', err));
