const fs = require('fs');
let pages = fs.readFileSync('src/components/views/crm/Pages.tsx', 'utf-8');

// 1. Pass editing prop to all DataTable calls in ForecastPage
pages = pages.replace(
  '      <section className="crm-card">\n        <div className="crm-table-meta">\n          <AdminBadge />\n        </div>\n        <DataTable>',
  '      <section className="crm-card">\n        <div className="crm-table-meta">\n          <AdminBadge />\n        </div>\n        <DataTable editing={store.editing}>',
  // Only do the first occurrence (ForecastPage) - we use replaceAll below
);

// Actually replace all occurrences carefully
// Reset and use a regex to add editing to all DataTable calls that use store.editing in scope
// The simplest approach: replace all bare <DataTable> with <DataTable editing={store.editing}>
pages = pages.replace(/<DataTable>/g, '<DataTable editing={store.editing}>');

// 2. Upgrade section wrappers for pipeline/targets/etc from crm-card to ct-card style inline
// For pipeline section container, wrap table in a styled div instead of section.crm-card  
pages = pages.replace(
  /className="crm-card"\s*>/g,
  `style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>`
);

// 3. Remove crm-table-meta wrappers (just style inline)
pages = pages.replace(
  /<div className="crm-table-meta">\s*<AdminBadge \/>\s*<\/div>/g,
  '<div style={{ padding: "12px 16px 0", display: "flex", gap: 8 }}><AdminBadge /></div>'
);

// 4. crm-card crm-add-panel -> styled inline
pages = pages.replace(
  'className="crm-card crm-add-panel"',
  'style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)", padding: "20px", marginBottom: 16 }}'
);

// 5. For the add form grid and fields, upgrade inline
pages = pages.replace(/className="crm-add-form"/g, 'style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginTop: 16 }}');
pages = pages.replace(/className="crm-add-field"/g, 'style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--text-body)" }}');
pages = pages.replace(/className="crm-edit-input"/g, 'style={{ height: 34, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 10px", fontSize: 13, outline: "none", width: "100%", background: "var(--surface)" }}');
pages = pages.replace(/className="crm-edit-select crm-add-select"/g, 'style={{ height: 34, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 10px", fontSize: 13, background: "var(--surface)", width: "100%" }}');
pages = pages.replace(/className="crm-add-actions"/g, 'style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}');
pages = pages.replace(/className="crm-add-hint"/g, 'style={{ fontSize: 12, color: "var(--text-muted)" }}');
pages = pages.replace(/className="crm-primary-button"/g, 'className="btn-blue"');

// 6. Upgrade cancel/reset buttons in add panels
pages = pages.replace(/className="crm-reset-button"/g, 'className="btn-secondary"');

// 7. crm-secondary-button -> btn-secondary
pages = pages.replace(/className="crm-secondary-button"/g, 'className="btn-secondary"');

// 8. crm-select -> simplified inline
pages = pages.replace(/className="crm-select w-\[142px\]"/g, 'style={{ height: 36, minWidth: 140, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 13 }}');

// 9. crm-inline-search - style inline
pages = pages.replace(/className="crm-inline-search"/g, 'style={{ display: "flex", alignItems: "center", gap: 8, height: 36, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "0 10px" }}');

// 10. crm-edit-select (standalone, not add-select)
pages = pages.replace(/className="crm-edit-select"/g, 'style={{ height: 32, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 13, background: "var(--surface)" }}');

// 11. crm-next-action span - upgrade to new chip style
pages = pages.replace(/className="crm-next-action"/g, 'className="ct-next-action"');

fs.writeFileSync('src/components/views/crm/Pages.tsx', pages);
console.log('Done');
