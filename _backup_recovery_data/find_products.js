const fs = require('fs');

const buf = fs.readFileSync(process.env.LOCALAPPDATA + '/Microsoft/Edge/User Data/Default/Local Storage/leveldb/001967.log');
const str = buf.slice(6673).toString('utf16le');

const regex = /"id":"(huda-prod-[^"]+)"(?:,"title":"([^"]+)")?/g;
const titles = new Map();
let m;
while ((m = regex.exec(str)) !== null) {
  const id = m[1];
  const title = m[2];
  if (!titles.has(id) || (!titles.get(id) && title)) {
    titles.set(id, title || 'unknown');
  }
}

console.log('Unique products found:', titles.size);
let i = 1;
for (const [id, title] of titles.entries()) {
  console.log(`${i++}. ID: ${id} -> Title: ${title}`);
}
