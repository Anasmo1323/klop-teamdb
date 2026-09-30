import {
  Users,
  FolderOpen,
  Settings,
  LayoutDashboard,
  Target,
  SlidersHorizontal,
  ShoppingCart,
  ReceiptText,
  UsersRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useState } from "react";

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  onExportCSV?: () => void;
}

const topNav = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "contacts",  icon: Users,           label: "Contacts"  },
  { id: "targets",   icon: Target,          label: "Targets"   },
  { id: "pipelines", icon: SlidersHorizontal, label: "Pipelines" },
  { id: "orders",    icon: ShoppingCart,    label: "Purchase Orders" },
  { id: "invoices",  icon: ReceiptText,     label: "Invoices"  },
  { id: "team",      icon: UsersRound,      label: "Sales Team" },
  { id: "files",     icon: FolderOpen,      label: "Files"     },
];

export function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative h-screen flex flex-col shrink-0 transition-all duration-300 ease-in-out no-print",
        collapsed ? "w-[68px]" : "w-[228px]"
      )}
      style={{ background: "var(--sidebar-bg)" }}
    >
      {/* Logo / Wordmark */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-white/10 shrink-0 overflow-hidden">
        <img 
          src="/klop.png" 
          alt="KLOP Database" 
          className="w-full h-full object-contain py-2"
        />
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[54px] z-10 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 transition-all"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Nav section label */}
      {!collapsed && (
        <div className="px-4 pt-5 pb-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
            Menu
          </span>
        </div>
      )}

      {/* Main Nav */}
      <nav className={cn("flex-1 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden", collapsed ? "px-2 pt-4" : "px-3")}>
        {topNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer",
                collapsed ? "h-10 w-10 justify-center mx-auto" : "h-9 w-full px-3",
                isActive
                  ? "bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.4)]"
                  : "text-slate-400 hover:bg-white/8 hover:text-white"
              )}
              style={!isActive ? undefined : undefined}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                className="shrink-0"
              />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <span className="pointer-events-none absolute left-12 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-50">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-white/10 my-2" />

      {/* Settings */}
      <div className={cn("pb-4", collapsed ? "px-2" : "px-3")}>
        <button
          onClick={() => onTabChange("settings")}
          title={collapsed ? "Settings" : undefined}
          className={cn(
            "group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer",
            collapsed ? "h-10 w-10 justify-center mx-auto" : "h-9 w-full px-3",
            activeTab === "settings"
              ? "bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.4)]"
              : "text-slate-400 hover:bg-white/8 hover:text-white"
          )}
        >
          <Settings size={18} strokeWidth={activeTab === "settings" ? 2.5 : 2} className="shrink-0" />
          {!collapsed && <span className="truncate">Settings</span>}
          {collapsed && (
            <span className="pointer-events-none absolute left-12 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-50">
              Settings
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
