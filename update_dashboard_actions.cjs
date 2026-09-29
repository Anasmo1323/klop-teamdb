const fs = require('fs');
let code = fs.readFileSync('src/components/views/crm/Pages.tsx', 'utf-8');

// Replace the period state
code = code.replace(
  'const [period, setPeriod] = useState("YTD");',
  'const [dateRange, setDateRange] = useState({ from: "2026-01-01", to: "2026-12-31" });'
);

// Replace the action section in DashboardPage
const actionRegex = /action=\{\s*<div className="flex items-center gap-2">[\s\S]*?<\/Button>\s*<\/div>\s*\}/;

const replacement = `action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border border-[#e5e8ea] rounded-md px-2 py-1.5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all focus-within:border-[#1677ff] focus-within:ring-2 focus-within:ring-[#1677ff]/10">
              <CalendarDays size={14} className="text-[#8b98aa]" />
              <input 
                type="date" 
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="text-[12px] font-medium bg-transparent outline-none border-none text-[#27354b] cursor-pointer" 
              />
              <span className="text-[12px] font-bold text-[#a0abba] px-1">→</span>
              <input 
                type="date" 
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="text-[12px] font-medium bg-transparent outline-none border-none text-[#27354b] cursor-pointer" 
              />
            </div>
            <ReportToolbar
              title="MedSales CRM dashboard"
              headers={["Metric", "Value", "Context"]}
              rows={dashboardExportRows}
              fileName="medsales-dashboard"
            />
          </div>
        }`;

code = code.replace(actionRegex, replacement);

fs.writeFileSync('src/components/views/crm/Pages.tsx', code);
console.log("Dashboard actions updated successfully!");
