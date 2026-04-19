import React, { useEffect, useState } from "react";

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

const AdminMemberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState(null);
  const [users, setUsers] = useState([]);
  const [addFormData, setAddFormData] = useState({
    userId: "",
    type: "Basic",
    startDate: "",
    endDate: "",
    price: ""
  });
  const [editFormData, setEditFormData] = useState({
    type: "Basic",
    startDate: "",
    endDate: "",
    price: "",
    status: "Active"
  });

  // Fetch memberships
  const fetchMemberships = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/memberships", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMemberships(data.memberships);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching memberships:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users?limit=100", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchMemberships();
    fetchUsers();
  }, []);

  // Handle Add Plan
  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: addFormData.userId,
          type: addFormData.type,
          startDate: addFormData.startDate,
          endDate: addFormData.endDate,
          price: addFormData.price
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setMemberships([data.membership, ...memberships]);
        setIsAddModalOpen(false);
        setAddFormData({
          userId: "", type: "Basic", startDate: "", endDate: "", price: ""
        });
        alert("Membership added successfully!");
        fetchMemberships(); // Refresh the list
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to add membership");
    }
  };

  // Handle Edit Click
  const handleEditClick = (membership) => {
    setEditingMembership(membership);
    setEditFormData({
      type: membership.planType || "Basic",
      startDate: membership.startDate ? new Date(membership.startDate).toISOString().split('T')[0] : "",
      endDate: membership.endDate ? new Date(membership.endDate).toISOString().split('T')[0] : "",
      price: membership.amount || "",
      status: membership.status || "Active"
    });
    setIsEditModalOpen(true);
  };

  // Handle Update Plan
  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/memberships/${editingMembership._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      
      const data = await response.json();
      if (data.success) {
        setMemberships(memberships.map(m => m._id === editingMembership._id ? data.membership : m));
        setIsEditModalOpen(false);
        setEditingMembership(null);
        alert("Membership updated successfully!");
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to update membership");
    }
  };

  // Handle Revoke (Delete)
  const handleRevoke = async (id) => {
    if (!confirm("Are you sure you want to revoke this membership?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/memberships/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMemberships(memberships.filter(m => m._id !== id));
        alert("Membership revoked successfully!");
      } else {
        alert("Failed to revoke membership");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to revoke membership");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#f1f1f1]">
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-[#cccccc]">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading Memberships...</p>
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-8 min-h-screen">
        {/* Page Header */}
        <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
          <h1 className="m-0 text-2xl font-bold md:text-3xl text-[#f1f1f1]">
            Membership Management
          </h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
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
            + Add Plan
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active Memberships"
            value={stats?.activeMembers || 0}
          />
          <StatCard
            label="Revenue (Monthly)"
            value={`₹${stats?.monthlyRevenue || 0}`}
          />
          <StatCard
            label="Renewals (30d)"
            value={stats?.upcomingRenewals || 0}
          />
          <StatCard
            label="Expiring Soon"
            value={stats?.expiringMemberships || 0}
          />
        </div>

        {/* Memberships Table */}
        <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
          <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
            Membership Plans
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    User
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Plan
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Start Date
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    End Date
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Status
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Amount
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {memberships.length > 0 ? (
                  memberships.map((m) => (
                    <tr
                      key={m._id}
                      className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10"
                    >
                      <td className="p-3 text-[#f1f1f1]">{m.userName}</td>
                      <td className="p-3 text-[#f1f1f1]">{m.planType}</td>
                      <td className="p-3 text-[#f1f1f1]">
                        {new Date(m.startDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-[#f1f1f1]">
                        {new Date(m.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`
                          inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border
                          ${
                            m.status === "Active"
                              ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]"
                              : "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]"
                          }
                        `}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-[#f1f1f1]">₹{m.amount}</td>
                      <td className="p-3">
                        <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                          <button
                            onClick={() => handleEditClick(m)}
                            className="
                            px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                            bg-[#8A2BE2]/20 text-[#8A2BE2] hover:bg-[#8A2BE2]/30
                          "
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRevoke(m._id)}
                            className="
                            px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                            bg-[#ff6b6b]/20 text-[#ff6b6b] hover:bg-[#ff6b6b]/30
                          "
                          >
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-[#cccccc]">
                      No memberships found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>

      {/* Add Plan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">Add New Membership</h2>
            <form onSubmit={handleAddPlan}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Select User*</label>
                <select
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={addFormData.userId}
                  onChange={(e) => setAddFormData({...addFormData, userId: e.target.value})}
                  required
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Plan Type*</label>
                <select
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={addFormData.type}
                  onChange={(e) => setAddFormData({...addFormData, type: e.target.value})}
                  required
                >
                  <option value="Basic">Basic - ₹299/month</option>
                  <option value="Gold">Gold - ₹599/month</option>
                  <option value="Platinum">Platinum - ₹999/month</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">Start Date*</label>
                  <input
                    type="date"
                    className="w-full bg-black border border-[#333] rounded p-3 text-white"
                    value={addFormData.startDate}
                    onChange={(e) => setAddFormData({...addFormData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">End Date*</label>
                  <input
                    type="date"
                    className="w-full bg-black border border-[#333] rounded p-3 text-white"
                    value={addFormData.endDate}
                    onChange={(e) => setAddFormData({...addFormData, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Price (₹)*</label>
                <input
                  type="number"
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={addFormData.price}
                  onChange={(e) => setAddFormData({...addFormData, price: e.target.value})}
                  placeholder="e.g., 299"
                  required
                />
              </div>
              
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]">
                  Add Plan
                </button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {isEditModalOpen && editingMembership && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">Edit Membership</h2>
            <form onSubmit={handleUpdatePlan}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">User</label>
                <input
                  type="text"
                  className="w-full bg-black border border-[#333] rounded p-3 text-white bg-opacity-50"
                  value={editingMembership.userName || ''}
                  disabled
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Plan Type*</label>
                <select
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={editFormData.type}
                  onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                  required
                >
                  <option value="Basic">Basic - ₹299/month</option>
                  <option value="Gold">Gold - ₹599/month</option>
                  <option value="Platinum">Platinum - ₹999/month</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">Start Date*</label>
                  <input
                    type="date"
                    className="w-full bg-black border border-[#333] rounded p-3 text-white"
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData({...editFormData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">End Date*</label>
                  <input
                    type="date"
                    className="w-full bg-black border border-[#333] rounded p-3 text-white"
                    value={editFormData.endDate}
                    onChange={(e) => setEditFormData({...editFormData, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Price (₹)*</label>
                <input
                  type="number"
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                  required
                />
              </div>
              
              <div className="mb-6">
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
              
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]">
                  Update Plan
                </button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMemberships;