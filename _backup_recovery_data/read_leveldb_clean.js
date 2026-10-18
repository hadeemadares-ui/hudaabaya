const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Users\\user\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb';
const logPath = path.join(edgePath, '001967.log');
const buf = fs.readFileSync(logPath);

const BLOCK_SIZE = 32768;
const chunks = [];

let offset = 0;
while (offset < buf.length) {
  const blockEnd = Math.min(offset + BLOCK_SIZE, buf.length);
  let p = offset;
  while (p + 7 <= blockEnd) {
    const len = buf.readUInt16LE(p + 4);
    const type = buf[p + 6];
    if (len === 0 || p + 7 + len > blockEnd) {
      break;
    }
    chunks.push({
      type, // 1: FULL, 2: FIRST, 3: MIDDLE, 4: LAST
      data: buf.slice(p + 7, p + 7 + len)
    });
    p += 7 + len;
  }
  offset += BLOCK_SIZE;
}

console.log(`Parsed ${chunks.length} LevelDB physical chunks.`);

// Reassemble LevelDB records
const records = [];
let current = [];
for (const chunk of chunks) {
  if (chunk.type === 1) { // FULL
    records.push(chunk.data);
  } else if (chunk.type === 2) { // FIRST
    current = [chunk.data];
  } else if (chunk.type === 3) { // MIDDLE
    current.push(chunk.data);
  } else if (chunk.type === 4) { // LAST
    current.push(chunk.data);
    records.push(Buffer.concat(current));
    current = [];
  }
}

console.log(`Reassembled ${records.length} complete LevelDB records.`);

// Search through reassembled records!
const imgMap = JSON.parse(fs.readFileSync('all_recovered_product_images.json', 'utf8'));
const targetTitles = Object.keys(imgMap).filter(t => imgMap[t].isData);

const recovered = new Map();

for (const rec of records) {
  // Try UTF-16LE and UTF-8
  ['utf16le', 'utf8'].forEach(enc => {
    const str = rec.toString(enc);
    if (str.includes('"title":')) {
      targetTitles.forEach(title => {
        if (!recovered.has(title)) {
          const needle = `"title":"${title}"`;
          const pos = str.indexOf(needle);
          if (pos !== -1) {
            // Find '{' before pos
            let start = str.lastIndexOf('{"id":', pos);
            if (start !== -1) {
              let depth = 0, end = -1;
              for (let i = start; i < str.length; i++) {
                if (str[i] === '{') depth++;
                else if (str[i] === '}') {
                  depth--;
                  if (depth === 0) { end = i; break; }
                }
              }
              if (end !== -1) {
                try {
                  const p = JSON.parse(str.substring(start, end + 1));
                  if (p && p.title === title) {
                    recovered.set(title, p);
                    console.log(`[SUCCESS] Reassembled ${title} (Variants: ${p.variants?.length}, ImgLen: ${p.images?.[0]?.length})`);
                  }
                } catch(e) {}
              }
            }
          }
        }
      });
    }
  });
}

console.log(`\nReassembled total: ${recovered.size} / ${targetTitles.length} products!`);
fs.writeFileSync('clean_leveldb_recovered_products.json', JSON.stringify(Array.from(recovered.values()), null, 2), 'utf8');
