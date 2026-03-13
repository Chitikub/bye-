"use client";
import { useState, useEffect } from "react";
import { Trash2, Search, Mail, MessageSquare, User, Clock, Send, X, FileText } from "lucide-react";
import api from "@/api/axios"; 
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminMessages() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null); 
  const [replyText, setReplyText] = useState("");

  // 🌟 ฟังก์ชันดึงรายชื่อผู้ใช้ที่แชทเข้ามา
  const fetchReports = async () => {
    try {
      setLoading(true);
      // ดึงรายชื่อผู้ใช้ที่มีการแชท (ตาม Endpoint ใน Backend ของคุณ)
      const res = await api.get('/messages/users'); 
      const data = res.data || [];
      
      setReports(
        Array.isArray(data) 
          ? data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) 
          : []
      );
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchReports(); 
  }, []);

  // 🌟 ฟังก์ชันลบรายการแชท
  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    if (!id) return;
    
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "การสนทนาและข้อมูลแชทนี้จะถูกลบออกถาวร",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก',
      background: '#FDF8F1',
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/messages/${id}`); 
        Swal.fire({ title: 'ลบสำเร็จ!', icon: 'success', timer: 1000, showConfirmButton: false });
        fetchReports();
      } catch (err) {
        Swal.fire('ผิดพลาด', 'ไม่สามารถลบได้ในขณะนี้', 'error');
      }
    }
  };

  // 🌟 ฟังก์ชันส่งข้อความตอบกลับไปยังผู้ใช้
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const userId = selectedReport.id || selectedReport._id;
    try {
      // ใช้ Endpoint: /api/v1/messages/send/:id
      await api.post(`/messages/send/${userId}`, {
        message: replyText
      });

      Swal.fire({ icon: 'success', title: 'ส่งข้อความสำเร็จ', timer: 1500, showConfirmButton: false });
      setSelectedReport(null);
      setReplyText("");
      fetchReports();
    } catch (err) {
      Swal.fire('ผิดพลาด', 'ไม่สามารถส่งข้อความได้', 'error');
    }
  };

  const filteredReports = reports.filter(r => 
    r.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 md:p-12 bg-[#FDF8F1] min-h-screen font-['Kanit'] text-[#4A453A]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black text-[#4A453A]">จัดการ <span className="text-[#FF8E6E]">แชทลูกค้า</span></h1>
          <p className="text-lg opacity-60 font-bold mt-2 italic">ตอบกลับข้อความสอบถามจากผู้ใช้งานแบบ Real-time</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อหรืออีเมล..." 
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-none shadow-sm focus:ring-4 focus:ring-[#FF8E6E]/10 font-bold outline-none transition-all" 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse font-black text-2xl opacity-20 italic">กำลังโหลดข้อมูลแชท...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <motion.div 
              layout 
              key={report.id || report._id} 
              onClick={() => setSelectedReport(report)}
              className="bg-white rounded-[2.5rem] p-6 shadow-md border-4 border-white cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden group"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={report.profileImage || `https://ui-avatars.com/api/?name=${report.firstName}&background=FF8E6E&color=fff`} 
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-50"
                    alt="profile"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[#4A453A] truncate text-lg leading-tight">{report.firstName} {report.lastName}</p>
                    <p className="text-[11px] font-bold text-[#FF8E6E] truncate">{report.email}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                    <Clock size={12}/> {report.lastMessageDate || 'Active User'}
                  </span>
                  <button 
                    onClick={(e) => handleDelete(e, report.id || report._id)}
                    className="p-2 text-gray-200 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* --- Popup Modal: ตอบกลับแชท --- */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[#4A453A]/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white rounded-[3.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border-8 border-white"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedReport.profileImage || `https://ui-avatars.com/api/?name=${selectedReport.firstName}&background=FF8E6E&color=fff`} 
                    className="w-14 h-14 rounded-2xl object-cover"
                    alt="user"
                  />
                  <div>
                    <h3 className="text-2xl font-black text-[#2D2A26] leading-tight">{selectedReport.firstName}</h3>
                    <p className="text-sm font-bold text-[#FF8E6E]">{selectedReport.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-3 bg-white shadow-sm rounded-2xl hover:bg-gray-100 transition-all text-gray-400">
                  <X size={24}/>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                 <div className="bg-[#FDF8F1] p-6 rounded-[2rem] border border-orange-50 mb-8">
                    <p className="text-xs font-black text-[#FF8E6E] uppercase mb-2 tracking-widest">ระบบแชท 1-on-1</p>
                    <p className="text-lg font-medium text-[#4A453A]">คุณกำลังส่งข้อความในนามผู้ดูแลระบบ ข้อความจะปรากฏในหน้าแชทของผู้ใช้งานทันที</p>
                 </div>

                <form onSubmit={handleSendReply} className="space-y-4">
                  <p className="text-sm font-black text-[#4A453A] flex items-center gap-2">
                    <Send size={16} className="text-blue-500"/> พิมพ์ข้อความตอบกลับ:
                  </p>
                  <textarea 
                    required 
                    rows="5" 
                    className="w-full p-6 bg-gray-50 rounded-[2rem] outline-none focus:ring-4 focus:ring-[#FF8E6E]/10 font-bold text-[#4A453A] resize-none border-none placeholder:opacity-30" 
                    placeholder="พิมพ์ข้อความของคุณที่นี่..." 
                    value={replyText} 
                    onChange={(e) => setReplyText(e.target.value)} 
                  />
                  <button 
                    type="submit" 
                    className="w-full py-5 bg-[#FF8E6E] text-white rounded-[2rem] font-black text-xl shadow-xl shadow-[#FF8E6E]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <Send size={20} /> ยืนยันการส่งข้อความ
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}