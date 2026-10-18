const fs = require('fs');

const buf = fs.readFileSync(process.env.LOCALAPPDATA + '/Microsoft/Edge/User Data/Default/Local Storage/leveldb/001967.log');
const str = buf.slice(6673).toString('utf16le');
console.log('Total characters in str:', str.length);

let depth = 0;
let inString = false;
let escape = false;
let endIdx = -1;

for (let i = 0; i < str.length; i++) {
  const c = str[i];
  if (escape) {
    escape = false;
    continue;
  }
  if (c === '\\') {
    escape = true;
    continue;
  }
  if (c === '"') {
    inString = !inString;
    continue;
  }
  if (!inString) {
    if (c === '[') depth++;
    else if (c === ']') {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }
}

console.log('endIdx found:', endIdx);
if (endIdx !== -1) {
  const json = str.slice(0, endIdx + 1);
  console.log('JSON length:', json.length);
  try {
    const arr = JSON.parse(json);
    console.log('Successfully parsed! Total products:', arr.length);
    arr.forEach((p, idx) => console.log(idx + 1, p.id, p.title));
    fs.writeFileSync('extracted_user_products_full.json', JSON.stringify(arr, null, 2), 'utf8');
  } catch (e) {
    console.log('Parse error:', e.message);
  }
}
