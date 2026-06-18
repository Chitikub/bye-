import { Link } from "react-router-dom";
import { MapPin, Youtube, Facebook, MessageCircle, Mail } from "lucide-react";


const Footer = () => {
  return (
    <footer className="bg-[#F9F4E8] text-[#4A453A] pt-16 pb-8 border-t border-[#EFE9D9] font-['Prompt'] mt-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          
          {/* ─── ด้านซ้าย: โลโก้ & ลิขสิทธิ์ ─── */}
          <div className="flex flex-col gap-6 lg:w-1/4">
            <div className="flex items-center gap-3 ">
              <img src="/logo1.png" alt="MoodLocation Logo" className="w-18 h-18 object-contain" />
              <span className="text-2xl font-black tracking-tight text-[#4A453A]">MoodLocation</span>
            </div>
            <div className="mt-auto lg:pt-12">
              <p className="text-sm font-bold text-[#4A453A]"> © 2026</p>
              <p className="text-sm text-[#7E7869] mt-1 font-medium">ให้ความรู้สึก นำทางคุณไปเจอที่ที่ใช่</p>
            </div>
          </div>

          {/* ─── ด้านขวา: ลิงก์เมนู & ปุ่มติดต่อ ─── */}
          <div className="flex-1 w-full flex flex-col">
            
            {/* แถวบน: ลิงก์ + ปุ่ม */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-8">
              
              {/* กริดลิงก์ 3 คอลัมน์ (มีเส้นคั่นด้านหน้าเหมือนในรูป) */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 lg:gap-x-12 gap-y-6 w-full md:w-auto">
                
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

              {/* ปุ่ม CONTACT US */}
              <Link to="/contact" className="bg-[#FF8E6E] text-white px-8 py-3.5 rounded-2xl font-bold shadow-md hover:bg-[#ff7a55] hover:shadow-lg transition-all active:scale-95 whitespace-nowrap text-sm tracking-wide">
                ศูนย์ช่วยเหลือ
              </Link>
            </div>

            {/* เส้นคั่นแนวนอน */}
            <div className="w-full h-px bg-[#EFE9D9] mb-6"></div>

            {/* แถวล่าง: ไอคอน Social Media ชิดขวา */}
            <div className="flex justify-end gap-4">
              
              <a href="https://www.youtube.com/channel/UCTdofgacojSQ9yC53muHA1w" target="_blank" rel="noopener noreferrer" title="YouTube" className="w-10 h-10 rounded-full bg-white border border-[#EFE9D9] flex items-center justify-center text-[#7E7869] hover:text-white hover:bg-[#FF0000] hover:border-[#FF0000] transition-all shadow-sm">
                <Youtube size={18} />
              </a>
              
              {/* Facebook */}
              <a href="#" target="_blank" rel="noopener noreferrer" title="Facebook" className="w-10 h-10 rounded-full bg-white border border-[#EFE9D9] flex items-center justify-center text-[#7E7869] hover:text-white hover:bg-[#FF8E6E] hover:border-[#FF8E6E] transition-all shadow-sm">
                <Facebook size={18} />
              </a>
              
              {/* Line */}
              <a href="#" target="_blank" rel="noopener noreferrer" title="Line" className="w-10 h-10 rounded-full bg-white border border-[#EFE9D9] flex items-center justify-center text-[#7E7869] hover:text-white hover:bg-[#00B900] hover:border-[#00B900] transition-all shadow-sm">
                <MessageCircle size={18} />
              </a>

              {/* Gmail / Email */}
              <a href="mailto:moodlocationfinder@gmail.com" title="moodlocationfinder@gmail.com" className="w-10 h-10 rounded-full bg-white border border-[#EFE9D9] flex items-center justify-center text-[#7E7869] hover:text-white hover:bg-[#EA4335] hover:border-[#EA4335] transition-all shadow-sm">
                <Mail size={18} />
              </a>
              
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;