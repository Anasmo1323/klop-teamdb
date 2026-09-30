import { createContext, type ReactNode, useContext } from "react";
import { downloadExcelSheet, printReport } from "@/lib/crm-actions";
import { ListChecks, TrendingUp, TrendingDown, Printer, Download, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Access Context ───────────────────────────────────────────
type CrmAccess = { role: "admin" | "sales"; adminEmail: string };
const CrmAccessContext = createContext<CrmAccess>({ role: "sales", adminEmail: "" });

export function useCrmAccess() {
  return useContext(CrmAccessContext);
}

// ─── Shell Wrapper ────────────────────────────────────────────
export function CrmShell({
  children,
  role,
  adminEmail,
}: {
  children: ReactNode;
  role: "admin" | "sales";
  adminEmail: string;
}) {
  return (
    <CrmAccessContext.Provider value={{ role, adminEmail }}>
      <div className="crm-app" style={{ color: "var(--text-body)" }}>
        <div className="crm-content">{children}</div>
      </div>
    </CrmAccessContext.Provider>
  );
}

// ─── Section Header ───────────────────────────────────────────
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      style={{ borderRadius: "0" }}
    >
      <div>
        {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-subtitle">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ─── Report Actions ───────────────────────────────────────────
export function ReportActions({
  title,
  headers,
  rows,
  fileName,
  editing,
  onEdit,
  onSave,
  onReset,
  saved,
}: {
  title: string;
  headers: string[];
  rows: Array<Array<unknown>>;
  fileName: string;
  editing?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onReset?: () => void;
  saved?: boolean;
}) {
  return (
    <div className="crm-report-actions no-print">
      {editing && onSave && (
        <button className="btn-blue" onClick={onSave}>
          <Save size={15} />
          Save changes
        </button>
      )}
      {editing && onReset && (
        <button className="btn-secondary" onClick={onReset}>
          <RotateCcw size={14} />
          Reset
        </button>
      )}
      <button className="btn-secondary" onClick={() => printReport(title)}>
        <Printer size={14} />
        Print
      </button>
      <button
        className="btn-secondary"
        onClick={() => downloadExcelSheet(fileName, title, headers, rows)}
      >
        <Download size={14} />
        Excel
      </button>
      {saved && (
        <span className="crm-saved-note">✓ Saved</span>
      )}
    </div>
  );
}

// ─── KPI Stat Card ────────────────────────────────────────────
const accentMap: Record<string, { bg: string; text: string; border: string }> = {
  teal:  { bg: "#F0FDFA", text: "#0D9488", border: "rgba(13,148,136,0.2)" },
  amber: { bg: "#FFFBEB", text: "#D97706", border: "rgba(217,119,6,0.2)" },
  navy:  { bg: "#EFF6FF", text: "#2563EB", border: "rgba(37,99,235,0.2)" },
  rose:  { bg: "#FEF2F2", text: "#DC2626", border: "rgba(220,38,38,0.2)" },
};

export function StatCard({
  label,
  value,
  helper,
  accent = "teal",
  trend,
}: {
  label: string;
  value: string;
  helper: string;
  accent?: "teal" | "amber" | "navy" | "rose";
  trend?: string;
}) {
  const colors = accentMap[accent] ?? accentMap.teal;
  const isUp   = trend?.includes("+") || (trend?.includes("%") && !trend?.includes("-"));
  const isDown = trend?.includes("-");

  return (
    <div className="kpi-card kpi-card-hover animate-slide-up">
      {/* Tinted top accent strip */}
      <div
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl"
        style={{ background: colors.text }}
      />

      <div className="flex items-start justify-between gap-3 pt-1">
        {/* Icon badge */}
        <div
          className="kpi-icon-badge mt-0.5"
          style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>

        {/* Trend badge */}
        {trend && (
          <span className={isUp ? "kpi-trend-up" : isDown ? "kpi-trend-down" : "kpi-trend-up"}>
            {isUp ? <TrendingUp size={11} /> : isDown ? <TrendingDown size={11} /> : null}
            {trend}
          </span>
        )}
      </div>

      <div className="kpi-card-label mt-3">{label}</div>
      <div className="kpi-card-value animate-count-up">{value}</div>
      <div className="kpi-card-helper">{helper}</div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase().replace(/\s/g, "-");
  return <span className={`crm-status-badge status-${key}`}>{status}</span>;
}

// ─── Empty State ──────────────────────────────────────────────
export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="ct-empty">
      <div className="ct-empty-icon">
        <ListChecks size={28} />
      </div>
      <div className="ct-empty-title">{title}</div>
      <p className="ct-empty-sub">{detail}</p>
    </div>
  );
}
