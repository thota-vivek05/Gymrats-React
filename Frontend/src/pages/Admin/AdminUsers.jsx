import React, { useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import styles from './AdminPages.module.css';

const StatCard = ({ label, value, color }) => {
  return (
    <div className={styles.statCard}>
      <h3>{label}</h3>
      <p className={styles.statValue}>{value}</p>
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
      const response = await fetch('/api/admin/users', {
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
      const response = await fetch(`/api/admin/users/${userId}`, {
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
      </main>
    </div>
  );
};

export default AdminUsers;