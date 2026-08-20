const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = xlsx.readFile('Private Sector.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet, {header: 1});

const hospitals = [];
let currentGroup = null;

// skip header row
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row || row.length === 0) continue;
  
  if (row.length === 1 && row[0]) {
    currentGroup = String(row[0]).trim();
  } else if (row.length >= 1 && row[0]) {
    const nameEN = String(row[0]).trim();
    const nameAR = row[1] ? String(row[1]).trim() : '';
    
    // If no group has been seen yet, the hospital acts as its own group
    const group = currentGroup || nameEN;
    
    hospitals.push({
      nameEN,
      nameAR,
      group
    });
  }
}

// ensure directory exists
const dir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(path.join(dir, 'hospitals.json'), JSON.stringify(hospitals, null, 2));
console.log('Successfully wrote', hospitals.length, 'hospitals to src/data/hospitals.json');
