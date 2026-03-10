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

// ฟังก์ชันช่วยดึง Token จาก Cookie (เพราะคุณเก็บใน Cookie)
const getTokenFromCookie = () => {
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
};

// 🔒 1. สำหรับหน้า Login/Register: ถ้า Login แล้ว ห้ามเข้า
const AuthRoute = ({ children }) => {
    const token = getTokenFromCookie(); // ดึงจาก cookie แทน
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (token && user) {
        return <Navigate to={user.role === 'admin' ? "/admin" : "/"} replace />;
    }
    return children;
};

// 🔒 2. สำหรับหน้า Admin เท่านั้น: User ห้ามเข้า
const ProtectedAdminRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = getTokenFromCookie(); // ดึงจาก cookie แทน
    
    if (!token || !user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return children;
};

// 🔒 3. สำหรับหน้า User เท่านั้น: Admin ห้ามเข้า
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
            { index: true, element: <ProtectedUserRoute><Home /></ProtectedUserRoute> },
            { path: "guide", element: <ProtectedUserRoute><GuidePage /></ProtectedUserRoute> },
            { path: "contact", element: <ProtectedUserRoute><ContactPage /></ProtectedUserRoute> },
            { path: "favorites", element: <ProtectedUserRoute><Favorites /></ProtectedUserRoute> },
            { path: "history", element: <ProtectedUserRoute><History /></ProtectedUserRoute> },
            { path: "place/:id", element: <ProtectedUserRoute><PlaceDetail /></ProtectedUserRoute> },
            { path: "profile", element: <Profile /> }, 
            { path: "login", element: <AuthRoute><Login /></AuthRoute> },
            { path: "register", element: <AuthRoute><Register /></AuthRoute> },
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