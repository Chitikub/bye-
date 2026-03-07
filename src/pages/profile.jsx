import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Camera, ArrowLeft, Check, Save } from "lucide-react";
import Swal from "sweetalert2";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    profileImage: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

    const reader = new FileReader();
    reader.onloadend = () => {
      setUser({ ...user, profileImage: reader.result });
      Swal.fire({
        icon: 'success',
        title: 'อัปโหลดรูปสำเร็จ',
        text: 'อย่าลืมกดปุ่มบันทึกการเปลี่ยนแปลง',
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'rounded-[30px]' }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = () => {
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("authChange"));
    Swal.fire({
      icon: 'success',
      title: 'อัปเดตโปรไฟล์เรียบร้อย!',
      showConfirmButton: false,
      timer: 1500,
      customClass: { popup: 'rounded-[30px]' }
    });
  };

  return (
    <div className="min-h-screen bg-[#FDF8F1] pt-28 pb-12 px-4 font-['Prompt',sans-serif]">
      <div className="max-w-4xl mx-auto">
        
        {/* Header ส่วนบน */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white rounded-2xl shadow-sm text-[#7E7869] hover:text-[#FF7F67] transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black text-[#4A453A]">โปรไฟล์ <span className="text-[#FF8E6E]">ของคุณ</span></h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* ฝั่งซ้าย: รูปภาพโปรไฟล์ */}
          <div className="w-full lg:w-1/3 flex flex-col items-center">
            <div className="bg-white p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(74,69,58,0.05)] border border-white w-full flex flex-col items-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <div 
                className="relative group cursor-pointer mb-6"
                onClick={() => fileInputRef.current.click()}
              >
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-[6px] border-[#FDF8F1] overflow-hidden shadow-xl">
                  <img 
                    src={user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}&background=FF7F67&color=fff&size=200`} 
                    alt="Profile" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                  />
                </div>
                <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="text-white w-8 h-8" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-[#4A453A] mb-1">{user.firstName} {user.lastName}</h2>
              <p className="text-[#7E7869] text-sm mb-6">{user.email}</p>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="w-full py-3 bg-[#FDF8F1] text-[#7E7869] rounded-2xl font-bold text-sm hover:bg-[#FF7F67] hover:text-white transition-all"
              >
                เปลี่ยนรูปภาพ
              </button>
            </div>
          </div>

          {/* ฝั่งขวา: ฟอร์มข้อมูล */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-[3rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(74,69,58,0.05)] border border-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#4A453A] ml-1">ชื่อ</label>
                  <div className="flex items-center gap-3 bg-[#FDF8F1] px-5 py-4 rounded-2xl border-2 border-transparent focus-within:border-[#FF7F67]/30 transition-all">
                    <User className="w-5 h-5 text-[#FF8E6E]" />
                    <input 
                      type="text" 
                      value={user.firstName}
                      className="bg-transparent outline-none w-full text-[#4A453A] font-medium"
                      onChange={(e) => setUser({...user, firstName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#4A453A] ml-1">นามสกุล</label>
                  <div className="flex items-center gap-3 bg-[#FDF8F1] px-5 py-4 rounded-2xl border-2 border-transparent focus-within:border-[#FF7F67]/30 transition-all">
                    <User className="w-5 h-5 text-[#FF8E6E]" />
                    <input 
                      type="text" 
                      value={user.lastName}
                      className="bg-transparent outline-none w-full text-[#4A453A] font-medium"
                      onChange={(e) => setUser({...user, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-bold text-[#4A453A] ml-1">เพศ</label>
                  <div className="relative flex items-center bg-[#FDF8F1] px-5 py-4 rounded-2xl border-2 border-transparent focus-within:border-[#FF7F67]/30 transition-all">
                    <span className="text-xl mr-3 select-none">⚧</span>
                    <select 
                      className="bg-transparent outline-none w-full text-[#4A453A] font-medium appearance-none cursor-pointer z-10"
                      value={user.gender}
                      onChange={(e) => setUser({...user, gender: e.target.value})}
                    >
                      <option value="male">ชาย</option>
                      <option value="female">หญิง</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                    <div className="absolute right-5 pointer-events-none">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#7E7869]"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-bold text-[#4A453A] ml-1">อีเมล (ไม่สามารถแก้ไขได้)</label>
                  <div className="flex items-center gap-3 bg-gray-50 px-5 py-4 rounded-2xl border-2 border-gray-100 opacity-70">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <input type="email" value={user.email} className="bg-transparent outline-none w-full text-gray-500 font-medium" readOnly />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <button 
                  onClick={() => navigate("/")}
                  className="flex-1 py-4 rounded-2xl font-bold bg-[#FDF8F1] text-[#7E7869] hover:bg-gray-100 transition-all text-center"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleUpdateProfile}
                  className="flex-1 py-4 rounded-2xl font-bold bg-gradient-to-r from-[#FF8E6E] to-[#FFB385] text-white shadow-lg shadow-[#FF8E6E]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" /> บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}