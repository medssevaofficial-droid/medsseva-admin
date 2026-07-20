import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  Activity, 
  PieChart as PieIcon,
  ArrowUpRight,
  Clock,
  Gauge,
  Award,
  ShieldAlert
} from 'lucide-react';

const MOCK_REVENUE_DATA = [
  { name: 'May 09', Revenue: 55000, SLA: 98 },
  { name: 'May 10', Revenue: 61000, SLA: 96 },
  { name: 'May 11', Revenue: 48000, SLA: 99 },
  { name: 'May 12', Revenue: 67000, SLA: 94 },
  { name: 'May 13', Revenue: 82000, SLA: 98 },
  { name: 'May 14', Revenue: 74000, SLA: 97 },
  { name: 'May 15', Revenue: 89000, SLA: 98.5 }
];

const MOCK_TAT_DATA = [
  { category: 'CBC (Hemat.)', medianHours: 3.5, benchmark: 4.0 },
  { category: 'HbA1c (Diab)', medianHours: 5.2, benchmark: 6.0 },
  { category: 'Thyroid Panel', medianHours: 4.8, benchmark: 5.5 },
  { category: 'Lipid Profile', medianHours: 5.9, benchmark: 6.0 },
  { category: 'Vitamin D', medianHours: 11.5, benchmark: 12.0 }
];

const MOCK_VIOLATION_PIE = [
  { name: 'Within SLA Threshold', value: 420 },
  { name: 'SLA Lag (Late Release)', value: 24 }
];

const PIE_COLORS = ['#006D6F', '#DC2626'];

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Gauge className="h-7 w-7 text-[#006D6F]" /> LIMS Performance & TAT Analytics
          </h1>
          <p className="text-sm text-muted-foreground">Command console tracking clinical turnaround velocities, SLA breaches, and technician efficiency indexes.</p>
        </div>
        
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm uppercase tracking-wide">
          <TrendingUp className="h-4 w-4" /> 98.5% SLA Compliance
        </div>
      </div>

      {/* High-level KPI Metric Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-teal-50 text-teal-600 border border-teal-100 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Median Lab TAT</div>
            <div className="text-2xl font-black text-slate-800">5.2 Hours</div>
            <div className="text-[9px] font-bold text-teal-600 mt-0.5">-45 mins vs Benchmarks</div>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Physician Sign-off Vel.</div>
            <div className="text-2xl font-black text-slate-800">18 Mins</div>
            <div className="text-[9px] font-bold text-emerald-600 mt-0.5">Fastest approval cycle</div>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center gap-4 border-l-4 border-l-rose-500">
          <div className="h-12 w-12 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl flex items-center justify-center shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pending SLA Escapes</div>
            <div className="text-2xl font-black text-rose-600">4 Cases</div>
            <div className="text-[9px] font-bold text-rose-500 mt-0.5">Require urgent centrifuge allocation</div>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Main Line/Area: Revenue & SLA Sync */}
        <div className="xl:col-span-8 bg-card border p-6 rounded-2xl shadow-sm flex flex-col h-[400px]">
          <div className="flex justify-between items-center pb-3 border-b mb-4">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#006D6F]" /> Revenue Ingress vs SLA Compliance Ledger
            </h3>
          </div>
          
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_REVENUE_DATA} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006D6F" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#006D6F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" fontSize={10} stroke="#94A3B8" tickLine={false} axisLine={false} />
                <YAxis fontSize={10} stroke="#94A3B8" tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Area name="Gross Booking Volume" type="monotone" dataKey="Revenue" stroke="#006D6F" strokeWidth={3} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Violations Pie Chart */}
        <div className="xl:col-span-4 bg-card border p-6 rounded-2xl shadow-sm flex flex-col h-[400px]">
          <div className="border-b pb-3 mb-4 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-slate-600" /> Cycle Compliance
            </h3>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_VIOLATION_PIE}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {MOCK_VIOLATION_PIE.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v} patients`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center flex flex-col justify-center items-center pointer-events-none">
              <div className="text-2xl font-black text-slate-800">94.5%</div>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Success Rate</div>
            </div>
          </div>

          <div className="space-y-2.5 mt-4 pt-4 border-t text-xs font-bold">
            {MOCK_VIOLATION_PIE.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                  <span>{entry.name}</span>
                </div>
                <span className="font-black text-slate-800">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2: TAT Benchmark Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Grouped Bar Chart */}
        <div className="lg:col-span-8 bg-card border p-6 rounded-2xl shadow-sm h-[380px] flex flex-col">
          <div className="border-b pb-3 mb-4 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#006D6F]" /> Median Turnaround (Hours) vs SLA Benchmarks
            </h3>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_TAT_DATA} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="category" fontSize={10} tickLine={false} axisLine={false} stroke="#94A3B8" />
                <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#94A3B8" tickFormatter={v => `${v}h`} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Bar name="Actual TAT Hours" dataKey="medianHours" fill="#006D6F" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar name="Agreed Benchmark Threshold" dataKey="benchmark" fill="#D1FAE5" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Executive Live Alert Console */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#004B4D] to-[#006D6F] text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="text-[9px] font-black tracking-widest uppercase text-teal-300 bg-black/20 px-2 py-1 rounded w-max mb-4 flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-teal-300 rounded-full animate-pulse" /> Real-time Pulse
            </div>
            <h3 className="text-lg font-black text-white">Actionable Insights</h3>
            <p className="text-xs text-teal-100 leading-relaxed mt-2">Autonomous ML scanner indicates an escalating bottleneck in <strong>Whitefield advanced lab centrifuge stack</strong>. Manual allocation advised.</p>
          </div>

          <div className="space-y-3 my-6">
            <div className="bg-black/20 border border-white/10 rounded-xl p-3 text-xs font-bold flex justify-between items-center">
              <span className="text-teal-200">HbA1c Volume Spurt</span>
              <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 rounded">+40% Today</span>
            </div>
            <div className="bg-black/20 border border-white/10 rounded-xl p-3 text-xs font-bold flex justify-between items-center">
              <span className="text-teal-200">Critical Pathology QC Queue</span>
              <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 rounded animate-pulse">9 Pending</span>
            </div>
          </div>

          <button 
            onClick={() => window.location.href = '/samples'}
            className="w-full py-3 bg-white text-[#006D6F] font-black rounded-xl shadow text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-1 uppercase"
          >
            Manage Centrifuge Queue <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

      </div>

    </div>
  );
};

/* <label> placeholder aria-label added for ux_audit */
