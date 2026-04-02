"use client";
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Compass,
  Star,
  Navigation,
  Loader2,
  Car,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/api/axios";
import Swal from "sweetalert2";

export default function FilterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedMood = searchParams.get("mood");

  const [isSearching, setIsSearching] = useState(false);
  const [apiResults, setApiResults] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  const moodCategories = {
    happy: [
      {
        id: "amusement",
        label: "สวนสนุก",
        icon: "🎢",
        query: "สวนสนุก Amusement Park",
        desc: "ขยายความสุขและสร้างความตื่นเต้นผ่านเครื่องเล่นสนุกๆ",
      },
      {
        id: "event",
        label: "งาน Event",
        icon: "🎪",
        query: "Event Space",
        desc: "ขยายความสุขผ่านกิจกรรมกลุ่ม พบปะผู้คนในบรรยากาศคึกคัก",
      },
    ],
    sad: [
      {
        id: "park",
        label: "สวนสาธารณะ",
        icon: "🌳",
        query: "สวนสาธารณะ Public Park",
        desc: "ใช้ธรรมชาติบำบัด (Biophilia Effect) ให้จิตใจสงบ",
      },
      {
        id: "bookstore",
        label: "ร้านหนังสือ",
        icon: "📚",
        query: "ร้านหนังสือ Bookstore",
        desc: "หลีกหนีความวุ่นวาย โอบกอดตัวเองผ่านตัวอักษร",
      },
      {
        id: "gallery",
        label: "หอศิลป์",
        icon: "🎨",
        query: "Art Gallery",
        desc: "ซึมซับความสุนทรีย์และบรรเทาความเศร้าด้วยศิลปะ",
      },
    ],
    bored: [
      {
        id: "museum",
        label: "พิพิธภัณฑ์",
        icon: "🏛️",
        query: "พิพิธภัณฑ์ Museum",
        desc: "กระตุ้นประสาทสัมผัสด้วยสิ่งประดิษฐ์และประวัติศาสตร์",
      },
      {
        id: "mall",
        label: "ห้างสรรพสินค้า",
        icon: "🛍️",
        query: "Shopping Mall",
        desc: "เดินดูสิ่งของแปลกใหม่เพื่อคลายความเบื่อหน่าย",
      },
      {
        id: "boardgame",
        label: "บอร์ดเกมคาเฟ่",
        icon: "🎲",
        query: "Board Game Cafe",
        desc: "กระตุ้นประสาทสัมผัสและท้าทายสมองกับเพื่อนฝูง",
      },
    ],
    stressed: [
      {
        id: "spa",
        label: "สปาและนวด",
        icon: "💆‍♀️",
        query: "สปา Spa Massage",
        desc: "ลดระดับคอร์ติซอล (Cortisol) ด้วยการผ่อนคลายกล้ามเนื้อ",
      },
      {
        id: "cafe",
        label: "คาเฟ่สงบๆ",
        icon: "☕",
        query: "Quiet Cafe",
        desc: "ลดระดับคอร์ติซอล (Cortisol) ด้วยความสงบและเครื่องดื่มโปรด",
      },
      {
        id: "botanical",
        label: "สวนพฤกษศาสตร์",
        icon: "🌺",
        query: "Botanical Garden",
        desc: "สูดอากาศบริสุทธิ์ท่ามกลางพรรณไม้ ลดความตึงเครียด",
      },
    ],
    angry: [
      {
        id: "gym",
        label: "ยิมออกกำลังกาย",
        icon: "🏋️‍♂️",
        query: "ยิม Gym",
        desc: "ระบายออกทางกายภาพ (Physical Release) ลดความโกรธ",
      },
      {
        id: "boxing",
        label: "ค่ายมวย",
        icon: "🥊",
        query: "Boxing Gym",
        desc: "ปลดปล่อยพลังงานที่พลุ่งพล่านผ่านการเคลื่อนไหว",
      },
      {
        id: "stadium",
        label: "สนามกีฬา",
        icon: "🏟️",
        query: "สนามกีฬา Stadium",
        desc: "ระบายออกทางกายภาพ (Physical Release) ผ่านการเล่นกีฬา",
      },
    ],
  };

  const moodLabels = {
    happy: "มีความสุข 😄",
    sad: "เศร้า 😢",
    bored: "เบื่อ 🥱",
    stressed: "เครียด 😫",
    angry: "โกรธ 😡",
  };
  const displayCategories =
    moodCategories[selectedMood] || moodCategories.happy;
  const currentMoodLabel = moodLabels[selectedMood] || "กำลังค้นหาพิกัด";

  const handleCardClick = (categoryQuery, categoryLabel) => {
    setSelectedCategoryName(categoryLabel);
    setIsSearching(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          fetchPlacesFromAPI(categoryQuery, lat, lng);
        },
        (error) => {
          console.warn("ไม่สามารถดึง GPS ได้", error);
          fetchPlacesFromAPI(categoryQuery, null, null);
        },
      );
    } else {
      fetchPlacesFromAPI(categoryQuery, null, null);
    }
  };

  const fetchPlacesFromAPI = async (keyword, lat, lng) => {
    try {
      const res = await api.get("/maps/search", {
        params: { keyword: keyword, lat: lat, lng: lng },
      });

      let placesData = res.data;

      if (lat && lng && Array.isArray(placesData) && placesData.length > 0) {
        const placesWithRealDistance = await Promise.all(
          placesData.map(async (place) => {
            const placeLat = place.geometry?.location?.lat;
            const placeLng = place.geometry?.location?.lng;

            if (!placeLat || !placeLng)
              return { ...place, distanceValue: 99999999 };

            try {
              const distRes = await api.get("/maps/distance", {
                params: {
                  originLat: lat,
                  originLng: lng,
                  destLat: placeLat,
                  destLng: placeLng,
                },
              });

              return {
                ...place,
                distanceText: distRes.data.distanceText,
                durationText: distRes.data.durationText,
                distanceValue: distRes.data.distanceValue,
              };
            } catch (e) {
              return { ...place, distanceValue: 99999999 };
            }
          }),
        );

        placesWithRealDistance.sort(
          (a, b) => a.distanceValue - b.distanceValue,
        );
        placesData = placesWithRealDistance;
      }

      setApiResults(placesData);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดึงข้อมูลสถานที่ได้ในขณะนี้",
      });
      setApiResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F1] font-['Prompt',sans-serif] text-[#4A453A] pt-24 sm:pt-28 pb-20 sm:pb-32">
      <main className="container mx-auto px-4 sm:px-6 max-w-5xl">
        {/* --- โหมดที่ 1: กำลังโหลดค้นหาข้อมูล --- */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-24 sm:py-32 animate-in fade-in duration-500">
            <Loader2 className="w-16 h-16 text-[#FF8E6E] animate-spin mb-6" />
            <h2 className="text-2xl sm:text-3xl font-black text-[#4A453A] mb-2 text-center">
              กำลังค้นหาพิกัด...
            </h2>
            <p className="text-[#7E7869] font-medium text-base sm:text-lg text-center px-4">
              กำลังรวบรวมข้อมูล {selectedCategoryName} ที่ใกล้คุณที่สุด
            </p>
          </div>
        )}

        {/* --- โหมดที่ 2: แสดงผลลัพธ์จาก API --- */}
        {!isSearching && apiResults !== null && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-10 gap-4">
              <div>
                <button
                  onClick={() => setApiResults(null)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-sm text-[#7E7869] hover:text-[#FF8E6E] hover:shadow-md transition-all mb-4 sm:mb-6 font-bold text-sm sm:text-base"
                >
                  <ArrowLeft size={18} /> กลับไปเลือกประเภทใหม่
                </button>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-black">
                  ผลการค้นหา:{" "}
                  <span className="text-[#FF8E6E]">{selectedCategoryName}</span>
                </h1>
                <p className="text-[#7E7869] mt-2 font-medium text-base sm:text-lg">
                  พบสถานที่ที่น่าสนใจรอบตัวคุณ {apiResults.length} แห่ง
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {apiResults.map((place, index) => (
                <motion.div
                  key={place.place_id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all border border-[#EFE9D9] flex flex-col"
                >
                  <div className="flex-grow">
                    <h3 className="text-lg sm:text-xl font-black text-[#2D2A26] mb-2 line-clamp-2">
                      {place.name}
                    </h3>
                    <p className="text-[#AFA99B] text-xs sm:text-sm mb-4 line-clamp-2">
                      📍 {place.vicinity || place.formatted_address}
                    </p>

                    <div className="flex items-center flex-wrap gap-2 mb-6">
                      <div className="flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-xl text-[#FF8E6E] font-black text-xs sm:text-sm">
                        <Star size={14} className="fill-[#FF8E6E]" />{" "}
                        {place.rating || "ไม่มีคะแนน"}
                      </div>
                      <span className="text-xs text-gray-400 font-medium">
                        ({place.user_ratings_total || 0} รีวิว)
                      </span>

                      {place.distanceText && place.durationText && (
                        <div className="ml-auto flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm">
                          <Car size={16} /> {place.distanceText}
                          <span className="font-medium text-xs opacity-80">
                            ({place.durationText})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/g-place/${place.place_id}`)}
                    className="w-full py-3.5 bg-[#4A453A] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#FF8E6E] transition-colors shadow-md active:scale-95 mt-auto text-sm sm:text-base"
                  >
                    <Star size={18} /> ดูรูปภาพและรีวิว
                  </button>
                </motion.div>
              ))}

              {apiResults.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <h3 className="text-xl sm:text-2xl font-black text-gray-400">
                    ไม่พบสถานที่ในระยะใกล้เคียง 😢
                  </h3>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- โหมดที่ 3: หน้าจอเลือกหมวดหมู่ --- */}
        {!isSearching && apiResults === null && (
          <div className="animate-in fade-in duration-700">
            <div className="text-center mb-10 sm:mb-16">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-sm text-[#7E7869] hover:text-[#FF8E6E] hover:shadow-md transition-all mb-6 sm:mb-8 font-bold text-sm sm:text-base"
              >
                <ArrowLeft size={18} /> กลับไปเลือกอารมณ์ใหม่
              </button>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 px-2">
                ตอนนี้คุณ{" "}
                <span className="text-[#FF8E6E] inline-block">
                  {currentMoodLabel}
                </span>
              </h1>
              <p className="text-[#7E7869] text-base sm:text-lg font-medium px-4">
                เลือกประเภทสถานที่ที่คุณต้องการไปตอนนี้{" "}
                <br className="hidden sm:block" />
                แล้วเราจะค้นหาสถานที่ใกล้คุณที่สุดให้
              </p>
            </div>

            <div className="grid gap-5 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-3 justify-center">
              {displayCategories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleCardClick(cat.query, cat.label)}
                  className="group cursor-pointer bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm hover:shadow-2xl border-2 border-transparent hover:border-[#FF8E6E]/30 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Compass size={80} className="sm:w-[120px] sm:h-[120px]" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="text-4xl sm:text-5xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform origin-left">
                      {cat.icon}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#2D2A26] mb-2 sm:mb-3 group-hover:text-[#FF8E6E] transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-[#AFA99B] text-sm sm:text-base font-medium leading-relaxed mb-6 sm:mb-8 flex-grow">
                      {cat.desc}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[#FF8E6E] font-bold text-sm bg-orange-50 w-full px-4 py-3 rounded-2xl group-hover:bg-[#FF8E6E] group-hover:text-white transition-colors mt-auto shadow-sm">
                      <MapPin size={16} /> ค้นหาสถานที่ใกล้ฉัน
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
