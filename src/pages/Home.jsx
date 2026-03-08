'use client';
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.png";
import MoodSelector from "@/components/MoodSelector";
import PlaceCard from "@/components/PlaceCard";
import api from "@/api/axios"; 

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลจาก Backend
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await api.get("https://moodlocationfinder-backend.onrender.com/api/v1/places");
        setPlaces(response.data);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.matchMedia("(pointer: fine)").matches) {
        setMousePos({ 
          x: (e.clientX / window.innerWidth) * 15, 
          y: (e.clientY / window.innerHeight) * 15 
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="w-full bg-[#FDF8F1] text-[#4A453A] overflow-x-hidden font-['Kanit',sans-serif]">
      {/* 📥 นำเข้าฟอนต์ Kanit ผ่าน Style Tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap');
        * { font-family: 'Kanit', sans-serif; }
      `}</style>

      {/* --- HERO SECTION --- */}
      <section className="relative w-full h-[70vh] sm:h-[80vh] md:h-[85vh] min-h-[480px] flex items-center justify-center overflow-hidden bg-[#FDF8F1]">
        <div 
          className="absolute inset-0 z-0 scale-110 transition-transform duration-1000 ease-out"
          style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
        >
          <img src={heroBg} className="h-full w-full object-cover object-center" alt="Hero Background" />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF8F1] via-[#FDF8F1]/60 to-transparent z-20" />
        
        <div className="container relative z-30 px-5 text-center mx-auto">
          {/* Header: ขนาด 48px */}
          <h1 
            style={{ fontSize: '48px' }} 
            className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 font-black text-[#4A4A4A] drop-shadow-sm leading-tight lg:leading-[0.9] mb-4"
          >
            ไปไหนดี... <br className="hidden sm:block"/>
            <span className="text-[#FF8E6E] inline-block hover:scale-105 transition-transform cursor-default drop-shadow-md">ให้อารมณ์บอก</span>
          </h1>
          
          {/* Sub-headline: ขนาด 18px */}
          <p 
            style={{ fontSize: '18px' }} 
            className="mx-auto mt-5 max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 text-[#7E7869] font-medium px-2"
          >
            เลือกความรู้สึกของคุณตอนนี้ แล้วเราจะพาส่งไปยังสถานที่ที่ตอบโจทย์ที่สุด
          </p>

          {/* Search Input: ขนาด 18px */}
          <div className="mx-auto mt-8 max-w-lg animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
            <div className="relative group px-1">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF8E6E] to-[#FFA07A] rounded-full blur opacity-15 group-focus-within:opacity-100 transition duration-1000"></div>
              <div className="relative flex items-center bg-white/95 backdrop-blur-xl rounded-full shadow-lg overflow-hidden border border-white/50">
                <Search className="ml-4 sm:ml-6 h-5 w-5 text-gray-400 group-focus-within:text-[#FF8E6E]" />
                <input
                  type="text"
                  placeholder="วันนี้รู้สึกยังไง..."
                  style={{ fontSize: '18px' }}
                  className="w-full py-4 sm:py-5 px-3 sm:px-4 font-bold outline-none bg-transparent placeholder:text-gray-400 text-[#4A453A]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <main className="container mx-auto px-4 sm:px-6 -mt-8 sm:-mt-20 relative z-40 space-y-16 sm:space-y-32 pb-20">
        
        {/* Mood Card: หัวข้อ 32px / เนื้อหา 16px */}
        <section className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-16 shadow-[0_32px_64px_-16px_rgba(74,69,58,0.1)] text-center border border-white transform transition-all duration-500 mx-auto max-w-4xl">
          <h2 
            style={{ fontSize: '32px' }} 
            className="font-black mb-3 tracking-tight text-[#4A4A4A]"
          >
            วันนี้รู้สึกยังไง? 🤔
          </h2>
          <p 
            style={{ fontSize: '16px' }} 
            className="font-medium mb-8 text-[#8E8E8E] leading-relaxed"
          >
            คลิกเลือกอารมณ์ของคุณเพื่อเริ่มการเดินทาง
          </p>
          <div className="mt-4">
            <MoodSelector />
          </div>
        </section>

        {/* Places Grid: หัวข้อ 32px / ลิงก์ 18px / รายละเอียด 16px */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-8 sm:mb-12 gap-4">
            <div className="text-center sm:text-left">
              <h2 
                style={{ fontSize: '32px' }} 
                className="font-black mb-1 text-[#4A4A4A]"
              >
                สถานที่ยอดนิยม 🔥
              </h2>
              <p 
                style={{ fontSize: '16px' }} 
                className="text-[#7E7869] font-medium"
              >
                คัดสรรมาแล้วจากอารมณ์ของเพื่อนๆ
              </p>
            </div>
            <Link 
              to="/all-places" 
              style={{ fontSize: '18px' }}
              className="text-[#FF8E6E] font-bold hover:underline flex items-center gap-1 transition-all active:scale-95"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          
          <div className="grid gap-6 sm:gap-8 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <div className="col-span-full text-center py-20">
                <p style={{ fontSize: '18px' }} className="font-bold text-gray-400">กำลังดึงข้อมูลสถานที่...</p>
              </div>
            ) : places.length > 0 ? (
              places.slice(0, 4).map(place => (
                <div key={place.id} className="animate-in fade-in zoom-in duration-500">
                  {/* ขนาดฟอนต์ในการ์ดถูกควบคุมผ่านคอมโพเนนต์ PlaceCard แล้ว */}
                  <PlaceCard place={place} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p style={{ fontSize: '16px' }} className="font-bold text-gray-400">ไม่พบข้อมูลสถานที่ในขณะนี้</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}