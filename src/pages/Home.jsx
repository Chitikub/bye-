'use client';
import { Search, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.png";
import MoodSelector from "@/components/MoodSelector";
import api, { IMAGE_BASE_URL } from "../api/axios";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🌟 เพิ่ม State สำหรับเก็บอารมณ์ที่ถูกเลือก เพื่อนำไปแสดงหมวดย่อย
  const [activeMood, setActiveMood] = useState(null); 
  const navigate = useNavigate();

  // 1. Data Strategy: Mapping อารมณ์กับหมวดหมู่สถานที่ย่อย
  const moodCategories = {
    happy: [
      { id: 'amusement', label: '🎢 สวนสนุก', query: 'สวนสนุก' },
      { id: 'event', label: '🎪 สถานที่จัดงาน / อีเวนต์', query: 'Event Space' },
      { id: 'attraction', label: '📸 ที่เที่ยวถ่ายรูป', query: 'สถานที่ท่องเที่ยว' }
    ],
    sad: [
      { id: 'park', label: '🌳 สวนสาธารณะ', query: 'สวนสาธารณะ' },
      { id: 'bookstore', label: '📚 ร้านหนังสือ', query: 'ร้านหนังสือ' },
      { id: 'gallery', label: '🎨 หอศิลป์ / Art Gallery', query: 'Art Gallery' }
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

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await api.get("/places"); 
        
        const data = Array.isArray(response.data) 
          ? response.data 
          : (response.data.places || []);
        
        const getValidImageUrl = (img) => {
          if (!img || img === "undefined" || img === "null" || img.trim() === "") {
            return "https://placehold.co/600x400/EFE9D9/4A453A?text=No+Image";
          }
          if (img.startsWith('http')) return img;
          return img.startsWith('/') ? `${IMAGE_BASE_URL}${img}` : `${IMAGE_BASE_URL}/${img}`;
        };

        const formattedData = data.map(place => ({
          ...place,
          image: getValidImageUrl(place.image)
        }));

        setPlaces(formattedData);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // 🌟 Step 1: เมื่อผู้ใช้กดเลือกอารมณ์ ให้เปิดแสดงหมวดย่อย
  const handleMoodSelect = (emotionId) => {
    navigate(`/filter?mood=${emotionId}`);
  };

  // 🌟 Step 2: เมื่อผู้ใช้กดเลือกหมวดย่อย ถึงจะเปิด Google Maps
  const handleCategorySelect = (categoryQuery) => {
    // แนบคำว่า "ใกล้ฉัน" ต่อท้ายคีย์เวิร์ด
    const searchKeyword = `${categoryQuery} ใกล้ฉัน`;
    
    // สร้าง URL มาตรฐานของ Google Maps
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchKeyword)}`;
    
    window.open(googleMapsUrl, '_blank'); 
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/filter?q=${encodeURIComponent(searchQuery.trim())}`);
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
            เลือกความรู้สึกของคุณตอนนี้ แล้วเราจะพาส่งไปยังสถานที่ที่ตอบโจทย์ที่สุด
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
                  placeholder="วันนี้รู้สึกยังไง (เช่น อยากพักผ่อน, เครียด)..." 
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
          
          {/* ซ่อน/แสดง เนื้อหาตาม State ว่ามีการกดเลือกอารมณ์หรือยัง */}
          {!activeMood ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl sm:text-4xl font-black mb-4 tracking-tight text-[#4A4A4A]">วันนี้รู้สึกยังไง? 🤔</h2>
              <p className="text-sm sm:text-lg font-medium mb-8 text-[#8E8E8E] leading-relaxed">คลิกเลือกอารมณ์ของคุณเพื่อเริ่มการเดินทาง</p>
              <div className="mt-4">
                <MoodSelector onSelectMood={handleMoodSelect} />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-2xl sm:text-4xl font-black mb-4 tracking-tight text-[#4A4A4A]">สถานที่แบบไหนดี? 🎯</h2>
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