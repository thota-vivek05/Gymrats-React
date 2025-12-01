import React, { useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

// Simple card component for stats
const StatCard = ({ title, value, change, color = "blue" }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
    <div className="mt-2 flex items-baseline">
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
    </div>
    <div className="mt-2">
      <span className={`text-sm ${change.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
        {change}
      </span>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/dashboard', {
          credentials: 'include' // Important for session auth
        });
        const result = await response.json();
        
        if (result.success) {
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-100">Loading Dashboard...</div>;
  if (!data) return <div className="flex h-screen items-center justify-center">Error loading data.</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Welcome, {user?.name || 'Admin'}</span>
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={data.stats.totalUsers} change={data.stats.totalUsersChange} />
          <StatCard title="Active Members" value={data.stats.activeMembers} change={data.stats.activeChange} />
          <StatCard title="Total Revenue" value={`₹${data.stats.totalRevenue}`} change={data.stats.monthlyChange} />
          <StatCard title="New Signups" value={data.stats.newSignups} change={data.stats.newSignupsChange} />
        </div>

        {/* Recent Activity Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.users.map((u, i) => (
                    <tr key={i} className="text-sm">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.full_name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${u.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.membershipType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Trainers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">New Trainers</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Exp</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.trainers.map((t, i) => (
                    <tr key={i} className="text-sm">
                      <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                      <td className="px-4 py-3 text-gray-600">{t.experience}y</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;