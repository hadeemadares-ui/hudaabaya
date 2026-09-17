async function createCloudObjects() {
  const prodRes = await fetch('https://api.restful-api.dev/objects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'huda_products_v3', data: { products: [] } })
  });
  const prodData = await prodRes.json();
  console.log('Products Cloud ID:', prodData.id);

  const delRes = await fetch('https://api.restful-api.dev/objects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'huda_deleted_ids_v3', data: { ids: [] } })
  });
  const delData = await delRes.json();
  console.log('Deleted IDs Cloud ID:', delData.id);

  const ordRes = await fetch('https://api.restful-api.dev/objects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'huda_orders_v3', data: { orders: [] } })
  });
  const ordData = await ordRes.json();
  console.log('Orders Cloud ID:', ordData.id);

  const setRes = await fetch('https://api.restful-api.dev/objects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'huda_settings_v3', data: { settings: {} } })
  });
  const setData = await setRes.json();
  console.log('Settings Cloud ID:', setData.id);
}

createCloudObjects();
