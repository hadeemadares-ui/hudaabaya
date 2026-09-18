async function testFirebaseREST() {
  console.log('Testing Firebase Realtime Database REST API...');
  
  const urls = [
    'https://huda-abaya-default-rtdb.firebaseio.com/products.json',
    'https://huda-abaya-default-rtdb.asia-southeast1.firebasedatabase.app/products.json',
    'https://huda-abaya.firebaseio.com/products.json'
  ];

  for (const url of urls) {
    try {
      console.log('\nFetching:', url);
      const getRes = await fetch(url);
      console.log('GET status:', getRes.status, getRes.statusText);
      const text = await getRes.text();
      console.log('GET response:', text.slice(0, 150));

      if (getRes.ok) {
        console.log('Testing PUT to:', url);
        const putRes = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([{ id: 'test-p1', title: 'ชุดอาบายะห์ดูไบ' }])
        });
        console.log('PUT status:', putRes.status, putRes.statusText);
        const putText = await putRes.text();
        console.log('PUT response:', putText.slice(0, 150));
      }
    } catch (e) {
      console.error('Error fetching', url, e.message);
    }
  }
}

testFirebaseREST();
