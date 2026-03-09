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
import AdminDashboard from "../pages/Admin";
import AdminPlaces from "../pages/admin/AdminPlaces";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminMessages from "../pages/admin/AdminMessages";

// คอมโพเนนต์สำหรับล็อกสิทธิ์แอดมิน
const ProtectedAdminRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    // ตรวจสอบว่ามียศเป็น admin จริงหรือไม่
    if (!token || !user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const router = createBrowserRouter([
    {
        path: "/", 
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
            { path: "guide", element: <GuidePage /> },
            { path: "contact", element: <ContactPage /> },
            { path: "favorites", element: <Favorites /> },
            { path: "profile", element: <Profile /> },
            { path: "history", element: <History /> },
            { path: "place/:id", element: <PlaceDetail /> },
            
            // หน้า Dashboard หลักของ Admin
            { 
                path: "admin", 
                element: (
                    <ProtectedAdminRoute>
                        <AdminDashboard />
                    </ProtectedAdminRoute>
                ) ,
            },
            // หน้าจัดการสถานที่สำหรับ Admin
            { 
                path: "admin/places", 
                element: (
                    <ProtectedAdminRoute>
                        <AdminPlaces />
                    </ProtectedAdminRoute>
                ) ,
            },
            // ✨ แก้ไข Path เป็น admin/users เพื่อให้เข้าหน้าจัดการสมาชิกได้
            { 
                path: "admin/users", 
                element: (
                    <ProtectedAdminRoute>
                        <AdminUsers />
                    </ProtectedAdminRoute>
                ) ,
            },
            { 
                path: "admin/messages", 
                element: (
                    <ProtectedAdminRoute>
                        <AdminMessages />
                    </ProtectedAdminRoute>
                ) ,
            }
        ]
    },
]);
    
export default function Routers() {
    return <RouterProvider router={router} />;
}