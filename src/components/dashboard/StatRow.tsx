import { useMemo } from "react";
import { Users, Building2, Briefcase, FileText, TrendingUp } from "lucide-react";

interface Customer {
  id: string;
  hospitalName: string;
  position: string;
  attachedFiles?: any[];
}

interface StatRowProps {
  data: Customer[];
}

export function StatRow({ data }: StatRowProps) {
  const stats = useMemo(() => {
    const totalCustomers = data.length;
    
    const uniqueHospitals = new Set(data.map(d => d.hospitalName)).size;
    
    let totalFiles = 0;
    data.forEach(d => {
      if (d.attachedFiles) totalFiles += d.attachedFiles.length;
    });

    const newThisWeek = Math.max(0, Math.floor(totalCustomers * 0.2)); // Stubbed

    return [
      {
        label: "Total Customers",
        value: totalCustomers,
        icon: Users,
        trend: "+12%",
        trendUp: true
      },
      {
        label: "Hospitals Covered",
        value: uniqueHospitals,
        icon: Building2,
        trend: "+2",
        trendUp: true
      },
      {
        label: "New This Week",
        value: newThisWeek,
        icon: TrendingUp,
      },
      {
        label: "Files Uploaded",
        value: totalFiles,
        icon: FileText,
      }
    ];
  }, [data]);

  return (
    <div className="flex items-center w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6">
      {stats.map((stat, i) => (
        <div key={i} className={`flex-1 px-6 py-4 flex flex-col ${i !== stats.length - 1 ? 'border-r border-gray-100' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-500">{stat.label}</span>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-gray-900 leading-none">{stat.value}</span>
            {stat.trend && (
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md mb-1 ${stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {stat.trendUp ? '▲' : '▼'} {stat.trend}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
