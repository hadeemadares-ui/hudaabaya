const fs = require('fs');
const path = require('path');

function getBase64Images(dirPath) {
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.log') || f.endsWith('.ldb'));
  const set = new Set();
  for (const f of files) {
    const buf = fs.readFileSync(path.join(dirPath, f));
    ['utf8', 'utf16le'].forEach(enc => {
      const needle = enc === 'utf8' ? Buffer.from('data:image') : Buffer.from('data:image', 'utf16le');
      let idx = 0;
      while ((idx = buf.indexOf(needle, idx)) !== -1) {
        const slice = enc === 'utf8' ? buf.slice(idx, idx + 200000).toString('utf8') : buf.slice(idx, idx + 400000).toString('utf16le');
        const q = slice.indexOf('"');
        const str = q !== -1 ? slice.substring(0, q) : '';
        if (str.length > 500) {
          const sig = str.substring(0, 100) + '...' + str.slice(-100);
          set.add(sig);
        }
        idx += needle.length;
      }
    });
  }
  return set.size;
}

const edgeCount = getBase64Images('C:\\Users\\user\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb');
const chromeCount = getBase64Images('C:\\Users\\user\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb');

console.log('Total unique base64 images in Edge LevelDB:', edgeCount);
console.log('Total unique base64 images in Chrome LevelDB:', chromeCount);
