import { StatRow } from "../dashboard/StatRow";
import { AnalyticsCard } from "../dashboard/AnalyticsCard";

interface DashboardViewProps {
  data: any[];
}

export function DashboardView({ data }: DashboardViewProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <StatRow data={data} />
      <AnalyticsCard data={data} />
      
      {/* Optional: Add a small "Recent Customers" snippet here in the future */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <p className="text-sm text-gray-500">Navigate to the Customers tab to view the full database, or use the Add button in the sidebar to create new entries.</p>
      </div>
    </div>
  );
}
