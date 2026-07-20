import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medsseva_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminUserService = {
  getAdminUsers: () => api.get('/admin-users').then(r => r.data),
  createAdminUser: (data: any) => api.post('/admin-users', data).then(r => r.data),
  updateAdminUser: (id: string, data: any) => api.put(`/admin-users/${id}`, data).then(r => r.data),
  deleteAdminUser: (id: string) => api.delete(`/admin-users/${id}`).then(r => r.data),
};

export const rbacService = {

  getRoles: () => api.get('/roles').then(r => r.data),
  getRoleById: (id: string) => api.get(`/roles/${id}`).then(r => r.data),
  createRole: (data: any) => api.post('/roles', data).then(r => r.data),
  updateRole: (id: string, data: any) => api.put(`/roles/${id}`, data).then(r => r.data),
  deleteRole: (id: string) => api.delete(`/roles/${id}`).then(r => r.data),
  cloneRole: (id: string) => api.post(`/roles/${id}/clone`).then(r => r.data),
  getAllPermissions: () => api.get('/roles/permissions').then(r => r.data),
  getAuditLogs: () => api.get('/roles/audit-logs').then(r => r.data),
  assignAdminRole: (data: any) => api.post('/roles/admin-users', data).then(r => r.data),
};

export const packageService = {
  getAllPackages: async () => {
    const response = await api.get('/packages');
    return response.data;
  },
  createPackage: async (data: any) => {
    const response = await api.post('/packages', data);
    return response.data;
  },
};

export const testService = {
  getBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },
  updateBookingStatus: async (id: string, status: string) => {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data;
  },
  getAllTests: async () => {
    const response = await api.get('/tests');
    return response.data;
  },
createTest: async (data: any) => {
    const response = await api.post('/tests', data);
    return response.data;
  },
  updateTest: async (id: string, data: any) => {
    const response = await api.put(`/tests/${id}`, data);
    return response.data;
  },
  addTestParameter: async (testId: string, data: any) => {
    const response = await api.post(`/tests/${testId}/parameters`, data);
    return response.data;
  },
  getTestParameters: async (testId: string) => {
    const response = await api.get(`/tests/${testId}/parameters`);
    return response.data;
  },
  createReport: async (data: any) => {
    const response = await api.post('/reports', data);
    return response.data;
  },
  verifyReport: async (id: string) => {
    const response = await api.patch(`/reports/${id}/verify`);
    return response.data;
  },
 getRegisteredUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
  updatePaymentStatus: async (id: string, paymentStatus: string, paymentMode?: string) => {
    const response = await api.patch(`/bookings/${id}/payment`, { paymentStatus, paymentMode });
    return response.data;
  },
  assignExecutive: async (id: string, executiveId: string) => {
    const response = await api.patch(`/bookings/${id}/assign-executive`, { executiveId });
    return response.data;
  },
getExecutives: async () => {
    const response = await api.get('/auth/users?role=EXECUTIVE');
    return response.data;
  },
  assignPartner: async (bookingId: string, partnerId: string) => {
    const response = await api.patch(`/bookings/${bookingId}/assign-partner`, { partnerId });
    return response.data;
  },
  getAvailablePartners: async () => {
    const response = await api.get('/auth/partners/available');
    return response.data;
  },
  getPartners: async (status?: string) => {
    const url = status ? `/auth/partners?status=${status}` : '/auth/partners';
    const response = await api.get(url);
    return response.data;
  },
  updatePartnerApproval: async (id: string, approvalStatus: string, rejectionReason?: string) => {
    const response = await api.patch(`/auth/partners/${id}/approval`, { approvalStatus, rejectionReason });
    return response.data;
  },
};

export const sampleService = {
  getQueue: () => api.get('/samples/queue').then(r => r.data),
  receiveSample: (data: {
    bookingId: string;
    sampleType: string;
    condition: string;
    notes?: string;
    rejectionReason?: string;
  }) => api.post('/samples/receive', data).then(r => r.data),
  startProcessing: (bookingId: string) =>
    api.patch(`/samples/${bookingId}/process`).then(r => r.data),
};

export const authService = {
  getMe: () => api.get('/auth/me').then(r => r.data),
};

export const couponService = {
  getAll: () => api.get('/coupons').then(r => r.data),
  getById: (id: string) => api.get(`/coupons/${id}`).then(r => r.data),
  create: (data: any) => api.post('/coupons', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/coupons/${id}`, data).then(r => r.data),
  toggleStatus: (id: string, isActive: boolean) => api.patch(`/coupons/${id}/status`, { isActive }).then(r => r.data),
  delete: (id: string) => api.delete(`/coupons/${id}`).then(r => r.data),
  getAnalytics: () => api.get('/coupons/analytics').then(r => r.data),
};

export const financeService = {
  getSummary: () => api.get('/finance/payment-summary').then(r => r.data),
  getPayments: (params?: { page?: number; limit?: number; status?: string; from?: string; to?: string }) =>
    api.get('/finance/payments', { params }).then(r => r.data),
  getPaymentById: (id: string) => api.get(`/finance/payments/${id}`).then(r => r.data),
  createOrder: (bookingId: string) => api.post('/finance/payments/create-order', { bookingId }).then(r => r.data),
  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; bookingId: string }) =>
    api.post('/finance/payments/verify', data).then(r => r.data),
  getRefunds: (status?: string) => api.get('/finance/refunds', { params: status ? { status } : {} }).then(r => r.data),
  requestRefund: (data: { paymentId: string; amount: number; reason: string; approvalNotes?: string }) =>
    api.post('/finance/refunds', data).then(r => r.data),
  approveRefund: (id: string) => api.post(`/finance/refunds/${id}/approve`).then(r => r.data),
  rejectRefund: (id: string, reason: string) => api.post(`/finance/refunds/${id}/reject`, { reason }).then(r => r.data),
  getSettlements: (status?: string) => api.get('/finance/settlements', { params: status ? { status } : {} }).then(r => r.data),
  generateSettlement: (data: { periodStart: string; periodEnd: string; franchiseName: string; franchiseId?: string; commissionRate?: number }) =>
    api.post('/finance/settlements/generate', data).then(r => r.data),
  processSettlement: (id: string) => api.post(`/finance/settlements/${id}/process`).then(r => r.data),
};
export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard').then(r => r.data),
};

export const cmsService = {
  getBanners: () => api.get('/cms/banners').then(r => r.data),
  createBanner: (data: any) => api.post('/cms/banners', data).then(r => r.data),
  updateBanner: (id: string, data: any) => api.put(`/cms/banners/${id}`, data).then(r => r.data),
  deleteBanner: (id: string) => api.delete(`/cms/banners/${id}`).then(r => r.data),
  uploadBannerImage: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/cms/banners/upload-image', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  getConfig: () => api.get('/cms/config').then(r => r.data),
  updateConfig: (data: any) => api.put('/cms/config', data).then(r => r.data),
  getAlerts: () => api.get('/cms/alerts').then(r => r.data),
  upsertAlert: (data: any) => api.post('/cms/alerts', data).then(r => r.data),
  deleteAlert: (id: string) => api.delete(`/cms/alerts/${id}`).then(r => r.data),
  getPages: () => api.get('/cms/pages').then(r => r.data),
  updatePage: (slug: string, data: any) => api.put(`/cms/pages/${slug}`, data).then(r => r.data),
  getAuditLogs: () => api.get('/cms/audit-logs').then(r => r.data),
};
export default api;