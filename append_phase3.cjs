const fs = require('fs');
const extra = `
/* ============================================================
   PHASE 3 — ADDITIONAL COMPONENT STYLES
   ============================================================ */

/* Next-action chip */
.ct-next-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 3px 8px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Dashboard page: add top padding before first section header */
.page-header + .crm-stat-grid,
.page-header + .crm-stat-grid-3,
.page-header + .crm-stat-grid-4 {
  margin-top: 0;
}

/* SectionHeader rendered inside PageFrame — gradient strip */
.page-header {
  margin-left: -32px;
  margin-right: -32px;
  padding-left: 32px;
  padding-right: 32px;
}

/* Chart card spacing in dashboard grid */
.crm-dashboard-grid section {
  display: flex;
  flex-direction: column;
}
.crm-chart-wrap {
  flex: 1;
  margin-top: 12px;
}

/* Table section: no extra padding since ct-table-wrap has its own border/radius */
section[style*="border-radius"] {
  overflow: hidden;
}

/* Improve collection mix legend */
.crm-collection-chart {
  display: flex;
  min-height: 200px;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}
.crm-collection-chart > div:last-child {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Attention item values */
.crm-attention-item .text-\\[18px\\] {
  font-size: 20px !important;
  font-weight: 800 !important;
  color: var(--text-heading) !important;
  letter-spacing: -0.03em;
}

/* Inline search input */
.crm-inline-search input {
  border: none !important;
  outline: none !important;
  background: transparent !important;
  font-size: 13px;
  color: var(--text-body);
  min-width: 160px;
}

/* Stats grid spacing below page header */
.crm-stat-grid,
.crm-stat-grid-3,
.crm-stat-grid-4 {
  margin-top: 20px;
}

/* Table section card: ensure table expands flush */
.ct-table-wrap {
  border-radius: var(--radius-md);
}

/* When section uses inline style with border-radius, the ct-table-wrap inside  
   should inherit the radius and sit flush */
section[style*="var(--radius-md)"] .ct-table-wrap {
  border: none;
  border-radius: 0;
  box-shadow: none;
}

/* Amount cols right-align */
.ct-table th:nth-child(5),
.ct-table th:nth-child(7),
.ct-table th:nth-child(8) {
  text-align: right;
}

/* Confetti/pulse on Closed Won check icon */
.win-check-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: var(--success-light);
  color: var(--success);
  border-radius: var(--radius-sm);
  animation: pulse-win 2s ease 1;
}
`;

let css = fs.readFileSync('src/index.css', 'utf-8');
fs.writeFileSync('src/index.css', css + extra);
console.log('Phase 3 CSS appended');
