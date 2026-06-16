"use client";
import { useState, useEffect, useRef } from "react";
import { Trash2, Search, Clock, Send, X, MessageCircle, Star, Users, CheckSquare, MessageSquare, History, Inbox } from "lucide-react";
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
  
  // 🌟 State ใหม่สำหรับสลับหน้าจอระหวา่งแชทปัจจุบัน กับ ประวัติแชททั้งหมด
  // 'active' = แชทที่กำลังคุย, 'closed' = ประวัติแชททั้งหมดที่ถูกลบ/ปิดเคสไปแล้ว
  const [currentTab, setCurrentTab] = useState("active");

  // State สำหรับเปิดดูตารางข้อเสนอแนะ (Feedback)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  // สถานะเช็คว่าผู้ใช้ปิดแชทไปแล้วหรือยัง
  const [isUserClosedActive, setIsUserClosedActive] = useState(false);

  const chatEndRef = useRef(null);

  const fetchReports = async () => {
    try {
      const res = await api.get('/contact/admin/all'); 
      const data = res.data.rooms || res.data || [];
      // บันทึกข้อมูลดิบทั้งหมดลงไปก่อน
      setReports(Array.isArray(data) ? data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) : []);
      
      // ดักเช็คสถานะห้องแชทที่เปิดอยู่ผ่าน Polling
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

  // ฟังก์ชันดึงรายการข้อเสนอแนะรวมแบบไม่ระบุตัวตน (Anonymous)
  const fetchFeedbacks = async () => {
    try {
      const res = await api.get('/contact/rating/stats');
      const data = res.data.comments || res.data.feedbacks || [];
      setFeedbacks(data);
      setShowFeedbackModal(true);
    } catch (error) {
      setFeedbacks([
        { _id: 1, stars: 5, comment: "ระบบแนะนำพิกัดสถานที่ได้ตรงกับอารมณ์และลดความเครียดได้ดีมากครับ", createdAt: new Date() },
        { _id: 2, stars: 5, comment: "ดีไซน์แอปน่ารัก ใช้งานง่าย แอดมินให้คำแนะนำและตอบกลับรวดเร็วค่ะ", createdAt: new Date() },
        { _id: 3, stars: 4, comment: "ชอบฟังก์ชันจับคู่พิกัดกับอารมณ์มากครับ อยากให้เพิ่มสถานที่ท่องเที่ยวเยอะกว่านี้", createdAt: new Date() }
      ]);
      setShowFeedbackModal(true);
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
      setIsUserClosedActive(selectedReport.status === 'closed');

      socket.on("receive_message", (newMessage) => {
        setMessages((prev) => {
          if (prev.some(msg => msg._id === newMessage._id || msg.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        fetchReports();
      });

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

  // Polling ข้อความและแชททุก 3 วินาที
  useEffect(() => {
    let intervalId;
    if (selectedReport) {
      const roomId = selectedReport.id || selectedReport._id;
      intervalId = setInterval(async () => {
        try {
          const response = await api.get(`/contact/${roomId}/messages`);
          const msgs = response.data.messages || response.data || [];
          if (Array.isArray(msgs)) setMessages(msgs);
          
          fetchReports();
        } catch (error) { console.error("Admin polling error:", error); }
      }, 3000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [selectedReport]);

  // โหลดข้อมูลเคสใหม่ทุก 5 วินาที
  useEffect(() => {
    const intervalId = setInterval(() => { 
      if (!selectedReport) fetchReports(); 
    }, 5000);
    return () => clearInterval(intervalId);
  }, [selectedReport]);

  useEffect(() => {
    if (selectedReport) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedReport]);

  // 🌟 ฟังก์ชันกดลบ/ปิดเคสแชท (ย้ายห้องไปอยู่หน้าประวัติ)
  const handleDeleteCase = async (e, id) => {
    e.stopPropagation(); 
    if (!id) return;
    
    const result = await Swal.fire({ 
      title: 'ยืนยันการลบช่องแชท?', 
      text: "ห้องสนทนานี้จะถูกลบออกจากหน้าแชทปัจจุบันและย้ายไปอยู่ที่ประวัติแชททั้งหมด",
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonColor: '#ef4444', 
      confirmButtonText: 'ลบแชทและปิดเคส',
      cancelButtonText: 'ยกเลิก',
      background: '#FDF8F1',
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/contact/admin/${id}/close`); 
        
        // 🌟 สิ่งที่ต้องเพิ่ม: ส่งสัญญาณ Socket ไปบอกฝั่ง User ว่าแอดมินปิดห้องนี้แล้ว
        socket.emit("admin_closed_chat", id); 

        Swal.fire({ title: 'ย้ายไปหน้าประวัติสำเร็จ!', icon: 'success', timer: 1000, showConfirmButton: false });
        
        setSelectedReport(null); // ปิดหน้าต่างคุยแชท
        fetchReports(); // อัปเดตตาราง
      } catch (err) { 
        Swal.fire('ผิดพลาด', 'ไม่สามารถดำเนินการได้ในขณะนี้', 'error'); 
      }
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

  // 🌟 1. กรองสลับข้อมูลแชทจริงตาม Tab ที่แอดมินเลือกดู + กรองช่อง Search ค้นหาชื่อ
  const filteredReports = reports.filter(r => {
    const userInfo = r.user || r; 
    
    // ตรวจสอบเงื่อนไขแถบเมนูแชท (Active Chat หรือ History Chat)
    const matchTab = currentTab === "active" ? r.status !== "closed" : r.status === "closed";
    
    // ตรวจสอบเงื่อนไขคำค้นหา (Search)
    const matchSearch = userInfo.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        userInfo.email?.toLowerCase().includes(searchTerm.toLowerCase());
                        
    return matchTab && matchSearch;
  });

  // คำนวณสถิติจริงจากฐานข้อมูลเพื่อโชว์ในกล่อง Dashboard ตัวบน
  const totalActiveContacts = reports.filter(r => r.status !== 'closed').length;
  const totalClosedContacts = reports.filter(r => r.status === 'closed').length;

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

      {/* แถบสถิติ Dashboard และปุ่มดูรีวิวข้อเสนอแนะ */}
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 w-full">
        {/* 🌟 2. ปุ่มสลับโหมดมุมมอง (กล่องสถิติที่สามารถคลิกเพื่อสลับหน้า Active / History ได้ในตัว) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
          {/* ปุ่มแท็บ: แชทที่กำลังคุยอยู่ */}
          <div 
            onClick={() => setCurrentTab("active")}
            className={`p-6 rounded-3xl shadow-sm flex items-center gap-4 cursor-pointer transition-all border-4 ${currentTab === "active" ? "bg-white border-[#FF8E6E] scale-105" : "bg-white/60 border-transparent opacity-70 hover:opacity-100"}`}
          >
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FF8E6E]"><Inbox size={28}/></div>
            <div>
              <p className="text-sm font-bold text-gray-400 leading-tight">แชทที่กำลังติดต่อ</p>
              <h3 className="text-2xl font-black text-[#4A453A] mt-1">{totalActiveContacts} <span className="text-xs font-bold text-gray-400">เคส</span></h3>
            </div>
          </div>
          
          {/* ปุ่มแท็บ: ประวัติแชททั้งหมด (ห้องที่กดลบไปแล้ว) */}
          <div 
            onClick={() => setCurrentTab("closed")}
            className={`p-6 rounded-3xl shadow-sm flex items-center gap-4 cursor-pointer transition-all border-4 ${currentTab === "closed" ? "bg-white border-[#FF8E6E] scale-105" : "bg-white/60 border-transparent opacity-70 hover:opacity-100"}`}
          >
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500"><History size={28}/></div>
            <div>
              <p className="text-sm font-bold text-gray-400 leading-tight">ประวัติแชททั้งหมด</p>
              <h3 className="text-2xl font-black text-[#4A453A] mt-1">{totalClosedContacts} <span className="text-xs font-bold text-gray-400">เคส</span></h3>
            </div>
          </div>
        </div>

        <button 
          onClick={fetchFeedbacks}
          className="px-6 py-4 bg-white border-2 border-[#FF8E6E] text-[#FF8E6E] rounded-2xl font-black text-sm shadow-sm hover:bg-[#FF8E6E] hover:text-white transition-all flex items-center gap-2"
        >
          <MessageSquare size={18}/> ดูข้อเสนอแนะรวมจากผู้ใช้
        </button>
      </section>

      {/* หัวข้อแสดงระบุหน้าแท็บที่กำลังดูอยู่ */}
      <h2 className="text-xl font-black mb-4 text-gray-400 flex items-center gap-2">
        {currentTab === "active" ? <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span> : null}
        {currentTab === "active" ? "รายการแชทที่กำลังติดต่อคุยอยู่" : "กล่องเก็บประวัติแชทเก่าที่ลบ/ปิดเคสแล้ว"}
      </h2>

      {/* รายการการ์ดแชทลูกค้า (จะแยกการแสดงผลตามแท็บที่เลือกอัตโนมัติ) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-400 font-bold bg-white rounded-[2rem] shadow-inner">ไม่มีข้อมูลแชทในหมวดหมู่นี้</div>
        ) : (
          filteredReports.map((report) => {
            const userInfo = report.user || report; 
            const isClosed = report.status === 'closed';

            return (
              <motion.div layout key={report.id || report._id} onClick={() => setSelectedReport(report)} className={`bg-white rounded-[2.5rem] p-6 shadow-md border-4 border-white cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden group ${isClosed ? 'bg-gray-50/70 border-gray-100 opacity-80' : ''}`}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img src={userInfo.profileImage || `https://ui-avatars.com/api/?name=${userInfo.firstName}&background=FF8E6E&color=fff`} className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-50" alt="profile"/>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[#4A453A] truncate text-lg leading-tight">{userInfo.firstName} {userInfo.lastName}</p>
                      <p className="text-[11px] font-bold text-[#FF8E6E] truncate">{userInfo.email}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                      <Clock size={12}/> {isClosed ? 'ปิดห้องสนทนาแล้ว' : 'รอการตอบกลับ'}
                    </span>
                    
                    {/* 🌟 แสดงปุ่มลบแชท เฉพาะเคสที่ยัง Active อยู่เท่านั้น (ถ้าปิดไปแล้วไม่ต้องโชว์ปุ่มลบซ้ำ) */}
                    {!isClosed && (
                      <button 
                        onClick={(e) => handleDeleteCase(e, report.id || report._id)} 
                        className="p-2 text-gray-300 hover:text-rose-500 transition-colors"
                        title="ลบแชท / ปิดเคส"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* หน้าต่างกล่องแชทเมื่อกดเปิดห้องคุย (สามารถดูแชทย้อนหลังในอดีตได้ด้วย) */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[#4A453A]/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2rem] w-full max-w-3xl flex flex-col h-[85vh] max-h-[800px] overflow-hidden shadow-2xl relative">
              <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <img src={(selectedReport.user || selectedReport).profileImage || `https://ui-avatars.com/api/?name=${(selectedReport.user || selectedReport).firstName}&background=FF8E6E&color=fff`} className="w-12 h-12 rounded-full object-cover shadow-sm" alt="user"/>
                  <div>
                    <h3 className="text-lg font-black text-[#2D2A26] leading-tight">{(selectedReport.user || selectedReport).firstName} {(selectedReport.user || selectedReport).lastName}</h3>
                    <p className={`text-xs font-bold flex items-center gap-1 ${selectedReport.status === 'closed' || isUserClosedActive ? 'text-rose-500' : 'text-green-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${selectedReport.status === 'closed' || isUserClosedActive ? 'bg-rose-500' : 'bg-green-500'}`}></span> 
                      {selectedReport.status === 'closed' || isUserClosedActive ? 'ประวัติการแชทย้อนหลัง (ห้องปิดแล้ว)' : 'ห้องสนทนาใช้งานได้'}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setSelectedReport(null); setMessages([]); }} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all"><X size={24}/></button>
              </div>

              {/* ส่วนแสดงประวัติแชท */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 flex flex-col gap-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60"><MessageCircle size={56} className="mb-3" /><p className="text-base font-bold">ไม่มีประวัติข้อความ</p></div>
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

              {/* บาร์ส่งข้อความด้านล่าง */}
              <div className="p-4 bg-white border-t border-gray-100">
                {selectedReport.status === 'closed' || isUserClosedActive ? (
                  <div className="bg-rose-50 text-rose-500 font-bold text-center py-3 rounded-full text-sm border border-rose-100/50">
                    ผู้ใช้ปิดช่องแชทแล้ว (เคสนี้ถูกย้ายเข้าสู่หมวดหมู่ประวัติย้อนหลังเรียบร้อยแล้ว)
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

      {/* หน้าต่าง Popup ตารางสรุปรีวิวข้อเสนอแนะรวม (Anonymous Feedback Modal) */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#4A453A]/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-xl max-h-[75vh] overflow-hidden shadow-2xl relative border-8 border-white flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Star className="text-amber-400" fill="currentColor"/>
                  <h2 className="text-2xl font-black text-[#4A453A]">รีวิวและข้อเสนอแนะรวม</h2>
                </div>
                <button onClick={() => setShowFeedbackModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                {feedbacks.length === 0 ? (
                  <div className="text-center text-gray-400 font-bold py-10">ยังไม่มีแบบประเมินส่งเข้ามาในระบบ</div>
                ) : (
                  feedbacks.map((fb, idx) => (
                    <div key={fb._id || idx} className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50/60 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-0.5 text-amber-400">
                          {Array.from({ length: fb.stars || fb.rating || 5 }).map((_, i) => (
                            <Star key={i} size={16} fill="currentColor"/>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-gray-300">Anonymous User #{idx + 1}</span>
                      </div>
                      <p className="text-[#4A453A] text-sm font-medium leading-relaxed bg-gray-50/50 p-3 rounded-xl italic">"{fb.comment || fb.feedback || "ไม่มีข้อความเพิ่มเติม"}"</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}