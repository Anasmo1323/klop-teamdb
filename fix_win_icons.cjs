const fs = require('fs');
let pages = fs.readFileSync('src/components/views/crm/Pages.tsx', 'utf-8');

// Replace all emerald check icons with the win-check-icon class that has a pulse animation
pages = pages.replace(
  /className="h-8 w-8 flex items-center justify-center text-emerald-500 bg-emerald-50 rounded-md" title="Already converted"/g,
  'className="win-check-icon" title="Already converted to PO"'
);
pages = pages.replace(
  /className="h-8 w-8 flex items-center justify-center text-emerald-500 bg-emerald-50 rounded-md" title="Already invoiced"/g,
  'className="win-check-icon" title="Already invoiced"'
);

fs.writeFileSync('src/components/views/crm/Pages.tsx', pages);
console.log('Done - win check icons updated');
