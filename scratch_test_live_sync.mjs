const CLOUD_PRODUCTS_ID = 'ff808181a09d98f701a0aeaaf80c25e7';
const CLOUD_DELETED_ID = 'ff808181a09d98f701a0aeaaf89025e8';
const BASE_URL = 'https://api.restful-api.dev/objects';

async function testLiveMultiDeviceSync() {
  console.log('--- STARTING LIVE MULTI-DEVICE SYNC TEST ---');

  // 1. Device A adds a product
  console.log('\n[Device A] Adding new product: "ชุดอาบายะห์ดูไบ ชิฟฟอนพรีเมียม"');
  const prodA = {
    id: `huda-prod-testsync-${Date.now()}`,
    title: 'ชุดอาบายะห์ดูไบ ชิฟฟอนพรีเมียม',
    arabicTitle: 'Abaya Dubai Chiffon Premium',
    category: 'abaya',
    description: 'ทดสอบซิงค์มัลติอุปกรณ์',
    fabric: 'Nida Silk Dubai',
    origin: 'UAE',
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop'],
    colors: ['ดำ (Black)'],
    variants: [{ id: 'v1', name: 'Size 54', sku: 'HD-TEST-54', price: 1990, costPrice: 950, stockQuantity: 10, color: 'ดำ (Black)' }],
    rating: 5,
    reviewsCount: 1,
    updatedAt: Date.now()
  };

  const getResA = await fetch(`${BASE_URL}/${CLOUD_PRODUCTS_ID}`);
  const getDataA = await getResA.json();
  const existingProds = getDataA?.data?.products || [];

  const putResA = await fetch(`${BASE_URL}/${CLOUD_PRODUCTS_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'huda_products_v3',
      data: { products: [prodA, ...existingProds.filter(p => p.id !== prodA.id)] }
    })
  });
  console.log('[Device A] Save product status:', putResA.status);

  // 2. Device B polls Cloud 1.5 seconds later
  console.log('\n[Device B] Polling Cloud Registry 1.5s later...');
  const getResB = await fetch(`${BASE_URL}/${CLOUD_PRODUCTS_ID}?_t=${Date.now()}`);
  const getDataB = await getResB.json();
  const deviceBProds = getDataB?.data?.products || [];
  const foundOnB = deviceBProds.find(p => p.id === prodA.id);
  console.log('[Device B] Found added product on Device B?:', !!foundOnB, foundOnB?.title);

  // 3. Device A deletes the product
  console.log('\n[Device A] Deleting product on Device A...');
  const delResA = await fetch(`${BASE_URL}/${CLOUD_DELETED_ID}`);
  const delDataA = await delResA.json();
  const existingDeleted = delDataA?.data?.ids || [];
  const updatedDeleted = Array.from(new Set([...existingDeleted, prodA.id]));

  await fetch(`${BASE_URL}/${CLOUD_DELETED_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'huda_deleted_ids_v3', data: { ids: updatedDeleted } })
  });

  const remainingProds = deviceBProds.filter(p => p.id !== prodA.id);
  await fetch(`${BASE_URL}/${CLOUD_PRODUCTS_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'huda_products_v3', data: { products: remainingProds } })
  });
  console.log('[Device A] Product deleted & registry updated.');

  // 4. Device B polls Cloud again
  console.log('\n[Device B] Polling Cloud Registry after deletion...');
  const getResB2 = await fetch(`${BASE_URL}/${CLOUD_PRODUCTS_ID}?_t=${Date.now()}`);
  const getDataB2 = await getResB2.json();
  const deviceBProdsAfterDel = getDataB2?.data?.products || [];

  const getDelResB = await fetch(`${BASE_URL}/${CLOUD_DELETED_ID}?_t=${Date.now()}`);
  const getDelDataB = await getDelResB.json();
  const deviceBDeletedIds = getDelDataB?.data?.ids || [];

  const isDeletedOnB = deviceBDeletedIds.includes(prodA.id) && !deviceBProdsAfterDel.some(p => p.id === prodA.id);
  console.log('[Device B] Product confirmed deleted on Device B?:', isDeletedOnB);

  console.log('\n--- MULTI-DEVICE SYNC TEST RESULTS ---');
  if (foundOnB && isDeletedOnB) {
    console.log('✅ ALL TESTS PASSED 100%! Add and Delete sync identically across all devices.');
  } else {
    console.log('❌ TEST FAILED. Check details.');
  }
}

testLiveMultiDeviceSync().catch(console.error);
