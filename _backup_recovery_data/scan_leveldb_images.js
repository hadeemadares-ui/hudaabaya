const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Users\\user\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb';
const files = fs.readdirSync(edgePath).filter(f => f.endsWith('.log') || f.endsWith('.ldb'));

const found = [];

for (const f of files) {
  const buf = fs.readFileSync(path.join(edgePath, f));
  ['utf8', 'utf16le'].forEach(enc => {
    const needle = enc === 'utf8' ? Buffer.from('data:image') : Buffer.from('data:image', 'utf16le');
    let idx = 0;
    while ((idx = buf.indexOf(needle, idx)) !== -1) {
      let str = '';
      if (enc === 'utf8') {
        const slice = buf.slice(idx, idx + 200000).toString('utf8');
        const quote = slice.indexOf('"');
        str = quote !== -1 ? slice.substring(0, quote) : slice.substring(0, 100);
      } else {
        const slice = buf.slice(idx, idx + 400000).toString('utf16le');
        const quote = slice.indexOf('"');
        str = quote !== -1 ? slice.substring(0, quote) : slice.substring(0, 100);
      }
      if (str.length > 100) {
        const beforeSlice = enc === 'utf8'
          ? buf.slice(Math.max(0, idx - 1000), idx).toString('utf8')
          : buf.slice(Math.max(0, idx - 2000), idx).toString('utf16le');
        
        found.push({
          file: f,
          enc: enc,
          length: str.length,
          preview: str.substring(0, 50),
          context: beforeSlice.slice(-150).replace(/[\r\n]/g, ' ')
        });
      }
      idx += needle.length;
    }
  });
}

console.log(`Found ${found.length} image occurrences.`);
found.forEach((item, i) => {
  console.log(`[${i}] ${item.file} (${item.enc}) ${item.length} chars | Context: ${item.context}`);
});
