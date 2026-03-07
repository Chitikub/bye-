// components/CategoryChip.jsx
export default function CategoryChip({ category }) {
  // กำหนดไอคอนตามชื่อประเภทที่ได้รับมาจาก Backend
  const categoryIcons = {
    "ธรรมชาติ": "🌿",
    "คาเฟ่": "☕",
    "วัด": "🛕",
    "ชายหาด": "🏖️",
    "ภูเขา": "⛰️",
    "สวนสาธารณะ": "🌳",
    "ร้านอาหาร": "🍽️"
  };

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-[#E2DCCB]/50 shadow-sm text-xs font-bold text-[#4A453A] transition-all hover:bg-white hover:shadow-md">
      <span>{categoryIcons[category] || "📍"}</span>
      {category}
    </span>
  );
}