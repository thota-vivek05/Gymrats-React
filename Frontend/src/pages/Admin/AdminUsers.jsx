<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import styles from './AdminPages.module.css';

const StatCard = ({ label, value, color }) => {
  return (
    <div className={styles.statCard}>
      <h3>{label}</h3>
      <p className={styles.statValue}>{value}</p>
=======
import React, { useEffect, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";

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
>>>>>>> rahul-final
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Users
  const fetchUsers = async () => {
    try {
<<<<<<< HEAD
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
=======
      const response = await fetch("/api/admin/users", {
        credentials: "include",
>>>>>>> rahul-final
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
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
<<<<<<< HEAD
        method: 'DELETE',
        credentials: 'include'
=======
        method: "DELETE",
        credentials: "include",
>>>>>>> rahul-final
      });
      const data = await response.json();
      if (data.success) {
        // Remove from UI immediately
        setUsers(users.filter((u) => u._id !== userId));
        alert("User deleted successfully");
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

<<<<<<< HEAD
  if (loading) return (
    <div className={styles.container}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading Users...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <AdminSidebar />
      
      <main className={styles.mainContent}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1>User Management</h1>
          <button className={styles.addButton}>+ Add User</button>
        </div>

        {/* Stats Row */}
        <div className={styles.statsGrid}>
          <StatCard label="Total Users" value={stats?.totalUsers || 0} color="blue" />
          <StatCard label="Active Members" value={stats?.activeMembers || 0} color="green" />
          <StatCard label="Platinum Users" value={stats?.platinumUsers || 0} color="purple" />
          <StatCard label="New Signups (7d)" value={stats?.newSignups || 0} color="orange" />
        </div>

        {/* Users Table */}
        <div className={styles.tableContainer}>
          <h2>User List</h2>
          
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Membership</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.full_name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${user.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          user.membershipType === 'Platinum' ? styles.statusApproved : 
                          user.membershipType === 'Gold' ? styles.statusPending : 
                          styles.statusInactive
                        }`}>
                          {user.membershipType}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button className={`${styles.actionButton} ${styles.editButton}`}>Edit</button>
                          <button 
                            onClick={() => handleDelete(user._id)}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className={styles.emptyState}>
                      <p>No users found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
=======
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
>>>>>>> rahul-final
      </main>
    </div>
  );
};

export default AdminUsers;
