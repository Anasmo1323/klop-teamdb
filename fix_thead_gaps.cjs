const fs = require('fs');
let pages = fs.readFileSync('src/components/views/crm/Pages.tsx', 'utf-8');

// Remove blank lines between <thead> and <tr>
// Pattern: <thead>\n\n\n...\n            <tr>  →  <thead>\n            <tr>
pages = pages.replace(/<thead>\s*\n(\s*\n)+(\s*<tr>)/g, '<thead>\n$2');

// Also remove blank lines between </tr> and </thead> (trailing empties)
pages = pages.replace(/(<\/tr>)\s*\n(\s*\n)+(\s*<\/thead>)/g, '$1\n$3');

// Remove extra blank lines between </thead> and <tbody>
pages = pages.replace(/(<\/thead>)\s*\n(\s*\n)+(\s*<tbody>)/g, '$1\n$3');

fs.writeFileSync('src/components/views/crm/Pages.tsx', pages);
console.log('Blank thead rows removed');
