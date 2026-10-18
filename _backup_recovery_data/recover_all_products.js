const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Users\\user\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb';
const files = fs.readdirSync(edgePath).filter(f => f.endsWith('.log') || f.endsWith('.ldb'));

// We want to reconstruct every single product object that ever existed
const productMap = new Map(); // id or title -> product object

for (const f of files) {
  const buf = fs.readFileSync(path.join(edgePath, f));
  ['utf8', 'utf16le'].forEach(enc => {
    const needle = enc === 'utf8' ? Buffer.from('"id":"huda-prod-') : Buffer.from('"id":"huda-prod-', 'utf16le');
    let idx = 0;
    while ((idx = buf.indexOf(needle, idx)) !== -1) {
      // Find start of object '{' before needle
      let startObj = -1;
      if (enc === 'utf8') {
        startObj = buf.lastIndexOf(0x7b, idx); // '{'
      } else {
        // search backward for 0x7b, 0x00
        for (let i = idx - 2; i >= Math.max(0, idx - 50); i -= 2) {
          if (buf[i] === 0x7b && buf[i+1] === 0x00) {
            startObj = i;
            break;
          }
        }
      }

      if (startObj !== -1) {
        // Try parsing JSON object from startObj
        let jsonStr = '';
        if (enc === 'utf8') {
          const slice = buf.slice(startObj, startObj + 500000).toString('utf8');
          // count brackets
          let depth = 0;
          let end = -1;
          for (let i = 0; i < slice.length; i++) {
            if (slice[i] === '{') depth++;
            else if (slice[i] === '}') {
              depth--;
              if (depth === 0) { end = i; break; }
            }
          }
          if (end !== -1) jsonStr = slice.substring(0, end + 1);
        } else {
          const slice = buf.slice(startObj, startObj + 1000000).toString('utf16le');
          let depth = 0;
          let end = -1;
          for (let i = 0; i < slice.length; i++) {
            if (slice[i] === '{') depth++;
            else if (slice[i] === '}') {
              depth--;
              if (depth === 0) { end = i; break; }
            }
          }
          if (end !== -1) jsonStr = slice.substring(0, end + 1);
        }

        if (jsonStr) {
          try {
            const p = JSON.parse(jsonStr);
            if (p && p.id && p.title && Array.isArray(p.variants)) {
              const key = p.title.trim();
              const existing = productMap.get(key);
              
              // Decide which one is better:
              // 1. One with real data:image over unsplash image
              // 2. Larger/more complete description or variants
              // 3. Newer updatedAt
              let shouldReplace = false;
              if (!existing) {
                shouldReplace = true;
              } else {
                const existingHasRealImg = existing.images?.[0]?.startsWith('data:image');
                const pHasRealImg = p.images?.[0]?.startsWith('data:image');
                if (!existingHasRealImg && pHasRealImg) {
                  shouldReplace = true;
                } else if (existingHasRealImg && !pHasRealImg) {
                  shouldReplace = false;
                } else {
                  // Both have or don't have real image, check updatedAt or length
                  const existingTime = existing.updatedAt || 0;
                  const pTime = p.updatedAt || 0;
                  if (pTime > existingTime) {
                    // if p has real image or existing also doesn't, take newer
                    shouldReplace = true;
                  }
                }
              }

              if (shouldReplace) {
                productMap.set(key, p);
              }
            }
          } catch (e) {
            // ignore partial parse errors
          }
        }
      }

      idx += needle.length;
    }
  });
}

console.log(`Total unique products recovered: ${productMap.size}`);
const recoveredList = Array.from(productMap.values());

let realImgCount = 0;
recoveredList.forEach(p => {
  const hasRealImg = p.images?.[0]?.startsWith('data:image');
  if (hasRealImg) realImgCount++;
  console.log(`[${hasRealImg ? 'REAL IMG' : 'UNSPLASH'}] ${p.title} (variants: ${p.variants?.length})`);
});
console.log(`Products with REAL uploaded photos: ${realImgCount} / ${recoveredList.length}`);

fs.writeFileSync('all_recovered_products.json', JSON.stringify(recoveredList, null, 2), 'utf8');
