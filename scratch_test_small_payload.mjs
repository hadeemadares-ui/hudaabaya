const CLOUD_PRODUCTS_ID = 'ff808181a09d98f701a0aeaaf80c25e7';
const BASE_URL = 'https://api.restful-api.dev/objects';

async function testSmallPayload() {
  console.log('Testing small payload upload to restful-api.dev...');

  const testProduct = {
    id: `huda-prod-testsmall-${Date.now()}`,
    title: 'ชุดอาบายะห์ดูไบ ชิฟฟอนพรีเมียม (Lightweight Payload Test)',
    arabicTitle: 'Abaya Dubai Premium',
    category: 'abaya',
    description: 'ทดสอบรูปภาพ URL เบาๆ',
    fabric: 'Nida Silk Dubai',
    origin: 'UAE',
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop'],
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
  console.log('PUT Response Text:', text.slice(0, 200));
}

testSmallPayload();
