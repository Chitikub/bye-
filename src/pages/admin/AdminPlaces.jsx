"use client";
import { useState, useEffect } from "react";
import {
  Trash2,
  Search,
  Plus,
  Edit3,
  X,
  Save,
  Image as ImageIcon,
  ExternalLink,
  AlignLeft,
  Star,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import CategoryChip from "../../components/Category";

export default function AdminPlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedPlaceReviews, setSelectedPlaceReviews] = useState([]);
  const [currentPlaceName, setCurrentPlaceName] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    description: "",
    category: "",
    googleMapsUrl: "",
    rating: 0,
    workshop: "", // 🌟 ช่อง Workshop ใหม่
  });

  const categories = [
    { name: "ธรรมชาติ", icon: "🌿", baseScore: 7 },
    { name: "คาเฟ่", icon: "☕", baseScore: 22 },
    { name: "วัด", icon: "🛕", baseScore: 6 },
    { name: "ชายหาด", icon: "🏖️", baseScore: 18 },
    { name: "ภูเขา", icon: "⛰️", baseScore: 13 },
    { name: "สวนสาธารณะ", icon: "🌳", baseScore: 10 },
    { name: "ร้านอาหาร", icon: "🍽️", baseScore: 21 },
  ];

  const baseUrl = "https://moodlocationfinder-backend.onrender.com/api/v1";

  const getTokenFromCookie = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
  };

  // 🌟 ฟังก์ชันคำนวณคะแนนแบบ Real-time เพื่อแสดงใน Modal
  const calculateLiveScore = () => {
    const cat = categories.find((c) => c.name === formData.category);
    let base = cat ? cat.baseScore : 0;
    let bonus = 0;
    
    // โบนัส +2: ถ้ากรอกช่อง workshop หรือมีคำว่า workshop ในรายละเอียด
    if (
      formData.workshop?.trim() !== "" || 
      formData.description?.toLowerCase().includes("workshop") || 
      formData.description?.includes("กิจกรรม")
    ) {
      bonus = 2;
    }
    return { base, bonus, total: base + bonus };
  };

  const currentScores = calculateLiveScore();

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const token = getTokenFromCookie();
      const response = await axios.get(`${baseUrl}/places`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.places || response.data;

      if (!Array.isArray(data)) {
        setPlaces([]);
        return;
      }

      const placesWithRatings = await Promise.all(
        data.map(async (place) => {
          const placeId = place._id || place.id;
          if (!placeId) return { ...place, realRating: "0.0", reviewCount: 0 };

          try {
            const revRes = await axios.get(`${baseUrl}/reviews/place/${placeId}`);
            const revs = revRes.data.reviews || [];
            const avg = revs.length > 0 
              ? (revs.reduce((sum, r) => sum + r.rating, 0) / revs.length).toFixed(1)
              : "0.0";
            return { ...place, realRating: avg, reviewCount: revs.length };
          } catch (e) {
            return { ...place, realRating: "0.0", reviewCount: 0 };
          }
        })
      );

      setPlaces(placesWithRatings);
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowReviews = async (place) => {
    const placeId = place._id || place.id;
    if (!placeId) return;
    setCurrentPlaceName(place.name);
    try {
      const response = await axios.get(`${baseUrl}/reviews/place/${placeId}`);
      setSelectedPlaceReviews(response.data.reviews || []);
      setIsReviewModalOpen(true);
    } catch (error) {
      Swal.fire("ผิดพลาด", "ไม่สามารถดึงข้อมูลรีวิวได้", "error");
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getTokenFromCookie();
    const targetId = editingPlace?._id || editingPlace?.id;
    
    // 🌟 ใช้คะแนนที่คำนวณล่าสุดส่งไปที่ Backend
    const finalData = {
      ...formData,
      rating: currentScores.total,
    };

    try {
      if (editingPlace && targetId) {
        await axios.put(`${baseUrl}/admin/places/${targetId}`, finalData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire({ title: "แก้ไขสำเร็จ!", icon: "success", timer: 1500, showConfirmButton: false });
      } else {
        await axios.post(`${baseUrl}/admin/places`, finalData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire({ title: "เพิ่มสถานที่สำเร็จ!", icon: "success", timer: 1500, showConfirmButton: false });
      }
      setIsModalOpen(false);
      fetchPlaces();
    } catch (error) {
      Swal.fire("ผิดพลาด", error.response?.data?.message || "ไม่สามารถบันทึกได้", "error");
    }
  };

  const handleDelete = (id, name) => {
    if (!id) return;
    Swal.fire({
      title: "ยืนยันการลบ?",
      text: `ต้องการลบ "${name}" ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "ลบข้อมูล",
      background: "#FDF8F1",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = getTokenFromCookie();
          await axios.delete(`${baseUrl}/admin/places/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire({ title: "ลบเรียบร้อย!", icon: "success", timer: 1500, showConfirmButton: false });
          fetchPlaces();
        } catch (error) {
          Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบได้", "error");
        }
      }
    });
  };

  const handleEditClick = (place) => {
    setEditingPlace(place);
    setFormData({
      name: place.name || "",
      image: place.image || "",
      description: place.description || "",
      category: place.category || "",
      googleMapsUrl: place.googleMapsUrl || "",
      rating: place.rating || 0,
      workshop: place.workshop || "", // 🌟 โหลดข้อมูล Workshop
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingPlace(null);
    setFormData({ name: "", image: "", description: "", category: "", googleMapsUrl: "", rating: 0, workshop: "" });
    setIsModalOpen(true);
  };

  const filteredPlaces = places.filter((place) =>
    place.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 md:p-12 font-['Prompt'] bg-[#FDF8F1] min-h-screen text-[#4A453A]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="font-black text-4xl md:text-5xl">จัดการ <span className="text-[#FF8E6E]">สถานที่</span></h1>
          <p className="text-[#4A453A] font-medium opacity-80 mt-2">วิเคราะห์คะแนนอารมณ์ และติดตามรีวิวจากผู้ใช้</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-[350px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="ค้นหาชื่อพิกัด..." className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] bg-white shadow-sm outline-none border-none" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={handleAddClick} className="bg-[#FF8E6E] text-white p-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-bold">
            <Plus size={24} /> เพิ่มสถานที่
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#4A453A] text-white">
              <tr>
                <th className="p-8 font-bold text-[16px] uppercase tracking-widest rounded-tl-[3rem]">สถานที่</th>
                <th className="p-8 font-bold text-[16px] uppercase tracking-widest text-center">อารมณ์/รีวิว</th>
                <th className="p-8 font-bold text-[16px] uppercase tracking-widest text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="3" className="p-32 text-center animate-pulse font-bold text-xl opacity-60">กำลังโหลด...</td></tr>
              ) : filteredPlaces.length > 0 ? (
                filteredPlaces.map((place) => (
                  <tr key={place._id || place.id} className="hover:bg-gray-50/80 transition-all group">
                    <td className="p-8">
                      <div className="flex items-center gap-5">
                        <img src={place.image} className="w-16 h-16 bg-[#FDF8F1] rounded-2xl object-cover shadow-sm" alt="place" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[#4A453A] text-xl block leading-tight">{place.name}</span>
                            {place.workshop && <Sparkles size={16} className="text-[#FF8E6E]" title="มี Workshop" />}
                          </div>
                          <CategoryChip category={place.category} />
                        </div>
                      </div>
                    </td>
                    <td className="p-8 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 text-[#FF8E6E] font-black text-lg">
                          <Star size={18} className="fill-[#FF8E6E]" /> {place.realRating}
                        </div>
                        <span className="text-xs font-bold text-gray-400">จาก {place.reviewCount} รีวิว</span>
                        <div className={`mt-1 px-3 py-1 rounded-full text-[10px] font-black ${place.workshop ? 'bg-orange-100 text-[#FF8E6E]' : 'bg-gray-100'}`}>
                          Mood Score: {place.rating}
                        </div>
                      </div>
                    </td>
                    <td className="p-8 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => handleShowReviews(place)} className="p-4 bg-orange-50 text-[#FF8E6E] rounded-2xl hover:bg-[#FF8E6E] hover:text-white transition-all"><MessageSquare size={20} /></button>
                        <button onClick={() => handleEditClick(place)} className="p-4 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition-all"><Edit3 size={20} /></button>
                        <button onClick={() => handleDelete(place._id || place.id, place.name)} className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="p-32 text-center text-gray-400 italic">ไม่พบข้อมูล</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL: จัดการสถานที่ (Add/Edit) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#4A453A]/40 backdrop-blur-md">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white rounded-[3.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-8 border-white">
              <form onSubmit={handleSubmit} className="relative p-10 text-[#4A453A]">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-3xl font-black">{editingPlace ? "แก้ไขข้อมูลพิกัด" : "เพิ่มพิกัดใหม่"}</h3>
                  
                  {/* 🌟 แสดงคะแนน Real-time ใน Modal */}
                  <div className="flex gap-4 items-center">
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Mood Score</div>
                        <div className="text-2xl font-black text-[#FF8E6E] flex items-center gap-2">
                           {currentScores.total} 
                           {currentScores.bonus > 0 && <span className="text-xs text-green-500">(+{currentScores.bonus} Bonus)</span>}
                        </div>
                    </div>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={28} /></button>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="font-black text-xl">ชื่อสถานที่</label>
                      <input required className="w-full p-5 bg-[#FDF8F1] rounded-[1.5rem] outline-none border-2 border-transparent focus:border-[#FF8E6E] transition-all font-bold" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="font-black text-xl">หมวดหมู่</label>
                      <select required className="w-full p-5 bg-[#FDF8F1] rounded-[1.5rem] outline-none border-2 border-transparent focus:border-[#FF8E6E] transition-all font-bold" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                        <option value="">เลือกหมวดหมู่...</option>
                        {categories.map((cat) => (<option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>))}
                      </select>
                    </div>
                  </div>

                  {/* 🌟 รายละเอียด และ Workshop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="font-black text-xl flex items-center gap-2"><AlignLeft size={20} /> รายละเอียด</label>
                      <textarea rows="4" required className="w-full p-6 bg-[#FDF8F1] rounded-[2rem] outline-none font-medium" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="font-black text-xl flex items-center gap-2 text-[#FF8E6E]"><Sparkles size={20} /> ข้อมูล Workshop (ถ้ามี)</label>
                      <textarea rows="4" placeholder="บอกรายละเอียด Workshop ที่นี่... (ใส่แล้วได้แต้มเพิ่ม +2)" className="w-full p-6 bg-orange-50/50 rounded-[2rem] outline-none font-bold border-2 border-dashed border-orange-200 focus:border-solid focus:border-[#FF8E6E]" value={formData.workshop} onChange={(e) => setFormData({ ...formData, workshop: e.target.value })} />
                    </div>
                  </div>

                  {/* 🌟 ลิงก์รูปภาพ และ พรีวิวรูปภาพ */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                    <div className="md:col-span-2 space-y-2">
                      <label className="font-black text-xl flex items-center gap-2"><ImageIcon size={20} /> ลิงก์รูปภาพ</label>
                      <input required className="w-full p-5 bg-[#FDF8F1] rounded-[1.5rem] outline-none" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                    </div>
                    {/* พรีวิวรูปภาพ */}
                    <div className="h-[90px] w-full bg-[#FDF8F1] rounded-[1.5rem] overflow-hidden border-2 border-white shadow-inner flex items-center justify-center">
                      {formData.image ? (
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL'} />
                      ) : (
                        <span className="text-gray-300 text-xs font-bold italic">พรีวิวรูปภาพ</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-black text-xl flex items-center gap-2"><ExternalLink size={20} /> ลิงก์แผนที่ (Google Maps)</label>
                    <input required className="w-full p-5 bg-[#FDF8F1] rounded-[1.5rem] outline-none border-2 border-transparent focus:border-[#FF8E6E] font-bold" value={formData.googleMapsUrl} onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })} />
                  </div>
                </div>

                <button type="submit" className="w-full mt-12 bg-[#FF8E6E] text-white py-5 rounded-[2rem] font-black text-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                  <Save size={28} /> บันทึกข้อมูล
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: ดูคอมเมนต์และรีวิว (คงเดิม) --- */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-[#2D2A26]/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[3.5rem] w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col border-8 border-white">
              <div className="p-8 bg-[#4A453A] text-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black">{currentPlaceName}</h3>
                  <p className="text-sm opacity-70">ความคิดเห็นทั้งหมด ({selectedPlaceReviews.length})</p>
                </div>
                <button onClick={() => setIsReviewModalOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-[#FDF8F1]">
                {selectedPlaceReviews.length > 0 ? (
                  selectedPlaceReviews.map((rev) => (
                    <div key={rev._id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-[#FF8E6E]/10 rounded-full flex items-center justify-center font-black text-[#FF8E6E]">{rev.userId?.username?.charAt(0).toUpperCase() || "U"}</div>
                          <div>
                            <div className="font-bold text-sm">{rev.userId?.username || "ผู้ใช้งาน"}</div>
                            <div className="text-[10px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString('th-TH')}</div>
                          </div>
                        </div>
                        <div className="flex items-center text-amber-400 font-black text-sm">
                          <Star size={14} className="fill-amber-400 mr-1" /> {rev.rating}
                        </div>
                      </div>
                      <p className="text-sm text-[#7E7869] leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-gray-400 font-bold italic">ยังไม่มีรีวิวสำหรับสถานที่นี้</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}