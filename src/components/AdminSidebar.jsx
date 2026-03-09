'use client';
import { 
  Users, MapPin, ShieldCheck, LogOut, 
  LayoutDashboard, MessageCircle 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminSidebar({ currentTab, setTab, contactsCount = 0 }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  const menuItems = [
    { id: "dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
    { id: "places", label: "จัดการสถานที่", icon: MapPin },
    { id: "users", label: "จัดการสมาชิก", icon: Users },
    { id: "messages", label: "ตอบแชทผู้ใช้", icon: MessageCircle, badge: contactsCount },
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
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all relative ${
              currentTab === item.id
                ? "bg-[#FF8E6E] font-bold shadow-lg shadow-[#FF8E6E]/20 text-white opacity-100"
                : "hover:bg-white/10 opacity-70 hover:opacity-100 text-white"
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
        ))}
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