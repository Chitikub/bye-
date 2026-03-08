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
  Sparkles
} from "lucide-react";

export default function GuidePage() {
  const navigate = useNavigate();

  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1, 
        delayChildren: 0.2 
      }
    }
  };

  const itemVars = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.5, ease: "easeOut" } 
    }
  };

  const steps = [
    {
      title: "เข้าร่วมกับเรา",
      description: "เข้าสู่ระบบหรือสมัครสมาชิกเพื่อ บันทึกสถานที่โปรด และจดจำอารมณ์ในแต่ละวัน",
      icon: <UserPlus className="w-7 h-7" />,
      gradient: "from-[#4D6EF3] to-[#6A85F7]",
      shadow: "shadow-[#4D6EF3]/30"
    },
    {
      title: "ตั้งค่าโปรไฟล์",
      description: "อัปโหลดรูปและระบุตัวตนของคุณ เพื่อให้ระบบ AI แนะนำพิกัดได้ตรงใจที่สุด",
      icon: <Settings2 className="w-7 h-7" />,
      gradient: "from-[#D82B8E] to-[#F45C9C]",
      shadow: "shadow-[#D82B8E]/30"
    },
    {
      title: "เลือกอารมณ์",
      description: "บอกความรู้สึกตอนนี้ผ่าน Mood Chips หรือพิมพ์ระบายในช่องค้นหา",
      icon: <SmilePlus className="w-7 h-7" />,
      gradient: "from-[#F45C9C] to-[#D82B8E]",
      shadow: "shadow-[#D82B8E]/30"
    },
    {
      title: "รับพิกัดพักใจ",
      description: "เลือกสถานที่ที่แนะนำ แล้วออกเดินทางได้ทันที พร้อมระบบนำทางที่แม่นยำ",
      icon: <MapPinCheckInside className="w-7 h-7" />,
      gradient: "from-[#00A78E] to-[#008C72]",
      shadow: "shadow-[#00A78E]/30"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F1] text-[#1E1B4B] font-['Kanit',sans-serif] selection:bg-indigo-100 overflow-x-hidden">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap');
        * { font-family: 'Kanit', sans-serif; }
      `}</style>

      {/* Background Blur Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[40%] bg-indigo-200/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[50%] h-[40%] bg-pink-200/15 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="container mx-auto px-6 h-20 sm:h-32 flex items-center relative z-50">
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 text-[#4A453A] hover:text-[#FF8E6E] hover:bg-white transition-all font-bold shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" /> 
          <span style={{ fontSize: '18px' }}>ย้อนกลับ</span>
        </motion.button>
      </nav>

      <main className="container mx-auto px-6 pt-4 pb-20 relative z-10">
        
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center mb-16 sm:mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '48px' }}
            className="font-black mb-6 sm:mb-8 leading-tight tracking-tight text-[#4A4A4A]"
          >
            เปลี่ยนความรู้สึก ให้เป็น <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF8E6E] via-purple-500 to-pink-500">
              พิกัดที่ใช่สำหรับคุณ
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: '18px' }}
            className="text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed px-4"
          >
            ค้นพบการเดินทางในรูปแบบใหม่ที่ใช้ "หัวใจ" นำทาง ผ่าน 4 ขั้นตอนง่ายๆ
          </motion.p>
        </section>

        {/* Steps Grid: ปรับขนาดการ์ด W257 H247 */}
        <motion.div 
          variants={containerVars}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-8 mb-20 sm:mb-24"
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              variants={itemVars}
              whileHover={{ y: -8 }}
              style={{ width: '257px', height: '247px' }}
              className="group relative bg-white rounded-[2.5rem] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-white flex flex-col items-start transition-all overflow-hidden"
            >
              {/* Step Number Indicator */}
              <div className="absolute top-6 right-8 text-5xl font-black text-[#F1F3F9] group-hover:text-indigo-50/50 transition-colors">
                {String(index + 1).padStart(2, '0')}
              </div>

              {/* Icon Container */}
              <div className={`relative z-10 w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${step.gradient} ${step.shadow} flex items-center justify-center text-white mb-6 group-hover:rotate-6 transition-transform shadow-lg`}>
                {step.icon}
              </div>

              {/* Content Text: หัวข้อ 18px / เนื้อหา 16px */}
              <div className="relative z-10">
                <h3 style={{ fontSize: '18px' }} className="font-black mb-2 text-[#4A453A] leading-tight">
                  {step.title}
                </h3>
                <p style={{ fontSize: '16px' }} className="text-slate-500 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Final CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="absolute inset-0 bg-orange-400 blur-[60px] opacity-10" />
          <div className="relative bg-gradient-to-r from-[#FF8E6E] to-[#FFA07A] text-white rounded-[2rem] sm:rounded-[3rem] p-12 text-center shadow-xl overflow-hidden">
            <h2 style={{ fontSize: '32px' }} className="font-black text-white mb-8 relative z-10 leading-tight">
              พร้อมที่จะตามหา <br />
              <span className="text-[#4A453A]">พื้นที่พักพิงใจ</span> ของคุณหรือยัง?
            </h2>
            <button 
              onClick={() => navigate('/')}
              style={{ fontSize: '18px' }}
              className="group relative inline-flex items-center gap-3 bg-white text-[#4A453A] px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-white/90 transition-all active:scale-95 z-10"
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