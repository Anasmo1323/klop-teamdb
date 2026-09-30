import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Filter,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CrmShell, EmptyState, ReportActions, SectionHeader, StatCard, StatusBadge, useCrmAccess } from "./CrmShell";
import { useEditableRows } from "@/hooks/useEditableRows";
import { authorizeAdminAction } from "@/lib/crm-actions";
import {
  achievementByRep,
  attentionItems,
  collectionsByStatus,
  deals,
  formatCurrency,
  formatDate,
  invoices,
  monthlyTrend,
  pipelineByStage,
  purchaseOrders,
  stageColors,
  stageOrder,
  targets,
  team,
  totalInvoiced,
  collected,
  overdueExposure,
  type DealRow,
  type InvoiceRow,
  type PurchaseOrderRow,
  type TargetRow,
  type TeamRow,
} from "@/data/crm";

const chartTooltip = {
  contentStyle: { borderRadius: 12, border: "1px solid #e7ebf2", boxShadow: "0 8px 24px rgba(20, 33, 61, 0.08)", fontSize: 12 },
};

function PageFrame({ children }: { children: ReactNode }) {
  return <CrmShell>{children}</CrmShell>;
}

function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle: string; children: ReactNode; className?: string }) {
  return (
    <section className={`crm-card ${className}`}>
      <div className="crm-card-heading">
        <div>
          <h2 className="crm-card-title">{title}</h2>
          <p className="crm-card-subtitle">{subtitle}</p>
        </div>
        <button className="crm-more" aria-label={`More options for ${title}`}><MoreHorizontal size={18} /></button>
      </div>
      {children}
    </section>
  );
}

export function DashboardPage() {
  const [period, setPeriod] = useState("YTD");
  const navigate = useNavigate();
  const targetStore = useEditableRows("medsales-targets", targets);
  const pipelineStore = useEditableRows("medsales-forecast", deals);
  const dashboardTargetTotal = targetStore.rows.reduce((sum, row) => sum + row.target, 0);
  const dashboardAchieved = pipelineStore.rows
    .filter((row) => row.stage === "Closed Won")
    .reduce((sum, row) => sum + row.amount, 0);
  const dashboardAttainment = dashboardTargetTotal ? dashboardAchieved / dashboardTargetTotal : 0;
  const dashboardOpenPipeline = pipelineStore.rows
    .filter((row) => !["Closed Won", "Closed Lost"].includes(row.stage))
    .reduce((sum, row) => sum + row.amount, 0);
  const dashboardWeightedPipeline = pipelineStore.rows
    .filter((row) => !["Closed Won", "Closed Lost"].includes(row.stage))
    .reduce((sum, row) => sum + row.amount * row.margin, 0);
  const dashboardActiveDeals = pipelineStore.rows
    .filter((row) => !["Closed Won", "Closed Lost"].includes(row.stage) && row.amount > 0)
    .length;
  const topAttention = attentionItems;
  const dashboardExportRows = [
    ["Revenue achieved", dashboardAchieved, `${Math.round(dashboardAttainment * 100)}% attainment`],
    ["Open pipeline", dashboardOpenPipeline, `${dashboardActiveDeals} active deals`],
    ["Won deals", dashboardWeightedPipeline, "Probability-adjusted open value"],
    ["Invoices & Collections", overdueExposure, "Sent + overdue exposure"],
  ];

  return (
    <PageFrame>
      <SectionHeader
        eyebrow="Operating snapshot · Sep 10, 2026"
        title="Good morning, Albear."
        description="A sharper view of target attainment, deal momentum, and cash collection across the MedSales team."
        action={
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="crm-select w-[118px]"><CalendarDays size={15} /><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="YTD">YTD 2026</SelectItem><SelectItem value="Q3">Q3 2026</SelectItem><SelectItem value="MTD">This month</SelectItem></SelectContent>
            </Select>
            <ReportToolbar title="MedSales CRM dashboard" headers={["Metric", "Value", "Context"]} rows={dashboardExportRows} fileName="medsales-dashboard" />
            <Button className="crm-primary-button" onClick={() => navigate("/forecast")}>Review pipeline <ArrowUpRight size={15} /></Button>
          </div>
        }
      />

      <div className="crm-stat-grid">
        <StatCard label="Revenue achieved" value={formatCurrency(dashboardAchieved, true)} helper={`${Math.round(dashboardAttainment * 100)}% of ${formatCurrency(dashboardTargetTotal, true)} target`} accent="teal" trend="+12.4%" />
        <StatCard label="Open pipeline" value={formatCurrency(dashboardOpenPipeline, true)} helper={`${dashboardActiveDeals} active deals with value`} accent="navy" trend="+8.1%" />
        <StatCard label="Won deals" value={formatCurrency(dashboardWeightedPipeline, true)} helper="Probability-adjusted open value" accent="amber" trend="+5.6%" />
        <StatCard label="Invoices & Collections" value={formatCurrency(overdueExposure, true)} helper={`${invoices.filter((row) => row.status !== "Paid").length} invoices outside paid status`} accent="rose" trend="-4.2%" />
      </div>

      <div className="crm-dashboard-grid">
        <ChartCard title="Achievement by rep" subtitle="Revenue delivered against target · EUR">
          <div className="crm-chart-wrap">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={achievementByRep} margin={{ top: 12, right: 16, left: -12, bottom: 0 }} barGap={8}>
                <CartesianGrid vertical={false} stroke="#edf0f5" />
                <XAxis dataKey="rep" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8b98aa" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8b98aa" }} tickFormatter={(value: number) => `€${Math.round(value / 1000)}k`} />
                <Tooltip {...chartTooltip} formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: "#6e7c92" }} />
                <Bar name="Target" dataKey="target" fill="#dfe5ee" radius={[5, 5, 0, 0]} />
                <Bar name="Achieved" dataKey="achieved" fill="#2a9d8f" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Pipeline by stage" subtitle="Open and weighted value · EUR">
          <div className="crm-chart-wrap">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={pipelineByStage.filter((row) => row.amount > 0)} layout="vertical" margin={{ top: 8, right: 18, left: 18, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="#edf0f5" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8b98aa" }} tickFormatter={(value: number) => `€${Math.round(value / 1_000_000)}M`} />
                <YAxis dataKey="stage" type="category" width={82} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6e7c92" }} />
                <Tooltip {...chartTooltip} formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Bar dataKey="amount" name="Pipeline" radius={[0, 5, 5, 0]}>
                  {pipelineByStage.filter((row) => row.amount > 0).map((entry) => <Cell key={entry.stage} fill={stageColors[entry.stage]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Collections mix" subtitle={`${formatCurrency(totalInvoiced)} invoiced across four records`}>
          <div className="crm-collection-chart">
            <ResponsiveContainer width="48%" height={210}>
              <PieChart>
                <Pie data={collectionsByStatus} dataKey="amount" nameKey="status" innerRadius={58} outerRadius={82} paddingAngle={4}>
                  {collectionsByStatus.map((entry) => <Cell key={entry.status} fill={{ Paid: "#2a9d8f", Sent: "#5b6b8c", Overdue: "#d86c75", Draft: "#dfe5ee" }[entry.status]} />)}
                </Pie>
                <Tooltip {...chartTooltip} formatter={(value) => formatCurrency(Number(value ?? 0))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {collectionsByStatus.map((entry) => (
                <div key={entry.status} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[12px] text-[#6f7d92]"><span className="crm-legend-dot" style={{ backgroundColor: { Paid: "#2a9d8f", Sent: "#5b6b8c", Overdue: "#d86c75", Draft: "#dfe5ee" }[entry.status] }} />{entry.status}</div>
                  <div className="text-right"><div className="text-[12px] font-bold text-[#27354b]">{formatCurrency(entry.amount, true)}</div><div className="text-[10px] text-[#a0abba]">{entry.count} invoice{entry.count > 1 ? "s" : ""}</div></div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Commercial momentum" subtitle="Monthly movement across revenue, pipeline, and collections">
          <div className="crm-chart-wrap">
            <ResponsiveContainer width="100%" height={210}>
              <ComposedChart data={monthlyTrend} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2a9d8f" stopOpacity={0.22} /><stop offset="95%" stopColor="#2a9d8f" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#edf0f5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8b98aa" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8b98aa" }} tickFormatter={(value: number) => `€${Math.round(value / 1000)}k`} />
                <Tooltip {...chartTooltip} formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Area type="monotone" name="Achieved" dataKey="achieved" stroke="#2a9d8f" fill="url(#revenueFill)" strokeWidth={2.5} />
                <Line type="monotone" name="Collected" dataKey="collected" stroke="#f4a261" strokeWidth={2.5} dot={false} />
                <Line type="monotone" name="Pipeline" dataKey="pipeline" stroke="#5b6b8c" strokeWidth={2} dot={false} strokeDasharray="4 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <section className="crm-card mt-5">
        <div className="crm-card-heading">
          <div><h2 className="crm-card-title">Needs attention</h2><p className="crm-card-subtitle">The three places where a focused follow-up can change the week.</p></div>
          <span className="crm-source-tag">Workbook snapshot</span>
        </div>
        <div className="crm-attention-grid">
          {topAttention.map((item) => (
            <Link to={item.route} key={item.label} className={`crm-attention-item attention-${item.tone}`}>
              <div className="flex items-start justify-between gap-3"><span className="crm-attention-label">{item.label}</span><ChevronRight size={16} /></div>
              <div className="mt-3 text-[18px] font-extrabold tracking-tight text-[#25334a]">{item.value}</div>
              <div className="mt-1 text-[12px] text-[#7e8ca0]">{item.detail}</div>
            </Link>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}

function DataTable({ children }: { children: ReactNode }) {
  return <div className="crm-table-wrap"><table className="crm-table">{children}</table></div>;
}

type AddField = {
  name: string;
  label: string;
  type?: "text" | "number" | "date";
  required?: boolean;
  placeholder?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  options?: string[];
};

function AddRecordPanel({ title, description, fields, values, onChange, onSubmit, onCancel }: {
  title: string;
  description: string;
  fields: AddField[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };
  return (
    <section className="crm-card crm-add-panel">
      <div className="crm-card-heading">
        <div>
          <h2 className="crm-card-title">{title}</h2>
          <p className="crm-card-subtitle">{description}</p>
        </div>
        <button type="button" className="crm-reset-button" onClick={onCancel}>Cancel</button>
      </div>
      <form className="crm-add-form" onSubmit={submit}>
        {fields.map((field) => (
          <label key={field.name} className="crm-add-field">
            <span>{field.label}{field.required ? " *" : ""}</span>
            {field.options ? (
              <select className="crm-edit-select crm-add-select" value={values[field.name] ?? ""} required={field.required} onChange={(event) => onChange(field.name, event.target.value)}>
                {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : (
              <Input className="crm-edit-input" type={field.type ?? "text"} value={values[field.name] ?? ""} placeholder={field.placeholder} required={field.required} min={field.min} max={field.max} step={field.step} onChange={(event) => onChange(field.name, event.target.value)} />
            )}
          </label>
        ))}
        <div className="crm-add-actions">
          <Button type="submit" className="crm-primary-button">Add record</Button>
          <span className="crm-add-hint">The new record will be appended and remain in edit mode until you save.</span>
        </div>
      </form>
    </section>
  );
}

function createRecordId(prefix: string, rows: Array<{ id: string }>) {
  let index = rows.length + 1;
  let id = `${prefix}-${String(index).padStart(3, "0")}`;
  while (rows.some((row) => row.id === id)) {
    index += 1;
    id = `${prefix}-${String(index).padStart(3, "0")}`;
  }
  return id;
}

function EditableInput({ value, type = "text", min, max, step, onChange }: { value: string | number; type?: "text" | "number" | "date"; min?: string | number; max?: string | number; step?: string | number; onChange: (value: string) => void }) {
  return <Input className="crm-edit-input" type={type} value={value} min={min} max={max} step={step} onChange={(event) => onChange(event.target.value)} />;
}

function ReportToolbar({ title, headers, rows, fileName, editing, onEdit, onSave, onReset, saved }: {
  title: string; headers: string[]; rows: Array<Array<unknown>>; fileName: string; editing?: boolean; onEdit?: () => void; onSave?: () => void; onReset?: () => void; saved?: boolean;
}) {
  return <ReportActions title={title} headers={headers} rows={rows} fileName={fileName} editing={editing} onEdit={onEdit} onSave={onSave} onReset={onReset} saved={saved} />;
}

function AdminBadge() {
  const { role } = useCrmAccess();
  if (role !== "admin") return null;
  return <span className="crm-admin-badge"><ShieldCheck size={12} /> Admin controls</span>;
}

async function runAdminAction(action: string, callback: () => void) {
  const allowed = await authorizeAdminAction(action);
  if (!allowed) {
    toast.error("Admin authorization required");
    return;
  }
  callback();
}

function AdminDeleteButton({ onDelete }: { onDelete: () => void }) {
  const { role } = useCrmAccess();
  if (role !== "admin") return null;
  return <button className="crm-delete-button" aria-label="Delete row" onClick={() => {
    if (window.confirm("Delete this row? This action is limited to admins.")) {
      void runAdminAction("delete_row", onDelete);
    }
  }}><Trash2 size={14} /></button>;
}

function RouteTableHeader({ title, description, search, setSearch, filter, setFilter, filterOptions, action }: {
  title: string; description: string; search: string; setSearch: (value: string) => void; filter: string; setFilter: (value: string) => void; filterOptions: string[]; action?: ReactNode;
}) {
  return (
    <SectionHeader eyebrow="Operational detail" title={title} description={description} action={action ?? (
      <div className="flex items-center gap-2">
        <div className="crm-inline-search"><Search size={15} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search..." /></div>
        <Select value={filter} onValueChange={setFilter}><SelectTrigger className="crm-select w-[142px]"><Filter size={14} /><SelectValue /></SelectTrigger><SelectContent>{filterOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select>
      </div>
    )} />
  );
}

export function TargetsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({ productLine: "", target: "", achieved: "", status: "On Track" });
  const { role } = useCrmAccess();
  const canEditTargets = role === "admin";
  const store = useEditableRows("medsales-targets", targets);
  const pipelineStore = useEditableRows("medsales-forecast", deals);
  const rows = store.rows.filter((row) => `${row.productLine ?? row.focus ?? ""} ${row.rep}`.toLowerCase().includes(search.toLowerCase()) && (filter === "All statuses" || row.status === filter));
  const targetTotal = store.rows.reduce((sum, row) => sum + row.target, 0);
  const achievedTotal = pipelineStore.rows
    .filter((row) => row.stage === "Closed Won")
    .reduce((sum, row) => sum + row.amount, 0);
  const targetAttainment = targetTotal ? achievedTotal / targetTotal : 0;
  const exportRows = store.rows.map((row) => {
    const productLine = row.productLine ?? row.focus ?? "To be assigned";
    return [row.id, productLine, row.target, row.achieved, `${row.target ? Math.round(row.achieved / row.target * 100) : 0}%`, row.status];
  });
  const addRecord = () => {
    if (!canEditTargets) {
      toast.error("Admin authorization required to add a target.");
      return;
    }
    if (!draft.productLine.trim()) {
      toast.error("Enter the product line before adding the target.");
      return;
    }
    store.addRow({ id: createRecordId("REP", store.rows), rep: "—", region: "—", focus: draft.productLine.trim() || "To be assigned", productLine: draft.productLine.trim() || "To be assigned", target: Number(draft.target) || 0, achieved: Number(draft.achieved) || 0, status: draft.status as TargetRow["status"] });
    setDraft({ productLine: "", target: "", achieved: "", status: "On Track" });
    setAdding(false);
    toast.success("Target record added. Save changes to keep it.");
  };
  return <PageFrame><RouteTableHeader title="Sales targets" description="Product-line targets and achievement tracking from the source CRM workbook. Sales users can review targets and reports; only the admin can add targets, edit Product Line, or change operational target values." search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} filterOptions={["All statuses", "On Track", "At Risk", "Setup"]} action={<div className="crm-report-actions">{canEditTargets && <Button className="crm-secondary-button" onClick={() => setAdding(true)}>+ Add target</Button>}<ReportToolbar title="Sales targets" headers={["Target ID", "Product Line", "Target", "Achieved", "Progress", "Status"]} rows={exportRows} fileName="medsales-targets" editing={canEditTargets ? store.editing : undefined} onEdit={canEditTargets ? () => store.setEditing(true) : undefined} onSave={canEditTargets ? store.save : undefined} onReset={canEditTargets ? store.reset : undefined} saved={canEditTargets ? store.saved : undefined} /></div>} />
    {adding && canEditTargets && <AddRecordPanel title="Add target record" description="Capture the product line and annual target values." fields={[{ name: "productLine", label: "Product line", required: true }, { name: "target", label: "Target", type: "number", min: 0, step: 1 }, { name: "achieved", label: "Achieved", type: "number", min: 0, step: 1 }, { name: "status", label: "Status", options: ["On Track", "Watch", "At Risk", "Setup"] }]} values={draft} onChange={(name, value) => setDraft((current) => ({ ...current, [name]: value }))} onSubmit={addRecord} onCancel={() => setAdding(false)} />}
    <div className="crm-stat-grid crm-stat-grid-3"><StatCard label="Annual target" value={formatCurrency(targetTotal, true)} helper="Sum of Target column" accent="navy" /><StatCard label="Achieved" value={formatCurrency(achievedTotal, true)} helper={`${Math.round(targetAttainment * 100)}% attainment · total Won deals`} accent="teal" /><StatCard label="Gap to target" value={formatCurrency(targetTotal - achievedTotal, true)} helper="Target total minus Won deals total" accent="amber" /></div>
    <section className="crm-card"><div className="crm-table-meta"><AdminBadge /></div><DataTable><thead><tr><th>Product Line</th><th>Target</th><th>Achieved</th><th>Progress</th><th>Status</th><th /></tr></thead><tbody>{rows.map((row) => { const originalIndex = store.rows.findIndex((item) => item.id === row.id); const pct = row.target ? Math.round(row.achieved / row.target * 100) : 0; const productLine = row.productLine ?? row.focus ?? "To be assigned"; return <tr key={row.id}><td><div className="font-semibold text-[#2b3a51]">{canEditTargets && store.editing ? <EditableInput value={productLine} onChange={(value) => store.updateRow(originalIndex, { productLine: value })} /> : productLine}</div><div className="text-[11px] text-[#a0abba]">{row.id}</div></td><td>{canEditTargets && store.editing ? <EditableInput type="number" value={row.target} onChange={(value) => store.updateRow(originalIndex, { target: Number(value) || 0 })} /> : formatCurrency(row.target, true)}</td><td>{canEditTargets && store.editing ? <EditableInput type="number" value={row.achieved} onChange={(value) => store.updateRow(originalIndex, { achieved: Number(value) || 0 })} /> : formatCurrency(row.achieved, true)}</td><td><div className="flex items-center gap-2"><div className="crm-progress"><span style={{ width: `${Math.min(pct, 100)}%` }} /></div><span className="text-[11px] font-semibold text-[#627089]">{pct}%</span></div></td><td>{canEditTargets && store.editing ? <Select value={row.status} onValueChange={(value) => store.updateRow(originalIndex, { status: value as TargetRow["status"] })}><SelectTrigger className="crm-edit-select"><SelectValue /></SelectTrigger><SelectContent>{["On Track", "Watch", "At Risk", "Setup"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select> : <StatusBadge status={row.status} />}</td><td><AdminDeleteButton onDelete={() => store.deleteRow(originalIndex)} /></td></tr> })}</tbody></DataTable>{rows.length === 0 && <EmptyState title="No target records found" detail="Try a different search or status filter." />}</section>
  </PageFrame>;
}

export function ForecastPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All stages");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({ deal: "", productLine: "", client: "", product: "", stage: "Prospecting", amount: "", margin: "0.30", closeDate: "", nextAction: "" });
  const store = useEditableRows("medsales-forecast", deals);
  const rows = store.rows.filter((row) => (row.deal + row.client).toLowerCase().includes(search.toLowerCase()) && (filter === "All stages" || row.stage === filter));
  const liveOpenPipeline = store.rows
    .filter((row) => !["Closed Won", "Closed Lost"].includes(row.stage))
    .reduce((sum, row) => sum + row.amount, 0);
  const liveWonDeals = store.rows
    .filter((row) => row.stage === "Closed Won")
    .reduce((sum, row) => sum + row.amount, 0);
  const totalDealAmount = store.rows.reduce((sum, row) => sum + row.amount, 0);
  const liveActiveDeals = store.rows
    .filter((row) => !["Closed Won", "Closed Lost"].includes(row.stage) && row.amount > 0)
    .length;
  const liveWinRate = totalDealAmount ? liveWonDeals / totalDealAmount : 0;
  const exportRows = store.rows.map((row) => [row.id, row.deal, row.productLine ?? row.product, row.client, row.product, row.stage, row.amount, row.margin, row.amount * row.margin, formatDate(row.closeDate), row.nextAction]);
  const addRecord = () => {
    if (!draft.deal.trim() || !draft.productLine.trim() || !draft.client.trim() || !draft.product.trim() || !draft.nextAction.trim()) {
      toast.error("Enter the deal, product line, client, product, and next action before adding the forecast.");
      return;
    }
    store.addRow({ id: createRecordId("DEAL", store.rows), deal: draft.deal.trim(), productLine: draft.productLine.trim(), client: draft.client.trim(), product: draft.product.trim(), stage: draft.stage as DealRow["stage"], amount: Number(draft.amount) || 0, margin: Math.min(1, Math.max(0, Number(draft.margin) || 0)), closeDate: draft.closeDate || undefined, nextAction: draft.nextAction.trim() });
    setDraft({ deal: "", productLine: "", client: "", product: "", stage: "Prospecting", amount: "", margin: "0.30", closeDate: "", nextAction: "" });
    setAdding(false);
    toast.success("Pipeline record added. Save changes to keep it.");
  };
  return <PageFrame><RouteTableHeader title="Sales Pipeline" description="Deals, product lines, close timing, weighted value, and next actions in one operating view. Sales team members can add new records or correct entries in edit mode." search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} filterOptions={["All stages", ...stageOrder]} action={<div className="crm-report-actions"><Button className="crm-secondary-button" onClick={() => setAdding(true)}>+ Add pipeline</Button><ReportToolbar title="Sales Pipeline" headers={["Deal ID", "Deal", "Product Line", "Client", "Product", "Stage", "Amount", "Margin", "Gross profit", "Close date", "Next action"]} rows={exportRows} fileName="medsales-forecast" editing={store.editing} onEdit={() => store.setEditing(true)} onSave={store.save} onReset={store.reset} saved={store.saved} /></div>} />
    {adding && <AddRecordPanel title="Add pipeline record" description="Capture the opportunity, product line, commercial value, margin, timing, and next action." fields={[{ name: "deal", label: "Deal name", required: true }, { name: "productLine", label: "Product line", required: true }, { name: "client", label: "Client", required: true }, { name: "product", label: "Product", required: true }, { name: "stage", label: "Stage", options: stageOrder }, { name: "amount", label: "Amount", type: "number", min: 0, step: 1 }, { name: "margin", label: "Margin (decimal)", type: "number", min: 0, max: 1, step: 0.01, required: true }, { name: "closeDate", label: "Close date", type: "date" }, { name: "nextAction", label: "Next action", required: true }]} values={draft} onChange={(name, value) => setDraft((current) => ({ ...current, [name]: value }))} onSubmit={addRecord} onCancel={() => setAdding(false)} />}
    <div className="crm-stat-grid crm-stat-grid-3"><StatCard label="Open pipeline" value={formatCurrency(liveOpenPipeline, true)} helper={`${liveActiveDeals} active deals`} accent="navy" /><StatCard label="Won deals" value={formatCurrency(liveWonDeals, true)} helper="Sum of Amount for Closed Won deals" accent="amber" /><StatCard label="Win rate" value={`${Math.round(liveWinRate * 100)}%`} helper="Closed won vs. progressed" accent="teal" /></div>
    <section className="crm-card"><div className="crm-table-meta"><AdminBadge /></div><DataTable><thead><tr><th>Deal</th><th>Product Line</th><th>Client</th><th>Stage</th><th>Amount</th><th>Margin</th><th>Gross profit</th><th>Close date</th><th>Next action</th><th /></tr></thead><tbody>{rows.map((row) => { const originalIndex = store.rows.findIndex((item) => item.id === row.id); return <tr key={row.id}><td><div className="font-semibold text-[#2b3a51]">{row.deal}</div><div className="text-[11px] text-[#a0abba]">{row.id}</div></td><td>{store.editing ? <EditableInput value={row.productLine ?? row.product} onChange={(value) => store.updateRow(originalIndex, { productLine: value })} /> : row.productLine ?? row.product}</td><td>{store.editing ? <EditableInput value={row.client} onChange={(value) => store.updateRow(originalIndex, { client: value })} /> : row.client}</td><td>{store.editing ? <Select value={row.stage} onValueChange={(value) => store.updateRow(originalIndex, { stage: value as DealRow["stage"] })}><SelectTrigger className="crm-edit-select"><SelectValue /></SelectTrigger><SelectContent>{stageOrder.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select> : <StatusBadge status={row.stage} />}</td><td>{store.editing ? <EditableInput type="number" value={row.amount} onChange={(value) => store.updateRow(originalIndex, { amount: Number(value) || 0 })} /> : formatCurrency(row.amount, true)}</td><td>{store.editing ? <EditableInput type="number" value={row.margin} min={0} max={1} step={0.01} onChange={(value) => store.updateRow(originalIndex, { margin: Math.min(1, Math.max(0, Number(value) || 0)) })} /> : `${Math.round(row.margin * 100)}%`}</td><td>{formatCurrency(row.amount * row.margin, true)}</td><td>{store.editing ? <EditableInput type="date" value={row.closeDate ?? ""} onChange={(value) => store.updateRow(originalIndex, { closeDate: value || undefined })} /> : formatDate(row.closeDate)}</td><td>{store.editing ? <EditableInput value={row.nextAction} onChange={(value) => store.updateRow(originalIndex, { nextAction: value })} /> : <span className="crm-next-action">{row.nextAction}</span>}</td><td><AdminDeleteButton onDelete={() => store.deleteRow(originalIndex)} /></td></tr>})}</tbody></DataTable></section>
  </PageFrame>;
}

export function PurchaseOrdersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({ client: "", rep: "", amount: "", status: "Pending", orderDate: "", deliveryDate: "", followUp: "" });
  const store = useEditableRows("medsales-purchase-orders", purchaseOrders);
  const rows = store.rows.filter((row) => (row.client + row.rep).toLowerCase().includes(search.toLowerCase()) && (filter === "All statuses" || row.status === filter));
  const exportRows = store.rows.map((row) => [row.id, row.client, row.rep, row.amount, row.status, row.orderDate, row.deliveryDate, row.followUp]);
  const addRecord = () => {
    if (!draft.client.trim() || !draft.rep.trim() || !draft.orderDate || !draft.deliveryDate || !draft.followUp.trim()) {
      toast.error("Enter the client, owner, dates, and follow-up before adding the purchase order.");
      return;
    }
    store.addRow({ id: createRecordId("PO", store.rows), client: draft.client.trim(), rep: draft.rep.trim(), amount: Number(draft.amount) || 0, status: draft.status as PurchaseOrderRow["status"], orderDate: draft.orderDate, deliveryDate: draft.deliveryDate, followUp: draft.followUp.trim() });
    setDraft({ client: "", rep: "", amount: "", status: "Pending", orderDate: "", deliveryDate: "", followUp: "" });
    setAdding(false);
    toast.success("Purchase order added. Save changes to keep it.");
  };
  return <PageFrame><RouteTableHeader title="Purchase orders" description="Track orders from approval to delivery, with a clear owner and follow-up cue. Sales team members can add new records or correct entries in edit mode." search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} filterOptions={["All statuses", "Pending", "Approved", "Shipped", "Delivered"]} action={<div className="crm-report-actions"><Button className="crm-secondary-button" onClick={() => setAdding(true)}>+ Add purchase order</Button><ReportToolbar title="Purchase orders" headers={["PO", "Client", "Owner", "Amount", "Status", "Order date", "Delivery date", "Follow-up"]} rows={exportRows} fileName="medsales-purchase-orders" editing={store.editing} onEdit={() => store.setEditing(true)} onSave={store.save} onReset={store.reset} saved={store.saved} /></div>} />
    {adding && <AddRecordPanel title="Add purchase order" description="Capture the commercial owner, value, delivery dates, and follow-up." fields={[{ name: "client", label: "Client", required: true }, { name: "rep", label: "Owner", required: true }, { name: "amount", label: "Amount", type: "number", min: 0, step: 1 }, { name: "status", label: "Status", options: ["Pending", "Approved", "Shipped", "Delivered", "Cancelled"] }, { name: "orderDate", label: "Order date", type: "date", required: true }, { name: "deliveryDate", label: "Delivery date", type: "date", required: true }, { name: "followUp", label: "Follow-up", required: true }]} values={draft} onChange={(name, value) => setDraft((current) => ({ ...current, [name]: value }))} onSubmit={addRecord} onCancel={() => setAdding(false)} />}
    <section className="crm-card"><div className="crm-table-meta"><AdminBadge /></div><DataTable><thead><tr><th>PO</th><th>Client</th><th>Owner</th><th>Amount</th><th>Status</th><th>Order date</th><th>Delivery date</th><th>Follow-up</th><th /></tr></thead><tbody>{rows.map((row) => { const originalIndex = store.rows.findIndex((item) => item.id === row.id); return <tr key={row.id}><td className="font-semibold text-[#2b3a51]">{row.id}</td><td>{store.editing ? <EditableInput value={row.client} onChange={(value) => store.updateRow(originalIndex, { client: value })} /> : row.client}</td><td>{store.editing ? <EditableInput value={row.rep} onChange={(value) => store.updateRow(originalIndex, { rep: value })} /> : row.rep}</td><td>{store.editing ? <EditableInput type="number" value={row.amount} onChange={(value) => store.updateRow(originalIndex, { amount: Number(value) || 0 })} /> : formatCurrency(row.amount, true)}</td><td>{store.editing ? <Select value={row.status} onValueChange={(value) => store.updateRow(originalIndex, { status: value as PurchaseOrderRow["status"] })}><SelectTrigger className="crm-edit-select"><SelectValue /></SelectTrigger><SelectContent>{["Pending", "Approved", "Shipped", "Delivered", "Cancelled"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select> : <StatusBadge status={row.status} />}</td><td>{store.editing ? <EditableInput type="date" value={row.orderDate} onChange={(value) => store.updateRow(originalIndex, { orderDate: value })} /> : formatDate(row.orderDate)}</td><td>{store.editing ? <EditableInput type="date" value={row.deliveryDate} onChange={(value) => store.updateRow(originalIndex, { deliveryDate: value })} /> : formatDate(row.deliveryDate)}</td><td>{store.editing ? <EditableInput value={row.followUp} onChange={(value) => store.updateRow(originalIndex, { followUp: value })} /> : row.followUp}</td><td><AdminDeleteButton onDelete={() => store.deleteRow(originalIndex)} /></td></tr>})}</tbody></DataTable></section>
  </PageFrame>;
}

export function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({ client: "", po: "—", amount: "", status: "Draft", issueDate: "", dueDate: "", daysOverdue: "0", followUp: "" });
  const store = useEditableRows("medsales-invoices", invoices);
  const rows = store.rows.filter((row) => (row.client + row.id).toLowerCase().includes(search.toLowerCase()) && (filter === "All statuses" || row.status === filter));
  const exportRows = store.rows.map((row) => [row.id, row.client, row.po, row.amount, row.status, row.issueDate, row.dueDate, row.daysOverdue, row.followUp]);
  const addRecord = () => {
    if (!draft.client.trim() || !draft.issueDate || !draft.dueDate || !draft.followUp.trim()) {
      toast.error("Enter the client, issue date, due date, and follow-up before adding the invoice.");
      return;
    }
    store.addRow({ id: createRecordId("INV", store.rows), client: draft.client.trim(), po: draft.po.trim() || "—", amount: Number(draft.amount) || 0, status: draft.status as InvoiceRow["status"], issueDate: draft.issueDate, dueDate: draft.dueDate, daysOverdue: Number(draft.daysOverdue) || 0, followUp: draft.followUp.trim() });
    setDraft({ client: "", po: "—", amount: "", status: "Draft", issueDate: "", dueDate: "", daysOverdue: "0", followUp: "" });
    setAdding(false);
    toast.success("Invoice added. Save changes to keep it.");
  };
  return (
    <PageFrame>
      <RouteTableHeader
        title="Invoices & collections"
        description="See what has been issued, what has been collected, and where cash is at risk. Sales team members can add new records or correct entries in edit mode."
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        filterOptions={["All statuses", "Paid", "Sent", "Overdue", "Draft"]}
        action={
          <div className="crm-report-actions">
            <Button className="crm-secondary-button" onClick={() => setAdding(true)}>+ Add invoice</Button>
            <ReportToolbar
              title="Invoices & collections"
              headers={["Invoice", "Client", "PO", "Amount", "Status", "Issue date", "Due date", "Days overdue", "Follow-up"]}
              rows={exportRows}
              fileName="medsales-invoices"
              editing={store.editing}
              onEdit={() => store.setEditing(true)}
              onSave={store.save}
              onReset={store.reset}
              saved={store.saved}
            />
          </div>
        }
      />
      {adding && <AddRecordPanel title="Add invoice" description="Capture the billing reference, amount, status, due dates, and collection follow-up." fields={[{ name: "client", label: "Client", required: true }, { name: "po", label: "Purchase order" }, { name: "amount", label: "Amount", type: "number", min: 0, step: 1 }, { name: "status", label: "Status", options: ["Draft", "Sent", "Overdue", "Paid"] }, { name: "issueDate", label: "Issue date", type: "date", required: true }, { name: "dueDate", label: "Due date", type: "date", required: true }, { name: "daysOverdue", label: "Days overdue", type: "number", min: 0, step: 1 }, { name: "followUp", label: "Follow-up", required: true }]} values={draft} onChange={(name, value) => setDraft((current) => ({ ...current, [name]: value }))} onSubmit={addRecord} onCancel={() => setAdding(false)} />}
      <div className="crm-stat-grid crm-stat-grid-3">
        <StatCard label="Invoiced" value={formatCurrency(totalInvoiced, true)} helper={`${invoices.length} invoices`} accent="navy" />
        <StatCard label="Collected" value={formatCurrency(collected, true)} helper={`${Math.round(collected / totalInvoiced * 100)}% collected`} accent="teal" />
        <StatCard label="At risk" value={formatCurrency(overdueExposure, true)} helper="Sent + overdue exposure" accent="rose" />
      </div>
      <section className="crm-card"><div className="crm-table-meta"><AdminBadge /></div>
        <DataTable>
          <thead><tr><th>Invoice</th><th>Client</th><th>PO</th><th>Amount</th><th>Status</th><th>Due date</th><th>Days overdue</th><th>Follow-up</th><th /></tr></thead>
          <tbody>
            {rows.map((row) => {
              const originalIndex = store.rows.findIndex((item) => item.id === row.id);
              const overdueCell = row.daysOverdue > 0 ? <span className="text-[#c55a66] font-semibold">{row.daysOverdue} days</span> : "—";
              return (
                <tr key={row.id}>
                  <td className="font-semibold text-[#2b3a51]">{row.id}</td>
                  <td>{store.editing ? <EditableInput value={row.client} onChange={(value) => store.updateRow(originalIndex, { client: value })} /> : row.client}</td>
                  <td>{store.editing ? <EditableInput value={row.po} onChange={(value) => store.updateRow(originalIndex, { po: value })} /> : row.po}</td>
                  <td>{store.editing ? <EditableInput type="number" value={row.amount} onChange={(value) => store.updateRow(originalIndex, { amount: Number(value) || 0 })} /> : formatCurrency(row.amount, true)}</td>
                  <td>{store.editing ? <Select value={row.status} onValueChange={(value) => store.updateRow(originalIndex, { status: value as InvoiceRow["status"] })}><SelectTrigger className="crm-edit-select"><SelectValue /></SelectTrigger><SelectContent>{["Draft", "Sent", "Overdue", "Paid"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select> : <StatusBadge status={row.status} />}</td>
                  <td>{store.editing ? <EditableInput type="date" value={row.dueDate} onChange={(value) => store.updateRow(originalIndex, { dueDate: value })} /> : formatDate(row.dueDate)}</td>
                  <td>{store.editing ? <EditableInput type="number" value={row.daysOverdue} onChange={(value) => store.updateRow(originalIndex, { daysOverdue: Number(value) || 0 })} /> : overdueCell}</td>
                  <td>{store.editing ? <EditableInput value={row.followUp} onChange={(value) => store.updateRow(originalIndex, { followUp: value })} /> : row.followUp}</td>
                  <td><AdminDeleteButton onDelete={() => store.deleteRow(originalIndex)} /></td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </section>
    </PageFrame>
  );
}

export function PipelinesPage() {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({ deal: "", client: "", product: "", stage: "Prospecting", amount: "", margin: "0.30", closeDate: "", nextAction: "" });
  const store = useEditableRows("medsales-forecast", deals);
  const exportRows = store.rows.map((row) => [row.id, row.deal, row.client, row.stage, row.amount, `${Math.round(row.margin * 100)}%`, row.nextAction]);
  const livePipelineByStage = stageOrder.map((stage) => ({
    stage,
    amount: store.rows.filter((row) => row.stage === stage).reduce((sum, row) => sum + row.amount, 0),
    count: store.rows.filter((row) => row.stage === stage).length,
    weighted: store.rows.filter((row) => row.stage === stage).reduce((sum, row) => sum + row.amount * row.margin, 0),
  }));
  const liveOpenPipeline = store.rows.filter((row) => !["Closed Won", "Closed Lost"].includes(row.stage)).reduce((sum, row) => sum + row.amount, 0);
  const liveWeightedPipeline = store.rows.filter((row) => !["Closed Won", "Closed Lost"].includes(row.stage)).reduce((sum, row) => sum + row.amount * row.margin, 0);
  const liveActiveDeals = store.rows.filter((row) => !["Closed Won", "Closed Lost"].includes(row.stage) && row.amount > 0).length;
  const liveWonDeals = store.rows.filter((row) => row.stage === "Closed Won").reduce((sum, row) => sum + row.amount, 0);
  const totalDealAmount = store.rows.reduce((sum, row) => sum + row.amount, 0);
  const liveWinRate = totalDealAmount ? liveWonDeals / totalDealAmount : 0;
  const addRecord = () => {
    if (!draft.deal.trim() || !draft.client.trim() || !draft.product.trim() || !draft.nextAction.trim()) {
      toast.error("Enter the deal, client, product, and next action before adding the pipeline record.");
      return;
    }
    store.addRow({ id: createRecordId("DEAL", store.rows), deal: draft.deal.trim(), client: draft.client.trim(), product: draft.product.trim(), stage: draft.stage as DealRow["stage"], amount: Number(draft.amount) || 0, margin: Math.min(1, Math.max(0, Number(draft.margin) || 0)), closeDate: draft.closeDate || undefined, nextAction: draft.nextAction.trim() });
    setDraft({ deal: "", client: "", product: "", stage: "Prospecting", amount: "", margin: "0.30", closeDate: "", nextAction: "" });
    setAdding(false);
    toast.success("Pipeline record added. Save changes to keep it.");
  };
  return <PageFrame><SectionHeader eyebrow="Analysis" title="Pipeline analysis" description="A manager-ready view of stage health, coverage, and where opportunities are getting stuck. Sales team members can add new records or correct entries in edit mode." action={<div className="crm-report-actions"><Button className="crm-secondary-button" onClick={() => setAdding(true)}>+ Add pipeline</Button><ReportToolbar title="Pipeline analysis" headers={["Deal ID", "Deal", "Client", "Stage", "Amount", "Margin", "Next action"]} rows={exportRows} fileName="medsales-pipeline" editing={store.editing} onEdit={() => store.setEditing(true)} onSave={store.save} onReset={store.reset} saved={store.saved} /></div>} />
    {adding && <AddRecordPanel title="Add pipeline record" description="Capture the opportunity details that feed pipeline coverage and stage analysis." fields={[{ name: "deal", label: "Deal name", required: true }, { name: "client", label: "Client", required: true }, { name: "product", label: "Product", required: true }, { name: "stage", label: "Stage", options: stageOrder }, { name: "amount", label: "Amount", type: "number", min: 0, step: 1 }, { name: "margin", label: "Margin (decimal)", type: "number", min: 0, max: 1, step: 0.01, required: true }, { name: "closeDate", label: "Close date", type: "date" }, { name: "nextAction", label: "Next action", required: true }]} values={draft} onChange={(name, value) => setDraft((current) => ({ ...current, [name]: value }))} onSubmit={addRecord} onCancel={() => setAdding(false)} />}
    <div className="crm-stat-grid crm-stat-grid-4"><StatCard label="Open pipeline" value={formatCurrency(liveOpenPipeline, true)} helper="Excludes closed deals" accent="navy" /><StatCard label="Weighted pipeline" value={formatCurrency(liveWeightedPipeline, true)} helper="Probability-adjusted" accent="amber" /><StatCard label="Active deals" value={`${liveActiveDeals}`} helper="With positive amount" accent="teal" /><StatCard label="Win rate" value={`${Math.round(liveWinRate * 100)}%`} helper="Progressed opportunities" accent="rose" /></div>
    <div className="crm-dashboard-grid"><ChartCard title="Stage volume" subtitle="Count and open value by stage"><div className="crm-chart-wrap"><ResponsiveContainer width="100%" height={300}><BarChart data={livePipelineByStage} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}><CartesianGrid vertical={false} stroke="#edf0f5" /><XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8b98aa" }} /><YAxis yAxisId="amount" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8b98aa" }} tickFormatter={(value: number) => `€${Math.round(value / 1_000_000)}M`} /><YAxis yAxisId="count" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8b98aa" }} /><Tooltip {...chartTooltip} formatter={(value, name) => name === "amount" ? formatCurrency(Number(value ?? 0)) : Number(value ?? 0)} /><Bar yAxisId="amount" dataKey="amount" fill="#2a9d8f" radius={[6, 6, 0, 0]} /><Line yAxisId="count" type="monotone" dataKey="count" stroke="#f4a261" strokeWidth={2.5} /></BarChart></ResponsiveContainer></div></ChartCard>
      <ChartCard title="Gross Profit Analysis" subtitle="Gross profit by stage based on Amount × Margin"><div className="crm-stage-list">{livePipelineByStage.map((row) => <div key={row.stage} className="crm-stage-row"><div className="flex items-center gap-3"><span className="crm-stage-dot" style={{ backgroundColor: stageColors[row.stage] }} /><div><div className="text-[12px] font-semibold text-[#34425a]">{row.stage}</div><div className="text-[11px] text-[#98a4b5]">{row.count} deal{row.count === 1 ? "" : "s"}</div></div></div><div className="text-right"><div className="text-[12px] font-bold text-[#2d3b52]">{formatCurrency(row.weighted, true)}</div><div className="text-[11px] text-[#8a98ad]">{row.amount ? Math.round(row.weighted / row.amount * 100) : 0}% gross profit rate</div></div></div>)}</div></ChartCard></div>
    <section className="crm-card mt-5"><div className="crm-card-heading"><div><h2 className="crm-card-title">Pipeline hygiene</h2><p className="crm-card-subtitle">Signals worth discussing in the next commercial review.</p></div></div><div className="crm-insight-grid"><div className="crm-insight"><CircleAlert size={18} className="text-[#d86c75]" /><div><div className="font-semibold text-[#34425a]">Two high-value opportunities need a next step</div><p>City General and Metro Clinic are both past their original close dates.</p></div></div><div className="crm-insight"><ArrowDownRight size={18} className="text-[#f4a261]" /><div><div className="font-semibold text-[#34425a]">Prospecting is carrying the most volume</div><p>Three records are still unassigned, which makes coverage look larger than it is.</p></div></div></div></section>
    <section className="crm-card mt-5"><div className="crm-card-heading"><div><h2 className="crm-card-title">Correct pipeline entries</h2><p className="crm-card-subtitle">This table reads the same saved pipeline records as the Pipelines page and updates automatically after changes are saved.</p></div><AdminBadge /></div><DataTable><thead><tr><th>Deal</th><th>Client</th><th>Stage</th><th>Amount</th><th>Next action</th><th /></tr></thead><tbody>{store.rows.map((row) => { const originalIndex = store.rows.findIndex((item) => item.id === row.id); return <tr key={row.id}><td className="font-semibold text-[#2b3a51]">{row.deal}</td><td>{row.client}</td><td>{store.editing ? <Select value={row.stage} onValueChange={(value) => store.updateRow(originalIndex, { stage: value as DealRow["stage"] })}><SelectTrigger className="crm-edit-select"><SelectValue /></SelectTrigger><SelectContent>{stageOrder.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select> : <StatusBadge status={row.stage} />}</td><td>{store.editing ? <EditableInput type="number" value={row.amount} onChange={(value) => store.updateRow(originalIndex, { amount: Number(value) || 0 })} /> : formatCurrency(row.amount, true)}</td><td>{store.editing ? <EditableInput value={row.nextAction} onChange={(value) => store.updateRow(originalIndex, { nextAction: value })} /> : row.nextAction}</td><td><AdminDeleteButton onDelete={() => store.deleteRow(originalIndex)} /></td></tr>})}</tbody></DataTable></section>
  </PageFrame>;
}

export function SalesTeamPage() {
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({ rep: "", region: "", focus: "", email: "", phone: "", status: "active" });
  const store = useEditableRows("medsales-team", team);
  const rows = store.rows.filter((row) => (row.rep + row.focus).toLowerCase().includes(search.toLowerCase()));
  const exportRows = store.rows.map((row) => [row.id, row.rep, row.region, row.email ?? "", row.phone ?? "", row.status, row.focus]);
  const addRecord = () => {
    if (!draft.rep.trim() || !draft.region.trim() || !draft.focus.trim()) {
      toast.error("Enter the rep, region, and focus before adding the sales-team member.");
      return;
    }
    store.addRow({ id: createRecordId("REP", store.rows), rep: draft.rep.trim(), region: draft.region.trim(), email: draft.email.trim() || undefined, phone: draft.phone.trim() || undefined, status: draft.status as TeamRow["status"], focus: draft.focus.trim() });
    setDraft({ rep: "", region: "", focus: "", email: "", phone: "", status: "active" });
    setAdding(false);
    toast.success("Sales-team member added. Save changes to keep it.");
  };
  return <PageFrame><SectionHeader eyebrow="People" title="Sales team" description="Manage the 12-seat roster and keep setup placeholders visible until the team is fully staffed. Sales team members can add new records or correct entries in edit mode." action={<div className="flex flex-wrap items-center justify-end gap-2"><div className="crm-inline-search"><Search size={15} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search team..." /></div><Button className="crm-secondary-button" onClick={() => setAdding(true)}>+ Add team member</Button><ReportToolbar title="Sales team" headers={["Rep ID", "Sales Rep", "Region", "Email", "Phone", "Status", "Focus area"]} rows={exportRows} fileName="medsales-team" editing={store.editing} onEdit={() => store.setEditing(true)} onSave={store.save} onReset={store.reset} saved={store.saved} /></div>} />
    {adding && <AddRecordPanel title="Add sales-team member" description="Capture the rep identity, territory, contact details, and focus area." fields={[{ name: "rep", label: "Sales rep", required: true }, { name: "region", label: "Region", required: true }, { name: "focus", label: "Focus area", required: true }, { name: "email", label: "Email", type: "text" }, { name: "phone", label: "Phone", type: "text" }, { name: "status", label: "Status", options: ["active", "setup"] }]} values={draft} onChange={(name, value) => setDraft((current) => ({ ...current, [name]: value }))} onSubmit={addRecord} onCancel={() => setAdding(false)} />}
    <section className="crm-card"><div className="crm-table-meta"><AdminBadge /></div><DataTable><thead><tr><th>Rep</th><th>Region</th><th>Focus area</th><th>Contact</th><th>Status</th><th /></tr></thead><tbody>{rows.map((row) => { const originalIndex = store.rows.findIndex((item) => item.id === row.id); return <tr key={row.id}><td><div className="flex items-center gap-3"><div className="crm-table-avatar">{row.rep.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div><div className="font-semibold text-[#2b3a51]">{store.editing ? <EditableInput value={row.rep} onChange={(value) => store.updateRow(originalIndex, { rep: value })} /> : row.rep}</div><div className="text-[11px] text-[#a0abba]">{row.id}</div></div></div></td><td>{store.editing ? <EditableInput value={row.region} onChange={(value) => store.updateRow(originalIndex, { region: value })} /> : row.region}</td><td>{store.editing ? <EditableInput value={row.focus} onChange={(value) => store.updateRow(originalIndex, { focus: value })} /> : row.focus}</td><td>{store.editing ? <div className="grid gap-1"><EditableInput value={row.email ?? ""} onChange={(value) => store.updateRow(originalIndex, { email: value })} /><EditableInput value={row.phone ?? ""} onChange={(value) => store.updateRow(originalIndex, { phone: value })} /></div> : <><div>{row.email ?? "—"}</div><div className="text-[11px] text-[#a0abba]">{row.phone ?? "—"}</div></>}</td><td>{store.editing ? <Select value={row.status} onValueChange={(value) => store.updateRow(originalIndex, { status: value as TeamRow["status"] })}><SelectTrigger className="crm-edit-select"><SelectValue /></SelectTrigger><SelectContent>{["active", "setup"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select> : <StatusBadge status={row.status} />}</td><td><AdminDeleteButton onDelete={() => store.deleteRow(originalIndex)} /></td></tr>})}</tbody></DataTable></section>
  </PageFrame>;
}

export function SetupPage() {
  const { role, adminEmail } = useCrmAccess();
  const navigate = useNavigate();
  const [labels, setLabels] = useState<Record<string, string>>({
    targets: "Targets",
    forecast: "Forecast",
    purchaseOrders: "Purchase Orders",
    pipelines: "Pipelines",
    invoices: "Invoices",
    salesTeam: "Sales Team",
  });
  const [labelSaved, setLabelSaved] = useState(false);
  useEffect(() => {
    const stored = window.localStorage.getItem("medsales-structure-labels");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Record<string, string>;
      setLabels((current) => ({ ...current, ...parsed }));
    } catch {
      window.localStorage.removeItem("medsales-structure-labels");
    }
  }, []);
  const saveLabels = () => {
    void runAdminAction("rename_structure", () => {
      window.localStorage.setItem("medsales-structure-labels", JSON.stringify(labels));
      setLabelSaved(true);
    });
  };
  const resetEntireData = () => {
    if (role !== "admin") return;
    if (!window.confirm("Reset all CRM data to the workbook snapshot? This removes saved corrections from this browser.")) return;
    void runAdminAction("reset_all_data", () => {
      ["medsales-targets", "medsales-forecast", "medsales-purchase-orders", "medsales-invoices", "medsales-team", "medsales-structure-labels"].forEach((key) => window.localStorage.removeItem(key));
      navigate("/", { replace: true });
      window.setTimeout(() => window.location.reload(), 50);
    });
  };
  const setupRows = [
    ["Pipeline stages", "Prospecting, Cold, Warm, Closed Won, Closed Lost"],
    ["PO statuses", "Pending, Approved, Shipped, Delivered, Cancelled"],
    ["Invoice statuses", "Draft, Sent, Overdue, Paid"],
    ["Team statuses", "Active, Setup"],
  ];
  return <PageFrame><SectionHeader eyebrow="Governance" title="Lists & setup" description="Visible lookup values and provenance notes carried over from the source workbook." action={<ReportToolbar title="Lists & setup" headers={["List", "Values"]} rows={setupRows} fileName="medsales-setup" />} />
    <div className="crm-setup-grid">{[
      ["Pipeline stages", ["Prospecting", "Cold", "Warm", "Closed Won", "Closed Lost"]],
      ["PO statuses", ["Pending", "Approved", "Shipped", "Delivered", "Cancelled"]],
      ["Invoice statuses", ["Draft", "Sent", "Overdue", "Paid"]],
      ["Team statuses", ["Active", "Setup"]],
    ].map(([label, values]) => <section className="crm-card" key={label as string}><div className="crm-card-heading"><div><h2 className="crm-card-title">{label as string}</h2><p className="crm-card-subtitle">Source lookup list</p></div></div><div className="flex flex-wrap gap-2">{(values as string[]).map((value) => <StatusBadge key={value} status={value} />)}</div></section>)}</div>
    <section className="crm-card mt-5"><div className="crm-card-heading"><div><h2 className="crm-card-title">Workbook notes</h2><p className="crm-card-subtitle">What this web console is carrying forward from Excel.</p></div></div><div className="crm-note-list"><div>Sample values in the target, forecast, PO, and invoice rows are adapted from the attached MedSales concept.</div><div>Seven setup placeholders are included to bring the team to 12 seats.</div><div>Formula-driven values are represented as live client-side metrics for this read-only web snapshot.</div><div>Last updated in source workbook: September 3, 2026.</div></div></section>
    {role === "admin" && <section className="crm-card mt-5 crm-admin-panel"><div className="crm-card-heading"><div><h2 className="crm-card-title">Admin controls</h2><p className="crm-card-subtitle">Only the admin account can reset all saved data, delete rows, or rename structure labels.</p></div><AdminBadge /></div><div className="crm-admin-email">Admin: {adminEmail || "albear.rizkalla@gmail.com"}</div><div className="crm-structure-grid">{Object.entries(labels).map(([key, value]) => <label key={key} className="crm-structure-field"><span>{key.replace(/([A-Z])/g, " $1")}</span><Input value={value} onChange={(event) => { setLabelSaved(false); setLabels((current) => ({ ...current, [key]: event.target.value })); }} /></label>)}</div><div className="crm-admin-actions"><Button className="crm-primary-button" onClick={saveLabels}>Save structure names</Button><Button className="crm-danger-button" onClick={resetEntireData}>Reset entire data</Button>{labelSaved && <span className="crm-saved-note">Structure saved</span>}</div></section>}
  </PageFrame>;
}
