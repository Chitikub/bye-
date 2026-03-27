'use client';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Clock, 
  ChevronLeft, 
  Trash2, 
  ArrowRight, 
  Navigation, 
  Sparkles,
  Calendar,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import api from "@/api/axios";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [histories, setHistories] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all"); 
  const [isVisible, setIsVisible] = useState(false);

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get("/history");
      const data = res.data.histories || res.data || [];
      setHistories(Array.isArray(data) ? data : []);
      setFilteredData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch History Error:", err);
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsVisible(true);
    fetchHistory();
  }, []);

  // 🌟 Logic กรองข้อมูลตามช่วงเวลา
  useEffect(() => {
    if (timeFilter === "all") {
      setFilteredData(histories);
      return;
    }

    const now = new Date();
    const result = histories.filter(item => {
      const itemDate = new Date(item.visitedAt);
      const diffTime = Math.abs(now - itemDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= parseInt(timeFilter);
    });

    setFilteredData(result);
  }, [timeFilter, histories]);

  const handleDeleteHistory = async (id, name) => {
    const result = await Swal.fire({
      title: 'ลบประวัติการเดินทาง?',
      text: `คุณต้องการลบ "${name}" ออกจากประวัติใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF8E6E',
      confirmButtonText: 'ใช่, ลบออก',
      cancelButtonText: 'ยกเลิก',
      background: '#FDF8F1',
      customClass: { popup: 'rounded-[30px]' }
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/history/${id}`);
        setHistories(histories.filter(item => item.id !== id));
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
              ประวัติการ<span className="text-[#FF8E6E]">นำทาง</span>
            </h1>
            <p className="text-[#7E7869] font-medium text-lg">รวบรวมพิกัดที่คุณเคยไปทั้งหมด {filteredData.length} รายการ</p>
          </div>

          {/* --- Time Filter Chips --- */}
          <div className="flex bg-[#EFE9D9]/50 p-1.5 rounded-2xl gap-1 border border-white">
            {[
              { label: "ทั้งหมด", value: "all" },
              { label: "7 วันล่าสุด", value: "7" },
              { label: "30 วันล่าสุด", value: "30" }
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setTimeFilter(f.value)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${timeFilter === f.value ? 'bg-[#4A453A] text-white shadow-md' : 'text-[#7E7869] hover:bg-white'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- Content --- */}
        {loading ? (
          <div className="text-center py-20 animate-pulse text-[#7E7869] font-bold text-xl">
            กำลังดึงความทรงจำ...
          </div>
        ) : filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredData.map((item) => {
                const imageUrl = item.placeImage 
                  ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${item.placeImage}&key=${API_KEY}`
                  : "https://placehold.co/600x400/EFE9D9/4A453A?text=No+Image";

                return (
                  <motion.div 
                    layout key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                    className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  >
                    <div className="h-56 relative overflow-hidden">
                      <img src={imageUrl} alt={item.placeName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      
                      {/* วันที่ที่ไป */}
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold text-[#4A453A] shadow-sm">
                        <Calendar className="w-3.5 h-3.5 text-[#FF8E6E]" /> 
                        {new Date(item.visitedAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </div>

                      <button 
                        onClick={() => handleDeleteHistory(item.id, item.placeName)} 
                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-lg transition-all active:scale-90"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-8">
                      <h3 className="text-2xl font-black text-[#4A453A] mb-4 group-hover:text-[#FF8E6E] transition-colors line-clamp-1">{item.placeName}</h3>
                      
                      <div className="flex items-center justify-between mt-6">
                        <button onClick={() => navigate(`/g-place/${item.placeId}`)} className="text-[#FF8E6E] font-black text-sm flex items-center gap-2 group/btn">
                          รายละเอียด <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                        </button>
                        
                        <button 
                          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${item.placeId}`, '_blank')}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#4A453A] text-white rounded-xl text-xs font-bold hover:bg-[#FF8E6E] transition-colors shadow-lg active:scale-95"
                        >
                          <Navigation className="w-3.5 h-3.5" /> นำทางอีกครั้ง
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-20 text-center border border-white shadow-xl max-w-2xl mx-auto">
            <Clock className="w-16 h-16 text-[#FF8E6E] mx-auto mb-6 opacity-40" />
            <h2 className="text-2xl font-black text-[#4A453A] mb-4">ยังไม่มีประวัติการเดินทาง</h2>
            <p className="text-[#7E7869] mb-8">พิกัดแรกของคุณกำลังรออยู่นะ!</p>
            <button onClick={() => navigate("/")} className="bg-[#4A453A] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#FF8E6E] transition-all shadow-lg">เริ่มการเดินทาง</button>
          </div>
        )}
      </div>
    </main>
  );
}