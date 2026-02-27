'use client';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  UserPlus, 
  Settings2, 
  SmilePlus, 
  MapPinCheckInside, 
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export default function GuidePage() {
  const navigate = useNavigate();

  // Animation Variants
  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVars = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const steps = [
      {
        title: "เข้าร่วมกับเรา",
        description: "เข้าสู่ระบบหรือสมัครสมาชิกเพื่อ บันทึกสถานที่โปรด และจดจำอารมณ์ในแต่ละวัน",
        icon: <UserPlus className="w-7 h-7" />,
        color: "4D6EF3",
        gradient: "from-[#4D6EF3] to-[#6A85F7]", 
        lightBg: "bg-[#4D6EF3]/10",
        shadow: "shadow-[#4D6EF3]/30"
      },
    {
      title: "ตั้งค่าโปรไฟล์",
      description: "อัปโหลดรูปและระบุตัวตนของคุณ เพื่อให้ระบบ AI แนะนำพิกัดได้ตรงใจที่สุด",
      icon: <Settings2 className="w-7 h-7" />,
      color: "D82B8E",
      gradient: "from-[#D82B8E] to-[#F45C9C]",
      lightBg: "bg-[#D82B8E]/10",
      shadow: "shadow-[#D82B8E]/30"
    },
    {
      title: "เลือกอารมณ์",
      description: "บอกความรู้สึกตอนนี้ผ่าน Mood Chips หรือพิมพ์ระบายในช่องค้นหา",
      icon: <SmilePlus className="w-7 h-7" />,
      color: "pink",
      gradient: "from-[#F45C9C] to-[#D82B8E]",
      lightBg: "bg-[#D82B8E]/10",
      shadow: "shadow-[#D82B8E]/30"
    },
    {
      title: "รับพิกัดพักใจ",
      description: "เลือกสถานที่ที่แนะนำ แล้วออกเดินทางได้ทันที พร้อมระบบนำทางที่แม่นยำ",
      icon: <MapPinCheckInside className="w-7 h-7" />,
      color: "emerald",
      gradient: "from-[#00A78E] to-[#008C72]",
      lightBg: "bg-[#00A78E]/10",
      shadow: "shadow-[#00A78E]/30"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F1] text-[#1E1B4B] font-['Anuphan',sans-serif] selection:bg-indigo-100 overflow-x-hidden">
      
      {/* --- Background Elements --- */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200/30 rounded-full blur-[120px]" />
      </div>

      {/* --- Header / Nav (เป๊ะตามที่คุณขอ) --- */}
      <nav className="container mx-auto px-6 h-32 flex items-center relative z-50">
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="ml-[18px] mt-[-60px] flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 text-[#4A453A] hover:text-[#FF8E6E] hover:bg-white/60 transition-all font-bold shadow-lg shadow-black/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      </nav>

      <main className="container mx-auto px-6 pt-10 pb-24 relative z-10">
        
        {/* --- Hero Section --- */}
        <section className="max-w-4xl mx-auto text-center mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight text-[#4A4A4A]"
          >
            เปลี่ยนความรู้สึก ให้เป็น <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-purple-600 to-pink-600">
              พิกัดที่ใช่สำหรับคุณ
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            ค้นพบการเดินทางในรูปแบบใหม่ที่ใช้ "หัวใจ" นำทาง <br className="hidden md:block" />
            ผ่าน 4 ขั้นตอนง่ายๆ ที่คุณทำได้ด้วยตัวเอง
          </motion.p>
        </section>

        {/* --- Steps Grid --- */}
        <motion.div 
          variants={containerVars}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24"
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              variants={itemVars}
              whileHover={{ y: -10 }}
              className="group relative bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-white shadow-xl shadow-slate-200/50 flex flex-col items-start transition-all"
            >
              <div className="absolute top-6 right-8 text-8xl font-black text-slate-100 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none">
                {index + 1}
              </div>

              <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${step.gradient} ${step.shadow} flex items-center justify-center text-white mb-8 group-hover:rotate-6 transition-transform`}>
                {step.icon}
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4 text-slate-800">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium mb-6">
                  {step.description}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity tracking-widest">
                  <CheckCircle2 className="w-3 h-3" /> 
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* --- Final CTA --- */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="absolute inset-0 bg-indigo-600 blur-[80px] opacity-10" />
          <div className="relative bg-gradient-to-r from-orange-300 to-orange-400 text-white rounded-[2rem] p-12 text-center shadow-2xl shadow-indigo-200/50">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-32 h-32 text-white" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black text-white mb-8 relative z-10">
              พร้อมที่จะตามหา <br />
              <span className="text-orange-500">พื้นที่พักพิงใจ</span> ของคุณหรือยัง?
            </h2>
            
            <button 
              onClick={() => navigate('/')}
              className="group relative inline-flex items-center gap-3 bg-white text-[#1E1B4B] px-12 py-5 rounded-2xl text-lg font-black shadow-xl hover:bg-indigo-50 transition-all active:scale-95 z-10"
            >
              เริ่มต้นใช้งาน
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}