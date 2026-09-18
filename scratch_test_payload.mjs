const CLOUD_PRODUCTS_ID = 'ff808181a09d98f701a0aeaaf80c25e7';
const BASE_URL = 'https://api.restful-api.dev/objects';

async function testPayload() {
  console.log('Testing payload upload to restful-api.dev...');
  
  // Test large payload (e.g. 100KB base64)
  const largeBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(100000);
  const testProduct = {
    id: `huda-prod-testlarge-${Date.now()}`,
    title: 'ชุดอาบายะห์ดูไบ ชิฟฟอนพรีเมียม (Large Payload Test)',
    arabicTitle: 'Abaya Dubai Premium',
    category: 'abaya',
    description: 'ทดสอบรูปภาพ Base64 ขนาดใหญ่',
    fabric: 'Nida Silk Dubai',
    origin: 'UAE',
    images: [largeBase64],
    colors: ['ดำ'],
    variants: [{ id: 'v1', name: 'Size 54', sku: 'HD-54', price: 1990, costPrice: 900, stockQuantity: 5, color: 'ดำ' }],
    rating: 5,
    reviewsCount: 1,
    updatedAt: Date.now()
  };

  const res = await fetch(`${BASE_URL}/${CLOUD_PRODUCTS_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'huda_products_v3',
      data: { products: [testProduct] }
    })
  });

  console.log('PUT Status Code:', res.status);
  const text = await res.text();
  console.log('PUT Response Text:', text);
}

testPayload();
