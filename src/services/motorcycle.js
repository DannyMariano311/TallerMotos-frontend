import { api } from './api';

export const getMotorcycleByPlate = async (plate) => {
  try {
    const response = await api.get(`/motorcycles?plate=${encodeURIComponent(plate)}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createMotorcycle = async (motorcycleData) => {
  const response = await api.post('/motorcycles', motorcycleData);
  return response.data;
};