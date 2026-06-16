"use client";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Send, MessageCircle, X, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import api from "@/api/axios";
import { io } from "socket.io-client";
// 🌟 เพิ่ม import Framer Motion
import { motion, AnimatePresence } from "framer-motion";

const socket = io("https://moodlocationfinder-backend.onrender.com");

export default function FloatingChatWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  
  const [isWidgetExpanded, setIsWidgetExpanded] = useState(() => {
    return localStorage.getItem("isWidgetExpanded") === "true";
  });
  
  const [roomId, setRoomId] = useState(() => {
    return localStorage.getItem("activeRoomId") || null;
  });

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      if (isWidgetExpanded && roomId) fetchChatHistory(roomId);
    }
  }, []);

  const fetchChatHistory = async (targetRoomId) => {
    try {
      const resMessages = await api.get(`/contact/${targetRoomId}/messages`);
      const msgs = resMessages.data.messages || resMessages.data;
      if (Array.isArray(msgs)) setMessages(msgs);
    } catch (error) {
      console.error("Failed to fetch chat history", error);
    }
  };

  useEffect(() => {
    if (roomId) {
      socket.emit("join_room", roomId);

      socket.on("receive_message", (newMessage) => {
        setMessages((prev) => {
          if (prev.some(msg => msg._id === newMessage._id || msg.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        setIsAdminTyping(false);
      });

      socket.on("display_typing", (data) => {
        if (data.senderRole === "admin") setIsAdminTyping(data.isTyping);
      });

      socket.on("room_closed", () => {
        Swal.fire({ icon: "info", title: "หมดเวลาสนทนา", text: "ห้องแชทนี้ถูกปิดเนื่องจากไม่มีการโต้ตอบเกิน 10 นาที", confirmButtonColor: "#FF8E6E" });
        handleClearChat();
      });

      socket.on("admin_closed_chat", (closedRoomId) => {
        if (roomId === closedRoomId) {
          Swal.fire({ icon: "info", title: "แชทสิ้นสุดลง", text: "แอดมินได้ทำการปิดเคสนี้แล้ว", confirmButtonColor: "#FF8E6E" });
          handleClearChat();
        }
      });
    }

    return () => {
      socket.off("receive_message");
      socket.off("display_typing");
      socket.off("room_closed");
      socket.off("admin_closed_chat");
    };
  }, [roomId]);

  useEffect(() => {
    let intervalId;
    if (isWidgetExpanded && roomId) {
      intervalId = setInterval(() => fetchChatHistory(roomId), 3000); 
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [isWidgetExpanded, roomId]);

  useEffect(() => {
    if (isWidgetExpanded) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWidgetExpanded, isAdminTyping]);

  const handleClearChat = () => {
    setIsWidgetExpanded(false);
    setRoomId(null);
    setMessages([]);
    localStorage.removeItem("isWidgetExpanded");
    localStorage.removeItem("activeRoomId");
  };

  const toggleWidget = async () => {
    if (!user) {
      const result = await Swal.fire({
        icon: 'warning', title: 'กรุณาเข้าสู่ระบบ', text: 'คุณต้องเข้าสู่ระบบก่อนจึงจะแชทกับแอดมินได้',
        confirmButtonText: 'ไปหน้าเข้าสู่ระบบ', showCancelButton: true, confirmButtonColor: '#FF8E6E'
      });
      if (result.isConfirmed) navigate('/login');
      return;
    }

    const nextState = !isWidgetExpanded;
    setIsWidgetExpanded(nextState);
    localStorage.setItem("isWidgetExpanded", String(nextState));

    if (nextState && !roomId) {
      setLoading(true);
      try {
        const response = await api.post("/contact"); 
        const currentRoomId = response.data._id || response.data.id || response.data.roomId; 
        if (currentRoomId) {
          setRoomId(currentRoomId);
          localStorage.setItem("activeRoomId", currentRoomId);
          await fetchChatHistory(currentRoomId);
        }
      } catch (error) {
        setIsWidgetExpanded(false);
        localStorage.setItem("isWidgetExpanded", "false");
        Swal.fire("ข้อผิดพลาด", "ไม่สามารถเปิดห้องสนทนาได้", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    if (!roomId) return;
    socket.emit("typing", { roomId, isTyping: true, senderRole: "user" });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { roomId, isTyping: false, senderRole: "user" });
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !user || !roomId) return;

    const textToSend = inputMessage;
    setInputMessage(""); 
    
    socket.emit("typing", { roomId, isTyping: false, senderRole: "user" });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    try {
      await api.post(`/contact/${roomId}/send`, { message: textToSend, text: textToSend, content: textToSend });
      await fetchChatHistory(roomId);
    } catch (error) {
      Swal.fire("ผิดพลาด", "ไม่สามารถส่งข้อความได้", "error");
    }
  };

  if (location.pathname.startsWith('/admin') || user?.role === 'admin') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-['Prompt']">
      {/* 🌟 ครอบด้วย AnimatePresence เพื่อให้สลับหน้าต่างได้อย่างนุ่มนวล */}
      <AnimatePresence mode="wait">
        {!isWidgetExpanded ? (
          /* 🌟 ปุ่มกลมๆ ตอนย่อ (ใส่แอนิเมชันเด้งๆ) */
          <motion.button 
            key="chat-bubble"
            onClick={toggleWidget} 
            initial={{ scale: 0, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 90 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-16 h-16 bg-[#FF8E6E] hover:bg-[#ff7a55] text-white rounded-full flex items-center justify-center shadow-2xl"
          >
            <MessageCircle size={32} />
          </motion.button>
        ) : (
          /* 🌟 หน้าต่างแชทตอนเปิด (แอนิเมชันขยายตัวจากมุมขวาล่าง) */
          <motion.div 
            key="chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.5, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
            className="w-[350px] sm:w-[380px] h-[550px] max-h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header แชท */}
            <div className="bg-gradient-to-r from-[#FF8E6E] to-[#FFB385] p-4 flex justify-between items-center text-white shadow-md z-10 cursor-pointer" onClick={toggleWidget}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-sm">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] leading-tight">ติดต่อ Admin</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 border border-white/50"></span>
                    <p className="text-[11px] opacity-90">พร้อมให้ความช่วยเหลือ</p>
                  </div>
                </div>
              </div>
              <motion.button 
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.8 }}
                onClick={(e) => { e.stopPropagation(); toggleWidget(); }} 
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronDown size={22} />
              </motion.button>
            </div>

            {/* ส่วนเนื้อหาแชท */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#F8F9FA] flex flex-col gap-4">
              {loading ? (
                <div className="flex justify-center items-center h-full text-gray-400 font-bold text-sm">กำลังเชื่อมต่อ...</div>
              ) : messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60"
                >
                  <MessageCircle size={48} className="mb-2" />
                  <p className="text-sm font-bold">ส่งข้อความเพื่อเริ่มสนทนา</p>
                </motion.div>
              ) : (
                messages.map((msg, index) => {
                  const msgSenderId = msg.senderId || (msg.sender && (msg.sender._id || msg.sender.id || msg.sender));
                  const userId = user?._id || user?.id;
                  const isUser = msgSenderId === userId; 
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={index} 
                      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {isUser ? (
                        <div className="max-w-[80%] px-4 py-2.5 shadow-sm bg-[#25D366] text-white rounded-[1.5rem] rounded-tr-sm">
                          <p className="font-medium leading-relaxed text-[14px]">{msg.message || msg.text || msg.content || ""}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <p className="text-[10px] text-white/80">{new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                            <svg viewBox="0 0 16 15" width="14" height="14" className="fill-white/80"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 max-w-[85%]">
                          {/* รูปโปรไฟล์แอดมิน */}
                          <img 
                            src={msg.sender?.profileImage || "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"} 
                            alt="Admin" 
                            className="w-8 h-8 rounded-full shadow-sm border border-gray-200 flex-shrink-0 object-cover mt-3" 
                          />
                          <div className="flex flex-col">
                            
                            {/* 🌟 แสดงชื่อ Admin ตามข้อมูล User จริงๆ ของแอดมินคนนั้น */}
                            <span className="text-[11px] font-bold text-gray-500 mb-0.5 ml-2">
                              {msg.sender?.firstName 
                                ? `${msg.sender.firstName} ${msg.sender.lastName || ""}` 
                                : msg.sender?.name || "Admin"}
                            </span>
                            
                            <div className="bg-white border border-gray-200/60 text-[#4A453A] px-4 py-2.5 rounded-[1.5rem] rounded-tl-sm shadow-sm">
                              <p className="font-medium leading-relaxed text-[14px]">{msg.message || msg.text || msg.content || ""}</p>
                              <p className="text-[10px] mt-1 text-right text-gray-400">{new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}

              {/* 🌟 อนิเมชันตอนแอดมินกำลังพิมพ์ */}
              {isAdminTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start gap-2 w-full max-w-[85%]"
                >
                  <img src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png" alt="Admin" className="w-8 h-8 rounded-full shadow-sm border border-gray-200 flex-shrink-0 object-cover mt-3" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-500 mb-0.5 ml-2">Admin กำลังพิมพ์...</span>
                    <div className="bg-white border border-gray-200/60 px-4 py-3 rounded-[1.5rem] rounded-tl-sm shadow-sm flex items-center gap-1.5 w-fit">
                      <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-gray-400 rounded-full"></motion.span>
                      <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full"></motion.span>
                      <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full"></motion.span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* ช่องพิมพ์ข้อความ */}
            <div className="p-3 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex gap-2 relative bg-[#F8F9FA] p-1 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-[#FF8E6E]/30 focus-within:bg-white transition-all">
                <input type="text" placeholder="พิมพ์ข้อความ..." className="flex-1 bg-transparent px-4 outline-none font-medium text-sm text-[#4A453A]" value={inputMessage} onChange={handleInputChange} />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit" 
                  disabled={!inputMessage.trim()} 
                  className="bg-[#FF8E6E] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md disabled:opacity-50"
                >
                  <Send size={16} className="ml-1" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}