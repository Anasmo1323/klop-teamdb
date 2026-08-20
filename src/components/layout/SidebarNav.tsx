import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FolderOpen, 
  Settings, 
  Hexagon
} from "lucide-react";
import { cn } from "../../lib/utils";

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
}

export function SidebarNav({ activeTab, onTabChange, onAddClick }: SidebarNavProps) {
  const topNav = [
    { id: "dashboard", icon: LayoutDashboard },
    { id: "customers", icon: Users },
    { id: "add", icon: UserPlus },
    { id: "files", icon: FolderOpen },
  ];

  return (
    <div className="w-[72px] h-screen bg-[#14161C] flex flex-col items-center py-6 shrink-0 border-r border-[#1e2129] z-20">
      {/* Brand Logo */}
      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
        <Hexagon className="w-6 h-6 text-white" />
      </div>

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
                "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/15 text-primary" 
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
              )}
              aria-label={item.id}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Tooltip */}
              <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md">
                {item.id.charAt(0).toUpperCase() + item.id.slice(1)}
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
            "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 group relative",
            activeTab === "settings"
              ? "bg-primary/15 text-primary"
              : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
          )}
        >
          <Settings className="w-[22px] h-[22px]" strokeWidth={activeTab === "settings" ? 2.5 : 2} />
          <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md">
            Settings
          </div>
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 border-2 border-[#14161C] mt-2 cursor-pointer shadow-sm" />
      </div>
    </div>
  );
}
