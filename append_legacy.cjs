const fs = require('fs');

const legacyCSS = `
/* Legacy CRM Classes (to be replaced in Phase 3) */
.crm-card { @apply bg-card text-card-foreground border border-border rounded-xl p-5 shadow-sm; }
.crm-card-heading { @apply flex items-start justify-between gap-4 mb-4; }
.crm-card-title { @apply text-base font-bold text-foreground; }
.crm-card-subtitle { @apply text-sm text-muted-foreground mt-1; }
.crm-more { @apply text-muted-foreground hover:bg-secondary p-1 rounded-md transition-colors; }

.crm-dashboard-grid { @apply grid grid-cols-1 md:grid-cols-2 gap-4 mb-6; }
.crm-attention-grid { @apply grid grid-cols-1 md:grid-cols-3 gap-4 mt-6; }
.crm-attention-item { @apply bg-secondary/50 border border-border rounded-xl p-4; }
.crm-attention-label { @apply text-[11px] font-bold uppercase tracking-widest text-muted-foreground; }
.attention-danger { @apply bg-destructive/5 border-destructive/20 text-destructive; }
.attention-warning { @apply bg-warning/5 border-warning/20 text-warning; }
.attention-info { @apply bg-primary/5 border-primary/20 text-primary; }

.crm-table-wrap { @apply overflow-x-auto w-full border border-border rounded-xl shadow-sm bg-card; }
.crm-table { @apply w-full min-w-[800px] text-sm; }
.crm-table th { @apply bg-secondary/50 text-muted-foreground font-semibold py-3 px-4 text-left border-b border-border; }
.crm-table td { @apply py-3 px-4 border-b border-border/50 text-foreground align-middle; }
.crm-table tbody tr:hover td { @apply bg-secondary/30; }

.crm-status-badge { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap; }
.status-on-track, .status-paid, .status-delivered, .status-active, .status-closed-won { @apply bg-success/10 text-success; }
.status-at-risk, .status-overdue, .status-pending, .status-closed-lost { @apply bg-destructive/10 text-destructive; }
.status-watch, .status-approved, .status-warm { @apply bg-warning/10 text-warning; }
.status-setup, .status-draft, .status-prospecting, .status-cold, .status-sent, .status-shipped { @apply bg-secondary text-muted-foreground; }

.crm-progress { @apply h-1.5 w-16 bg-secondary overflow-hidden rounded-full; }
.crm-progress span { @apply block h-full bg-primary rounded-full; }
.crm-next-action { @apply inline-flex items-center px-2 py-1 rounded-md bg-secondary text-[11px] text-muted-foreground; }
.crm-empty-state { @apply flex flex-col items-center justify-center p-8 text-center text-muted-foreground; }
`;

let css = fs.readFileSync('src/index.css', 'utf-8');
if (!css.includes('.crm-card {')) {
  fs.writeFileSync('src/index.css', css + '\n' + legacyCSS);
}
