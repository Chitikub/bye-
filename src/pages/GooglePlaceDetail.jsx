'use client';
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Star, MapPin, Clock, Phone, 
  Navigation, Loader2, Image as ImageIcon, Heart, Car 
} from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";

export default function GooglePlaceDetail() {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false); 
  
  // 🌟 State เก็บระยะทางและเวลาเดินทางที่ได้จาก API
  const [distance, setDistance] = useState(null); 
  const [duration, setDuration] = useState(null); 

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/maps/details/${placeId}`);
        const placeData = res.data;
        setPlace(placeData);

        // 🌟 ขอพิกัด GPS ผู้ใช้เพื่อยิง API หาระยะทางขับรถจริง
        if (navigator.geolocation && placeData.geometry?.location) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const userLat = position.coords.latitude;
              const userLng = position.coords.longitude;
              const placeLat = placeData.geometry.location.lat;
              const placeLng = placeData.geometry.location.lng;
              
              try {
                // ยิงไปที่ Backend เพื่อขอ Distance Matrix
                const distRes = await api.get('/maps/distance', {
                  params: { originLat: userLat, originLng: userLng, destLat: placeLat, destLng: placeLng }
                });
                
                setDistance(distRes.data.distanceText); // เช่น "5.2 กม."
                setDuration(distRes.data.durationText); // เช่น "15 นาที"
              } catch (e) {
                console.log("ไม่สามารถดึงข้อมูลระยะทางจาก API ได้ (ตรวจสอบว่าทำ Backend หรือยัง)");
              }
            },
            (error) => {
              console.warn("ไม่สามารถดึง GPS ผู้ใช้ได้", error);
            }
          );
        }

        // เช็คสถานะหัวใจ (ต้องแนบ Token)
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const favRes = await api.get(`/favorites/check/${placeId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setIsFavorite(favRes.data.isFavorite);
          } catch (e) { console.log("Check favorite status failed"); }
        }
      } catch (error) {
        console.error("Error fetching details", error);
      } finally {
        setLoading(false);
      }
    };
    if (placeId) fetchDetails();
  }, [placeId]);

  // 💖 ฟังก์ชัน: บันทึก/ยกเลิก รายการโปรด
  const handleToggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return Swal.fire({
        icon: 'warning',
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถบันทึกรายการโปรดได้',
        confirmButtonColor: '#FF8E6E'
      });
    }

    try {
      const res = await api.post("/favorites/toggle", { 
        placeId: placeId,
        name: place.name,
        image: place.photos?.[0]?.photo_reference || "" 
      }, {
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setIsFavorite(res.data.isFavorite);
      
      Swal.fire({
        icon: 'success',
        title: res.data.isFavorite ? 'บันทึกรายการโปรดแล้ว' : 'นำออกจากรายการโปรดแล้ว',
        timer: 1000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-[30px]' }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'เซสชันอาจหมดอายุ กรุณาเข้าสู่ระบบใหม่',
        confirmButtonColor: '#FF8E6E'
      });
    }
  };

  // 🚀 ฟังก์ชัน: นำทาง และ บันทึกประวัติ
  const handleNavigation = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await api.post("/history", { 
          placeId: placeId,
          name: place.name,
          image: place.photos?.[0]?.photo_reference || ""
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error("Save history to backend failed", error);
      }
    }
    
    // สร้าง URL เปิด Google Maps โหมดเส้นทาง (Directions) ทันที
    const navUrl = `https://www.google.com/maps/dir/?api=1&destination=$${encodeURIComponent(place.name)}&destination_place_id=${placeId}`;
    window.open(navUrl, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F1] flex flex-col items-center justify-center">
      <Loader2 className="w-16 h-16 text-[#FF8E6E] animate-spin mb-4" />
      <h2 className="text-2xl font-black text-[#4A453A]">กำลังโหลดข้อมูลร้าน...</h2>
    </div>
  );

  if (!place) return <div className="text-center py-20 font-bold">ไม่พบข้อมูลสถานที่นี้</div>;

  return (
    <div className="min-h-screen bg-[#FDF8F1] font-['Prompt'] pt-24 pb-20">
      <main className="container mx-auto px-4 max-w-4xl">
        
        {/* Header: ปุ่มย้อนกลับ และ ปุ่มหัวใจ */}
        <div className="flex justify-between items-center mb-6 px-2">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-[#7E7869] hover:text-[#FF8E6E] font-bold transition-all">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> ย้อนกลับ
          </button>
          
          <button 
            onClick={handleToggleFavorite}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-400'}`}
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* --- Card รายละเอียดหลัก --- */}
        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-[#EFE9D9]">
          {place.photos && place.photos.length > 0 ? (
            <div className="h-[300px] md:h-[450px] overflow-hidden relative">
              <img 
                src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1000&photo_reference=${place.photos[0].photo_reference}&key=${API_KEY}`} 
                className="w-full h-full object-cover" 
                alt={place.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ) : (
            <div className="h-60 bg-gray-100 flex items-center justify-center text-gray-400">
                <ImageIcon size={48} className="opacity-20" />
            </div>
          )}

          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-black text-[#2D2A26] mb-4">{place.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-1.5 bg-orange-50 text-[#FF8E6E] px-4 py-2 rounded-xl font-black text-xl">
                <Star className="fill-[#FF8E6E]" size={22} /> {place.rating || 'N/A'}
              </div>
              <span className="text-[#AFA99B] font-medium text-lg">จาก {place.user_ratings_total || 0} รีวิว</span>
              
              {/* 🌟 แสดงระยะทางและเวลาขับรถตรงนี้ */}
              {distance && duration && (
                <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl font-black text-lg ml-auto md:ml-0">
                  <Car size={20} /> ห่างจากคุณ {distance} 
                  <span className="text-sm font-medium ml-1">({duration})</span>
                </div>
              )}
            </div>

            <div className="space-y-6 mb-10 border-t border-gray-50 pt-8">
              <div className="flex items-start gap-4 text-[#7E7869] font-medium text-lg">
                <MapPin className="shrink-0 text-[#FF8E6E] mt-1" size={24} /> 
                <span>{place.formatted_address}</span>
              </div>
              
              {place.formatted_phone_number && (
                <div className="flex items-center gap-4 text-[#7E7869] font-medium text-lg">
                  <Phone className="shrink-0 text-[#FF8E6E]" size={24} /> 
                  <span>{place.formatted_phone_number}</span>
                </div>
              )}
              
              {place.opening_hours && (
                <div className="flex items-center gap-4 text-[#7E7869] font-medium text-lg">
                  <Clock className="shrink-0 text-[#FF8E6E]" size={24} />
                  {place.opening_hours.open_now ? 
                    <span className="text-green-500 font-bold">● เปิดอยู่ตอนนี้</span> : 
                    <span className="text-red-500 font-bold">● ปิดแล้ว</span>
                  }
                </div>
              )}
            </div>

            <button 
              onClick={handleNavigation}
              className="w-full py-5 bg-[#4A453A] text-white rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-[#FF8E6E] transition-all shadow-lg active:scale-95"
            >
              <Navigation size={24} /> เริ่มการนำทางไปที่นี่
            </button>
          </div>
        </div>

        {/* --- ส่วนรีวิว --- */}
        {place.reviews && place.reviews.length > 0 ? (
          <div className="mt-16 px-2">
            <h2 className="text-3xl font-black text-[#4A453A] mb-10">รีวิว</h2>
            <div className="grid gap-8">
              {place.reviews.map((review, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#EFE9D9]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <img 
                        src={review.profile_photo_url || `https://ui-avatars.com/api/?name=${review.author_name}&background=FF8E6E&color=fff`} 
                        alt="profile" 
                        className="w-14 h-14 rounded-full border-2 border-orange-50 shadow-sm" 
                      />
                      <div>
                        <p className="font-bold text-[#2D2A26] text-lg leading-tight">{review.author_name}</p>
                        <p className="text-sm text-gray-400 mt-1">{review.relative_time_description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-lg text-[#FF8E6E] font-black">
                      <Star size={16} className="fill-[#FF8E6E]" /> {review.rating}
                    </div>
                  </div>
                  <p className="text-[#7E7869] font-medium leading-relaxed italic text-lg">"{review.text}"</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-16 text-center py-10 bg-white/50 rounded-[2rem] border border-dashed border-gray-200">
             <p className="text-gray-400 font-bold">ยังไม่มีข้อมูลรีวิวสำหรับสถานที่นี้</p>
          </div>
        )}
      </main>
    </div>
  );
}