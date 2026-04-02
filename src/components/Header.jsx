import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import "bootstrap-icons/font/bootstrap-icons.css";
import api from "@/api/axios";

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

  const loadUserFromLocal = () => {
    const data = localStorage.getItem("user");
    setUser(data ? JSON.parse(data) : null);
  };

  const verifyTokenWithBackend = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleForceLogout();
      return;
    }
    try {
      const response = await api.get("/auth/me");
      const userData = response.data.user || response.data;
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Swal.fire({
          icon: "warning",
          title: "เซสชันหมดอายุ!",
          text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
          confirmButtonColor: "#FF8E6E",
        }).then(() => {
          handleForceLogout();
          navigate("/login");
        });
      } else {
        handleForceLogout();
      }
    }
  };

  const handleForceLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsProfileOpen(false);
  };

  useEffect(() => {
    loadUserFromLocal();
    verifyTokenWithBackend();

    const handleAuthChange = () => {
      loadUserFromLocal();
    };
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authChange", handleAuthChange);

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    Swal.fire({
      title: "ออกจากระบบ?",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: colors.coral,
      confirmButtonText: "ตกลง",
      cancelButtonText: "ยกเลิก",
    }).then((res) => {
      if (res.isConfirmed) {
        handleForceLogout();
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
        
        .nav-item { position: relative; transition: 0.3s; padding: 10px 15px; border-radius: 12px; text-decoration: none; color: #7E7869; font-size: 0.95rem; }
        .nav-item:hover { background: ${colors.softSand}; color: ${colors.coral} !important; }
        .active-nav { color: ${colors.coral} !important; font-weight: 600; }
        
        .cta-btn { transition: 0.3s; cursor: pointer; border: none; white-space: nowrap; }
        .cta-btn:hover { transform: scale(1.02); }

        .hamburger-icon { font-size: 1.6rem; color: ${colors.darkPaper}; cursor: pointer; display: flex; align-items: center; }
        
        .drop-item { width: 100%; padding: 12px 20px; border: none; background: none; text-align: left; cursor: pointer; font-size: 0.95rem; color: #4A453A; display: block; text-decoration: none; }
        .drop-item:hover { background-color: ${colors.softSand}; color: ${colors.coral}; }

        /* 📱 Mobile Responsive Optimization */
        @media (max-width: 768px) {
          header { top: 10px !important; }
          .nav-card { height: 60px !important; padding: 0 15px !important; width: 95% !important; }
          .menu-center { display: none !important; }
          
          .logo-img { 
            height: 65px !important; /* ลดขนาดโลโก้ลงให้พอดี */
            position: static !important; 
            transform: none !important; 
          }
          
          .logout-btn-text { display: none; } /* ซ่อนตัวอักษร เหลือแค่ไอคอน */
          .start-btn { padding: 8px 14px !important; font-size: 0.85rem !important; border-radius: 12px !important; }
          .login-link { font-size: 0.8rem !important; padding: 5px !important; }
          
          .dropdown-menu { width: 180px !important; top: 50px !important; }
        }
      `}</style>

      <nav style={navCard} className="nav-card">
        {/* LOGO SECTION */}
        <Link to="/" style={logoContainer}>
          <img
            src="/logo1.png"
            alt="MoodPlace Logo"
            style={logoImageStyle}
            className="logo-img"
          />
        </Link>

        {/* DESKTOP MENU CENTER */}
        <div style={menuCenter} className="menu-center">
          <Link
            to="/guide"
            className={`nav-item ${isActive("/guide") ? "active-nav" : ""}`}
          >
            คู่มือ
          </Link>
          <Link
            to="/contact"
            className={`nav-item ${isActive("/contact") ? "active-nav" : ""}`}
          >
            ศูนย์ช่วยเหลือ
          </Link>
        </div>

        {/* RIGHT SECTION (USER/AUTH) */}
        <div style={userSection}>
          {user ? (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {/* Heart Icon */}
              <Link to="/favorites" style={{ display: "flex" }}>
                <i
                  className={`bi ${isActive("/favorites") ? "bi-heart-fill" : "bi-heart"}`}
                  style={{
                    fontSize: "1.2rem",
                    color: isActive("/favorites")
                      ? colors.coral
                      : colors.darkPaper,
                  }}
                ></i>
              </Link>

              {/* Hamburger & Profile Dropdown */}
              <div
                ref={dropdownRef}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  className="hamburger-icon"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <i
                    className={`bi ${isProfileOpen ? "bi-x-lg" : "bi-list"}`}
                  ></i>
                </div>

                <Link to="/profile" className="profile-avatar-container">
                  <img
                    src={
                      user.profileImage ||
                      `https://ui-avatars.com/api/?name=${user.firstName}&background=FF7F67&color=fff`
                    }
                    style={avatarStyle}
                    alt="Profile"
                  />
                </Link>

                {isProfileOpen && (
                  <div style={dropdownStyle} className="dropdown-menu">
                    {/* Mobile Only Links in Dropdown */}
                    <div
                      className="md:hidden"
                      style={{
                        display: window.innerWidth <= 768 ? "block" : "none",
                      }}
                    >
                      <Link
                        to="/guide"
                        className="drop-item"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        คู่มือการใช้งาน
                      </Link>
                      <Link
                        to="/contact"
                        className="drop-item"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        ติดต่อเรา
                      </Link>
                      <hr style={{ margin: "5px 10px", opacity: 0.1 }} />
                    </div>
                    <Link
                      to="/profile"
                      className="drop-item"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      โปรไฟล์ของฉัน
                    </Link>
                    <Link
                      to="/favorites"
                      className="drop-item"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      รายการโปรด
                    </Link>
                    <Link
                      to="/history"
                      className="drop-item"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      ประวัติการนำทาง
                    </Link>
                    <Link
                      to="/planner"
                      className="drop-item"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      วางแผนการเดินทาง
                    </Link>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="cta-btn"
                style={logoutBtnStyle}
              >
                <i
                  className="bi bi-arrow-bar-right"
                  style={{ fontSize: "1.2rem" }}
                ></i>
                <span className="logout-btn-text" style={{ marginLeft: "4px" }}>
                  ออกจากระบบ
                </span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              {/* Hamburger for Guest on Mobile */}
              <div
                ref={dropdownRef}
                className="md:hidden"
                style={{
                  position: "relative",
                  display: window.innerWidth <= 768 ? "block" : "none",
                }}
              >
                <div
                  className="hamburger-icon"
                  style={{ marginRight: "8px" }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <i className="bi bi-list"></i>
                </div>
                {isProfileOpen && (
                  <div style={dropdownStyle} className="dropdown-menu">
                    <Link
                      to="/guide"
                      className="drop-item"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      คู่มือการใช้งาน
                    </Link>
                    <Link
                      to="/contact"
                      className="drop-item"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      ศูนย์ช่วยเหลือ
                    </Link>
                  </div>
                )}
              </div>
              <Link to="/login" className="login-link" style={loginLinkStyle}>
                เข้าสู่ระบบ
              </Link>
              <Link
                to="/register"
                className="cta-btn start-btn"
                style={signUpBtn}
              >
                เริ่มใช้งาน
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

// --- Styles (Updated for stability) ---
const headerWrapper = {
  position: "fixed",
  top: "15px",
  left: "0",
  right: "0",
  display: "flex",
  justifyContent: "center",
  zIndex: 1000,
  pointerEvents: "none",
};

const navCard = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "90%",
  maxWidth: "1200px",
  backgroundColor: "rgba(249, 244, 232, 0.9)",
  backdropFilter: "blur(15px)",
  padding: "0 25px",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(74, 69, 58, 0.1)",
  pointerEvents: "auto",
  height: "70px",
};

const logoContainer = {
  display: "flex",
  alignItems: "center",
  flex: 1,
  height: "100%",
};

const logoImageStyle = {
  height: "100px",
  width: "auto",
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  transition: "0.3s",
};

const menuCenter = {
  display: "flex",
  gap: "10px",
  justifyContent: "center",
  flex: 2,
};

const userSection = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  flex: 1,
};

const loginLinkStyle = {
  textDecoration: "none",
  color: "#7E7869",
  fontSize: "0.9rem",
  padding: "10px",
  fontWeight: 500,
};

const signUpBtn = {
  background: "linear-gradient(135deg, #FF8E6E 0%, #FFB385 100%)",
  color: "white",
  padding: "10px 20px",
  borderRadius: "14px",
  textDecoration: "none",
  fontWeight: "600",
  fontSize: "0.9rem",
  boxShadow: "0 4px 12px rgba(255, 127, 103, 0.2)",
};

const avatarStyle = {
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid #FF8E6E",
};

const dropdownStyle = {
  position: "absolute",
  top: "55px",
  right: "0",
  width: "200px",
  backgroundColor: "#F9F4E8",
  borderRadius: "15px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  overflow: "hidden",
  border: "1px solid #EFE9D9",
  zIndex: 1100,
};

const logoutBtnStyle = {
  color: "#FF6B6B",
  padding: "8px",
  borderRadius: "12px",
  fontSize: "0.9rem",
  fontWeight: "600",
  border: "none",
  background: "none",
  display: "flex",
  alignItems: "center",
};
