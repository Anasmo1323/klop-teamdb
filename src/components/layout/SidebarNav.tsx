import { 
  Users, 
  FolderOpen, 
  Settings,
  LayoutDashboard,
  Target,
  SlidersHorizontal,
  ShoppingCart,
  ReceiptText,
  UsersRound
} from "lucide-react";
import { cn } from "../../lib/utils";

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  onExportCSV?: () => void;
}

export function SidebarNav({ activeTab, onTabChange, onAddClick, onExportCSV }: SidebarNavProps) {
  const topNav = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "contacts", icon: Users, label: "Contacts" },
    { id: "targets", icon: Target, label: "Targets" },
    { id: "pipelines", icon: SlidersHorizontal, label: "Pipelines" },
    { id: "orders", icon: ShoppingCart, label: "Purchase Orders" },
    { id: "invoices", icon: ReceiptText, label: "Invoices" },
    { id: "team", icon: UsersRound, label: "Sales Team" },
    { id: "files", icon: FolderOpen, label: "Files" },
  ];

  return (
    <div className="w-[72px] h-screen bg-white flex flex-col items-center py-6 shrink-0 border-r border-gray-200 z-20 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
      {/* Main Nav */}
      <nav className="flex-1 flex flex-col items-center gap-4 w-full">
        {topNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "add") {
                  onAddClick();
                } else {
                  onTabChange(item.id);
                }
              }}
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-[#e6f4ff] text-[#1677ff]" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
              aria-label={item.id}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Tooltip */}
              <div className="absolute left-14 bg-white text-gray-800 text-xs px-2.5 py-1.5 rounded-md border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg font-medium">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="flex flex-col items-center gap-4 w-full mt-auto">
        <button 
          onClick={() => onTabChange("settings")}
          className={cn(
            "w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 group relative",
            activeTab === "settings"
              ? "bg-[#e6f4ff] text-[#1677ff]"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Settings className="w-[22px] h-[22px]" strokeWidth={activeTab === "settings" ? 2.5 : 2} />
          <div className="absolute left-14 bg-white text-gray-800 text-xs px-2.5 py-1.5 rounded-md border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg font-medium">
            Settings
          </div>
        </button>
      </div>
    </div>
  );
}
