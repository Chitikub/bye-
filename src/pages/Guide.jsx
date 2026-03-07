'use client';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Library หลักสำหรับทำ Animation
import { 
  UserPlus, 
  Settings2, 
  SmilePlus, 
  MapPinCheckInside, 
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from "lucide-react"; // ไอคอนต่างๆ จาก Lucide

export default function GuidePage() {
  const navigate = useNavigate();

  // --- Animation Variants: กำหนดชุดคำสั่งแอนิเมชันเพื่อให้นำไปใช้ซ้ำได้ง่าย ---
  
  // สำหรับ Container หลัก: ใช้ทำ Stagger Effect (ให้ลูกๆ ค่อยๆ โผล่ตามกันมา)
  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.2, // ให้ Element ลูกแสดงห่างกันทีละ 0.2 วินาที
        delayChildren: 0.3    // รอ 0.3 วินาทีก่อนเริ่มเล่นแอนิเมชันลูกตัวแรก
      }
    }
  };

  // สำหรับ Element ย่อย (การ์ดแต่ละใบ): ให้เลื่อนขึ้นจากด้านล่าง (y: 30)
  const itemVars = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  // ข้อมูลขั้นตอนการใช้งาน (Array of Objects) เพื่อนำไป Map แสดงผล
  const steps = [
    {
      title: "เข้าร่วมกับเรา",
      description: "เข้าสู่ระบบหรือสมัครสมาชิกเพื่อ บันทึกสถานที่โปรด และจดจำอารมณ์ในแต่ละวัน",
      icon: <UserPlus className="w-7 h-7" />,
      gradient: "from-[#4D6EF3] to-[#6A85F7]", // ไล่เฉดสีน้ำเงิน
      shadow: "shadow-[#4D6EF3]/30"
    },
    {
      title: "ตั้งค่าโปรไฟล์",
      description: "อัปโหลดรูปและระบุตัวตนของคุณ เพื่อให้ระบบ AI แนะนำพิกัดได้ตรงใจที่สุด",
      icon: <Settings2 className="w-7 h-7" />,
      gradient: "from-[#D82B8E] to-[#F45C9C]", // ไล่เฉดสีชมพูเข้ม
      shadow: "shadow-[#D82B8E]/30"
    },
    {
      title: "เลือกอารมณ์",
      description: "บอกความรู้สึกตอนนี้ผ่าน Mood Chips หรือพิมพ์ระบายในช่องค้นหา",
      icon: <SmilePlus className="w-7 h-7" />,
      gradient: "from-[#F45C9C] to-[#D82B8E]", // ไล่เฉดสีชมพู-ม่วง
      shadow: "shadow-[#D82B8E]/30"
    },
    {
      title: "รับพิกัดพักใจ",
      description: "เลือกสถานที่ที่แนะนำ แล้วออกเดินทางได้ทันที พร้อมระบบนำทางที่แม่นยำ",
      icon: <MapPinCheckInside className="w-7 h-7" />,
      gradient: "from-[#00A78E] to-[#008C72]", // ไล่เฉดสีเขียวเอเมอรัลด์
      shadow: "shadow-[#00A78E]/30"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F1] text-[#1E1B4B] font-['Anuphan',sans-serif] selection:bg-indigo-100 overflow-x-hidden">
      
      {/* --- Background Elements: วงกลมฟุ้งๆ ด้านหลัง (Blur Blobs) --- */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200/30 rounded-full blur-[120px]" />
      </div>

      {/* --- Header / Nav: ส่วนปุ่มย้อนกลับ --- */}
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
        
        {/* --- Hero Section: พาดหัวหลักของหน้าคู่มือ --- */}
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

        {/* --- Steps Grid: ส่วนแสดงขั้นตอนทั้ง 4 --- */}
        <motion.div 
  variants={containerVars}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24"
>
  {steps.map((step, index) => (
    <motion.div 
      key={index}
      variants={itemVars}
      whileHover={{ y: -10 }}
      className="group relative bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col items-start transition-all overflow-hidden"
    >
      {/* เลขลำดับขั้นตอน (01, 02, 03, 04) - ปรับให้อยู่บนการ์ดเหมือนตัวอย่าง */}
      <div className="absolute top-8 right-10 text-6xl font-black text-[#E8EAF6] transition-colors group-hover:text-indigo-100/80">
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* ส่วน Icon พร้อม Gradient พื้นหลัง */}
      <div className={`relative z-10 w-20 h-20 rounded-[1.8rem] bg-gradient-to-br ${step.gradient} ${step.shadow} flex items-center justify-center text-white mb-10 group-hover:rotate-6 transition-transform shadow-lg`}>
        {step.icon}
      </div>

      {/* ข้อความรายละเอียด */}
      <div className="relative z-10">
        <h3 className="text-2xl font-black mb-4 text-[#4A453A]">{step.title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed font-medium">
          {step.description}
        </p>
      </div>
    </motion.div>
  ))}
</motion.div>

        {/* --- Final CTA (Call to Action): ส่วนปิดท้ายหน้า --- */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="relative max-w-3xl mx-auto"
        >
          {/* แสงฟุ้งด้านหลังปุ่ม CTA */}
          <div className="absolute inset-0 bg-indigo-600 blur-[80px] opacity-10" />
          
          <div className="relative bg-gradient-to-r from-orange-300 to-orange-400 text-white rounded-[2rem] p-12 text-center shadow-2xl shadow-indigo-200/50 overflow-hidden">
            {/* ไอคอน Sparkles ตกแต่งมุมขวา */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-32 h-32 text-white" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black text-white mb-8 relative z-10">
              พร้อมที่จะตามหา <br />
              <span className="text-[#4A453A]">พื้นที่พักพิงใจ</span> ของคุณหรือยัง?
            </h2>
            
            {/* ปุ่มเปลี่ยนหน้ากลับไปหน้าแรก */}
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