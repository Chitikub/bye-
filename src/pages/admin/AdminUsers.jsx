'use client';
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom"; // ✨ ใช้ดึงฟังก์ชันจาก Layout
import { 
  Users, Trash2, Search, Ban, CheckCircle 
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

export default function AdminUsers() {
  // ดึง setTab มาจาก Context ที่ส่งมาจาก Admin.jsx หรือ Layout.jsx
  const context = useOutletContext();
  const setTab = context?.setTab;

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = "https://moodlocationfinder-backend.onrender.com/api/v1";
      const res = await axios.get(`${baseUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.users || res.data;
      setUsers(Array.isArray(data) ? data : []); 
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllUsers(); }, []);

  const handleToggleBan = async (user) => {
    const userId = user._id || user.id;
    const isBanned = user.isBanned === true || user.status === 'banned';
    const result = await Swal.fire({
      title: isBanned ? 'ปลดระงับสมาชิก?' : 'ระงับการใช้งาน?',
      text: `ยืนยันรายการสำหรับคุณ ${user.firstName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isBanned ? '#10B981' : '#EF4444',
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก',
      background: '#FDF8F1',
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(`https://moodlocationfinder-backend.onrender.com/api/v1/admin/users/${userId}/ban`, 
          { isBanned: !isBanned }, { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire({ title: 'สำเร็จ!', icon: 'success', timer: 1000, showConfirmButton: false });
        fetchAllUsers();
      } catch (e) { 
        Swal.fire('ผิดพลาด', 'ทำรายการไม่สำเร็จ', 'error'); 
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 md:p-12 animate-fade-in font-['Kanit'] bg-[#FDF8F1]">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 style={{ fontSize: '48px' }} className="font-black text-[#4A453A] leading-tight">จัดการ <span className="text-[#FF8E6E]">สมาชิก</span></h1>
          <p style={{ fontSize: '18px' }} className="text-[#7E7869]">ควบคุมสิทธิ์และสถานะการเข้าใช้งานของผู้ใช้ทั้งหมด</p>
        </div>
        <div className="relative w-full md:w-[350px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            style={{ fontSize: '18px' }}
            type="text" 
            placeholder="ค้นหาสมาชิก..." 
            className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] bg-white border-none shadow-sm focus:shadow-md outline-none transition-all text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Table Section */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-[#4A453A]/5 overflow-hidden border border-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#4A453A] text-white">
              <tr>
                <th className="p-8 font-bold text-[16px] uppercase tracking-widest rounded-tl-[3rem]">ข้อมูลสมาชิก</th>
                <th className="p-8 font-bold text-[16px] uppercase tracking-widest">อีเมล</th>
                <th className="p-8 font-bold text-[16px] uppercase tracking-widest text-center">ระดับ (Role)</th>
                <th className="p-8 font-bold text-[16px] uppercase tracking-widest text-center rounded-tr-[3rem]">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
  {loading ? (
    <tr><td colSpan="4" className="p-32 text-center text-[#7E7869] animate-pulse font-bold text-xl italic">กำลังโหลดข้อมูล...</td></tr>
  ) : filteredUsers.length > 0 ? (
    filteredUsers.map((u, index) => { // ✨ เพิ่ม index เข้ามาเป็นตัวช่วยสำรอง
      const isBanned = u.isBanned === true || u.status === 'banned';
      
      // ✨ สร้าง Unique Key ที่ปลอดภัยที่สุด: ใช้ ID ถ้าไม่มีให้ใช้ index
      const rowKey = u._id || u.id || `user-row-${index}`; 

      return (
        <tr key={rowKey} className={`transition-all ${isBanned ? 'bg-red-50/40 opacity-70' : 'hover:bg-gray-50/50'}`}>
          <td className="p-8">
            <div className="flex items-center gap-5">
              <img 
                src={u.profileImage || `https://ui-avatars.com/api/?name=${u.firstName}&background=FF7F67&color=fff`} 
                className="w-16 h-16 rounded-2xl object-cover shadow-sm border-2 border-white" 
                alt="user" 
              />
              <div className="flex flex-col">
                 <span style={{ fontSize: '19px' }} className="font-black text-[#4A453A]">{u.firstName} {u.lastName}</span>
                 {isBanned && (
                   <span className="text-[11px] text-red-500 font-black uppercase tracking-widest mt-1 flex items-center gap-1">
                     <Ban size={12} /> ถูกระงับการใช้งาน
                   </span>
                 )}
              </div>
            </div>
          </td>
          <td className="p-8 text-[#4A453A] font-medium text-[17px]">{u.email}</td>
          <td className="p-8 text-center">
            <span className={`px-5 py-2 rounded-xl font-black text-sm border-2 transition-all ${u.role === 'admin' ? 'bg-orange-50 text-[#FF8E6E] border-orange-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
              {u.role?.toUpperCase() || 'USER'}
            </span>
          </td>
          <td className="p-8">
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => handleToggleBan(u)} 
                className={`p-3.5 rounded-2xl transition-all shadow-sm active:scale-90 ${isBanned ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
              >
                {isBanned ? <CheckCircle className="w-6 h-6" /> : <Ban className="w-6 h-6" />}
              </button>
              <button className="p-3.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90">
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
          </td>
        </tr>
      );
    })
  ) : (
    <tr><td colSpan="4" className="p-32 text-center text-gray-400 font-bold text-lg italic">ไม่มีข้อมูลสมาชิกที่ตรงตามเงื่อนไข</td></tr>
  )}
</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}