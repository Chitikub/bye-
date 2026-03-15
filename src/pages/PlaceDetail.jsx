'use client';
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPin, ArrowLeft, Star, Heart, Share2, Navigation, MessageCircle, Send, AlertCircle } from "lucide-react";
import api, { IMAGE_BASE_URL } from "@/api/axios"; 
import Swal from "sweetalert2";
import Cookies from 'js-cookie';


export default function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const [reviews, setReviews] = useState([]); 
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🌟 ฟังก์ชันดึง Token แบบดักทุกทาง (กันเหนียว)
  const getToken = () => {
    return Cookies.get('token') || localStorage.getItem('token');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. ดึงข้อมูลสถานที่
      const placeRes = await api.get(`/places/${id}`);
      const placeData = placeRes.data.place || placeRes.data;
      setPlace(placeData);

      // 2. ดึงรีวิว
      const reviewRes = await api.get(`/reviews/place/${id}`);
      setReviews(reviewRes.data.reviews || []);

      // 3. 🌟 เช็ครายการโปรด (ส่ง Token ไปด้วยเสมอ)
      const token = getToken();
      if (token) {
        try {
          const favRes = await api.get(`/favorites/check/${id}`);
          setIsFavorite(favRes.data.isFavorite);
        } catch (err) {
          console.error("Favorite Check Failed:", err);
        }
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setPlace(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const calculateRealAverageRating = () => {
    if (!reviews || reviews.length === 0) return "0.0";
    const total = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();

    if (!token) {
      return Swal.fire("กรุณาเข้าสู่ระบบ", "คุณต้อง Login ก่อนเพื่อรีวิว", "warning");
    }
    if (userRating === 0 || !comment.trim()) {
      return Swal.fire("แจ้งเตือน", "กรุณาให้ดาวและพิมพ์ข้อความ", "info");
    }

    setIsSubmitting(true);
    try {
      await api.post(`/reviews`, { placeId: id, rating: userRating, comment: comment });
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

  const toggleFavorite = async () => {
    const token = getToken();
    // 🌟 ตรวจสอบ Token ก่อนส่ง Request
    if (!token) {
      return Swal.fire("กรุณาเข้าสู่ระบบ", "คุณต้อง Login ก่อนเพื่อบันทึกรายการโปรด", "warning");
    }

    try {
      await api.post("/favorites/toggle", { placeId: id });
      setIsFavorite(!isFavorite);
      Swal.fire({
        icon: 'success',
        title: !isFavorite ? 'บันทึกรายการโปรดแล้ว' : 'นำออกจากรายการโปรดแล้ว',
        timer: 1000,
        showConfirmButton: false
      });
      window.dispatchEvent(new Event("authChange"));
    } catch (err) {
      console.error("Toggle Favorite Error:", err);
      // หากเกิด 401 ในจังหวะนี้ แสดงว่า Token หมดอายุ
      if (err.response?.status === 401) {
        Swal.fire("เซสชั่นหมดอายุ", "กรุณาเข้าสู่ระบบใหม่อีกครั้ง", "error");
      } else {
        Swal.fire("ผิดพลาด", "ไม่สามารถจัดการรายการโปรดได้", "error");
      }
    }
  };

  const handleOpenLink = () => {
    const targetUrl = place?.googleMapsUrl || place?.mapUrl;
    if (!targetUrl) return Swal.fire("ไม่พบลิงก์", "สถานที่นี้ยังไม่ได้ระบุพิกัด", "error");
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F1]">
      <div className="animate-bounce bg-[#FF8E6E] p-4 rounded-full shadow-lg">
        <Heart className="text-white fill-white" size={32} />
      </div>
    </div>
  );

  if (!place) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF8F1] font-['Prompt'] text-center px-6">
      <AlertCircle size={64} className="text-gray-300 mb-4" />
      <h2 className="text-2xl font-black text-[#4A453A]">ไม่พบข้อมูลสถานที่</h2>
      <button onClick={() => navigate('/')} className="mt-6 bg-[#4A453A] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#FF8E6E] transition-all">กลับหน้าแรก</button>
    </div>
  );

  // 🌟 ฟังก์ชันจัดการ URL รูปภาพให้ฉลาดขึ้น (รองรับทั้ง Array และ String)
  const getValidImageUrl = (placeData) => {
    let imgPath = null;
    if (placeData?.images && placeData.images.length > 0) {
        imgPath = placeData.images[0];
    } else if (placeData?.image) {
        imgPath = placeData.image;
    }

    if (!imgPath || imgPath === "undefined" || imgPath === "null" || imgPath.trim() === "") {
      return "https://placehold.co/800x600/EFE9D9/4A453A?text=No+Image";
    }
    if (imgPath.startsWith('http')) return imgPath;
    return imgPath.startsWith('/') ? `${IMAGE_BASE_URL}${imgPath}` : `${IMAGE_BASE_URL}/${imgPath}`;
  };

  const displayImage = getValidImageUrl(place);

  return (
    <div className="min-h-screen bg-[#FDF8F1] font-['Prompt'] text-[#4A453A] pb-20 pt-10">
      <div className="container mx-auto px-5">
        <div className="relative h-[45vh] md:h-[60vh] w-full overflow-hidden rounded-[3rem] shadow-2xl">
          <img src={displayImage} className="w-full h-full object-cover" alt={place.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
            <button onClick={() => navigate(-1)} className="p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:bg-[#FF8E6E] hover:text-white transition-all"><ArrowLeft size={24} /></button>
            <button className="p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:bg-white transition-all"><Share2 size={24} /></button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-5 -mt-20 relative z-30 space-y-8 max-w-6xl">
        <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-lg border border-white">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-black text-[#2D2A26] mb-4 leading-tight">{place.name}</h1>
              <div className="flex items-center gap-3 text-[#7E7869] font-medium bg-gray-50 px-4 py-2 rounded-2xl w-fit">
                <MapPin size={18} className="text-[#FF8E6E]" />
                <span>{place.category} • นครปฐม</span>
              </div>
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
            <h3 className="text-2xl font-black text-[#2D2A26] flex items-center gap-2"><div className="w-2 h-8 bg-[#FF8E6E] rounded-full" /> รายละเอียดสถานที่</h3>
            <p className="text-lg text-[#7E7869] leading-relaxed font-medium">{place.description}</p>
          </div>
          <div className="mt-12 flex flex-col sm:flex-row gap-5">
            <button onClick={handleOpenLink} className="flex-1 bg-[#FF8E6E] text-white py-5 px-8 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] transition-all"><Navigation size={24} /> ไปยัง Google Maps</button>
            <button onClick={toggleFavorite} className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-center gap-3 font-bold ${isFavorite ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-white border-gray-100 text-[#4A453A]'}`}>
              <Heart size={28} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} /> 
              {isFavorite ? 'บันทึกแล้ว' : 'ถูกใจ'}
            </button>
          </div>
        </div>

        {/* --- ส่วนรีวิวคงเดิม --- */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-lg border border-white">
           {/* ... (โค้ดส่วนรีวิวเหมือนเดิมที่คุณมี) ... */}
           <h3 className="text-2xl font-black text-[#2D2A26] mb-8 flex items-center gap-3"><MessageCircle className="text-[#FF8E6E]" size={28} /> รีวิวและความคิดเห็น ({reviews.length})</h3>
           
           <form onSubmit={handleReviewSubmit} className="mb-12 space-y-6">
              <div className="flex gap-2">
                {[1,2,3,4,5].map(s => <Star key={s} size={30} onClick={() => setUserRating(s)} className={`cursor-pointer ${s <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full p-6 bg-gray-50 rounded-2xl outline-none" placeholder="เขียนรีวิวที่นี่..." />
              <button type="submit" disabled={isSubmitting} className="bg-[#2D2A26] text-white px-8 py-3 rounded-xl font-bold">ส่งรีวิว</button>
           </form>

           <div className="space-y-6">
              {reviews.map(r => (
                <div key={r._id} className="p-6 bg-gray-50 rounded-3xl">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold">{r.userId?.username || "User"}</span>
                    <div className="flex tracking-tighter">
                      {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                  </div>
                  <p className="text-gray-600">{r.comment}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}