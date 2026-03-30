'use client';
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, ArrowLeft, Loader2, 
  CheckCircle2, Car, Flag, ArrowDown, Filter, ChevronDown, Heart, Search, ChevronLeft, ChevronRight, Navigation
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1)); 
};

const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '2rem' };
const mapOptions = { disableDefaultUI: true, zoomControl: true };

// พิกัดซูมภาค
const regionFocus = [
  { name: "ทั่วประเทศ", coords: { lat: 13.5, lng: 100.9925 }, zoom: 6 },
  { name: "ภาคเหนือ", coords: { lat: 18.5, lng: 99.0 }, zoom: 7 },
  { name: "ภาคอีสาน", coords: { lat: 16.0, lng: 103.5 }, zoom: 7 },
  { name: "ภาคกลาง", coords: { lat: 14.5, lng: 100.5 }, zoom: 8 },
  { name: "ภาคตะวันออก", coords: { lat: 13.2, lng: 101.8 }, zoom: 8 },
  { name: "ภาคใต้", coords: { lat: 8.5, lng: 99.0 }, zoom: 7 },
];

// รายชื่อ 77 จังหวัด
const PROVINCES_DATA = [
  { name: "กรุงเทพมหานคร", lat: 13.7563, lng: 100.5018 }, { name: "กระบี่", lat: 8.0863, lng: 98.9063 }, { name: "กาญจนบุรี", lat: 14.0158, lng: 99.5328 }, { name: "กาฬสินธุ์", lat: 16.4328, lng: 103.5065 }, { name: "กำแพงเพชร", lat: 16.4828, lng: 99.5227 }, { name: "ขอนแก่น", lat: 16.4322, lng: 102.8236 }, { name: "จันทบุรี", lat: 12.6114, lng: 102.1039 }, { name: "ฉะเชิงเทรา", lat: 13.6904, lng: 101.0718 }, { name: "ชลบุรี", lat: 13.3611, lng: 100.9847 }, { name: "ชัยนาท", lat: 15.1852, lng: 100.1251 }, { name: "ชัยภูมิ", lat: 15.8062, lng: 102.0315 }, { name: "ชุมพร", lat: 10.493, lng: 99.1800 }, { name: "เชียงราย", lat: 19.9105, lng: 99.8406 }, { name: "เชียงใหม่", lat: 18.7883, lng: 98.9853 }, { name: "ตรัง", lat: 7.5563, lng: 99.6114 }, { name: "ตราด", lat: 12.2428, lng: 102.5175 }, { name: "ตาก", lat: 16.884, lng: 99.1258 }, { name: "นครนายก", lat: 14.2069, lng: 101.2131 }, { name: "นครปฐม", lat: 13.8192, lng: 100.0443 }, { name: "นครพนม", lat: 17.4048, lng: 104.7816 }, { name: "นครราชสีมา", lat: 14.9799, lng: 102.0978 }, { name: "นครศรีธรรมราช", lat: 8.4334, lng: 99.9628 }, { name: "นครสวรรค์", lat: 15.7051, lng: 100.1368 }, { name: "นนทบุรี", lat: 13.8621, lng: 100.5141 }, { name: "นราธิวาส", lat: 6.4255, lng: 101.8253 }, { name: "น่าน", lat: 18.7831, lng: 100.7777 }, { name: "บึงกาฬ", lat: 18.3607, lng: 103.6520 }, { name: "บุรีรัมย์", lat: 14.9930, lng: 103.1029 }, { name: "ปทุมธานี", lat: 14.0208, lng: 100.5250 }, { name: "ประจวบคีรีขันธ์", lat: 11.8105, lng: 99.7971 }, { name: "ปราจีนบุรี", lat: 14.0510, lng: 101.3725 }, { name: "ปัตตานี", lat: 6.8673, lng: 101.2501 }, { name: "พระนครศรีอยุธยา", lat: 14.3532, lng: 100.5684 }, { name: "พะเยา", lat: 19.1666, lng: 99.9022 }, { name: "พังงา", lat: 8.4501, lng: 98.5286 }, { name: "พัทลุง", lat: 7.6166, lng: 100.0740 }, { name: "พิจิตร", lat: 16.4428, lng: 100.3488 }, { name: "พิษณุโลก", lat: 16.8211, lng: 100.2659 }, { name: "เพชรบุรี", lat: 13.1119, lng: 99.9446 }, { name: "เพชรบูรณ์", lat: 16.4186, lng: 101.1544 }, { name: "แพร่", lat: 18.1446, lng: 100.1403 }, { name: "ภูเก็ต", lat: 7.8804, lng: 98.3923 }, { name: "มหาสารคาม", lat: 16.1856, lng: 103.2987 }, { name: "มุกดาหาร", lat: 16.5443, lng: 104.7235 }, { name: "แม่ฮ่องสอน", lat: 19.3006, lng: 97.9654 }, { name: "ยโสธร", lat: 15.7926, lng: 104.1453 }, { name: "ยะลา", lat: 6.5411, lng: 101.2804 }, { name: "ร้อยเอ็ด", lat: 16.0538, lng: 103.6520 }, { name: "ระนอง", lat: 9.9658, lng: 98.6348 }, { name: "ระยอง", lat: 12.6814, lng: 101.2816 }, { name: "ราชบุรี", lat: 13.5283, lng: 99.8134 }, { name: "ลพบุรี", lat: 14.7995, lng: 100.6534 }, { name: "ลำปาง", lat: 18.2888, lng: 99.4920 }, { name: "ลำพูน", lat: 18.5745, lng: 99.0087 }, { name: "เลย", lat: 17.4860, lng: 101.7223 }, { name: "ศรีสะเกษ", lat: 15.1186, lng: 104.3220 }, { name: "สกลนคร", lat: 17.1664, lng: 104.1486 }, { name: "สงขลา", lat: 7.1898, lng: 100.5954 }, { name: "สตูล", lat: 6.6238, lng: 100.0674 }, { name: "สมุทรปราการ", lat: 13.5991, lng: 100.5968 }, { name: "สมุทรสงคราม", lat: 13.4098, lng: 100.0023 }, { name: "สมุทรสาคร", lat: 13.5475, lng: 100.2736 }, { name: "สระแก้ว", lat: 13.8240, lng: 102.0646 }, { name: "สระบุรี", lat: 14.5289, lng: 100.9101 }, { name: "สิงห์บุรี", lat: 14.8936, lng: 100.3967 }, { name: "สุโขทัย", lat: 17.0113, lng: 99.8256 }, { name: "สุพรรณบุรี", lat: 14.4742, lng: 100.1123 }, { name: "สุราษฎร์ธานี", lat: 9.1333, lng: 99.3167 }, { name: "สุรินทร์", lat: 14.8818, lng: 103.4936 }, { name: "หนองคาย", lat: 17.8783, lng: 102.7420 }, { name: "หนองบัวลำภู", lat: 17.2045, lng: 102.4407 }, { name: "อ่างทอง", lat: 14.5896, lng: 100.4551 }, { name: "อำนาจเจริญ", lat: 15.8657, lng: 104.6258 }, { name: "อุดรธานี", lat: 17.4138, lng: 102.7872 }, { name: "อุตรดิตถ์", lat: 17.6201, lng: 100.0993 }, { name: "อุทัยธานี", lat: 15.3789, lng: 100.0253 }, { name: "อุบลราชธานี", lat: 15.2287, lng: 104.8564 }
];

export default function TripPlanner() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [userLoc, setUserLoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const [selectedDistance, setSelectedDistance] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [map, setMap] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null); 
  
  const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);
  const [provinceSearchQuery, setProvinceSearchQuery] = useState("");
  const regionScrollRef = useRef(null); 

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY
  });

  const distanceOptions = [
    { label: "รายการโปรดทั้งหมด", value: null },
    { label: "ใกล้ฉันมาก (< 5 กม.)", value: 5 },
    { label: "รัศมีปานกลาง (< 15 กม.)", value: 15 },
    { label: "รัศมีกว้าง (< 30 กม.)", value: 30 },
  ];

  useEffect(() => {
    fetchFavoritesAndCalculate();
  }, []);

  const fetchFavoritesAndCalculate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("กรุณาเข้าสู่ระบบ", "คุณต้องเข้าสู่ระบบเพื่อดูแผนการเดินทาง", "warning");
        navigate('/login');
        return;
      }

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const currentLat = position.coords.latitude;
            const currentLng = position.coords.longitude;
            setUserLoc({ lat: currentLat, lng: currentLng });
            
            setCalculating(true);
            await processFavoriteDistances(currentLat, currentLng, token);
          },
          (error) => {
            console.warn("GPS Denied", error);
            Swal.fire("ไม่สามารถระบุตำแหน่งได้", "กรุณาเปิด GPS", "error");
            setLoading(false);
          }
        );
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error initiating Trip Planner:", err);
      setLoading(false);
    }
  };

  const processFavoriteDistances = async (currentLat, currentLng, token) => {
    try {
      const favRes = await api.get("/favorites", { headers: { Authorization: `Bearer ${token}` } });
      const favorites = favRes.data.favorites || favRes.data || [];

      if (favorites.length === 0) {
        setPlaces([]);
        setLoading(false);
        return;
      }

      const placesWithDistance = await Promise.all(
        favorites.map(async (fav) => {
          try {
            const detailRes = await api.get(`/maps/details/${fav.placeId}`);
            const location = detailRes.data.geometry?.location;
            
            if (location) {
              const dist = calculateDistance(currentLat, currentLng, location.lat, location.lng);
              return { 
                ...fav, 
                distance: dist,
                lat: location.lat,
                lng: location.lng,
                address: detailRes.data.vicinity || detailRes.data.formatted_address || "ไม่ระบุที่อยู่"
              };
            }
            return { ...fav, distance: 9999, address: "ไม่สามารถคำนวณพิกัดได้" }; 
          } catch (e) {
            return { ...fav, distance: 9999, address: "เชื่อมต่อข้อมูลไม่ได้" };
          }
        })
      );

      const sortedPlaces = placesWithDistance.sort((a, b) => a.distance - b.distance);
      setPlaces(sortedPlaces);
    } catch (error) {
      console.error("Calculate distance failed", error);
    } finally {
      setCalculating(false);
      setLoading(false);
    }
  };

  const filteredPlaces = selectedDistance 
    ? places.filter(p => p.distance !== 9999 && p.distance <= selectedDistance) 
    : places;

  const onLoadMap = useCallback((mapInstance) => {
    setMap(mapInstance);
    if (userLoc && filteredPlaces.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(new window.google.maps.LatLng(userLoc.lat, userLoc.lng));
      filteredPlaces.forEach(place => {
        if (place.lat && place.lng) bounds.extend(new window.google.maps.LatLng(place.lat, place.lng));
      });
      mapInstance.fitBounds(bounds);
    }
  }, [userLoc, filteredPlaces]);

  const handleMapFocus = (coords, zoomLevel) => {
    if (map) {
      map.panTo(coords);
      map.setZoom(zoomLevel);
    }
  };

  const handleSelectProvince = (prov) => {
    setProvinceSearchQuery(prov.name);
    setIsProvinceDropdownOpen(false);
    handleMapFocus({ lat: prov.lat, lng: prov.lng }, 10);
  };

  const filteredProvincesList = PROVINCES_DATA.filter(prov => 
    prov.name.includes(provinceSearchQuery)
  );

  const scrollRegions = (direction) => {
    if (regionScrollRef.current) {
      const scrollAmount = 150;
      regionScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollToCard = (placeId) => {
    const cardElement = document.getElementById(`timeline-card-${placeId}`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveCardId(placeId);
      setTimeout(() => setActiveCardId(null), 2000); 
    }
  };

  // สร้างฟังก์ชันเพื่อเปิด Google Maps แบบแวะหลายจุด (Multi-stop route)
  const openMultiStopRouteInGoogleMaps = () => {
    if (!userLoc || filteredPlaces.length === 0) return;
    
    // กรองเอาเฉพาะสถานที่ที่มีพิกัดชัดเจน
    const validPlaces = filteredPlaces.filter(p => p.lat && p.lng);
    if (validPlaces.length === 0) return;

    const origin = `${userLoc.lat},${userLoc.lng}`;
    const destination = `${validPlaces[validPlaces.length - 1].lat},${validPlaces[validPlaces.length - 1].lng}`;
    
    // นำจุดที่เหลือ (ตรงกลาง) มาเป็นทางผ่าน
    const waypoints = validPlaces.slice(0, -1).map(p => `${p.lat},${p.lng}`).join('|');
    
    // สร้าง URL ของ Google Maps Directions
    const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}`;
    window.open(mapUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FDF8F1] font-['Prompt'] pt-28 pb-32 px-4">
      <main className="container mx-auto max-w-3xl">
        
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-[#7E7869] hover:text-[#FF8E6E] font-bold mb-6 transition-all bg-white px-5 py-2.5 rounded-full shadow-sm">
            <ArrowLeft size={18} /> ย้อนกลับ
          </button>
          <h1 className="text-4xl md:text-6xl font-black text-[#4A453A]">
            แผนการ<span className="text-[#FF8E6E]">เดินทาง 🗺️</span>
          </h1>
          <p className="text-[#7E7869] mt-4 font-medium text-lg">
            จัดเรียง <span className="text-[#FF8E6E]">"รายการโปรด"</span> ตามระยะทางจริงจากจุดที่คุณอยู่
          </p>
        </div>

        {/* แสดงแผนที่ Google Maps ด้านบนเสมอ */}
        {!loading && !calculating && isLoaded && filteredPlaces.length > 0 && userLoc && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-white p-4 rounded-[2.5rem] shadow-sm border border-[#EFE9D9]"
          >
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              
              <div className="flex items-center flex-1 bg-[#FDF8F1] rounded-full px-1 border border-[#EFE9D9] overflow-hidden">
                <button onClick={() => scrollRegions('left')} className="p-2 text-gray-400 hover:text-[#FF8E6E] shrink-0">
                  <ChevronLeft size={20} />
                </button>
                
                <div ref={regionScrollRef} className="flex overflow-x-auto hide-scrollbar gap-2 py-2 flex-1 scroll-smooth px-1">
                  {regionFocus.map((region) => (
                    <button
                      key={region.name}
                      onClick={() => handleMapFocus(region.coords, region.zoom)}
                      className="whitespace-nowrap px-4 py-1.5 bg-white text-[#4A453A] rounded-full text-sm font-bold shadow-sm hover:bg-[#FF8E6E] hover:text-white transition-all active:scale-95 border border-[#EFE9D9]"
                    >
                      {region.name}
                    </button>
                  ))}
                </div>

                <button onClick={() => scrollRegions('right')} className="p-2 text-gray-400 hover:text-[#FF8E6E] shrink-0">
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <div className="relative w-full md:w-56 shrink-0 z-50">
                <div 
                  className="flex items-center bg-white border border-[#EFE9D9] rounded-full px-4 py-2 cursor-text shadow-sm focus-within:border-[#FF8E6E] focus-within:ring-1 focus-within:ring-[#FF8E6E]"
                  onClick={() => setIsProvinceDropdownOpen(true)}
                >
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input 
                    type="text" 
                    placeholder="ค้นหาจังหวัด..." 
                    className="w-full text-sm font-bold text-[#4A453A] outline-none"
                    value={provinceSearchQuery}
                    onChange={(e) => {
                      setProvinceSearchQuery(e.target.value);
                      setIsProvinceDropdownOpen(true);
                    }}
                    onFocus={() => setIsProvinceDropdownOpen(true)}
                  />
                  {provinceSearchQuery && (
                    <button onClick={() => { setProvinceSearchQuery(""); handleMapFocus({ lat: 13.5, lng: 100.9925 }, 6); }} className="text-gray-400 hover:text-red-500 ml-1">
                      ×
                    </button>
                  )}
                </div>

                {isProvinceDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-[#EFE9D9] rounded-2xl shadow-xl max-h-60 overflow-y-auto z-50">
                    {filteredProvincesList.length > 0 ? (
                      filteredProvincesList.map(prov => (
                        <button
                          key={prov.name}
                          onClick={() => handleSelectProvince(prov)}
                          className="w-full text-left px-5 py-3 font-medium text-sm text-[#4A453A] hover:bg-orange-50 hover:text-[#FF8E6E] border-b border-gray-50 last:border-0 transition-colors"
                        >
                          {prov.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-5 py-4 text-center text-sm text-gray-400">ไม่พบชื่อจังหวัดที่ค้นหา</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={userLoc}
              zoom={13}
              options={mapOptions}
              onLoad={onLoadMap}
              onClick={() => setIsProvinceDropdownOpen(false)}
            >
              <Marker position={userLoc} label={{ text: "คุณอยู่ที่นี่", fontWeight: "bold", className: "mt-8 bg-white px-2 py-1 rounded-lg shadow-sm" }} />
              
              {filteredPlaces.map((place, idx) => (
                place.lat && place.lng && (
                  <Marker 
                    key={place.id} 
                    position={{ lat: place.lat, lng: place.lng }} 
                    label={{ text: `${idx + 1}`, color: "white", fontWeight: "bold" }}
                    onClick={() => scrollToCard(place.id)}
                  />
                )
              ))}
            </GoogleMap>
          </motion.div>
        )}

        {/* Dropdown คัดกรองระยะทาง */}
        {!loading && !calculating && places.length > 0 && (
          <div className="flex items-center gap-4 mb-10 bg-white p-5 rounded-[2rem] shadow-sm border border-[#EFE9D9]">
            <div className="relative w-full">
              <label className="text-xs font-bold text-gray-400 mb-1 block ml-2 text-left">กรองจากรายการโปรดของคุณ</label>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-[#4A453A] hover:border-[#FF8E6E] transition-colors"
              >
                <span className="flex items-center gap-2 text-left">
                  <Filter size={18} className="text-[#FF8E6E]" />
                  {distanceOptions.find(opt => opt.value === selectedDistance)?.label}
                </span>
                <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 w-full mt-2 bg-white border border-[#EFE9D9] rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    {distanceOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setSelectedDistance(opt.value); setIsDropdownOpen(false); }}
                        className={`w-full text-left px-5 py-4 font-medium transition-colors border-b border-gray-50 last:border-0 ${
                          selectedDistance === opt.value ? 'bg-orange-50 text-[#FF8E6E] font-bold' : 'text-[#7E7869] hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {(loading || calculating) && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[3rem] border border-dashed border-[#EFE9D9]">
            <Loader2 className="w-16 h-16 text-[#FF8E6E] animate-spin mb-4" />
            <h2 className="text-2xl font-black text-[#4A453A]">
              {calculating ? 'กำลังคำนวณเส้นทาง...' : 'กำลังดึงรายการโปรด...'}
            </h2>
            <p className="text-[#7E7869] mt-2 italic text-center">ระบบกำลังตรวจสอบพิกัดสถานที่ที่คุณบันทึกไว้</p>
          </div>
        )}

        {/* --- โหมดแสดง Timeline Journey --- */}
        {!loading && !calculating && filteredPlaces.length > 0 && (
          <div className="relative mt-12 pl-4 md:pl-8">
            <div className="absolute left-[41px] md:left-[57px] top-10 bottom-10 w-2 bg-gradient-to-b from-[#FF8E6E] via-[#FFB385] to-[#4A453A] rounded-full opacity-30" />

            <div className="flex items-start gap-4 md:gap-8 mb-16 relative z-10">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#FF8E6E] text-white rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-[#FDF8F1] shrink-0">
                <MapPin size={28} />
              </div>
              <div className="pt-2 md:pt-4 bg-white px-6 py-4 rounded-[2rem] shadow-sm border border-[#EFE9D9] flex-1">
                <h3 className="text-xl md:text-2xl font-black text-[#4A453A]">จุดเริ่มต้น (พิกัดปัจจุบัน)</h3>
                <div className="flex items-center gap-2 mt-2 text-green-500 font-bold text-sm">
                  <CheckCircle2 size={16} /> ระบุตำแหน่งสำเร็จ
                </div>
              </div>
            </div>

            <div className="space-y-16">
              <AnimatePresence mode="popLayout">
                {filteredPlaces.map((place, index) => {
                  const isUnknown = place.distance === 9999;
                  const prevDist = index === 0 ? 0 : filteredPlaces[index - 1].distance;
                  const distFromPrev = isUnknown ? null : parseFloat((place.distance - prevDist).toFixed(1));
                  // คำนวณเวลาเดินทางคร่าวๆ (ระยะทางกิโลเมตร x 3 นาทีโดยเฉลี่ย)
                  const estimatedMinutes = distFromPrev ? Math.round(distFromPrev * 3) : 0;
                  
                  return (
                    <motion.div 
                      id={`timeline-card-${place.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      key={place.id} 
                      className="relative flex items-start gap-4 md:gap-8 z-10"
                    >
                      {!isUnknown && distFromPrev > 0 && (
                        <div className="absolute -top-10 left-[20px] md:left-[36px] bg-white text-[#FF8E6E] px-3 py-1.5 rounded-full text-xs md:text-sm font-black shadow-md border border-[#EFE9D9] flex items-center gap-1 z-20">
                          <ArrowDown size={14} /> +{distFromPrev} กม. <span className="text-gray-400 font-medium ml-1">(ประมาณ {estimatedMinutes} นาที)</span>
                        </div>
                      )}

                      <div className={`w-16 h-16 md:w-20 md:h-20 bg-white border-[5px] rounded-full flex flex-col items-center justify-center shadow-lg shrink-0 mt-4 relative z-10 transition-colors
                        ${activeCardId === place.id ? 'border-[#4A453A] text-[#4A453A] scale-110' : 'border-[#FF8E6E] text-[#FF8E6E]'}`}>
                        <span className="text-xs font-bold text-gray-400">ลำดับ</span>
                        <span className="text-2xl font-black leading-none">{index + 1}</span>
                      </div>

                      <div className={`flex-1 bg-white rounded-[2rem] p-6 shadow-sm transition-all border group mt-2 relative z-10
                        ${activeCardId === place.id ? 'border-[#4A453A] ring-4 ring-[#4A453A]/20 scale-[1.02]' : 'border-[#EFE9D9] hover:shadow-xl'}`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <h3 className="text-xl md:text-2xl font-black text-[#2D2A26] line-clamp-2">{place.placeName}</h3>
                          <span className={`shrink-0 font-black text-lg px-4 py-2 rounded-xl ${isUnknown ? 'bg-gray-100 text-gray-400 text-sm' : 'bg-orange-50 text-[#FF8E6E]'}`}>
                            {isUnknown ? 'ไม่ทราบพิกัด' : `${place.distance} กม.`}
                          </span>
                        </div>

                        <p className="text-sm text-[#AFA99B] line-clamp-2 mb-6 flex items-start gap-2">
                          <MapPin className="shrink-0 mt-0.5" size={16} /> {place.address}
                        </p>

                        <div className="flex flex-wrap gap-3">
                          <button 
                            // ใช้ Google Maps API URL แบบใหม่เพื่อนำทางไปพิกัดที่ถูกต้อง
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lng}&destination=${place.lat},${place.lng}&destination_place_id=${place.placeId}`, '_blank')}
                            className="flex-1 py-3 bg-[#4A453A] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#FF8E6E] transition-colors shadow-md active:scale-95"
                          >
                            <Car size={18} /> นำทางไปที่นี่
                          </button>
                          <button 
                            onClick={() => navigate(`/g-place/${place.placeId}`)}
                            className="px-6 py-3 bg-gray-100 text-[#7E7869] rounded-xl font-bold flex items-center justify-center hover:bg-orange-50 hover:text-[#FF8E6E] transition-colors"
                          >
                            รายละเอียด
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            <motion.div 
              layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex items-start gap-4 md:gap-8 mt-16 relative z-10"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#4A453A] text-white rounded-full flex items-center justify-center shadow-xl border-4 border-[#FDF8F1] shrink-0">
                <Flag size={28} />
              </div>
              <div className="pt-2 md:pt-4 text-left">
                <h3 className="text-2xl font-black text-[#4A453A]">จบทริปรายการโปรด</h3>
                <p className="text-[#7E7869] font-medium mb-4">เดินทางปลอดภัย มีความสุขกับทุกที่ที่ไปนะครับ!</p>
                
                {/* 🌟 ปุ่มใหม่: เปิดแอปนำทางแบบแวะรวดเดียวจบทริป */}
                {filteredPlaces.length > 1 && (
                  <button 
                    onClick={openMultiStopRouteInGoogleMaps}
                    className="inline-flex items-center gap-2 bg-[#FF8E6E] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#ff7a54] transition-all active:scale-95"
                  >
                    <Navigation size={18} /> เปิดนำทางแวะทุกที่ในทริปนี้
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* กรณีไม่มีข้อมูล */}
        {!loading && !calculating && (
          <>
            {places.length === 0 ? (
              <div className="text-center py-20 bg-white/50 rounded-[3rem] border border-dashed border-[#EFE9D9] mt-10">
                <Heart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-black text-[#4A453A]">ยังไม่มีรายการที่บันทึกไว้</h2>
                <p className="text-[#7E7869] mt-2 mb-8 px-4">ค้นหาสถานที่ที่คุณประทับใจ แล้วกด ❤️ เพื่อนำมาวางแผนที่นี่</p>
                <button onClick={() => navigate('/')} className="px-10 py-4 bg-[#4A453A] text-white rounded-2xl font-bold hover:bg-[#FF8E6E] transition-all shadow-lg active:scale-95">
                  ไปค้นหาสถานที่กัน!
                </button>
              </div>
            ) : filteredPlaces.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white/50 rounded-[3rem] border border-[#EFE9D9] mt-10">
                <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-[#4A453A]">ไม่พบรายการในระยะ {selectedDistance} กม.</h2>
                <p className="text-[#7E7869] mt-2 px-4">ลองเลือก "รายการโปรดทั้งหมด" หรือขยายระยะทางดูนะครับ</p>
              </motion.div>
            ) : null}
          </>
        )}

      </main>
    </div>
  );
}