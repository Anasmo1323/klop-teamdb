const fs = require('fs');
let pages = fs.readFileSync('src/components/views/crm/Pages.tsx', 'utf-8');

// ─────────────────────────────────────────────────────────────────────────────
// FIX 1: Admin badge wrapper — remove the separate padding div.
// Instead, render AdminBadge INSIDE the DataTable's first row header area.
// Simplest approach: change the badge wrapper so it's a caption-style bar ABOVE
// the table inside the section, with proper visual integration.
// ─────────────────────────────────────────────────────────────────────────────
pages = pages.replace(
  /style=\{\{ padding: "12px 16px 0", display: "flex", gap: 8 \}\}><AdminBadge \/><\/div>/g,
  'style={{ padding: "10px 16px 8px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border)" }}><AdminBadge /></div>'
);

// ─────────────────────────────────────────────────────────────────────────────
// FIX 2: Arabic text in client cells — remove any dir="auto" on <td> or
// wrapping div cells. Instead, wrap only the text node in <span dir="auto">.
//
// We had: <div dir="auto" style={{ fontWeight: 600, color: "var(--text-heading)", fontSize: 14 }}>
//           {row.client}
//         </div>
// Fix to: <div style={{ fontWeight: 600, color: "var(--text-heading)", fontSize: 14 }}>
//           <span dir="auto">{row.client}</span>
//         </div>
// ─────────────────────────────────────────────────────────────────────────────
pages = pages.replace(
  /<div dir="auto" style=\(\{ fontWeight: 600, color: "var\(--text-heading\)", fontSize: 14 \}\)>\s*\{row\.client\}\s*<\/div>/g,
  '<div style={{ fontWeight: 600, color: "var(--text-heading)", fontSize: 14 }}><span dir="auto">{row.client}</span></div>'
);

// Also fix the regex-escaped version
pages = pages.replace(
  `<div dir="auto" style={{ fontWeight: 600, color: "var(--text-heading)", fontSize: 14 }}>
                          {row.client}
                        </div>`,
  `<div style={{ fontWeight: 600, color: "var(--text-heading)", fontSize: 14 }}><span dir="auto">{row.client}</span></div>`
);

// ─────────────────────────────────────────────────────────────────────────────
// FIX 3: Sales team rep cell — upgrade hardcoded hex colors to CSS vars
// ─────────────────────────────────────────────────────────────────────────────
pages = pages.replace(
  /className="font-semibold text-\[#2b3a51\]"/g,
  'style={{ fontWeight: 600, color: "var(--text-heading)", fontSize: 14 }}'
);
pages = pages.replace(
  /className="text-\[11px\] text-\[#a0abba\]"/g,
  'style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}'
);
pages = pages.replace(
  /className="text-\[12px\] text-\[#a0abba\]"/g,
  'style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}'
);

// ─────────────────────────────────────────────────────────────────────────────
// FIX 4: Section overflow — the section wrapper for table cards should not
// clip the badge. Add overflow: visible back (the table inside handles its own
// radius, the outer section just needs the card shape).
// ─────────────────────────────────────────────────────────────────────────────
// The CSS in index.css has: section[style*="border-radius"] { overflow: hidden; }
// We fix this by replacing the style attr to also include overflow: visible
pages = pages.replace(
  /style=\{\{ background: "var\(--surface\)", border: "1px solid var\(--border\)", borderRadius: "var\(--radius-md\)", boxShadow: "var\(--shadow-card\)" \}\}>/g,
  'style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>'
);

fs.writeFileSync('src/components/views/crm/Pages.tsx', pages);
console.log('Done - alignment fixes applied');
