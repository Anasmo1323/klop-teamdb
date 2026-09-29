const fs = require('fs');
let crm = fs.readFileSync('src/components/views/crm/CrmShell.tsx', 'utf-8');

const newSectionHeader = `export function SectionHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        <div className="text-primary font-semibold text-xs tracking-wider uppercase mb-1.5">{eyebrow}</div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      </div>
      <div className="flex-shrink-0">
        {action}
      </div>
    </div>
  );
}`;

const newStatCard = `import { TrendingUp, TrendingDown, Target } from "lucide-react";

export function StatCard({ label, value, helper, accent = "teal", trend }: { label: string; value: string; helper: string; accent?: "teal" | "amber" | "navy" | "rose"; trend?: string }) {
  const isPositive = trend?.includes('+') || trend?.includes('up');
  const isNegative = trend?.includes('-') || trend?.includes('down');
  
  return (
    <div className="relative overflow-hidden bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-default">
      {/* Accent glow on hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity blur-lg pointer-events-none" />
      
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="text-muted-foreground text-xs font-bold tracking-widest uppercase">{label}</div>
        {trend && (
          <div className={\`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full \${isPositive ? 'bg-success/10 text-success' : isNegative ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-muted-foreground'}\`}>
            {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : null}
            {trend}
          </div>
        )}
      </div>
      <div className="relative z-10 mt-3 font-mono text-3xl font-extrabold tracking-tighter text-foreground tabular-nums">
        {value}
      </div>
      <div className="relative z-10 mt-1.5 text-xs text-muted-foreground/80 font-medium">{helper}</div>
    </div>
  );
}`;

crm = crm.replace(/export function SectionHeader.*?\n\s*\);\n}/s, newSectionHeader);
crm = crm.replace(/export function StatCard.*?\n\s*\);\n}/s, newStatCard);

// Make sure to import icons if not imported
if (!crm.includes('TrendingUp')) {
  crm = crm.replace('import { ListChecks } from "lucide-react";', 'import { ListChecks, TrendingUp, TrendingDown, Target } from "lucide-react";');
}

fs.writeFileSync('src/components/views/crm/CrmShell.tsx', crm);
