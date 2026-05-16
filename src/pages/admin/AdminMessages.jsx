"use client";
import { useState, useEffect, useRef } from "react";
import { Trash2, Search, Clock, Send, X, CheckCircle, MessageCircle, Star, Users, CheckSquare } from "lucide-react";
import api from "@/api/axios"; 
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";

const socket = io("https://moodlocationfinder-backend.onrender.com");

export default function AdminMessages() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  
  // สถานะเช็คว่าผู้ใช้ปิดแชทไปแล้วหรือยัง
  const [isUserClosedActive, setIsUserClosedActive] = useState(false);

  const chatEndRef = useRef(null);

  const fetchReports = async () => {
    try {
      const res = await api.get('/contact/admin/all'); 
      const data = res.data.rooms || res.data || [];
      setReports(Array.isArray(data) ? data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) : []);
      
      // 🌟 เช็คอัปเดตสถานะห้องที่กำลังเปิดอยู่จากลิสต์ใหญ่ด้วย
      if (selectedReport) {
        const currentRoomId = selectedReport.id || selectedReport._id;
        const matchingRoom = data.find(r => (r.id || r._id) === currentRoomId);
        if (matchingRoom && matchingRoom.status === 'closed') {
          setIsUserClosedActive(true);
        }
      }
    } catch (err) {
      if (err.response?.status === 401) window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchReports(); 
  }, []);

  // จัดการ Socket
  useEffect(() => {
    if (selectedReport) {
      const roomId = selectedReport.id || selectedReport._id;
      socket.emit("join_room", roomId);
      setIsUserClosedActive(selectedReport.status === 'closed'); // ตั้งค่าเริ่มต้นตามข้อมูลห้องที่กดเข้ามา

      socket.on("receive_message", (newMessage) => {
        setMessages((prev) => {
          if (prev.some(msg => msg._id === newMessage._id || msg.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        fetchReports();
      });

      // ดักฟังจาก Socket (ทำงานเมื่อ Backend พร้อม)
      socket.on("user_closed_chat", () => {
        setIsUserClosedActive(true);
        fetchReports();
      });

      socket.on("room_closed", () => {
        Swal.fire("ปิดเคสอัตโนมัติ", "เคสนี้ถูกปิดเพราะไม่มีการเคลื่อนไหวเกิน 10 นาที", "info");
        setSelectedReport(null);
        fetchReports();
      });
    }

    return () => {
      socket.off("receive_message");
      socket.off("user_closed_chat");
      socket.off("room_closed");
    };
  }, [selectedReport]);

  // Polling ข้อความและแอบเช็คสถานะห้องแชทไปในตัวทุกๆ 3 วินาที 🌟
  useEffect(() => {
    let intervalId;
    if (selectedReport) {
      const roomId = selectedReport.id || selectedReport._id;
      intervalId = setInterval(async () => {
        try {
          const response = await api.get(`/contact/${roomId}/messages`);
          const msgs = response.data.messages || response.data || [];
          if (Array.isArray(msgs)) setMessages(msgs);
          
          // ดึงรายชื่อห้องใหม่เพื่อมาอัปเดตตัวเลขเมนูด้านนอกและเช็คสถานะปิดห้องแชทไปพร้อมกัน
          fetchReports();
        } catch (error) { console.error("Admin polling error:", error); }
      }, 3000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [selectedReport]);

  // โหลดรายชื่อลูกค้าใหม่ทุก 5 วินาทีเมื่ออยู่หน้าแรก
  useEffect(() => {
    const intervalId = setInterval(() => { 
      if (!selectedReport) fetchReports(); 
    }, 5000);
    return () => clearInterval(intervalId);
  }, [selectedReport]);

  useEffect(() => {
    if (selectedReport) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedReport]);

  const handleCloseCase = async (e, id) => {
    e.stopPropagation(); 
    if (!id) return;
    const result = await Swal.fire({ title: 'ปิดเคสการติดต่อ?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#FF8E6E', confirmButtonText: 'ปิดเคส' });
    if (result.isConfirmed) {
      try {
        await api.put(`/contact/admin/${id}/close`); 
        Swal.fire({ title: 'ปิดเคสสำเร็จ!', icon: 'success', timer: 1000, showConfirmButton: false });
        setIsUserClosedActive(true);
        fetchReports();
      } catch (err) { Swal.fire('ผิดพลาด', 'ไม่สามารถปิดเคสได้', 'error'); }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedReport) return;
    const roomId = selectedReport.id || selectedReport._id;
    const textToSend = inputMessage;
    setInputMessage(""); 

    try {
      await api.post(`/contact/${roomId}/send`, { message: textToSend, text: textToSend, content: textToSend });
      const response = await api.get(`/contact/${roomId}/messages`);
      const msgs = response.data.messages || response.data || [];
      if (Array.isArray(msgs)) setMessages(msgs);
    } catch (err) { Swal.fire('ผิดพลาด', 'ไม่สามารถส่งข้อความได้', 'error'); }
  };

  const filteredReports = reports.filter(r => {
    const userInfo = r.user || r; 
    return userInfo.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || userInfo.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalContacts = reports.length;
  const closedCases = reports.filter(r => r.status === 'closed').length;

  return (
    <div className="flex-1 p-8 md:p-12 bg-[#FDF8F1] min-h-screen font-['Kanit'] text-[#4A453A]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-5xl font-black text-[#4A453A]">จัดการ <span className="text-[#FF8E6E]">แชทลูกค้า</span></h1>
          <p className="text-lg opacity-60 font-bold mt-2 italic">ตอบกลับข้อความสอบถามจากผู้ใช้งานแบบ Real-time</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="ค้นหาชื่อหรืออีเมล..." className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-none shadow-sm focus:ring-4 focus:ring-[#FF8E6E]/10 font-bold outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-w-2xl">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100/50 flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FF8E6E]"><Users size={28}/></div>
          <div>
            <p className="text-sm font-bold text-gray-400 leading-tight">ผู้ต้องการติดต่อทั้งหมด</p>
            <h3 className="text-3xl font-black text-[#4A453A] mt-1">{totalContacts} <span className="text-sm font-bold text-gray-400">เคส</span></h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100/50 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500"><CheckSquare size={28}/></div>
          <div>
            <p className="text-sm font-bold text-gray-400 leading-tight">ปิดเคสสำเร็จแล้ว</p>
            <h3 className="text-3xl font-black text-[#4A453A] mt-1">{closedCases} <span className="text-sm font-bold text-gray-400">เคส</span></h3>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => {
          const userInfo = report.user || report; 
          const isClosed = report.status === 'closed';

          return (
            <motion.div layout key={report.id || report._id} onClick={() => setSelectedReport(report)} className={`bg-white rounded-[2.5rem] p-6 shadow-md border-4 border-white cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden group ${isClosed ? 'opacity-60 grayscale' : ''}`}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img src={userInfo.profileImage || `https://ui-avatars.com/api/?name=${userInfo.firstName}&background=FF8E6E&color=fff`} className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-50" alt="profile"/>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[#4A453A] truncate text-lg leading-tight">{userInfo.firstName} {userInfo.lastName}</p>
                    <p className="text-[11px] font-bold text-[#FF8E6E] truncate">{userInfo.email}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest"><Clock size={12}/> {isClosed ? 'ปิดเคสแล้ว' : 'รอการตอบกลับ'}</span>
                  {!isClosed && (
                    <button onClick={(e) => handleCloseCase(e, report.id || report._id)} className="p-2 text-gray-200 hover:text-green-500 transition-colors"><CheckCircle size={18} /></button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[#4A453A]/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2rem] w-full max-w-3xl flex flex-col h-[85vh] max-h-[800px] overflow-hidden shadow-2xl relative">
              <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <img src={(selectedReport.user || selectedReport).profileImage || `https://ui-avatars.com/api/?name=${(selectedReport.user || selectedReport).firstName}&background=FF8E6E&color=fff`} className="w-12 h-12 rounded-full object-cover shadow-sm" alt="user"/>
                  <div>
                    <h3 className="text-lg font-black text-[#2D2A26] leading-tight">{(selectedReport.user || selectedReport).firstName} {(selectedReport.user || selectedReport).lastName}</h3>
                    <p className="text-xs font-bold text-green-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> ห้องสนทนาใช้งานได้</p>
                  </div>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all"><X size={24}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 flex flex-col gap-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60"><MessageCircle size={56} className="mb-3" /><p className="text-base font-bold">เริ่มการสนทนา</p></div>
                ) : (
                  messages.map((msg, index) => {
                    const customerId = (selectedReport.user || selectedReport)._id || (selectedReport.user || selectedReport).id;
                    const msgSenderId = msg.senderId || (msg.sender && (msg.sender._id || msg.sender.id || msg.sender));
                    const isCustomer = msgSenderId === customerId;
                    const isAdmin = !isCustomer;

                    return (
                      <div key={index} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] px-5 py-3 shadow-sm ${isAdmin ? "bg-[#FF8E6E] text-white rounded-[1.5rem] rounded-tr-sm" : "bg-white border border-gray-100 text-[#4A453A] rounded-[1.5rem] rounded-tl-sm"}`}>
                          {!isAdmin && <p className="text-[10px] font-bold text-gray-400 mb-1">{(selectedReport.user || selectedReport).firstName}</p>}
                          <p className="font-medium leading-relaxed text-[15px]">{msg.message || msg.text || msg.content || ""}</p>
                          <p className={`text-[10px] mt-1 text-right ${isAdmin ? "text-white/70" : "text-gray-400"}`}>{new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-gray-100">
                {/* 🌟 แสดงผลล็อกทันทีเมื่อตัวแปรเช็คเจอลูกค้าปิดแชทผ่านทั้ง Socket หรือ Polling */}
                {isUserClosedActive ? (
                  <div className="bg-rose-50 text-rose-500 font-bold text-center py-3 rounded-full text-sm shadow-sm border border-rose-100/50">
                    ผู้ใช้ปิดช่องแชทแล้ว (เคสนี้ถูกปิดลงแล้ว)
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex gap-3 relative bg-[#FDF8F1] p-1.5 rounded-full border border-gray-200/50 focus-within:ring-2 focus-within:ring-[#FF8E6E]/30 focus-within:bg-white transition-all">
                    <input type="text" placeholder="พิมพ์ข้อความตอบกลับที่นี่..." className="flex-1 bg-transparent px-5 outline-none font-medium text-[#4A453A]" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
                    <button type="submit" disabled={!inputMessage.trim()} className="bg-[#FF8E6E] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"><Send size={20} className="ml-1" /></button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}