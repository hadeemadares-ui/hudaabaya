const BASE_URL = 'https://api.restful-api.dev/objects';

async function createFreshObject(name, initialData) {
  console.log(`Creating fresh cloud object: ${name}...`);
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, data: initialData })
  });
  const data = await res.json();
  console.log(`Created ${name} -> ID: ${data.id}`);
  return data.id;
}

async function testAutoRefresh() {
  const prodId = await createFreshObject('huda_products_v4', { products: [] });
  const delId = await createFreshObject('huda_deleted_v4', { ids: [] });
  const ordId = await createFreshObject('huda_orders_v4', { orders: [] });
  const setId = await createFreshObject('huda_settings_v4', { settings: {} });

  console.log('\n--- NEW ACTIVE CLOUD IDs ---');
  console.log('Products:', prodId);
  console.log('Deleted IDs:', delId);
  console.log('Orders:', ordId);
  console.log('Settings:', setId);
}

testAutoRefresh();
