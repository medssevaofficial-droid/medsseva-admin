/*eslint-disabled*/
import React, { useEffect, useState, useCallback } from 'react';
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
  Legend,
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
  ShieldAlert,
  RefreshCw,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { analyticsService } from '../services/api';

const PIE_COLORS = ['#006D6F', '#DC2626'];

interface AnalyticsData {
  kpis: {
    todayBookings: number;
    todayRevenue: number;
    totalRevenue: number;
    totalRefunds: number;
    pendingPayments: number;
    completedReports: number;
    pendingReports: number;
    pendingSampleCollections: number;
    homeCollectionBookings: number;
    labVisitBookings: number;
    activeBookings: number;
    totalBookings: number;
  };
  tat: {
    avgHours: number;
    medianHours: number;
    fastestHours: number;
    slowestHours: number;
    avgDoctorApprovalMinutes: number;
  };
  sla: {
    compliance: number;
    withinSla: number;
    nearSla: number;
    breachedSla: number;
    avgDelayHours: number;
    worstDelayHours: number;
    pieData: { name: string; value: number }[];
  };
  revenueChart: { name: string; Revenue: number }[];
  bookingsByStatus: Record<string, number>;
  paymentModes: { mode: string; count: number; total: number }[];
  branchAnalytics: { branchId: string; branchName: string; bookingCount: number; revenue: number; pendingBookings: number }[];
  topTests: { testId: string; name: string; count: number }[];
  alerts: { type: string; message: string; severity: 'critical' | 'warning' | 'info' }[];
  insights: string[];
}

const KpiSkeleton: React.FC = () => (
  <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center gap-4 animate-pulse">
    <div className="h-12 w-12 bg-muted rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-2.5 bg-muted rounded w-32" />
      <div className="h-6 bg-muted rounded w-20" />
      <div className="h-2 bg-muted rounded w-24" />
    </div>
  </div>
);

const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-[400px]' }) => (
  <div className={`bg-card border rounded-2xl p-6 shadow-sm ${height} animate-pulse flex flex-col gap-4`}>
    <div className="h-4 bg-muted rounded w-48" />
    <div className="flex-1 bg-muted/50 rounded-xl" />
  </div>
);

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getDashboard();
      setData(result);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div className="space-y-2 animate-pulse">
            <div className="h-7 bg-muted rounded w-72" />
            <div className="h-4 bg-muted rounded w-96" />
          </div>
          <div className="h-9 bg-muted rounded-lg w-40 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8"><ChartSkeleton /></div>
          <div className="xl:col-span-4"><ChartSkeleton /></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8"><ChartSkeleton height="h-[380px]" /></div>
          <div className="lg:col-span-4"><ChartSkeleton height="h-[380px]" /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="h-14 w-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center">
          <AlertTriangle className="h-7 w-7 text-rose-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">Analytics Unavailable</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">{error}</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, tat, sla, revenueChart, alerts, insights, topTests } = data;

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Gauge className="h-7 w-7 text-[#006D6F]" /> LIMS Performance & TAT Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Command console tracking clinical turnaround velocities, SLA breaches, and technician efficiency indexes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh analytics"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <div className={`text-xs font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm uppercase tracking-wide border ${sla.compliance >= 90 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : sla.compliance >= 75 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            <TrendingUp className="h-4 w-4" /> {sla.compliance}% SLA Compliance
          </div>
        </div>
      </div>

      {/* KPI Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-teal-50 text-teal-600 border border-teal-100 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Median Lab TAT</div>
            <div className="text-2xl font-black text-slate-800">
              {tat.medianHours > 0 ? `${tat.medianHours} Hours` : '—'}
            </div>
            <div className="text-[9px] font-bold text-teal-600 mt-0.5">
              {tat.fastestHours > 0 ? `Fastest: ${tat.fastestHours}h` : 'No data yet'}
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Physician Sign-off Vel.</div>
            <div className="text-2xl font-black text-slate-800">
              {tat.avgDoctorApprovalMinutes > 0 ? `${tat.avgDoctorApprovalMinutes} Mins` : '—'}
            </div>
            <div className="text-[9px] font-bold text-emerald-600 mt-0.5">Average approval cycle</div>
          </div>
        </div>

        <div className={`bg-card border rounded-2xl p-5 shadow-sm flex items-center gap-4 border-l-4 ${sla.breachedSla > 0 ? 'border-l-rose-500' : 'border-l-emerald-500'}`}>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${sla.breachedSla > 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pending SLA Escapes</div>
            <div className={`text-2xl font-black ${sla.breachedSla > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {sla.breachedSla > 0 ? `${sla.breachedSla} Cases` : 'All Clear'}
            </div>
            <div className={`text-[9px] font-bold mt-0.5 ${sla.breachedSla > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {sla.breachedSla > 0
                ? `Avg delay: ${sla.avgDelayHours}h`
                : 'No SLA breaches'}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Revenue Chart */}
        <div className="xl:col-span-8 bg-card border p-6 rounded-2xl shadow-sm flex flex-col h-[400px]">
          <div className="flex justify-between items-center pb-3 border-b mb-4">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#006D6F]" /> Revenue Ingress vs SLA Compliance Ledger
            </h3>
            <span className="text-[10px] text-muted-foreground font-semibold">Last 7 Days</span>
          </div>

          <div className="flex-1 min-h-0 w-full">
            {revenueChart.every(d => d.Revenue === 0) ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
                No revenue data for the past 7 days.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChart} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#006D6F" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#006D6F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" fontSize={10} stroke="#94A3B8" tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} stroke="#94A3B8" tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
<Tooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }} formatter={((v: number) => `₹${Number(v).toLocaleString('en-IN')}`) as any} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Area name="Gross Booking Volume" type="monotone" dataKey="Revenue" stroke="#006D6F" strokeWidth={3} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* SLA Pie */}
        <div className="xl:col-span-4 bg-card border p-6 rounded-2xl shadow-sm flex flex-col h-[400px]">
          <div className="border-b pb-3 mb-4 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-slate-600" /> Cycle Compliance
            </h3>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center relative">
            {sla.pieData.every(d => d.value === 0) ? (
              <div className="text-xs text-muted-foreground italic text-center">No SLA data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sla.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sla.pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v} reports`} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute text-center flex flex-col justify-center items-center pointer-events-none">
              <div className="text-2xl font-black text-slate-800">{sla.compliance}%</div>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Success Rate</div>
            </div>
          </div>

          <div className="space-y-2.5 mt-4 pt-4 border-t text-xs font-bold">
            {sla.pieData.map((entry, index) => (
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

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Top Tests Bar Chart */}
        <div className="lg:col-span-8 bg-card border p-6 rounded-2xl shadow-sm h-[380px] flex flex-col">
          <div className="border-b pb-3 mb-4 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#006D6F]" /> Top Tests by Booking Volume
            </h3>
          </div>

          <div className="flex-1 min-h-0">
            {topTests.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
                No test booking data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTests} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} stroke="#94A3B8" interval={0} tick={{ width: 80 }} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#94A3B8" tickFormatter={v => `${v}`} />
<Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} formatter={((v: number) => [v, 'Bookings']) as any} />
                  <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Bar name="Total Bookings" dataKey="count" fill="#006D6F" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Alerts & Insights Panel */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#004B4D] to-[#006D6F] text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="text-[9px] font-black tracking-widest uppercase text-teal-300 bg-black/20 px-2 py-1 rounded w-max mb-4 flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-teal-300 rounded-full animate-pulse" /> Real-time Pulse
            </div>
            <h3 className="text-lg font-black text-white">Actionable Insights</h3>
            {insights.length > 0 ? (
              <p className="text-xs text-teal-100 leading-relaxed mt-2">{insights[0]}</p>
            ) : (
              <p className="text-xs text-teal-100 leading-relaxed mt-2">No insights available yet. Data will appear as bookings and reports are processed.</p>
            )}
          </div>

          <div className="space-y-3 my-6">
            {criticalAlerts.length === 0 && warningAlerts.length === 0 ? (
              <div className="bg-black/20 border border-white/10 rounded-xl p-3 text-xs font-bold flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-teal-300 shrink-0" />
                <span className="text-teal-200">All systems operating normally.</span>
              </div>
            ) : (
              [...criticalAlerts.slice(0, 1), ...warningAlerts.slice(0, 1)].map((alert, i) => (
                <div key={i} className="bg-black/20 border border-white/10 rounded-xl p-3 text-xs font-bold flex justify-between items-start gap-2">
                  <span className="text-teal-200 leading-snug">{alert.type}</span>
                  <span className={`shrink-0 text-white text-[9px] font-black px-1.5 rounded ${alert.severity === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}>
                    {alert.severity === 'critical' ? 'Critical' : 'Warning'}
                  </span>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => window.location.href = '/samples'}
            className="w-full py-3 bg-white text-[#006D6F] font-black rounded-xl shadow text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-1 uppercase"
          >
            Manage Sample Queue <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};