import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import GuidePage from "../pages/Guide";
import ContactPage from "../pages/Contact";
import Favorites from "../pages/favorites";
import Profile from "../pages/profile";
import History from "../pages/history";
import PlaceDetail from "../pages/PlaceDetail";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminPlaces from "../pages/admin/AdminPlaces";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminMessages from "../pages/admin/AdminMessages";
import AdminProfile from "../pages/admin/AdminProfile";

// ฟังก์ชันช่วยดึง Token จาก Cookie
const getTokenFromCookie = () => {
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
};

// 🔒 1. สำหรับหน้า Login/Register: ถ้ามี Token แล้ว ห้ามเข้าหน้า Login
const AuthRoute = ({ children }) => {
    const token = getTokenFromCookie();
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (token && user) {
        // ถ้าเป็น Admin ไป /admin, ถ้าเป็น User ไป /
        return <Navigate to={user.role === 'admin' ? "/admin" : "/"} replace />;
    }
    return children;
};

// 🔒 2. สำหรับหน้า Admin เท่านั้น
const ProtectedAdminRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = getTokenFromCookie();
    
    // 💡 แก้จุดนี้: ถ้าไม่มีสิทธิ์ ให้ดีดไป /login แทนการไปหน้าแรก เพื่อป้องกัน Loop
    if (!token || user?.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// 🔒 3. สำหรับหน้า User เท่านั้น (Admin ห้ามเข้า)
const ProtectedUserRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = getTokenFromCookie();

    // ถ้าเป็น Admin ห้ามเข้าหน้า User ให้ไปหน้า Dashboard ของตัวเอง
    if (token && user?.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }
    return children;
};

const router = createBrowserRouter([
    {
        path: "/", 
        element: <Layout />,
        children: [
            // หน้าบ้าน: Admin เข้าไม่ได้
            { index: true, element: <ProtectedUserRoute><Home /></ProtectedUserRoute> },
            { path: "guide", element: <ProtectedUserRoute><GuidePage /></ProtectedUserRoute> },
            { path: "contact", element: <ProtectedUserRoute><ContactPage /></ProtectedUserRoute> },
            { path: "favorites", element: <ProtectedUserRoute><Favorites /></ProtectedUserRoute> },
            { path: "history", element: <ProtectedUserRoute><History /></ProtectedUserRoute> },
            { path: "place/:id", element: <ProtectedUserRoute><PlaceDetail /></ProtectedUserRoute> },
            
            // หน้าที่เข้าได้ทั้งคู่ (หรือจัดการข้างในเอง)
            { path: "profile", element: <Profile /> }, 

            // หน้า Auth: Login แล้วห้ามเข้า
            { path: "login", element: <AuthRoute><Login /></AuthRoute> },
            { path: "register", element: <AuthRoute><Register /></AuthRoute> },
            
            // หน้าระบบ Admin: User ห้ามเข้า
            { 
                path: "admin", 
                element: <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute> 
            },
            { 
                path: "admin/places", 
                element: <ProtectedAdminRoute><AdminPlaces /></ProtectedAdminRoute> 
            },
            { 
                path: "admin/users", 
                element: <ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute> 
            },
            { 
                path: "admin/messages", 
                element: <ProtectedAdminRoute><AdminMessages /></ProtectedAdminRoute> 
            },
            { 
                path: "admin/profile", 
                element: <ProtectedAdminRoute><AdminProfile /></ProtectedAdminRoute> 
            }
        ]
    },
    { path: "*", element: <Navigate to="/" replace /> }
]);
    
export default function Routers() {
    return <RouterProvider router={router} />;
}