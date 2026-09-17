async function setupHudaCloud() {
  console.log("Setting up fixed Cloud Storage for HUDA ABAYA...");
  try {
    // 1. Create Deleted Products Cloud Object
    const delRes = await fetch('https://api.restful-api.dev/objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'huda_deleted_products_registry_v1',
        data: { ids: [] }
      })
    });
    const delData = await delRes.json();
    console.log("Deleted Registry Cloud ID:", delData.id);

    // 2. Create Active Products Cloud Object
    const prodRes = await fetch('https://api.restful-api.dev/objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'huda_active_products_registry_v1',
        data: { products: [] }
      })
    });
    const prodData = await prodRes.json();
    console.log("Active Products Cloud ID:", prodData.id);
  } catch (err) {
    console.error("Setup Error:", err);
  }
}

setupHudaCloud();
