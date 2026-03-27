'use client';
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCcw, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios";
import PlaceCard from "@/components/PlaceCard";
import MoodSelector from "@/components/MoodSelector";

export default function FilterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedMood = searchParams.get("mood");
  const selectedCategory = searchParams.get("category") || "ทั้งหมด";

  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);

  // 🌟 ปรับรายการหมวดหมู่ให้ตรงกับข้อมูลจริงของคุณ
  const categories = ["ทั้งหมด", "คาเฟ่", "วัด", "สวนสาธารณะ", "บาร์", "สวนสนุก", "ห้องสมุด", "ตลาด", "ที่พัก"];

  useEffect(() => {
  let result = [...places];
  
  // ปรับการกรองตาม Mapping ที่วางแผนไว้
  const moodToCategoryMap = {
    "มีความสุข": ["สวนสนุก", "Amusement Park"],
    "เศร้า": ["สวนสาธารณะ", "ห้องสมุด", "Art Gallery"],
    "เบื่อ": ["พิพิธภัณฑ์", "ตลาด", "Board Game"],
    "เครียด": ["ที่พัก", "Quiet Cafe", "สปา"],
    "โกรธ": ["สนามกีฬา", "Gym"]
  };

  if (selectedMood && moodToCategoryMap[selectedMood]) {
    result = result.filter(place => 
      moodToCategoryMap[selectedMood].includes(place.category)
    );
  }
  
  setFilteredPlaces(result);
}, [selectedMood, places]);

  // 🌟 Logic การกรองแบบใหม่ (ใช้ข้อมูลจากฟิลด์ category และ moods ใน JSON)
  useEffect(() => {
    let result = [...places];

    // 1. กรองตามประเภท (Category)
    if (selectedCategory !== "ทั้งหมด") {
      result = result.filter(place => place.category === selectedCategory);
    }

    // 2. กรองตามอารมณ์ (Mood) - เช็คว่าใน Array moods มีคำที่เลือกไหม
    if (selectedMood) {
      result = result.filter(place => 
        place.moods && place.moods.includes(selectedMood)
      );
    }

    setFilteredPlaces(result);
  }, [selectedMood, selectedCategory, places]);

  const handleCategoryChange = (cat) => {
    const params = new URLSearchParams(searchParams);
    params.set("category", cat);
    setSearchParams(params);
  };

  const handleMoodChange = (moodLabel) => {
    const params = new URLSearchParams(searchParams);
    params.set("mood", moodLabel);
    setSearchParams(params);
    setIsMoodModalOpen(false);
  };

  const q = searchParams.get('q');



  return (
    <div className="min-h-screen bg-[#FDF8F1] font-['Prompt'] text-[#4A453A] pt-24 pb-32">
      <main className="container mx-auto px-6 max-w-7xl">
        
        <div className="flex flex-col md:flex-row justify-between mb-8 px-2 gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-black flex flex-wrap items-center gap-2">
              <div className="w-2 h-10 bg-[#FF8E6E] rounded-full hidden md:block" />
              {selectedMood ? `รู้สึก${selectedMood}` : "เลือกอารมณ์"} 
              {selectedCategory !== "ทั้งหมด" && <span className="text-[#FF8E6E]"> • {selectedCategory}</span>}
            </h2>
            <p className="text-[#AFA99B] font-bold md:ml-5">
               พบ {filteredPlaces.length} สถานที่แนะนำ
            </p>
          </div>
        </div>

        {/* แถบปุ่มหมวดหมู่ */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide px-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-6 py-2.5 rounded-2xl font-bold transition-all whitespace-nowrap border-2 ${
                selectedCategory === cat
                  ? "bg-[#FF8E6E] border-[#FF8E6E] text-white shadow-md"
                  : "bg-white border-[#E2DCCB] text-[#4A453A]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 font-bold opacity-50">กำลังโหลด...</div>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPlaces.length > 0 ? (
              filteredPlaces.map(place => (
                <motion.div layout key={place.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <PlaceCard place={place} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center bg-white/50 rounded-[3rem] border-2 border-dashed border-[#EFE9D9]">
                <h3 className="text-xl font-black text-[#4A453A]">ไม่พบสถานที่ที่ตรงเงื่อนไข</h3>
                <p className="text-[#AFA99B]">ลองเปลี่ยนหมวดหมู่หรืออารมณ์ดูนะ</p>
              </div>
            )}
          </div>
        )}
      </main>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 w-full max-w-xs px-6">
        <button onClick={() => setIsMoodModalOpen(true)} className="w-full bg-[#2D2A26] text-white py-5 rounded-full font-black shadow-2xl flex items-center justify-center gap-3">
          <Filter size={20} /> {selectedMood ? `อารมณ์: ${selectedMood}` : "เลือกอารมณ์"}
        </button>
      </div>

      <AnimatePresence>
        {isMoodModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#4A453A]/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white w-full max-w-2xl rounded-[3.5rem] p-10 relative shadow-2xl">
              <button onClick={() => setIsMoodModalOpen(false)} className="absolute top-8 right-8"><X size={28} /></button>
              <div className="text-center mb-10">
                <h3 className="text-3xl font-black text-[#2D2A26]">ตอนนี้คุณรู้สึกอย่างไร?</h3>
              </div>
              <MoodSelector onSelectMood={handleMoodChange} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}