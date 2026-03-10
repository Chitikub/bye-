// DetailCard.jsx
"use client";
import { motion } from "framer-motion";
import {
  X,
  Map as MapIcon,
  ExternalLink,
  AlignLeft,
  Star,
  Navigation,
  Edit3,
} from "lucide-react";
import CategoryChip from "./Category"; // ปรับ path ให้ตรงกับที่ CategoryChip อยู่

export default function DetailCard({ place, onClose, onEdit }) {
  if (!place) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10 bg-[#4A453A]/60 backdrop-blur-lg">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[4rem] w-full max-w-5xl h-fit max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border-[12px] border-white"
      >
        {/* ฝั่งรูปภาพ (ซ้าย/บน) */}
        <div className="w-full md:w-1/2 h-72 md:h-auto relative">
          <img
            src={place.image}
            className="w-full h-full object-cover"
            alt={place.name}
            onError={(e) => {
              e.target.src = "https://placehold.co/600x800?text=No+Image";
            }}
          />
          <div className="absolute top-8 left-8">
            <CategoryChip category={place.category} />
          </div>
        </div>

        {/* ฝั่งเนื้อหา (ขวา/ล่าง) */}
        <div className="w-full md:w-1/2 p-10 md:p-16 overflow-y-auto flex flex-col bg-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-4xl font-black text-[#4A453A] mb-2 leading-tight">
                {place.name}
              </h2>
              <div className="flex items-center gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < (place.rating || 5) ? "currentColor" : "none"}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-[#FDF8F1] p-3 rounded-full hover:bg-red-50 text-[#4A453A] hover:text-red-500 transition-all shadow-sm"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-8 flex-1">
            <div className="bg-[#FDF8F1]/50 p-8 rounded-[2.5rem] border border-[#EFE9D9]/50">
              <h4 className="flex items-center gap-2 font-black text-[#FF8E6E] text-xl mb-4">
                <AlignLeft size={22} /> รายละเอียดสถานที่
              </h4>
              <p className="text-[#4A453A] text-lg leading-relaxed opacity-90 whitespace-pre-line font-medium">
                {place.description || "ไม่มีข้อมูลคำอธิบายสำหรับสถานที่นี้"}
              </p>
            </div>

            {place.mapUrl && (
              <div className="space-y-4">
                <h4 className="font-black text-[#4A453A] flex items-center gap-2 text-lg">
                  <Navigation size={18} className="text-[#FF8E6E]" />{" "}
                  ตำแหน่งที่ตั้ง
                </h4>
                <a
                  href={place.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-3 bg-white border-2 border-[#FF8E6E]/20 py-4 rounded-2xl font-bold text-[#FF8E6E] hover:bg-[#FF8E6E] hover:text-white transition-all shadow-sm group"
                >
                  <ExternalLink size={20} />
                  ดูบน Google Maps
                </a>
              </div>
            )}
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100 flex gap-4">
            <button
              onClick={() => onEdit(place)}
              className="flex-1 bg-[#4A453A] text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-lg"
            >
              <Edit3 size={20} /> แก้ไขข้อมูลนี้
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
