const fs = require('fs');

const pipelineData = require('C:\\Users\\Anas Mohamed\\.gemini\\antigravity-ide\\brain\\d5bb7feb-1287-4fe0-87fc-7a9c7ee07a78\\scratch\\pipeline.json');

// Filter out empty rows or headers
const validRows = pipelineData.filter(row => row['__EMPTY_1'] && row['__EMPTY_1'] !== 'Customer name' && !row['__EMPTY_1'].includes('PIPELINE 2026'));

function excelDateToJSDate(serial) {
  if (!serial || isNaN(serial)) return "2026-12-31"; // Fallback
  const utc_days  = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;                                        
  const date_info = new Date(utc_value * 1000);
  const year = date_info.getFullYear();
  const month = String(date_info.getMonth() + 1).padStart(2, '0');
  const day = String(date_info.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const deals = validRows.map((row, idx) => {
  const client = String(row['__EMPTY_1']).trim();
  const stageRaw = String(row['__EMPTY_5']);
  
  // Convert probability to stage
  let stage = "Prospecting";
  const prob = Number(stageRaw) || 0;
  if (prob >= 1) stage = "Closed Won";
  else if (prob >= 0.6) stage = "Warm";
  else if (prob >= 0.3) stage = "Cold";
  else stage = "Prospecting";
  
  const amount = Number(row['__EMPTY_3']) || 0;
  const margin = Number(row['__EMPTY_4']) || 0;
  const date = excelDateToJSDate(row['__EMPTY_6']);

  return {
    id: `DEAL-${String(idx + 1).padStart(3, '0')}`,
    deal: client,
    client: client,
    product: "KLS Martin", // Assuming KLS Martin since the sheet header says KLS MARTIN PIPELINE
    stage: stage,
    amount: amount,
    margin: margin,
    closeDate: date,
    nextAction: "Follow up"
  };
});

let crmContent = fs.readFileSync('C:\\Users\\Anas Mohamed\\klop-teamdb\\src\\data\\crm.ts', 'utf-8');

// Replace team array
const newTeam = `export const team: TeamRow[] = [
  { id: "REP-001", rep: "Albear Emil", region: "Projects", email: "albear@technowave-eg.com", phone: "+20 12 22247653", status: "active", focus: "Projects" },
  { id: "REP-002", rep: "Abd El Rahman", region: "Projects", email: "asalah@technowave-eg.com", phone: "+20 10 30099082", status: "active", focus: "OperaMed" },
  { id: "REP-003", rep: "Anas Mohamed", region: "Projects", email: "amohamed@technowave-eg.com", phone: "+20 10 61059325", status: "active", focus: "KLS Martin" }
];`;

crmContent = crmContent.replace(/export const team: TeamRow\[\] = \[[\s\S]*?\];/m, newTeam);

// Replace targets array
const newTargets = `export const targets: TargetRow[] = [
  { id: "TGT-001", rep: "—", region: "—", focus: "KLS Martin", productLine: "KLS Martin", target: 5000000, achieved: 0, status: "On Track" },
  { id: "TGT-002", rep: "—", region: "—", focus: "OperaMed", productLine: "OperaMed", target: 2500000, achieved: 0, status: "Setup" },
  { id: "TGT-003", rep: "—", region: "—", focus: "Diagon", productLine: "Diagon", target: 1000000, achieved: 0, status: "Setup" }
];`;

crmContent = crmContent.replace(/export const targets: TargetRow\[\] = \[[\s\S]*?\];/m, newTargets);

// Replace deals array
const dealsString = `export const deals: DealRow[] = ${JSON.stringify(deals, null, 2)};`;
crmContent = crmContent.replace(/export const deals: DealRow\[\] = \[[\s\S]*?\];/m, dealsString);

fs.writeFileSync('C:\\Users\\Anas Mohamed\\klop-teamdb\\src\\data\\crm.ts', crmContent);
console.log('crm.ts updated successfully.');
