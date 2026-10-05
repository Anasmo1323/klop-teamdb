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

export type DealRow = { code?: string;
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
  code?: string;
  id: string;
  client: string;
  amount: number;
  status: "Pending" | "Approved" | "Shipped" | "Invoiced";
  orderDate: string;
  deliveryDate: string;
  followUp: string;
};

export type InvoiceRow = {
  code?: string;
  id: string;
  client: string;
  amount: number;
  downPayment?: number;
  invoiceStatus: "Issued" | "Downpayment" | "Overdue" | "Paid";
  shippingStatus?: "In stock" | "Contacted supplier" | "Shipped" | "Delivered to client";
  issueDate: string;
  dueDate: string;
  daysOverdue: number;
  followUp: string;
};

export type UpaContractRow = {
  id: string;
  customerName: string;
  supplier: string;
  contractValue: number;
  commissionPct: number;
  expectedCollectionPeriod: string;
  commissionValue: number;
  status: "Delivered" | "Delivered and Payment Received" | "Signed" | "Pending" | "In Progress";
};

export const upaContracts: UpaContractRow[] = [
  { id: "UPA-A1", customerName: "UPA A1", supplier: "KLS Martin", contractValue: 1661367.59, commissionPct: 0.09, expectedCollectionPeriod: "", commissionValue: 149523.08, status: "Delivered" },
  { id: "UPA-A2", customerName: "UPA A2", supplier: "KLS Martin", contractValue: 695524.63, commissionPct: 0.09, expectedCollectionPeriod: "", commissionValue: 62597.22, status: "Delivered" },
  { id: "UPA-A3", customerName: "UPA A3", supplier: "KLS Martin", contractValue: 955653.93, commissionPct: 0.09, expectedCollectionPeriod: "", commissionValue: 86008.85, status: "Delivered" },
  { id: "UPA-A4", customerName: "UPA A4", supplier: "KLS Martin", contractValue: 2127126.60, commissionPct: 0.09, expectedCollectionPeriod: "", commissionValue: 191441.39, status: "Delivered and Payment Received" },
  { id: "UPA-A8", customerName: "UPA A8", supplier: "KLS Martin", contractValue: 1974069.01, commissionPct: 0.09, expectedCollectionPeriod: "", commissionValue: 177666.21, status: "Signed" },
];

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
  { id: "TGT-001", rep: "—", region: "—", focus: "KLS Martin", productLine: "KLS Martin", target: 5000000, achieved: 0, status: "On Track" },
  { id: "TGT-002", rep: "—", region: "—", focus: "OperaMed", productLine: "OperaMed", target: 2500000, achieved: 0, status: "Setup" },
  { id: "TGT-003", rep: "—", region: "—", focus: "Diagon", productLine: "Diagon", target: 1000000, achieved: 0, status: "Setup" }
];

export const deals: DealRow[] = [
  {
    "id": "DEAL-001",
    "code": "0033",
    "deal": "مستشفى لوران بالاسكندرية",
    "client": "مستشفى لوران بالاسكندرية",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 0,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Need details"
  },
  {
    "id": "DEAL-002",
    "code": "0035",
    "deal": "Delta University for Science and Technology",
    "client": "Delta University for Science and Technology",
    "product": "KLS Martin",
    "stage": "Cold",
    "amount": 56604.69350649351,
    "margin": 0.36,
    "closeDate": "2025-12-07",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-003",
    "code": "0038",
    "deal": "مستشفى الاكاديميه العربية للعلوم و التكنولوجيا و النقل البحري بالعلمين",
    "client": "مستشفى الاكاديميه العربية للعلوم و التكنولوجيا و النقل البحري بالعلمين",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 35894.04764709479,
    "margin": 0.28,
    "closeDate": "2026-03-03",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-004",
    "code": "0040",
    "deal": "مستشفى الجامعى الجديد كلية طب الاسكندرية (الميرى)",
    "client": "مستشفى الجامعى الجديد كلية طب الاسكندرية (الميرى)",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 18851.291518386715,
    "margin": 0.3,
    "closeDate": "2025-12-25",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-005",
    "code": "0041",
    "deal": "مستشفى الاطفال التخصصى ببنها",
    "client": "مستشفى الاطفال التخصصى ببنها",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 87871.44128113879,
    "margin": 0.3,
    "closeDate": "2025-12-28",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-006",
    "code": "0042",
    "deal": "مستشفى الدمرداش",
    "client": "مستشفى الدمرداش",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 0,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-007",
    "code": "0043",
    "deal": "مستشفي اندلسيه",
    "client": "مستشفي اندلسيه",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 0,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-008",
    "code": "0044",
    "deal": "Wady Nile Hospital",
    "client": "Wady Nile Hospital",
    "product": "KLS Martin",
    "stage": "Cold",
    "amount": 16847.84,
    "margin": 0.31,
    "closeDate": "2026-02-18",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-009",
    "code": "0046",
    "deal": "مستشفى الشرطة التجمع",
    "client": "مستشفى الشرطة التجمع",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 0,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Need details"
  },
  {
    "id": "DEAL-010",
    "code": "0047",
    "deal": "ABC HOSPITAL",
    "client": "ABC HOSPITAL",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 177.2433014876318,
    "margin": 0.2573767307692308,
    "closeDate": "2026-01-13",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-011",
    "code": "0048",
    "deal": "Dar Al Fouad Hospital, 6th of October",
    "client": "Dar Al Fouad Hospital, 6th of October",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 87871.44128113879,
    "margin": 0.19191715976331344,
    "closeDate": "2026-01-19",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-012",
    "code": "0049",
    "deal": "المقاولون العرب",
    "client": "المقاولون العرب",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 717.9046875,
    "margin": 0.31076923076923074,
    "closeDate": "2026-01-26",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-013",
    "code": "0050",
    "deal": "Dr Mohamed Shref El Topgy",
    "client": "Dr Mohamed Shref El Topgy",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 5098.631484374999,
    "margin": 0.31076923076923063,
    "closeDate": "2026-12-31",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-014",
    "code": "0051",
    "deal": "Operation Smile",
    "client": "Operation Smile",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 9075.310664062497,
    "margin": 0.2,
    "closeDate": "2026-02-11",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-015",
    "code": "0052",
    "deal": "مستشفى عين شمس التخصصى",
    "client": "مستشفى عين شمس التخصصى",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 0,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-016",
    "code": "0053",
    "deal": "Misr University for Science and Technology",
    "client": "Misr University for Science and Technology",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 28383.943336092714,
    "margin": 0.30451392121843573,
    "closeDate": "2026-12-31",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-017",
    "code": "0054",
    "deal": "Misr International Hospital",
    "client": "Misr International Hospital",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 0,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-018",
    "code": "0055",
    "deal": "معهد بحوث امراض العيون",
    "client": "معهد بحوث امراض العيون",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 70087.95918367348,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-019",
    "code": "0056",
    "deal": "Operating Smile",
    "client": "Operating Smile",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 0,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Need details"
  },
  {
    "id": "DEAL-020",
    "code": "0057",
    "deal": "مركز جراحة القلب والصدر بدمياط",
    "client": "مركز جراحة القلب والصدر بدمياط",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 25291.28571428572,
    "margin": 0.32153846153846155,
    "closeDate": "2026-06-02",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-021",
    "code": "0058",
    "deal": "مستشفى 500 500 لعلاج الأورام",
    "client": "مستشفى 500 500 لعلاج الأورام",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 148.853571428571,
    "margin": 0.321538461538462,
    "closeDate": "2026-05-18",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-022",
    "code": "0059",
    "deal": "مستشفى الدمرداش",
    "client": "مستشفى الدمرداش",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 0,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-023",
    "code": "0060",
    "deal": "mansoura request",
    "client": "mansoura request",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 0,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-024",
    "code": "0061",
    "deal": "Dr Hatim Case",
    "client": "Dr Hatim Case",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 0,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-025",
    "code": "0062",
    "deal": "مستشفى التيسير بالزقازيق",
    "client": "مستشفى التيسير بالزقازيق",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 0,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-026",
    "code": "0063",
    "deal": "متبرع (عناية د/ رفيق نجيب)",
    "client": "متبرع (عناية د/ رفيق نجيب)",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 19790.807142857146,
    "margin": 0.32153846153846183,
    "closeDate": "2026-07-11",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-027",
    "code": "0064",
    "deal": "مستشفى ابو كبير المركزى الشرقية",
    "client": "مستشفى ابو كبير المركزى الشرقية",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 0,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Need details"
  },
  {
    "id": "DEAL-028",
    "code": "0065",
    "deal": "مستشفى التامين الصحى بالعاصمة",
    "client": "مستشفى التامين الصحى بالعاصمة",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 594.0000000000001,
    "margin": 0.3215384615384615,
    "closeDate": "2026-07-12",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-029",
    "code": "0066",
    "deal": "مستشفى الانبا تكلا",
    "client": "مستشفى الانبا تكلا",
    "product": "KLS Martin",
    "stage": "Cold",
    "amount": 5517.305357142857,
    "margin": 0.32153846153846155,
    "closeDate": "2026-08-12",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-030",
    "code": "0067",
    "deal": "جامعة الرياده للعلوم والتكنولوجيا",
    "client": "جامعة الرياده للعلوم والتكنولوجيا",
    "product": "KLS Martin",
    "stage": "Cold",
    "amount": 148577.64428571434,
    "margin": 0.32153846153846194,
    "closeDate": "2026-08-19",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-031",
    "code": "0068",
    "deal": "مستشفي مصر الدولي",
    "client": "مستشفي مصر الدولي",
    "product": "KLS Martin",
    "stage": "Cold",
    "amount": 10928.185714285719,
    "margin": 0.32153846153846194,
    "closeDate": "2026-07-28",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-032",
    "code": "0069",
    "deal": "Madinaty Medical Centre",
    "client": "Madinaty Medical Centre",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 0,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Need details"
  },
  {
    "id": "DEAL-033",
    "code": "0070",
    "deal": "الشركة العربية البريطانية للصناعات الديناميكية( الهيئة العربية للتصنيع)",
    "client": "الشركة العربية البريطانية للصناعات الديناميكية( الهيئة العربية للتصنيع)",
    "product": "KLS Martin",
    "stage": "Cold",
    "amount": 157374.61338461543,
    "margin": 0.3953962909612321,
    "closeDate": "2026-07-30",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-034",
    "code": "0071",
    "deal": "مستشفى الزهراء جامعة الازهر",
    "client": "مستشفى الزهراء جامعة الازهر",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 0,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Need details"
  },
  {
    "id": "DEAL-035",
    "code": "0072",
    "deal": "فاطمة الزهراء اسامة السيد السعيد",
    "client": "فاطمة الزهراء اسامة السيد السعيد",
    "product": "KLS Martin",
    "stage": "Closed Won",
    "amount": 61.64,
    "margin": 0.3325728173513704,
    "closeDate": "2026-08-26",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-036",
    "code": "0073",
    "deal": "معهد الكبد شبين الكوم",
    "client": "معهد الكبد شبين الكوم",
    "product": "KLS Martin",
    "stage": "Cold",
    "amount": 33878.65867346939,
    "margin": 0.3215384615384616,
    "closeDate": "2026-08-16",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-037",
    "code": "0074",
    "deal": "مستشفي مصر الدولي",
    "client": "مستشفي مصر الدولي",
    "product": "KLS Martin",
    "stage": "Cold",
    "amount": 13524.18,
    "margin": 0.12098211101551787,
    "closeDate": "2026-08-17",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-038",
    "code": "0075",
    "deal": "ABC Hospital",
    "client": "ABC Hospital",
    "product": "KLS Martin",
    "stage": "Cold",
    "amount": 34065.57770604395,
    "margin": 0.3215211277591195,
    "closeDate": "2026-08-20",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-039",
    "code": "0076",
    "deal": "point Medica technology",
    "client": "point Medica technology",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 0,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Need details"
  },
  {
    "id": "DEAL-040",
    "code": "0077",
    "deal": "مستشفي لوران - الإسكندرية",
    "client": "مستشفي لوران - الإسكندرية",
    "product": "KLS Martin",
    "stage": "Cold",
    "amount": 14508.691071428575,
    "margin": 0.32153846153846155,
    "closeDate": "2026-08-23",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-041",
    "code": "0078",
    "deal": "Andalusia Hospital",
    "client": "Andalusia Hospital",
    "product": "KLS Martin",
    "stage": "Cold",
    "amount": 902898.543956044,
    "margin": 0.29999999999999993,
    "closeDate": "2026-08-26",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-042",
    "code": "0078",
    "deal": "Andalusia Hospital",
    "client": "Andalusia Hospital",
    "product": "KLS Martin",
    "stage": "Cold",
    "amount": 67935.12057692312,
    "margin": 0.3933333333333335,
    "closeDate": "2026-08-26",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-043",
    "code": "0079",
    "deal": "جامعة حلوان الأهلية",
    "client": "جامعة حلوان الأهلية",
    "product": "KLS Martin",
    "stage": "Warm",
    "amount": 8405.488928571427,
    "margin": 0.32,
    "closeDate": "2026-09-06",
    "nextAction": "Follow up"
  },
  {
    "id": "DEAL-044",
    "code": "0080",
    "deal": "مستشفى الشروق بالاسكندرية",
    "client": "مستشفى الشروق بالاسكندرية",
    "product": "KLS Martin",
    "stage": "Prospecting",
    "amount": 0,
    "margin": 0,
    "closeDate": "2026-12-31",
    "nextAction": "Need details"
  }
];

export const purchaseOrders: PurchaseOrderRow[] = [];

export const invoices: InvoiceRow[] = [];

export const team: TeamRow[] = [
  { id: "REP-001", rep: "Albear Emil", region: "Projects", email: "albear@technowave-eg.com", phone: "+20 12 22247653", status: "active", focus: "Projects" },
  { id: "REP-002", rep: "Abd El Rahman", region: "Projects", email: "asalah@technowave-eg.com", phone: "+20 10 30099082", status: "active", focus: "OperaMed" },
  { id: "REP-003", rep: "Anas Mohamed", region: "Projects", email: "amohamed@technowave-eg.com", phone: "+20 10 61059325", status: "active", focus: "KLS Martin" }
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
export const collected = invoices.filter((invoice) => invoice.invoiceStatus === "Paid" || invoice.invoiceStatus === "Downpayment").reduce((sum, invoice) => sum + (invoice.invoiceStatus === "Downpayment" ? (invoice.downPayment || 0) : invoice.amount), 0);
export const overdueExposure = invoices.filter((invoice) => invoice.invoiceStatus === "Overdue").reduce((sum, invoice) => sum + invoice.amount, 0);

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

export const collectionsByStatus = (["Paid", "Issued", "Downpayment", "Overdue"] as const).map((status) => ({
  status,
  amount: invoices.filter((invoice) => invoice.invoiceStatus === status).reduce((sum, invoice) => sum + invoice.amount, 0),
  count: invoices.filter((invoice) => invoice.invoiceStatus === status).length,
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
  { label: "Invoices", value: `${formatCurrency(overdueExposure)} exposed`, detail: "2 invoices need follow-up", route: "/invoices", tone: "danger" as const },
  { label: "Pipeline", value: `${activeDeals} active deals`, detail: "Next actions due this week", route: "/forecast", tone: "warning" as const },
  { label: "Targets", value: `${targets.filter((row) => row.status === "At Risk").length} reps at risk`, detail: "Coach before the next review", route: "/targets", tone: "info" as const },
];

export function formatCurrency(value: number, compact = false) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR", minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value);
}

export function formatCurrencyEGP(value: number, compact = false) {
  return new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value);
}

export function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
