import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../../context/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-black font-sans text-[#f1f1f1]">
      {/* Sidebar Component */}
      <AdminSidebar />

      {/* Main Content Area 
          md:ml-64 creates space for the fixed sidebar on desktop screens 
      */}
      <main className="flex-1 w-full md:ml-64 p-6 md:p-8 overflow-y-auto">
        
        {/* Common Header */}
        <header className="
          flex flex-col md:flex-row justify-between items-start md:items-center 
          mb-8 pb-6 
          border-b border-[#8A2BE2]
          gap-4
        ">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#f1f1f1]">
              Admin Portal
            </h1>
            <p className="text-sm text-[#999] mt-1">
              Manage your fitness platform
            </p>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto">
            <div className="text-right hidden md:block">
              <span className="block text-sm font-semibold text-[#f1f1f1]">
                {user?.name || 'Admin User'}
              </span>
              <span className="block text-xs text-[#8A2BE2]">
                Administrator
              </span>
            </div>
            
            <div className="
              w-10 h-10 
              bg-[#8A2BE2] 
              rounded-full 
              flex items-center justify-center 
              text-white font-bold 
              shadow-[0_0_10px_rgba(138,43,226,0.5)]
              border border-[#8A2BE2]/50
              transition-transform hover:scale-105
            ">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Child Page Content */}
        <div className="animate-[fadeIn_0.3s_ease-in-out]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;