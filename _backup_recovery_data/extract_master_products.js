const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Users\\user\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb';
const files = fs.readdirSync(edgePath).filter(f => f.endsWith('.log') || f.endsWith('.ldb'));

const allParsedProducts = new Map();

for (const f of files) {
  const buf = fs.readFileSync(path.join(edgePath, f));
  ['utf8', 'utf16le'].forEach(enc => {
    // Search for 'huda_products'
    const keyNeedle = enc === 'utf8' ? Buffer.from('huda_products') : Buffer.from('huda_products', 'utf16le');
    let kIdx = 0;
    while ((kIdx = buf.indexOf(keyNeedle, kIdx)) !== -1) {
      // Look forward for '['
      const forwardSlice = enc === 'utf8'
        ? buf.slice(kIdx, kIdx + 15000000).toString('utf8')
        : buf.slice(kIdx, kIdx + 30000000).toString('utf16le');
      
      const bStart = forwardSlice.indexOf('[');
      if (bStart !== -1 && bStart < 200) {
        // find matching ']'
        let depth = 0;
        let bEnd = -1;
        for (let i = bStart; i < forwardSlice.length; i++) {
          if (forwardSlice[i] === '[') depth++;
          else if (forwardSlice[i] === ']') {
            depth--;
            if (depth === 0) {
              bEnd = i;
              break;
            }
          }
        }

        if (bEnd !== -1) {
          const jsonStr = forwardSlice.substring(bStart, bEnd + 1);
          try {
            const arr = JSON.parse(jsonStr);
            if (Array.isArray(arr) && arr.length > 0 && arr[0].title) {
              console.log(`Found valid products array in ${f} (${enc}): ${arr.length} items`);
              arr.forEach(p => {
                if (p && p.title) {
                  const key = p.title.trim();
                  const existing = allParsedProducts.get(key);
                  const pHasRealImg = p.images?.[0]?.startsWith('data:image');
                  const existingHasRealImg = existing?.images?.[0]?.startsWith('data:image');

                  if (!existing) {
                    allParsedProducts.set(key, p);
                  } else if (!existingHasRealImg && pHasRealImg) {
                    allParsedProducts.set(key, p);
                  } else if (pHasRealImg && existingHasRealImg) {
                    // if p is newer or has bigger image
                    if ((p.images?.[0]?.length || 0) > (existing.images?.[0]?.length || 0)) {
                      allParsedProducts.set(key, p);
                    }
                  } else if (!existingHasRealImg && !pHasRealImg) {
                    if ((p.updatedAt || 0) > (existing.updatedAt || 0)) {
                      allParsedProducts.set(key, p);
                    }
                  }
                }
              });
            }
          } catch (e) {
            console.log(`Parse array failed in ${f} (${enc}):`, e.message);
          }
        }
      }
      kIdx += keyNeedle.length;
    }
  });
}

console.log(`\n========================================`);
console.log(`TOTAL UNIQUE PRODUCTS COLLECTED: ${allParsedProducts.size}`);
let realImgCount = 0;
for (const [title, p] of allParsedProducts.entries()) {
  const hasReal = p.images?.[0]?.startsWith('data:image');
  if (hasReal) realImgCount++;
  console.log(`[${hasReal ? 'REAL PHOTO' : 'NO PHOTO  '}] "${title}" (Cat: ${p.category}, Variants: ${p.variants?.length})`);
}
console.log(`Total with REAL PHOTOS: ${realImgCount} / ${allParsedProducts.size}`);

const finalProducts = Array.from(allParsedProducts.values());
fs.writeFileSync('all_master_products_recovered.json', JSON.stringify(finalProducts, null, 2), 'utf8');
