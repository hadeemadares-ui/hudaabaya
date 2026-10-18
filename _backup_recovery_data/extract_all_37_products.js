const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Users\\user\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb';
const files = fs.readdirSync(edgePath).filter(f => f.endsWith('.log') || f.endsWith('.ldb'));

const imgMap = JSON.parse(fs.readFileSync('all_recovered_product_images.json', 'utf8'));
const targetTitles = Object.keys(imgMap).filter(t => imgMap[t].isData);
console.log(`Targeting ${targetTitles.length} products with real images...`);

const extractedObjects = new Map();

for (const targetTitle of targetTitles) {
  let found = null;

  for (const f of files) {
    if (found) break;
    const buf = fs.readFileSync(path.join(edgePath, f));

    ['utf16le', 'utf8'].forEach(enc => {
      if (found) return;
      const titleNeedle = enc === 'utf8'
        ? Buffer.from(`"title":"${targetTitle}"`)
        : Buffer.from(`"title":"${targetTitle}"`, 'utf16le');

      let idx = buf.indexOf(titleNeedle);
      if (idx !== -1) {
        // Find '{' before idx
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
                const parsed = JSON.parse(slice.substring(0, end + 1));
                if (parsed.title === targetTitle) found = parsed;
              } catch(e) {}
            }
          }
        } else {
          // utf16le
          // search backward for 0x7b, 0x00
          for (let b = idx - 2; b >= Math.max(0, idx - 1000); b -= 2) {
            if (buf[b] === 0x7b && buf[b+1] === 0x00) {
              const slice = buf.slice(b, b + 1000000).toString('utf16le');
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
                  const parsed = JSON.parse(slice.substring(0, end + 1));
                  if (parsed.title === targetTitle) {
                    found = parsed;
                    break;
                  }
                } catch(e) {}
              }
            }
          }
        }
      }
    });
  }

  if (found) {
    // Ensure image is set to the full real image
    found.images = [imgMap[targetTitle].fullImage];
    extractedObjects.set(targetTitle, found);
    console.log(`[SUCCESS] Extracted ${targetTitle} (ID: ${found.id}, Category: ${found.category}, Variants: ${found.variants?.length})`);
  } else {
    console.log(`[MISSING FULL OBJ] ${targetTitle}`);
  }
}

console.log(`\nSuccessfully extracted ${extractedObjects.size} / ${targetTitles.length} full product objects with real photos!`);

fs.writeFileSync('recovered_real_image_products.json', JSON.stringify(Array.from(extractedObjects.values()), null, 2), 'utf8');
