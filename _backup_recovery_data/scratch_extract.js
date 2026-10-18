const fs = require('fs');
const path = require('path');

function findOuterArray(buf) {
  const needle = Buffer.from('[{"id":"huda-prod-', 'utf16le');
  let pos = 0;
  let candidates = [];
  while (true) {
    const idx = buf.indexOf(needle, pos);
    if (idx === -1) break;
    console.log('Found candidate at', idx);
    const sub = buf.slice(idx);
    const str = sub.toString('utf16le');
    let depth = 0;
    let end = -1;
    for (let j = 0; j < str.length; j++) {
      if (str[j] === '[') depth++;
      else if (str[j] === ']') {
        depth--;
        if (depth === 0) { end = j; break; }
      }
    }
    if (end !== -1) {
      try {
        const parsed = JSON.parse(str.slice(0, end + 1));
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
          candidates.push(parsed);
        }
      } catch (e) {
        console.log('Parse error at candidate:', e.message.slice(0, 100));
      }
    }
    pos = idx + 1;
  }
  return candidates;
}

const localAppData = process.env.LOCALAPPDATA;
const files = [
  localAppData + '/Microsoft/Edge/User Data/Default/Local Storage/leveldb/001967.log',
  localAppData + '/Microsoft/Edge/User Data/Default/Local Storage/leveldb/001965.ldb',
  localAppData + '/Microsoft/Edge/User Data/Default/Local Storage/leveldb/001881.ldb',
  localAppData + '/Google/Chrome/User Data/Default/Local Storage/leveldb/012708.log',
  localAppData + '/Google/Chrome/User Data/Default/Local Storage/leveldb/012707.ldb'
];

let allFound = [];
for (const f of files) {
  if (fs.existsSync(f)) {
    console.log('Reading file:', f);
    const buf = fs.readFileSync(f);
    const res = findOuterArray(buf);
    console.log(f, 'has valid product lists:', res.length);
    res.forEach(list => allFound.push(list));
  }
}

allFound.sort((a, b) => b.length - a.length);
if (allFound.length > 0) {
  const top = allFound[0];
  console.log('\n=== TOP FOUND PRODUCT LIST ===');
  console.log('Total products count:', top.length);
  top.forEach((p, idx) => console.log(idx + 1, p.id, '-', p.title));
  fs.writeFileSync('extracted_user_products_full.json', JSON.stringify(top, null, 2), 'utf8');
} else {
  console.log('No valid candidate found with exact needle.');
}
