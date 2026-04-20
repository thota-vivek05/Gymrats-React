import React, { useEffect, useState } from "react";
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

// Reusable AttentionCard Component
const AttentionCard = ({ label, value, color }) => {
  return (
    <div className={`bg-[#111] rounded-lg p-4 border border-${color}-500/50 shadow-md flex justify-between items-center bg-${color}-500/5`}>
      <h3 className={`text-${color}-400 text-sm font-semibold uppercase tracking-wide`}>{label}</h3>
      <p className={`text-${color}-500 text-2xl font-bold`}>{value}</p>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // New Filters
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterMembership, setFilterMembership] = useState("All");
  const [filterTrainer, setFilterTrainer] = useState("All");
  const [filterAttention, setFilterAttention] = useState("All");

  const getHealthStatus = (user) => {
    const today = new Date();
    const endDate = user.membershipDuration?.end_date ? new Date(user.membershipDuration.end_date) : null;
    if (!endDate) return "No Plan";
    if (endDate < today || user.status === 'Inactive' || user.status === 'Suspended') return "Expired";
    const diffTime = endDate - today;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 14) return "Renew Soon";
    return "Healthy";
  };

  const getCompleteness = (user) => {
    const fields = ['full_name', 'email', 'phone', 'dob', 'gender', 'weight', 'height', 'goal', 'workout_type', 'bodyFat'];
    const filled = fields.filter(f => user[f] !== null && user[f] !== undefined && user[f] !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const getAttentionFlags = (user) => {
    const flags = [];
    if (!user.trainer && user.status === 'Active') flags.push("No Trainer");
    if (getCompleteness(user) < 100) flags.push("Incomplete Profile");
    
    const lastActiveDate = user.lastActive ? new Date(user.lastActive) : new Date(user.updatedAt || user.created_at);
    const daysInactive = Math.ceil(Math.abs(new Date() - lastActiveDate) / (1000 * 60 * 60 * 24));
    if (daysInactive >= 14 && user.status === 'Active') flags.push("Inactive 14d+");
    
    return flags;
  };

  const fetchUsers = async () => {
    try {
      let url = viewMode === 'dropped' 
        ? '/api/admin/users/dropped' 
        : '/api/admin/users';
      
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
        setFetchError(null);
      } else {
        setFetchError(data.message || "Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setFetchError("Network error. Please try again later.");
    }
  };

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      await fetchUsers();
      setLoading(false);
    };
    loadInitial();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, viewMode]);

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

  // Compute Filtered Users
  const displayedUsers = users.filter((u) => {
    if (filterStatus !== "All" && u.status !== filterStatus) return false;
    if (filterMembership !== "All" && u.membershipType !== filterMembership) return false;
    if (filterTrainer === "Assigned" && !u.trainer) return false;
    if (filterTrainer === "Not Assigned" && !!u.trainer) return false;
    if (filterAttention === "Needs Attention" && getAttentionFlags(u).length === 0) return false;
    return true;
  });

  const clearExtraFilters = () => {
    setFilterStatus("All");
    setFilterMembership("All");
    setFilterTrainer("All");
    setFilterAttention("All");
  };

  const hasExtraFilters = filterStatus !== "All" || filterMembership !== "All" || filterTrainer !== "All" || filterAttention !== "All";

  // Compute Stats
  let expiredCount = 0;
  let renewSoonCount = 0;
  let incompleteCount = 0;
  let noTrainerCount = 0;
  let inViewNeedsAttention = 0;

  users.forEach(u => {
    const health = getHealthStatus(u);
    if (health === "Expired") expiredCount++;
    if (health === "Renew Soon") renewSoonCount++;
    if (getCompleteness(u) < 100) incompleteCount++;
    if (!u.trainer && u.status === 'Active') noTrainerCount++;
  });

  displayedUsers.forEach(u => {
      if (getAttentionFlags(u).length > 0) inViewNeedsAttention++;
  });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#f1f1f1]">
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-[#cccccc]">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading Users...</p>
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-8 min-h-screen text-[#f1f1f1] bg-black">
      
      {fetchError && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 flex justify-between items-center">
            <p><strong>Error:</strong> {fetchError}</p>
            <button onClick={fetchUsers} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition-colors">Try Again</button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
        <h1 className="m-0 text-2xl font-bold md:text-3xl text-[#f1f1f1]">
          User Management
        </h1>
      </div>

      {/* Attention Center Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 border-b border-[#333] pb-2">Attention Center</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AttentionCard label="Expired Memberships" value={expiredCount} color="red" />
            <AttentionCard label="Renewing Soon (< 14d)" value={renewSoonCount} color="orange" />
            <AttentionCard label="Incomplete Profiles" value={incompleteCount} color="yellow" />
            <AttentionCard label="Without Trainer" value={noTrainerCount} color="blue" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 mb-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Visible Users" value={displayedUsers.length} />
        <StatCard label="Active In View" value={displayedUsers.filter(u => u.status === 'Active').length} />
        <StatCard label="Needs Attention" value={inViewNeedsAttention} />
        <StatCard label="Total DB Signups (7d)" value={stats?.newSignups || 0} />
      </div>

      {/* Search and Filters Array */}
      <div className="flex flex-col gap-4 mb-6 bg-[#111] p-4 rounded-lg border border-[#333]">
        <div className="flex flex-col md:flex-row justify-between gap-4">
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
            
            <div className="flex gap-2 shrink-0">
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

        {/* Extra Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#333] mt-2">
            <span className="text-sm font-semibold text-gray-400">Filters:</span>
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
            </select>
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={filterMembership} onChange={e => setFilterMembership(e.target.value)}>
                <option value="All">All Memberships</option>
                <option value="Basic">Basic</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
            </select>
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={filterTrainer} onChange={e => setFilterTrainer(e.target.value)}>
                <option value="All">Any Trainer Status</option>
                <option value="Assigned">Assigned</option>
                <option value="Not Assigned">Not Assigned</option>
            </select>
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={filterAttention} onChange={e => setFilterAttention(e.target.value)}>
                <option value="All">Attention: All</option>
                <option value="Needs Attention">Requires Attention Only</option>
            </select>

            {hasExtraFilters && (
                <button onClick={clearExtraFilters} className="text-sm text-[#8A2BE2] hover:text-[#a55fee] font-semibold border border-[#8A2BE2]/30 px-3 py-1.5 rounded bg-[#8A2BE2]/10 transition-colors">
                    Clear Filters
                </button>
            )}
        </div>
      </div>

      {hasExtraFilters && (
        <div className="flex gap-2 mb-4 items-center">
            <span className="text-sm text-gray-400">Active Filters:</span>
            {filterStatus !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">{filterStatus}</span>}
            {filterMembership !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">{filterMembership}</span>}
            {filterTrainer !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">{filterTrainer}</span>}
            {filterAttention !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">Needs Attention</span>}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
        <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
          User List ({displayedUsers.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm md:text-base">
            <thead>
              <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">User Info</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Membership & Health</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Trainer & Status</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Attention & Completeness</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.length > 0 ? (
                displayedUsers.map((user) => {
                  const health = getHealthStatus(user);
                  const completeness = getCompleteness(user);
                  const flags = getAttentionFlags(user);
                  const lastActiveMatch = user.lastActive ? new Date(user.lastActive) : new Date(user.updatedAt || user.created_at);
                  const lastActiveDays = Math.floor((new Date() - lastActiveMatch) / (1000 * 60 * 60 * 24));

                  return (
                    <tr
                      key={user._id}
                      className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10"
                    >
                      <td className="p-3">
                        <div className="font-semibold text-[#f1f1f1]">{user.full_name}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                        {user.workout_type && <div className="text-xs text-[#8A2BE2] font-medium mt-1">💪 {user.workout_type}</div>}
                      </td>
                      
                      <td className="p-3">
                        <div className="flex gap-2 flex-col items-start">
                            <span className={`inline-block px-2 text-xs font-semibold uppercase tracking-wide rounded border ${
                                user.membershipType === "Platinum" ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]" : 
                                user.membershipType === "Gold" ? "bg-[#ffc107]/20 text-[#ffc107] border-[#ffc107]" : 
                                "bg-[#333] text-gray-300 border-gray-500"
                            }`}>
                                {user.membershipType}
                            </span>
                            <span className={`inline-block px-2 py-0.5 text-[0.65rem] font-bold uppercase rounded-sm border ${
                                health === "Healthy" ? "bg-green-900/40 text-green-400 border-green-700" :
                                health === "Renew Soon" ? "bg-orange-900/40 text-orange-400 border-orange-700" :
                                health === "Expired" ? "bg-red-900/40 text-red-500 border-red-800 pb-0.5" :
                                "bg-gray-800 text-gray-400 border-gray-600"
                            }`}>
                                Health: {health}
                            </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col items-start gap-1">
                            <span className={`inline-block px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide rounded-full border ${
                                user.status === "Active" ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]" : "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]"
                            }`}>
                            {user.status}
                            </span>
                            <div className="text-xs mt-1">
                                <span className="text-gray-500">Trainer: </span>
                                <span className={user.trainer ? "text-gray-200" : "text-red-400 font-semibold"}>
                                    {user.trainer ? user.trainer.name : "None"}
                                </span>
                            </div>
                        </div>
                      </td>

                      <td className="p-3">
                          <div className="flex flex-col gap-1.5 items-start">
                              <div className="w-full max-w-[120px] bg-gray-800 rounded-full h-1.5 mb-1 mt-1">
                                  <div className={`h-1.5 rounded-full ${completeness >= 80 ? 'bg-green-500' : completeness >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${completeness}%` }}></div>
                              </div>
                              <span className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest">{completeness}% Complete</span>
                              {flags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                      {flags.map((flag, idx) => (
                                          <span key={idx} className="bg-red-900/30 text-red-400 border border-red-800 text-[0.6rem] px-1.5 py-0.5 rounded-sm whitespace-nowrap">⚠️ {flag}</span>
                                      ))}
                                  </div>
                              )}
                              <span className="text-[0.65rem] text-gray-500 mt-1">Active {lastActiveDays}d ago</span>
                          </div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                          <button
                              onClick={() => handleViewDetails(user._id)}
                              className="px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300 bg-[#2e8b57]/20 text-[#2e8b57] hover:bg-[#2e8b57]/30 border border-[#2e8b57]/50"
                            >
                              View
                          </button>
                          <button
                            onClick={() => handleEditClick(user)}
                            className="px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300 bg-[#8A2BE2]/20 text-[#8A2BE2] hover:bg-[#8A2BE2]/30"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300 bg-[#ff6b6b]/20 text-[#ff6b6b] hover:bg-[#ff6b6b]/30"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-[#cccccc]">
                    <p>No users found matching filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">Edit User</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Full Name</label>
                <input type="text" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.fullName} onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})} required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Email</label>
                <input type="email" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Phone</label>
                <input type="text" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Date of Birth</label>
                <input type="date" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.dob} onChange={(e) => setEditFormData({...editFormData, dob: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Gender</label>
                <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.gender} onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">Weight (kg)</label>
                  <input type="number" step="0.1" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.weight} onChange={(e) => setEditFormData({...editFormData, weight: e.target.value})} />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">Height (cm)</label>
                  <input type="number" step="0.1" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.height} onChange={(e) => setEditFormData({...editFormData, height: e.target.value})} />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Status</label>
                <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.status} onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Membership Type</label>
                <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.membershipType} onChange={(e) => setEditFormData({...editFormData, membershipType: e.target.value})}>
                  <option value="Basic">Basic</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]">Update User</button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]">Cancel</button>
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
