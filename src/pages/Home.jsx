"use client";
import { Search, ArrowLeft, Star, MapPin, X, Navigation, Newspaper, Calendar, Sparkles, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import heroBg from "@/assets/hero-bg.png";
import MoodSelector from "@/components/MoodSelector";
import api from "../api/axios";
import Swal from "sweetalert2";
import { io } from "socket.io-client";

// เชื่อมต่อ Socket
const socket = io("https://moodlocationfinder-backend.onrender.com");

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMood, setActiveMood] = useState(null);
  const [aiModalData, setAiModalData] = useState(null);

  // 🌟 State สำหรับระบบประกาศ
  const [announcements, setAnnouncements] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null); // 🌟 State สำหรับเปิดอ่านข่าวเต็ม

  const navigate = useNavigate();
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const moodCategories = {
    happy: [
      { id: "amusement", label: "🎢 สวนสนุก", query: "สวนสนุก" },
      { id: "event", label: "🎪 สถานที่จัดงาน", query: "Event Space" },
      { id: "attraction", label: "📸 ที่เที่ยวถ่ายรูป", query: "สถานที่ท่องเที่ยว" },
    ],
    sad: [
      { id: "park", label: "🌳 สวนสาธารณะ", query: "สวนสาธารณะ" },
      { id: "bookstore", label: "📚 ร้านหนังสือ", query: "ร้านหนังสือ" },
      { id: "gallery", label: "🎨 หอศิลป์", query: "Art Gallery" },
    ],
    bored: [
      { id: "museum", label: "🏛️ พิพิธภัณฑ์", query: "พิพิธภัณฑ์" },
      { id: "mall", label: "🛍️ ห้างสรรพสินค้า", query: "ห้างสรรพสินค้า" },
      { id: "boardgame", label: "🎲 บอร์ดเกมคาเฟ่", query: "Board Game Cafe" },
    ],
    stressed: [
      { id: "spa", label: "💆‍♀️ สปา นวดผ่อนคลาย", query: "สปา" },
      { id: "cafe", label: "☕ คาเฟ่สงบๆ", query: "Quiet Cafe" },
      { id: "botanical", label: "🌺 สวนพฤกษศาสตร์", query: "Botanical Garden" },
    ],
    angry: [
      { id: "gym", label: "🏋️‍♂️ ยิมออกกำลังกาย", query: "ยิมออกกำลังกาย" },
      { id: "boxing", label: "🥊 ค่ายมวย", query: "Boxing Gym" },
      { id: "stadium", label: "🏟️ สนามกีฬา", query: "สนามกีฬา" },
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

    try {
      Swal.fire({
        title: "กำลังให้ AI รับฟังคุณ...",
        html: "ระบบกำลังวิเคราะห์ความรู้สึกและหาสถานที่บำบัดใจ 🤖",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const aiRes = await api.post("/ai/analyze-emotion", { text: textToSearch });
      const { emotion, reason } = aiRes.data;

      let moodKey = "happy";
      if (emotion.includes("สุข")) moodKey = "happy";
      else if (emotion.includes("โกรธ")) moodKey = "angry";
      else if (emotion.includes("เบื่อ")) moodKey = "bored";
      else if (emotion.includes("เศร้า")) moodKey = "sad";
      else if (emotion.includes("เครียด")) moodKey = "stressed";

      const randomCategory =
        moodCategories[moodKey][
          Math.floor(Math.random() * moodCategories[moodKey].length)
        ].query;

      const findPlacesForPopup = (lat, lng) => {
        api
          .get("/maps/search", {
            params: { keyword: randomCategory, lat, lng },
          })
          .then((res) => {
            Swal.close();
            setAiModalData({
              emotion,
              reason,
              moodKey,
              places: res.data.slice(0, 3),
            });
          })
          .catch(() => {
            Swal.close();
            setAiModalData({ emotion, reason, moodKey, places: [] });
          });
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            findPlacesForPopup(pos.coords.latitude, pos.coords.longitude),
          () => findPlacesForPopup(null, null),
        );
      } else {
        findPlacesForPopup(null, null);
      }
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อระบบ AI ได้ในขณะนี้", "error");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performAiSearch(searchQuery);
  };

  useEffect(() => {
    // โหลดประวัติข่าวตอนแรก
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

    // 🌟 ดักรับข่าวสารประกาศสดๆ จากแอดมินผ่าน Socket.io 
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
    <div className="w-full bg-[#FDF8F1] text-[#4A453A] overflow-x-hidden font-['Prompt',sans-serif]">
      
      {/* ─── 🌟 Modal อ่านข่าวสารฉบับเต็ม (Full Article) ─── */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="bg-white w-full sm:max-w-3xl h-[90vh] sm:h-[85vh] rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative">
              
              {/* Header ของ Modal ข่าว */}
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

              {/* เนื้อหาข่าวสารเต็มรูปแบบ */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 hide-scrollbar pb-24">
                <h1 className="text-2xl sm:text-3xl font-black text-[#4A453A] leading-tight mb-4">{selectedNews.title}</h1>
                <div className="flex items-center gap-2 text-[#FF8E6E] bg-orange-50 w-fit px-3 py-1.5 rounded-lg text-xs font-bold mb-6">
                  <Calendar size={14} /> 
                  {new Date(selectedNews.createdAt).toLocaleDateString("th-TH", { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>

                {/* รูปปก (ถ้ามี) */}
                {selectedNews.coverImage && (
                  <div className="w-full h-48 sm:h-72 rounded-3xl overflow-hidden mb-8 shadow-sm border border-gray-100">
                    <img src={selectedNews.coverImage} className="w-full h-full object-cover" alt="Cover" />
                  </div>
                )}

                {/* เนื้อหาจาก Block Editor (แสดงผลการจัด Layout จากแอดมิน) */}
                <div className="space-y-6 text-[#7E7869] text-[15px] sm:text-[16px] leading-relaxed font-medium">
                  {selectedNews.contentBlocks && selectedNews.contentBlocks.length > 0 ? (
                    selectedNews.contentBlocks.map((block, i) => (
                      <div key={block.id || i} className="clear-both">
                        {block.type === "text" && block.value && <p className="whitespace-pre-line">{block.value}</p>}
                        {block.type === "image" && block.value && (
                          <div className="py-2">
                            {block.align === "left" && <img src={block.value} className="w-1/2 max-w-[200px] sm:max-w-[250px] rounded-2xl object-cover float-left mr-5 mb-3 shadow-sm border border-gray-100" alt="News Content" />}
                            {block.align === "right" && <img src={block.value} className="w-1/2 max-w-[200px] sm:max-w-[250px] rounded-2xl object-cover float-right ml-5 mb-3 shadow-sm border border-gray-100" alt="News Content" />}
                            {block.align === "center" && <img src={block.value} className="w-full rounded-2xl object-cover mb-4 shadow-sm border border-gray-100" alt="News Content" />}
                            
                            {block.caption && <span className="block text-sm text-gray-400 italic mt-2">{block.caption}</span>}
                            <div className="clear-both"></div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    /* Fallback กรณีเป็นข้อมูลเก่าที่ไม่มี contentBlocks */
                    <p className="whitespace-pre-line">{selectedNews.fullContent || selectedNews.shortContent || selectedNews.description}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── AI Modal ─── */}
      <AnimatePresence>
        {aiModalData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} className="bg-white w-full rounded-t-[2rem] sm:rounded-[2.5rem] sm:max-w-2xl sm:mx-4 max-h-[92dvh] overflow-y-auto relative shadow-2xl">
              <div className="sm:hidden flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-gray-300" /></div>
              <button onClick={() => setAiModalData(null)} className="absolute top-4 right-4 w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#FF8E6E] hover:text-white transition-colors z-10"><X size={18} /></button>
              <div className="bg-[#FDF8F1] px-5 pt-4 pb-5 sm:px-10 sm:pt-8 sm:pb-6 rounded-t-[2rem] sm:rounded-t-[2.5rem] border-b border-b-[#EFE9D9]">
                <div className="inline-block px-3 py-1.5 bg-orange-50 text-[#FF8E6E] rounded-full font-bold text-xs mb-3">AI วิเคราะห์เสร็จสิ้น 🤖</div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#4A453A] mb-2 leading-tight">ดูเหมือนคุณกำลังรู้สึก <span className="text-[#FF8E6E]">"{aiModalData.emotion}"</span> ใช่ไหม?</h2>
                <p className="text-[#7E7869] text-sm sm:text-base font-medium leading-relaxed italic">"{aiModalData.reason}"</p>
              </div>
              <div className="px-5 py-5 sm:px-10 sm:py-8">
                <h3 className="text-lg sm:text-xl font-black text-[#4A453A] mb-4">สถานที่แนะนำสำหรับคุณ 🎯</h3>
                <div className="space-y-3 mb-6">
                  {aiModalData.places.length > 0 ? (
                    aiModalData.places.map((place, idx) => (
                      <div key={idx} onClick={() => navigate(`/g-place/${place.place_id}`)} className="group flex items-center gap-3 p-3 rounded-2xl border border-[#EFE9D9] hover:border-[#FF8E6E] hover:shadow-md active:scale-[0.98] transition-all cursor-pointer bg-white">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                          {place.photos?.length > 0 ? (
                            <img src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${API_KEY}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={place.name} />
                          ) : ( <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">ภาพ</div> )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm sm:text-base text-[#2D2A26] truncate group-hover:text-[#FF8E6E] transition-colors">{place.name}</h4>
                          <p className="text-xs text-[#AFA99B] flex items-center gap-1 mt-0.5 truncate"><MapPin size={11} className="shrink-0" /><span className="truncate">{place.vicinity || place.formatted_address}</span></p>
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-orange-50 text-[#FF8E6E] px-2 py-0.5 rounded-lg mt-1.5"><Star size={11} className="fill-[#FF8E6E]" /> {place.rating || "-"}</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-[#7E7869] group-hover:bg-[#FF8E6E] group-hover:text-white transition-colors shrink-0"><Navigation size={16} className="translate-x-0.5" /></div>
                      </div>
                    ))
                  ) : ( <div className="text-center py-8 text-gray-400 font-medium text-sm">ไม่พบสถานที่ใกล้เคียงในขณะนี้</div> )}
                </div>
                <button onClick={() => navigate(`/filter?mood=${aiModalData.moodKey}`)} className="w-full py-4 bg-[#4A453A] text-white rounded-2xl font-bold hover:bg-[#FF8E6E] transition-colors shadow-lg active:scale-95 text-sm sm:text-base">ดูสถานที่บำบัดทั้งหมด</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HERO ─── */}
      <section className="relative w-full h-[60vh] sm:h-[85vh] min-h-[420px] flex items-center justify-center overflow-hidden bg-[#FDF8F1]">
        <div className="absolute inset-0 z-0 scale-110 transition-transform duration-1000 ease-out" style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
          <img src={heroBg} className="h-full w-full object-cover object-center" alt="Hero Background" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF8F1] via-[#FDF8F1]/60 to-transparent z-20" />

        <div className="container relative z-30 px-4 sm:px-5 text-center mx-auto">
          <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 font-black leading-tight drop-shadow-sm text-4xl sm:text-6xl lg:text-8xl text-[#4A4A4A]">
            ไปไหนดี... <br className="hidden xs:block" />
            <span className="text-[#FF8E6E] inline-block hover:scale-105 transition-transform cursor-default drop-shadow-md mt-1 sm:mt-0">ให้อารมณ์บอก</span>
          </h1>
          <p className="mx-auto mt-4 sm:mt-8 max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 text-sm sm:text-xl text-[#7E7869] font-medium px-2 leading-relaxed">
            พิมพ์ความรู้สึกของคุณตอนนี้ แล้ว AI จะหาสถานที่ที่ช่วยให้รู้สึกดีขึ้น
          </p>

          <div className="mx-auto mt-6 sm:mt-12 max-w-xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700 w-full px-4 sm:px-0">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF8E6E] to-[#FFA07A] rounded-full blur opacity-15 group-focus-within:opacity-100 transition duration-1000" />
              <div className="relative flex items-center bg-white/95 backdrop-blur-xl rounded-full shadow-xl overflow-hidden border border-white/50">
                <button type="submit" className="ml-4 flex items-center outline-none"><Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF8E6E] transition-all" /></button>
                <input type="text" placeholder="วันนี้รู้สึกยังไง..." className="w-full py-3.5 sm:py-5 pl-3 pr-4 text-base sm:text-lg font-bold outline-none bg-transparent placeholder:text-gray-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                {searchQuery && ( <button type="submit" className="mr-2 px-4 py-2 bg-[#FF8E6E] text-white text-sm font-bold rounded-full shrink-0 active:scale-95 transition-transform">ค้นหา</button> )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ─── CONTENT SECTION ─── */}
      <main className="container mx-auto px-4 sm:px-5 -mt-10 sm:-mt-20 relative z-40 pb-24">
        <section className="bg-white/90 backdrop-blur-2xl rounded-3xl sm:rounded-[3rem] p-5 sm:p-16 shadow-[0_32px_64px_-16px_rgba(74,69,58,0.1)] text-center border border-white mx-auto max-w-4xl min-h-0 sm:min-h-[400px]">
          {!activeMood ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl sm:text-4xl font-black mb-2 sm:mb-4 tracking-tight text-[#4A4A4A]">วันนี้รู้สึกยังไง? 🤔</h2>
              <p className="text-sm sm:text-lg font-medium mb-5 sm:mb-8 text-[#8E8E8E] leading-relaxed">แตะเลือกอารมณ์ หรือพิมพ์บอกเราด้านบน</p>
              <div className="mt-2">
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

        {/* ─── 🌟 หัวข้อ: มีอะไรใหม่ (What's New Cards) ─── */}
        <AnimatePresence>
          {!activeMood && announcements.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-16 sm:mt-24 mx-auto max-w-5xl">
              <div className="flex items-center gap-3 mb-8 px-2 justify-center sm:justify-start">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100">
                  <Sparkles className="text-[#FF8E6E]" size={24} />
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#4A453A] tracking-tight">
                  มีอะไร<span className="text-[#FF8E6E]">ใหม่</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {announcements.map((news) => (
                  <motion.div
                    whileHover={{ y: -8 }}
                    key={news.id || news._id}
                    onClick={() => setSelectedNews(news)}
                    className="bg-white rounded-[2rem] overflow-hidden shadow-[0_16px_40px_-10px_rgba(74,69,58,0.08)] border border-white flex flex-col group cursor-pointer"
                  >
                    {/* รูปหน้าปกการ์ดแบบย่อ */}
                    <div className="h-48 bg-[#FDF8F1] relative overflow-hidden">
                      {news.coverImage ? (
                        <img src={news.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="News Cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Newspaper size={40} className="text-gray-200" /></div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] font-bold text-[#FF8E6E] shadow-sm">
                        <Calendar size={12} />
                        {new Date(news.createdAt).toLocaleDateString("th-TH", { day: "2-digit", month: "short" })}
                      </div>
                    </div>

                    {/* เนื้อหาในการ์ดแบบย่อ */}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-black text-xl text-[#2D2A26] mb-2 leading-tight group-hover:text-[#FF8E6E] transition-colors line-clamp-2">
                        {news.title}
                      </h3>
                      <p className="text-[13px] font-medium text-[#7E7869] leading-relaxed line-clamp-2 mb-4">
                        {news.shortContent || news.description}
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-[#FF8E6E] font-bold text-sm">
                        <span>อ่านเพิ่มเติม</span>
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-[#FF8E6E] group-hover:text-white transition-colors">
                          <ChevronRight size={16} />
                        </div>
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