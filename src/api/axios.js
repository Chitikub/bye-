import axios from 'axios';
import Cookies from 'js-cookie';

export const IMAGE_BASE_URL = "https://moodlocationfinder-backend.onrender.com";

const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    let base = (envUrl && envUrl !== "undefined") ? envUrl : "https://moodlocationfinder-backend.onrender.com";
    base = base.replace(/\/$/, "");
    return base.includes("/api/v1") ? base : `${base}/api/v1`;
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true, 
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
    (config) => {
        // 🌟 1. ดึง Token แบบดักหลายทาง
        const cookieToken = Cookies.get('token'); 
        const localToken = localStorage.getItem('token');
        const token = cookieToken || localToken;
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            // 🌟 2. ถ้ายังไม่เจอ ลอง Log ดู Cookies ทั้งหมดที่มีในเครื่องตอนนี้
            console.warn("❌ ไม่พบ Token! รายการ Cookies ทั้งหมดที่คุณมีตอนนี้คือ:", document.cookie);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("🚨 Session หมดอายุ หรือไม่มีสิทธิ์แอดมิน");
            // ล้างข้อมูลเพื่อบังคับให้ Login ใหม่
            Cookies.remove('token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default api;