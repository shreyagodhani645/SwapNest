import api from './auth';

export const listingsApi = {
  getAll: (params) => api.get('/listings', { params }),
  getById: (id) => api.get(`/listings/${id}`),
  getCategories: () => api.get('/listings/categories'),
  getMyListings: () => api.get('/listings/my-listings'),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.put(`/listings/${id}`, data),
  createCategory: (data) => api.post('/categories', data),
  deleteListing: (id) => api.delete(`/listings/${id}`),
};
