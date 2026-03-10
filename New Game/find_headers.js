const fs = require('fs');
let buffer = fs.readFileSync('06_MA_Game_Phase_Architecture.md');
let text = buffer.toString('utf16le');
if (text.indexOf('#') === -1) text = buffer.toString('utf8');
const lines = text.split('\n');
lines.forEach((l, i) => {
  if (l.match(/#\s*Phase [2345]/i)) {
    console.log(`Line ${i+1}: ${l.trim()}`);
  }
});
