import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { processSettlement, initiateRefund } from '../redux/slices/financeSlice';
import { Refund } from '../types';
import { 
  Clock, 
  Receipt, 
  Briefcase, 
  RefreshCcw,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '../utils/cn';
import { PaymentButton } from '../components/PaymentButton';

export const PaymentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { transactions, settlements, refunds } = useAppSelector(state => state.finance);
  
  const [activeTab, setActiveTab] = useState<'ledger' | 'settlements' | 'refunds'>('ledger');

  const totalCollected = transactions
    .filter(t => t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPendingSettlements = settlements
    .filter(s => s.status === 'Pending')
    .reduce((sum, s) => sum + s.commissionAmount, 0);

  const handlePaySettlement = (id: string) => {
    if (window.confirm('Authorize automated payout settlement for this franchise partner?')) {
      dispatch(processSettlement(id));
      alert('Settlement processed successfully. Payout initiated.');
    }
  };

  const handleTriggerRefund = (bookingCode: string, amount: number) => {
    const reason = prompt('Please state reason for refund:');
    if (!reason) return;

    const newRefund: Refund = {
      id: `ref-${Date.now()}`,
      bookingCode,
      amount,
      reason,
      status: 'Processed',
      date: new Date().toISOString()
    };

    dispatch(initiateRefund(newRefund));
    alert('Transaction successfully reversed. Refund processed to original gateway.');
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Financial Ledger & Settlements</h1>
          <p className="text-sm text-muted-foreground">Simulate accounting streams, calculate franchise commissions, and audit gateways.</p>
        </div>
        <div>
          <PaymentButton amount={500} />
        </div>
      </div>

      {/* KPI Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center justify-center">
            <ArrowUpRight className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Invoiced Assets</div>
            <div className="text-2xl font-black text-foreground mt-0.5">₹{totalCollected.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Commission Liabilities</div>
            <div className="text-2xl font-black text-foreground mt-0.5">₹{totalPendingSettlements.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center justify-center">
            <RefreshCcw className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Processed Reversals</div>
            <div className="text-2xl font-black text-foreground mt-0.5">
              ₹{refunds.reduce((s, r) => s + r.amount, 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-1.5 border-b border-border">
        <button
          onClick={() => setActiveTab('ledger')}
          className={cn(
            "px-5 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5",
            activeTab === 'ledger' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Receipt className="h-3.5 w-3.5" /> Cash & Online Ledger
        </button>
        <button
          onClick={() => setActiveTab('settlements')}
          className={cn(
            "px-5 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5",
            activeTab === 'settlements' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Briefcase className="h-3.5 w-3.5" /> Partner Settlements
        </button>
        <button
          onClick={() => setActiveTab('refunds')}
          className={cn(
            "px-5 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5",
            activeTab === 'refunds' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <RefreshCcw className="h-3.5 w-3.5" /> Reversal Logs
        </button>
      </div>

      {/* Content Panels */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {activeTab === 'ledger' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold text-[10px] uppercase">
                <tr>
                  <th className="px-6 py-4">Tx Reference</th>
                  <th className="px-6 py-4">Booking Ref</th>
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Gateway</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Value</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-muted/10">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-foreground">{tx.id}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{tx.bookingCode}</td>
                    <td className="px-6 py-4 text-muted-foreground">{tx.patientName}</td>
                    <td className="px-6 py-4">
                      <span className="bg-muted text-foreground text-[10px] font-extrabold px-1.5 py-0.5 border rounded uppercase">
                        {tx.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-0.5 border rounded-full inline-block",
                        tx.status === 'Paid' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        tx.status === 'Refunded' ? "bg-rose-50 text-rose-700 border-rose-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-foreground">₹{tx.amount}</td>
                    <td className="px-6 py-4 text-right">
                      {tx.status === 'Paid' && (
                        <button
                          onClick={() => handleTriggerRefund(tx.bookingCode, tx.amount)}
                          className="text-rose-600 hover:text-rose-800 text-[11px] font-bold hover:underline"
                        >
                          Reverse/Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'settlements' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold text-[10px] uppercase">
                <tr>
                  <th className="px-6 py-4">Franchise Office</th>
                  <th className="px-6 py-4">Statement Cycle</th>
                  <th className="px-6 py-4 text-right">Gross Business</th>
                  <th className="px-6 py-4 text-right">Commission Tariffs</th>
                  <th className="px-6 py-4 text-center">Payment Status</th>
                  <th className="px-6 py-4 text-right">Disbursement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {settlements.map(set => (
                  <tr key={set.id} className="hover:bg-muted/10">
                    <td className="px-6 py-4 font-bold text-foreground">{set.franchiseName}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">{set.period}</td>
                    <td className="px-6 py-4 text-right text-foreground font-medium">₹{set.totalBusiness.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-700">₹{set.commissionAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 border rounded-full inline-block",
                        set.status === 'Paid' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {set.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {set.status === 'Pending' ? (
                        <button
                          onClick={() => handlePaySettlement(set.id)}
                          className="px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-[10px] font-black uppercase tracking-wider"
                        >
                          Release Fund
                        </button>
                      ) : (
                        <div className="text-[10px] text-muted-foreground">
                          Settled {set.processedAt && new Date(set.processedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'refunds' && (
          <div className="p-6">
            {refunds.length > 0 ? (
              <div className="space-y-4">
                {refunds.map(ref => (
                  <div key={ref.id} className="border border-border bg-card p-4 rounded-xl shadow-sm flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{ref.bookingCode}</span>
                        <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[9px] font-black uppercase px-1.5 rounded">Processed</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Reason: "{ref.reason}"</p>
                      <div className="text-[10px] text-muted-foreground pt-1">Logged: {new Date(ref.date).toLocaleString()}</div>
                    </div>
                    <div className="text-lg font-black text-rose-600">-₹{ref.amount}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-xs border border-dashed border-border rounded-lg">
                No financial reversals have been recorded yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
