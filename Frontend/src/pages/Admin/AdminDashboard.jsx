import React, { useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';

// Simple card component for stats
const StatCard = ({ title, value, change, color = "blue" }) => (
  <div className={styles.statCard}>
    <h3>{title}</h3>
    <div className={styles.statValue}>{value}</div>
    <div className={change.includes('+') ? styles.statChange : `${styles.statChange} ${styles.negative}`}>
      {change}
    </div>
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
        {/* Welcome Message */}
        <div className={styles.welcomeMessage}>
          <div className={styles.welcomeText}>
            <h2>Dashboard Overview</h2>
            <p>Welcome to the Admin Panel</p>
          </div>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className={styles.userName}>
              <p>{user?.name || 'Admin'}</p>
              <small style={{ color: '#999' }}>Administrator</small>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <StatCard 
            title="Total Users" 
            value={data.stats.totalUsers} 
            change={data.stats.totalUsersChange} 
          />
          <StatCard 
            title="Active Members" 
            value={data.stats.activeMembers} 
            change={data.stats.activeChange} 
          />
          <StatCard 
            title="Total Revenue" 
            value={`₹${data.stats.totalRevenue}`} 
            change={data.stats.monthlyChange} 
          />
          <StatCard 
            title="New Signups" 
            value={data.stats.newSignups} 
            change={data.stats.newSignupsChange} 
          />
        </div>

        {/* Tables Container */}
        <div className={styles.tablesContainer}>
          
          {/* Recent Users */}
          <div className={styles.tableSection}>
            <h2>Recent Users</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Plan</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u, i) => (
                  <tr key={i}>
                    <td>{u.full_name}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${u.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>{u.membershipType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Trainers */}
          <div className={styles.tableSection}>
            <h2>New Trainers</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Experience</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.trainers.map((t, i) => (
                  <tr key={i}>
                    <td>{t.name}</td>
                    <td>{t.experience}y</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;