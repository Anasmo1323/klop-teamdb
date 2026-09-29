const fs = require('fs');
let code = fs.readFileSync('src/components/views/crm/Pages.tsx', 'utf-8');

// Inject into PurchaseOrdersPage
const poSearchRegex = /(<RouteTableHeader[\s\S]*?\/>)\s*(\{adding && \(\s*<AddRecordPanel)/;
const poStats = `
      <div className="crm-stats-grid">
        <StatCard
          label="Total active POs"
          value={formatCurrency(store.rows.filter(r => r.status !== "Cancelled").reduce((sum, r) => sum + r.amount, 0), true)}
          helper="Excluding cancelled"
          accent="navy"
        />
        <StatCard
          label="Pending POs"
          value={formatCurrency(store.rows.filter(r => r.status === "Pending").reduce((sum, r) => sum + r.amount, 0), true)}
          helper="Awaiting approval"
          accent="amber"
        />
        <StatCard
          label="Delivered POs"
          value={formatCurrency(store.rows.filter(r => r.status === "Delivered").reduce((sum, r) => sum + r.amount, 0), true)}
          helper="Ready for invoicing"
          accent="teal"
        />
      </div>
`;
code = code.replace(poSearchRegex, `$1\n${poStats}\n      $2`);


// Inject into InvoicesPage
const invSearchRegex = /(<RouteTableHeader[\s\S]*?fileName="medsales-invoices"[\s\S]*?\/>)\s*(\{adding && \(\s*<AddRecordPanel)/;
const invStats = `
      <div className="crm-stats-grid">
        <StatCard
          label="Total Invoiced"
          value={formatCurrency(store.rows.reduce((sum, r) => sum + r.amount, 0), true)}
          helper="All invoices"
          accent="navy"
        />
        <StatCard
          label="Total Collected"
          value={formatCurrency(store.rows.filter(r => r.status === "Paid").reduce((sum, r) => sum + r.amount, 0), true)}
          helper="Paid invoices"
          accent="teal"
        />
        <StatCard
          label="Total Overdue"
          value={formatCurrency(store.rows.filter(r => r.status === "Overdue").reduce((sum, r) => sum + r.amount, 0), true)}
          helper="Immediate action required"
          accent="rose"
        />
      </div>
`;
code = code.replace(invSearchRegex, `$1\n${invStats}\n      $2`);

fs.writeFileSync('src/components/views/crm/Pages.tsx', code);
console.log("Injected stats");
