import api from './auth';

export const userApi = {
  getPublicProfile: (userId) => api.get(`/users/profile/${userId}`),
};
