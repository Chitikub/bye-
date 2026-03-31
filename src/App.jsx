import { useEffect } from "react";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import Routers from "./Routers/Router";

function App() {
  useEffect(() => {
    // 1. เช็คว่ามีข้อมูลล็อกอินในเครื่องนี้หรือไม่
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      
      // 2. เชื่อมต่อ Socket ไปยัง Backend
      const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const socket = io(socketUrl);

      // 3. ส่ง User ID ไปลงทะเบียนกับ Backend ว่าเครื่องนี้ใช้งานอยู่
      const userId = user.id || user._id;
      socket.emit("register_user", userId);

      // 4. 🚨 รอรับคำสั่งเตะออก (สำหรับเครื่องที่โดนแย่งล็อกอิน)
      socket.on("force_logout", async (data) => {
        // เปลี่ยนเป็น Warning เพราะเครื่องนี้โดนเตะ
        await Swal.fire({
          icon: "warning",
          title: "ถูกออกจากระบบ!",
          text: data?.message || "บัญชีนี้ถูกเข้าสู่ระบบจากอุปกรณ์อื่น คุณจึงถูกออกจากระบบ",
          confirmButtonColor: "#FF7F67",
          allowOutsideClick: false, // บังคับให้ต้องกด OK
        });

        // ลบข้อมูลการเข้าสู่ระบบของ "เครื่องเก่าที่โดนเตะ"
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        Cookies.remove("token");

        // เด้งกลับไปหน้าเข้าสู่ระบบ
        window.location.href = "/login";
      });

      // คลีนอัพ Socket เวลาปิดหน้าเว็บ
      return () => {
        socket.disconnect();
      };
    }
  }, []);

  return (
    <div className="App">
       <Routers /> 
    </div>
  );
}

export default App;