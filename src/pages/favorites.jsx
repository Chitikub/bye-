'use client';
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Heart, 
  Clock, 
  ChevronLeft, 
  Trash2, 
  ArrowRight, 
  Navigation, 
  Sparkles,
  Calendar,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import CategoryChip from "@/components/Category"; 
import api, { IMAGE_BASE_URL } from "@/api/axios";

export default function UserActivityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const isFavoritePage = location.pathname === '/favorites';
  const MAX_LIMIT = 10; 

  const fetchData = async () => {
    try {
      setLoading(true);
      if (isFavoritePage) {
        const res = await api.get("/favorites");
        const favData = res.data.favorites || res.data || [];
        setData(Array.isArray(favData) ? favData : []);
      } else {
        const storedData = localStorage.getItem("navigation_history");
        if (storedData) {
          setData(JSON.parse(storedData).slice(0, MAX_LIMIT));
        } else {
          setData([]);
        }
      }
    } catch (err) {
      console.error("Fetch Data Error:", err);
      if (isFavoritePage) setData([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsVisible(true);
    fetchData();
  }, [location.pathname]);

  const handleNavigate = async (item) => {
    // 🌟 ดึงข้อมูล target ให้ถูกต้อง
    const targetPlace = item.place || item.Place || item;
    const itemId = targetPlace.id || targetPlace._id || item.placeId;
    
    let targetUrl = targetPlace.googleMapsUrl || targetPlace.mapUrl || targetPlace.location_url;
    
    if (!targetUrl) {
      try {
        const res = await api.get(`/places/${itemId}`);
        const placeData = res.data.place || res.data;
        targetUrl = placeData.googleMapsUrl || placeData.mapUrl || placeData.location_url;
      } catch (error) {
        console.error("Auto-fetch url failed", error);
      }
    }

    if (!targetUrl || targetUrl === "") {
      return Swal.fire({
        icon: 'error',
        title: 'ไม่พบพิกัด',
        text: 'สถานที่นี้ไม่มีข้อมูล Google Maps สำหรับนำทาง',
        confirmButtonColor: '#FF8E6E',
      });
    }

    try {
      const history = JSON.parse(localStorage.getItem("navigation_history") || "[]");
      const now = new Date().toLocaleDateString('th-TH');
      const filteredHistory = history.filter(h => (h.id || h._id) !== itemId);
      
      const newHistory = [{ ...item, date: now, id: itemId, googleMapsUrl: targetUrl }, ...filteredHistory];
      localStorage.setItem("navigation_history", JSON.stringify(newHistory.slice(0, 10)));
      window.dispatchEvent(new Event("authChange"));
    } catch (e) {
      console.error("Save history failed", e);
    }

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async (id, name) => {
    const title = isFavoritePage ? 'เลิกกดหัวใจ?' : 'ลบประวัติการเดินทาง?';
    const text = isFavoritePage 
      ? `คุณต้องการนำ "${name}" ออกจากรายการโปรดใช่หรือไม่?` 
      : `รายการนี้จะหายไปจากประวัติของคุณ`;

    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF8E6E',
      cancelButtonColor: '#ccc',
      confirmButtonText: 'ใช่, นำออก',
      cancelButtonText: 'ยกเลิก',
      background: '#FDF8F1',
      customClass: { popup: 'rounded-[30px]' }
    });

    if (result.isConfirmed) {
      try {
        if (isFavoritePage) {
          await api.post("/favorites/toggle", { placeId: id }); 
        }

        const newData = data.filter(item => {
           const targetPlace = item.place || item.Place || item;
           const itemId = targetPlace.id || targetPlace._id || item.placeId;
           return itemId !== id;
        });
        setData(newData);

        if (!isFavoritePage) {
          localStorage.setItem("navigation_history", JSON.stringify(newData));
        }

        window.dispatchEvent(new Event("authChange"));
        Swal.fire({ icon: 'success', title: 'สำเร็จ', timer: 800, showConfirmButton: false });
      } catch (err) {
        Swal.fire("ผิดพลาด", "ไม่สามารถลบข้อมูลได้ในขณะนี้", "error");
      }
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#FDF8F1] pt-32 pb-20 px-4 font-['Prompt',sans-serif]">
      <div className={`max-w-6xl mx-auto transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-4">
            <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-[#7E7869] hover:text-[#FF8E6E] transition-all font-bold">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> ย้อนกลับ
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-[#4A453A]">
              {isFavoritePage ? 'รายการ' : 'ประวัติการ'} <span className="text-[#FF8E6E]">{isFavoritePage ? 'โปรด' : 'นำทาง'}</span>
            </h1>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${data.length >= MAX_LIMIT ? 'bg-red-400' : 'bg-[#FF8E6E]'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.length / MAX_LIMIT) * 100}%` }}
                />
              </div>
              <span className={`text-sm font-black ${data.length >= MAX_LIMIT ? 'text-red-500' : 'text-[#7E7869]'}`}>
                {data.length} / {MAX_LIMIT}
              </span>
            </div>
          </div>
        </div>

        {/* --- Toggle Switch --- */}
        <div className="relative flex bg-[#EFE9D9]/50 backdrop-blur-md p-1.5 rounded-2xl mb-12 h-14 items-center border border-white max-w-[340px] mx-auto md:mx-0">
          <motion.div 
            className="absolute top-1.5 bottom-1.5 rounded-xl shadow-lg bg-gradient-to-r from-[#FF7F67] to-[#FFB385] w-[calc(50%-6px)]"
            initial={false}
            animate={{ x: isFavoritePage ? 0 : '100%' }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <button onClick={() => navigate('/favorites')} className={`relative flex-1 h-full text-sm font-bold z-10 flex items-center justify-center gap-2 ${isFavoritePage ? 'text-white' : 'text-gray-400'}`}>
            <Heart className={`w-4 h-4 ${isFavoritePage ? 'fill-white' : ''}`} /> รายการโปรด
          </button>
          <button onClick={() => navigate('/history')} className={`relative flex-1 h-full text-sm font-bold z-10 flex items-center justify-center gap-2 ${!isFavoritePage ? 'text-white' : 'text-gray-400'}`}>
            <Clock className="w-4 h-4" /> ประวัติ
          </button>
        </div>

        {/* --- Grid Content --- */}
        {loading ? (
          <div className="text-center py-20 font-bold text-[#7E7869] animate-pulse">กำลังโหลดข้อมูล...</div>
        ) : data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {data.map((item) => {
                // 🌟 ตัวดักจับข้อมูลแบบครอบจักรวาล
                // รองรับทั้ง item.place (จาก DB) หรือ item ตรงๆ (จาก LocalStorage)
                const targetPlace = item.place || item.Place || item;

                const itemId = targetPlace.id || targetPlace._id || item.placeId;
                const itemName = targetPlace.name || 'ไม่มีชื่อสถานที่';
                const itemCategory = targetPlace.category;
                const itemDesc = targetPlace.description || 'ไม่มีรายละเอียด';
                
                // 🌟 ดึงรูปภาพให้ถูกต้อง รองรับทั้ง array (images) และ string (image)
                let rawImage = null;
                if (targetPlace.images && targetPlace.images.length > 0) {
                    rawImage = targetPlace.images[0];
                } else if (targetPlace.image) {
                    rawImage = targetPlace.image;
                }

                const imageUrl = rawImage 
                  ? (rawImage.startsWith('http') ? rawImage : `${IMAGE_BASE_URL}${rawImage}`)
                  : "https://placehold.co/600x400/EFE9D9/4A453A?text=No+Image";

                return (
                  <motion.div 
                    layout
                    key={itemId} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  >
                    <div className="h-56 relative overflow-hidden">
                      <img src={imageUrl} alt={itemName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 left-4"><CategoryChip category={itemCategory} /></div>
                      
                      {!isFavoritePage && item.date && (
                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-2 text-xs font-bold text-[#4A453A]">
                          <Calendar className="w-3.5 h-3.5 text-[#FF8E6E]" /> {item.date}
                        </div>
                      )}

                      <button 
                        onClick={() => handleDelete(itemId, itemName)} 
                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-lg transition-all active:scale-90"
                      >
                        {isFavoritePage ? <Heart className="w-5 h-5 fill-red-500 text-red-500" /> : <Trash2 className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="p-8">
                      <h3 className="text-2xl font-black text-[#4A453A] mb-3 group-hover:text-[#FF8E6E] transition-colors line-clamp-1">{itemName}</h3>
                      <p className="text-[#7E7869] text-sm leading-relaxed mb-8 line-clamp-2">{itemDesc}</p>
                      <div className="flex items-center justify-between">
                        <button onClick={() => navigate(`/place/${itemId}`)} className="text-[#FF8E6E] font-black text-sm flex items-center gap-2 group/btn">
                          รายละเอียด <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                        </button>
                        
                        <button 
                          onClick={() => handleNavigate(item)}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-20 text-center border border-white shadow-xl">
            <Sparkles className="w-12 h-12 text-[#FF8E6E] mx-auto mb-6 animate-pulse" />
            <h2 className="text-2xl font-black text-[#4A453A] mb-8">ยังไม่มีข้อมูลในส่วนนี้</h2>
            <button onClick={() => navigate("/")} className="bg-[#4A453A] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#FF8E6E] transition-all">ไปสำรวจกันเลย</button>
          </motion.div>
        )}
      </div>
    </main>
  );
}