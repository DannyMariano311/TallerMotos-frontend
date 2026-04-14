import { api } from './api';

export const getClientByFilter = async (phone) => {
  try {
    const response = await api.get(`/clients?search=${encodeURIComponent(phone)}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createClient = async (clientData) => {
  const response = await api.post('/clients', clientData);
  return response.data;
};