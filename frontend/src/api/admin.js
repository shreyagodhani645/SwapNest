import api from './auth';

export const adminApi = {
  // Dashboard
  getStats: () => api.get('/admin/stats'),

  // User Management
  getUsers: (search = '') => api.get(`/admin/users${search ? `?search=${search}` : ''}`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleBan: (id) => api.patch(`/admin/users/${id}/ban`),
  changeRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),

  // Listing Management
  getListings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/listings${query ? `?${query}` : ''}`);
  },
  deleteListing: (id) => api.delete(`/admin/listings/${id}`),
  changeListingStatus: (id, status) => api.patch(`/admin/listings/${id}/status`, { status }),

  // Offer Management
  getOffers: () => api.get('/admin/offers'),
  deleteOffer: (id) => api.delete(`/admin/offers/${id}`),

  // Category Management
  getCategories: () => api.get('/admin/categories'),
  createCategory: (name) => api.post('/admin/categories', { name }),
  updateCategory: (id, name) => api.put(`/admin/categories/${id}`, { name }),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Audit & Activity Logs
  getAuditLog: () => api.get('/admin/audit-log'),
  getActivityLog: () => api.get('/admin/activity-log'),

  // Reports
  getCategoryReport: () => api.get('/admin/reports/categories'),
  getTopSellers: () => api.get('/admin/reports/top-sellers'),
  getRecentActivity: () => api.get('/admin/reports/recent-activity'),
  getDBObjects: () => api.get('/admin/reports/db-objects'),
};
