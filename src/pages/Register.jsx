'use client';
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, User, Mail, Lock, UserCircle, ShieldCheck } from "lucide-react";
import Swal from 'sweetalert2';
import api from "@/api/axios"; 
import Cookies from 'js-cookie';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    password: "", 
    confirmPassword: "", 
    gender: "" 
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { 
    setIsVisible(true); 
  }, [location.pathname]);

  const handleNavigation = (path) => {
    if (location.pathname === path) return;
    setIsVisible(false);
    setTimeout(() => {
      navigate(path);
      setErrors({});
    }, 250);
  };

  const inputWrapperClass = (field) => 
    `flex items-center gap-3 w-full rounded-2xl border bg-[#f8fafc] px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-[#FF7F67]/40 focus-within:bg-white focus-within:border-[#FF7F67] ${
      errors[field] ? "border-red-500 ring-1 ring-red-500" : "border-transparent"
    }`;

  const validate = () => {
    const e = {};
    
    // 🌟 ดึงค่าอีเมลมาเช็ค
    const emailValue = form.email.trim().toLowerCase();

    if (!isLogin) {
      if (!form.firstName.trim()) e.firstName = "กรุณากรอกชื่อ";
      if (!form.lastName.trim()) e.lastName = "กรุณากรอกนามสกุล";
      if (!form.gender) e.gender = "กรุณาเลือกเพศ";
      if (form.password !== form.confirmPassword) e.confirmPassword = "รหัสผ่านไม่ตรงกัน"; 
    }

    // 🌟 เช็คการกรอกอีเมล (Gmail หรือ Hotmail เท่านั้น)
    if (!emailValue) {
      e.email = "กรุณากรอกอีเมล";
    } else if (!emailValue.endsWith('@gmail.com') && !emailValue.endsWith('@hotmail.com')) {
      e.email = "กรุณาใช้ @gmail.com หรือ @hotmail.com เท่านั้น";
    }

    if (!form.password) e.password = "กรุณากรอกรหัสผ่าน";
    if (form.password.length < 6) e.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: form.email, password: form.password } 
        : form;

      const response = await api.post(endpoint, payload);

      if (response.data) {
        if (!isLogin) {
          await Swal.fire({
            icon: 'info',
            title: 'สมัครสมาชิกสำเร็จ!',
            text: 'กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันตัวตนก่อนเข้าสู่ระบบ',
            confirmButtonColor: '#FF7F67',
            customClass: { popup: 'rounded-[30px]' }
          });
          handleNavigation('/login');
          return;
        }

        const token = response.data.token;
        const userData = response.data.user || response.data;

        localStorage.setItem('token', token);
        Cookies.set('token', token, { expires: 7 }); 
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
        localStorage.setItem('user', JSON.stringify(userData));

        window.dispatchEvent(new Event("authChange"));

        await Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ!',
          showConfirmButton: false,
          timer: 1500,
          customClass: { popup: 'rounded-[30px]' }
        });
        
        if (userData.role === 'admin') navigate('/admin');
        else navigate('/');
      }
    } catch (error) {
      console.error("Auth Error:", error.response?.data);
      const msg = error.response?.data?.message || "";
      
      if (msg.includes("verify") || msg.includes("ยัน")) {
        Swal.fire({
          icon: 'warning',
          title: 'ยังไม่ได้ยืนยันอีเมล',
          text: 'กรุณายืนยันอีเมลของคุณผ่านลิงก์ที่ระบบส่งไปให้',
          confirmButtonColor: '#FF7F67'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: isLogin ? 'เข้าสู่ระบบไม่สำเร็จ' : 'สมัครสมาชิกไม่สำเร็จ',
          text: msg || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
          customClass: { popup: 'rounded-[30px]' }
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#FDF8F1] py-12 px-4 relative overflow-hidden font-['Kanit',sans-serif]">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF7F67]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FF7F67]/10 rounded-full blur-[100px]" />
      </div>

      <div className={`w-full max-w-lg relative z-10 transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>
        
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[#FF7F67] transition-colors font-medium group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> ย้อนกลับ
        </button>

        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white">
          
          <div className="relative flex bg-gray-100 p-1.5 rounded-2xl mb-10 h-14 items-center border border-gray-200/50">
            <div className={`absolute top-1.5 bottom-1.5 transition-all duration-500 rounded-xl shadow-md bg-gradient-to-r from-[#FF7F67] to-[#FFB385] w-[calc(50%-6px)] ${isLogin ? 'left-1.5' : 'left-1/2'}`} />
            <button type="button" onClick={() => handleNavigation('/login')} className={`relative flex-1 h-full font-bold z-10 transition-colors ${isLogin ? 'text-white' : 'text-gray-400'}`}>เข้าสู่ระบบ</button>
            <button type="button" onClick={() => handleNavigation('/register')} className={`relative flex-1 h-full font-bold z-10 transition-colors ${!isLogin ? 'text-white' : 'text-gray-400'}`}>สมัครสมาชิก</button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#4A453A] leading-tight">{isLogin ? 'ยินดีต้อนรับกลับมา' : 'สร้างบัญชีใหม่'}</h1>
            <p className="text-gray-500 mt-2">เริ่มต้นการเดินทางไปกับ MoodPlace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#475569] ml-1">ชื่อ</label>
                  <div className={inputWrapperClass("firstName")}><User className="w-4 h-4 text-gray-400" /><input type="text" placeholder="ชื่อจริง" className="bg-transparent outline-none w-full text-[#4A453A]" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} /></div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#475569] ml-1">นามสกุล</label>
                  <div className={inputWrapperClass("lastName")}><UserCircle className="w-4 h-4 text-gray-400" /><input type="text" placeholder="นามสกุล" className="bg-transparent outline-none w-full text-[#4A453A]" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} /></div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#475569] ml-1">อีเมล</label>
              <div className={inputWrapperClass("email")}>
                <Mail className="w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="your@gmail.com" 
                  className="bg-transparent outline-none w-full text-[#4A453A]" 
                  value={form.email} 
                  onChange={(e) => {
                    setForm({...form, email: e.target.value});
                    // ลบ error ทันทีเวลาพิมพ์แก้
                    if (errors.email) setErrors({...errors, email: null});
                  }} 
                />
              </div>
              {/* 🌟 แสดงข้อความแจ้งเตือนถ้าอีเมลผิด */}
              {errors.email && <p className="text-xs text-red-500 ml-1 font-medium">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#475569] ml-1">{isLogin ? 'รหัสผ่าน' : 'ตั้งรหัสผ่าน'}</label>
              <div className={inputWrapperClass("password")}>
                <Lock className="w-4 h-4 text-gray-400" />
                <input type={showPassword ? "text" : "password"} placeholder="รหัสผ่านของคุณ" className="bg-transparent outline-none w-full text-[#4A453A]" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              {errors.password && <p className="text-xs text-red-500 ml-1 font-medium">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div className="space-y-1.5 animate-in fade-in duration-500">
                <label className="text-sm font-bold text-[#475569] ml-1">ยืนยันรหัสผ่านอีกครั้ง</label>
                <div className={inputWrapperClass("confirmPassword")}>
                  <Lock className="w-4 h-4 text-gray-400" />
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="ยืนยันรหัสผ่าน" className="bg-transparent outline-none w-full text-[#4A453A]" value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 ml-1 font-medium">{errors.confirmPassword}</p>}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-3 animate-in fade-in duration-700">
                <label className="text-sm font-bold text-[#475569] ml-1">เพศ</label>
                <div className="relative flex bg-gray-100 p-1 rounded-2xl h-11 items-center">
                  <div className={`absolute top-1 bottom-1 transition-all duration-500 rounded-xl z-0 ${form.gender === 'male' ? 'left-1 w-[32%] bg-blue-500' : form.gender === 'female' ? 'left-[34%] w-[32%] bg-pink-500' : form.gender === 'other' ? 'left-[67%] w-[32%] bg-purple-500' : 'opacity-0'}`} />
                  {['male', 'female', 'other'].map((g) => (
                    <button key={g} type="button" onClick={() => setForm({...form, gender: g})} className={`relative flex-1 h-full font-bold z-10 transition-colors ${form.gender === g ? 'text-white' : 'text-gray-400'}`}>{g === 'male' ? 'ชาย' : g === 'female' ? 'หญิง' : 'อื่นๆ'}</button>
                  ))}
                </div>
              </div>
            )}

            <button className="w-full h-14 rounded-2xl font-bold bg-gradient-to-r from-[#FF7F67] to-[#FFB385] text-white shadow-lg active:scale-95 transition-all mt-6" type="submit" disabled={submitting}>
              {submitting ? "กำลังประมวลผล..." : isLogin ? "เข้าสู่ระบบ" : "สร้างบัญชีสมาชิก"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}