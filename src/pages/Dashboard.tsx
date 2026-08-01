import React, { useState, useMemo } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useBookingsQuery } from '@/hooks/useAdminQueries';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { analyticsService, auditService } from '@/services/api';
import {
  TrendingUp,
  Calendar,
  FileCheck2,
  AlertCircle,
  ChevronRight,
  Activity,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
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
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

const PERIOD_OPTIONS = [
  { value: 'weekly', label: 'Weekly View' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const CATEGORY_COLORS = ['#0F766E', '#0D9488', '#14B8A6', '#2DD4BF', '#059669', '#34D399', '#6366F1', '#8B5CF6', '#F59E0B', '#EF4444'];

const STALE = 2 * 60 * 1000;
const GC = 5 * 60 * 1000;

export const DashboardPage: React.FC = () => {
  const { user, currentCityId, currentBranchId } = useAppSelector(state => state.auth);
const [period, setPeriod] = useState<string>('weekly');
  const navigate = useNavigate();

  useBookingsQuery();
  const { bookings } = useAppSelector(state => state.bookings);

  const analyticsQuery = useQuery({
    queryKey: ['dashboardAnalytics', period],
    queryFn: () => analyticsService.getDashboard({ period }),
    staleTime: STALE,
    gcTime: GC,
    refetchInterval: 3 * 60 * 1000,
  });

  const activityQuery = useQuery({
    queryKey: ['dashboardActivity'],
    queryFn: () => auditService.getAuditLogs({ limit: 12, page: 1 }),
    staleTime: 60 * 1000,
    gcTime: GC,
    refetchInterval: 60 * 1000,
  });

  const analytics = analyticsQuery.data;
  const isAnalyticsLoading = analyticsQuery.isLoading;

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (user?.role === 'franchise_admin' && b.franchiseId !== user.franchiseId) return false;
      if (user?.role === 'phlebotomist' && b.phlebotomistId !== user.id) return false;
      if (currentCityId && currentCityId !== 'all' && b.cityId !== currentCityId) return false;
      if (currentBranchId && currentBranchId !== 'all' && b.branchId !== currentBranchId) return false;
      return true;
    });
  }, [bookings, user, currentCityId, currentBranchId]);

  const recentBookings = useMemo(() => filteredBookings.slice(0, 3), [filteredBookings]);

  const categoryDistribution = useMemo(() => {
    const raw: { name: string; count: number }[] = analytics?.categoryDistribution || [];
    return raw
      .filter(c => c.count > 0)
      .map((c, idx) => ({ ...c, color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }));
  }, [analytics]);

  const revenueChartData = useMemo(() => analytics?.revenueChart || [], [analytics]);

  const activityFeed = useMemo(() => {
    const logs = activityQuery.data?.data || analytics?.activityFeed || [];
    return logs.slice(0, 12);
  }, [activityQuery.data, analytics]);

  const isLoading = isAnalyticsLoading && !analytics;

  if (isLoading) return <DashboardSkeleton />;

  const kpis = analytics?.kpis;
  const trends = analytics?.trends;

  const renderRoleHeader = () => {
    const roleLabels: Record<string, string> = {
      super_admin: 'Global SaaS Platform Analytics',
      franchise_admin: 'Franchise Performance & Invoices',
      lab_staff: 'Central Laboratory Workspace Queue',
      doctor: 'Clinical Review & Approvals',
      phlebotomist: "Today's Home Collection Route",
      technician: 'Pathology Lab Testing Desk',
    };

    return (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary select-none mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Operations Sync Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {roleLabels[user?.role || 'super_admin']}, Ready for clinical workflow.
          </p>
        </div>
 <div className="flex items-center gap-2 text-muted-foreground select-none self-start md:self-auto">
          <Calendar className="w-3.5 h-3.5 opacity-50" />
          <span className="text-xs font-medium tracking-wide text-muted-foreground">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    );
  };

  const renderTrendBadge = (trend: number | null | undefined) => {
    if (trend === null || trend === undefined) return null;
    const isUp = trend >= 0;
    return (
      <span
        className={cn(
          'flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-medium',
          isUp ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'
        )}
      >
        {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        {Math.abs(trend)}%
      </span>
    );
  };

  const renderStatsWidgets = () => {
    const isSuper = user?.role === 'super_admin';
    const isLab = user?.role === 'lab_staff' || user?.role === 'technician';

    const pendingCount = kpis?.todayPendingCount ?? 0;

    const stats = [
      {
        title: isSuper ? 'Aggregated Revenue' : isLab ? 'Awaiting Sample' : 'Franchise Revenue',
        value: isLab
          ? `${kpis?.pendingSampleCollections ?? 0} Cases`
          : `₹${(kpis?.periodRevenue ?? kpis?.totalRevenue ?? 0).toLocaleString('en-IN')}`,
        trend: trends?.revenue,
        icon: isSuper ? ShoppingBag : Calendar,
      },
      {
        title: isSuper ? 'Global Bookings' : isLab ? 'Ready for Test' : 'Total Cases',
        value: `${kpis?.periodBookings ?? kpis?.totalBookings ?? 0} Bookings`,
        trend: trends?.bookings,
        icon: TrendingUp,
      },
      {
        title: isLab ? 'Under QC Check' : 'Reports Delivered',
        value: isLab
          ? `${kpis?.pendingReports ?? 0} Reports`
          : `${kpis?.completedReports ?? 0} Cases`,
        trend: trends?.completedReports,
        icon: FileCheck2,
      },
      {
        title: 'Pending Cases',
        value: `${pendingCount} Active`,
        trend: trends?.pendingCases,
        icon: AlertCircle,
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3.5">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {stat.title}
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
                {renderTrendBadge(stat.trend)}
                {stat.trend !== null && stat.trend !== undefined && (
                  <span className="text-muted-foreground">vs previous period</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

const statusColors: Record<string, string> = {
    Pending: 'bg-warning/10 text-warning border-warning/20',
    Confirmed: 'bg-primary/10 text-primary border-primary/20',
    Assigned: 'bg-teal-600/10 text-teal-700 border-teal-600/20',
    Collected: 'bg-cyan-600/10 text-cyan-700 border-cyan-600/20',
    Processing: 'bg-indigo-600/10 text-indigo-700 border-indigo-600/20',
    Completed: 'bg-success/10 text-success border-success/20',
    Approved: 'bg-success/10 text-success border-success/20',
    Cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
    'WAITING_FOR_PARTNER': 'bg-orange-500/10 text-orange-600 border-orange-400/20',
    'WAITING_FOR_ASSIGNMENT': 'bg-yellow-500/10 text-yellow-600 border-yellow-400/20',
    'PATIENT_REACHED_LAB': 'bg-blue-500/10 text-blue-600 border-blue-400/20',
    'ON_THE_WAY': 'bg-sky-500/10 text-sky-600 border-sky-400/20',
    'REACHED_LOCATION': 'bg-cyan-500/10 text-cyan-600 border-cyan-400/20',
    'DELIVERED_TO_LAB': 'bg-violet-500/10 text-violet-600 border-violet-400/20',
    'SAMPLE_COLLECTED': 'bg-cyan-600/10 text-cyan-700 border-cyan-600/20',
    'REPORT_READY': 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20',
  };

  return (
    <div className="w-full">
      {renderRoleHeader()}
      {renderStatsWidgets()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-[400px]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-foreground">Diagnostics Volume Tracker</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Interactive daily test metrics analytics</p>
            </div>
            <select
              className="bg-muted/50 border-none rounded-xl text-xs font-semibold text-foreground px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary/30"
              value={period}
              onChange={e => setPeriod(e.target.value)}
            >
              {PERIOD_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-h-0 -ml-3">
            {revenueChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No revenue data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8ECEF" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#667085', fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#667085', fontWeight: 500 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                    labelStyle={{ fontWeight: 600, color: '#1A1A1A' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    name="Revenue (₹)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-[400px]"
        >
          <div className="mb-6">
            <h3 className="text-base font-bold text-foreground">Category Distribution</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Top performing clinical segments</p>
          </div>

          {categoryDistribution.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              No category data available
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryDistribution} layout="vertical" barSize={24}>
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#1A1A1A', fontWeight: 600 }}
                      width={80}
                    />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="border-t border-border/50 pt-4 mt-4 space-y-2.5 text-xs font-medium">
                {categoryDistribution.map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span>{c.name} Tests</span>
                    </div>
                    <span className="text-foreground font-bold">{c.count} units</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-foreground">Recent Booking Ingress</h3>
          <button
              onClick={() => navigate('/bookings')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              View All Queues <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentBookings.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">No recent bookings</div>
            ) : (
              <table className="w-full text-left text-sm font-medium select-none">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 font-bold">Patient</th>
                    <th className="pb-3 font-bold">Tests Ordered</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 text-right font-bold">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-foreground">
                  {recentBookings.map(book => {
                    const testNames = [
                      ...book.tests.map((t: any) => t.code),
                      ...book.packages.map((p: any) => p.code),
                    ].join(', ');

                    return (
                      <tr key={book.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="py-3.5 pr-3">
                          <p className="font-bold text-sm tracking-tight text-foreground">
                            {book.patient.name}
                          </p>
                          <p className="text-xs text-muted-foreground tracking-wide mt-0.5">
                            Code: {book.bookingCode}
                          </p>
                        </td>
                        <td className="py-3.5 pr-3 text-muted-foreground text-xs max-w-[150px] truncate">
                          {testNames}
                        </td>
                        <td className="py-3.5 pr-3">
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border tracking-wider leading-none',
                              statusColors[book.status] || 'bg-muted text-muted-foreground border-border'
                            )}
                          >
                            {book.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-extrabold text-sm">
                          ₹{book.totalAmount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5 flex-shrink-0">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              Live System Operations
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm">
            {activityQuery.isLoading && activityFeed.length === 0 ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-muted/60 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-muted/50 rounded w-full" />
                      <div className="h-2 bg-muted/30 rounded w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activityFeed.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No recent activity
              </div>
            ) : (
              activityFeed.map((log: any) => {
                const isAlert = log.severity === 'CRITICAL' || log.severity === 'HIGH';
                const timeAgo = formatTimeAgo(log.createdAt);
                const tag = log.module || 'System';

                return (
                  <div key={log.id} className="flex items-start gap-3 select-none">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                        isAlert ? 'bg-destructive' : 'bg-primary/60'
                      )}
                    />
                    <div className="flex-1">
                      <p
                        className={cn(
                          'text-xs leading-relaxed font-medium',
                          isAlert ? 'text-destructive font-bold' : 'text-foreground'
                        )}
                      >
                        {formatActivityText(log)}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <span>{tag}</span>
                        <span>•</span>
                        <span>{timeAgo}</span>
                        {log.actor && (
                          <>
                            <span>•</span>
                            <span>{log.actor}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function formatActivityText(log: any): string {
  const entity = log.entityType ? `${log.entityType}` : '';
  const id = log.entityId ? ` #${log.entityId.slice(-6).toUpperCase()}` : '';
  const action = log.action
    ? log.action
        .split('_')
        .map((w: string) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(' ')
    : 'Action';
  return `${action}${entity ? ` — ${entity}${id}` : ''}`;
}

function formatTimeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const DashboardSkeleton: React.FC = () => (
  <div className="w-full animate-pulse">
    <div className="h-8 bg-muted/70 rounded-lg w-48 mb-2" />
    <div className="h-4 bg-muted/40 rounded-lg w-72 mb-8" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-32 bg-muted/30 rounded-2xl border border-border" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div className="lg:col-span-2 h-[400px] bg-muted/30 rounded-2xl border border-border" />
      <div className="h-[400px] bg-muted/30 rounded-2xl border border-border" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-[240px] bg-muted/30 rounded-2xl border border-border" />
      <div className="h-[240px] bg-muted/30 rounded-2xl border border-border" />
    </div>
  </div>
);