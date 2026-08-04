"use client";
import { 
  Search, ArrowLeft, Star, MapPin, X, Navigation, Newspaper, 
  Calendar, Sparkles, ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import heroBg from "@/assets/hero-bg.png";
import MoodSelector from "@/components/MoodSelector";
import api from "../api/axios";
import Swal from "sweetalert2";
import { io } from "socket.io-client";

// เชื่อมต่อ Socket
const socket = io(import.meta.env.VITE_SOCKET_URL);

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeMood, setActiveMood] = useState(null);
  const [aiModalData, setAiModalData] = useState(null);
  const [searchPlaces, setSearchPlaces] = useState([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  
  // 🌟 State สำหรับระบบประกาศ
  const [announcements, setAnnouncements] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null); 

  const navigate = useNavigate();
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const moodCategories = {
    happy: [
      { id: "cafe", label: "☕ คาเฟ่", query: "คาเฟ่" },
      { id: "concert", label: "🎤 คอนเสิร์ต", query: "คอนเสิร์ต" },
      { id: "amusement", label: "🎢 สวนสนุก", query: "สวนสนุก" },
      { id: "restaurant", label: "🍽️ ร้านอาหาร", query: "ร้านอาหาร" },
      { id: "entertainment", label: "🎭 สถานบันเทิง", query: "สถานบันเทิง" },
      { id: "camp", label: "🏕️ แคมป์", query: "แคมป์" },
      { id: "golf", label: "⛳ สนามกอล์ฟ", query: "สนามกอล์ฟ" },
    ],
    sad: [
      { id: "river", label: "🌊 ริมแม่น้ำ", query: "ริมน้ำ" },
      { id: "park", label: "🌳 สวนสาธารณะ", query: "สวนสาธารณะ" },
      { id: "temple", label: "⛩️ วัด", query: "วัด" },
      { id: "forest", label: "🌲 ป่าเขา", query: "ป่าเขา" },
      { id: "viewpoint", label: "🌄 จุดชมวิว", query: "จุดชมวิว" },
      { id: "bar", label: "🍸 บาร์", query: "บาร์" },
      { id: "beach", label: "🏖️ ทะเล", query: "ทะเล" },
    ],
    bored: [
      { id: "exhibition", label: "🖼️ นิทรรศการ", query: "นิทรรศการ" },
      { id: "workshop", label: "🛠️ workshop", query: "workshop" },
      { id: "beach", label: "🏖️ ทะเล", query: "ทะเล" },
      { id: "cinema", label: "🎬 โรงภาพยนตร์", query: "โรงภาพยนตร์" },
      { id: "cafe", label: "☕ ร้านกาแฟ", query: "ร้านกาแฟ" },
      { id: "event", label: "🎪 งาน Event", query: "Event" },
    ],
    stressed: [
      { id: "boardgame", label: "🎲 ร้านบอร์ดเกม", query: "ร้านบอร์ดเกม" },
      { id: "mall", label: "🛍️ ห้างสรรพสินค้า", query: "ห้างสรรพสินค้า" },
      { id: "spa", label: "💆‍♀️ สปา", query: "สปา" },
      { id: "onsen", label: "♨️ ออนเซน", query: "ออนเซน" },
      { id: "resort", label: "🏞️ ที่พักท่ามกลางธรรมชาติ", query: "ที่พักท่ามกลางธรรมชาติ" },
      { id: "gaming", label: "🎮 ร้านเกม", query: "ร้านเกม" },
      { id: "sports", label: "🏟️ สนามกีฬา", query: "สนามกีฬา" },
      { id: "hiking", label: "🥾 เดินป่า/ภูเขา", query: "เดินป่า" },
    ],
    angry: [
      { id: "gym", label: "🏋️‍♂️ ยิม", query: "ยิม" },
      { id: "karaoke", label: "🎤 คาราโอเกะ", query: "คาราโอเกะ" },
      { id: "mall", label: "🛍️ ห้างสรรพสินค้า", query: "ห้างสรรพสินค้า" },
      { id: "fitness", label: "🏃‍♂️ ฟิตเนส", query: "ฟิตเนส" },
      { id: "park", label: "🌳 สวนสาธารณะ", query: "สวนสาธารณะ" },
      { id: "shooting", label: "🔫 สนามยิงปืน", query: "สนามยิงปืน" },
    ],
  };

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "หยุดก่อน! ✋",
        text: "กรุณาเข้าสู่ระบบเพื่อใช้ฟีเจอร์วิเคราะห์อารมณ์และค้นหาสถานที่",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#FF8E6E",
        cancelButtonColor: "#7E7869",
        confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
        cancelButtonText: "ไว้ทีหลัง",
        reverseButtons: true,
        customClass: { popup: "rounded-[30px]" },
      }).then((result) => {
        if (result.isConfirmed) navigate("/login");
      });
      return false;
    }
    return true;
  };

  const handleMoodSelect = (emotionId) => {
    if (!checkAuth()) return;
    navigate(`/filter?mood=${emotionId}`);
  };

  const handleCategorySelect = (categoryQuery) => {
    const searchKeyword = `${categoryQuery} ใกล้ฉัน`;
    const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchKeyword)}`;
    window.open(googleMapsUrl, "_blank");
  };

  const performAiSearch = async (textToSearch) => {
    if (!textToSearch.trim()) return;
    if (!checkAuth()) return;
    const isTextonly= /^[a-zA-Zก-์\s]+$/.test(textToSearch.trim());
    setSearchPlaces([]);
    setIsSearchingPlaces(true);

    if (!isTextonly) {
      Swal.fire({
        title: "แจ้งเตือน",
        text: "กรุณากรอกข้อความที่สื่อความหมาย",
        icon: "warning",
        confirmButtonColor: "#FF8E6E",
        confirmButtonText: "ตกลง",
        reverseButtons: true,
        customClass: { popup: "rounded-[30px]" },
      });

      return;
    }


    try {
      Swal.fire({
        title: "กำลังให้ AI รับฟังคุณ...",
        html: "ระบบกำลังวิเคราะห์ความรู้สึกและหาสถานที่บำบัดใจ 🤖",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const aiRes = await api.post("/ai/analyze-emotion", { text: textToSearch });
      const { emotion, reason } = aiRes.data;
      console.log(aiRes.data) // ตรวจสอบผลลัพธ์จาก AI
      let moodKey = "happy";
      if (emotion.includes("สุข")) moodKey = "happy";
      else if (emotion.includes("โกรธ")) moodKey = "angry";
      else if (emotion.includes("เบื่อ")) moodKey = "bored";
      else if (emotion.includes("เศร้า")) moodKey = "sad";
      else if (emotion.includes("เครียด")) moodKey = "stressed";

      const randomCategory = moodCategories[moodKey][Math.floor(Math.random() * moodCategories[moodKey].length)].query;

      const findPlacesForPopup = (lat, lng) => {
        api
          .get("/maps/search", { params: { keyword: randomCategory, lat, lng } })
          .then((res) => {
            Swal.close();
            const places = Array.isArray(res.data) ? res.data.slice(0, 7) : [];
            setAiModalData({ emotion, reason, moodKey, places });
            setSearchPlaces(places);
          })
          .catch(() => {
            Swal.close();
            setAiModalData({ emotion, reason, moodKey, places: [] });
            setSearchPlaces([]);
          })
          .finally(() => setIsSearchingPlaces(false));
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
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อระบบ AI ได้ในขณะนี้", "error");
      setIsSearchingPlaces(false);
      setSearchPlaces([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performAiSearch(searchQuery);
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get("/announcements");
        const data = res.data.announcements || res.data || [];
        if (Array.isArray(data)) {
          setAnnouncements(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
      } catch (error) {
        const localData = JSON.parse(localStorage.getItem("admin_mock_announcements") || "[]");
        setAnnouncements(localData);
      }
    };
    fetchAnnouncements();

    socket.on("receive_announcement", (data) => {
      setAnnouncements((prev) => [
        {
          id: data.id || Date.now(),
          title: data.title || "ประกาศจากผู้พัฒนา",
          description: data.content || data.message || data.shortContent || "",
          shortContent: data.shortContent || data.description || "",
          coverImage: data.coverImage || null,
          contentBlocks: data.contentBlocks || [],
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    });

    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 15,
        y: (e.clientY / window.innerHeight) * 15,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      socket.off("receive_announcement");
    };
  }, []);

  return (
    <div className="w-full bg-[#FDF8F1] text-[#4A453A] overflow-x-hidden font-['Prompt',sans-serif] relative">
      
      {/* ─── Modal อ่านข่าวสารฉบับเต็ม ─── */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="bg-white w-full sm:max-w-3xl h-[90vh] sm:h-[85vh] rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative">
              <div className="bg-white/90 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 text-[#FF8E6E] rounded-full flex items-center justify-center"><Sparkles size={20}/></div>
                  <div>
                    <h3 className="font-black text-[#4A453A] leading-none">อ่านข่าวสาร</h3>
                    <p className="text-xs text-gray-400 font-bold mt-1">อัปเดตล่าสุดจากระบบ</p>
                  </div>
                </div>
                <button onClick={() => setSelectedNews(null)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 hide-scrollbar pb-24">
                <h1 className="text-2xl sm:text-3xl font-black text-[#4A453A] leading-tight mb-4">{selectedNews.title}</h1>
                <div className="flex items-center gap-2 text-[#FF8E6E] bg-orange-50 w-fit px-3 py-1.5 rounded-lg text-xs font-bold mb-6">
                  <Calendar size={14} /> 
                  {new Date(selectedNews.createdAt).toLocaleDateString("th-TH", { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                {selectedNews.coverImage && (
                  <div className="w-full h-48 sm:h-72 rounded-3xl overflow-hidden mb-8 shadow-sm border border-gray-100">
                    <img src={selectedNews.coverImage} className="w-full h-full object-cover" alt="Cover" />
                  </div>
                )}
                <div className="space-y-6 text-[#7E7869] text-[15px] sm:text-[16px] leading-relaxed font-medium">
                  {selectedNews.contentBlocks?.map((block, i) => (
                    <div key={block.id || i} className="clear-both">
                      {block.type === "text" && block.value && <p className="whitespace-pre-line">{block.value}</p>}
                      {block.type === "image" && block.value && (
                        <div className="py-2">
                          {block.align === "left" && <img src={block.value} className="w-1/2 max-w-[200px] sm:max-w-[250px] rounded-2xl object-cover float-left mr-5 mb-3 shadow-sm border border-gray-100" alt="Content" />}
                          {block.align === "right" && <img src={block.value} className="w-1/2 max-w-[200px] sm:max-w-[250px] rounded-2xl object-cover float-right ml-5 mb-3 shadow-sm border border-gray-100" alt="Content" />}
                          {block.align === "center" && <img src={block.value} className="w-full rounded-2xl object-cover mb-4 shadow-sm border border-gray-100" alt="Content" />}
                          {block.caption && <span className="block text-sm text-gray-400 italic mt-2">{block.caption}</span>}
                          <div className="clear-both"></div>
                        </div>
                      )}
                    </div>
                  )) || <p className="whitespace-pre-line">{selectedNews.fullContent || selectedNews.shortContent}</p>}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Modal แสดงผล AI วิเคราะห์อารมณ์ ─── */}
      <AnimatePresence>
  {aiModalData && (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center bg-black/40 backdrop-blur-lg pt-28 sm:pt-24 px-4 pb-4"
    >
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} 
        transition={{ type: "spring", damping: 25, stiffness: 300 }} 
        className="bg-white w-full rounded-t-[2.5rem] sm:rounded-[2.5rem] sm:max-w-xl sm:mx-4 max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header Modal */}
        <div className="relative bg-[#FDF8F1] px-6 pt-2 pb-6  border-b border-[#EFE9D9]">
          <button 
            onClick={() => setAiModalData(null)} 
            className="absolute top-4 right-4 w-9 h-9 bg-black/5 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#FF8E6E] hover:text-white transition-all"
          >
            <X size={18} />
          </button>
          
          <div className="inline-flex items-center gap-2 px-3 py-1  rounded-full font-bold text-xs mb-3 ">
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#4A453A] mb-2 leading-tight">
            รู้สึก <span className="text-[#FF8E6E]">"{aiModalData.emotion}"</span> ใช่ไหม?
          </h2>
          <p className="text-[#7E7869] text-sm font-medium italic leading-relaxed">"{aiModalData.reason}"</p>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <h3 className="text-lg font-black text-[#4A453A] mb-5 flex items-center gap-2">
            สถานที่แนะนำสำหรับคุณ <span className="text-[#FF8E6E]">🎯</span>
          </h3>
          
          <div className="space-y-4">
            {aiModalData.places.map((place, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                key={idx} 
                onClick={() => navigate(`/g-place/${place.place_id}`)} 
                className="group flex items-center gap-4 p-4 rounded-3xl border border-gray-100 hover:border-[#FF8E6E] hover:shadow-[0_8px_24px_-4px_rgba(255,142,110,0.2)] transition-all cursor-pointer bg-white"
              >
                {/* รูปภาพ */}
                <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                  {place.photos?.length > 0 ? (
                    <img src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${API_KEY}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={place.name} />
                  ) : ( <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div> )}
                </div>

                {/* ข้อมูล */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base text-[#2D2A26] truncate group-hover:text-[#FF8E6E] transition-colors">{place.name}</h4>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin size={12} /> {place.vicinity || place.formatted_address}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-orange-50 text-[#FF8E6E] px-2 py-1 rounded-lg">
                      <Star size={11} className="fill-[#FF8E6E]" /> {place.rating || "New"}
                    </span>
                  </div>
                </div>
                
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#FF8E6E] group-hover:text-white text-gray-400 transition-colors">
                  <Navigation size={18} />
                </div>
              </motion.div>
            ))}
          </div>

          <button 
            onClick={() => navigate(`/filter?mood=${aiModalData.moodKey}&all=true`)} 
            className="w-full mt-8 py-4 bg-[#4A453A] text-white rounded-2xl font-black hover:bg-[#FF8E6E] transition-all shadow-lg active:scale-95 text-base"
          >
            ดูสถานที่ทั้งหมด
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      {/* ─── 🌟 HERO SECTION ─── */}
      <section className="relative w-full flex items-center justify-center overflow-hidden bg-[#FDF8F1] min-h-[55vh] sm:min-h-[60vh]">
        
        {/* Parallax Background */}
        <div className="absolute inset-0 z-0 scale-110 transition-transform duration-1000 ease-out" style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
          <img src={heroBg} className="h-full w-full object-cover object-center" alt="Parallax Background" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF8F1] via-[#FDF8F1]/60 to-transparent z-20" />

        <div className="container relative z-30 px-4 sm:px-5 text-center mx-auto flex flex-col items-center justify-center pt-4 sm:pt-8 pb-3 sm:pb-4">
          <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 font-black leading-tight drop-shadow-sm text-4xl sm:text-6xl lg:text-7xl text-[#4A4A4A] mb-3 sm:mb-4">
            ไปไหนดี... <br className="hidden xs:block" />
            <span className="text-[#FF8E6E] inline-block hover:scale-105 transition-transform cursor-default drop-shadow-md mt-1 sm:mt-0">ให้อารมณ์บอก</span>
          </h1>
        </div>
      </section>

      {/* ─── CONTENT SECTION ─── */}
      <main className="container mx-auto px-4 sm:px-5 relative z-40 pb-24 -mt-16 sm:-mt-20">
        <section className="bg-white/90 backdrop-blur-2xl p-5 sm:p-14 shadow-[0_32px_64px_-16px_rgba(74,69,58,0.1)] text-center border border-white rounded-[2rem] sm:rounded-[4rem] w-full min-h-0 sm:min-h-[400px]">
          
          {!activeMood ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl sm:text-4xl font-black mb-2 sm:mb-4 tracking-tight text-[#4A4A4A]">วันนี้รู้สึกยังไง? 🤔</h2>
              
              {/* 🌟 Search Bar inside Card */}
              <div className="mx-auto mt-6 sm:mt-12 max-w-xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700 w-full px-4 sm:px-0">
                <form onSubmit={handleSearchSubmit} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#FF8E6E] to-[#FFA07A] rounded-full blur opacity-15 group-focus-within:opacity-100 transition duration-1000" />
                  <div className="relative flex items-center bg-white/95 backdrop-blur-xl rounded-full shadow-xl overflow-hidden border border-white/50">
                    <button type="submit" className="ml-4 flex items-center outline-none">
                      <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF8E6E] transition-all" />
                    </button>
                    <input
                      type="text"
                      placeholder="พิมพ์บอกความรู้สึกกับ AI..."
                      className="w-full py-3.5 sm:py-5 pl-3 pr-4 text-base sm:text-lg font-bold outline-none bg-transparent placeholder:text-gray-400 text-[#4A453A]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button type="submit" className="mr-2 px-4 py-2 bg-[#FF8E6E] text-white text-sm font-bold rounded-full shrink-0 active:scale-95 transition-transform">ค้นหา</button>
                    )}
                  </div>
                </form>
              </div>

              <p className="text-1xl sm:text-2xl font-black mt-10 sm:mt-12 mb-6 sm:mb-8 text-[#FF8E6E] tracking-wider leading-relaxed">— หรือ —</p>
              <p className="text-sm sm:text-lg font-medium mb-6 sm:mb-8 text-[#8E8E8E]">เลือกหมวดหมู่อารมณ์เพื่อค้นหาสถานที่ด่วน</p>

              {isSearchingPlaces && (
                <div className="mt-8 sm:mt-10 flex justify-center">
                  <div className="w-10 h-10 border-4 border-[#FF8E6E] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              
              
              <div className="mt-6 sm:mt-8">
                <MoodSelector onSelectMood={handleMoodSelect} onSearchText={performAiSearch} />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-xl sm:text-4xl font-black mb-2 sm:mb-4 tracking-tight text-[#4A453A]">สถานที่แบบไหนดี? 🎯</h2>
              <p className="text-sm sm:text-lg font-medium mb-6 sm:mb-10 text-[#8E8E8E]">เลือกประเภทที่คุณอยากไปตอนนี้</p>
              <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-6 mb-8 sm:mb-12">
                {moodCategories[activeMood].map((cat) => (
                  <button key={cat.id} onClick={() => handleCategorySelect(cat.query)} className="group w-full sm:w-auto px-5 py-4 sm:px-8 sm:py-5 bg-[#FDF8F1] border-2 border-transparent hover:border-[#FF8E6E] active:border-[#FF8E6E] rounded-2xl sm:rounded-3xl transition-all duration-300 shadow-sm hover:shadow-xl active:scale-[0.98] text-left sm:text-center">
                    <span className="font-bold text-[#4A453A] group-hover:text-[#FF8E6E] text-base sm:text-lg transition-colors">{cat.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setActiveMood(null)} className="inline-flex items-center gap-2 text-[#7E7869] hover:text-[#FF8E6E] font-bold transition-colors border-b-2 border-transparent hover:border-[#FF8E6E] pb-1 text-sm sm:text-base"><ArrowLeft size={16} /> ย้อนกลับไปเลือกอารมณ์</button>
            </div>
          )}
        </section>

        {/* ─── หัวข้อ: มีอะไรใหม่ ─── */}
        <AnimatePresence>
          {!activeMood && announcements.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-16 sm:mt-24 mx-auto max-w-5xl">
              <div className="flex items-center gap-3 mb-8 px-2 justify-center sm:justify-start">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100">
                  <Sparkles className="text-[#FF8E6E]" size={24} />
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#4A453A] tracking-tight">มีอะไร<span className="text-[#FF8E6E]">ใหม่</span></h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {announcements.map((news) => (
                  <motion.div whileHover={{ y: -8 }} key={news.id || news._id} onClick={() => setSelectedNews(news)} className="bg-white rounded-[2rem] overflow-hidden shadow-[0_16px_40px_-10px_rgba(74,69,58,0.08)] border border-white flex flex-col group cursor-pointer">
                    <div className="h-48 bg-[#FDF8F1] relative overflow-hidden">
                      {news.coverImage ? <img src={news.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Cover" /> : <div className="w-full h-full flex items-center justify-center"><Newspaper size={40} className="text-gray-200" /></div>}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] font-bold text-[#FF8E6E] shadow-sm">
                        <Calendar size={12} /> {new Date(news.createdAt).toLocaleDateString("th-TH", { day: "2-digit", month: "short" })}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-black text-xl text-[#2D2A26] mb-2 leading-tight group-hover:text-[#FF8E6E] transition-colors line-clamp-2">{news.title}</h3>
                      <p className="text-[13px] font-medium text-[#7E7869] leading-relaxed line-clamp-2 mb-4">{news.shortContent || news.description}</p>
                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-[#FF8E6E] font-bold text-sm">
                        <span>อ่านเพิ่มเติม</span>
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-[#FF8E6E] group-hover:text-white transition-colors"><ChevronRight size={16} /></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}