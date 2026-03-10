"use client";
import { useState, useEffect } from "react";
import {
  Users,
  MapPin,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  MessageCircle,
  Home,
  User,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import Swal from "sweetalert2"; // ✅ แก้ไขที่ 1: เพิ่มการ Import Swal

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [contactsCount, setContactsCount] = useState(0);

  useEffect(() => {
    const userStored = JSON.parse(localStorage.getItem("user"));
    if (userStored?.role !== "admin") return;

    const socket = io("https://moodlocationfinder-backend.onrender.com");
    socket.emit("join_admin_room");
    socket.on("receive_message", () => setContactsCount((prev) => prev + 1));

    return () => socket.close();
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "ต้องการออกจากระบบใช่ไหม?",
      text: "คุณจะต้องเข้าสู่ระบบใหม่เพื่อใช้งานอีกครั้ง",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#FF8E6E",
      cancelButtonText: "ยกเลิก",
      confirmButtonText: "ใช่, ออกจากระบบ",
      background: "#F9F4E8",
      customClass: { popup: "rounded-[2rem]" },
    }).then((result) => {
      if (result.isConfirmed) {
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.clear();
        window.dispatchEvent(new Event("authChange"));
        navigate("/login", { replace: true });
      }
    });
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "แดชบอร์ด",
      icon: LayoutDashboard,
      path: "/admin",
    },
    {
      id: "places",
      label: "จัดการสถานที่",
      icon: MapPin,
      path: "/admin/places",
    },
    { id: "users", label: "จัดการสมาชิก", icon: Users, path: "/admin/users" },
    {
      id: "messages",
      label: "ตอบแชทผู้ใช้",
      icon: MessageCircle,
      path: "/admin/messages",
      badge: contactsCount,
    },
    {
      id: "profile",
      label: "โปรไฟล์ของฉัน",
      icon: User,
      path: "/admin/profile",
    },
  ];

  return (
    <aside className="w-64 bg-[#4A453A] text-white hidden md:flex flex-col p-6 sticky top-0 h-screen shadow-xl z-50">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-[#FF8E6E] rounded-xl flex items-center justify-center shadow-lg">
          <ShieldCheck className="text-white" />
        </div>
        <span className="text-xl font-black tracking-tight">Admin Panel</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item, index) => {
          // ✅ แก้ไขที่ 2: ใช้ index ร่วมกับ id เพื่อป้องกัน Key undefined
          const isActive = location.pathname === item.path;
          return (
            <button
              key={`${item.id}-${index}`} // ✅ Unique Key
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all relative ${
                isActive
                  ? "bg-[#FF8E6E] font-bold shadow-lg text-white"
                  : "hover:bg-white/10 opacity-70 text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 text-[10px] flex items-center justify-center rounded-full font-bold animate-bounce text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all mt-auto font-bold border border-red-400/20"
      >
        <LogOut className="w-5 h-5" /> ออกจากระบบ
      </button>
    </aside>
  );
}
