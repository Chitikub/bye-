import { Link } from "react-router-dom";
import { Star, Tag, Sparkles } from "lucide-react";

export default function PlaceCard({ place }) {
  // 1. จัดการเรื่อง ID ให้รองรับทั้ง id และ _id
  const placeId = place.id || place._id;
  
  // 2. ปรับปรุงรูปภาพสำรองให้เสถียรขึ้นเพื่อแก้ Error net::ERR_NAME_NOT_RESOLVED
  const noImageURL = "https://placehold.co/400x300?text=No+Image";

  // 3. เลือกรูปภาพที่จะแสดง (เช็คทั้ง Array และ String)
  const displayImage = (place.images && place.images.length > 0) 
    ? place.images[0] 
    : (place.image || noImageURL);

  // 4. ดึงคะแนน Rating (ใช้ averageRating จาก JSON จริง)
  const rating = place.averageRating || place.rating || "0.0";
  
  // 5. ตรวจสอบข้อมูล Workshop (ต้องมีข้อมูลและไม่เป็นค่าว่าง)
  const hasWorkshop = place.workshop && place.workshop.trim() !== "";

  return (
    <Link to={`/place/${placeId}`} className="group block">
      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#EFE9D9] group-hover:-translate-y-2">
        
        {/* ส่วนรูปภาพและ Badge ด้านบน */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={displayImage} 
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          />
          
          {/* Badge ประเภท (ซ้ายบน) */}
          <div className="absolute top-4 left-4 bg-[#2D2A26]/80 backdrop-blur-md text-white px-4 py-1.5 rounded-2xl flex items-center gap-2 shadow-lg border border-white/20">
            <Tag size={14} className="text-[#FF8E6E]" />
            <span className="text-xs font-black tracking-wide">{place.category}</span>
          </div>

          {/* Badge คะแนนดาว (ขวาบน) */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl border border-orange-50">
            <Star size={16} className="fill-[#FF8E6E] text-[#FF8E6E]" />
            <span className="text-sm font-black text-[#2D2A26]">{rating}</span>
          </div>
        </div>
        
        {/* ส่วนข้อมูลเนื้อหา */}
        <div className="p-6 space-y-4">
          <h3 className="font-black text-xl text-[#2D2A26] line-clamp-1 group-hover:text-[#FF8E6E] transition-colors duration-300">
            {place.name}
          </h3>
          
          {/* 🌟 แสดงเฉพาะ Workshop เท่านั้น ถ้าไม่มีข้อมูลจะไม่แสดงอะไรเลย */}
          {hasWorkshop && (
            <div className="flex items-start gap-2 text-sm font-bold p-4 rounded-2xl border bg-orange-50 border-orange-200 text-[#FF8E6E] shadow-inner transition-all">
              <Sparkles size={18} className="shrink-0 animate-pulse text-[#FF8E6E]" />
              <span className="line-clamp-2">Workshop: {place.workshop}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}