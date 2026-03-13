import { Navigate } from "react-router-dom"; // เพิ่มการ Import Navigate
import Routers from "./Routers/Router";
import AdminDashboard from "./pages/Admin"; // 🔥 สำคัญ: ตรวจสอบ Path ให้ตรงกับที่คุณเซฟไฟล์ไว้

function App() {
  return (
    <div className="App">
       <Routers /> 
    </div>
  );
}

export default App;