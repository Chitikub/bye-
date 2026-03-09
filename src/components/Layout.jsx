'use client';
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

function Layout() {
    const location = useLocation();

    // 🚫 ตรวจสอบว่าเส้นทางปัจจุบันขึ้นต้นด้วย /admin หรือไม่
    const isAdminPage = location.pathname.startsWith('/admin');

    return (
        <div className="flex flex-col min-h-screen">
            {/* แสดง Header เฉพาะเมื่อไม่ใช่หน้า Admin */}
            {!isAdminPage && <Header />}
            
            <main className={`flex-grow ${!isAdminPage ? 'container mx-auto p-4' : ''}`}>
                <Outlet />
            </main>
            
            {/* แสดง Footer เฉพาะเมื่อไม่ใช่หน้า Admin */}
            {!isAdminPage && <Footer />}
        </div>
    );
};

export default Layout;