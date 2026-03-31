import { useEffect } from "react";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import Routers from "./Routers/Router";

function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      
      // 🌟 เช็คว่า URL ถูกไหม (ต้องตรงกับ Port ที่ Backend รันอยู่ เช่น 5000 หรือ 8000)
      const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      console.log("🔗 กำลังเชื่อมต่อ Socket ไปที่:", socketUrl);
      
      const socket = io(socketUrl);

      // 🌟 เช็คว่าเชื่อมต่อสำเร็จไหม
      socket.on("connect", () => {
        console.log("✅ Socket เชื่อมต่อสำเร็จ! Socket ID ของเครื่องนี้คือ:", socket.id);
        const userId = user.id || user._id;
        socket.emit("register_user", userId);
      });

      // 🌟 เช็คว่ามี Error ตอนเชื่อมต่อไหม
      socket.on("connect_error", (err) => {
        console.error("❌ Socket เชื่อมต่อไม่สำเร็จ:", err.message);
      });

      // 🚨 รอรับคำสั่งเตะออก
      socket.on("force_logout", async (data) => {
        console.log("🔥 ได้รับคำสั่ง force_logout จาก Backend!"); // ถ้าอันนี้ไม่ขึ้นแปลว่า Backend ไม่ได้ส่งมา
        
        await Swal.fire({
          icon: "warning",
          title: "ถูกออกจากระบบ!",
          text: data?.message || "บัญชีนี้ถูกเข้าสู่ระบบจากอุปกรณ์อื่น คุณจึงถูกออกจากระบบ",
          confirmButtonColor: "#FF7F67",
          allowOutsideClick: false, 
        });

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        Cookies.remove("token");

        window.location.href = "/login";
      });

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