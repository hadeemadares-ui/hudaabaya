const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Users\\user\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb';
const files = fs.readdirSync(chromePath).filter(f => f.endsWith('.log') || f.endsWith('.ldb'));

const chromeTitles = new Map();

for (const f of files) {
  const buf = fs.readFileSync(path.join(chromePath, f));
  ['utf8', 'utf16le'].forEach(enc => {
    const needle = enc === 'utf8' ? Buffer.from('"title":') : Buffer.from('"title":', 'utf16le');
    let idx = 0;
    while ((idx = buf.indexOf(needle, idx)) !== -1) {
      const slice = enc === 'utf8'
        ? buf.slice(idx, idx + 200000).toString('utf8')
        : buf.slice(idx, idx + 400000).toString('utf16le');
      
      const titleMatch = slice.match(/"title":"([^"]+)"/);
      const imgMatch = slice.match(/"images":\["([^"]+)"\]/);
      
      if (titleMatch && imgMatch) {
        const title = titleMatch[1].trim();
        const img = imgMatch[1];
        const isData = img.startsWith('data:image');
        const prev = chromeTitles.get(title);
        if (!prev || (!prev.isData && isData) || (isData && img.length > prev.imgLen)) {
          chromeTitles.set(title, {
            title,
            isData,
            imgLen: img.length,
            file: f,
            img: img
          });
        }
      }
      idx += needle.length;
    }
  });
}

console.log(`Chrome unique products found: ${chromeTitles.size}`);
let chromeRealImages = 0;
for (const [title, info] of chromeTitles.entries()) {
  if (info.isData) chromeRealImages++;
  console.log(`[${info.isData ? 'REAL PHOTO' : 'NO PHOTO  '}] "${title}" (${info.imgLen} chars in ${info.file})`);
}
console.log(`Total Chrome products with REAL PHOTOS: ${chromeRealImages} / ${chromeTitles.size}`);

fs.writeFileSync('chrome_recovered_product_images.json', JSON.stringify(Object.fromEntries(
  Array.from(chromeTitles.entries()).map(([k, v]) => [k, { isData: v.isData, imgLen: v.imgLen, img: v.img }])
), null, 2), 'utf8');
