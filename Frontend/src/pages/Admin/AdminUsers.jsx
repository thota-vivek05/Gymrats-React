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

  // Add this with other useState declarations
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "Active",
    membershipType: "Basic",
    weight: "",
    height: "",
    gender: "",
    dob: ""
  });

 // Fetch Users (UPDATED)
// Fetch Users - Updated to pass search term for all views
const fetchUsers = async () => {
  try {
    // Don't set loading here to prevent focus loss
    let url = viewMode === 'dropped' 
      ? '/api/admin/users/dropped' 
      : '/api/admin/users';
    
    // Add search parameter if there's a search term
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.append('search', searchTerm);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

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
  }
};


// Initial load effect - only runs once
useEffect(() => {
  const loadInitial = async () => {
    setLoading(true);
    await fetchUsers();
    setLoading(false);
  };
  loadInitial();
}, []);

// Debounced search effect
useEffect(() => {
  const timer = setTimeout(() => {
    fetchUsers();
  }, 500);
  return () => clearTimeout(timer);
}, [searchTerm, viewMode]);

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

  const handleEditClick = (user) => {
  setEditingUser(user);
  setEditFormData({
    fullName: user.full_name || "",
    email: user.email || "",
    phone: user.phone || "",
    status: user.status || "Active",
    membershipType: user.membershipType || "Basic",
    weight: user.weight || "",
    height: user.height || "",
    gender: user.gender || "",
    dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : ""
  });
  setIsEditModalOpen(true);
};

const handleUpdateUser = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/admin/users/${editingUser._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(editFormData)
    });
    const data = await response.json();
    if (data.success) {
      setUsers(users.map(u => u._id === editingUser._id ? data.user : u));
      setIsEditModalOpen(false);
      setEditingUser(null);
      alert("User updated successfully!");
    } else {
      alert("Error: " + data.message);
    }
  } catch (err) {
    console.error("Error updating user:", err);
    alert("Failed to update user");
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
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 bg-[#111] p-4 rounded-lg border border-[#333]">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by Name, Email, or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
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
                        onClick={() => handleEditClick(user)}
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
      {/* Edit User Modal */}
{isEditModalOpen && editingUser && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">Edit User</h2>
      <form onSubmit={handleUpdateUser}>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Full Name</label>
          <input
            type="text"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={editFormData.fullName}
            onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Email</label>
          <input
            type="email"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={editFormData.email}
            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Phone</label>
          <input
            type="text"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={editFormData.phone}
            onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Date of Birth</label>
          <input
            type="date"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={editFormData.dob}
            onChange={(e) => setEditFormData({...editFormData, dob: e.target.value})}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Gender</label>
          <select
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={editFormData.gender}
            onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={editFormData.weight}
              onChange={(e) => setEditFormData({...editFormData, weight: e.target.value})}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Height (cm)</label>
            <input
              type="number"
              step="0.1"
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={editFormData.height}
              onChange={(e) => setEditFormData({...editFormData, height: e.target.value})}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Status</label>
          <select
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={editFormData.status}
            onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Membership Type</label>
          <select
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={editFormData.membershipType}
            onChange={(e) => setEditFormData({...editFormData, membershipType: e.target.value})}
          >
            <option value="Basic">Basic</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>
        </div>
        <div className="flex gap-4">
          <button type="submit" className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]">
            Update User
          </button>
          <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
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
