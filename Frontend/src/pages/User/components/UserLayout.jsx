import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';

const UserLayout = () => {
    const location = useLocation();

    let currentPage = "dashboard";
    if (location.pathname.includes("user_exercises")) currentPage = "exercises";
    else if (location.pathname.includes("user_nutrition")) currentPage = "nutrition";
    else if (location.pathname.includes("userprofile")) currentPage = "profile";

    return (
        <div className="min-h-screen bg-black text-[#f1f1f1] font-sans flex flex-col overflow-x-hidden">
            {/* Shared header stays mounted across all child routes */}
            <DashboardHeader currentPage={currentPage} />

            {/* Only the page content swaps out */}
            <main className="flex-1 w-full overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;
