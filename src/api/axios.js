import axios from 'axios';
import Cookies from 'js-cookie';
export const IMAGE_BASE_URL = "https://moodlocationfinder-backend.onrender.com";

const api = axios.create({
  
  // ใช้ URL จาก env หรือใส่ตรงๆ ตามที่คุณระบุในไฟล์อื่น
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://moodlocationfinder-backend.onrender.com/api/v1",

  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✨ เพิ่ม Interceptor เพื่อส่ง Token ไปกับทุก Request
api.interceptors.request.use(
  (config) => {
    // ดึง token จาก cookie ชื่อ 'token'
    const token = Cookies.get('token');
    
    if (token) {
      // แนบไปใน Header ตามที่ Backend ต้องการ (Bearer Token)
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
      // ถ้า Token หมดอายุ ให้ลบ Cookie และเด้งไปหน้า Login
      Cookies.remove('token');
      localStorage.removeItem('user');
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;