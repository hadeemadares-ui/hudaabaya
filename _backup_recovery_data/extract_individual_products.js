const fs = require('fs');

const buf = fs.readFileSync(process.env.LOCALAPPDATA + '/Microsoft/Edge/User Data/Default/Local Storage/leveldb/001967.log');
const str = buf.slice(6673).toString('utf16le');

function extractObjects() {
  const products = [];
  const regex = /\{"id":"(huda-prod-[^"]+)"/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const startIdx = match.index;
    let depth = 0;
    let inString = false;
    let escape = false;
    let endIdx = -1;
    for (let i = startIdx; i < Math.min(startIdx + 1000000, str.length); i++) {
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
        if (c === '{') depth++;
        else if (c === '}') {
          depth--;
          if (depth === 0) {
            endIdx = i;
            break;
          }
        }
      }
    }

    if (endIdx !== -1) {
      const jsonStr = str.slice(startIdx, endIdx + 1);
      try {
        const obj = JSON.parse(jsonStr);
        if (obj.id && obj.title && Array.isArray(obj.variants)) {
          products.push(obj);
        }
      } catch (e) {}
    }
  }
  return products;
}

const allProds = extractObjects();
console.log('Extracted product objects:', allProds.length);

// Deduplicate by ID, keeping the latest / most complete
const prodMap = new Map();
allProds.forEach(p => {
  const existing = prodMap.get(p.id);
  if (!existing || (p.variants && p.variants.length >= existing.variants.length)) {
    prodMap.set(p.id, p);
  }
});

console.log('Unique deduplicated products count:', prodMap.size);
const uniqueList = Array.from(prodMap.values());
uniqueList.forEach((p, idx) => {
  console.log(`${idx + 1}. [${p.id}] ${p.title} (${p.category}) - ${p.variants?.length || 0} variants`);
});

fs.writeFileSync('extracted_user_real_products.json', JSON.stringify(uniqueList, null, 2), 'utf8');
