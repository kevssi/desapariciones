import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || (window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api');

const api = axios.create({
  baseURL: API_BASE_URL
});

// Interceptor para añadir token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (email, password, nombre, apellido) =>
    api.post('/auth/register', { email, password, nombre, apellido }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  verify: (email, codigo) =>
    api.post('/auth/verify', { email, codigo }),
  
  resendCode: (email) =>
    api.post('/auth/resend-code', { email }),
  
  getProfile: () =>
    api.get('/auth/profile'),

  updateProfile: (data) =>
    api.put('/auth/profile', data)
};

export const missingPersonsService = {
  getAll: (page = 1, limit = 20) =>
    api.get('/missing-persons', { params: { page, limit } }),
  
  getById: (id) =>
    api.get(`/missing-persons/${id}`),
  
  search: (query) =>
    api.get('/missing-persons/search', { params: { q: query } }),
  
  create: (data) =>
    api.post('/missing-persons', data),
  
  update: (id, data) =>
    api.put(`/missing-persons/${id}`, data),
  
  delete: (id) =>
    api.delete(`/missing-persons/${id}`),

  save: (id) =>
    api.post(`/missing-persons/${id}/save`),
  
  unsave: (id) =>
    api.delete(`/missing-persons/${id}/save`),
  
  isSaved: (id) =>
    api.get(`/missing-persons/${id}/is-saved`),
  
  getSaved: () =>
    api.get('/missing-persons/user/saved')
};

export const commentsService = {
  getByPersona: (personaId) =>
    api.get(`/comments/${personaId}`),

  create: (personaId, contenido, parentId = null) =>
    api.post(`/comments/${personaId}`, { contenido, parentId }),

  update: (commentId, contenido) =>
    api.put(`/comments/${commentId}`, { contenido }),

  delete: (commentId) =>
    api.delete(`/comments/${commentId}`)
};

export default api;
