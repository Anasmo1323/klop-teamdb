const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace(
  '<div className="flex-1 overflow-auto px-8 pb-8">',
  '<div className="flex-1 overflow-auto" style={{ background: "var(--background)" }}>'
);
app = app.replace(
  '{renderContent()}\n          </CrmShell>',
  '<div dir="auto">{renderContent()}</div>\n          </CrmShell>'
);
fs.writeFileSync('src/App.tsx', app);
