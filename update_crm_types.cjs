const fs = require('fs');
let code = fs.readFileSync('src/data/crm.ts', 'utf-8');

code = code.replace(
  'export type PurchaseOrderRow = {\n  id: string;',
  'export type PurchaseOrderRow = {\n  code?: string;\n  id: string;'
);

code = code.replace(
  'export type InvoiceRow = {\n  id: string;',
  'export type InvoiceRow = {\n  code?: string;\n  id: string;'
);

fs.writeFileSync('src/data/crm.ts', code);
