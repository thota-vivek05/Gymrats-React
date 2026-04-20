import React, { useEffect, useState } from "react";

const getToneClasses = (tone) => {
  switch (tone) {
    case 'red': return "bg-red-500/5 border-red-500/50 text-red-500";
    case 'orange': return "bg-orange-500/5 border-orange-500/50 text-orange-500";
    case 'yellow': return "bg-yellow-500/5 border-yellow-500/50 text-yellow-500";
    case 'green': return "bg-green-500/5 border-green-500/50 text-green-500";
    case 'purple': return "bg-purple-500/5 border-purple-500/50 text-purple-500";
    case 'blue': return "bg-blue-500/5 border-blue-500/50 text-blue-500";
    default: return "bg-gray-500/5 border-gray-500/50 text-gray-500";
  }
};

const StatCard = ({ label, value }) => (
  <div className="bg-[#111] rounded-lg p-5 border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(138,43,226,0.4)]">
    <h3 className="text-[#cccccc] text-sm font-semibold uppercase tracking-wide mb-2">{label}</h3>
    <p className="text-[#8A2BE2] text-3xl font-bold">{value}</p>
  </div>
);

const AttentionCard = ({ label, value, color }) => {
  const toneClasses = getToneClasses(color);
  return (
    <div className={`rounded-lg p-4 border shadow-md flex justify-between items-center ${toneClasses}`}>
      <h3 className="text-sm font-semibold uppercase tracking-wide opacity-80">{label}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

const getDaysRemaining = (endDate) => {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const AdminMemberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState(null);
  const [users, setUsers] = useState([]);

  // Local Filters
  const [filterPlan, setFilterPlan] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [addFormData, setAddFormData] = useState({ userId: "", type: "Basic", startDate: "", endDate: "", price: "" });
  const [editFormData, setEditFormData] = useState({ type: "Basic", startDate: "", endDate: "", price: "", status: "Active" });

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/memberships", { headers: { "Authorization": `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) {
        setMemberships(data.memberships || []);
        setStats(data.stats);
      } else {
        setError(data.message || "Failed to load memberships.");
      }
    } catch (err) {
      setError("Network error fetching memberships.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users?limit=100", { headers: { "Authorization": `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) setUsers(data.users || []);
    } catch (err) { console.error("Error fetching users"); }
  };

  useEffect(() => {
    fetchMemberships();
    fetchUsers();
  }, []);

  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({...addFormData})
      });
      const data = await response.json();
      if (data.success) {
        setMemberships([data.membership, ...memberships]);
        setIsAddModalOpen(false);
        setAddFormData({ userId: "", type: "Basic", startDate: "", endDate: "", price: "" });
        fetchMemberships(); 
      } else { alert("Error: " + data.message); }
    } catch (err) { alert("Failed to add membership"); }
  };

  const handleEditClick = (m) => {
    setEditingMembership(m);
    setEditFormData({
      type: m.planType || "Basic",
      startDate: m.startDate ? new Date(m.startDate).toISOString().split('T')[0] : "",
      endDate: m.endDate ? new Date(m.endDate).toISOString().split('T')[0] : "",
      price: m.amount || "", status: m.status || "Active"
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/memberships/${editingMembership._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(editFormData)
      });
      const data = await response.json();
      if (data.success) {
        setMemberships(memberships.map(m => m._id === editingMembership._id ? data.membership : m));
        setIsEditModalOpen(false);
        setEditingMembership(null);
      } else { alert("Error: " + data.message); }
    } catch (err) { alert("Failed to update membership"); }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this membership?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/memberships/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMemberships(memberships.filter(m => m._id !== id));
      } else { alert("Failed to revoke membership"); }
    } catch (err) { alert("Failed to revoke membership"); }
  };

  // Local Filtering
  const displayedMemberships = memberships.filter(m => {
      if (filterPlan !== "All" && m.planType !== filterPlan) return false;
      if (filterStatus !== "All" && m.status !== filterStatus) return false;
      return true;
  });

  const clearExtraFilters = () => {
      setFilterPlan("All");
      setFilterStatus("All");
  };

  const hasFilters = filterPlan !== "All" || filterStatus !== "All";

  // Attention Center Computations
  const expiredCount = memberships.filter(m => getDaysRemaining(m.endDate) <= 0).length;
  const expiringSoonCount = memberships.filter(m => {
      const days = getDaysRemaining(m.endDate);
      return days > 0 && days <= 7;
  }).length;
  const platinumActive = memberships.filter(m => m.planType === "Platinum" && m.status === "Active").length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#f1f1f1] bg-black">
      <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
      <p>Loading Memberships...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 min-h-screen text-[#f1f1f1] bg-black">
      
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 flex justify-between items-center">
            <p><strong>Error:</strong> {error}</p>
            <button onClick={() => fetchMemberships()} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition-colors">Try Again</button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
        <div>
           <h1 className="m-0 text-2xl font-bold md:text-3xl text-[#f1f1f1]">Membership Administration</h1>
           <p className="mt-1 text-sm text-[#999]">Control subscription plans and track recurrences</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="w-full md:w-auto bg-[#8A2BE2] text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:bg-[#7020a0] hover:-translate-y-0.5">
          + Issue Membership Contract
        </button>
      </div>

      {/* Attention Center */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 border-b border-[#333] pb-2">Membership Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AttentionCard label="Expired Purgatory" value={expiredCount} color="red" />
            <AttentionCard label="Expiring this Week" value={expiringSoonCount} color="orange" />
            <AttentionCard label="Active Platinums" value={platinumActive} color="purple" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Accounts" value={stats?.activeMembers || 0} />
        <StatCard label="Computed MRR" value={`₹${stats?.monthlyRevenue || 0}`} />
        <StatCard label="30d Renewals" value={stats?.upcomingRenewals || 0} />
        <StatCard label="Global Contracts" value={memberships.length} />
      </div>

      {/* Smart Filters */}
      <div className="mb-6 bg-[#111] p-4 rounded-lg border border-[#333]">
        <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-400">Library Filters:</span>
            
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={filterPlan} onChange={e => setFilterPlan(e.target.value)}>
              <option value="All">All Tiers</option>
              <option value="Platinum">Platinum Plans</option>
              <option value="Gold">Gold Plans</option>
              <option value="Basic">Basic Plans</option>
            </select>

            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="All">Any Status</option>
              <option value="Active">Active Currently</option>
              <option value="Inactive">Inactive</option>
            </select>

            {hasFilters && (
                <button onClick={clearExtraFilters} className="text-sm text-[#2e8b57] hover:text-[#90ee90] font-semibold border border-[#2e8b57]/30 px-3 py-1.5 rounded bg-[#2e8b57]/10 transition-colors">
                    Clear Restrictions
                </button>
            )}
        </div>
      </div>

      {hasFilters && (
        <div className="flex gap-2 mb-4 items-center flex-wrap">
            <span className="text-sm text-gray-400">Active Viewing Bounds:</span>
            {filterPlan !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">Tier: {filterPlan}</span>}
            {filterStatus !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">State: {filterStatus}</span>}
        </div>
      )}

      {/* Memberships Table */}
      <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
        <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
          Active Contracts ({displayedMemberships.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm md:text-base">
            <thead>
              <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">User Details</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Plan Contract</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Timeline</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Status & Value</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Control Panel</th>
              </tr>
            </thead>
            <tbody>
              {displayedMemberships.length > 0 ? (
                displayedMemberships.map((m) => {
                  const daysLeft = getDaysRemaining(m.endDate);
                  return (
                    <tr key={m._id} className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10">
                      
                      <td className="p-3 align-top">
                        <div className="font-semibold text-lg text-[#f1f1f1]">{m.userName}</div>
                        <div className="text-xs text-gray-500 font-mono mt-1 font-semibold">{m._id.slice(-6)}</div>
                      </td>

                      <td className="p-3 align-top">
                         <span className={`inline-block px-2 text-[0.65rem] font-bold uppercase tracking-widest rounded-sm border ${
                              m.planType === "Platinum" ? "bg-purple-900/30 text-purple-400 border-purple-800" : 
                              m.planType === "Gold" ? "bg-yellow-900/30 text-yellow-400 border-yellow-800" : 
                              "bg-gray-800 text-gray-300 border-gray-600"
                            }`}>
                              {m.planType} Member
                         </span>
                      </td>

                      <td className="p-3 align-top">
                        <div className="text-[#cccccc] text-xs">
                          <span className="text-gray-500">Initiated:</span> {new Date(m.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-[#cccccc] text-xs mt-1">
                          <span className="text-gray-500">Expires:</span> {new Date(m.endDate).toLocaleDateString()}
                        </div>
                        <div className="mt-1.5 flex gap-2">
                             {daysLeft > 7 && daysLeft < 30 ? (
                                <span className="bg-green-900/40 text-green-400 text-[0.6rem] px-1.5 rounded">{daysLeft} days remaining</span>
                             ) : daysLeft > 0 && daysLeft <= 7 ? (
                                <span className="bg-orange-900/40 text-orange-400 text-[0.6rem] px-1.5 border border-orange-500/50 rounded animate-pulse">Critical: {daysLeft} days remaining</span>
                             ) : daysLeft <= 0 ? (
                                <span className="bg-red-900/40 text-red-500 text-[0.6rem] px-1.5 border border-red-500 rounded font-bold">EXPIRED ({Math.abs(daysLeft)}d ago)</span>
                             ) : (
                                <span className="text-blue-400 text-[0.6rem] font-medium">{daysLeft} days remaining</span>
                             )}
                        </div>
                      </td>

                      <td className="p-3 align-top">
                        <span className={`inline-block px-3 py-1 text-[0.6rem] font-bold uppercase tracking-widest rounded border ${
                            m.status === "Active" ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]/40" : "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]/40"
                          }`}>
                            {m.status}
                        </span>
                        <div className="mt-2 text-xl font-bold font-mono text-[#8A2BE2]">₹{m.amount}</div>
                      </td>

                      <td className="p-3 align-top">
                        <div className="flex flex-col gap-2 max-w-[120px]">
                          <button onClick={() => handleEditClick(m)} className="px-3 py-1.5 rounded text-[0.7rem] uppercase tracking-widest font-bold transition-all duration-300 bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 text-[#8A2BE2] hover:bg-[#8A2BE2]/40">
                            Edit Contract
                          </button>
                          <button onClick={() => handleRevoke(m._id)} className="px-3 py-1.5 rounded text-[0.7rem] uppercase tracking-widest font-bold transition-all duration-300 bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 text-[#ff6b6b] hover:bg-[#ff6b6b]/30">
                            Revoke
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-[#cccccc]">
                    No memberships matching the current filter stack.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Plan Modal - Undisturbed */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">Add New Membership</h2>
            <form onSubmit={handleAddPlan}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Select User*</label>
                <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.userId} onChange={(e) => setAddFormData({...addFormData, userId: e.target.value})} required>
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.full_name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Plan Type*</label>
                <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.type} onChange={(e) => setAddFormData({...addFormData, type: e.target.value})} required>
                  <option value="Basic">Basic - ₹299/month</option>
                  <option value="Gold">Gold - ₹599/month</option>
                  <option value="Platinum">Platinum - ₹999/month</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">Start Date*</label>
                  <input type="date" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.startDate} onChange={(e) => setAddFormData({...addFormData, startDate: e.target.value})} required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">End Date*</label>
                  <input type="date" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.endDate} onChange={(e) => setAddFormData({...addFormData, endDate: e.target.value})} required />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Price (₹)*</label>
                <input type="number" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.price} onChange={(e) => setAddFormData({...addFormData, price: e.target.value})} placeholder="e.g., 299" required />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]">Add Plan</button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Plan Modal - Undisturbed */}
      {isEditModalOpen && editingMembership && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">Edit Membership</h2>
            <form onSubmit={handleUpdatePlan}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">User</label>
                <input type="text" className="w-full bg-black border border-[#333] rounded p-3 text-white bg-opacity-50" value={editingMembership.userName || ''} disabled />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Plan Type*</label>
                <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.type} onChange={(e) => setEditFormData({...editFormData, type: e.target.value})} required>
                  <option value="Basic">Basic - ₹299/month</option>
                  <option value="Gold">Gold - ₹599/month</option>
                  <option value="Platinum">Platinum - ₹999/month</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">Start Date*</label>
                  <input type="date" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.startDate} onChange={(e) => setEditFormData({...editFormData, startDate: e.target.value})} required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">End Date*</label>
                  <input type="date" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.endDate} onChange={(e) => setEditFormData({...editFormData, endDate: e.target.value})} required />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Price (₹)*</label>
                <input type="number" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.price} onChange={(e) => setEditFormData({...editFormData, price: e.target.value})} required />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Status</label>
                <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.status} onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]">Update Plan</button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMemberships;