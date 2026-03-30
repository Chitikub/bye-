'use client';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  ChevronLeft, 
  Trash2, 
  ArrowRight, 
  Navigation, 
  Sparkles,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import api from "@/api/axios";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // 🌟 ดึง API KEY มาจาก .env เพื่อใช้แสดงรูปภาพ
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get("/favorites");
      const data = res.data.favorites || res.data || [];
      
      // จำกัดให้เก็บแค่ 10 รายการล่าสุด
      const limitedData = Array.isArray(data) ? data.slice(0, 10) : [];
      setFavorites(limitedData);
      
    } catch (err) {
      console.error("Fetch Favorites Error:", err);
      if (err.response?.status === 401) {
        navigate('/login'); 
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsVisible(true);
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (placeId, name) => {
    const result = await Swal.fire({
      title: 'นำออกจากรายการโปรด?',
      text: `คุณต้องการนำ "${name}" ออกใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF8E6E',
      confirmButtonText: 'ใช่, นำออก',
      cancelButtonText: 'ยกเลิก',
      background: '#FDF8F1',
      customClass: { popup: 'rounded-[30px]' }
    });

    if (result.isConfirmed) {
      try {
        await api.post("/favorites/toggle", { placeId });
        setFavorites(favorites.filter(item => item.placeId !== placeId));
        Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 800, showConfirmButton: false });
      } catch (err) {
        Swal.fire("ผิดพลาด", "ไม่สามารถลบได้ในขณะนี้", "error");
      }
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#FDF8F1] pt-32 pb-20 px-4 font-['Prompt',sans-serif]">
      <div className={`max-w-6xl mx-auto transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-[#7E7869] hover:text-[#FF8E6E] transition-all font-bold">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> ย้อนกลับ
            </button>
            <h1 className="text-4xl md:text-6xl font-black text-[#4A453A]">
              รายการ<span className="text-[#FF8E6E]">โปรด</span>
            </h1>
            
            {/* 🌟 เพิ่มส่วนแสดงจำนวนที่บันทึก X / 10 ตรงนี้ */}
            <div className="flex items-center flex-wrap gap-3">
              <p className="text-[#7E7869] font-medium text-lg">สถานที่ที่คุณประทับใจล่าสุด</p>
              {!loading && (
                <span className="bg-orange-50 border border-orange-100 text-[#FF8E6E] px-3 py-1.5 rounded-xl font-black text-sm flex items-center gap-1.5 shadow-sm">
                  <Heart size={14} className="fill-[#FF8E6E]" /> {favorites.length} / 10
                </span>
              )}
            </div>

          </div>
        </div>

        {/* --- Grid Content --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#FF8E6E] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-[#7E7869]">กำลังเปิดกล่องความทรงจำ...</p>
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {favorites.map((item) => {
                const imageUrl = item.placeImage 
                  ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${item.placeImage}&key=${API_KEY}`
                  : "https://placehold.co/600x400/EFE9D9/4A453A?text=No+Image";

                return (
                  <motion.div 
                    layout
                    key={item.id} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  >
                    <div className="h-60 relative overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={item.placeName} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <button 
                        onClick={() => handleRemoveFavorite(item.placeId, item.placeName)} 
                        className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 shadow-lg transition-all active:scale-90 hover:bg-red-500 hover:text-white"
                      >
                        <Heart className="w-6 h-6 fill-current" />
                      </button>
                    </div>

                    <div className="p-8">
                      <h3 className="text-2xl font-black text-[#4A453A] mb-3 group-hover:text-[#FF8E6E] transition-colors line-clamp-1">
                        {item.placeName}
                      </h3>
                      
                      <div className="flex items-center justify-between mt-6">
                        <button 
                          onClick={() => navigate(`/g-place/${item.placeId}`)} 
                          className="text-[#FF8E6E] font-black text-sm flex items-center gap-2 group/btn"
                        >
                          ดูรายละเอียด <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                        </button>
                        
                        <button 
                          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${item.placeId}`, '_blank')}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#4A453A] text-white rounded-xl text-xs font-bold hover:bg-[#FF8E6E] transition-colors shadow-lg active:scale-95"
                        >
                          <Navigation className="w-3.5 h-3.5" /> นำทาง
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-20 text-center border border-white shadow-xl max-w-2xl mx-auto"
          >
            <Sparkles className="w-16 h-16 text-[#FF8E6E] mx-auto mb-6 animate-pulse" />
            <h2 className="text-2xl font-black text-[#4A453A] mb-4">ยังไม่มีสถานที่โปรดเลย</h2>
            <p className="text-[#7E7869] mb-10">ลองไปสำรวจสถานที่ใหม่ๆ แล้วกดหัวใจเก็บไว้ดูนะ!</p>
            <button 
              onClick={() => navigate("/")} 
              className="bg-[#4A453A] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#FF8E6E] transition-all shadow-lg active:scale-95"
            >
              ไปสำรวจกันเลย
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}