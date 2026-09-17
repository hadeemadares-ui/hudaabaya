const CLOUD_PRODUCTS_ID = 'ff808181a09d98f701a0ae89e765250a';

async function testPut() {
  const testProduct = {
    id: `huda-prod-test-${Date.now()}`,
    title: 'ชุดอาบายะห์ดูไบพรีเมียม (Test)',
    arabicTitle: 'Abaya Dubai Premium',
    category: 'abaya',
    description: 'ทดสอบระบบ Cloud Registry',
    fabric: 'Nida Silk Dubai',
    origin: 'เมืองดูไบ, UAE',
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop'],
    colors: ['ดำ'],
    variants: [{ id: 'v1', name: 'Size 54', sku: 'HD-AB-54', price: 1890, costPrice: 900, stockQuantity: 5, color: 'สีดำ (Black)' }],
    rating: 5,
    reviewsCount: 1,
    updatedAt: Date.now()
  };

  console.log('Sending PUT request to Cloud Registry...');
  const res = await fetch(`https://api.restful-api.dev/objects/${CLOUD_PRODUCTS_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'huda_active_products_v2',
      data: { products: [testProduct] }
    })
  });

  console.log('PUT status:', res.status);
  const putData = await res.json();
  console.log('PUT response:', JSON.stringify(putData, null, 2));

  console.log('Verifying GET request...');
  const getRes = await fetch(`https://api.restful-api.dev/objects/${CLOUD_PRODUCTS_ID}`);
  const getData = await getRes.json();
  console.log('GET response products count:', getData?.data?.products?.length);
  console.log('GET product title:', getData?.data?.products?.[0]?.title);
}

testPut();
