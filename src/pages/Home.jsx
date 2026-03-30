'use client';
import { Search, ArrowLeft, Star, MapPin, X, Navigation } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import heroBg from "@/assets/hero-bg.png";
import MoodSelector from "@/components/MoodSelector";
import api, { IMAGE_BASE_URL } from "../api/axios";
import Swal from "sweetalert2";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMood, setActiveMood] = useState(null); 
  const [aiModalData, setAiModalData] = useState(null);

  const navigate = useNavigate();
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const moodCategories = {
    happy: [
      { id: 'amusement', label: '🎢 สวนสนุก', query: 'สวนสนุก' },
      { id: 'event', label: '🎪 สถานที่จัดงาน', query: 'Event Space' },
      { id: 'attraction', label: '📸 ที่เที่ยวถ่ายรูป', query: 'สถานที่ท่องเที่ยว' }
    ],
    sad: [
      { id: 'park', label: '🌳 สวนสาธารณะ', query: 'สวนสาธารณะ' },
      { id: 'bookstore', label: '📚 ร้านหนังสือ', query: 'ร้านหนังสือ' },
      { id: 'gallery', label: '🎨 หอศิลป์', query: 'Art Gallery' }
    ],
    bored: [
      { id: 'museum', label: '🏛️ พิพิธภัณฑ์', query: 'พิพิธภัณฑ์' },
      { id: 'mall', label: '🛍️ ห้างสรรพสินค้า', query: 'ห้างสรรพสินค้า' },
      { id: 'boardgame', label: '🎲 บอร์ดเกมคาเฟ่', query: 'Board Game Cafe' }
    ],
    stressed: [
      { id: 'spa', label: '💆‍♀️ สปา นวดผ่อนคลาย', query: 'สปา' },
      { id: 'cafe', label: '☕ คาเฟ่สงบๆ', query: 'Quiet Cafe' },
      { id: 'botanical', label: '🌺 สวนพฤกษศาสตร์', query: 'Botanical Garden' }
    ],
    angry: [
      { id: 'gym', label: '🏋️‍♂️ ยิมออกกำลังกาย', query: 'ยิมออกกำลังกาย' },
      { id: 'boxing', label: '🥊 ค่ายมวย', query: 'Boxing Gym' },
      { id: 'stadium', label: '🏟️ สนามกีฬา', query: 'สนามกีฬา' }
    ]
  };

  // 🌟 ฟังก์ชันเช็คการ Login
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: 'หยุดก่อน! ✋',
        text: 'กรุณาเข้าสู่ระบบเพื่อใช้ฟีเจอร์วิเคราะห์อารมณ์และค้นหาสถานที่',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#FF8E6E',
        cancelButtonColor: '#7E7869',
        confirmButtonText: 'ไปหน้าเข้าสู่ระบบ',
        cancelButtonText: 'ไว้ทีหลัง',
        reverseButtons: true,
        customClass: { popup: 'rounded-[30px]' }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return false;
    }
    return true;
  };

  const handleMoodSelect = (emotionId) => {
    // 🌟 เช็ค Login ก่อนกด Emoji
    if (!checkAuth()) return;
    navigate(`/filter?mood=${emotionId}`);
  };

  const handleCategorySelect = (categoryQuery) => {
    const searchKeyword = `${categoryQuery} ใกล้ฉัน`;
    const googleMapsUrl = `https://www.google.com/maps/place/.../@13.7563,100.5018,15z2{encodeURIComponent(searchKeyword)}`;
    window.open(googleMapsUrl, '_blank'); 
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // 🌟 เช็ค Login ก่อนเริ่มค้นหาด้วย AI
    if (!checkAuth()) return;

    try {
      Swal.fire({
        title: 'กำลังให้ AI รับฟังคุณ...',
        html: 'ระบบกำลังวิเคราะห์ความรู้สึกและหาสถานที่บำบัดใจ 🤖',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      const aiRes = await api.post("/ai-search", { message: searchQuery });
      const { emotion, reason } = aiRes.data;

      let moodKey = "happy";
      if (emotion.includes("สุข")) moodKey = "happy";
      else if (emotion.includes("โกรธ")) moodKey = "angry";
      else if (emotion.includes("เบื่อ")) moodKey = "bored";
      else if (emotion.includes("เศร้า")) moodKey = "sad";
      else if (emotion.includes("เครียด")) moodKey = "stressed";

      const randomCategory = moodCategories[moodKey][Math.floor(Math.random() * moodCategories[moodKey].length)].query;

      const findPlacesForPopup = (lat, lng) => {
        api.get("/maps/search", { params: { keyword: randomCategory, lat, lng } })
          .then(res => {
            Swal.close();
            setAiModalData({ emotion, reason, moodKey, places: res.data.slice(0, 3) }); 
          })
          .catch(err => {
            Swal.close();
            setAiModalData({ emotion, reason, moodKey, places: [] });
          });
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => findPlacesForPopup(pos.coords.latitude, pos.coords.longitude),
          () => findPlacesForPopup(null, null)
        );
      } else {
        findPlacesForPopup(null, null);
      }

    } catch (error) {
      console.error("AI Analysis Error:", error);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อระบบ AI ได้ในขณะนี้', 'error');
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ 
        x: (e.clientX / window.innerWidth) * 15, 
        y: (e.clientY / window.innerHeight) * 15 
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="w-full bg-[#FDF8F1] text-[#4A453A] overflow-x-hidden font-['Prompt',sans-serif]">
      
      {/* 🌟 Custom Pop-up การบำบัดด้วย AI */}
      <AnimatePresence>
        {aiModalData && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button 
                onClick={() => setAiModalData(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#FF8E6E] hover:text-white transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="bg-[#FDF8F1] p-8 md:p-10 rounded-t-[2.5rem] border-b border-[#EFE9D9]">
                <div className="inline-block px-4 py-2 bg-orange-50 text-[#FF8E6E] rounded-full font-bold text-sm mb-4">
                  AI วิเคราะห์เสร็จสิ้น 🤖
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-[#4A453A] mb-3 leading-tight">
                  ดูเหมือนคุณกำลังรู้สึก <br/><span className="text-[#FF8E6E]">"{aiModalData.emotion}"</span> ใช่ไหม?
                </h2>
                <p className="text-[#7E7869] text-lg font-medium leading-relaxed italic">
                  "{aiModalData.reason}"
                </p>
              </div>

              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-[#4A453A]">สถานที่แนะนำสำหรับคุณ 🎯</h3>
                </div>

                <div className="space-y-4 mb-8">
                  {aiModalData.places.length > 0 ? (
                    aiModalData.places.map((place, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => navigate(`/g-place/${place.place_id}`)}
                        className="group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-[#EFE9D9] hover:border-[#FF8E6E] hover:shadow-md transition-all cursor-pointer bg-white"
                      >
                        <div className="w-full sm:w-32 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                          {place.photos && place.photos.length > 0 ? (
                            <img 
                              src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photo_reference=${place.photos[0].photo_reference}&key=${API_KEY}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="font-bold text-lg text-[#2D2A26] line-clamp-1 group-hover:text-[#FF8E6E] transition-colors">{place.name}</h4>
                          <p className="text-sm text-[#AFA99B] line-clamp-1 flex items-center gap-1 mt-1">
                            <MapPin size={14} /> {place.vicinity || place.formatted_address}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="flex items-center gap-1 text-xs font-bold bg-orange-50 text-[#FF8E6E] px-2 py-1 rounded-lg">
                              <Star size={12} className="fill-[#FF8E6E]" /> {place.rating || "-"}
                            </span>
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center pr-2">
                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#7E7869] group-hover:bg-[#FF8E6E] group-hover:text-white transition-colors">
                            <Navigation size={18} className="translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-400 font-medium">ไม่พบสถานที่ใกล้เคียงในขณะนี้</div>
                  )}
                </div>

                <button 
                  onClick={() => navigate(`/filter?mood=${aiModalData.moodKey}`)}
                  className="w-full py-4 bg-[#4A453A] text-white rounded-xl font-bold hover:bg-[#FF8E6E] transition-colors shadow-lg active:scale-95"
                >
                  ดูสถานที่บำบัดทั้งหมด
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HERO SECTION --- */}
      <section className="relative w-full h-[75vh] md:h-[85vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-[#FDF8F1]">
        <div className="absolute inset-0 z-0 scale-110 transition-transform duration-1000 ease-out" style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
          <img src={heroBg} className="h-full w-full object-cover object-center" alt="Hero Background" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF8F1] via-[#FDF8F1]/60 to-transparent z-20" />
        <div className="container relative z-30 px-6 text-center mx-auto">
          <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 font-black text-4xl sm:text-7xl lg:text-9xl text-[#4A4A4A] drop-shadow-sm leading-tight lg:leading-[0.9]">
            ไปไหนดี... <br className="hidden sm:block"/>
            <span className="text-[#FF8E6E] inline-block hover:scale-105 transition-transform cursor-default drop-shadow-md">ให้อารมณ์บอก</span>
          </h1>
          <p className="mx-auto mt-4 sm:mt-8 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 text-base sm:text-xl text-[#7E7869] font-medium px-4">
            พิมพ์ความรู้สึกหรืออาการของคุณตอนนี้ แล้ว AI จะหาสถานที่ที่ช่วยให้คุณรู้สึกดีขึ้น
          </p>

          <div className="mx-auto mt-8 sm:mt-12 max-w-xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
            <form onSubmit={handleSearchSubmit} className="relative group px-2">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF8E6E] to-[#FFA07A] rounded-full blur opacity-15 group-focus-within:opacity-100 transition duration-1000"></div>
              <div className="relative flex items-center bg-white/95 backdrop-blur-xl rounded-full shadow-xl overflow-hidden border border-white/50">
                <button type="submit" className="ml-5 flex items-center outline-none">
                   <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF8E6E] hover:scale-110 transition-all cursor-pointer" />
                </button>
                <input 
                  type="text" 
                  placeholder="วันนี้รู้สึกยังไง (เช่น ปวดหัว, เบื่อจัง, อกหัก)..." 
                  className="w-full py-4 sm:py-6 px-4 text-sm sm:text-lg font-bold outline-none bg-transparent placeholder:text-gray-400" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <main className="container mx-auto px-5 -mt-10 sm:-mt-20 relative z-40 pb-20">
        <section className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-16 shadow-[0_32px_64px_-16px_rgba(74,69,58,0.1)] text-center border border-white transform transition-all duration-500 mx-auto max-w-4xl min-h-[400px]">
          
          {!activeMood ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl sm:text-4xl font-black mb-4 tracking-tight text-[#4A4A4A]">วันนี้รู้สึกยังไง? 🤔</h2>
              <p className="text-sm sm:text-lg font-medium mb-8 text-[#8E8E8E] leading-relaxed">คลิกเลือกอารมณ์ หรือพิมพ์บอกเราด้านบนได้เลย</p>
              <div className="mt-4">
                <MoodSelector onSelectMood={handleMoodSelect} />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-2xl sm:text-4xl font-black mb-4 tracking-tight text-[#4A453A]">สถานที่แบบไหนดี? 🎯</h2>
              <p className="text-sm sm:text-lg font-medium mb-10 text-[#8E8E8E] leading-relaxed">เลือกประเภทสถานที่ที่คุณต้องการไปตอนนี้</p>
              
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-12">
                {moodCategories[activeMood].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.query)}
                    className="group relative px-6 py-4 sm:px-8 sm:py-5 bg-[#FDF8F1] border-2 border-transparent hover:border-[#FF8E6E] rounded-3xl transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95"
                  >
                    <span className="relative z-10 font-bold text-[#4A453A] group-hover:text-[#FF8E6E] text-base sm:text-lg transition-colors">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setActiveMood(null)}
                className="inline-flex items-center gap-2 text-[#7E7869] hover:text-[#FF8E6E] font-bold transition-colors border-b-2 border-transparent hover:border-[#FF8E6E] pb-1"
              >
                <ArrowLeft size={18} /> ย้อนกลับไปเลือกอารมณ์
              </button>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}