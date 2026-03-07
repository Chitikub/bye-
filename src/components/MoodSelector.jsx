export default function MoodSelector() {
  const moods = [
    { label: "มีความสุข", emoji: "😁", color: "#FF8E6E" },
  { label: "เบื่อ", emoji: "😫", color: "#FFB385" },
  { label: "โกรธ", emoji: "😡", color: "#FF4D4D" },
  { label: "เครียด", emoji: "🤯", color: "#A855F7" },
  { label: "เศร้า", emoji: "😢", color: "#60A5FA" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {moods.map((mood, index) => (
        <button
          key={index}
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