const fs = require('fs');
const path = require('path');
const dir = '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => path.join(dir, f))
    .concat(fs.readdirSync('By Phase').filter(f => f.endsWith('.md')).map(f => path.join('By Phase', f)));

let out = [];
files.forEach(f => {
    let buffer = fs.readFileSync(f);
    let text = buffer.toString('utf16le');
    if (!text.includes('#')) text = buffer.toString('utf8');

    const lines = text.split('\n');
    lines.forEach((l, i) => {
        if (l.match(/Phase [6789]/i) || l.match(/Phase 10/i) || l.match(/Management Presentation/i) || l.match(/BAFO/i) || l.match(/signing \& closing/i)) {
            out.push(`${f}:${i + 1}: ${l.trim()}`);
        }
    });
});
fs.writeFileSync('search_results.txt', out.join('\n'));
