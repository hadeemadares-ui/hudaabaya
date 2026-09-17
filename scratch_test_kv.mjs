async function testKV() {
  console.log("Testing KV Storage...");
  try {
    // Test creating a bucket or reading/writing to npoint / kvdb / jsonblob
    const bucketUrl = 'https://api.npoint.io/4d5a9b348d70b741bf08'; // or create new
    const res = await fetch(bucketUrl);
    console.log("npoint status:", res.status);
    if (res.ok) {
      const data = await res.json();
      console.log("npoint data:", data);
    }
  } catch (err) {
    console.error("KV Error:", err);
  }
}

testKV();
