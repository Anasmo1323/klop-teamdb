import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChevronDown } from "lucide-react";

interface Customer {
  position: string;
}

interface AnalyticsCardProps {
  data: Customer[];
}

const COLORS = ['#4F46E5', '#14B8A6', '#F59E0B', '#F43F5E', '#8B5CF6'];

const mockBarData = [
  { name: 'Jan', added: 12 },
  { name: 'Feb', added: 19 },
  { name: 'Mar', added: 15 },
  { name: 'Apr', added: 22 },
  { name: 'May', added: 28 },
  { name: 'Jun', added: 25 },
];

export function AnalyticsCard({ data }: AnalyticsCardProps) {
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(d => {
      const pos = d.position || "Unknown";
      counts[pos] = (counts[pos] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [data]);

  return (
    <div className="flex gap-6 mb-6">
      {/* Left: Bar Chart */}
      <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900">Customers Added</h3>
          <button className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700">
            This Year <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="added" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right: Pie Chart */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-gray-900">By Position</h3>
        </div>
        
        {pieData.length > 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-[160px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full mt-4 space-y-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-gray-600 truncate max-w-[120px]" title={entry.name}>{entry.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
            No data yet
          </div>
        )}
      </div>
    </div>
  );
}
