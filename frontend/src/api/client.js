import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
});

// Request interceptor: แนบ JWT token จาก localStorage เสมอ
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('acims_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: ดักจับ Error 401 เพื่อออกจากระบบอัตโนมัติ
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('acims_token');
      localStorage.removeItem('acims_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
