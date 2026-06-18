import { Link } from "react-router-dom";
import { MapPin, Youtube, Facebook, MessageCircle, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#F9F4E8] text-[#4A453A] pt-12 pb-8 sm:pt-16 border-t border-[#EFE9D9] font-['Prompt'] mt-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-12">
          
          {/* ─── ด้านซ้าย: โลโก้ & ลิขสิทธิ์ ─── */}
          <div className="flex flex-col gap-4 lg:gap-6 lg:w-1/4 w-full">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              {/* ปรับขนาดโลโก้ให้ยืดหยุ่นตามหน้าจอ */}
              <img src="/logo1.png" alt="MoodLocation Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#4A453A]">MoodLocation</span>
            </div>
            
            {/* แสดงลิขสิทธิ์ตรงนี้เฉพาะจอคอม (จอเล็กจะย้ายไปล่างสุด) */}
            <div className="hidden lg:block mt-auto pt-12">
              <p className="text-sm font-bold text-[#4A453A]"> © 2026 MoodLocation</p>
              <p className="text-sm text-[#7E7869] mt-1 font-medium">ให้ความรู้สึก นำทางคุณไปเจอที่ที่ใช่</p>
            </div>
          </div>

          {/* ─── ด้านขวา: ลิงก์เมนู & ปุ่มติดต่อ ─── */}
          <div className="flex-1 w-full flex flex-col">
            
            {/* แถวบน: ลิงก์ + ปุ่ม */}
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-8 mb-8">
              
              {/* กริดลิงก์ (จัดเป็น 2 คอลัมน์ในมือถือ) */}
              <div className="grid grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-6 w-full sm:w-auto">
                
                {/* คอลัมน์ที่ 1 */}
                <div className="flex flex-col gap-4 border-l-2 border-[#FF8E6E]/40 pl-4">
                  <Link to="/" className="text-sm font-bold text-[#7E7869] hover:text-[#FF8E6E] transition-colors">หน้าหลัก</Link>
                  <Link to="/contact" className="text-sm font-bold text-[#7E7869] hover:text-[#FF8E6E] transition-colors">ติดต่อเรา</Link>
                </div>
                
                {/* คอลัมน์ที่ 2 */}
                <div className="flex flex-col gap-4 border-l-2 border-[#FF8E6E]/40 pl-4">
                  <Link to="/guide" className="text-sm font-bold text-[#7E7869] hover:text-[#FF8E6E] transition-colors">คู่มือการใช้งาน</Link>
                </div>
                
              </div>

              {/* ปุ่ม CONTACT US (เต็มจอในมือถือ) */}
              <Link to="/contact" className="w-full sm:w-auto text-center bg-[#FF8E6E] text-white px-8 py-3.5 rounded-2xl font-bold shadow-md hover:bg-[#ff7a55] hover:shadow-lg transition-all active:scale-95 whitespace-nowrap text-sm tracking-wide">
                ศูนย์ช่วยเหลือ
              </Link>
            </div>

            {/* เส้นคั่นแนวนอน */}
            <div className="w-full h-px bg-[#EFE9D9] mb-6 md:mb-8"></div>

            {/* แถวล่าง: ไอคอน Social Media & Copyright มือถือ */}
            <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6">
              
              {/* แสดงลิขสิทธิ์ตรงนี้เฉพาะจอมือถือและแท็บเล็ต */}
              <div className="lg:hidden text-center md:text-left">
                <p className="text-sm font-bold text-[#4A453A]"> © 2026 MoodLocation</p>
                <p className="text-xs text-[#7E7869] mt-1 font-medium">ให้ความรู้สึก นำทางคุณไปเจอที่ที่ใช่</p>
              </div>

              {/* ไอคอนโซเชียลมีเดีย */}
              <div className="flex justify-center md:justify-end gap-4 w-full md:w-auto">
                <a href="https://www.youtube.com/channel/UCTdofgacojSQ9yC53muHA1w" target="_blank" rel="noopener noreferrer" title="YouTube" className="w-10 h-10 rounded-full bg-white border border-[#EFE9D9] flex items-center justify-center text-[#7E7869] hover:text-white hover:bg-[#FF0000] hover:border-[#FF0000] transition-all shadow-sm">
                  <Youtube size={18} />
                </a>
                
                <a href="#" target="_blank" rel="noopener noreferrer" title="Facebook" className="w-10 h-10 rounded-full bg-white border border-[#EFE9D9] flex items-center justify-center text-[#7E7869] hover:text-white hover:bg-[#FF8E6E] hover:border-[#FF8E6E] transition-all shadow-sm">
                  <Facebook size={18} />
                </a>
                
                <a href="#" target="_blank" rel="noopener noreferrer" title="Line" className="w-10 h-10 rounded-full bg-white border border-[#EFE9D9] flex items-center justify-center text-[#7E7869] hover:text-white hover:bg-[#00B900] hover:border-[#00B900] transition-all shadow-sm">
                  <MessageCircle size={18} />
                </a>

                <a href="mailto:moodlocationfinder@gmail.com" title="moodlocationfinder@gmail.com" className="w-10 h-10 rounded-full bg-white border border-[#EFE9D9] flex items-center justify-center text-[#7E7869] hover:text-white hover:bg-[#EA4335] hover:border-[#EA4335] transition-all shadow-sm">
                  <Mail size={18} />
                </a>
              </div>

            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;