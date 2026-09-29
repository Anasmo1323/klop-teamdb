const fs = require('fs');
let code = fs.readFileSync('src/components/views/crm/Pages.tsx', 'utf-8');

// Inject useEffect into PurchaseOrdersPage
const poPageStart = code.indexOf('export function PurchaseOrdersPage() {');
const poStoreMatch = code.substring(poPageStart).match(/const store = useEditableRows\("medsales-purchase-orders", purchaseOrders\);/);
if (poStoreMatch) {
  const insertIndex = poPageStart + poStoreMatch.index + poStoreMatch[0].length;
  const hookCode = `
  useEffect(() => {
    const highlightId = sessionStorage.getItem('highlightRow');
    if (highlightId && store.rows.some(r => r.id === highlightId)) {
      setTimeout(() => {
        const el = document.getElementById(\`row-\${highlightId}\`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.backgroundColor = '#e6f4ff';
          el.style.transition = 'background-color 0.5s ease';
          setTimeout(() => {
            el.style.backgroundColor = '';
          }, 2000);
        }
      }, 300);
      sessionStorage.removeItem('highlightRow');
    }
  }, [store.rows]);
`;
  code = code.substring(0, insertIndex) + hookCode + code.substring(insertIndex);
}

// Inject useEffect into InvoicesPage
const invPageStart = code.indexOf('export function InvoicesPage() {');
const invStoreMatch = code.substring(invPageStart).match(/const store = useEditableRows\("medsales-invoices", invoices\);/);
if (invStoreMatch) {
  const insertIndex = invPageStart + invStoreMatch.index + invStoreMatch[0].length;
  const hookCode = `
  useEffect(() => {
    const highlightId = sessionStorage.getItem('highlightRow');
    if (highlightId && store.rows.some(r => r.id === highlightId)) {
      setTimeout(() => {
        const el = document.getElementById(\`row-\${highlightId}\`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.backgroundColor = '#e6f4ff';
          el.style.transition = 'background-color 0.5s ease';
          setTimeout(() => {
            el.style.backgroundColor = '';
          }, 2000);
        }
      }, 300);
      sessionStorage.removeItem('highlightRow');
    }
  }, [store.rows]);
`;
  code = code.substring(0, insertIndex) + hookCode + code.substring(insertIndex);
}

fs.writeFileSync('src/components/views/crm/Pages.tsx', code);
console.log("Hooks injected!");
