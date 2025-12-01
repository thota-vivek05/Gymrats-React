import React, { useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './AdminPages.module.css';

// Simple card component for stats
const StatCard = ({ label, value, change, color = "blue" }) => (
  <div className={styles.statCard}>
    <h3>{label}</h3>
    <div className={styles.statValue}>{value}</div>
    {change && (
      <div className={change.includes('+') ? styles.statChange : `${styles.statChange} ${styles.negative}`}>
        {change}
      </div>
    )}
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard', {
          method: 'GET',
          credentials: 'include', // Important for session auth
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized - redirect to admin login
            navigate('/admin/login');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setData(result);
          setError(null);
        } else {
          setError(result.message || 'Failed to load dashboard data');
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error);
        setError('Failed to fetch dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className={styles.container}>
        <AdminSidebar />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.container}>
        <AdminSidebar />
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className={styles.container}>
        <AdminSidebar />
        <div className={styles.loading}>
          <p>No data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <AdminSidebar />
      
      <main className={styles.mainContent}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1>Dashboard Overview</h1>
          <p style={{color: '#999', fontSize: '0.9rem'}}>Welcome to the Admin Panel</p>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <StatCard 
            label="Total Users" 
            value={data.stats.totalUsers}
          />
          <StatCard 
            label="Active Members" 
            value={data.stats.activeMembers}
          />
          <StatCard 
            label="Total Revenue" 
            value={`₹${data.stats.totalRevenue}`}
          />
          <StatCard 
            label="New Signups" 
            value={data.stats.newSignups}
          />
          <StatCard 
            label="Personal Trainers" 
            value={data.stats.personalTrainers}
          />
          <StatCard 
            label="Content Verifiers" 
            value={data.stats.contentVerifiers}
          />
        </div>

        {/* Recent Users Table */}
        <div className={styles.tableContainer}>
          <h2>Recent Users</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Plan Type</th>
                </tr>
              </thead>
              <tbody>
                {data.users && data.users.length > 0 ? (
                  data.users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.full_name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          u.status === 'Active' ? styles.statusApproved :
                          u.status === 'Inactive' ? styles.statusRejected :
                          styles.statusPending
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td>{u.membershipType}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.emptyState}>No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Trainers Table */}
        <div className={styles.tableContainer}>
          <h2>Recent Trainers</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Experience</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.trainers && data.trainers.length > 0 ? (
                  data.trainers.map((t) => (
                    <tr key={t.name}>
                      <td>{t.name}</td>
                      <td>{t.email}</td>
                      <td>{t.experience}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          t.status === 'Active' ? styles.statusApproved :
                          styles.statusPending
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.emptyState}>No trainers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Verifiers Table */}
        <div className={styles.tableContainer}>
          <h2>Recent Verifiers</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.verifiers && data.verifiers.length > 0 ? (
                  data.verifiers.map((v) => (
                    <tr key={v.name}>
                      <td>{v.name}</td>
                      <td>{v.email || 'N/A'}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className={styles.emptyState}>No verifiers found</td>
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

export default AdminDashboard;