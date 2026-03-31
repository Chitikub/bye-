import { useEffect } from "react";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import Routers from "./Routers/Router";

function App() {
  useEffect(() => {
    // 1. เช็คว่าผู้ใช้ล็อกอินอยู่หรือไม่ (มี Token และข้อมูล User)
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      
      // 2. เชื่อมต่อ Socket ไปยัง Backend
      // (อย่าลืมตั้งค่า VITE_API_URL ในไฟล์ .env ของหน้าบ้านด้วยนะครับ เช่น http://localhost:5000)
      const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const socket = io(socketUrl);

      // 3. ส่ง User ID ไปบอก Backend ว่า "เครื่องนี้กำลังล็อกอินบัญชีนี้นะ"
      const userId = user.id || user._id;
      socket.emit("register_user", userId);

      // 4. 🚨 รอรับคำสั่ง "force_logout" จาก Backend เพื่อเตะออก
      socket.on("force_logout", async (data) => {
        // โชว์แจ้งเตือนสวยๆ ให้ผู้ใช้รู้ตัว
        await Swal.fire({
          icon: "warning",
          title: "ถูกออกจากระบบ!",
          text: data?.message || "บัญชีนี้ถูกเข้าสู่ระบบจากอุปกรณ์อื่น",
          confirmButtonColor: "#FF7F67",
          allowOutsideClick: false, // บังคับให้ต้องกดปุ่ม OK เท่านั้น
        });

        // ลบข้อมูลการเข้าสู่ระบบทิ้งให้หมด
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        Cookies.remove("token");

        // เด้งไปหน้าเข้าสู่ระบบ
        window.location.href = "/login";
      });

      // คลีนอัพ Socket เวลาผู้ใช้ปิดหน้าเว็บ
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