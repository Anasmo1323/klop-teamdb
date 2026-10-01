import { useEffect, useState, useMemo, type FormEvent, type ReactNode } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";
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
  ShoppingCart,
  ReceiptText,
  Check,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmptyState,
  ReportActions,
  SectionHeader,
  StatCard,
  StatusBadge,
  useCrmAccess,
} from "./CrmShell";
import { useExchangeRates } from "@/contexts/ExchangeRatesContext";
import { useFirebaseRows as useEditableRows } from "@/hooks/useFirebaseRows";
import {
  achievementByRep,
  attentionItems,
  collectionsByStatus,
  deals,
  formatCurrency,
  formatCurrencyEGP,
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
import { db } from "@/firebase";
import { writeBatch, doc, setDoc, updateDoc, query, getDocs, where, collection } from "firebase/firestore";

const formatCode = (prefix: "PL" | "PO" | "IN", rawCode?: string) => {
  if (!rawCode) return "—";
  const cleanCode = rawCode.replace(/^(PL-|PO-|IN-)/i, "");
  return `${prefix}-${cleanCode}`;
};

const chartTooltip = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 12px rgba(15,31,61,0.08)",
    fontSize: 12,
    color: "#334155",
    background: "#FFFFFF",
  },
};

function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div style={{ color: "var(--text-body)", minHeight: "100%" }}>
      <div className="px-8 pb-10">{children}</div>
    </div>
  );
}

// Stage pill with dot — replaces plain StatusBadge for pipeline stages
const stagePillMap: Record<string, string> = {
  "Cold":          "badge badge-cold",
  "Prospecting":   "badge badge-prospecting",
  "Qualification": "badge badge-qualification",
  "Proposal":      "badge badge-proposal",
  "Closed Won":    "badge badge-closed-won",
  "Closed Lost":   "badge badge-closed-lost",
};
function StagePill({ stage }: { stage: string }) {
  const cls = stagePillMap[stage] ?? "badge badge-neutral";
  return (
    <span className={cls}>
      <span className="badge-dot" />
      {stage}
    </span>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={className}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-card)",
        padding: "20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-heading)", margin: 0 }}>{title}</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>{subtitle}</p>
        </div>
        <button className="crm-more" aria-label={`More options for ${title}`}>
          <MoreHorizontal size={18} />
        </button>
      </div>
      {children}
    </section>
  );
}


const toLocalISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};


export function useTableSort<T>(data: T[]) {
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aVal = (a as any)[sortConfig.key];
        let bVal = (b as any)[sortConfig.key];
        
        if (aVal == null) aVal = "";
        if (bVal == null) bVal = "";

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else direction = null; // reset
    }
    setSortConfig(direction ? { key, direction } : null);
  };

  return { sortedData, sortConfig, requestSort };
}

export function SortableHeader({ label, sortKey, sortConfig, requestSort, className }: { label: string, sortKey?: string, sortConfig: any, requestSort: any, className?: string }) {
  if (!sortKey) return <th className={className}>{label}</th>;
  
  const isActive = sortConfig?.key === sortKey;
  return (
    <th 
      onClick={() => requestSort(sortKey)} 
      className={`cursor-pointer select-none hover:bg-slate-50 transition-colors ${className || ''}`}
      style={{ whiteSpace: 'nowrap' }}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="inline-flex flex-col text-[8px] leading-[0.5] opacity-40 ml-1">
          <span className={isActive && sortConfig.direction === 'asc' ? 'text-blue-600 opacity-100 font-bold text-[10px]' : ''}>▲</span>
          <span className={isActive && sortConfig.direction === 'desc' ? 'text-blue-600 opacity-100 font-bold text-[10px]' : ''}>▼</span>
        </span>
      </div>
    </th>
  );
}

export function DashboardPage() {
  const { adminEmail } = useCrmAccess();
  const emailMap: Record<string, string> = {
    "amohamed@technowave-eg.com": "Anas",
    "albear@technowave-eg.com": "Albear",
    "asalah@technowave-eg.com": "Abdelrahman",
  };
  const userName = adminEmail && emailMap[adminEmail.toLowerCase()] 
    ? emailMap[adminEmail.toLowerCase()] 
    : adminEmail 
      ? adminEmail.split('@')[0].charAt(0).toUpperCase() + adminEmail.split('@')[0].slice(1) 
      : "Team";
  const [dateRange, setDateRange] = useState({ from: "2026-01-01", to: "2026-12-31" });
    const targetStore = useEditableRows("medsales-targets", targets);
  const pipelineStore = useEditableRows("medsales-forecast", deals);

  const filteredDeals = useMemo(() => {
    return pipelineStore.rows.filter(row => {
      if (!row.closeDate) return true;
      return row.closeDate >= dateRange.from && row.closeDate <= dateRange.to;
    });
  }, [pipelineStore.rows, dateRange]);
  const dashboardTargetTotal = targetStore.rows.reduce(
    (sum, row) => sum + row.target,
    0,
  );
  const dashboardAchieved = filteredDeals.filter((row) => row.stage === "Closed Won")
    .reduce((sum, row) => sum + row.amount, 0);
  const dashboardAttainment = dashboardTargetTotal
    ? dashboardAchieved / dashboardTargetTotal
    : 0;
  const dashboardOpenPipeline = filteredDeals.filter((row) => !["Closed Won", "Closed Lost"].includes(row.stage))
    .reduce((sum, row) => sum + row.amount, 0);
  const dashboardWeightedPipeline = filteredDeals.filter((row) => !["Closed Won", "Closed Lost"].includes(row.stage))
    .reduce((sum, row) => sum + row.amount * row.margin, 0);
  const dashboardActiveDeals = filteredDeals.filter(
    (row) =>
      !["Closed Won", "Closed Lost"].includes(row.stage) && row.amount > 0,
  ).length;
  const topAttention = attentionItems;
  const dashboardExportRows = [
    [
      "Revenue achieved",
      dashboardAchieved,
      `${Math.round(dashboardAttainment * 100)}% attainment`,
    ],
    [
      "Open pipeline",
      dashboardOpenPipeline,
      `${dashboardActiveDeals} active deals`,
    ],
    ["Won deals", dashboardWeightedPipeline, "Probability-adjusted open value"],
    ["Invoices", overdueExposure, "Sent + overdue exposure"],
  ];

  const handleSeed = async () => {
    try {
      const batch = writeBatch(db);
      targets.forEach((t) => batch.set(doc(db, "medsales-targets", t.id), t));
      deals.forEach((t) => batch.set(doc(db, "medsales-forecast", t.id), t));
      purchaseOrders.forEach((t) =>
        batch.set(doc(db, "medsales-purchase-orders", t.id), t),
      );
      invoices.forEach((t) => batch.set(doc(db, "medsales-invoices", t.id), t));
      team.forEach((t) => batch.set(doc(db, "medsales-team", t.id), t));
      await batch.commit();
      alert(
        "Firebase has been seeded with the mock data successfully! Refreshing...",
      );
      window.location.reload();
    } catch (e: any) {
      alert("Error seeding data: " + e.message);
    }
  };

  // ── Live chart data computed from firebase rows ────────────────────────────
  // 1. Achievement by product line
  const achievementByProductLine = useMemo(() => {
    const lines: Record<string, { target: number; achieved: number }> = {};
    targetStore.rows.forEach((row) => {
      const line = row.productLine ?? row.focus ?? "Other";
      if (!lines[line]) lines[line] = { target: 0, achieved: 0 };
      lines[line].target += row.target;
    });
    filteredDeals.filter((row) => row.stage === "Closed Won")
      .forEach((row) => {
        const line = row.productLine ?? row.product ?? "Other";
        if (!lines[line]) lines[line] = { target: 0, achieved: 0 };
        lines[line].achieved += row.amount;
      });
    return Object.entries(lines).map(([line, v]) => ({
      line,
      target: v.target,
      achieved: v.achieved,
    }));
  }, [targetStore.rows, pipelineStore.rows]);

  // 2. Pipeline by stage — all stages including Closed Lost
  const livePipelineByStage = useMemo(() => {
    return stageOrder.map((stage) => ({
      stage,
      amount: filteredDeals.filter((row) => row.stage === stage)
        .reduce((sum, row) => sum + row.amount, 0),
      count: filteredDeals.filter((row) => row.stage === stage).length,
    }));
  }, [pipelineStore.rows]);

  // 3. Commercial momentum — live from real deal close dates

  const getGreeting = () => {
    const hour = parseInt(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'Africa/Cairo' }).format(new Date()));
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };
  const liveMomentum = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 9 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 8 + i, 1);
      const yr = d.getFullYear();
      const mo = d.getMonth();
      const label = d.toLocaleString("en-US", { month: "short" });
      const wonDeals = filteredDeals.filter((row) => {
        if (row.stage !== "Closed Won" || !row.closeDate) return false;
        const cd = new Date(row.closeDate);
        return cd.getFullYear() === yr && cd.getMonth() === mo;
      });
      const openDeals = filteredDeals.filter((row) => {
        if (["Closed Won", "Closed Lost"].includes(row.stage)) return false;
        if (!row.closeDate) return true;
        const cd = new Date(row.closeDate);
        return cd.getFullYear() === yr && cd.getMonth() === mo;
      });
      return {
        month: label,
        achieved: wonDeals.reduce((s, r) => s + r.amount, 0),
        pipeline: openDeals.reduce((s, r) => s + r.amount, 0),
        collected: wonDeals.reduce((s, r) => s + r.amount * r.margin, 0),
      };
    });
  }, [pipelineStore.rows]);

  return (
    <PageFrame>
      <SectionHeader
        title={`${getGreeting()}, ${userName}.`}
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border border-[#e5e8ea] rounded-md px-2 py-1.5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all focus-within:border-[#1677ff] focus-within:ring-2 focus-within:ring-[#1677ff]/10">
              <CalendarDays size={14} className="text-[#8b98aa]" />
              <DatePicker
                selected={dateRange.from ? new Date(`${dateRange.from}T00:00:00`) : null}
                onChange={(date: Date | null) => setDateRange(prev => ({ ...prev, from: date ? toLocalISO(date) : "" }))}
                dateFormat="dd-MM-yyyy"
                placeholderText="Start Date"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                className="w-[75px] text-[12px] font-medium bg-transparent outline-none border-none text-[#27354b] cursor-pointer"
              />
              <span className="text-[12px] font-bold text-[#a0abba] px-1">→</span>
              <DatePicker
                selected={dateRange.to ? new Date(`${dateRange.to}T00:00:00`) : null}
                onChange={(date: Date | null) => setDateRange(prev => ({ ...prev, to: date ? toLocalISO(date) : "" }))}
                dateFormat="dd-MM-yyyy"
                placeholderText="End Date"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                className="w-[75px] text-[12px] font-medium bg-transparent outline-none border-none text-[#27354b] cursor-pointer"
              />
            </div>
            <ReportToolbar
              title="MedSales CRM dashboard"
              headers={["Metric", "Value", "Context"]}
              rows={dashboardExportRows}
              fileName="medsales-dashboard"
            />
          </div>
        }
      />

      <div className="crm-stat-grid">
        <StatCard
          label="Revenue achieved"
          value={formatCurrency(dashboardAchieved, true)}
          helper={`${Math.round(dashboardAttainment * 100)}% of ${formatCurrency(dashboardTargetTotal, true)} target`}
          accent="teal"
          trend="+12.4%"
        />
        <StatCard
          label="Open pipeline"
          value={formatCurrency(dashboardOpenPipeline, true)}
          helper={`${dashboardActiveDeals} active deals with value`}
          accent="navy"
          trend="+8.1%"
        />
        <StatCard
          label="Won deals"
          value={formatCurrency(dashboardWeightedPipeline, true)}
          helper="Probability-adjusted open value"
          accent="amber"
          trend="+5.6%"
        />
        <StatCard
          label="Invoices"
          value={formatCurrency(overdueExposure, true)}
          helper={`${invoices.filter((row) => row.status !== "Paid").length} invoices outside paid status`}
          accent="rose"
          trend="-4.2%"
        />
      </div>

      <div className="crm-dashboard-grid">
        <ChartCard
          title="Achievement by product line"
          subtitle="Won deals vs target per product line · EUR"
        >
          <div className="crm-chart-wrap">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart
                data={achievementByProductLine}
                margin={{ top: 12, right: 16, left: -12, bottom: 0 }}
                barGap={8}
              >
                <CartesianGrid vertical={false} stroke="#edf0f5" />
                <XAxis
                  dataKey="line"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#8b98aa" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#8b98aa" }}
                  tickFormatter={(value: number) =>
                    `€${Math.round(value / 1000)}k`
                  }
                />
                <Tooltip
                  {...chartTooltip}
                  formatter={(value: any) => formatCurrency(Number(value ?? 0))}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, color: "#6e7c92" }}
                />
                <Bar
                  name="Target"
                  dataKey="target"
                  fill="#dfe5ee"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  name="Achieved"
                  dataKey="achieved"
                  fill="#2a9d8f"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Pipeline by stage"
          subtitle="Deal count and total value per stage · EUR"
        >
          <div className="crm-chart-wrap">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart
                data={livePipelineByStage}
                layout="vertical"
                margin={{ top: 8, right: 18, left: 18, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="#edf0f5" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#8b98aa" }}
                  tickFormatter={(value: number) =>
                    `€${Math.round(value / 1_000_000)}M`
                  }
                />
                <YAxis
                  dataKey="stage"
                  type="category"
                  width={82}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6e7c92" }}
                />
                <Tooltip
                  {...chartTooltip}
                  formatter={(value: any, name: any, props: any) => [
                    `${formatCurrency(Number(value ?? 0))} (${props.payload.count} deal${props.payload.count !== 1 ? 's' : ''})`,
                    "Value",
                  ]}
                />
                <Bar dataKey="amount" name="Pipeline" radius={[0, 5, 5, 0]}>
                  {livePipelineByStage.map((entry) => (
                    <Cell key={entry.stage} fill={stageColors[entry.stage]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Invoices mix"
          subtitle={`${formatCurrency(totalInvoiced)} invoiced across four records`}
        >
          <div className="crm-collection-chart">
            <ResponsiveContainer width="48%" height={210}>
              <PieChart>
                <Pie
                  data={collectionsByStatus}
                  dataKey="amount"
                  nameKey="status"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={4}
                >
                  {collectionsByStatus.map((entry: { status: "Paid" | "Sent" | "Overdue" | "Draft"; amount: number; count: number }) => (
                    <Cell
                      key={entry.status}
                      fill={
                        (
                          {
                            Paid: "#2a9d8f",
                            Sent: "#5b6b8c",
                            Overdue: "#d86c75",
                            Draft: "#dfe5ee",
                          } as Record<string, string>
                        )[entry.status]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  {...chartTooltip}
                  formatter={(value: any) => formatCurrency(Number(value ?? 0))}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {collectionsByStatus.map((entry) => (
                <div
                  key={entry.status}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 text-[12px] text-[#6f7d92]">
                    <span
                      className="crm-legend-dot"
                      style={{
                        backgroundColor: {
                          Paid: "#2a9d8f",
                          Sent: "#5b6b8c",
                          Overdue: "#d86c75",
                          Draft: "#dfe5ee",
                        }[entry.status],
                      }}
                    />
                    {entry.status}
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] font-bold text-[#27354b]">
                      {formatCurrency(entry.amount, true)}
                    </div>
                    <div className="text-[10px] text-[#a0abba]">
                      {entry.count} invoice{entry.count > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Commercial momentum"
          subtitle="Monthly movement across revenue, pipeline, and invoices"
        >
          <div className="crm-chart-wrap">
            <ResponsiveContainer width="100%" height={210}>
              <ComposedChart
                data={liveMomentum}
                margin={{ top: 12, right: 8, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2a9d8f" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#2a9d8f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#edf0f5" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#8b98aa" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#8b98aa" }}
                  tickFormatter={(value: number) =>
                    `€${Math.round(value / 1000)}k`
                  }
                />
                <Tooltip
                  {...chartTooltip}
                  labelFormatter={(label) => `Month: ${label}`}
                  formatter={(value: any, name: any) => [
                    formatCurrency(Number(value ?? 0)),
                    name,
                  ]}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, color: "#6e7c92" }}
                />
                <Area
                  type="monotone"
                  name="Won Revenue"
                  dataKey="achieved"
                  stroke="#2a9d8f"
                  fill="url(#revenueFill)"
                  strokeWidth={2.5}
                />
                <Line
                  type="monotone"
                  name="Gross Profit"
                  dataKey="collected"
                  stroke="#f4a261"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  name="Open Pipeline"
                  dataKey="pipeline"
                  stroke="#5b6b8c"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 5"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <section className="crm-card mt-5">
        <div className="crm-card-heading">
          <div>
            <h2 className="crm-card-title">Needs attention</h2>
            <p className="crm-card-subtitle">
              The three places where a focused follow-up can change the week.
            </p>
          </div>
          <span className="crm-source-tag">Workbook snapshot</span>
        </div>
        <div className="crm-attention-grid">
          {topAttention.map((item) => (
            <div
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("navigate-tab", {
                    detail:
                      item.route === "/forecast"
                        ? "pipelines"
                        : item.route.replace("/", ""),
                  }),
                )
              }
              key={item.label}
              className={`crm-attention-item attention-${item.tone} cursor-pointer`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="crm-attention-label">{item.label}</span>
                <ChevronRight size={16} />
              </div>
              <div className="mt-3 text-[18px] font-extrabold tracking-tight text-[#25334a]">
                {item.value}
              </div>
              <div className="mt-1 text-[12px] text-[#7e8ca0]">
                {item.detail}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}

function DataTable({
  children,
  onDoubleClick,
  editing,
  loading,
}: {
  children: ReactNode;
  onDoubleClick?: () => void;
  editing?: boolean;
  loading?: boolean;
}) {
  return (
    <div className={`ct-table-wrap relative ${editing ? " ct-editing" : ""}`} onDoubleClick={onDoubleClick}>
      {editing && (
        <div className="ct-edit-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit mode — double-click any cell to edit. Hit Save changes when done.
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px] min-h-[150px]">
          <svg className="animate-spin h-8 w-8 text-[#2563eb]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      <div className="ct-table-container">
        <table className="ct-table">{children}</table>
      </div>
    </div>
  );
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

function AddRecordPanel({
  title,
  description,
  fields,
  values,
  onChange,
  onSubmit,
  onCancel,
}: {
  title: string;
  description?: string;
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
    <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)", padding: "20px", marginBottom: 16 }}>
      <div className="crm-card-heading">
        <div>
          <h2 className="crm-card-title">{title}</h2>
          {description && <p className="crm-card-subtitle">{description}</p>}
        </div>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <form style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginTop: 16 }} onSubmit={submit}>
        {fields.map((field) => (
          <label key={field.name} style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--text-body)" }}>
            <span>
              {field.label}
              {field.required ? " *" : ""}
            </span>
            {field.options ? (
              <select
                style={{ height: 34, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 10px", fontSize: 13, background: "var(--surface)", width: "100%" }}
                value={values[field.name] ?? ""}
                required={field.required}
                onChange={(event) => onChange(field.name, event.target.value)}
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === "date" ? (
              <DatePicker
                selected={values[field.name] ? new Date(`${values[field.name]}T00:00:00`) : null}
                onChange={(date: Date | null) => {
                  if (date) {
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, "0");
                    const d = String(date.getDate()).padStart(2, "0");
                    onChange(field.name, `${y}-${m}-${d}`);
                  } else {
                    onChange(field.name, "");
                  }
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                portalId="root"
                customInput={
                  <Input
                    style={{ height: 34, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 10px", fontSize: 13, outline: "none", width: "100%", background: "var(--surface)" }}
                    required={field.required}
                  />
                }
              />
            ) : (
              <Input
                style={{ height: 34, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 10px", fontSize: 13, outline: "none", width: "100%", background: "var(--surface)" }}
                type={field.type ?? "text"}
                value={values[field.name] ?? ""}
                placeholder={field.placeholder}
                required={field.required}
                min={field.min}
                max={field.max}
                step={field.step}
                onChange={(event) => onChange(field.name, event.target.value)}
              />
            )}
          </label>
        ))}
        <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
          <Button type="submit" className="btn-blue">
            Add record
          </Button>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            The new record will be appended and remain in edit mode until you
            save.
          </span>
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

function EditableInput({
  value,
  type = "text",
  min,
  max,
  step,
  onChange,
}: {
  value: string | number;
  type?: "text" | "number" | "date";
  min?: string | number;
  max?: string | number;
  step?: string | number;
  onChange: (value: string) => void;
}) {
  if (type === "date") {
    const dateObj = typeof value === "string" && value ? new Date(`${value}T00:00:00`) : null;
    const isValid = dateObj && !isNaN(dateObj.getTime());
    
    return (
      <DatePicker
        selected={isValid ? dateObj : null}
        onChange={(date: Date | null) => {
          if (date) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            onChange(`${y}-${m}-${d}`);
          } else {
            onChange("");
          }
        }}
        dateFormat="dd/MM/yyyy"
        placeholderText="dd/mm/yyyy"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        portalId="root"
        customInput={
          <Input
            style={{ height: 34, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 10px", fontSize: 13, outline: "none", width: "100%", background: "var(--surface)" }}
          />
        }
      />
    );
  }

  return (
    <Input
      style={{ height: 34, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "0 10px", fontSize: 13, outline: "none", width: "100%", background: "var(--surface)" }}
      type={type}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function ReportToolbar({
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
    <ReportActions
      title={title}
      headers={headers}
      rows={rows}
      fileName={fileName}
      editing={editing}
      onEdit={onEdit}
      onSave={onSave}
      onReset={onReset}
      saved={saved}
    />
  );
}

function AdminBadge() {
  const { role } = useCrmAccess();
  if (role !== "admin") return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        fontWeight: 700,
        background: "var(--primary-light)",
        color: "var(--primary-text)",
        border: "1px solid rgba(37,99,235,0.2)",
        borderRadius: "var(--radius-pill)",
        padding: "3px 8px",
      }}
    >
      <ShieldCheck size={12} /> Admin controls
    </span>
  );
}

function AdminDeleteButton({ onDelete }: { onDelete: () => void }) {
  const { role } = useCrmAccess();
  if (role !== "admin") return null;
  return (
    <button
      className="btn-danger"
      aria-label="Delete row"
      style={{ padding: "5px 8px", fontSize: 12 }}
      onClick={() => onDelete()}
    >
      <Trash2 size={13} />
    </button>
  );
}

function RouteTableHeader({
  title,
  description,
  search,
  setSearch,
  filter,
  setFilter,
  filterOptions,
  action,
}: {
  title: string;
  description?: string;
  search: string;
  setSearch: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  filterOptions: string[];
  action?: ReactNode;
}) {
  return (
    <SectionHeader
      title={title}
      description={description}
      action={
        action ?? (
          <div className="flex items-center gap-2">
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 36, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "0 10px" }}>
              <Search size={15} />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search..."
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger style={{ height: 36, minWidth: 140, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 13 }}>
                <Filter size={14} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      }
    />
  );
}

export function TargetsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({
    productLine: "",
    target: "",
    achieved: "",
    status: "On Track",
  });
  const { role } = useCrmAccess();
  const canEditTargets = role === "admin";
  const { eurToEgp = 54 } = useExchangeRates();

  const store = useEditableRows("medsales-targets", targets);
  const pipelineStore = useEditableRows("medsales-forecast", deals);
  const rows = store.rows.filter(
    (row) =>
      `${row.productLine ?? row.focus ?? ""} ${row.rep}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === "All statuses" || row.status === filter),
  );
  const targetTotal = store.rows.reduce((sum, row) => sum + row.target, 0);
  const achievedTotal = pipelineStore.rows
    .filter((row) => row.stage === "Closed Won")
    .reduce((sum, row) => sum + row.amount, 0);
  const targetAttainment = targetTotal ? achievedTotal / targetTotal : 0;
  const exportRows = store.rows.map((row) => {
    const productLine = row.productLine ?? row.focus ?? "To be assigned";
    return [
      row.id,
      productLine,
      row.target,
      row.achieved,
      `${row.target ? Math.round((row.achieved / row.target) * 100) : 0}%`,
      row.status,
    ];
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
    store.addRow({
      id: createRecordId("REP", store.rows),
      rep: "—",
      region: "—",
      focus: draft.productLine.trim() || "To be assigned",
      productLine: draft.productLine.trim() || "To be assigned",
      target: Number(draft.target) || 0,
      achieved: Number(draft.achieved) || 0,
      status: draft.status as TargetRow["status"],
    });
    setDraft({ productLine: "", target: "", achieved: "", status: "On Track" });
    setAdding(false);
    toast.success("Target record added. Save changes to keep it.");
  };
    const { sortedData, sortConfig, requestSort } = useTableSort(rows);
  return (
    <PageFrame>
      <RouteTableHeader
        title="Sales targets"
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        filterOptions={["All statuses", "On Track", "At Risk", "Setup"]}
        action={
          <div className="crm-report-actions">
            {canEditTargets && (
              <Button
                className="btn-secondary"
                onClick={() => setAdding(true)}
              >
                + Add target
              </Button>
            )}
            <ReportToolbar
              title="Sales targets"
              headers={[
                "Target ID",
                "Product Line",
                "Target (€)",
                "Target (EGP)",
                "Achieved (€)",
                "Achieved (EGP)",
                "Progress",
                "Status",
              ]}
              rows={exportRows}
              fileName="medsales-targets"
              editing={canEditTargets ? store.editing : undefined}
              onEdit={canEditTargets ? () => store.setEditing(true) : undefined}
              onSave={canEditTargets ? store.save : undefined}
              onReset={canEditTargets ? store.reset : undefined}
              saved={canEditTargets ? store.saved : undefined}
            />
          </div>
        }
      />
      {adding && canEditTargets && (
        <AddRecordPanel
          title="Add target record"
          fields={[
            { name: "productLine", label: "Product line", required: true },
            {
              name: "target",
              label: "Target",
              type: "number",
              min: 0,
              step: 1,
            },
            {
              name: "achieved",
              label: "Achieved",
              type: "number",
              min: 0,
              step: 1,
            },
            {
              name: "status",
              label: "Status",
              options: ["On Track", "Watch", "At Risk", "Setup"],
            },
          ]}
          values={draft}
          onChange={(name, value) =>
            setDraft((current) => ({ ...current, [name]: value }))
          }
          onSubmit={addRecord}
          onCancel={() => setAdding(false)}
        />
      )}
      <div className="crm-stat-grid crm-stat-grid-3">
        <StatCard
          label="Annual target"
          value={formatCurrency(targetTotal, true)}
          helper={`Sum of Target column · ${formatCurrencyEGP(targetTotal * eurToEgp, true)}`}
          accent="navy"
        />
        <StatCard
          label="Achieved"
          value={formatCurrency(achievedTotal, true)}
          helper={`${Math.round(targetAttainment * 100)}% attainment · ${formatCurrencyEGP(achievedTotal * eurToEgp, true)}`}
          accent="teal"
        />
        <StatCard
          label="Gap to target"
          value={formatCurrency(targetTotal - achievedTotal, true)}
          helper={`Target minus Won deals · ${formatCurrencyEGP((targetTotal - achievedTotal) * eurToEgp, true)}`}
          accent="amber"
        />
      </div>
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
        <div style={{ padding: "10px 16px 8px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border)" }}><AdminBadge /></div>
<DataTable editing={store.editing} loading={store.loading}>
          <thead>
            <tr>
              <SortableHeader label="Product Line" sortKey="productLine" sortConfig={sortConfig} requestSort={requestSort} />
              <th>Target (€)</th>
              <th>Target (EGP)</th>
              <th>Achieved (€)</th>
              <th>Achieved (EGP)</th>
              <th>Progress</th>
              <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} requestSort={requestSort} />
              <th />
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => {
              const originalIndex = store.rows.findIndex(
                (item) => item.id === row.id,
              );
              const pct = row.target
                ? Math.round((row.achieved / row.target) * 100)
                : 0;
              const productLine =
                row.productLine ?? row.focus ?? "To be assigned";
              return (
                <tr key={row.id} id={`row-${row.id}`}>
                  <td onDoubleClick={canEditTargets ? () => store.startEditingCell(`${row.id}-1`) : undefined}>
                    <div style={{ fontWeight: 600, color: "var(--text-heading)", fontSize: 14 }}>
                      {store.editingCell === `${row.id}-${1}` ? (
                        <EditableInput
                          value={productLine}
                          onChange={(value) =>
                            store.updateRow(originalIndex, {
                              productLine: value,
                            })
                          }
                        />
                      ) : (
                        productLine
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{row.id}</div>
                  </td>
                  <td onDoubleClick={canEditTargets ? () => store.startEditingCell(`${row.id}-2`) : undefined}>
                    {store.editingCell === `${row.id}-${2}` ? (
                      <EditableInput
                        type="number"
                        value={row.target}
                        onChange={(value) =>
                          store.updateRow(originalIndex, {
                            target: Number(value) || 0,
                          })
                        }
                      />
                    ) : (
                      formatCurrency(row.target, true)
                    )}
                  </td>
                  <td>{formatCurrencyEGP(row.target * eurToEgp, true)}</td>
                  <td onDoubleClick={canEditTargets ? () => store.startEditingCell(`${row.id}-3`) : undefined}>
                    {store.editingCell === `${row.id}-${3}` ? (
                      <EditableInput
                        type="number"
                        value={row.achieved}
                        onChange={(value) =>
                          store.updateRow(originalIndex, {
                            achieved: Number(value) || 0,
                          })
                        }
                      />
                    ) : (
                      formatCurrency(row.achieved, true)
                    )}
                  </td>
                  <td>{formatCurrencyEGP(row.achieved * eurToEgp, true)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="crm-progress">
                        <span style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold text-[#627089]">
                        {pct}%
                      </span>
                    </div>
                  </td>
                  <td onDoubleClick={canEditTargets ? () => store.startEditingCell(`${row.id}-5`) : undefined}>
                    {store.editingCell === `${row.id}-${5}` ? (
                      <Select
                        value={row.status}
                        onValueChange={(value) =>
                          store.updateRow(originalIndex, {
                            status: value as TargetRow["status"],
                          })
                        }
                      >
                        <SelectTrigger style={{ height: 32, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 13, background: "var(--surface)" }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["On Track", "Watch", "At Risk", "Setup"].map(
                            (value) => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge status={row.status} />
                    )}
                  </td>
                  <td>
                    <AdminDeleteButton
                      onDelete={() => store.deleteRow(originalIndex)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
        {rows.length === 0 && (
          <EmptyState
            title="No target records found"
            detail="Try a different search or status filter."
          />
        )}
      </section>
    </PageFrame>
  );
}

export function ForecastPage() {
  const { eurToEgp } = useExchangeRates();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All stages");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({
    code: "",
    productLine: "",
    client: "",
    product: "",
    stage: "Prospecting",
    amount: "",
    margin: "0.30",
    closeDate: "",
    nextAction: "",
  });
  
  const handleConvertToPO = async (deal: DealRow) => {
    try {
      if (deal.code) {
        const poQuery = query(collection(db, "medsales-purchase-orders"), where("code", "==", deal.code));
        const poDocs = await getDocs(poQuery);
        if (!poDocs.empty) {
          const existingPo = poDocs.docs[0];
          toast.success("This deal is already converted to a Purchase Order.");
          sessionStorage.setItem('highlightRow', existingPo.id);
          window.dispatchEvent(new CustomEvent("navigate-tab", { detail: "orders" }));
          return;
        }
      }
      
      const newId = `PO-${Date.now().toString().slice(-4)}`;
      const newPO: PurchaseOrderRow = {
        code: deal.code,
        id: newId,
        client: deal.client,
        amount: deal.amount,
        status: "Pending",
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: "",
        followUp: deal.nextAction || "From pipeline",
      };
      await setDoc(doc(db, "medsales-purchase-orders", newId), newPO);
      await updateDoc(doc(db, "medsales-forecast", deal.id), {
        stage: "Closed Won"
      });
      toast.success("Converted to Purchase Order successfully.");
    } catch(e: any) {
      toast.error("Error converting to PO: " + e.message);
    }
  };
  
  const store = useEditableRows("medsales-forecast", deals);
  const targetStore = useEditableRows("medsales-targets", []);
  const productLineOptions = Array.from(new Set(targetStore.rows.map((r: any) => r.productLine).filter(Boolean))) as string[];
  const rows = store.rows.filter(
    (row) =>
      row.client.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "All stages" || row.stage === filter),
  );
  const liveOpenPipeline = store.rows
    .filter((row) => !["Closed Won", "Closed Lost"].includes(row.stage))
    .reduce((sum, row) => sum + row.amount, 0);
  const liveWonDeals = store.rows
    .filter((row) => row.stage === "Closed Won")
    .reduce((sum, row) => sum + row.amount, 0);
  const totalDealAmount = store.rows.reduce((sum, row) => sum + row.amount, 0);
  const liveActiveDeals = store.rows.filter(
    (row) =>
      !["Closed Won", "Closed Lost"].includes(row.stage) && row.amount > 0,
  ).length;
  const liveWinRate = totalDealAmount ? liveWonDeals / totalDealAmount : 0;
  const exportRows = store.rows.map((row) => [
    row.id,
    row.code ?? "",
    row.productLine ?? row.product,
    row.client,
    row.product,
    row.stage,
    row.amount,
    row.margin,
    row.amount * row.margin,
    row.amount * row.margin * eurToEgp,
    formatDate(row.closeDate),
    row.nextAction,
  ]);
  const addRecord = () => {
    if (
      !draft.productLine.trim() ||
      !draft.client.trim() ||
      !draft.product.trim() ||
      !draft.nextAction.trim()
    ) {
      toast.error(
        "Enter the product line, client, product, and next action before adding the forecast.",
      );
      return;
    }
    store.addRow({
      id: createRecordId("DEAL", store.rows),
      code: draft.code.trim() || undefined,
      deal: draft.client.trim(),
      productLine: draft.productLine.trim(),
      client: draft.client.trim(),
      product: draft.product.trim(),
      stage: draft.stage as DealRow["stage"],
      amount: Number(draft.amount) || 0,
      margin: Math.min(1, Math.max(0, Number(draft.margin) || 0)),
      closeDate: draft.closeDate || undefined,
      nextAction: draft.nextAction.trim(),
    });
    setDraft({
      code: "",
      productLine: "",
      client: "",
      product: "",
      stage: "Prospecting",
      amount: "",
      margin: "0.30",
      closeDate: "",
      nextAction: "",
    });
    setAdding(false);
    toast.success("Pipeline record added. Save changes to keep it.");
  };
    const { sortedData, sortConfig, requestSort } = useTableSort(rows);
  return (
    <PageFrame>
      <RouteTableHeader
        title="Sales Pipeline"
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        filterOptions={["All stages", ...stageOrder]}
        action={
          <div className="crm-report-actions">
            <Button
              className="btn-secondary"
              onClick={() => setAdding(true)}
            >
              + Add pipeline
            </Button>
            <ReportToolbar
              title="Sales Pipeline"
              headers={[
                "Deal ID",
                "Code",
                "Product Line",
                "Client",
                "Product",
                "Stage",
                "Amount",
                "Margin",
                "Gross profit",
                "Gross profit (EGP)",
                "Quotation date",
                "Next action",
              ]}
              rows={exportRows}
              fileName="medsales-forecast"
              editing={store.editing}
              onEdit={() => store.setEditing(true)}
              onSave={store.save}
              onReset={store.reset}
              saved={store.saved}
            />
          </div>
        }
      />

      

      {adding && (
        <AddRecordPanel
          title="Add pipeline record"
          fields={[
            { name: "code", label: "Hospital Code", required: false },
            { name: "productLine", label: "Product line", options: productLineOptions, required: true },
            { name: "client", label: "Client", required: true },
            { name: "product", label: "Product", required: true },
            { name: "stage", label: "Stage", options: stageOrder },
            {
              name: "amount",
              label: "Amount",
              type: "number",
              min: 0,
              step: 1,
            },
            {
              name: "margin",
              label: "Margin (decimal)",
              type: "number",
              min: 0,
              max: 1,
              step: 0.01,
              required: true,
            },
            { name: "closeDate", label: "Quotation date", type: "date" },
            { name: "nextAction", label: "Next action", required: true },
          ]}
          values={draft}
          onChange={(name, value) =>
            setDraft((current) => ({ ...current, [name]: value }))
          }
          onSubmit={addRecord}
          onCancel={() => setAdding(false)}
        />
      )}
      <div className="crm-stat-grid crm-stat-grid-3">
        <StatCard
          label="Win rate"
          value={`${Math.round(liveWinRate * 100)}%`}
          helper="Closed won / total money"
          accent="teal"
        />
        <StatCard
          label="Active Deals"
          value={store.rows.filter(r => r.stage === "Warm" && r.amount > 0).length.toString()}
          helper="Open warm deals"
          accent="amber"
        />
        <StatCard
          label="Total open pipelines"
          value={formatCurrency(liveOpenPipeline, true)}
          helper="Excludes closed won/lost"
          accent="navy"
        />
      </div>
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
        <div style={{ padding: "10px 16px 8px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border)" }}><AdminBadge /></div>
        <DataTable editing={store.editing} loading={store.loading}>
          <thead>
            <tr>
              <SortableHeader label="Code" sortKey="code" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Client" sortKey="client" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Product Line" sortKey="productLine" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Stage" sortKey="stage" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Amount" sortKey="amount" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Margin" sortKey="margin" sortConfig={sortConfig} requestSort={requestSort} />
              <th>Gross profit</th>
              <th>Gross profit (EGP)</th>
              <SortableHeader label="Quotation date" sortKey="closeDate" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Next action" sortKey="nextAction" sortConfig={sortConfig} requestSort={requestSort} />
              <th />
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => {
              const originalIndex = store.rows.findIndex(
                (item) => item.id === row.id,
              );
              return (
                <tr key={row.id} id={`row-${row.id}`}>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-1`)}>
                    {store.editingCell === `${row.id}-${1}` ? (
                      <EditableInput
                        value={row.code ?? ""}
                        onChange={(value) =>
                          store.updateRow(originalIndex, { code: value })
                        }
                      />
                    ) : (
                      <div className="font-semibold text-primary">{formatCode("PL", row.code)}</div>
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-2`)}>
                    {store.editingCell === `${row.id}-${2}` ? (
                      <EditableInput
                        value={row.client}
                        onChange={(value) =>
                          store.updateRow(originalIndex, {
                            client: value,
                            deal: value,
                          })
                        }
                      />
                    ) : (
                      <>
                        <div style={{ fontWeight: 600, color: "var(--text-heading)", fontSize: 14 }}><span dir="auto">{row.client}</span></div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                          {row.id}
                        </div>
                      </>
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-3`)}>
                    {store.editingCell === `${row.id}-${3}` ? (
                      <Select
                        value={row.productLine ?? row.product}
                        onValueChange={(value) =>
                          store.updateRow(originalIndex, { productLine: value })
                        }
                      >
                        <SelectTrigger style={{ height: 32, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 13, background: "var(--surface)" }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {productLineOptions.map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      (row.productLine ?? row.product)
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-4`)}>
                    {store.editingCell === `${row.id}-${4}` ? (
                      <Select
                        value={row.stage}
                        onValueChange={(value) =>
                          store.updateRow(originalIndex, {
                            stage: value as DealRow["stage"],
                          })
                        }
                      >
                        <SelectTrigger style={{ height: 32, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 13, background: "var(--surface)" }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stageOrder.map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <StagePill stage={row.stage} />
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-5`)}>
                    {store.editingCell === `${row.id}-${5}` ? (
                      <EditableInput
                        type="number"
                        value={row.amount}
                        onChange={(value) =>
                          store.updateRow(originalIndex, {
                            amount: Number(value) || 0,
                          })
                        }
                      />
                    ) : (
                      formatCurrency(row.amount, true)
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-6`)}>
                    {store.editingCell === `${row.id}-${6}` ? (
                      <EditableInput
                        type="number"
                        value={row.margin}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(value) =>
                          store.updateRow(originalIndex, {
                            margin: Math.min(
                              1,
                              Math.max(0, Number(value) || 0),
                            ),
                          })
                        }
                      />
                    ) : (
                      (() => {
                        const pct = Math.round(row.margin * 100);
                        const chipCls = pct >= 35 ? "badge badge-success" : pct >= 20 ? "badge badge-warning" : "badge badge-danger";
                        return <span className={chipCls}>{pct}%</span>;
                      })()
                    )}
                  </td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "var(--text-heading)", fontSize: 13 }}>
                    {formatCurrency(row.amount * row.margin, false)}
                  </td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontSize: 12, color: "var(--text-muted)" }}>
                    {formatCurrencyEGP(row.amount * row.margin * eurToEgp, false)}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-9`)}>
                    {store.editingCell === `${row.id}-${9}` ? (
                      <EditableInput
                        type="date"
                        value={row.closeDate ?? ""}
                        onChange={(value) =>
                          store.updateRow(originalIndex, {
                            closeDate: value || undefined,
                          })
                        }
                      />
                    ) : (
                      formatDate(row.closeDate)
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-10`)}>
                    {store.editingCell === `${row.id}-${10}` ? (
                      <EditableInput
                        value={row.nextAction}
                        onChange={(value) =>
                          store.updateRow(originalIndex, { nextAction: value })
                        }
                      />
                    ) : (
                      <span className="ct-next-action">{row.nextAction}</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      {row.stage === "Closed Won" ? (
                        <span className="win-check-icon" title="Already converted to PO">
                          <Check size={16} strokeWidth={2.5} />
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                          title="Translate to PO"
                          onClick={() => handleConvertToPO(row)}
                        >
                          <ShoppingCart size={14} />
                        </Button>
                      )}
                      <AdminDeleteButton
                        onDelete={() => store.deleteRow(originalIndex)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </section>
    </PageFrame>
  );
}

export function PurchaseOrdersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({
    client: "",
    amount: "",
    status: "Pending",
    orderDate: "",
    deliveryDate: "",
    followUp: "",
  });
  
  const handleConvertToInvoice = async (po: PurchaseOrderRow) => {
    try {
      if (po.code) {
        const invQuery = query(collection(db, "medsales-invoices"), where("code", "==", po.code));
        const invDocs = await getDocs(invQuery);
        if (!invDocs.empty) {
          const existingInv = invDocs.docs[0];
          toast.success("This Purchase Order is already converted to an Invoice.");
          sessionStorage.setItem('highlightRow', existingInv.id);
          window.dispatchEvent(new CustomEvent("navigate-tab", { detail: "invoices" }));
          return;
        }
      }

      const newId = `INV-${Date.now().toString().slice(-4)}`;
      const newInvoice: InvoiceRow = {
        code: po.code,
        id: newId,
        client: po.client,
        po: po.id,
        amount: po.amount,
        status: "Draft",
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: "",
        daysOverdue: 0,
        followUp: po.followUp || "From PO",
      };
      await setDoc(doc(db, "medsales-invoices", newId), newInvoice);
      await updateDoc(doc(db, "medsales-purchase-orders", po.id), {
        status: "Delivered"
      });
      toast.success("Converted to Invoice successfully.");
    } catch(e: any) {
      toast.error("Error converting to Invoice: " + e.message);
    }
  };
  const store = useEditableRows<PurchaseOrderRow>("medsales-purchase-orders", []);
  useEffect(() => {
    const highlightId = sessionStorage.getItem('highlightRow');
    if (highlightId && store.rows.some(r => r.id === highlightId)) {
      setTimeout(() => {
        const el = document.getElementById(`row-${highlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.backgroundColor = '#e6f4ff';
          el.style.transition = 'background-color 0.5s ease';
          setTimeout(() => {
            el.style.backgroundColor = '';
          }, 2000);
        }
      }, 300);
      sessionStorage.removeItem('highlightRow');
    }
  }, [store.rows]);

  const rows = store.rows.filter(
    (row) =>
      (row.client + row.id).toLowerCase().includes(search.toLowerCase()) &&
      (filter === "All statuses" || row.status === filter),
  );
  const exportRows = store.rows.map((row) => [
    row.id,
    row.client,
    row.amount,
    row.status,
    row.orderDate,
    row.deliveryDate,
    row.followUp,
  ]);
  const addRecord = () => {
    if (
      !draft.client.trim() ||
      !draft.orderDate ||
      !draft.deliveryDate ||
      !draft.followUp.trim()
    ) {
      toast.error(
        "Enter the client, dates, and follow-up before adding the purchase order.",
      );
      return;
    }
    store.addRow({
      id: createRecordId("PO", store.rows),
      client: draft.client.trim(),
      amount: Number(draft.amount) || 0,
      status: draft.status as PurchaseOrderRow["status"],
      orderDate: draft.orderDate,
      deliveryDate: draft.deliveryDate,
      followUp: draft.followUp.trim(),
    });
    setDraft({
      client: "",
      amount: "",
      status: "Pending",
      orderDate: "",
      deliveryDate: "",
      followUp: "",
    });
    setAdding(false);
    toast.success("Purchase order added. Save changes to keep it.");
  };
    const { sortedData, sortConfig, requestSort } = useTableSort(rows);
  return (
    <PageFrame>
      <RouteTableHeader
        title="Purchase orders"
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        filterOptions={[
          "All statuses",
          "Pending",
          "Approved",
          "Shipped",
          "Delivered",
        ]}
        action={
          <div className="crm-report-actions">
            <Button
              className="btn-secondary"
              onClick={() => setAdding(true)}
            >
              + Add purchase order
            </Button>
            <ReportToolbar
              title="Purchase orders"
              headers={[
                "PO",
                "Client",
                "Amount",
                "Status",
                "Order date",
                "Delivery date",
                "Follow-up",
              ]}
              rows={exportRows}
              fileName="medsales-purchase-orders"
              editing={store.editing}
              onEdit={() => store.setEditing(true)}
              onSave={store.save}
              onReset={store.reset}
              saved={store.saved}
            />
          </div>
        }
      />
      <div className="crm-stat-grid crm-stat-grid-3">
        <StatCard
          label="Total active POs"
          value={formatCurrency(store.rows.filter(r => r.status !== "Cancelled").reduce((sum, r) => sum + r.amount, 0), true)}
          helper="Excluding cancelled"
          accent="navy"
        />
        <StatCard
          label="Pending POs"
          value={formatCurrency(store.rows.filter(r => r.status === "Pending").reduce((sum, r) => sum + r.amount, 0), true)}
          helper="Awaiting approval"
          accent="amber"
        />
        <StatCard
          label="Delivered POs"
          value={formatCurrency(store.rows.filter(r => r.status === "Delivered").reduce((sum, r) => sum + r.amount, 0), true)}
          helper="Ready for invoicing"
          accent="teal"
        />
      </div>
      {adding && (
        <AddRecordPanel
          title="Add purchase order"
          fields={[
            { name: "client", label: "Client", required: true },
            {
              name: "amount",
              label: "Amount",
              type: "number",
              min: 0,
              step: 1,
            },
            {
              name: "status",
              label: "Status",
              options: [
                "Pending",
                "Approved",
                "Shipped",
                "Delivered",
                "Cancelled",
              ],
            },
            {
              name: "orderDate",
              label: "Order date",
              type: "date",
              required: true,
            },
            {
              name: "deliveryDate",
              label: "Delivery date",
              type: "date",
              required: true,
            },
            { name: "followUp", label: "Follow-up", required: true },
          ]}
          values={draft}
          onChange={(name, value) =>
            setDraft((current) => ({ ...current, [name]: value }))
          }
          onSubmit={addRecord}
          onCancel={() => setAdding(false)}
        />
      )}
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
        <div style={{ padding: "10px 16px 8px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border)" }}><AdminBadge /></div>
        <DataTable editing={store.editing} loading={store.loading}>
          <thead>
            <tr>
              <SortableHeader label="PO" sortKey="id" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Client" sortKey="client" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Amount" sortKey="amount" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Order date" sortKey="orderDate" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Delivery date" sortKey="deliveryDate" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Follow-up" sortKey="followUp" sortConfig={sortConfig} requestSort={requestSort} />
              <th />
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => {
              const originalIndex = store.rows.findIndex(
                (item) => item.id === row.id,
              );
              return (
                <tr key={row.id} id={`row-${row.id}`}>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-1`)}>
                    {store.editingCell === `${row.id}-${1}` ? (
                      <EditableInput
                        value={row.code ?? ""}
                        onChange={(value) =>
                          store.updateRow(originalIndex, { code: value })
                        }
                      />
                    ) : (
                      <div className="font-semibold text-primary">{formatCode("PO", row.code)}</div>
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-2`)}>
                    {store.editingCell === `${row.id}-${2}` ? (
                      <EditableInput
                        value={row.client}
                        onChange={(value) =>
                          store.updateRow(originalIndex, { client: value })
                        }
                      />
                    ) : (
                      row.client
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-4`)}>
                    {store.editingCell === `${row.id}-${4}` ? (
                      <EditableInput
                        type="number"
                        value={row.amount}
                        onChange={(value) =>
                          store.updateRow(originalIndex, {
                            amount: Number(value) || 0,
                          })
                        }
                      />
                    ) : (
                      formatCurrency(row.amount, true)
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-5`)}>
                    {store.editingCell === `${row.id}-${5}` ? (
                      <Select
                        value={row.status}
                        onValueChange={(value) =>
                          store.updateRow(originalIndex, {
                            status: value as PurchaseOrderRow["status"],
                          })
                        }
                      >
                        <SelectTrigger style={{ height: 32, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 13, background: "var(--surface)" }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Pending",
                            "Approved",
                            "Shipped",
                            "Delivered",
                            "Cancelled",
                          ].map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge status={row.status} />
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-6`)}>
                    {store.editingCell === `${row.id}-${6}` ? (
                      <EditableInput
                        type="date"
                        value={row.orderDate}
                        onChange={(value) =>
                          store.updateRow(originalIndex, { orderDate: value })
                        }
                      />
                    ) : (
                      formatDate(row.orderDate)
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-7`)}>
                    {store.editingCell === `${row.id}-${7}` ? (
                      <EditableInput
                        type="date"
                        value={row.deliveryDate}
                        onChange={(value) =>
                          store.updateRow(originalIndex, {
                            deliveryDate: value,
                          })
                        }
                      />
                    ) : (
                      formatDate(row.deliveryDate)
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-8`)}>
                    {store.editingCell === `${row.id}-${8}` ? (
                      <EditableInput
                        value={row.followUp}
                        onChange={(value) =>
                          store.updateRow(originalIndex, { followUp: value })
                        }
                      />
                    ) : (
                      row.followUp
                    )}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      {row.status === "Delivered" ? (
                        <span className="win-check-icon" title="Already invoiced">
                          <Check size={16} strokeWidth={2.5} />
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                          title="Translate to Invoice"
                          onClick={() => handleConvertToInvoice(row)}
                        >
                          <ReceiptText size={14} />
                        </Button>
                      )}
                      <AdminDeleteButton
                        onDelete={() => store.deleteRow(originalIndex)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </section>
    </PageFrame>
  );
}

export function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({
    client: "",
    po: "—",
    amount: "",
    downPayment: "",
    status: "Draft",
    issueDate: "",
    dueDate: "",
    daysOverdue: "0",
    followUp: "",
  });
  const store = useEditableRows<InvoiceRow>("medsales-invoices", []);

  useEffect(() => {
    if (store.editing) return;

    let changed = false;
    const now = new Date();
    now.setHours(0,0,0,0);
    
    Promise.all(store.rows.map(async (row) => {
      let newStatus = row.status;
      let newDays = row.daysOverdue;
      const down = row.downPayment ?? 0;
      
      if (down > 0 && down >= row.amount && row.amount > 0) {
        newStatus = "Paid";
        newDays = 0;
      } else {
        if (row.dueDate && newStatus !== "Paid") {
          const due = new Date(row.dueDate);
          due.setHours(0,0,0,0);
          const diffTime = now.getTime() - due.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays > 0) {
            newStatus = "Overdue";
            newDays = diffDays;
          } else {
            newDays = 0;
            if (down > 0 && down < row.amount) {
              newStatus = "Downpayment";
            } else if (newStatus === "Overdue" || newStatus === "Downpayment") {
              newStatus = "Sent";
            }
          }
        }
      }

      if (row.status !== newStatus || row.daysOverdue !== newDays) {
        await updateDoc(doc(db, "medsales-invoices", row.id), { status: newStatus, daysOverdue: newDays });
      }
    })).catch(console.error);
  }, [store.rows, store.editing]);

  useEffect(() => {
    const highlightId = sessionStorage.getItem('highlightRow');
    if (highlightId && store.rows.some(r => r.id === highlightId)) {
      setTimeout(() => {
        const el = document.getElementById(`row-${highlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.backgroundColor = '#e6f4ff';
          el.style.transition = 'background-color 0.5s ease';
          setTimeout(() => {
            el.style.backgroundColor = '';
          }, 2000);
        }
      }, 300);
      sessionStorage.removeItem('highlightRow');
    }
  }, [store.rows]);

  const rows = store.rows.filter(
    (row) =>
      (row.client + row.id).toLowerCase().includes(search.toLowerCase()) &&
      (filter === "All statuses" || row.status === filter),
  );
  const exportRows = store.rows.map((row) => [
    row.id,
    row.client,
    row.po,
    row.amount,
    row.downPayment ?? 0,
    row.status,
    row.issueDate,
    row.dueDate,
    row.daysOverdue,
    row.followUp,
  ]);
  const addRecord = () => {
    if (
      !draft.client.trim() ||
      !draft.issueDate ||
      !draft.dueDate ||
      !draft.followUp.trim()
    ) {
      toast.error(
        "Enter the client, issue date, due date, and follow-up before adding the invoice.",
      );
      return;
    }
    store.addRow({
      id: createRecordId("INV", store.rows),
      client: draft.client.trim(),
      po: draft.po.trim() || "—",
      amount: Number(draft.amount) || 0,
      downPayment: Number(draft.downPayment) || 0,
      status: draft.status as InvoiceRow["status"],
      issueDate: draft.issueDate,
      dueDate: draft.dueDate,
      daysOverdue: Number(draft.daysOverdue) || 0,
      followUp: draft.followUp.trim(),
    });
    setDraft({
      client: "",
      po: "—",
      amount: "",
      downPayment: "",
      status: "Draft",
      issueDate: "",
      dueDate: "",
      daysOverdue: "0",
      followUp: "",
    });
    setAdding(false);
    toast.success("Invoice added. Save changes to keep it.");
  };
    const { sortedData, sortConfig, requestSort } = useTableSort(rows);
  return (
    <PageFrame>
      <RouteTableHeader
        title="Invoices"
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        filterOptions={["All statuses", "Paid", "Sent", "Downpayment", "Overdue", "Draft"]}
        action={
          <div className="crm-report-actions">
            <Button
              className="btn-secondary"
              onClick={() => setAdding(true)}
            >
              + Add invoice
            </Button>
            <ReportToolbar
              title="Invoices"
              headers={[
                "Invoice",
                "Client",
                "PO",
                "Amount",
                "Down payment",
                "Status",
                "Issue date",
                "Due date",
                "Days overdue",
                "Follow-up",
              ]}
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

      

      {adding && (
        <AddRecordPanel
          title="Add invoice"
          fields={[
            { name: "client", label: "Client", required: true },
            { name: "po", label: "Purchase order" },
            {
              name: "amount",
              label: "Amount",
              type: "number",
              min: 0,
              step: 1,
            },
            {
              name: "downPayment",
              label: "Down payment",
              type: "number",
              min: 0,
              step: 1,
            },
            {
              name: "status",
              label: "Status",
              options: ["Draft", "Sent", "Paid"],
            },
            {
              name: "issueDate",
              label: "Issue date",
              type: "date",
              required: true,
            },
            {
              name: "dueDate",
              label: "Due date",
              type: "date",
              required: true,
            },
            {
              name: "daysOverdue",
              label: "Days overdue",
              type: "number",
              min: 0,
              step: 1,
            },
            { name: "followUp", label: "Follow-up", required: true },
          ]}
          values={draft}
          onChange={(name, value) =>
            setDraft((current) => ({ ...current, [name]: value }))
          }
          onSubmit={addRecord}
          onCancel={() => setAdding(false)}
        />
      )}
      <div className="crm-stat-grid crm-stat-grid-3">
        <StatCard
          label="Invoiced"
          value={formatCurrency(store.rows.reduce((sum, r) => sum + r.amount, 0), true)}
          helper={`${store.rows.length} invoices`}
          accent="navy"
        />
        <StatCard
          label="Collected"
          value={formatCurrency(store.rows.filter(r => r.status === "Paid").reduce((sum, r) => sum + r.amount, 0), true)}
          helper={`${store.rows.reduce((sum, r) => sum + r.amount, 0) > 0 ? Math.round((store.rows.filter(r => r.status === "Paid").reduce((sum, r) => sum + r.amount, 0) / store.rows.reduce((sum, r) => sum + r.amount, 0)) * 100) : 0}% collected`}
          accent="teal"
        />
        <StatCard
          label="At risk"
          value={formatCurrency(store.rows.filter(r => r.status === "Overdue" || r.status === "Sent").reduce((sum, r) => sum + r.amount, 0), true)}
          helper="Sent + overdue exposure"
          accent="rose"
        />
      </div>
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
        <div style={{ padding: "10px 16px 8px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border)" }}><AdminBadge /></div>
        <DataTable editing={store.editing} loading={store.loading}>
          <thead>
            <tr>
              <SortableHeader label="Invoice" sortKey="id" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Client" sortKey="client" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="PO" sortKey="orderId" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Amount" sortKey="amount" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Down payment" sortKey="downPayment" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Due date" sortKey="dueDate" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Days overdue" sortKey="daysOverdue" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Follow-up" sortKey="followUp" sortConfig={sortConfig} requestSort={requestSort} />
              <th />
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => {
              const originalIndex = store.rows.findIndex(
                (item) => item.id === row.id,
              );
              let computedDaysOverdue = row.daysOverdue;
              if (store.editing && row.dueDate) {
                const now = new Date();
                now.setHours(0,0,0,0);
                const due = new Date(row.dueDate);
                due.setHours(0,0,0,0);
                const diffTime = now.getTime() - due.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                computedDaysOverdue = diffDays > 0 ? diffDays : 0;
              }
              const overdueCell =
                computedDaysOverdue > 0 ? (
                  <span className="text-[#c55a66] font-semibold">
                    {computedDaysOverdue} days
                  </span>
                ) : (
                  "—"
                );
              return (
                <tr key={row.id} id={`row-${row.id}`}>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-1`)}>
                    {store.editingCell === `${row.id}-${1}` ? (
                      <EditableInput
                        value={row.code ?? ""}
                        onChange={(value) =>
                          store.updateRow(originalIndex, { code: value })
                        }
                      />
                    ) : (
                      <div className="font-semibold text-primary">{formatCode("IN", row.code)}</div>
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-2`)}>
                    {store.editingCell === `${row.id}-${2}` ? (
                      <EditableInput
                        value={row.client}
                        onChange={(value) =>
                          store.updateRow(originalIndex, { client: value })
                        }
                      />
                    ) : (
                      row.client
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-3`)}>
                    {store.editingCell === `${row.id}-${3}` ? (
                      <EditableInput
                        value={row.po}
                        onChange={(value) =>
                          store.updateRow(originalIndex, { po: value })
                        }
                      />
                    ) : (
                      row.po
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-4`)}>
                    {store.editingCell === `${row.id}-${4}` ? (
                      <EditableInput
                        type="number"
                        value={row.amount}
                        onChange={(value) =>
                          store.updateRow(originalIndex, {
                            amount: Number(value) || 0,
                          })
                        }
                      />
                    ) : (
                      formatCurrency(row.amount, true)
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-5`)}>
                    {store.editingCell === `${row.id}-${5}` ? (
                      <EditableInput
                        type="number"
                        value={row.downPayment ?? 0}
                        onChange={(value) =>
                          store.updateRow(originalIndex, {
                            downPayment: Number(value) || 0,
                          })
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{formatCurrency(row.downPayment ?? 0, true)}</span>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {row.amount > 0 ? Math.round(((row.downPayment ?? 0) / row.amount) * 100) : 0}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-6`)}>
                    {store.editingCell === `${row.id}-${6}` ? (
                      <Select
                        value={row.status}
                        onValueChange={(value) =>
                          store.updateRow(originalIndex, {
                            status: value as InvoiceRow["status"],
                          })
                        }
                      >
                        <SelectTrigger style={{ height: 32, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 13, background: "var(--surface)" }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Draft", "Sent", "Paid"].map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge status={row.status} />
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-7`)}>
                    {store.editingCell === `${row.id}-${7}` ? (
                      <EditableInput
                        type="date"
                        value={row.dueDate}
                        onChange={(value) =>
                          store.updateRow(originalIndex, { dueDate: value })
                        }
                      />
                    ) : (
                      formatDate(row.dueDate)
                    )}
                  </td>
                  <td>
                    {overdueCell}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-9`)}>
                    {store.editingCell === `${row.id}-${9}` ? (
                      <EditableInput
                        value={row.followUp}
                        onChange={(value) =>
                          store.updateRow(originalIndex, { followUp: value })
                        }
                      />
                    ) : (
                      row.followUp
                    )}
                  </td>
                  <td>
                    <AdminDeleteButton
                      onDelete={() => store.deleteRow(originalIndex)}
                    />
                  </td>
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
  const [draft, setDraft] = useState<Record<string, string>>({
    deal: "",
    client: "",
    product: "",
    stage: "Prospecting",
    amount: "",
    margin: "0.30",
    closeDate: "",
    nextAction: "",
  });
  const store = useEditableRows("medsales-forecast", deals);
  const { sortedData, sortConfig, requestSort } = useTableSort(store.rows);
  const exportRows = store.rows.map((row) => [
    row.id,
    row.deal,
    row.client,
    row.stage,
    row.amount,
    `${Math.round(row.margin * 100)}%`,
    row.nextAction,
  ]);
  const livePipelineByStage = stageOrder.map((stage) => ({
    stage,
    amount: store.rows
      .filter((row) => row.stage === stage)
      .reduce((sum, row) => sum + row.amount, 0),
    count: store.rows.filter((row) => row.stage === stage).length,
    weighted: store.rows
      .filter((row) => row.stage === stage)
      .reduce((sum, row) => sum + row.amount * row.margin, 0),
  }));
  const liveOpenPipeline = store.rows
    .filter((row) => !["Closed Won", "Closed Lost"].includes(row.stage))
    .reduce((sum, row) => sum + row.amount, 0);
  const liveWeightedPipeline = store.rows
    .filter((row) => !["Closed Won", "Closed Lost"].includes(row.stage))
    .reduce((sum, row) => sum + row.amount * row.margin, 0);
  const liveActiveDeals = store.rows.filter(
    (row) =>
      !["Closed Won", "Closed Lost"].includes(row.stage) && row.amount > 0,
  ).length;
  const liveWonDeals = store.rows
    .filter((row) => row.stage === "Closed Won")
    .reduce((sum, row) => sum + row.amount, 0);
  const totalDealAmount = store.rows.reduce((sum, row) => sum + row.amount, 0);
  const liveWinRate = totalDealAmount ? liveWonDeals / totalDealAmount : 0;
  const addRecord = () => {
    if (
      !draft.deal.trim() ||
      !draft.client.trim() ||
      !draft.product.trim() ||
      !draft.nextAction.trim()
    ) {
      toast.error(
        "Enter the deal, client, product, and next action before adding the pipeline record.",
      );
      return;
    }
    store.addRow({
      id: createRecordId("DEAL", store.rows),
      deal: draft.deal.trim(),
      client: draft.client.trim(),
      product: draft.product.trim(),
      stage: draft.stage as DealRow["stage"],
      amount: Number(draft.amount) || 0,
      margin: Math.min(1, Math.max(0, Number(draft.margin) || 0)),
      closeDate: draft.closeDate || undefined,
      nextAction: draft.nextAction.trim(),
    });
    setDraft({
      deal: "",
      client: "",
      product: "",
      stage: "Prospecting",
      amount: "",
      margin: "0.30",
      closeDate: "",
      nextAction: "",
    });
    setAdding(false);
    toast.success("Pipeline record added. Save changes to keep it.");
  };
  return (
    <PageFrame>
      <SectionHeader
        title="Pipeline analysis"
        action={
          <div className="crm-report-actions">
            <Button
              className="btn-secondary"
              onClick={() => setAdding(true)}
            >
              + Add pipeline
            </Button>
            <ReportToolbar
              title="Pipeline analysis"
              headers={[
                "Deal ID",
                "Deal",
                "Client",
                "Stage",
                "Amount",
                "Margin",
                "Next action",
              ]}
              rows={exportRows}
              fileName="medsales-pipeline"
              editing={store.editing}
              onEdit={() => store.setEditing(true)}
              onSave={store.save}
              onReset={store.reset}
              saved={store.saved}
            />
          </div>
        }
      />
      {adding && (
        <AddRecordPanel
          title="Add pipeline record"
          fields={[
            { name: "deal", label: "Deal name", required: true },
            { name: "client", label: "Client", required: true },
            { name: "product", label: "Product", required: true },
            { name: "stage", label: "Stage", options: stageOrder },
            {
              name: "amount",
              label: "Amount",
              type: "number",
              min: 0,
              step: 1,
            },
            {
              name: "margin",
              label: "Margin (decimal)",
              type: "number",
              min: 0,
              max: 1,
              step: 0.01,
              required: true,
            },
            { name: "closeDate", label: "Close date", type: "date" },
            { name: "nextAction", label: "Next action", required: true },
          ]}
          values={draft}
          onChange={(name, value) =>
            setDraft((current) => ({ ...current, [name]: value }))
          }
          onSubmit={addRecord}
          onCancel={() => setAdding(false)}
        />
      )}
      <div className="crm-stat-grid crm-stat-grid-4">
        <StatCard
          label="Open pipeline"
          value={formatCurrency(liveOpenPipeline, true)}
          helper="Excludes closed deals"
          accent="navy"
        />
        <StatCard
          label="Weighted pipeline"
          value={formatCurrency(liveWeightedPipeline, true)}
          helper="Probability-adjusted"
          accent="amber"
        />
        <StatCard
          label="Active deals"
          value={`${liveActiveDeals}`}
          helper="With positive amount"
          accent="teal"
        />
        <StatCard
          label="Win rate"
          value={`${Math.round(liveWinRate * 100)}%`}
          helper="Progressed opportunities"
          accent="rose"
        />
      </div>
      <div className="crm-dashboard-grid">
        <ChartCard
          title="Stage volume"
          subtitle="Count and open value by stage"
        >
          <div className="crm-chart-wrap">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={livePipelineByStage}
                margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#edf0f5" />
                <XAxis
                  dataKey="stage"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#8b98aa" }}
                />
                <YAxis
                  yAxisId="amount"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#8b98aa" }}
                  tickFormatter={(value: number) =>
                    `€${Math.round(value / 1_000_000)}M`
                  }
                />
                <YAxis
                  yAxisId="count"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#8b98aa" }}
                />
                <Tooltip
                  {...chartTooltip}
                  formatter={(value, name) =>
                    name === "amount"
                      ? formatCurrency(Number(value ?? 0))
                      : Number(value ?? 0)
                  }
                />
                <Bar
                  yAxisId="amount"
                  dataKey="amount"
                  fill="#2a9d8f"
                  radius={[6, 6, 0, 0]}
                />
                <Line
                  yAxisId="count"
                  type="monotone"
                  dataKey="count"
                  stroke="#f4a261"
                  strokeWidth={2.5}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard
          title="Gross Profit Analysis"
          subtitle="Gross profit by stage based on Amount × Margin"
        >
          <div className="crm-stage-list">
            {livePipelineByStage.map((row) => (
              <div key={row.stage} className="crm-stage-row">
                <div className="flex items-center gap-3">
                  <span
                    className="crm-stage-dot"
                    style={{ backgroundColor: stageColors[row.stage] }}
                  />
                  <div>
                    <div className="text-[12px] font-semibold text-[#34425a]">
                      {row.stage}
                    </div>
                    <div className="text-[11px] text-[#98a4b5]">
                      {row.count} deal{row.count === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-bold text-[#2d3b52]">
                    {formatCurrency(row.weighted, true)}
                  </div>
                  <div className="text-[11px] text-[#8a98ad]">
                    {row.amount
                      ? Math.round((row.weighted / row.amount) * 100)
                      : 0}
                    % gross profit rate
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
      <section className="crm-card mt-5">
        <div className="crm-card-heading">
          <div>
            <h2 className="crm-card-title">Pipeline hygiene</h2>
            <p className="crm-card-subtitle">
              Signals worth discussing in the next commercial review.
            </p>
          </div>
        </div>
        <div className="crm-insight-grid">
          <div className="crm-insight">
            <CircleAlert size={18} className="text-[#d86c75]" />
            <div>
              <div className="font-semibold text-[#34425a]">
                Two high-value opportunities need a next step
              </div>
              <p>
                City General and Metro Clinic are both past their original close
                dates.
              </p>
            </div>
          </div>
          <div className="crm-insight">
            <ArrowDownRight size={18} className="text-[#f4a261]" />
            <div>
              <div className="font-semibold text-[#34425a]">
                Prospecting is carrying the most volume
              </div>
              <p>
                Three records are still unassigned, which makes coverage look
                larger than it is.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="crm-card mt-5">
        <div className="crm-card-heading">
          <div>
            <h2 className="crm-card-title">Correct pipeline entries</h2>
            <p className="crm-card-subtitle">
              This table reads the same saved pipeline records as the Pipelines
              page and updates automatically after changes are saved.
            </p>
          </div>
          <AdminBadge />
        </div>
        <DataTable editing={store.editing} loading={store.loading}>
          <thead>
            <tr>
              <SortableHeader label="Deal" sortKey="deal" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Client" sortKey="client" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Stage" sortKey="stage" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Amount" sortKey="amount" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Next action" sortKey="nextAction" sortConfig={sortConfig} requestSort={requestSort} />
              <th />
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => {
              const originalIndex = store.rows.findIndex(
                (item) => item.id === row.id,
              );
              return (
                <tr key={row.id} id={`row-${row.id}`}>
                  <td style={{ fontWeight: 600, color: "var(--text-heading)", fontSize: 14 }}>{row.deal}</td>
                  <td>{row.client}</td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-3`)}>
                    {store.editingCell === `${row.id}-${3}` ? (
                      <Select
                        value={row.stage}
                        onValueChange={(value) =>
                          store.updateRow(originalIndex, {
                            stage: value as DealRow["stage"],
                          })
                        }
                      >
                        <SelectTrigger style={{ height: 32, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 13, background: "var(--surface)" }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stageOrder.map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge status={row.stage} />
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-4`)}>
                    {store.editingCell === `${row.id}-${4}` ? (
                      <EditableInput
                        type="number"
                        value={row.amount}
                        onChange={(value) =>
                          store.updateRow(originalIndex, {
                            amount: Number(value) || 0,
                          })
                        }
                      />
                    ) : (
                      formatCurrency(row.amount, true)
                    )}
                  </td>
                  <td onDoubleClick={() => store.startEditingCell(`${row.id}-5`)}>
                    {store.editingCell === `${row.id}-${5}` ? (
                      <EditableInput
                        value={row.nextAction}
                        onChange={(value) =>
                          store.updateRow(originalIndex, { nextAction: value })
                        }
                      />
                    ) : (
                      row.nextAction
                    )}
                  </td>
                  <td>
                    <AdminDeleteButton
                      onDelete={() => store.deleteRow(originalIndex)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </section>
    </PageFrame>
  );
}

export function SalesTeamPage() {
  const { role: teamRole } = useCrmAccess();
  const isAdmin = teamRole === "admin";
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({
    rep: "",
    region: "",
    focus: "",
    email: "",
    phone: "",
    status: "active",
  });
  const store = useEditableRows("medsales-team", team);
  const rows = store.rows.filter((row) =>
    (row.rep + row.focus).toLowerCase().includes(search.toLowerCase()),
  );
  const exportRows = store.rows.map((row) => [
    row.id,
    row.rep,
    row.region,
    row.email ?? "",
    row.phone ?? "",
    row.status,
    row.focus,
  ]);
  const addRecord = () => {
    if (!draft.rep.trim() || !draft.region.trim() || !draft.focus.trim()) {
      toast.error(
        "Enter the rep, region, and focus before adding the sales-team member.",
      );
      return;
    }
    store.addRow({
      id: createRecordId("REP", store.rows),
      rep: draft.rep.trim(),
      region: draft.region.trim(),
      email: draft.email.trim() || undefined,
      phone: draft.phone.trim() || undefined,
      status: draft.status as TeamRow["status"],
      focus: draft.focus.trim(),
    });
    setDraft({
      rep: "",
      region: "",
      focus: "",
      email: "",
      phone: "",
      status: "active",
    });
    setAdding(false);
    toast.success("Sales-team member added. Save changes to keep it.");
  };
    const { sortedData, sortConfig, requestSort } = useTableSort(rows);
  return (
    <PageFrame>
      <SectionHeader
        title="Sales team"
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 36, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "0 10px" }}>
              <Search size={15} />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search team..."
              />
            </div>
            <Button
              className="btn-secondary"
              onClick={() => setAdding(true)}
            >
              + Add team member
            </Button>
            <ReportToolbar
              title="Sales team"
              headers={[
                "Rep ID",
                "Sales Rep",
                "Region",
                "Email",
                "Phone",
                "Status",
                "Focus area",
              ]}
              rows={exportRows}
              fileName="medsales-team"
              editing={store.editing}
              onEdit={() => store.setEditing(true)}
              onSave={store.save}
              onReset={store.reset}
              saved={store.saved}
            />
          </div>
        }
      />
      {adding && (
        <AddRecordPanel
          title="Add sales-team member"
          fields={[
            { name: "rep", label: "Sales rep", required: true },
            { name: "region", label: "Region", required: true },
            { name: "focus", label: "Focus area", required: true },
            { name: "email", label: "Email", type: "text" },
            { name: "phone", label: "Phone", type: "text" },
            { name: "status", label: "Status", options: ["active", "setup"] },
          ]}
          values={draft}
          onChange={(name, value) =>
            setDraft((current) => ({ ...current, [name]: value }))
          }
          onSubmit={addRecord}
          onCancel={() => setAdding(false)}
        />
      )}
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
        <div style={{ padding: "10px 16px 8px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border)" }}><AdminBadge /></div>
<DataTable editing={store.editing} loading={store.loading}>
          <thead>
            <tr>
              <SortableHeader label="Rep" sortKey="rep" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Region" sortKey="region" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Focus area" sortKey="focus" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Contact" sortKey="contact" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} requestSort={requestSort} />
              <th />
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => {
              const originalIndex = store.rows.findIndex(
                (item) => item.id === row.id,
              );
              return (
                <tr key={row.id} id={`row-${row.id}`}>
                  <td onDoubleClick={isAdmin ? () => store.startEditingCell(`${row.id}-1`) : undefined}>
                    <div className="flex items-center gap-3">
                      <div className="crm-table-avatar">
                        {row.rep
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-heading)", fontSize: 14 }}>
                          {store.editingCell === `${row.id}-${1}` ? (
                            <EditableInput
                              value={row.rep}
                              onChange={(value) =>
                                store.updateRow(originalIndex, { rep: value })
                              }
                            />
                          ) : (
                            row.rep
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                          {row.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td onDoubleClick={isAdmin ? () => store.startEditingCell(`${row.id}-2`) : undefined}>
                    {store.editingCell === `${row.id}-${2}` ? (
                      <EditableInput
                        value={row.region}
                        onChange={(value) =>
                          store.updateRow(originalIndex, { region: value })
                        }
                      />
                    ) : (
                      row.region
                    )}
                  </td>
                  <td onDoubleClick={isAdmin ? () => store.startEditingCell(`${row.id}-3`) : undefined}>
                    {store.editingCell === `${row.id}-${3}` ? (
                      <EditableInput
                        value={row.focus}
                        onChange={(value) =>
                          store.updateRow(originalIndex, { focus: value })
                        }
                      />
                    ) : (
                      row.focus
                    )}
                  </td>
                  <td onDoubleClick={isAdmin ? () => store.startEditingCell(`${row.id}-4`) : undefined}>
                    {store.editingCell === `${row.id}-${4}` ? (
                      <div className="grid gap-1">
                        <EditableInput
                          value={row.email ?? ""}
                          onChange={(value) =>
                            store.updateRow(originalIndex, { email: value })
                          }
                        />
                        <EditableInput
                          value={row.phone ?? ""}
                          onChange={(value) =>
                            store.updateRow(originalIndex, { phone: value })
                          }
                        />
                      </div>
                    ) : (
                      <>
                        <div>{row.email ?? "—"}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                          {row.phone ?? "—"}
                        </div>
                      </>
                    )}
                  </td>
                  <td onDoubleClick={isAdmin ? () => store.startEditingCell(`${row.id}-5`) : undefined}>
                    {store.editingCell === `${row.id}-${5}` ? (
                      <Select
                        value={row.status}
                        onValueChange={(value) =>
                          store.updateRow(originalIndex, {
                            status: value as TeamRow["status"],
                          })
                        }
                      >
                        <SelectTrigger style={{ height: 32, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 13, background: "var(--surface)" }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["active", "setup"].map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge status={row.status} />
                    )}
                  </td>
                  <td>
                    <AdminDeleteButton
                      onDelete={() => store.deleteRow(originalIndex)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </section>
    </PageFrame>
  );
}

export function SetupPage() {
  const { role, adminEmail } = useCrmAccess();
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
    window.localStorage.setItem(
      "medsales-structure-labels",
      JSON.stringify(labels),
    );
    setLabelSaved(true);
  };
  const resetEntireData = () => {
    if (role !== "admin") return;
    if (
      !window.confirm(
        "Reset all CRM data to the workbook snapshot? This removes saved corrections from this browser.",
      )
    )
      return;
    [
      "medsales-targets",
      "medsales-forecast",
      "medsales-purchase-orders",
      "medsales-invoices",
      "medsales-team",
      "medsales-structure-labels",
    ].forEach((key) => window.localStorage.removeItem(key));
    window.dispatchEvent(
      new CustomEvent("navigate-tab", { detail: "dashboard" }),
    );
    window.setTimeout(() => window.location.reload(), 50);
  };
  const setupRows = [
    ["Pipeline stages", "Prospecting, Cold, Warm, Closed Won, Closed Lost"],
    ["PO statuses", "Pending, Approved, Shipped, Delivered, Cancelled"],
    ["Invoice statuses", "Draft, Sent, Overdue, Paid"],
    ["Team statuses", "Active, Setup"],
  ];
  return (
    <PageFrame>
      <SectionHeader
        title="Lists & setup"
        action={
          <ReportToolbar
            title="Lists & setup"
            headers={["List", "Values"]}
            rows={setupRows}
            fileName="medsales-setup"
          />
        }
      />
      <div className="crm-setup-grid">
        {[
          [
            "Pipeline stages",
            ["Prospecting", "Cold", "Warm", "Closed Won", "Closed Lost"],
          ],
          [
            "PO statuses",
            ["Pending", "Approved", "Shipped", "Delivered", "Cancelled"],
          ],
          ["Invoice statuses", ["Draft", "Sent", "Paid"]],
          ["Team statuses", ["Active", "Setup"]],
        ].map(([label, values]) => (
          <section className="crm-card" key={label as string}>
            <div className="crm-card-heading">
              <div>
                <h2 className="crm-card-title">{label as string}</h2>
                <p className="crm-card-subtitle">Source lookup list</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(values as string[]).map((value) => (
                <StatusBadge key={value} status={value} />
              ))}
            </div>
          </section>
        ))}
      </div>
      <section className="crm-card mt-5">
        <div className="crm-card-heading">
          <div>
            <h2 className="crm-card-title">Workbook notes</h2>
            <p className="crm-card-subtitle">
              What this web console is carrying forward from Excel.
            </p>
          </div>
        </div>
        <div className="crm-note-list">
          <div>
            Sample values in the target, forecast, PO, and invoice rows are
            adapted from the attached MedSales concept.
          </div>
          <div>
            Seven setup placeholders are included to bring the team to 12 seats.
          </div>
          <div>
            Formula-driven values are represented as live client-side metrics
            for this read-only web snapshot.
          </div>
          <div>Last updated in source workbook: September 3, 2026.</div>
        </div>
      </section>
      {role === "admin" && (
        <section className="crm-card mt-5 crm-admin-panel">
          <div className="crm-card-heading">
            <div>
              <h2 className="crm-card-title">Admin controls</h2>
              <p className="crm-card-subtitle">
                Only the admin account can reset all saved data, delete rows, or
                rename structure labels.
              </p>
            </div>
            <AdminBadge />
          </div>
          <div className="crm-admin-email">
            Admin: {adminEmail || "albear.rizkalla@gmail.com"}
          </div>
          <div className="crm-structure-grid">
            {Object.entries(labels).map(([key, value]) => (
              <label key={key} className="crm-structure-field">
                <span>{key.replace(/([A-Z])/g, " $1")}</span>
                <Input
                  value={value}
                  onChange={(event) => {
                    setLabelSaved(false);
                    setLabels((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }));
                  }}
                />
              </label>
            ))}
          </div>
          <div className="crm-admin-actions">
            <Button className="btn-blue" onClick={saveLabels}>
              Save structure names
            </Button>
            <Button className="crm-danger-button" onClick={resetEntireData}>
              Reset entire data
            </Button>
            {labelSaved && (
              <span className="crm-saved-note">Structure saved</span>
            )}
          </div>
        </section>
      )}
    </PageFrame>
  );
}
