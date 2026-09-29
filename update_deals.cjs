const fs = require('fs');
const path = require('path');

const dirPath = 'C:\\Users\\Anas Mohamed\\Desktop\\Work\\KLS-Martin\\Pipelines';
const folders = fs.readdirSync(dirPath).filter(f => fs.statSync(path.join(dirPath, f)).isDirectory());

const pipelineData = require('C:\\Users\\Anas Mohamed\\.gemini\\antigravity-ide\\brain\\d5bb7feb-1287-4fe0-87fc-7a9c7ee07a78\\scratch\\pipeline.json');
const validRows = pipelineData.filter(row => row['__EMPTY'] && !String(row['__EMPTY']).includes('Customer name') && !String(row['__EMPTY']).includes('PIPELINE'));

function excelDateToJSDate(serial) {
  if (!serial || isNaN(serial)) return "2026-12-31"; 
  const utc_days  = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;                                        
  const date_info = new Date(utc_value * 1000);
  const year = date_info.getFullYear();
  const month = String(date_info.getMonth() + 1).padStart(2, '0');
  const day = String(date_info.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Create a lookup for excel data by code
const excelLookup = {};
for (const row of validRows) {
  let rawCode = String(row['__EMPTY']).trim();
  // Ensure rawCode is 4 digits if possible
  if (rawCode.length < 4 && !isNaN(rawCode)) {
      rawCode = rawCode.padStart(4, '0');
  }
  
  if (!excelLookup[rawCode]) {
      excelLookup[rawCode] = [];
  }
  excelLookup[rawCode].push(row);
}

const deals = [];
let idCounter = 1;

for (const folderName of folders) {
    // folderName format: "0033 - name" or "0048 name"
    let codeMatch = folderName.match(/^(\d{4})/);
    let code = codeMatch ? codeMatch[1] : "";
    let name = folderName.replace(/^\d{4}[\s-]*|[\s-]*\d{4}$/, '').trim();
    
    // Find matching rows in Excel
    let matchingRows = excelLookup[code] || [];
    
    if (matchingRows.length > 0) {
        for (const row of matchingRows) {
            let client = String(row['__EMPTY_1'] || name).trim();
            const stageRaw = String(row['__EMPTY_5']);
            let stage = "Prospecting";
            const prob = Number(stageRaw) || 0;
            if (prob >= 1) stage = "Closed Won";
            else if (prob >= 0.6) stage = "Warm";
            else if (prob >= 0.3) stage = "Cold";
            else stage = "Prospecting";
            
            const amount = Number(row['__EMPTY_3']) || 0;
            const margin = Number(row['__EMPTY_4']) || 0;
            const date = excelDateToJSDate(row['__EMPTY_6']);
            
            deals.push({
                id: `DEAL-${String(idCounter++).padStart(3, '0')}`,
                code: code,
                deal: client,
                client: client,
                product: "KLS Martin",
                stage: stage,
                amount: amount,
                margin: margin,
                closeDate: date,
                nextAction: "Follow up"
            });
        }
    } else {
        // Create an empty deal
        deals.push({
            id: `DEAL-${String(idCounter++).padStart(3, '0')}`,
            code: code,
            deal: name,
            client: name,
            product: "KLS Martin",
            stage: "Prospecting",
            amount: 0,
            margin: 0,
            closeDate: "2026-12-31",
            nextAction: "Need details"
        });
    }
}

let crmContent = fs.readFileSync('C:\\Users\\Anas Mohamed\\klop-teamdb\\src\\data\\crm.ts', 'utf-8');

// Update DealRow type to include code
if (!crmContent.includes('code?: string;')) {
    crmContent = crmContent.replace(/export interface DealRow \{/, 'export interface DealRow {\n  code?: string;');
}

const dealsString = `export const deals: DealRow[] = ${JSON.stringify(deals, null, 2)};`;
crmContent = crmContent.replace(/export const deals: DealRow\[\] = \[[\s\S]*?\];/m, dealsString);

fs.writeFileSync('C:\\Users\\Anas Mohamed\\klop-teamdb\\src\\data\\crm.ts', crmContent);
console.log('Deals updated with codes successfully.');
