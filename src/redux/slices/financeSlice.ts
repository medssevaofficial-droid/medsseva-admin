import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { financeService } from '../../services/api';

interface PaymentSummary {
  totalCollected: number;
  totalPending: number;
  totalRefunded: number;
  pendingSettlements: number;
}

interface Payment {
  id: string;
  bookingId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  tax: number;
  discount: number;
  couponCode?: string;
  method?: string;
  gateway: string;
  status: string;
  invoiceNumber?: string;
  paymentReference?: string;
  branchId?: string;
  paidAt?: string;
  createdAt: string;
  booking?: {
    bookingCode: string;
    patientName: string;
    branch?: { name: string };
  };
}

interface Refund {
  id: string;
  paymentId: string;
  bookingId: string;
  razorpayRefundId?: string;
  amount: number;
  reason: string;
  approvalNotes?: string;
  status: string;
  processedAt?: string;
  createdAt: string;
  payment?: {
    booking?: { bookingCode: string; patientName: string };
  };
}

interface Settlement {
  id: string;
  settlementRef: string;
  franchiseName: string;
  period: string;
  totalBusiness: number;
  commissionRate: number;
  commissionAmount: number;
  taxOnCommission: number;
  netPayable: number;
  status: string;
  payoutReference?: string;
  processedAt?: string;
  createdAt: string;
}

interface FinanceState {
  summary: PaymentSummary | null;
  payments: Payment[];
  paymentsTotal: number;
  refunds: Refund[];
  settlements: Settlement[];
  loading: boolean;
  error: string | null;
}

const initialState: FinanceState = {
  summary: null,
  payments: [],
  paymentsTotal: 0,
  refunds: [],
  settlements: [],
  loading: false,
  error: null,
};

export const fetchSummary = createAsyncThunk('finance/fetchSummary', async (_, { rejectWithValue }) => {
  try {
    return await financeService.getSummary();
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.error || 'Failed to fetch summary');
  }
});

export const fetchPayments = createAsyncThunk(
  'finance/fetchPayments',
  async (params: { page?: number; limit?: number; status?: string } | undefined, { rejectWithValue }) => {
    try {
      return await financeService.getPayments(params);
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.error || 'Failed to fetch payments');
    }
  }
);

export const fetchRefunds = createAsyncThunk('finance/fetchRefunds', async (status: string | undefined, { rejectWithValue }) => {
  try {
    return await financeService.getRefunds(status);
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.error || 'Failed to fetch refunds');
  }
});

export const submitRefundRequest = createAsyncThunk(
  'finance/submitRefundRequest',
  async (data: { paymentId: string; amount: number; reason: string; approvalNotes?: string }, { rejectWithValue }) => {
    try {
      return await financeService.requestRefund(data);
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.error || 'Failed to request refund');
    }
  }
);

export const approveRefundThunk = createAsyncThunk('finance/approveRefund', async (id: string, { rejectWithValue }) => {
  try {
    return await financeService.approveRefund(id);
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.error || 'Failed to approve refund');
  }
});

export const fetchSettlements = createAsyncThunk('finance/fetchSettlements', async (status: string | undefined, { rejectWithValue }) => {
  try {
    return await financeService.getSettlements(status);
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.error || 'Failed to fetch settlements');
  }
});

export const processSettlementThunk = createAsyncThunk('finance/processSettlement', async (id: string, { rejectWithValue }) => {
  try {
    return await financeService.processSettlement(id);
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.error || 'Failed to process settlement');
  }
});

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    clearFinanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: FinanceState) => { state.loading = true; state.error = null; };
    const setError = (state: FinanceState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchSummary.fulfilled, (state, action) => { state.summary = action.payload; })
      .addCase(fetchPayments.pending, setLoading)
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.payments;
        state.paymentsTotal = action.payload.total;
      })
      .addCase(fetchPayments.rejected, setError)
      .addCase(fetchRefunds.fulfilled, (state, action) => { state.refunds = action.payload; })
      .addCase(submitRefundRequest.fulfilled, (state, action) => {
        state.refunds.unshift(action.payload);
      })
      .addCase(approveRefundThunk.fulfilled, (state, action) => {
        const idx = state.refunds.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.refunds[idx] = action.payload;
      })
      .addCase(fetchSettlements.fulfilled, (state, action) => { state.settlements = action.payload; })
      .addCase(processSettlementThunk.fulfilled, (state, action) => {
        const idx = state.settlements.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) state.settlements[idx] = action.payload;
      });
  },
});

export const { clearFinanceError } = financeSlice.actions;
export default financeSlice.reducer;