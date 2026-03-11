import axios from 'axios';

const api = axios.create({
  // ดึงค่าจาก Environment Variable (VITE_API_BASE_URL) และเติม /api/v1 ต่อท้ายอัตโนมัติ
  baseURL: (import.meta.env.VITE_API_BASE_URL || "https://moodlocationfinder-backend.onrender.com") + "/api/v1",
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✨ เพิ่ม Interceptor เพื่อส่ง Token ไปกับทุก Request ผ่าน LocalStorage
api.interceptors.request.use(
  (config) => {
    // เปลี่ยนจาก Cookies มาใช้ localStorage เพื่อความชัวร์เมื่อใช้งานบน Vercel
    const token = localStorage.getItem('token');
    
    if (token) {
      // แนบ Bearer Token ไปใน Header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✨ เพิ่ม Interceptor เพื่อจัดการกรณี Token หมดอายุ (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // ถ้า Token หมดอายุ ให้ล้างค่าในเครื่อง
      localStorage.removeItem('token');
      localStorage.removeItem('user');

    }
    return Promise.reject(error);
  }
);

export default api;