'use client';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, X, MessageSquare, ShieldCheck, UserCircle } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";

export default function ContactPage() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const baseUrl = "https://moodlocationfinder-backend.onrender.com";

    const fetchAdmins = async () => {
  try {
    const token = localStorage.getItem("token");
    const baseUrl = "https://moodlocationfinder-backend.onrender.com/api/v1";
    
    // พยายามดึงข้อมูล
    const res = await axios.get(`${baseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = res.data.users || res.data;
    const adminList = Array.isArray(data) ? data.filter(u => u.role === 'admin') : [];
    
    if (adminList.length > 0) {
      setAdmins(adminList);
    } else {
      setAdmins([{ _id: 'admin_default', firstName: 'ฝ่ายสนับสนุน', role: 'admin' }]);
    }
  } catch (err) { 
    // ✨ เมื่อเกิด 403 (Forbidden) จะตกลงมาที่นี่
    console.warn("เซิร์ฟเวอร์ปฏิเสธการเข้าถึงรายชื่อ Admin (403): ระบบจะใช้โหมดฝ่ายสนับสนุนรวม");
    
    // ตั้งค่าแอดมินจำลองเพื่อให้ User กดเปิด Modal แชทได้
    setAdmins([{ 
      _id: 'admin_group_support', 
      firstName: 'ฝ่ายสนับสนุน', 
      role: 'admin',
      profileImage: null 
    }]);
  }
};
    const newSocket = io(baseUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      if (user?._id) newSocket.emit("join_room", user._id);
    });

    // ✨ รับข้อความตอบกลับจากแอดมินคนไหนก็ได้
    newSocket.on("receive_message", (data) => {
      if (data.role === 'admin') {
        setChatHistory((prev) => [...prev, { role: 'admin', text: data.message }]);
      }
    });

    return () => {
      newSocket.off("receive_message");
      newSocket.close();
    };
  }, []);

  const handleSendMessage = (e) => {
  e.preventDefault();
  if (!message.trim() || !socket) return;
  const user = JSON.parse(localStorage.getItem("user"));

  const messageData = { 
    message: message, 
    to: "admin_room", // ✨ ส่งเข้าห้องรวมแอดมิน
    from: user?._id,
    fromName: user?.firstName || "ผู้ใช้งาน",
    role: "user",
    time: new Date()
  };

  // ส่งผ่าน socket
  socket.emit("send_message", messageData);

  setChatHistory([...chatHistory, { role: 'user', text: message }]);
  setMessage("");
};

  return (
    <div className="min-h-screen bg-[#FDF8F1] font-['Kanit'] text-[#4A453A]">
      <section className="h-[45vh] bg-[#4A453A] flex items-center justify-center text-white relative">
        <button onClick={() => navigate(-1)} className="absolute top-10 left-10 flex items-center gap-2 text-white/70 hover:text-white font-bold transition-all"><ArrowLeft className="w-5 h-5" /> ย้อนกลับ</button>
        <div className="text-center px-6">
          <h1 className="text-5xl md:text-6xl font-black mb-4">คุยกับ <span className="text-[#FF8E6E]">แอดมิน</span></h1>
          <p className="text-xl opacity-70">แอดมินทุกคนพร้อมสแตนบายตอบคำถามคุณ</p>
        </div>
      </section>

      <main className="container mx-auto px-6 -mt-16 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {admins.map((admin) => (
            <motion.div key={admin._id} whileHover={{ y: -10 }} onClick={() => { setSelectedAdmin(admin); setIsChatOpen(true); }} className="bg-white p-8 rounded-[3.5rem] shadow-2xl border border-white cursor-pointer flex flex-col items-center text-center group transition-all">
              <div className="relative mb-6">
                <img src={admin.profileImage || `https://ui-avatars.com/api/?name=${admin.firstName}&background=FF8E6E&color=fff`} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-[#FDF8F1] group-hover:border-[#FF8E6E]" alt="admin" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-white rounded-full" />
              </div>
              <h3 className="text-2xl font-black mb-2">แอดมิน {admin.firstName}</h3>
              <div className="px-4 py-2 bg-orange-50 text-[#FF8E6E] rounded-full text-xs font-black mb-6 uppercase tracking-widest">Support Team</div>
              <p className="text-[#7E7869] font-bold flex items-center gap-2 group-hover:text-[#FF8E6E]"><MessageSquare className="w-5 h-5" /> คลิกเพื่อเริ่มแชท</p>
            </motion.div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed bottom-6 right-6 w-[90%] max-w-[420px] h-[600px] bg-white rounded-[3rem] shadow-2xl z-[1000] flex flex-col overflow-hidden border-4 border-white">
            <div className="p-6 bg-[#4A453A] text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <UserCircle className="w-10 h-10 text-[#FF8E6E]" />
                <div>
                  <h4 className="font-black text-lg">ศูนย์ช่วยเหลือออนไลน์</h4>
                  <p className="text-[10px] text-green-400 font-black uppercase">Admin Team is Online</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-2xl transition-all text-white"><X size={28} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FDF8F1]">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-[1.5rem] font-bold shadow-sm ${msg.role === 'user' ? 'bg-[#FF8E6E] text-white rounded-tr-none' : 'bg-white text-[#4A453A] rounded-tl-none border border-gray-100'}`}>{msg.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-gray-100 flex gap-3">
              <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="พิมพ์ข้อความหาแอดมิน..." className="flex-1 bg-gray-50 rounded-2xl px-6 py-4 outline-none text-[#4A453A] font-medium" />
              <button type="submit" className="w-14 h-14 bg-[#FF8E6E] text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"><Send size={24} /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}