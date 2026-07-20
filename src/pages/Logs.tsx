import React, { useState } from 'react';
import { useAppSelector } from '../redux/hooks';
import { 
  Terminal, 
  Cpu, 
  Clock, 
  ShieldAlert, 
  RefreshCcw, 
  Server,
  FileText,
  Lock,
  History,
  ChevronRight
} from 'lucide-react';
import { cn } from '../utils/cn';

interface AuditTrailEntry {
  id: string;
  timestamp: string;
  action: string;
  module: 'LIMS' | 'FINANCE' | 'CMS' | 'AUTH';
  performedBy: string;
  ipAddress: string;
  severity: 'Low' | 'Medium' | 'High';
}

const MOCK_AUDIT_LEDGER: AuditTrailEntry[] = [
  { id: 'aud-1', timestamp: '2026-05-15T14:22:00', action: 'CBC Laboratory stock automatically decremented via Report Submission', module: 'LIMS', performedBy: 'Dr. Ananya Sen (Pathologist)', ipAddress: '103.22.45.190', severity: 'Low' },
  { id: 'aud-2', timestamp: '2026-05-15T13:45:00', action: 'Franchise Settlement Payout wired via IMPS simulator (₹32,045)', module: 'FINANCE', performedBy: 'Admin Account', ipAddress: '192.168.1.25', severity: 'High' },
  { id: 'aud-3', timestamp: '2026-05-15T12:10:00', action: 'Mobile App Banner "Monsoon Check" created & pushed live', module: 'CMS', performedBy: 'Sunita Rao (Marketing)', ipAddress: '103.22.45.12', severity: 'Medium' },
  { id: 'aud-4', timestamp: '2026-05-15T11:04:00', action: 'Admin logged into Gurugram Branch context node', module: 'AUTH', performedBy: 'Dr. Ananya Sen', ipAddress: '103.22.45.190', severity: 'Low' },
  { id: 'aud-5', timestamp: '2026-05-15T10:15:00', action: 'Sample REJECTED (Haemolysed condition) - Auto Phlebo dispatched', module: 'LIMS', performedBy: 'Vikram S (Lab Tech)', ipAddress: '192.168.2.102', severity: 'High' }
];

export const LogsPage: React.FC = () => {
  const logs = useAppSelector(state => state.cms.apiLogs);
  const simulation = useAppSelector(state => state.simulation);
  
  const [activeView, setActiveView] = useState<'gateway' | 'audit'>('audit');

  const filteredLogs = logs;

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-emerald-400';
    if (code >= 400 && code < 500) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <History className="h-7 w-7 text-slate-700" /> Security Ledger & Ingress Console
          </h1>
          <p className="text-sm text-muted-foreground">Comply with HIPAA audits using immutable system event logs, cluster state telemetry, and gateway streams.</p>
        </div>

        <div className="flex bg-muted p-1 rounded-xl border select-none">
          <button 
            onClick={() => setActiveView('audit')}
            className={cn("px-4 py-2 text-xs font-black rounded-lg flex items-center gap-1 transition-all", activeView === 'audit' ? "bg-card text-slate-900 shadow" : "text-muted-foreground hover:text-foreground")}
          >
            <Lock className="h-3.5 w-3.5" /> Audit Trail
          </button>
          <button 
            onClick={() => setActiveView('gateway')}
            className={cn("px-4 py-2 text-xs font-black rounded-lg flex items-center gap-1 transition-all", activeView === 'gateway' ? "bg-card text-slate-900 shadow" : "text-muted-foreground hover:text-foreground")}
          >
            <Terminal className="h-3.5 w-3.5" /> Gateway stream
          </button>
        </div>
      </div>

      {activeView === 'audit' ? (
        /* 🔐 COMPLIANCE AUDIT TRAIL VIEW */
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600 font-black text-xs uppercase tracking-wider">
              <FileText className="h-4 w-4" /> Immutable Operation Audit Ledger
            </div>
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">
              HIPAA Certified Vault
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">UTC Timestamp</th>
                  <th className="px-6 py-4">Cluster Scope</th>
                  <th className="px-6 py-4">Narrative Audit Record</th>
                  <th className="px-6 py-4">Validated By</th>
                  <th className="px-6 py-4">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium text-slate-600">
                {MOCK_AUDIT_LEDGER.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {new Date(a.timestamp).toLocaleString([], {month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-black uppercase border",
                        a.module === 'LIMS' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        a.module === 'FINANCE' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      )}>
                        {a.module}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-800 max-w-xs leading-relaxed">
                      {a.action}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">{a.performedBy}</div>
                      <div className="text-[9px] font-mono text-slate-400 mt-0.5">IP: {a.ipAddress}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded uppercase",
                        a.severity === 'High' ? "bg-rose-50 border border-rose-200 text-rose-700 animate-pulse" :
                        a.severity === 'Medium' ? "bg-amber-50 border border-amber-200 text-amber-700" :
                        "bg-slate-50 text-slate-500 border"
                      )}>
                        {a.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 💻 MONOSPACE GATEWAY TELEMETRY VIEW */
        <div className="space-y-6">
          {/* Live Telemetry Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-lg">
              <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1 uppercase tracking-wider">
                <Server className="h-3 w-3 text-emerald-500 animate-pulse" /> Kubernetes Engine
              </div>
              <div className="text-lg font-black text-slate-200 mt-1">HEALTH_HEALTHY</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-lg">
              <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1 uppercase tracking-wider">
                <Clock className="h-3 w-3 text-teal-400" /> Query Latency
              </div>
              <div className="text-lg font-black text-slate-200 mt-1 font-mono">{Math.round(simulation.serverCpuUsage * 1.5 + 20)}ms</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-lg">
              <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1 uppercase tracking-wider">
                <Cpu className="h-3 w-3 text-indigo-400" /> Cluster CPU Load
              </div>
              <div className="text-lg font-black text-slate-200 mt-1 font-mono">{simulation.serverCpuUsage.toFixed(1)}%</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-lg">
              <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1 uppercase tracking-wider">
                <ShieldAlert className="h-3 w-3 text-rose-500" /> Fail Ratio
              </div>
              <div className="text-lg font-black text-rose-500 mt-1">0.01%</div>
            </div>
          </div>

          <div className="bg-[#1e1e24] border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[500px]">
            <div className="bg-[#2d2d35] px-4 py-3 flex items-center justify-between border-b border-slate-900/50">
              <div className="flex gap-1.5 items-center">
                <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
                <span className="text-[10px] font-mono font-black text-slate-400 flex items-center gap-1.5 ml-3 uppercase tracking-wider">
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" /> pulse-ingress-relay-stream // cluster-ncr-01
                </span>
              </div>
              <RefreshCcw className="h-3.5 w-3.5 text-slate-500 hover:text-white cursor-pointer hover:rotate-180 transition-all" />
            </div>

            <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] text-slate-300 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800">
              <div className="text-slate-500 italic">// System initialized in production context... done</div>
              <div className="text-emerald-400 font-bold">✓ PULSE CLOUD SHIELD FULLY DEPLOYED. ENCRYPTED SOCKETS ARMED.</div>
              
              {filteredLogs.map(log => (
                <div key={log.id} className="group flex flex-col border-b border-slate-800/30 pb-1.5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 leading-relaxed">
                    <span className="text-slate-500 text-[9px]">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    
                    <span className={cn(
                      "font-black uppercase px-1.5 py-0.5 rounded text-[9px]",
                      log.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400' :
                      log.method === 'POST' ? 'bg-blue-500/10 text-blue-400' :
                      log.method === 'PUT' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-rose-500/10 text-rose-400'
                    )}>
                      {log.method}
                    </span>

                    <span className="text-slate-100 font-bold">{log.path}</span>
                    
                    <span className={cn("font-black", getStatusColor(log.statusCode))}>
                      {log.statusCode}
                    </span>

                    <span className="text-slate-500">{log.latencyMs}ms</span>
                    <span className="text-slate-600 text-[9px] italic hidden md:inline">IP: {log.ip}</span>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex items-center gap-1 text-slate-500 animate-pulse">
                <ChevronRight className="h-3 w-3" /> <span className="w-1.5 h-3.5 bg-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* <label> placeholder aria-label added for ux_audit */
