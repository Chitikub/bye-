'use client';
import { useState, useEffect } from "react";
import { Users, MapPin, MessageSquare, Bell } from "lucide-react";
import api from "@/api/axios";
import { Link } from "react-router-dom";

export default function AdminDashboard({ setTab }) {
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState({ users: 0, places: 0, contacts: 0 });
  const [loading, setLoading] = useState(true);

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
        users: resUsers.status === 'fulfilled' 
          ? (resUsers.value.data.users?.length || resUsers.value.data.length || 0) 
          : 0,
        places: resPlaces.status === 'fulfilled' 
          ? (resPlaces.value.data.places?.length || resPlaces.value.data.length || 0) 
          : 0,
        contacts: resMessages.status === 'fulfilled' 
          ? (resMessages.value.data.length || 0) 
          : 0
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setAdminData(user);
    fetchDashboardStats();
  }, []);

  const handleTabChange = (target) => {
    if (typeof setTab === 'function') {
      setTab(target);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-[#7E7869] animate-pulse font-black text-xl md:text-2xl italic font-['Kanit']">
        กำลังประมวลผลข้อมูล...
      </div>
    </div>
  );

  return (
    // ปรับ Padding รอบนอกให้ยืดหยุ่นตามหน้าจอ
    <div className="p-4 sm:p-8 md:p-12 animate-fade-in font-['Kanit'] bg-[#FDF8F1] min-h-screen">
      
      {/* Header Section: ปรับขนาด Text และการจัดวาง */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-[#4A453A] leading-tight">แดชบอร์ด</h1>
          <p className="text-base md:text-lg text-[#7E7869]">ยินดีต้อนรับกลับมา, คุณ {adminData?.firstName || 'Admin'}</p>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6 self-end sm:self-center">
          <div 
            onClick={() => handleTabChange("messages")}
            className="bg-white p-3 md:p-4 rounded-2xl shadow-sm relative cursor-pointer hover:scale-105 transition-all"
          >
            <Bell className="w-6 h-6 md:w-7 md:h-7 text-[#4A453A]" />
            {stats.contacts > 0 && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse" />
            )}
          </div>

          <Link 
            to="/admin/profile" 
            className="relative group cursor-pointer active:scale-95 transition-all"
          >
            <img 
              src={adminData?.profileImage || `https://ui-avatars.com/api/?name=${adminData?.firstName}&background=FF8E6E&color=fff`} 
              className="w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.5rem] border-4 border-white shadow-xl object-cover" 
              alt="profile"
            />
          </Link>
        </div>
      </header>

      {/* Stats Cards Grid: ปรับ Padding ใน Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
        {/* User Card */}
        <div onClick={() => handleTabChange("users")} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-white hover:shadow-xl transition-all cursor-pointer">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 text-blue-500">
            <Users className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <p className="font-bold text-[#7E7869] mb-1 text-sm md:text-base uppercase tracking-wider">สมาชิกทั้งหมด</p>
          <h3 className="text-3xl md:text-4xl font-black text-[#4A453A]">
            {stats.users.toLocaleString()} <span className="text-sm font-bold text-gray-300">คน</span>
          </h3>
        </div>
        
        {/* Places Card */}
        <div onClick={() => handleTabChange("places")} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-white hover:shadow-xl transition-all cursor-pointer">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-50 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 text-[#FF8E6E]">
            <MapPin className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <p className="font-bold text-[#7E7869] mb-1 text-sm md:text-base uppercase tracking-wider">สถานที่ในระบบ</p>
          <h3 className="text-3xl md:text-4xl font-black text-[#4A453A]">
            {stats.places.toLocaleString()} <span className="text-sm font-bold text-gray-300">พิกัด</span>
          </h3>
        </div>

        {/* Message Card: sm:col-span-2 บนหน้าจอ Tablet เพื่อความสวยงาม */}
        <div onClick={() => handleTabChange("messages")} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-white hover:shadow-xl transition-all cursor-pointer sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-green-50 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 text-green-500">
            <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <p className="font-bold text-[#7E7869] mb-1 text-sm md:text-base uppercase tracking-wider">ข้อความใหม่</p>
          <h3 className={`text-3xl md:text-4xl font-black ${stats.contacts > 0 ? 'text-[#FF8E6E]' : 'text-[#4A453A]'}`}>
            {stats.contacts} <span className="text-sm font-bold text-gray-300">แชท</span>
          </h3>
        </div>
      </div>

      {/* Online Status Banner: ปรับเป็น Column บนมือถือ */}
      <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] p-4 md:p-10 shadow-sm border border-white">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 p-6 md:p-8 bg-[#FDF8F1] rounded-[1.5rem] md:rounded-[2.5rem] border border-[#EFE9D9]">
          <div className="relative">
             <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-500 flex items-center justify-center text-white font-black animate-pulse shadow-lg shadow-green-500/20 text-sm md:text-base">LIVE</div>
             <div className="absolute -inset-2 bg-green-500/10 rounded-full animate-ping" />
          </div>
          <div className="text-center md:text-left">
            <p className="font-black text-[#4A453A] text-xl md:text-2xl mb-1">ระบบออนไลน์พร้อมใช้งาน</p>
            <p className="text-[#7E7869] text-sm md:text-lg font-medium">
              แอดมินสามารถสลับหน้าจัดการข้อมูลสถานที่และสมาชิกได้ทันที
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}