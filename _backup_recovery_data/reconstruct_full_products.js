const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Users\\user\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb';
const files = fs.readdirSync(edgePath).filter(f => f.endsWith('.log') || f.endsWith('.ldb'));

const imgMap = JSON.parse(fs.readFileSync('all_recovered_product_images.json', 'utf8'));

// We will find full product details for each product
const fullProducts = new Map();

for (const f of files) {
  const buf = fs.readFileSync(path.join(edgePath, f));
  ['utf8', 'utf16le'].forEach(enc => {
    const needle = enc === 'utf8' ? Buffer.from('"title":') : Buffer.from('"title":', 'utf16le');
    let idx = 0;
    while ((idx = buf.indexOf(needle, idx)) !== -1) {
      // Look back for product id or start of object
      // search up to 400 chars back for '{"id":'
      let objStart = -1;
      if (enc === 'utf8') {
        const sliceBefore = buf.slice(Math.max(0, idx - 400), idx).toString('utf8');
        const m = sliceBefore.lastIndexOf('{"id":');
        if (m !== -1) {
          objStart = Math.max(0, idx - 400) + m;
        }
      } else {
        const sliceBefore = buf.slice(Math.max(0, idx - 800), idx).toString('utf16le');
        const m = sliceBefore.lastIndexOf('{"id":');
        if (m !== -1) {
          objStart = Math.max(0, idx - 800) + m * 2;
        }
      }

      if (objStart !== -1) {
        // Try parsing product object
        const slice = enc === 'utf8'
          ? buf.slice(objStart, objStart + 500000).toString('utf8')
          : buf.slice(objStart, objStart + 1000000).toString('utf16le');
        
        let depth = 0;
        let objEnd = -1;
        for (let i = 0; i < slice.length; i++) {
          if (slice[i] === '{') depth++;
          else if (slice[i] === '}') {
            depth--;
            if (depth === 0) { objEnd = i; break; }
          }
        }

        if (objEnd !== -1) {
          try {
            const p = JSON.parse(slice.substring(0, objEnd + 1));
            if (p && p.title && p.id) {
              const titleKey = p.title.trim();
              const existing = fullProducts.get(titleKey);

              // Check if we have recovered real image from imgMap
              if (imgMap[titleKey]?.isData) {
                p.images = [imgMap[titleKey].fullImage];
              }

              const pHasRealImg = p.images?.[0]?.startsWith('data:image');
              const exHasRealImg = existing?.images?.[0]?.startsWith('data:image');

              if (!existing) {
                fullProducts.set(titleKey, p);
              } else if (!exHasRealImg && pHasRealImg) {
                fullProducts.set(titleKey, p);
              } else if (p.variants?.length > (existing.variants?.length || 0)) {
                // keep the one with more variants or details
                if (pHasRealImg || !exHasRealImg) fullProducts.set(titleKey, p);
              }
            }
          } catch(e) {}
        }
      }
      idx += needle.length;
    }
  });
}

console.log(`Reconstructed full products: ${fullProducts.size}`);

// Also inject real images for any products that might still be using placeholder
for (const [title, p] of fullProducts.entries()) {
  if (imgMap[title]?.isData && !p.images?.[0]?.startsWith('data:image')) {
    p.images = [imgMap[title].fullImage];
  }
}

const finalProds = Array.from(fullProducts.values());
let withRealPhoto = 0;
finalProds.forEach(p => {
  const hasReal = p.images?.[0]?.startsWith('data:image');
  if (hasReal) withRealPhoto++;
  console.log(`- [${hasReal ? 'REAL PHOTO' : 'NO PHOTO  '}] ${p.title} (${p.category})`);
});
console.log(`Total Products: ${finalProds.length}, with Real Photos: ${withRealPhoto}`);

fs.writeFileSync('all_fully_reconstructed_products.json', JSON.stringify(finalProds, null, 2), 'utf8');
