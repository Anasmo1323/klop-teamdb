export type TargetRow = {
  id: string;
  rep: string;
  region: string;
  focus: string;
  productLine?: string;
  target: number;
  achieved: number;
  status: "On Track" | "Watch" | "At Risk" | "Setup";
};

export type DealRow = {
  id: string;
  deal: string;
  productLine?: string;
  client: string;
  product: string;
  stage: "Cold" | "Warm" | "Prospecting" | "Closed Won" | "Closed Lost";
  amount: number;
  margin: number;
  closeDate?: string;
  nextAction: string;
};

export type PurchaseOrderRow = {
  id: string;
  client: string;
  rep: string;
  amount: number;
  status: "Pending" | "Approved" | "Shipped" | "Delivered" | "Cancelled";
  orderDate: string;
  deliveryDate: string;
  followUp: string;
};

export type InvoiceRow = {
  id: string;
  client: string;
  po: string;
  amount: number;
  status: "Draft" | "Sent" | "Overdue" | "Paid";
  issueDate: string;
  dueDate: string;
  daysOverdue: number;
  followUp: string;
};

export type TeamRow = {
  id: string;
  rep: string;
  region: string;
  email?: string;
  phone?: string;
  status: "active" | "setup";
  focus: string;
};

export const targets: TargetRow[] = [
  { id: "REP-001", rep: "Albear Emil", region: "Egypt", focus: "KLS Martin", productLine: "KLS Martin", target: 200000, achieved: 200000, status: "On Track" },
  { id: "REP-002", rep: "Abd El Rahman", region: "Egypt", focus: "OperaMed", productLine: "OperaMed", target: 300000, achieved: 200000, status: "At Risk" },
  { id: "REP-003", rep: "Anas", region: "Egypt", focus: "To be assigned", productLine: "To be assigned", target: 400000, achieved: 200000, status: "At Risk" },
  { id: "REP-004", rep: "Hatem", region: "TBD", focus: "To be assigned", productLine: "To be assigned", target: 275000, achieved: 200000, status: "At Risk" },
  { id: "REP-005", rep: "Karim", region: "TBD", focus: "To be assigned", productLine: "To be assigned", target: 350000, achieved: 200000, status: "At Risk" },
  { id: "REP-006", rep: "Ibrahim", region: "TBD", focus: "To be assigned", productLine: "To be assigned", target: 0, achieved: 0, status: "Setup" },
  { id: "REP-007", rep: "Nada", region: "TBD", focus: "To be assigned", productLine: "To be assigned", target: 0, achieved: 0, status: "Setup" },
  { id: "REP-008", rep: "Sales Rep 08", region: "TBD", focus: "To be assigned", productLine: "To be assigned", target: 0, achieved: 0, status: "Setup" },
  { id: "REP-009", rep: "Sales Rep 09", region: "TBD", focus: "To be assigned", productLine: "To be assigned", target: 0, achieved: 0, status: "Setup" },
  { id: "REP-010", rep: "Sales Rep 10", region: "TBD", focus: "To be assigned", productLine: "To be assigned", target: 0, achieved: 0, status: "Setup" },
  { id: "REP-011", rep: "Sales Rep 11", region: "TBD", focus: "To be assigned", productLine: "To be assigned", target: 0, achieved: 0, status: "Setup" },
  { id: "REP-012", rep: "Sales Rep 12", region: "TBD", focus: "To be assigned", productLine: "To be assigned", target: 0, achieved: 0, status: "Setup" },
];

export const deals: DealRow[] = [
  { id: "DEAL-001", deal: "City General Hospital MRI Upgrade", client: "City General Hospital", product: "KLS Martin SI", stage: "Cold", amount: 2000000, margin: 0.3, closeDate: "2026-04-15", nextAction: "Confirm technical scope" },
  { id: "DEAL-002", deal: "Metro Clinic Surgical Suite", client: "Metro Health Clinic", product: "KLS Martin EQ", stage: "Warm", amount: 2000000, margin: 0.3, closeDate: "2026-05-01", nextAction: "Send revised proposal" },
  { id: "DEAL-003", deal: "Regional Lab Equipment Refresh", client: "Regional Medical Lab", product: "KLS Martin", stage: "Closed Lost", amount: 30000000, margin: 0.3, closeDate: "2026-06-30", nextAction: "Book discovery call" },
  { id: "DEAL-004", deal: "Children's Hospital Monitoring", client: "Children's Hospital", product: "KLS Martin", stage: "Closed Won", amount: 4000000, margin: 0.3, closeDate: "2026-03-01", nextAction: "Schedule delivery review" },
  { id: "DEAL-005", deal: "Southside Diagnostic Center", client: "Southside Diagnostics", product: "KLS Martin", stage: "Prospecting", amount: 10000000, margin: 0.3, closeDate: "2026-07-15", nextAction: "Identify economic buyer" },
  { id: "DEAL-006", deal: "New opportunity – Rep 06", client: "Account to be assigned", product: "KLS Martin", stage: "Prospecting", amount: 10000000, margin: 0, nextAction: "Add first opportunity" },
  { id: "DEAL-007", deal: "New opportunity – Rep 07", client: "Account to be assigned", product: "KLS Martin", stage: "Prospecting", amount: 0, margin: 0, nextAction: "Add first opportunity" },
  { id: "DEAL-008", deal: "New opportunity – Rep 08", client: "Account to be assigned", product: "Sales Rep 08", stage: "Prospecting", amount: 0, margin: 0, nextAction: "Add first opportunity" },
  { id: "DEAL-009", deal: "New opportunity – Rep 09", client: "Account to be assigned", product: "Sales Rep 09", stage: "Prospecting", amount: 0, margin: 0, nextAction: "Add first opportunity" },
  { id: "DEAL-010", deal: "New opportunity – Rep 10", client: "Account to be assigned", product: "Sales Rep 10", stage: "Prospecting", amount: 0, margin: 0, nextAction: "Add first opportunity" },
  { id: "DEAL-011", deal: "New opportunity – Rep 11", client: "Account to be assigned", product: "Sales Rep 11", stage: "Prospecting", amount: 0, margin: 0, nextAction: "Add first opportunity" },
  { id: "DEAL-012", deal: "New opportunity – Rep 12", client: "Account to be assigned", product: "Sales Rep 12", stage: "Prospecting", amount: 0, margin: 0, nextAction: "Add first opportunity" },
];

export const purchaseOrders: PurchaseOrderRow[] = [
  { id: "PO-2026-001", client: "Children's Hospital", rep: "Albear Emil", amount: 200000, status: "Delivered", orderDate: "2026-02-15", deliveryDate: "2026-10-20", followUp: "Delivery confirmed" },
  { id: "PO-2026-002", client: "City General Hospital", rep: "Abd El Rahman", amount: 150000, status: "Shipped", orderDate: "2026-03-01", deliveryDate: "2026-03-20", followUp: "Track shipment" },
  { id: "PO-2026-003", client: "Metro Health Clinic", rep: "Anas", amount: 65000, status: "Approved", orderDate: "2026-03-10", deliveryDate: "2026-04-05", followUp: "Confirm install window" },
  { id: "PO-2026-004", client: "Valley Medical Center", rep: "Hatem", amount: 88000, status: "Pending", orderDate: "2026-03-14", deliveryDate: "2026-04-15", followUp: "Chase approval" },
];

export const invoices: InvoiceRow[] = [
  { id: "INV-2026-001", client: "Children's Hospital", po: "PO-2026-001", amount: 200000, status: "Paid", issueDate: "2026-03-01", dueDate: "2026-03-31", daysOverdue: 0, followUp: "Payment received" },
  { id: "INV-2026-002", client: "City General Hospital", po: "PO-2026-002", amount: 150000, status: "Sent", issueDate: "2026-03-05", dueDate: "2026-04-05", daysOverdue: 158, followUp: "Follow up before due date" },
  { id: "INV-2026-003", client: "Northside Surgical Center", po: "—", amount: 42000, status: "Overdue", issueDate: "2026-02-01", dueDate: "2026-03-01", daysOverdue: 193, followUp: "Escalate collections" },
  { id: "INV-2026-004", client: "Valley Medical Center", po: "—", amount: 88000, status: "Draft", issueDate: "2026-03-14", dueDate: "2026-04-14", daysOverdue: 149, followUp: "Complete invoice review" },
];

export const team: TeamRow[] = [
  { id: "REP-001", rep: "Albear Emil", region: "Projects", email: "—", phone: "+20 12 22247653", status: "active", focus: "Projects" },
  { id: "REP-002", rep: "Abd El Rahman", region: "Projects", email: "asalah@technowave-eg.com", phone: "+20 10 30099082", status: "active", focus: "OperaMed" },
  { id: "REP-003", rep: "Anas", region: "Projects", email: "amohamed@technowave-eg.com", phone: "+20 10 61059325", status: "active", focus: "KLS Martin" },
  ...Array.from({ length: 9 }, (_, index) => {
    const seat = String(index + 4).padStart(2, "0");
    return { id: `REP-${seat}`, rep: `Sales Rep ${seat}`, region: "TBD", status: "setup" as const, focus: "To be assigned" };
  }),
];

export const stageColors: Record<DealRow["stage"], string> = {
  Prospecting: "#5b6b8c",
  Cold: "#97a6ba",
  Warm: "#f4a261",
  "Closed Won": "#2a9d8f",
  "Closed Lost": "#d86c75",
};

export const statusColors: Record<string, string> = {
  "On Track": "#2a9d8f",
  Watch: "#f4a261",
  "At Risk": "#d86c75",
  Setup: "#97a6ba",
  Paid: "#2a9d8f",
  Sent: "#5b6b8c",
  Overdue: "#d86c75",
  Draft: "#97a6ba",
  Delivered: "#2a9d8f",
  Shipped: "#5b6b8c",
  Approved: "#f4a261",
  Pending: "#d86c75",
  Cancelled: "#97a6ba",
  active: "#2a9d8f",
  setup: "#97a6ba",
};

export const stageOrder: DealRow["stage"][] = ["Prospecting", "Cold", "Warm", "Closed Won", "Closed Lost"];

export const totalTarget = targets.reduce((sum, row) => sum + row.target, 0);
export const totalAchieved = targets.reduce((sum, row) => sum + row.achieved, 0);
export const attainment = totalTarget ? totalAchieved / totalTarget : 0;
export const openPipeline = deals.filter((deal) => !["Closed Won", "Closed Lost"].includes(deal.stage)).reduce((sum, deal) => sum + deal.amount, 0);
export const weightedPipeline = deals.filter((deal) => !["Closed Won", "Closed Lost"].includes(deal.stage)).reduce((sum, deal) => sum + deal.amount * deal.margin, 0);
export const activeDeals = deals.filter((deal) => !["Closed Won", "Closed Lost"].includes(deal.stage) && deal.amount > 0).length;
export const winRate = deals.length ? deals.filter((deal) => deal.stage === "Closed Won").length / deals.filter((deal) => deal.stage !== "Prospecting").length : 0;
export const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
export const collected = invoices.filter((invoice) => invoice.status === "Paid").reduce((sum, invoice) => sum + invoice.amount, 0);
export const overdueExposure = invoices.filter((invoice) => invoice.status === "Overdue" || invoice.status === "Sent").reduce((sum, invoice) => sum + invoice.amount, 0);

export const achievementByRep = targets
  .filter((row) => row.target > 0)
  .map((row) => ({ rep: row.rep.split(" ")[0], target: row.target, achieved: row.achieved, attainment: Math.round((row.achieved / row.target) * 100) }))
  .sort((a, b) => b.achieved - a.achieved);

export const pipelineByStage = stageOrder.map((stage) => ({
  stage,
  amount: deals.filter((deal) => deal.stage === stage).reduce((sum, deal) => sum + deal.amount, 0),
  count: deals.filter((deal) => deal.stage === stage).length,
  weighted: deals.filter((deal) => deal.stage === stage).reduce((sum, deal) => sum + deal.amount * deal.margin, 0),
}));

export const collectionsByStatus = (["Paid", "Sent", "Overdue", "Draft"] as const).map((status) => ({
  status,
  amount: invoices.filter((invoice) => invoice.status === status).reduce((sum, invoice) => sum + invoice.amount, 0),
  count: invoices.filter((invoice) => invoice.status === status).length,
}));

export const monthlyTrend = [
  { month: "Jan", achieved: 110000, pipeline: 2800000, collected: 84000 },
  { month: "Feb", achieved: 165000, pipeline: 4100000, collected: 102000 },
  { month: "Mar", achieved: 235000, pipeline: 5200000, collected: 200000 },
  { month: "Apr", achieved: 260000, pipeline: 4800000, collected: 235000 },
  { month: "May", achieved: 320000, pipeline: 5600000, collected: 288000 },
  { month: "Jun", achieved: 400000, pipeline: 6200000, collected: 330000 },
  { month: "Jul", achieved: 470000, pipeline: 7000000, collected: 380000 },
  { month: "Aug", achieved: 600000, pipeline: 7800000, collected: 450000 },
  { month: "Sep", achieved: totalAchieved, pipeline: openPipeline, collected },
];

export const attentionItems = [
  { label: "Collections", value: `${formatCurrency(overdueExposure)} exposed`, detail: "2 invoices need follow-up", route: "/invoices", tone: "danger" as const },
  { label: "Pipeline", value: `${activeDeals} active deals`, detail: "Next actions due this week", route: "/forecast", tone: "warning" as const },
  { label: "Targets", value: `${targets.filter((row) => row.status === "At Risk").length} reps at risk`, detail: "Coach before the next review", route: "/targets", tone: "info" as const },
];

export function formatCurrency(value: number, compact = false) {
  if (compact) {
    if (Math.abs(value) >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `€${Math.round(value / 1_000)}K`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}
