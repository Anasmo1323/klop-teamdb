import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  ReceiptText,
  Search,
  Settings2,
  ShoppingCart,
  SlidersHorizontal,
  Target,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadExcelSheet, printReport } from "@/lib/crm-actions";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/hooks/useSession";

type CrmAccess = { role: "admin" | "sales"; adminEmail: string };
const CrmAccessContext = createContext<CrmAccess>({ role: "sales", adminEmail: "" });
const CRM_ADMIN_EMAIL = "albear.rizkalla@gmail.com";

function isCrmAdmin(email?: string | null, role?: string | null) {
  return role === "admin" || email?.trim().toLowerCase() === CRM_ADMIN_EMAIL;
}

export function useCrmAccess() {
  return useContext(CrmAccessContext);
}

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/targets", label: "Targets", icon: Target },
  { to: "/forecast", label: "Pipelines", icon: ArrowUpRight },
  { to: "/pipelines", label: "Pipelines Analysis", icon: SlidersHorizontal },
  { to: "/purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
  { to: "/invoices", label: "Invoices", icon: ReceiptText },
  { to: "/sales-team", label: "Sales Team", icon: UsersRound },
  { to: "/setup", label: "Lists & Setup", icon: Settings2 },
];

export function CrmShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, signOut } = useSession();
  const signedInEmail = user?.email ?? "";
  const [role, setRole] = useState<"admin" | "sales">(() => (
    isCrmAdmin(signedInEmail) ? "admin" : "sales"
  ));
  const [adminEmail, setAdminEmail] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const activeLabel = useMemo(() => {
    const match = navItems.find((item) => item.to === location.pathname);
    return match?.label ?? "Dashboard";
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    const fallbackIsAdmin = isCrmAdmin(signedInEmail);
    setRole(fallbackIsAdmin ? "admin" : "sales");
    setAdminEmail(signedInEmail);

    void apiFetch("/me/profile", { silent: true })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = await response.json().catch(() => null) as { ok?: boolean; data?: { profile?: { role?: string; email?: string } } };
        return payload?.ok ? payload.data?.profile : null;
      })
      .then((profile) => {
        if (!active || !profile) return;
        setRole(isCrmAdmin(profile.email, profile.role) ? "admin" : "sales");
        setAdminEmail(profile.email ?? "");
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [signedInEmail]);

  return (
    <CrmAccessContext.Provider value={{ role, adminEmail }}>
    <div className="crm-app min-h-screen bg-[#f5f7fb] text-[#172033]">
      <aside className={`crm-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="crm-brand">
          <div className="crm-brand-mark">M</div>
          <div>
            <div className="text-[14px] font-extrabold tracking-tight text-white">MedSales</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#9aa8c2]">CRM workspace</div>
          </div>
          <button className="crm-mobile-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="crm-side-section-label">Workspace</div>
        <nav className="crm-nav" aria-label="CRM navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }: { isActive: boolean }) => `crm-nav-item ${isActive ? "is-active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="crm-sidebar-spacer" />
        <div className="crm-side-note">
          <div className="flex items-center gap-2 text-[#f2c99b]">
            <CircleHelp size={15} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Workbook synced</span>
          </div>
          <p className="mt-2 text-[12px] leading-5 text-[#b8c2d3]">Live view of the September 2026 operating snapshot.</p>
        </div>
        <div className="crm-user">
          <div className="crm-avatar">AE</div>
          <div className="min-w-0">
            <div className="truncate text-[12px] font-semibold text-white">Albear Emil</div>
            <div className="truncate text-[11px] text-[#93a2bd]">Sales lead</div>
          </div>
          <ChevronDown size={15} className="ml-auto text-[#93a2bd]" />
        </div>
        <button type="button" className="crm-signout-button" onClick={() => void signOut()}>
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </aside>

      {mobileOpen && <button className="crm-sidebar-overlay" aria-label="Close navigation overlay" onClick={() => setMobileOpen(false)} />}

      <main className="crm-main">
        <header className="crm-topbar">
          <div className="flex min-w-0 items-center gap-3">
            <button className="crm-mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8a98ad]">MedSales CRM</div>
              <div className="truncate text-[15px] font-bold text-[#172033]">{activeLabel}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="crm-search-wrap">
                <Search size={16} className="text-[#8d9ab0]" />
                <Input autoFocus className="crm-search-input" placeholder="Search records..." />
                <button aria-label="Close search" onClick={() => setSearchOpen(false)}><X size={15} /></button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" className="crm-icon-btn" aria-label="Open search" onClick={() => setSearchOpen(true)}>
                <Search size={18} />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="crm-icon-btn relative" aria-label="View notifications">
              <Bell size={18} />
              <span className="crm-notification-dot" />
            </Button>
            <div className="crm-topbar-divider" />
            <span className={`crm-role-pill ${role === "admin" ? "is-admin" : ""}`}>{role === "admin" ? "Admin" : "Sales team"}</span>
            <button className="crm-topbar-profile" onClick={() => navigate("/setup")}>
              <div className="crm-avatar crm-avatar-small">AE</div>
              <span className="hidden text-[12px] font-semibold text-[#34425a] md:block">Albear Emil</span>
              <ChevronDown size={14} className="text-[#8b98aa]" />
            </button>
            <Button variant="ghost" className="crm-signout-topbar" onClick={() => void signOut()} aria-label="Sign out" title="Sign out">
              <LogOut size={15} />
              <span>Sign out</span>
            </Button>
          </div>
        </header>
        <div className="crm-content">{children}</div>
      </main>
    </div>
    </CrmAccessContext.Provider>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
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
    <div className="crm-report-actions">
      {onEdit && <Button className={editing ? "crm-primary-button" : "crm-secondary-button"} onClick={editing ? onSave : onEdit}>{editing ? "Save changes" : "Edit data"}</Button>}
      {editing && onReset && <Button variant="ghost" className="crm-reset-button" onClick={onReset}>Reset</Button>}
      <Button className="crm-secondary-button" onClick={() => printReport(title)}><span className="crm-action-icon">↗</span> Print report</Button>
      <Button className="crm-secondary-button" onClick={() => downloadExcelSheet(fileName, title, headers, rows)}><span className="crm-action-icon">↓</span> Excel download</Button>
      {saved && <span className="crm-saved-note">Saved on this device</span>}
    </div>
  );
}

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
