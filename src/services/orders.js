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

export const updateOrderStatus = async (orderId, newStatus) => {
  const response = await api.patch(`/work-orders/${orderId}/status`, { status: newStatus });
  return response.data;
};