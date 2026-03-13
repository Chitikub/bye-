import axios from 'axios';
import Cookies from 'js-cookie';

export const IMAGE_BASE_URL = "https://moodlocationfinder-backend.onrender.com";

// 🌟 ฟังก์ชันจัดการ Base URL แบบปลอดภัยที่สุด
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  // ตรวจสอบ: ถ้า envUrl ไม่มีค่า หรือเป็นคำว่า "undefined" (string)
  // ให้ใช้ URL ตรงๆ ของ Render ไปเลย
  let base = (envUrl && envUrl !== "undefined") 
    ? envUrl 
    : "https://moodlocationfinder-backend.onrender.com";

  // ลบ / ที่อาจติดมาท้าย URL ออกก่อน
  base = base.replace(/\/$/, "");

  // ถ้าใน base มี /api/v1 อยู่แล้ว ให้ใช้ค่านั้นเลย ถ้าไม่มีค่อยเติม
  return base.includes("/api/v1") ? base : `${base}/api/v1`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✨ Interceptor สำหรับแนบ Token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;