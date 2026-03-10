'use client';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Camera, ArrowLeft, Save, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "", gender: "", profileImage: "" });
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);

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
      Swal.fire({ icon: 'error', title: 'ไฟล์ใหญ่เกินไป!', text: 'กรุณาเลือกไฟล์ที่ไม่เกิน 10MB', confirmButtonColor: '#FF7F67' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setUser({ ...user, profileImage: reader.result });
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = () => {
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("authChange"));
    Swal.fire({ icon: 'success', title: 'อัปเดตข้อมูลเรียบร้อย!', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-[30px]' } });
  };

  // ✨ 2. ฟังก์ชันอัปเดตรหัสผ่าน (แก้ไขชื่อ Key ให้ตรงตาม Postman)
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return Swal.fire({ icon: 'error', title: 'รหัสผ่านไม่ตรงกัน', text: 'กรุณาตรวจสอบการยืนยันรหัสผ่านใหม่', confirmButtonColor: '#FF7F67' });
    }

    try {
      const token = localStorage.getItem("token");
      const baseUrl = "https://moodlocationfinder-backend.onrender.com/api/v1";
      
      // ✨ แก้ไขจาก oldPassword เป็น currentPassword ตามที่ Backend ต้องการ
      const payload = {
        currentPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      };

      await axios.put(`${baseUrl}/users/change-password`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({ icon: 'success', title: 'เปลี่ยนรหัสผ่านสำเร็จ!', showConfirmButton: false, timer: 1500 });
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setIsPasswordMode(false);
    } catch (err) {
      // ดึง Error จาก Backend มาโชว์ (เช่น "รหัสผ่านเดิมไม่ถูกต้อง")
      const errorMsg = err.response?.data?.message || 'ข้อมูลไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
      Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: errorMsg });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F1] pt-28 pb-12 px-4 font-['Prompt',sans-serif]">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm text-[#7E7869] hover:text-[#FF7F67] transition-all"><ArrowLeft className="w-6 h-6" /></button>
            <h1 className="text-3xl font-black text-[#4A453A]">โปรไฟล์ <span className="text-[#FF8E6E]">ของคุณ</span></h1>
          </div>
          <button 
            onClick={() => setIsPasswordMode(!isPasswordMode)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${isPasswordMode ? 'bg-[#4A453A] text-white shadow-lg' : 'bg-white text-[#FF8E6E] shadow-sm hover:shadow-md'}`}
          >
            {isPasswordMode ? <User size={18}/> : <Lock size={18}/>}
            {isPasswordMode ? 'แก้ไขข้อมูลส่วนตัว' : 'เปลี่ยนรหัสผ่าน'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-1/3 flex flex-col items-center">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white w-full flex flex-col items-center">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current.click()}>
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-[6px] border-[#FDF8F1] overflow-hidden shadow-xl">
                  <img src={user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}&background=FF7F67&color=fff&size=200`} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                </div>
                <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"><Camera className="w-8 h-8" /></div>
              </div>
              <h2 className="text-xl font-bold text-[#4A453A] mb-1">{user.firstName} {user.lastName}</h2>
              <p className="text-[#7E7869] text-sm mb-4">{user.email}</p>
              <div className="flex items-center gap-1.5 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold"><ShieldCheck size={14}/> บัญชีที่ได้รับการยืนยัน</div>
            </div>
          </div>

          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-[3rem] p-8 sm:p-10 shadow-xl border border-white min-h-[500px]">
              {!isPasswordMode ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#4A453A] ml-1">ชื่อ</label>
                      <div className="flex items-center gap-3 bg-[#FDF8F1] px-5 py-4 rounded-2xl border-2 border-transparent focus-within:border-[#FF7F67]/30 transition-all">
                        <User className="w-5 h-5 text-[#FF8E6E]" />
                        <input type="text" value={user.firstName} className="bg-transparent outline-none w-full text-[#4A453A] font-medium" onChange={(e) => setUser({...user, firstName: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#4A453A] ml-1">นามสกุล</label>
                      <div className="flex items-center gap-3 bg-[#FDF8F1] px-5 py-4 rounded-2xl border-2 border-transparent focus-within:border-[#FF7F67]/30 transition-all">
                        <User className="w-5 h-5 text-[#FF8E6E]" />
                        <input type="text" value={user.lastName} className="bg-transparent outline-none w-full text-[#4A453A] font-medium" onChange={(e) => setUser({...user, lastName: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4A453A] ml-1">เพศ</label>
                    <select value={user.gender} onChange={(e) => setUser({...user, gender: e.target.value})} className="w-full bg-[#FDF8F1] px-5 py-4 rounded-2xl border-2 border-transparent focus-within:border-[#FF7F67]/30 outline-none text-[#4A453A] font-medium cursor-pointer"><option value="male">ชาย</option><option value="female">หญิง</option><option value="other">อื่นๆ</option></select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4A453A] ml-1">อีเมล (แก้ไขไม่ได้)</label>
                    <div className="flex items-center gap-3 bg-gray-50 px-5 py-4 rounded-2xl border-2 border-gray-100 opacity-70"><Mail className="w-5 h-5 text-gray-400" /><input type="email" value={user.email} className="bg-transparent outline-none w-full text-gray-500 font-medium" readOnly /></div>
                  </div>
                  <div className="pt-4"><button onClick={handleUpdateProfile} className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-[#FF8E6E] to-[#FFB385] text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"><Save className="w-5 h-5" /> บันทึกการเปลี่ยนแปลง</button></div>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  <div className="mb-2"><h3 className="text-xl font-black text-[#4A453A]">ตั้งค่ารหัสผ่านใหม่</h3><p className="text-sm text-[#7E7869]">กรุณากรอกรหัสผ่านเดิมเพื่อความปลอดภัย</p></div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4A453A] ml-1">รหัสผ่านเดิม</label>
                    <div className="relative flex items-center bg-[#FDF8F1] px-5 py-4 rounded-2xl border-2 border-transparent focus-within:border-[#FF7F67]/30 transition-all">
                      <Lock className="w-5 h-5 text-[#FF8E6E] mr-3" />
                      <input type={showPass ? "text" : "password"} required className="bg-transparent outline-none w-full text-[#4A453A] font-medium" onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 text-[#7E7869]">{showPass ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                    </div>
                  </div>
                  <hr className="border-dashed border-gray-200 my-2" />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4A453A] ml-1">รหัสผ่านใหม่</label>
                    <div className="flex items-center bg-[#FDF8F1] px-5 py-4 rounded-2xl border-2 border-transparent focus-within:border-[#FF7F67]/30 transition-all"><Lock className="w-5 h-5 text-[#FF8E6E] mr-3" /><input type="password" required className="bg-transparent outline-none w-full text-[#4A453A] font-medium" onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} /></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4A453A] ml-1">ยืนยันรหัสผ่านใหม่</label>
                    <div className="flex items-center bg-[#FDF8F1] px-5 py-4 rounded-2xl border-2 border-transparent focus-within:border-[#FF7F67]/30 transition-all"><ShieldCheck className="w-5 h-5 text-[#FF8E6E] mr-3" /><input type="password" required className="bg-transparent outline-none w-full text-[#4A453A] font-medium" onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} /></div>
                  </div>
                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <button type="button" onClick={() => setIsPasswordMode(false)} className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 text-[#7E7869] hover:bg-gray-200 transition-all">ยกเลิก</button>
                    <button type="submit" className="flex-1 py-4 rounded-2xl font-bold bg-[#4A453A] text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all">อัปเดตรหัสผ่าน</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}