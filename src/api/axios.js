import axios from 'axios';

const api = axios.create({
  // ดึงค่าจาก Environment Variable หรือใช้ URL ตรงถ้าไม่มี
  baseURL: (import.meta.env.VITE_API_BASE_URL || "https://moodlocationfinder-backend.onrender.com") + "/api/v1",
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✨ Interceptor ขาไป: ดึง Token จาก LocalStorage มาแนบ Header อัตโนมัติ
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✨ Interceptor ขากลับ: จัดการกรณีเซสชั่นหมดอายุ (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // ปลดล็อกบรรทัดล่างถ้าต้องการให้ดีดไปหน้า Login ทันที
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;