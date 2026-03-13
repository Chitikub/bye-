"use client";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Trash2, Search, Ban, CheckCircle, Users } from "lucide-react";
// 🌟 นำเข้า api ตัวกลางของเรา
import api from "@/api/axios"; 
import Swal from "sweetalert2";

export default function AdminUsers() {
  const context = useOutletContext();
  const setTab = context?.setTab;

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 🌟 ดึงข้อมูลสมาชิกทั้งหมด
  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      // ใช้ api.get ได้เลยครับ ระบบจะจัดการเรื่อง Token และ Base URL ให้เอง
      const res = await api.get("/admin/users");
      const data = res.data.users || res.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // 🌟 ฟังก์ชัน ระงับ/ปลดระงับ การใช้งาน
  const handleToggleBan = async (user) => {
    const userId = user.id || user._id;
    const isBanned = user.status === "banned" || user.isBanned === true;

    const result = await Swal.fire({
      title: isBanned ? "ปลดระงับสมาชิก?" : "ระงับการใช้งาน?",
      text: `ยืนยันรายการสำหรับคุณ ${user.firstName}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isBanned ? "#10B981" : "#EF4444",
      confirmButtonText: "ตกลง",
      cancelButtonText: "ยกเลิก",
      background: "#FDF8F1",
      customClass: { popup: "rounded-[2rem]" },
    });

    if (result.isConfirmed) {
      try {
        const endpoint = isBanned ? "unban" : "ban";
        // ยิงไปที่ /admin/users/:id/ban หรือ unban ตามรายการ API ของคุณ
        await api.put(`/admin/users/${userId}/${endpoint}`);

        Swal.fire({
          title: "สำเร็จ!",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
        fetchAllUsers();
      } catch (e) {
        Swal.fire("ผิดพลาด", e.response?.data?.message || "ทำรายการไม่สำเร็จ", "error");
      }
    }
  };

  // 🌟 ฟังก์ชันลบสมาชิกถาวร
  const handleDeleteUser = async (user) => {
    const userId = user.id || user._id;

    if (user.role === "admin") {
      return Swal.fire("คำเตือน", "ไม่สามารถลบผู้ดูแลระบบได้", "warning");
    }

    const { value: confirmText } = await Swal.fire({
      title: "ลบสมาชิกถาวร?",
      text: `กรุณาพิมพ์คำว่า "DELETE" เพื่อยืนยันการลบคุณ ${user.firstName}`,
      icon: "error",
      input: "text",
      inputPlaceholder: "พิมพ์ DELETE ที่นี่...",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "ยืนยันการลบ",
      cancelButtonText: "ยกเลิก",
      background: "#FDF8F1",
      customClass: { popup: "rounded-[2rem]" },
      inputValidator: (value) => {
        if (value !== "DELETE") return "กรุณาพิมพ์คำว่า DELETE ให้ถูกต้อง";
      },
    });

    if (confirmText === "DELETE") {
      try {
        // แนบ data: { confirmText: "DELETE" } ตามที่ Backend ต้องการ
        await api.delete(`/admin/users/${userId}`, {
          data: { confirmText: "DELETE" }
        });

        Swal.fire({
          title: "สำเร็จ!",
          text: "ลบสมาชิกออกจากระบบเรียบร้อยแล้ว",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchAllUsers();
      } catch (e) {
        Swal.fire("ผิดพลาด", e.response?.data?.message || "ไม่สามารถลบข้อมูลได้", "error");
      }
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 animate-fade-in font-['Kanit'] bg-[#FDF8F1] min-h-screen">
      {/* ส่วนหัว และ Input ค้นหา (คงเดิมตามดีไซน์สวยๆ ของคุณ) */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#4A453A] leading-tight">
            จัดการ <span className="text-[#FF8E6E]">สมาชิก</span>
          </h1>
          <p className="text-base text-[#7E7869] font-medium">ควบคุมสิทธิ์และสถานะการเข้าใช้งานของผู้ใช้</p>
        </div>
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="ค้นหาสมาชิก..."
            className="w-full pl-12 pr-6 py-3 rounded-2xl bg-white border-none shadow-sm focus:shadow-md outline-none transition-all text-sm font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* ตารางแสดงรายชื่อ (คงเดิมตามดีไซน์ของคุณ) */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-[#4A453A]/5 overflow-hidden border border-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#4A453A] text-white">
              <tr>
                <th className="p-6 font-bold text-sm uppercase tracking-widest rounded-tl-[2.5rem]">ข้อมูลสมาชิก</th>
                <th className="p-6 font-bold text-sm uppercase tracking-widest">อีเมล</th>
                <th className="p-8 font-bold text-sm uppercase tracking-widest text-center">สถานะ</th>
                <th className="p-8 font-bold text-sm uppercase tracking-widest text-center rounded-tr-[2.5rem]">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-[#7E7869] animate-pulse font-bold text-lg italic opacity-50">กำลังโหลดข้อมูล...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u, index) => {
                  const isBanned = u.status === "banned" || u.isBanned === true;
                  return (
                    <tr key={u.id || u._id || index} className={`transition-all ${isBanned ? "bg-red-50/40" : "hover:bg-gray-50/50"}`}>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={u.profileImage || `https://ui-avatars.com/api/?name=${u.firstName}&background=FF7F67&color=fff`}
                            className="w-12 h-12 rounded-xl object-cover shadow-sm border-2 border-white"
                            alt="avatar"
                          />
                          <div className="flex flex-col">
                            <span className="font-black text-[#4A453A] text-lg leading-tight">{u.firstName} {u.lastName}</span>
                            {isBanned && <span className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-0.5 flex items-center gap-1"><Ban size={10} /> ถูกระงับ</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-[#4A453A] font-medium text-sm">{u.email}</td>
                      <td className="p-6 text-center">
                        <span className={`px-4 py-1.5 rounded-xl font-black text-[10px] border-2 ${isBanned ? "bg-red-100 text-red-600 border-red-100" : "bg-green-100 text-green-600 border-green-100"}`}>
                          {isBanned ? "BANNED" : "ACTIVE"}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleToggleBan(u)} className={`p-3 rounded-xl transition-all shadow-sm active:scale-90 ${isBanned ? "bg-green-500 text-white hover:bg-green-600" : "bg-red-50 text-red-500 hover:bg-red-100"}`}>
                            {isBanned ? <CheckCircle size={18} /> : <Ban size={18} />}
                          </button>
                          <button onClick={() => handleDeleteUser(u)} className="p-3 text-gray-300 hover:text-white hover:bg-red-600 rounded-xl transition-all active:scale-90">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="4" className="p-20 text-center text-gray-400 font-bold text-base italic">ไม่พบข้อมูลสมาชิก</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}