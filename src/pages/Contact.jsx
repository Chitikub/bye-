"use client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, Send, MessageCircle, User, Tag } from "lucide-react";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import api from "@/api/axios";

export default function ContactPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return Swal.fire("กรุณาเข้าสู่ระบบ", "ต้อง Login ก่อนส่งรายงาน", "warning");

    try {
      // 🌟 ส่งข้อมูลไปยัง API Contact (ไม่ใช่ Chat)
      await api.post("/contact", {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        subject: formData.subject,
        message: formData.message,
      });

      Swal.fire({
        icon: "success",
        title: "ส่งรายงานสำเร็จ!",
        text: "แอดมินได้รับข้อมูลแล้ว และจะตรวจสอบให้เร็วที่สุด",
        confirmButtonColor: "#FF8E6E",
      });

      setFormData({ subject: "", message: "" });
    } catch (error) {
      Swal.fire("ผิดพลาด", "ไม่สามารถส่งข้อมูลได้ในขณะนี้", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F4E8] font-['Prompt'] text-[#4A453A] pb-20">
      <section className="h-[40vh] bg-[#4A453A] flex items-center justify-center relative overflow-hidden">
        <div className="container px-6 text-center z-10">
          <h1 className="text-5xl md:text-7xl font-black text-white">Report <span className="text-[#FF8E6E]">Center</span></h1>
          <p className="text-white/60 mt-4">พบปัญหาหรือมีข้อเสนอแนะ แจ้งเราได้ทันที</p>
        </div>
      </section>

      <main className="container mx-auto px-6 -mt-20 relative z-20">
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border-8 border-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="flex items-center gap-2 font-black opacity-60"><User size={18}/> ผู้ส่งรายงาน</label>
                  <div className="p-5 bg-gray-50 rounded-2xl font-bold text-gray-400 border border-gray-100">
                    {user ? `${user.firstName} ${user.lastName}` : "กรุณาเข้าสู่ระบบ"}
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="flex items-center gap-2 font-black opacity-60"><Tag size={18}/> หัวข้อรายงาน</label>
                  <input 
                    required
                    placeholder="เช่น แจ้งพิกัดผิด, ปัญหาการใช้งาน"
                    className="w-full p-5 bg-[#FDF8F1] rounded-2xl outline-none focus:ring-4 focus:ring-[#FF8E6E]/20 font-bold border-none"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
               </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 font-black opacity-60"><MessageCircle size={18}/> รายละเอียด</label>
              <textarea 
                required
                rows="6"
                placeholder="พิมพ์รายละเอียดที่ต้องการแจ้ง..."
                className="w-full p-6 bg-[#FDF8F1] rounded-[2rem] outline-none focus:ring-4 focus:ring-[#FF8E6E]/20 font-medium border-none resize-none"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full py-5 bg-[#FF8E6E] text-white rounded-[2rem] font-black text-2xl shadow-xl shadow-[#FF8E6E]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
              <Send /> ส่งรายงานให้แอดมิน
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}