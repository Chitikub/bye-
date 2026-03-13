"use client";
import { useState, useEffect } from "react";
import { Trash2, Search, Mail, MessageSquare, User, Clock, Send, X, FileText } from "lucide-react";
// 🌟 เปลี่ยนมาใช้ api ตัวกลางของเรา
import api from "@/api/axios"; 
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminMessages() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null); 
  const [replyText, setReplyText] = useState("");

  // 🌟 ฟังก์ชันดึงรายงานทั้งหมด
  const fetchReports = async () => {
    try {
      setLoading(true);
      // ใช้ api.get แทน axios.get
      const res = await api.get("/contact");
      const data = res.data.contacts || res.data;
      
      setReports(
        Array.isArray(data) 
          ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) 
          : []
      );
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        window.location.href = "/login"; // ถ้า Token หลุด ให้ไป Login
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchReports(); 
  }, []);

  // 🌟 ฟังก์ชันลบรายงาน
  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    if (!id) return;
    
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "ข้อมูลรายงานนี้จะถูกลบถาวร",
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
        await api.delete(`/contact/${id}`);
        Swal.fire({ title: 'ลบสำเร็จ!', icon: 'success', timer: 1000, showConfirmButton: false });
        fetchReports();
      } catch (err) {
        Swal.fire('ผิดพลาด', 'ไม่สามารถลบได้', 'error');
      }
    }
  };

  // 🌟 ฟังก์ชันส่งข้อความตอบกลับ
  const handleSendReply = async (e) => {
    e.preventDefault();
    const reportId = selectedReport.id || selectedReport._id;
    try {
      await api.put(`/contact/${reportId}`, {
        adminReply: replyText,
        status: 'replied'
      });

      Swal.fire({ icon: 'success', title: 'ส่งข้อความตอบกลับแล้ว', timer: 1500, showConfirmButton: false });
      setSelectedReport(null);
      setReplyText("");
      fetchReports();
    } catch (err) {
      Swal.fire('ผิดพลาด', 'ไม่สามารถส่งข้อความได้', 'error');
    }
  };

  const filteredReports = reports.filter(r => 
    r.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 md:p-12 bg-[#FDF8F1] min-h-screen font-['Kanit'] text-[#4A453A]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black text-[#4A453A]">รายงาน <span className="text-[#FF8E6E]">จากผู้ใช้</span></h1>
          <p className="text-lg opacity-60 font-bold mt-2 italic">จัดการและตอบกลับปัญหาของผู้ใช้งานในระบบ</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="ค้นหาหัวข้อหรือชื่อ..." 
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-none shadow-sm focus:ring-4 focus:ring-[#FF8E6E]/10 font-bold outline-none transition-all" 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse font-black text-2xl opacity-20">กำลังโหลดข้อความ...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <motion.div 
              layout 
              key={report.id || report._id} 
              onClick={() => {
                setSelectedReport(report);
                setReplyText(report.adminReply || "");
              }}
              className="bg-white rounded-[2.5rem] p-6 shadow-md border-4 border-white cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 px-4 py-1.5 font-black text-[9px] uppercase tracking-tighter rounded-bl-2xl ${report.status === 'replied' ? 'bg-green-500 text-white' : 'bg-orange-400 text-white animate-pulse'}`}>
                {report.status === 'replied' ? 'ตอบกลับแล้ว' : 'ใหม่'}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#FF8E6E]">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black opacity-40 uppercase truncate">{report.subject || "สอบถามทั่วไป"}</p>
                    <p className="font-bold text-[#4A453A] truncate">{report.name || report.user?.firstName || "ผู้ใช้งาน"}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 h-10 leading-relaxed font-medium">
                  {report.message}
                </p>

                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                    <Clock size={12}/> {new Date(report.createdAt).toLocaleDateString('th-TH')}
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

      {/* --- Popup Modal: ดูรายละเอียดและตอบกลับ --- */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[#4A453A]/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="bg-white rounded-[3.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border-8 border-white"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                <div>
                  <span className="px-4 py-1 bg-orange-100 text-[#FF8E6E] rounded-full text-xs font-black uppercase mb-2 inline-block">
                    {selectedReport.subject || "Report"}
                  </span>
                  <h3 className="text-3xl font-black text-[#2D2A26]">รายละเอียดรายงาน</h3>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-3 bg-white shadow-sm rounded-2xl hover:bg-gray-100 transition-all border border-gray-100 text-gray-400">
                  <X size={24}/>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 font-['Kanit']">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#FDF8F1] rounded-2xl border border-orange-50">
                    <p className="text-[10px] font-black opacity-40 uppercase mb-1">ผู้แจ้งเรื่อง</p>
                    <p className="font-bold flex items-center gap-2"><User size={14} className="text-[#FF8E6E]"/> {selectedReport.name || selectedReport.user?.firstName}</p>
                  </div>
                  <div className="p-4 bg-[#FDF8F1] rounded-2xl border border-orange-50">
                    <p className="text-[10px] font-black opacity-40 uppercase mb-1">อีเมลติดต่อ</p>
                    <p className="font-bold flex items-center gap-2 text-sm truncate"><Mail size={14} className="text-[#FF8E6E]"/> {selectedReport.email || selectedReport.user?.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-black text-[#4A453A] flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#FF8E6E]"/> ข้อความจากผู้ใช้งาน:
                  </p>
                  <div className="p-6 bg-gray-50 rounded-[2rem] text-lg text-[#4A453A] leading-relaxed font-medium italic border border-gray-100">
                    "{selectedReport.message}"
                  </div>
                </div>

                <hr className="border-gray-100" />

                <form onSubmit={handleSendReply} className="space-y-4">
                  <p className="text-sm font-black text-[#4A453A] flex items-center gap-2">
                    <Send size={16} className="text-blue-500"/> ตอบกลับผู้ใช้งาน:
                  </p>
                  <textarea 
                    required 
                    rows="4" 
                    className="w-full p-6 bg-[#FDF8F1] rounded-[2rem] outline-none focus:ring-4 focus:ring-[#FF8E6E]/20 font-bold text-[#4A453A] resize-none border-none placeholder:opacity-30" 
                    placeholder="พิมพ์ข้อความตอบกลับที่นี่..." 
                    value={replyText} 
                    onChange={(e) => setReplyText(e.target.value)} 
                  />
                  <button 
                    type="submit" 
                    className="w-full py-5 bg-[#FF8E6E] text-white rounded-[2rem] font-black text-xl shadow-xl shadow-[#FF8E6E]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {selectedReport.status === 'replied' ? 'อัปเดตคำตอบ' : 'ส่งคำตอบกลับ'}
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