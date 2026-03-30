'use client';
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token"); // ดึง ?token=xxxx จาก URL

  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("กำลังตรวจสอบการยืนยันอีเมลของคุณ...");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setMessage("ไม่พบรหัสยืนยันตัวตน (Token) กรุณาตรวจสอบลิงก์อีกครั้ง");
        return;
      }

      try {
        // ส่ง Token ไปตรวจสอบที่ Backend
        // สมมติว่า Endpoint คือ GET /auth/verify-email/:token
        const res = await api.get(`/auth/verify-email/${token}`);

        setStatus("success");
        setMessage(res.data.message || "ยืนยันอีเมลสำเร็จแล้ว! คุณสามารถเข้าสู่ระบบได้ทันที");
        
        // แสดง Pop-up สำเร็จ
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'ยืนยันอีเมลเรียบร้อยแล้ว',
          confirmButtonColor: '#FF7F67',
          customClass: { popup: 'rounded-[30px]' }
        });
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.message || "ลิงก์ยืนยันตัวตนไม่ถูกต้องหรือหมดอายุ");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#FDF8F1] px-4 font-['Kanit',sans-serif]">
      <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white text-center">
        
        {/* ส่วนแสดงไอคอนตามสถานะ */}
        <div className="flex justify-center mb-8">
          {status === "loading" && (
            <div className="relative">
              <Loader2 className="w-20 h-20 text-[#FF7F67] animate-spin" />
              <Mail className="w-8 h-8 text-[#FF7F67] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          )}
          {status === "success" && (
            <div className="bg-green-50 p-6 rounded-full">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
          )}
          {status === "error" && (
            <div className="bg-red-50 p-6 rounded-full">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
          )}
        </div>

        {/* ข้อความแจ้งสถานะ */}
        <h1 className={`text-2xl font-black mb-4 ${
          status === "error" ? "text-red-500" : "text-[#4A453A]"
        }`}>
          {status === "loading" ? "กรุณารอสักครู่" : status === "success" ? "ยืนยันตัวตนสำเร็จ" : "เกิดข้อผิดพลาด"}
        </h1>
        
        <p className="text-[#7E7869] font-medium mb-10 leading-relaxed">
          {message}
        </p>

        {/* ปุ่มนำทาง */}
        {status !== "loading" && (
          <button 
            onClick={() => navigate('/login')}
            className="w-full h-14 rounded-2xl font-bold bg-gradient-to-r from-[#FF7F67] to-[#FFB385] text-white shadow-lg shadow-[#FF7F67]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            ไปหน้าเข้าสู่ระบบ <ArrowRight size={20} />
          </button>
        )}
      </div>
    </main>
  );
}