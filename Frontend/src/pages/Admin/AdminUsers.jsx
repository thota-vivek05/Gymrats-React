import React, { useEffect, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import UserDetailsModal from "./components/UserDetailsModal";


// Reusable StatCard Component
const StatCard = ({ label, value }) => {
  return (
    <div
      className="
      bg-[#111] 
      rounded-lg 
      p-5 
      border border-[#8A2BE2] 
      shadow-[0_4px_8px_rgba(138,43,226,0.3)] 
      transition-all duration-300 ease-in-out
      hover:-translate-y-1 
      hover:shadow-[0_8px_16px_rgba(138,43,226,0.4)]
    "
    >
      <h3 className="text-[#cccccc] text-sm font-semibold uppercase tracking-wide mb-2">
        {label}
      </h3>
      <p className="text-[#8A2BE2] text-3xl font-bold">{value}</p>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

 // Fetch Users (UPDATED)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = viewMode === 'dropped' 
        ? '/api/admin/users/dropped' 
        : `/api/admin/users?search=${encodeURIComponent(searchTerm)}`;

      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add Debounce Effect for Search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500); // Wait 500ms after typing stops
    return () => clearTimeout(timer);
  }, [searchTerm, viewMode]); // Re-run when search or mode changes

  useEffect(() => {
    fetchUsers();
  }, []);

  // NEW: Fetch Detailed User Data
  const handleViewDetails = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}/details`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setSelectedUser(userId);
        setUserDetails(data); 
        setIsModalOpen(true);
      } else {
        alert("Could not load user details.");
      }
    } catch (error) {
      console.error("Failed to load details", error);
    }
  };

  // Delete User Handler
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(users.filter((u) => u._id !== userId));
        alert("User deleted successfully");
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Shared container classes
  const containerClasses =
    "min-h-screen bg-black text-[#f1f1f1] font-sans flex flex-col";

  if (loading)
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-[#cccccc]">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading Users...</p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {/* Page Header */}
        <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
          <h1 className="m-0 text-2xl font-bold md:text-3xl text-[#f1f1f1]">
            User Management
          </h1>
          <button
            className="
            w-full md:w-auto
            bg-[#8A2BE2] 
            text-white 
            px-6 py-3 
            rounded 
            font-semibold 
            transition-all duration-300 
            hover:bg-[#7020a0] 
            hover:-translate-y-0.5
          "
          >
            + Add User
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 bg-[#111] p-4 rounded-lg border border-[#333]">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by Name, Email, or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={viewMode === 'dropped'} 
              className={`w-full bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2] ${viewMode === 'dropped' ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <span className="absolute right-3 top-3 text-gray-500">🔍</span>
          </div>
          
          <div className="flex gap-2">
             <button
              onClick={() => { setViewMode('all'); setSearchTerm(''); }}
              className={`px-4 py-2 rounded transition-colors font-medium ${
                viewMode === 'all' 
                ? 'bg-[#8A2BE2] text-white' 
                : 'bg-[#222] text-gray-400 hover:bg-[#333]'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => { setViewMode('dropped'); setSearchTerm(''); }}
              className={`px-4 py-2 rounded transition-colors font-medium ${
                viewMode === 'dropped' 
                ? 'bg-red-600 text-white' 
                : 'bg-[#222] text-gray-400 hover:bg-[#333]'
              }`}
            >
              Dropped Users
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Users" value={stats?.totalUsers || 0} />
          <StatCard label="Active Members" value={stats?.activeMembers || 0} />
          <StatCard label="Platinum Users" value={stats?.platinumUsers || 0} />
          <StatCard label="New Signups (7d)" value={stats?.newSignups || 0} />
        </div>

        {/* Users Table */}
        <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
          <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
            User List
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    User
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Email
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Status
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Membership
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Joined
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10"
                    >
                      <td className="p-3 text-[#f1f1f1]">{user.full_name}</td>
                      <td className="p-3 text-[#f1f1f1]">{user.email}</td>
                      <td className="p-3">
                        <span
                          className={`
                          inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border
                          ${
                            user.status === "Active"
                              ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]"
                              : "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]"
                          }
                        `}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`
                          inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border
                          ${
                            user.membershipType === "Platinum"
                              ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]"
                              : user.membershipType === "Gold"
                              ? "bg-[#ffc107]/20 text-[#ffc107] border-[#ffc107]"
                              : "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]"
                          }
                        `}
                        >
                          {user.membershipType}
                        </span>
                      </td>
                      <td className="p-3 text-[#f1f1f1]">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                          <button
                              onClick={() => handleViewDetails(user._id)}
                              className="
                              px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                              bg-[#2e8b57]/20 text-[#2e8b57] hover:bg-[#2e8b57]/30 border border-[#2e8b57]/50
                              "
                            >
                              View
                          </button>
                          <button
                            className="
                            px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                            bg-[#8A2BE2]/20 text-[#8A2BE2] hover:bg-[#8A2BE2]/30
                          "
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="
                              px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                              bg-[#ff6b6b]/20 text-[#ff6b6b] hover:bg-[#ff6b6b]/30
                            "
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-[#cccccc]">
                      <p>No users found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      {isModalOpen && userDetails && (
        <UserDetailsModal 
          user={selectedUser} 
          details={userDetails} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default AdminUsers;
