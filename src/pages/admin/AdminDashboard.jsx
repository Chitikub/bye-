'use client';
import { useState, useEffect } from "react";
import { Users, MapPin, MessageSquare, Bell } from "lucide-react";
import api from "@/api/axios";
import { Link } from "react-router-dom";

export default function AdminDashboard({ setTab }) {
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState({ users: 0, places: 0, contacts: 0 });
  const [loading, setLoading] = useState(true);

  // ✅ ฟังก์ชันช่วยดึง Token จาก Cookie
  const getTokenFromCookie = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
  };

  useEffect(() => {
    // ดึงข้อมูลแอดมินจาก LocalStorage (ส่วนข้อมูลโปรไฟล์ยังอยู่ในนี้ได้)
    const user = JSON.parse(localStorage.getItem("user"));
    
    // ✅ แก้ไข: ดึง token จาก Cookie แทน localStorage
    const token = getTokenFromCookie();

    if (user) setAdminData(user);
    
    // เรียกฟังก์ชันดึงสถิติโดยใช้ token จาก cookie
    fetchDashboardStats(token);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const results = await Promise.allSettled([
        api.get('/admin/users'),
        api.get('/places'),
        api.get('/messages/users')
      ]);

      const [resUsers, resPlaces, resMessages] = results;

      setStats({
        // 🌟 แก้ไขชื่อตัวแปรจาก placesRes เป็น resPlaces ให้ตรงกัน
        users: resUsers.status === 'fulfilled' ? (resUsers.value.data.users?.length || resUsers.value.data.length || 0) : 0,
        places: resPlaces.status === 'fulfilled' ? (resPlaces.value.data.places?.length || resPlaces.value.data.length || 0) : 0,
        contacts: resMessages.status === 'fulfilled' ? (resMessages.value.data.length || 0) : 0
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (target) => {
    if (typeof setTab === 'function') {
      setTab(target);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-[#7E7869] animate-pulse font-black text-2xl italic font-['Kanit']">
        กำลังประมวลผลข้อมูล...
      </div>
    </div>
  );

  return (
    <div className="p-8 md:p-12 animate-fade-in font-['Kanit'] bg-[#FDF8F1]">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 style={{ fontSize: '48px' }} className="font-black text-[#4A453A] leading-tight">แดชบอร์ด</h1>
          <p style={{ fontSize: '18px' }} className="text-[#7E7869]">ยินดีต้อนรับกลับมา, คุณ {adminData?.firstName || 'Admin'}</p>
        </div>
        <div className="flex items-center gap-6">
          <div 
            onClick={() => handleTabChange("messages")}
            className="bg-white p-4 rounded-2xl shadow-sm relative cursor-pointer hover:scale-105 hover:shadow-md transition-all active:scale-95"
          >
            <Bell className="w-7 h-7 text-[#4A453A]" />
            {stats.contacts > 0 && <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>}
          </div>

          <Link 
            to="/admin/profile" 
            title="แก้ไขโปรไฟล์"
            className="relative group cursor-pointer active:scale-95 transition-all"
          >
            <img 
              src={adminData?.profileImage || `https://ui-avatars.com/api/?name=${adminData?.firstName}&background=FF8E6E&color=fff`} 
              className="w-16 h-16 rounded-[1.5rem] border-4 border-white shadow-xl object-cover group-hover:border-[#FF8E6E] transition-all" 
              alt="profile"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-opacity flex items-center justify-center">
               <span className="text-[10px] text-white font-black uppercase tracking-tighter bg-[#FF8E6E] px-2 py-0.5 rounded-lg shadow-sm">Edit</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div onClick={() => handleTabChange("users")} className="bg-white p-10 rounded-[3rem] shadow-sm border border-white hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer active:scale-95">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-blue-500"><Users size={32} /></div>
          <p className="font-bold text-[#7E7869] mb-1 text-[16px] uppercase tracking-wider">สมาชิกทั้งหมด</p>
          <h3 style={{ fontSize: '38px' }} className="font-black text-[#4A453A]">{stats.users.toLocaleString()} <span className="text-sm font-bold text-gray-300">คน</span></h3>
        </div>
        
        <div onClick={() => handleTabChange("places")} className="bg-white p-10 rounded-[3rem] shadow-sm border border-white hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer active:scale-95">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-[#FF8E6E]"><MapPin size={32} /></div>
          <p className="font-bold text-[#7E7869] mb-1 text-[16px] uppercase tracking-wider">สถานที่ในระบบ</p>
          <h3 style={{ fontSize: '38px' }} className="font-black text-[#4A453A]">{stats.places.toLocaleString()} <span className="text-sm font-bold text-gray-300">พิกัด</span></h3>
        </div>

        <div onClick={() => handleTabChange("messages")} className="bg-white p-10 rounded-[3rem] shadow-sm border border-white hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer active:scale-95">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-green-500"><MessageSquare size={32} /></div>
          <p className="font-bold text-[#7E7869] mb-1 text-[16px] uppercase tracking-wider">ข้อความใหม่</p>
          <h3 style={{ fontSize: '38px' }} className={`font-black ${stats.contacts > 0 ? 'text-[#FF8E6E]' : 'text-[#4A453A]'}`}>{stats.contacts} <span className="text-sm font-bold text-gray-300">แชท</span></h3>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-white">
        <div className="flex items-center gap-8 p-8 bg-[#FDF8F1] rounded-[2.5rem] border border-[#EFE9D9]">
          <div className="relative">
             <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white font-black animate-pulse shadow-lg shadow-green-500/20">LIVE</div>
             <div className="absolute -inset-2 bg-green-500/10 rounded-full animate-ping" />
          </div>
          <div className="flex-1">
            <p className="font-black text-[#4A453A] text-2xl mb-1">ระบบออนไลน์พร้อมใช้งาน</p>
            <p className="text-[#7E7869] text-lg font-medium">แอดมินสามารถสลับหน้าจัดการข้อมูลสถานที่และสมาชิกในนครปฐมได้ทันทีผ่านแถบเมนูหลัก</p>
          </div>
        </div>
      </div>
    </div>
  );
}