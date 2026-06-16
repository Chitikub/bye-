"use client";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, MessageCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import api from "@/api/axios";
import { io } from "socket.io-client";

// 🌟 เชื่อมต่อ Socket
const socket = io("https://moodlocationfinder-backend.onrender.com");

export default function ContactPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // 🌟 ปรับปรุง: โหลดสถานะเดิมจาก localStorage เพื่อให้รีเฟรชแล้วไม่หลุด
  const [isChatOpen, setIsChatOpen] = useState(() => {
    return localStorage.getItem("isChatOpen") === "true";
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

  // ตรวจสอบ User และดึงประวัติแชทเก่ากรณีเปิดค้างไว้
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      // 🌟 ถ้าตรวจพบว่าเคยเปิดแชทค้างไว้และมี roomId ให้ดึงข้อมูลมาแสดงทันที
      if (isChatOpen && roomId) {
        fetchChatHistory(roomId);
      }
    }
  }, []);

  // ฟังก์ชันแยกสำหรับโหลดประวัติข้อความ
  const fetchChatHistory = async (targetRoomId) => {
    try {
      const resMessages = await api.get(`/contact/${targetRoomId}/messages`);
      const msgs = resMessages.data.messages || resMessages.data;
      if (Array.isArray(msgs)) setMessages(msgs);
    } catch (error) {
      console.error("Failed to fetch chat history", error);
    }
  };

  // 🌟 จัดการ Socket Events
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
        if (data.senderRole === "admin") {
          setIsAdminTyping(data.isTyping);
        }
      });

      socket.on("room_closed", () => {
        Swal.fire({
          icon: "info",
          title: "หมดเวลาสนทนา",
          text: "ห้องแชทนี้ถูกปิดเนื่องจากไม่มีการโต้ตอบเกิน 10 นาที",
          confirmButtonColor: "#FF8E6E"
        });
        handleCloseChatState();
      });

      // 🌟 สิ่งที่เพิ่มเข้ามาใหม่: ดักฟังว่าแอดมินปิดห้องหรือยัง
      socket.on("admin_closed_chat", (closedRoomId) => {
        // ถ้ารหัสห้องที่โดนปิด ตรงกับห้องที่กำลังเปิดอยู่
        if (roomId === closedRoomId) {
          Swal.fire({
            icon: "info",
            title: "แชทสิ้นสุดลง",
            text: "แอดมินได้ทำการปิดเคสนี้แล้ว หากมีข้อสอบถามเพิ่มเติม ระบบจะสร้างห้องแชทใหม่ให้คุณอัตโนมัติเมื่อกดเริ่มแชทใหม่",
            confirmButtonColor: "#FF8E6E"
          });
          // เคลียร์สถานะในหน้าจอและล้าง LocalStorage ทิ้ง
          handleCloseChatState();
        }
      });
    }

    return () => {
      socket.off("receive_message");
      socket.off("display_typing");
      socket.off("room_closed");
      socket.off("admin_closed_chat"); // อย่าลืมเคลียร์ socket เมื่อ component unmount
    };
  }, [roomId]);

  // ระบบดึงข้อความอัตโนมัติ (Polling) ทุกๆ 3 วินาที
  useEffect(() => {
    let intervalId;
    if (isChatOpen && roomId) {
      intervalId = setInterval(() => {
        fetchChatHistory(roomId);
      }, 3000); 
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isChatOpen, roomId]);

  useEffect(() => {
    if (isChatOpen) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen, isAdminTyping]);

  // ฟังก์ชันพับเก็บแชท/ออกจากห้องแชทอย่างปลอดภัย
  const handleCloseChatState = () => {
    setIsChatOpen(false);
    setRoomId(null);
    setMessages([]);
    localStorage.removeItem("isChatOpen");
    localStorage.removeItem("activeRoomId");
  };

  // พิมพ์ข้อความแจ้งเตือนสถานะฝั่งส่ง
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    if (!roomId) return;

    socket.emit("typing", { roomId, isTyping: true, senderRole: "user" });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { roomId, isTyping: false, senderRole: "user" });
    }, 2000);
  };

  const handleOpenChat = async () => {
    setIsChatOpen(true);
    setLoading(true);
    localStorage.setItem("isChatOpen", "true");
    
    try {
      const response = await api.post("/contact"); 
      const currentRoomId = response.data._id || response.data.id || response.data.roomId; 
      
      if (currentRoomId) {
        setRoomId(currentRoomId);
        localStorage.setItem("activeRoomId", currentRoomId);
        await fetchChatHistory(currentRoomId);
      }
    } catch (error) {
      console.error("Failed to open chat", error);
      handleCloseChatState();
      Swal.fire("ข้อผิดพลาด", "ไม่สามารถเปิดห้องสนทนาได้", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !user || !roomId) return;

    const textToSend = inputMessage;
    setInputMessage(""); 
    
    socket.emit("typing", { roomId, isTyping: false, senderRole: "user" });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    try {
      await api.post(`/contact/${roomId}/send`, { 
        message: textToSend,
        text: textToSend,
        content: textToSend
      });
      await fetchChatHistory(roomId);
    } catch (error) {
      Swal.fire("ผิดพลาด", "ไม่สามารถส่งข้อความได้", "error");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9F4E8] flex flex-col items-center justify-center font-['Prompt'] text-[#4A453A]">
        <AlertCircle size={64} className="text-[#FF8E6E] mb-4" />
        <h2 className="text-2xl font-black mb-4">กรุณาเข้าสู่ระบบก่อนติดต่อแอดมิน</h2>
        <button onClick={() => navigate('/login')} className="px-8 py-3 bg-[#FF8E6E] text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
          ไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    );
  }

  if (!isChatOpen) {
    return (
      <div className="min-h-screen bg-[#FDF8F1] flex flex-col items-center justify-center font-['Prompt'] text-[#4A453A] p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl max-w-lg w-full text-center border border-gray-100 flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-gradient-to-tr from-[#FF8E6E] to-[#FFB385] rounded-full flex items-center justify-center mb-6 shadow-inner shadow-white/50">
            <MessageCircle size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-black mb-3 text-[#4A453A]">ติดต่อทีมงาน</h1>
          <p className="text-gray-500 mb-8 leading-relaxed font-medium">หากพบปัญหา สามารถเปิดช่องแชทเพื่อพูดคุยกับ Admin ได้โดยตรง</p>
          <button onClick={handleOpenChat} className="w-full py-4 bg-[#FF8E6E] text-white rounded-2xl font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
            <MessageCircle size={24} /> เปิดช่องแชท
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F1] flex items-center justify-center py-8 px-4 font-['Prompt']">
      <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col h-[80vh] max-h-[750px] min-h-[500px] overflow-hidden relative animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-4 z-10 shadow-sm">
          <button onClick={handleCloseChatState} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-tr from-[#FF8E6E] to-[#FFB385] rounded-full flex items-center justify-center shadow-inner">
              <MessageCircle size={24} color="white" />
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h1 className="text-lg font-black text-[#4A453A]">ติดต่อ Admin</h1>
            <p className="text-sm text-gray-500 font-medium">แอดมินพร้อมให้ความช่วยเหลือครับ</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center items-center h-full text-gray-400 font-bold">กำลังเชื่อมต่อ...</div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
              <MessageCircle size={56} className="mb-3" />
              <p className="text-base font-bold">ยังไม่มีข้อความ</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const msgSenderId = msg.senderId || (msg.sender && (msg.sender._id || msg.sender.id || msg.sender));
              const userId = user._id || user.id;
              const isUser = msgSenderId === userId; 
              
              return (
                <div key={index} className={`flex w-full ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
                  {isUser ? (
                    /* 🌟 ฝั่งผู้ใช้ */
                    <div className="max-w-[75%] px-5 py-3 shadow-sm bg-[#FF8E6E] text-white rounded-[1.5rem] rounded-tr-sm">
                      <p className="font-medium leading-relaxed text-[15px]">{msg.message || msg.text || msg.content || ""}</p>
                      <p className="text-[10px] mt-1 text-right text-white/70">
                        {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ) : (
                    /* 🌟 ฝั่งแอดมิน (แสดงชื่อจริง และ รูปโปรไฟล์) */
                    <div className="flex gap-3 max-w-[85%]">
                      <img 
                        src={msg.sender?.profileImage || "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"} 
                        alt="Admin" 
                        className="w-10 h-10 rounded-full shadow-sm border border-gray-200 flex-shrink-0 object-cover mt-1" 
                      />
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-gray-500 mb-1 ml-2">
                          {msg.sender?.firstName 
                            ? `${msg.sender.firstName} ${msg.sender.lastName || ""}` 
                            : msg.sender?.name || "Admin (Customer Service)"}
                        </span>
                        <div className="bg-white border border-gray-100 text-[#4A453A] px-5 py-3 rounded-[1.5rem] rounded-tl-sm shadow-sm">
                          <p className="font-medium leading-relaxed text-[15px]">{msg.message || msg.text || msg.content || ""}</p>
                          <p className="text-[10px] mt-1 text-right text-gray-400">
                            {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* 🌟 อนิเมชันตอนแอดมินกำลังพิมพ์ (เข้าชุดกัน) */}
          {isAdminTyping && (
            <div className="flex justify-start gap-3 w-full max-w-[85%] animate-in fade-in slide-in-from-bottom-2">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png" 
                alt="Admin" 
                className="w-10 h-10 rounded-full shadow-sm border border-gray-200 flex-shrink-0 object-cover mt-1" 
              />
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-gray-500 mb-1 ml-2">Admin กำลังพิมพ์...</span>
                <div className="bg-white border border-gray-100 px-5 py-3.5 rounded-[1.5rem] rounded-tl-sm shadow-sm flex items-center gap-1.5 w-fit">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="flex gap-3 relative bg-[#FDF8F1] p-1.5 rounded-full border border-gray-200/50 focus-within:ring-2 focus-within:ring-[#FF8E6E]/30 focus-within:bg-white transition-all">
            <input 
              type="text" placeholder="พิมพ์ข้อความของคุณที่นี่..."
              className="flex-1 bg-transparent px-5 outline-none font-medium text-[#4A453A]"
              value={inputMessage} onChange={handleInputChange} 
            />
            <button type="submit" disabled={!inputMessage.trim()} className="bg-[#FF8E6E] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
              <Send size={20} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}