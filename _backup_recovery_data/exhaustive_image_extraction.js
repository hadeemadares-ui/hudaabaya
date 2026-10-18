const fs = require('fs');
const path = require('path');

function extractAllImagesWithContext(dirPath, browserName) {
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.log') || f.endsWith('.ldb'));
  const results = [];

  for (const f of files) {
    const buf = fs.readFileSync(path.join(dirPath, f));
    ['utf8', 'utf16le'].forEach(enc => {
      const needle = enc === 'utf8' ? Buffer.from('data:image') : Buffer.from('data:image', 'utf16le');
      let idx = 0;
      while ((idx = buf.indexOf(needle, idx)) !== -1) {
        const slice = enc === 'utf8' ? buf.slice(idx, idx + 400000).toString('utf8') : buf.slice(idx, idx + 800000).toString('utf16le');
        const q = slice.indexOf('"');
        const str = q !== -1 ? slice.substring(0, q) : '';
        if (str.length > 500) {
          const before = enc === 'utf8'
            ? buf.slice(Math.max(0, idx - 1500), idx).toString('utf8')
            : buf.slice(Math.max(0, idx - 3000), idx).toString('utf16le');
          
          results.push({
            browser: browserName,
            file: f,
            enc,
            length: str.length,
            signature: str.substring(0, 50) + '...' + str.slice(-50),
            fullImage: str,
            context: before.replace(/[\r\n\t]/g, ' ').slice(-300)
          });
        }
        idx += needle.length;
      }
    });
  }
  return results;
}

const edgeImages = extractAllImagesWithContext('C:\\Users\\user\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb', 'Edge');
const chromeImages = extractAllImagesWithContext('C:\\Users\\user\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb', 'Chrome');

const allFound = [...edgeImages, ...chromeImages];

// Group by image signature to remove duplicates
const uniqueMap = new Map();
allFound.forEach(item => {
  const existing = uniqueMap.get(item.signature);
  if (!existing || item.length > existing.length) {
    uniqueMap.set(item.signature, item);
  }
});

console.log(`TOTAL UNIQUE IMAGES FOUND ACROSS ALL BROWSERS: ${uniqueMap.size}`);

const classified = [];
for (const [sig, item] of uniqueMap.entries()) {
  // Extract product title or context
  const titleMatch = item.context.match(/"title":"([^"]+)"/);
  const title = titleMatch ? titleMatch[1] : (item.context.includes('slip') ? 'DEPOSIT SLIP' : 'UNKNOWN');
  classified.push({
    title,
    length: item.length,
    browser: item.browser,
    context: item.context.slice(-120),
    fullImage: item.fullImage
  });
}

classified.sort((a, b) => a.title.localeCompare(b.title));
classified.forEach((item, i) => {
  console.log(`${(i+1).toString().padStart(2)}. [${item.browser}] "${item.title}" (${item.length} chars) - ${item.context}`);
});

fs.writeFileSync('all_exhaustive_extracted_images.json', JSON.stringify(classified, null, 2), 'utf8');
