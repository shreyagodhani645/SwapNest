import api from './auth';

export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (listing_id) => api.post('/wishlist', { listing_id }),
  remove: (listing_id) => api.delete(`/wishlist/${listing_id}`),
  check: (listing_id) => api.get(`/wishlist/check/${listing_id}`),
};
