import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2"; 
import 'bootstrap-icons/font/bootstrap-icons.css';
import api from "@/api/axios"; // 🌟 นำเข้า axios ที่คุณตั้งค่าไว้

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const dropdownRef = useRef(null);

  const colors = {
    warmCream: "#F9F4E8",
    coral: "#FF8E6E",
    darkPaper: "#4A453A",
    softSand: "#EFE9D9",
  };

  // 🌟 ฟังก์ชันอัปเดตสถานะ User จาก LocalStorage (ใช้ชั่วคราวก่อนเช็ค API)
  const loadUserFromLocal = () => {
    const data = localStorage.getItem("user");
    setUser(data ? JSON.parse(data) : null);
  };

  // 🌟 ฟังก์ชันเช็คว่า Token ยังใช้งานได้จริงไหมกับ Backend
  const verifyTokenWithBackend = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleForceLogout(); // ถ้าไม่มี Token ให้เคลียร์ทุกอย่าง
      return;
    }

    try {
      // 🌟 ยิง API ไปเช็คโปรไฟล์ (เปลี่ยน endpoint ให้ตรงกับ Backend ของคุณ)
      // สมมติว่า Backend มีเส้น GET /auth/me หรือ /users/profile ไว้ให้เช็ค
      const response = await api.get('/auth/me'); 
      
      // ถ้าผ่าน แสดงว่า Token ยังใช้ได้และ User มีตัวตน
      // อัปเดตข้อมูลเผื่อมีการเปลี่ยนแปลง
      const userData = response.data.user || response.data;
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

    } catch (error) {
      console.warn("Token หมดอายุ หรือไม่พบ User ในฐานข้อมูล:", error);
      // 🌟 ถ้า API เออเร่อ (401 Unauthorized หรือ 404 Not Found) ให้บังคับเตะออก
      handleForceLogout();
    }
  };

  // 🌟 ฟังก์ชันบังคับออกจากระบบแบบเงียบๆ (ไม่ขึ้น Alert)
  const handleForceLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsProfileOpen(false);
  };

  useEffect(() => {
    // 1. โหลดข้อมูลจาก LocalStorage มาโชว์ก่อนเพื่อความรวดเร็ว
    loadUserFromLocal();
    
    // 2. เช็คกับ Backend เพื่อความชัวร์ (ถ้าพัง มันจะเตะออกและ Navbar จะเปลี่ยนทันที)
    verifyTokenWithBackend();

    // 🌟 ดักจับ Event ต่างๆ เผื่อมีการ Login/Logout จาก Tab อื่น
    const handleAuthChange = () => {
      loadUserFromLocal();
      verifyTokenWithBackend(); // เช็คอีกรอบเพื่อความชัวร์
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('authChange', handleAuthChange);

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); 
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('authChange', handleAuthChange);
    }; 
  }, [location.pathname]); // 🌟 เพิ่ม dependency เป็น location.pathname เพื่อให้เช็คทุกครั้งที่เปลี่ยนหน้า

  // ฟังก์ชันกดปุ่ม Logout ด้วยตัวเอง (มีแจ้งเตือน)
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
      customClass: { popup: "rounded-[2rem]" },
    }).then((res) => {
      if (res.isConfirmed) {
        handleForceLogout(); // ใช้ฟังก์ชันที่สร้างไว้
        window.dispatchEvent(new Event("authChange"));
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
        .nav-item { position: relative; transition: 0.3s; padding: 10px 20px; border-radius: 15px; text-decoration: none; color: #7E7869; font-size: 0.95rem; }
        .nav-item:hover { background: ${colors.softSand}; color: ${colors.coral} !important; }
        .active-nav { color: ${colors.coral} !important; font-weight: 600; }
        .active-nav::after { content: ''; position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); width: 5px; height: 5px; background: ${colors.coral}; border-radius: 50%; }
        .cta-btn { transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer; border: none; }
        .cta-btn:hover { transform: scale(1.05); box-shadow: 0 8px 25px rgba(255, 127, 103, 0.4); }
        
        .profile-avatar-container { position: relative; transition: 0.3s; border-radius: 50px; padding: 2px; border: 2px solid transparent; }
        .profile-avatar-container:hover { border-color: ${colors.coral}; transform: translateY(-2px); }
        
        .drop-item { width: 100%; padding: 12px 20px; border: none; background: none; text-align: left; cursor: pointer; font-size: 0.9rem; color: #4A453A; transition: 0.2s; display: block; text-decoration: none; }
        .drop-item:hover { background-color: ${colors.softSand}; color: ${colors.coral}; }
        
        .hamburger-icon { font-size: 1.5rem; color: ${colors.darkPaper}; cursor: pointer; transition: 0.3s; display: flex; align-items: center; -webkit-text-stroke: 1px ${colors.darkPaper}; }
        .hamburger-icon:hover { color: ${colors.coral}; -webkit-text-stroke: 1px ${colors.coral}; }
        
        .user-tooltip {
          position: absolute; top: 55px; left: 50%; transform: translateX(-50%); 
          background: ${colors.darkPaper}; color: white; padding: 8px 16px; 
          border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
          width: max-content; z-index: 1100; animation: fadeIn 0.2s ease-out; pointer-events: none;
          font-size: 0.85rem; font-weight: 400;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(-5px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

        .mobile-only-item { display: none; }

        @media (max-width: 1024px) {
          .menu-center { margin-left: 0 !important; justify-content: center !important; }
        }

        @media (max-width: 768px) {
          .menu-center { display: none !important; }
          .mobile-only-item { display: block; }
          .logo-img { height: 70px !important; }
          .logout-btn-text { display: none; }
          .nav-card { padding: 10px 15px !important; }
          .start-btn { padding: 10px 15px !important; font-size: 0.85rem !important; }
        }
      `}</style>

      <nav style={navCard} className="nav-card">
        <Link to="/" style={logoStyle}>
          <img src="/logo1.png" alt="MoodPlace Logo" style={logoImageStyle} className="logo-img" />
        </Link>

        {/* Desktop Menu */}
        <div style={menuCenter} className="menu-center">
          <Link to="/guide" className={`nav-item ${isActive("/guide") ? "active-nav" : ""}`}>คู่มือ</Link>
          <Link to="/contact" className={`nav-item ${isActive("/contact") ? "active-nav" : ""}`}>ศูนย์ช่วยเหลือผู้ใช้</Link>
        </div>

        <div style={userSection}>
          {user ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Link 
                to="/favorites" 
                style={{ textDecoration: 'none', transition: '0.3s' }} 
              >
                <i className={`bi ${location.pathname === '/favorites' ? 'bi-heart-fill' : 'bi-heart'}`} 
                   style={{ fontSize: '1.3rem', color: location.pathname === '/favorites' ? colors.coral : colors.darkPaper }}></i>
              </Link>
              
              <div ref={dropdownRef} style={{ display: 'flex', alignItems: 'center', gap: '8px', position: "relative" }}>
                <div className="hamburger-icon" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                  <i className={`bi ${isProfileOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
                </div>
                
                <div 
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setIsHoveringAvatar(true)}
                  onMouseLeave={() => setIsHoveringAvatar(false)}
                >
                  <Link to="/profile" className="profile-avatar-container" style={{ display: 'block' }}>
                    <img
                      src={user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}&background=FF7F67&color=fff`}
                      style={avatarStyle}
                      alt="Profile"
                    />
                  </Link>
                  
                  {isHoveringAvatar && (
                    <div className="user-tooltip">
                      {user.firstName} {user.lastName || ""}
                    </div>
                  )}
                </div>

                {isProfileOpen && (
                  <div style={dropdownStyle}>
                    <div className="mobile-only-item">
                      <Link to="/guide" className="drop-item" onClick={() => setIsProfileOpen(false)}>คู่มือการใช้งาน</Link>
                      <Link to="/contact" className="drop-item" onClick={() => setIsProfileOpen(false)}>ติดต่อเรา</Link>
                      <hr style={{ margin: '5px 10px', opacity: 0.1 }} />
                    </div>

                    <Link to="/profile" className="drop-item" onClick={() => setIsProfileOpen(false)}>โปรไฟล์ของฉัน</Link>
                    <Link to="/favorites" className="drop-item" onClick={() => setIsProfileOpen(false)}>รายการโปรด</Link>
                    <Link to="/history" className="drop-item" onClick={() => setIsProfileOpen(false)}>ประวัติการนำทาง</Link>
                     <Link to="/planner" className="drop-item" onClick={() => setIsProfileOpen(false)}>วางแผนการเดินทาง</Link>
                  </div>
                )}
              </div>
              
              <button onClick={handleLogout} className="cta-btn" style={logoutBtnStyle}>
                <i className="bi bi-arrow-bar-right" style={{ fontSize: '1.2rem' }}></i>
                <span className="logout-btn-text" style={{ marginLeft: '5px' }}>ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <div ref={dropdownRef} className="mobile-only-item" style={{ position: 'relative', marginRight: '5px' }}>
                 <div className="hamburger-icon" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    <i className="bi bi-list"></i>
                 </div>
                 {isProfileOpen && (
                   <div style={dropdownStyle}>
                      <Link to="/guide" className="drop-item" onClick={() => setIsProfileOpen(false)}>คู่มือการใช้งาน</Link>
                      <Link to="/contact" className="drop-item" onClick={() => setIsProfileOpen(false)}>ศูนย์ช่วยเหลือผู้ใช้</Link>
                   </div>
                 )}
              </div>
              <Link to="/login" style={{ textDecoration: "none", color: "#7E7869", fontSize: "0.85rem", padding: '10px 10px', fontWeight: 500 }}>เข้าสู่ระบบ</Link>
              <Link to="/register" className="cta-btn start-btn" style={signUpBtn}>เริ่มใช้งาน</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

// --- Styles ---
const headerWrapper = { position: "fixed", top: "15px", left: "0", right: "0", display: "flex", justifyContent: "center", padding: "0 10px", zIndex: 1000, pointerEvents: "none" };
const navCard = { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: "1200px", backgroundColor: "rgba(249, 244, 232, 0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "10px 25px", borderRadius: "24px", border: "1px solid rgba(255, 255, 255, 0.5)", boxShadow: "0 15px 35px rgba(74, 69, 58, 0.08)", pointerEvents: "auto", height: "70px", overflow: "visible" };
const logoStyle = { display: "flex", alignItems: "center", textDecoration: "none", flex: 1, position: 'relative', overflow: 'visible' };
const logoImageStyle = { height: '110px', width: 'auto', position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '0', display: 'block', filter: `drop-shadow(0 8px 15px #FF8E6E33)`, transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', zIndex: 10 };
const menuCenter = { display: "flex", gap: "5px", flex: 2, marginLeft: "-200px" };
const userSection = { display: "flex", alignItems: "center", justifyContent: "flex-end", flex: 1 };
const signUpBtn = { background: "linear-gradient(135deg, #FF8E6E 0%, #FFB385 100%)", color: "white", padding: "10px 22px", borderRadius: "16px", textDecoration: "none", fontWeight: "600", fontSize: "0.95rem", boxShadow: "0 4px 15px rgba(255, 127, 103, 0.3)", whiteSpace: 'nowrap' };
const avatarStyle = { width: "40px", height: "40px", borderRadius: "50px", objectFit: "cover", display: 'block' };
const dropdownStyle = { position: "absolute", top: "55px", right: "0", width: "200px", backgroundColor: "#F9F4E8", borderRadius: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.12)", overflow: "hidden", border: "1px solid #EFE9D9" };
const logoutBtnStyle = { color: '#FF6B6B', padding: "8px 12px", borderRadius: "14px", fontSize: "0.85rem", fontWeight: "600", transition: "0.3s", border: 'none', background: 'none', display: 'flex', alignItems: 'center' };