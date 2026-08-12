"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Compass,
  Star,
  Loader2,
  Car,
  Image as ImageIcon,
  ChevronLeft,
  Search,
  Share2,
  ChevronDown,
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
  
  // State สำหรับปุ่ม "แสดงเพิ่มเติม" ในหน้าจอมือถือ
  const [showAllCategories, setShowAllCategories] = useState(false);

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // 🌟 อัปเดต: ใส่รูปภาพให้ตรงกับหมวดหมู่แต่ละอัน (ภาพจาก Unsplash)
  const moodCategories = {
    happy: [
      { id: "amusement", label: "สวนสนุก", icon: "🎢", query: "สวนสนุก", desc: "เติมพลังด้วยความตื่นเต้นและรอยยิ้ม", subtitle: "Amusement Parks", image: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=600&q=80" },
      { id: "concert", label: "คอนเสิร์ต", icon: "🎤", query: "คอนเสิร์ต", desc: "ดื่มด่ำกับเสียงเพลงและความสนุกสุดเหวี่ยง", subtitle: "Local Events", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80" },
      { id: "cafe", label: "คาเฟ่", icon: "☕", query: "คาเฟ่", desc: "เพลิดเพลินกับเครื่องดื่มและบรรยากาศสบายๆ", subtitle: "Cafes & Drinks", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80" },
      { id: "restaurant", label: "ร้านอาหาร", icon: "🍽️", query: "ร้านอาหาร", desc: "หาร้านอร่อยสำหรับมื้อพิเศษในวันดีๆ", subtitle: "Dining", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80" },
      { id: "entertainment", label: "สถานบันเทิง", icon: "🎭", query: "สถานบันเทิง", desc: "สนุกสนานกับกิจกรรมยามค่ำคืน", subtitle: "Nightlife", image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=600&q=80" },
      { id: "camp", label: "แคมป์", icon: "🏕️", query: "แคมป์", desc: "พักผ่อนในธรรมชาติและแคมป์ปิ้ง", subtitle: "Camping", image: "https://images.unsplash.com/photo-1504280327335-584ea022f4bd?auto=format&fit=crop&w=600&q=80" },
      { id: "golf", label: "สนามกอล์ฟ", icon: "⛳", query: "สนามกอล์ฟ", desc: "ผ่อนคลายด้วยกิจกรรมกลางแจ้งแบบสบายๆ", subtitle: "Golf Courses", image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=600&q=80" },
    ],
    sad: [
      { id: "river", label: "ริมแม่น้ำ", icon: "🌊", query: "ริมแม่น้ำ", desc: "ปลอบใจด้วยบรรยากาศริมน้ำที่เงียบสงบ", subtitle: "Riverside", image: "https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?auto=format&fit=crop&w=600&q=80" },
      { id: "park", label: "สวนสาธารณะ", icon: "🌳", query: "สวนสาธารณะ", desc: "สูดอากาศบริสุทธิ์และเดินเล่นในสวนสวย", subtitle: "Public Parks", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80" },
      { id: "temple", label: "วัด", icon: "⛩️", query: "วัด", desc: "หาความสงบจิตใต้ร่มเงาศาสนสถาน", subtitle: "Temples", image: "https://images.unsplash.com/photo-1590393275627-0c484ce03bc5?auto=format&fit=crop&w=600&q=80" },
      { id: "forest", label: "ป่าเขา", icon: "🌲", query: "ป่าเขา", desc: "เชื่อมต่อกับธรรมชาติและความสงบของภูเขา", subtitle: "Nature & Forests", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80" },
      { id: "viewpoint", label: "จุดชมวิว", icon: "🌄", query: "จุดชมวิว", desc: "มองโลกกว้างและชาร์จพลังด้วยวิวสวย", subtitle: "Viewpoints", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80" },
      { id: "bar", label: "บาร์", icon: "🍸", query: "บาร์", desc: "ปลดปล่อยอารมณ์เบาๆ กับเพื่อนและเครื่องดื่ม", subtitle: "Bars", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80" },
      { id: "beach", label: "ทะเล", icon: "🏖️", query: "ทะเล", desc: "ผ่อนคลายริมชายหาดกับเสียงคลื่นและลมทะเล", subtitle: "Beaches", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
    ],
    bored: [
      { id: "exhibition", label: "นิทรรศการ", icon: "🖼️", query: "นิทรรศการ", desc: "หาแรงบันดาลใจใหม่จากผลงานศิลปะและวัฒนธรรม", subtitle: "Exhibitions", image: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=600&q=80" },
      { id: "workshop", label: "workshop", icon: "🛠️", query: "workshop", desc: "ลงมือทำกิจกรรมสนุกๆ และเรียนรู้สิ่งใหม่", subtitle: "Workshops", image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=600&q=80" },
      { id: "beach", label: "ทะเล", icon: "🏖️", query: "ทะเล", desc: "เปลี่ยนบรรยากาศด้วยแสงแดดและคลื่นทะเล", subtitle: "Beaches", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
      { id: "cinema", label: "โรงภาพยนตร์", icon: "🎬", query: "โรงภาพยนตร์", desc: "ดูหนังสนุกๆ ในสภาพแวดล้อมสบายๆ", subtitle: "Cinemas", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80" },
      { id: "cafe", label: "ร้านกาแฟ", icon: "☕", query: "ร้านกาแฟ", desc: "นั่งชิลล์จิบกาแฟและหาแรงบันดาลใจใหม่", subtitle: "Coffee Shops", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80" },
      { id: "event", label: "งาน Event", icon: "🎪", query: "Event", desc: "เข้าร่วมกิจกรรมและงานต่างๆ เพื่อเติมสีสัน", subtitle: "Events", image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80" },
    ],
    stressed: [
      { id: "spa", label: "สปา", icon: "💆‍♀️", query: "สปา", desc: "พักผ่อนและฟื้นฟูร่างกายด้วยการนวด", subtitle: "Spa & Massage", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80" },
      { id: "resort", label: "ที่พักท่ามกลางธรรมชาติ", icon: "🏞️", query: "ที่พักท่ามกลางธรรมชาติ", desc: "พักผ่อนในบรรยากาศธรรมชาติสงบๆ", subtitle: "Resorts", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80" },
      { id: "onsen", label: "ออนเซน", icon: "♨️", query: "ออนเซน", desc: "แช่น้ำร้อนและปล่อยให้ความเครียดละลายไป", subtitle: "Onsen", image: "https://images.unsplash.com/photo-1601053422485-613d5a4ecb3d?auto=format&fit=crop&w=600&q=80" },
      { id: "boardgame", label: "ร้านบอร์ดเกม", icon: "🎲", query: "ร้านบอร์ดเกม", desc: "ผ่อนคลายด้วยเกมบอร์ดและมิตรภาพ", subtitle: "Board Games", image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffaed?auto=format&fit=crop&w=600&q=80" },
      { id: "mall", label: "ห้างสรรพสินค้า", icon: "🛍️", query: "ห้างสรรพสินค้า", desc: "เดินช้อปและเปลี่ยนบรรยากาศเพื่อคลายเครียด", subtitle: "Shopping Malls", image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=600&q=80" },
      { id: "gaming", label: "ร้านเกม", icon: "🎮", query: "ร้านเกม", desc: "ปลดปล่อยความเครียดด้วยเกมสนุกๆ", subtitle: "Gaming", image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80" },
      { id: "hiking", label: "เดินป่า/ภูเขา", icon: "🥾", query: "เดินป่า", desc: "ฟื้นฟูจิตใจด้วยการเชื่อมต่อธรรมชาติ", subtitle: "Hiking", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=600&q=80" },
    ],
    angry: [
      { id: "gym", label: "ยิม", icon: "🏋️‍♂️", query: "ยิม", desc: "ระบายพลังด้วยการออกกำลังกาย", subtitle: "Gyms", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80" },
      { id: "shooting", label: "สนามยิงปืน", icon: "🔫", query: "สนามยิงปืน", desc: "ปลดปล่อยพลังที่มีสมาธิและปลอดภัย", subtitle: "Shooting Ranges", image: "https://images.unsplash.com/photo-1563604085449-366014e7aeb2?auto=format&fit=crop&w=600&q=80" },
      { id: "karaoke", label: "คาราโอเกะ", icon: "🎤", query: "คาราโอเกะ", desc: "ปลดปล่อยอารมณ์ผ่านการร้องเพลง", subtitle: "Karaoke", image: "https://images.unsplash.com/photo-1516280440502-8611136e651e?auto=format&fit=crop&w=600&q=80" },
      { id: "mall", label: "ห้างสรรพสินค้า", icon: "🛍️", query: "ห้างสรรพสินค้า", desc: "ออกเดินเล่นและคลายความตึงเครียด", subtitle: "Shopping Malls", image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=600&q=80" },
      { id: "fitness", label: "ฟิตเนส", icon: "🏃‍♂️", query: "ฟิตเนส", desc: "เทรนร่างกายเพื่อระบายพลังงาน", subtitle: "Fitness Centers", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80" },
      { id: "park", label: "สวนสาธารณะ", icon: "🌳", query: "สวนสาธารณะ", desc: "ปล่อยใจให้โล่งในสวนสบายๆ", subtitle: "Parks", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80" },
    ],
  };

  const moodLabels = {
    happy: "มีความสุข 😄",
    sad: "เศร้า 😢",
    bored: "เบื่อ 🥱",
    stressed: "เครียด 😫",
    angry: "โกรธ 😡",
  };

  const displayCategories = moodCategories[selectedMood] || moodCategories.happy;
  const showAll = searchParams.get("all") === "true";
  const currentMoodLabel = showAll
    ? `สถานที่ทั้งหมดสำหรับ ${moodLabels[selectedMood] || "อารมณ์นี้"}`
    : moodLabels[selectedMood] || "กำลังค้นหาพิกัด";

  const getCurrentPosition = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => resolve(null),
        { timeout: 7000 },
      );
    });

  const fetchAllPlacesForMood = async (mood) => {
    setSelectedCategoryName("ทั้งหมด");
    setIsSearching(true);

    const categories = moodCategories[mood] || moodCategories.happy;
    const location = await getCurrentPosition();
    const params = location
      ? { lat: location.lat, lng: location.lng }
      : { lat: null, lng: null };

    try {
      const results = await Promise.all(
        categories.map((cat) =>
          api
            .get("/maps/search", { params: { keyword: cat.query, ...params } })
            .then((res) => (Array.isArray(res.data) ? res.data : []))
            .catch(() => []),
        ),
      );

      const mergedPlaces = results.flat().reduce((acc, place) => {
        const key = place.place_id || `${place.name}-${place.vicinity || place.formatted_address}`;
        if (!acc.map.has(key)) {
          acc.map.set(key, place);
          acc.list.push(place);
        }
        return acc;
      }, { map: new Map(), list: [] }).list;

      setApiResults(mergedPlaces);
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

      const placesData = Array.isArray(res.data) ? res.data : [];
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

  useEffect(() => {
    if (!showAll || !selectedMood) {
      setApiResults(null);
      setSelectedCategoryName("");
      setIsSearching(false);
      return;
    }

    if (apiResults !== null || isSearching) {
      return;
    }

    setApiResults(null);
    fetchAllPlacesForMood(selectedMood);
  }, [showAll, selectedMood, apiResults, isSearching]);

  return (
    <div className="min-h-screen bg-[#FDF8F1] font-['Prompt',sans-serif] text-[#4A453A] pt-12 sm:pt-28 pb-20 sm:pb-32">
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
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 mt-10 md:mt-0">
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
                  <div className="mb-4 h-40 overflow-hidden rounded-2xl bg-[#FDF8F1]">
                    {place.photos?.length > 0 ? (
                      <img
                        src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${API_KEY}`}
                        alt={place.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <ImageIcon size={36} />
                      </div>
                    )}
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-lg sm:text-xl font-black text-[#2D2A26] mb-2 line-clamp-2">
                      {place.name}
                    </h3>
                    <p className="text-[#AFA99B] text-xs sm:text-sm mb-4 line-clamp-2">
                      <MapPin size={16} className="inline-block mr-1" /> {place.vicinity || place.formatted_address}
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
          <>
            {/* 🌟 3.1: มุมมอง Desktop (ดีไซน์เดิม) 🌟 */}
            <div className="hidden md:block animate-in fade-in duration-700">
              <div className="text-center mb-16">
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-sm text-[#7E7869] hover:text-[#FF8E6E] hover:shadow-md transition-all mb-8 font-bold text-base"
                >
                  <ArrowLeft size={18} /> กลับไปเลือกอารมณ์ใหม่
                </button>

                <h1 className="text-4xl md:text-5xl font-black mb-4 px-2">
                  ตอนนี้คุณ{" "}
                  <span className="text-[#FF8E6E] inline-block">
                    {currentMoodLabel}
                  </span>
                </h1>
                <p className="text-[#7E7869] text-lg font-medium px-4">
                  เลือกประเภทสถานที่ที่คุณต้องการไปตอนนี้{" "}
                  <br className="hidden sm:block" />
                  แล้วเราจะค้นหาสถานที่ใกล้คุณที่สุดให้
                </p>
              </div>

              <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3 justify-center">
                {displayCategories.map((cat, index) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => handleCardClick(cat.query, cat.label)}
                    className="group cursor-pointer bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl border-2 border-transparent hover:border-[#FF8E6E]/30 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden flex flex-col"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Compass size={120} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="text-5xl mb-6 group-hover:scale-110 transition-transform origin-left">
                        {cat.icon}
                      </div>
                      <h3 className="text-2xl font-black text-[#2D2A26] mb-3 group-hover:text-[#FF8E6E] transition-colors">
                        {cat.label}
                      </h3>
                      <p className="text-[#AFA99B] text-base font-medium leading-relaxed mb-8 flex-grow">
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

            {/* 🌟 3.2: มุมมอง Mobile (ดีไซน์ใหม่ตาม Mockup) 🌟 */}
            <div className="md:hidden animate-in fade-in duration-700 pb-10">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-8 px-2">
                <button 
                  onClick={() => navigate("/")}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] text-gray-500"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-bold text-gray-500 text-sm">เลือกหมวดหมู่</span>
                <button className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] text-gray-500">
                  <Search size={18} />
                </button>
              </div>

              {/* Mobile Titles */}
              <div className="text-center mb-8 px-4">
                <h2 className="text-2xl font-black text-[#4A453A] mb-1">ตอนนี้คุณ</h2>
                <h1 className="text-3xl font-black text-[#4A453A] mb-4">{currentMoodLabel}</h1>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  เลือกหมวดหมู่สถานที่ที่คุณต้องการเพื่อเติมเต็ม<br />
                  ความสุขกับคนที่คุณรักให้สุดที
                </p>
              </div>

              {/* Mobile Cards List */}
              <div className="space-y-6">
                {(showAllCategories ? displayCategories : displayCategories.slice(0, 2)).map((cat, idx) => (
                  <motion.div 
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[2rem] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                  >
                    {/* Image Area */}
                    <div className="relative h-48 rounded-[1.5rem] overflow-hidden mb-4 bg-gray-100">
                      <img 
                        src={cat.image} 
                        alt={cat.label} 
                        className="w-full h-full object-cover" 
                      />
                      {/* Action Buttons Top Right */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-gray-600 hover:text-[#FF8E6E]">
                          <Share2 size={14} />
                        </button>
                        <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-gray-600 hover:text-[#FF8E6E]">
                          <MapPin size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Text & Action Area */}
                    <div className="px-2 pb-1">
                      <p className="text-[#FF8E6E] text-[10px] font-black uppercase tracking-wider mb-1">
                        {cat.subtitle || cat.id}
                      </p>
                      
                      <div className="flex justify-between items-center mb-5">
                        <h3 className="text-2xl font-black text-[#2D2A26]">{cat.label}</h3>
                        <div className="flex -space-x-2 mr-2">
                          <span className="bg-[#FDF8F1] border border-white text-gray-500 text-[10px] font-black w-8 h-8 flex items-center justify-center rounded-full z-10 shadow-sm">
                            +{Math.floor(Math.random() * 15) + 5}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleCardClick(cat.query, cat.label)} 
                        className="w-full py-3.5 bg-[#FFF5F3] text-[#FF8E6E] rounded-2xl font-black text-sm active:scale-95 transition-transform"
                      >
                        ดูสถานที่น่าสนใจ
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* "Show More" Button (แสดงเพิ่มเติม) */}
              {!showAllCategories && displayCategories.length > 2 && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => setShowAllCategories(true)} 
                    className="flex flex-col items-center text-gray-400 text-xs font-bold hover:text-[#FF8E6E] transition-colors"
                  >
                    แสดงเพิ่มเติม
                    <ChevronDown size={18} className="mt-1 animate-bounce" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}