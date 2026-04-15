import { api } from './api';

/**
 * POST /api/auth/register
 * Solo ADMIN puede crear usuarios
 */
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * POST /api/auth/login
 * Retorna { token, user }
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

/**
 * POST /api/auth/logout (opcional si maneja refresh tokens)
 */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.error('Error en logout:', err);
  }
};

/**
 * POST /api/auth/refresh (opcional)
 * Renovar token si usa refresh token
 */
export const refreshToken = async () => {
  const response = await api.post('/auth/refresh');
  return response.data;
};

/**
 * GET /api/auth/me
 * Obtener perfil del usuario actual
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * GET /api/users
 * Obtener listado de usuarios (solo ADMIN)
 */
export const getUsers = async (params = {}) => {
  const response = await api.get('/auth/me', { params });
  return response.data;
};