const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');

// Remove the aggressive section overflow rule that was clipping content
css = css.replace(
  `/* When section uses inline style with border-radius, the ct-table-wrap inside  
   should inherit the radius and sit flush */
section[style*="var(--radius-md)"] .ct-table-wrap {
  border: none;
  border-radius: 0;
  box-shadow: none;
}`,
  `/* Table wraps inside card sections sit flush — no double border */
.ct-table-section .ct-table-wrap {
  border: none;
  border-radius: 0;
  box-shadow: none;
}`
);

// Remove the old "section[style*=border-radius] overflow: hidden" that was eating padding 
css = css.replace(
  `/* Table section: no extra padding since ct-table-wrap has its own border/radius */
section[style*="border-radius"] {
  overflow: hidden;
}`,
  `/* Table sections clip at their own rounded corners */
/* (overflow is now set inline per-section so we don't need this global rule) */`
);

// Add rules for the admin badge bar and client cell bidi fix
css += `
/* ============================================================
   ALIGNMENT FIXES (Phase 3 patch)
   ============================================================ */

/* Admin badge bar inside table sections */
.admin-badge-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px 8px;
  border-bottom: 1px solid var(--border);
}

/* Client / text cells with Arabic — keep cell LTR but text bidi-sensitive */
.ct-table td .client-name {
  unicode-bidi: plaintext;
  display: block;
}

/* ct-table-wrap inside card section: flush, no double border/radius */
.ct-table-wrap:only-child {
  border-radius: inherit;
}

/* Table section overflow: hidden so table respects section border-radius */
section[style*="overflow: hidden"] .ct-table-wrap {
  border: none;
  border-radius: 0;
  box-shadow: none;
}

/* Crm-table-avatar — ensure it stays square */
.crm-table-avatar {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: var(--primary-light);
  color: var(--primary-text);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

/* Attention items value text */
.crm-attention-item .attention-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-heading);
  letter-spacing: -0.03em;
  margin-top: 8px;
}
.crm-attention-item .attention-detail {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 3px;
}
`;

fs.writeFileSync('src/index.css', css);
console.log('CSS alignment rules updated');
