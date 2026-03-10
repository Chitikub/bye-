"use client";
import { useState, useEffect } from "react";
import {
  Trash2,
  Search,
  Plus,
  Map as MapIcon,
  Edit3,
  X,
  Save,
  Image as ImageIcon,
  ExternalLink,
  AlignLeft,
  Info,
  Eye,
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import CategoryChip from "../../components/Category";
import DetailCard from "../../components/DetailCard"; // ✅ Import ไฟล์ใหม่ที่คุณสร้างไว้

export default function AdminPlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ States สำหรับควบคุม Modal รายละเอียด
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    description: "",
    category: "",
    mapUrl: "",
    rating: 0,
  });

  const categories = [
    { name: "ธรรมชาติ", icon: "🌿" },
    { name: "คาเฟ่", icon: "☕" },
    { name: "วัด", icon: "🛕" },
    { name: "ชายหาด", icon: "🏖️" },
    { name: "ภูเขา", icon: "⛰️" },
    { name: "สวนสาธารณะ", icon: "🌳" },
    { name: "ร้านอาหาร", icon: "🍽️" },
  ];

  const baseUrl = "https://moodlocationfinder-backend.onrender.com/api/v1";

  const getTokenFromCookie = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
  };

  const fetchPlaces = async () => {
    try {
      const token = getTokenFromCookie();
      const response = await axios.get(`${baseUrl}/places`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.places || response.data;
      setPlaces(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching places:", error);
      if (error.response?.status === 401) handleAuthError();
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = () => {
    localStorage.clear();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.dispatchEvent(new Event("authChange"));
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  // ✅ ฟังก์ชันเปิดดูรายละเอียด
  const handleOpenDetail = (place) => {
    setSelectedPlace(place);
    setIsDetailOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getTokenFromCookie();
    try {
      if (editingPlace) {
        await axios.put(
          `${baseUrl}/admin/places/${editingPlace._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        Swal.fire({
          title: "แก้ไขสำเร็จ!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await axios.post(`${baseUrl}/admin/places`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire({
          title: "เพิ่มสถานที่สำเร็จ!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      setIsModalOpen(false);
      fetchPlaces();
    } catch (error) {
      if (error.response?.status === 401) handleAuthError();
      else Swal.fire("ผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", "error");
    }
  };

  const handleDelete = (e, id, name) => {
    e.stopPropagation(); // ✅ กันไม่ให้คลิกแล้วไปเปิดหน้ารายละเอียด
    Swal.fire({
      title: "ยืนยันการลบ?",
      text: `ต้องการลบ "${name}" ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "ลบข้อมูล",
      background: "#FDF8F1",
      customClass: { popup: "rounded-[2rem]" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = getTokenFromCookie();
          await axios.delete(`${baseUrl}/admin/places/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire({
            title: "ลบเรียบร้อย!",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
          fetchPlaces();
        } catch (error) {
          if (error.response?.status === 401) handleAuthError();
          else Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบข้อมูลได้", "error");
        }
      }
    });
  };

  const handleAddClick = () => {
    setEditingPlace(null);
    setFormData({
      name: "",
      image: "",
      description: "",
      category: "",
      mapUrl: "",
      rating: 0,
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (e, place) => {
    e.stopPropagation(); // ✅ กันไม่ให้เปิดรายละเอียดซ้อน
    setEditingPlace(place);
    setFormData({
      name: place.name || "",
      image: place.image || "",
      description: place.description || "",
      category: place.category || "",
      mapUrl: place.mapUrl || "",
      rating: place.rating || 0,
    });
    setIsModalOpen(true);
  };

  const filteredPlaces = places.filter((place) =>
    place.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-8 md:p-12 font-['Kanit'] bg-[#FDF8F1] min-h-screen relative text-[#4A453A]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="font-black text-[#4A453A] leading-tight text-4xl md:text-5xl">
            จัดการ <span className="text-[#FF8E6E]">สถานที่</span>
          </h1>
          <p className="text-[#4A453A] text-[18px] font-medium opacity-80">
            จัดการพิกัดท่องเที่ยวแบบครบวงจร
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-[350px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหาชื่อพิกัด..."
              className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] bg-white border-none shadow-sm outline-none text-[#4A453A]"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleAddClick}
            className="bg-[#FF8E6E] text-white p-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-bold"
          >
            <Plus size={24} /> เพิ่มสถานที่
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-[#4A453A]/5 overflow-hidden border border-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#4A453A] text-white">
              <tr>
                <th className="p-8 font-bold text-[16px] uppercase tracking-widest rounded-tl-[3rem]">
                  สถานที่
                </th>
                <th className="p-8 font-bold text-[16px] uppercase tracking-widest">
                  หมวดหมู่
                </th>
                <th className="p-8 font-bold text-[16px] uppercase tracking-widest text-center">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="3"
                    className="p-32 text-center animate-pulse font-bold text-xl opacity-60"
                  >
                    กำลังโหลดพิกัด...
                  </td>
                </tr>
              ) : filteredPlaces.length > 0 ? (
                filteredPlaces.map((place, index) => (
                  <tr
                    key={place._id || index}
                    onClick={() => handleOpenDetail(place)} // ✅ เชื่อมเปิด DetailCard
                    className="hover:bg-gray-50/80 transition-all group cursor-pointer"
                  >
                    <td className="p-8">
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 bg-[#FDF8F1] rounded-2xl overflow-hidden shadow-sm border border-white flex items-center justify-center text-[#FF8E6E]">
                          {place.image ? (
                            <img
                              src={place.image}
                              className="w-full h-full object-cover"
                              alt="place"
                            />
                          ) : (
                            <MapIcon size={28} />
                          )}
                        </div>
                        <div>
                          <span className="font-black text-[#4A453A] text-xl block leading-tight">
                            {place.name}
                          </span>
                          <span className="text-xs text-blue-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
                            <Eye size={12} /> คลิกเพื่อดูรายละเอียด
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <CategoryChip category={place.category} />
                    </td>
                    <td className="p-8">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={(e) => handleEditClick(e, place)}
                          className="p-4 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-90"
                        >
                          <Edit3 size={24} />
                        </button>
                        <button
                          onClick={(e) =>
                            handleDelete(e, place._id, place.name)
                          }
                          className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="p-32 text-center text-gray-400 italic"
                  >
                    ไม่พบข้อมูลสถานที่
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ 1. Modal แสดงรายละเอียด (ใหม่) */}
      <AnimatePresence>
        {isDetailOpen && selectedPlace && (
          <DetailCard
            place={selectedPlace}
            onClose={() => setIsDetailOpen(false)}
            onEdit={(place) => {
              setIsDetailOpen(false);
              handleEditClick(null, place);
            }}
          />
        )}
      </AnimatePresence>

      {/* ✅ 2. Modal Form เพิ่ม/แก้ไข (เดิม) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#4A453A]/40 backdrop-blur-md">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-[3.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-8 border-white"
            >
              <form onSubmit={handleSubmit} className="relative text-[#4A453A]">
                <div className="sticky top-0 p-8 bg-[#4A453A] text-white flex justify-between items-center z-10">
                  <h3 className="text-3xl font-black">
                    {editingPlace ? "แก้ไขข้อมูลสถานที่" : "เพิ่มพิกัดใหม่"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="hover:rotate-90 transition-transform"
                  >
                    <X size={32} />
                  </button>
                </div>
                <div className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 font-black text-xl text-[#4A453A]">
                        <ImageIcon size={20} className="text-[#FF8E6E]" />{" "}
                        รูปภาพ (URL)
                      </label>
                      <input
                        required
                        className="w-full p-5 bg-[#FDF8F1] rounded-[1.5rem] outline-none border-2 border-transparent focus:border-[#FF8E6E] transition-all"
                        value={formData.image}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="font-black text-xl text-[#4A453A]">
                        ตัวอย่างรูปภาพ
                      </label>
                      <div className="aspect-video w-full bg-[#FDF8F1] rounded-[2rem] border-4 border-dashed border-[#EFE9D9] flex items-center justify-center overflow-hidden">
                        {formData.image ? (
                          <img
                            src={formData.image}
                            className="w-full h-full object-cover"
                            onError={(e) =>
                              (e.target.src =
                                "https://placehold.co/600x400?text=Invalid+Image")
                            }
                          />
                        ) : (
                          <ImageIcon size={64} className="opacity-20" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="font-black text-xl">ชื่อสถานที่</label>
                      <input
                        required
                        className="w-full p-5 bg-[#FDF8F1] rounded-[1.5rem] outline-none border-2 border-transparent focus:border-[#FF8E6E] transition-all"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-black text-xl">หมวดหมู่</label>
                      <select
                        required
                        className="w-full p-5 bg-[#FDF8F1] rounded-[1.5rem] outline-none border-2 border-transparent focus:border-[#FF8E6E] transition-all font-bold"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                      >
                        <option value="">เลือกหมวดหมู่...</option>
                        {categories.map((cat) => (
                          <option key={cat.name} value={cat.name}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-black text-xl">
                      <AlignLeft size={20} className="text-[#FF8E6E]" />{" "}
                      รายละเอียด
                    </label>
                    <textarea
                      rows="5"
                      required
                      className="w-full p-6 bg-[#FDF8F1] rounded-[2rem] outline-none border-2 border-transparent focus:border-[#FF8E6E] transition-all"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-black text-xl">
                      <ExternalLink size={20} className="text-[#FF8E6E]" />{" "}
                      ลิงก์แผนที่
                    </label>
                    <input
                      className="w-full p-5 bg-[#FDF8F1] rounded-[1.5rem] outline-none border-2 border-transparent focus:border-[#FF8E6E] transition-all"
                      value={formData.mapUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, mapUrl: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="p-10 sticky bottom-0 bg-white border-t border-gray-100">
                  <button
                    type="submit"
                    className="w-full bg-[#FF8E6E] text-white py-5 rounded-[2rem] font-black text-2xl shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
                  >
                    <Save size={28} /> บันทึกข้อมูล
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
