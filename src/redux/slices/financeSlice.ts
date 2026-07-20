import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, Settlement, Refund } from '../../types';

interface FinanceState {
  transactions: Transaction[];
  settlements: Settlement[];
  refunds: Refund[];
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', bookingId: 'b-1', bookingCode: 'LMS-987654', patientName: 'Rajesh Kumar', amount: 2499, method: 'Online', status: 'Paid', date: '2026-05-10T10:30:00Z' },
  { id: 'tx-2', bookingId: 'b-2', bookingCode: 'LMS-294751', patientName: 'Anita Desai', amount: 750, method: 'UPI', status: 'Paid', date: '2026-05-11T14:22:00Z' },
  { id: 'tx-3', bookingId: 'b-3', bookingCode: 'LMS-105839', patientName: 'Ramesh Singh', amount: 1200, method: 'Cash', status: 'Pending', date: '2026-05-12T08:15:00Z' },
  { id: 'tx-4', bookingId: 'b-4', bookingCode: 'LMS-671234', patientName: 'Vikram Malhotra', amount: 3500, method: 'Card', status: 'Refunded', date: '2026-05-09T11:00:00Z' }
];

const MOCK_SETTLEMENTS: Settlement[] = [
  { id: 'set-1', franchiseId: 'f-1', franchiseName: 'Delhi West Diagnostics', period: 'May 1 - May 15, 2026', totalBusiness: 450000, commissionAmount: 67500, status: 'Paid', processedAt: '2026-05-15T18:00:00Z' },
  { id: 'set-2', franchiseId: 'f-2', franchiseName: 'Mumbai Central Lab', period: 'May 1 - May 15, 2026', totalBusiness: 320000, commissionAmount: 48000, status: 'Pending' }
];

const MOCK_REFUNDS: Refund[] = [
  { id: 'ref-1', bookingCode: 'LMS-671234', amount: 3500, reason: 'Patient cancelled appointment', status: 'Processed', date: '2026-05-09T16:30:00Z' }
];

const initialState: FinanceState = {
  transactions: MOCK_TRANSACTIONS,
  settlements: MOCK_SETTLEMENTS,
  refunds: MOCK_REFUNDS,
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    processSettlement: (state, action: PayloadAction<string>) => {
      const settlement = state.settlements.find(s => s.id === action.payload);
      if (settlement) {
        settlement.status = 'Paid';
        settlement.processedAt = new Date().toISOString();
      }
    },
    initiateRefund: (state, action: PayloadAction<Refund>) => {
      state.refunds.unshift(action.payload);
      const tx = state.transactions.find(t => t.bookingCode === action.payload.bookingCode);
      if (tx) {
        tx.status = 'Refunded';
      }
    }
  }
});

export const { addTransaction, processSettlement, initiateRefund } = financeSlice.actions;
export default financeSlice.reducer;
