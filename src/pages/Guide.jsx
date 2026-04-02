"use client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserPlus,
  Search,
  MapPin,
  Heart,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Map,
  Compass,
} from "lucide-react";

export default function GuidePage() {
  const navigate = useNavigate();

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  /* ── step data ── */
  const steps = [
    {
      num: "1",
      icon: <UserPlus size={28} />,
      iconBg: "bg-[#4A453A]",
      title: "เริ่มต้นด้วยการเข้าสู่ระบบ",
      body: (
        <>
          เพื่อประสบการณ์ที่ดีที่สุด แนะนำให้คุณ{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-[#FF8E6E] font-bold hover:underline"
          >
            เข้าสู่ระบบ
          </button>{" "}
          หรือสมัครสมาชิกก่อนใช้งาน เพื่อให้ระบบสามารถจดจำประวัติการเดินทาง
          และให้คุณสามารถกด "ถูกใจ" สถานที่ที่ชอบเก็บไว้ดูทีหลังได้
        </>
      ),
      bullets: [
        "ข้อมูลของคุณจะถูกเก็บเป็นความลับ",
        "บันทึกประวัติการค้นหาสถานที่",
        "จัดการรายการโปรดส่วนตัวได้ไม่จำกัด",
      ],
      mockup: (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-[#EFE9D9] relative z-10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 border-4 border-white shadow-sm" />
            <div className="h-5 w-28 bg-gray-200 rounded-full mx-auto mb-2" />
            <div className="h-3 w-40 bg-gray-100 rounded-full mx-auto" />
          </div>
          <div className="space-y-3">
            <div className="h-11 bg-gray-50 rounded-xl w-full border border-gray-100" />
            <div className="h-11 bg-gray-50 rounded-xl w-full border border-gray-100" />
            <div className="h-12 bg-[#4A453A] rounded-xl w-full mt-4 opacity-90" />
          </div>
        </div>
      ),
      mockupGrad: "from-[#FF8E6E]/20",
      mockupRot: "rotate-2",
      reverse: false,
    },
    {
      num: "2",
      icon: <Search size={28} />,
      iconBg: "bg-[#FF8E6E]",
      title: "บอกความรู้สึกของคุณ",
      body: (
        <>
          ในหน้าแรก (Home) คุณสามารถหาสถานที่ได้ 2 วิธี:
          <br />
          <br />
          <strong>วิธีที่ 1: พิมพ์ระบายในช่องค้นหา</strong> เช่น "อกหัก",
          "เหนื่อยจัง" ระบบ AI
          จะวิเคราะห์ความรู้สึกและหาสถานที่บำบัดใจให้คุณทันที
          <br />
          <br />
          <strong>วิธีที่ 2: กดเลือกไอคอนอารมณ์</strong> หากไม่รู้จะพิมพ์อะไร
          ก็กดเลือกอิโมจิที่ตรงกับความรู้สึกได้เลย
        </>
      ),
      mockup: (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-[#EFE9D9] relative z-10 flex flex-col gap-4">
          <div className="h-14 bg-gray-50 rounded-2xl w-full flex items-center px-4 gap-3 border border-gray-100">
            <Search className="text-[#FF8E6E] shrink-0" size={18} />
            <div className="h-3 w-32 bg-gray-200 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["😄", "😢", "😡", "🥱"].map((e, i) => (
              <div
                key={i}
                className={`h-20 rounded-2xl flex items-center justify-center text-3xl
                ${i === 0 ? "bg-orange-50 border-2 border-[#FF8E6E]/30" : "bg-gray-50 opacity-50"}`}
              >
                {e}
              </div>
            ))}
          </div>
        </div>
      ),
      mockupGrad: "from-purple-200/40",
      mockupRot: "-rotate-2",
      reverse: true,
    },
    {
      num: "3",
      icon: <MapPin size={28} />,
      iconBg: "bg-blue-500",
      title: "เลือกสถานที่และตรวจสอบระยะทาง",
      body: (
        <>
          ระบบจะดึงสถานที่จาก{" "}
          <strong className="text-blue-500">Google Maps</strong>{" "}
          ที่สอดคล้องกับอารมณ์ โดยจะ{" "}
          <strong className="text-[#FF8E6E]">
            คำนวณระยะทางขับรถจริง และเวลาเดินทาง (นาที)
          </strong>{" "}
          ให้เสร็จสรรพ พร้อมเรียงจากสถานที่ที่ใกล้ที่สุดขึ้นก่อน
        </>
      ),
      extra: (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mt-2">
          <p className="text-[#FF8E6E] font-bold flex items-start gap-2 text-sm">
            <Compass className="shrink-0 mt-0.5" size={16} />
            อย่าลืมกด "อนุญาต" ให้เบราว์เซอร์เข้าถึงตำแหน่ง (GPS)
            เพื่อให้ระบบคำนวณระยะทางได้แม่นยำ
          </p>
        </div>
      ),
      mockup: (
        <div className="bg-white p-5 rounded-3xl shadow-xl border border-[#EFE9D9] relative z-10 space-y-3">
          <div className="h-28 bg-gray-100 rounded-2xl relative overflow-hidden">
            <div className="absolute top-2 right-2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center">
              <Heart size={14} className="text-gray-400" />
            </div>
          </div>
          <div className="h-5 w-3/4 bg-gray-200 rounded-full" />
          <div className="flex justify-between items-center">
            <div className="h-4 w-1/3 bg-gray-100 rounded-full" />
            <div className="h-7 w-20 bg-green-50 rounded-xl" />
          </div>
          <div className="h-11 bg-[#4A453A] rounded-xl w-full" />
        </div>
      ),
      mockupGrad: "from-blue-200/40",
      mockupRot: "rotate-2",
      reverse: false,
    },
    {
      num: "4",
      icon: <Map size={28} />,
      iconBg: "bg-[#00A78E]",
      title: "จัดการรายการโปรด & วางแผนทริป",
      body: (
        <>
          เมื่อเจอร้านที่ใช่ กดไอคอน ❤️ เพื่อเก็บเข้า{" "}
          <strong>"รายการโปรด"</strong> (สูงสุด 10 แห่ง)
          <br />
          <br />
          จากนั้นไปที่เมนู <strong>"วางแผนการเดินทาง"</strong> ระบบจะจัดเรียงบน
          Timeline ตามระยะทาง และกดนำทางผ่าน Google Maps ได้ทันที!
        </>
      ),
      mockup: (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-[#EFE9D9] relative z-10 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-full shrink-0 flex items-center justify-center">
              <MapPin size={16} className="text-green-600" />
            </div>
            <div className="flex-1 h-14 bg-gray-50 rounded-2xl border border-gray-100" />
          </div>
          <div className="w-0.5 h-6 bg-gray-200 ml-4" />
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-white border-4 border-[#FF8E6E] rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-[#FF8E6E]">
              1
            </div>
            <div className="flex-1 h-16 bg-white shadow-sm border border-gray-100 rounded-2xl" />
          </div>
        </div>
      ),
      mockupGrad: "from-green-200/40",
      mockupRot: "-rotate-2",
      reverse: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F1] text-[#4A453A] font-['Prompt',sans-serif] overflow-x-hidden">
      {/* bg blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-orange-200/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-yellow-200/20 rounded-full blur-[100px]" />
      </div>

      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 bg-[#FDF8F1]/80 backdrop-blur-md border-b border-[#EFE9D9]/50">
        <div className="container mx-auto px-4 h-14 sm:h-20 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#7E7869] hover:text-[#FF8E6E] font-bold transition-colors group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#EFE9D9] shadow-sm flex items-center justify-center group-hover:border-[#FF8E6E]">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="hidden sm:inline text-sm">ย้อนกลับ</span>
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-24 relative z-10">
        {/* ── Hero ── */}
        <section className="max-w-3xl mx-auto text-center mb-14 sm:mb-24 px-2">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-4"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-[#FF8E6E] rounded-full font-bold text-xs sm:text-sm"
            >
              <Sparkles size={14} /> คู่มือการใช้งาน
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-[#2D2A26]"
            >
              ให้ความรู้สึก{" "}
              <span className="text-[#FF8E6E] block sm:inline">
                นำทางคุณไปเจอที่ที่ใช่
              </span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg text-[#7E7869] font-medium leading-relaxed max-w-xl mx-auto"
            >
              <span className="text-[#FF8E6E] font-bold">
                MoodLocation Finder
              </span>{" "}
              คือแพลตฟอร์มที่จะช่วยหาสถานที่ที่เหมาะกับอารมณ์ของคุณในแต่ละวัน
              เพียง 4 ขั้นตอนง่ายๆ
            </motion.p>
          </motion.div>
        </section>

        {/* ── Steps ── */}
        {steps.map((step, i) => (
          <motion.section
            key={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="max-w-5xl mx-auto mb-16 sm:mb-28"
          >
            {/*
              มือถือ: stack แนวตั้งเสมอ (mockup บน, text ล่าง)
              desktop: row — สลับซ้าย/ขวาตาม reverse
            */}
            <div
              className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16
              ${step.reverse ? "lg:flex-row-reverse" : ""}`}
            >
              {/* mockup */}
              <div className="w-full max-w-xs sm:max-w-sm lg:flex-1 relative mx-auto lg:mx-0">
                <div
                  className={`absolute inset-0 bg-gradient-to-tr ${step.mockupGrad} to-transparent rounded-3xl transform ${step.mockupRot}`}
                />
                {step.mockup}
              </div>

              {/* text */}
              <div className="flex-1 space-y-4 w-full">
                {/* step badge */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 ${step.iconBg} text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0`}
                  >
                    {step.icon}
                  </div>
                  <span className="text-xs font-bold text-[#AFA99B] uppercase tracking-widest">
                    ขั้นตอนที่ {step.num}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#2D2A26] leading-tight">
                  {step.num}. {step.title}
                </h2>

                <p className="text-[#7E7869] text-base font-medium leading-relaxed">
                  {step.body}
                </p>

                {step.bullets && (
                  <ul className="space-y-2 text-[#7E7869] font-medium text-sm">
                    {step.bullets.map((b, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF8E6E] shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                {step.extra}
              </div>
            </div>
          </motion.section>
        ))}

        {/* ── CTA ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative max-w-3xl mx-auto mt-8 sm:mt-20"
        >
          <div className="absolute inset-0 bg-orange-400 blur-[60px] opacity-10 rounded-[3rem]" />
          <div className="relative bg-gradient-to-r from-[#FF8E6E] to-[#FFA07A] rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-14 text-center shadow-2xl overflow-hidden border border-white/20">
            <div className="absolute top-0 right-0 p-6 opacity-10 hidden sm:block">
              <Sparkles className="w-24 h-24 text-white" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-4 leading-tight relative z-10">
              พร้อมจะออกไปหา{" "}
              <span className="text-[#4A453A]">พื้นที่พักใจ</span> หรือยัง?
            </h2>
            <button
              onClick={() => navigate("/")}
              className="mt-6 group relative inline-flex items-center gap-2 bg-white text-[#4A453A] px-8 py-4 rounded-2xl text-base font-black shadow-xl hover:bg-[#4A453A] hover:text-white transition-all active:scale-95 z-10"
            >
              กลับไปหน้าแรกเพื่อเริ่มต้นค้นหา
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
