const CLOUD_PRODUCTS_ID = 'ff808181a09d98f701a0ae89e765250a';
const CLOUD_DELETED_ID = 'ff808181a09d98f701a0ae89e6f72509';

async function testRestful() {
  console.log('Testing GET RESTful API...');
  const res = await fetch(`https://api.restful-api.dev/objects/${CLOUD_PRODUCTS_ID}`);
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Data:', JSON.stringify(data, null, 2));

  const delRes = await fetch(`https://api.restful-api.dev/objects/${CLOUD_DELETED_ID}`);
  console.log('Del Status:', delRes.status);
  const delData = await delRes.json();
  console.log('Del Data:', JSON.stringify(delData, null, 2));
}

testRestful();
