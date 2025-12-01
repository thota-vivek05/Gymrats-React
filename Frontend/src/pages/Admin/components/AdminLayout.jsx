import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../../context/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* Common Header for all Admin Pages */}
        <header className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium">{user?.name || 'Admin'}</span>
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* This is where the child page (Dashboard, Users, etc.) will appear */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;