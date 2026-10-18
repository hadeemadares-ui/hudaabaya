const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Users\\user\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb';
const files = fs.readdirSync(edgePath).filter(f => f.endsWith('.log') || f.endsWith('.ldb'));

const productsFound = new Map();

for (const f of files) {
  const buf = fs.readFileSync(path.join(edgePath, f));
  ['utf8', 'utf16le'].forEach(enc => {
    const needle = enc === 'utf8' ? Buffer.from('"title":') : Buffer.from('"title":', 'utf16le');
    let idx = 0;
    while ((idx = buf.indexOf(needle, idx)) !== -1) {
      // Find start of object '{' before idx
      const beforeSlice = enc === 'utf8'
        ? buf.slice(Math.max(0, idx - 1000), idx).toString('utf8')
        : buf.slice(Math.max(0, idx - 2000), idx).toString('utf16le');
      
      const afterSlice = enc === 'utf8'
        ? buf.slice(idx, idx + 400000).toString('utf8')
        : buf.slice(idx, idx + 800000).toString('utf16le');
      
      // Extract title
      const titleMatch = afterSlice.match(/"title":"([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : null;

      // Extract images array
      const imgMatch = afterSlice.match(/"images":\["([^"]+)"\]/);
      const img = imgMatch ? imgMatch[1] : null;

      if (title && img) {
        const isData = img.startsWith('data:image');
        const prev = productsFound.get(title);
        // prefer data:image over http
        if (!prev || (!prev.isData && isData) || (isData && img.length > prev.img.length)) {
          productsFound.set(title, {
            title,
            file: f,
            isData,
            imgLen: img.length,
            imgPreview: img.substring(0, 50),
            fullImage: img
          });
        }
      }
      idx += needle.length;
    }
  });
}

console.log(`Unique titles found: ${productsFound.size}`);
for (const [title, info] of productsFound.entries()) {
  console.log(`Title: "${title}" | isData: ${info.isData} | imgLen: ${info.imgLen} | preview: ${info.imgPreview}`);
}

fs.writeFileSync('all_recovered_product_images.json', JSON.stringify(Object.fromEntries(
  Array.from(productsFound.entries()).map(([k, v]) => [k, { isData: v.isData, imgLen: v.imgLen, fullImage: v.fullImage }])
), null, 2), 'utf8');
