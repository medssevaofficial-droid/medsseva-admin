import React, { useState, useEffect } from 'react';
import { usePaymentSummaryQuery, usePaymentsQuery, useRefundsQuery, useSettlementsQuery } from '@/hooks/useAdminQueries';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import {
  fetchSummary,
  fetchPayments,
  fetchRefunds,
  fetchSettlements,
  submitRefundRequest,
  approveRefundThunk,
  processSettlementThunk,
} from '../redux/slices/financeSlice';
import {
  Clock,
  Receipt,
  Briefcase,
  RefreshCcw,
  ArrowUpRight,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useToast } from '../components/Toast';

export const PaymentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { summary, payments, refunds, settlements, loading } = useAppSelector(state => state.finance);
  const [activeTab, setActiveTab] = useState<'ledger' | 'settlements' | 'refunds'>('ledger');
  const { success, error: toastError } = useToast();

  const [refundModal, setRefundModal] = useState<{ open: boolean; paymentId: string; maxAmount: number; bookingCode: string } | null>(null);
  const [refundForm, setRefundForm] = useState({ amount: '', reason: '', approvalNotes: '' });
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  const [settlementSubmitting, setSettlementSubmitting] = useState<string | null>(null);

 usePaymentSummaryQuery();
  usePaymentsQuery({});
  useRefundsQuery(undefined);
  useSettlementsQuery(undefined);

usePaymentSummaryQuery();
  usePaymentsQuery({});
  useRefundsQuery(undefined);
  useSettlementsQuery(undefined);

  const handleOpenRefundModal = (paymentId: string, amount: number, bookingCode: string) => {
    setRefundForm({ amount: String(amount), reason: '', approvalNotes: '' });
    setRefundModal({ open: true, paymentId, maxAmount: amount, bookingCode });
  };

  const handleSubmitRefund = async () => {
    if (!refundModal) return;
    const amt = parseFloat(refundForm.amount);
    if (!refundForm.reason.trim()) { toastError('Refund reason is required.'); return; }
    if (!amt || amt <= 0 || amt > refundModal.maxAmount) { toastError(`Amount must be between ₹1 and ₹${refundModal.maxAmount}.`); return; }

    setRefundSubmitting(true);
    const result = await dispatch(submitRefundRequest({
      paymentId: refundModal.paymentId,
      amount: amt,
      reason: refundForm.reason.trim(),
      approvalNotes: refundForm.approvalNotes.trim() || undefined,
    }));

    if (submitRefundRequest.fulfilled.match(result)) {
      success('Refund request submitted successfully. Pending approval.');
      setRefundModal(null);
      dispatch(fetchPayments({}));
      dispatch(fetchRefunds(undefined));
    } else {
      toastError(result.payload as string || 'Failed to submit refund');
    }
    setRefundSubmitting(false);
  };

  const handleApproveRefund = async (id: string) => {
    const result = await dispatch(approveRefundThunk(id));
    if (approveRefundThunk.fulfilled.match(result)) {
      success('Refund approved and processed via gateway.');
      dispatch(fetchRefunds(undefined));
      dispatch(fetchSummary());
    } else {
      toastError(result.payload as string || 'Failed to approve refund');
    }
  };

  const handlePaySettlement = async (id: string) => {
    setSettlementSubmitting(id);
    const result = await dispatch(processSettlementThunk(id));
    if (processSettlementThunk.fulfilled.match(result)) {
      success('Settlement processed. Payout initiated.');
      dispatch(fetchSummary());
    } else {
      toastError(result.payload as string || 'Failed to process settlement');
    }
    setSettlementSubmitting(null);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      CAPTURED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      REFUNDED: 'bg-rose-50 text-rose-700 border-rose-200',
      PARTIALLY_REFUNDED: 'bg-orange-50 text-orange-700 border-orange-200',
      FAILED: 'bg-red-50 text-red-700 border-red-200',
      COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
      APPROVED: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return map[status] || 'bg-muted text-foreground border-border';
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Financial Ledger & Settlements</h1>
          <p className="text-sm text-muted-foreground">Enterprise payment management, franchise commissions, and audit gateway.</p>
        </div>
      </div>
<div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {loading && !summary ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4 animate-pulse">
                <div className="h-12 w-12 bg-muted rounded-xl shrink-0" />
                <div className="space-y-2">
                  <div className="h-2.5 bg-muted rounded w-28" />
                  <div className="h-7 bg-muted rounded w-20" />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Invoiced Assets</div>
                <div className="text-2xl font-black text-foreground mt-0.5">₹{(summary?.totalCollected || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Payments</div>
                <div className="text-2xl font-black text-foreground mt-0.5">₹{(summary?.totalPending || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Commission Liabilities</div>
                <div className="text-2xl font-black text-foreground mt-0.5">₹{(summary?.pendingSettlements || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center justify-center">
                <RefreshCcw className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Processed Reversals</div>
                <div className="text-2xl font-black text-foreground mt-0.5">₹{(summary?.totalRefunded || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex gap-1.5 border-b border-border">
        <button
          onClick={() => setActiveTab('ledger')}
          className={cn("px-5 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5",
            activeTab === 'ledger' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
        >
          <Receipt className="h-3.5 w-3.5" /> Cash & Online Ledger
        </button>
        <button
          onClick={() => setActiveTab('settlements')}
          className={cn("px-5 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5",
            activeTab === 'settlements' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
        >
          <Briefcase className="h-3.5 w-3.5" /> Partner Settlements
        </button>
        <button
          onClick={() => setActiveTab('refunds')}
          className={cn("px-5 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5",
            activeTab === 'refunds' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
        >
          <RefreshCcw className="h-3.5 w-3.5" /> Reversal Logs
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
    {loading && (
          <div className="overflow-x-auto animate-pulse">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                    <th key={i} className="px-6 py-4">
                      <div className="h-2.5 bg-muted rounded w-16" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-3 bg-muted rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-3 bg-muted rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-3 bg-muted rounded w-28" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-muted rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-3 bg-muted rounded w-14" /></td>
                    <td className="px-6 py-4"><div className="h-3 bg-muted rounded w-28" /></td>
                    <td className="px-6 py-4 text-center"><div className="h-5 bg-muted rounded-full w-20 mx-auto" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-3 bg-muted rounded w-16 ml-auto" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-3 bg-muted rounded w-16 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && activeTab === 'ledger' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold text-[10px] uppercase">
                <tr>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Booking Ref</th>
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Gateway</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.length === 0 && (
                  <tr><td colSpan={9} className="px-6 py-10 text-center text-xs text-muted-foreground">No payment records found.</td></tr>
                )}
                {payments.map(tx => (
                  <tr key={tx.id} className="hover:bg-muted/10">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-foreground">{tx.invoiceNumber || '—'}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{tx.booking?.bookingCode || tx.bookingId}</td>
                    <td className="px-6 py-4 text-muted-foreground">{tx.booking?.patientName || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="bg-muted text-foreground text-[10px] font-extrabold px-1.5 py-0.5 border rounded uppercase">{tx.gateway}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground uppercase">{tx.method || '—'}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {tx.paidAt ? new Date(tx.paidAt).toLocaleString() : new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn("text-[10px] font-bold px-2.5 py-0.5 border rounded-full inline-block", statusBadge(tx.status))}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-foreground">₹{tx.amount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right">
                      {tx.status === 'CAPTURED' && (
                        <button
                          onClick={() => handleOpenRefundModal(tx.id, tx.amount, tx.booking?.bookingCode || tx.bookingId)}
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

        {!loading && activeTab === 'settlements' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold text-[10px] uppercase">
                <tr>
                  <th className="px-6 py-4">Settlement Ref</th>
                  <th className="px-6 py-4">Franchise Office</th>
                  <th className="px-6 py-4">Statement Cycle</th>
                  <th className="px-6 py-4 text-right">Gross Business</th>
                  <th className="px-6 py-4 text-right">Commission</th>
                  <th className="px-6 py-4 text-right">Net Payable</th>
                  <th className="px-6 py-4 text-center">Payment Status</th>
                  <th className="px-6 py-4 text-right">Disbursement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {settlements.length === 0 && (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-xs text-muted-foreground">No settlement records found.</td></tr>
                )}
                {settlements.map(set => (
                  <tr key={set.id} className="hover:bg-muted/10">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-foreground">{set.settlementRef}</td>
                    <td className="px-6 py-4 font-bold text-foreground">{set.franchiseName}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">{set.period}</td>
                    <td className="px-6 py-4 text-right text-foreground font-medium">₹{set.totalBusiness.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-700">₹{set.commissionAmount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right font-bold text-foreground">₹{set.netPayable.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 border rounded-full inline-block", statusBadge(set.status))}>
                        {set.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {set.status === 'PENDING' ? (
                        <button
                          onClick={() => handlePaySettlement(set.id)}
                          disabled={settlementSubmitting === set.id}
                          className="px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ml-auto"
                        >
                          {settlementSubmitting === set.id && <Loader2 className="h-3 w-3 animate-spin" />}
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

        {!loading && activeTab === 'refunds' && (
          <div className="p-6">
            {refunds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs border border-dashed border-border rounded-lg">
                No financial reversals have been recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {refunds.map(ref => (
                  <div key={ref.id} className="border border-border bg-card p-4 rounded-xl shadow-sm flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">
                          {ref.payment?.booking?.bookingCode || ref.bookingId}
                        </span>
                        <span className={cn("text-[9px] font-black uppercase px-1.5 rounded border", statusBadge(ref.status))}>
                          {ref.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Reason: "{ref.reason}"</p>
                      {ref.approvalNotes && (
                        <p className="text-xs text-muted-foreground">Notes: "{ref.approvalNotes}"</p>
                      )}
                      <div className="text-[10px] text-muted-foreground pt-1">
                        Requested: {new Date(ref.createdAt).toLocaleString()}
                      </div>
                      {ref.processedAt && (
                        <div className="text-[10px] text-muted-foreground">
                          Processed: {new Date(ref.processedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-lg font-black text-rose-600">-₹{ref.amount.toLocaleString('en-IN')}</div>
                      {ref.status === 'PENDING' && (
                        <button
                          onClick={() => handleApproveRefund(ref.id)}
                          className="px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-[10px] font-black uppercase tracking-wider"
                        >
                          Approve & Process
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {refundModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 mx-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-foreground">Initiate Refund</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Booking: {refundModal.bookingCode}</p>
              </div>
              <button onClick={() => setRefundModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Refund Amount (₹) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  value={refundForm.amount}
                  onChange={e => setRefundForm(f => ({ ...f, amount: e.target.value }))}
                  max={refundModal.maxAmount}
                  min={1}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={`Max ₹${refundModal.maxAmount}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Refund Reason <span className="text-rose-500">*</span></label>
                <textarea
                  value={refundForm.reason}
                  onChange={e => setRefundForm(f => ({ ...f, reason: e.target.value }))}
                  rows={3}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="State the reason for this refund..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Approval Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea
                  value={refundForm.approvalNotes}
                  onChange={e => setRefundForm(f => ({ ...f, approvalNotes: e.target.value }))}
                  rows={2}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Internal notes for audit..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setRefundModal(null)}
                className="flex-1 border border-border rounded-lg py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRefund}
                disabled={refundSubmitting}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg py-2 text-sm font-black disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {refundSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};