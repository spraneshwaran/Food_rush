import apiClient from './apiClient';

export const restaurantsAPI = {
  getAll: (params) => apiClient.get('/restaurants', { params }),
  getFeatured: () => apiClient.get('/restaurants/featured'),
  getCuisines: () => apiClient.get('/restaurants/cuisines'),
  getById: (id) => apiClient.get(`/restaurants/${id}`),
  getMyRestaurant: () => apiClient.get('/restaurants/owner/my'),
  create: (data) => apiClient.post('/restaurants', data),
  update: (id, data) => apiClient.put(`/restaurants/${id}`, data),
  getAnalytics: (id) => apiClient.get(`/restaurants/${id}/analytics`),
};

export const menuAPI = {
  getByRestaurant: (restaurantId, params) => apiClient.get(`/menu/${restaurantId}`, { params }),
  getItem: (id) => apiClient.get(`/menu/item/${id}`),
  create: (data) => apiClient.post('/menu', data),
  update: (id, data) => apiClient.put(`/menu/${id}`, data),
  delete: (id) => apiClient.delete(`/menu/${id}`),
  toggleAvailability: (id) => apiClient.patch(`/menu/${id}/toggle`),
};
