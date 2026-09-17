async function testCrud() {
  console.log("Testing Cloud Key-Value Endpoints...");
  try {
    // Test kvdb.io or restdb or jsonbin
    const key = 'huda_abaya_store_' + Date.now();
    const res = await fetch(`https://kvdb.io/create`, { method: 'POST' });
    console.log("kvdb create status:", res.status);
    const bucketId = await res.text();
    console.log("kvdb bucket ID:", bucketId);

    if (res.ok && bucketId) {
      const writeRes = await fetch(`https://kvdb.io/${bucketId}/deleted_ids`, {
        method: 'POST',
        body: JSON.stringify(["test-deleted-1"])
      });
      console.log("kvdb write status:", writeRes.status);
      const readRes = await fetch(`https://kvdb.io/${bucketId}/deleted_ids`);
      console.log("kvdb read status:", readRes.status);
      const data = await readRes.json();
      console.log("kvdb read data:", data);
    }
  } catch (err) {
    console.error("Cloud Error:", err);
  }
}

testCrud();
