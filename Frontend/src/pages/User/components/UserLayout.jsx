import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import { useAuth } from '../../../context/AuthContext';

const UserLayout = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Determine current page for header highlighting
    let currentPage = "dashboard";
    if (location.pathname.includes("user_exercises")) currentPage = "exercises";
    else if (location.pathname.includes("user_nutrition")) currentPage = "nutrition";
    else if (location.pathname.includes("userprofile")) currentPage = "profile";

    return (
        <div className="min-h-screen bg-black text-[#f1f1f1] font-sans flex flex-col overflow-x-hidden">
            {/* The Header is preserved across all child routes */}
            <DashboardHeader user={user} currentPage={currentPage} />
            
            {/* The active child page is rendered directly here */}
            <main className="flex-1 w-full overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;
