const fs = require('fs');

const buf = fs.readFileSync(process.env.LOCALAPPDATA + '/Microsoft/Edge/User Data/Default/Local Storage/leveldb/001967.log');
const needle = Buffer.from('huda_stock_movements', 'utf8');
const idx = buf.indexOf(needle);
console.log('needle idx:', idx);

if (idx !== -1) {
  // Let's scan forward for [ {
  for (let i = idx; i < idx + 100; i++) {
    if (buf[i] === 0x5b && buf[i+1] === 0x00 && buf[i+2] === 0x7b && buf[i+3] === 0x00) {
      console.log('Found array at', i);
      const str = buf.slice(i).toString('utf16le');
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
        const arr = JSON.parse(str.slice(0, end + 1));
        console.log('Stock movements extracted:', arr.length);
        arr.forEach((m, idx) => console.log(idx + 1, m.id, m.productTitle, m.type, m.quantity));
        fs.writeFileSync('extracted_user_movements.json', JSON.stringify(arr, null, 2), 'utf8');
      }
      break;
    }
  }
}
