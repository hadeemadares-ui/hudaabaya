async function createCloudBucket() {
  console.log("Creating persistent cloud storage bucket...");
  try {
    const res = await fetch('https://jsonblob.com/api/jsonBlob', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        products: [],
        deletedProductIds: [],
        lastUpdated: new Date().toISOString()
      })
    });
    console.log("jsonblob POST status:", res.status);
    const location = res.headers.get('location');
    console.log("Location header (Bucket URL):", location);
    if (location) {
      const readRes = await fetch(location);
      const data = await readRes.json();
      console.log("Read back data:", data);
    }
  } catch (err) {
    console.error("jsonblob Error:", err);
  }
}

createCloudBucket();
