import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // 确保端口与后端一致
  timeout: 5000
});

// 拦截器：添加 Token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = token;
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
);

// 原有接口
export const loginUser = (data) => api.post('/login', data);
export const registerUser = (data) => api.post('/register', data);
export const getContacts = () => api.get('/contacts');
export const getHistory = (contactId) => api.get(`/messages?contactId=${contactId}`);

// 【新增】上传头像接口 (你之前漏掉了这个)
export const uploadAvatar = (formData) => api.post('/user/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// 【新增】更新用户信息接口 (Profile页面也需要这个)
export const updateUserInfo = (user) => api.post('/user/update', user);

export default api;