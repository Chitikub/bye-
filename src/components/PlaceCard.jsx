import { Link } from "react-router-dom";
import { Star, Tag, Sparkles } from "lucide-react";
// 🌟 1. ต้อง Import ตัวแปร URL ของ Backend เข้ามาด้วย
import { IMAGE_BASE_URL } from "@/api/axios";

export default function PlaceCard({ place }) {
  const placeId = place.id || place._id;
  const noImageURL = "https://placehold.co/400x300?text=No+Image";

  // 🌟 2. ปรับฟังก์ชันดึงรูปภาพให้เอา URL Backend ไปแปะหน้าชื่อไฟล์
  const getImageUrl = () => {
    const rawPath = place.images?.[0] || place.image;

    if (!rawPath || rawPath.includes('undefined')) {
        return "https://placehold.co/600x400?text=No+Image";
    }

    // ถ้ารูปเป็น http อยู่แล้ว (เช่นรูปจากเน็ต) ให้ใช้เลย
    if (rawPath.startsWith('http')) return rawPath;

    // ถ้าเป็น Path จากเครื่อง (/uploads/...) ให้ต่อด้วย URL ของ Render
    return `${IMAGE_BASE_URL}${rawPath.startsWith('/') ? '' : '/'}${rawPath}`;
};

const displayImage = getImageUrl();

  const rating = place.averageRating || place.rating || "0.0";
  const hasWorkshop = place.workshop && place.workshop.trim() !== "";

  return (
    <Link to={`/place/${placeId}`} className="group block">
      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#EFE9D9] group-hover:-translate-y-2">
        
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={displayImage} 
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => { e.target.src = noImageURL; }} // 🌟 3. กันเหนียว ถ้ารูปในเซิร์ฟเวอร์พัง ให้โชว์ภาพสำรอง 
          />
          
          <div className="absolute top-4 left-4 bg-[#2D2A26]/80 backdrop-blur-md text-white px-4 py-1.5 rounded-2xl flex items-center gap-2 shadow-lg border border-white/20">
            <Tag size={14} className="text-[#FF8E6E]" />
            <span className="text-xs font-black tracking-wide">{place.category}</span>
          </div>

          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl border border-orange-50">
            <Star size={16} className="fill-[#FF8E6E] text-[#FF8E6E]" />
            <span className="text-sm font-black text-[#2D2A26]">{rating}</span>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <h3 className="font-black text-xl text-[#2D2A26] line-clamp-1 group-hover:text-[#FF8E6E] transition-colors duration-300">
            {place.name}
          </h3>
          
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