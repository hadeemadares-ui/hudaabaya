const fs = require('fs');
const path = require('path');

function getTitlesFromDir(dirPath) {
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.log') || f.endsWith('.ldb'));
  const titles = new Set();
  for (const f of files) {
    const buf = fs.readFileSync(path.join(dirPath, f));
    ['utf8', 'utf16le'].forEach(enc => {
      const needle = enc === 'utf8' ? Buffer.from('"title":"') : Buffer.from('"title":"', 'utf16le');
      let idx = 0;
      while ((idx = buf.indexOf(needle, idx)) !== -1) {
        const slice = enc === 'utf8' ? buf.slice(idx, idx + 200).toString('utf8') : buf.slice(idx, idx + 400).toString('utf16le');
        const m = slice.match(/"title":"([^"]+)"/);
        if (m && m[1].length < 100 && !m[1].includes('{') && !m[1].includes('[')) {
          titles.add(m[1].trim());
        }
        idx += needle.length;
      }
    });
  }
  return Array.from(titles);
}

const edgeTitles = getTitlesFromDir('C:\\Users\\user\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb');
const chromeTitles = getTitlesFromDir('C:\\Users\\user\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb');

const allTitles = Array.from(new Set([...edgeTitles, ...chromeTitles])).sort();
console.log('Total unique titles found:', allTitles.length);
allTitles.forEach((t, i) => console.log((i+1) + '. ' + t));
