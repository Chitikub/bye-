'use client';
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Edit3, ShieldCheck, Activity, Key } from "lucide-react";
import api from "@/api/axios";

export default function AdminPlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);

  useEffect(() => {
    // ดึงข้อมูลพิกัด (ใช้ API Admin เพื่อดูข้อมูลเชิงลึก)
    const fetchAdminDetail = async () => {
      try {
        const response = await api.get(`/admin/places/${id}`);
        setPlace(response.data);
      } catch (err) { console.error(err); }
    };
    fetchAdminDetail();
  }, [id]);

  if (!place) return <div className="p-10 text-center">กำลังดึงข้อมูลระบบ...</div>;

  return (
    <div className="p-8 md:p-12 font-['Kanit'] bg-[#FDF8F1] min-h-screen text-[#4A453A]">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-xl transition-colors">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-3xl font-black">ตรวจสอบข้อมูล <span className="text-[#FF8E6E]">Backend</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* คอลัมน์ซ้าย: ข้อมูลพื้นฐาน */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="text-green-500" /> ข้อมูลที่บันทึกในฐานข้อมูล
            </h2>
            <div className="space-y-6">
              <div><label className="text-sm text-gray-400 block mb-1">ID ระบบ</label><code className="bg-gray-100 p-2 rounded text-sm">{place._id}</code></div>
              <div><label className="text-sm text-gray-400 block mb-1">ชื่อสถานที่</label><p className="text-xl font-bold">{place.name}</p></div>
              <div><label className="text-sm text-gray-400 block mb-1">หมวดหมู่</label><p className="font-medium">{place.category}</p></div>
              <div><label className="text-sm text-gray-400 block mb-1">รายละเอียด</label><p className="text-gray-600">{place.description}</p></div>
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา: การวิเคราะห์ Logic */}
        <div className="space-y-8">
          <div className="bg-[#4A453A] text-white p-8 rounded-[2.5rem] shadow-lg">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Activity /> อัลกอริทึมคะแนน</h2>
            <div className="text-center py-6">
              <div className="text-5xl font-black text-[#FF8E6E] mb-2">{place.rating}</div>
              <p className="opacity-70 text-sm italic">คะแนนปัจจุบันที่ระบบใช้คำนวณอารมณ์</p>
            </div>
            <hr className="border-white/10 my-6" />
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-80">Keyword: Workshop</span>
                <span className={place.description.toLowerCase().includes('workshop') ? "text-green-400 font-bold" : "text-gray-400"}>
                  {place.description.toLowerCase().includes('workshop') ? "ตรวจพบ (+2)" : "ไม่พบ"}
                </span>
              </div>
            </div>
          </div>

          <button onClick={() => navigate(`/admin/edit/${place._id}`)} className="w-full bg-white border-2 border-[#4A453A] p-6 rounded-[2rem] font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
            <Edit3 size={20} /> แก้ไขข้อมูลนี้
          </button>
        </div>
      </div>
    </div>
  );
}