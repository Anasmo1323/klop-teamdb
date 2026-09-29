import { createContext, type ReactNode, useContext } from "react";
import { downloadExcelSheet, printReport } from "@/lib/crm-actions";
import { ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";

type CrmAccess = { role: "admin" | "sales"; adminEmail: string };
const CrmAccessContext = createContext<CrmAccess>({ role: "sales", adminEmail: "" });

export function useCrmAccess() {
  return useContext(CrmAccessContext);
}

// In klop-teamdb, App.tsx passes isAdmin down. We'll wrap our CRM pages with this.
export function CrmShell({ children, role, adminEmail }: { children: ReactNode, role: "admin" | "sales", adminEmail: string }) {
  return (
    <CrmAccessContext.Provider value={{ role, adminEmail }}>
      <div className="crm-app text-[#172033]">
        <div className="crm-content">
          {children}
        </div>
      </div>
    </CrmAccessContext.Provider>
  );
}

export function SectionHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="crm-page-header">
      <div>
        <div className="crm-eyebrow">{eyebrow}</div>
        <h1 className="crm-page-title">{title}</h1>
        <p className="crm-page-description">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function ReportActions({ title, headers, rows, fileName, editing, onEdit, onSave, onReset, saved }: { title: string; headers: string[]; rows: Array<Array<unknown>>; fileName: string; editing?: boolean; onEdit?: () => void; onSave?: () => void; onReset?: () => void; saved?: boolean }) {
  return (
    <div className="crm-report-actions">
      {editing && onSave && <Button className="crm-primary-button" onClick={onSave}>Save changes</Button>}
      {editing && onReset && <Button variant="ghost" className="crm-reset-button" onClick={onReset}>Reset</Button>}
      <Button className="crm-secondary-button" onClick={() => printReport(title)}><span className="crm-action-icon">↗</span> Print report</Button>
      <Button className="crm-secondary-button" onClick={() => downloadExcelSheet(fileName, title, headers, rows)}><span className="crm-action-icon">↓</span> Excel download</Button>
      {saved && <span className="crm-saved-note">Saved on this device</span>}
    </div>
  );
}

export function StatCard({ label, value, helper, accent = "teal", trend }: { label: string; value: string; helper: string; accent?: "teal" | "amber" | "navy" | "rose"; trend?: string }) {
  return (
    <div className={`crm-stat-card crm-stat-${accent}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="crm-stat-label">{label}</div>
        {trend && <span className="crm-stat-trend">{trend}</span>}
      </div>
      <div className="crm-stat-value">{value}</div>
      <div className="crm-stat-helper">{helper}</div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusKey = status.toLowerCase().replace(/\s/g, "-");
  return <span className={`crm-status-badge status-${statusKey}`}>{status}</span>;
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="crm-empty-state">
      <ListChecks size={19} />
      <div>
        <div className="font-semibold text-[#2f3d53]">{title}</div>
        <div className="mt-1 text-[12px] text-[#8a98ad]">{detail}</div>
      </div>
    </div>
  );
}
