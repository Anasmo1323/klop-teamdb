const fs = require('fs');
let code = fs.readFileSync('src/components/views/crm/Pages.tsx', 'utf-8');

code = code.replace(/<div className="crm-stats-grid">[\s\S]*?<\/div>/g, (match) => {
  // We only want to remove the ones we just injected (with "Total active POs" and "Total Invoiced").
  // Wait, Dashboard has <div className="crm-stats-grid"> too. Let's not remove those!
  if (match.includes("Total active POs") || match.includes("Total Invoiced")) {
    return "";
  }
  return match;
});

fs.writeFileSync('src/components/views/crm/Pages.tsx', code);
