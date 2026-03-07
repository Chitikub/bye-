import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Heart, Mail, Camera, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import { color } from "framer-motion";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    profileImage: ""
  });

  // ดึงข้อมูลผู้ใช้จาก LocalStorage มาแสดงผล
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // ถ้าไม่มีข้อมูลให้เด้งไปหน้า Login
      navigate("/login");
    }
  }, [navigate]);

  const handleUpdateProfile = () => {
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("authChange"));
    Swal.fire({
      icon: 'success',
      title: 'อัปเดตข้อมูลสำเร็จ!',
      showConfirmButton: false,
      timer: 1500,
      customClass: { popup: 'rounded-[30px]' }
    });
  };
  const fileInputRef = useRef(null); // สร้าง Ref สำหรับแอบเรียกใช้ input file

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 1. ตรวจสอบขนาดไฟล์ (10MB = 10 * 1024 * 1024 bytes)
  const fileSizeInMB = file.size / (1024 * 1024);
  if (fileSizeInMB > 10) {
    Swal.fire({
      icon: 'error',
      title: 'ไฟล์ใหญ่เกินไป!',
      text: 'กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 10MB',
      confirmButtonColor: '#FF7F67'
    });
    return;
  }

  // 2. แสดงตัวอย่างรูปภาพ (Preview)
  const reader = new FileReader();
  reader.onloadend = () => {
    setUser({ ...user, profileImage: reader.result }); // อัปเดต State เพื่อแสดงรูปใหม่ทันที
    
    // ตรงนี้สามารถเพิ่ม Code สำหรับส่งไฟล์ไปยัง Backend (axios.post) ได้ในอนาคต
    Swal.fire({
      icon: 'success',
      title: 'เตรียมรูปภาพสำเร็จ',
      text: 'กดปุ่มแก้ไขโปรไฟล์เพื่อบันทึกการเปลี่ยนแปลง',
      timer: 1500,
      showConfirmButton: false
    });
  };
  reader.readAsDataURL(file);
};

  return (
    <div className="min-h-screen bg-[#FDF8F1] flex items-center justify-center p-4 font-['Prompt',sans-serif]">
      <div className="max-w-5xl w-full flex flex-col md:flex-row gap-8 items-start justify-center">
        
       <div className="flex flex-col items-center gap-6 w-full md:w-1/3">
  {/* Input File แบบซ่อนไว้ */}
  <input 
    type="file" 
    ref={fileInputRef} 
    onChange={handleFileChange} 
    accept="image/*" 
    className="hidden" 
  />

  <div 
    className="relative group cursor-pointer"
    onClick={() => fileInputRef.current.click()} // คลิกที่รูปแล้วไปเรียก input file
  >
    <div className="w-48 h-48 rounded-full border-[8px] border-[#4A453A]/10 overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
      <img 
        src={user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}&background=FF7F67&color=fff&size=200`} 
        alt="Profile" 
        className="w-full h-full object-cover"
      />
    </div>
    <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
      <Camera className="text-white w-8 h-8" />
    </div>
  </div>
  
  <button 
    onClick={() => fileInputRef.current.click()} // คลิกปุ่มแล้วไปเรียก input file
    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#EFE9D9] rounded-2xl shadow-sm text-[#7E7869] hover:bg-[#FF7F67] hover:text-white transition-all text-sm font-medium"
  >
    <User className="w-4 h-4" />
    เปลี่ยนรูปโปรไฟล์
  </button>
</div>

        {/* --- ฝั่งขวา: ฟอร์มข้อมูล --- */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(74,69,58,0.05)] border border-white w-full md:w-2/3">
          <div className="grid grid-cols-1 gap-6">
            
            {/* ชื่อ */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#4A453A] ml-1">ชื่อ</label>
              <div className="flex items-c enter gap-3 bg-[#FDF8F1] px-4 py-3 rounded-2xl border border-transparent focus-within:border-[#FF7F67] transition-all">
                <User className="w-4 h-4 text-[#7E7869]" />
                <input 
                  type="text" 
                  value={user.firstName}
                  className="bg-transparent outline-none w-full text-[#4A453A]"
                  placeholder="ระบุชื่อของคุณ"
                  onChange={(e) => setUser({...user, firstName: e.target.value})}
                />
              </div>
            </div>

            {/* นามสกุล */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#4A453A] ml-1">นามสกุล</label>
              <div className="flex items-center gap-3 bg-[#FDF8F1] px-4 py-3 rounded-2xl border border-transparent focus-within:border-[#FF7F67] transition-all">
                 <User className="w-4 h-4 text-[#7E7869]" />
                <input 
                  type="text" 
                  value={user.lastName}
                  className="bg-transparent outline-none w-full text-[#4A453A]"
                  placeholder="ระบุนามสกุลคุณ"
                  onChange={(e) => setUser({...user, lastName: e.target.value})}
                />
              </div>
            </div>
<div className="space-y-2">
  <label className="text-sm font-bold text-[#4A453A] ml-1">เพศ</label>
  <div className="relative flex items-center gap-3 bg-[#FDF8F1] px-4 py-3 rounded-2xl border border-transparent focus-within:border-[#FF7F67] transition-all">
    
    {/* ไอคอนสัญลักษณ์เพศแบบไล่สี ฟ้า-ม่วง-ชมพู */}
    <span 
      className="text-2xl font-bold select-none"
      style={{
        background: 'linear-gradient(to right, #60A5FA, #A855F7, #EC4899)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      ⚧
    </span>

    {/* ตัว Select */}
    <select 
      className="bg-transparent outline-none w-full text-[#4A453A] appearance-none cursor-pointer relative z-10"
      value={user.gender}
      onChange={(e) => setUser({...user, gender: e.target.value})}
    >
      <option value="" disabled>เลือกเพศ</option>
      <option value="male">ชาย</option>
      <option value="female">หญิง</option>
      <option value="other">อื่นๆ</option>
    </select>

    {/* ไอคอนลูกศรชี้ลง (วางทับด้านขวา) */}
    <div className="absolute right-4 pointer-events-none">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-[#7E7869]"
      >
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </div>
  </div>
</div>

            {/* Email (Read Only หรือ แก้ไขได้) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#4A453A] ml-1">Email</label>
              <div className="flex items-center gap-3 bg-[#FDF8F1] px-4 py-3 rounded-2xl border border-transparent focus-within:border-[#FF7F67] transition-all">
                <Mail className="w-4 h-4 text-[#7E7869]" />
                <input 
                  type="email" 
                  value={user.email}
                  className="bg-transparent outline-none w-full text-[#4A453A]"
                  placeholder="example@gmail.com"
                  readOnly
                />
              </div>
            </div>

            {/* ปุ่มกดต่างๆ */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button 
                onClick={() => navigate("/")}
                className="flex-1 h-14 rounded-2xl font-bold bg-[#FDF8F1] text-[#7E7869] hover:bg-[#EFE9D9] transition-all flex items-center justify-center gap-2"
              >
                กลับหน้าหลัก
              </button>
              <button 
                onClick={handleUpdateProfile}
                className="flex-1 h-14 rounded-2xl font-bold bg-gradient-to-r from-[#FF8E6E] to-[#FFB385] text-white shadow-lg shadow-[#FF8E6E]/20 hover:scale-[1.02] transition-all"
              >
                แก้ไขโปรไฟล์
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
} 