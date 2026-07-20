import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Building, 
  User,
  BadgePercent,
  Search,
  CreditCard,
  TrendingUp,
  FileText,
  CheckCircle2,
  X,
  Download,
  Scale,
  Building2
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAppSelector } from '../redux/hooks';

interface Settlement {
  id: string;
  franchiseName: string;
  period: string;
  revenue: number;
  commissionRate: number;
  gstRate: number; // 18%
  tdsRate: number; // 10%
  status: 'Pending' | 'Disbursed';
}

const INITIAL_SETTLEMENTS: Settlement[] = [
  { id: 'set-1', franchiseName: 'Delhi West Diagnostics', period: 'May 1 - May 15, 2026', revenue: 225000, commissionRate: 15, gstRate: 18, tdsRate: 10, status: 'Pending' },
  { id: 'set-2', franchiseName: 'Mumbai Central Lab', period: 'May 1 - May 15, 2026', revenue: 160000, commissionRate: 15, gstRate: 18, tdsRate: 10, status: 'Disbursed' },
  { id: 'set-3', franchiseName: 'Indore Diagnostics', period: 'May 1 - May 15, 2026', revenue: 145000, commissionRate: 15, gstRate: 18, tdsRate: 10, status: 'Pending' }
];

export const FranchisesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'settlements'>('directory');
  const [search, setSearch] = useState('');
  const [settlements, setSettlements] = useState<Settlement[]>(INITIAL_SETTLEMENTS);
  const bookings = useAppSelector(state => state.bookings.bookings);
  
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

useEffect(() => {
    setPageLoading(false);
  }, []);
  const dynamicFranchises: any[] = [];

  const filteredFranchises = dynamicFranchises.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.owner.toLowerCase().includes(search.toLowerCase()) ||
    f.location.toLowerCase().includes(search.toLowerCase())
  );

  // Calculation utility for settlement ledger
  const computePayout = (s: Settlement) => {
    const baseCommission = (s.revenue * s.commissionRate) / 100;
    const gst = (baseCommission * s.gstRate) / 100;
    const tds = (baseCommission * s.tdsRate) / 100;
    const netPayout = baseCommission + gst - tds;
    return { baseCommission, gst, tds, netPayout };
  };

  const handleDisburse = (id: string) => {
    setSettlements(prev => prev.map(s => s.id === id ? { ...s, status: 'Disbursed' } : s));
    setSelectedSettlement(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-7 w-7 text-[#006D6F]" /> B2B Franchise & Settlements Network
          </h1>
          <p className="text-sm text-muted-foreground">Assign tariff rates, generate GST settlement invoices, and disburse payouts to regional partners.</p>
        </div>
        
        <div className="flex bg-muted p-1 rounded-xl border select-none shrink-0">
          <button 
            onClick={() => setActiveTab('directory')}
            className={cn("px-4 py-2 text-xs font-black rounded-lg transition-all", activeTab === 'directory' ? "bg-card text-[#006D6F] shadow" : "text-muted-foreground hover:text-foreground")}
          >
            Partner Directory
          </button>
          <button 
            onClick={() => setActiveTab('settlements')}
            className={cn("px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1", activeTab === 'settlements' ? "bg-card text-[#006D6F] shadow" : "text-muted-foreground hover:text-foreground")}
          >
            <CreditCard className="h-3.5 w-3.5" /> Revenue Payouts
          </button>
        </div>
      </div>

{activeTab === 'directory' ? (
        <>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search local hub networks..."
              className="w-full pl-9 pr-4 py-2.5 border text-xs font-bold shadow-sm rounded-xl bg-card focus:ring-2 focus:ring-[#006D6F]/20 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {pageLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-card border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
                  <div className="p-6 flex-1 space-y-5">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-20" />
                        <div className="h-5 bg-muted rounded w-36" />
                      </div>
                      <div className="h-4 bg-muted rounded w-14" />
                    </div>
                    <div className="space-y-2 border-t pt-3">
                      <div className="h-3 bg-muted rounded w-40" />
                      <div className="h-3 bg-muted rounded w-32" />
                      <div className="h-6 bg-muted rounded w-36" />
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-muted/30 border-t grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <div className="h-2.5 bg-muted rounded w-20" />
                      <div className="h-5 bg-muted rounded w-16" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2.5 bg-muted rounded w-20" />
                      <div className="h-5 bg-muted rounded w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {dynamicFranchises.map(fr => (
              <motion.div 
                layout
                key={fr.id} 
                className="bg-card border border-border rounded-2xl shadow-sm hover:border-[#006D6F]/30 transition-all flex flex-col"
              >
                <div className="p-6 flex-1 space-y-5">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 border border-slate-200 rounded">
                        {fr.code}
                      </span>
                      <h3 className="font-bold text-base text-slate-800 mt-1.5 flex items-center gap-1">
                        <Building className="h-4 w-4 text-[#006D6F]" /> {fr.name}
                      </h3>
                    </div>
                    <span className="text-[8px] font-black px-2 py-0.5 border bg-emerald-50 text-emerald-700 border-emerald-200 rounded uppercase">
                      {fr.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground border-t pt-3">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <User className="h-3.5 w-3.5 text-[#006D6F]" /> Direct Owner: {fr.owner}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" /> {fr.location}
                    </div>
                    <div className="flex items-center gap-2 text-emerald-800 font-extrabold bg-emerald-50 border border-emerald-100 px-2 py-1 rounded w-fit text-[10px]">
                      <BadgePercent className="h-3.5 w-3.5 text-emerald-600" /> Commission Bracket: {fr.commissionRate}%
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 border-t grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-slate-400 font-bold text-[10px] uppercase">Gross Revenue</div>
                    <div className="font-black text-slate-800 text-sm mt-0.5">₹{fr.monthlyBusiness.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-bold text-[10px] uppercase">Patient Cases</div>
                    <div className="font-black text-slate-800 text-sm mt-0.5 flex items-center gap-1">
                      {fr.totalTests} <TrendingUp className="h-3 w-3 text-emerald-600" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
     </div>
          )}
        </>
      ) : (
      
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Franchise Partner</th>
                  <th className="px-6 py-4">Cycle Duration</th>
                  <th className="px-6 py-4 text-right">Cycle Volume</th>
                  <th className="px-6 py-4 text-right">Base (Comm.)</th>
                  <th className="px-6 py-4 text-right">GST (18%)</th>
                  <th className="px-6 py-4 text-right">TDS (10%)</th>
                  <th className="px-6 py-4 text-right font-black text-slate-800">Net Disbursal</th>
                  <th className="px-6 py-4">Log Action</th>
                </tr>
              </thead>
              <tbody className="divide-y font-bold text-slate-600">
                {settlements.map(s => {
                  const { baseCommission, gst, tds, netPayout } = computePayout(s);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-black text-slate-800">{s.franchiseName}</td>
                      <td className="px-6 py-4 text-slate-400">{s.period}</td>
                      <td className="px-6 py-4 text-right font-mono">₹{s.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-[#006D6F] font-mono">₹{baseCommission.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-emerald-600 font-mono">+₹{gst.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-rose-600 font-mono">-₹{tds.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-black text-slate-950 text-sm font-mono">₹{netPayout.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {s.status === 'Disbursed' ? (
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded uppercase inline-flex items-center gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Settled
                          </span>
                        ) : (
                          <button 
                            onClick={() => setSelectedSettlement(s)}
                            className="bg-[#006D6F] hover:bg-[#004B4D] text-white text-[9px] font-black px-2.5 py-1 rounded shadow flex items-center gap-1 uppercase tracking-wider transition-all"
                          >
                            <FileText className="h-3 w-3" /> Run Audit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GST COMPLIANCE SETTLEMENT INVOICE MODAL */}
      <AnimatePresence>
        {selectedSettlement && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSettlement(null)}
              className="fixed inset-0 bg-slate-950 z-[90] cursor-pointer backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-0 m-auto h-max max-w-xl w-full bg-background rounded-2xl border z-[100] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="bg-[#006D6F] text-white p-5 flex justify-between items-center border-b border-[#004B4D]">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-teal-100" />
                  <h3 className="text-base font-black tracking-tight uppercase">Taxation & GST Payout Invoice</h3>
                </div>
                <button onClick={() => setSelectedSettlement(null)} className="hover:bg-white/10 p-1 rounded text-teal-100"><X className="h-5 w-5" /></button>
              </div>

              {/* Interactive Simulated Invoice Sheet */}
              <div className="p-8 space-y-6 bg-white">
                <div className="flex justify-between border-b pb-4">
                  <div>
                    <h4 className="text-sm font-black text-[#006D6F]">MedsSeva Diagnostics Pvt Ltd</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold">GSTIN: 07AABCM3405N1ZS</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold bg-slate-100 px-2.5 py-0.5 rounded border inline-block font-mono">
                      INV-2026-{Math.floor(1000+Math.random()*9000)}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 font-bold">Generated: May 15, 2026</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Bill To Partner</span>
                  <div className="text-xs font-black text-slate-800">{selectedSettlement.franchiseName}</div>
                  <div className="text-[10px] text-slate-500 font-bold">Cycle Scope: {selectedSettlement.period}</div>
                </div>

                {/* Computation Grid */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-xs text-slate-600 space-y-3">
                  <div className="flex justify-between">
                    <span>Total Aggregated Bookings Revenue</span>
                    <span className="font-mono font-black text-slate-800">₹{selectedSettlement.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-[#006D6F] font-black">
                    <span>Franchise Commission Split ({selectedSettlement.commissionRate}%)</span>
                    <span className="font-mono">₹{computePayout(selectedSettlement).baseCommission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Add: Output GST @ 18%</span>
                    <span className="font-mono">+₹{computePayout(selectedSettlement).gst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Less: TDS Deductions (u/s 194J) @ 10%</span>
                    <span className="font-mono">-₹{computePayout(selectedSettlement).tds.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between border-t-2 border-dashed border-[#006D6F]/30 pt-3 text-base font-black text-slate-950">
                    <span>Net Payoff Amount</span>
                    <span className="font-mono text-[#006D6F]">₹{computePayout(selectedSettlement).netPayout.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-lg text-[10px] font-bold text-amber-800 flex gap-2">
                  <CreditCard className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span>Simulated Disbursal Wire: </span>
                    Funds will be processed directly into HDFC Current A/C ending in <strong>*9043</strong> through instant IMPS payload simulation.
                  </div>
                </div>

                {/* Form actions */}
                <div className="flex justify-end gap-2 pt-4 border-t -mx-8 -mb-8 px-8 py-4 bg-slate-50">
                  <button onClick={() => setSelectedSettlement(null)} className="px-4 py-2 text-xs border font-extrabold rounded">Cancel</button>
                  <button className="px-4 py-2 text-xs border font-extrabold rounded flex items-center gap-1.5 bg-white text-slate-700 hover:bg-slate-50">
                    <Download className="h-3.5 w-3.5" /> Save Invoice
                  </button>
                  <button 
                    onClick={() => handleDisburse(selectedSettlement.id)}
                    className="px-6 py-2 text-xs bg-[#006D6F] hover:bg-[#004B4D] text-white font-black rounded shadow flex items-center gap-1 uppercase"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve & Wire Funds
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
