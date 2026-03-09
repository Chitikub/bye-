import { Navigate } from "react-router-dom"; // เพิ่มการ Import Navigate
import Routers from "./Routers/Router";
import AdminDashboard from "./pages/Admin"; // 🔥 สำคัญ: ตรวจสอบ Path ให้ตรงกับที่คุณเซฟไฟล์ไว้

const ProtectedAdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  
  // ตรวจสอบยศจากข้อมูลในระบบ
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />; 
  }
  return children;
};

function App() {
  return (
    <div className="App">
       {/* ตรวจสอบว่าคอมโพเนนต์ Routers ของคุณรองรับการรับ Props แบบนี้หรือไม่ */}
       <Routers /> 
    </div>
  );
}

export default App;