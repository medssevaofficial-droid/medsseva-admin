import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SupportTicket, PatientCallbackRequest, AppFeedback, TicketStatus } from '../../types/crm';

interface CrmState {
  tickets: SupportTicket[];
  callbacks: PatientCallbackRequest[];
  feedbacks: AppFeedback[];
}

const MOCK_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-1',
    ticketNumber: 'MS-2934',
    patientName: 'Kunal Sen',
    patientPhone: '+91 9810293847',
    subject: 'Hardcopy report not received',
    category: 'Booking Issue',
    priority: 'High',
    status: 'Open',
    createdAt: '2026-05-14T11:30:00Z',
    lastUpdatedAt: '2026-05-14T11:30:00Z',
    description: 'Patient registered for a home delivery printed hardcopy report. The PDF was generated yesterday, but no courier details have been received yet.',
    internalNotes: []
  },
  {
    id: 'tkt-2',
    ticketNumber: 'MS-1092',
    patientName: 'Simran Kaur',
    patientPhone: '+91 9555019283',
    subject: 'Payment deducted twice',
    category: 'Refund Status',
    priority: 'Urgent',
    status: 'In Progress',
    assignedAgentId: 'u-1',
    assignedAgentName: 'Aditya Verma',
    createdAt: '2026-05-13T15:00:00Z',
    lastUpdatedAt: '2026-05-14T09:15:00Z',
    description: 'The payment gateway timed out but Patient bank account was debited. Need priority refund escalation.',
    internalNotes: [
      {
        id: 'n-1',
        authorName: 'Aditya Verma',
        timestamp: '2026-05-14T09:15:00Z',
        text: 'Contacted payment gateway partner. Transaction ID confirmed as duplicate. Initiating refund now.'
      }
    ]
  }
];

const MOCK_CALLBACKS: PatientCallbackRequest[] = [
  {
    id: 'cb-1',
    patientName: 'Harpreet Singh',
    patientPhone: '+91 9283746501',
    preferredTimeSlot: 'Today, 4:00 PM - 6:00 PM',
    requestedAt: '2026-05-15T08:30:00Z',
    status: 'Pending'
  },
  {
    id: 'cb-2',
    patientName: 'Minakshi Joshi',
    patientPhone: '+91 9112233445',
    preferredTimeSlot: 'Tomorrow Morning',
    requestedAt: '2026-05-14T18:00:00Z',
    status: 'Called',
    assignedAdminName: 'Sunita Rao',
    outcomeNotes: 'Patient was inquiring about COVID booster test availability. Confirmed schedule.'
  }
];

const MOCK_FEEDBACKS: AppFeedback[] = [
  {
    id: 'fb-1',
    patientName: 'Dr. Rajiv Dixit',
    rating: 5,
    comment: 'Super fast home collection and very neat app simulator layout.',
    source: 'Android App',
    date: '2026-05-12',
    resolved: true
  },
  {
    id: 'fb-2',
    patientName: 'Sneha Reddy',
    rating: 2,
    comment: 'Phlebotomist slot arrived 30 mins late. Need better tracking.',
    source: 'iOS App',
    date: '2026-05-14',
    resolved: false
  }
];

const initialState: CrmState = {
  tickets: MOCK_TICKETS,
  callbacks: MOCK_CALLBACKS,
  feedbacks: MOCK_FEEDBACKS
};

const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    upsertTicket: (state, action: PayloadAction<SupportTicket>) => {
      const idx = state.tickets.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) {
        state.tickets[idx] = {
          ...action.payload,
          lastUpdatedAt: new Date().toISOString()
        };
      } else {
        state.tickets.unshift(action.payload);
      }
    },
    addInternalNote: (state, action: PayloadAction<{ ticketId: string; text: string; author: string }>) => {
      const ticket = state.tickets.find(t => t.id === action.payload.ticketId);
      if (ticket) {
        ticket.internalNotes.push({
          id: `note-${Date.now()}`,
          authorName: action.payload.author,
          timestamp: new Date().toISOString(),
          text: action.payload.text
        });
        ticket.lastUpdatedAt = new Date().toISOString();
      }
    },
    updateTicketStatus: (state, action: PayloadAction<{ ticketId: string; status: TicketStatus; agentId?: string; agentName?: string }>) => {
      const ticket = state.tickets.find(t => t.id === action.payload.ticketId);
      if (ticket) {
        ticket.status = action.payload.status;
        if (action.payload.agentId) {
          ticket.assignedAgentId = action.payload.agentId;
          ticket.assignedAgentName = action.payload.agentName;
        }
        ticket.lastUpdatedAt = new Date().toISOString();
      }
    },
    updateCallbackStatus: (state, action: PayloadAction<{ id: string; status: PatientCallbackRequest['status']; adminName?: string; notes?: string }>) => {
      const cb = state.callbacks.find(c => c.id === action.payload.id);
      if (cb) {
        cb.status = action.payload.status;
        if (action.payload.adminName) cb.assignedAdminName = action.payload.adminName;
        if (action.payload.notes) cb.outcomeNotes = action.payload.notes;
      }
    },
    resolveFeedback: (state, action: PayloadAction<string>) => {
      const fb = state.feedbacks.find(f => f.id === action.payload);
      if (fb) {
        fb.resolved = true;
      }
    }
  }
});

export const { upsertTicket, addInternalNote, updateTicketStatus, updateCallbackStatus, resolveFeedback } = crmSlice.actions;
export default crmSlice.reducer;
