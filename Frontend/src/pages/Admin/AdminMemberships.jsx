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

const AdminMemberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await fetch('/api/admin/memberships', { 
          credentials: 'include' 
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
    fetchMemberships();
  }, []);

  if (loading) return (
    <div className={styles.container}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading Memberships...</p>
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
          <h1>Membership Management</h1>
          <button className={styles.addButton}>+ Add Plan</button>
        </div>

        {/* Stats Row */}
        <div className={styles.statsGrid}>
          <StatCard label="Active Memberships" value={stats?.activeMembers || 0} color="blue" />
          <StatCard label="Revenue (Monthly)" value={`₹${stats?.monthlyRevenue || 0}`} color="green" />
          <StatCard label="Renewals (30d)" value={stats?.upcomingRenewals || 0} color="purple" />
          <StatCard label="Expiring Soon" value={stats?.expiringMemberships || 0} color="orange" />
        </div>

        {/* Memberships Table */}
        <div className={styles.tableContainer}>
          <h2>Membership Plans</h2>
          
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {memberships.length > 0 ? (
                  memberships.map(m => (
                    <tr key={m._id}>
                      <td>{m.userName}</td>
                      <td>{m.planType}</td>
                      <td>{new Date(m.startDate).toLocaleDateString()}</td>
                      <td>{new Date(m.endDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          m.status === 'Active' ? styles.statusActive : styles.statusInactive
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td>₹{m.amount}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button className={`${styles.actionButton} ${styles.editButton}`}>Edit</button>
                          <button className={`${styles.actionButton} ${styles.deleteButton}`}>Revoke</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className={styles.emptyState}>No memberships found.</td>
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

export default AdminMemberships;
