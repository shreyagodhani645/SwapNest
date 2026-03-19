import api from './auth';

export const offersApi = {
  create: (data) => api.post('/offers', data),
  updateStatus: (id, status) => api.patch(`/offers/${id}`, { status }),
  getMyListingsOffers: () => api.get('/offers/my-listings'),
};
