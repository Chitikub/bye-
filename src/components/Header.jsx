import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2"; 
import 'bootstrap-icons/font/bootstrap-icons.css';

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

  const checkUser = () => {
    const data = localStorage.getItem("user");
    setUser(data ? JSON.parse(data) : null);
  };

  useEffect(() => {
    checkUser();
    const handleAuthChange = () => checkUser();
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
        setIsProfileOpen(false);
        window.dispatchEvent(new Event("authChange"));
        navigate("/login"); 
      }
    });
  };

  const isActive = (path) => location.pathname === path;
  const getGenderLabel = (g) => {
    if (g === 'male') return 'ชาย';
    if (g === 'female') return 'หญิง';
    return 'อื่นๆ';
  };

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
        .profile-avatar { transition: 0.3s; border: 2px solid transparent; border-radius: 14px; }
        .profile-avatar:hover { border-color: ${colors.coral}; cursor: pointer; transform: translateY(-2px); }
        .drop-item { width: 100%; padding: 12px 20px; border: none; background: none; text-align: left; cursor: pointer; font-size: 0.9rem; color: #4A453A; transition: 0.2s; }
        .drop-item:hover { background-color: ${colors.softSand}; color: ${colors.coral}; }
        .hamburger-icon {
          font-size: 1.5rem; color: ${colors.darkPaper}; cursor: pointer; transition: 0.3s; display: flex; align-items: center; -webkit-text-stroke: 1px ${colors.darkPaper}; 
        }
        .hamburger-icon:hover { color: ${colors.coral}; -webkit-text-stroke: 1px ${colors.coral}; }
        .user-tooltip {
          position: absolute; top: 55px; left: 50%; transform: translateX(-50%); background: white; padding: 12px 16px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: max-content; z-index: 1100; border: 1px solid #eee; animation: fadeIn 0.2s ease-out; pointer-events: none;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(-5px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

        /* --- New Responsive Logic --- */
        .mobile-only-item { display: none; } /* ซ่อนเป็นค่าเริ่มต้น */

        @media (max-width: 1024px) {
          .menu-center { margin-left: 0 !important; justify-content: center !important; }
        }

        @media (max-width: 768px) {
          .menu-center { display: none !important; } /* ซ่อนเมนูหลักบน Header */
          .mobile-only-item { display: block; } /* แสดงเมนูใน Dropdown แทน */
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
          <Link to="/contact" className={`nav-item ${isActive("/contact") ? "active-nav" : ""}`}>ติดต่อเรา</Link>
        </div>

        <div style={userSection}>
          {user ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Link 
                to="/favorites" 
                style={{ textDecoration: 'none', transition: '0.3s' }} 
                onClick={() => setIsProfileOpen(false)}
              >
                <i 
                  className={`bi ${location.pathname === '/favorites' ? 'bi-heart-fill' : 'bi-heart'}`} 
                  style={{ 
                    fontSize: '1.3rem', 
                    color: location.pathname === '/favorites' ? colors.coral : colors.darkPaper,
                    WebkitTextStroke: location.pathname === '/favorites' ? '0px' : '1px ' + colors.darkPaper,
                    transition: '0.3s all'
                  }}
                ></i>
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
                  <img
                    className="profile-avatar"
                    src={user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}&background=FF7F67&color=fff`}
                    style={avatarStyle}
                    alt="Profile"
                  />
                  {isHoveringAvatar && (
                    <div className="user-tooltip">
                      <div style={{ fontWeight: 600, color: colors.darkPaper, textAlign: "center" }}>{user.firstName}</div>
                    </div>
                  )}
                </div>

                {isProfileOpen && (
                  <div style={dropdownStyle}>
                    {/* --- เพิ่ม คู่มือ และ ติดต่อเรา เข้ามาในนี้ เฉพาะ Mobile --- */}
                    <div className="mobile-only-item">
                      <Link to="/guide" style={{textDecoration: 'none'}} onClick={() => setIsProfileOpen(false)}>
                        <button className="drop-item">คู่มือการใช้งาน</button>
                      </Link>
                      <Link to="/contact" style={{textDecoration: 'none'}} onClick={() => setIsProfileOpen(false)}>
                        <button className="drop-item">ติดต่อเรา</button>
                      </Link>
                      <hr style={{ margin: '5px 10px', opacity: 0.1 }} />
                    </div>

                    <Link to="/profile" style={{textDecoration: 'none'}} onClick={() => setIsProfileOpen(false)}>
                      <button className="drop-item">โปรไฟล์</button>
                    </Link>
                    <Link to="/favorites" className="drop-item" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setIsProfileOpen(false)}>
                      <span >รายการโปรด</span>
                    </Link>
                    <Link to="/history" style={{textDecoration: 'none'}} onClick={() => setIsProfileOpen(false)}>
                      <button className="drop-item">ประวัติการนำทาง</button>
                    </Link>
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
              {/* สำหรับผู้ใช้ที่ยังไม่ Login เมื่อเป็น Mobile ก็ควรมีเมนูใน Hamburger */}
              <div ref={dropdownRef} className="mobile-only-item" style={{ position: 'relative', marginRight: '5px' }}>
                 <div className="hamburger-icon" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    <i className="bi bi-list"></i>
                 </div>
                 {isProfileOpen && (
                   <div style={dropdownStyle}>
                      <Link to="/guide" style={{textDecoration: 'none'}} onClick={() => setIsProfileOpen(false)}>
                        <button className="drop-item">คู่มือการใช้งาน</button>
                      </Link>
                      <Link to="/contact" style={{textDecoration: 'none'}} onClick={() => setIsProfileOpen(false)}>
                        <button className="drop-item">ติดต่อเรา</button>
                      </Link>
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

// --- Styles (คงเดิม) ---
const headerWrapper = { position: "fixed", top: "15px", left: "0", right: "0", display: "flex", justifyContent: "center", padding: "0 10px", zIndex: 1000, pointerEvents: "none" };
const navCard = { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: "1200px", backgroundColor: "rgba(249, 244, 232, 0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "10px 25px", borderRadius: "24px", border: "1px solid rgba(255, 255, 255, 0.5)", boxShadow: "0 15px 35px rgba(74, 69, 58, 0.08)", pointerEvents: "auto", height: "70px", overflow: "visible" };
const logoStyle = { display: "flex", alignItems: "center", textDecoration: "none", flex: 1, position: 'relative', overflow: 'visible' };
const logoImageStyle = { height: '110px', width: 'auto', position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '0', display: 'block', filter: `drop-shadow(0 8px 15px #FF8E6E33)`, transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', zIndex: 10 };
const menuCenter = { display: "flex", gap: "5px", flex: 2, marginLeft: "-200px" };
const userSection = { display: "flex", alignItems: "center", justifyContent: "flex-end", flex: 1 };
const signUpBtn = { background: "linear-gradient(135deg, #FF8E6E 0%, #FFB385 100%)", color: "white", padding: "10px 22px", borderRadius: "16px", textDecoration: "none", fontWeight: "600", fontSize: "0.95rem", boxShadow: "0 4px 15px rgba(255, 127, 103, 0.3)", whiteSpace: 'nowrap' };
const avatarStyle = { width: "40px", height: "40px", borderRadius: "50px", objectFit: "cover" };
const dropdownStyle = { position: "absolute", top: "55px", right: "0", width: "200px", backgroundColor: "#F9F4E8", borderRadius: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.12)", overflow: "hidden", border: "1px solid #EFE9D9" };
const logoutBtnStyle = { color: '#FF6B6B', padding: "8px 12px", borderRadius: "14px", fontSize: "0.85rem", fontWeight: "600", transition: "0.3s", border: 'none', background: 'none', display: 'flex', alignItems: 'center' };