async function testJsonBlob() {
  console.log('Testing jsonblob.com (100% Free, CORS Enabled JSON Storage)...');
  
  // Create blob
  const createRes = await fetch('https://jsonblob.com/api/jsonBlob', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      products: [],
      deletedIds: [],
      orders: [],
      settings: {}
    })
  });

  console.log('jsonblob POST Status:', createRes.status);
  const locationHeader = createRes.headers.get('Location');
  console.log('jsonblob Location Header:', locationHeader);

  if (locationHeader) {
    // GET blob
    const getRes = await fetch(locationHeader, {
      headers: { 'Accept': 'application/json' }
    });
    console.log('jsonblob GET Status:', getRes.status);
    const getData = await getRes.json();
    console.log('jsonblob GET Data:', JSON.stringify(getData, null, 2));

    // PUT blob
    const putRes = await fetch(locationHeader, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        products: [{ id: 'p1', title: 'ชุดอาบายะห์ดูไบ ชิฟฟอนพรีเมียม', price: 1990 }],
        deletedIds: [],
        orders: [],
        settings: {}
      })
    });
    console.log('jsonblob PUT Status:', putRes.status);

    // Verify GET after PUT
    const getRes2 = await fetch(locationHeader, {
      headers: { 'Accept': 'application/json' }
    });
    const getData2 = await getRes2.json();
    console.log('jsonblob GET Data after PUT:', JSON.stringify(getData2, null, 2));
  }
}

testJsonBlob().catch(console.error);
