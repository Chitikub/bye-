'use client';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, Navigation, ArrowLeft, Loader2, 
  Map, Route, CheckCircle2, Car, Flag, ArrowDown, Filter, ChevronDown, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios";
import Swal from "sweetalert2";

// 🌟 ฟังก์ชันคำนวณระยะทาง
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1)); 
};

export default function TripPlanner() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [userLoc, setUserLoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // 🌟 State สำหรับ Dropdown คัดกรอง
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const distanceOptions = [
    { label: "รายการโปรดทั้งหมด", value: null },
    { label: "ใกล้ฉันมาก (< 5 กม.)", value: 5 },
    { label: "รัศมีปานกลาง (< 15 กม.)", value: 15 },
    { label: "รัศมีกว้าง (< 30 กม.)", value: 30 },
  ];

  useEffect(() => {
    fetchFavoritesAndCalculate();
  }, []);

  const fetchFavoritesAndCalculate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("กรุณาเข้าสู่ระบบ", "คุณต้องเข้าสู่ระบบเพื่อดูแผนการเดินทาง", "warning");
        navigate('/login');
        return;
      }

      // 1. ขอพิกัดผู้ใช้
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const currentLat = position.coords.latitude;
            const currentLng = position.coords.longitude;
            setUserLoc({ lat: currentLat, lng: currentLng });
            
            setCalculating(true);
            // 2. ดึงรายการโปรดและคำนวณระยะทาง
            await processFavoriteDistances(currentLat, currentLng, token);
          },
          (error) => {
            console.warn("GPS Denied", error);
            Swal.fire("ไม่สามารถระบุตำแหน่งได้", "กรุณาเปิด GPS เพื่อคำนวณระยะทางจากรายการโปรด", "error");
            setLoading(false);
          }
        );
      } else {
        Swal.fire("เบราว์เซอร์ไม่รองรับ", "อุปกรณ์ของคุณไม่รองรับการดึงตำแหน่ง", "error");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error initiating Trip Planner:", err);
      setLoading(false);
    }
  };

  const processFavoriteDistances = async (currentLat, currentLng, token) => {
    try {
      // ดึงรายการโปรดจาก Backend
      const favRes = await api.get("/favorites", { headers: { Authorization: `Bearer ${token}` } });
      const favorites = favRes.data.favorites || favRes.data || [];

      if (favorites.length === 0) {
        setPlaces([]);
        setLoading(false);
        return;
      }

      // ดึงพิกัดจาก Google Maps API ผ่าน Backend สำหรับแต่ละรายการโปรด
      const placesWithDistance = await Promise.all(
        favorites.map(async (fav) => {
          try {
            const detailRes = await api.get(`/maps/details/${fav.placeId}`);
            const location = detailRes.data.geometry?.location;
            
            if (location) {
              const dist = calculateDistance(currentLat, currentLng, location.lat, location.lng);
              return { 
                ...fav, 
                distance: dist,
                address: detailRes.data.vicinity || detailRes.data.formatted_address || "ไม่ระบุที่อยู่"
              };
            }
            return { ...fav, distance: 9999, address: "ไม่สามารถคำนวณพิกัดได้" }; 
          } catch (e) {
            return { ...fav, distance: 9999, address: "เชื่อมต่อข้อมูลไม่ได้" };
          }
        })
      );

      // เรียงลำดับจากใกล้ไปไกล
      const sortedPlaces = placesWithDistance.sort((a, b) => a.distance - b.distance);
      setPlaces(sortedPlaces);
    } catch (error) {
      console.error("Calculate distance failed", error);
    } finally {
      setCalculating(false);
      setLoading(false);
    }
  };

  // 🌟 กรองข้อมูลรายการโปรดตามระยะทางที่เลือก
  const filteredPlaces = selectedDistance 
    ? places.filter(p => p.distance !== 9999 && p.distance <= selectedDistance) 
    : places;

  return (
    <div className="min-h-screen bg-[#FDF8F1] font-['Prompt'] pt-28 pb-32 px-4">
      <main className="container mx-auto max-w-3xl">
        
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-[#7E7869] hover:text-[#FF8E6E] font-bold mb-6 transition-all bg-white px-5 py-2.5 rounded-full shadow-sm">
            <ArrowLeft size={18} /> ย้อนกลับ
          </button>
          <h1 className="text-4xl md:text-6xl font-black text-[#4A453A]">
            แผนการ<span className="text-[#FF8E6E]">เดินทาง 🗺️</span>
          </h1>
          <p className="text-[#7E7869] mt-4 font-medium text-lg">
            จัดเรียง <span className="text-[#FF8E6E]">"รายการโปรด"</span> ตามระยะทางจริงจากจุดที่คุณอยู่
          </p>
        </div>

        {/* 🌟 Dropdown คัดกรองระยะทาง */}
        {!loading && !calculating && places.length > 0 && (
          <div className="flex items-center gap-4 mb-10 bg-white p-5 rounded-[2rem] shadow-sm border border-[#EFE9D9]">
            <div className="relative w-full">
              <label className="text-xs font-bold text-gray-400 mb-1 block ml-2 text-left">กรองจากรายการโปรดของคุณ</label>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-[#4A453A] hover:border-[#FF8E6E] transition-colors"
              >
                <span className="flex items-center gap-2 text-left">
                  <Filter size={18} className="text-[#FF8E6E]" />
                  {distanceOptions.find(opt => opt.value === selectedDistance)?.label}
                </span>
                <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 w-full mt-2 bg-white border border-[#EFE9D9] rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    {distanceOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setSelectedDistance(opt.value); setIsDropdownOpen(false); }}
                        className={`w-full text-left px-5 py-4 font-medium transition-colors border-b border-gray-50 last:border-0 ${
                          selectedDistance === opt.value ? 'bg-orange-50 text-[#FF8E6E] font-bold' : 'text-[#7E7869] hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* โหมดกำลังโหลด */}
        {(loading || calculating) && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[3rem] border border-dashed border-[#EFE9D9]">
            <Loader2 className="w-16 h-16 text-[#FF8E6E] animate-spin mb-4" />
            <h2 className="text-2xl font-black text-[#4A453A]">
              {calculating ? 'กำลังคำนวณเส้นทาง...' : 'กำลังดึงรายการโปรด...'}
            </h2>
            <p className="text-[#7E7869] mt-2 italic text-center">ระบบกำลังตรวจสอบพิกัดสถานที่ที่คุณบันทึกไว้</p>
          </div>
        )}

        {/* --- โหมดแสดง Timeline Journey --- */}
        {!loading && !calculating && filteredPlaces.length > 0 && (
          <div className="relative mt-12 pl-4 md:pl-8">
            
            {/* เส้นเชื่อมต่อ (The Line) */}
            <div className="absolute left-[41px] md:left-[57px] top-10 bottom-10 w-2 bg-gradient-to-b from-[#FF8E6E] via-[#FFB385] to-[#4A453A] rounded-full opacity-30" />

            {/* จุดเริ่มต้น */}
            <div className="flex items-start gap-4 md:gap-8 mb-16 relative z-10">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#FF8E6E] text-white rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-[#FDF8F1] shrink-0">
                <MapPin size={28} />
              </div>
              <div className="pt-2 md:pt-4 bg-white px-6 py-4 rounded-[2rem] shadow-sm border border-[#EFE9D9] flex-1">
                <h3 className="text-xl md:text-2xl font-black text-[#4A453A]">จุดเริ่มต้น (พิกัดปัจจุบัน)</h3>
                <div className="flex items-center gap-2 mt-2 text-green-500 font-bold text-sm">
                  <CheckCircle2 size={16} /> ระบุตำแหน่งสำเร็จ
                </div>
              </div>
            </div>

            {/* จุดแวะต่างๆ */}
            <div className="space-y-16">
              <AnimatePresence mode="popLayout">
                {filteredPlaces.map((place, index) => {
                  const isUnknown = place.distance === 9999;
                  const prevDist = index === 0 ? 0 : filteredPlaces[index - 1].distance;
                  const distFromPrev = isUnknown ? null : (place.distance - prevDist).toFixed(1);
                  
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      key={place.id} 
                      className="relative flex items-start gap-4 md:gap-8 z-10"
                    >
                      {!isUnknown && (
                        <div className="absolute -top-10 left-[20px] md:left-[36px] bg-white text-[#FF8E6E] px-3 py-1.5 rounded-full text-xs md:text-sm font-black shadow-md border border-[#EFE9D9] flex items-center gap-1 z-20">
                          <ArrowDown size={14} /> +{distFromPrev} กม.
                        </div>
                      )}

                      <div className="w-16 h-16 md:w-20 md:h-20 bg-white border-[5px] border-[#FF8E6E] text-[#FF8E6E] rounded-full flex flex-col items-center justify-center shadow-lg shrink-0 mt-4 relative z-10">
                        <span className="text-xs font-bold text-gray-400">ลำดับ</span>
                        <span className="text-2xl font-black leading-none">{index + 1}</span>
                      </div>

                      <div className="flex-1 bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all border border-[#EFE9D9] group mt-2 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <h3 className="text-xl md:text-2xl font-black text-[#2D2A26] line-clamp-2">{place.placeName}</h3>
                          <span className={`shrink-0 font-black text-lg px-4 py-2 rounded-xl ${isUnknown ? 'bg-gray-100 text-gray-400 text-sm' : 'bg-orange-50 text-[#FF8E6E]'}`}>
                            {isUnknown ? 'ไม่ทราบพิกัด' : `${place.distance} กม.`}
                          </span>
                        </div>

                        <p className="text-sm text-[#AFA99B] line-clamp-2 mb-6 flex items-start gap-2">
                          <MapPin className="shrink-0 mt-0.5" size={16} /> {place.address}
                        </p>

                        <div className="flex flex-wrap gap-3">
                          <button 
                            onClick={() => window.open(`https://www.google.com/maps/place/.../@13.7563,100.5018,15z2{place.placeId}`, '_blank')}
                            className="flex-1 py-3 bg-[#4A453A] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#FF8E6E] transition-colors shadow-md active:scale-95"
                          >
                            <Car size={18} /> ขับรถไปที่นี่
                          </button>
                          <button 
                            onClick={() => navigate(`/g-place/${place.placeId}`)}
                            className="px-6 py-3 bg-gray-100 text-[#7E7869] rounded-xl font-bold flex items-center justify-center hover:bg-orange-50 hover:text-[#FF8E6E] transition-colors"
                          >
                            รายละเอียด
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* จุดสิ้นสุด */}
            <motion.div 
              layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex items-start gap-4 md:gap-8 mt-16 relative z-10"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#4A453A] text-white rounded-full flex items-center justify-center shadow-xl border-4 border-[#FDF8F1] shrink-0">
                <Flag size={28} />
              </div>
              <div className="pt-2 md:pt-4 text-left">
                <h3 className="text-2xl font-black text-[#4A453A]">จบทริปรายการโปรด</h3>
                <p className="text-[#7E7869] font-medium">เดินทางปลอดภัย มีความสุขกับทุกที่ที่ไปนะครับ!</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* กรณีไม่มีข้อมูล หรือ กรองไม่เจอ */}
        {!loading && !calculating && (
          <>
            {places.length === 0 ? (
              <div className="text-center py-20 bg-white/50 rounded-[3rem] border border-dashed border-[#EFE9D9] mt-10">
                <Heart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-black text-[#4A453A]">ยังไม่มีรายการที่บันทึกไว้</h2>
                <p className="text-[#7E7869] mt-2 mb-8 px-4">ค้นหาสถานที่ที่คุณประทับใจ แล้วกด ❤️ เพื่อนำมาวางแผนที่นี่</p>
                <button onClick={() => navigate('/')} className="px-10 py-4 bg-[#4A453A] text-white rounded-2xl font-bold hover:bg-[#FF8E6E] transition-all shadow-lg active:scale-95">
                  ไปค้นหาสถานที่กัน!
                </button>
              </div>
            ) : filteredPlaces.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white/50 rounded-[3rem] border border-[#EFE9D9] mt-10">
                <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-[#4A453A]">ไม่พบรายการในระยะ {selectedDistance} กม.</h2>
                <p className="text-[#7E7869] mt-2 px-4">ลองเลือก "รายการโปรดทั้งหมด" หรือขยายระยะทางดูนะครับ</p>
              </motion.div>
            ) : null}
          </>
        )}

      </main>
    </div>
  );
}