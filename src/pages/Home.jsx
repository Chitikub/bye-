'use client';
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.png";
import MoodSelector from "@/components/MoodSelector";
import PlaceCard from "@/components/PlaceCard";
import api, { IMAGE_BASE_URL } from "../api/axios";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await api.get("/places"); 
        
        const data = Array.isArray(response.data) 
          ? response.data 
          : (response.data.places || []);
        
        // 🌟 ฟังก์ชันเช็คภาพแบบครอบคลุม ป้องกันบั๊ก "undefined" หรือ "null"
        const getValidImageUrl = (img) => {
          if (!img || img === "undefined" || img === "null" || img.trim() === "") {
            return "https://placehold.co/600x400/EFE9D9/4A453A?text=No+Image";
          }
          if (img.startsWith('http')) return img;
          return img.startsWith('/') ? `${IMAGE_BASE_URL}${img}` : `${IMAGE_BASE_URL}/${img}`;
        };

        // 🌟 นำฟังก์ชันมาใช้ตอน Format ข้อมูล
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

  const handleMoodSelect = (moodLabel) => {
    navigate(`/filter?mood=${moodLabel}`);
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
            <div className="relative group px-2">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF8E6E] to-[#FFA07A] rounded-full blur opacity-15 group-focus-within:opacity-100 transition duration-1000"></div>
              <div className="relative flex items-center bg-white/95 backdrop-blur-xl rounded-full shadow-xl overflow-hidden border border-white/50">
                <Search className="ml-5 h-5 w-5 text-gray-400 group-focus-within:text-[#FF8E6E] transition-colors" />
                <input type="text" placeholder="วันนี้รู้สึกยังไง..." className="w-full py-4 sm:py-6 px-4 text-sm sm:text-lg font-bold outline-none bg-transparent placeholder:text-gray-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <main className="container mx-auto px-5 -mt-10 sm:-mt-20 relative z-40 space-y-20 sm:space-y-32 pb-20">
        <section className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-16 shadow-[0_32px_64px_-16px_rgba(74,69,58,0.1)] text-center border border-white transform transition-all duration-500 mx-auto max-w-4xl">
          <h2 className="text-2xl sm:text-4xl font-black mb-4 tracking-tight text-[#4A4A4A]">วันนี้รู้สึกยังไง? 🤔</h2>
          <p className="text-sm sm:text-lg font-medium mb-8 text-[#8E8E8E] leading-relaxed">คลิกเลือกอารมณ์ของคุณเพื่อเริ่มการเดินทาง</p>
          <div className="mt-4">
            <MoodSelector onSelectMood={handleMoodSelect} />
          </div>
        </section>

        {/* ส่วนสถานที่ยอดนิยม */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-8 sm:mb-12 text-center sm:text-left">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl sm:text-4xl font-black mb-1 sm:mb-2 text-[#4A4A4A]">สถานที่ยอดนิยม 🔥</h2>
              <p className="text-[#7E7869] text-sm sm:text-lg font-medium">คัดสรรมาแล้วจากอารมณ์ของเพื่อนๆ</p>
            </div>
            <Link to="/all-places" className="text-[#FF8E6E] font-bold text-sm hover:underline flex items-center gap-1">ดูทั้งหมด →</Link>
          </div>
          
          <div className="grid gap-6 sm:gap-10 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <div className="col-span-full text-center py-20 animate-pulse font-bold text-gray-400">กำลังโหลด...</div>
            ) : places.length > 0 ? (
              places.slice(0, 4).map(place => (
                <PlaceCard key={place._id || place.id} place={place} />
              ))
            ) : (
              <div className="col-span-full text-center py-20">ไม่พบข้อมูล</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}