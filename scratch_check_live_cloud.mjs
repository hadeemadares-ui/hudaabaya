const CLOUD_PRODUCTS_ID = 'ff808181a09d98f701a0aeaaf80c25e7';
const CLOUD_DELETED_ID = 'ff808181a09d98f701a0aeaaf89025e8';
const BASE_URL = 'https://api.restful-api.dev/objects';

async function checkCloudStatus() {
  console.log('--- CHECKING LIVE CLOUD STATUS ---');
  const [prodRes, delRes] = await Promise.all([
    fetch(`${BASE_URL}/${CLOUD_PRODUCTS_ID}?_t=${Date.now()}`),
    fetch(`${BASE_URL}/${CLOUD_DELETED_ID}?_t=${Date.now()}`)
  ]);

  const prodData = await prodRes.json();
  const delData = await delRes.json();

  console.log('Products Count in Cloud:', prodData?.data?.products?.length || 0);
  console.log('Products in Cloud:', JSON.stringify(prodData?.data?.products || [], null, 2));
  console.log('Deleted IDs in Cloud:', JSON.stringify(delData?.data?.ids || [], null, 2));
}

checkCloudStatus();
