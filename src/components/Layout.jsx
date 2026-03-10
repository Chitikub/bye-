'use client';
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import AdminSidebar from "./AdminSidebar"; // ✨ Import Sidebar มาใช้

function Layout() {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');

    return (
        <div className="flex flex-col min-h-screen">
            {/* 1. แสดง Header เฉพาะหน้าบ้านปกติ */}
            {!isAdminPage && <Header />}
            
            <div className={isAdminPage ? "flex flex-1" : "flex flex-col flex-grow"}>
                {/* 2. แสดง Sidebar เฉพาะหน้าแอดมิน (อยู่ซ้ายมือ) */}
                {isAdminPage && <AdminSidebar />}

                {/* 3. ส่วนเนื้อหาหลัก */}
                <main className={`flex-grow ${!isAdminPage ? 'container mx-auto p-4' : 'w-full bg-[#FDF8F1]'}`}>
                    <Outlet />
                </main>
            </div>
            
            {/* 4. แสดง Footer เฉพาะหน้าบ้านปกติ */}
            {!isAdminPage && <Footer />}
        </div>
    );
};

export default Layout;