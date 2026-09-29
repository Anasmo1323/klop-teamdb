const fs = require('fs');
let code = fs.readFileSync('src/components/views/crm/Pages.tsx', 'utf-8');

code = code.replace(/useEditableRows\("medsales-purchase-orders", purchaseOrders\)/, 'useEditableRows("medsales-purchase-orders", [])');
code = code.replace(/useEditableRows\("medsales-invoices", invoices\)/, 'useEditableRows("medsales-invoices", [])');

fs.writeFileSync('src/components/views/crm/Pages.tsx', code);
