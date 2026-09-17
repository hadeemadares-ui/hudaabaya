async function createNPointBucket() {
  console.log("Creating npoint cloud bucket...");
  try {
    const res = await fetch('https://api.npoint.io', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        products: [],
        deletedProductIds: [],
        updatedAt: Date.now()
      })
    });
    console.log("npoint POST status:", res.status);
    const data = await res.json();
    console.log("npoint result:", data);
  } catch (err) {
    console.error("npoint Error:", err);
  }
}

createNPointBucket();
