const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Users\\user\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb';
const files = fs.readdirSync(edgePath).filter(f => f.endsWith('.log') || f.endsWith('.ldb'));

const allProducts = new Map();

for (const f of files) {
  const buf = fs.readFileSync(path.join(edgePath, f));
  const needle = Buffer.from('huda_products');
  let idx = 0;
  while ((idx = buf.indexOf(needle, idx)) !== -1) {
    // Search forward for 0x5b, 0x00 ('[' in UTF-16LE) or 0x5b ('[' in UTF-8)
    const sub = buf.slice(idx, idx + 50);
    const u16Bracket = sub.indexOf(Buffer.from([0x5b, 0x00]));
    const u8Bracket = sub.indexOf(0x5b);

    if (u16Bracket !== -1) {
      const start = idx + u16Bracket;
      // Convert large chunk to utf16le
      // Read until matching ']'
      const chunk = buf.slice(start, Math.min(buf.length, start + 25000000)).toString('utf16le');
      let depth = 0;
      let end = -1;
      for (let i = 0; i < chunk.length; i++) {
        if (chunk[i] === '[') depth++;
        else if (chunk[i] === ']') {
          depth--;
          if (depth === 0) { end = i; break; }
        }
      }
      if (end !== -1) {
        try {
          const arr = JSON.parse(chunk.substring(0, end + 1));
          if (Array.isArray(arr)) {
            console.log(`Successfully parsed UTF-16 array from ${f} at ${idx}: ${arr.length} products`);
            arr.forEach(p => {
              if (p && p.title) {
                const key = p.title.trim();
                const existing = allProducts.get(key);
                const pHasReal = p.images?.[0]?.startsWith('data:image');
                const exHasReal = existing?.images?.[0]?.startsWith('data:image');

                if (!existing) {
                  allProducts.set(key, p);
                } else if (!exHasReal && pHasReal) {
                  allProducts.set(key, p);
                } else if (pHasReal && exHasReal) {
                  if ((p.images?.[0]?.length || 0) > (existing.images?.[0]?.length || 0)) {
                    allProducts.set(key, p);
                  }
                }
              }
            });
          }
        } catch(e) {
          console.log(`Failed to parse UTF-16 array at ${idx} in ${f}:`, e.message);
        }
      }
    } else if (u8Bracket !== -1 && u8Bracket < 20) {
      const start = idx + u8Bracket;
      const chunk = buf.slice(start, Math.min(buf.length, start + 10000000)).toString('utf8');
      let depth = 0;
      let end = -1;
      for (let i = 0; i < chunk.length; i++) {
        if (chunk[i] === '[') depth++;
        else if (chunk[i] === ']') {
          depth--;
          if (depth === 0) { end = i; break; }
        }
      }
      if (end !== -1) {
        try {
          const arr = JSON.parse(chunk.substring(0, end + 1));
          if (Array.isArray(arr)) {
            console.log(`Successfully parsed UTF-8 array from ${f} at ${idx}: ${arr.length} products`);
            arr.forEach(p => {
              if (p && p.title) {
                const key = p.title.trim();
                const existing = allProducts.get(key);
                const pHasReal = p.images?.[0]?.startsWith('data:image');
                const exHasReal = existing?.images?.[0]?.startsWith('data:image');

                if (!existing) {
                  allProducts.set(key, p);
                } else if (!exHasReal && pHasReal) {
                  allProducts.set(key, p);
                } else if (pHasReal && exHasReal) {
                  if ((p.images?.[0]?.length || 0) > (existing.images?.[0]?.length || 0)) {
                    allProducts.set(key, p);
                  }
                }
              }
            });
          }
        } catch(e) {}
      }
    }

    idx += needle.length;
  }
}

console.log(`\n========================================`);
console.log(`TOTAL UNIQUE PRODUCTS: ${allProducts.size}`);
let countReal = 0;
for (const [title, p] of allProducts.entries()) {
  const hasReal = p.images?.[0]?.startsWith('data:image');
  if (hasReal) countReal++;
  console.log(`[${hasReal ? 'REAL PHOTO' : 'NO PHOTO  '}] ${title}`);
}
console.log(`Products with REAL photos: ${countReal} / ${allProducts.size}`);

const list = Array.from(allProducts.values());
fs.writeFileSync('all_complete_recovered_products.json', JSON.stringify(list, null, 2), 'utf8');
