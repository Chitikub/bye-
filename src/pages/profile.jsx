"use client";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Camera,
  ArrowLeft,
  Save,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import api, { IMAGE_BASE_URL } from "@/api/axios";
import Swal from "sweetalert2";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    profileImage: "",
  });
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

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
        icon: "error",
        title: "ไฟล์ใหญ่เกินไป!",
        text: "กรุณาเลือกไฟล์ที่ไม่เกิน 10MB",
        confirmButtonColor: "#FF7F67",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUser({ ...user, profileImage: reader.result, imageFile: file });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", user.firstName);
      formData.append("lastName", user.lastName);
      formData.append("gender", user.gender);

      if (user.imageFile) {
        formData.append("profileImage", user.imageFile);
      }

      const res = await api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res.data.user || res.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      window.dispatchEvent(new Event("authChange"));

      Swal.fire({
        icon: "success",
        title: "อัปเดตข้อมูลเรียบร้อย!",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "rounded-[30px]" },
      });
    } catch (err) {
      console.error("Update Error:", err);
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: err.response?.data?.message || "ไม่สามารถอัปเดตข้อมูลได้",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return Swal.fire({
        icon: "error",
        title: "รหัสผ่านไม่ตรงกัน",
        text: "กรุณาตรวจสอบการยืนยันรหัสผ่านใหม่",
        confirmButtonColor: "#FF7F67",
      });
    }

    try {
      const payload = {
        currentPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      };

      await api.put("/users/change-password", payload);

      Swal.fire({
        icon: "success",
        title: "เปลี่ยนรหัสผ่านสำเร็จ!",
        showConfirmButton: false,
        timer: 1500,
      });
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setIsPasswordMode(false);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "ข้อมูลไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง";

      if (err.response?.status === 401) {
        Swal.fire({
          icon: "error",
          title: "เซสชั่นหมดอายุ",
          text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
        });
        navigate("/login");
      } else {
        Swal.fire({ icon: "error", title: "ผิดพลาด", text: errorMsg });
      }
    }
  };

  const getProfileImage = () => {
    if (!user.profileImage)
      return `https://ui-avatars.com/api/?name=${user.firstName}&background=FF7F67&color=fff&size=200`;
    if (user.profileImage.startsWith("data:")) return user.profileImage;
    if (user.profileImage.startsWith("http")) return user.profileImage;
    return `${IMAGE_BASE_URL}${user.profileImage}`;
  };

  return (
    <div className="min-h-screen bg-[#FDF8F1] pt-20 sm:pt-28 pb-12 px-4 font-['Prompt',sans-serif]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 sm:p-3 bg-white rounded-2xl shadow-sm text-[#7E7869] hover:text-[#FF7F67] transition-all"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-[#4A453A]">
              โปรไฟล์ <span className="text-[#FF8E6E]">ของคุณ</span>
            </h1>
          </div>
          <button
            onClick={() => setIsPasswordMode(!isPasswordMode)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-bold text-sm sm:text-base transition-all ${isPasswordMode ? "bg-[#4A453A] text-white shadow-lg" : "bg-white text-[#FF8E6E] shadow-sm hover:shadow-md"}`}
          >
            {isPasswordMode ? <User size={16} /> : <Lock size={16} />}
            {isPasswordMode ? "แก้ไขข้อมูลส่วนตัว" : "เปลี่ยนรหัสผ่าน"}
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-10">
          {/* Left — Profile card */}
          <div className="w-full lg:w-1/3 flex flex-col items-center">
            <div className="bg-white p-5 sm:p-8 rounded-[3rem] shadow-xl border border-white w-full flex flex-col items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div
                className="relative group cursor-pointer mb-4 sm:mb-6"
                onClick={() => fileInputRef.current.click()}
              >
                <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full border-[6px] border-[#FDF8F1] overflow-hidden shadow-xl bg-gray-100">
                  <img
                    src={getProfileImage()}
                    alt="Profile"
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                  />
                </div>
                <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <Camera className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#4A453A] mb-1">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-[#7E7869] text-xs sm:text-sm mb-3 sm:mb-4 text-center break-all">
                {user.email}
              </p>
              <div className="flex items-center gap-1.5 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                <ShieldCheck size={13} /> บัญชีที่ได้รับการยืนยัน
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-[3rem] p-6 sm:p-10 shadow-xl border border-white min-h-[400px] sm:min-h-[500px]">
              {!isPasswordMode ? (
                <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#4A453A] ml-1">
                        ชื่อ
                      </label>
                      <div className="flex items-center gap-3 bg-[#FDF8F1] px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border-2 border-transparent focus-within:border-[#FF7F67]/30 transition-all">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF8E6E] shrink-0" />
                        <input
                          type="text"
                          value={user.firstName}
                          className="bg-transparent outline-none w-full text-[#4A453A] font-medium text-sm sm:text-base"
                          onChange={(e) =>
                            setUser({ ...user, firstName: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#4A453A] ml-1">
                        นามสกุล
                      </label>
                      <div className="flex items-center gap-3 bg-[#FDF8F1] px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border-2 border-transparent focus-within:border-[#FF7F67]/30 transition-all">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF8E6E] shrink-0" />
                        <input
                          type="text"
                          value={user.lastName}
                          className="bg-transparent outline-none w-full text-[#4A453A] font-medium text-sm sm:text-base"
                          onChange={(e) =>
                            setUser({ ...user, lastName: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4A453A] ml-1">
                      เพศ
                    </label>
                    <select
                      value={user.gender}
                      onChange={(e) =>
                        setUser({ ...user, gender: e.target.value })
                      }
                      className="w-full bg-[#FDF8F1] px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border-2 border-transparent focus-within:border-[#FF7F67]/30 outline-none text-[#4A453A] font-medium text-sm sm:text-base cursor-pointer"
                    >
                      <option value="male">ชาย</option>
                      <option value="female">หญิง</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4A453A] ml-1">
                      อีเมล (แก้ไขไม่ได้)
                    </label>
                    <div className="flex items-center gap-3 bg-gray-50 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border-2 border-gray-100 opacity-70">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
                      <input
                        type="email"
                        value={user.email}
                        className="bg-transparent outline-none w-full text-gray-500 font-medium text-sm sm:text-base"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="pt-2 sm:pt-4">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="w-full py-3 sm:py-4 rounded-2xl font-bold bg-gradient-to-r from-[#FF8E6E] to-[#FFB385] text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                    >
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                      {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleUpdatePassword}
                  className="space-y-5 sm:space-y-6 animate-in slide-in-from-right-4 duration-500"
                >
                  <div className="mb-2">
                    <h3 className="text-lg sm:text-xl font-black text-[#4A453A]">
                      ตั้งค่ารหัสผ่านใหม่
                    </h3>
                    <p className="text-xs sm:text-sm text-[#7E7869]">
                      กรุณากรอกรหัสผ่านเดิมเพื่อความปลอดภัย
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4A453A] ml-1">
                      รหัสผ่านเดิม
                    </label>
                    <div className="relative flex items-center bg-[#FDF8F1] px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border-2 border-transparent focus-within:border-[#FF7F67]/30 transition-all">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF8E6E] mr-3 shrink-0" />
                      <input
                        type={showPass ? "text" : "password"}
                        required
                        className="bg-transparent outline-none w-full text-[#4A453A] font-medium text-sm sm:text-base"
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            oldPassword: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 sm:right-5 text-[#7E7869]"
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <hr className="border-dashed border-gray-200" />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4A453A] ml-1">
                      รหัสผ่านใหม่
                    </label>
                    <div className="flex items-center bg-[#FDF8F1] px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border-2 border-transparent focus-within:border-[#FF7F67]/30 transition-all">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF8E6E] mr-3 shrink-0" />
                      <input
                        type="password"
                        required
                        className="bg-transparent outline-none w-full text-[#4A453A] font-medium text-sm sm:text-base"
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            newPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4A453A] ml-1">
                      ยืนยันรหัสผ่านใหม่
                    </label>
                    <div className="flex items-center bg-[#FDF8F1] px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border-2 border-transparent focus-within:border-[#FF7F67]/30 transition-all">
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF8E6E] mr-3 shrink-0" />
                      <input
                        type="password"
                        required
                        className="bg-transparent outline-none w-full text-[#4A453A] font-medium text-sm sm:text-base"
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setIsPasswordMode(false)}
                      className="flex-1 py-3 sm:py-4 rounded-2xl font-bold bg-gray-100 text-[#7E7869] hover:bg-gray-200 transition-all text-sm sm:text-base"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 sm:py-4 rounded-2xl font-bold bg-[#4A453A] text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm sm:text-base"
                    >
                      อัปเดตรหัสผ่าน
                    </button>
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
