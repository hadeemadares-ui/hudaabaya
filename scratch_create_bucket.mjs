async function testKvdbWithEmail() {
  console.log('Creating kvdb.io bucket with email parameter...');
  const res = await fetch('https://kvdb.io', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'email=hudaabaya.dubai@gmail.com'
  });
  console.log('kvdb bucket status:', res.status);
  const bucketId = (await res.text()).trim();
  console.log('kvdb Bucket ID:', bucketId);

  if (res.ok && bucketId.length > 5) {
    const putRes = await fetch(`https://kvdb.io/${bucketId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ id: 'p1', title: 'ชุดอาบายะห์ดูไบ', price: 1990 }])
    });
    console.log('kvdb PUT products status:', putRes.status);

    const getRes = await fetch(`https://kvdb.io/${bucketId}/products`);
    console.log('kvdb GET products status:', getRes.status);
    const data = await getRes.json();
    console.log('kvdb GET products data:', JSON.stringify(data, null, 2));
  }
}

testKvdbWithEmail();
