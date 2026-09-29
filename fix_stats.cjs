const fs = require('fs');
let code = fs.readFileSync('src/components/views/crm/Pages.tsx', 'utf-8');

// 1. Fix PO Page stats grid class
code = code.replace(
  /<div className="crm-stats-grid">([\s\S]*?Total active POs[\s\S]*?)<\/div>/,
  '<div className="crm-stat-grid crm-stat-grid-3">$1</div>'
);

// 2. Fix Invoices Page stats calculation
const invoiceStatsRegex = /<div className="crm-stat-grid crm-stat-grid-3">\s*<StatCard\s*label="Invoiced"[\s\S]*?<\/div>/;
const dynamicInvoiceStats = `<div className="crm-stat-grid crm-stat-grid-3">
        <StatCard
          label="Invoiced"
          value={formatCurrency(store.rows.reduce((sum, r) => sum + r.amount, 0), true)}
          helper={\`\${store.rows.length} invoices\`}
          accent="navy"
        />
        <StatCard
          label="Collected"
          value={formatCurrency(store.rows.filter(r => r.status === "Paid").reduce((sum, r) => sum + r.amount, 0), true)}
          helper={\`\${store.rows.reduce((sum, r) => sum + r.amount, 0) > 0 ? Math.round((store.rows.filter(r => r.status === "Paid").reduce((sum, r) => sum + r.amount, 0) / store.rows.reduce((sum, r) => sum + r.amount, 0)) * 100) : 0}% collected\`}
          accent="teal"
        />
        <StatCard
          label="At risk"
          value={formatCurrency(store.rows.filter(r => r.status === "Overdue" || r.status === "Sent").reduce((sum, r) => sum + r.amount, 0), true)}
          helper="Sent + overdue exposure"
          accent="rose"
        />
      </div>`;

code = code.replace(invoiceStatsRegex, dynamicInvoiceStats);

fs.writeFileSync('src/components/views/crm/Pages.tsx', code);
console.log("Stats fixed!");
