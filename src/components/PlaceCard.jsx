import CategoryChip from "./Category";

export default function PlaceCard({ place }) {
  return (
    <div className="group overflow-hidden rounded-[32px] bg-white border border-[#E2DCCB] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
      {/* Photo Section */}
      <div className="h-52 w-full bg-[#EFE9D9] relative overflow-hidden">
        {/* แสดงรูปภาพจริงจาก Backend */}
        <img 
          src={place.image || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=500"} 
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* วาง Category Chip ไว้มุมซ้ายบนของรูปภาพ */}
        <div className="absolute top-4 left-4 z-10">
          <CategoryChip category={place.category} />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-black text-[#4A453A] mb-2 group-hover:text-[#FF8E6E] transition-colors">
          {place.name}
        </h3>
        
        <p className="text-sm font-medium text-[#7E7869] line-clamp-2 mb-6 leading-relaxed">
          {place.description}
        </p>
        
        <div className="flex items-center justify-between">
          <button className="text-sm font-black text-[#FF7F67] flex items-center gap-1 group-hover:gap-3 transition-all">
            ดูรายละเอียด <span>→</span>
          </button>
          
          {/* เพิ่มไอคอนหัวใจสำหรับหน้า Favorites ในอนาคต */}
          <button className="text-gray-300 hover:text-[#FF7F67] transition-colors">
            <i className="bi bi-heart text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  );
}