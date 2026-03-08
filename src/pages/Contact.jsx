'use client';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Sparkles, ChevronRight } from "lucide-react";

export default function ContactPage() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [message, setMessage] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  
  const admins = [
    { id: 1, name: "ผู้ดูแลระบบ", status: "ออนไลน์", avatar: "https://i.pravatar.cc/150?u=admin1" },
    { id: 2, name: "ฝ่ายเทคนิค", status: "ออฟไลน์", avatar: "https://i.pravatar.cc/150?u=admin2" }
  ];

  const [chatLog, setChatLog] = useState([
    { id: 1, text: "สวัสดีครับ", sender: "user" },
    { id: 2, text: "ระบบมีปัญหา", sender: "user" }
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog, selectedAdmin]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setChatLog([...chatLog, { id: Date.now(), text: message, sender: "user" }]);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[#FDF8F1] pt-24 pb-10 px-4 font-['Kanit',sans-serif]">
      {/* 📥 Import Font Kanit ผ่าน Style Tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap');
        * { font-family: 'Kanit', sans-serif; }
      `}</style>

      <div className="max-w-4xl mx-auto">
        
        {/* --- 🏷️ Header: ขนาด 48px --- */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white rounded-2xl shadow-sm text-[#7E7869] hover:text-[#FF8E6E] transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 
            style={{ fontSize: '48px' }} 
            className="font-black text-[#4A453A] leading-tight tracking-tight"
          >
            ติดต่อ <span className="text-[#FF8E6E]">แอดมิน</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* --- 🟢 ส่วนที่ 1: รายชื่อแอดมิน (หัวข้อ 18px / ชื่อ 18px / สถานะ 16px) --- */}
          <div className="lg:col-span-4 space-y-3">
            <p 
              style={{ fontSize: '18px' }} 
              className="font-bold text-[#7E7869] uppercase tracking-widest ml-2 mb-4"
            >
              ผู้ดูแลระบบ
            </p>
            {admins.map((admin) => (
              <button 
                key={admin.id}
                onClick={() => setSelectedAdmin(admin)}
                className={`w-full p-4 rounded-[2rem] border transition-all flex items-center justify-between group ${
                  selectedAdmin?.id === admin.id 
                  ? 'bg-[#4A453A] border-[#4A453A] text-white shadow-xl' 
                  : 'bg-white border-white text-[#4A453A] hover:border-[#FF8E6E]/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={admin.avatar} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 ${selectedAdmin?.id === admin.id ? 'border-[#4A453A]' : 'border-white'} ${admin.status === 'ออนไลน์' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="text-left leading-tight">
                    <p style={{ fontSize: '18px' }} className="font-bold">{admin.name}</p>
                    <p style={{ fontSize: '16px' }} className={`font-medium ${selectedAdmin?.id === admin.id ? 'text-gray-300' : 'text-gray-400'}`}>
                      {admin.status}
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-opacity ${selectedAdmin?.id === admin.id ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            ))}
          </div>

          {/* --- 💬 ส่วนที่ 2: หน้าต่างแชท (ชื่อแอดมิน 32px / แชท 18px / ข้อความระบบ 16px) --- */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {selectedAdmin ? (
                <motion.div 
                  key={selectedAdmin.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,69,58,0.05)] border border-white overflow-hidden flex flex-col h-[600px]"
                >
                  {/* Chat Top Bar */}
                  <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <img src={selectedAdmin.avatar} className="w-10 h-10 rounded-xl" alt="" />
                      <div>
                        <p style={{ fontSize: '32px' }} className="font-black text-[#4A453A] leading-none mb-1">
                          {selectedAdmin.name}
                        </p>
                        <p style={{ fontSize: '16px' }} className="font-bold text-green-500 uppercase tracking-tighter">
                          {selectedAdmin.status}
                        </p>
                      </div>
                    </div>
                    <div style={{ fontSize: '16px' }} className="font-bold text-gray-300 text-right leading-none">
                      แชทโดย<br/>คุณ
                    </div>
                  </div>

                  {/* Chat Content Area */}
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FDF8F1]/30">
                    <div className="text-center mb-8">
                      <span 
                        style={{ fontSize: '16px' }} 
                        className="px-5 py-2 bg-gray-100/80 rounded-full font-bold text-gray-400"
                      >
                        ยินดีต้อนรับสู่ช่องแชท{selectedAdmin.name}
                      </span>
                    </div>

                    {chatLog.map((log) => (
                      <div key={log.id} className="flex justify-end items-end gap-2">
                        <div 
                          style={{ fontSize: '18px' }} 
                          className="max-w-[75%] px-5 py-3 bg-white rounded-3xl rounded-br-none shadow-sm border border-gray-100 text-[#4A453A] leading-relaxed"
                        >
                          {log.text}
                        </div>
                        <img src="https://ui-avatars.com/api/?name=User&background=FF8E6E&color=fff" className="w-7 h-7 rounded-lg mb-1 shadow-sm" alt="" />
                      </div>
                    ))}
                  </div>

                  {/* Chat Input Bar */}
                  <form onSubmit={handleSendMessage} className="p-5 bg-white border-t border-gray-50 flex items-center gap-3">
                    <input 
                      type="text" 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="พิมพ์ข้อความที่นี่..." 
                      style={{ fontSize: '18px', color: '#4A453A' }} 
                      className="flex-1 bg-[#FDF8F1] border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#FF8E6E]/20 transition-all font-medium placeholder:text-gray-400"
                    />
                    <button 
                      type="submit"
                      disabled={!message.trim()}
                      className="w-12 h-12 bg-[#FF8E6E] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-50 transition-all"
                    >
                      <Send className="w-5 h-5 rotate-[-15deg]" />
                    </button>
                  </form>
                </motion.div>
              ) : (
                <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] h-[600px] flex flex-col items-center justify-center text-center p-10 border border-dashed border-gray-200">
                  <h3 
                    style={{ fontSize: '32px' }} 
                    className="font-black text-[#4A453A] mb-4 opacity-30"
                  >
                    เลือกแอดมินเพื่อเริ่มแชท
                  </h3>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}