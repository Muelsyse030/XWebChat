import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // 后端地址
  timeout: 5000
});

// 拦截器：添加 Token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = token;
  return config;
});

export const loginUser = (data) => api.post('/login', data);
export const getContacts = () => api.get('/contacts');
export const getHistory = (contactId) => api.get(`/messages?contactId=${contactId}`);

export default api;