'use client';
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.png";
import MoodSelector from "@/components/MoodSelector";
import PlaceCard from "@/components/PlaceCard";
import { SAMPLE_PLACES, CATEGORIES } from "@/data/mockData";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
    <div className="w-full bg-[#FDF8F1] text-[#4A453A] overflow-x-hidden">
      
      {/* --- HERO SECTION: แก้ไขให้ขยายเต็มพื้นที่ --- */}
      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-[#FDF8F1]">
        
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 z-0 scale-110 transition-transform duration-1000 ease-out"
          style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
        >
          {/* object-cover จะทำให้รูปยืดเต็มพื้นที่ 1980x1080 โดยไม่เสียสัดส่วน */}
          <img 
            src={heroBg} 
            className="h-full w-full object-cover object-center" 
            alt="Hero Background" 
          />
        </div>
        
        {/* Overlays: ปรับให้ฟุ้งและกลืนไปกับพื้นหลังสีครีมด้านล่าง */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF8F1] via-[#FDF8F1]/40 to-transparent z-20" />
        
        {/* Content ตรงกลาง */}
        <div className="container relative z-30 px-4 text-center mx-auto">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          </div>
          
          <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 font-black text-6xl sm:text-8xl lg:text-9xl text-[#4A4A4A] drop-shadow-sm leading-[0.9]">
            ไปไหนดี... <br/>
            <span className="text-[#FF8E6E] inline-block hover:scale-105 transition-transform cursor-default drop-shadow-md">ให้อารมณ์บอก</span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 text-xl text-[#8E8E8E] font-medium">
            เลือกความรู้สึกของคุณตอนนี้ แล้วเราจะพาส่งไปยังสถานที่ที่ตอบโจทย์ที่สุด
          </p>

          <div className="mx-auto mt-12 max-w-2xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF8E6E] to-[#FFA07A] rounded-full blur opacity-20 group-focus-within:opacity-100 transition duration-1000"></div>
              <div className="relative flex items-center bg-white/95 backdrop-blur-xl rounded-full shadow-2xl overflow-hidden border border-white/50">
                <Search className="ml-6 h-6 w-6 text-gray-400 group-focus-within:text-[#FF8E6E] transition-colors" />
                <input
                  type="text"
                  placeholder="วันนี้รู้สึกอย่างไร หรืออยากไปที่ไหน..."
                  className="w-full py-6 px-4 text-lg font-bold outline-none bg-transparent placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <main className="container mx-auto  px-4 -mt-20 relative z-40 space-y-32 pb-32">
        
        {/* Mood Selector Card */}
        <section className="mt-10 mb-10 bg-white/90 backdrop-blur-2xl rounded-[3rem] p-12 md:p-16 shadow-[0_32px_64px_-16px_rgba(74,69,58,0.1)] text-center border border-white transform hover:-translate-y-2 transition-all duration-500 mx-auto max-w-4xl">
  <h2 className="text-4xl font-black mb-6 tracking-tight" style={{ color: "#4A4A4A" }}>
    วันนี้รู้สึกยังไง? 🤔
  </h2>
  
  <p className="text-lg font-medium mb-10" style={{ color: "#8E8E8E", lineHeight: "1.6" }}>
    คลิกเลือกอารมณ์ของคุณเพื่อเริ่มการเดินทาง
  </p>
  
  <div className="mt-4">
    <MoodSelector />
  </div>
</section>

        {/* Places Grid */}
        <section>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black mb-2">สถานที่ยอดนิยม 🔥</h2>
              <p className="text-[#7E7869] text-lg font-medium">คัดสรรมาแล้วจากอารมณ์ของเพื่อนๆ</p>
            </div>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {SAMPLE_PLACES.slice(0, 4).map(place => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>
      </main>
      
    </div>
  );
}