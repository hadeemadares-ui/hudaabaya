const CLOUD_PRODUCTS_ID = 'ff808181a09d98f701a0aeaaf80c25e7';
const BASE_URL = 'https://api.restful-api.dev/objects';

function sanitizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images.map((img) => {
    if (typeof img === 'string' && (img.startsWith('data:image') || img.length > 2000)) {
      return 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop';
    }
    return img;
  });
}

async function testSanitization() {
  console.log('Testing sanitizeImages fix...');
  const base64_30k = 'data:image/jpeg;base64,' + 'B'.repeat(30000);
  const rawProduct = {
    id: `huda-prod-realuser-${Date.now()}`,
    title: 'ชุดอาบายะห์ดูไบ ชิฟฟอนพรีเมียม (User Product)',
    category: 'abaya',
    images: [base64_30k],
    variants: [{ id: 'v1', name: 'Size 54', price: 1500, costPrice: 700, stockQuantity: 5, sku: 'HD-USER-1' }],
    updatedAt: Date.now()
  };

  const sanitized = {
    ...rawProduct,
    images: sanitizeImages(rawProduct.images)
  };

  console.log('Sanitized image URL:', sanitized.images[0]);

  const res = await fetch(`${BASE_URL}/${CLOUD_PRODUCTS_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'huda_products_v3',
      data: { products: [sanitized] }
    })
  });

  console.log('Sanitized PUT Status Code:', res.status);
  const data = await res.json();
  console.log('Saved Cloud Products Count:', data?.data?.products?.length);
  console.log('Saved Cloud Product Title:', data?.data?.products?.[0]?.title);
}

testSanitization();
