async function testKvdbKey() {
  const bucketId = 'UQNg7QJXXjtthTKoiXBCcW';
  console.log('Testing PUT/POST to kvdb bucket:', bucketId);

  const putRes = await fetch(`https://kvdb.io/${bucketId}/huda_products`, {
    method: 'POST',
    body: JSON.stringify([{ id: 'p1', title: 'ชุดอาบายะห์ดูไบ' }])
  });
  console.log('POST status:', putRes.status);
  const text = await putRes.text();
  console.log('POST response:', text);

  const getRes = await fetch(`https://kvdb.io/${bucketId}/huda_products`);
  console.log('GET status:', getRes.status);
  const getData = await getRes.json();
  console.log('GET data:', JSON.stringify(getData, null, 2));
}

testKvdbKey();
