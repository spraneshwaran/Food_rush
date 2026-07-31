import apiClient from './apiClient';

export const ordersAPI = {
  place: (data) => apiClient.post('/orders', data),
  getById: (id) => apiClient.get(`/orders/${id}`),
  getMyOrders: (params) => apiClient.get('/orders/my', { params }),
  getRestaurantOrders: (params) => apiClient.get('/orders/restaurant', { params }),
  updateStatus: (id, data) => apiClient.patch(`/orders/${id}/status`, data),
  cancel: (id, data) => apiClient.patch(`/orders/${id}/cancel`, data),
};

export const paymentAPI = {
  initiate: (data) => apiClient.post('/payment/initiate', data),
  verify: (data) => apiClient.post('/payment/verify', data),
};

export const adminAPI = {
  getStats: () => apiClient.get('/admin/stats'),
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  toggleUser: (id) => apiClient.patch(`/admin/users/${id}/toggle`),
  getRestaurants: (params) => apiClient.get('/admin/restaurants', { params }),
  approveRestaurant: (id, data) => apiClient.patch(`/admin/restaurants/${id}/approve`, data),
  getOrders: (params) => apiClient.get('/admin/orders', { params }),
};
