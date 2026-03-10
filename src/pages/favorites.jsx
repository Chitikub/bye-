import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Heart, 
  Clock, 
  ChevronLeft, 
  Trash2, 
  ArrowRight, 
  Navigation, 
  Sparkles,
  Calendar,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import CategoryChip from "@/components/Category"; 

export default function UserActivityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const isFavoritePage = location.pathname === '/favorites';
  const MAX_LIMIT = 10; 

  useEffect(() => {
    setIsVisible(true);
    fetchData();
  }, [location.pathname]);

  const fetchData = () => {
    const storageKey = isFavoritePage ? "user_favorites" : "navigation_history";
    const storedData = localStorage.getItem(storageKey);
    
    if (storedData) {
      let parsedData = JSON.parse(storedData);
      
      if (parsedData.length > MAX_LIMIT) {
        parsedData = parsedData.slice(0, MAX_LIMIT);
        localStorage.setItem(storageKey, JSON.stringify(parsedData));
      }
      
      setData(parsedData);
    } else {
      setData([]);
    }
    setLoading(false);
  };

  // 🌟 ฟังก์ชันจัดการการนำทาง (Logic เหมือนหน้า Place Detail)
  const handleNavigate = (item) => {
    const targetUrl = item.googleMapsUrl || item.mapUrl;
    if (!targetUrl) return Swal.fire("ไม่พบลิงก์", "สถานที่นี้ยังไม่ได้ระบุพิกัด", "error");

    // 1. บันทึกลงประวัติการนำทางในเครื่อง (localStorage)
    const history = JSON.parse(localStorage.getItem("navigation_history") || "[]");
    const now = new Date().toLocaleDateString('th-TH'); // บันทึกวันที่รูปแบบ DD/MM/YYYY
    
    // กรองอันเก่าออกถ้ามีซ้ำ เพื่อเลื่อนขึ้นมาเป็นอันล่าสุด
    const filteredHistory = history.filter(h => h.id !== item.id);
    const newHistory = [{ ...item, date: now }, ...filteredHistory];
    
    // เก็บประวัติ (จำกัด 10 รายการล่าสุด)
    localStorage.setItem("navigation_history", JSON.stringify(newHistory.slice(0, 10)));
    
    // 2. ถ้าอยู่หน้าประวัติ ให้รีเฟรชข้อมูลในหน้าด้วย
    if (!isFavoritePage) {
        fetchData();
    }

    // 3. ส่งสัญญาณบอก Navbar หรือส่วนอื่นๆ ของแอป
    window.dispatchEvent(new Event("authChange"));

    // 4. เปิดแผนที่ไปยังหน้าต่างใหม่
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const handleDelete = (id, name) => {
    const title = isFavoritePage ? 'เลิกกดหัวใจ?' : 'ลบประวัติการเดินทาง?';
    const text = isFavoritePage 
      ? `คุณต้องการนำ "${name}" ออกจากรายการโปรดใช่หรือไม่?` 
      : `รายการนี้จะหายไปจากประวัติของคุณ`;

    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF8E6E',
      cancelButtonColor: '#ccc',
      confirmButtonText: 'ใช่, นำออก',
      cancelButtonText: 'ยกเลิก',
      background: '#FDF8F1',
      customClass: { popup: 'rounded-[30px]' }
    }).then((result) => {
      if (result.isConfirmed) {
        const storageKey = isFavoritePage ? "user_favorites" : "navigation_history";
        const currentData = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const newData = currentData.filter(item => item.id !== id);
        
        localStorage.setItem(storageKey, JSON.stringify(newData));
        setData(newData);
        
        window.dispatchEvent(new Event("authChange"));

        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          showConfirmButton: false,
          timer: 800
        });
      }
    });
  };

  return (
    <main className="min-h-screen w-full bg-[#FDF8F1] pt-32 pb-20 px-4 font-['Prompt',sans-serif]">
      <div className={`max-w-6xl mx-auto transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-4">
            <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-[#7E7869] hover:text-[#FF8E6E] transition-all font-bold">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> ย้อนกลับ
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-[#4A453A]">
              {isFavoritePage ? 'รายการ' : 'ประวัติการ'} <span className="text-[#FF8E6E]">{isFavoritePage ? 'โปรด' : 'นำทาง'}</span>
            </h1>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${data.length >= MAX_LIMIT ? 'bg-red-400' : 'bg-[#FF8E6E]'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.length / MAX_LIMIT) * 100}%` }}
                />
              </div>
              <span className={`text-sm font-black ${data.length >= MAX_LIMIT ? 'text-red-500' : 'text-[#7E7869]'}`}>
                {data.length} / {MAX_LIMIT}
              </span>
            </div>
          </div>
        </div>

        {/* --- Toggle Switch --- */}
        <div className="relative flex bg-[#EFE9D9]/50 backdrop-blur-md p-1.5 rounded-2xl mb-12 h-14 items-center border border-white max-w-[340px] mx-auto md:mx-0">
          <motion.div 
            className="absolute top-1.5 bottom-1.5 rounded-xl shadow-lg bg-gradient-to-r from-[#FF7F67] to-[#FFB385] w-[calc(50%-6px)]"
            initial={false}
            animate={{ x: isFavoritePage ? 0 : '100%' }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <button onClick={() => navigate('/favorites')} className={`relative flex-1 h-full text-sm font-bold z-10 flex items-center justify-center gap-2 ${isFavoritePage ? 'text-white' : 'text-gray-400'}`}>
            <Heart className={`w-4 h-4 ${isFavoritePage ? 'fill-white' : ''}`} /> รายการโปรด
          </button>
          <button onClick={() => navigate('/history')} className={`relative flex-1 h-full text-sm font-bold z-10 flex items-center justify-center gap-2 ${!isFavoritePage ? 'text-white' : 'text-gray-400'}`}>
            <Clock className="w-4 h-4" /> ประวัติ
          </button>
        </div>

        {/* --- Grid Content --- */}
        {loading ? (
          <div className="text-center py-20 font-bold text-[#7E7869] animate-pulse">กำลังโหลดข้อมูล...</div>
        ) : data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {data.map((item) => (
                <motion.div 
                  layout
                  key={item.id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="h-56 relative overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4"><CategoryChip category={item.category} /></div>
                    
                    {!isFavoritePage && item.date && (
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-2 text-xs font-bold text-[#4A453A]">
                        <Calendar className="w-3.5 h-3.5 text-[#FF8E6E]" /> {item.date}
                      </div>
                    )}

                    <button 
                      onClick={() => handleDelete(item.id, item.name)} 
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-lg transition-all active:scale-90"
                    >
                      {isFavoritePage ? <Heart className="w-5 h-5 fill-red-500 text-red-500" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-black text-[#4A453A] mb-3 group-hover:text-[#FF8E6E] transition-colors">{item.name}</h3>
                    <p className="text-[#7E7869] text-sm leading-relaxed mb-8 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <button onClick={() => navigate(`/place/${item.id}`)} className="text-[#FF8E6E] font-black text-sm flex items-center gap-2 group/btn">
                        รายละเอียด <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                      </button>
                      
                      {/* 🌟 ปุ่มนำทางที่เพิ่ม handleNavigate เข้าไป */}
                      <button 
                        onClick={() => handleNavigate(item)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#4A453A] text-white rounded-xl text-xs font-bold hover:bg-[#FF8E6E] transition-colors shadow-lg active:scale-95"
                      >
                        <Navigation className="w-3.5 h-3.5" /> นำทาง
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-20 text-center border border-white shadow-xl">
            <Sparkles className="w-12 h-12 text-[#FF8E6E] mx-auto mb-6 animate-pulse" />
            <h2 className="text-2xl font-black text-[#4A453A] mb-8">ยังไม่มีข้อมูลในส่วนนี้</h2>
            <button onClick={() => navigate("/")} className="bg-[#4A453A] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#FF8E6E] transition-all">ไปสำรวจกันเลย</button>
          </motion.div>
        )}
      </div>
    </main>
  );
}