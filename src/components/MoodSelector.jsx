// src/components/MoodSelector.jsx
export default function MoodSelector({ onSelectMood }) {
  const moods = [
    { id: "happy", label: "มีความสุข", emoji: "😁", color: "#FF8E6E" },
    { id: "bored", label: "เบื่อ", emoji: "😫", color: "#FFB385" },
    { id: "angry", label: "โกรธ", emoji: "😡", color: "#FF4D4D" },
    { id: "stressed", label: "เครียด", emoji: "🤯", color: "#A855F7" },
    { id: "sad", label: "เศร้า", emoji: "😢", color: "#60A5FA" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {moods.map((mood) => (
        <button
          key={mood.id}
          // ส่ง mood.id แทน mood.label เพื่อไป map กับ keyword ได้ง่าย
          onClick={() => onSelectMood(mood.id)} 
          className="group flex flex-col items-center justify-center bg-white border border-gray-100 rounded-[2rem] p-6 w-32 h-32 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
        >
          <span className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
            {mood.emoji}
          </span>
          <span className="text-sm font-bold text-[#4A453A]">
            {mood.label}
          </span>
        </button>
      ))}
    </div>
  );
}