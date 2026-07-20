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

export default api;