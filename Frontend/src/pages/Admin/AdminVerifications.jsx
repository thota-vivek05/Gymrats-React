import React, { useEffect, useState } from 'react';

const AdminVerifications = () => {
  const [stats, setStats] = useState({
    pendingCount: 0,
    completedCount: 0,
    rating: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [approvedTrainers, setApprovedTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      // NOTE: You need to create this API endpoint in your Backend
      // It should return the data structure expected by this component
      const response = await fetch('http://localhost:3000/api/admin/verifications/dashboard', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success || data.stats) { 
        // Adapting based on whether backend returns { success: true, data: ... } or just the data object
        const dashboardData = data.data || data; 
        setStats(dashboardData.stats || { pendingCount: 0, completedCount: 0, rating: 0 });
        setRecentApplications(dashboardData.recentApplications || []);
        setApprovedTrainers(dashboardData.recentApprovedTrainers || []);
      }
    } catch (error) {
      console.error("Error fetching verification data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle Approve/Reject Actions
  const handleAction = async (action, applicationId) => {
    if (!window.confirm(`Are you sure you want to ${action} this trainer?`)) return;

    try {
      const response = await fetch('http://localhost:3000/api/admin/verifications/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, applicationId }),
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Trainer ${action}d successfully`);
        fetchDashboardData(); // Refresh data
      } else {
        alert('Failed to process action');
      }
    } catch (error) {
      console.error(`Error processing ${action}:`, error);
      alert('Error processing action');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Verification Dashboard</h1>
        <p className="text-gray-500">Manage trainer verifications and reviews</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
            <i className="fas fa-clipboard-list text-xl"></i>
          </div>
          <div>
            <h3 className="text-gray-500 text-xs uppercase font-bold">Pending Requests</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.pendingCount}</p>
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <i className="fas fa-check-circle text-xl"></i>
          </div>
          <div>
            <h3 className="text-gray-500 text-xs uppercase font-bold">Completed</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.completedCount}</p>
          </div>
        </div>

        {/* Rating Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <i className="fas fa-star text-xl"></i>
          </div>
          <div>
            <h3 className="text-gray-500 text-xs uppercase font-bold">Average Rating</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.rating}/5</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Verification Requests Table (Takes up 2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Recent Verification Requests</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Trainer</th>
                  <th className="px-6 py-3">Specializations</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentApplications.length === 0 ? (
                  <tr>
                    <td colspan="5" className="px-6 py-8 text-center text-gray-500">
                      No pending requests found.
                    </td>
                  </tr>
                ) : (
                  recentApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-3">
                            {app.firstName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{app.firstName} {app.lastName}</div>
                            <div className="text-xs text-gray-500">{app.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {app.specializations ? app.specializations.slice(0, 2).join(', ') : 'N/A'}
                        {app.specializations && app.specializations.length > 2 && '...'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          app.status === 'Pending' ? 'bg-orange-100 text-orange-800' : 
                          app.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {app.status === 'Pending' || app.status === 'In Progress' ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleAction('approve', app._id)}
                              className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleAction('reject', app._id)}
                              className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button className="text-blue-600 text-xs hover:underline">View Details</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Approved Trainers List (Takes up 1/3 width) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-fit">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Recently Approved</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          
          <div className="divide-y divide-gray-100">
            {approvedTrainers.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No recently approved trainers.
              </div>
            ) : (
              approvedTrainers.map((trainer, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 flex items-start">
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                    {trainer.firstName?.charAt(0) || 'T'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {trainer.firstName} {trainer.lastName}
                      </h4>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {trainer.updatedAt ? new Date(trainer.updatedAt).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {trainer.specializations ? trainer.specializations.join(', ') : 'No specializations'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{trainer.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminVerifications;