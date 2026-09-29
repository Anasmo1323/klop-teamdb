const XLSX = require('xlsx');
const fs = require('fs');
const workbook = XLSX.readFile('Pipeline form.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);
fs.writeFileSync('C:\\Users\\Anas Mohamed\\.gemini\\antigravity-ide\\brain\\d5bb7feb-1287-4fe0-87fc-7a9c7ee07a78\\scratch\\pipeline.json', JSON.stringify(data, null, 2));
console.log('Parsed successfully');
