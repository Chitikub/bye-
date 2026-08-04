import { Link } from "react-router-dom";
import { MapPin, Youtube, Facebook, MessageCircle, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#F9F4E8] text-[#4A453A] py-6 sm:py-7 border-t border-[#EFE9D9] font-['Prompt',sans-serif]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between text-sm">

          {/* logo + tagline */}
          <div className="flex items-start gap-3 sm:items-center">
            <img src="/logo1.png" alt="MoodLocation" className="w-10 h-10 object-contain" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-[#4A453A]">MOODLOCATION</h2>
              <p className="text-[13px] text-[#7E7869] font-medium mt-1">© 2026 MoodLocation</p>
              <p className="text-[13px] text-[#7E7869] font-medium">ให้ความรู้สึก นำทางคุณไปเจอที่ที่ใช่</p>
            </div>
          </div>

          {/* menu links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#4A453A] font-medium">
            <Link to="/" className="hover:text-[#FF8E6E] transition-colors">หน้าหลัก</Link>
            <span className="hidden sm:inline-block text-[#D9C9B8]">|</span>
            <Link to="/guide" className="hover:text-[#FF8E6E] transition-colors">คู่มือการใช้งาน</Link>
            <span className="hidden sm:inline-block text-[#D9C9B8]">|</span>
            <Link to="/contact" className="hover:text-[#FF8E6E] transition-colors">ติดต่อเรา</Link>
          </div>

          {/* social icons */}
          <div className="flex items-center justify-center gap-2">
            <a href="mailto:moodlocationfinder@gmail.com" className="w-9 h-9 rounded-full bg-white border border-[#EFE9D9] flex items-center justify-center text-[#4A453A] hover:bg-[#EA4335] hover:text-white transition-all shadow-sm">
              <Mail size={16} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white border border-[#EFE9D9] flex items-center justify-center text-[#4A453A] hover:bg-[#FF8E6E] hover:text-white transition-all shadow-sm">
              <MessageCircle size={16} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white border border-[#EFE9D9] flex items-center justify-center text-[#4A453A] hover:bg-[#3b5998] hover:text-white transition-all shadow-sm">
              <Facebook size={16} />
            </a>
            <button className="w-11 h-11 rounded-full bg-[#FF8E6E] text-white flex items-center justify-center shadow-sm hover:bg-[#F26F60] transition-all">
              <MessageCircle size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;