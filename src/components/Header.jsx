import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Theme Config
  const colors = {
    warmCream: "#F9F4E8",
    coral: "#FF8E6E",
    darkPaper: "#4A453A",
    softSand: "#EFE9D9",
  };

  const checkUser = () => {
    const data = localStorage.getItem("user");
    setUser(data ? JSON.parse(data) : null);
  };

  useEffect(() => {
    checkUser();
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'ไปพักผ่อนสักหน่อยไหม?',
      text: "ออกจากระบบเพื่อความปลอดภัย",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: colors.coral,
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก',
      background: colors.warmCream,
    }).then((res) => {
      if (res.isConfirmed) {
        localStorage.clear();
        setUser(null);
        navigate("/login");
      }
    });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={headerWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;600&display=swap');
        * { font-family: 'Prompt', sans-serif; }
        .nav-item { position: relative; transition: 0.3s; padding: 10px 20px; border-radius: 15px; }
        .nav-item:hover { background: ${colors.softSand}; color: ${colors.coral} !important; }
        .active-nav { color: ${colors.coral} !important; font-weight: 600; }
        .active-nav::after { content: ''; position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); width: 5px; height: 5px; background: ${colors.coral}; border-radius: 50%; }
        .cta-btn { transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .cta-btn:hover { transform: scale(1.05); box-shadow: 0 8px 25px rgba(255, 127, 103, 0.4); }
        .profile-avatar { transition: 0.3s; border: 2px solid transparent; border-radius: 14px; }
        .profile-avatar:hover { border-color: ${colors.coral}; cursor: pointer; transform: translateY(-2px); }
      `}</style>

      <nav style={navCard}>
  {/* LOGO AREA: เอาตัวอักษรออกแล้วขยายรูปให้ใหญ่ขึ้น */}
{/* LOGO AREA: ไม่มีกรอบ เป็นโลโก้ลอยตัวว */}
<Link to="/" style={{ ...logoStyle, position: 'relative', overflow: 'visible' }}>
  <img 
    src="/logo1.png" 
    alt="MoodPlace Logo" 
    style={{ 
      height: '110px',      // เพิ่มความสูงให้ใหญ่กว่า Navbar
      width: 'auto', 
      position: 'absolute', // ทำให้ลอยเป็นอิสระ
      top: '50%',           // จัดกึ่งกลางแนวตั้ง
      transform: 'translateY(-50%)', // ปรับจุดกึ่งกลางให้เป๊ะ
      left: '0',
      display: 'block',
      filter: `drop-shadow(0 8px 15px ${colors.coral}33)`, 
      transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      zIndex: 10,           // มั่นใจว่าอยู่เหนือแถบเมนู
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
      e.currentTarget.style.filter = `drop-shadow(0 12px 20px ${colors.coral}44)`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
      e.currentTarget.style.filter = `drop-shadow(0 8px 15px ${colors.coral}33)`;
    }}
  />
</Link>

  {/* NAVIGATION AREA */}
  <div style={menuCenter}>
    <Link to="/" className={`nav-item ${isActive("/") ? "active-nav" : ""}`} style={linkBase}>หน้าแรก</Link>
    <Link to="/guide" className={`nav-item ${isActive("/guide") ? "active-nav" : ""}`} style={linkBase}>คู่มือ</Link>
    <Link to="/contact" className={`nav-item ${isActive("/contact") ? "active-nav" : ""}`} style={linkBase}>ติดต่อเรา</Link>
  </div>

  {/* USER AREA */}
  <div style={userSection}>
    {user ? (
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <img
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="profile-avatar"
          src={user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}&background=FF7F67&color=fff`}
          style={avatarStyle}
          alt="Profile"
        />
        {/* ... (Dropdown เหมือนเดิม) ... */}
      </div>
    ) : (
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Link to="/login" style={{ ...linkBase, padding: '10px 15px', fontWeight: 500 }}>เข้าสู่ระบบ</Link>
        <Link to="/register" className="cta-btn" style={signUpBtn}>เริ่มต้นใช้งาน</Link>
      </div>
    )}
  </div>
</nav>
    </header>
  );
}

// --- Styles ---
const headerWrapper = {
  position: "fixed",
  top: "15px",
  left: "0",
  right: "0",
  display: "flex",
  justifyContent: "center",
  padding: "0 20px",
  zIndex: 1000,
  pointerEvents: "none",
};

const navCard = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  maxWidth: "1200px",
  backgroundColor: "rgba(249, 244, 232, 0.85)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  padding: "10px 25px",
  borderRadius: "24px",
  border: "1px solid rgba(255, 255, 255, 0.5)",
  boxShadow: "0 15px 35px rgba(74, 69, 58, 0.08)",
  pointerEvents: "auto",
  height: "70%", // กำหนดความสูง Navbar ให้คงที่ชัดเจน
  overflow: "visible", // สำคัญ เพื่อให้โลโก้ที่ใหญ่กว่าล้นออกมาได้
};

const logoStyle = {
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  flex: 1
};

const menuCenter = {
  display: "flex",
  gap: "5px",
  flex: 2,
  justifyContent: "center"
};

const userSection = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  flex: 1
};

const linkBase = {
  textDecoration: "none",
  color: "#7E7869",
  fontSize: "0.95rem",
};

const signUpBtn = {
  background: "linear-gradient(135deg, #FF8E6E 0%, #FFB385 100%)",
  color: "white",
  padding: "10px 22px",
  borderRadius: "16px",
  textDecoration: "none",
  fontWeight: "600",
  fontSize: "0.95rem",
  boxShadow: "0 4px 15px rgba(255, 127, 103, 0.3)",
};

const avatarStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  objectFit: "cover",
};

const dropdownStyle = {
  position: "absolute",
  top: "55px",
  right: "0",
  width: "220px",
  backgroundColor: "#F9F4E8",
  borderRadius: "20px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
  overflow: "hidden",
  border: "1px solid #EFE9D9",
  animation: "fadeIn 0.2s ease-out"
};

const dropBtn = {
  width: "100%",
  padding: "12px 20px",
  border: "none",
  background: "none",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "0.9rem",
  color: "#4A453A",
  transition: "0.2s"
};