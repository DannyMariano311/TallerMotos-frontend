import { api } from './api';

export const getOrders = async (params) => {
  // params puede incluir { status, plate, page, pageSize }
  const response = await api.get('/work-orders', { params });
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post('/work-orders', orderData);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/work-orders/${id}`);
  return response.data;
};

export const addItemToOrder = async (orderId, itemData) => {
  const response = await api.post(`/work-orders/${orderId}/items`, itemData);
  return response.data;
};

export const deleteItemFromOrder = async (orderId, itemId) => {
  const response = await api.delete(`/work-orders/${orderId}/items/${itemId}`);
  return response.data;
};

export const updateOrderStatus = async (orderId, newStatus, note = '') => {
  const response = await api.patch(`/work-orders/${orderId}/status`, { status: newStatus, note });
  return response.data;
};

export const getOrderHistory = async (orderId, { page = 1, pageSize = 20, userId, startDate, endDate } = {}) => {
  const params = { page, pageSize };
  if (userId) params.userId = userId;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const response = await api.get(`/work-orders/${orderId}/history`, { params });
  return response.data;
};