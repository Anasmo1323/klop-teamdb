const fs = require('fs');
let code = fs.readFileSync('src/components/views/crm/Pages.tsx', 'utf-8');

// 1. Add Check to lucide-react
code = code.replace(
  'ReceiptText,\n} from "lucide-react";',
  'ReceiptText,\n  Check,\n} from "lucide-react";'
);

// 2. Add firestore imports
code = code.replace(
  'import { writeBatch, doc, setDoc, updateDoc } from "firebase/firestore";',
  'import { writeBatch, doc, setDoc, updateDoc, query, getDocs, where, collection } from "firebase/firestore";'
);

// 3. Replace ForecastPage handleConvertToPO
const forecastHandleRegex = /const handleConvertToPO = async \(deal: DealRow\) => \{[\s\S]*?toast\.error\("Error converting to PO: " \+ e\.message\);\n    \}\n  \};/;
const newForecastHandle = `const handleConvertToPO = async (deal: DealRow) => {
    try {
      if (deal.code) {
        const poQuery = query(collection(db, "medsales-purchase-orders"), where("code", "==", deal.code));
        const poDocs = await getDocs(poQuery);
        if (!poDocs.empty) {
          const existingPo = poDocs.docs[0];
          toast.success("This deal is already converted to a Purchase Order.");
          sessionStorage.setItem('highlightRow', existingPo.id);
          window.dispatchEvent(new CustomEvent("navigate-tab", { detail: "orders" }));
          return;
        }
      }
      
      const newId = \`PO-\${Date.now().toString().slice(-4)}\`;
      const newPO: PurchaseOrderRow = {
        code: deal.code,
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
  };`;
code = code.replace(forecastHandleRegex, newForecastHandle);

// 4. Replace PurchaseOrdersPage handleConvertToInvoice
const poHandleRegex = /const handleConvertToInvoice = async \(po: PurchaseOrderRow\) => \{[\s\S]*?toast\.error\("Error converting to Invoice: " \+ e\.message\);\n    \}\n  \};/;
const newPoHandle = `const handleConvertToInvoice = async (po: PurchaseOrderRow) => {
    try {
      if (po.code) {
        const invQuery = query(collection(db, "medsales-invoices"), where("code", "==", po.code));
        const invDocs = await getDocs(invQuery);
        if (!invDocs.empty) {
          const existingInv = invDocs.docs[0];
          toast.success("This Purchase Order is already converted to an Invoice.");
          sessionStorage.setItem('highlightRow', existingInv.id);
          window.dispatchEvent(new CustomEvent("navigate-tab", { detail: "invoices" }));
          return;
        }
      }

      const newId = \`INV-\${Date.now().toString().slice(-4)}\`;
      const newInvoice: InvoiceRow = {
        code: po.code,
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
  };`;
code = code.replace(poHandleRegex, newPoHandle);

// 5. Replace buttons in ForecastPage
// Note: there is no Check icon there yet, just ShoppingCart
const forecastButtonRegex = /<Button\s+variant="ghost"\s+size="icon"\s+className="h-8 w-8 text-primary hover:text-primary hover:bg-primary\/10"\s+title="Translate to PO"\s+onClick=\{\(\) => handleConvertToPO\(row\)\}\s*>\s*<ShoppingCart size=\{14\} \/>\s*<\/Button>/;
const newForecastButton = `{row.stage === "Closed Won" ? (
                        <span className="h-8 w-8 flex items-center justify-center text-emerald-500 bg-emerald-50 rounded-md" title="Already converted">
                          <Check size={16} strokeWidth={2.5} />
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                          title="Translate to PO"
                          onClick={() => handleConvertToPO(row)}
                        >
                          <ShoppingCart size={14} />
                        </Button>
                      )}`;
code = code.replace(forecastButtonRegex, newForecastButton);

// 6. Replace buttons in PurchaseOrdersPage
const poButtonRegex = /<Button\s+variant="ghost"\s+size="icon"\s+className="h-8 w-8 text-primary hover:text-primary hover:bg-primary\/10"\s+title="Translate to Invoice"\s+onClick=\{\(\) => handleConvertToInvoice\(row\)\}\s*>\s*<ReceiptText size=\{14\} \/>\s*<\/Button>/;
const newPoButton = `{row.status === "Delivered" ? (
                        <span className="h-8 w-8 flex items-center justify-center text-emerald-500 bg-emerald-50 rounded-md" title="Already invoiced">
                          <Check size={16} strokeWidth={2.5} />
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                          title="Translate to Invoice"
                          onClick={() => handleConvertToInvoice(row)}
                        >
                          <ReceiptText size={14} />
                        </Button>
                      )}`;
code = code.replace(poButtonRegex, newPoButton);

// 7. Add id to tr in PurchaseOrdersPage
// It looks like <tr key={row.id}>
// But wait, there are multiple <tr key={row.id}> in Pages.tsx (Targets, Forecast, PO, Invoices).
// Let's replace all of them with <tr key={row.id} id={\`row-\${row.id}\`}>
code = code.replaceAll('<tr key={row.id}>', '<tr key={row.id} id={`row-${row.id}`}>');

fs.writeFileSync('src/components/views/crm/Pages.tsx', code);
console.log("Pages.tsx updated with safety belts!");
