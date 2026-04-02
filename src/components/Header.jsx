import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Heart,
  X,
  LogOut,
  User,
  BookOpen,
  HelpCircle,
  Clock,
  Map,
} from "lucide-react";
import api from "@/api/axios";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const loadUserFromLocal = () => {
    const data = localStorage.getItem("user");
    setUser(data ? JSON.parse(data) : null);
  };

  const handleForceLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
  };

  const verifyTokenWithBackend = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleForceLogout();
      return;
    }
    try {
      const res = await api.get("/auth/me");
      const userData = res.data.user || res.data;
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      if (err.response?.status === 401) {
        Swal.fire({
          icon: "warning",
          title: "เซสชันหมดอายุ!",
          text: "กรุณาเข้าสู่ระบบใหม่",
          confirmButtonColor: "#FF8E6E",
          confirmButtonText: "ตกลง",
          allowOutsideClick: false,
          customClass: { popup: "rounded-[2rem]" },
        }).then(() => {
          handleForceLogout();
          window.dispatchEvent(new Event("authChange"));
          navigate("/login");
        });
      } else {
        handleForceLogout();
      }
    }
  };

  useEffect(() => {
    loadUserFromLocal();
    verifyTokenWithBackend();
    const handleAuthChange = () => {
      loadUserFromLocal();
      verifyTokenWithBackend();
    };
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setMenuOpen(false);
    };
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authChange", handleAuthChange);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authChange", handleAuthChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    Swal.fire({
      title: "ไปพักผ่อนสักหน่อยไหม?",
      text: "ออกจากระบบเพื่อความปลอดภัย",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#FF8E6E",
      confirmButtonText: "ตกลง",
      cancelButtonText: "ยกเลิก",
      background: "#F9F4E8",
      customClass: { popup: "rounded-[2rem]" },
    }).then((res) => {
      if (res.isConfirmed) {
        handleForceLogout();
        window.dispatchEvent(new Event("authChange"));
        navigate("/login");
      }
    });
  };

  const isActive = (path) => location.pathname === path;

  const avatarUrl =
    user?.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || "U")}&background=FF7F67&color=fff`;

  const userMenuLinks = [
    { to: "/profile", label: "โปรไฟล์ของฉัน", icon: <User size={15} /> },
    { to: "/favorites", label: "รายการโปรด", icon: <Heart size={15} /> },
    { to: "/history", label: "ประวัติการนำทาง", icon: <Clock size={15} /> },
    { to: "/planner", label: "วางแผนการเดินทาง", icon: <Map size={15} /> },
    { to: "/guide", label: "คู่มือการใช้งาน", icon: <BookOpen size={15} /> },
    { to: "/contact", label: "ศูนย์ช่วยเหลือ", icon: <HelpCircle size={15} /> },
  ];

  const guestMenuLinks = [
    { to: "/guide", label: "คู่มือการใช้งาน", icon: <BookOpen size={15} /> },
    { to: "/contact", label: "ศูนย์ช่วยเหลือ", icon: <HelpCircle size={15} /> },
  ];

  return (
    <>
      <header className="fixed top-2 sm:top-3 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
        <nav
          className="
          pointer-events-auto w-full sm:max-w-5xl
          h-14 sm:h-[70px]
          flex items-center justify-between
          bg-[#F9F4E8]/90 backdrop-blur-xl
          px-4 sm:px-6
          rounded-full sm:rounded-3xl
          border border-white/50
          shadow-[0_4px_20px_rgba(74,69,58,0.08)]
          overflow-visible
        "
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center flex-shrink-0 relative overflow-visible"
          >
            {/* มือถือ: logo ปกติใน flow, desktop: absolute ล้นขึ้น */}
            <img
              src="/logo1.png"
              alt="MoodPlace"
              className="
                h-10 sm:h-[110px] w-auto
                sm:absolute sm:top-1/2 sm:left-0 sm:-translate-y-1/2 sm:z-10
                drop-shadow-[0_4px_10px_rgba(255,142,110,0.2)]
                hover:scale-105 transition-transform duration-300
              "
            />
          </Link>

          {/* Desktop center links */}
          <div className="hidden sm:flex gap-1 flex-1 justify-center ml-8">
            {[
              { to: "/guide", label: "คู่มือ" },
              { to: "/contact", label: "ศูนย์ช่วยเหลือผู้ใช้" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`relative px-5 py-2.5 rounded-2xl text-[0.9rem] transition-all
                  hover:bg-[#EFE9D9] hover:text-[#FF8E6E] font-medium
                  ${isActive(l.to) ? "text-[#FF8E6E] font-semibold" : "text-[#7E7869]"}`}
              >
                {l.label}
                {isActive(l.to) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FF8E6E]" />
                )}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
            ref={dropdownRef}
          >
            {user ? (
              <>
                {/* Favorites — desktop only */}
                <Link
                  to="/favorites"
                  className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-[#EFE9D9] transition-colors group"
                >
                  <Heart
                    size={20}
                    className={
                      isActive("/favorites")
                        ? "fill-[#FF8E6E] text-[#FF8E6E]"
                        : "text-[#4A453A] group-hover:text-[#FF8E6E]"
                    }
                  />
                </Link>

                {/* Avatar + hamburger toggle */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border-2 border-transparent hover:border-[#FF8E6E] transition-all"
                >
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
                  />
                  {/* hamburger icon มือถือ */}
                  <span className="sm:hidden text-[#4A453A]">
                    {menuOpen ? (
                      <X size={18} />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                      </svg>
                    )}
                  </span>
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div
                    className="
                    fixed sm:absolute top-[68px] sm:top-[62px] left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-0
                    w-[calc(100vw-32px)] sm:w-56
                    bg-[#F9F4E8] rounded-2xl
                    shadow-[0_20px_50px_rgba(0,0,0,0.12)]
                    border border-[#EFE9D9] overflow-hidden z-50
                  "
                  >
                    {/* user info */}
                    <div className="px-4 py-3 border-b border-[#EFE9D9] flex items-center gap-3">
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-[#4A453A] truncate">
                          {user.firstName} {user.lastName || ""}
                        </p>
                        <p className="text-xs text-[#AFA99B] truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* links — 2 col grid on mobile for compact look */}
                    <div className="p-2 grid grid-cols-2 sm:grid-cols-1 gap-1 sm:gap-0">
                      {userMenuLinks.map((l) => (
                        <Link
                          key={l.to}
                          to={l.to}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-colors
                            ${isActive(l.to) ? "bg-orange-50 text-[#FF8E6E]" : "text-[#4A453A] hover:bg-[#EFE9D9] hover:text-[#FF8E6E]"}`}
                        >
                          <span
                            className={
                              isActive(l.to)
                                ? "text-[#FF8E6E]"
                                : "text-[#AFA99B]"
                            }
                          >
                            {l.icon}
                          </span>
                          {l.label}
                        </Link>
                      ))}
                    </div>

                    <div className="px-2 pb-2">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-colors border-t border-[#EFE9D9] mt-1 pt-3"
                      >
                        <LogOut size={15} /> ออกจากระบบ
                      </button>
                    </div>
                  </div>
                )}

                {/* Logout button — desktop only */}
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-1.5 text-red-400 hover:text-red-500 text-sm font-medium px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                {/* Guest: hamburger on mobile */}
                <div className="sm:hidden relative" ref={dropdownRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#EFE9D9] transition-colors text-[#4A453A]"
                  >
                    {menuOpen ? (
                      <X size={20} />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                      </svg>
                    )}
                  </button>
                  {menuOpen && (
                    <div className="absolute top-12 right-0 w-52 bg-[#F9F4E8] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#EFE9D9] overflow-hidden z-50 p-2">
                      {guestMenuLinks.map((l) => (
                        <Link
                          key={l.to}
                          to={l.to}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium text-[#4A453A] hover:bg-[#EFE9D9] hover:text-[#FF8E6E] transition-colors"
                        >
                          <span className="text-[#AFA99B]">{l.icon}</span>
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  to="/login"
                  className="text-[#7E7869] hover:text-[#FF8E6E] text-sm font-medium px-3 py-2 transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-[#FF8E6E] to-[#FFB385] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-[0_4px_15px_rgba(255,127,103,0.3)] hover:scale-105 transition-all whitespace-nowrap"
                >
                  เริ่มใช้งาน
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* spacer ดัน content ไม่ให้ถูก navbar บัง */}
      <div className="h-14 sm:h-20" />
    </>
  );
}
