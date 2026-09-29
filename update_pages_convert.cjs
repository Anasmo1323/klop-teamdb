const fs = require('fs');
let code = fs.readFileSync('src/components/views/crm/Pages.tsx', 'utf-8');

// 1. Add lucide-react icons
code = code.replace(
  'Trash2,\n} from "lucide-react";',
  'Trash2,\n  ShoppingCart,\n  ReceiptText,\n} from "lucide-react";'
);

// 2. Add firebase/firestore imports
code = code.replace(
  'import { writeBatch, doc } from "firebase/firestore";',
  'import { writeBatch, doc, setDoc, updateDoc } from "firebase/firestore";'
);

// 3. Inject handleConvertToPO into ForecastPage
const forecastPageRegex = /(export function ForecastPage\(\) \{[\s\S]*?)(const store = useEditableRows)/;
code = code.replace(forecastPageRegex, (match, p1, p2) => {
  return `${p1}
  const handleConvertToPO = async (deal: DealRow) => {
    try {
      const newId = \`PO-\${Date.now().toString().slice(-4)}\`;
      const newPO: PurchaseOrderRow = {
        id: newId,
        client: deal.client,
        rep: "—",
        amount: deal.amount,
        status: "Pending",
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: "",
        followUp: deal.nextAction || "From pipeline",
      };
      await setDoc(doc(db, "medsales-purchase-orders", newId), newPO);
      await updateDoc(doc(db, "medsales-forecast", deal.id), {
        stage: "Closed Won"
      });
      toast.success("Converted to Purchase Order successfully.");
    } catch(e: any) {
      toast.error("Error converting to PO: " + e.message);
    }
  };
  ${p2}`;
});

// 4. Update ForecastPage buttons
const forecastButtonRegex = /(<AdminDeleteButton\s*onDelete=\{\(\) => store\.deleteRow\(originalIndex\)\}\s*\/>)/;
// Wait, replacing the first occurrence might not be ForecastPage if there's one before it?
// There's TargetsPage before ForecastPage.
// TargetsPage doesn't have an AdminDeleteButton in its rows? Wait, yes it does. 
// No, TargetsPage does not have a delete button in rows. Let's check.
// To be safe, let's locate the exact replacement for ForecastPage.
// We can use a generic replacement but only inside ForecastPage function.

// 5. Inject handleConvertToInvoice into PurchaseOrdersPage
const poPageRegex = /(export function PurchaseOrdersPage\(\) \{[\s\S]*?)(const store = useEditableRows)/;
code = code.replace(poPageRegex, (match, p1, p2) => {
  return `${p1}
  const handleConvertToInvoice = async (po: PurchaseOrderRow) => {
    try {
      const newId = \`INV-\${Date.now().toString().slice(-4)}\`;
      const newInvoice: InvoiceRow = {
        id: newId,
        client: po.client,
        po: po.id,
        amount: po.amount,
        status: "Draft",
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: "",
        daysOverdue: 0,
        followUp: po.followUp || "From PO",
      };
      await setDoc(doc(db, "medsales-invoices", newId), newInvoice);
      await updateDoc(doc(db, "medsales-purchase-orders", po.id), {
        status: "Delivered"
      });
      toast.success("Converted to Invoice successfully.");
    } catch(e: any) {
      toast.error("Error converting to Invoice: " + e.message);
    }
  };
  ${p2}`;
});

fs.writeFileSync('src/components/views/crm/Pages.tsx', code);
console.log('Functions injected successfully.');
