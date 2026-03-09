'use client';
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Send, Search, MessageSquare } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminMessages() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef(null);
  
  // ใช้ Ref เพื่อเก็บค่า selectedChat ล่าสุดให้ Socket มองเห็น
  const selectedChatRef = useRef(null);
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const baseUrl = "https://moodlocationfinder-backend.onrender.com";
    
    const newSocket = io(baseUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      // ✨ แอดมินทุกคน Join เข้าห้อง admin_room เพื่อรอรับข้อความจากผู้ใช้ทุกคน
      newSocket.emit("join_room", "admin_room");
    });

    // ดึงรายชื่อผู้ใช้เริ่มต้น (ถ้า API ไม่ 403)
    const fetchChatList = async () => {
      try {
        const res = await axios.get(`${baseUrl}/api/v1/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const users = res.data.users || res.data;
        setChats(Array.isArray(users) ? users.filter(u => u.role === 'user') : []);
      } catch (err) { console.error("API Error"); }
    };
    fetchChatList();

    // ✨ ฟังเสียงเรียกเข้า: เมื่อมีคนส่งข้อความมาหาแอดมิน (Broadcast จาก Server)
    newSocket.on("receive_message", (data) => {
      if (data.role === 'user') {
        const senderId = data.from;

        setChats(prev => {
          const exists = prev.find(c => c._id === senderId);
          const newMessageData = {
            _id: senderId,
            firstName: data.fromName || "New User",
            lastMsg: data.message,
            unread: true,
            updatedAt: new Date().toISOString()
          };

          if (!exists) {
            // ถ้าเป็นคนใหม่ ให้เพิ่มเข้าข้างบนสุดทันที
            return [newMessageData, ...prev];
          } else {
            // ถ้าคนเดิมทักมา ให้เลื่อนขึ้นมาบนสุดและอัปเดตข้อความล่าสุด
            const filtered = prev.filter(c => c._id !== senderId);
            return [newMessageData, ...filtered];
          }
        });

        // 🔔 ถ้าแอดมินคนนี้ "กำลังเปิดหน้าแชท" ของคนนี้อยู่พอดี ให้ข้อความเด้งขึ้นในจอกลาง
        if (selectedChatRef.current?._id === senderId) {
          setMessages(prev => [...prev, { 
            role: 'user', 
            text: data.message, 
            time: Date.now(), 
            id: Math.random() 
          }]);
        }
      }
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedChat || !socket) return;

    // ส่งกลับหา User รายคน (to: user_id)
    socket.emit("send_message", {
      to: selectedChat._id,
      message: inputMessage,
      from: "admin",
      role: "admin"
    });

    setMessages([...messages, { role: 'admin', text: inputMessage, time: Date.now(), id: Math.random() }]);
    setInputMessage("");
    
    // เคลียร์สถานะ unread เมื่อเราตอบแล้ว
    setChats(prev => prev.map(c => c._id === selectedChat._id ? { ...c, unread: false } : c));
  };

  const filteredChats = chats.filter(c => 
    `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 md:p-12 overflow-hidden bg-[#FDF8F1] flex flex-col font-['Kanit'] text-[#4A453A]">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black">แชท <span className="text-[#FF8E6E]">ส่วนกลาง</span></h1>
          <p className="text-lg opacity-70 font-bold mt-2">แอดมินทุกคนช่วยกันตอบได้ที่นี่</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-[#EFE9D9]">
           <span className="flex items-center gap-2 font-bold">
             {socket?.connected ? '🟢 ออนไลน์' : '🔴 กำลังเชื่อมต่อ...'}
           </span>
        </div>
      </div>

      <div className="flex-1 flex bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border-4 border-white h-[65vh]">
        {/* Sidebar: รายชื่อคนทัก */}
        <aside className="w-85 border-r border-[#EFE9D9] flex flex-col bg-[#FDF8F1]/40">
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" placeholder="ค้นหาชื่อลูกค้า..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white outline-none shadow-sm focus:ring-2 focus:ring-[#FF8E6E]/20 text-[#4A453A] font-bold"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
            {filteredChats.map((user) => (
              <button 
                key={`user-card-${user._id}`}
                onClick={() => { setSelectedChat(user); setMessages([]); }} 
                className={`w-full p-5 rounded-[2.2rem] flex items-center gap-4 transition-all duration-300 ${selectedChat?._id === user._id ? 'bg-[#4A453A] text-white shadow-xl scale-[1.02]' : 'hover:bg-white text-[#4A453A]'}`}
              >
                <div className="relative flex-shrink-0">
                  <img src={`https://ui-avatars.com/api/?name=${user.firstName}&background=FF8E6E&color=fff`} className="w-13 h-13 rounded-2xl shadow-sm border-2 border-white" alt="avatar" />
                  {user.unread && <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-4 border-white rounded-full animate-bounce" />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-black text-[17px] truncate">{user.firstName}</p>
                  <p className={`text-[12px] truncate ${selectedChat?._id === user._id ? 'text-white/60' : 'opacity-50'}`}>
                    {user.lastMsg || "ลูกค้าทักข้อความใหม่..."}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* จอกลาง: แชทโต้ตอบ */}
        <section className="flex-1 flex flex-col bg-white overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedChat ? (
              <motion.div key={selectedChat._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                <header className="p-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/20">
                  <div className="w-10 h-10 bg-[#FF8E6E] rounded-xl flex items-center justify-center text-white font-black">{selectedChat.firstName[0]}</div>
                  <h3 className="font-black text-xl">คุณ {selectedChat.firstName}</h3>
                </header>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#FDF8F1]/10">
                  {messages.map((msg) => (
                    <div key={`msg-key-${msg.id || msg.time}`} className={`flex ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-4 rounded-[1.8rem] max-w-[75%] font-bold shadow-sm ${msg.role === 'admin' ? 'bg-[#FF8E6E] text-white rounded-tr-none' : 'bg-white text-[#4A453A] rounded-tl-none border border-gray-100'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-100 flex gap-4 bg-white">
                  <input 
                    value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} 
                    placeholder={`ตอบกลับคุณ ${selectedChat.firstName}...`} 
                    className="flex-1 bg-[#FDF8F1] rounded-2xl px-6 py-4 outline-none border-2 border-transparent focus:border-[#FF8E6E]/30 text-[#4A453A] font-bold" 
                  />
                  <button type="submit" className="w-14 h-14 bg-[#FF8E6E] text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#FF7A52] active:scale-95 transition-all">
                    <Send size={24} />
                  </button>
                </form>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#7E7869] opacity-20 grayscale">
                <MessageSquare size={120} />
                <p className="font-black text-2xl mt-6">รอข้อความใหม่จากลูกค้า...</p>
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}