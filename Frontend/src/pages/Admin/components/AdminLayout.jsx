import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-black font-sans text-[#f1f1f1] overflow-x-hidden">
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Main Content — offset by sidebar width on desktop, clear hamburger on mobile */}
      <main className="flex-1 md:ml-64 min-h-screen overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;