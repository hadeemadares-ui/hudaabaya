async function testNpoint() {
  console.log('Testing npoint.io permanent JSON storage...');

  // Create bin
  const createRes = await fetch('https://api.npoint.io', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      products: [],
      deletedIds: [],
      orders: [],
      settings: {}
    })
  });
  console.log('npoint POST Status:', createRes.status);
  const createData = await createRes.json();
  console.log('npoint Bin ID:', createData.id);

  const binId = createData.id;

  // GET bin
  const getRes = await fetch(`https://api.npoint.io/${binId}`);
  console.log('npoint GET Status:', getRes.status);
  const getData = await getRes.json();
  console.log('npoint GET Data:', JSON.stringify(getData, null, 2));

  // POST/POST update bin
  const updateRes = await fetch(`https://api.npoint.io/${binId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      products: [{ id: 'p1', title: 'ชุดอาบายะห์ดูไบ', price: 1990 }],
      deletedIds: [],
      orders: [],
      settings: {}
    })
  });
  console.log('npoint POST Update Status:', updateRes.status);

  // GET bin again
  const getRes2 = await fetch(`https://api.npoint.io/${binId}`);
  const getData2 = await getRes2.json();
  console.log('npoint GET Data after update:', JSON.stringify(getData2, null, 2));
}

testNpoint().catch(console.error);
