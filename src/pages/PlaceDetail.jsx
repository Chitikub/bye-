'use client';
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPin, ArrowLeft, Star, Heart, Share2, Navigation, MessageCircle, Send } from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";

export default function PlaceDetail() {
  const { id } = useParams(); // id ของสถานที่จาก URL
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const [reviews, setReviews] = useState([]); 
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ฟังก์ชันดึง Token จาก Cookie
  const getToken = () => {
    return document.cookie.split("; ").find(row => row.startsWith("token="))?.split("=")[1];
  };

  const fetchData = async () => {
    try {
      // 1. ดึงข้อมูลสถานที่เฉพาะ ID นี้
      const placeRes = await api.get(`/places/${id}`);
      const placeData = placeRes.data.place || placeRes.data;
      setPlace(placeData);

      // 2. ดึงรีวิวเฉพาะของสถานที่นี้ (แยกตาม id)
      const reviewRes = await api.get(`/reviews/place/${id}`);
      setReviews(reviewRes.data.reviews || []);

      // 3. ตรวจสอบสถานะ Favorite
      const favorites = JSON.parse(localStorage.getItem("user_favorites") || "[]");
      setIsFavorite(favorites.some(fav => fav.id === (placeData._id || placeData.id)));
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // คำนวณดาวเฉลี่ยแยกตามสถานที่
  const calculateRealAverageRating = () => {
    if (!reviews || reviews.length === 0) return "0.0";
    const total = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();

    if (!token) return Swal.fire("กรุณาเข้าสู่ระบบ", "คุณต้อง Login ก่อนเพื่อรีวิว", "warning");
    if (userRating === 0) return Swal.fire("แจ้งเตือน", "กรุณาให้คะแนนดาว", "info");
    if (!comment.trim()) return Swal.fire("แจ้งเตือน", "กรุณาพิมพ์ข้อความรีวิว", "info");

    setIsSubmitting(true);
    try {
      await api.post(`/reviews`, {
        placeId: id,
        rating: userRating,
        comment: comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({ title: "รีวิวสำเร็จ!", icon: "success", timer: 1500, showConfirmButton: false });
      setComment("");
      setUserRating(0);
      fetchData(); 
    } catch (error) {
      Swal.fire("ผิดพลาด", error.response?.data?.message || "ไม่สามารถส่งรีวิวได้", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFavorite = () => {
    if (!place) return;
    const favorites = JSON.parse(localStorage.getItem("user_favorites") || "[]");
    const placeId = place._id || place.id;
    let newFavorites = isFavorite ? favorites.filter(fav => fav.id !== placeId) : [{ id: placeId, ...place }, ...favorites];
    localStorage.setItem("user_favorites", JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new Event("authChange"));
  };

  // 🌟 ฟังก์ชันเปิดลิงก์และบันทึกประวัติการนำทาง
  const handleOpenLink = () => {
    const targetUrl = place?.googleMapsUrl || place?.mapUrl;
    if (!targetUrl) return Swal.fire("ไม่พบลิงก์", "สถานที่นี้ยังไม่ได้ระบุพิกัด", "error");

    try {
      // 1. ดึงประวัติเดิมจาก LocalStorage
      const history = JSON.parse(localStorage.getItem("navigation_history") || "[]");
      const placeId = place._id || place.id;
      
      // 2. สร้างข้อมูลที่จะบันทึก
      const newHistoryItem = {
        id: placeId,
        name: place.name,
        image: place.image,
        category: place.category,
        description: place.description,
        googleMapsUrl: targetUrl,
        date: new Date().toLocaleDateString('th-TH'), // บันทึกวันที่ปัจจุบันรูปแบบไทย
      };

      // 3. กรองอันซ้ำออกและเอาอันล่าสุดไว้บนสุด
      const filteredHistory = history.filter(item => item.id !== placeId);
      const newHistory = [newHistoryItem, ...filteredHistory];

      // 4. บันทึกลง LocalStorage
      localStorage.setItem("navigation_history", JSON.stringify(newHistory));

      // 5. แจ้งส่วนอื่นๆ ของแอปให้รับรู้การเปลี่ยนแปลง (เช่น Navbar)
      window.dispatchEvent(new Event("authChange"));
    } catch (err) {
      console.error("Save History Error:", err);
    }

    // 6. เปิด Google Maps
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F1]">
      <div className="animate-bounce bg-[#FF8E6E] p-4 rounded-full shadow-lg">
        <Heart className="text-white fill-white" size={32} />
      </div>
    </div>
  );

  const mood = ((score) => {
    if (score >= 21) return { label: "มีความสุข", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" };
    if (score >= 17) return { label: "โกรธ", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" };
    if (score >= 13) return { label: "เบื่อ", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" };
    if (score >= 9) return { label: "เศร้า", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100" };
    return { label: "เครียด", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" };
  })(place?.rating || 0);

  return (
    <div className="min-h-screen bg-[#FDF8F1] font-['Prompt'] text-[#4A453A] pb-20 pt-10">
      <div className="container mx-auto px-5">
        <div className="relative h-[45vh] md:h-[60vh] w-full overflow-hidden rounded-[3rem] shadow-2xl">
          <img src={place.image} className="w-full h-full object-cover" alt={place.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
            <button onClick={() => navigate(-1)} className="p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:bg-[#FF8E6E] hover:text-white transition-all"><ArrowLeft size={24} /></button>
            <button className="p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:bg-white transition-all"><Share2 size={24} /></button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-5 -mt-20 relative z-30 space-y-8 max-w-6xl">
        <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(74,69,58,0.1)] border border-white">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <div className={`inline-flex items-center px-4 py-1.5 rounded-2xl border ${mood.border} ${mood.bg} ${mood.color} text-sm font-bold mb-5 shadow-sm`}>✨ เหมาะสำหรับอารมณ์{mood.label}</div>
              <h1 className="text-4xl md:text-6xl font-black text-[#2D2A26] mb-4 leading-tight">{place.name}</h1>
              <div className="flex items-center gap-3 text-[#7E7869] font-medium bg-gray-50 px-4 py-2 rounded-2xl w-fit"><MapPin size={18} className="text-[#FF8E6E]" /><span>{place.category} • นครปฐม</span></div>
            </div>
            
            <div className="flex flex-row md:flex-col items-center gap-4 bg-[#2D2A26] p-7 rounded-[2.5rem] text-white min-w-[160px] justify-center shadow-xl">
              <Star className="fill-[#FF8E6E] text-[#FF8E6E]" size={32} />
              <div className="text-center">
                <div className="text-5xl font-black">{calculateRealAverageRating()}</div>
                <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">จาก {reviews.length} รีวิว</div>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <h3 className="text-2xl font-black text-[#2D2A26] flex items-center gap-2"><div className="w-2 h-8 bg-[#FF8E6E] rounded-full" /> รายละเอียดพิกัด</h3>
            <p className="text-lg text-[#7E7869] leading-relaxed font-medium">{place.description}</p>
          </div>
          <div className="mt-12 flex flex-col sm:flex-row gap-5">
            <button onClick={handleOpenLink} className="flex-1 bg-[#FF8E6E] text-white py-5 px-8 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] transition-all"><Navigation size={24} /> ไปยังลิงก์ข้อมูล/นำทาง</button>
            <button onClick={toggleFavorite} className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-center gap-3 font-bold ${isFavorite ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-white border-gray-100 text-[#4A453A]'}`}><Heart size={28} className={isFavorite ? 'fill-rose-500' : ''} /> {isFavorite ? 'บันทึกแล้ว' : 'ถูกใจ'}</button>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-lg border border-white">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-[#2D2A26] flex items-center gap-3"><MessageCircle className="text-[#FF8E6E]" size={28} /> รีวิวและความคิดเห็น</h3>
            <span className="bg-gray-100 px-4 py-1 rounded-full text-sm font-bold text-gray-500">{reviews.length} รีวิว</span>
          </div>

          <form onSubmit={handleReviewSubmit} className="bg-[#FDF8F1] p-8 rounded-[2.5rem] mb-12 border border-[#EFE9D9] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#FF8E6E]" />
            <p className="font-black text-xl mb-6 text-[#2D2A26]">คุณคิดเห็นอย่างไรกับที่นี่? ✍️</p>
            <div className="flex gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={`star-input-${star}`} type="button" onClick={() => setUserRating(star)} className="transition-all hover:scale-125 active:scale-90"><Star size={36} className={star <= userRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} /></button>
              ))}
            </div>
            <div className="relative">
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="บอกเล่าความรู้สึกของคุณที่นี่..." className="w-full p-6 rounded-[1.5rem] border-none outline-none focus:ring-4 focus:ring-[#FF8E6E]/20 min-h-[140px] text-[#4A453A] text-lg bg-white shadow-inner" />
              <button disabled={isSubmitting} type="submit" className="absolute bottom-4 right-4 bg-[#2D2A26] text-white p-4 rounded-2xl shadow-lg hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 font-bold">ส่งรีวิว <Send size={18} /></button>
            </div>
          </form>

          <div className="space-y-8">
            {reviews.length > 0 ? (
              reviews.map((rev) => {
                const displayName = rev.userId?.username || rev.userId?.email?.split('@')[0] || "ผู้ใช้งาน";
                return (
                  <div key={`review-${rev._id}`} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#FF8E6E]/10 rounded-full flex items-center justify-center font-black text-[#FF8E6E]">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-[#2D2A26]">{displayName}</div>
                          <div className="text-xs text-[#AFA99B] font-bold">
                            {new Date(rev.createdAt).toLocaleDateString('th-TH', {
                              year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={`star-item-${rev._id}-${i}`} size={16} className={i < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[#7E7869] leading-relaxed pl-1">{rev.comment}</p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                <p className="text-[#AFA99B] font-bold italic text-lg">สถานที่นี้ยังไม่มีรีวิว มาเริ่มเขียนคนแรกกัน!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}