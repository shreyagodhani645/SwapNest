import api from './auth';

export const chatApi = {
  getInbox: () => api.get('/chat/inbox'),
  getConversation: (listingId, otherUserId) => api.get('/chat/conversation', { params: { listingId, otherUserId } }),
  sendMessage: (data) => api.post('/chat/send', data),
};
