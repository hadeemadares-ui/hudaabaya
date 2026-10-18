const fs = require('fs');

const edgeImg = JSON.parse(fs.readFileSync('all_recovered_product_images.json', 'utf8'));
const chromeImg = JSON.parse(fs.readFileSync('chrome_recovered_product_images.json', 'utf8'));

const combined = new Map();

for (const [t, data] of Object.entries(edgeImg)) {
  if (data.isData) combined.set(t, { source: 'edge', imgLen: data.imgLen, img: data.fullImage });
}

for (const [t, data] of Object.entries(chromeImg)) {
  if (data.isData) {
    const existing = combined.get(t);
    if (!existing || data.imgLen > existing.imgLen) {
      combined.set(t, { source: 'chrome', imgLen: data.imgLen, img: data.img });
    }
  }
}

console.log(`Total unique products with REAL PHOTOS across Edge + Chrome: ${combined.size}`);
Array.from(combined.keys()).sort().forEach((t, i) => {
  const item = combined.get(t);
  console.log(`${(i+1).toString().padStart(2)}. [${item.source.toUpperCase()}] ${t} (${item.imgLen} chars)`);
});

fs.writeFileSync('all_unique_real_images_combined.json', JSON.stringify(Object.fromEntries(combined), null, 2), 'utf8');
