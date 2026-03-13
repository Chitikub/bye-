import axios from 'axios';
import Cookies from 'js-cookie'; // เก็บไว้เผื่อใช้จัดการ Auth ในอนาคต

// ตัวแปรสำหรับเรียกใช้รูปภาพจาก Backend
export const IMAGE_BASE_URL = "https://moodlocationfinder-backend.onrender.com";

const api = axios.create({
  // ใช้ baseURL ที่ยืดหยุ่น: ต่อท้ายด้วย /api/v1 เสมอไม่ว่าจะใช้ env หรือค่าเริ่มต้น
  baseURL: (import.meta.env.VITE_API_BASE_URL || "https://moodlocationfinder-backend.onrender.com") + "/api/v1",
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✨ Interceptor ขาไป: ดึง Token มาแนบ Header อัตโนมัติ
api.interceptors.request.use(
  (config) => {
    // ดึง token จาก localStorage (ถ้าคุณเปลี่ยนไปใช้ Cookie ก็สามารถปรับตรงนี้ได้)
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
      // window.location.href = '/login'; // เปิดใช้ถ้าอยากให้เด้งไปหน้า login ทันที
    }
    return Promise.reject(error);
  }
);

export default api;