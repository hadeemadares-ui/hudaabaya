async function testCloudflareFunction() {
  console.log('Testing Cloudflare Native Pages Function GET /api/products...');
  const res = await fetch('https://hudaabaya.pages.dev/api/products');
  console.log('Status:', res.status, res.statusText);
  const data = await res.json();
  console.log('Response JSON:', JSON.stringify(data, null, 2));

  console.log('\nTesting POST /api/products...');
  const postRes = await fetch('https://hudaabaya.pages.dev/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'add_product',
      product: {
        id: `test-native-${Date.now()}`,
        title: 'ชุดอาบายะห์ดูไบ ชิฟฟอนพรีเมียม (Native Worker Test)',
        price: 1990,
        category: 'abaya',
        updatedAt: Date.now()
      }
    })
  });
  console.log('POST Status:', postRes.status, postRes.statusText);
  const postData = await postRes.json();
  console.log('POST Response JSON:', JSON.stringify(postData, null, 2));
}

testCloudflareFunction().catch(console.error);
