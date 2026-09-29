const fs = require('fs');
let code = fs.readFileSync('src/data/crm.ts', 'utf-8');

code = code.replace(/export const purchaseOrders: PurchaseOrderRow\[\] = \[[\s\S]*?\];/, 'export const purchaseOrders: PurchaseOrderRow[] = [];');
code = code.replace(/export const invoices: InvoiceRow\[\] = \[[\s\S]*?\];/, 'export const invoices: InvoiceRow[] = [];');

fs.writeFileSync('src/data/crm.ts', code);
