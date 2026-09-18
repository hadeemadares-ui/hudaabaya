const CLOUD_PRODUCTS_ID = 'ff808181a09d98f701a0aeaaf80c25e7';
const BASE_URL = 'https://api.restful-api.dev/objects';

async function testGet() {
  const url1 = `${BASE_URL}/${CLOUD_PRODUCTS_ID}`;
  const res1 = await fetch(url1);
  console.log('GET without query params:', res1.status, res1.statusText);
  if (res1.ok) {
    const d1 = await res1.json();
    console.log('Data without query params:', JSON.stringify(d1, null, 2));
  }

  const url2 = `${BASE_URL}/${CLOUD_PRODUCTS_ID}?_t=${Date.now()}`;
  const res2 = await fetch(url2);
  console.log('GET with query params:', res2.status, res2.statusText);
}

testGet();
