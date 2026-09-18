const CLOUD_PRODUCTS_ID = 'ff808181a09d98f701a0aeaaf80c25e7';
const BASE_URL = 'https://api.restful-api.dev/objects';

async function testMediumBase64() {
  const base64_30k = 'data:image/jpeg;base64,' + 'B'.repeat(30000);
  const prod = {
    id: `huda-prod-test30k-${Date.now()}`,
    title: 'ชุดอาบายะห์ดูไบ (30K Base64 Test)',
    category: 'abaya',
    images: [base64_30k],
    variants: [{ id: 'v1', name: 'Size 54', price: 1500, costPrice: 700, stockQuantity: 5, sku: 'HD-30K' }],
    updatedAt: Date.now()
  };

  const res = await fetch(`${BASE_URL}/${CLOUD_PRODUCTS_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'huda_products_v3',
      data: { products: [prod] }
    })
  });

  console.log('30K Base64 PUT Status Code:', res.status);
  const text = await res.text();
  console.log('30K Base64 Response:', text.slice(0, 200));
}

testMediumBase64();
