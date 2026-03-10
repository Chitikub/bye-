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

// 🔒 1. สำหรับหน้า Login/Register: ถ้า Login แล้ว "ห้ามเข้า"
const AuthRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
        // ถ้าเป็น Admin ให้ไปหน้า Admin, ถ้าเป็น User ให้ไปหน้าแรก
        return <Navigate to={user.role === 'admin' ? "/admin" : "/"} replace />;
    }
    return children;
};

// 🔒 2. สำหรับหน้า Admin: User ทั่วไป "ห้ามเข้า"
const ProtectedAdminRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token || !user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return children;
};

// 🔒 3. สำหรับหน้าบ้าน: Admin "ห้ามเข้า" (ยกเว้น Profile และ Home)
const ProtectedUserRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (user?.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }
    return children;
};

const router = createBrowserRouter([
    {
        path: "/", 
        element: <Layout />,
        children: [
            // --- หน้าสาธารณะ ---
            { index: true, element: <Home /> },
            { path: "place/:id", element: <PlaceDetail /> },
            { path: "profile", element: <Profile /> }, // ทั้ง Admin และ User เข้าได้

            // --- หน้า Login/Register (ถ้า Login แล้วจะเข้าไม่ได้) ---
            { path: "login", element: <AuthRoute><Login /></AuthRoute> },
            { path: "register", element: <AuthRoute><Register /></AuthRoute> },

            // --- หน้าบ้านสำหรับ User (Admin ห้ามเข้า) ---
            { path: "guide", element: <ProtectedUserRoute><GuidePage /></ProtectedUserRoute> },
            { path: "contact", element: <ProtectedUserRoute><ContactPage /></ProtectedUserRoute> },
            { path: "favorites", element: <ProtectedUserRoute><Favorites /></ProtectedUserRoute> },
            { path: "history", element: <ProtectedUserRoute><History /></ProtectedUserRoute> },
            
            // --- หน้าระบบ Admin (User ห้ามเข้า) ---
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
            }
        ]
    },
]);
    
export default function Routers() {
    return <RouterProvider router={router} />;
}