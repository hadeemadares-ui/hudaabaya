const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Users\\user\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb';
const files = fs.readdirSync(chromePath).filter(f => f.endsWith('.log') || f.endsWith('.ldb'));

const chromeProducts = new Map();

for (const f of files) {
  const buf = fs.readFileSync(path.join(chromePath, f));
  ['utf8', 'utf16le'].forEach(enc => {
    const needle = enc === 'utf8' ? Buffer.from('"title":') : Buffer.from('"title":', 'utf16le');
    let idx = 0;
    while ((idx = buf.indexOf(needle, idx)) !== -1) {
      // Find start of object before idx
      let startObj = -1;
      if (enc === 'utf8') {
        startObj = buf.lastIndexOf(0x7b, idx);
        if (startObj !== -1) {
          const slice = buf.slice(startObj, startObj + 500000).toString('utf8');
          let depth = 0, end = -1;
          for (let i = 0; i < slice.length; i++) {
            if (slice[i] === '{') depth++;
            else if (slice[i] === '}') {
              depth--;
              if (depth === 0) { end = i; break; }
            }
          }
          if (end !== -1) {
            try {
              const p = JSON.parse(slice.substring(0, end + 1));
              if (p && p.title && p.id) {
                const k = p.title.trim();
                const existing = chromeProducts.get(k);
                const pHasReal = p.images?.[0]?.startsWith('data:image');
                const exHasReal = existing?.images?.[0]?.startsWith('data:image');
                if (!existing || (!exHasReal && pHasReal) || (pHasReal && exHasReal && (p.images?.[0]?.length || 0) > (existing.images?.[0]?.length || 0))) {
                  chromeProducts.set(k, p);
                }
              }
            } catch(e) {}
          }
        }
      } else {
        // utf16le
        for (let b = idx - 2; b >= Math.max(0, idx - 1000); b -= 2) {
          if (buf[b] === 0x7b && buf[b+1] === 0x00) {
            startObj = b;
            break;
          }
        }
        if (startObj !== -1) {
          const slice = buf.slice(startObj, startObj + 1000000).toString('utf16le');
          let depth = 0, end = -1;
          for (let i = 0; i < slice.length; i++) {
            if (slice[i] === '{') depth++;
            else if (slice[i] === '}') {
              depth--;
              if (depth === 0) { end = i; break; }
            }
          }
          if (end !== -1) {
            try {
              const p = JSON.parse(slice.substring(0, end + 1));
              if (p && p.title && p.id) {
                const k = p.title.trim();
                const existing = chromeProducts.get(k);
                const pHasReal = p.images?.[0]?.startsWith('data:image');
                const exHasReal = existing?.images?.[0]?.startsWith('data:image');
                if (!existing || (!exHasReal && pHasReal) || (pHasReal && exHasReal && (p.images?.[0]?.length || 0) > (existing.images?.[0]?.length || 0))) {
                  chromeProducts.set(k, p);
                }
              }
            } catch(e) {}
          }
        }
      }
      idx += needle.length;
    }
  });
}

console.log(`Chrome parsed full products: ${chromeProducts.size}`);
for (const [title, p] of chromeProducts.entries()) {
  const isReal = p.images?.[0]?.startsWith('data:image');
  console.log(`[${isReal ? 'REAL PHOTO' : 'NO PHOTO  '}] ${title} (${p.category}, variants: ${p.variants?.length})`);
}

fs.writeFileSync('chrome_full_products.json', JSON.stringify(Array.from(chromeProducts.values()), null, 2), 'utf8');
