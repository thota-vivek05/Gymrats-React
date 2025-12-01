import React, { useEffect, useState } from 'react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/users', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete User Handler
  const handleDelete = async (userId) => {
    if(!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        // Remove from UI immediately
        setUsers(users.filter(u => u._id !== userId));
        alert("User deleted successfully");
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (loading) return <div>Loading Users...</div>;

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: stats?.totalUsers, color: 'blue' },
          { label: 'Active Members', value: stats?.activeMembers, color: 'green' },
          { label: 'Platinum Users', value: stats?.platinumUsers, color: 'purple' },
          { label: 'New Signups (7d)', value: stats?.newSignups, color: 'orange' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-xs uppercase font-bold">{stat.label}</h3>
            <p className={`text-2xl font-bold mt-1 text-${stat.color}-600`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-bold text-gray-800">User List</h2>
          <button className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">
            + Add New User
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Membership</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.full_name}</td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded border text-xs ${
                      user.membershipType === 'Platinum' ? 'bg-slate-800 text-white border-slate-800' : 
                      user.membershipType === 'Gold' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {user.membershipType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800">Edit</button>
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-8 text-center text-gray-500">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;