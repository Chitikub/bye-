'use client'; // บ่งบอกว่าเป็น Client Component (สำหรับ Next.js 13+)
import { useNavigate } from "react-router-dom"; // Hook สำหรับการเปลี่ยนหน้า
import { motion } from "framer-motion"; // Library สำหรับทำ Animation
import { 
  ArrowLeft, Mail, Phone, MapPin, 
  Send, MessageCircle 
} from "lucide-react"; // Icon จาก Lucide
import Swal from 'sweetalert2'; // Library สำหรับแสดง Popup สวยๆ

export default function ContactPage() {
  const navigate = useNavigate(); // สร้างฟังก์ชันสำหรับนำทาง (Navigation)

  // ฟังก์ชันจัดการเมื่อกดส่งฟอร์ม
  const handleSubmit = (e) => {
    e.preventDefault(); // ป้องกันหน้าเว็บ Refresh เมื่อกด Submit
    // แสดง Popup แจ้งเตือนความสำเร็จ
    Swal.fire({
      icon: 'success',
      title: 'ส่งข้อความสำเร็จ!',
      text: 'เราจะติดต่อกลับหาคุณโดยเร็วที่สุด',
      confirmButtonColor: '#FF8E6E', // ใช้สีส้มคอรัลตาม Theme
      customClass: { popup: 'rounded-[2rem]' } // ปรับความโค้งมนของ Popup
    });
  };

  return (
    // Container หลัก: กำหนดพื้นหลังสีครีม, สีตัวอักษร และฟอนต์
    <div className="min-h-screen bg-[#F9F4E8] text-[#4A453A] font-['IBM_Plex_Sans_Thai'] overflow-x-hidden">
      
      {/* --- HERO SECTION: ส่วนหัวด้านบนที่มีรูปภาพและพาดหัว --- */} 
      <section className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-[#4A453A] text-white">
        
        {/* Background Decor: รูปภาพพื้นหลังที่ทำให้จางลง (Opacity 20) */}
        <div className="absolute inset-0 opacity-20">
          <img src="/src/assets/ContactHero.png" alt="CHero" className="w-full h-full object-cover" />
        </div>

        <div className="container relative z-10 px-6 text-center">
          {/* ปุ่มย้อนกลับ: มี Animation เลื่อนจากซ้ายมาขวา */}
          <motion.button 
            initial={{ opacity: 0, x: -20 }} // เริ่มต้น: โปร่งใสและเยื้องไปทางซ้าย
            animate={{ opacity: 1, x: 0 }}   // ปลายทาง: แสดงชัดเจนและอยู่ที่ตำแหน่งปกติ
            onClick={() => navigate(-1)}     // คลิกแล้วย้อนกลับไปหน้าก่อนหน้า
            className="text-white mt-20 absolute top-[-230px] left-18 flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 text-[#4A453A] hover:text-[#FF8E6E] hover:bg-white/60 transition-all font-bold shadow-lg shadow-black/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          {/* พาดหัวข้อความ: มี Animation เลื่อนขึ้นจากด้านล่าง */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              ติดต่อ <span className="text-[#FF8E6E]">MoodPlace</span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              มีคำแนะนำ มีปัญหาการใช้งาน หรืออยากร่วมเป็นพาร์ทเนอร์กับเรา? 
              เราพร้อมรับฟังทุกความรู้สึกของคุณ
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- CONTENT SECTION: ส่วนเนื้อหาที่ซ้อนทับขึ้นไปบน Hero --- */}
      <main className="container mx-auto px-6 -mt-20 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Info Cards: ฝั่งซ้าย (Email, Phone, Office) */}
          <motion.div 
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }} // เล่น Animation เมื่อเลื่อนจอมาถึง
            viewport={{ once: true }}          // เล่นแค่ครั้งเดียว
            className="lg:col-span-1 space-y-6 mt-30" 
          >
            {[
              { icon: <Mail />, title: "Email", detail: "hello@moodplace.com", bg: "bg-blue-50", text: "text-blue-600" },
              { icon: <Phone />, title: "Phone", detail: "02-123-4567", bg: "bg-orange-50", text: "text-orange-600" },
              { icon: <MapPin />, title: "Office", detail: "Bangkok, Thailand", bg: "bg-purple-50", text: "text-purple-600" }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-white flex items-center gap-6 hover:scale-[1.02] transition-transform duration-300">
                {/* ส่วนแสดงไอคอนพร้อมพื้นหลังสีตามชุดข้อมูล */}
                <div className={`${item.bg} ${item.text} p-4 rounded-2xl flex-shrink-0`}>
                  {item.icon}
                </div>
                {/* ส่วนรายละเอียดข้อความ */}
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#8E8E8E]">
                    {item.title}
                  </h3>
                  <p className="text-lg font-bold text-[#4A4A4A] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Contact Form: ฝั่งขวา (แบบฟอร์มส่งข้อความ) */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-white mt-30"
          >
            {/* หัวข้อฟอร์ม */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-[#FF8E6E]/10 rounded-xl flex items-center justify-center text-[#FF8E6E]">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black">ส่งข้อความหาเรา</h2>
            </div>

            {/* ส่วน Input ของฟอร์ม */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ชื่อผู้ส่ง */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 ml-2">ชื่อของคุณ</label>
                <input type="text" placeholder="John Doe" className="w-full bg-[#F8FAFC] border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#FF8E6E]/50 transition-all font-medium text-black" required />
              </div>
              {/* อีเมลผู้ส่ง */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 ml-2">อีเมล</label>
                <input type="email" placeholder="example@mail.com" className="w-full bg-[#F8FAFC] border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#FF8E6E]/50 transition-all font-medium text-black" required />
              </div>
              {/* หัวข้อเรื่อง: ใช้เต็มความกว้าง (md:col-span-2) */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-500 ml-2">หัวข้อเรื่อง</label>
                <input type="text" placeholder="ระบุหัวข้อที่ต้องการติดต่อ" className="w-full bg-[#F8FAFC] border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#FF8E6E]/50 transition-all font-medium text-black" required />
              </div>
              {/* กล่องข้อความ */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-500 ml-2">ข้อความ</label>
                <textarea rows="5" placeholder="พิมพ์ข้อความของคุณที่นี่..." className="w-full bg-[#F8FAFC] border-none rounded-3xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#FF8E6E]/50 transition-all font-medium text-black resize-none" required></textarea>
              </div>
              {/* ปุ่ม Submit */}
              <div className="md:col-span-2">
                <button 
                  type="submit"
                  className="w-full md:w-auto px-12 py-4 bg-[#FF8E6E] text-white rounded-2xl font-black shadow-lg shadow-[#FF8E6E]/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" /> ส่งข้อความ
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}